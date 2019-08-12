"use strict";

// Application Dependencies
const pg = require('pg');
const fs = require("fs-extra");
const puppeteer = require("puppeteer");

// Environment variables
require('dotenv').config();

// Database Setup: if you've got a good DATABASE_URL
if (process.env.DATABASE_URL) {
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect();
  client.on('error', err => console.error(err));
}

// global variables
const DB_HEADERS = 'category_name,part_code,part_name,color_code,color_name,bricklink_url,sales_country,sold_new_times_sold,sold_new_total_qty,sold_new_min_price,sold_new_avg_price,sold_new_qty_avg_price,sold_new_max_price,sold_used_times_sold,sold_used_total_qty,sold_used_min_price,sold_used_avg_price,sold_used_qty_avg_price,sold_used_max_price,listed_new_total_lots,listed_new_total_qty,listed_new_min_price,listed_new_avg_price,listed_new_qty_avg_price,listed_new_max_price,listed_used_total_lots,listed_used_total_qty,listed_used_min_price,listed_used_avg_price,listed_used_qty_avg_price,listed_used_max_price,date_created';


// __________________
async function init() {
  try {
    const browser = await puppeteer.launch({ headless: true });

    // -- go to Catgory Tree and get Category Codes
    const categoryCodes = await getCategoryCodes(browser);

    // -- go to each Category and get Part Codes
    for (const categoryCode of categoryCodes) {
      let partCodes = await getPartCodes(browser, categoryCode);

      // go to each Part and get Color Codes
      for (const partCode of partCodes) {
        let colorCodes = await getColorCodes(browser, partCode);

        console.log('#ofColors for part', partCode, '->', colorCodes.length)
        // scrape part price guide page
        for (const colorCode of colorCodes) {
          const countries = await scrapePart(browser, partCode, colorCode);

          for (const country of countries) {

            //create a Part object
            const part = Part.newPartfromArray(country);
            // save Part object to DB
            await part.saveToDB();
            // console.log(part);

          }
        }
      }

    }

  }
  catch (e) { console.log("MY ded6 ERROR: ", e); }
  finally { await browser.close(); }


  return 'done';
}
init();

