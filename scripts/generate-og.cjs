const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });

  const templatePath = path.join(__dirname, 'og-template.html');
  await page.goto(`file://${templatePath}`, { waitUntil: 'networkidle0' });

  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1000));

  const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
  await page.screenshot({ path: outputPath, type: 'png' });

  console.log(`OG image saved to ${outputPath}`);
  await browser.close();
})();
