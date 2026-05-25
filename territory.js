/* REDVYR KINGDOMS — PHASE 6C.1 SMALL HOME SITE */

const territoryBtn = document.getElementById("territoryBtn");
const territoryPanel = document.getElementById("territoryPanel");
const closeTerritoryBtn = document.getElementById("closeTerritoryBtn");
const territoryBody = document.getElementById("territoryBody");
const locationBanner = document.getElementById("locationBanner");

const HOME_TERRITORY_UNLOCK_LEVEL = 5;

/*
  Starter ownership uses actual ground tiles, not large territory chunks.
  The Camp Core begins with a compact 4 x 4 patch around the campfire.
  Later, players can choose connected tiles to expand their own layout.
*/
const HOME_TILE_SIZE = 32;
const STARTER_HOME_TILES_WIDE = 4;
const STARTER_HOME_TILES_HIGH = 4;

function homeTerritoryUnlocked() {
  return Boolean(state.campPlaced && state.campLevel >= HOME_TERRITORY_UNLOCK_LEVEL);
}

function getHomeTerritoryBounds() {
  if (!homeTerritoryUnlocked()) return null;

  const camp = currentCampfire();
  if (!camp) return null;

  const w = HOME_TILE_SIZE * STARTER_HOME_TILES_WIDE;
  const h = HOME_TILE_SIZE * STARTER_HOME_TILES_HIGH;

  const centeredX = camp.x + camp.w / 2 - w / 2;
  const centeredY = camp.y + camp.h / 2 - h / 2;

  let x = Math.round(centeredX / HOME_TILE_SIZE) * HOME_TILE_SIZE;
  let y = Math.round(centeredY / HOME_TILE_SIZE) * HOME_TILE_SIZE;

  x = clamp(x, 0, map.width - w);
  y = clamp(y, 0, map.height - h);

  return { x, y, w, h };
}

function isInsideHomeTerritory(worldX, worldY) {
  const land = getHomeTerritoryBounds();
  return Boolean(
    land &&
    worldX >= land.x &&
    worldX < land.x + land.w &&
    worldY >= land.y &&
    worldY < land.y + land.h
  );
}

function updateTerritoryLocationBanner() {
  if (!locationBanner) return;

  const inside = homeTerritoryUnlocked() && isInsideHomeTerritory(player.x, player.y);
  locationBanner.textContent = inside ? "- Home Territory -" : "- Wilderness -";
  locationBanner.classList.toggle("home-land", inside);
}

/* No visible claim outline for now. Territory is shown through the location name. */
function drawHomeTerritoryBoundary() {}

function updateTerritoryPanel() {
  if (!territoryBody) return;

  if (!state.campPlaced) {
    territoryBody.innerHTML = `
      <div class="territory-status">
        <strong>No Home Established</strong>
        Establish a campfire before territory can be formed.
      </div>
      <div class="territory-rule locked">
        Camp Core unlocks your first home territory.
      </div>
    `;
    return;
  }

  if (!homeTerritoryUnlocked()) {
    territoryBody.innerHTML = `
      <div class="territory-status">
        <strong>Campfire · Level ${state.campLevel}</strong>
        Reach <b>Camp Core · Level 5</b> to secure the land around your home.
      </div>
      <div class="territory-rule locked">
        Territory locked until Camp Core is established.
      </div>
      <div class="territory-map-tag">- Wilderness -</div>
    `;
    return;
  }

  territoryBody.innerHTML = `
    <div class="territory-status">
      <strong>Home Territory Established</strong>
      A small area surrounding your Camp Core is secured.
    </div>
    <div class="territory-rule">
      Expansion will become available as your settlement grows.
    </div>
    <div class="territory-map-tag">- Home Territory -</div>
  `;
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
