/* INVENTORY ITEM MANAGEMENT */

function ensureItemDetailPanel() {
  let details = $("inventoryItemDetails");

  if (!details) {
    details = document.createElement("div");
    details.id = "inventoryItemDetails";
    details.className = "inventory-item-details hidden";
    inventoryGrid.insertAdjacentElement("afterend", details);
  }

  if (!$("phase3GInventoryStyles")) {
    const style = document.createElement("style");
    style.id = "phase3GInventoryStyles";
    style.textContent = `
      .inventory-slot.selected-item {
        border-color: #ffe4a6;
        box-shadow: inset 0 0 0 2px rgba(242,195,95,0.4), 0 0 12px rgba(242,195,95,0.32);
      }

      .inventory-item-details {
        margin-top: 12px;
        padding: 12px;
        border-radius: 5px;
        background: rgba(0,0,0,0.32);
        border: 2px solid rgba(242,195,95,0.42);
      }

      .inventory-item-head {
        display: flex;
        gap: 11px;
        align-items: center;
        margin-bottom: 9px;
      }

      .inventory-item-head img {
        width: 44px;
        height: 44px;
        object-fit: contain;
        image-rendering: pixelated;
      }

      .inventory-item-head strong {
        display: block;
        color: #ffe4a6;
        font-size: 16px;
      }

      .inventory-item-head span,
      .inventory-item-description {
        color: rgba(255,240,200,0.82);
        font-size: 12px;
        line-height: 1.4;
      }

      .inventory-item-description {
        margin-bottom: 10px;
      }

      .inventory-item-actions {
        display: flex;
        gap: 8px;
      }

      .inventory-item-actions button {
        flex: 1;
        padding: 9px 8px;
        border-radius: 4px;
        color: white;
        background: linear-gradient(#d9442e, #8e1c13);
        border: 2px solid #f2c35f;
      }

      .inventory-item-actions .drop-item-btn {
        background: rgba(40,22,14,0.94);
      }
    `;
    document.head.appendChild(style);
  }

  return details;
}

function selectedItemData() {
  if (!selectedInventoryItem) return null;

  if (selectedInventoryItem.type === "axe") return getAxeById(selectedInventoryItem.itemId);
  if (selectedInventoryItem.type === "pickaxe") return getPickaxeById(selectedInventoryItem.itemId);
  if (selectedInventoryItem.type === "sword") return getSwordById(selectedInventoryItem.itemId);

  if (selectedInventoryItem.type === "potion" && state.potions > 0) {
    return { type: "potion", name: "Health Potion", count: state.potions };
  }

  if (selectedInventoryItem.type === "speedpotion" && state.speedPotions > 0) {
    return { type: "speedpotion", name: "Speed Potion", count: state.speedPotions };
  }

  if (selectedInventoryItem.type === "wood" && state.wood > 0) {
    return { type: "wood", name: "Wood", count: state.wood };
  }

  if (selectedInventoryItem.type === "stone" && state.stone > 0) {
    return { type: "stone", name: "Stone", count: state.stone };
  }

  if (selectedInventoryItem.type === "copperore" && state.copperOre > 0) {
    return { type: "copperore", name: "Copper Ore", count: state.copperOre };
  }

  if (selectedInventoryItem.type === "ironore" && state.ironOre > 0) {
    return { type: "ironore", name: "Iron Ore", count: state.ironOre };
  }

  if (selectedInventoryItem.type === "slimegel" && state.slimeGel > 0) {
    return { type: "slimegel", name: "Slime Gel", count: state.slimeGel };
  }

  return null;
}

function selectInventoryItem(item) {
  selectedInventoryItem =
    item.type === "axe" || item.type === "pickaxe" || item.type === "sword"
      ? { type: item.type, itemId: item.itemId }
      : { type: item.type };

  updateInventoryPanel();
}

function inventoryItemIsSelected(item) {
  if (!selectedInventoryItem) return false;

  if (item.type === "axe" || item.type === "pickaxe" || item.type === "sword") {
    return selectedInventoryItem.type === item.type && selectedInventoryItem.itemId === item.itemId;
  }

  return selectedInventoryItem.type === item.type;
}

