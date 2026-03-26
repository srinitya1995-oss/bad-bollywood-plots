import 'dotenv/config';

const BASE = 'https://us.i.posthog.com/api';

export async function fetchEvents(eventName, limit = 1000) {
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!projectId || !apiKey) throw new Error('Set POSTHOG_PROJECT_ID and POSTHOG_API_KEY in .env');

  let all = [];
  let url = `${BASE}/projects/${projectId}/events/?event=${eventName}&limit=100`;

  while (url && all.length < limit) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`PostHog API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    all = all.concat(data.results || []);
    url = data.next || null;
  }
  return all;
}

export async function fetchAllEvents(limit = 2000) {
  const eventTypes = [
    'app_load', 'game_start', 'game_end', 'card_result',
    'card_view', 'card_flip', 'feedback_submitted',
    'suggestion_submitted', 'replay', 'share',
    'mode_selected', 'diff_selected',
  ];

  const results = {};
  for (const event of eventTypes) {
    try {
      results[event] = await fetchEvents(event, limit);
    } catch (e) {
      results[event] = [];
      console.warn(`Failed to fetch ${event}: ${e.message}`);
    }
  }
  return results;
}
