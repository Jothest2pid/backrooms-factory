// world/items.js — item features: furnishings keyed to room types
//
// Items are drawn axis-aligned (never rotated) — directional items pick a
// `side` or `front` sprite variant instead. Every item also gets a collision
// rect (hitbox). Catalog entry: { color, w:[lo,hi], h:[lo,hi], wall? }.

import { pointInPoly } from "../core/polygon.js";

export const ITEMS = {
  desk:          { color: "#6b4a2b", w: [1.6, 2.4], h: [0.9, 1.2] },
  cubicle:       { color: "#8a8466", wall: true },          // a divider WALL, not a booth
  officeChair:   { color: "#3a3a40", w: [0.7, 0.9], h: [0.7, 0.9] },
  chair:         { color: "#7a5a36", w: [0.6, 0.8], h: [0.6, 0.8] },
  whiteboard:    { color: "#e8e8e0", w: [1.8, 2.6], h: [0.25, 0.35] },
  filingCabinet: { color: "#8a8a8f", w: [0.8, 1.0], h: [1.0, 1.4] },
  bookshelf:     { color: "#5a3f22", w: [0.7, 0.9], h: [0.8, 1.0] },
  shelving:      { color: "#6f5a36", w: [0.7, 0.9], h: [2.0, 3.2] },
  counter:       { color: "#5e4326", w: [3.0, 4.5], h: [0.9, 1.1] },
  lockers:       { color: "#4a5a6a", w: [1.0, 1.4], h: [2.6, 4.2] },
  couch:         { color: "#6a4a4a", w: [2.2, 3.0], h: [1.0, 1.3] },
  bed:           { color: "#9a8c70", w: [1.6, 2.0], h: [2.4, 3.0] },
  boxes:         { color: "#8a7448", w: [0.9, 1.6], h: [0.9, 1.6] },
  pallet:        { color: "#9c8550", w: [1.4, 1.8], h: [1.4, 1.8] },
  drum:          { color: "#7a5a30", w: [0.9, 1.1], h: [0.9, 1.1], shape: "plant" },
  electricalPanel:{ color: "#54606a", w: [0.8, 1.1], h: [1.0, 1.3] },
  serverRack:    { color: "#26262c", w: [1.0, 1.3], h: [1.6, 2.2] },
  computer:      { color: "#2f3338", w: [0.7, 0.9], h: [0.6, 0.8] },
  vending:       { color: "#7a2f33", w: [1.0, 1.3], h: [0.9, 1.1] },
  waterCooler:   { color: "#5a8aa0", w: [0.6, 0.8], h: [0.6, 0.8], shape: "plant" },
  sink:          { color: "#c8ccca", w: [1.0, 1.4], h: [0.8, 1.0] },
  trash:         { color: "#3f4a3a", w: [0.5, 0.7], h: [0.5, 0.7], shape: "plant" },
  pottedPlant:   { color: "#3f6a35", w: [0.6, 0.9], h: [0.6, 0.9], shape: "plant" },
  christmasTree: { color: "#1f5a2a", w: [2.2, 3.0], h: [2.2, 3.0], shape: "tree" },
  house:         { color: "#9a8f5e", w: [3, 5], h: [2.6, 3.4] }, // suburb intrusion
};

