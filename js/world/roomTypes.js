// world/roomTypes.js — special room types (the generators)
//
// Each type is the same backrooms substrate with a different generation rule.
// rollType() decides the type + footprint; structural/items/behaviors modules
// then fill it in. Most rooms are plain "yellow".

import { ROOM_MIN, ROOM_MAX } from "../config.js";

const WEIGHTS = [
  ["yellow", 70], ["office", 14], ["pipe", 8], ["hub", 6],
  ["pillar", 4], ["library", 4], ["pool", 3], ["suburb", 3], ["christmas", 2],
];

function pickType(rng) {
  const total = WEIGHTS.reduce((a, [, w]) => a + w, 0);
  let r = rng() * total;
  for (const [name, w] of WEIGHTS) { if ((r -= w) < 0) return name; }
  return "yellow";
}

const between = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

export function rollType(rng, force = false) {
  // force === true -> yellow (legacy); force === "<type>" -> that type; else roll
  const type = force === true ? "yellow" : (typeof force === "string" ? force : pickType(rng));
  let w = between(rng, ROOM_MIN, ROOM_MAX);
  let h = between(rng, ROOM_MIN, ROOM_MAX);
  // ceiling height multiplier (1 = standard). Tall rooms read as cavernous: the
  // 3D wall band drawn by the renderer scales with this. Pools and suburb "house"
  // rooms feel big and open, so they get high ceilings.
  let height = 1;

  switch (type) {
    case "pipe": { // long, very thin corridor
      const long = between(rng, 24, 34), thin = between(rng, 3, 5);
      if (rng() < 0.5) { w = long; h = thin; } else { w = thin; h = long; }
      break;
    }
    case "pillar": w = between(rng, 22, 30); h = between(rng, 22, 30); break;
    case "pool":   w = between(rng, 18, 26); h = between(rng, 18, 26); height = 2.4; break;
    case "suburb": w = between(rng, 18, 26); h = between(rng, 18, 26); height = 2.6; break;
    case "library":w = between(rng, 14, 20); h = between(rng, 14, 20); break;
    case "hub":    w = between(rng, 12, 16); h = between(rng, 12, 16); break;
    case "christmas": w = between(rng, 12, 16); h = between(rng, 12, 16); break;
  }
  // Darkness is the threat: christmas rooms are always unlit, and a slice of the
  // ordinary rooms go dark too so the "things in the dark", the weapons, and the
  // light ladder (torch -> lantern -> flashlight) all stay relevant as you explore.
  // The start room (force === true) is never dark, so you always begin somewhere safe.
  const dark = type === "christmas" || (force !== true && type !== "hub" && rng() < 0.12);
  return { type, w, h, height, dark };
}
