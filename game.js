const $ = (id) => document.getElementById(id);

const startScreen = $("startScreen");
const lobbyScreen = $("lobbyScreen");
const gameScreen = $("gameScreen");

const nicknameInput = $("nicknameInput");
const worldInput = $("worldInput");
const lobbyWorld = $("lobbyWorld");

const profileName = $("profileName");
const profileGold = $("profileGold");
const profileLevel = $("profileLevel");
const lobbyNameTag = $("lobbyNameTag");

const hudName = $("hudName");
const hudWorld = $("hudWorld");
const hudGold = $("hudGold");
const hudWood = $("hudWood");
const hudStone = $("hudStone");
const hudCamp = $("hudCamp");
const hudLevel = $("hudLevel");
const xpFill = $("xpFill");

const mailDot = $("mailDot");

const modal = $("modal");
const modalTitle = $("modalTitle");
const modalText = $("modalText");
const toastEl = $("toast");

const inventoryPanel = $("inventoryPanel");
const inventoryGrid = $("inventoryGrid");
const closeInventoryBtn = $("closeInventoryBtn");
const inventoryBtn = $("inventoryBtn");
const invGold = $("invGold");
const invCamp = $("invCamp");

const questPanel = $("questPanel");
const questBody = $("questBody");
const closeQuestBtn = $("closeQuestBtn");
const claimQuestBtn = $("claimQuestBtn");
const gameQuestBtn = $("gameQuestBtn");
const lobbyQuestBtn = $("lobbyQuestBtn");

const canvas = $("game");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 540;
ctx.imageSmoothingEnabled = false;

const saveKey = "redvyr_phase2f_save";

const images = {};
const files = {
  grass: "grass.png",
  path: "path.png",
  tree: "tree.png",
  rock: "rock.png",
  mascot: "mascot.png",
  gold: "gold.png",
  wood: "wood.png",
  stone: "stone.png",
  inventory: "inventory.png",
  campfire: "campfire.png",
  chest: "chest.png"
};

for (const key in files) {
  images[key] = new Image();
  images[key].src = files[key];
}

const state = {
  name: "Guest Hero",
  world: "World A - Main Realm",

  gold: 0,
  wood: 0,
  stone: 0,

  campLevel: 1,
  level: 1,
  xp: 0,

  mailClaimed: false,

  questStep: 0,
  questCycle: 1,
  questBaseGold: 0,
  questBaseWood: 0,
  questBaseStone: 0,
  questBaseCamp: 1
};

const player = {
  x: 520,
  y: 430,
  vx: 0,
  vy: 0,
  speed: 4.0,
  acceleration: 0.55,
  friction: 0.82,
  moving: false,
  bob: 0
};

const camera = {
  x: 0,
  y: 0,
  tx: 0,
  ty: 0
};

const map = {
  width: 1920,
  height: 1280,
  tile: 32
};

const keys = new Set();
let objects = [];
let floatingTexts = [];

const modalInfo = {
  Shop: "Shop is preview-only for now. Later you could buy axes, backpacks, boosts, cosmetics, and camp upgrades.",
  Kingdoms: "Kingdoms come later. First we are finishing the core grind loop.",
  Mail: "Welcome to Redvyr! You claimed 5 bonus gold for checking your mail.",
  Settings: "Settings are coming later. For now, use Inventory to view your resources."
};

/* =========================
   LEVEL / XP
========================= */

function xpNeeded() {
  return 50 + (state.level - 1) * 25;
}

function addXp(amount) {
  state.xp += amount;

  while (state.xp >= xpNeeded()) {
    state.xp -= xpNeeded();
    state.level += 1;

    toast("Level Up! You are now Level " + state.level);
    addFloatingText(player.x, player.y - 70, "LEVEL UP!");
  }
}

/* =========================
   QUEST CHAIN
========================= */

function getCurrentQuest() {
  const cycle = state.questCycle;

  const quests = [
    {
      id: "gather",
      title: "Gather Supplies",
      desc: "Collect resources for your camp.",
      woodNeeded: 6 + (cycle - 1) * 4,
      stoneNeeded: 4 + (cycle - 1) * 3,
      goldNeeded: 0,
      campNeeded: 0,
      rewardGold: 25 + (cycle - 1) * 15,
      rewardXp: 25 + (cycle - 1) * 10
    },
    {
      id: "upgrade",
      title: "Upgrade Your Camp",
      desc: "Make your camp stronger.",
      woodNeeded: 0,
      stoneNeeded: 0,
      goldNeeded: 0,
      campNeeded: 2 + (cycle - 1),
      rewardGold: 40 + (cycle - 1) * 20,
      rewardXp: 35 + (cycle - 1) * 15
    },
    {
      id: "earn",
      title: "Earn Gold",
      desc: "Gather, mine, and open chests to earn gold.",
      woodNeeded: 0,
      stoneNeeded: 0,
      goldNeeded: 60 + (cycle - 1) * 40,
      campNeeded: 0,
      rewardGold: 30 + (cycle - 1) * 20,
      rewardXp: 40 + (cycle - 1) * 20
    }
  ];

  return quests[state.questStep] || quests[0];
}

