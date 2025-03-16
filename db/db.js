const { Pool } = require("pg");

const pool = new Pool({
  user: "fawaz", // replace with your database username
  host: "localhost",
  database: "meal_kit_db", // your database name
  password: "", // replace with your database password
  port: 5432,
});

module.exports = pool;
