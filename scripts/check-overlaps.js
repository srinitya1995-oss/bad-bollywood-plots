// Targeted overlap check for header zones.
// Detects real-world bugs like the setup mast X overlapping MIN/MAX.
// Runs at iphone-se viewport because that's where things crowd.

import puppeteer from 'puppeteer';

function bboxOverlap(a, b) {
  return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
}

const CHECKS = [
  {
    name: 'setup-mast',
    setup: async (page) => {
      await page.click('[aria-label="Pass and Play"]');
      await page.waitForSelector('.v8-setup-panel', { timeout: 5000 });
    },
    pairs: [
      ['.v8-setup-mast__title', '.v8-setup-close'],
      ['.v8-setup-mast__sub', '.v8-setup-close'],
      ['.v8-setup-mast__title', '.v8-setup-mast__sub'],
    ],
  },
  {
    name: 'topband',
    setup: async (page) => {
      await page.click('[aria-label="Solo"]');
      await page.waitForSelector('.v8-inter', { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 300));
      await page.click('.v8-inter');
      await page.waitForSelector('.v8-card-stage', { timeout: 5000 });
    },
    pairs: [
      ['.v8-topband__title', '.v8-topband__menu'],
    ],
  },
];

// Warm up: wait until Vite responds and serves index.html
async function warmup() {
  for (let i = 0; i < 10; i++) {
    try {
      const r = await fetch('http://localhost:5173/');
      if (r.ok) return true;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}
if (!(await warmup())) {
  console.error('Vite not responding on :5173 after 10s. Is `npm run dev` running?');
  process.exit(2);
}

const b = await puppeteer.launch({ headless: 'new' });
let failCount = 0;
const failures = [];

for (const check of CHECKS) {
  const page = await b.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForSelector('[aria-label="Pass and Play"], [aria-label="Solo"]', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 400));
    await check.setup(page);
    await new Promise((r) => setTimeout(r, 200));
    for (const [selA, selB] of check.pairs) {
      const rects = await page.evaluate(([a, b]) => {
        const ea = document.querySelector(a);
        const eb = document.querySelector(b);
        if (!ea || !eb) return null;
        return { a: ea.getBoundingClientRect().toJSON(), b: eb.getBoundingClientRect().toJSON() };
      }, [selA, selB]);
      if (!rects) { console.log(`SKIP ${check.name} ${selA} vs ${selB} (not rendered)`); continue; }
      const hit = bboxOverlap(rects.a, rects.b);
      if (hit) {
        failCount++;
        failures.push({ check: check.name, a: selA, b: selB, rects });
        console.log(`FAIL ${check.name}: ${selA} overlaps ${selB}`);
      } else {
        console.log(`PASS ${check.name}: ${selA} vs ${selB}`);
      }
    }
  } catch (e) {
    console.log(`ERROR ${check.name}: ${e.message}`);
    failCount++;
  } finally {
    await page.close();
  }
}
await b.close();

if (failCount > 0) {
  console.log(`\n${failCount} overlap(s) detected`);
  console.log(JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log('\nAll header zones clear.');
