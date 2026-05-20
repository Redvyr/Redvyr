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
const hpFill = $("hpFill");
const hudHpText = $("hudHpText");
const dayNightLabel = $("dayNightLabel");
const dayNightFill = $("dayNightFill");

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

const statsPanel = $("statsPanel");
const statsBtn = $("statsBtn");
const closeStatsBtn = $("closeStatsBtn");
const statsList = $("statsList");
const statPoints = $("statPoints");
const statGatherDamage = $("statGatherDamage");
const statMaxHp = $("statMaxHp");

const campPanel = $("campPanel");
const closeCampBtn = $("closeCampBtn");
const campBody = $("campBody");
const campUpgradeBtn = $("campUpgradeBtn");

const canvas = $("game");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 540;
ctx.imageSmoothingEnabled = false;

const saveKey = "redvyr_phase3b_save";

const DAY_MS = 180000;
const NIGHT_MS = 90000;
const FULL_CYCLE_MS = DAY_MS + NIGHT_MS;

const images = {};
const files = {
  grass: "grass.png",
  grassflower: "grassflower.png",
  grassrock: "grassrock.png",
  path: "path.png",
  rockpath: "rockpath.png",
  tree: "tree.png",
  rock: "rock.png",
  bush1: "bush1.png",
  bush2: "bush2.png",
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

  hp: 100,
  statPoints: 0,
  stats: {
    strength: 0,
    defense: 0,
    magic: 0,
    sword: 0,
    archery: 0
  },

  mailClaimed: false,

  questStep: 0,
  questCycle: 1,
  questBaseGold: 0,
  questBaseWood: 0,
  questBaseStone: 0,
  questBaseCamp: 1,

  cycleStartedAt: Date.now()
};

const statInfo = [
  { key: "strength", name: "Strength", desc: "Increases gathering damage." },
  { key: "defense", name: "Defense", desc: "Increases max HP." },
  { key: "magic", name: "Magic", desc: "Future spell power." },
  { key: "sword", name: "Sword", desc: "Future melee damage." },
  { key: "archery", name: "Archery", desc: "Future projectile damage." }
];

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
let tileVariants = [];

const modalInfo = {
  Shop: "Shop is preview-only for now. Later you could buy cosmetics on the homepage and tools/items from NPCs inside the world.",
  Kingdoms: "Kingdoms come later. Your campfire is the first step toward a future kingdom core.",
  Mail: "Welcome to Redvyr! You claimed 5 bonus gold for checking your mail.",
  Settings: "Settings are coming later. For now, use Inventory, Quests, Stats, and your Campfire panel."
};

/* LEVEL / STATS */

function xpNeeded() {
  return 50 + (state.level - 1) * 25;
}

function maxHp() {
  return 100 + state.stats.defense * 10;
}

function strengthMultiplier() {
  return Math.min(4, 1 + state.stats.strength * 0.08);
}

function gatheringDamage() {
  return Number(strengthMultiplier().toFixed(2));
}

function addXp(amount) {
  state.xp += amount;

  while (state.xp >= xpNeeded()) {
    state.xp -= xpNeeded();
    state.level += 1;
    state.statPoints += 3;

    state.hp = maxHp();

    toast("Level Up! +3 stat points");
    addFloatingText(player.x, player.y - 70, "LEVEL UP!");
  }
}

function addStat(statKey) {
  if (state.statPoints <= 0) {
    toast("No stat points available.");
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(state.stats, statKey)) return;

  state.stats[statKey] += 1;
  state.statPoints -= 1;

  if (statKey === "defense") {
    state.hp = maxHp();
  }

  save();
  syncUI();
}

/* DAY / NIGHT */

function cycleInfo() {
  const elapsed = (Date.now() - state.cycleStartedAt) % FULL_CYCLE_MS;

  if (elapsed < DAY_MS) {
    return {
      phase: "Day",
      progress: elapsed / DAY_MS,
      nightAlpha: 0
    };
  }

  const nightElapsed = elapsed - DAY_MS;
  const nightProgress = nightElapsed / NIGHT_MS;

  let alpha = 0.52;

  if (nightProgress < 0.18) {
    alpha = 0.52 * (nightProgress / 0.18);
  } else if (nightProgress > 0.82) {
    alpha = 0.52 * ((1 - nightProgress) / 0.18);
  }

  return {
    phase: "Night",
    progress: nightProgress,
    nightAlpha: Math.max(0, Math.min(0.52, alpha))
  };
}

function updateDayNightUI() {
  const info = cycleInfo();

  dayNightLabel.textContent = info.phase;
  dayNightFill.style.width = Math.round(info.progress * 100) + "%";

  if (info.phase === "Night") {
    dayNightFill.style.background = "linear-gradient(90deg, #3952b8, #80d7ff)";
  } else {
    dayNightFill.style.background = "linear-gradient(90deg, #f2c35f, #80d7ff)";
  }
}

