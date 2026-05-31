/* PHASE 8A.1 — PLACEABLE FURNACE SMELTING
   Furnace is now a placed workstation:
   - Stand near a Furnace and press E, or use Menu > Smelting while near one.
   - Start a smelt job, walk away, return later, and collect from the furnace menu.
*/

const smeltingBtn = document.getElementById("smeltingBtn");
const smeltingPanel = document.getElementById("smeltingPanel");
const closeSmeltingBtn = document.getElementById("closeSmeltingBtn");
const smeltingRecipes = document.getElementById("smeltingRecipes");

let activeFurnaceId = null;

const FURNACE_SMELT_MS = 7000;

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

function nearestFurnace(maxDistance = 150) {
  const furnace = objects
    .filter((obj) => obj.kind === "furnace" && !obj.hidden)
    .map((obj) => ({ obj, distance: Math.hypot((obj.x + obj.w / 2) - player.x, (obj.y + obj.h / 2) - player.y) }))
    .sort((a, b) => a.distance - b.distance)[0];

  return furnace && furnace.distance <= maxDistance ? furnace.obj : null;
}

function activeFurnaceStructure() {
  if (!activeFurnaceId || typeof getStructureById !== "function") return null;
  const structure = getStructureById(activeFurnaceId);
  return structure && structure.type === "furnace" ? structure : null;
}

function normalizeFurnaceJob(job) {
  if (!job) return null;
  const recipe = SMELTING_RECIPES.find((entry) => entry.id === job.recipeId);
  if (!recipe) return null;

  const startedAt = Number(job.startedAt || Date.now());
  const durationMs = Number(job.durationMs || FURNACE_SMELT_MS);
  const elapsed = Date.now() - startedAt;

  return {
    recipeId: recipe.id,
    startedAt,
    durationMs,
    ready: Boolean(job.ready) || elapsed >= durationMs
  };
}

function openSmelting(furnaceObj = null) {
  const furnace = furnaceObj && furnaceObj.kind === "furnace" ? furnaceObj : nearestFurnace();
  if (!furnace) {
    toast("Place and stand near a Furnace to smelt.");
    closeGameMenu();
    return;
  }

  activeFurnaceId = furnace.structureId;
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

  const furnace = activeFurnaceStructure();
  if (!furnace) {
    smeltingRecipes.innerHTML = `<div class="smelt-empty">No furnace selected. Stand near a Furnace and press E.</div>`;
    return;
  }

  furnace.smeltJob = normalizeFurnaceJob(furnace.smeltJob);
  smeltingRecipes.innerHTML = "";

  const title = document.createElement("div");
  title.className = "furnace-title-row";
  title.innerHTML = `<strong>Selected Furnace</strong><span>${furnace.smeltJob ? "Working" : "Empty"}</span>`;
  smeltingRecipes.appendChild(title);

  if (furnace.smeltJob) {
    const recipe = SMELTING_RECIPES.find((entry) => entry.id === furnace.smeltJob.recipeId);
    const elapsed = Math.max(0, Date.now() - furnace.smeltJob.startedAt);
    const progress = Math.min(1, elapsed / furnace.smeltJob.durationMs);
    const ready = furnace.smeltJob.ready || progress >= 1;
    furnace.smeltJob.ready = ready;

    const card = document.createElement("div");
    card.className = "smelt-card active-job" + (ready ? " ready" : "");

    const flow = document.createElement("div");
    flow.className = "smelt-flow furnace-flow";
    flow.innerHTML = `
      <div class="smelt-item">
        <img src="${images[recipe.inputImage].src}" alt="${recipe.inputName}">
        <span>2 ${recipe.inputName}</span>
      </div>
      <b class="smelt-arrow">→</b>
      <div class="smelt-item output">
        <img src="${images[recipe.outputImage].src}" alt="${recipe.name}">
        <span>1 ${recipe.name}</span>
      </div>
    `;

    const progressWrap = document.createElement("div");
    progressWrap.className = "furnace-progress-wrap";
    progressWrap.innerHTML = `
      <div class="furnace-progress-text">${ready ? "Ready to collect" : "Smelting..."}</div>
      <div class="furnace-progress"><i style="width:${Math.round(progress * 100)}%"></i></div>
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "smelt-button";
    button.disabled = !ready;
    button.textContent = ready ? "Collect" : "Working";
    button.addEventListener("click", collectSmeltedMaterial);

    card.appendChild(flow);
    card.appendChild(progressWrap);
    card.appendChild(button);
    smeltingRecipes.appendChild(card);
    save();
    return;
  }

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
    button.textContent = ready ? "Start" : "Need More Ore";
    button.addEventListener("click", () => startFurnaceSmelt(recipe.id));

    card.appendChild(title);
    card.appendChild(flow);
    card.appendChild(button);
    smeltingRecipes.appendChild(card);
  });
}

function startFurnaceSmelt(recipeId) {
  const furnace = activeFurnaceStructure();
  const recipe = SMELTING_RECIPES.find((entry) => entry.id === recipeId);

  if (!furnace || !recipe) return;
  if (furnace.smeltJob) {
    toast("This furnace is already working.");
    updateSmeltingPanel();
    return;
  }

  if (recipe.inputCount() < 2) {
    toast("Not enough raw ore.");
    updateSmeltingPanel();
    return;
  }

  recipe.spend();
  furnace.smeltJob = {
    recipeId: recipe.id,
    startedAt: Date.now(),
    durationMs: FURNACE_SMELT_MS,
    ready: false
  };

  addXp(3);
  toast("Furnace started: " + recipe.name + ".");
  addFloatingText(player.x - 10, player.y - 55, "SMELTING");
  save();
  syncUI();
  updateSmeltingPanel();
}

function collectSmeltedMaterial() {
  const furnace = activeFurnaceStructure();
  if (!furnace || !furnace.smeltJob) return;

  furnace.smeltJob = normalizeFurnaceJob(furnace.smeltJob);
  if (!furnace.smeltJob.ready) {
    toast("Still smelting.");
    updateSmeltingPanel();
    return;
  }

  const recipe = SMELTING_RECIPES.find((entry) => entry.id === furnace.smeltJob.recipeId);
  if (!recipe) return;

  recipe.give();
  furnace.smeltJob = null;
  addXp(5);
  toast("Collected 1 " + recipe.name + "!");
  addFloatingText(player.x - 10, player.y - 55, recipe.name.toUpperCase());
  save();
  syncUI();
  updateSmeltingPanel();
}

if (smeltingBtn) smeltingBtn.addEventListener("click", () => {
  toast("Smelting is now done at a placed Furnace.");
  closeGameMenu();
});
if (closeSmeltingBtn) closeSmeltingBtn.addEventListener("click", closeSmelting);

setInterval(() => {
  if (smeltingPanel && !smeltingPanel.classList.contains("hidden")) {
    updateSmeltingPanel();
  }
}, 250);
