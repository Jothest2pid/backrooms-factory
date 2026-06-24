// sim/build.js — furniture occupancy + placement validity for the build system

import { BUILDABLE } from "../model/tiles.js";

// the furniture item covering tile (tx,ty), if any
export function furnitureAt(room, tx, ty) {
  const cx = tx + 0.5, cy = ty + 0.5;
  for (const f of room.furniture) {
    if (Math.abs(cx - f.x) <= f.w / 2 && Math.abs(cy - f.y) <= f.h / 2) return f;
  }
  return null;
}

// can a (movable) object be dropped on this tile?
export function canPlace(room, tx, ty) {
  if (!room.inBounds(tx, ty)) return false;
  if (!BUILDABLE.has(room.tileAt(tx, ty))) return false; // floor/concrete/wet only
  if (furnitureAt(room, tx, ty)) return false;
  if (room.entityAt(tx, ty)) return false;
  return true;
}

// does a rect [x,y,w,h] overlap a collision solid (rect or circle)?
function hitsSolid(rect, s) {
  if (s.type === "circle") {
    const nx = Math.max(rect.x, Math.min(s.x, rect.x + rect.w));
    const ny = Math.max(rect.y, Math.min(s.y, rect.y + rect.h));
    return Math.hypot(s.x - nx, s.y - ny) < s.r;
  }
  return rect.x < s.x + s.w && rect.x + rect.w > s.x && rect.y < s.y + s.h && rect.y + rect.h > s.y;
}

// can a w×h buildable be placed with its top-left at (tx,ty)?
export function canBuild(room, tx, ty, w, h) {
  for (let y = ty; y < ty + h; y++)
    for (let x = tx; x < tx + w; x++)
      if (!room.inBounds(x, y) || !BUILDABLE.has(room.tileAt(x, y))) return false;
  const rect = { x: tx, y: ty, w, h };
  for (const s of room.solids) if (hitsSolid(rect, s)) return false;       // furniture / pillars / machines
  if (room.entities.some((e) => e.tx < tx + w && e.tx + (e.w || 1) > tx && e.ty < ty + h && e.ty + (e.h || 1) > ty)) return false;
  return true;
}