function getQuestProgressText() {
  const quest = getCurrentQuest();

  const woodGained = Math.max(0, state.wood - state.questBaseWood);
  const stoneGained = Math.max(0, state.stone - state.questBaseStone);
  const goldGained = Math.max(0, state.gold - state.questBaseGold);

  let lines = [];

  lines.push("Chain " + state.questCycle + " · Quest " + (state.questStep + 1) + "/3");
  lines.push("");
  lines.push(quest.title);
  lines.push(quest.desc);
  lines.push("");

  if (quest.woodNeeded > 0) {
    lines.push("Wood: " + Math.min(woodGained, quest.woodNeeded) + "/" + quest.woodNeeded);
  }

  if (quest.stoneNeeded > 0) {
    lines.push("Stone: " + Math.min(stoneGained, quest.stoneNeeded) + "/" + quest.stoneNeeded);
  }

  if (quest.goldNeeded > 0) {
    lines.push("Gold Earned: " + Math.min(goldGained, quest.goldNeeded) + "/" + quest.goldNeeded);
  }

  if (quest.campNeeded > 0) {
    lines.push("Camp Level: " + Math.min(state.campLevel, quest.campNeeded) + "/" + quest.campNeeded);
  }

  lines.push("");
  lines.push("Reward: " + quest.rewardGold + " gold + " + quest.rewardXp + " XP");

  if (canClaimQuest()) {
    lines.push("");
    lines.push("Ready to claim!");
  }

  return lines.join("\n");
}

function canClaimQuest() {
  const quest = getCurrentQuest();

  const woodGained = Math.max(0, state.wood - state.questBaseWood);
  const stoneGained = Math.max(0, state.stone - state.questBaseStone);
  const goldGained = Math.max(0, state.gold - state.questBaseGold);

  if (quest.woodNeeded > 0 && woodGained < quest.woodNeeded) return false;
  if (quest.stoneNeeded > 0 && stoneGained < quest.stoneNeeded) return false;
  if (quest.goldNeeded > 0 && goldGained < quest.goldNeeded) return false;
  if (quest.campNeeded > 0 && state.campLevel < quest.campNeeded) return false;

  return true;
}

function claimQuest() {
  if (!canClaimQuest()) {
    toast("Quest is not ready yet.");
    return;
  }

  const quest = getCurrentQuest();

  state.gold += quest.rewardGold;
  addXp(quest.rewardXp);

  addFloatingText(player.x, player.y - 60, "+QUEST");
  toast("Quest claimed! +" + quest.rewardGold + " gold");

  state.questStep += 1;

  if (state.questStep >= 3) {
    state.questStep = 0;
    state.questCycle += 1;
    toast("Quest chain complete! Chain " + state.questCycle + " started.");
  }

  resetQuestBaseline();

  save();
  syncUI();
}

function resetQuestBaseline() {
  state.questBaseGold = state.gold;
  state.questBaseWood = state.wood;
  state.questBaseStone = state.stone;
  state.questBaseCamp = state.campLevel;
}

/* =========================
   SAVE / UI
========================= */

function loadSave() {
  try {
    const raw = localStorage.getItem(saveKey);
    if (!raw) return;

    const data = JSON.parse(raw);

    state.name = data.name || state.name;
    state.world = "World A - Main Realm";

    state.gold = Number(data.gold || 0);
    state.wood = Number(data.wood || 0);
    state.stone = Number(data.stone || 0);

    state.campLevel = Number(data.campLevel || 1);
    state.level = Number(data.level || 1);
    state.xp = Number(data.xp || 0);

    state.mailClaimed = Boolean(data.mailClaimed);

    state.questStep = Number(data.questStep || 0);
    state.questCycle = Number(data.questCycle || 1);
    state.questBaseGold = Number(data.questBaseGold || 0);
    state.questBaseWood = Number(data.questBaseWood || 0);
    state.questBaseStone = Number(data.questBaseStone || 0);
    state.questBaseCamp = Number(data.questBaseCamp || 1);
  } catch {}

  nicknameInput.value = state.name;
  worldInput.value = state.world;
  lobbyWorld.value = state.world;

  syncUI();
}

