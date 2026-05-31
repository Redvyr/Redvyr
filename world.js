/* WORLD */

/* PHASE 6A — PLACEABLE HOME CAMPFIRE */
const CAMP_PLACEMENT_SNAP = 16;
const campPlacementCanvas = document.getElementById("game");
const campPlacementConfirmButton = document.getElementById("confirmCampPlacementBtn");
const campPlacementRetryButton = document.getElementById("retryCampPlacementBtn");
const campPlacementState = {
  active: false,
  confirming: false,
  relocating: false,
  targetX: 400,
  targetY: 320,
  previewX: 400,
  previewY: 320,
  valid: false
};

/* PHASE 8A.1 — PLACEABLE CRAFTING BENCH + FURNACE */
const STRUCTURE_PLACEMENT_SNAP = 16;

/* PHASE 8C.2 — CAMP BUILD RADIUS */
const CAMP_BUILD_RADIUS_TILES = 18;
const CAMP_BUILD_RADIUS = CAMP_BUILD_RADIUS_TILES * 32;
const structurePlacementState = {
  active: false,
  type: null,
  slotIndex: null,
  targetX: 400,
  targetY: 320,
  previewX: 400,
  previewY: 320,
  valid: false
};

function structureLabel(type) {
  if (type === "furnace") return "Furnace";
  if (type === "storagechest") return "Storage Chest";
  return "Crafting Bench";
}

function structureSize(type) {
  if (type === "furnace") return { w: 64, h: 64 };
  if (type === "storagechest") return { w: 64, h: 58 };
  return { w: 70, h: 58 };
}

function ensureStructureState() {
  if (!Array.isArray(state.structures)) state.structures = [];
  state.structures = state.structures.filter((structure) =>
    structure && (structure.type === "craftingbench" || structure.type === "furnace" || structure.type === "storagechest")
  );
}

function createStructureId(type) {
  state.nextItemId = Math.max(1, Number(state.nextItemId || 1));
  const id = type + "-" + state.nextItemId;
  state.nextItemId += 1;
  return id;
}

function getStructureById(id) {
  ensureStructureState();
  return state.structures.find((structure) => structure.id === id) || null;
}

function makeStructureObject(structure) {
  const size = structureSize(structure.type);
  return {
    x: structure.x,
    y: structure.y,
    w: size.w,
    h: size.h,
    kind: structure.type,
    interact: true,
    label: structure.type === "furnace" ? "use furnace" : structure.type === "storagechest" ? "open storage chest" : "use crafting bench",
    action: structure.type,
    structureId: structure.id
  };
}

function restorePlacedStructures() {
  ensureStructureState();
  for (const structure of state.structures) {
    objects.push(makeStructureObject(structure));
  }
}

function isStructurePlacementActive() {
  return structurePlacementState.active;
}

function beginStructurePlacement(type, slotIndex = null) {
  if (gameScreen.classList.contains("hidden")) return;
  if (type !== "craftingbench" && type !== "furnace" && type !== "storagechest") return;
  if (type === "craftingbench" && state.craftingBenches <= 0) return;
  if (type === "furnace" && state.furnaces <= 0) return;
  if (type === "storagechest" && state.storageChests <= 0) return;

  closeAllGamePanels();
  closeNpcDialogue();
  closeBuyPanel();
  closeSellPanel();

  const size = structureSize(type);
  const startX = Math.round((player.x + 54) / STRUCTURE_PLACEMENT_SNAP) * STRUCTURE_PLACEMENT_SNAP;
  const startY = Math.round((player.y + 34) / STRUCTURE_PLACEMENT_SNAP) * STRUCTURE_PLACEMENT_SNAP;

  structurePlacementState.active = true;
  structurePlacementState.type = type;
  structurePlacementState.slotIndex = slotIndex;
  structurePlacementState.targetX = clamp(startX, 32, map.width - size.w - 32);
  structurePlacementState.targetY = clamp(startY, 32, map.height - size.h - 32);
  structurePlacementState.previewX = structurePlacementState.targetX;
  structurePlacementState.previewY = structurePlacementState.targetY;
  structurePlacementState.valid = canPlaceStructureAt(type, structurePlacementState.previewX, structurePlacementState.previewY);

  toast("Place your " + structureLabel(type) + ". Click a clear spot.");
}

function endStructurePlacement() {
  structurePlacementState.active = false;
  structurePlacementState.type = null;
  structurePlacementState.slotIndex = null;
}

function structurePlacementBox(type, x, y) {
  const size = structureSize(type);
  return {
    x: x + 8,
    y: y + 12,
    w: size.w - 16,
    h: size.h - 18
  };
}

function campBuildCenter() {
  const camp = currentCampfire();
  if (!camp) return null;
  return { x: camp.x + camp.w / 2, y: camp.y + camp.h / 2 };
}

function isInsideCampBuildRadius(worldX, worldY) {
  const center = campBuildCenter();
  if (!center) return false;
  return Math.hypot(worldX - center.x, worldY - center.y) <= CAMP_BUILD_RADIUS;
}

function structurePlacementStatus(type, x, y) {
  const box = structurePlacementBox(type, x, y);
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;

  if (!state.campPlaced || !currentCampfire()) {
    return { ok: false, reason: "Place your Camp Core first." };
  }

  if (!isInsideCampBuildRadius(centerX, centerY)) {
    return { ok: false, reason: "Build closer to your camp." };
  }

  return { ok: true, reason: "" };
}

function canPlaceStructureAt(type, x, y) {
  const size = structureSize(type);
  const box = structurePlacementBox(type, x, y);
  if (x < 32 || y < 32 || x + size.w > map.width - 32 || y + size.h > map.height - 32) return false;
  if (typeof boxTouchesWater === "function" && boxTouchesWater(box)) return false;

  const campStatus = structurePlacementStatus(type, x, y);
  if (!campStatus.ok) return false;

  for (const obj of objects) {
    if (obj.hidden) continue;
    if (obj.kind === "slime" || obj.kind === "slimegel" || obj.kind === "droppedloot" || obj.kind === "droppedaxe" || obj.kind === "droppedpickaxe" || obj.kind === "droppedsword") continue;

    const padding = obj.kind === "tree" || obj.kind === "largetree" ? 12 : obj.kind === "npc" ? 34 : 10;
    const blocked = { x: obj.x - padding, y: obj.y - padding, w: obj.w + padding * 2, h: obj.h + padding * 2 };
    if (overlap(box, blocked)) return false;
  }

  return true;
}

function updateStructurePlacementPreview() {
  if (!structurePlacementState.active) return;

  const stepX = clamp(structurePlacementState.targetX - structurePlacementState.previewX, -STRUCTURE_PLACEMENT_SNAP, STRUCTURE_PLACEMENT_SNAP);
  const stepY = clamp(structurePlacementState.targetY - structurePlacementState.previewY, -STRUCTURE_PLACEMENT_SNAP, STRUCTURE_PLACEMENT_SNAP);
  structurePlacementState.previewX += stepX;
  structurePlacementState.previewY += stepY;
  structurePlacementState.valid = canPlaceStructureAt(structurePlacementState.type, structurePlacementState.previewX, structurePlacementState.previewY);
}

function confirmStructurePlacement() {
  if (!structurePlacementState.active || !structurePlacementState.valid) return;

  const type = structurePlacementState.type;
  if (type === "craftingbench" && state.craftingBenches <= 0) return;
  if (type === "furnace" && state.furnaces <= 0) return;
  if (type === "storagechest" && state.storageChests <= 0) return;

  if (type === "craftingbench") state.craftingBenches -= 1;
  if (type === "furnace") state.furnaces -= 1;
  if (type === "storagechest") state.storageChests -= 1;

  const structure = {
    id: createStructureId(type),
    type,
    x: structurePlacementState.previewX,
    y: structurePlacementState.previewY,
    smeltJob: null,
    slots: type === "storagechest" ? emptyStorageSlots(18) : undefined,
    owner: state.name,
    kingdomId: null,
    accessMode: "wilderness-public"
  };

  ensureStructureState();
  state.structures.push(structure);
  objects.push(makeStructureObject(structure));

  if (Number.isInteger(structurePlacementState.slotIndex) && state.hotbar[structurePlacementState.slotIndex] === type) {
    if ((type === "craftingbench" && state.craftingBenches <= 0) || (type === "furnace" && state.furnaces <= 0) || (type === "storagechest" && state.storageChests <= 0)) {
      state.hotbar[structurePlacementState.slotIndex] = null;
    }
  }

  endStructurePlacement();
  addFloatingText(structure.x, structure.y - 10, structureLabel(type).toUpperCase());
  toast(structureLabel(type) + " placed.");
  save();
  syncUI();
}