// _____________________________________________________________________________
function Part(components) {
  this.category_name = components.category_name || null;
  this.part_code = components.part_code || null;
  this.part_name = components.part_name || null;
  this.color_code = components.color_code || null;
  this.color_name = components.color_name || null;
  this.bricklink_url = components.bricklink_url || null;
  this.sales_country = components.sales_country || null;
  this.sold_new_times_sold = components.sold_new_times_sold || null;
  this.sold_new_total_qty = components.sold_new_total_qty || null;
  this.sold_new_min_price = components.sold_new_min_price || null;
  this.sold_new_avg_price = components.sold_new_avg_price || null;
  this.sold_new_qty_avg_price = components.sold_new_qty_avg_price || null;
  this.sold_new_max_price = components.sold_new_max_price || null;
  this.sold_used_times_sold = components.sold_used_times_sold || null;
  this.sold_used_total_qty = components.sold_used_total_qty || null;
  this.sold_used_min_price = components.sold_used_min_price || null;
  this.sold_used_avg_price = components.sold_used_avg_price || null;
  this.sold_used_qty_avg_price = components.sold_used_qty_avg_price || null;
  this.sold_used_max_price = components.sold_used_max_price || null;
  this.listed_new_total_lots = components.listed_new_total_lots || null;
  this.listed_new_total_qty = components.listed_new_total_qty || null;
  this.listed_new_min_price = components.listed_new_min_price || null;
  this.listed_new_avg_price = components.listed_new_avg_price || null;
  this.listed_new_qty_avg_price = components.listed_new_qty_avg_price || null;
  this.listed_new_max_price = components.listed_new_max_price || null;
  this.listed_used_total_lots = components.listed_used_total_lots || null;
  this.listed_used_total_qty = components.listed_used_total_qty || null;
  this.listed_used_min_price = components.listed_used_min_price || null;
  this.listed_used_avg_price = components.listed_used_avg_price || null;
  this.listed_used_qty_avg_price = components.listed_used_qty_avg_price || null;
  this.listed_used_max_price = components.listed_used_max_price || null;
  this.date_created = new Date();
}
Part.prototype.saveToDB = async function () {
  try {
    // TODO: conslole log out first 7 values and check for dubs
    console.log('DB SAVE: ', this.category_name, this.part_code, this.color_code, this.sales_country, this.sold_new_total_qty, this.sold_used_total_qty, this.listed_new_total_qty, this.listed_used_total_qty);

    const SQL = `INSERT INTO part (${DB_HEADERS}) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32);`;
    const values = [this.category_name, this.part_code, this.part_name, this.color_code, this.color_name, this.bricklink_url, this.sales_country, this.sold_new_times_sold, this.sold_new_total_qty, this.sold_new_min_price, this.sold_new_avg_price, this.sold_new_qty_avg_price, this.sold_new_max_price, this.sold_used_times_sold, this.sold_used_total_qty, this.sold_used_min_price, this.sold_used_avg_price, this.sold_used_qty_avg_price, this.sold_used_max_price, this.listed_new_total_lots, this.listed_new_total_qty, this.listed_new_min_price, this.listed_new_avg_price, this.listed_new_qty_avg_price, this.listed_new_max_price, this.listed_used_total_lots, this.listed_used_total_qty, this.listed_used_min_price, this.listed_used_avg_price, this.listed_used_qty_avg_price, this.listed_used_max_price, this.date_created];

    return await client.query(SQL, values);

  } catch (e) { console.log('DB-SAVE ERROR: ', e) };
}
Part.newPartfromArray = function (arr) {
  // takes an array like this -> [ '(Other)', 'part_code', 'Generic Entry for Merging Parts', 'color_code', 'Black', 'bricklink_url', 'US Dollar', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '1', '7', 'US $3.00', 'US $3.00', 'US $3.00', 'US $3.00' ]
  let part = new Part({});

  let keys = DB_HEADERS.split(',');

  arr.forEach((element, i) => {
    part[keys[i]] = element;
  });
  return part;
}


// _____________________________________________________________________________
async function scrapePart(browser, part_code, color_code, options) {
  if (!part_code || !color_code) throw 'scrapePart() requires part and color codes';

  // open new page
  const page = await browser.newPage();

  // console log inside evaluate method
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });


  try {
    // go to part's Price Guide
    const bricklink_url = `https://www.bricklink.com/catalogPG.asp?P=${part_code}&colorID=${color_code}&viewExclude=N&v=D&cID=N`
    await page.goto(bricklink_url, { waitUntil: "networkidle0" });

    // get category_name, part_code, part_name, color_code, color_name, bricklink_url, sales_country
    // scrape category
    const details = await page.evaluate(() => {

      let allPageData = [];

      // get category_name
      let selector = '#id-main-legacy-table > tbody > tr > td > table:nth-child(4) > tbody > tr > td > table > tbody > tr > td:nth-child(1) > b > font > a:nth-child(3)'
      const category_name = document.querySelector(selector).innerText;

      // scrape color and part names
      selector = '#id-main-legacy-table > tbody > tr > td > table:nth-child(5) > tbody > tr > td > center > font > b'
      const colorAndName = document.querySelector(selector).innerHTML.split('&nbsp;');
      const color_name = colorAndName[0];
      const part_name = colorAndName[1];
      // push details ot array

      // get all country nodes
      const countryNodes = document.querySelectorAll('tr[bgcolor="#000000"]');

      // if there are any sales
      if (countryNodes.length) {

        // loop through countries
        for (let i = 0; i < countryNodes.length; i++) {

          // initialize data that is the same
          let partDetailsByCountry = [category_name, 'part_code', part_name, 'color_code', color_name, 'bricklink_url'];

          // get sales country name
          const sales_country = countryNodes[i].querySelector('center').innerText;

          partDetailsByCountry.push(sales_country);

          // get all 4 sales data tables for this country and push to details array
          const salesTables = countryNodes[i].nextSibling.querySelectorAll('td[valign="TOP"]');
          for (let i = 0; i < salesTables.length; i++) {
            if (salesTables[i].querySelector('center'))
              new Array(6).fill(null).map(e => partDetailsByCountry.push(e))
            else
              Array.from(salesTables[i].querySelectorAll('b')).map(e => partDetailsByCountry.push(e.innerText));
          }

          allPageData.push(partDetailsByCountry);
        }

      } else { // else return part info with null values for sales data
        let noSalesDetails = [category_name, 'part_code', part_name, 'color_code', color_name, 'bricklink_url'];
        new Array(24).fill(null).map(e => noSalesDetails.push(e))
        allPageData.push(noSalesDetails);
      }

      return allPageData;

    })

    // splice in data that page.evaluate didn't have access to
    details.forEach(a => {
      a.splice(1, 1, part_code)
      a.splice(3, 1, color_code)
      a.splice(5, 1, bricklink_url)
    })

    return details;

  } catch (e) { console.log("scrapePart ERROR: ", e); }
  finally { page.close() }

}


