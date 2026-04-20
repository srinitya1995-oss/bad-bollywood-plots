import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const OUT = 'screenshots/qa/mobile';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
];

const SCREENS = [
  { name: '01-home', action: async () => {} },
  {
    name: '02-setup',
    action: async (page) => {
      await page.waitForSelector('[aria-label="Pass and Play"]', { timeout: 4000 });
      await page.click('[aria-label="Pass and Play"]');
      await page.waitForSelector('.v8-setup-panel', { timeout: 4000 });
    },
  },
  {
    name: '03-first-interstitial',
    action: async (page) => {
      await page.waitForSelector('[aria-label="Pass and Play"]', { timeout: 4000 });
      await page.click('[aria-label="Pass and Play"]');
      await page.waitForSelector('.v8-setup-start', { timeout: 4000 });
      await page.click('.v8-setup-start');
      await page.waitForSelector('.v8-inter', { timeout: 4000 });
    },
  },
  {
    name: '04-card-front',
    action: async (page) => {
      await page.waitForSelector('[aria-label="Solo"]', { timeout: 4000 });
      await page.click('[aria-label="Solo"]');
      await page.waitForSelector('.v8-inter', { timeout: 4000 });
      await new Promise((r) => setTimeout(r, 300));
      await page.click('.v8-inter');
      await page.waitForSelector('.v8-card-stage', { timeout: 4000 });
      await new Promise((r) => setTimeout(r, 400));
    },
  },
  {
    name: '05-card-back',
    action: async (page) => {
      await page.waitForSelector('[aria-label="Solo"]', { timeout: 4000 });
      await page.click('[aria-label="Solo"]');
      await page.waitForSelector('.v8-inter', { timeout: 4000 });
      await new Promise((r) => setTimeout(r, 300));
      await page.click('.v8-inter');
      await page.waitForSelector('.v8-card-stage', { timeout: 4000 });
      await new Promise((r) => setTimeout(r, 400));
      await new Promise((r) => setTimeout(r, 400));
      await page.evaluate(() => {
        const el = document.querySelector('.v8-card-stage');
        if (el) el.click();
      });
      await new Promise((r) => setTimeout(r, 900));
    },
  },
  {
    name: '06-howto',
    action: async (page) => {
      await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some((b) => /how to play/i.test(b.textContent || '')), { timeout: 4000 });
      await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('button')).find((x) => /how to play/i.test(x.textContent || ''));
        if (b) b.click();
      });
      await new Promise((r) => setTimeout(r, 500));
    },
  },
  {
    name: '07-settings',
    action: async (page) => {
      await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some((b) => /settings/i.test(b.textContent || '')), { timeout: 4000 });
      await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('button')).find((x) => /^settings$/i.test((x.textContent || '').trim()));
        if (b) b.click();
      });
      await new Promise((r) => setTimeout(r, 500));
    },
  },
];

const browser = await puppeteer.launch({ headless: 'new' });
const results = [];

for (const vp of VIEWPORTS) {
  for (const screen of SCREENS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 8000 });
      await new Promise((r) => setTimeout(r, 600));
      await screen.action(page);
      await new Promise((r) => setTimeout(r, 300));
      const fn = `${OUT}/${vp.name}_${screen.name}.png`;
      await page.screenshot({ path: fn, fullPage: true });
      results.push({ vp: vp.name, screen: screen.name, ok: true, errors: errors.slice(0, 3) });
    } catch (e) {
      results.push({ vp: vp.name, screen: screen.name, ok: false, error: e.message, errors: errors.slice(0, 3) });
    } finally {
      await page.close();
    }
  }
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
