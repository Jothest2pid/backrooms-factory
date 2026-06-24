// world/structural.js — structural features (shape modifiers + obstacles)
//
// Features render in render/features.js; ones that block movement also push a
// shape to room.solids. Pillars and pitfalls are inspectable (see interact.js).

import { pointInPoly } from "../core/polygon.js";

const inFloor = (room, x, y) => !room.organic || pointInPoly({ x, y }, room.outline);

// place a pillar, unless it would overlap an existing one (or sit off-floor).
// returns true if placed.
function addPillar(room, x, y, r) {
  if (!inFloor(room, x, y)) return false;
  for (const f of room.features) {
    if (f.type === "pillar" && Math.hypot(f.x - x, f.y - y) < f.r + r + 0.35) return false;
  }
  room.features.push({ type: "pillar", x, y, r });
  room.solids.push({ type: "circle", x, y, r });
  return true;
}

function addPitfall(rng, room, x, y, w, h, water, forceBridge = false) {
  const bridge = !water && forceBridge ? (w > h ? "h" : "v") : null;
  room.features.push({ type: "pitfall", x, y, w, h, water, bridge });
  if (water) return; // water is swimmable — no collision solid
  const BW = 1.4;
  if (bridge === "h") {
    const band = (h - BW) / 2;
    room.solids.push({ type: "rect", x, y, w, h: band });
    room.solids.push({ type: "rect", x, y: y + h - band, w, h: band });
  } else if (bridge === "v") {
    const band = (w - BW) / 2;
    room.solids.push({ type: "rect", x, y, w: band, h });
    room.solids.push({ type: "rect", x: x + w - band, y, w: band, h });
  } else {
    room.solids.push({ type: "rect", x, y, w, h });
  }
}

export function buildStructural(rng, room) {
  const cx = room.w / 2, cy = room.h / 2;

  if (room.type === "pillar") {
    for (let x = 3; x < room.w - 2; x += 3.5)
      for (let y = 3; y < room.h - 2; y += 3.5)
        addPillar(room, x + (rng() - 0.5) * 0.4, y + (rng() - 0.5) * 0.4, 0.55 + rng() * 0.25);
    return;
  }

  if (room.type === "pool") {
    const pw = room.w * 0.55, ph = room.h * 0.55;
    addPitfall(rng, room, cx - pw / 2, cy - ph / 2, pw, ph, true);
    return;
  }

  if (room.type === "pipe") { room.features.push({ type: "pipes" }); return; }

  // these types fill themselves with items, so no loose structural features
  if (room.type === "suburb" || room.type === "library" || room.type === "christmas") return;

  // ordinary rooms: a sprinkle of structural variety
  const roll = rng();
  if (roll < 0.1) {
    addPillar(room, cx + (rng() - 0.5) * 3, cy + (rng() - 0.5) * 3, 0.55 + rng() * 0.25);
  } else if (roll < 0.16) {
    // small pillar cluster — retry each pillar a few times so none overlap
    const bx = 2 + rng() * (room.w - 4), by = 2 + rng() * (room.h - 4);
    const count = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < count; i++)
      for (let a = 0; a < 8; a++)
        if (addPillar(room, bx + (rng() - 0.5) * 4, by + (rng() - 0.5) * 4, 0.45 + rng() * 0.2)) break;
  } else if (roll < 0.24) {
    // big bridged chasm if the room can hold it, otherwise a small plain hole
    if (room.w >= 11 && room.h >= 11 && rng() < 0.6) {
      const w = Math.min(7 + rng() * 3, room.w - 3), h = Math.min(7 + rng() * 3, room.h - 3);
      addPitfall(rng, room, cx - w / 2, cy - h / 2, w, h, false, true);
    } else {
      const w = 2 + rng() * 2, h = 2 + rng() * 2;
      addPitfall(rng, room, cx - w / 2, cy - h / 2, w, h, false, false);
    }
  } else if (roll < 0.32) {
    const w = 3 + rng() * 3, h = 3 + rng() * 3;
    if (inFloor(room, cx, cy)) room.features.push({ type: "sunken", x: cx - w / 2, y: cy - h / 2, w, h });
  } else if (roll < 0.42) {
    // recessed alcove(s) / hidey-holes set into a wall
    const n = 1 + Math.floor(rng() * 2);
    for (let i = 0; i < n; i++) {
      const side = ["N", "S", "E", "W"][Math.floor(rng() * 4)];
      const along = side === "N" || side === "S" ? room.w : room.h;
      room.features.push({ type: "alcove", side, at: 2 + rng() * (along - 4), depth: 1.0 + rng() * 0.6, width: 1.6 + rng() * 1.2 });
    }
  }
}
