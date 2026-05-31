/* REDVYR KINGDOMS — PHASE 4C COMBAT
   This file owns combat and enemies only:
   - Punching and sword attacks with Space
   - Day slimes plus rising night-time enemy waves
   - Dark Slimes and Slime Gel loot
   - Combat drawing/effects
*/

let combatPhase = null;
let nightSpawnTimer = 0;
let nightWaveNumber = 0;

const NIGHT_ENEMY_CAP = 7;
const NIGHT_WAVE_INTERVAL = 1300;

function spawnStarterSlimes() {
  const startingCount = 6;

  for (let i = 0; i < startingCount; i++) {
    const point = randomEnemySpawnPoint(52, 52, {
      minPlayerDistance: 300,
      minCampDistance: 280
    });

    objects.push(createSlime(point.x, point.y, "normal", false));
  }

  combatPhase = cycleInfo().phase;
  nightSpawnTimer = 0;
  nightWaveNumber = 0;

  if (combatPhase === "Night") {
    beginNightDanger();
  }
}

function randomEnemySpawnPoint(w = 52, h = 52, options = {}) {
  const minPlayerDistance = Number(options.minPlayerDistance || 300);
  const minCampDistance = Number(options.minCampDistance || 260);
  const camp = objects.find((obj) => obj.kind === "campfire");
  const campX = camp ? camp.x + camp.w / 2 : map.width / 2;
  const campY = camp ? camp.y + camp.h / 2 : map.height / 2;

  for (let attempt = 0; attempt < 160; attempt++) {
    const x = randomInt(60, map.width - w - 60);
    const y = randomInt(70, map.height - h - 60);
    const testBox = { x, y, w, h };
    const distanceFromPlayer = Math.hypot(x + w / 2 - player.x, y + h / 2 - player.y);
    const distanceFromCamp = Math.hypot(x + w / 2 - campX, y + h / 2 - campY);

    if (typeof isInsideHomeTerritory === "function" && isInsideHomeTerritory(x + w / 2, y + h / 2)) continue;
    if (distanceFromPlayer < minPlayerDistance || distanceFromCamp < minCampDistance) continue;

    const blocked = objects.some((obj) => {
      if (obj.hidden || obj.kind === "slimegel" || obj.kind === "droppedaxe" || obj.kind === "droppedpickaxe" || obj.kind === "droppedsword") return false;

      const padding = obj.kind === "slime" ? 40 : 18;
      const obstacle = {
        x: obj.x - padding,
        y: obj.y - padding,
        w: obj.w + padding * 2,
        h: obj.h + padding * 2
      };

      return overlap(testBox, obstacle);
    });

    if (!blocked) return { x, y };
  }

  return {
    x: randomInt(80, map.width - w - 80),
    y: randomInt(100, map.height - h - 80)
  };
}

function createSlime(x, y, variant = "normal", nightSpawned = false) {
  const isDark = variant === "dark";

  return {
    x,
    y,
    homeX: x,
    homeY: y,
    w: isDark ? 56 : 52,
    h: isDark ? 56 : 52,
    kind: "slime",
    variant,
    enemyName: isDark ? "Dark Slime" : "Slime",
    nightSpawned,
    noCollision: true,
    interact: false,
    hp: isDark ? 22 : 12,
    maxHp: isDark ? 22 : 12,
    damage: isDark ? 12 : 8,
    rewardGold: isDark ? 10 : 4,
    rewardXp: isDark ? 28 : 14,
    moveSpeed: isDark ? 0.92 : 0.72,
    chaseRadius: isDark ? 300 : 230,
    wanderAngle: Math.random() * Math.PI * 2,
    wanderTimer: randomInt(50, 160),
    hurtFlash: 0,
    respawning: false
  };
}

function punchDamage() {
  return Number((2 + state.stats.strength * 0.35).toFixed(2));
}

function swordDamage() {
  return Number((4 + state.stats.sword * 0.7).toFixed(2));
}

function attackOrigin(range = 70) {
  let x = player.x;
  let y = player.y;

  if (player.facing === "left") x -= range;
  if (player.facing === "right") x += range;
  if (player.facing === "up") y -= range;
  if (player.facing === "down") y += range;

  return { x, y };
}