function save() {
  localStorage.setItem(saveKey, JSON.stringify(state));
}

function syncUI() {
  profileName.textContent = state.name;
  profileGold.textContent = state.gold;
  profileLevel.textContent = state.level;
  lobbyNameTag.textContent = state.name;

  hudName.textContent = state.name;
  hudWorld.textContent = state.world;
  hudGold.textContent = state.gold;
  hudWood.textContent = state.wood;
  hudStone.textContent = state.stone;
  hudCamp.textContent = state.campLevel;
  hudLevel.textContent = state.level;

  const xpPercent = Math.min(100, (state.xp / xpNeeded()) * 100);
  xpFill.style.width = xpPercent + "%";

  mailDot.style.display = state.mailClaimed ? "none" : "inline-block";

  updateInventoryPanel();
  updateQuestPanel();
}

/* =========================
   BUTTONS / PANELS
========================= */

$("enterBtn").addEventListener("click", () => {
  state.name = nicknameInput.value.trim() || "Guest Hero";
  state.world = "World A - Main Realm";

  worldInput.value = state.world;
  lobbyWorld.value = state.world;

  save();
  syncUI();

  startScreen.classList.add("hidden");
  lobbyScreen.classList.remove("hidden");
  toast("Welcome, " + state.name + ".");
});

$("changeNameBtn").addEventListener("click", () => {
  lobbyScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

lobbyWorld.addEventListener("change", () => {
  state.world = "World A - Main Realm";
  lobbyWorld.value = state.world;
  worldInput.value = state.world;

  save();
  syncUI();

  toast("World A selected.");
});

$("playGameBtn").addEventListener("click", () => {
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  createWorld();

  syncUI();
  toast("Entering World A...");
});

$("backToLobbyBtn").addEventListener("click", () => {
  gameScreen.classList.add("hidden");
  lobbyScreen.classList.remove("hidden");

  closeInventory();
  closeQuest();

  save();
  syncUI();
});

document.querySelectorAll("[data-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    const title = button.dataset.modal;

    if (title === "Mail" && !state.mailClaimed) {
      state.mailClaimed = true;
      state.gold += 5;
      save();
      syncUI();
    }

    openModal(title);
  });
});

function openModal(title) {
  modalTitle.textContent = title;
  modalText.textContent = modalInfo[title] || "Coming soon.";
  modal.classList.remove("hidden");
}

$("closeModalBtn").addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

inventoryBtn.addEventListener("click", () => {
  if (inventoryPanel.classList.contains("hidden")) {
    openInventory();
  } else {
    closeInventory();
  }
});

closeInventoryBtn.addEventListener("click", closeInventory);

function openInventory() {
  closeQuest();
  updateInventoryPanel();
  inventoryPanel.classList.remove("hidden");
}

function closeInventory() {
  inventoryPanel.classList.add("hidden");
}

gameQuestBtn.addEventListener("click", openQuest);
lobbyQuestBtn.addEventListener("click", openQuest);
closeQuestBtn.addEventListener("click", closeQuest);
claimQuestBtn.addEventListener("click", claimQuest);

function openQuest() {
  closeInventory();
  updateQuestPanel();
  questPanel.classList.remove("hidden");
}

function closeQuest() {
  questPanel.classList.add("hidden");
}

function updateQuestPanel() {
  if (!questBody || !claimQuestBtn) return;

  questBody.textContent = getQuestProgressText();

  claimQuestBtn.disabled = !canClaimQuest();

  if (canClaimQuest()) {
    claimQuestBtn.textContent = "Claim Reward";
  } else {
    claimQuestBtn.textContent = "Quest In Progress";
  }
}

function updateInventoryPanel() {
  if (!inventoryGrid) return;

  invGold.textContent = state.gold;
  invCamp.textContent = state.campLevel;

  inventoryGrid.innerHTML = "";

  const stacks = [
    ...makeStacks("wood", state.wood, images.wood),
    ...makeStacks("stone", state.stone, images.stone)
  ];

  const totalSlots = 25;

  for (let i = 0; i < totalSlots; i++) {
    const slot = document.createElement("div");
    slot.className = "inventory-slot";

    if (stacks[i]) {
      const img = document.createElement("img");
      img.src = stacks[i].src;

      const count = document.createElement("span");
      count.textContent = "x" + stacks[i].count;

      slot.appendChild(img);
      slot.appendChild(count);
    } else {
      slot.classList.add("empty");
    }

    inventoryGrid.appendChild(slot);
  }
}

