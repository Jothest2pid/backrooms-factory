// sim/interact.js — hit-test interactables (furniture, features, ore)
//
// Returns a normalized descriptor { kind, x, y, w, h, round?, info, ref } or
// null. kind is "item" | "feature" | "ore"; ref is the underlying object so
// callers can act on it (pick up furniture, mine ore). x,y is the centre.

import { itemInfo } from "../world/items.js";
import { ORES } from "../world/ore.js";
import { ITEMS, itemName } from "./registry.js";

const FEATURE_INFO = {
  pillar: { name: "Pillar", yields: "Concrete (cannot build on)", pickup: false },
  pit: { name: "Pitfall", yields: "— a hole in the floor", pickup: false },
  water: { name: "Almond-water pool", yields: "Almond water", pickup: false },
};

export function pickInteractable(room, pt) {
  // hostiles first — they're what you click to attack
  if (room.mobs) {
    for (const m of room.mobs) {
      if (Math.hypot(pt.x - m.x, pt.y - m.y) <= m.r + 0.25)
        return { kind: "mob", ref: m, x: m.x, y: m.y, w: m.r * 2, h: m.r * 2, round: true, info: { name: "Shambler", yields: "hostile — right-click to strike", pickup: false } };
    }
  }
  // placed buildables/machines first — they sit on top of everything
  if (room.entities) {
    for (let i = room.entities.length - 1; i >= 0; i--) {
      const e = room.entities[i];
      const w = e.w || 1, h = e.h || 1;
      if (pt.x >= e.tx && pt.x <= e.tx + w && pt.y >= e.ty && pt.y <= e.ty + h) {
        const spec = ITEMS[e.type] || {};
        const yields = e.machine ? "left-click to load / collect" : "placed";
        return { kind: "entity", ref: e, x: e.tx + w / 2, y: e.ty + h / 2, w, h, info: { name: itemName(e.type), yields, pickup: true } };
      }
    }
  }
  // furniture (topmost = last drawn), axis-aligned with a little padding
  for (let i = room.furniture.length - 1; i >= 0; i--) {
    const f = room.furniture[i];
    if (Math.abs(pt.x - f.x) <= f.w / 2 + 0.15 && Math.abs(pt.y - f.y) <= f.h / 2 + 0.15)
      return { kind: "item", ref: f, x: f.x, y: f.y, w: f.w, h: f.h, info: itemInfo(f.type) };
  }
  // structural features
  for (const ft of room.features) {
    if (ft.type === "pillar") {
      if (Math.hypot(pt.x - ft.x, pt.y - ft.y) <= ft.r + 0.15)
        return { kind: "feature", x: ft.x, y: ft.y, w: ft.r * 2, h: ft.r * 2, round: true, info: FEATURE_INFO.pillar };
    } else if (ft.type === "pitfall") {
      if (pt.x >= ft.x && pt.x <= ft.x + ft.w && pt.y >= ft.y && pt.y <= ft.y + ft.h)
        return { kind: "feature", x: ft.x + ft.w / 2, y: ft.y + ft.h / 2, w: ft.w, h: ft.h, info: ft.water ? FEATURE_INFO.water : FEATURE_INFO.pit };
    }
  }
  // ore under the cursor — match the rendered plus-shape (ore + 1-cell dilation),
  // so the curved corners that reveal ore under carpet are mineable too
  const tx = Math.floor(pt.x), ty = Math.floor(pt.y);
  let ore = room.ores.find((o) => o.tx === tx && o.ty === ty), curve = false;
  if (!ore) { ore = room.ores.find((o) => Math.abs(o.tx - tx) + Math.abs(o.ty - ty) === 1); curve = true; }
  if (ore) {
    const s = ORES[ore.type];
    const yld = curve ? Math.ceil(s.yield / 2) : s.yield; // edge/curve cells give less
    return { kind: "ore", ref: ore, curve, x: tx + 0.5, y: ty + 0.5, w: 1, h: 1, info: { name: s.name, yields: `${yld} ${s.resource}`, pickup: true } };
  }
  return null;
}
