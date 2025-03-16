const { scrapeFoodRecipes } = require("./scraper/scraper");
const pool = require("./db/db");

scrapeFoodRecipes()
  //   .then((data) => console.dir(data, { depth: null }))
  .then(() => pool.end())
  .then(() => console.log("Database connection closed"));
