import puppeteer from 'puppeteer';

const b = await puppeteer.launch({ headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
await p.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 700));
// Go through setup -> play 1 card -> force end via menu -> results
await p.click('[aria-label="Solo"]');
await p.waitForSelector('.v8-inter', { timeout: 10000 });
await new Promise((r) => setTimeout(r, 400));
await p.click('.v8-inter');
await p.waitForSelector('.v8-card-stage', { timeout: 10000 });
await new Promise((r) => setTimeout(r, 400));
// Flip the card
await p.evaluate(() => { document.querySelector('.v8-card-stage')?.click(); });
await new Promise((r) => setTimeout(r, 900));
// Click "I GOT IT"
await p.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /i got it/i.test(x.textContent || ''));
  if (b) b.click();
});
await new Promise((r) => setTimeout(r, 600));
// Open menu
await p.click('.v8-topband__menu');
await new Promise((r) => setTimeout(r, 300));
await p.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /end round/i.test(x.textContent || ''));
  if (b) b.click();
});
await new Promise((r) => setTimeout(r, 500));
await p.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /^(yes|end round|end)$/i.test((x.textContent || '').trim()));
  if (b) b.click();
});
await p.waitForSelector('.v8-results-panel', { timeout: 10000 });
await new Promise((r) => setTimeout(r, 400));
await p.screenshot({ path: 'screenshots/qa/mobile/results-iphone-se.png', fullPage: true });
console.log('OK');
await b.close();
