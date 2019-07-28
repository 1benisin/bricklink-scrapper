const puppeteer = require('puppeteer');
const fs = require('fs-extra');


(async () => {
    const browser = await puppeteer.launch({ headless: true, slowMo: 250 });
    const page = await browser.newPage();
    await page.goto('https://thedecalguru.com');

    // creates a csv file
    await fs.writeFile('out.csv', 'WIDTH,height\n')

    // Get the "viewport" of the page, as reported by the page.
    const dimensions = await page.evaluate(() => {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            deviceScaleFactor: window.devicePixelRatio
        };
    });

    // appends to csv file
    await fs.appendFile('out.csv', `"","${dimensions.width}","${dimensions.height}","${dimensions.deviceScaleFactor}"\n`);

    console.log('Dimensions:', dimensions);
    await browser.close();
})();