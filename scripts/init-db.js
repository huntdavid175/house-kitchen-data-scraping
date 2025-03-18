require("dotenv").config();
const { initializeDatabase } = require("../db/init");

const init = async () => {
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
};

init();
