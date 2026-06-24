// world/behaviors.js — non-euclidean behaviors stamped onto the finished graph.
// Kept rare so most of the maze still reads as ordinary euclidean space.

import { DOOR_W } from "../config.js";
import { OPP, freeSides, pickCenter, sideLength } from "./geometry.js";

export function applyBehaviors(rng, rooms, root) {
  // --- Self-looping room: two OPPOSITE doors on the same room link to each
  //     other (opposite sides -> pure translation -> seamless, no rotation) ---
  let did = false;
  for (const r of rooms) {
    if (did || r.id === root.id || r.behavior) continue;
    const free = freeSides(r);
    // need a free opposite pair (N&S or E&W)
    const s1 = ["N", "E"].find((s) => free.includes(s) && free.includes(OPP[s]));
    if (!s1 || rng() < 0.85) continue;
    const s2 = OPP[s1];
    const i1 = r.doors.length;
    r.doors.push({ side: s1, center: pickCenter(rng, sideLength(r, s1)), width: DOOR_W, link: { room: r.id, door: i1 + 1 } });
    r.doors.push({ side: s2, center: pickCenter(rng, sideLength(r, s2)), width: DOOR_W, link: { room: r.id, door: i1 } });
    r.used.add(s1); r.used.add(s2);
    r.behavior = "self-looping room";
    did = true;
  }

  // (Overlap fuzz is not a behavior — it emerges naturally from connected rooms
  //  rendering at reduced opacity and overlapping in screen space.)

  // --- One-way corridor: lock the return side (renders as solid wall there) ---
  did = false;
  for (const r of rooms) {
    if (did) break;
    for (const d of r.doors) {
      if (d.link.room === r.id) continue;
      const back = rooms[d.link.room].doors[d.link.door];
      if (back.locked || d.locked || rng() < 0.85) continue;
      back.locked = true;
      did = true;
      break;
    }
  }
}
