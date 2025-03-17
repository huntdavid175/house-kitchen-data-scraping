const pool = require("../db/db");

const addTag = async (name) => {
  const client = await pool.connect();

  try {
    const checkQuery = "SELECT * FROM tags WHERE name = $1";
    const checkResult = await client.query(checkQuery, [name]);

    console.log(checkResult.rows.length);
    if (checkResult.rows.length === 0) {
      const insertQuery = `INSERT INTO tags (name) VALUES ($1) RETURNING *;`;
      const res = await client.query(insertQuery, [name]);
      console.log(`✅ Tag "${name}" added:`, res.rows[0]);
      return { status: "added", data: res.rows[0] };
    } else {
      console.log(`❌ Tag "${name}" already exists`, checkResult.rows[0]);
      return { status: "exists", data: checkResult.rows[0] };
    }
  } catch (err) {
    console.error("Error adding tag", err);
  } finally {
    client.release();
  }
};

const addTagToRecipe = async (recipeId, tagIds) => {
  const client = await pool.connect();

  try {
    for (let tagId of tagIds) {
      const insertQuery = `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2) RETURNING *;`;
      const res = await client.query(insertQuery, [recipeId, tagId]);
      console.log(
        `✅ Tag "${tagId}" added to recipe "${recipeId}":`,
        res.rows[0]
      );
    }
  } catch (err) {
    console.error("Error adding tag to recipe", err);
  } finally {
    client.release();
  }
};

const addTags = async (recipeId, tags) => {
  const tagIds = [];
  for (let tag of tags) {
    const tagId = await addTag(tag);
    tagIds.push(tagId.data.id);
  }

  await addTagToRecipe(recipeId, tagIds);
};

module.exports = {
  addTags,
};
