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
const fullscreenPrompt = $("fullscreenPrompt");
const enableFullscreenBtn = $("enableFullscreenBtn");
const skipFullscreenBtn = $("skipFullscreenBtn");
const campPlacementGuide = $("campPlacementGuide");
const campPlacementConfirm = $("campPlacementConfirm");
const confirmCampPlacementBtn = $("confirmCampPlacementBtn");
const retryCampPlacementBtn = $("retryCampPlacementBtn");
let fullscreenPromptShown = false;

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

const npcDialogue = $("npcDialogue");
const npcDialogueText = $("npcDialogueText");
const dialogueBuyBtn = $("dialogueBuyBtn");
const dialogueSellBtn = $("dialogueSellBtn");
const dialogueNoBtn = $("dialogueNoBtn");

const buyPanel = $("buyPanel");
const closeBuyBtn = $("closeBuyBtn");
const buyGoldText = $("buyGoldText");
const buyItems = $("buyItems");

const sellPanel = $("sellPanel");
const closeSellBtn = $("closeSellBtn");
const sellGoldText = $("sellGoldText");
const sellItems = $("sellItems");

const hotbar = $("hotbar");
const gameMenuBtn = $("gameMenuBtn");
const gameMenu = $("gameMenu");

const canvas = $("game");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 540;
ctx.imageSmoothingEnabled = false;

const saveKey = "redvyr_phase3d_save";

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
  chest: "chest.png",
  rarechest: "rarechest.png",
  legendarychest: "legendarychest.png",
  npc: "npc.png",
  potion: "HealthPotion.png",
  speedpotion: "SpeedPotion.png",
  axe: "axe.png",
  pickaxe: "pickaxe.png",
  copperore: "copperore.png",
  ironore: "ironore.png",
  rawcopper: "rawcopper.png",
  rawiron: "rawiron.png",
  copper: "copper.png",
  iron: "iron.png",
  steel: "steel.png",
  sword: "sword.png",
  slime: "slime.png",
  darkslime: "darkslime.png",
  slimegel: "slimegel.png"
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
  potions: 0,
  speedPotions: 0,
  slimeGel: 0,
  copperOre: 0,
  ironOre: 0,
  copper: 0,
  iron: 0,
  steel: 0,

  axes: [],
  pickaxes: [],
  swords: [],
  equippedAxeId: null,
  equippedPickaxeId: null,
  equippedSwordId: null,
  nextItemId: 1,
  hotbar: [null, null, null, null, null],
  droppedTools: [],
  droppedLoot: [],

  campPlaced: false,
  campX: null,
  campY: null,
  playerX: null,
  playerY: null,
  hasWorldPosition: false,
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
  { key: "strength", name: "Strength", desc: "Physical power: gathering and punching." },
  { key: "defense", name: "Defense", desc: "Increases max HP." },
  { key: "magic", name: "Magic", desc: "Future spell power." },
  { key: "sword", name: "Sword", desc: "Increases damage dealt with swords." },
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
  bob: 0,
  axeSwing: 0,
  attackSwing: 0,
  attackCooldown: 0,
  hurtCooldown: 0,
  facing: "down",
  speedBoostUntil: 0
};

const camera = {
  x: 0,
  y: 0,
  tx: 0,
  ty: 0
};

const map = {
  width: 2560,
  height: 1792,
  tile: 32
};

const keys = new Set();
let objects = [];
let floatingTexts = [];
let tileVariants = [];
let dialogueTimer = null;
let selectedInventoryItem = null;

const modalInfo = {
  Shop: "The main shop will be cosmetic later. In-game buying and selling is handled by NPCs inside World A.",
  Kingdoms: "Kingdoms come later. Your campfire is the first step toward a future kingdom core.",
  Mail: "Welcome to Redvyr! You claimed 5 bonus gold for checking your mail.",
  Settings: "Settings are coming later. For now, use Inventory, Quests, Stats, Campfire, and NPC shops."
};

/* FORMAT */

function formatNumber(num) {
  const n = Number(num || 0);

  if (n >= 1000000000) return (n / 1000000000).toFixed(1).replace(".0", "") + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";

  return String(Math.floor(n));
}

/* LEVEL / STATS */

function xpNeeded() {
  return 50 + (state.level - 1) * 25;
}

