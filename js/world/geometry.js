// world/geometry.js — door-placement helpers shared by generation

import { DOOR_W } from "../config.js";

export const SIDES = ["N", "E", "S", "W"];
export const OPP = { N: "S", S: "N", E: "W", W: "E" };

export const sideLength = (room, side) =>
  side === "N" || side === "S" ? room.w : room.h;

// random valid door-centre offset along a wall of length `length`
export function pickCenter(rng, length) {
  const hw = DOOR_W / 2, m = 1.4;
  const lo = m + hw, hi = length - m - hw;
  return lo + rng() * Math.max(0, hi - lo);
}

export const freeSides = (room) => SIDES.filter((s) => !room.used.has(s));
