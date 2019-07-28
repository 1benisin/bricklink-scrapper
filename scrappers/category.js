
const fs = require('fs-extra');
const puppeteer = require('puppeteer');


//  Returns all the b tags
async function scrapeCategory() {
  try {
    // -- const browser = await puppeteer.launch({ headless: true, slowMo: 0 });
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36');

    // -- create csv file
    const headers = 'Times Sold,Total Qty,Min Price,Avg Price,Qty Avg Price,Max Price';
    await fs.writeFile('out.csv', `Brick Code,Color Code,${headers},${headers},${headers},${headers}\n`);
    // await fs.appendFile('out.csv', newFileRow);


    // -- go to category page and collect all the item links
    await page.goto('https://www.bricklink.com/catalogList.asp?catType=P&catString=1&itemBrand=1000');
    await page.waitForSelector('.catalog-list__body-header');

    const links = await page.$$eval('.catalog-list__body-header ~ tr > td:nth-child(2) a', as => {
      return as.map(a => {
        // get the href and append it to base url
        return 'https://www.bricklink.com' + a.getAttribute('href')
        // of everything after the first entry (it's the header row)
      }).slice(0);
    })

    // -- go to page for each part
    for (const link of links) {
      const colorCODE = await scrapePart(page, link);
    }


    await browser.close();

  } catch (e) {
    console.log('OUR ERROR: ', e);
  }
}


async function test(obj) {
  try {
    console.log('test: ', obj);
  } catch (e) {
    console.log('OUR ERROR: ', e);
  }
}


async function scrapePart(page, link) {
  try {

    // go to page and wait for selector
    await page.goto('about:blank');
    await page.goto(link);
    const selector = '#id_divBlock_Main > table:nth-child(1) > tbody > tr:nth-child(1) > td > span > span:nth-child(1)'
    await page.waitForSelector(selector);

    // get the part number
    const partNum = await page.$eval(selector, span => span.textContent);

    // get all the color codes
    await page.waitForSelector('.pciSelectColorColorItem');

    //get all color codes from ColorDropdownList
    const colorCodes = await page.$$eval('.pciPGTabColorDropdownList > .pciSelectColorColorItem', colorDivs => {
      return colorDivs.map(div => div.getAttribute('data-color'));
    })


    // go to page for each color
    for (const colorCode of colorCodes) {
      console.log(partNum, colorCode);

      await page.goto('about:blank');
      await page.goto(`https://www.bricklink.com/v2/catalog/catalogitem.page?P=3004#T=P&C=${colorCode}`, { timeout: 120000, waitUntil: 'networkidle0' });
      try {
        await page.waitForSelector('.pcipgSummaryTable', { timeout: 120000 });


        // pull all sales table data
        const values = await page.$$eval('.pcipgSummaryTable b', b => {
          return b.map(el => el.innerText);
        });

        // create a string to append as a new row to out.csv
        let newFileRow = `"${partNum}","${colorCode}"`;
        for (const value of values) {
          newFileRow += `,"${value}"`;
        }
        newFileRow += '\n';

        await fs.appendFile('out.csv', newFileRow);
        console.log(newFileRow);

      } catch {
        // if getting sales data fales populat csv row with null values
        let newFileRow = `"${partNum}","${colorCode}"`;

        for (let i = 0; i < 24; i++)
          newFileRow += ',"null"';

        newFileRow += '\n';

        await fs.appendFile('out.csv', newFileRow);
        console.log(newFileRow);
      }
    }



  } catch (e) {
    console.log('OUR ERROR: ', e);
  }
}

scrapeCategory();