function scatterStorageChestContents(structure, obj) {
  if (structure.type !== "storagechest" || !Array.isArray(structure.slots)) return 0;

  let dropped = 0;
  structure.slots.forEach((slot, index) => {
    if (!slot) return;
    const angle = (index / Math.max(1, structure.slots.length)) * Math.PI * 2 + Math.random() * 0.65;
    const distance = 22 + (index % 5) * 7 + Math.random() * 12;
    const x = clamp(obj.x + obj.w / 2 + Math.cos(angle) * distance, 24, map.width - 48);
    const y = clamp(obj.y + obj.h / 2 + Math.sin(angle) * distance, 24, map.height - 48);

    if (slot.kind === "tool" && slot.toolData) {
      const drop = {
        id: "tooldrop-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
        x,
        y,
        droppedAt: Date.now(),
        toolData: { ...slot.toolData }
      };
      if (!Array.isArray(state.droppedTools)) state.droppedTools = [];
      state.droppedTools.push(drop);
      objects.push(createDroppedToolObject(drop));
      dropped += 1;
      return;
    }

    if (slot.kind === "stack" && typeof spawnWorldLootDrop === "function") {
      spawnWorldLootDrop(slot.type, x, y, slot.count);
      dropped += 1;
    }
  });

  structure.slots = emptyStorageSlots(18);
  return dropped;
}

function destroyPlacedStructure(obj) {
  const structure = getStructureById(obj.structureId);
  if (!structure) return;

  if (structure.type === "furnace" && !equippedPickaxe()) {
    toast("Equip a pickaxe to break a Furnace.");
    return;
  }

  if ((structure.type === "craftingbench" || structure.type === "storagechest") && !equippedAxe()) {
    toast("Equip an axe to break this build.");
    return;
  }

  const scattered = scatterStorageChestContents(structure, obj);

  state.structures = state.structures.filter((entry) => entry.id !== structure.id);
  objects = objects.filter((entry) => entry !== obj);

  if (structure.type === "craftingbench") state.craftingBenches += 1;
  if (structure.type === "furnace") state.furnaces += 1;
  if (structure.type === "storagechest") state.storageChests += 1;

  addFloatingText(obj.x, obj.y - 10, scattered > 0 ? "ITEMS DROPPED" : "PICKED UP");
  toast(scattered > 0 ? "Chest broke and dropped its contents." : structureLabel(structure.type) + " returned to inventory.");
  save();
  syncUI();
}

function makeCampfireObject(x, y) {
  return {
    x, y, w: 64, h: 64, kind: "campfire", interact: true, label: "open camp", action: "camp"
  };
}

function currentCampfire() {
  return objects.find((obj) => obj.kind === "campfire" && !obj.hidden) || null;
}

function isCampPlacementActive() {
  return campPlacementState.active;
}

function beginCampfirePlacement() {
  if (gameScreen.classList.contains("hidden") || state.campPlaced) return;

  closeAllGamePanels();
  closeNpcDialogue();
  closeBuyPanel();
  closeSellPanel();

  const startX = Math.round((player.x + 54) / CAMP_PLACEMENT_SNAP) * CAMP_PLACEMENT_SNAP;
  const startY = Math.round((player.y + 34) / CAMP_PLACEMENT_SNAP) * CAMP_PLACEMENT_SNAP;

  campPlacementState.active = true;
  campPlacementState.confirming = false;
  campPlacementState.relocating = false;
  campPlacementState.targetX = clamp(startX, 32, map.width - 96);
  campPlacementState.targetY = clamp(startY, 32, map.height - 96);
  campPlacementState.previewX = campPlacementState.targetX;
  campPlacementState.previewY = campPlacementState.targetY;
  campPlacementState.valid = canPlaceCampfireAt(campPlacementState.previewX, campPlacementState.previewY);

  canvas.classList.add("placing-campfire");
  campPlacementGuide.classList.remove("hidden");
  campPlacementConfirm.classList.add("hidden");
  toast("Choose where to establish your home.");
}

function endCampfirePlacement() {
  campPlacementState.active = false;
  campPlacementState.confirming = false;
  canvas.classList.remove("placing-campfire");
  campPlacementGuide.classList.add("hidden");
  campPlacementConfirm.classList.add("hidden");
}

function canPlaceCampfireAt(x, y) {
  const box = { x: x + 5, y: y + 7, w: 54, h: 49 };
  if (x < 32 || y < 32 || x + 64 > map.width - 32 || y + 64 > map.height - 32) return false;
  if (typeof boxTouchesWater === "function" && boxTouchesWater(box)) return false;

  for (const obj of objects) {
    if (obj.hidden) continue;
    if (obj.kind === "campfire") continue;

    const padding = obj.kind === "npc" ? 46 : 14;
    const blocked = { x: obj.x - padding, y: obj.y - padding, w: obj.w + padding * 2, h: obj.h + padding * 2 };
    if (overlap(box, blocked)) return false;
  }

  return true;
}

function updateCampfirePlacementPreview() {
  if (!campPlacementState.active || campPlacementState.confirming) return;

  const stepX = clamp(campPlacementState.targetX - campPlacementState.previewX, -CAMP_PLACEMENT_SNAP, CAMP_PLACEMENT_SNAP);
  const stepY = clamp(campPlacementState.targetY - campPlacementState.previewY, -CAMP_PLACEMENT_SNAP, CAMP_PLACEMENT_SNAP);
  campPlacementState.previewX += stepX;
  campPlacementState.previewY += stepY;
  campPlacementState.valid = canPlaceCampfireAt(campPlacementState.previewX, campPlacementState.previewY);
}

function confirmCampfirePlacement() {
  if (!campPlacementState.active || !campPlacementState.valid) return;

  objects = objects.filter((obj) => obj.kind !== "campfire");
  state.campPlaced = true;
  state.campX = campPlacementState.previewX;
  state.campY = campPlacementState.previewY;
  objects.push(makeCampfireObject(state.campX, state.campY));

  endCampfirePlacement();
  save();
  syncUI();
  toast("Home established.");
  addFloatingText(state.campX, state.campY - 10, "HOME");
}

campPlacementCanvas.addEventListener("mousemove", (event) => {
  if (!campPlacementState.active || campPlacementState.confirming) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const worldX = (event.clientX - rect.left) * scaleX + camera.x - 32;
  const worldY = (event.clientY - rect.top) * scaleY + camera.y - 32;

  campPlacementState.targetX = clamp(Math.round(worldX / CAMP_PLACEMENT_SNAP) * CAMP_PLACEMENT_SNAP, 32, map.width - 96);
  campPlacementState.targetY = clamp(Math.round(worldY / CAMP_PLACEMENT_SNAP) * CAMP_PLACEMENT_SNAP, 32, map.height - 96);
});

campPlacementCanvas.addEventListener("click", () => {
  if (!campPlacementState.active || campPlacementState.confirming) return;
  if (!campPlacementState.valid) {
    toast("That spot is blocked. Choose a clear tile.");
    return;
  }
  campPlacementState.confirming = true;
  campPlacementConfirm.classList.remove("hidden");
});

campPlacementCanvas.addEventListener("mousemove", (event) => {
  if (!structurePlacementState.active) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const size = structureSize(structurePlacementState.type);
  const worldX = (event.clientX - rect.left) * scaleX + camera.x - size.w / 2;
  const worldY = (event.clientY - rect.top) * scaleY + camera.y - size.h / 2;

  structurePlacementState.targetX = clamp(Math.round(worldX / STRUCTURE_PLACEMENT_SNAP) * STRUCTURE_PLACEMENT_SNAP, 32, map.width - size.w - 32);
  structurePlacementState.targetY = clamp(Math.round(worldY / STRUCTURE_PLACEMENT_SNAP) * STRUCTURE_PLACEMENT_SNAP, 32, map.height - size.h - 32);
});

campPlacementCanvas.addEventListener("click", () => {
  if (!structurePlacementState.active) return;
  if (!structurePlacementState.valid) {
    const status = structurePlacementStatus(
      structurePlacementState.type,
      structurePlacementState.previewX,
      structurePlacementState.previewY
    );
    toast(status.ok ? "That spot is blocked. Choose clear land." : status.reason);
    return;
  }
  confirmStructurePlacement();
});

