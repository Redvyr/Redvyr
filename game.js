const $ = (id) => document.getElementById(id);

const startScreen = $("startScreen");
const lobbyScreen = $("lobbyScreen");
const gameScreen = $("gameScreen");

const nicknameInput = $("nicknameInput");
const worldInput = $("worldInput");
const lobbyWorld = $("lobbyWorld");

const profileName = $("profileName");
const profileGold = $("profileGold");
const lobbyNameTag = $("lobbyNameTag");
const hudName = $("hudName");
const hudWorld = $("hudWorld");
const hudGold = $("hudGold");
const mailDot = $("mailDot");

const modal = $("modal");
const modalTitle = $("modalTitle");
const modalText = $("modalText");
const toastEl = $("toast");

const canvas = $("game");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 540;

const saveKey = "redvyr_phase1_smooth_save";

const images = {};
const files = {
  grass: "grass.png",
  path: "path.png",
  tree: "tree.png",
  rock: "rock.png",
  mascot: "mascot.png"
};

for (const key in files) {
  images[key] = new Image();
  images[key].src = files[key];
}

const state = {
  name: "Guest Hero",
  world: "World A - Main Realm",
  gold: 0,
  mailClaimed: false
};

const player = {
  x: 520,
  y: 430,
  speed: 3.25,
  moving: false,
  bob: 0
};

const camera = { x: 0, y: 0, tx: 0, ty: 0 };
const map = { width: 1920, height: 1280, tile: 32 };
const keys = new Set();

const objects = [
  { x: 150, y: 150, w: 64, h: 80, kind: "tree" },
  { x: 300, y: 250, w: 64, h: 80, kind: "tree" },
  { x: 480, y: 170, w: 64, h: 80, kind: "tree" },
  { x: 1040, y: 180, w: 64, h: 80, kind: "tree" },
  { x: 1260, y: 330, w: 64, h: 80, kind: "tree" },
  { x: 1460, y: 210, w: 64, h: 80, kind: "tree" },
  { x: 1580, y: 650, w: 64, h: 80, kind: "tree" },
  { x: 240, y: 700, w: 64, h: 80, kind: "tree" },
  { x: 600, y: 820, w: 64, h: 80, kind: "tree" },
  { x: 1110, y: 820, w: 64, h: 80, kind: "tree" },

  { x: 700, y: 260, w: 48, h: 32, kind: "rock" },
  { x: 1180, y: 540, w: 48, h: 32, kind: "rock" },
  { x: 360, y: 900, w: 48, h: 32, kind: "rock" },
  { x: 1520, y: 900, w: 48, h: 32, kind: "rock" },

  { x: 850, y: 570, w: 70, h: 42, kind: "chest", interact: true, label: "open chest", gold: 25, used: false },
  { x: 430, y: 650, w: 64, h: 80, kind: "tree", interact: true, label: "gather from tree", gold: 8, used: false },
  { x: 1330, y: 700, w: 48, h: 32, kind: "rock", interact: true, label: "mine rock", gold: 10, used: false }
];

const modalInfo = {
  Quests: "Quests will become small goals like gather wood, mine stone, open chests, and help your kingdom.",
  Shop: "The shop will come later. It should focus on cosmetics, pets, boosts, and fun account upgrades.",
  Kingdoms: "Kingdoms will let players team up, donate resources, build camps, and climb seasonal leaderboards.",
  Mail: "Welcome to Redvyr! You claimed 5 bonus gold for checking your mail.",
  Settings: "Settings will be added later for sound, graphics, controls, and account options."
};

