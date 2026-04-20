const puppeteer = require('puppeteer');
const path = require('path');

const OUT = path.join(__dirname, '..', 'screenshots', 'e2e');
const URL = 'http://localhost:5173';

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const fs = require('fs');
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // 1. HOME SCREEN
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await wait(1500);
  await page.screenshot({ path: path.join(OUT, '01-home.png') });
  console.log('1. Home screen captured');

  // 2. Click PASS & PLAY -> SETUP
  await page.click('[aria-label="Pass and Play"]');
  await wait(800);
  await page.screenshot({ path: path.join(OUT, '02-setup.png') });
  console.log('2. Player setup captured');

  // 3. Click LET'S GO -> GAME (first card)
  // Find and click the start/go button
  const startBtn = await page.$('.v8-setup-go, .v8-setup-cta button');
  if (startBtn) {
    await startBtn.click();
    await wait(1000);
  } else {
    // Try text-based search
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes("LET'S GO")) {
        await btn.click();
        await wait(1000);
        break;
      }
    }
  }
  await page.screenshot({ path: path.join(OUT, '03-card-front.png') });
  console.log('3. Card front captured');

  // 4. Click card to flip
  const cardStage = await page.$('.v8-card-stage');
  if (cardStage) {
    await cardStage.click();
    await wait(1200);
  }
  await page.screenshot({ path: path.join(OUT, '04-card-back.png') });
  console.log('4. Card back (flipped) captured');

  // 5. Click a player chip to award points
  const chip = await page.$('.v8-pchip');
  if (chip) {
    await chip.click();
    await wait(1500);
  }
  await page.screenshot({ path: path.join(OUT, '05-turn-change.png') });
  console.log('5. Turn change captured');

  // 6. Tap to continue (next card)
  await page.click('main');
  await wait(1000);
  await page.screenshot({ path: path.join(OUT, '06-card2-front.png') });
  console.log('6. Card 2 front captured');

  // 7. Open menu
  const menuBtn = await page.$('.v8-topband__menu');
  if (menuBtn) {
    await menuBtn.click();
    await wait(500);
    await page.screenshot({ path: path.join(OUT, '07-menu.png') });
    console.log('7. Menu captured');

    // Click "End round" to go to results
    const menuItems = await page.$$('.v8-menu-item');
    for (const item of menuItems) {
      const text = await item.evaluate(el => el.textContent);
      if (text && text.includes('End round')) {
        await item.click();
        await wait(500);
        break;
      }
    }
  }

  // 8. End round sheet
  await page.screenshot({ path: path.join(OUT, '08-endround.png') });
  console.log('8. End round sheet captured');

  // Click confirm end
  const endBtns = await page.$$('button');
  for (const btn of endBtns) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && (text.includes('END ROUND') || text.includes('End Round') || text.includes('SEE RESULTS'))) {
      await btn.click();
      await wait(1000);
      break;
    }
  }
  await page.screenshot({ path: path.join(OUT, '09-results.png') });
  console.log('9. Results screen captured');

  // 9. Click HOME to go back
  const homeBtns = await page.$$('button');
  for (const btn of homeBtns) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.trim() === 'HOME') {
      await btn.click();
      await wait(1000);
      break;
    }
  }
  await page.screenshot({ path: path.join(OUT, '10-home-return.png') });
  console.log('10. Home (return) captured');

  // 10. Solo mode
  await page.click('[aria-label="Solo"]');
  await wait(1500);
  await page.screenshot({ path: path.join(OUT, '11-solo-card.png') });
  console.log('11. Solo card captured');

  await browser.close();
  console.log('\nAll screenshots saved to screenshots/e2e/');
})();
