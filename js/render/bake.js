// render/bake.js — render rooms in CHUNKS so off-screen chunks are never baked
//
// A room is split into a grid of square chunks (CHUNK SIZE world units). Each
// chunk is rendered to its own small offscreen canvas the first time it's
// needed, then cached on room._chunks. The renderer only bakes/draws chunks
// that are actually on screen, so a huge room mostly off-screen costs little.

import { BAKE } from "../config.js";
import { poly } from "./shape.js";
import { drawFloor } from "./floor.js";
import { drawFeatures } from "./features.js";
import { drawFurniture } from "./furniture.js";
import { drawLight } from "./lights.js";
import { drawThreshold } from "./walls.js";
import { drawDualWalls } from "./dualgrid.js";

// paint the whole room into ctx (ctx transform is already positioned/scaled);
// only the part inside the current canvas survives, so this works per-chunk
function paintRoom(ctx, room, caches) {
  drawFloor(ctx, room); // underlay (concrete/ore) + dual-grid carpet overlays
  ctx.save();
  poly(ctx, room.outline);
  ctx.clip();
  drawFeatures(ctx, room);
  for (const f of room.furniture) drawFurniture(ctx, f);
  if (!room.dark) for (const l of room.lights) drawLight(ctx, l, 0);
  for (const d of room.doors) drawThreshold(ctx, room, d);
  ctx.restore();
  drawDualWalls(ctx, room); // dual-grid walls (hard backrooms corners, 15 tiles)
}

export function bakeChunk(room, cx, cy, C, caches, metrics) {
  if (!room._chunks) room._chunks = new Map();
  const key = cx + "_" + cy;
  const hit = room._chunks.get(key);
  if (hit) return hit;

  const wU = Math.min(C, room.w - cx * C);
  const hU = Math.min(C, room.h - cy * C);
  const cvs = document.createElement("canvas");
  cvs.width = Math.max(1, Math.round(wU * BAKE));
  cvs.height = Math.max(1, Math.round(hU * BAKE));
  const ctx = cvs.getContext("2d");
  ctx.setTransform(BAKE, 0, 0, BAKE, -cx * C * BAKE, -cy * C * BAKE);
  paintRoom(ctx, room, caches);

  const chunk = { canvas: cvs, w: wU, h: hU };
  room._chunks.set(key, chunk);
  if (metrics) metrics.chunksBaked++;
  return chunk;
}