function maxHp() {
  return 100 + state.stats.defense * 10;
}

function strengthMultiplier() {
  return Number((1 + state.stats.strength * 0.08).toFixed(2));
}

function createBasicAxe(durability = 60) {
  const axe = {
    id: "axe-" + state.nextItemId,
    type: "axe",
    name: "Basic Axe",
    durability: Math.max(0, Math.min(60, Number(durability) || 60)),
    maxDurability: 60
  };

  state.nextItemId += 1;
  state.axes.push(axe);
  return axe;
}

function getAxeById(itemId) {
  return state.axes.find((axe) => axe.id === itemId) || null;
}

function equippedAxe() {
  return state.equippedAxeId ? getAxeById(state.equippedAxeId) : null;
}

function axeDurabilityText(axe) {
  return Number.isInteger(axe.durability)
    ? String(axe.durability)
    : axe.durability.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function createBasicPickaxe(durability = 60) {
  const pickaxe = {
    id: "pickaxe-" + state.nextItemId,
    type: "pickaxe",
    name: "Basic Pickaxe",
    durability: Math.max(0, Math.min(60, Number(durability) || 60)),
    maxDurability: 60
  };

  state.nextItemId += 1;
  state.pickaxes.push(pickaxe);
  return pickaxe;
}

function getPickaxeById(itemId) {
  return state.pickaxes.find((pickaxe) => pickaxe.id === itemId) || null;
}

function equippedPickaxe() {
  return state.equippedPickaxeId ? getPickaxeById(state.equippedPickaxeId) : null;
}

function createBasicSword(durability = 80) {
  const sword = {
    id: "sword-" + state.nextItemId,
    type: "sword",
    name: "Basic Sword",
    durability: Math.max(0, Math.min(80, Number(durability) || 80)),
    maxDurability: 80
  };

  state.nextItemId += 1;
  state.swords.push(sword);
  return sword;
}

function getSwordById(itemId) {
  return state.swords.find((sword) => sword.id === itemId) || null;
}

function equippedSword() {
  return state.equippedSwordId ? getSwordById(state.equippedSwordId) : null;
}

function toolDurabilityText(tool) {
  return Number.isInteger(tool.durability)
    ? String(tool.durability)
    : tool.durability.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function gatheringDamage(resourceType = "") {
  const axeBonus =
    equippedAxe() && (resourceType === "wood" || resourceType === "bush")
      ? 0.35
      : 0;
  const pickaxeBonus =
    equippedPickaxe() && (resourceType === "stone" || resourceType === "copper" || resourceType === "iron")
      ? 0.45
      : 0;

  return Number((strengthMultiplier() + axeBonus + pickaxeBonus).toFixed(2));
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
      desc: "Gather, mine, open chests, or sell resources to earn gold.",
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
  lines.push("Reward: " + formatNumber(quest.rewardGold) + " gold + " + quest.rewardXp + " XP");

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
  toast("Quest claimed! +" + formatNumber(quest.rewardGold) + " gold");

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
  const cost = {
    gold: 25 * state.campLevel,
    wood: 8 * state.campLevel,
    stone: 5 * state.campLevel,
    copper: 0,
    slimeGel: 0
  };

  // The Level 5 upgrade is the first true settlement milestone.
  if (state.campLevel === 4) {
    cost.copper = 4;
    cost.slimeGel = 3;
  }

  return cost;
}

function campLightRadius() {
  return 92 + state.campLevel * 12;
}

function campHealRadius() {
  return 85 + state.campLevel * 14;
}

function campHealRate() {
  return 0.025 * state.campLevel;
}

function campTierName() {
  if (state.campLevel >= 20) return "Kingdom Core";
  if (state.campLevel >= 10) return "Village Core";
  if (state.campLevel >= 5) return "Camp Core";
  return "Campfire";
}

function campBenefitsHTML() {
  const benefits = [
    { level: 1, text: "Healing zone unlocked" },
    { level: 2, text: "Improved healing power" },
    { level: 3, text: "Bigger campfire light radius" },
    { level: 4, text: "Bigger healing radius" },
    { level: 5, text: "Camp Core unlocked" },
    { level: 10, text: "Village Core unlocked" },
    { level: 20, text: "Kingdom Core unlocked" }
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
      Your home camp restores health and grows stronger through upgrades.
    </div>

    <div class="camp-card">
      <strong>Next Upgrade Cost</strong>
      <div class="camp-cost">
        <div>${formatNumber(cost.gold)} Gold</div>
        <div>${cost.wood} Wood</div>
        <div>${cost.stone} Stone</div>
        ${cost.copper > 0 ? `<div>${cost.copper} Copper</div>` : ""}
        ${cost.slimeGel > 0 ? `<div>${cost.slimeGel} Slime Gel</div>` : ""}
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

    <div class="camp-card"><strong>Home</strong>Respawn point secured.</div>
  `;

  const canUpgrade =
    state.gold >= cost.gold &&
    state.wood >= cost.wood &&
    state.stone >= cost.stone &&
    state.copper >= cost.copper &&
    state.slimeGel >= cost.slimeGel;

  campUpgradeBtn.disabled = !canUpgrade;
  campUpgradeBtn.textContent =
    canUpgrade ? (state.campLevel === 4 ? "Create Camp Core" : "Upgrade Camp") : "Need More Resources";

}

function openCamp() {
  closeAllGamePanels();
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
    state.potions = Number(data.potions || 0);
    state.speedPotions = Number(data.speedPotions || 0);
    state.slimeGel = Number(data.slimeGel || 0);
    state.copperOre = Number(data.copperOre || 0);
    state.ironOre = Number(data.ironOre || 0);
    state.copper = Number(data.copper || 0);
    state.iron = Number(data.iron || 0);
    state.steel = Number(data.steel || 0);

    state.nextItemId = Math.max(1, Number(data.nextItemId || 1));
    state.axes = Array.isArray(data.axes)
      ? data.axes
          .filter((axe) => axe && axe.durability > 0)
          .map((axe) => ({
            id: String(axe.id),
            type: "axe",
            name: "Basic Axe",
            durability: Math.max(0, Math.min(60, Number(axe.durability) || 0)),
            maxDurability: 60
          }))
      : [];

    state.pickaxes = Array.isArray(data.pickaxes)
      ? data.pickaxes
          .filter((pickaxe) => pickaxe && pickaxe.durability > 0)
          .map((pickaxe) => ({
            id: String(pickaxe.id),
            type: "pickaxe",
            name: "Basic Pickaxe",
            durability: Math.max(0, Math.min(60, Number(pickaxe.durability) || 0)),
            maxDurability: 60
          }))
      : [];

    state.swords = Array.isArray(data.swords)
      ? data.swords
          .filter((sword) => sword && sword.durability > 0)
          .map((sword) => ({
            id: String(sword.id),
            type: "sword",
            name: "Basic Sword",
            durability: Math.max(0, Math.min(80, Number(sword.durability) || 0)),
            maxDurability: 80
          }))
      : [];

    // Migrate the old single-owned axe save into one real 60-durability item.
    if (state.axes.length === 0 && Boolean(data.axeOwned)) {
      createBasicAxe(60);
    }

    const highestAxeNumber = state.axes.reduce((highest, axe) => {
      const match = axe.id.match(/^(?:axe-)(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    state.nextItemId = Math.max(state.nextItemId, highestAxeNumber + 1);

    const highestPickaxeNumber = state.pickaxes.reduce((highest, pickaxe) => {
      const match = pickaxe.id.match(/^(?:pickaxe-)(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    state.nextItemId = Math.max(state.nextItemId, highestPickaxeNumber + 1);

    const highestSwordNumber = state.swords.reduce((highest, sword) => {
      const match = sword.id.match(/^(?:sword-)(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    state.nextItemId = Math.max(state.nextItemId, highestSwordNumber + 1);

    state.hotbar = Array.isArray(data.hotbar)
      ? data.hotbar.slice(0, 5).map((item) => {
          if (item === "axe" && state.axes[0]) {
            return { type: "axe", itemId: state.axes[0].id };
          }
          return item;
        })
      : [null, null, null, null, null];

    state.equippedAxeId =
      typeof data.equippedAxeId === "string" ? data.equippedAxeId : null;
    state.equippedPickaxeId =
      typeof data.equippedPickaxeId === "string" ? data.equippedPickaxeId : null;
    state.equippedSwordId =
      typeof data.equippedSwordId === "string" ? data.equippedSwordId : null;

    // Keep an equipped axe from the previous Phase 3E save equipped after migration.
    if (!state.equippedAxeId && Boolean(data.axeEquipped) && state.axes[0]) {
      state.equippedAxeId = state.axes[0].id;

      if (!state.hotbar.some((item) => hotbarAxeItem(item)?.itemId === state.axes[0].id)) {
        const openSlot = state.hotbar.indexOf(null);
        state.hotbar[openSlot >= 0 ? openSlot : 0] = {
          type: "axe",
          itemId: state.axes[0].id
        };
      }
    }

    state.droppedTools = Array.isArray(data.droppedTools)
      ? data.droppedTools
          .filter((drop) =>
            drop && drop.toolData &&
            (drop.toolData.type === "axe" || drop.toolData.type === "pickaxe" || drop.toolData.type === "sword") &&
            drop.toolData.durability > 0
          )
          .map((drop) => {
            const isSword = drop.toolData.type === "sword";
            const isPickaxe = drop.toolData.type === "pickaxe";
            const maxDurability = isSword ? 80 : 60;
            return {
              x: Number(drop.x || 0),
              y: Number(drop.y || 0),
              toolData: {
                id: String(drop.toolData.id),
                type: isSword ? "sword" : isPickaxe ? "pickaxe" : "axe",
                name: isSword ? "Basic Sword" : isPickaxe ? "Basic Pickaxe" : "Basic Axe",
                durability: Math.max(0, Math.min(maxDurability, Number(drop.toolData.durability) || 0)),
                maxDurability
              }
            };
          })
      : [];

    const highestDroppedItemNumber = state.droppedTools.reduce((highest, drop) => {
      const match = drop.toolData.id.match(/^(?:axe|pickaxe|sword)-(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    state.nextItemId = Math.max(state.nextItemId, highestDroppedItemNumber + 1);

    state.droppedLoot = Array.isArray(data.droppedLoot)
      ? data.droppedLoot
          .filter((drop) => drop && drop.type === "slimegel" && drop.count > 0)
          .map((drop) => ({
            id: String(drop.id),
            type: "slimegel",
            x: Number(drop.x || 0),
            y: Number(drop.y || 0),
            count: Math.max(1, Number(drop.count || 1))
          }))
      : [];

    state.campPlaced = Boolean(data.campPlaced);
    state.campX = Number.isFinite(Number(data.campX)) ? Number(data.campX) : null;
    state.campY = Number.isFinite(Number(data.campY)) ? Number(data.campY) : null;
    state.playerX = Number.isFinite(Number(data.playerX)) ? Number(data.playerX) : null;
    state.playerY = Number.isFinite(Number(data.playerY)) ? Number(data.playerY) : null;
    state.hasWorldPosition = Boolean(data.hasWorldPosition) &&
      Number.isFinite(state.playerX) && Number.isFinite(state.playerY);

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
  cleanHotbar();

  nicknameInput.value = state.name;
  worldInput.value = state.world;
  lobbyWorld.value = state.world;

  syncUI();
}

function save() {
  if (!gameScreen.classList.contains("hidden") && Number.isFinite(player.x) && Number.isFinite(player.y)) {
    state.playerX = Math.round(player.x);
    state.playerY = Math.round(player.y);
    state.hasWorldPosition = true;
  }

  localStorage.setItem(saveKey, JSON.stringify(state));
}

function syncUI() {
  profileName.textContent = state.name;
  profileGold.textContent = formatNumber(state.gold);
  profileLevel.textContent = state.level;
  lobbyNameTag.textContent = state.name;

  hudName.textContent = state.name;
  hudWorld.textContent = state.world;
  hudGold.textContent = formatNumber(state.gold);
  hudWood.textContent = formatNumber(state.wood);
  hudStone.textContent = formatNumber(state.stone);
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
  updateHotbar();
  if (typeof updateTerritoryPanel === "function") updateTerritoryPanel();
  if (typeof updateTerritoryLocationBanner === "function") updateTerritoryLocationBanner();

  if (!buyPanel.classList.contains("hidden")) updateBuyPanel();
  if (!sellPanel.classList.contains("hidden")) updateSellPanel();
  if (typeof updateCraftingPanel === "function") updateCraftingPanel();
  if (typeof updateSmeltingPanel === "function") updateSmeltingPanel();
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

function showFullscreenPrompt() {
  if (!fullscreenPrompt || fullscreenPromptShown || document.fullscreenElement) return;

  fullscreenPromptShown = true;
  fullscreenPrompt.classList.remove("hidden");
}

async function enterFullscreenMode() {
  if (!fullscreenPrompt) return;

  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      toast("Fullscreen enabled. Press Esc to exit.");
    }
  } catch {
    toast("Fullscreen was blocked. You can still keep playing.");
  }

  fullscreenPrompt.classList.add("hidden");
}

if (enableFullscreenBtn) {
  enableFullscreenBtn.addEventListener("click", enterFullscreenMode);
}

if (skipFullscreenBtn) {
  skipFullscreenBtn.addEventListener("click", () => {
    fullscreenPrompt.classList.add("hidden");
  });
}

$("backToLobbyBtn").addEventListener("click", () => {
  gameScreen.classList.add("hidden");
  lobbyScreen.classList.remove("hidden");

  closeAllGamePanels();
  closeNpcDialogue();
  closeBuyPanel();
  closeSellPanel();

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
  closeAllGamePanels();
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
  closeAllGamePanels();
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
  closeAllGamePanels();
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

dialogueBuyBtn.addEventListener("click", openBuyPanel);
dialogueSellBtn.addEventListener("click", openSellPanel);
dialogueNoBtn.addEventListener("click", closeNpcDialogue);
closeBuyBtn.addEventListener("click", closeBuyPanel);
closeSellBtn.addEventListener("click", closeSellPanel);
gameMenuBtn.addEventListener("click", toggleGameMenu);

function closeAllGamePanels() {
  closeInventory();
  closeQuest();
  closeStats();
  closeCamp();
  if (typeof closeCrafting === "function") closeCrafting();
  if (typeof closeSmelting === "function") closeSmelting();
  if (typeof closeTerritory === "function") closeTerritory();
  closeBuyPanel();
  closeSellPanel();
  closeGameMenu();
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

  invGold.textContent = formatNumber(state.gold);
  invCamp.textContent = state.campLevel;

  cleanHotbar();
  inventoryGrid.innerHTML = "";

  const stacks = [
    ...state.axes.map((axe) => ({
      type: "axe",
      itemId: axe.id,
      durability: axe.durability,
      maxDurability: axe.maxDurability,
      src: images.axe.src
    })),
    ...state.pickaxes.map((pickaxe) => ({
      type: "pickaxe",
      itemId: pickaxe.id,
      durability: pickaxe.durability,
      maxDurability: pickaxe.maxDurability,
      src: images.pickaxe.src
    })),
    ...state.swords.map((sword) => ({
      type: "sword",
      itemId: sword.id,
      durability: sword.durability,
      maxDurability: sword.maxDurability,
      src: images.sword.src
    })),
    ...makeStacks("wood", state.wood, images.wood),
    ...makeStacks("stone", state.stone, images.stone),
    ...makeStacks("rawcopper", state.copperOre, images.rawcopper),
    ...makeStacks("rawiron", state.ironOre, images.rawiron),
    ...makeStacks("copper", state.copper, images.copper),
    ...makeStacks("iron", state.iron, images.iron),
    ...makeStacks("steel", state.steel, images.steel),
    ...makeStacks("slimegel", state.slimeGel, images.slimegel),
    ...makeStacks("potion", state.potions, images.potion),
    ...makeStacks("speedpotion", state.speedPotions, images.speedpotion)
  ];

  const totalSlots = 25;

  for (let i = 0; i < totalSlots; i++) {
    const slot = document.createElement("div");
    slot.className = "inventory-slot";

    if (stacks[i]) {
      const item = stacks[i];
      const img = document.createElement("img");
      img.src = item.src;

      const count = document.createElement("span");
      count.textContent =
        item.type === "axe" || item.type === "pickaxe" || item.type === "sword"
          ? toolDurabilityText(item) + "/" + item.maxDurability
          : "x" + item.count;

      slot.appendChild(img);
      slot.appendChild(count);

      if (inventoryItemIsSelected(item)) {
        slot.classList.add("selected-item");
      }

      slot.addEventListener("click", () => selectInventoryItem(item));

      if (item.type === "axe") {
        slot.classList.add("assignable");
        slot.title = "Basic Axe · " + axeDurabilityText(item) + "/60 durability. Double-click to add/equip.";

        if (state.hotbar.some((barItem) => hotbarAxeItem(barItem)?.itemId === item.itemId)) {
          slot.classList.add("hotbar-linked");
        }

        if (state.equippedAxeId === item.itemId) {
          slot.classList.add("equipped-item");
        }

        slot.addEventListener("dblclick", () => addItemToHotbar("axe", item.itemId));
      }

      if (item.type === "pickaxe") {
        slot.classList.add("assignable");
        slot.title = "Basic Pickaxe · " + toolDurabilityText(item) + "/60 durability. Double-click to add/equip.";

        if (state.hotbar.some((barItem) => hotbarPickaxeItem(barItem)?.itemId === item.itemId)) {
          slot.classList.add("hotbar-linked");
        }

        if (state.equippedPickaxeId === item.itemId) {
          slot.classList.add("equipped-item");
        }

        slot.addEventListener("dblclick", () => addItemToHotbar("pickaxe", item.itemId));
      }

      if (item.type === "sword") {
        slot.classList.add("assignable");
        slot.title = "Basic Sword · " + toolDurabilityText(item) + "/80 durability. Click to select.";

        if (state.hotbar.some((barItem) => hotbarSwordItem(barItem)?.itemId === item.itemId)) {
          slot.classList.add("hotbar-linked");
        }

        if (state.equippedSwordId === item.itemId) {
          slot.classList.add("equipped-item");
        }

        slot.addEventListener("dblclick", () => addItemToHotbar("sword", item.itemId));
      }

      if (item.type === "potion") {
        slot.classList.add("assignable");
        slot.title = "Double-click to add Health Potion to hotbar.";

        if (state.hotbar.includes("potion")) {
          slot.classList.add("hotbar-linked");
        }

        slot.addEventListener("dblclick", () => addItemToHotbar("potion"));
      }

      if (item.type === "speedpotion") {
        slot.classList.add("assignable");
        slot.title = "Double-click to add Speed Potion to hotbar.";

        if (state.hotbar.includes("speedpotion")) {
          slot.classList.add("hotbar-linked");
        }

        slot.addEventListener("dblclick", () => addItemToHotbar("speedpotion"));
      }
    } else {
      slot.classList.add("empty");
    }

    inventoryGrid.appendChild(slot);
  }

  updateInventoryItemDetails();
}

function updateStatsPanel() {
  if (!statsList) return;

  statPoints.textContent = state.statPoints;
  const heldAxe = equippedAxe();
  const heldPickaxe = equippedPickaxe();
  const heldSword = equippedSword();
  statGatherDamage.textContent =
    strengthMultiplier().toFixed(2) + "x" +
    (heldAxe ? " (+0.35x trees/bushes · " + toolDurabilityText(heldAxe) + "/60 axe)" : "") +
    (heldPickaxe ? " (+0.45x stone/ores · " + toolDurabilityText(heldPickaxe) + "/60 pickaxe)" : "") +
    (heldSword ? " · Sword equipped" : "");
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
  const typingInField = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if (typingInField) return;

  const key = event.key.toLowerCase();
  const movementKeys = ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];

  if (typeof isCampPlacementActive === "function" && isCampPlacementActive()) {
    if (!movementKeys.includes(key)) {
      event.preventDefault();
      return;
    }

    keys.add(key);
    return;
  }

  keys.add(key);

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

  if (!gameScreen.classList.contains("hidden") && event.key.toLowerCase() === "m") {
    toggleGameMenu();
  }

  if (!gameScreen.classList.contains("hidden") && /^[1-5]$/.test(event.key)) {
    activateHotbarSlot(Number(event.key) - 1);
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});


window.addEventListener("beforeunload", () => {
  save();
});

setInterval(() => {
  if (!gameScreen.classList.contains("hidden")) save();
}, 5000);

loadSave();
createWorld();
loop();

// Show fullscreen invitation on the landing screen.
setTimeout(showFullscreenPrompt, 120);
