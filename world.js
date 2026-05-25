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
    chestType: "starter",
    used: false
  });

  objects.push({
    x: 505,
    y: 224,
    w: 92,
    h: 116,
    kind: "npc",
    interact: true,
    label: "talk to Rowan",
    action: "npc",
    npcName: "Rowan"
  });

  for (let i = 0; i < 26; i++) {
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

  for (let i = 0; i < 16; i++) {
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

  for (let i = 0; i < 8; i++) {
    const pos = randomSafePosition(52, 48);

    objects.push(makeResource({
      x: pos.x,
      y: pos.y,
      w: 52,
      h: 48,
      kind: "copperore",
      action: "copper",
      label: "mine copper ore",
      amount: 1,
      maxHp: randomInt(13, 17),
      requiresPickaxe: true
    }));
  }

  for (let i = 0; i < 4; i++) {
    const pos = randomSafePosition(52, 48);

    objects.push(makeResource({
      x: pos.x,
      y: pos.y,
      w: 52,
      h: 48,
      kind: "ironore",
      action: "iron",
      label: "mine iron ore",
      amount: 1,
      maxHp: randomInt(20, 25),
      requiresPickaxe: true
    }));
  }

  for (let i = 0; i < 20; i++) {
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

  spawnRareChests();
  restoreDroppedTools();
  restoreDroppedLoot();
  spawnStarterSlimes();

  player.x = 520;
  player.y = 430;
  player.vx = 0;
  player.vy = 0;

  camera.x = 0;
  camera.y = 0;
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
  // Common chests now give exploration rewards; special chests stay rare.
  for (let i = 0; i < 7; i++) {
    createWorldChest("normal", "open chest");
  }

  const rareCount = randomInt(1, 2);
  for (let i = 0; i < rareCount; i++) {
    createWorldChest("rare", "open rare chest");
  }

  if (Math.random() < 0.22) {
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
    w: 360,
    h: 210
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

  if (obj.kind === "npc") {
    return { x: obj.x + 14, y: obj.y + 44, w: 36, h: 34 };
  }

  if (obj.kind === "chest" || obj.kind === "rarechest" || obj.kind === "legendarychest") {
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
  updateCombat();

  for (const obj of objects) {
    if (obj.shake && obj.shake > 0) obj.shake -= 1;
  }

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

  closeRowanPanelsWhenFar();

  const near = nearbyInteractable();
  const prompt = $("interactPrompt");

  if (near) {
    if (near.action === "wood" || near.action === "stone" || near.action === "copper" || near.action === "iron" || near.action === "bush") {
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

function nearbyInteractable() {
  const reach = { x: player.x - 58, y: player.y - 58, w: 116, h: 116 };

  return objects.find((obj) => {
    return obj.interact && !obj.hidden && overlap(reach, interactHitbox(obj));
  });
}

function interact() {
  const obj = nearbyInteractable();

  if (!obj) return;

  if (obj.action === "wood" || obj.action === "stone" || obj.action === "copper" || obj.action === "iron" || obj.action === "bush") {
    hitResource(obj);
  }

  if (obj.action === "chest") {
    openChest(obj);
  }

  if (obj.action === "camp") {
    openCamp();
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
    healthPotionReward = Math.random() < 0.10 ? 1 : 0;
    speedPotionReward = Math.random() < 0.05 ? 1 : 0;
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

  if (state.gold >= cost.gold && state.wood >= cost.wood && state.stone >= cost.stone) {
    state.gold -= cost.gold;
    state.wood -= cost.wood;
    state.stone -= cost.stone;
    state.campLevel += 1;
    addXp(20);

    toast("Camp upgraded to level " + state.campLevel + "!");
    addFloatingText(player.x, player.y - 50, "Camp Lv." + state.campLevel);
  } else {
    toast("Need " + formatNumber(cost.gold) + " gold, " + cost.wood + " wood, " + cost.stone + " stone.");
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
    const newPos = randomSafePosition(obj.w, obj.h);
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
  drawEntitiesLayered();
  drawCombatEffects();
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
  if (obj.kind === "copperore") drawImg(images.copperore, drawX, obj.y, obj.w, obj.h, "#b87333");
  if (obj.kind === "ironore") drawImg(images.ironore, drawX, obj.y, obj.w, obj.h, "#707983");
  if (obj.kind === "bush1") drawImg(images.bush1, drawX, obj.y, obj.w, obj.h, "#3a9136");
  if (obj.kind === "bush2") drawImg(images.bush2, drawX, obj.y, obj.w, obj.h, "#3a9136");
  if (obj.kind === "chest") drawChest(drawX, obj.y, obj.w, obj.h, obj.used, "normal");
  if (obj.kind === "rarechest") drawChest(drawX, obj.y, obj.w, obj.h, obj.used, "rare");
  if (obj.kind === "legendarychest") drawChest(drawX, obj.y, obj.w, obj.h, obj.used, "legendary");
  if (obj.kind === "campfire") drawCampfire(drawX, obj.y, obj.w, obj.h);
  if (obj.kind === "npc") drawNpc(drawX, obj.y, obj.w, obj.h, obj.npcName || "Rowan");
  if (obj.kind === "slime") drawSlime(obj, drawX);

  if (obj.kind === "droppedaxe") {
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.fillRect(drawX + 7, obj.y + 31, 28, 6);
    drawImg(images.axe, drawX, obj.y, obj.w, obj.h, "#a86b36");
  }

  if (obj.kind === "droppedsword") {
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.fillRect(drawX + 7, obj.y + 31, 28, 6);
    drawImg(images.sword, drawX, obj.y, obj.w, obj.h, "#d7eaff");
  }

  if (obj.kind === "droppedpickaxe") {
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    ctx.fillRect(drawX + 7, obj.y + 31, 28, 6);
    drawImg(images.pickaxe, drawX, obj.y, obj.w, obj.h, "#9b7451");
  }

  if (obj.kind === "slimegel") {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(drawX + 5, obj.y + 25, 22, 5);
    drawImg(images.slimegel, drawX, obj.y, obj.w, obj.h, "#59cf60");
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

function drawCampfire(x, y, w, h) {
  const radius = campLightRadius();

  const gradient = ctx.createRadialGradient(x + 32, y + 32, 8, x + 32, y + 32, radius);
  gradient.addColorStop(0, "rgba(255, 224, 112, 0.36)");
  gradient.addColorStop(0.18, "rgba(255, 194, 70, 0.26)");
  gradient.addColorStop(0.55, "rgba(255, 150, 38, 0.11)");
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
    light.addColorStop(0, "rgba(255, 232, 132, 0.40)");
    light.addColorStop(0.18, "rgba(255, 203, 85, 0.30)");
    light.addColorStop(0.55, "rgba(255, 164, 45, 0.14)");
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

