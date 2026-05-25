/* REDVYR KINGDOMS — PHASE 7A LIVING WORLD GENERATION
   A seeded terrain foundation for broad regions, water and natural trails.
   Later biome tile assets can replace these textures without rebuilding the systems.
*/

let biomeVariants = [];
let waterTiles = new Set();
let generatedPathTiles = new Set();
let terrainRandom = null;
let placementRandom = null;

function tileKey(col, row) {
  return col + "," + row;
}

function seededHash(x, y, salt = 0) {
  let n = Math.imul(x + 7919 + salt, 374761393);
  n = (n + Math.imul(y + 1013 + salt, 668265263)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function seededRng(seed) {
  let value = seed >>> 0;
  return function () {
    value = (value + 0x6D2B79F5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function easeNoise(value) {
  return value * value * (3 - 2 * value);
}

function smoothNoise(col, row, scale, salt) {
  const sx = col / scale;
  const sy = row / scale;
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const tx = easeNoise(sx - x0);
  const ty = easeNoise(sy - y0);

  const n00 = seededHash(x0, y0, state.worldSeed + salt);
  const n10 = seededHash(x0 + 1, y0, state.worldSeed + salt);
  const n01 = seededHash(x0, y0 + 1, state.worldSeed + salt);
  const n11 = seededHash(x0 + 1, y0 + 1, state.worldSeed + salt);

  const top = n00 + (n10 - n00) * tx;
  const bottom = n01 + (n11 - n01) * tx;
  return top + (bottom - top) * ty;
}

function ensureWorldSeed() {
  if (!Number.isFinite(state.worldSeed) || state.worldSeed <= 0) {
    state.worldSeed = Math.floor(Math.random() * 2000000000) + 1;
  }

  terrainRandom = seededRng(state.worldSeed);
  placementRandom = seededRng((state.worldSeed ^ 0x45D9F3B) >>> 0);
}

function nextTerrainRandom() {
  return terrainRandom ? terrainRandom() : Math.random();
}

function nextPlacementRandom() {
  return placementRandom ? placementRandom() : Math.random();
}

function paintWaterTile(col, row) {
  if (row < 2 || col < 2 || row >= Math.floor(map.height / map.tile) - 2 || col >= Math.floor(map.width / map.tile) - 2) return;
  waterTiles.add(tileKey(col, row));
}

function paintLake(cx, cy, rx, ry) {
  for (let row = Math.floor(cy - ry - 1); row <= Math.ceil(cy + ry + 1); row++) {
    for (let col = Math.floor(cx - rx - 1); col <= Math.ceil(cx + rx + 1); col++) {
      const wobble = (seededHash(col, row, state.worldSeed + 71) - 0.5) * 0.22;
      const dx = (col - cx) / rx;
      const dy = (row - cy) / ry;
      if (dx * dx + dy * dy <= 1 + wobble) {
        paintWaterTile(col, row);
      }
    }
  }
}

function paintRiver(startCol, startRow, length, initialAngle, width) {
  let col = startCol;
  let row = startRow;
  let angle = initialAngle;

  for (let step = 0; step < length; step++) {
    const currentWidth = width + (nextTerrainRandom() < 0.13 ? 1 : 0);
    for (let yy = -currentWidth; yy <= currentWidth; yy++) {
      for (let xx = -currentWidth; xx <= currentWidth; xx++) {
        if (Math.abs(xx) + Math.abs(yy) <= currentWidth + 1) {
          paintWaterTile(Math.round(col + xx), Math.round(row + yy));
        }
      }
    }

    angle += (nextTerrainRandom() - 0.5) * 0.46;
    col += Math.cos(angle) * 0.95;
    row += Math.sin(angle) * 0.95;

    const cols = Math.floor(map.width / map.tile);
    const rows = Math.floor(map.height / map.tile);
    if (col < 3 || row < 3 || col > cols - 4 || row > rows - 4) break;
  }
}

function createWaterBodies() {
  const cols = Math.floor(map.width / map.tile);
  const rows = Math.floor(map.height / map.tile);

  // One or two memorable lakes, plus smaller ponds.
  const lakeCount = 2;
  for (let i = 0; i < lakeCount; i++) {
    const cx = 12 + nextTerrainRandom() * (cols - 24);
    const cy = 10 + nextTerrainRandom() * (rows - 20);
    const rx = i === 0 ? 7 + nextTerrainRandom() * 4 : 5 + nextTerrainRandom() * 3;
    const ry = i === 0 ? 5 + nextTerrainRandom() * 3 : 4 + nextTerrainRandom() * 3;
    paintLake(cx, cy, rx, ry);
  }

  for (let i = 0; i < 7; i++) {
    const cx = 7 + nextTerrainRandom() * (cols - 14);
    const cy = 7 + nextTerrainRandom() * (rows - 14);
    paintLake(cx, cy, 2.2 + nextTerrainRandom() * 3.4, 1.8 + nextTerrainRandom() * 2.8);
  }

  const riverCount = 2;
  for (let i = 0; i < riverCount; i++) {
    const startFromSide = nextTerrainRandom() < 0.5;
    const startCol = startFromSide ? 4 + nextTerrainRandom() * 7 : 10 + nextTerrainRandom() * (cols - 20);
    const startRow = startFromSide ? 10 + nextTerrainRandom() * (rows - 20) : 4 + nextTerrainRandom() * 7;
    const angle = startFromSide
      ? (nextTerrainRandom() < 0.5 ? 0.05 : Math.PI - 0.05)
      : (nextTerrainRandom() < 0.5 ? Math.PI / 2 : -Math.PI / 2);
    paintRiver(startCol, startRow, 38 + Math.floor(nextTerrainRandom() * 38), angle, nextTerrainRandom() < 0.75 ? 0 : 1);
  }
}

function markPathTile(col, row) {
  const cols = Math.floor(map.width / map.tile);
  const rows = Math.floor(map.height / map.tile);
  if (col < 2 || row < 2 || col >= cols - 2 || row >= rows - 2) return;
  if (waterTiles.has(tileKey(col, row))) return;
  generatedPathTiles.add(tileKey(col, row));
}

function stampPath(col, row, radius) {
  for (let yy = -radius; yy <= radius; yy++) {
    for (let xx = -radius; xx <= radius; xx++) {
      if (Math.abs(xx) + Math.abs(yy) <= radius + 1) {
        markPathTile(Math.round(col + xx), Math.round(row + yy));
      }
    }
  }
}

function growNaturalTrail(startCol, startRow, length, angle, startWidth = 1) {
  let col = startCol;
  let row = startRow;
  let currentAngle = angle;

  for (let step = 0; step < length; step++) {
    let width = startWidth;
    if (Math.sin(step * 0.24) > 0.64 || nextTerrainRandom() < 0.09) width += 1;
    if (nextTerrainRandom() < 0.03) width += 1;
    stampPath(col, row, width);

    currentAngle += (nextTerrainRandom() - 0.5) * 0.23;
    const nextCol = col + Math.cos(currentAngle);
    const nextRow = row + Math.sin(currentAngle);

    if (waterTiles.has(tileKey(Math.round(nextCol), Math.round(nextRow)))) {
      if (nextTerrainRandom() < 0.68) break; // natural path ending beside water
      currentAngle += (nextTerrainRandom() < 0.5 ? -1 : 1) * 0.85;
    } else {
      col = nextCol;
      row = nextRow;
    }

    const cols = Math.floor(map.width / map.tile);
    const rows = Math.floor(map.height / map.tile);
    if (col < 3 || row < 3 || col > cols - 4 || row > rows - 4) break;
  }
}

function createNaturalPaths() {
  const cols = Math.floor(map.width / map.tile);
  const rows = Math.floor(map.height / map.tile);
  const hubCol = Math.floor(cols * (0.35 + nextTerrainRandom() * 0.3));
  const hubRow = Math.floor(rows * (0.35 + nextTerrainRandom() * 0.3));

  // Connected-but-rugged main routes.
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI * 2 * i) / 4 + (nextTerrainRandom() - 0.5) * 0.6;
    growNaturalTrail(hubCol, hubRow, 34 + Math.floor(nextTerrainRandom() * 38), angle, 1);
  }

  // Dead-end branches create more believable exploration paths.
  const pathArray = Array.from(generatedPathTiles);
  for (let i = 0; i < 8 && pathArray.length; i++) {
    const [col, row] = pathArray[Math.floor(nextTerrainRandom() * pathArray.length)].split(",").map(Number);
    growNaturalTrail(col, row, 10 + Math.floor(nextTerrainRandom() * 23), nextTerrainRandom() * Math.PI * 2, nextTerrainRandom() < 0.8 ? 0 : 1);
  }
}

function reserveDryArea(worldX, worldY, radiusTiles = 2) {
  if (!Number.isFinite(worldX) || !Number.isFinite(worldY)) return;
  const centerCol = Math.floor(worldX / map.tile);
  const centerRow = Math.floor(worldY / map.tile);

  for (let row = centerRow - radiusTiles; row <= centerRow + radiusTiles; row++) {
    for (let col = centerCol - radiusTiles; col <= centerCol + radiusTiles; col++) {
      waterTiles.delete(tileKey(col, row));
    }
  }
}

function generatedBaseTile(col, row, biome) {
  const variation = seededHash(col, row, state.worldSeed + 191);

  if (biome === "rocky") {
    if (variation < 0.56) return "rockpath";
    if (variation < 0.68) return "path";
    if (variation < 0.82) return "grassrock";
    return "grass";
  }

  if (biome === "forest") {
    if (variation < 0.07) return "grassflower";
    if (variation < 0.12) return "grassrock";
    return "grass";
  }

  if (variation < 0.10) return "grassflower";
  if (variation < 0.14) return "grassrock";
  return "grass";
}

function generateWorldTerrain() {
  ensureWorldSeed();
  waterTiles = new Set();
  generatedPathTiles = new Set();
  tileVariants = [];
  biomeVariants = [];

  createWaterBodies();
  createNaturalPaths();

  // Existing save locations are protected as dry ground when world generation arrives.
  if (state.campPlaced) reserveDryArea(state.campX + 32, state.campY + 32, 3);
  if (state.hasWorldPosition) reserveDryArea(state.playerX, state.playerY, 2);

  const cols = Math.floor(map.width / map.tile);
  const rows = Math.floor(map.height / map.tile);

  for (let row = 0; row < rows; row++) {
    const tiles = [];
    const biomes = [];

    for (let col = 0; col < cols; col++) {
      const forestField = smoothNoise(col, row, 18, 17) * 0.72 + smoothNoise(col, row, 8, 33) * 0.28;
      const rockyField = smoothNoise(col, row, 22, 67) * 0.76 + smoothNoise(col, row, 9, 85) * 0.24;

      let biome = "plains";
      if (rockyField > 0.64) biome = "rocky";
      else if (forestField > 0.59) biome = "forest";

      const key = tileKey(col, row);
      let tile = generatedBaseTile(col, row, biome);

      if (generatedPathTiles.has(key)) {
        tile = seededHash(col, row, state.worldSeed + 291) < 0.055 ? "rockpath" : "path";
      }

      if (waterTiles.has(key)) {
        tile = "water";
        biome = "water";
      }

      tiles.push(tile);
      biomes.push(biome);
    }

    tileVariants.push(tiles);
    biomeVariants.push(biomes);
  }
}

function getBiomeAtWorldPosition(x, y) {
  const col = clamp(Math.floor(x / map.tile), 0, Math.floor(map.width / map.tile) - 1);
  const row = clamp(Math.floor(y / map.tile), 0, Math.floor(map.height / map.tile) - 1);
  return biomeVariants[row]?.[col] || "plains";
}

function boxTouchesWater(box) {
  const startCol = Math.floor(box.x / map.tile);
  const endCol = Math.floor((box.x + box.w - 1) / map.tile);
  const startRow = Math.floor(box.y / map.tile);
  const endRow = Math.floor((box.y + box.h - 1) / map.tile);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (waterTiles.has(tileKey(col, row))) return true;
    }
  }
  return false;
}

function isGeneratedPathBox(box) {
  const startCol = Math.floor(box.x / map.tile);
  const endCol = Math.floor((box.x + box.w - 1) / map.tile);
  const startRow = Math.floor(box.y / map.tile);
  const endRow = Math.floor((box.y + box.h - 1) / map.tile);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (generatedPathTiles.has(tileKey(col, row))) return true;
    }
  }
  return false;
}

