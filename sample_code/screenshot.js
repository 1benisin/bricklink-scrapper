

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.reserveamerica.com/campgroundDetails.do?contractCode=INDP&parkId=721982&xml=true');
    await page.screenshot({ path: 'example.png' });

    await browser.close();
})();