// world/ore.js — mineable ore deposits scattered on the floor
//
// Ore lives as a sparse list per room (room.ores = [{tx,ty,type}]), separate
// from the terrain grid, so mining one just splices the list — no re-bake.
// Rendered live (see render/ore.js).

import { TILE } from "../model/tiles.js";

// resource = the raw material mined; refined forms come later via smelting
// (stygium -> "stygian iron" when cooked).
// tile = the underlay sheet name; minerals without art yet fall back to `color`
export const ORES = {
  1: { name: "Stygium ore", resource: "stygium", color: "#7c8190", yield: 2, tile: "stygium" },
  2: { name: "Electrum ore", resource: "electrum", color: "#d9c25a", yield: 2, tile: "electrum" },
  3: { name: "Unobtanium vein", resource: "unobtanium", color: "#a45ff0", yield: 1, tile: "unobtanium" },
  4: { name: "Cobalt ore", resource: "cobalt", color: "#3a5aa0", yield: 2, tile: "cobalt" },
  5: { name: "Brimstone", resource: "brimstone", color: "#b6a23a", yield: 2, tile: "brimstone" },
  6: { name: "Galena", resource: "galena", color: "#5a5a66", yield: 2, tile: "galena" },
  7: { name: "Quartz", resource: "quartz", color: "#d8d2e0", yield: 2, tile: "quartz" },
  8: { name: "Quicksilver", resource: "quicksilver", color: "#c0c4cc", yield: 1, tile: "quicksilver" },
  9: { name: "Niter", resource: "niter", color: "#e6e0c0", yield: 1, tile: "niter" },
  10: { name: "Basalt", resource: "basalt", color: "#3a3a40", yield: 3, tile: "basalt" },
};

const BUILDABLE_TILES = new Set([TILE.FLOOR, TILE.CONCRETE, TILE.WET]);

// chance a room contains an ore vein, by type
function veinFor(rng, room) {
  if (rng() < 0.008) return 3;                                 // unobtanium — singular, very rare
  if (room.type === "pipe") return rng() < 0.75 ? 1 : 0;       // stygium — early ore exposure
  if (room.type === "pillar" || room.type === "suburb" || room.type === "hub") return 0;
  const r = rng();
  if (r < 0.14) return 1;                                      // stygium — uncommon
  if (r < 0.20) return 2;                                      // electrum
  if (r < 0.24) return 7;                                      // quartz
  if (r < 0.28) return 10;                                     // basalt
  if (r < 0.31) return 4;                                      // cobalt
  if (r < 0.34) return 5;                                      // brimstone
  if (r < 0.37) return 6;                                      // galena
  if (r < 0.385) return 8;                                     // quicksilver — rare
  if (r < 0.40) return 9;                                      // niter — rare
  return 0;
}

export function buildOre(rng, room) {
  room.ores = [];
  const type = veinFor(rng, room);
  if (!type) return;

  // grow a vein blob by random walk over buildable terrain
  const seen = new Set();
  let tx = Math.floor(2 + rng() * (room.w - 4));
  let ty = Math.floor(2 + rng() * (room.h - 4));
  const size = 4 + Math.floor(rng() * 9);
  for (let s = 0; s < size * 3 && room.ores.length < size; s++) {
    const key = tx + "," + ty;
    if (!seen.has(key) && room.inBounds(tx, ty) && BUILDABLE_TILES.has(room.tileAt(tx, ty))) {
      seen.add(key);
      room.ores.push({ tx, ty, type });
    }
    if (rng() < 0.5) tx += rng() < 0.5 ? 1 : -1;
    else ty += rng() < 0.5 ? 1 : -1;
  }

  // ore is a clean hole revealing the ore underlay — strip any torn/wet carpet
  // that landed on those tiles so carpet never renders over a vein
  if (room.ores.length) {
    const oreKeys = new Set(room.ores.map((o) => o.tx + "," + o.ty));
    room.damage = room.damage.filter((d) => !oreKeys.has(d.tx + "," + d.ty));
  }
}
