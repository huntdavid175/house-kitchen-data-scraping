const puppeteer = require("puppeteer");
const { addToCategory } = require("../services/categoryService");
const { addRecipe } = require("../services/recipeService");
const { addCookingSteps } = require("../services/cookingStepService");
const { addTags } = require("../services/tagService");
const { addTools } = require("../services/cookingToolsService");

async function scrapeFoodRecipes() {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true, // Set to false for debugging
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // Base URL for pagination
  const baseUrl = "https://hfresh.info/us-en";
  let scrapedData = [];

  // Configure pagination limits
  const startPage = 1;
  const maxPages = 2; // Adjust as needed
  const recipesPerPage = 3; // Adjust as needed - set to a small number for testing

  // Helper function to replace waitForTimeout
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Loop through pages using URL parameters
  for (let currentPage = startPage; currentPage <= maxPages; currentPage++) {
    // Construct URL with page parameter
    const pageUrl =
      currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`;
    console.log(`Navigating to page ${currentPage}: ${pageUrl}`);

    // Go to the page
    await page.goto(pageUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for recipe cards to load
    try {
      await page.waitForSelector(".card", { timeout: 10000 });
    } catch (error) {
      console.error(`No cards found on page ${currentPage}:`, error.message);
      continue; // Skip to next page if no cards found
    }

    // Extract recipe URLs from the current page
    const foodCards = await page.evaluate(() => {
      let cardsUrl = [];
      document.querySelectorAll(".card").forEach((card) => {
        let url = card.querySelector("a")?.href || "No URL";
        cardsUrl.push({ url });
      });
      return cardsUrl;
    });

    console.log(`Found ${foodCards.length} recipes on page ${currentPage}`);

    // Process a limited number of recipes per page (for testing)
    for (let i = 0; i < Math.min(recipesPerPage, foodCards.length); i++) {
      const url = foodCards[i];
      console.log(
        `Scraping recipe ${i + 1}/${Math.min(
          recipesPerPage,
          foodCards.length
        )}: ${url.url}`
      );
      const recipeData = await scrapeFoodRecipePage(browser, url.url);
      if (recipeData) scrapedData.push(recipeData);

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

      const steps = await addCookingSteps(recipeData.steps, recipe.data.id);

      const tags = await addTags(recipe.data.id, recipeData.tags);

      const tools = await addTools(recipe.data.id, recipeData.utensils);
    }

    // Optional: Add a small delay between pages to be nice to the server
    await delay(1000);
  }

  await browser.close();
  console.log(
    `Scraping completed. Total recipes scraped: ${scrapedData.length}`
  );
  return scrapedData;
}

async function scrapeFoodRecipePage(browser, url) {
  try {
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Extract recipe details
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

        const ingredientNotShipped = Array.from(
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
          ingredientNotShipped,
          nutritionalValues,
          utensils,
          steps,
        };
      } catch (error) {
        return { error: "Error extracting recipe data" };
      }
    });

    await page.close(); // Close the recipe page when done
    return data;
  } catch (error) {
    console.error(`Error scraping recipe at ${url}:`, error);
    return { error: error.message };
  }
}

module.exports = {
  scrapeFoodRecipes,
};
