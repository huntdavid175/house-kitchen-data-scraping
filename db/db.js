const { Pool } = require("pg");
require("dotenv").config();
// const logger = require("../utils/logger");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.info("Successfully connected to database");
  release();
});

module.exports = pool;