if (campPlacementConfirmButton) campPlacementConfirmButton.addEventListener("click", confirmCampfirePlacement);
if (campPlacementRetryButton) campPlacementRetryButton.addEventListener("click", () => {
  campPlacementState.confirming = false;
  campPlacementConfirm.classList.add("hidden");
});

function addWorldResource(kind, action, label, count, options = {}) {
  const preferredBiomes = options.preferredBiomes || [];
  const w = options.w || 52;
  const h = options.h || 48;

  for (let i = 0; i < count; i++) {
    const pos = randomSafePosition(w, h, preferredBiomes);

    objects.push(makeResource({
      x: pos.x,
      y: pos.y,
      w,
      h,
      kind,
      action,
      label,
      amount: options.amount || 1,
      maxHp: randomInt(options.minHp || 2, options.maxHp || 4),
      requiresPickaxe: Boolean(options.requiresPickaxe),
      noCollision: Boolean(options.noCollision)
    }));
  }
}

function createWorld() {
  objects = [];
  floatingTexts = [];

  if (typeof generateWorldTerrain === "function") {
    generateWorldTerrain();
  } else {
    tileVariants = buildTileVariants();
  }

  let spawn;
  if (state.hasWorldPosition && Number.isFinite(state.playerX) && Number.isFinite(state.playerY)) {
    spawn = typeof findNearestDryPosition === "function"
      ? findNearestDryPosition(state.playerX, state.playerY, 36, 42)
      : { x: state.playerX, y: state.playerY };
  } else if (state.campPlaced && Number.isFinite(state.campX) && Number.isFinite(state.campY)) {
    spawn = typeof findNearestDryPosition === "function"
      ? findNearestDryPosition(state.campX + 32, state.campY + 96, 36, 42)
      : { x: state.campX + 32, y: state.campY + 96 };
  } else {
    spawn = randomFirstPlayerSpawn();
  }

  player.x = spawn.x;
  player.y = spawn.y;
  state.playerX = player.x;
  state.playerY = player.y;
  state.hasWorldPosition = true;

  if (state.campPlaced && Number.isFinite(state.campX) && Number.isFinite(state.campY)) {
    objects.push(makeCampfireObject(state.campX, state.campY));
  }

  restorePlacedStructures();

  // Living spread: every biome can support early survival, while forests/rocky zones still matter.
  addWorldResource("tree", "wood", "hit tree", 82, {
    preferredBiomes: ["forest"], w: 64, h: 96, amount: 2, minHp: 5, maxHp: 9
  });
  addWorldResource("largetree", "wood", "chop large tree", 18, {
    preferredBiomes: ["forest"], w: 96, h: 136, amount: 5, minHp: 16, maxHp: 24
  });
  addWorldResource("largetree", "wood", "chop large tree", 4, {
    preferredBiomes: ["plains"], w: 92, h: 128, amount: 4, minHp: 14, maxHp: 21
  });
  addWorldResource("tree", "wood", "hit tree", 24, {
    preferredBiomes: ["plains"], w: 64, h: 96, amount: 2, minHp: 5, maxHp: 9
  });
  addWorldResource("bush1", "bush", "shake bush", 42, {
    preferredBiomes: ["plains"], w: 48, h: 54, amount: 1, minHp: 2, maxHp: 3, noCollision: true
  });
  addWorldResource("bush2", "bush", "shake bush", 42, {
    preferredBiomes: ["forest", "plains"], w: 48, h: 54, amount: 1, minHp: 2, maxHp: 3, noCollision: true
  });
  addWorldResource("mushroom", "mushroom", "gather mushroom", 26, {
    preferredBiomes: ["forest"], w: 54, h: 44, amount: 1, minHp: 1, maxHp: 2, noCollision: true
  });
  addWorldResource("rock", "stone", "mine rock", 24, {
    preferredBiomes: ["rocky"], w: 52, h: 44, amount: 2, minHp: 7, maxHp: 12
  });
  addWorldResource("rock", "stone", "mine rock", 14, {
    preferredBiomes: ["plains", "forest"], w: 52, h: 44, amount: 2, minHp: 7, maxHp: 12
  });
  addWorldResource("copperore", "copper", "mine copper ore", 9, {
    preferredBiomes: ["rocky"], w: 52, h: 48, amount: 1, minHp: 13, maxHp: 17, requiresPickaxe: true
  });
  addWorldResource("copperore", "copper", "mine copper ore", 4, {
    preferredBiomes: ["plains", "forest"], w: 52, h: 48, amount: 1, minHp: 13, maxHp: 17, requiresPickaxe: true
  });
  addWorldResource("ironore", "iron", "mine iron ore", 5, {
    preferredBiomes: ["rocky"], w: 52, h: 48, amount: 1, minHp: 20, maxHp: 25, requiresPickaxe: true
  });
  addWorldResource("ironore", "iron", "mine iron ore", 2, {
    preferredBiomes: ["forest", "plains"], w: 52, h: 48, amount: 1, minHp: 20, maxHp: 25, requiresPickaxe: true
  });

  spawnRareChests();
  restoreDroppedTools();
  restoreDroppedLoot();
  spawnStarterSlimes();

  player.vx = 0;
  player.vy = 0;

  camera.x = clamp(player.x - canvas.width / 2, 0, map.width - canvas.width);
  camera.y = clamp(player.y - canvas.height / 2, 0, map.height - canvas.height);

  if (!state.campPlaced) {
    setTimeout(() => beginCampfirePlacement(), 60);
  }

  save();
}

function createWorldChest(chestType, label) {
  const pos = randomSafePosition(64, 64);

  objects.push({
    x: pos.x,
    y: pos.y,
    w: 64,
    h: 64,
    kind: chestType === "legendary" ? "legendarychest" : chestType === "rare" ? "rarechest" : "chest",
    interact: true,
    label: label,
    action: "chest",
    chestType: chestType,
    used: false
  });
}

function spawnRareChests() {
  // Common treasure supports exploration; special treasure stays genuinely rare.
  for (let i = 0; i < 10; i++) {
    createWorldChest("normal", "open chest");
  }

  if (Math.random() < 0.65) {
    createWorldChest("rare", "open rare chest");
  }

  if (Math.random() < 0.08) {
    createWorldChest("legendary", "open legendary chest");
  }
}

function makeResource(data) {
  return {
    ...data,
    interact: true,
    hp: data.maxHp,
    shake: 0,
    hidden: false
  };
}

function buildTileVariants() {
  if (typeof generateWorldTerrain === "function") {
    generateWorldTerrain();
    return tileVariants;
  }

  return [];
}

function isPathTile(x, y) {
  if (typeof isGeneratedPathBox === "function") {
    return isGeneratedPathBox({ x, y, w: map.tile, h: map.tile });
  }

  return false;
}

