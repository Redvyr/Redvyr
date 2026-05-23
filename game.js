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
  potion: "potion.png",
  axe: "axe.png"
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

  axes: [],
  equippedAxeId: null,
  nextItemId: 1,
  hotbar: [null, null, null, null, null],

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
  bob: 0,
  axeSwing: 0
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
let dialogueTimer = null;

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
  return Math.min(4, 1 + state.stats.strength * 0.08);
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

function gatheringDamage(resourceType = "") {
  const axeBonus =
    equippedAxe() && (resourceType === "wood" || resourceType === "bush")
      ? 0.35
      : 0;

  return Number(Math.min(4, strengthMultiplier() + axeBonus).toFixed(2));
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
    { level: 2, text: "Improved healing power" },
    { level: 3, text: "Bigger campfire light radius" },
    { level: 4, text: "Bigger healing radius" },
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
      Your campfire is the heart of your future settlement. Upgrade it to improve healing, light, safety, and future kingdom systems.
    </div>

    <div class="camp-card">
      <strong>Next Upgrade Cost</strong>
      <div class="camp-cost">
        <div>${formatNumber(cost.gold)} Gold</div>
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
  closeAllGamePanels();
  updateCampPanel();
  campPanel.classList.remove("hidden");
}

function closeCamp() {
  campPanel.classList.add("hidden");
}

/* SHOP */

function openNpcDialogue(npcName = "Rowan") {
  closeAllGamePanels();

  npcDialogue.classList.remove("hidden");
  dialogueBuyBtn.style.display = "none";
  dialogueSellBtn.style.display = "none";
  dialogueNoBtn.style.display = "none";

  typeNpcText("Hi, I'm " + npcName + ". How may I help you today?", () => {
    dialogueBuyBtn.style.display = "inline-flex";
    dialogueSellBtn.style.display = "inline-flex";
    dialogueNoBtn.style.display = "inline-flex";
  });
}

function closeNpcDialogue() {
  npcDialogue.classList.add("hidden");
  npcDialogueText.textContent = "";

  if (dialogueTimer) {
    clearInterval(dialogueTimer);
    dialogueTimer = null;
  }
}

function typeNpcText(text, onDone) {
  if (dialogueTimer) {
    clearInterval(dialogueTimer);
    dialogueTimer = null;
  }

  npcDialogueText.textContent = "";

  let i = 0;

  dialogueTimer = setInterval(() => {
    npcDialogueText.textContent += text[i] || "";
    i += 1;

    if (i >= text.length) {
      clearInterval(dialogueTimer);
      dialogueTimer = null;

      if (onDone) onDone();
    }
  }, 22);
}

function openBuyPanel() {
  closeNpcDialogue();
  closeAllGamePanels();
  updateBuyPanel();
  buyPanel.classList.remove("hidden");
}

function closeBuyPanel() {
  buyPanel.classList.add("hidden");
}
function openSellPanel() {
  closeNpcDialogue();
  closeAllGamePanels();
  updateSellPanel();
  sellPanel.classList.remove("hidden");
}

function closeSellPanel() {
  sellPanel.classList.add("hidden");
}

function updateBuyPanel() {
  buyGoldText.textContent = formatNumber(state.gold);
  buyItems.innerHTML = "";

  const items = [
    {
      id: "potion",
      name: "Small Potion",
      desc: "Restores 35 HP when used from your hotbar.",
      cost: 25,
      img: images.potion.src,
      buy: () => {
        state.gold -= 25;
        state.potions += 1;
        toast("Bought Small Potion");
      },
      canBuy: () => state.gold >= 25
    },
    {
      id: "axe",
      name: "Basic Axe",
      desc: "60 durability. +0.35x damage on trees and bushes only.",
      cost: 250,
      img: images.axe.src,
      buy: () => {
        state.gold -= 250;
        createBasicAxe();
        toast("Basic Axe bought! Double-click it in Inventory.");
      },
      canBuy: () => state.gold >= 250
    },
    {
      id: "manual",
      name: "Training Manual",
      desc: "Gives 35 XP instantly.",
      cost: 100,
      img: images.gold.src,
      buy: () => {
        state.gold -= 100;
        addXp(35);
        toast("+35 XP");
      },
      canBuy: () => state.gold >= 100
    }
  ];

  for (const item of items) {
    buyItems.appendChild(createShopItem({
      img: item.img,
      name: item.name,
      desc: item.desc,
      price: item.cost + " gold",
      buttonText: "Buy",
      disabled: !item.canBuy(),
      onClick: () => {
        item.buy();
        save();
        syncUI();
        updateBuyPanel();
      }
    }));
  }
}