export const ITEM_INFO = {
  desk:          { name: "Office desk", yields: "Wood, metal scrap", pickup: false },
  cubicle:       { name: "Cubicle divider", yields: "Fabric, light scrap", pickup: false },
  officeChair:   { name: "Office chair", yields: "Scrap, small wheels", pickup: true },
  chair:         { name: "Chair", yields: "Wood, fabric", pickup: true },
  whiteboard:    { name: "Whiteboard", yields: "Light scrap, board panel", pickup: false },
  filingCabinet: { name: "Filing cabinet", yields: "Metal scrap, paper-fuel", pickup: false },
  bookshelf:     { name: "Bookshelf", yields: "Wood, paper-fuel", pickup: false },
  shelving:      { name: "Shelving unit", yields: "Wood, scrap", pickup: false },
  counter:       { name: "Front counter", yields: "Dense wood", pickup: false },
  lockers:       { name: "Lockers", yields: "Metal scrap, small loot", pickup: false },
  couch:         { name: "Couch", yields: "Wood frame, fabric", pickup: false },
  bed:           { name: "Bed", yields: "Fabric, wood, scrap", pickup: false },
  boxes:         { name: "Boxes & crates", yields: "Random loot, fuel", pickup: true },
  pallet:        { name: "Wooden pallet", yields: "Clean wood", pickup: true },
  drum:          { name: "Metal drum", yields: "Metal scrap, sometimes fuel", pickup: true },
  electricalPanel:{ name: "Electrical panel", yields: "Wiring, electronics", pickup: false },
  serverRack:    { name: "Server rack", yields: "Electronics, research", pickup: false },
  computer:      { name: "Computer", yields: "Electronics", pickup: true },
  vending:       { name: "Vending machine", yields: "Food, scrap, canned almond water", pickup: false },
  waterCooler:   { name: "Water cooler", yields: "Almond water, plastic", pickup: true },
  sink:          { name: "Sink", yields: "Metal scrap, almond water", pickup: false },
  trash:         { name: "Trash can", yields: "Fuel, random scrap", pickup: true },
  pottedPlant:   { name: "Potted plant", yields: "Fiber, rare trace heartwood", pickup: true },
  christmasTree: { name: "Christmas tree", yields: "Heartwood — the catalyst", pickup: false },
  house:         { name: "House", yields: "Domestic salvage, prefab shell", pickup: false },
};

export function itemInfo(type) {
  return ITEM_INFO[type] || { name: type, yields: "—", pickup: false };
}

// disassembly: hp = hand-hits to break it, drops = resources it yields
export const DISASSEMBLE = {
  chair:          { hp: 2, drops: { wood: 2 } },
  officeChair:    { hp: 2, drops: { wood: 1, scrap: 1 } },
  desk:           { hp: 4, drops: { wood: 3, scrap: 1 } },
  cubicle:        { hp: 3, drops: { fabric: 2, scrap: 1 } },
  whiteboard:     { hp: 2, drops: { scrap: 1 } },
  filingCabinet:  { hp: 4, drops: { scrap: 3 } },
  bookshelf:      { hp: 3, drops: { wood: 3, fuel: 1 } },
  shelving:       { hp: 3, drops: { wood: 2, scrap: 1 } },
  counter:        { hp: 5, drops: { wood: 4 } },
  lockers:        { hp: 5, drops: { scrap: 4 } },
  couch:          { hp: 4, drops: { wood: 2, fabric: 2 } },
  bed:            { hp: 4, drops: { wood: 2, fabric: 2 } },
  boxes:          { hp: 1, drops: { scrap: 1, fuel: 1 } },
  pallet:         { hp: 2, drops: { wood: 2 } },
  drum:           { hp: 3, drops: { scrap: 2, fuel: 1 } },
  electricalPanel:{ hp: 3, drops: { wiring: 2, electronics: 1 } },
  serverRack:     { hp: 5, drops: { electronics: 3 } },
  computer:       { hp: 2, drops: { electronics: 2 } },
  vending:        { hp: 5, drops: { scrap: 3, food: 1 } },
  waterCooler:    { hp: 2, drops: { plastic: 1, almond_water: 1 } },
  sink:           { hp: 3, drops: { scrap: 2 } },
  trash:          { hp: 1, drops: { fuel: 1 } },
  pottedPlant:    { hp: 1, drops: { fiber: 1 } },
  christmasTree:  { hp: 6, drops: { heartwood: 1 } },
};

export const disassembleSpec = (type) => DISASSEMBLE[type] || { hp: 3, drops: { scrap: 1 } };

const POOLS = {
  yellow:  ["desk", "lockers", "boxes", "chair", "trash", "pottedPlant", "filingCabinet"],
  office:  ["desk", "cubicle", "officeChair", "filingCabinet", "computer", "whiteboard", "serverRack", "trash"],
  pipe:    ["drum", "boxes", "electricalPanel"],
  hub:     ["trash", "boxes"],
  pillar:  ["boxes", "pallet", "drum"],
  pool:    ["lockers", "couch", "trash"],
  christmas: ["boxes", "pottedPlant"],
};
const COUNT = { office: 7, pipe: 2, hub: 1, pillar: 2, pool: 2, christmas: 1 };

const inFloor = (room, x, y) => !room.organic || pointInPoly({ x, y }, room.outline);

