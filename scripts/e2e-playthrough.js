import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const OUT = 'screenshots/qa/e2e';
mkdirSync(OUT, { recursive: true });

const b = await puppeteer.launch({ headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

const errors = [];
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

const results = [];
async function step(name, action) {
  try {
    await action();
    await new Promise((r) => setTimeout(r, 350));
    await p.screenshot({ path: `${OUT}/${String(results.length).padStart(2, '0')}-${name}.png` });
    results.push({ name, ok: true });
    console.log('PASS', name);
  } catch (e) {
    await p.screenshot({ path: `${OUT}/${String(results.length).padStart(2, '0')}-${name}-FAIL.png` }).catch(() => {});
    results.push({ name, ok: false, error: e.message });
    console.log('FAIL', name, '-', e.message);
    throw e; // stop on first failure to avoid cascade
  }
}

try {

await step('home-load', async () => {
  await p.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await p.waitForSelector('[aria-label="Pass and Play"]', { timeout: 15000 });
  await p.waitForSelector('[aria-label="Solo"]', { timeout: 5000 });
});

// ==================== SOLO FLOW ====================
await step('solo-click', async () => {
  await p.click('[aria-label="Solo"]');
  await p.waitForSelector('.v8-inter', { timeout: 8000 });
});

await step('solo-intro-has-ready', async () => {
  const body = await p.evaluate(() => document.body.innerText);
  if (!/SOLO MODE/i.test(body)) throw new Error('no SOLO MODE text');
  if (!/READY\?/i.test(body)) throw new Error('no READY? text');
});

await step('solo-tap-to-begin', async () => {
  await p.click('.v8-inter');
  await p.waitForSelector('.v8-card-stage', { timeout: 8000 });
});

await step('solo-flip-card', async () => {
  await p.evaluate(() => document.querySelector('.v8-card-stage')?.click());
  await new Promise((r) => setTimeout(r, 900));
  const body = await p.evaluate(() => document.body.innerText);
  if (!/I GOT IT/i.test(body)) throw new Error('I GOT IT not visible after flip');
  if (!/NOPE/i.test(body)) throw new Error('NOPE not visible');
});

await step('solo-got-it', async () => {
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => /i got it/i.test(b.textContent || ''));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  // For solo, subsequent cards go straight to next card (auto-dismissed interstitial)
  await p.waitForSelector('.v8-card-stage', { timeout: 8000 });
});

// Go home to reset for pass-and-play test
await step('solo-back-home', async () => {
  await p.click('.v8-topband__menu');
  await new Promise((r) => setTimeout(r, 300));
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => /back home/i.test(b.textContent || ''));
    if (btn) btn.click();
  });
  await p.waitForSelector('[aria-label="Pass and Play"]', { timeout: 8000 });
});

// ==================== PASS AND PLAY FLOW ====================
await step('home-passandplay', async () => {
  await p.click('[aria-label="Pass and Play"]');
  await p.waitForSelector('.v8-setup-panel', { timeout: 8000 });
});

await step('setup-has-mast-clearance', async () => {
  // Verify masthead X and MIN/MAX don't overlap
  const rects = await p.evaluate(() => {
    const close = document.querySelector('.v8-setup-close');
    const sub = document.querySelector('.v8-setup-mast__sub');
    if (!close || !sub) return null;
    return { close: close.getBoundingClientRect().toJSON(), sub: sub.getBoundingClientRect().toJSON() };
  });
  if (!rects) throw new Error('mast elements not found');
  const hit = !(rects.close.right <= rects.sub.left || rects.sub.right <= rects.close.left || rects.close.bottom <= rects.sub.top || rects.sub.bottom <= rects.close.top);
  if (hit) throw new Error(`mast close overlaps MIN/MAX: close=${JSON.stringify(rects.close)} sub=${JSON.stringify(rects.sub)}`);
});

await step('setup-type-names', async () => {
  const inputs = await p.$$('.v8-setup-input');
  if (inputs.length < 2) throw new Error('need 2 inputs, got ' + inputs.length);
  await inputs[0].click({ clickCount: 3 }); await inputs[0].type('Srinitya');
  await inputs[1].click({ clickCount: 3 }); await inputs[1].type('Anjali');
});

await step('setup-lets-go', async () => {
  await p.click('.v8-setup-start');
  await p.waitForSelector('.v8-inter', { timeout: 8000 });
});