function randomSafePosition(w, h, preferredBiomes = []) {
  let tries = 0;

  while (tries < 360) {
    tries++;

    const pos = typeof generatedLandPosition === "function"
      ? generatedLandPosition(w, h, preferredBiomes)
      : {
          x: Math.floor(randomRange(80, map.width - 140) / 32) * 32,
          y: Math.floor(randomRange(100, map.height - 140) / 32) * 32
        };

    const test = { x: pos.x, y: pos.y, w, h };

    if (typeof boxTouchesWater === "function" && boxTouchesWater(test)) continue;
    if (isInCampArea(test)) continue;
    if (isOnMainPath(test)) continue;
    if (isTooCloseToPlayer(test)) continue;

    let overlapsOther = false;

    for (const obj of objects) {
      const padding = 28;
      const padded = {
        x: obj.x - padding,
        y: obj.y - padding,
        w: obj.w + padding * 2,
        h: obj.h + padding * 2
      };

      if (overlap(test, padded)) {
        overlapsOther = true;
        break;
      }
    }

    if (!overlapsOther) {
      return { x: pos.x, y: pos.y };
    }
  }

  return typeof generatedLandPosition === "function"
    ? generatedLandPosition(w, h, [])
    : { x: 900, y: 700 };
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function isInCampArea(box) {
  const camp = currentCampfire();
  if (!camp) return false;

  return overlap(box, {
    x: camp.x - 105,
    y: camp.y - 105,
    w: camp.w + 210,
    h: camp.h + 210
  });
}

function isOnMainPath(box) {
  return typeof isGeneratedPathBox === "function" && isGeneratedPathBox(box);
}

function isTooCloseToPlayer(box) {
  return overlap(box, {
    x: player.x - 115,
    y: player.y - 95,
    w: 230,
    h: 190
  });
}

function randomFirstPlayerSpawn() {
  return typeof generatedLandPosition === "function"
    ? generatedLandPosition(36, 42, ["plains"])
    : {
        x: Math.floor(randomRange(170, map.width - 170) / 32) * 32,
        y: Math.floor(randomRange(180, map.height - 170) / 32) * 32
      };
}

/* COLLISION */

function playerHitbox(x = player.x, y = player.y) {
  return {
    x: x - 18,
    y: y + 12,
    w: 36,
    h: 32
  };
}

function objectHitbox(obj) {
  if (obj.noCollision) {
    return { x: obj.x + obj.w / 2, y: obj.y + obj.h / 2, w: 0, h: 0 };
  }

  if (obj.kind === "tree") {
    return { x: obj.x + 20, y: obj.y + 64, w: 24, h: 28 };
  }

  if (obj.kind === "largetree") {
    return { x: obj.x + 34, y: obj.y + 92, w: 28, h: 36 };
  }

  if (obj.kind === "campfire") {
    return { x: obj.x + 18, y: obj.y + 26, w: 28, h: 26 };
  }

  if (obj.kind === "craftingbench") {
    return { x: obj.x + 12, y: obj.y + 20, w: obj.w - 24, h: obj.h - 24 };
  }

  if (obj.kind === "furnace") {
    return { x: obj.x + 12, y: obj.y + 16, w: obj.w - 24, h: obj.h - 20 };
  }

  if (obj.kind === "npc") {
    return { x: obj.x + 14, y: obj.y + 44, w: 36, h: 34 };
  }

  if (obj.kind === "chest" || obj.kind === "rarechest" || obj.kind === "legendarychest") {
    return { x: obj.x + 12, y: obj.y + 18, w: 40, h: 34 };
  }

  return { x: obj.x + 4, y: obj.y + 4, w: obj.w - 8, h: obj.h - 8 };
}

function interactHitbox(obj) {
  if (obj.kind === "bush1" || obj.kind === "bush2" || obj.kind === "mushroom") {
    return { x: obj.x + 6, y: obj.y + 12, w: obj.w - 12, h: obj.h - 12 };
  }

  return objectHitbox(obj);
}

function overlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function canMoveTo(x, y) {
  const box = playerHitbox(x, y);

  // Water is walkable while world scale and terrain proportions are being tested.
  // Camp placement and world spawns still avoid water.

  if (
    box.x < 0 ||
    box.y < 0 ||
    box.x + box.w > map.width ||
    box.y + box.h > map.height
  ) {
    return false;
  }

  for (const obj of objects) {
    if (obj.hidden || obj.noCollision) continue;
    if (obj.kind === "npc" || obj.kind === "slime") continue;

    if (overlap(box, objectHitbox(obj))) {
      return false;
    }
  }

  return true;
}


/* PHASE 8D — DROPPED ITEM SPREAD / DESPAWN */
const DROPPED_ITEM_DESPAWN_MS = 5 * 60 * 1000;
const DROPPED_ITEM_SPREAD_DISTANCE = 34;

function isDroppedGroundItem(obj) {
  return Boolean(obj && !obj.hidden && (obj.action === "pickupLoot" || obj.action === "pickupTool"));
}

function removeDroppedGroundItem(obj) {
  obj.hidden = true;
  obj.interact = false;

  if (obj.action === "pickupLoot" && obj.lootData) {
    state.droppedLoot = (state.droppedLoot || []).filter((drop) => drop.id !== obj.lootData.id);
  }

  if (obj.action === "pickupTool" && obj.toolData) {
    state.droppedTools = (state.droppedTools || []).filter((drop) => drop.id !== obj.dropId && drop.toolData?.id !== obj.toolData.id);
  }
}

function syncDroppedItemState(obj) {
  if (obj.action === "pickupLoot" && obj.lootData) {
    const drop = (state.droppedLoot || []).find((entry) => entry.id === obj.lootData.id);
    if (drop) {
      drop.x = obj.x;
      drop.y = obj.y;
      drop.droppedAt = obj.droppedAt || drop.droppedAt || Date.now();
    }
  }

  if (obj.action === "pickupTool" && obj.toolData) {
    const drop = (state.droppedTools || []).find((entry) => entry.id === obj.dropId || entry.toolData?.id === obj.toolData.id);
    if (drop) {
      drop.x = obj.x;
      drop.y = obj.y;
      drop.droppedAt = obj.droppedAt || drop.droppedAt || Date.now();
    }
  }
}

function updateDroppedGroundItems() {
  const now = Date.now();
  const drops = objects.filter(isDroppedGroundItem);
  let changed = false;

  for (const drop of drops) {
    if (!drop.droppedAt) drop.droppedAt = now;
    if (now - drop.droppedAt >= DROPPED_ITEM_DESPAWN_MS) {
      removeDroppedGroundItem(drop);
      changed = true;
      continue;
    }

    if (!Number.isFinite(drop.bobPhase)) drop.bobPhase = Math.random() * Math.PI * 2;
    drop.bobPhase += 0.08;
  }

  for (let i = 0; i < drops.length; i++) {
    const a = drops[i];
    if (!isDroppedGroundItem(a)) continue;

    for (let j = i + 1; j < drops.length; j++) {
      const b = drops[j];
      if (!isDroppedGroundItem(b)) continue;

      const ax = a.x + a.w / 2;
      const ay = a.y + a.h / 2;
      const bx = b.x + b.w / 2;
      const by = b.y + b.h / 2;
      const dx = bx - ax;
      const dy = by - ay;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist < DROPPED_ITEM_SPREAD_DISTANCE) {
        const push = (DROPPED_ITEM_SPREAD_DISTANCE - dist) * 0.035;
        const nx = dx / dist;
        const ny = dy / dist;
        a.x = clamp(a.x - nx * push, 24, map.width - a.w - 24);
        a.y = clamp(a.y - ny * push, 24, map.height - a.h - 24);
        b.x = clamp(b.x + nx * push, 24, map.width - b.w - 24);
        b.y = clamp(b.y + ny * push, 24, map.height - b.h - 24);
        changed = true;
      }
    }
  }

  if (changed) {
    for (const drop of drops) syncDroppedItemState(drop);
  }

  objects = objects.filter((obj) => !obj.hidden || (obj.action !== "pickupLoot" && obj.action !== "pickupTool"));
}


/* ROWAN — TEMPORARY CAMP TRADER */

function findRowan() {
  return objects.find((obj) => obj.kind === "npc" && obj.npcName === "Rowan" && !obj.hidden) || null;
}

function rowanPanelsOpen() {
  return !npcDialogue.classList.contains("hidden") ||
    !buyPanel.classList.contains("hidden") ||
    !sellPanel.classList.contains("hidden");
}

function removeRowanForNight() {
  const existed = Boolean(findRowan());
  objects = objects.filter((obj) => !(obj.kind === "npc" && obj.npcName === "Rowan"));

  if (existed && rowanPanelsOpen()) {
    closeNpcDialogue();
    closeBuyPanel();
    closeSellPanel();
    toast("Rowan has left for the night.");
  }
}

function rowanSpotIsOpen(x, y, rowan = null) {
  const box = { x: x + 18, y: y + 60, w: 52, h: 44 };
  if (x < 48 || y < 48 || x + 92 > map.width - 48 || y + 116 > map.height - 48) return false;
  if (typeof boxTouchesWater === "function" && boxTouchesWater(box)) return false;

  for (const obj of objects) {
    if (obj === rowan || obj.hidden || obj.kind === "npc" || obj.noCollision) continue;
    const blocked = { x: obj.x - 10, y: obj.y - 10, w: obj.w + 20, h: obj.h + 20 };
    if (overlap(box, blocked)) return false;
  }

  return true;
}

function chooseRowanSpotNearCamp(rowan = null, radiusMin = 88, radiusMax = 190) {
  const camp = currentCampfire();
  if (!camp) return null;

  const cx = camp.x + camp.w / 2;
  const cy = camp.y + camp.h / 2;

  for (let attempt = 0; attempt < 80; attempt++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = randomRange(radiusMin, radiusMax);
    const x = Math.round((cx + Math.cos(angle) * distance - 46) / 16) * 16;
    const y = Math.round((cy + Math.sin(angle) * distance - 58) / 16) * 16;

    if (rowanSpotIsOpen(x, y, rowan)) return { x, y };
  }

  return null;
}