function updateInventoryItemDetails() {
  const details = ensureItemDetailPanel();
  const item = selectedItemData();

  if (!item) {
    selectedInventoryItem = null;
    details.classList.add("hidden");
    details.innerHTML = "";
    return;
  }

  details.classList.remove("hidden");
  details.innerHTML = "";

  const head = document.createElement("div");
  head.className = "inventory-item-head";

  const icon = document.createElement("img");
  icon.src = images[item.type].src;
  icon.alt = item.name || item.type;

  const heading = document.createElement("div");
  const title = document.createElement("strong");
  const sub = document.createElement("span");

  if (item.type === "axe" || item.type === "pickaxe" || item.type === "sword") {
    title.textContent = item.name;
    sub.textContent = toolDurabilityText(item) + "/" + item.maxDurability + " durability";
  } else {
    title.textContent = item.name;
    sub.textContent = "Owned: x" + item.count;
  }

  heading.appendChild(title);
  heading.appendChild(sub);
  head.appendChild(icon);
  head.appendChild(heading);
  details.appendChild(head);

  const description = document.createElement("div");
  description.className = "inventory-item-description";

  if (item.type === "axe") {
    description.textContent = "A gathering tool. Gives +0.35x damage on trees and bushes only.";
  } else if (item.type === "pickaxe") {
    description.textContent = "A mining tool. Gives +0.45x damage to stone, copper, and iron nodes.";
  } else if (item.type === "sword") {
    description.textContent = "A combat weapon. Base damage is higher than punching and improves with your Sword stat.";
  } else if (item.type === "potion") {
    description.textContent = "Restores 35 HP when used from your hotbar.";
  } else if (item.type === "speedpotion") {
    description.textContent = "Boosts movement speed by 1.5x for 15 seconds.";
  } else if (item.type === "wood") {
    description.textContent = "A building material gathered from trees and bushes.";
  } else if (item.type === "stone") {
    description.textContent = "A basic building material mined from rocks.";
  } else if (item.type === "copperore") {
    description.textContent = "An uncommon crafting ore. Save it for better tools in the next phase.";
  } else if (item.type === "ironore") {
    description.textContent = "A rare crafting ore. Save it for advanced tools and camp upgrades.";
  } else {
    description.textContent = "A monster material dropped by slimes. Sell it now or save it for crafting later.";
  }

  details.appendChild(description);

  if (item.type !== "axe" && item.type !== "pickaxe" && item.type !== "sword" && item.type !== "potion" && item.type !== "speedpotion") return;

  const actions = document.createElement("div");
  actions.className = "inventory-item-actions";

  const equipButton = document.createElement("button");

  if (item.type === "axe") {
    equipButton.textContent = state.equippedAxeId === item.id ? "Unequip" : "Equip";
    equipButton.addEventListener("click", () => addItemToHotbar("axe", item.id));
  } else if (item.type === "pickaxe") {
    equipButton.textContent = state.equippedPickaxeId === item.id ? "Unequip" : "Equip";
    equipButton.addEventListener("click", () => addItemToHotbar("pickaxe", item.id));
  } else if (item.type === "sword") {
    equipButton.textContent = state.equippedSwordId === item.id ? "Unequip" : "Equip";
    equipButton.addEventListener("click", () => addItemToHotbar("sword", item.id));
  } else if (item.type === "potion") {
    equipButton.textContent = state.hotbar.includes("potion") ? "In Hotbar" : "Add to Hotbar";
    equipButton.disabled = state.hotbar.includes("potion");
    equipButton.addEventListener("click", () => addItemToHotbar("potion"));
  } else {
    equipButton.textContent = state.hotbar.includes("speedpotion") ? "In Hotbar" : "Add to Hotbar";
    equipButton.disabled = state.hotbar.includes("speedpotion");
    equipButton.addEventListener("click", () => addItemToHotbar("speedpotion"));
  }

  actions.appendChild(equipButton);

  if (item.type === "axe" || item.type === "pickaxe" || item.type === "sword") {
    const dropButton = document.createElement("button");
    dropButton.className = "drop-item-btn";
    dropButton.textContent = "Drop";
    dropButton.addEventListener("click", () => dropToolItem(item.type, item.id));
    actions.appendChild(dropButton);
  }

  details.appendChild(actions);
}

function createDroppedToolObject(drop) {
  const isSword = drop.toolData.type === "sword";
  const isPickaxe = drop.toolData.type === "pickaxe";
  return {
    x: drop.x,
    y: drop.y,
    w: 40,
    h: 40,
    kind: isSword ? "droppedsword" : isPickaxe ? "droppedpickaxe" : "droppedaxe",
    interact: true,
    noCollision: true,
    label: "pick up " + drop.toolData.name,
    action: "pickupTool",
    toolData: { ...drop.toolData }
  };
}

