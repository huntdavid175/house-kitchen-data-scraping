const { scrapeFoodRecipes } = require("./scraper/scraper");
const pool = require("./db/db");
const { initializeDatabase } = require("./db/db-init");

const init = async () => {
  await initializeDatabase();
  await scrapeFoodRecipes();
  await pool.end();
  console.log("Database connection closed");
};

init();

// scrapeFoodRecipes()
//   //   .then((data) => console.dir(data, { depth: null }))
//   .then(() => pool.end())
//   .then(() => console.log("Database connection closed"));
