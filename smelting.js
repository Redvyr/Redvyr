/* PHASE 6B — SMELTING FOUNDATION
   Temporary Menu access. Later this system can move behind a placed Furnace.
*/

const smeltingBtn = document.getElementById("smeltingBtn");
const smeltingPanel = document.getElementById("smeltingPanel");
const closeSmeltingBtn = document.getElementById("closeSmeltingBtn");
const smeltingRecipes = document.getElementById("smeltingRecipes");

const SMELTING_RECIPES = [
  {
    id: "copper",
    name: "Copper",
    inputName: "Raw Copper",
    inputImage: "rawcopper",
    outputImage: "copper",
    inputCount: () => state.copperOre,
    spend: () => state.copperOre -= 2,
    give: () => state.copper += 1
  },
  {
    id: "iron",
    name: "Iron",
    inputName: "Raw Iron",
    inputImage: "rawiron",
    outputImage: "iron",
    inputCount: () => state.ironOre,
    spend: () => state.ironOre -= 2,
    give: () => state.iron += 1
  }
];

function openSmelting() {
  closeAllGamePanels();
  smeltingPanel.classList.remove("hidden");
  closeGameMenu();
  updateSmeltingPanel();
}

function closeSmelting() {
  if (smeltingPanel) smeltingPanel.classList.add("hidden");
}

function updateSmeltingPanel() {
  if (!smeltingPanel || smeltingPanel.classList.contains("hidden") || !smeltingRecipes) return;

  smeltingRecipes.innerHTML = "";

  SMELTING_RECIPES.forEach((recipe) => {
    const owned = recipe.inputCount();
    const ready = owned >= 2;

    const card = document.createElement("div");
    card.className = "smelt-card" + (ready ? " ready" : "");

    const flow = document.createElement("div");
    flow.className = "smelt-flow";
    flow.innerHTML = `
      <div class="smelt-item">
        <img src="${images[recipe.inputImage].src}" alt="${recipe.inputName}">
        <span>${owned}/2 ${recipe.inputName}</span>
      </div>
      <b class="smelt-arrow">→</b>
      <div class="smelt-item output">
        <img src="${images[recipe.outputImage].src}" alt="${recipe.name}">
        <span>1 ${recipe.name}</span>
      </div>
    `;

    const title = document.createElement("strong");
    title.className = "smelt-title";
    title.textContent = recipe.name;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "smelt-button";
    button.disabled = !ready;
    button.textContent = ready ? "Smelt" : "Need More Ore";
    button.addEventListener("click", () => smeltMaterial(recipe.id));

    card.appendChild(title);
    card.appendChild(flow);
    card.appendChild(button);
    smeltingRecipes.appendChild(card);
  });
}

function smeltMaterial(recipeId) {
  const recipe = SMELTING_RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe || recipe.inputCount() < 2) {
    toast("Not enough raw ore.");
    updateSmeltingPanel();
    return;
  }

  recipe.spend();
  recipe.give();
  addXp(5);
  toast("Smelted 1 " + recipe.name + "!");
  addFloatingText(player.x - 10, player.y - 55, recipe.name.toUpperCase());
  save();
  syncUI();
  updateSmeltingPanel();
}

if (smeltingBtn) smeltingBtn.addEventListener("click", openSmelting);
if (closeSmeltingBtn) closeSmeltingBtn.addEventListener("click", closeSmelting);
