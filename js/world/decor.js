// world/decor.js — ceiling lights and carpet damage

import { pointInPoly } from "../core/polygon.js";

const inFloor = (room, x, y) => !room.organic || pointInPoly({ x, y }, room.outline);

export function buildLights(rng, room) {
  if (room.dark) return; // unlit room type (christmas) handles its own light
  for (let x = 3; x <= room.w - 3; x += 5) {
    for (let y = 3; y <= room.h - 3; y += 5) {
      if (!inFloor(room, x, y)) continue;
      room.lights.push({ x, y, id: Math.floor(rng() * 100000) });
    }
  }
  if (room.lights.length === 0) {
    room.lights.push({ x: room.w / 2, y: room.h / 2, id: Math.floor(rng() * 100000) });
  }
}

// damaged carpet snaps to the 1x1 tile grid, grown as blob patches
export function buildDamage(rng, room) {
  const seen = new Set();
  const grow = (wet, size) => {
    let tx = Math.floor(rng() * room.w);
    let ty = Math.floor(rng() * room.h);
    for (let s = 0; s < size; s++) {
      const key = tx + "," + ty;
      const ok = tx >= 0 && ty >= 0 && tx < room.w && ty < room.h && inFloor(room, tx + 0.5, ty + 0.5);
      if (!seen.has(key) && ok) { seen.add(key); room.damage.push({ tx, ty, wet }); }
      if (rng() < 0.5) tx += rng() < 0.5 ? 1 : -1;
      else ty += rng() < 0.5 ? 1 : -1;
    }
  };

  // a dense roughly-circular blob of tiles (used for big wet patches)
  const blob = (wet, radius) => {
    const cx = 2 + rng() * (room.w - 4), cy = 2 + rng() * (room.h - 4);
    const R = Math.ceil(radius) + 1;
    for (let ty = Math.floor(cy - R); ty <= cy + R; ty++) {
      for (let tx = Math.floor(cx - R); tx <= cx + R; tx++) {
        if (Math.hypot(tx + 0.5 - cx, ty + 0.5 - cy) > radius + (rng() - 0.5)) continue;
        const key = tx + "," + ty;
        const ok = tx >= 0 && ty >= 0 && tx < room.w && ty < room.h && inFloor(room, tx + 0.5, ty + 0.5);
        if (!seen.has(key) && ok) { seen.add(key); room.damage.push({ tx, ty, wet }); }
      }
    }
  };

  // dry torn carpet — small patches, fairly common
  const torn = Math.floor(rng() * 3); // 0..2
  for (let i = 0; i < torn; i++) grow(false, 2 + Math.floor(rng() * 5));

  // wet carpet — rare (≈1 room in 8) but a big soaked blob (~32 tiles) when present
  const wetChance = room.type === "pipe" || room.type === "pool" ? 0.5 : 0.12;
  if (rng() < wetChance) blob(true, 3.3);
}