function performPlayerAttack() {
  if (gameScreen.classList.contains("hidden")) return;
  if (player.attackCooldown > 0) return;

  if (equippedAxe() || equippedPickaxe()) {
    toast("Equip a sword or unequip your gathering tool to fight.");
    return;
  }

  const sword = equippedSword();
  const isSwordAttack = Boolean(sword);
  const originDistance = isSwordAttack ? 82 : 68;
  const hitRange = isSwordAttack ? 96 : 78;
  const damage = isSwordAttack ? swordDamage() : punchDamage();

  player.attackCooldown = isSwordAttack ? 20 : 30;
  player.attackSwing = isSwordAttack ? 12 : 10;

  const attack = attackOrigin(originDistance);
  let closestSlime = null;
  let closestDistance = Infinity;

  for (const obj of objects) {
    if (obj.kind !== "slime" || obj.hidden || obj.respawning) continue;

    const sx = obj.x + obj.w / 2;
    const sy = obj.y + obj.h / 2;
    const distance = Math.hypot(sx - attack.x, sy - attack.y);

    if (distance <= hitRange && distance < closestDistance) {
      closestDistance = distance;
      closestSlime = obj;
    }
  }

  if (!closestSlime) return;

  if (isSwordAttack) {
    damageSwordDurability(sword);
  }

  hitSlime(closestSlime, damage, isSwordAttack ? "sword" : "punch");
}

function damageSwordDurability(sword) {
  if (!sword) return;

  sword.durability = Math.max(0, sword.durability - 1);

  if (sword.durability > 0) return;

  state.swords = state.swords.filter((ownedSword) => ownedSword.id !== sword.id);
  state.hotbar = state.hotbar.map((item) =>
    hotbarSwordItem(item)?.itemId === sword.id ? null : item
  );
  state.equippedSwordId = null;

  if (selectedInventoryItem?.type === "sword" && selectedInventoryItem.itemId === sword.id) {
    selectedInventoryItem = null;
  }

  toast("Your Basic Sword broke!");
  addFloatingText(player.x, player.y - 52, "SWORD BROKE!");
}

function hitSlime(slime, damage, attackType) {
  slime.hp -= damage;
  slime.hurtFlash = 8;

  const dx = slime.x + slime.w / 2 - player.x;
  const dy = slime.y + slime.h / 2 - player.y;
  const distance = Math.hypot(dx, dy) || 1;
  const knockback = attackType === "sword" ? 25 : 16;

  slime.x += (dx / distance) * knockback;
  slime.y += (dy / distance) * knockback;

  addFloatingText(slime.x + 8, slime.y - 5, "-" + damage.toFixed(2));

  if (slime.hp > 0) {
    save();
    syncUI();
    return;
  }

  slime.hidden = true;
  slime.respawning = true;

  const gelCount = slime.variant === "dark"
    ? randomInt(2, 3)
    : (Math.random() < 0.35 ? 2 : 1);

  state.gold += slime.rewardGold;
  addXp(slime.rewardXp);
  spawnSlimeGelDrop(slime.x + 10, slime.y + 20, gelCount);
  addFloatingText(slime.x, slime.y - 18, "+" + slime.rewardGold + " Gold");
  toast(slime.enemyName + " defeated! +" + slime.rewardGold + " gold · Gel x" + gelCount);

  save();
  syncUI();

  if (slime.nightSpawned) {
    setTimeout(() => {
      objects = objects.filter((obj) => obj !== slime);
    }, 2500);
    return;
  }

  setTimeout(() => {
    const respawn = randomEnemySpawnPoint(slime.w, slime.h, {
      minPlayerDistance: 300,
      minCampDistance: 280
    });

    slime.x = respawn.x;
    slime.y = respawn.y;
    slime.homeX = respawn.x;
    slime.homeY = respawn.y;
    slime.hp = slime.maxHp;
    slime.hidden = false;
    slime.respawning = false;
    slime.hurtFlash = 0;
  }, 12000);
}

function spawnWorldLootDrop(type, x, y, count = 1) {
  const info = typeof STORAGE_ITEM_INFO === "object" ? STORAGE_ITEM_INFO[type] : null;
  if (!info) return null;

  const drop = {
    id: "loot-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
    type,
    x: clamp(x + randomInt(-10, 10), 24, map.width - 40),
    y: clamp(y + randomInt(-10, 10), 24, map.height - 40),
    count: Math.max(1, Number(count || 1)),
    droppedAt: Date.now()
  };

  if (!Array.isArray(state.droppedLoot)) state.droppedLoot = [];
  state.droppedLoot.push(drop);
  objects.push(createLootObject(drop));
  return drop;
}

function spawnSlimeGelDrop(x, y, count = 1) {
  spawnWorldLootDrop("slimegel", x, y, count);
}

