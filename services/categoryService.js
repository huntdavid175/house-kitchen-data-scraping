const pool = require("../db/db");

const addToCategory = async (name, description) => {
  const client = await pool.connect();

  try {
    const checkQuery = "SELECT * FROM categories WHERE name = $1";
    const checkResult = await client.query(checkQuery, [name]);

    console.log(checkResult.rows.length);
    if (checkResult.rows.length === 0) {
      const insertQuery = `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *;`;
      const res = await client.query(insertQuery, [name, description]);
      console.log(`✅ Category "${name}" added:`, res.rows[0]);
      return { status: "added", data: res.rows[0] };
    } else {
      console.log(`❌ Category "${name}" already exists`, checkResult.rows[0]);
      return { status: "exists", data: checkResult.rows[0] };
    }
  } catch (err) {
    console.error("Error adding category", err);
  } finally {
    client.release();
  }
};

module.exports = {
  addToCategory,
};
