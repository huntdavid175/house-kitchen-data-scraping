const puppeteer = require("puppeteer");

async function scrapeFoodRecipes() {
  // Launch browser (headless mode by default)
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Go to Amazon search page
  await page.goto("https://hfresh.info/us-en", {
    waitUntil: "load",
    timeout: 0,
  });

  //   Select food cards elements
  const foodCards = await page.evaluate(() => {
    let cardsUrl = [];
    document.querySelectorAll(".card").forEach((card) => {
      let url = card.querySelector("a")?.href || "No URL";
      cardsUrl.push({ url });
    });
    return cardsUrl;
  });

  let scrapedData = [];

  for (let url of foodCards) {
    console.log(`Scraping: ${url.url}`);
    const recipeData = await scrapeFoodRecipePage(browser, url.url);
    if (recipeData) scrapedData.push(recipeData);
  }

  await browser.close();
  //   console.log("Final Scraped Data:", scrapedData);
  return scrapedData;
}

async function scrapeFoodRecipePage(browser, url) {
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "load",
    timeout: 0,
  });

  //   Extract recipe details

  const data = await page.evaluate(() => {
    const title =
      document.querySelector(".ghBzOL")?.textContent.trim() || "No title";

    const subtitle =
      document.querySelector(".cSYzey")?.textContent.trim() || "No subtitle";

    const description =
      document.querySelector(".dvaxob").firstElementChild?.textContent.trim() ||
      "No description";

    const image =
      document.querySelector(".gUmaWK")?.querySelector("img")?.src ||
      "No image";

    const totalTime =
      document
        .querySelector('[data-translation-id="recipe-detail.preparation-time"]')
        ?.parentElement?.nextElementSibling?.textContent.trim() ||
      "No total time";

    const prepTime =
      document.querySelector(
        '[data-translation-id="recipe-detail.cooking-time"]'
      )?.parentElement?.nextElementSibling?.textContent || "No prep time";

    const difficulty =
      document.querySelector('[data-translation-id="recipe-detail.difficulty"]')
        ?.parentElement?.nextElementSibling?.textContent || "No difficulty";

    const tags = Array.from(
      document.querySelectorAll('[data-test-id="recipe-description-tag"]')
    ).map((tag) => tag.textContent.trim());

    const allergens = Array.from(
      document.querySelectorAll('[data-test-id="recipe-description-allergen"]')
    ).map((tag) => tag.textContent.trim());

    const ingredients = Array.from(
      document.querySelectorAll('[data-test-id="ingredient-item-shipped"]')
    ).map((ingredient) => {
      const image = ingredient.querySelector("img")?.src || "No image";
      const quantity =
        ingredient.querySelector(".ccrEYr")?.textContent || "No quantity";
      const name =
        ingredient.querySelector(".jELdJr")?.textContent || "No name";
      return { name, quantity, image };
    });

    const ingredientNotShipped = Array.from(
      document.querySelectorAll('[data-test-id="ingredient-item-not-shipped"]')
    ).map((ingredient) => {
      const image = ingredient.querySelector("img")?.src || "No image";
      const quantity =
        ingredient.querySelector(".ccrEYr")?.textContent || "No quantity";
      const name =
        ingredient.querySelector(".jELdJr")?.textContent || "No name";
      return { name, quantity, image };
    });

    const nutritionalValues = Array.from(
      document.querySelectorAll('[data-test-id="nutrition-step"]')
    ).map((nutritionalValue) => {
      const nutrition =
        nutritionalValue?.firstElementChild?.textContent || "No nutrition";
      const value =
        nutritionalValue?.lastElementChild?.textContent || "No value";
      return { nutrition, value };
    });

    const fvgovElement = document.querySelector(".fVGovY");
    if (!fvgovElement) return []; // Or return some fallback value

    const utensils = Array.from(fvgovElement.querySelectorAll(".dvaxob")).map(
      (utensil) => utensil.textContent.trim()
    );

    const steps = Array.from(
      document.querySelectorAll('[data-test-id="instruction-step"]')
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
  });

  return data;
}

scrapeFoodRecipes().then((data) => console.dir(data, { depth: null }));
