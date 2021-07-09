/* eslint-disable for-direction */
require('dotenv').config();
const fetch = require('node-fetch');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const puppeteer = require('puppeteer');

const RANDOM_DELAY_BETWEEN_FETCH_CALLS = 12000; // sets how slow to scape site in ms
const DESIRED_VALUES = ['itemName', 'invQty', 'itemType', 'invNew', 'colorID', 'colorName', 'itemNo', 'rawConvertedPrice', 'timeStamp', 'storeID', 'storeName', 'storePage'];
const stores = [
  { name: 'BrickVibe', id: 101626 },
  {name: 'DadsAFOL', id: 146360}, 
  {name: 'bigasbricks', id: 563651}, 
  {name: 'DadsAFOL', id: 146360}, 
  {name: 'pdx1rdr', id: 31971}, 
  { name: 'amyfol', id: 431758}
]
let curStore = 2

let linkProducts = `https://store.bricklink.com/ajax/clone/store/searchitems.ajax?pgSize=100&pg=1&showHomeItems=0&sid=${stores[curStore].id}`;
let linkStore = `https://store.bricklink.com/${stores[curStore].name}?p=${stores[curStore].name}#/shop?o={"pgSize":100,"pg":1,"showHomeItems":0}`;
const proxyProducts = `http://api.scrapestack.com/scrape?access_key=${process.env.SCRAPESTACK_KEY}&url=${linkProducts}&proxy_location=us`;
const proxyStore = `http://api.scrapestack.com/scrape?access_key=${process.env.SCRAPESTACK_KEY}&proxy_location=us&url=${linkStore}`;
const testLink = `http://api.scrapestack.com/scrape?access_key=${process.env.SCRAPESTACK_KEY}&url=https://store.bricklink.com`;

console.log('\x1b[33m%s\x1b[37m', 'proxyStore', proxyStore);
console.log('\x1b[33m%s\x1b[37m', 'proxyProducts', proxyProducts);
console.log('_____________________________________________________________');

// (async () => {
//   const browser = await puppeteer.launch({ headless: false, slowMo: 500 })
//   const page = await browser.newPage()
//   await page.goto(linkProducts)
//   // const pCountSelector = '#storeApp > div > div.store-content.store-content-margin > div.store-view-panel.in-menu > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > nav > ul > li:nth-child(6) > a'
//   // await page.waitForSelector(pCountSelector)
//   // await page.screenshot({ path: 'example.png' })

//   // const pCountXPath = '//*[@id="storeApp"]/div/div[3]/div[2]/div[2]/div[2]/div[2]/div/nav/ul/li[6]/a'
//   // // document.querySelector("#storeApp > div > div.store-content.store-content-margin > div.store-view-panel.in-menu > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > nav > ul > li:nth-child(6) > a")

//   // const testEl = await page.evaluate(() => {
//   //   return document.querySelector('#storeApp > div > div.store-content.store-content-margin > div.store-view-panel.in-menu > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > nav > ul > li:nth-child(6) > a')
//   //     .innerText
//   // })
//   // console.log(testEl)

//   // await browser.close()
// })()

const fetchData = async (storeId, page = 1) => {
  const link = `https://store.bricklink.com/ajax/clone/store/searchitems.ajax?pgSize=100&pg=${page}&showHomeItems=0&sid=${storeId}`;
  console.log('fetching page...', page, ' of store: ',storeId);

  try {
    const response = await fetch(link);
    const resData = await response.json();
    const results = resData.result.groups[0].items.map(item => {
      item.timeStamp = Date.now();
      item.storeID = storeId;
      item.storeName = stores.find(s => s.id == storeId).name;
      item.storePage = page;
      return item;
    })

    return results;
  } catch (err) {
    console.log(err);
  }
};

const scrapeStore = async () => {
  // -- create CSV Headers
  const headers = DESIRED_VALUES.map(dv => ({ id: dv, title: dv }));
  console.log(headers);

  const csvWriter = createCsvWriter({
    path: `scraped-data/${stores[curStore].id}-${Date.now()}.csv`,
    header: headers,
  });

// fetch data 
  const data = await fetchData(stores[curStore].id);
  

  await csvWriter.writeRecords(data);
  console.log('CSV-1 written successfully');

  // fetch page until no more pages
  for (let i = 2; i > 0; i++) {
    await waitUpTo(RANDOM_DELAY_BETWEEN_FETCH_CALLS);

    // - fetch data
    const newData = await fetchData(stores[curStore].id, i);

    // check if page exists. if not stop scraping
    if (newData.length == 0) break;

    await csvWriter.writeRecords(newData);
    console.log(`CSV-${i} written successfully`);
  }
};

// -------- HELPERS
async function waitUpTo(ms) {
  const randTime = Math.floor(Math.random() * Math.floor(ms));
  console.log(`waiting for ${randTime/1000} seconds...`);
  return new Promise((resolve) => {
    setTimeout(resolve, randTime);
  });
}

(async () => {

  for (let index = 0; index < stores.length; index++) {
    curStore = index;
    await scrapeStore();   
    
  }

})();