function makeStacks(type, amount, image) {
  const result = [];
  let remaining = amount;

  while (remaining > 0) {
    const count = Math.min(16, remaining);

    result.push({
      type,
      count,
      src: image.src
    });

    remaining -= count;
  }

  return result;
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");

  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 1900);
}

/* =========================
   INPUT
========================= */

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());

  if (!gameScreen.classList.contains("hidden") && event.key.toLowerCase() === "e") {
    interact();
  }

  if (!gameScreen.classList.contains("hidden") && event.key.toLowerCase() === "i") {
    if (inventoryPanel.classList.contains("hidden")) openInventory();
    else closeInventory();
  }

  if (!gameScreen.classList.contains("hidden") && event.key.toLowerCase() === "q") {
    if (questPanel.classList.contains("hidden")) openQuest();
    else closeQuest();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

/* =========================
   WORLD
========================= */

function createWorld() {
  objects = [];

  objects.push({
    x: 300,
    y: 245,
    w: 64,
    h: 64,
    kind: "campfire",
    interact: true,
    label: "upgrade camp",
    action: "camp"
  });

  objects.push({
    x: 385,
    y: 258,
    w: 64,
    h: 64,
    kind: "chest",
    interact: true,
    label: "open starter chest",
    action: "chest",
    gold: 20,
    used: false
  });

  for (let i = 0; i < 18; i++) {
    const pos = randomSafePosition(64, 96);

    const tree = {
      x: pos.x,
      y: pos.y,
      w: 64,
      h: 96,
      kind: "tree",
      interact: true,
      label: "hit tree",
      action: "wood",
      amount: 2,
      hitsNeeded: randomInt(2, 5),
      hitsLeft: 0,
      shake: 0
    };

    tree.hitsLeft = tree.hitsNeeded;
    objects.push(tree);
  }

  for (let i = 0; i < 10; i++) {
    const pos = randomSafePosition(48, 32);

    const rock = {
      x: pos.x,
      y: pos.y,
      w: 48,
      h: 32,
      kind: "rock",
      interact: true,
      label: "mine rock",
      action: "stone",
      amount: 2,
      hitsNeeded: randomInt(2, 5),
      hitsLeft: 0,
      shake: 0
    };

    rock.hitsLeft = rock.hitsNeeded;
    objects.push(rock);
  }

  player.x = 520;
  player.y = 430;
  player.vx = 0;
  player.vy = 0;

  camera.x = 0;
  camera.y = 0;
}

function randomSafePosition(w, h) {
  let tries = 0;

  while (tries < 200) {
    tries++;

    const x = Math.floor(randomRange(80, map.width - 140) / 32) * 32;
    const y = Math.floor(randomRange(100, map.height - 140) / 32) * 32;

    const test = { x, y, w, h };

    if (isInCampArea(test)) continue;
    if (isOnMainPath(test)) continue;
    if (isTooCloseToPlayer(test)) continue;

    let overlapsOther = false;

    for (const obj of objects) {
      const padding = 32;

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
      return { x, y };
    }
  }

  return { x: 900, y: 700 };
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function isInCampArea(box) {
  const camp = {
    x: 240,
    y: 190,
    w: 260,
    h: 190
  };

  return overlap(box, camp);
}

function isOnMainPath(box) {
  const horizontalPath = {
    x: 0,
    y: 330,
    w: map.width,
    h: 310
  };

  const verticalPath = {
    x: 735,
    y: 0,
    w: 230,
    h: map.height
  };

  return overlap(box, horizontalPath) || overlap(box, verticalPath);
}

function isTooCloseToPlayer(box) {
  const spawn = {
    x: 400,
    y: 330,
    w: 260,
    h: 220
  };

  return overlap(box, spawn);
}

/* =========================
   COLLISION
========================= */

function playerHitbox(x = player.x, y = player.y) {
  return {
    x: x - 18,
    y: y + 12,
    w: 36,
    h: 32
  };
}

function objectHitbox(obj) {
  if (obj.kind === "tree") {
    return {
      x: obj.x + 20,
      y: obj.y + 64,
      w: 24,
      h: 28
    };
  }

  if (obj.kind === "campfire") {
    return {
      x: obj.x + 18,
      y: obj.y + 26,
      w: 28,
      h: 26
    };
  }

  if (obj.kind === "chest") {
    return {
      x: obj.x + 12,
      y: obj.y + 18,
      w: 40,
      h: 34
    };
  }

  return {
    x: obj.x + 4,
    y: obj.y + 4,
    w: obj.w - 8,
    h: obj.h - 8
  };
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

  if (
    box.x < 0 ||
    box.y < 0 ||
    box.x + box.w > map.width ||
    box.y + box.h > map.height
  ) {
    return false;
  }

  for (const obj of objects) {
    if (obj.hidden) continue;

    if (overlap(box, objectHitbox(obj))) {
      return false;
    }
  }

  return true;
}

/* =========================
   UPDATE / INTERACT
========================= */

function update() {
  if (gameScreen.classList.contains("hidden")) return;

  for (const obj of objects) {
    if (obj.shake && obj.shake > 0) {
      obj.shake -= 1;
    }
  }

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

  player.vx += inputX * player.acceleration;
  player.vy += inputY * player.acceleration;

  player.vx *= player.friction;
  player.vy *= player.friction;

  const currentSpeed = Math.hypot(player.vx, player.vy);

  if (currentSpeed > player.speed) {
    player.vx = (player.vx / currentSpeed) * player.speed;
    player.vy = (player.vy / currentSpeed) * player.speed;
  }

  player.moving = Math.abs(player.vx) > 0.08 || Math.abs(player.vy) > 0.08;

  if (canMoveTo(player.x + player.vx, player.y)) {
    player.x += player.vx;
  } else {
    player.vx = 0;
  }

  if (canMoveTo(player.x, player.y + player.vy)) {
    player.y += player.vy;
  } else {
    player.vy = 0;
  }

  if (player.moving) {
    player.bob += 0.18;
  }

  camera.tx = clamp(player.x - canvas.width / 2, 0, map.width - canvas.width);
  camera.ty = clamp(player.y - canvas.height / 2, 0, map.height - canvas.height);

  camera.x += (camera.tx - camera.x) * 0.075;
  camera.y += (camera.ty - camera.y) * 0.075;

  const near = nearbyInteractable();
  const prompt = $("interactPrompt");

  if (near) {
    if (near.action === "wood" || near.action === "stone") {
      prompt.textContent = "Press E to " + near.label + " (" + near.hitsLeft + " hits left)";
    } else {
      prompt.textContent = "Press E to " + near.label;
    }

    prompt.classList.remove("hidden");
  } else {
    prompt.classList.add("hidden");
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function nearbyInteractable() {
  const reach = {
    x: player.x - 54,
    y: player.y - 54,
    w: 108,
    h: 108
  };

  return objects.find((obj) => {
    return obj.interact && !obj.hidden && overlap(reach, objectHitbox(obj));
  });
}

function interact() {
  const obj = nearbyInteractable();

  if (!obj) return;

  if (obj.action === "wood" || obj.action === "stone") {
    hitResource(obj);
  }

  if (obj.action === "chest") {
    if (obj.used) {
      toast("Chest is empty.");
    } else {
      obj.used = true;
      obj.hidden = true;
      state.gold += obj.gold || 20;
      addXp(10);

      toast("+" + (obj.gold || 20) + " gold");
      addFloatingText(obj.x, obj.y, "+Gold");
    }
  }

  if (obj.action === "camp") {
    upgradeCamp();
  }

  save();
  syncUI();
}

function hitResource(obj) {
  obj.hitsLeft -= 1;
  obj.shake = 8;

  if (obj.hitsLeft > 0) {
    toast("Hit! " + obj.hitsLeft + " left");
    return;
  }

  if (obj.action === "wood") {
    state.wood += obj.amount || 1;
    state.gold += campGoldBonus();
    addXp(5);
    toast("+" + (obj.amount || 1) + " wood");
    addFloatingText(obj.x, obj.y, "+" + (obj.amount || 1) + " Wood");
    temporarilyHide(obj, resourceRespawnTime());
  }

  if (obj.action === "stone") {
    state.stone += obj.amount || 1;
    state.gold += campGoldBonus();
    addXp(5);
    toast("+" + (obj.amount || 1) + " stone");
    addFloatingText(obj.x, obj.y, "+" + (obj.amount || 1) + " Stone");
    temporarilyHide(obj, resourceRespawnTime() + 2000);
  }
}

function campGoldBonus() {
  if (state.campLevel >= 2) return 2;
  return 1;
}

function resourceRespawnTime() {
  if (state.campLevel >= 3) return 6500;
  return 9500;
}

function upgradeCamp() {
  const neededGold = 25 * state.campLevel;
  const neededWood = 8 * state.campLevel;
  const neededStone = 5 * state.campLevel;

  if (
    state.gold >= neededGold &&
    state.wood >= neededWood &&
    state.stone >= neededStone
  ) {
    state.gold -= neededGold;
    state.wood -= neededWood;
    state.stone -= neededStone;
    state.campLevel += 1;
    addXp(20);

    toast("Camp upgraded to level " + state.campLevel + "!");
    addFloatingText(player.x, player.y - 50, "Camp Lv." + state.campLevel);
  } else {
    toast(
      "Need " +
      neededGold +
      " gold, " +
      neededWood +
      " wood, " +
      neededStone +
      " stone."
    );
  }
}

function temporarilyHide(obj, ms) {
  obj.hidden = true;
  obj.hitsLeft = obj.hitsNeeded;

  setTimeout(() => {
    obj.hidden = false;
  }, ms);
}

function addFloatingText(x, y, text) {
  floatingTexts.push({
    x,
    y,
    text,
    life: 70
  });
}

/* =========================
   DRAW
========================= */

function draw() {
  if (gameScreen.classList.contains("hidden")) return;

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

  drawMap();
  drawObjects();
  drawPlayer();
  drawFloatingTexts();

  ctx.restore();
}

function drawMap() {
  const tile = map.tile;

  for (let y = 0; y < map.height; y += tile) {
    for (let x = 0; x < map.width; x += tile) {
      drawImg(images.grass, x, y, tile, tile, "#55b943");
    }
  }

  for (let y = 352; y <= 608; y += tile) {
    for (let x = 0; x < map.width; x += tile) {
      drawImg(images.path, x, y, tile, tile, "#c98b55");
    }
  }

  for (let x = 768; x <= 928; x += tile) {
    for (let y = 0; y < map.height; y += tile) {
      drawImg(images.path, x, y, tile, tile, "#c98b55");
    }
  }

  for (let y = 224; y <= 320; y += tile) {
    for (let x = 256; x <= 448; x += tile) {
      drawImg(images.path, x, y, tile, tile, "#c98b55");
    }
  }
}

function drawObjects() {
  const sorted = [...objects].sort((a, b) => {
    return a.y + a.h - (b.y + b.h);
  });

  for (const obj of sorted) {
    if (obj.hidden) continue;

    const shakeX = obj.shake > 0 ? Math.sin(obj.shake * 2.5) * 3 : 0;
    const drawX = obj.x + shakeX;

    if (obj.kind === "tree") {
      drawImg(images.tree, drawX, obj.y, obj.w, obj.h, "#2f7832");
    }

    if (obj.kind === "rock") {
      drawImg(images.rock, drawX, obj.y, obj.w, obj.h, "#89939e");
    }

    if (obj.kind === "chest") {
      drawChest(drawX, obj.y, obj.w, obj.h, obj.used);
    }

    if (obj.kind === "campfire") {
      drawCampfire(drawX, obj.y, obj.w, obj.h);
    }
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

  drawNameTag(player.x, player.y - 82, state.name);
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

function drawChest(x, y, w, h, opened) {
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

function drawCampfire(x, y, w, h) {
  if (images.campfire.complete && images.campfire.naturalWidth > 0) {
    drawImg(images.campfire, x, y, 64, 64, "#ff8a22");

    ctx.fillStyle = "#f2c35f";
    ctx.font = "bold 14px Arial";
    ctx.fillText("Lv." + state.campLevel, x + 8, y - 6);

    return;
  }

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(x + 12, y + 46, w - 24, 9);

  ctx.fillStyle = "#5b2b12";
  ctx.fillRect(x + 12, y + 42, w - 24, 12);

  ctx.fillStyle = "#ff8a22";
  ctx.fillRect(x + 24, y + 18, 20, 28);

  ctx.fillStyle = "#ffd45e";
  ctx.fillRect(x + 30, y + 8, 9, 34);

  ctx.fillStyle = "#f2c35f";
  ctx.font = "bold 14px Arial";
  ctx.fillText("Lv." + state.campLevel, x + 8, y - 6);
}

function drawImg(img, x, y, w, h, fallback) {
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(
      img,
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h)
    );
  } else {
    ctx.fillStyle = fallback;
    ctx.fillRect(
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h)
    );
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

loadSave();
createWorld();
loop();