function generatedLandPosition(w, h, preferredBiomes = []) {
  const preference = Array.isArray(preferredBiomes) ? preferredBiomes : [preferredBiomes];

  for (let pass = 0; pass < 2; pass++) {
    for (let attempt = 0; attempt < 260; attempt++) {
      const x = Math.floor((100 + nextPlacementRandom() * (map.width - w - 200)) / map.tile) * map.tile;
      const y = Math.floor((100 + nextPlacementRandom() * (map.height - h - 200)) / map.tile) * map.tile;
      const box = { x, y, w, h };
      const biome = getBiomeAtWorldPosition(x + w / 2, y + h / 2);

      if (boxTouchesWater(box)) continue;
      if (pass === 0 && preference.length && !preference.includes(biome)) continue;
      return { x, y };
    }
  }

  return { x: map.tile * 6, y: map.tile * 6 };
}

function findNearestDryPosition(worldX, worldY, w = 36, h = 36) {
  const startCol = Math.floor(worldX / map.tile);
  const startRow = Math.floor(worldY / map.tile);

  for (let radius = 0; radius < 18; radius++) {
    for (let yy = -radius; yy <= radius; yy++) {
      for (let xx = -radius; xx <= radius; xx++) {
        if (Math.abs(xx) !== radius && Math.abs(yy) !== radius && radius > 0) continue;
        const x = clamp((startCol + xx) * map.tile, 60, map.width - w - 60);
        const y = clamp((startRow + yy) * map.tile, 70, map.height - h - 70);
        if (!boxTouchesWater({ x, y, w, h })) return { x, y };
      }
    }
  }

  return generatedLandPosition(w, h, ["plains"]);
}
