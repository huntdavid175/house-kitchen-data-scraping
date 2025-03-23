const puppeteer = require("puppeteer-core");
const { addToCategory } = require("../services/categoryService");
const { addRecipe } = require("../services/recipeService");
const { addCookingSteps } = require("../services/cookingStepService");
const { addTags } = require("../services/tagService");
const { addTools } = require("../services/cookingToolsService");
const { addIngredients } = require("../services/ingredientService");
const { addNutritions } = require("../services/nutritionValuesService");

async function scrapeFoodRecipes() {
  console.log("Starting browser launch...");
  let totalRecipesScraped = 0;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1280x720",
      "--disable-extensions",
      "--disable-default-apps",
      "--mute-audio",
      "--js-flags=--max-old-space-size=460",
    ],
    executablePath: "/usr/bin/google-chrome-stable",
  });

  console.log("Browser launched successfully");

  try {
    const baseUrl = "https://hfresh.info/us-en";
    const startPage = 1;
    const maxPages = 1749;

    for (let currentPage = startPage; currentPage <= maxPages; currentPage++) {
      const page = await browser.newPage();

      // Block unnecessary resources
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const resourceType = request.resourceType();
        if (
          resourceType === "image" ||
          resourceType === "stylesheet" ||
          resourceType === "font"
        ) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // Set smaller viewport
      await page.setViewport({ width: 1280, height: 720 });

      const pageUrl =
        currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`;
      console.log(`Processing page ${currentPage}: ${pageUrl}`);

      try {
        await page.goto(pageUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        await page.waitForSelector(".card", { timeout: 10000 });

        const foodCards = await page.evaluate(() => {
          const cards = document.querySelectorAll(".card");
          return Array.from(cards, (card) => {
            const url = card.querySelector("a")?.href;
            return url || null;
          }).filter((url) => url);
        });

        // Close the listing page to free memory
        await page.close();

        console.log(`Found ${foodCards.length} recipes on page ${currentPage}`);

        // Process recipes one at a time
        for (let i = 0; i < foodCards.length; i++) {
          const url = foodCards[i];
          console.log(`Processing recipe ${i + 1}/${foodCards.length}`);

          try {
            const recipeData = await scrapeFoodRecipePage(browser, url);
            if (!recipeData || recipeData.error) {
              console.log(`Skipping invalid recipe at ${url}`);
              continue;
            }

            await saveRecipeToDatabase(recipeData);
            totalRecipesScraped++;

            // Small delay between recipes
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error processing recipe at ${url}:`, error);
            continue;
          }
        }

        // Every 10 pages, force garbage collection if available
        if (currentPage % 10 === 0) {
          console.log(`Processed ${currentPage} pages. Taking a break...`);
          if (global.gc) {
            global.gc();
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error(`Error processing page ${currentPage}:`, error);
        await page.close();
        continue;
      }
    }
  } finally {
    await browser.close();
    console.log(
      `Scraping completed. Total recipes scraped: ${totalRecipesScraped}`
    );
  }
}

async function saveRecipeToDatabase(recipeData) {
  try {
    const category = await addToCategory(
      recipeData.category,
      recipeData.category
    );
    const recipe = await addRecipe({
      name: recipeData.title,
      subname: recipeData.subtitle,
      description: recipeData.description,
      totalTime: recipeData.totalTime,
      prepTime: recipeData.prepTime,
      difficulty: recipeData.difficulty,
      imageUrl: recipeData.image,
      category_id: category.data.id,
    });

    // Run database operations in parallel
    await Promise.all([
      addCookingSteps(recipeData.steps, recipe.data.id),
      addTags(recipe.data.id, recipeData.tags),
      addTools(recipe.data.id, recipeData.utensils),
      addIngredients(recipe.data.id, recipeData.ingredients),
      addIngredients(recipe.data.id, recipeData.ingredientsNotShipped, false),
      addNutritions(recipeData.nutritionalValues, recipe.data.id),
    ]);

    console.log(`Successfully saved recipe: ${recipeData.title}`);
  } catch (error) {
    throw new Error(`Failed to save recipe: ${error.message}`);
  }
}

