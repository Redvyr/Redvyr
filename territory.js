/* REDVYR KINGDOMS — PHASE 6C HOME TERRITORY */
const territoryBtn = document.getElementById("territoryBtn");
const territoryPanel = document.getElementById("territoryPanel");
const closeTerritoryBtn = document.getElementById("closeTerritoryBtn");
const territoryBody = document.getElementById("territoryBody");
const locationBanner = document.getElementById("locationBanner");

const HOME_TERRITORY_UNLOCK_LEVEL = 5;
const HOME_PLOT_SIZE = 128;
const HOME_PLOTS_WIDE = 4;
const HOME_PLOTS_HIGH = 4;

function homeTerritoryUnlocked() {
  return Boolean(state.campPlaced && state.campLevel >= HOME_TERRITORY_UNLOCK_LEVEL);
}

function getHomeTerritoryBounds() {
  if (!homeTerritoryUnlocked()) return null;
  const camp = currentCampfire();
  if (!camp) return null;

  const w = HOME_PLOT_SIZE * HOME_PLOTS_WIDE;
  const h = HOME_PLOT_SIZE * HOME_PLOTS_HIGH;
  let x = Math.floor((camp.x + camp.w / 2 - w / 2) / HOME_PLOT_SIZE) * HOME_PLOT_SIZE;
  let y = Math.floor((camp.y + camp.h / 2 - h / 2) / HOME_PLOT_SIZE) * HOME_PLOT_SIZE;
  x = clamp(x, 0, map.width - w);
  y = clamp(y, 0, map.height - h);
  return { x, y, w, h };
}

function isInsideHomeTerritory(worldX, worldY) {
  const land = getHomeTerritoryBounds();
  return Boolean(land &&
    worldX >= land.x && worldX < land.x + land.w &&
    worldY >= land.y && worldY < land.y + land.h);
}

function updateTerritoryLocationBanner() {
  if (!locationBanner) return;
  const inside = homeTerritoryUnlocked() && isInsideHomeTerritory(player.x, player.y);
  locationBanner.textContent = inside ? "- Home Territory -" : "- Wilderness -";
  locationBanner.classList.toggle("home-land", inside);
}

function drawHomeTerritoryBoundary() {
  const land = getHomeTerritoryBounds();
  if (!land) return;

  ctx.save();
  ctx.fillStyle = "rgba(242,195,95,0.025)";
  ctx.fillRect(land.x, land.y, land.w, land.h);
  ctx.strokeStyle = "rgba(242,195,95,0.34)";
  ctx.lineWidth = 3;
  ctx.setLineDash([13, 11]);
  ctx.strokeRect(land.x + 2, land.y + 2, land.w - 4, land.h - 4);

  ctx.strokeStyle = "rgba(242,195,95,0.10)";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 10]);
  for (let i = 1; i < HOME_PLOTS_WIDE; i++) {
    ctx.beginPath();
    ctx.moveTo(land.x + i * HOME_PLOT_SIZE, land.y);
    ctx.lineTo(land.x + i * HOME_PLOT_SIZE, land.y + land.h);
    ctx.stroke();
  }
  for (let i = 1; i < HOME_PLOTS_HIGH; i++) {
    ctx.beginPath();
    ctx.moveTo(land.x, land.y + i * HOME_PLOT_SIZE);
    ctx.lineTo(land.x + land.w, land.y + i * HOME_PLOT_SIZE);
    ctx.stroke();
  }
  ctx.restore();
}

function updateTerritoryPanel() {
  if (!territoryBody) return;

  if (!state.campPlaced) {
    territoryBody.innerHTML = `
      <div class="territory-status"><strong>No Home Established</strong>Establish a campfire before territory can be formed.</div>
      <div class="territory-rule locked">Camp Core unlocks your first home territory.</div>`;
    return;
  }

  if (!homeTerritoryUnlocked()) {
    territoryBody.innerHTML = `
      <div class="territory-status"><strong>Campfire · Level ${state.campLevel}</strong>Reach <b>Camp Core · Level 5</b> to establish your first territory.</div>
      <div class="territory-rule locked">Territory locked · Upgrade your home to claim 16 connected plots.</div>
      <div class="territory-map-tag">- Wilderness -</div>`;
    return;
  }

  territoryBody.innerHTML = `
    <div class="territory-status"><strong>Home Territory Established</strong>Your Camp Core protects <b>16 connected plots</b> around your home.</div>
    <div class="territory-rule">Future village and kingdom upgrades will unlock expansion, members, structures, and upkeep.</div>
    <div class="territory-map-tag">- Home Territory -</div>`;
}

function openTerritory() {
  if (!territoryPanel) return;
  closeAllGamePanels();
  updateTerritoryPanel();
  territoryPanel.classList.remove("hidden");
}

function closeTerritory() {
  if (territoryPanel) territoryPanel.classList.add("hidden");
}

if (territoryBtn) territoryBtn.addEventListener("click", openTerritory);
if (closeTerritoryBtn) closeTerritoryBtn.addEventListener("click", closeTerritory);