// inside a pit or pool? (nothing should spawn over a hole or water)
const inPit = (room, x, y) =>
  room.features.some((ft) => ft.type === "pitfall" && x >= ft.x && x <= ft.x + ft.w && y >= ft.y && y <= ft.y + ft.h);

export function addFurniture(room, f) {
  room.furniture.push(f);
  room.solids.push({ type: "rect", x: f.x - f.w / 2, y: f.y - f.h / 2, w: f.w, h: f.h, furn: f });
}

function dims(rng, type) {
  const spec = ITEMS[type];
  if (spec.wall) {
    return rng() < 0.5
      ? { w: 2.0 + rng() * 1.4, h: 0.4, orient: "side" }
      : { w: 0.4, h: 2.0 + rng() * 1.4, orient: "front" };
  }
  const w = spec.w[0] + rng() * (spec.w[1] - spec.w[0]);
  const h = spec.h[0] + rng() * (spec.h[1] - spec.h[0]);
  return { w, h, orient: w >= h ? "side" : "front" };
}

function place(rng, room, type) {
  if (!ITEMS[type]) return;
  const { w, h, orient } = dims(rng, type);
  const x = 2 + rng() * (room.w - 4);
  const y = 2 + rng() * (room.h - 4);
  if (!inFloor(room, x, y) || inPit(room, x, y)) return; // not over water/holes
  addFurniture(room, { type, x, y, w, h, orient });
}

// houses lined along the walls but never blocking a doorway
function placeHouses(rng, room) {
  const margin = 1.2;
  for (const side of ["N", "S", "E", "W"]) {
    const along = side === "N" || side === "S" ? room.w : room.h;
    const spans = room.doors
      .filter((d) => d.side === side)
      .map((d) => [d.center - d.width / 2 - 0.9, d.center + d.width / 2 + 0.9]);
    const blocked = (a, b) => spans.some(([lo, hi]) => a < hi && b > lo);
    let pos = margin;
    while (pos < along - margin - 2.5) {
      const L = 3 + rng() * 2;
      if (pos + L > along - margin) break;
      if (!blocked(pos, pos + L) && rng() < 0.75) {
        const c = pos + L / 2;
        const d = 2.6 + rng() * 0.8;
        const gap = 1.2; // leave room to walk between the house and the wall
        let f;
        if (side === "N") f = { x: c, y: room.wallT + gap + d / 2, w: L, h: d, orient: "front" };
        else if (side === "S") f = { x: c, y: room.h - room.wallT - gap - d / 2, w: L, h: d, orient: "front" };
        else if (side === "W") f = { x: room.wallT + gap + d / 2, y: c, w: d, h: L, orient: "side" };
        else f = { x: room.w - room.wallT - gap - d / 2, y: c, w: d, h: L, orient: "side" };
        // houses are fixed structures — collide with them, can't pick them up
        if (inFloor(room, f.x, f.y)) addFurniture(room, { type: "house", fixed: true, ...f });
        pos += L + 1.6;
      } else pos += 1.6;
    }
  }
}

export function buildItems(rng, room) {
  if (room.type === "christmas") {
    addFurniture(room, { type: "christmasTree", x: room.w / 2, y: room.h / 2, w: 2.6, h: 2.8, orient: "front" });
    return;
  }
  if (room.type === "suburb") { placeHouses(rng, room); return; }

  // library: rows of bookshelves acting as maze walls, with an aisle gap
  if (room.type === "library") {
    for (let x = 3; x < room.w - 2; x += 3.2) {
      const gap = 2 + rng() * (room.h - 6);
      for (let y = 2; y < room.h - 2; y += 1.0) {
        if (Math.abs(y - gap) < 1.7) continue;
        if (inFloor(room, x, y)) addFurniture(room, { type: "bookshelf", x, y, w: 0.8, h: 0.9, orient: "front" });
      }
    }
    return;
  }

  if (room.type === "yellow") {
    if (rng() < 0.5) return; // most plain rooms are empty
    const pool = POOLS.yellow;
    const n = 1 + Math.floor(rng() * 2);
    for (let i = 0; i < n; i++) place(rng, room, pool[Math.floor(rng() * pool.length)]);
    return;
  }

  const pool = POOLS[room.type] || POOLS.yellow;
  const n = COUNT[room.type] || 2;
  for (let i = 0; i < n; i++) place(rng, room, pool[Math.floor(rng() * pool.length)]);
}
