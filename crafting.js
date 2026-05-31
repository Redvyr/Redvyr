/* PHASE 5B — CRAFTING FOUNDATION
   Future upgrade path: move this menu behind a placeable Crafting Bench.
*/

const craftingBtn = document.getElementById("craftingBtn");
const craftingPanel = document.getElementById("craftingPanel");
const closeCraftingBtn = document.getElementById("closeCraftingBtn");
const craftingSearch = document.getElementById("craftingSearch");
const craftingCategories = document.getElementById("craftingCategories");
const craftingRecipeGrid = document.getElementById("craftingRecipeGrid");
const craftingRecipeDetails = document.getElementById("craftingRecipeDetails");

let selectedCraftCategory = "all";
let selectedRecipeId = null;

const CRAFTING_MATERIALS = {
  wood: { name: "Wood", image: "wood", count: () => state.wood, spend: (n) => state.wood -= n },
  stone: { name: "Stone", image: "stone", count: () => state.stone, spend: (n) => state.stone -= n },
  rawcopper: { name: "Raw Copper", image: "rawcopper", count: () => state.copperOre, spend: (n) => state.copperOre -= n },
  rawiron: { name: "Raw Iron", image: "rawiron", count: () => state.ironOre, spend: (n) => state.ironOre -= n },
  copper: { name: "Copper", image: "copper", count: () => state.copper, spend: (n) => state.copper -= n },
  iron: { name: "Iron", image: "iron", count: () => state.iron, spend: (n) => state.iron -= n },
  slimegel: { name: "Slime Gel", image: "slimegel", count: () => state.slimeGel, spend: (n) => state.slimeGel -= n },
  mushling: { name: "Mushling", image: "mushling", count: () => state.mushlings, spend: (n) => state.mushlings -= n }
};

const CRAFTING_RECIPES = [
  {
    id: "basic-axe",
    name: "Basic Axe",
    category: "tools",
    image: "axe",
    description: "A simple tool for harvesting trees and bushes.",
    ingredients: { wood: 3, stone: 2 },
    craft: () => createBasicAxe()
  },
  {
    id: "basic-pickaxe",
    name: "Basic Pickaxe",
    category: "tools",
    image: "pickaxe",
    description: "A starter mining tool for stone, copper, and iron.",
    ingredients: { wood: 3, stone: 4, slimegel: 1 },
    craft: () => createBasicPickaxe()
  },
  {
    id: "basic-sword",
    name: "Basic Sword",
    category: "tools",
    image: "sword",
    description: "A refined iron blade for fighting slimes.",
    ingredients: { wood: 2, iron: 2, slimegel: 2 },
    craft: () => createBasicSword()
  },
  {
    id: "furnace",
    name: "Furnace",
    category: "building",
    image: "furnace",
    description: "Place it in the world to smelt raw ore over time and collect it later.",
    ingredients: { stone: 16, copper: 3 },
    craft: () => { state.furnaces += 1; }
  }
];

function openCrafting(sourceObject = null) {
  closeAllGamePanels();
  selectedRecipeId = null;
  craftingPanel.classList.add("no-selection");
  craftingPanel.classList.remove("hidden");
  closeGameMenu();
  updateCraftingPanel();
}

function closeCrafting() {
  if (craftingPanel) craftingPanel.classList.add("hidden");
}

function recipeCanCraft(recipe) {
  return Object.entries(recipe.ingredients).every(([materialKey, amount]) => {
    return CRAFTING_MATERIALS[materialKey].count() >= amount;
  });
}

function spendRecipeMaterials(recipe) {
  Object.entries(recipe.ingredients).forEach(([materialKey, amount]) => {
    CRAFTING_MATERIALS[materialKey].spend(amount);
  });
}

function filteredCraftRecipes() {
  const query = (craftingSearch?.value || "").trim().toLowerCase();

  return CRAFTING_RECIPES.filter((recipe) => {
    const inCategory = selectedCraftCategory === "all" || recipe.category === selectedCraftCategory;
    const matchesSearch = !query || recipe.name.toLowerCase().startsWith(query);
    return inCategory && matchesSearch;
  });
}

function updateCraftingPanel() {
  if (!craftingPanel || craftingPanel.classList.contains("hidden")) return;

  const visibleRecipes = filteredCraftRecipes();
  if (selectedRecipeId && !visibleRecipes.some((recipe) => recipe.id === selectedRecipeId)) {
    selectedRecipeId = null;
  }

  updateCraftingGrid();
  updateCraftingDetails();
}