function restoreDroppedTools() {
  if (!Array.isArray(state.droppedTools)) state.droppedTools = [];

  state.droppedTools.forEach((drop) => {
    if (drop && drop.toolData && (drop.toolData.type === "axe" || drop.toolData.type === "pickaxe" || drop.toolData.type === "sword")) {
      objects.push(createDroppedToolObject(drop));
    }
  });
}

function dropToolItem(toolType, toolId) {
  const tool = toolType === "sword" ? getSwordById(toolId) : toolType === "pickaxe" ? getPickaxeById(toolId) : getAxeById(toolId);
  if (!tool) return;

  if (toolType === "sword") {
    state.swords = state.swords.filter((ownedTool) => ownedTool.id !== toolId);
    if (state.equippedSwordId === toolId) state.equippedSwordId = null;
  } else if (toolType === "pickaxe") {
    state.pickaxes = state.pickaxes.filter((ownedTool) => ownedTool.id !== toolId);
    if (state.equippedPickaxeId === toolId) state.equippedPickaxeId = null;
  } else {
    state.axes = state.axes.filter((ownedTool) => ownedTool.id !== toolId);
    if (state.equippedAxeId === toolId) state.equippedAxeId = null;
  }

  state.hotbar = state.hotbar.map((item) =>
    hotbarToolItem(item)?.itemId === toolId ? null : item
  );

  const drop = {
    x: clamp(player.x + 30, 30, map.width - 44),
    y: clamp(player.y + 18, 30, map.height - 44),
    toolData: { ...tool }
  };

  if (!Array.isArray(state.droppedTools)) state.droppedTools = [];
  state.droppedTools.push(drop);
  objects.push(createDroppedToolObject(drop));

  selectedInventoryItem = null;
  toast("Dropped " + tool.name + ".");
  addFloatingText(player.x + 20, player.y - 25, "Dropped " + tool.name);
  save();
  syncUI();
}

function dropAxeItem(axeId) {
  dropToolItem("axe", axeId);
}

function pickupDroppedTool(obj) {
  if (!obj.toolData || (obj.toolData.type !== "axe" && obj.toolData.type !== "pickaxe" && obj.toolData.type !== "sword")) return;

  if (obj.toolData.type === "sword") {
    if (!getSwordById(obj.toolData.id)) state.swords.push({ ...obj.toolData });
  } else if (obj.toolData.type === "pickaxe") {
    if (!getPickaxeById(obj.toolData.id)) state.pickaxes.push({ ...obj.toolData });
  } else {
    if (!getAxeById(obj.toolData.id)) state.axes.push({ ...obj.toolData });
  }

  state.droppedTools = (state.droppedTools || []).filter(
    (drop) => drop.toolData?.id !== obj.toolData.id
  );

  obj.hidden = true;
  obj.interact = false;
  selectedInventoryItem = { type: obj.toolData.type, itemId: obj.toolData.id };

  toast("Picked up " + obj.toolData.name + ".");
  addFloatingText(obj.x, obj.y, obj.toolData.name);
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
      name: "Health Potion",
      desc: "Restores 35 HP when used from your hotbar.",
      cost: 25,
      img: images.potion.src,
      buy: () => {
        state.gold -= 25;
        state.potions += 1;
        toast("Bought Health Potion");
      },
      canBuy: () => state.gold >= 25
    },
    {
      id: "axe",
      name: "Basic Axe",
      desc: "60 durability. +0.35x damage on trees and bushes only.",
      cost: 50,
      img: images.axe.src,
      buy: () => {
        state.gold -= 50;
        createBasicAxe();
        toast("Basic Axe bought! Select it in Inventory.");
      },
      canBuy: () => state.gold >= 50
    },
    {
      id: "pickaxe",
      name: "Basic Pickaxe",
      desc: "60 durability. +0.45x damage on stone, copper, and iron.",
      cost: 50,
      img: images.pickaxe.src,
      buy: () => {
        state.gold -= 50;
        createBasicPickaxe();
        toast("Basic Pickaxe bought! Time to mine ores.");
      },
      canBuy: () => state.gold >= 50
    },
    {
      id: "sword",
      name: "Basic Sword",
      desc: "80 durability. Combat weapon powered by your Sword stat.",
      cost: 100,
      img: images.sword.src,
      buy: () => {
        state.gold -= 100;
        createBasicSword();
        toast("Basic Sword bought! Equip it in Inventory.");
      },
      canBuy: () => state.gold >= 100
    },
    {
      id: "speedpotion",
      name: "Speed Potion",
      desc: "Boosts movement speed by 1.5x for 15 seconds.",
      cost: 40,
      img: images.speedpotion.src,
      buy: () => {
        state.gold -= 40;
        state.speedPotions += 1;
        toast("Bought Speed Potion");
      },
      canBuy: () => state.gold >= 40
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
    },
    {
      name: "Sell Slime Gel",
      desc: "Sell 1 gel dropped by slimes.",
      img: images.slimegel.src,
      amountNeeded: 1,
      reward: 10,
      resource: "slimeGel"
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
          toast("Not enough " + option.name.toLowerCase() + ".");
          return;
        }

        state[option.resource] -= option.amountNeeded;
        state.gold += option.reward;

        toast("Sold " + option.name.replace("Sell ", "") + ".");
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

