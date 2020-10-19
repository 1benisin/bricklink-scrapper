require('dotenv').config()

const linkAddress = 'https://store.bricklink.com/ajax/clone/store/searchitems.ajax?pgSize=100&showHomeItems=0&sid=101626'
const storeHome = 'https://store.bricklink.com/BrickVibe?p=BrickVibe#/shop?o={"pgSize":100,"pg":1,"showHomeItems":0}'

async function getData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

getData('https://example.com/answer', { answer: 42 })