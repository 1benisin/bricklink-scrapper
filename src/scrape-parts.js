const puppeteer = require('puppeteer');
const { firestore } = require('./firebase');

// const url = 'https://www.bricklink.com/catalogList.asp?catType=P&catString=45';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);

async function getRows(page) {
  // -- get every row of table
  let rowHandles = await page.$$(`#ItemEditForm > table:nth-child(1) > tbody > tr > td > table > tbody > tr`);
  // remove header row
  rowHandles = rowHandles.slice(1);

  // get desired data from each row and store in results
  const results = [];

  for (const rowH of rowHandles) {
    const thumbnailUrl = await rowH.$eval('span > img', (el) => el.src);

    // create large imageUrl from thumbnailUrl
    let splitUrl = thumbnailUrl.split('/PT/');
    splitUrl = [splitUrl[0], ...splitUrl[1].split('.t1.')];
    const imageUrl = `${splitUrl[0]}/PN/${splitUrl[1]}.${splitUrl[2]}`;

    const partNum = await rowH.$eval('td:nth-child(2) > font > a', (el) => el.innerText);

    const name = await rowH.$eval('td:nth-child(3) > strong', (el) => el.innerText);

    const category = await rowH.$eval('td:nth-child(3) > font > a:nth-child(4)', (el) => el.innerText);

    results.push({ thumbnailUrl, imageUrl, partNum, name, category });
  }

  const batch = firestore.batch();

  for (const result of results) {
    result.timeScraped = Date.now();
    console.log(result);

    const fRef = firestore.collection('bricklink_list_parts').doc(result.partNum);

    batch.set(fRef, result);
  }

  // Commit the batch
  batch
    .commit()
    .then(() => {
      console.log(`firestore Batch Commit Success.`);
    })
    .catch((err) => {
      console.log('firestore commit', err);
    });
}

async function scrapeData(url) {
  const browser = await puppeteer.launch({ headless: false, slowMo: 10 });
  const page = await browser.newPage();
  await page.goto(url);

  // -- click to accept cookies
  await delay(2000);
  await page.click('#js-btn-save > button.btn.btn--white.text--bold.l-border.cookie-notice__btn', {
    delay: rand(10, 500),
  });

  // loop through all pages --total pages 1348
  for (let pageNum = 1; pageNum <= 1; pageNum++) {
    //
    // -- get data from every row
    await getRows(page);

    // click to go to next page
    await Promise.all([
      page.waitForNavigation(),
      page.click('#ItemEditForm > table:nth-child(2) > tbody > tr > td > font > div > a:last-child', {
        delay: rand(10, 500),
      }),
    ]);

    // delay calls
    const waitingLength = rand(20000, 45000);
    console.log(`waiting for ... ${waitingLength / 1000} sec`);
    await delay(waitingLength); // wait 15 to 30 seconds
  }

  await delay(1000);
  browser.close();
}

scrapeData('https://www.bricklink.com/catalogList.asp?pg=1&catType=P');

// const imgThumbnail = 'https://img.bricklink.com/ItemImage/PT/0/spa0021.t1.png';
// const img = 'https://img.bricklink.com/ItemImage/PN/0/spa0021.png';
