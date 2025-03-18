const { Pool } = require("pg");
require("dotenv").config();
// const logger = require("../utils/logger");

let pool;

if (process.env.DATABASE_URL) {
  // Production configuration for Render
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Local development configuration
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
}

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