function spawnRowanForDay() {
  if (!state.campPlaced || cycleInfo().phase === "Night" || findRowan()) return;

  const spot = chooseRowanSpotNearCamp(null, 92, 170);
  if (!spot) return;

  objects.push({
    x: spot.x,
    y: spot.y,
    w: 92,
    h: 116,
    kind: "npc",
    interact: true,
    label: "talk to Rowan",
    action: "npc",
    npcName: "Rowan",
    targetX: spot.x,
    targetY: spot.y,
    walkPause: randomInt(110, 250),
    walkSpeed: 0.42
  });
}

function updateRowanTrader() {
  if (!state.campPlaced) return;

  if (cycleInfo().phase === "Night") {
    removeRowanForNight();
    return;
  }

  spawnRowanForDay();

  const rowan = findRowan();
  if (!rowan || rowanPanelsOpen()) return;

  if (rowan.walkPause > 0) {
    rowan.walkPause -= 1;
    return;
  }

  const distance = Math.hypot(rowan.targetX - rowan.x, rowan.targetY - rowan.y);
  if (distance < 5) {
    const target = chooseRowanSpotNearCamp(rowan, 82, 205);
    if (target) {
      rowan.targetX = target.x;
      rowan.targetY = target.y;
    }
    rowan.walkPause = randomInt(90, 230);
    return;
  }

  const dx = rowan.targetX - rowan.x;
  const dy = rowan.targetY - rowan.y;
  const length = Math.hypot(dx, dy) || 1;
  const nextX = rowan.x + (dx / length) * rowan.walkSpeed;
  const nextY = rowan.y + (dy / length) * rowan.walkSpeed;

  if (rowanSpotIsOpen(nextX, nextY, rowan)) {
    rowan.x = nextX;
    rowan.y = nextY;
  } else {
    rowan.walkPause = randomInt(50, 120);
    const target = chooseRowanSpotNearCamp(rowan, 70, 180);
    if (target) {
      rowan.targetX = target.x;
      rowan.targetY = target.y;
    }
  }
}

/* UPDATE / INTERACT */

function update() {
  if (gameScreen.classList.contains("hidden")) return;

  if (campPlacementState.active) {
    updateCampfirePlacementPreview();
    updateDayNightUI();
  } else if (structurePlacementState.active) {
    updateStructurePlacementPreview();
    updateDayNightUI();
  } else {
    healNearCampfire();
    updateDayNightUI();
    updateCombat();
    updateRowanTrader();
  }

  for (const obj of objects) {
    if (obj.shake && obj.shake > 0) obj.shake -= 1;
  }

  updateDroppedGroundItems();

  if (player.axeSwing > 0) player.axeSwing -= 1;
  if (player.attackSwing > 0) player.attackSwing -= 1;
  if (player.attackCooldown > 0) player.attackCooldown -= 1;
  if (player.hurtCooldown > 0) player.hurtCooldown -= 1;

  for (const text of floatingTexts) {
    text.y -= 0.45;
    text.life -= 1;
  }

  floatingTexts = floatingTexts.filter((text) => text.life > 0);
    let inputX = 0;
  let inputY = 0;

  if (keys.has("w") || keys.has("arrowup")) inputY -= 1;
  if (keys.has("s") || keys.has("arrowdown")) inputY += 1;
  if (keys.has("a") || keys.has("arrowleft")) inputX -= 1;
  if (keys.has("d") || keys.has("arrowright")) inputX += 1;

  const len = Math.hypot(inputX, inputY) || 1;

  inputX /= len;
  inputY /= len;

  if (Math.abs(inputX) > Math.abs(inputY) && inputX !== 0) {
    player.facing = inputX > 0 ? "right" : "left";
  } else if (inputY !== 0) {
    player.facing = inputY > 0 ? "down" : "up";
  }

  const speedBoosted = Date.now() < player.speedBoostUntil;
  const currentMaxSpeed = player.speed * (speedBoosted ? 1.5 : 1);

  player.vx += inputX * player.acceleration * (speedBoosted ? 1.18 : 1);
  player.vy += inputY * player.acceleration * (speedBoosted ? 1.18 : 1);

  player.vx *= player.friction;
  player.vy *= player.friction;

  const currentSpeed = Math.hypot(player.vx, player.vy);

  if (currentSpeed > currentMaxSpeed) {
    player.vx = (player.vx / currentSpeed) * currentMaxSpeed;
    player.vy = (player.vy / currentSpeed) * currentMaxSpeed;
  }

  player.moving = Math.abs(player.vx) > 0.08 || Math.abs(player.vy) > 0.08;

  if (canMoveTo(player.x + player.vx, player.y)) player.x += player.vx;
  else player.vx = 0;

  if (canMoveTo(player.x, player.y + player.vy)) player.y += player.vy;
  else player.vy = 0;

  if (player.moving) player.bob += 0.18;

  camera.tx = clamp(player.x - canvas.width / 2, 0, map.width - canvas.width);
  camera.ty = clamp(player.y - canvas.height / 2, 0, map.height - canvas.height);

  camera.x += (camera.tx - camera.x) * 0.075;
  camera.y += (camera.ty - camera.y) * 0.075;

  if (!campPlacementState.active) {
    closeRowanPanelsWhenFar();
  }

  if (typeof updateTerritoryLocationBanner === "function") {
    updateTerritoryLocationBanner();
  }

  const near = campPlacementState.active ? null : nearbyInteractable();
  const prompt = $("interactPrompt");

  if (near) {
    if ((near.action === "craftingbench" || near.action === "storagechest") && equippedAxe()) {
      prompt.textContent = "Press E to destroy " + structureLabel(near.action);
    } else if (near.action === "furnace" && equippedPickaxe()) {
      prompt.textContent = "Press E to destroy Furnace";
    } else if (near.action === "wood" || near.action === "stone" || near.action === "copper" || near.action === "iron" || near.action === "bush") {
      prompt.textContent = "Press E to " + near.label + " (" + Math.max(0, Math.ceil(near.hp)) + " HP)";
    } else {
      prompt.textContent = "Press E to " + near.label;
    }

    prompt.classList.remove("hidden");
  } else {
    prompt.classList.add("hidden");
  }

  syncBarsOnly();
}

function syncBarsOnly() {
  const hpPercent = Math.min(100, (state.hp / maxHp()) * 100);
  hpFill.style.width = hpPercent + "%";
  hudHpText.textContent = Math.round(state.hp) + "/" + maxHp();
}