await step('first-reader-interstitial', async () => {
  const body = await p.evaluate(() => document.body.innerText);
  if (!/YOU'RE UP FIRST|YOU\u2019RE UP FIRST/i.test(body)) throw new Error('no YOU\'RE UP FIRST');
  if (!/SRINITYA/i.test(body)) throw new Error('player name missing');
  if (!/Read the plot out loud/i.test(body)) throw new Error('no sub-instruction');
});

await step('tap-to-card-1', async () => {
  await p.click('.v8-inter');
  await p.waitForSelector('.v8-card-stage', { timeout: 8000 });
});

await step('card-1-flip', async () => {
  await p.evaluate(() => document.querySelector('.v8-card-stage')?.click());
  await new Promise((r) => setTimeout(r, 900));
});

await step('pick-anjali', async () => {
  const clicked = await p.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.v8-pchip'));
    const anjali = chips.find((c) => /anjali/i.test(c.textContent || ''));
    if (anjali) { anjali.click(); return true; }
    return false;
  });
  if (!clicked) throw new Error('no Anjali chip');
  await p.waitForSelector('.v8-inter', { timeout: 8000 });
});

await step('round-2-interstitial-hand-phone', async () => {
  const body = await p.evaluate(() => document.body.innerText);
  if (!/HAND THE PHONE TO|Anjali got it/i.test(body)) throw new Error('mid-game interstitial text missing');
});

await step('tap-to-card-2', async () => {
  await p.click('.v8-inter');
  await p.waitForSelector('.v8-card-stage', { timeout: 8000 });
});

await step('card-2-flip', async () => {
  await p.evaluate(() => document.querySelector('.v8-card-stage')?.click());
  await new Promise((r) => setTimeout(r, 900));
});

await step('pick-nobody', async () => {
  const clicked = await p.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.v8-pchip'));
    const nb = chips.find((c) => /nobody/i.test(c.textContent || ''));
    if (nb) { nb.click(); return true; }
    return false;
  });
  if (!clicked) throw new Error('no NOBODY chip');
  await p.waitForSelector('.v8-inter', { timeout: 8000 });
});

await step('tap-to-card-3', async () => {
  await p.click('.v8-inter');
  await p.waitForSelector('.v8-card-stage', { timeout: 8000 });
});

await step('end-round-via-menu', async () => {
  await p.click('.v8-topband__menu');
  await new Promise((r) => setTimeout(r, 300));
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => /end round/i.test(b.textContent || ''));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  // confirm
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => /^(end round|end game|yes|end|confirm)$/i.test((b.textContent || '').trim()));
    if (btn) btn.click();
  });
  await p.waitForSelector('.v8-results-panel', { timeout: 10000 });
});

await step('results-paper-has-ctas', async () => {
  const has = await p.evaluate(() => {
    const panel = document.querySelector('.v8-results-panel');
    if (!panel) return false;
    const ctas = panel.querySelector('.v8-results-ctas');
    return !!ctas;
  });
  if (!has) throw new Error('CTAs are NOT inside the paper panel');
});

await step('results-leaderboard-has-anjali', async () => {
  const body = await p.evaluate(() => document.body.innerText);
  if (!/anjali|srinitya/i.test(body)) throw new Error('leaderboard missing player names');
});

await step('click-home-from-results', async () => {
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => {
      const cls = (b.className || '').toString();
      const txt = (b.textContent || '').trim();
      return cls.includes('v8-results-btn--secondary') && /home/i.test(txt);
    });
    if (btn) btn.click();
  });
  await p.waitForSelector('[aria-label="Pass and Play"]', { timeout: 8000 });
});

await step('resume-pill-visible-on-home', async () => {
  const has = await p.evaluate(() => !!document.querySelector('.v8-home-resume'));
  if (!has) throw new Error('resume pill not visible after ending a round');
});

} catch (e) {
  // stop cascade
} finally {
  await b.close();
}

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
console.log('\n===== SUMMARY =====');
console.log(`${passed} / ${results.length} passed`);
if (failed.length) {
  console.log('failures:');
  failed.forEach((f) => console.log('  -', f.name, ':', f.error));
}
if (errors.length) {
  console.log('\nconsole/page errors during run:');
  errors.slice(0, 10).forEach((e) => console.log('  -', e));
}
process.exit(failed.length > 0 || errors.length > 0 ? 1 : 0);
