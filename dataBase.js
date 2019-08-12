"use strict";

//#region ---------- SETUP ----------

// Application Dependencies
const pg = require('pg');
const fs = require("fs-extra");

// Environment variables
require('dotenv').config();

// Database Setup: if you've got a good DATABASE_URL
if (process.env.DATABASE_URL) {
  var client = new pg.Client(process.env.DATABASE_URL);
  client.connect();
  client.on('error', err => console.error(err));
}

//#endregion SETUP

// __________________
(async () => {
  try {

    await removeCategory('Bar')

    // const SQL = 'SELECT listed_used_total_qty FROM part;'

    // let result = await client.query(SQL);
    // result = result.rows
    //   .map(e => e.listed_used_total_qty)
    //   .filter(e => e !== null)
    //   .reduce((acc, v) => { return acc + parseInt(v) }, 0)

    // result = Math.round(result)
    // result = [1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((acc, v) => { return acc + v }, 0)
    // console.log("RESULT", result)
    process.exit(0)

  } catch (e) { console.log("MY INIT ERROR: ", e) }

})()

//#region ---------- DATABASE QUERIES ----------

async function removeCategory(category) {
  const SQL = 'DELETE FROM part WHERE category_name = $1;'
  const values = [category]
  let result = await client.query(SQL, values);
  result = result.rows
  console.log("DELETE", result)
}



//#endregion SETUP

//#region ---------- CSV FUNCTIONS ----------
//#endregion SETUP