/* QUESTS */

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

/* CAMP */

function campUpgradeCost() {
  return {
    gold: 25 * state.campLevel,
    wood: 8 * state.campLevel,
    stone: 5 * state.campLevel
  };
}

function campLightRadius() {
  return 90 + state.campLevel * 16;
}

function campHealRadius() {
  return 85 + state.campLevel * 14;
}

function campHealRate() {
  return 0.025 * state.campLevel;
}

function campTierName() {
  if (state.campLevel >= 20) return "Kingdom Core Preview";
  if (state.campLevel >= 10) return "Village Core Preview";
  if (state.campLevel >= 5) return "Camp Core Preview";
  return "Campfire";
}

function campBenefitsHTML() {
  const benefits = [
    { level: 1, text: "Healing zone unlocked" },
    { level: 2, text: "+2 gold from gathering" },
    { level: 3, text: "Faster resource respawn" },
    { level: 4, text: "Bigger healing and light radius" },
    { level: 5, text: "Camp Core preview unlocked" },
    { level: 10, text: "Village Core preview unlocked later" },
    { level: 20, text: "Kingdom Core preview unlocked later" }
  ];

  return benefits
    .map((benefit) => {
      const unlocked = state.campLevel >= benefit.level ? " unlocked" : "";
      return `<div class="camp-benefit${unlocked}">Level ${benefit.level}: ${benefit.text}</div>`;
    })
    .join("");
}

function updateCampPanel() {
  if (!campBody) return;

  const cost = campUpgradeCost();

  campBody.innerHTML = `
    <div class="camp-card">
      <strong>${campTierName()} · Level ${state.campLevel}</strong>
      Your campfire is the heart of your future settlement. Upgrade it to improve healing, light, gathering rewards, and future kingdom systems.
    </div>

    <div class="camp-card">
      <strong>Next Upgrade Cost</strong>
      <div class="camp-cost">
        <div>${cost.gold} Gold</div>
        <div>${cost.wood} Wood</div>
        <div>${cost.stone} Stone</div>
      </div>
    </div>

    <div class="camp-card">
      <strong>Current Power</strong>
      Healing Radius: ${Math.round(campHealRadius())}<br>
      Light Radius: ${Math.round(campLightRadius())}<br>
      Heal Rate: ${campHealRate().toFixed(3)} HP/tick
    </div>

    <div class="camp-card">
      <strong>Camp Benefits</strong>
      <div class="camp-benefit-list">
        ${campBenefitsHTML()}
      </div>
    </div>
  `;

  const canUpgrade =
    state.gold >= cost.gold &&
    state.wood >= cost.wood &&
    state.stone >= cost.stone;

  campUpgradeBtn.disabled = !canUpgrade;
  campUpgradeBtn.textContent = canUpgrade ? "Upgrade Camp" : "Need More Resources";
}

function openCamp() {
  closeInventory();
  closeQuest();
  closeStats();
  updateCampPanel();
  campPanel.classList.remove("hidden");
}

function closeCamp() {
  campPanel.classList.add("hidden");
}

/* SAVE / UI */

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

    state.hp = Number(data.hp || maxHp());
    state.statPoints = Number(data.statPoints || 0);

    if (data.stats) {
      state.stats.strength = Number(data.stats.strength || 0);
      state.stats.defense = Number(data.stats.defense || 0);
      state.stats.magic = Number(data.stats.magic || 0);
      state.stats.sword = Number(data.stats.sword || 0);
      state.stats.archery = Number(data.stats.archery || 0);
    }

    state.mailClaimed = Boolean(data.mailClaimed);

    state.questStep = Number(data.questStep || 0);
    state.questCycle = Number(data.questCycle || 1);
    state.questBaseGold = Number(data.questBaseGold || 0);
    state.questBaseWood = Number(data.questBaseWood || 0);
    state.questBaseStone = Number(data.questBaseStone || 0);
    state.questBaseCamp = Number(data.questBaseCamp || 1);

    state.cycleStartedAt = Number(data.cycleStartedAt || Date.now());
  } catch {}

  state.hp = Math.min(state.hp, maxHp());

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

  const hpPercent = Math.min(100, (state.hp / maxHp()) * 100);
  hpFill.style.width = hpPercent + "%";
  hudHpText.textContent = Math.round(state.hp) + "/" + maxHp();

  mailDot.style.display = state.mailClaimed ? "none" : "inline-block";

  updateDayNightUI();
  updateInventoryPanel();
  updateQuestPanel();
  updateStatsPanel();
  updateCampPanel();
}

/* BUTTONS / PANELS */

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
  closeStats();
  closeCamp();

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
  if (inventoryPanel.classList.contains("hidden")) openInventory();
  else closeInventory();
});

