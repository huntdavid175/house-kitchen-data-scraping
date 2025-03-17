const pool = require("../db/db");

const addTool = async (name) => {
  const client = await pool.connect();

  try {
    const checkQuery = "SELECT * FROM cooking_tools WHERE name = $1";
    const checkResult = await client.query(checkQuery, [name]);

    console.log(checkResult.rows.length);
    if (checkResult.rows.length === 0) {
      const insertQuery = `INSERT INTO cooking_tools (name) VALUES ($1) RETURNING *;`;
      const res = await client.query(insertQuery, [name]);
      console.log(`✅ Tool "${name}" added:`, res.rows[0]);
      return { status: "added", data: res.rows[0] };
    } else {
      console.log(`❌ Tool "${name}" already exists`, checkResult.rows[0]);
      return { status: "exists", data: checkResult.rows[0] };
    }
  } catch (err) {
    console.error("Error adding tool", err);
  } finally {
    client.release();
  }
};

const addToolToRecipe = async (recipeId, toolIds) => {
  const client = await pool.connect();

  try {
    for (let toolId of toolIds) {
      const insertQuery = `INSERT INTO recipe_tools (recipe_id, tool_id) VALUES ($1, $2) RETURNING *;`;
      const res = await client.query(insertQuery, [recipeId, toolId]);
      console.log(
        `✅ Tool "${toolId}" added to recipe "${recipeId}":`,
        res.rows[0]
      );
    }
  } catch (err) {
    console.error("Error adding tool to recipe", err);
  } finally {
    client.release();
  }
};

const addTools = async (recipeId, tools) => {
  const toolIds = [];
  for (let tool of tools) {
    const toolId = await addTool(tool);
    toolIds.push(toolId.data.id);
  }

  await addToolToRecipe(recipeId, toolIds);
};

module.exports = {
  addTools,
};
