"use strict";

const fs = require("fs-extra");
const puppeteer = require("puppeteer");

const testUrls = [
  'https://www.bricklink.com/v2/catalog/catalogitem.page?P=4870c07',
  'https://www.bricklink.com/v2/catalog/catalogitem.page?P=4870c01',
  'https://www.bricklink.com/v2/catalog/catalogitem.page?P=4870c02',
  'https://www.bricklink.com/v2/catalog/catalogitem.page?P=4870c04',
  'https://www.bricklink.com/v2/catalog/catalogitem.page?P=2415',
  'https://www.bricklink.com/v2/catalog/catalogitem.page?P=2415c05',
  'https://www.bricklink.com/v2/catalog/catalogitem.page?P=2415c06',
  'https://www.bricklink.com/v2/catalog/catalogitem.page?P=2415c04',
  'https://www.bricklink.com/v2/catalog/catalogitem.page?P=2415c07'
]

// __________________
async function init() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // -- go to Catgory Tree and get category Urls
    const categoryUrls = await getCategoryUrlsFromCategoryTree(page);

    // -- go to each Category and get Part Urls
    let colorURLs = [];
    for (const categoryUrl of categoryUrls) {
      let partURLs = await getPartUrlsFromCategory(page, categoryUrl);

      // -- go to each Part and get Color Urls
      for (const partURL of partURLs) {
        colorURLs = colorURLs.concat(await getColorUrlsFromPart(page, partURL));
      }
    }


    // console.log("colorURLs: ", colorURLs);

    await browser.close();

  } catch (e) {
    console.log("MY dic6 ERROR: ", e);
  }

  return 'done';
}
init();


// _________________________________________________
async function getCategoryUrlsFromCategoryTree(page) {
  try {

    // go to page
    await page.goto("about:blank");
    await page.goto("https://www.bricklink.com/catalogTree.asp?itemType=P", { waitUntil: "networkidle0" });

    // get all cat
    const selector =
      "#id-main-legacy-table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr:nth-child(2) a";
    const categoryUrls = await page.$$eval(selector, es => es.map(e => "https://www.bricklink.com" + e.getAttribute("href")));
    return categoryUrls;

  } catch (e) {
    console.log("MY dic6 ERROR: ", e);
  }
}

// ______________________________________________________
async function getPartUrlsFromCategory(page, categoryURL) {
  try {

    // go to page
    await page.goto("about:blank");
    await page.goto(categoryURL, { waitUntil: "networkidle0" });

    // how many pages are there?
    const pageCountSelector = '#id-main-legacy-table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > div > div.catalog-list__pagination--top.l-clear-left > div:nth-child(2) > b:nth-child(3)';
    const pageCount = await page.$eval(pageCountSelector, e => parseInt(e.innerText));


    // go through each page 
    let partUrls = [];

    for (let i = 1; i < pageCount + 1; i++) {
      const url = categoryURL.replace('?', `?pg=${i}&`)

      await page.goto("about:blank");
      await page.goto(url, { waitUntil: "networkidle0" });

      // grab part Urls
      const colorUrls = await page.$$eval('.catalog-list__body-header ~ tr > td:nth-child(2) a', as => {
        return as.map(a => 'https://www.bricklink.com' + a.getAttribute('href'));
      })

      partUrls = partUrls.concat(colorUrls);
    }

    // return an array of partUrls
    return partUrls;

  } catch (e) {
    console.log("MY 9dlc ERROR: ", e);
  }
}

// _________________________________________
async function getColorUrlsFromPart(page, partUrl) {
  try {
    // go to page
    await page.goto("about:blank");
    await page.goto(partUrl, { waitUntil: "networkidle0" });

    // how many colors are there? - get them from color dropdown list
    const colorCodes = await page.$$eval('.pciPGTabColorDropdownList > .pciSelectColorColorItem', colorDivs => {
      return colorDivs.map(div => div.getAttribute('data-color'));
    });

    const colorUrls = colorCodes.map(c => partUrl + '&C=' + c)

    return colorUrls;

  } catch (e) {
    console.log("MY SvEk ERROR: ", e);
  }
}

async function scrapePart(colorUrls, options) {
  try {
    // make csv file
    const salesHeaders = 'Times Sold,Total Qty,Min Price,Avg Price,Qty Avg Price,Max Price';
    const headers = 'Category,Part Name,Part Code,Color Name,Color Code,';
    await fs.writeFile('out.csv', `Brick Code,Color URL Link,Color Name,${salesHeaders},${salesHeaders},${salesHeaders},${salesHeaders}\n`);

    await page.goto("about:blank");
    await page.goto(partUrl, { waitUntil: "networkidle0" });

  } catch (e) {
    console.log("MY dic6 ERROR: ", e);
  }

}