function healNearCampfire() {
  const camp = objects.find((obj) => obj.kind === "campfire");

  if (!camp) return;

  const dx = player.x - (camp.x + camp.w / 2);
  const dy = player.y - (camp.y + camp.h / 2);
  const distance = Math.hypot(dx, dy);

  if (distance <= campHealRadius() && state.hp < maxHp()) {
    state.hp = Math.min(maxHp(), state.hp + campHealRate());
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function closeRowanPanelsWhenFar() {
  const anyRowanPanelOpen =
    !npcDialogue.classList.contains("hidden") ||
    !buyPanel.classList.contains("hidden") ||
    !sellPanel.classList.contains("hidden");

  if (!anyRowanPanelOpen) return;

  const rowan = objects.find((obj) => obj.kind === "npc" && obj.npcName === "Rowan");
  if (!rowan) return;

  const dx = player.x - (rowan.x + rowan.w / 2);
  const dy = player.y - (rowan.y + rowan.h / 2);
  const distance = Math.hypot(dx, dy);

  if (distance > 190) {
    closeNpcDialogue();
    closeBuyPanel();
    closeSellPanel();
    toast("You walked away from Rowan.");
  }
}

function interactionPriority(obj) {
  if (obj.action === "pickupLoot" || obj.action === "pickupTool") return 1;
  if (obj.action === "craftingbench" || obj.action === "furnace" || obj.action === "storagechest" || obj.action === "camp" || obj.action === "npc" || obj.action === "chest") return 2;
  return 3;
}

function nearbyInteractable() {
  const reach = { x: player.x - 58, y: player.y - 58, w: 116, h: 116 };
  const candidates = objects
    .filter((obj) => obj.interact && !obj.hidden && overlap(reach, interactHitbox(obj)))
    .map((obj) => ({
      obj,
      priority: interactionPriority(obj),
      distance: Math.hypot((obj.x + obj.w / 2) - player.x, (obj.y + obj.h / 2) - player.y)
    }))
    .sort((a, b) => a.priority - b.priority || a.distance - b.distance);

  return candidates[0]?.obj || null;
}

function interact() {
  const obj = nearbyInteractable();

  if (!obj) return;

  if (obj.action === "wood" || obj.action === "stone" || obj.action === "copper" || obj.action === "iron" || obj.action === "bush" || obj.action === "mushroom") {
    hitResource(obj);
  }

  if (obj.action === "chest") {
    openChest(obj);
  }

  if (obj.action === "camp") {
    openCamp();
  }

  if (obj.action === "craftingbench") {
    if (equippedAxe()) destroyPlacedStructure(obj);
    else openCrafting(obj);
  }

  if (obj.action === "furnace") {
    if (equippedPickaxe()) destroyPlacedStructure(obj);
    else openSmelting(obj);
  }

  if (obj.action === "storagechest") {
    if (equippedAxe()) destroyPlacedStructure(obj);
    else openStorage(obj);
  }

  if (obj.action === "npc") {
    openNpcDialogue(obj.npcName || "Rowan");
  }

  if (obj.action === "pickupTool") {
    pickupDroppedTool(obj);
  }

  if (obj.action === "pickupLoot") {
    pickupDroppedLoot(obj);
  }

  save();
  syncUI();
}

function relocateChest(obj) {
  const newPos = randomSafePosition(obj.w, obj.h);
  obj.x = newPos.x;
  obj.y = newPos.y;
}

function openChest(obj) {
  if (obj.used) {
    toast("Chest is empty.");
    return;
  }

  obj.used = true;
  obj.hidden = true;

  let goldReward = randomInt(12, 28);
  let xpReward = 8;
  let woodReward = 0;
  let stoneReward = 0;
  let healthPotionReward = 0;
  let speedPotionReward = 0;
  let message = "Chest!";

  if (obj.chestType === "starter") {
    goldReward = 20;
    xpReward = 10;
    message = "Starter Chest!";
  }

  if (obj.chestType === "normal") {
    goldReward = randomInt(12, 32);
    xpReward = 9;
    woodReward = Math.random() < 0.28 ? randomInt(1, 3) : 0;
    stoneReward = Math.random() < 0.24 ? randomInt(1, 3) : 0;
  }

  if (obj.chestType === "rare") {
    goldReward = randomInt(55, 105);
    xpReward = 20;
    woodReward = Math.random() < 0.38 ? randomInt(2, 5) : 0;
    stoneReward = Math.random() < 0.38 ? randomInt(2, 5) : 0;
    message = "RARE CHEST!";
  }

  if (obj.chestType === "legendary") {
    goldReward = randomInt(180, 290);
    xpReward = 60;
    woodReward = randomInt(7, 15);
    stoneReward = randomInt(7, 15);
    healthPotionReward = Math.random() < 0.025 ? 1 : 0;
    speedPotionReward = Math.random() < 0.01 ? 1 : 0;
    message = "LEGENDARY!";
  }

  state.gold += goldReward;
  state.wood += woodReward;
  state.stone += stoneReward;
  state.potions += healthPotionReward;
  state.speedPotions += speedPotionReward;
  addXp(xpReward);

  toast(message + " +" + formatNumber(goldReward) + " gold");
  addFloatingText(obj.x, obj.y, message);

  if (woodReward > 0) addFloatingText(obj.x, obj.y + 20, "+" + woodReward + " Wood");
  if (stoneReward > 0) addFloatingText(obj.x, obj.y + 38, "+" + stoneReward + " Stone");
  if (healthPotionReward > 0) addFloatingText(obj.x, obj.y + 56, "+Health Potion");
  if (speedPotionReward > 0) addFloatingText(obj.x, obj.y + 74, "+Speed Potion");

  const respawnTime =
    obj.chestType === "legendary" ? 110000 :
    obj.chestType === "rare" ? 70000 :
    obj.chestType === "starter" ? 60000 :
    42000;

  setTimeout(() => {
    relocateChest(obj);
    obj.used = false;
    obj.hidden = false;
  }, respawnTime);
}

function useEquippedAxeDurability(obj) {
  const axe = equippedAxe();
  if (!axe) return false;

  let cost = 0;
  if (obj.kind === "tree") cost = 1;
  if (obj.kind === "largetree") cost = 1.5;
  if (obj.kind === "bush2") cost = 0.5;
  if (obj.kind === "bush1") cost = 0.25;

  if (cost <= 0) return false;

  player.axeSwing = 11;
  axe.durability = Number(Math.max(0, axe.durability - cost).toFixed(2));

  if (axe.durability > 0) return false;

  state.axes = state.axes.filter((ownedAxe) => ownedAxe.id !== axe.id);
  state.hotbar = state.hotbar.map((item) =>
    hotbarAxeItem(item)?.itemId === axe.id ? null : item
  );
  state.equippedAxeId = null;

  if (selectedInventoryItem?.type === "axe" && selectedInventoryItem.itemId === axe.id) {
    selectedInventoryItem = null;
  }

  toast("Your Basic Axe broke!");
  addFloatingText(player.x, player.y - 52, "AXE BROKE!");
  return true;
}

function useEquippedPickaxeDurability(obj) {
  const pickaxe = equippedPickaxe();
  if (!pickaxe) return false;

  const isMineable = obj.kind === "rock" || obj.kind === "copperore" || obj.kind === "ironore";
  if (!isMineable) return false;

  player.axeSwing = 11;
  pickaxe.durability = Number(Math.max(0, pickaxe.durability - 1).toFixed(2));

  if (pickaxe.durability > 0) return false;

  state.pickaxes = state.pickaxes.filter((ownedPickaxe) => ownedPickaxe.id !== pickaxe.id);
  state.hotbar = state.hotbar.map((item) =>
    hotbarPickaxeItem(item)?.itemId === pickaxe.id ? null : item
  );
  state.equippedPickaxeId = null;

  if (selectedInventoryItem?.type === "pickaxe" && selectedInventoryItem.itemId === pickaxe.id) {
    selectedInventoryItem = null;
  }

  toast("Your Basic Pickaxe broke!");
  addFloatingText(player.x, player.y - 52, "PICKAXE BROKE!");
  return true;
}

function hitResource(obj) {
  if ((obj.action === "copper" || obj.action === "iron") && !equippedPickaxe()) {
    toast("You need a pickaxe to mine ore.");
    return;
  }

  const damage = gatheringDamage(obj.action);
  const axeBroke = useEquippedAxeDurability(obj);
  const pickaxeBroke = useEquippedPickaxeDurability(obj);

  obj.hp -= damage;
  obj.shake = 8;

  if (obj.hp > 0) {
    if (!axeBroke && !pickaxeBroke) toast("Hit! -" + damage.toFixed(2));
    return;
  }

  if (obj.action === "wood") {
    const woodAmount = obj.amount || 1;
    state.wood += woodAmount;
    state.gold += campGoldBonus();
    addXp(obj.kind === "largetree" ? 9 : 5);
    toast("+" + woodAmount + " wood");
    addFloatingText(obj.x, obj.y, "+" + woodAmount + " Wood");

    if (obj.kind === "largetree" && Math.random() < 0.16) {
      state.mushlings += 1;
      addFloatingText(obj.x, obj.y + 22, "+1 Mushling");
      toast("Large tree dropped a mushling!");
    }

    temporarilyHide(obj, obj.kind === "largetree" ? resourceRespawnTime() + 6000 : resourceRespawnTime());
  }

  if (obj.action === "stone") {
    state.stone += obj.amount || 1;
    state.gold += campGoldBonus();
    addXp(5);
    toast("+" + (obj.amount || 1) + " stone");
    addFloatingText(obj.x, obj.y, "+" + (obj.amount || 1) + " Stone");
    temporarilyHide(obj, resourceRespawnTime() + 2000);
  }

  if (obj.action === "copper") {
    state.copperOre += obj.amount || 1;
    addXp(8);
    toast("+" + (obj.amount || 1) + " raw copper");
    addFloatingText(obj.x, obj.y, "+" + (obj.amount || 1) + " Raw Copper");
    respawnResourceElsewhere(obj, resourceRespawnTime() + 5000);
  }

  if (obj.action === "iron") {
    state.ironOre += obj.amount || 1;
    addXp(14);
    toast("+" + (obj.amount || 1) + " raw iron");
    addFloatingText(obj.x, obj.y, "+" + (obj.amount || 1) + " Raw Iron");
    respawnResourceElsewhere(obj, resourceRespawnTime() + 9000);
  }

  if (obj.action === "bush") {
    state.wood += 1;
    addXp(2);
    toast("+1 wood");
    addFloatingText(obj.x, obj.y, "+1 Wood");
    temporarilyHide(obj, 8000);
  }

  if (obj.action === "mushroom") {
    state.mushlings += obj.amount || 1;
    addXp(2);
    toast("+" + (obj.amount || 1) + " mushling");
    addFloatingText(obj.x, obj.y, "+" + (obj.amount || 1) + " Mushling");
    temporarilyHide(obj, 14000);
  }
}

function campGoldBonus() {
  if (state.campLevel >= 2) return 2;
  return 1;
}

function resourceRespawnTime() {
  return 9500;
}

function upgradeCamp() {
  const cost = campUpgradeCost();

  const canUpgrade =
    state.gold >= cost.gold &&
    state.wood >= cost.wood &&
    state.stone >= cost.stone &&
    state.copper >= cost.copper &&
    state.slimeGel >= cost.slimeGel;

  if (canUpgrade) {
    state.gold -= cost.gold;
    state.wood -= cost.wood;
    state.stone -= cost.stone;
    state.copper -= cost.copper;
    state.slimeGel -= cost.slimeGel;
    state.campLevel += 1;
    addXp(state.campLevel === 5 ? 55 : 20);

    if (state.campLevel === 5) {
      toast("Camp Core established!");
      addFloatingText(player.x, player.y - 50, "CAMP CORE");
    } else {
      toast("Camp upgraded to level " + state.campLevel + "!");
      addFloatingText(player.x, player.y - 50, "Camp Lv." + state.campLevel);
    }
  } else {
    let message = "Need " + formatNumber(cost.gold) + " gold, " + cost.wood + " wood, " + cost.stone + " stone";
    if (cost.copper > 0) message += ", " + cost.copper + " copper";
    if (cost.slimeGel > 0) message += ", " + cost.slimeGel + " slime gel";
    toast(message + ".");
  }

  save();
  syncUI();
}

function temporarilyHide(obj, ms) {
  obj.hidden = true;
  obj.hp = obj.maxHp;

  setTimeout(() => {
    obj.hidden = false;
  }, ms);
}

function respawnResourceElsewhere(obj, ms) {
  obj.hidden = true;
  obj.hp = obj.maxHp;

  setTimeout(() => {
    const preferredBiomes =
      obj.kind === "copperore" || obj.kind === "ironore" || obj.kind === "rock"
        ? ["rocky"]
        : obj.kind === "tree" || obj.kind === "largetree"
          ? ["forest"]
          : ["plains", "forest"];

    const newPos = randomSafePosition(obj.w, obj.h, preferredBiomes);
    obj.x = newPos.x;
    obj.y = newPos.y;
    obj.hidden = false;
  }, ms);
}

function addFloatingText(x, y, text) {
  floatingTexts.push({ x, y, text, life: 70 });
}

/* DRAW */

function draw() {
  if (gameScreen.classList.contains("hidden")) return;

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

  drawMap();
  if (typeof drawHomeTerritoryBoundary === "function") drawHomeTerritoryBoundary();
  drawEntitiesLayered();
  drawCombatEffects();
  drawFloatingTexts();
  drawCampfirePlacementGhost();
  drawStructurePlacementGhost();

  ctx.restore();

  drawNightOverlay();
}

function drawMap() {
  const tile = map.tile;
  const startCol = Math.max(0, Math.floor(camera.x / tile) - 2);
  const endCol = Math.min(Math.floor(map.width / tile) - 1, Math.ceil((camera.x + canvas.width) / tile) + 2);
  const startRow = Math.max(0, Math.floor(camera.y / tile) - 2);
  const endRow = Math.min(Math.floor(map.height / tile) - 1, Math.ceil((camera.y + canvas.height) / tile) + 2);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const x = col * tile;
      const y = row * tile;
      const key = tileVariants[row]?.[col] || "grass";
      const fallback =
        key === "water" ? "#3e92ca" :
        key === "path" || key === "rockpath" ? "#c98b55" :
        "#55b943";

      drawImg(images[key], x, y, tile, tile, fallback);
    }
  }
}

