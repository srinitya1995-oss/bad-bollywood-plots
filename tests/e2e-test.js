#!/usr/bin/env node
/**
 * Seedha Plot, End-to-End Test Suite
 * Tests: live site, Supabase integration, app.js code integrity, PostHog event names
 *
 * Run:  node tests/e2e-test.js
 */

const SUPABASE_URL = 'https://wmfxkkgktmfsipiihsjq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZnhra2drdG1mc2lwaWloc2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzA2MTYsImV4cCI6MjA5MDA0NjYxNn0.eV3m6O_-Ti3cl8C2yq-Ffp7M2hdBj9qasEWSD3lnrTg';
const SITE_URL = 'https://baddesiplots.com';

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

let passed = 0;
let failed = 0;

function log(status, name, detail = '') {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`  ${icon} ${name}${detail ? ', ' + detail : ''}`);
  if (status === 'PASS') passed++;
  else failed++;
}

async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// ─── Test Group: Live Site ───
async function testLiveSite() {
  console.log('\n🌐 Live Site Tests');

  // 1. Site loads
  try {
    const res = await fetch(SITE_URL);
    log(res.ok ? 'PASS' : 'FAIL', 'Site loads', `HTTP ${res.status}`);
  } catch (e) {
    log('FAIL', 'Site loads', e.message);
  }

  // 2. Supabase CDN script in HTML
  try {
    const html = await (await fetch(`${SITE_URL}/index.html`)).text();
    const hasSupa = html.includes('supabase-js@2');
    log(hasSupa ? 'PASS' : 'FAIL', 'Supabase CDN script in HTML');
  } catch (e) {
    log('FAIL', 'Supabase CDN script in HTML', e.message);
  }

  // 3. cards.json loads
  try {
    const cards = await (await fetch(`${SITE_URL}/cards.json`)).json();
    const count = Array.isArray(cards) ? cards.length : 0;
    log(count > 100 ? 'PASS' : 'FAIL', 'cards.json loads', `${count} cards`);
  } catch (e) {
    log('FAIL', 'cards.json loads', e.message);
  }

  // 4. Service worker cache version
  try {
    const sw = await (await fetch(`${SITE_URL}/sw.js`)).text();
    const hasV3 = sw.includes("badplots-v3");
    log(hasV3 ? 'PASS' : 'FAIL', 'sw.js cache version is v3');
  } catch (e) {
    log('FAIL', 'sw.js cache version', e.message);
  }
}

// ─── Test Group: app.js Code Integrity ───
async function testAppCode() {
  console.log('\n🔍 app.js Code Integrity');

  try {
    const code = await (await fetch(`${SITE_URL}/app.js`)).text();

    // Supabase integration
    log(code.includes('SUPABASE_URL') ? 'PASS' : 'FAIL', 'SUPABASE_URL defined');
    log(code.includes('SUPABASE_ANON_KEY') ? 'PASS' : 'FAIL', 'SUPABASE_ANON_KEY defined');
    log(code.includes('initSupabase') ? 'PASS' : 'FAIL', 'initSupabase() exists');
    log(code.includes('dbInsert') ? 'PASS' : 'FAIL', 'dbInsert() exists');

    // Game state management
    log(code.includes('gameInProgress = false') ? 'PASS' : 'FAIL', 'gameInProgress initialized false');
    log(code.includes('gameInProgress = true') ? 'PASS' : 'FAIL', 'gameInProgress set true in startGame');
    log(code.includes('if (!gameInProgress)') ? 'PASS' : 'FAIL', 'endGame has gameInProgress guard');

    // Abandon detection
    log(code.includes('ABANDON_TIMEOUT') ? 'PASS' : 'FAIL', 'ABANDON_TIMEOUT defined');
    log(code.includes('30000') ? 'PASS' : 'FAIL', 'Abandon timeout is 30 seconds');
    log(code.includes('abandonTimer') ? 'PASS' : 'FAIL', 'abandonTimer variable exists');
    log(code.includes('clearTimeout(abandonTimer)') ? 'PASS' : 'FAIL', 'abandonTimer cleared on return');

    // Event names (must match PostHog taxonomy)
    const expectedEvents = [
      'game_start', 'game_end', 'card_flip', 'card_result', 'card_view',
      'mode_selected', 'diff_selected', 'feedback_submitted', 'suggestion_submitted',
      'feedback_opened', 'suggest_opened', 'game_exit'
    ];
    for (const evt of expectedEvents) {
      log(code.includes(`'${evt}'`) ? 'PASS' : 'FAIL', `Event '${evt}' tracked`);
    }

    // Old event names should NOT exist
    const oldEvents = ['feedback_submit', 'suggestion_submit'];
    for (const evt of oldEvents) {
      log(!code.includes(`'${evt}'`) ? 'PASS' : 'FAIL', `Old event '${evt}' removed`);
    }

    // Supabase writes
    log(code.includes("dbInsert('sessions'") ? 'PASS' : 'FAIL', 'dbInsert writes to sessions table');
    log(code.includes("dbInsert('feedback'") ? 'PASS' : 'FAIL', 'dbInsert writes to feedback table');
    log(code.includes("dbInsert('suggestions'") ? 'PASS' : 'FAIL', 'dbInsert writes to suggestions table');

  } catch (e) {
    log('FAIL', 'Fetch app.js', e.message);
  }
}