function hotbarToolItem(item) {
  return item && typeof item === "object" && (item.type === "axe" || item.type === "pickaxe" || item.type === "sword") ? item : null;
}

function hotbarAxeItem(item) {
  return item && typeof item === "object" && item.type === "axe" ? item : null;
}

function hotbarSwordItem(item) {
  return item && typeof item === "object" && item.type === "sword" ? item : null;
}

function hotbarPickaxeItem(item) {
  return item && typeof item === "object" && item.type === "pickaxe" ? item : null;
}

function toolByHotbarItem(item) {
  if (item?.type === "axe") return getAxeById(item.itemId);
  if (item?.type === "pickaxe") return getPickaxeById(item.itemId);
  if (item?.type === "sword") return getSwordById(item.itemId);
  return null;
}

function cleanHotbar() {
  if (!Array.isArray(state.axes)) state.axes = [];
  if (!Array.isArray(state.pickaxes)) state.pickaxes = [];
  if (!Array.isArray(state.swords)) state.swords = [];
  state.axes = state.axes.filter((axe) => axe && axe.id && axe.durability > 0);
  state.pickaxes = state.pickaxes.filter((pickaxe) => pickaxe && pickaxe.id && pickaxe.durability > 0);
  state.swords = state.swords.filter((sword) => sword && sword.id && sword.durability > 0);

  if (!Array.isArray(state.hotbar)) {
    state.hotbar = [null, null, null, null, null];
  }

  state.hotbar = state.hotbar.slice(0, 5);
  while (state.hotbar.length < 5) state.hotbar.push(null);

  const seenTools = new Set();

  state.hotbar = state.hotbar.map((item) => {
    if (item === "potion" && state.potions > 0) return item;
    if (item === "speedpotion" && state.speedPotions > 0) return item;

    const toolItem = hotbarToolItem(item);
    if (toolItem && toolByHotbarItem(toolItem) && !seenTools.has(toolItem.itemId)) {
      seenTools.add(toolItem.itemId);
      return { type: toolItem.type, itemId: toolItem.itemId };
    }

    return null;
  });

  if (!equippedAxe() || !state.hotbar.some((item) => hotbarAxeItem(item)?.itemId === state.equippedAxeId)) {
    state.equippedAxeId = null;
  }

  if (!equippedPickaxe() || !state.hotbar.some((item) => hotbarPickaxeItem(item)?.itemId === state.equippedPickaxeId)) {
    state.equippedPickaxeId = null;
  }

  if (!equippedSword() || !state.hotbar.some((item) => hotbarSwordItem(item)?.itemId === state.equippedSwordId)) {
    state.equippedSwordId = null;
  }
}

