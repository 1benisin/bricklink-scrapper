'use strict'


const fs = require('fs-extra');
const puppeteer = require('puppeteer');


async function scrapeCategory() {
  try {
    // -- const browser = await puppeteer.launch({ headless: true, slowMo: 0 });
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // -- create csv file
    const headers = 'Times Sold,Total Qty,Min Price,Avg Price,Qty Avg Price,Max Price';
    await fs.writeFile('out.csv', `Brick Code,Color URL Link,Color Name,${headers},${headers},${headers},${headers}\n`);
    // await fs.appendFile('out.csv', newFileRow);


    // -- go to category page and collect all the product links
    await page.goto('https://www.bricklink.com/catalogList.asp?catType=P&catString=1&itemBrand=1000', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.catalog-list__body-header');
    // evaluate links
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
    await page.goto(link, { waitUntil: 'networkidle0' });
    const selector = '#id_divBlock_Main > table:nth-child(1) > tbody > tr:nth-child(1) > td > span > span:nth-child(1)'

    // get the part number
    const partNum = await page.$eval(selector, span => span.textContent);

    // get all the color codes
    // await page.waitForSelector('.pciSelectColorColorItem');

    //get all color codes from ColorDropdownList
    const colorCodes = await page.$$eval('.pciPGTabColorDropdownList > .pciSelectColorColorItem', colorDivs => {
      return colorDivs.map(div => div.getAttribute('data-color'));
    });

    // go to page for each color
    for (const colorCode of colorCodes) {

      await page.goto('about:blank');
      let colorPageLinkURL = `https://www.bricklink.com/v2/catalog/catalogitem.page?P=${partNum}#T=P&C=${colorCode}`;
      await page.goto(colorPageLinkURL, { waitUntil: 'networkidle0' });

      console.log(colorPageLinkURL);

      const colorName = await page.$eval('#_idSelectedColorText', span => span.innerText);
      try {
        // await page.waitForSelector('.pcipgSummaryTable'); // { timeout: 120000 }

        console.log(partNum, colorCode, colorName);

        // pull all sales table data
        const values = await page.$$eval('.pcipgSummaryTable b', b => {
          if (b.length > 0) {
            return b.map(el => el.innerText);
          } else {
            return [];
          }
        });

        console.log('VAlUES:', values);

        // create a string to append as a new row to out.csv
        let newFileRow = `"${partNum}","${colorPageLinkURL}","${colorName}"`;

        // if sales data values were found
        if (values.length > 0) {

          for (const value of values) {
            newFileRow += `,"${value}"`;
          }
          newFileRow += '\n';

        } else { // if getting sales data fails - populate csv row with null values

          for (let i = 0; i < 24; i++)
            newFileRow += ',"null"';

          newFileRow += '\n';
        }

        await fs.appendFile('out.csv', newFileRow);
        console.log('save row to CSV', newFileRow);

      } catch (e) { console.log('OUR si4k ERROR: ', e) }


    }


  } catch (e) {
    console.log('OUR ld8e ERROR: ', e);
  }
}

scrapeCategory();