// ─── Test Group: Supabase CRUD ───
async function testSupabase() {
  console.log('\n🗄️  Supabase Integration Tests');

  const testTag = `e2e-${Date.now()}`;

  // Insert into feedback
  try {
    const { ok, data } = await fetchJSON(`${SUPABASE_URL}/rest/v1/feedback`, {
      method: 'POST', headers: HEADERS,
      body: JSON.stringify({ tags: ['e2e-test'], text: testTag })
    });
    log(ok && data[0]?.text === testTag ? 'PASS' : 'FAIL', 'Feedback insert', ok ? `id=${data[0]?.id}` : JSON.stringify(data));
  } catch (e) {
    log('FAIL', 'Feedback insert', e.message);
  }

  // Insert into suggestions
  try {
    const { ok, data } = await fetchJSON(`${SUPABASE_URL}/rest/v1/suggestions`, {
      method: 'POST', headers: HEADERS,
      body: JSON.stringify({ movie: testTag, industry: 'HI' })
    });
    log(ok && data[0]?.movie === testTag ? 'PASS' : 'FAIL', 'Suggestions insert', ok ? `id=${data[0]?.id}` : JSON.stringify(data));
  } catch (e) {
    log('FAIL', 'Suggestions insert', e.message);
  }

  // Insert into sessions
  try {
    const { ok, data } = await fetchJSON(`${SUPABASE_URL}/rest/v1/sessions`, {
      method: 'POST', headers: HEADERS,
      body: JSON.stringify({
        mode: 'classic', industry: 'HI', difficulty: 'easy',
        player_count: 1, correct_count: 7, total_count: 10,
        points: 350, reason: testTag
      })
    });
    log(ok && data[0]?.reason === testTag ? 'PASS' : 'FAIL', 'Sessions insert', ok ? `id=${data[0]?.id}` : JSON.stringify(data));
  } catch (e) {
    log('FAIL', 'Sessions insert', e.message);
  }

  // Cleanup
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/feedback?text=eq.${testTag}`, { method: 'DELETE', headers: HEADERS });
    await fetch(`${SUPABASE_URL}/rest/v1/suggestions?movie=eq.${testTag}`, { method: 'DELETE', headers: HEADERS });
    await fetch(`${SUPABASE_URL}/rest/v1/sessions?reason=eq.${testTag}`, { method: 'DELETE', headers: HEADERS });
    log('PASS', 'Test data cleaned up');
  } catch (e) {
    log('FAIL', 'Test data cleanup', e.message);
  }
}

// ─── Test Group: Manifest & PWA ───
async function testPWA() {
  console.log('\n📱 PWA Tests');

  try {
    const manifest = await (await fetch(`${SITE_URL}/manifest.json`)).json();
    log(manifest.name ? 'PASS' : 'FAIL', 'manifest.json loads', manifest.name);
    log(manifest.icons?.length > 0 ? 'PASS' : 'FAIL', 'PWA icons defined', `${manifest.icons?.length || 0} icons`);

    // Check if icon files actually exist
    for (const icon of (manifest.icons || [])) {
      try {
        const iconRes = await fetch(`${SITE_URL}/${icon.src}`);
        log(iconRes.ok ? 'PASS' : 'FAIL', `Icon ${icon.src} exists`, `HTTP ${iconRes.status}`);
      } catch (e) {
        log('FAIL', `Icon ${icon.src} exists`, e.message);
      }
    }
  } catch (e) {
    log('FAIL', 'manifest.json loads', e.message);
  }
}

// ─── Run All ───
async function main() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   Seedha Plot, End-to-End Test Suite     ║');
  console.log('╚═══════════════════════════════════════════╝');

  await testLiveSite();
  await testAppCode();
  await testSupabase();
  await testPWA();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(failed > 0 ? 1 : 0);
}

main();