function drawEntitiesLayered() {
  const renderables = [];

  for (const obj of objects) {
    if (obj.hidden) continue;
    renderables.push({ type: "object", obj, depth: obj.y + obj.h });
  }

  renderables.push({ type: "player", depth: player.y + 44 });

  renderables.sort((a, b) => a.depth - b.depth);

  for (const item of renderables) {
    if (item.type === "player") drawPlayer();
    else drawObject(item.obj);
  }
}

function drawObject(obj) {
  const shakeX = obj.shake > 0 ? Math.sin(obj.shake * 2.5) * 3 : 0;
  const bobY = isDroppedGroundItem(obj) ? Math.sin(obj.bobPhase || 0) * 2 : 0;
  const drawX = obj.x + shakeX;
  const drawY = obj.y + bobY;

  if (obj.kind === "tree") drawImg(images.tree, drawX, obj.y, obj.w, obj.h, "#2f7832");
  if (obj.kind === "largetree") drawImg(images.largetree, drawX, obj.y, obj.w, obj.h, "#276b2d");
  if (obj.kind === "rock") drawImg(images.rock, drawX, obj.y, obj.w, obj.h, "#89939e");
  if (obj.kind === "copperore") drawImg(images.copperore, drawX, obj.y, obj.w, obj.h, "#b87333");
  if (obj.kind === "ironore") drawImg(images.ironore, drawX, obj.y, obj.w, obj.h, "#707983");
  if (obj.kind === "bush1") drawImg(images.bush1, drawX, obj.y, obj.w, obj.h, "#3a9136");
  if (obj.kind === "bush2") drawImg(images.bush2, drawX, obj.y, obj.w, obj.h, "#3a9136");
  if (obj.kind === "mushroom") drawImg(images.mushroom, drawX, obj.y, obj.w, obj.h, "#b75b86");
  if (obj.kind === "chest") drawChest(drawX, obj.y, obj.w, obj.h, obj.used, "normal");
  if (obj.kind === "rarechest") drawChest(drawX, obj.y, obj.w, obj.h, obj.used, "rare");
  if (obj.kind === "legendarychest") drawChest(drawX, obj.y, obj.w, obj.h, obj.used, "legendary");
  if (obj.kind === "campfire") drawCampfire(drawX, obj.y, obj.w, obj.h);
  if (obj.kind === "craftingbench") drawImg(images.craftingbench, drawX, obj.y, obj.w, obj.h, "#8b5a2b");
  if (obj.kind === "furnace") drawImg(images.furnace, drawX, obj.y, obj.w, obj.h, "#6b6262");
  if (obj.kind === "storagechest") drawImg(images.storagechest, drawX, obj.y, obj.w, obj.h, "#a86b36");
  if (obj.kind === "npc") drawNpc(drawX, obj.y, obj.w, obj.h, obj.npcName || "Rowan");
  if (obj.kind === "slime") drawSlime(obj, drawX);

  if (obj.kind === "droppedaxe") {
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.fillRect(drawX + 6, obj.y + 34, 31, 6);
    drawImg(images.axe, drawX - 2, drawY - 2, obj.w + 6, obj.h + 6, "#a86b36");
  }

  if (obj.kind === "droppedsword") {
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.fillRect(drawX + 7, obj.y + 35, 32, 6);
    drawImg(images.sword, drawX - 2, drawY - 3, obj.w + 7, obj.h + 7, "#d7eaff");
  }

  if (obj.kind === "droppedpickaxe") {
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.fillRect(drawX + 6, obj.y + 34, 31, 6);
    drawImg(images.pickaxe, drawX - 1, drawY - 1, obj.w + 4, obj.h + 4, "#9b7451");
  }

  if (obj.kind === "slimegel" || obj.kind === "droppedloot") {
    const itemType = obj.itemType || obj.lootData?.type || "slimegel";
    const info = typeof STORAGE_ITEM_INFO === "object" ? STORAGE_ITEM_INFO[itemType] : null;
    const image = itemType === "slimegel" ? images.slimegel : info ? images[info.image] : images.slimegel;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(drawX + 5, obj.y + 25, 22, 5);
    drawImg(image, drawX, drawY, obj.w, obj.h, "#59cf60");
  }
}

function drawPlayer() {
  const drawW = 82;
  const drawH = 108;
  const bob = player.moving ? Math.sin(player.bob) * 2 : 0;

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fillRect(player.x - 28, player.y + 34, 56, 10);

  drawImg(
    images.mascot,
    player.x - drawW / 2,
    player.y - drawH + bob + 42,
    drawW,
    drawH,
    "#9f1f17"
  );

  drawEquippedTool(bob);
  drawNameTag(player.x, player.y - 82, state.name);
}

