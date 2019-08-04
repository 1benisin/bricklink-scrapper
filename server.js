"use strict";

const fs = require("fs-extra");
const puppeteer = require("puppeteer");

// __________________
async function init() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // go to Catgory Tree and get category Urls
    const categoryUrls = await getCategoryUrlsFromCategoryTree(page);

    // go to each category and get part Urls
    const partURLs = [];
    for (const categoryUrl of categoryUrls) {
      partURLs.concat(await getPartUrlsFromCategory(page, categoryUrl));
    }

    // go to each pat and get color Urls
    const colorURLs = [];
    for (const partURL of partURLs) {
      colorURLs.concat(await getColorUrlsFromPart(page, partURL));
    }


    console.log("partURLS", partURLs);
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
    const partUrls = [];
    for (let i = 1; i < pageCount + 1; i++) {
      const url = categoryURL.replace('?', `?pg=${i}&`)

      await page.goto("about:blank");
      await page.goto(url, { waitUntil: "networkidle0" });

      // grab part Urls
      const partLinks = await page.$$eval('.catalog-list__body-header ~ tr > td:nth-child(2) a', as => {
        return as.map(a => 'https://www.bricklink.com' + a.getAttribute('href'));
      })

      partUrls.concat(partLinks)
    }

    // return an array of partUrls
    return partUrls;

  } catch (e) {
    console.log("MY dic6 ERROR: ", e);
  }
}

// _________________________________________
async function getColorUrlsFromPart(page, partURL) { }

// scrape( [colorURLs], {options} )
