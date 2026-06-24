// render/floor.js — underlay + dual-grid overlay floor system
//
// UNDERLAY: a single seamless tile (concrete by default, ore where a vein is).
// OVERLAY: carpet / wet-carpet / torn(holey)-carpet as dual-grid tilesets (16
// tiles in a 32px row, mask bits TL=8 TR=4 BR=2 BL=1) drawn on top. Where an
// overlay is absent the underlay shows through — that's a "hole" in the carpet.

import { pointInPoly } from "../core/polygon.js";
import { ORES } from "../world/ore.js";

const OT = 32; // overlay tile px in the row sheets

const O = {}, U = {};
const loaded = new Set();
let pending = 0;
const readyCbs = [];

function load(map, key, src) {
  const img = new Image();
  pending++;
  img.onload = () => { loaded.add(key); if (--pending <= 0) readyCbs.forEach((f) => f()); };
  img.onerror = () => { if (--pending <= 0) readyCbs.forEach((f) => f()); };
  img.src = src;
  map[key] = img;
}
// overlays (player-authored dual-grid sheets)
load(O, "carpet", "assets/tiles/carpet_tiles.png");
load(O, "wet", "assets/tiles/wet_carpet_tiles.png");
load(O, "torn", "assets/tiles/holey_carpet_tiles.png");
// underlays (single seamless 32px tiles)
load(U, "concrete", "assets/tiles/concrete_tiles.png");
load(U, "stygium", "assets/tiles/stygium.png");
load(U, "electrum", "assets/tiles/electrum.png");
load(U, "unobtanium", "assets/tiles/unobtanium.png");
// new minerals — drop a 32x32 PNG named like these into assets/tiles/ and it
// renders automatically; until then ore.js falls back to the mineral's colour.
for (const m of ["basalt", "quartz", "cobalt", "brimstone", "galena", "quicksilver", "niter"])
  load(U, m, `assets/tiles/${m}.png`);

export function onFloorReady(cb) { if (pending <= 0) cb(); else readyCbs.push(cb); }

// ---- per-room material lookup (cached) ----
function mat(room) {
  if (room._mat) return room._mat;
  const torn = new Set(), wet = new Set(), ore = new Map(), block = new Set(), bare = new Set();
  for (const d of room.damage) {
    const k = d.tx + "," + d.ty;
    if (d.bare) bare.add(k);        // stripped to concrete — no carpet at all
    else if (d.wet) wet.add(k);
    else torn.add(k);
  }
  for (const o of room.ores) ore.set(o.tx + "," + o.ty, o.type);
  for (const ft of room.features) {
    if (ft.type !== "pitfall") continue;
    for (let ty = Math.floor(ft.y); ty < Math.ceil(ft.y + ft.h); ty++)
      for (let tx = Math.floor(ft.x); tx < Math.ceil(ft.x + ft.w); tx++)
        block.add(tx + "," + ty);
  }
  room._mat = { torn, wet, ore, block, bare };
  return room._mat;
}

const inFloor = (room, tx, ty) =>
  tx >= 0 && ty >= 0 && tx < room.w && ty < room.h &&
  (!room.organic || pointInPoly({ x: tx + 0.5, y: ty + 0.5 }, room.outline));

// Is there CARPET of any kind here (carpet/wet/torn all count)? Holes are only
// ore/pit/water (where the underlay shows) and pipe rooms (bare concrete).
function carpetAny(room, tx, ty, M) {
  if (room.type === "pipe") return false;
  if (!inFloor(room, tx, ty)) return true;          // carpet runs to the walls
  const k = tx + "," + ty;
  return !(M.ore.has(k) || M.block.has(k) || M.bare.has(k));
}

// The carpet dual-grid base (carpet, or the holey/torn sheet where torn). Wet
// is NOT in the dual grid — a wet cell just gets the wet sheet's FULL tile
// stamped on top, so a wet patch is identical in shape to the carpet beneath
// (no edge/outline), it just looks wet.
function overlay(ctx, room, M) {
  for (let cy = 0; cy <= room.h + 1; cy++) {
    for (let cx = 0; cx <= room.w + 1; cx++) {
      const cells = [[cx - 1, cy - 1, 8], [cx, cy - 1, 4], [cx - 1, cy, 1], [cx, cy, 2]];
      let m = 0, torn = false;
      for (const [x, y, bit] of cells) {
        if (!carpetAny(room, x, y, M)) continue;
        m |= bit;
        if (M.torn.has(x + "," + y)) torn = true;
      }
      if (m === 0) continue;
      const key = torn && loaded.has("torn") ? "torn" : "carpet";
      ctx.drawImage(O[key], m * OT, 0, OT, OT, cx - 0.5, cy - 0.5, 1, 1);
    }
  }
  // wet: stamp the full wet tile exactly on each wet cell (looks identical to
  // the carpet it replaces, just wet — no dual-grid edge/outline)
  if (loaded.has("wet")) {
    for (const k of M.wet) {
      const [tx, ty] = k.split(",").map(Number);
      ctx.drawImage(O.wet, 15 * OT, 0, OT, OT, tx, ty, 1, 1);
    }
  }
}

export function drawFloor(ctx, room) {
  const M = mat(room);
  const trace = () => { ctx.beginPath(); const o = room.outline; ctx.moveTo(o[0].x, o[0].y); for (let i = 1; i < o.length; i++) ctx.lineTo(o[i].x, o[i].y); ctx.closePath(); };

  // underlay: concrete base across the floor
  trace();
  if (loaded.has("concrete")) {
    const p = ctx.createPattern(U.concrete, "repeat");
    p.setTransform(new DOMMatrix().scaleSelf(1 / 32)); // 32px tile -> 1 world unit
    ctx.fillStyle = p;
  } else ctx.fillStyle = "#6f6d66";
  ctx.fill();

  // underlay: ore veins, dilated by one cell so the carpet's curved corner
  // tiles reveal ORE underneath (not concrete) at the patch boundary. Carpet
  // fully covers the dilated ring except where its rounded edges cut in.
  // dilate the vein by one cell ONLY where carpet covers it (so curved corners
  // reveal ore not concrete). In bare-concrete rooms (pipe) draw the exact tiles,
  // otherwise the dilation bloats ore across the visible floor.
  const dilate = room.type === "pipe" ? [[0, 0]] : [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const [k, type] of M.ore) {
    const [tx, ty] = k.split(",").map(Number);
    const name = ORES[type].tile, img = U[name];
    for (const [ox, oy] of dilate) {
      const x = tx + ox, y = ty + oy;
      if (img && loaded.has(name)) ctx.drawImage(img, x, y, 1, 1);
      else { ctx.fillStyle = ORES[type].color; ctx.fillRect(x, y, 1, 1); }
    }
  }

  // carpet overlay (single dual-grid pass; wet/torn variants chosen per-cell)
  ctx.save();
  trace();
  ctx.clip();
  if (loaded.has("carpet")) overlay(ctx, room, M);
  // cozy base-building surfaces laid by the player (on top of carpet/concrete)
  if (room._floored) for (const k of room._floored) {
    const [tx, ty] = k.split(",").map(Number);
    ctx.fillStyle = "#9aa0a6"; ctx.fillRect(tx, ty, 1, 1);
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 0.04; ctx.strokeRect(tx + 0.04, ty + 0.04, 0.92, 0.92);
  }
  if (room._papered) for (const k of room._papered) {
    const [tx, ty] = k.split(",").map(Number);
    ctx.fillStyle = "rgba(201,184,106,0.5)"; ctx.fillRect(tx, ty, 1, 1);
  }
  ctx.restore();
}
