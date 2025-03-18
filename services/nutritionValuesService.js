const pool = require("../db/db");

const addNutrition = async (data, recipeId) => {
  const client = await pool.connect();
  try {
    const insertQuery = `INSERT INTO recipe_nutritions (nutrition, value, recipe_id) VALUES ($1, $2, $3) RETURNING *;`;
    const res = await client.query(insertQuery, [
      data.nutrition,
      data.value,
      recipeId,
    ]);
    console.log(`✅ Nutrition"${data.nutrition}" added:`, res.rows[0]);
    return { status: "added", data: res.rows[0] };
  } catch (err) {
    console.error("Error adding nutrition", err);
  } finally {
    client.release();
  }
};

const addNutritions = async (nutritions, recipeId) => {
  for (let nutrition of nutritions) {
    await addNutrition(nutrition, recipeId);
  }
};

module.exports = {
  addNutritions,
};