function updateCraftingGrid() {
  if (!craftingRecipeGrid) return;

  craftingRecipeGrid.innerHTML = "";
  const recipes = filteredCraftRecipes();

  if (recipes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "craft-empty";
    empty.textContent = "No recipes found in this category.";
    craftingRecipeGrid.appendChild(empty);
    return;
  }

  recipes.forEach((recipe) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "craft-recipe" + (selectedRecipeId === recipe.id ? " selected" : "");
    button.title = recipe.name;

    const image = document.createElement("img");
    image.src = images[recipe.image].src;
    image.alt = recipe.name;

    const label = document.createElement("span");
    label.textContent = recipe.name;

    button.appendChild(image);
    button.appendChild(label);
    button.addEventListener("click", () => {
      selectedRecipeId = recipe.id;
      updateCraftingPanel();
    });

    craftingRecipeGrid.appendChild(button);
  });
}

function updateCraftingDetails() {
  if (!craftingRecipeDetails) return;

  const recipe = CRAFTING_RECIPES.find((entry) => entry.id === selectedRecipeId);
  if (!recipe) {
    craftingPanel.classList.add("no-selection");
    craftingRecipeDetails.classList.add("hidden");
    craftingRecipeDetails.innerHTML = "";
    return;
  }

  craftingPanel.classList.remove("no-selection");
  craftingRecipeDetails.classList.remove("hidden");
  craftingRecipeDetails.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "craft-detail-name";
  title.textContent = recipe.name;
  craftingRecipeDetails.appendChild(title);

  const requirements = document.createElement("div");
  requirements.className = "craft-requirements";

  Object.entries(recipe.ingredients).forEach(([materialKey, required]) => {
    const material = CRAFTING_MATERIALS[materialKey];
    const owned = material.count();

    const row = document.createElement("div");
    row.className = "craft-material" + (owned >= required ? " met" : "");

    const icon = document.createElement("img");
    icon.src = images[material.image].src;
    icon.alt = material.name;

    const label = document.createElement("span");
    label.textContent = material.name;

    const count = document.createElement("b");
    count.textContent = owned + "/" + required + (owned >= required ? " ✓" : "");

    row.appendChild(icon);
    row.appendChild(label);
    row.appendChild(count);
    requirements.appendChild(row);
  });

  craftingRecipeDetails.appendChild(requirements);

  const output = document.createElement("div");
  output.className = "craft-output";

  const image = document.createElement("img");
  image.src = images[recipe.image].src;
  image.alt = recipe.name;

  const description = document.createElement("p");
  description.textContent = recipe.description;

  const craftButton = document.createElement("button");
  craftButton.type = "button";
  craftButton.className = "craft-button";
  craftButton.textContent = recipeCanCraft(recipe) ? "Craft" : "Not Enough Materials";
  craftButton.disabled = !recipeCanCraft(recipe);
  craftButton.addEventListener("click", () => craftSelectedRecipe(recipe.id));

  output.appendChild(image);
  output.appendChild(description);
  output.appendChild(craftButton);
  craftingRecipeDetails.appendChild(output);
}

function craftSelectedRecipe(recipeId) {
  const recipe = CRAFTING_RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe || !recipeCanCraft(recipe)) {
    toast("Not enough materials.");
    updateCraftingPanel();
    return;
  }

  spendRecipeMaterials(recipe);
  recipe.craft();
  addXp(6);
  toast("Crafted " + recipe.name + "!");
  addFloatingText(player.x - 12, player.y - 65, "CRAFTED");
  save();
  syncUI();
  updateCraftingPanel();
}

function nearestCraftingBench(maxDistance = 140) {
  const bench = objects
    .filter((obj) => obj.kind === "craftingbench" && !obj.hidden)
    .map((obj) => ({ obj, distance: Math.hypot((obj.x + obj.w / 2) - player.x, (obj.y + obj.h / 2) - player.y) }))
    .sort((a, b) => a.distance - b.distance)[0];

  return bench && bench.distance <= maxDistance ? bench.obj : null;
}

if (craftingBtn) craftingBtn.addEventListener("click", () => {
  toast("Crafting is now done at a placed Crafting Bench. Build your first one from the Campfire.");
  closeGameMenu();
});
if (closeCraftingBtn) closeCraftingBtn.addEventListener("click", closeCrafting);

if (craftingSearch) {
  craftingSearch.addEventListener("input", updateCraftingPanel);
  craftingSearch.addEventListener("focus", () => {
    if (typeof keys !== "undefined") keys.clear();
  });
  craftingSearch.addEventListener("keydown", (event) => {
    // Typing in search should never trigger movement, panels, hotbar, or combat.
    event.stopPropagation();
  });
  craftingSearch.addEventListener("keyup", (event) => event.stopPropagation());
}

if (craftingCategories) {
  craftingCategories.addEventListener("click", (event) => {
    const button = event.target.closest("[data-craft-category]");
    if (!button) return;

    selectedCraftCategory = button.dataset.craftCategory;
    selectedRecipeId = null;
    craftingCategories.querySelectorAll(".craft-category").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    updateCraftingPanel();
  });
}