function createLootObject(drop) {
  const info = typeof STORAGE_ITEM_INFO === "object" ? STORAGE_ITEM_INFO[drop.type] : null;
  const name = info?.name || (drop.type === "slimegel" ? "Slime Gel" : "Item");
  const droppedAt = Number(drop.droppedAt || Date.now());
  drop.droppedAt = droppedAt;

  return {
    x: drop.x,
    y: drop.y,
    w: 32,
    h: 32,
    kind: drop.type === "slimegel" ? "slimegel" : "droppedloot",
    itemType: drop.type,
    noCollision: true,
    interact: true,
    label: "pick up " + name,
    action: "pickupLoot",
    dropId: drop.id,
    droppedAt,
    bobPhase: Math.random() * Math.PI * 2,
    lootData: { ...drop }
  };
}

function restoreDroppedLoot() {
  if (!Array.isArray(state.droppedLoot)) state.droppedLoot = [];
  state.droppedLoot.forEach((drop) => {
    const info = typeof STORAGE_ITEM_INFO === "object" ? STORAGE_ITEM_INFO[drop.type] : null;
    if (info && drop.count > 0) {
      if (!drop.droppedAt) drop.droppedAt = Date.now();
      objects.push(createLootObject(drop));
    }
  });
}

function pickupDroppedLoot(obj) {
  if (!obj.lootData) return;
  const info = typeof STORAGE_ITEM_INFO === "object" ? STORAGE_ITEM_INFO[obj.lootData.type] : null;
  if (!info) return;

  info.set(info.get() + Math.max(1, Number(obj.lootData.count || 1)));
  state.droppedLoot = state.droppedLoot.filter((drop) => drop.id !== obj.lootData.id);
  obj.hidden = true;
  obj.interact = false;

  toast("Picked up " + info.name + " x" + obj.lootData.count + ".");
  addFloatingText(obj.x, obj.y - 6, "+" + info.name + " x" + obj.lootData.count);
}

function updateNightEnemySpawning() {
  const phase = cycleInfo().phase;

  if (phase !== combatPhase) {
    combatPhase = phase;

    if (phase === "Night") {
      beginNightDanger();
    } else {
      endNightDanger();
    }
  }

  if (phase !== "Night") return;

  nightSpawnTimer -= 1;
  if (nightSpawnTimer <= 0) {
    nightWaveNumber += 1;
    spawnNightWave(1);
    nightSpawnTimer = NIGHT_WAVE_INTERVAL;
  }
}

function beginNightDanger() {
  nightWaveNumber = 0;
  nightSpawnTimer = 500;
  toast("Night falls... slimes emerge from the dark.");
  addFloatingText(player.x - 70, player.y - 75, "NIGHT FALLS");
  spawnNightWave(2);
}

function endNightDanger() {
  nightWaveNumber = 0;
  nightSpawnTimer = 0;

  const before = objects.length;
  objects = objects.filter((obj) => !(obj.kind === "slime" && obj.nightSpawned));
  const removed = before - objects.length;

  if (removed > 0) {
    toast("Dawn arrives. The night slimes retreat.");
  }
}

function countNightEnemies() {
  return objects.filter((obj) =>
    obj.kind === "slime" && obj.nightSpawned && !obj.hidden
  ).length;
}

function spawnNightWave(amount = 1) {
  for (let i = 0; i < amount; i++) {
    if (countNightEnemies() >= NIGHT_ENEMY_CAP) return;

    const darkChance = Math.min(0.65, 0.28 + nightWaveNumber * 0.07);
    const variant = Math.random() < darkChance ? "dark" : "normal";
    const size = variant === "dark" ? 56 : 52;
    const pos = randomEnemySpawnPoint(size, size, {
      minPlayerDistance: 360,
      minCampDistance: 330
    });

    objects.push(createSlime(pos.x, pos.y, variant, true));
  }
}

function updateCombat() {
  updateNightEnemySpawning();

  for (const slime of objects) {
    if (slime.kind !== "slime" || slime.hidden || slime.respawning) continue;

    if (slime.hurtFlash > 0) slime.hurtFlash -= 1;

    const cx = slime.x + slime.w / 2;
    const cy = slime.y + slime.h / 2;
    const dx = player.x - cx;
    const dy = player.y - cy;
    const distanceToPlayer = Math.hypot(dx, dy) || 1;

    let moveX = 0;
    let moveY = 0;

    if (distanceToPlayer <= slime.chaseRadius) {
      moveX = (dx / distanceToPlayer) * slime.moveSpeed;
      moveY = (dy / distanceToPlayer) * slime.moveSpeed;
    } else {
      slime.wanderTimer -= 1;

      if (slime.wanderTimer <= 0) {
        slime.wanderAngle = Math.random() * Math.PI * 2;
        slime.wanderTimer = randomInt(50, 160);
      }

      moveX = Math.cos(slime.wanderAngle) * 0.25;
      moveY = Math.sin(slime.wanderAngle) * 0.25;

      const homeDistance = Math.hypot(slime.homeX - slime.x, slime.homeY - slime.y);
      if (homeDistance > 150 && !slime.nightSpawned) {
        moveX = ((slime.homeX - slime.x) / homeDistance) * slime.moveSpeed;
        moveY = ((slime.homeY - slime.y) / homeDistance) * slime.moveSpeed;
      }
    }

    const nextSlimeX = clamp(slime.x + moveX, 20, map.width - slime.w - 20);
    const nextSlimeY = clamp(slime.y + moveY, 20, map.height - slime.h - 20);
    const nextSlimeBox = { x: nextSlimeX, y: nextSlimeY, w: slime.w, h: slime.h };

    // Water has no movement collision during this world-layout experiment.
    slime.x = nextSlimeX;
    slime.y = nextSlimeY;

    if (distanceToPlayer < 42 && player.hurtCooldown <= 0) {
      hurtPlayer(slime.damage, slime);
    }
  }
}

