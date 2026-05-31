/* INVENTORY ITEM MANAGEMENT */

let selectedInventoryCategory = "all";

const INVENTORY_CATEGORIES = [
  { id: "all", name: "All" },
  { id: "tools", name: "Tools" },
  { id: "materials", name: "Materials" },
  { id: "build", name: "Build" },
  { id: "consumables", name: "Food/Pots" }
];

function inventoryCategoryForItem(item) {
  if (!item) return "materials";
  if (item.type === "axe" || item.type === "pickaxe" || item.type === "sword") return "tools";
  if (item.type === "craftingbench" || item.type === "furnace" || item.type === "storagechest") return "build";
  if (item.type === "potion" || item.type === "speedpotion") return "consumables";
  return "materials";
}

function inventoryItemMatchesCategory(item) {
  return selectedInventoryCategory === "all" || inventoryCategoryForItem(item) === selectedInventoryCategory;
}

function ensureInventoryCategoryTabs() {
  let tabs = $("inventoryCategoryTabs");

  if (!tabs) {
    tabs = document.createElement("div");
    tabs.id = "inventoryCategoryTabs";
    tabs.className = "inventory-category-tabs";
    inventoryGrid.insertAdjacentElement("beforebegin", tabs);
  }

  tabs.innerHTML = "";

  INVENTORY_CATEGORIES.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "inventory-category-tab" + (selectedInventoryCategory === category.id ? " active" : "");
    button.textContent = category.name;
    button.addEventListener("click", () => {
      selectedInventoryCategory = category.id;
      updateInventoryPanel();
    });
    tabs.appendChild(button);
  });

  return tabs;
}


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
        flex-wrap: wrap;
        gap: 8px;
      }

      .inventory-item-actions button {
        flex: 1 1 125px;
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

  if (selectedInventoryItem.type === "craftingbench" && state.craftingBenches > 0) {
    return { type: "craftingbench", name: "Crafting Bench", count: state.craftingBenches };
  }

  if (selectedInventoryItem.type === "furnace" && state.furnaces > 0) {
    return { type: "furnace", name: "Furnace", count: state.furnaces };
  }

  if (selectedInventoryItem.type === "storagechest" && state.storageChests > 0) {
    return { type: "storagechest", name: "Storage Chest", count: state.storageChests };
  }

  if (selectedInventoryItem.type === "wood" && state.wood > 0) {
    return { type: "wood", name: "Wood", count: state.wood };
  }

  if (selectedInventoryItem.type === "stone" && state.stone > 0) {
    return { type: "stone", name: "Stone", count: state.stone };
  }

  if (selectedInventoryItem.type === "rawcopper" && state.copperOre > 0) {
    return { type: "rawcopper", name: "Raw Copper", count: state.copperOre };
  }

  if (selectedInventoryItem.type === "rawiron" && state.ironOre > 0) {
    return { type: "rawiron", name: "Raw Iron", count: state.ironOre };
  }

  if (selectedInventoryItem.type === "copper" && state.copper > 0) {
    return { type: "copper", name: "Copper", count: state.copper };
  }

  if (selectedInventoryItem.type === "iron" && state.iron > 0) {
    return { type: "iron", name: "Iron", count: state.iron };
  }

  if (selectedInventoryItem.type === "steel" && state.steel > 0) {
    return { type: "steel", name: "Steel", count: state.steel };
  }

  if (selectedInventoryItem.type === "slimegel" && state.slimeGel > 0) {
    return { type: "slimegel", name: "Slime Gel", count: state.slimeGel };
  }

  if (selectedInventoryItem.type === "mushling" && state.mushlings > 0) {
    return { type: "mushling", name: "Mushling", count: state.mushlings };
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
  } else if (item.type === "craftingbench") {
    description.textContent = "Place this near your camp to open crafting from a real world object.";
  } else if (item.type === "furnace") {
    description.textContent = "Place this near your camp to smelt raw ore over time and collect it later.";
  } else if (item.type === "storagechest") {
    description.textContent = "Place this as stationary storage. In future multiplayer, wilderness chests are public but kingdom land can protect access.";
  } else if (item.type === "wood") {
    description.textContent = "A building material gathered from trees and bushes.";
  } else if (item.type === "stone") {
    description.textContent = "A basic building material mined from rocks.";
  } else if (item.type === "rawcopper") {
    description.textContent = "Raw copper mined from an ore node. Save it for your first crafted upgrades.";
  } else if (item.type === "rawiron") {
    description.textContent = "Raw iron mined from a rare ore node. Smelt it into Iron.";
  } else if (item.type === "copper") {
    description.textContent = "Refined copper. Needed for your first Camp Core upgrade and future crafted gear.";
  } else if (item.type === "iron") {
    description.textContent = "Refined iron. Save it for stronger tools, weapons, and future village progress.";
  } else if (item.type === "steel") {
    description.textContent = "A high-tier metal reserved for future progression.";
  } else if (item.type === "mushling") {
    description.textContent = "A small mushroom sprout. Save it for future farming, nature crafting, or village supplies.";
  } else {
    description.textContent = "A monster material dropped by slimes. Sell it now or save it for crafting.";
  }

  details.appendChild(description);

  if (item.type !== "axe" && item.type !== "pickaxe" && item.type !== "sword" && item.type !== "potion" && item.type !== "speedpotion" && item.type !== "craftingbench" && item.type !== "furnace" && item.type !== "storagechest") return;

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
  } else if (item.type === "speedpotion") {
    equipButton.textContent = state.hotbar.includes("speedpotion") ? "In Hotbar" : "Add to Hotbar";
    equipButton.disabled = state.hotbar.includes("speedpotion");
    equipButton.addEventListener("click", () => addItemToHotbar("speedpotion"));
  } else if (item.type === "craftingbench") {
    equipButton.textContent = state.hotbar.includes("craftingbench") ? "In Hotbar" : "Add to Hotbar";
    equipButton.disabled = state.hotbar.includes("craftingbench");
    equipButton.addEventListener("click", () => addItemToHotbar("craftingbench"));
  } else if (item.type === "furnace") {
    equipButton.textContent = state.hotbar.includes("furnace") ? "In Hotbar" : "Add to Hotbar";
    equipButton.disabled = state.hotbar.includes("furnace");
    equipButton.addEventListener("click", () => addItemToHotbar("furnace"));
  } else if (item.type === "storagechest") {
    equipButton.textContent = state.hotbar.includes("storagechest") ? "In Hotbar" : "Add to Hotbar";
    equipButton.disabled = state.hotbar.includes("storagechest");
    equipButton.addEventListener("click", () => addItemToHotbar("storagechest"));
  }

  actions.appendChild(equipButton);

  if (item.type === "axe" || item.type === "pickaxe" || item.type === "sword") {
    if (isToolAssignedToHotbar(item.id)) {
      const removeButton = document.createElement("button");
      removeButton.className = "drop-item-btn";
      removeButton.textContent = "Remove from Hotbar";
      removeButton.addEventListener("click", () => removeToolFromHotbar(item.type, item.id));
      actions.appendChild(removeButton);
    }

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
  const dropId = drop.id || ("tooldrop-" + drop.toolData.id + "-" + Math.floor(Math.random() * 100000));
  const droppedAt = Number(drop.droppedAt || Date.now());

  drop.id = dropId;
  drop.droppedAt = droppedAt;

  return {
    x: drop.x,
    y: drop.y,
    w: isSword ? 46 : 44,
    h: isSword ? 46 : 44,
    kind: isSword ? "droppedsword" : isPickaxe ? "droppedpickaxe" : "droppedaxe",
    interact: true,
    noCollision: true,
    label: "pick up " + drop.toolData.name,
    action: "pickupTool",
    dropId,
    droppedAt,
    bobPhase: Math.random() * Math.PI * 2,
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
    id: "tooldrop-" + Date.now() + "-" + Math.floor(Math.random() * 100000),
    x: clamp(player.x + 24 + randomInt(-10, 10), 30, map.width - 44),
    y: clamp(player.y + 18 + randomInt(-10, 10), 30, map.height - 44),
    droppedAt: Date.now(),
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
    (drop) => drop.id !== obj.dropId && drop.toolData?.id !== obj.toolData.id
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

  typeNpcText("Need supplies, " + state.name + "?", () => {
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


/* PHASE 8D — INVENTORY TO HOTBAR DRAGGING */
let inventoryHotbarDrag = null;

function inventoryPanelIsOpen() {
  return Boolean(inventoryPanel && !inventoryPanel.classList.contains("hidden"));
}

function hotbarValueFromInventoryItem(item) {
  if (!item) return null;
  if (item.type === "axe" || item.type === "pickaxe" || item.type === "sword") {
    return { type: item.type, itemId: item.itemId };
  }
  if (item.type === "potion" || item.type === "speedpotion" || item.type === "craftingbench" || item.type === "furnace" || item.type === "storagechest") {
    return item.type;
  }
  return null;
}

function hotbarItemDisplayName(item) {
  const toolItem = hotbarToolItem(item);
  const tool = toolItem ? toolByHotbarItem(toolItem) : null;
  if (tool) return tool.name;
  if (item === "potion") return "Health Potion";
  if (item === "speedpotion") return "Speed Potion";
  if (item === "craftingbench") return "Crafting Bench";
  if (item === "furnace") return "Furnace";
  if (item === "storagechest") return "Storage Chest";
  return "Item";
}

function hotbarItemIsStillOwned(item) {
  if (item === "potion") return state.potions > 0;
  if (item === "speedpotion") return state.speedPotions > 0;
  if (item === "craftingbench") return state.craftingBenches > 0;
  if (item === "furnace") return state.furnaces > 0;
  if (item === "storagechest") return state.storageChests > 0;
  const toolItem = hotbarToolItem(item);
  return Boolean(toolItem && toolByHotbarItem(toolItem));
}

function setHotbarSlot(slotIndex, itemValue) {
  cleanHotbar();
  if (slotIndex < 0 || slotIndex >= state.hotbar.length) return false;
  if (itemValue && !hotbarItemIsStillOwned(itemValue)) return false;

  if (itemValue) {
    state.hotbar = state.hotbar.map((entry, index) => {
      if (index === slotIndex) return entry;
      const a = hotbarToolItem(entry);
      const b = hotbarToolItem(itemValue);
      if (a && b && a.itemId === b.itemId) return null;
      if (!a && !b && entry === itemValue) return null;
      return entry;
    });
  }

  state.hotbar[slotIndex] = itemValue;
  cleanHotbar();
  save();
  syncUI();
  return true;
}

function makeInventorySlotDraggable(slot, item) {
  const hotbarValue = hotbarValueFromInventoryItem(item);
  if (!hotbarValue) return;

  slot.classList.add("draggable-inventory-item");
  slot.draggable = true;
  slot.addEventListener("dragstart", (event) => {
    inventoryHotbarDrag = { source: "inventory", item: hotbarValue };
    slot.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(inventoryHotbarDrag));
  });
  slot.addEventListener("dragend", () => {
    slot.classList.remove("dragging");
    setTimeout(() => inventoryHotbarDrag = null, 0);
  });
}

function attachHotbarDragEvents(slot, index) {
  if (inventoryPanelIsOpen()) {
    slot.classList.add("hotbar-drag-ready");
  }

  const item = state.hotbar[index];
  if (item && inventoryPanelIsOpen()) {
    slot.draggable = true;
    slot.addEventListener("dragstart", (event) => {
      inventoryHotbarDrag = { source: "hotbar", index, item };
      slot.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", JSON.stringify(inventoryHotbarDrag));
    });
    slot.addEventListener("dragend", () => {
      slot.classList.remove("dragging");
      setTimeout(() => inventoryHotbarDrag = null, 0);
    });
  }

  slot.addEventListener("dragover", (event) => {
    if (!inventoryPanelIsOpen()) return;
    event.preventDefault();
    slot.classList.add("drop-target");
  });

  slot.addEventListener("dragleave", () => slot.classList.remove("drop-target"));

  slot.addEventListener("drop", (event) => {
    if (!inventoryPanelIsOpen()) return;
    event.preventDefault();
    slot.classList.remove("drop-target");

    let payload = inventoryHotbarDrag;
    if (!payload) {
      try { payload = JSON.parse(event.dataTransfer.getData("text/plain") || "null"); } catch (_) { payload = null; }
    }
    if (!payload) return;

    if (payload.source === "inventory") {
      if (setHotbarSlot(index, payload.item)) {
        toast(hotbarItemDisplayName(payload.item) + " assigned to hotbar.");
      }
      return;
    }

    if (payload.source === "hotbar" && Number.isInteger(payload.index)) {
      const from = payload.index;
      if (from === index) return;
      const temp = state.hotbar[index];
      state.hotbar[index] = state.hotbar[from];
      state.hotbar[from] = temp || null;
      cleanHotbar();
      save();
      syncUI();
      toast("Hotbar slots swapped.");
    }
  });
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

function isToolAssignedToHotbar(toolId) {
  return state.hotbar.some((item) => hotbarToolItem(item)?.itemId === toolId);
}

function removeToolFromHotbar(toolType, toolId) {
  state.hotbar = state.hotbar.map((item) =>
    hotbarToolItem(item)?.itemId === toolId ? null : item
  );

  if (toolType === "axe" && state.equippedAxeId === toolId) state.equippedAxeId = null;
  if (toolType === "pickaxe" && state.equippedPickaxeId === toolId) state.equippedPickaxeId = null;
  if (toolType === "sword" && state.equippedSwordId === toolId) state.equippedSwordId = null;

  const tool = toolType === "sword"
    ? getSwordById(toolId)
    : toolType === "pickaxe"
      ? getPickaxeById(toolId)
      : getAxeById(toolId);

  toast((tool?.name || "Tool") + " removed from hotbar.");
  save();
  syncUI();
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
    if (item === "craftingbench" && state.craftingBenches > 0) return item;
    if (item === "furnace" && state.furnaces > 0) return item;
    if (item === "storagechest" && state.storageChests > 0) return item;

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

  if (itemType === "potion" || itemType === "speedpotion" || itemType === "craftingbench" || itemType === "furnace" || itemType === "storagechest") {
    const counts = {
      potion: state.potions,
      speedpotion: state.speedPotions,
      craftingbench: state.craftingBenches,
      furnace: state.furnaces,
      storagechest: state.storageChests
    };
    const names = {
      potion: "Health Potion",
      speedpotion: "Speed Potion",
      craftingbench: "Crafting Bench",
      furnace: "Furnace",
      storagechest: "Storage Chest"
    };
    const count = counts[itemType] || 0;
    if (count <= 0) return;

    if (state.hotbar.includes(itemType)) {
      toast(names[itemType] + " is already in your hotbar.");
      return;
    }

    const openSlot = state.hotbar.indexOf(null);
    if (openSlot === -1) {
      toast("Hotbar is full. Remove something first.");
      return;
    }

    state.hotbar[openSlot] = itemType;
    toast(names[itemType] + " added to hotbar.");
    save();
    syncUI();
    return;
  }

  if (itemType !== "axe" && itemType !== "pickaxe" && itemType !== "sword") return;

  const tool = itemType === "sword"
    ? getSwordById(itemId)
    : itemType === "pickaxe"
      ? getPickaxeById(itemId)
      : getAxeById(itemId);
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
    toast(tool.name + " unequipped. It remains assigned to your hotbar.");
    save();
    syncUI();
    return;
  }

  if (existingSlot === -1) {
    let targetSlot = state.hotbar.indexOf(null);

    if (targetSlot === -1) {
      const currentlyEquippedId = state.equippedSwordId || state.equippedPickaxeId || state.equippedAxeId;
      targetSlot = state.hotbar.findIndex(
        (item) => hotbarToolItem(item)?.itemId === currentlyEquippedId
      );
    }

    if (targetSlot === -1) {
      toast("Hotbar is full. Select a tool and use Remove from Hotbar.");
      return;
    }

    state.hotbar[targetSlot] = { type: itemType, itemId: tool.id };
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

  if (item === "craftingbench" || item === "furnace" || item === "storagechest") {
    if (typeof beginStructurePlacement === "function") {
      beginStructurePlacement(item, slotIndex);
    } else {
      toast("Placement system is not ready yet.");
    }
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
          : item === "craftingbench"
            ? "Place Crafting Bench"
            : item === "furnace"
              ? "Place Furnace"
              : item === "storagechest"
                ? "Place Storage Chest"
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

    if (tool || item === "potion" || item === "speedpotion" || item === "craftingbench" || item === "furnace" || item === "storagechest") {
      const icon = document.createElement("img");
      icon.src = tool
        ? images[tool.type].src
        : item === "speedpotion"
          ? images.speedpotion.src
          : item === "craftingbench"
            ? images.craftingbench.src
            : item === "furnace"
              ? images.furnace.src
              : item === "storagechest"
                ? images.storagechest.src
                : images.potion.src;
      icon.alt = tool
        ? tool.name
        : item === "speedpotion"
          ? "Speed Potion"
          : item === "craftingbench"
            ? "Crafting Bench"
            : item === "furnace"
              ? "Furnace"
              : item === "storagechest"
                ? "Storage Chest"
                : "Health Potion";
      slot.appendChild(icon);

      const count = document.createElement("span");
      count.className = "hotbar-count";
      count.textContent = tool
        ? toolDurabilityText(tool)
        : "x" + (item === "speedpotion" ? state.speedPotions : item === "craftingbench" ? state.craftingBenches : item === "furnace" ? state.furnaces : item === "storagechest" ? state.storageChests : state.potions);
      slot.appendChild(count);
    }

    if (typeof attachHotbarDragEvents === "function") {
      attachHotbarDragEvents(slot, index);
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


/* PHASE 8C.1 — PLACEABLE STORAGE CHESTS */

let activeStorageChestId = null;
let storageDragSource = null;

const STORAGE_SLOT_COUNT = 18;

const STORAGE_ITEM_INFO = {
  wood: { name: "Wood", image: "wood", get: () => state.wood, set: (n) => state.wood = n },
  stone: { name: "Stone", image: "stone", get: () => state.stone, set: (n) => state.stone = n },
  rawcopper: { name: "Raw Copper", image: "rawcopper", get: () => state.copperOre, set: (n) => state.copperOre = n },
  rawiron: { name: "Raw Iron", image: "rawiron", get: () => state.ironOre, set: (n) => state.ironOre = n },
  copper: { name: "Copper", image: "copper", get: () => state.copper, set: (n) => state.copper = n },
  iron: { name: "Iron", image: "iron", get: () => state.iron, set: (n) => state.iron = n },
  steel: { name: "Steel", image: "steel", get: () => state.steel, set: (n) => state.steel = n },
  slimegel: { name: "Slime Gel", image: "slimegel", get: () => state.slimeGel, set: (n) => state.slimeGel = n },
  mushling: { name: "Mushling", image: "mushling", get: () => state.mushlings, set: (n) => state.mushlings = n },
  potion: { name: "Health Potion", image: "potion", get: () => state.potions, set: (n) => state.potions = n },
  speedpotion: { name: "Speed Potion", image: "speedpotion", get: () => state.speedPotions, set: (n) => state.speedPotions = n },
  craftingbench: { name: "Crafting Bench", image: "craftingbench", get: () => state.craftingBenches, set: (n) => state.craftingBenches = n },
  furnace: { name: "Furnace", image: "furnace", get: () => state.furnaces, set: (n) => state.furnaces = n },
  storagechest: { name: "Storage Chest", image: "storagechest", get: () => state.storageChests, set: (n) => state.storageChests = n }
};

function emptyStorageSlots(count = STORAGE_SLOT_COUNT) {
  return Array.from({ length: count }, () => null);
}

function sanitizeStorageSlots(slots, count = STORAGE_SLOT_COUNT) {
  const output = emptyStorageSlots(count);
  if (!Array.isArray(slots)) return output;

  slots.slice(0, count).forEach((slot, index) => {
    if (!slot || typeof slot !== "object") return;

    if (slot.kind === "tool" && (slot.type === "axe" || slot.type === "pickaxe" || slot.type === "sword") && slot.toolData) {
      const maxDurability = slot.type === "sword" ? 80 : 60;
      output[index] = {
        kind: "tool",
        type: slot.type,
        count: 1,
        toolData: {
          id: String(slot.toolData.id || (slot.type + "-stored-" + index)),
          type: slot.type,
          name: slot.toolData.name || (slot.type === "sword" ? "Basic Sword" : slot.type === "pickaxe" ? "Basic Pickaxe" : "Basic Axe"),
          durability: Math.max(1, Math.min(maxDurability, Number(slot.toolData.durability || maxDurability))),
          maxDurability
        }
      };
      return;
    }

    if (STORAGE_ITEM_INFO[slot.type]) {
      output[index] = {
        kind: "stack",
        type: slot.type,
        count: Math.max(1, Number(slot.count || 1))
      };
    }
  });

  return output;
}

function storageChestStructure() {
  const structure = getStructureById(activeStorageChestId);
  if (!structure || structure.type !== "storagechest") return null;
  structure.slots = sanitizeStorageSlots(structure.slots, STORAGE_SLOT_COUNT);
  return structure;
}

function storageInventoryStacks() {
  return [
    ...state.axes.map((axe) => ({ kind: "tool", type: "axe", itemId: axe.id, name: axe.name, durability: axe.durability, maxDurability: axe.maxDurability, image: "axe" })),
    ...state.pickaxes.map((pickaxe) => ({ kind: "tool", type: "pickaxe", itemId: pickaxe.id, name: pickaxe.name, durability: pickaxe.durability, maxDurability: pickaxe.maxDurability, image: "pickaxe" })),
    ...state.swords.map((sword) => ({ kind: "tool", type: "sword", itemId: sword.id, name: sword.name, durability: sword.durability, maxDurability: sword.maxDurability, image: "sword" })),
    ...Object.entries(STORAGE_ITEM_INFO)
      .filter(([, info]) => info.get() > 0)
      .map(([type, info]) => ({ kind: "stack", type, name: info.name, count: info.get(), image: info.image }))
  ];
}

function storageSlotLabel(item) {
  if (!item) return "";
  if (item.kind === "tool") return toolDurabilityText(item.toolData || item) + "/" + (item.maxDurability || item.toolData?.maxDurability || "");
  return "x" + item.count;
}

function storageSlotName(item) {
  if (!item) return "Empty";
  if (item.kind === "tool") return item.name || item.toolData?.name || "Tool";
  return STORAGE_ITEM_INFO[item.type]?.name || item.type;
}

function storageSlotImage(item) {
  if (!item) return null;
  const imageKey = item.kind === "tool" ? item.type : STORAGE_ITEM_INFO[item.type]?.image;
  return images[imageKey] || null;
}

function openStorage(obj) {
  const structure = getStructureById(obj.structureId);
  if (!structure || structure.type !== "storagechest") return;

  closeAllGamePanels();
  activeStorageChestId = structure.id;
  structure.slots = sanitizeStorageSlots(structure.slots, STORAGE_SLOT_COUNT);
  storagePanel.classList.remove("hidden");
  updateStoragePanel();
}

function closeStorage() {
  if (storagePanel) storagePanel.classList.add("hidden");
  activeStorageChestId = null;
  storageDragSource = null;
}

function removeInventoryForStorage(item) {
  if (!item) return null;

  if (item.kind === "tool") {
    let list = item.type === "axe" ? state.axes : item.type === "pickaxe" ? state.pickaxes : state.swords;
    const tool = list.find((entry) => entry.id === item.itemId);
    if (!tool) return null;

    if (item.type === "axe") state.axes = state.axes.filter((entry) => entry.id !== item.itemId);
    if (item.type === "pickaxe") state.pickaxes = state.pickaxes.filter((entry) => entry.id !== item.itemId);
    if (item.type === "sword") state.swords = state.swords.filter((entry) => entry.id !== item.itemId);
    removeToolFromHotbar(item.type, item.itemId);

    return { kind: "tool", type: item.type, count: 1, toolData: { ...tool } };
  }

  const info = STORAGE_ITEM_INFO[item.type];
  if (!info || info.get() <= 0) return null;
  const amount = Math.min(16, info.get());
  info.set(info.get() - amount);
  return { kind: "stack", type: item.type, count: amount };
}

function giveStorageItemToInventory(item) {
  if (!item) return false;

  if (item.kind === "tool" && item.toolData) {
    const tool = { ...item.toolData };
    if (tool.type === "axe") state.axes.push(tool);
    if (tool.type === "pickaxe") state.pickaxes.push(tool);
    if (tool.type === "sword") state.swords.push(tool);
    return true;
  }

  const info = STORAGE_ITEM_INFO[item.type];
  if (!info) return false;
  info.set(info.get() + Math.max(1, Number(item.count || 1)));
  return true;
}

function firstEmptyStorageSlot(chest) {
  return chest.slots.findIndex((slot) => !slot);
}

function moveInventoryItemToChest(inventoryIndex, targetSlot = null) {
  const chest = storageChestStructure();
  if (!chest) return;
  const item = storageInventoryStacks()[inventoryIndex];
  if (!item) return;

  const slotIndex = Number.isInteger(targetSlot) ? targetSlot : firstEmptyStorageSlot(chest);
  if (slotIndex < 0 || slotIndex >= chest.slots.length) {
    toast("Storage chest is full.");
    return;
  }
  if (chest.slots[slotIndex]) {
    toast("That chest slot is full.");
    return;
  }

  const stored = removeInventoryForStorage(item);
  if (!stored) return;
  chest.slots[slotIndex] = stored;
  toast("Stored " + storageSlotName(stored) + ".");
  save();
  syncUI();
  updateStoragePanel();
}

function moveChestItemToInventory(slotIndex) {
  const chest = storageChestStructure();
  if (!chest || !chest.slots[slotIndex]) return;

  const item = chest.slots[slotIndex];
  if (!giveStorageItemToInventory(item)) return;
  chest.slots[slotIndex] = null;
  toast("Took " + storageSlotName(item) + ".");
  save();
  syncUI();
  updateStoragePanel();
}

function renderStorageSlot(item, options) {
  const slot = document.createElement("button");
  slot.type = "button";
  slot.className = "storage-slot" + (item ? " filled" : " empty");

  if (item) {
    const img = document.createElement("img");
    const image = storageSlotImage(item);
    if (image) img.src = image.src;
    img.alt = storageSlotName(item);
    slot.appendChild(img);

    const count = document.createElement("span");
    count.textContent = storageSlotLabel(item);
    slot.appendChild(count);

    slot.title = storageSlotName(item) + " · drag or click to move";
    slot.draggable = true;
    slot.addEventListener("dragstart", (event) => {
      storageDragSource = options.source;
      slot.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", JSON.stringify(options.source));
    });
    slot.addEventListener("dragend", () => slot.classList.remove("dragging"));
  }

  slot.addEventListener("click", () => {
    if (options.source.side === "inventory") moveInventoryItemToChest(options.source.index);
    if (options.source.side === "chest") moveChestItemToInventory(options.source.index);
  });

  slot.addEventListener("dragover", (event) => {
    event.preventDefault();
    slot.classList.add("drop-target");
  });
  slot.addEventListener("dragleave", () => slot.classList.remove("drop-target"));
  slot.addEventListener("drop", (event) => {
    event.preventDefault();
    slot.classList.remove("drop-target");
    const source = storageDragSource || JSON.parse(event.dataTransfer.getData("text/plain") || "null");
    if (!source) return;

    if (options.source.side === "chest" && source.side === "inventory") {
      moveInventoryItemToChest(source.index, options.source.index);
    } else if (options.source.side === "inventory" && source.side === "chest") {
      moveChestItemToInventory(source.index);
    }
  });

  return slot;
}

function updateStoragePanel() {
  if (!storagePanel || storagePanel.classList.contains("hidden")) return;
  const chest = storageChestStructure();
  if (!chest) {
    closeStorage();
    return;
  }

  if (storagePermissionText) {
    storagePermissionText.textContent = chest.accessMode === "wilderness-public"
      ? "Wilderness chest: future multiplayer rule = anyone can look inside. Kingdom land can restrict it later."
      : "Kingdom chest: future permissions decide who can open/build here.";
  }

  storageInventoryGrid.innerHTML = "";
  storageChestGrid.innerHTML = "";

  storageInventoryStacks().forEach((item, index) => {
    storageInventoryGrid.appendChild(renderStorageSlot(item, { source: { side: "inventory", index } }));
  });

  if (storageInventoryGrid.children.length === 0) {
    const empty = document.createElement("div");
    empty.className = "storage-empty-note";
    empty.textContent = "Inventory is empty.";
    storageInventoryGrid.appendChild(empty);
  }

  chest.slots.forEach((item, index) => {
    storageChestGrid.appendChild(renderStorageSlot(item, { source: { side: "chest", index } }));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const closeStorageButton = document.getElementById("closeStorageBtn");
  if (closeStorageButton) closeStorageButton.addEventListener("click", closeStorage);
});