async function scrapeFoodRecipePage(browser, url) {
  const page = await browser.newPage();

  try {
    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const resourceType = request.resourceType();
      if (
        resourceType === "image" ||
        resourceType === "stylesheet" ||
        resourceType === "font"
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    const data = await page.evaluate(() => {
      try {
        const breadcrumbs = Array.from(
          document.querySelectorAll('[data-test-id="breadcrumbs-item-text"]')
        ).map((breadcrumb) => {
          const text =
            breadcrumb.querySelector(".NAcgO")?.textContent.trim() || "No text";
          return text;
        });

        const category = breadcrumbs[2];

        const title =
          document.querySelector(".ghBzOL")?.textContent.trim() || "No title";

        const subtitle =
          document.querySelector(".cSYzey")?.textContent.trim() ||
          "No subtitle";

        const description =
          document
            .querySelector(".dvaxob")
            ?.firstElementChild?.textContent.trim() || "No description";

        const image =
          document.querySelector(".gUmaWK")?.querySelector("img")?.src ||
          "No image";

        const totalTime =
          document
            .querySelector(
              '[data-translation-id="recipe-detail.preparation-time"]'
            )
            ?.parentElement?.nextElementSibling?.textContent.trim() ||
          "No total time";

        const prepTime =
          document.querySelector(
            '[data-translation-id="recipe-detail.cooking-time"]'
          )?.parentElement?.nextElementSibling?.textContent || "No prep time";

        const difficulty =
          document.querySelector(
            '[data-translation-id="recipe-detail.difficulty"]'
          )?.parentElement?.nextElementSibling?.textContent || "No difficulty";

        const tags = Array.from(
          document.querySelectorAll(
            '[data-test-id="recipe-description-tag"]'
          ) || []
        ).map((tag) => tag.textContent.trim());

        const allergens = Array.from(
          document.querySelectorAll(
            '[data-test-id="recipe-description-allergen"]'
          ) || []
        ).map((allergen) => allergen.textContent.trim());

        const ingredients = Array.from(
          document.querySelectorAll(
            '[data-test-id="ingredient-item-shipped"]'
          ) || []
        ).map((ingredient) => {
          const image = ingredient.querySelector("img")?.src || "No image";
          const quantity =
            ingredient.querySelector(".ccrEYr")?.textContent || "No quantity";
          const name =
            ingredient.querySelector(".jELdJr")?.textContent || "No name";
          return { name, quantity, image };
        });

        const ingredientsNotShipped = Array.from(
          document.querySelectorAll(
            '[data-test-id="ingredient-item-not-shipped"]'
          ) || []
        ).map((ingredient) => {
          const image = ingredient.querySelector("img")?.src || "No image";
          const quantity =
            ingredient.querySelector(".ccrEYr")?.textContent || "No quantity";
          const name =
            ingredient.querySelector(".jELdJr")?.textContent || "No name";
          return { name, quantity, image };
        });

        const nutritionalValues = Array.from(
          document.querySelectorAll('[data-test-id="nutrition-step"]') || []
        ).map((nutritionalValue) => {
          const nutrition =
            nutritionalValue?.firstElementChild?.textContent || "No nutrition";
          const value =
            nutritionalValue?.lastElementChild?.textContent || "No value";
          return { nutrition, value };
        });

        const fvgovElement = document.querySelector(".fVGovY");
        let utensils = [];
        if (fvgovElement) {
          utensils = Array.from(
            fvgovElement.querySelectorAll(".dvaxob") || []
          ).map((utensil) => utensil.textContent.trim());
        }

        const steps = Array.from(
          document.querySelectorAll('[data-test-id="instruction-step"]') || []
        ).map((step) => {
          const image = step.querySelector("img")?.src || "No image";
          const stepNumber =
            step.querySelector(".kCHgyD")?.textContent || "No step";
          const instruction =
            step.querySelector(".gNOFyU")?.firstElementChild?.textContent ||
            "No name";
          return { stepNumber, instruction, image };
        });

        return {
          category,
          title,
          subtitle,
          description,
          image,
          totalTime,
          prepTime,
          difficulty,
          tags,
          allergens,
          ingredients,
          ingredientsNotShipped,
          nutritionalValues,
          utensils,
          steps,
        };
      } catch (error) {
        return { error: "Error extracting recipe data" };
      }
    });

    await page.close();
    return data;
  } catch (error) {
    await page.close();
    return { error: error.message };
  }
}

module.exports = {
  scrapeFoodRecipes,
};