// _____________________________________________________________________________
async function getCategoryCodes(browser) {
  // open new page
  const page = await browser.newPage();
  try {

    // go to page
    await page.goto("https://www.bricklink.com/catalogTree.asp?itemType=P", { waitUntil: "networkidle0" });

    // get all category codes
    const selector = "#id-main-legacy-table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > table > tbody > tr:nth-child(2) a";
    const categoryCodes = await page.$$eval(selector, es => {
      const regex = /catString=(\d+)&/;
      return es.map(e => e.getAttribute("href").match(regex)[1]);
    });

    return categoryCodes;

  } catch (e) { console.log("MY dic6 ERROR: ", e); }
  finally { page.close() }
}

// _____________________________________________________________________________
async function getPartCodes(browser, categoryCode) {
  // open new page
  const page = await browser.newPage();
  try {

    const categoryURL = `https://www.bricklink.com/catalogList.asp?catType=P&catString=${categoryCode}`;

    // go to page
    await page.goto(categoryURL, { waitUntil: "networkidle0" });

    // how many pages are there?
    const pageCountSelector = '#id-main-legacy-table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > div > div.catalog-list__pagination--top.l-clear-left > div:nth-child(2) > b:nth-child(3)';
    const pageCount = await page.$eval(pageCountSelector, e => parseInt(e.innerText));


    // go through each page and add part numbers to parCodes[]
    let partCodes = [];

    for (let i = 1; i < pageCount + 1; i++) {
      const url = categoryURL.replace('?', `?pg=${i}&`)

      await page.goto("about:blank");
      await page.goto(url, { waitUntil: "networkidle0" });

      // grab Color Codes
      const currentPageCodes = await page.$$eval('.catalog-list__body-header ~ tr > td:nth-child(2) a', as => {
        return as.map(a => a.innerText);
      })

      partCodes = partCodes.concat(currentPageCodes);
    }

    // return an array of partUrls
    return partCodes;

  } catch (e) { console.log("MY 9dlc ERROR: ", e); }
  finally { page.close() }
}

// _____________________________________________________________________________
async function getColorCodes(browser, partCode) {
  // open new page
  const page = await browser.newPage();
  try {

    const colorPartUrl = `https://www.bricklink.com/v2/catalog/catalogitem.page?P=${partCode}`;

    // go to page
    await page.goto(colorPartUrl, { waitUntil: "networkidle0" });

    // how many colors are there? - get them from color dropdown list
    const colorCodes = await page.$$eval('#_idColorListAll > .pciSelectColorColorItem', colorDivs => {
      return colorDivs.map(div => div.getAttribute('data-color')).slice(1);
    });

    return colorCodes;

  } catch (e) { console.log("MY SvEk ERROR: ", e); }
  finally { page.close() }
}

