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
  // directional variants (base sprite serves the "side"/wide orientation)
  "cubicle_side", "cubicle_front", "house_side", "house_front",
  // tall standing pieces: base = front, _side = thin vertical-axis profile
  "lockers_side", "bookshelf_side", "filingCabinet_side", "shelving_side",
  "serverRack_side", "vending_side", "electricalPanel_side",
  "chair_side",
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

export function onSpritesReady(cb) {
  if (pending <= 0) cb(); else readyCbs.push(cb);
}
