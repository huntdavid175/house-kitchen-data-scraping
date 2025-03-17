const pool = require("../db/db");

const addIngredient = async (ingredient) => {
  const client = await pool.connect();

  try {
    const checkQuery = "SELECT * FROM ingredients WHERE name = $1";
    const checkResult = await client.query(checkQuery, [ingredient.name]);

    console.log(checkResult.rows.length);
    if (checkResult.rows.length === 0) {
      const insertQuery = `INSERT INTO ingredients (name, image_url) VALUES ($1, $2) RETURNING *;`;
      const res = await client.query(insertQuery, [
        ingredient.name,
        ingredient.image,
      ]);
      console.log(`✅ Ingredient "${ingredient.name}" added:`, res.rows[0]);
      return { status: "added", data: res.rows[0] };
    } else {
      console.log(
        `❌ Ingredient "${ingredient.name}" already exists`,
        checkResult.rows[0]
      );
      return { status: "exists", data: checkResult.rows[0] };
    }
  } catch (err) {
    console.error("Error adding ingredient", err);
  } finally {
    client.release();
  }
};

const addIngredientToRecipe = async (recipeId, ingredientsData) => {
  const client = await pool.connect();

  try {
    for (let ingredientData of ingredientsData) {
      const insertQuery = `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *;`;
      const res = await client.query(insertQuery, [
        recipeId,
        ingredientData.id,
        ingredientData.quantity,
        ingredientData.unit,
      ]);
      console.log(
        `✅ Ingredient "${ingredientData.id}" added to recipe "${recipeId}":`,
        res.rows[0]
      );
    }
  } catch (err) {
    console.error("Error adding ingredient to recipe", err);
  } finally {
    client.release();
  }
};

const addIngredients = async (recipeId, ingredients) => {
  const ingredientsData = [];
  for (let ingredient of ingredients) {
    const [ingredientQuantity, ingredientUnit] = ingredient.quantity.split(" ");
    const ingredientId = await addIngredient(ingredient);
    ingredientsData.push({
      ...ingredientId.data,
      quantity: ingredientQuantity,
      unit: ingredientUnit,
    });
  }

  await addIngredientToRecipe(recipeId, ingredientsData);
};

module.exports = {
  addIngredients,
};
