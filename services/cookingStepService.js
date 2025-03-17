const pool = require("../db/db");

const addCookingStep = async (data, recipeId) => {
  const client = await pool.connect();
  try {
    const insertQuery = `INSERT INTO cooking_steps (step_number, instruction, image_url, recipe_id) VALUES ($1, $2, $3, $4) RETURNING *;`;
    const res = await client.query(insertQuery, [
      data.stepNumber,
      data.instruction,
      data.image,
      recipeId,
    ]);
    console.log(`✅ Cooking step "${data.stepNumber}" added:`, res.rows[0]);
    return { status: "added", data: res.rows[0] };
  } catch (err) {
    console.error("Error adding cooking step", err);
  } finally {
    client.release();
  }
};

const addCookingSteps = async (arrayOfSteps, recipeId) => {
  for (let step of arrayOfSteps) {
    await addCookingStep(step, recipeId);
  }
};

module.exports = {
  addCookingSteps,
};
