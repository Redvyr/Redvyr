/* REDVYR KINGDOMS — PHASE 4B COMBAT
   This file owns combat and enemies only:
   - Punching and sword attacks with Space
   - Slime spawning/chasing/damage
   - Slime Gel loot pickups
   - Combat drawing/effects
*/

function spawnStarterSlimes() {
  const spawnPoints = [
    { x: 1180, y: 210 },
    { x: 1420, y: 330 },
    { x: 1220, y: 820 },
    { x: 1560, y: 870 },
    { x: 720, y: 970 },
    { x: 1080, y: 1050 }
  ];

  for (const point of spawnPoints) {
    objects.push(createSlime(point.x, point.y));
  }
}

function createSlime(x, y) {
  return {
    x,
    y,
    homeX: x,
    homeY: y,
    w: 52,
    h: 52,
    kind: "slime",
    noCollision: true,
    interact: false,
    hp: 12,
    maxHp: 12,
    damage: 8,
    rewardGold: 4,
    rewardXp: 14,
    moveSpeed: 0.72,
    chaseRadius: 230,
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

  if (equippedAxe()) {
    toast("Equip a sword or unequip your axe to fight.");
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

  const gelCount = Math.random() < 0.35 ? 2 : 1;
  state.gold += slime.rewardGold;
  addXp(slime.rewardXp);
  spawnSlimeGelDrop(slime.x + 10, slime.y + 20, gelCount);
  addFloatingText(slime.x, slime.y - 18, "+" + slime.rewardGold + " Gold");
  toast("Slime defeated! +" + slime.rewardGold + " gold · Gel dropped");

  save();
  syncUI();

  setTimeout(() => {
    slime.x = slime.homeX + randomInt(-45, 45);
    slime.y = slime.homeY + randomInt(-45, 45);
    slime.hp = slime.maxHp;
    slime.hidden = false;
    slime.respawning = false;
    slime.hurtFlash = 0;
  }, 12000);
}

function spawnSlimeGelDrop(x, y, count = 1) {
  const drop = {
    id: "gel-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
    type: "slimegel",
    x,
    y,
    count
  };

  if (!Array.isArray(state.droppedLoot)) state.droppedLoot = [];
  state.droppedLoot.push(drop);
  objects.push(createLootObject(drop));
}

function createLootObject(drop) {
  return {
    x: drop.x,
    y: drop.y,
    w: 32,
    h: 32,
    kind: "slimegel",
    noCollision: true,
    interact: true,
    label: "pick up Slime Gel",
    action: "pickupLoot",
    lootData: { ...drop }
  };
}

function restoreDroppedLoot() {
  if (!Array.isArray(state.droppedLoot)) state.droppedLoot = [];
  state.droppedLoot.forEach((drop) => {
    if (drop.type === "slimegel" && drop.count > 0) {
      objects.push(createLootObject(drop));
    }
  });
}

function pickupDroppedLoot(obj) {
  if (!obj.lootData || obj.lootData.type !== "slimegel") return;

  state.slimeGel += obj.lootData.count;
  state.droppedLoot = state.droppedLoot.filter((drop) => drop.id !== obj.lootData.id);
  obj.hidden = true;
  obj.interact = false;

  toast("Picked up Slime Gel x" + obj.lootData.count + ".");
  addFloatingText(obj.x, obj.y - 6, "+Gel x" + obj.lootData.count);
}

function updateCombat() {
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
      if (homeDistance > 150) {
        moveX = ((slime.homeX - slime.x) / homeDistance) * slime.moveSpeed;
        moveY = ((slime.homeY - slime.y) / homeDistance) * slime.moveSpeed;
      }
    }

    slime.x = clamp(slime.x + moveX, 20, map.width - slime.w - 20);
    slime.y = clamp(slime.y + moveY, 20, map.height - slime.h - 20);

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
    player.x = 350;
    player.y = 360;
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
  ctx.fillRect(x + 7, slime.y + 45, 38, 6);

  if (slime.hurtFlash > 0) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, slime.y, slime.w, slime.h);
    ctx.restore();
  }

  drawImg(images.slime, x, slime.y, slime.w, slime.h, "#56b94f");

  const hpWidth = 45;
  const hpPercent = Math.max(0, slime.hp / slime.maxHp);

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(x + 3, slime.y - 9, hpWidth, 6);

  ctx.fillStyle = "#e14335";
  ctx.fillRect(x + 3, slime.y - 9, hpWidth * hpPercent, 6);
}

function drawCombatEffects() {
  if (player.attackSwing <= 0) return;

  const sword = equippedSword();
  const origin = attackOrigin(sword ? 82 : 68);
  const totalFrames = sword ? 12 : 10;
  const progress = 1 - player.attackSwing / totalFrames;
  const radius = (sword ? 25 : 18) + progress * (sword ? 30 : 22);

  ctx.save();
  ctx.strokeStyle = sword ? "rgba(215,235,255,0.95)" : "rgba(255,240,200,0.82)";
  ctx.lineWidth = sword ? 5 : 4;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, radius, -0.55, 1.4);
  ctx.stroke();
  ctx.restore();
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !gameScreen.classList.contains("hidden")) {
    event.preventDefault();
    performPlayerAttack();
  }
});
