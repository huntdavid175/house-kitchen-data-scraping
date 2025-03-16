const pool = require("../db/db");

const addRecipe = async (data) => {
  const client = await pool.connect();
  try {
    const checkQuery = "SELECT * FROM recipes WHERE name = $1";
    const checkResult = await client.query(checkQuery, [data.name]);

    if (checkResult.rows.length === 0) {
      const insertQuery = `INSERT INTO recipes (name, subname, description, total_time, cooking_time, difficulty, image_url, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`;
      const res = await client.query(insertQuery, [
        data.name,
        data.subname,
        data.description,
        data.totalTime,
        data.prepTime,
        data.difficulty,
        data.imageUrl,
        data.category_id,
      ]);
      console.log(`✅ Recipe "${data.name}" added:`, res.rows[0]);
      return { status: "added", data: res.rows[0] };
    } else {
      console.log(
        `❌ Recipe "${data.name}" already exists`,
        checkResult.rows[0]
      );
      return { status: "exists", data: checkResult.rows[0] };
    }
  } catch (err) {
    console.error("Error adding recipe", err);
  } finally {
    client.release();
  }
};

module.exports = {
  addRecipe,
};
