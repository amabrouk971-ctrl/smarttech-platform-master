import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' }).catch(e => console.log('Goto error:', e));
  await new Promise(resolve => setTimeout(resolve, 3000));
  await page.screenshot({ path: 'screenshot.png' });
  console.log('Screenshot saved to screenshot.png');
  const html = await page.content();
  const fs = await import('fs');
  fs.writeFileSync('page.html', html);
  
  await browser.close();
})();
