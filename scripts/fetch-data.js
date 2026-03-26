#!/usr/bin/env node
/**
 * Fetches all SeedhaPlot events from PostHog and saves as a JSON file
 * that the admin dashboard can import.
 *
 * Usage: node scripts/fetch-data.js
 * Output: data-export.json (in project root)
 */
import 'dotenv/config';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, '../data-export.json');

const BASE = 'https://us.i.posthog.com/api';
const API_KEY = process.env.POSTHOG_API_KEY;
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

if (!API_KEY || !PROJECT_ID) {
  console.error('Set POSTHOG_API_KEY and POSTHOG_PROJECT_ID in .env');
  process.exit(1);
}

async function fetchEvents(eventName, limit = 2000) {
  let all = [];
  let url = `${BASE}/projects/${PROJECT_ID}/events/?event=${eventName}&limit=100`;
  while (url && all.length < limit) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) {
      console.warn(`  ${eventName}: API returned ${res.status}`);
      break;
    }
    const data = await res.json();
    all = all.concat(data.results || []);
    url = data.next || null;
    process.stdout.write(`  ${eventName}: ${all.length} events\r`);
  }
  console.log(`  ${eventName}: ${all.length} events`);
  return all;
}

async function main() {
  console.log('Fetching SeedhaPlot data from PostHog...\n');

  const eventTypes = [
    'app_load', 'game_start', 'game_end', 'card_result',
    'card_view', 'card_flip', 'feedback_submitted',
    'suggestion_submitted', 'replay', 'share',
    'mode_selected', 'diff_selected',
  ];

  const events = {};
  for (const ev of eventTypes) {
    events[ev] = await fetchEvents(ev);
  }

  // Extract feedback and suggestions from events
  const feedback = (events['feedback_submitted'] || []).map(e => ({
    card_id: e.properties?.card || null,
    card_name: e.properties?.cardName || e.properties?.name || null,
    tags: e.properties?.tags || [],
    text: e.properties?.text || e.properties?.hasText || null,
    type: e.properties?.type || 'card',
    session_id: e.properties?.session,
    ts: e.timestamp,
  }));

  const suggestions = (events['suggestion_submitted'] || []).map(e => ({
    movie: e.properties?.movie || '',
    industry: e.properties?.industry || '',
    session_id: e.properties?.session,
    ts: e.timestamp,
  }));

  const totalEvents = Object.values(events).reduce((s, a) => s + a.length, 0);

  const output = { events, feedback, suggestions, exportedAt: new Date().toISOString() };
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\nDone! ${totalEvents} total events exported to data-export.json`);
  console.log('Open admin.html → "Import JSON" → select data-export.json');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
