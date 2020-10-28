require('dotenv').config()
const fetch = require('node-fetch')
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const puppeteer = require('puppeteer')

const store = 
  // {name: 'DadsAFOL', id: 146360}
  { name: 'BrickVibe', id: 101626}

const linkProducts = `https://store.bricklink.com/ajax/clone/store/searchitems.ajax?pgSize=100&pg=1&showHomeItems=0&sid=${store.id}`
const linkStore = `https://store.bricklink.com/${store.name}?p=${store.name}#/shop?o={"pgSize":100,"pg":1,"showHomeItems":0}`
const proxyProducts = `http://api.scrapestack.com/scrape?access_key=${process.env.SCRAPESTACK_KEY}&url=${linkProducts}&proxy_location=us`
const proxyStore = `http://api.scrapestack.com/scrape?access_key=${process.env.SCRAPESTACK_KEY}&proxy_location=us&url=${linkStore}`
const testLink = `http://api.scrapestack.com/scrape?access_key=${process.env.SCRAPESTACK_KEY}&url=https://thedecalguru.com/`;
console.log("proxyStore", proxyStore);  
console.log("proxyProducts", proxyProducts);  

  // (async () => {
  //   const browser = await puppeteer.launch({ headless: false, slowMo: 500 })
  //   const page = await browser.newPage()
  //   await page.goto(proxyStore)
  //   const pCountSelector = '#storeApp > div > div.store-content.store-content-margin > div.store-view-panel.in-menu > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > nav > ul > li:nth-child(6) > a'
  //   await page.waitForSelector(pCountSelector)
  //   await page.screenshot({ path: 'example.png' })

  //   const pCountXPath = '//*[@id="storeApp"]/div/div[3]/div[2]/div[2]/div[2]/div[2]/div/nav/ul/li[6]/a'
  //   // document.querySelector("#storeApp > div > div.store-content.store-content-margin > div.store-view-panel.in-menu > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > nav > ul > li:nth-child(6) > a")

  //   const testEl = await page.evaluate(() => {
  //     return document.querySelector('#storeApp > div > div.store-content.store-content-margin > div.store-view-panel.in-menu > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > nav > ul > li:nth-child(6) > a')
  //       .innerText
  //   })
  //   console.log(testEl)

  //   await browser.close()
  // })()

const fetchData = async () => {
  try {
    const response = await fetch(proxyProducts)
    const resData = await response.json()
    return resData
  } catch (err) {
    console.log(err)
  }
}

(async () => {

  // for (let i = 1; i > 0; i++) {
  //   console.log(i);

  //   // - fetch data
  //   const resData = await fetchData()

  //   // check if page exists. if not stop scraping
  //   if (resData.returnCode == -1) break;
    
  // }

  const resData = await fetchData()
  console.log(resData)
  const data = resData.result.groups[0].items

  // -- get headers
  let headers = []
  const keys = Object.keys(data[0]);
  keys.forEach(k => {
    headers.push({ id: k, title: k })
  });
  console.log(headers)

  // -- write headers
  const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: headers
  });

  // -- write file
  await csvWriter.writeRecords(data)
  console.log('The CSV1 file was written successfully');
  await csvWriter.writeRecords(data)
  console.log('The CSV2 file was written successfully');

})()