function addItemToHotbar(itemType, itemId = null) {
  cleanHotbar();

  if (itemType === "potion" || itemType === "speedpotion") {
    const isSpeed = itemType === "speedpotion";
    const count = isSpeed ? state.speedPotions : state.potions;
    if (count <= 0) return;

    if (state.hotbar.includes(itemType)) {
      toast((isSpeed ? "Speed Potion" : "Health Potion") + " is already in your hotbar.");
      return;
    }

    const openSlot = state.hotbar.indexOf(null);
    if (openSlot === -1) {
      toast("Hotbar is full.");
      return;
    }

    state.hotbar[openSlot] = itemType;
    toast((isSpeed ? "Speed Potion" : "Health Potion") + " added to hotbar.");
    save();
    syncUI();
    return;
  }

  if (itemType !== "axe" && itemType !== "pickaxe" && itemType !== "sword") return;

  const tool = itemType === "sword" ? getSwordById(itemId) : itemType === "pickaxe" ? getPickaxeById(itemId) : getAxeById(itemId);
  if (!tool) return;

  const existingSlot = state.hotbar.findIndex(
    (item) => hotbarToolItem(item)?.itemId === tool.id
  );

  const alreadyEquipped =
    itemType === "sword" ? state.equippedSwordId === tool.id :
    itemType === "pickaxe" ? state.equippedPickaxeId === tool.id :
    state.equippedAxeId === tool.id;

  if (alreadyEquipped) {
    if (itemType === "sword") state.equippedSwordId = null;
    else if (itemType === "pickaxe") state.equippedPickaxeId = null;
    else state.equippedAxeId = null;
    toast(tool.name + " unequipped.");
    save();
    syncUI();
    return;
  }

  if (existingSlot === -1) {
    const openSlot = state.hotbar.indexOf(null);
    if (openSlot === -1) {
      toast("Hotbar is full.");
      return;
    }
    state.hotbar[openSlot] = { type: itemType, itemId: tool.id };
  }

  state.equippedAxeId = null;
  state.equippedPickaxeId = null;
  state.equippedSwordId = null;
  if (itemType === "sword") state.equippedSwordId = tool.id;
  else if (itemType === "pickaxe") state.equippedPickaxeId = tool.id;
  else state.equippedAxeId = tool.id;

  toast(tool.name + " equipped.");
  save();
  syncUI();
}

function activateHotbarSlot(slotIndex) {
  cleanHotbar();

  const item = state.hotbar[slotIndex];
  if (!item) return;

  const toolItem = hotbarToolItem(item);
  if (toolItem) {
    addItemToHotbar(toolItem.type, toolItem.itemId);
    return;
  }

  if (item === "potion") {
    if (state.hp >= maxHp()) {
      toast("Health is already full.");
      return;
    }

    state.potions -= 1;
    state.hp = Math.min(maxHp(), state.hp + 35);
    toast("Used Health Potion. +35 HP");

    if (state.potions <= 0) {
      state.hotbar[slotIndex] = null;
    }
  }

  if (item === "speedpotion") {
    state.speedPotions -= 1;
    player.speedBoostUntil = Date.now() + 15000;
    toast("Used Speed Potion! 1.5x speed for 15 seconds.");
    addFloatingText(player.x, player.y - 56, "SPEED BOOST!");

    if (state.speedPotions <= 0) {
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
    const toolItem = hotbarToolItem(item);
    const tool = toolItem ? toolByHotbarItem(toolItem) : null;
    const slot = document.createElement("button");
    slot.className = "hotbar-slot";
    slot.type = "button";
    slot.title = tool
      ? tool.name + " · " + toolDurabilityText(tool) + "/" + tool.maxDurability + " durability"
      : item === "potion"
        ? "Use Health Potion"
        : item === "speedpotion"
          ? "Use Speed Potion · 1.5x speed for 15 seconds"
          : "Empty hotbar slot";

    const isEquipped =
      tool && ((tool.type === "axe" && state.equippedAxeId === tool.id) ||
      (tool.type === "pickaxe" && state.equippedPickaxeId === tool.id) ||
      (tool.type === "sword" && state.equippedSwordId === tool.id));

    if (isEquipped) slot.classList.add("equipped");

    const key = document.createElement("span");
    key.className = "hotbar-key";
    key.textContent = String(index + 1);
    slot.appendChild(key);

    if (tool || item === "potion" || item === "speedpotion") {
      const icon = document.createElement("img");
      icon.src = tool ? images[tool.type].src : item === "speedpotion" ? images.speedpotion.src : images.potion.src;
      icon.alt = tool ? tool.name : item === "speedpotion" ? "Speed Potion" : "Health Potion";
      slot.appendChild(icon);

      const count = document.createElement("span");
      count.className = "hotbar-count";
      count.textContent = tool ? toolDurabilityText(tool) : "x" + (item === "speedpotion" ? state.speedPotions : state.potions);
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

