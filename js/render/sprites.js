// render/sprites.js — load per-item SVG sprite files and hand them to the renderer
//
// Sprites are never rotated. Directional items ship `_side` / `_front` variants
// (e.g. cubicle, house) chosen by orientation; everything else is one file.
// getSprite(type, orient) returns null until decoded so the renderer can fall
// back to a plain box for that frame.

const TYPES = [
  "desk", "officeChair", "chair", "whiteboard", "filingCabinet",
  "bookshelf", "shelving", "counter", "lockers", "couch", "bed", "boxes",
  "pallet", "drum", "electricalPanel", "serverRack", "computer", "vending",
  "waterCooler", "sink", "trash", "pottedPlant", "christmasTree",
  "cubicle", "house", // base = the front/down view (no separate _front files)
  // _side (left/right) and _back (away) directional variants
  "cubicle_side", "house_side",
  "lockers_side", "bookshelf_side", "filingCabinet_side", "shelving_side",
  "serverRack_side", "vending_side", "electricalPanel_side",
  "chair_side", "officeChair_side", "computer_side", "whiteboard_side",
  "chair_back", "lockers_back", "bookshelf_back", "filingCabinet_back",
  "shelving_back", "serverRack_back", "vending_back", "electricalPanel_back",
  "cubicle_back", "house_back", "officeChair_back", "computer_back",
  // placed machines / structures / lights (drawn by render/entities.js as the
  // static body; dynamic state — progress, glow, belt items, turret barrel — is
  // overlaid procedurally on top)
  "concrete_forge", "stygian_forge", "crusher", "assembler", "stygian_assembler",
  "wood_generator", "powder_generator", "reactor", "cauldron", "crucible", "loom",
  "animal_pen", "workbench", "tinker_bench", "planter", "mushroom_bed", "bedroll",
  "worm_bin", "turret", "chest", "crate", "smelter", "presser", "mill", "washer",
  "concrete_wall", "stygian_wall", "basalt_wall", "window", "wooden_door",
  "power_pole", "torch", "lantern", "flashlight", "glow_jar", "moth_lantern",
  "portable_lamp", "candle",
  // belts + arms (authored pointing down; the renderer rotates them by facing)
  "belt", "arm", "stygian_belt", "stygian_arm", "unobtanium_belt", "unobtanium_arm",
];
const FALLBACK = "box";

const cache = {};
const loaded = new Set();
let pending = 0;
const readyCbs = [];

function load(name) {
  const img = new Image();
  pending++;
  img.onload = () => { loaded.add(name); if (--pending <= 0) readyCbs.forEach((f) => f()); };
  img.onerror = () => { if (--pending <= 0) readyCbs.forEach((f) => f()); };
  img.src = `sprites/${name}.svg`;
  cache[name] = img;
}

[...TYPES, FALLBACK].forEach(load);

export function getSprite(type, orient) {
  const variant = orient ? `${type}_${orient}` : null;
  if (variant && loaded.has(variant)) return cache[variant];
  if (loaded.has(type)) return cache[type];
  if (loaded.has(FALLBACK)) return cache[FALLBACK];
  return null;
}

// is a specific variant (e.g. "back") actually loaded, not just the base?
export function hasVariant(type, orient) {
  return loaded.has(`${type}_${orient}`);
}

export function onSpritesReady(cb) {
  if (pending <= 0) cb(); else readyCbs.push(cb);
}
