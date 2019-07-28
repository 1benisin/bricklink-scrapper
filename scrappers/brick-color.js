
const fs = require('fs-extra');
const puppeteer = require('puppeteer');


//  Returns all the b tags
(async () => {
    try {
        // const browser = await puppeteer.launch({ headless: true, slowMo: 0 });
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36');

        // create csv file
        await fs.writeFile('out.csv', 'brickCode,colorCode\n')


        await page.goto('https://www.bricklink.com/v2/catalog/catalogitem.page?P=3004#T=P');
        await page.waitForSelector('.pciSelectColorColorItem');

        //get all color codes from ColorDropdownList
        const colorCodes = await page.$$eval('.pciPGTabColorDropdownList > .pciSelectColorColorItem', colorDivs => {
            return colorDivs.map(div => div.getAttribute('data-color')).slice(1);
        })
        console.log(colorCodes);

        // const colorURLs = colorCodes.map(code => `https://www.bricklink.com/v2/catalog/catalogitem.page?P=3004#T=P&C=${code}`);
        // console.log(colorURLs);

        // go to page for each color
        for (const code of colorCodes) {
            await page.goto('about:blank');
            await page.goto(`https://www.bricklink.com/v2/catalog/catalogitem.page?P=3004#T=P&C=${code}`);
            await page.waitForSelector('.pcipgSummaryTable');

            // pull all sales table data
            const values = await page.$$eval('.pcipgSummaryTable b', b => {
                return b.map(el => el.innerText);
            });
            console.log(values);

            let newFsRow = `"3004","${code}"`;
            for (const value of values) {
                newFsRow += `,"${value}"`;
            }
            newFsRow += '\n';
            console.log(newFsRow);


            await fs.appendFile('out.csv', newFsRow);

        }

        // #region ------- TEST

        // await page.goto(`https://www.bricklink.com/v2/catalog/catalogitem.page?P=3004#T=P&C=41`);
        // await page.waitForSelector('.pcipgSummaryTable')

        // // pull all sales table data
        // const values = await page.$$eval('.pcipgSummaryTable b', b => {
        //     return b.map(el => el.innerText)
        // });
        // console.log(values);

        // #endregion ------- TEST


        await browser.close();

    } catch (e) {
        console.log('OUR ERROR: ', e);
    }
})();