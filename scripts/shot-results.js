import puppeteer from 'puppeteer';

const b = await puppeteer.launch({ headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

const errs = [];
p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

await p.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
await new Promise(r => setTimeout(r, 1200));

// Solo now routes through PlayerSetup — type name
await p.click('[aria-label="Solo"]');
await p.waitForSelector('.v8-setup-panel', { timeout: 8000 });
const inputs = await p.$$('.v8-setup-input');
if (inputs.length > 0) { await inputs[0].click({ clickCount: 3 }); await inputs[0].type('Sri'); }
await p.click('.v8-setup-start');
await p.waitForSelector('.v8-inter', { timeout: 8000 });
await p.click('.v8-inter');
await p.waitForSelector('.v8-card-stage', { timeout: 8000 });

// Play 3 rounds correct
for (let i = 0; i < 3; i++) {
  await p.evaluate(() => document.querySelector('.v8-card-stage')?.click());
  await new Promise(r => setTimeout(r, 700));
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => /i got it/i.test(b.textContent || ''));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
}

// End via menu
await p.click('.v8-topband__menu');
await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /end round/i.test(b.textContent || ''));
  if (btn) btn.click();
});
await new Promise(r => setTimeout(r, 400));
await p.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b => /^(end round|end game|yes|end|confirm)$/i.test((b.textContent || '').trim()));
  if (btn) btn.click();
});
await p.waitForSelector('.v8-results-panel', { timeout: 10000 });
await new Promise(r => setTimeout(r, 500));
await p.screenshot({ path: 'screenshots/qa/results-after-fix.png', fullPage: true });

const info = await p.evaluate(() => {
  const stats = Array.from(document.querySelectorAll('.v8-results-solo__value')).map(e => e.textContent?.trim());
  const pts = Array.from(document.querySelectorAll('.v8-results-pts')).map(e => e.textContent?.trim());
  const labelStyle = window.getComputedStyle(document.querySelector('.v8-results-board__label') ?? document.body);
  const names = Array.from(document.querySelectorAll('.v8-results-name')).map(e => e.textContent?.trim());
  return { stats, leaderboardPts: pts, labelTextAlign: labelStyle.textAlign, names };
});

console.log('STATS:', info.stats);
console.log('LB PTS:', info.leaderboardPts);
console.log('PLAYER NAMES:', info.names);
console.log('THE LINE-UP text-align:', info.labelTextAlign);
console.log('ERRORS:', errs.length ? errs.slice(0, 5).join('\n') : 'none');
await b.close();
