// world/grid.js — derive a room's tile grid from its generated geometry

import { TILE } from "../model/tiles.js";
import { pointInPoly } from "../core/polygon.js";

export function buildGrid(room) {
  const W = room.w, H = room.h;
  const g = new Uint8Array(W * H); // defaults to TILE.FLOOR (0)
  const set = (tx, ty, v) => { if (tx >= 0 && ty >= 0 && tx < W && ty < H) g[ty * W + tx] = v; };

  // void outside the outline (organic notch)
  if (room.organic) {
    for (let ty = 0; ty < H; ty++)
      for (let tx = 0; tx < W; tx++)
        if (!pointInPoly({ x: tx + 0.5, y: ty + 0.5 }, room.outline)) g[ty * W + tx] = TILE.VOID;
  }

  // torn / wet carpet
  for (const d of room.damage) set(d.tx, d.ty, d.wet ? TILE.WET : TILE.CONCRETE);

  // structural features stamp solid tiles
  for (const ft of room.features) {
    if (ft.type === "pillar") {
      for (let ty = Math.floor(ft.y - ft.r); ty <= Math.ceil(ft.y + ft.r); ty++)
        for (let tx = Math.floor(ft.x - ft.r); tx <= Math.ceil(ft.x + ft.r); tx++)
          if (Math.hypot(tx + 0.5 - ft.x, ty + 0.5 - ft.y) <= ft.r) set(tx, ty, TILE.PILLAR);
    } else if (ft.type === "pitfall") {
      const kind = ft.water ? TILE.WATER : TILE.PIT;
      for (let ty = Math.floor(ft.y); ty < Math.ceil(ft.y + ft.h); ty++)
        for (let tx = Math.floor(ft.x); tx < Math.ceil(ft.x + ft.w); tx++)
          set(tx, ty, kind);
    }
  }

  // NOTE: furniture is NOT stamped here — it's movable, so its occupancy is
  // tracked live via room.furniture (see sim/build.js) and the grid stays pure
  // terrain. That way picking up / placing furniture never rebuilds the grid.
  room.grid = g;
}
