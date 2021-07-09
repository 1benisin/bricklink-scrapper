const puppeteer = require('puppeteer');

// const url = 'https://www.bricklink.com/catalogList.asp?catType=P&catString=45';

async function scrapeData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const options = await page.$$eval(`table:nth-child(1) > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > span > img`, (options) =>
  options.map((option) => option.src)
); 
console.log(options);


  // const [el] = await page.$x('//*[@id="ItemEditForm"]/table[1]/tbody/tr/td/table/tbody/tr[2]/td[1]/span/img');
  // const src = await el.getProperty('src');
  // const srcTxt = await src.jsonValue();
  // console.log(srcTxt);

  browser.close();
}

scrapeData('https://www.bricklink.com/catalogList.asp?pg=4&catType=P');

const imgThumbnail = 'https://img.bricklink.com/ItemImage/PT/0/spa0021.t1.png';
const img = 'https://img.bricklink.com/ItemImage/PN/0/spa0021.png';


#ItemEditForm > table:nth-child(1) > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > span > img