function drawEquippedTool(bob) {
  const sword = equippedSword();
  const axe = equippedAxe();
  const pickaxe = equippedPickaxe();
  const tool = sword || axe || pickaxe;
  if (!tool) return;

  const image = images[tool.type];
  if (!image.complete || image.naturalWidth <= 0) return;

  const isSword = tool.type === "sword";
  const isGatherTool = tool.type === "axe" || tool.type === "pickaxe";
  const swingFrames = isSword ? 12 : 11;
  const swingProgress = player.attackSwing > 0 && isSword
    ? (swingFrames - player.attackSwing) / swingFrames
    : player.axeSwing > 0 && isGatherTool
      ? (11 - player.axeSwing) / 11
      : 0;

  const isSwinging = isSword ? player.attackSwing > 0 : player.axeSwing > 0;
  const rotation = isSwinging
    ? -0.55 + Math.sin(swingProgress * Math.PI) * 1.15
    : isSword ? 0.5 : tool.type === "pickaxe" ? 0.3 : 0.2;

  const anchorX = player.x + 25;
  const anchorY = player.y - 14 + bob;

  ctx.save();
  ctx.translate(anchorX, anchorY);
  ctx.rotate(rotation);
  ctx.drawImage(image, -9, -9, isSword ? 42 : 40, isSword ? 42 : 40);
  ctx.restore();
}

function drawNpc(x, y, w, h, name) {
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(x + 8, y + h - 10, w - 16, 8);

  if (images.npc.complete && images.npc.naturalWidth > 0) {
    drawImg(images.npc, x, y, w, h, "#69331c");
  } else {
    ctx.fillStyle = "#69331c";
    ctx.fillRect(x + 18, y + 26, 28, 42);

    ctx.fillStyle = "#e0a66a";
    ctx.fillRect(x + 20, y + 8, 24, 22);

    ctx.fillStyle = "#2a1208";
    ctx.fillRect(x + 24, y + 15, 4, 4);
    ctx.fillRect(x + 36, y + 15, 4, 4);

    ctx.fillStyle = "#f2c35f";
    ctx.fillRect(x + 14, y + 24, 36, 8);
  }

  drawNameTag(x + w / 2, y - 18, name);
}

function drawNameTag(x, y, text) {
  ctx.font = "bold 13px Arial";

  const width = ctx.measureText(text).width + 18;

  ctx.fillStyle = "rgba(15, 8, 3, 0.82)";
  roundRect(x - width / 2, y, width, 22, 4, true, false);

  ctx.strokeStyle = "#f2c35f";
  ctx.lineWidth = 2;
  roundRect(x - width / 2, y, width, 22, 4, false, true);

  ctx.fillStyle = "#ffe4a6";
  ctx.fillText(text, x - width / 2 + 9, y + 15);
}

function drawFloatingTexts() {
  ctx.font = "bold 16px Arial";

  for (const text of floatingTexts) {
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillText(text.text, text.x + 2, text.y + 2);

    ctx.fillStyle = "#ffe4a6";
    ctx.fillText(text.text, text.x, text.y);
  }
}

function drawChest(x, y, w, h, opened, chestStyle) {
  if (!opened && chestStyle === "rare" && images.rarechest.complete && images.rarechest.naturalWidth > 0) {
    drawImg(images.rarechest, x, y, 64, 64, "#4aa3ff");
    return;
  }

  if (!opened && chestStyle === "legendary" && images.legendarychest.complete && images.legendarychest.naturalWidth > 0) {
    drawImg(images.legendarychest, x, y, 64, 64, "#ffd24a");
    return;
  }

  if (!opened && images.chest.complete && images.chest.naturalWidth > 0) {
    drawImg(images.chest, x, y, 64, 64, "#a85622");
    return;
  }

  ctx.fillStyle = opened ? "#4b2410" : "#5b2b12";
  ctx.fillRect(x + 8, y + 22, w - 16, h - 26);

  ctx.fillStyle = opened ? "#73401d" : "#a85622";
  ctx.fillRect(x + 8, y + 10, w - 16, 22);

  ctx.fillStyle = "#f2c35f";
  ctx.fillRect(x + w / 2 - 5, y + 25, 10, 16);

  ctx.strokeStyle = "#2a1208";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 8, y + 10, w - 16, h - 18);
}

function drawCampfirePlacementGhost() {
  if (!campPlacementState.active) return;

  const x = campPlacementState.previewX;
  const y = campPlacementState.previewY;
  ctx.save();
  ctx.globalAlpha = campPlacementState.valid ? 0.68 : 0.42;
  drawImg(images.campfire, x, y, 64, 64, campPlacementState.valid ? "#ffb23e" : "#df3d32");
  ctx.globalAlpha = 1;
  ctx.strokeStyle = campPlacementState.valid ? "#80ef78" : "#ff6055";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, 64, 64);
  ctx.restore();
}

function drawBuildRadiusGuide() {
  const center = campBuildCenter();
  if (!center) return;

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "#f2c35f";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.arc(center.x, center.y, CAMP_BUILD_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawStructurePlacementGhost() {
  if (!structurePlacementState.active) return;

  drawBuildRadiusGuide();

  const type = structurePlacementState.type;
  const size = structureSize(type);
  const x = structurePlacementState.previewX;
  const y = structurePlacementState.previewY;

  ctx.save();
  ctx.globalAlpha = structurePlacementState.valid ? 0.7 : 0.42;
  drawImg(type === "furnace" ? images.furnace : type === "storagechest" ? images.storagechest : images.craftingbench, x, y, size.w, size.h, structurePlacementState.valid ? "#8b5a2b" : "#df3d32");
  ctx.globalAlpha = 1;
  ctx.strokeStyle = structurePlacementState.valid ? "#80ef78" : "#ff6055";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, size.w, size.h);
  ctx.restore();
}

function drawCampfire(x, y, w, h) {
  const radius = campLightRadius();

  const gradient = ctx.createRadialGradient(x + 32, y + 32, 8, x + 32, y + 32, radius);
  gradient.addColorStop(0, "rgba(255, 224, 112, 0.22)");
  gradient.addColorStop(0.18, "rgba(255, 194, 70, 0.16)");
  gradient.addColorStop(0.55, "rgba(255, 150, 38, 0.07)");
  gradient.addColorStop(1, "rgba(255, 130, 26, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x + 32, y + 32, radius, 0, Math.PI * 2);
  ctx.fill();

  if (images.campfire.complete && images.campfire.naturalWidth > 0) {
    drawImg(images.campfire, x, y, 64, 64, "#ff8a22");

    ctx.fillStyle = "#f2c35f";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Lv." + state.campLevel, x + 8, y - 6);

    return;
  }

  ctx.fillStyle = "#ff8a22";
  ctx.fillRect(x + 24, y + 18, 20, 28);

  ctx.fillStyle = "#ffd45e";
  ctx.fillRect(x + 30, y + 8, 9, 34);
}

function drawNightOverlay() {
  const info = cycleInfo();

  if (info.nightAlpha <= 0.01) return;

  ctx.save();

  ctx.fillStyle = "rgba(5, 10, 28, " + info.nightAlpha + ")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const camp = objects.find((obj) => obj.kind === "campfire");

  if (camp) {
    const sx = camp.x - camera.x + 32;
    const sy = camp.y - camera.y + 32;

    const light = ctx.createRadialGradient(sx, sy, 8, sx, sy, campLightRadius());
    light.addColorStop(0, "rgba(255, 232, 132, 0.26)");
    light.addColorStop(0.18, "rgba(255, 203, 85, 0.19)");
    light.addColorStop(0.55, "rgba(255, 164, 45, 0.09)");
    light.addColorStop(1, "rgba(255, 136, 26, 0)");

    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(sx, sy, campLightRadius(), 0, Math.PI * 2);
    ctx.fill();
  }

  const playerLight = ctx.createRadialGradient(
    player.x - camera.x,
    player.y - camera.y,
    10,
    player.x - camera.x,
    player.y - camera.y,
    85
  );

  playerLight.addColorStop(0, "rgba(255,255,255,0.08)");
  playerLight.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = playerLight;
  ctx.beginPath();
  ctx.arc(player.x - camera.x, player.y - camera.y, 85, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawImg(img, x, y, w, h, fallback) {
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  } else {
    ctx.fillStyle = fallback;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
}

function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();

  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);

  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

