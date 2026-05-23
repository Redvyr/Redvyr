/* REDVYR KINGDOMS — PHASE 4A COMBAT
   This file owns combat and enemies only:
   - Punching with Space
   - Slime spawning/chasing/damage/rewards
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
    hp: 10,
    maxHp: 10,
    damage: 8,
    rewardGold: 12,
    rewardXp: 14,
    moveSpeed: 0.72,
    chaseRadius: 230,
    wanderAngle: Math.random() * Math.PI * 2,
    wanderTimer: randomInt(50, 160),
    hurtFlash: 0,
    respawning: false
  };
}

function isPlayerUnarmed() {
  return !equippedAxe();
}

function meleeDamage() {
  return Number((2 + state.stats.strength * 0.35).toFixed(2));
}

function attackOrigin() {
  const range = 70;
  let x = player.x;
  let y = player.y;

  if (player.facing === "left") x -= range;
  if (player.facing === "right") x += range;
  if (player.facing === "up") y -= range;
  if (player.facing === "down") y += range;

  return { x, y };
}

function performPunchAttack() {
  if (gameScreen.classList.contains("hidden")) return;
  if (player.attackCooldown > 0) return;

  if (!isPlayerUnarmed()) {
    toast("Unequip your axe to punch.");
    return;
  }

  player.attackCooldown = 22;
  player.attackSwing = 10;

  const attack = attackOrigin();
  const range = 82;

  let closestSlime = null;
  let closestDistance = Infinity;

  for (const obj of objects) {
    if (obj.kind !== "slime" || obj.hidden || obj.respawning) continue;

    const sx = obj.x + obj.w / 2;
    const sy = obj.y + obj.h / 2;
    const distance = Math.hypot(sx - attack.x, sy - attack.y);

    if (distance <= range && distance < closestDistance) {
      closestDistance = distance;
      closestSlime = obj;
    }
  }

  if (!closestSlime) return;

  hitSlime(closestSlime, meleeDamage());
}

function hitSlime(slime, damage) {
  slime.hp -= damage;
  slime.hurtFlash = 8;

  const dx = slime.x + slime.w / 2 - player.x;
  const dy = slime.y + slime.h / 2 - player.y;
  const distance = Math.hypot(dx, dy) || 1;

  slime.x += (dx / distance) * 18;
  slime.y += (dy / distance) * 18;

  addFloatingText(slime.x + 8, slime.y - 5, "-" + damage.toFixed(2));

  if (slime.hp > 0) return;

  slime.hidden = true;
  slime.respawning = true;

  state.gold += slime.rewardGold;
  addXp(slime.rewardXp);
  addFloatingText(slime.x, slime.y - 18, "+" + slime.rewardGold + " Gold");
  toast("Slime defeated! +" + slime.rewardGold + " gold");

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
    const loss = Math.min(10, state.gold);
    state.gold -= loss;
    state.hp = maxHp();
    player.x = 350;
    player.y = 360;
    toast(loss > 0 ? "Defeated! Returned to camp. -" + loss + " gold" : "Defeated! Returned to camp.");
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

  const origin = attackOrigin();
  const progress = 1 - player.attackSwing / 10;
  const radius = 18 + progress * 22;

  ctx.save();
  ctx.strokeStyle = "rgba(255,240,200,0.82)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, radius, -0.55, 1.4);
  ctx.stroke();
  ctx.restore();
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !gameScreen.classList.contains("hidden")) {
    event.preventDefault();
    performPunchAttack();
  }
});