function updateSellPanel() {
  sellGoldText.textContent = formatNumber(state.gold);
  sellItems.innerHTML = "";

  const sellOptions = [
    {
      name: "Sell Wood Stack",
      desc: "Sell 16 wood for gold.",
      img: images.wood.src,
      amountNeeded: 16,
      reward: 20,
      resource: "wood"
    },
    {
      name: "Sell Stone Stack",
      desc: "Sell 16 stone for gold.",
      img: images.stone.src,
      amountNeeded: 16,
      reward: 25,
      resource: "stone"
    }
  ];

  for (const option of sellOptions) {
    const canSell = state[option.resource] >= option.amountNeeded;

    sellItems.appendChild(createShopItem({
      img: option.img,
      name: option.name,
      desc: option.desc,
      price: "+" + option.reward + " gold",
      buttonText: "Sell",
      disabled: !canSell,
      onClick: () => {
        if (state[option.resource] < option.amountNeeded) {
          toast("Not enough " + option.resource + ".");
          return;
        }

        state[option.resource] -= option.amountNeeded;
        state.gold += option.reward;

        toast("Sold " + option.amountNeeded + " " + option.resource);
        save();
        syncUI();
        updateSellPanel();
      }
    }));
  }
}

function createShopItem({ img, name, desc, price, buttonText, disabled, onClick }) {
  const card = document.createElement("div");
  card.className = "shop-item";

  const icon = document.createElement("img");
  icon.src = img;

  const info = document.createElement("div");

  const title = document.createElement("strong");
  title.textContent = name;

  const description = document.createElement("span");
  description.textContent = desc + " · " + price;

  info.appendChild(title);
  info.appendChild(description);

  const button = document.createElement("button");
  button.textContent = buttonText;
  button.disabled = disabled;
  button.addEventListener("click", onClick);

  card.appendChild(icon);
  card.appendChild(info);
  card.appendChild(button);

  return card;
}

/* HOTBAR / EQUIPMENT */

function hotbarAxeItem(item) {
  return item && typeof item === "object" && item.type === "axe" ? item : null;
}

function cleanHotbar() {
  if (!Array.isArray(state.axes)) state.axes = [];
  state.axes = state.axes.filter((axe) => axe && axe.id && axe.durability > 0);

  if (!Array.isArray(state.hotbar)) {
    state.hotbar = [null, null, null, null, null];
  }

  state.hotbar = state.hotbar.slice(0, 5);
  while (state.hotbar.length < 5) state.hotbar.push(null);

  const seenAxes = new Set();

  state.hotbar = state.hotbar.map((item) => {
    if (item === "potion" && state.potions > 0) return item;

    const axeItem = hotbarAxeItem(item);
    if (axeItem && getAxeById(axeItem.itemId) && !seenAxes.has(axeItem.itemId)) {
      seenAxes.add(axeItem.itemId);
      return { type: "axe", itemId: axeItem.itemId };
    }

    return null;
  });

  if (!equippedAxe() || !state.hotbar.some((item) => hotbarAxeItem(item)?.itemId === state.equippedAxeId)) {
    state.equippedAxeId = null;
  }
}

