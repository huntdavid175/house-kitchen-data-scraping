const { Pool } = require("pg");

const pool = new Pool({
  user: "fawaz", // replace with your database username
  host: "localhost",
  database: "meal_kit_db", // your database name
  password: "", // replace with your database password
  port: 5432,
});

pool.on("connect", () => {
  console.log("connected to the database");
});

pool.on("error", (err) => {
  console.log("error connecting to the database", err);
});

module.exports = pool;
