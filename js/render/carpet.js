// render/carpet.js — floor: seamless carpet texture, tile discoloration, damage

import { CARPET_T } from "../config.js";
import { fract } from "../core/num.js";
import { hash2 } from "../core/rng.js";
import { poly } from "./shape.js";

// seamless carpet tile, cached per palette
export function carpetTile(cache, pal) {
  if (cache[pal.floor]) return cache[pal.floor];
  const T = CARPET_T;
  const off = document.createElement("canvas");
  off.width = off.height = T;
  const c = off.getContext("2d");
  c.fillStyle = pal.floor;
  c.fillRect(0, 0, T, T);
  let s = 1337 ^ (pal.floor.length * 91);
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < 220; i++) {
    const x = rnd() * T, y = rnd() * T, a = rnd() * Math.PI, ln = 1.5 + rnd() * 2;
    c.strokeStyle = rnd() < 0.5 ? pal.floor2 : pal.line;
    c.globalAlpha = 0.18 + rnd() * 0.22;
    c.lineWidth = 1;
    for (const dx of [-T, 0, T]) for (const dy of [-T, 0, T]) {
      c.beginPath();
      c.moveTo(x + dx, y + dy);
      c.lineTo(x + dx + Math.cos(a) * ln, y + dy + Math.sin(a) * ln);
      c.stroke();
    }
  }
  cache[pal.floor] = off;
  return off;
}

export function drawCarpet(ctx, room, pal, cache) {
  poly(ctx, room.outline);
  if (room.type === "pipe") { ctx.fillStyle = "#6e6c63"; ctx.fill(); return; } // bare concrete
  if (room.dark) { ctx.fillStyle = pal.floor; ctx.fill(); return; }
  const pat = ctx.createPattern(carpetTile(cache, pal), "repeat");
  pat.setTransform(new DOMMatrix().scaleSelf(1 / CARPET_T));
  ctx.fillStyle = pat;
  ctx.fill();
}

// subtle per-tile discoloration only — no visible grid outlines
export function drawTiles(ctx, room) {
  if (room.dark || room.type === "pipe") return; // concrete floors have no carpet tint
  // batch all dark tiles into one path + one fill, then all light tiles — two
  // fills total instead of one per tile (big bake-time win on large rooms)
  ctx.beginPath();
  for (let ty = 0; ty < room.h; ty++)
    for (let tx = 0; tx < room.w; tx++)
      if (hash2(tx, ty) < 0.3) ctx.rect(tx, ty, 1, 1);
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fill();

  ctx.beginPath();
  for (let ty = 0; ty < room.h; ty++)
    for (let tx = 0; tx < room.w; tx++)
      if (hash2(tx, ty) > 0.7) ctx.rect(tx, ty, 1, 1);
  ctx.fillStyle = "rgba(255,255,235,0.04)";
  ctx.fill();
}

// wet / torn carpet as whole discolored tiles
export function drawDamage(ctx, room) {
  for (const d of room.damage) {
    const tile = [{ x: d.tx, y: d.ty }, { x: d.tx + 1, y: d.ty }, { x: d.tx + 1, y: d.ty + 1 }, { x: d.tx, y: d.ty + 1 }];
    poly(ctx, tile);
    ctx.fillStyle = d.wet ? "rgba(40,46,40,0.78)" : "#6f6d66";
    ctx.fill();
    if (d.wet) { poly(ctx, tile); ctx.fillStyle = "rgba(90,120,110,0.18)"; ctx.fill(); }
  }
}