function addItemToHotbar(itemType, itemId = null) {
  cleanHotbar();

  if (itemType === "potion") {
    if (state.potions <= 0) return;

    if (state.hotbar.includes("potion")) {
      toast("Potion is already in your hotbar.");
      return;
    }

    const openSlot = state.hotbar.indexOf(null);
    if (openSlot === -1) {
      toast("Hotbar is full.");
      return;
    }

    state.hotbar[openSlot] = "potion";
    toast("Potion added to hotbar.");
    save();
    syncUI();
    return;
  }

  if (itemType !== "axe") return;

  const axe = getAxeById(itemId);
  if (!axe) return;

  const existingSlot = state.hotbar.findIndex(
    (item) => hotbarAxeItem(item)?.itemId === axe.id
  );

  if (existingSlot >= 0) {
    state.equippedAxeId = state.equippedAxeId === axe.id ? null : axe.id;
    toast(state.equippedAxeId ? "Basic Axe equipped." : "Basic Axe unequipped.");
    save();
    syncUI();
    return;
  }

  const openSlot = state.hotbar.indexOf(null);
  if (openSlot === -1) {
    toast("Hotbar is full.");
    return;
  }

  state.hotbar[openSlot] = { type: "axe", itemId: axe.id };
  state.equippedAxeId = axe.id;
  toast("Basic Axe added and equipped.");
  save();
  syncUI();
}

function activateHotbarSlot(slotIndex) {
  cleanHotbar();

  const item = state.hotbar[slotIndex];
  if (!item) return;

  const axeItem = hotbarAxeItem(item);
  if (axeItem) {
    state.equippedAxeId = state.equippedAxeId === axeItem.itemId ? null : axeItem.itemId;
    toast(state.equippedAxeId ? "Basic Axe equipped." : "Basic Axe unequipped.");
  }

  if (item === "potion") {
    if (state.hp >= maxHp()) {
      toast("Health is already full.");
      return;
    }

    state.potions -= 1;
    state.hp = Math.min(maxHp(), state.hp + 35);
    toast("Used Small Potion. +35 HP");

    if (state.potions <= 0) {
      state.hotbar[slotIndex] = null;
    }
  }

  save();
  syncUI();
}

function updateHotbar() {
  if (!hotbar) return;

  cleanHotbar();
  hotbar.innerHTML = "";

  state.hotbar.forEach((item, index) => {
    const axeItem = hotbarAxeItem(item);
    const axe = axeItem ? getAxeById(axeItem.itemId) : null;
    const slot = document.createElement("button");
    slot.className = "hotbar-slot";
    slot.type = "button";
    slot.title = axe
      ? "Basic Axe · " + axeDurabilityText(axe) + "/60 durability"
      : item === "potion"
        ? "Use Small Potion"
        : "Empty hotbar slot";

    if (axe && state.equippedAxeId === axe.id) {
      slot.classList.add("equipped");
    }

    const key = document.createElement("span");
    key.className = "hotbar-key";
    key.textContent = String(index + 1);
    slot.appendChild(key);

    if (axe || item === "potion") {
      const icon = document.createElement("img");
      icon.src = axe ? images.axe.src : images.potion.src;
      icon.alt = axe ? "Basic Axe" : "Small Potion";
      slot.appendChild(icon);

      const count = document.createElement("span");
      count.className = "hotbar-count";
      count.textContent = axe ? axeDurabilityText(axe) : "x" + state.potions;
      slot.appendChild(count);
    }

    slot.addEventListener("click", () => activateHotbarSlot(index));
    hotbar.appendChild(slot);
  });
}

function toggleGameMenu() {
  gameMenu.classList.toggle("hidden");
}

function closeGameMenu() {
  gameMenu.classList.add("hidden");
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

    // Migrate the old single-owned axe save into one real 60-durability item.
    if (state.axes.length === 0 && Boolean(data.axeOwned)) {
      createBasicAxe(60);
    }

    const highestAxeNumber = state.axes.reduce((highest, axe) => {
      const match = axe.id.match(/^(?:axe-)(\d+)$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    state.nextItemId = Math.max(state.nextItemId, highestAxeNumber + 1);

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

  if (!buyPanel.classList.contains("hidden")) updateBuyPanel();
  if (!sellPanel.classList.contains("hidden")) updateSellPanel();
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