closeInventoryBtn.addEventListener("click", closeInventory);

function openInventory() {
  closeQuest();
  closeStats();
  closeCamp();
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
  closeStats();
  closeCamp();
  updateQuestPanel();
  questPanel.classList.remove("hidden");
}

function closeQuest() {
  questPanel.classList.add("hidden");
}

statsBtn.addEventListener("click", () => {
  if (statsPanel.classList.contains("hidden")) openStats();
  else closeStats();
});

closeStatsBtn.addEventListener("click", closeStats);

function openStats() {
  closeInventory();
  closeQuest();
  closeCamp();
  updateStatsPanel();
  statsPanel.classList.remove("hidden");
}

function closeStats() {
  statsPanel.classList.add("hidden");
}

closeCampBtn.addEventListener("click", closeCamp);
campUpgradeBtn.addEventListener("click", () => {
  upgradeCamp();
  updateCampPanel();
});

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

function updateStatsPanel() {
  if (!statsList) return;

  statPoints.textContent = state.statPoints;
  statGatherDamage.textContent = gatheringDamage().toFixed(2) + "x";
  statMaxHp.textContent = maxHp();

  statsList.innerHTML = "";

  for (const stat of statInfo) {
    const row = document.createElement("div");
    row.className = "stat-line";

    const info = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = stat.name + ": " + state.stats[stat.key];

    const desc = document.createElement("span");
    desc.textContent = stat.desc;

    info.appendChild(title);
    info.appendChild(desc);

    const value = document.createElement("span");
    value.textContent = "+" + state.stats[stat.key];

    const button = document.createElement("button");
    button.textContent = "+";
    button.disabled = state.statPoints <= 0;
    button.addEventListener("click", () => addStat(stat.key));

    row.appendChild(info);
    row.appendChild(value);
    row.appendChild(button);

    statsList.appendChild(row);
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

/* INPUT */

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

  if (!gameScreen.classList.contains("hidden") && event.key.toLowerCase() === "c") {
    if (statsPanel.classList.contains("hidden")) openStats();
    else closeStats();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

/* WORLD */

function createWorld() {
  objects = [];
  floatingTexts = [];
  tileVariants = buildTileVariants();

  objects.push({
    x: 300,
    y: 245,
    w: 64,
    h: 64,
    kind: "campfire",
    interact: true,
    label: "open camp",
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

    objects.push(makeResource({
      x: pos.x,
      y: pos.y,
      w: 64,
      h: 96,
      kind: "tree",
      action: "wood",
      label: "hit tree",
      amount: 2,
      maxHp: randomInt(5, 9)
    }));
  }

  for (let i = 0; i < 10; i++) {
    const pos = randomSafePosition(52, 44);

    objects.push(makeResource({
      x: pos.x,
      y: pos.y,
      w: 52,
      h: 44,
      kind: "rock",
      action: "stone",
      label: "mine rock",
      amount: 2,
      maxHp: randomInt(7, 12)
    }));
  }

  for (let i = 0; i < 16; i++) {
    const pos = randomSafePosition(48, 54);

    objects.push(makeResource({
      x: pos.x,
      y: pos.y,
      w: 48,
      h: 54,
      kind: Math.random() < 0.5 ? "bush1" : "bush2",
      action: "bush",
      label: "shake bush",
      amount: 1,
      maxHp: randomInt(2, 3),
      noCollision: true
    }));
  }

  player.x = 520;
  player.y = 430;
  player.vx = 0;
  player.vy = 0;

  camera.x = 0;
  camera.y = 0;
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
  const variants = [];

  for (let y = 0; y < map.height; y += map.tile) {
    const row = [];

    for (let x = 0; x < map.width; x += map.tile) {
      const path = isPathTile(x, y);
      const r = Math.random();

      let tile = "grass";

      if (path) {
        tile = r < 0.14 ? "rockpath" : "path";
      } else {
        if (r < 0.08) tile = "grassflower";
        else if (r < 0.15) tile = "grassrock";
        else tile = "grass";
      }

      row.push(tile);
    }

    variants.push(row);
  }

  return variants;
}

function isPathTile(x, y) {
  const onMainHorizontal = y >= 352 && y <= 608;
  const onMainVertical = x >= 768 && x <= 928;
  const onCampClearing = y >= 224 && y <= 320 && x >= 256 && x <= 448;

  return onMainHorizontal || onMainVertical || onCampClearing;
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

  if (obj.kind === "campfire") {
    return { x: obj.x + 18, y: obj.y + 26, w: 28, h: 26 };
  }

  if (obj.kind === "chest") {
    return { x: obj.x + 12, y: obj.y + 18, w: 40, h: 34 };
  }

  return { x: obj.x + 4, y: obj.y + 4, w: obj.w - 8, h: obj.h - 8 };
}

function interactHitbox(obj) {
  if (obj.kind === "bush1" || obj.kind === "bush2") {
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

    if (overlap(box, objectHitbox(obj))) {
      return false;
    }
  }

  return true;
}

/* UPDATE / INTERACT */

function update() {
  if (gameScreen.classList.contains("hidden")) return;

  healNearCampfire();
  updateDayNightUI();

  for (const obj of objects) {
    if (obj.shake && obj.shake > 0) obj.shake -= 1;
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

  if (canMoveTo(player.x + player.vx, player.y)) player.x += player.vx;
  else player.vx = 0;

  if (canMoveTo(player.x, player.y + player.vy)) player.y += player.vy;
  else player.vy = 0;

  if (player.moving) player.bob += 0.18;

  camera.tx = clamp(player.x - canvas.width / 2, 0, map.width - canvas.width);
  camera.ty = clamp(player.y - canvas.height / 2, 0, map.height - canvas.height);

  camera.x += (camera.tx - camera.x) * 0.075;
  camera.y += (camera.ty - camera.y) * 0.075;

  const near = nearbyInteractable();
  const prompt = $("interactPrompt");

  if (near) {
    if (near.action === "wood" || near.action === "stone" || near.action === "bush") {
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

function nearbyInteractable() {
  const reach = { x: player.x - 58, y: player.y - 58, w: 116, h: 116 };

  return objects.find((obj) => {
    return obj.interact && !obj.hidden && overlap(reach, interactHitbox(obj));
  });
}

function interact() {
  const obj = nearbyInteractable();

  if (!obj) return;

  if (obj.action === "wood" || obj.action === "stone" || obj.action === "bush") {
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
    openCamp();
  }

  save();
  syncUI();
}

function hitResource(obj) {
  const damage = gatheringDamage();

  obj.hp -= damage;
  obj.shake = 8;

  if (obj.hp > 0) {
    toast("Hit! -" + damage.toFixed(2));
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

  if (obj.action === "bush") {
    state.wood += 1;
    addXp(2);
    toast("+1 wood");
    addFloatingText(obj.x, obj.y, "+1 Wood");
    temporarilyHide(obj, 8000);
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
  const cost = campUpgradeCost();

  if (state.gold >= cost.gold && state.wood >= cost.wood && state.stone >= cost.stone) {
    state.gold -= cost.gold;
    state.wood -= cost.wood;
    state.stone -= cost.stone;
    state.campLevel += 1;
    addXp(20);

    toast("Camp upgraded to level " + state.campLevel + "!");
    addFloatingText(player.x, player.y - 50, "Camp Lv." + state.campLevel);
  } else {
    toast("Need " + cost.gold + " gold, " + cost.wood + " wood, " + cost.stone + " stone.");
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
  drawEntitiesLayered();
  drawFloatingTexts();

  ctx.restore();

  drawNightOverlay();
}

function drawMap() {
  const tile = map.tile;

  for (let y = 0; y < map.height; y += tile) {
    for (let x = 0; x < map.width; x += tile) {
      const row = Math.floor(y / tile);
      const col = Math.floor(x / tile);
      const key = tileVariants[row]?.[col] || "grass";

      drawImg(images[key], x, y, tile, tile, key === "path" || key === "rockpath" ? "#c98b55" : "#55b943");
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
  const drawX = obj.x + shakeX;

  if (obj.kind === "tree") drawImg(images.tree, drawX, obj.y, obj.w, obj.h, "#2f7832");
  if (obj.kind === "rock") drawImg(images.rock, drawX, obj.y, obj.w, obj.h, "#89939e");
  if (obj.kind === "bush1") drawImg(images.bush1, drawX, obj.y, obj.w, obj.h, "#3a9136");
  if (obj.kind === "bush2") drawImg(images.bush2, drawX, obj.y, obj.w, obj.h, "#3a9136");
  if (obj.kind === "chest") drawChest(drawX, obj.y, obj.w, obj.h, obj.used);
  if (obj.kind === "campfire") drawCampfire(drawX, obj.y, obj.w, obj.h);
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
  const radius = campLightRadius();

  const gradient = ctx.createRadialGradient(x + 32, y + 32, 12, x + 32, y + 32, radius);
  gradient.addColorStop(0, "rgba(255, 190, 60, 0.24)");
  gradient.addColorStop(1, "rgba(255, 190, 60, 0)");

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

    const light = ctx.createRadialGradient(sx, sy, 12, sx, sy, campLightRadius());
    light.addColorStop(0, "rgba(255, 198, 84, 0.26)");
    light.addColorStop(0.45, "rgba(255, 198, 84, 0.12)");
    light.addColorStop(1, "rgba(255, 198, 84, 0)");

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

loadSave();
createWorld();
loop();