function hurtPlayer(damage, enemy) {
  player.hurtCooldown = 48;
  state.hp = Math.max(0, state.hp - damage);

  addFloatingText(player.x - 10, player.y - 58, "-" + damage + " HP");

  const dx = player.x - (enemy.x + enemy.w / 2);
  const dy = player.y - (enemy.y + enemy.h / 2);
  const distance = Math.hypot(dx, dy) || 1;
  const pushX = player.x + (dx / distance) * 22;
  const pushY = player.y + (dy / distance) * 22;

  if (canMoveTo(pushX, player.y)) player.x = pushX;
  if (canMoveTo(player.x, pushY)) player.y = pushY;

  if (state.hp <= 0) {
    const loss = Math.ceil(state.gold * 0.05);
    state.gold = Math.max(0, state.gold - loss);
    state.hp = maxHp();
    const homeCamp = typeof currentCampfire === "function" ? currentCampfire() : null;
    player.x = homeCamp ? homeCamp.x + 32 : 520;
    player.y = homeCamp ? homeCamp.y + 94 : 430;
    closeNpcDialogue();
    closeBuyPanel();
    closeSellPanel();
    toast(loss > 0 ? "Defeated! Lost 5% gold (-" + loss + ")." : "Defeated! Returned to camp.");
  }

  save();
  syncUI();
}

function drawSlime(slime, x) {
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  ctx.fillRect(x + 7, slime.y + slime.h - 7, slime.w - 14, 6);

  if (slime.hurtFlash > 0) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, slime.y, slime.w, slime.h);
    ctx.restore();
  }

  const slimeImage = slime.variant === "dark" ? images.darkslime : images.slime;
  const fallback = slime.variant === "dark" ? "#623a96" : "#56b94f";
  drawImg(slimeImage, x, slime.y, slime.w, slime.h, fallback);

  const hpWidth = slime.w - 7;
  const hpPercent = Math.max(0, slime.hp / slime.maxHp);

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(x + 3, slime.y - 9, hpWidth, 6);

  ctx.fillStyle = slime.variant === "dark" ? "#a35fe8" : "#e14335";
  ctx.fillRect(x + 3, slime.y - 9, hpWidth * hpPercent, 6);
}

function drawCombatEffects() {
  if (player.attackSwing <= 0) return;

  const sword = equippedSword();
  const origin = attackOrigin(sword ? 82 : 68);
  const totalFrames = sword ? 12 : 10;
  const progress = 1 - player.attackSwing / totalFrames;
  const radius = (sword ? 25 : 18) + progress * (sword ? 30 : 22);

  const facingRotation = {
    right: 0,
    down: Math.PI / 2,
    left: Math.PI,
    up: -Math.PI / 2
  }[player.facing] || 0;

  ctx.save();
  ctx.translate(origin.x, origin.y);
  ctx.rotate(facingRotation);
  ctx.strokeStyle = sword ? "rgba(215,235,255,0.95)" : "rgba(255,240,200,0.82)";
  ctx.lineWidth = sword ? 5 : 4;
  ctx.beginPath();
  ctx.arc(0, 0, radius, -0.72, 1.24);
  ctx.stroke();

  if (!sword) {
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.70, -0.60, 1.10);
    ctx.stroke();
  }
  ctx.restore();
}

window.addEventListener("keydown", (event) => {
  const typingInField = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
  const placingCamp = typeof isCampPlacementActive === "function" && isCampPlacementActive();
  if (typingInField || placingCamp) return;

  if (event.code === "Space" && !gameScreen.classList.contains("hidden")) {
    event.preventDefault();
    performPlayerAttack();
  }
});