function loadSave() {
  try {
    const raw = localStorage.getItem(saveKey);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.name = data.name || state.name;
    state.world = data.world || state.world;
    state.gold = Number(data.gold || 0);
    state.mailClaimed = Boolean(data.mailClaimed);
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
  lobbyNameTag.textContent = state.name;
  hudName.textContent = state.name;
  hudWorld.textContent = state.world;
  profileGold.textContent = state.gold;
  hudGold.textContent = state.gold;
  mailDot.style.display = state.mailClaimed ? "none" : "inline-block";
}

$("enterBtn").addEventListener("click", () => {
  state.name = nicknameInput.value.trim() || "Guest Hero";
  state.world = worldInput.value;
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
  state.world = lobbyWorld.value;
  worldInput.value = state.world;
  save();
  syncUI();
  toast("Selected " + state.world + ".");
});

$("playGameBtn").addEventListener("click", () => {
  lobbyScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  syncUI();
  toast("Entering " + state.world + "...");
});

$("backToLobbyBtn").addEventListener("click", () => {
  gameScreen.classList.add("hidden");
  lobbyScreen.classList.remove("hidden");
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

$("closeModalBtn").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1800);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (!gameScreen.classList.contains("hidden") && event.key.toLowerCase() === "e") interact();
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

function playerHitbox(x = player.x, y = player.y) {
  return { x: x - 18, y: y + 12, w: 36, h: 32 };
}

function objectHitbox(obj) {
  if (obj.kind === "tree") return { x: obj.x + 20, y: obj.y + 48, w: 24, h: 28 };
  return { x: obj.x + 4, y: obj.y + 4, w: obj.w - 8, h: obj.h - 8 };
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function canMoveTo(x, y) {
  const box = playerHitbox(x, y);
  if (box.x < 0 || box.y < 0 || box.x + box.w > map.width || box.y + box.h > map.height) return false;

  for (const obj of objects) {
    if (obj.used) continue;
    if (overlap(box, objectHitbox(obj))) return false;
  }
  return true;
}

function update() {
  if (gameScreen.classList.contains("hidden")) return;

  let dx = 0;
  let dy = 0;

  if (keys.has("w") || keys.has("arrowup")) dy -= 1;
  if (keys.has("s") || keys.has("arrowdown")) dy += 1;
  if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
  if (keys.has("d") || keys.has("arrowright")) dx += 1;

  player.moving = dx !== 0 || dy !== 0;

  if (player.moving) {
    const len = Math.hypot(dx, dy) || 1;
    dx = (dx / len) * player.speed;
    dy = (dy / len) * player.speed;

    if (canMoveTo(player.x + dx, player.y)) player.x += dx;
    if (canMoveTo(player.x, player.y + dy)) player.y += dy;
    player.bob += 0.22;
  }

  camera.tx = clamp(player.x - canvas.width / 2, 0, map.width - canvas.width);
  camera.ty = clamp(player.y - canvas.height / 2, 0, map.height - canvas.height);
  camera.x += (camera.tx - camera.x) * 0.08;
  camera.y += (camera.ty - camera.y) * 0.08;

  const near = nearbyInteractable();
  const prompt = $("interactPrompt");

  if (near) {
    prompt.textContent = "Press E to " + near.label;
    prompt.classList.remove("hidden");
  } else {
    prompt.classList.add("hidden");
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function nearbyInteractable() {
  const reach = { x: player.x - 54, y: player.y - 54, w: 108, h: 108 };
  return objects.find((obj) => obj.interact && !obj.used && overlap(reach, objectHitbox(obj)));
}

function interact() {
  const obj = nearbyInteractable();
  if (!obj) return;
  obj.used = true;
  state.gold += obj.gold;
  save();
  syncUI();
  toast("+" + obj.gold + " gold");
}

function draw() {
  if (gameScreen.classList.contains("hidden")) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

  drawMap();
  drawObjects();
  drawPlayer();

  ctx.restore();
}

function drawMap() {
  const tile = map.tile;

  for (let y = 0; y < map.height; y += tile) {
    for (let x = 0; x < map.width; x += tile) drawImg(images.grass, x, y, tile, tile, "#55b943");
  }

  for (let y = 352; y <= 608; y += tile) {
    for (let x = 0; x < map.width; x += tile) drawImg(images.path, x, y, tile, tile, "#c98b55");
  }

  for (let x = 768; x <= 928; x += tile) {
    for (let y = 0; y < map.height; y += tile) drawImg(images.path, x, y, tile, tile, "#c98b55");
  }
}

function drawObjects() {
  const sorted = [...objects].sort((a, b) => (a.y + a.h) - (b.y + b.h));

  for (const obj of sorted) {
    if (obj.used && obj.kind === "chest") continue;

    if (obj.kind === "tree") drawImg(images.tree, obj.x, obj.y, obj.w, obj.h, "#2f7832");
    else if (obj.kind === "rock") drawImg(images.rock, obj.x, obj.y, obj.w, obj.h, "#89939e");
    else if (obj.kind === "chest") drawChest(obj.x, obj.y, obj.w, obj.h);
  }
}

function drawPlayer() {
  const drawW = 82;
  const drawH = 108;
  const bob = player.moving ? Math.sin(player.bob) * 2 : 0;

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fillRect(player.x - 28, player.y + 34, 56, 10);

  drawImg(images.mascot, player.x - drawW / 2, player.y - drawH + bob + 42, drawW, drawH, "#9f1f17");
  drawNameTag(player.x, player.y - 82, state.name);
}

function drawNameTag(x, y, text) {
  ctx.font = "bold 13px Arial";
  const width = ctx.measureText(text).width + 18;

  ctx.fillStyle = "rgba(15, 8, 3, 0.82)";
  roundRect(x - width / 2, y, width, 22, 8, true, false);

  ctx.strokeStyle = "#f2c35f";
  ctx.lineWidth = 2;
  roundRect(x - width / 2, y, width, 22, 8, false, true);

  ctx.fillStyle = "#ffe4a6";
  ctx.fillText(text, x - width / 2 + 9, y + 15);
}

function drawChest(x, y, w, h) {
  ctx.fillStyle = "#5b2b12";
  ctx.fillRect(x, y + 12, w, h - 12);
  ctx.fillStyle = "#a85622";
  ctx.fillRect(x, y, w, 18);
  ctx.fillStyle = "#f2c35f";
  ctx.fillRect(x + w / 2 - 5, y + 12, 10, 16);
  ctx.strokeStyle = "#2a1208";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
}

function drawImg(img, x, y, w, h, fallback) {
  if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, x, y, w, h);
  else {
    ctx.fillStyle = fallback;
    ctx.fillRect(x, y, w, h);
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
loop();
