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
const hudWood = $("hudWood");
const hudStone = $("hudStone");
const hudCamp = $("hudCamp");
const mailDot = $("mailDot");

const modal = $("modal");
const modalTitle = $("modalTitle");
const modalText = $("modalText");
const toastEl = $("toast");

const canvas = $("game");
const ctx = canvas.getContext("2d");

canvas.width = 960;
canvas.height = 540;
ctx.imageSmoothingEnabled = false;

const saveKey = "redvyr_phase2b_save";

const images = {};
const files = {
  grass: "grass.png",
  path: "path.png",
  tree: "tree.png",
  rock: "rock.png",
  mascot: "mascot.png",
  gold: "gold.png",
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
  mailClaimed: false
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

const modalInfo = {
  Quests: "Phase 2 is building the first real loop: gather wood and stone, earn gold, then upgrade your camp.",
  Shop: "Shop is preview-only for now. Later it can hold cosmetics, pets, boosts, and simple account upgrades.",
  Kingdoms: "Kingdoms come later. First we need the base loop to feel fun and smooth.",
  Mail: "Welcome to Redvyr! You claimed 5 bonus gold for checking your mail.",
  Settings: "Settings will be added later for sound, graphics, controls, and account options."
};

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
  hudWood.textContent = state.wood;
  hudStone.textContent = state.stone;
  hudCamp.textContent = state.campLevel;

  mailDot.style.display = state.mailClaimed ? "none" : "inline-block";
}

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

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");

  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 1900);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());

  if (!gameScreen.classList.contains("hidden") && event.key.toLowerCase() === "e") {
    interact();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

function createWorld() {
  objects = [];

  objects.push({
    x: 472,
    y: 380,
    w: 64,
    h: 64,
    kind: "campfire",
    interact: true,
    label: "upgrade camp",
    action: "camp"
  });

  objects.push({
    x: 384,
    y: 388,
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

    objects.push({
      x: pos.x,
      y: pos.y,
      w: 64,
      h: 96,
      kind: "tree",
      interact: true,
      label: "gather wood",
      action: "wood",
      amount: 2
    });
  }

  for (let i = 0; i < 10; i++) {
    const pos = randomSafePosition(48, 32);

    objects.push({
      x: pos.x,
      y: pos.y,
      w: 48,
      h: 32,
      kind: "rock",
      interact: true,
      label: "mine stone",
      action: "stone",
      amount: 2
    });
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

    const test = {
      x,
      y,
      w,
      h
    };

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
      return {
        x,
        y
      };
    }
  }

  return {
    x: 900,
    y: 700
  };
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function isInCampArea(box) {
  const camp = {
    x: 320,
    y: 320,
    w: 420,
    h: 220
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

function update() {
  if (gameScreen.classList.contains("hidden")) return;

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

  if (obj.action === "wood") {
    state.wood += obj.amount || 1;
    state.gold += 1;

    temporarilyHide(obj, 9000);

    toast("+" + (obj.amount || 1) + " wood, +1 gold");
  }

  if (obj.action === "stone") {
    state.stone += obj.amount || 1;
    state.gold += 1;

    temporarilyHide(obj, 11000);

    toast("+" + (obj.amount || 1) + " stone, +1 gold");
  }

  if (obj.action === "chest") {
    if (obj.used) {
      toast("Chest is empty.");
    } else {
      obj.used = true;
      obj.hidden = true;
      state.gold += obj.gold || 20;

      toast("+" + (obj.gold || 20) + " gold");
    }
  }

  if (obj.action === "camp") {
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

      toast("Camp upgraded to level " + state.campLevel + "!");
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

  save();
  syncUI();
}

function temporarilyHide(obj, ms) {
  obj.hidden = true;

  setTimeout(() => {
    obj.hidden = false;
  }, ms);
}

function draw() {
  if (gameScreen.classList.contains("hidden")) return;

  ctx.imageSmoothingEnabled = false;
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

  for (let y = 352; y <= 480; y += tile) {
    for (let x = 352; x <= 672; x += tile) {
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

    if (obj.kind === "tree") {
      drawImg(images.tree, obj.x, obj.y, obj.w, obj.h, "#2f7832");
    }

    if (obj.kind === "rock") {
      drawImg(images.rock, obj.x, obj.y, obj.w, obj.h, "#89939e");
    }

    if (obj.kind === "chest") {
      drawChest(obj.x, obj.y, obj.w, obj.h, obj.used);
    }

    if (obj.kind === "campfire") {
      drawCampfire(obj.x, obj.y, obj.w, obj.h);
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
  roundRect(x - width / 2, y, width, 22, 8, true, false);

  ctx.strokeStyle = "#f2c35f";
  ctx.lineWidth = 2;
  roundRect(x - width / 2, y, width, 22, 8, false, true);

  ctx.fillStyle = "#ffe4a6";
  ctx.fillText(text, x - width / 2 + 9, y + 15);
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
