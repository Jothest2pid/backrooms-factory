// world/generate.js — infinite, streamed room generation
//
// The world is an ever-growing portal graph. Rooms are the "chunks": each room
// is created with a few unlinked DOOR STUBS, and a stub is only expanded into a
// real neighbour (or a non-euclidean fold to an existing room) when the player
// gets near. ensureLoaded() keeps the rooms within STREAM_DEPTH hops generated;
// everything stays in memory once made so the graph is stable as you backtrack.

import { STREAM_DEPTH, DOOR_W, BIG_MIN, BIG_MAX, SMALL_MIN, SMALL_MAX } from "../config.js";
import { mulberry32 } from "../core/rng.js";
import { Room } from "../model/room.js";
import { PALETTES, paletteFor } from "./palettes.js";
import { OPP, pickCenter, sideLength, freeSides } from "./geometry.js";
import { rollType } from "./roomTypes.js";
import { maybeOrganic } from "./organic.js";
import { buildStructural } from "./structural.js";
import { buildItems } from "./items.js";
import { buildLights, buildDamage } from "./decor.js";
import { buildGrid } from "./grid.js";
import { buildOre } from "./ore.js";

// build a fully-populated room (content only — no doors yet)
function makeRoom(world, keepFree, force = false) {
  const rng = world.rng;
  let { type, w, h, dark } = rollType(rng, force);
  let behavior = null;
  if (type === "yellow") {
    const roll = rng();
    if (roll < 0.04) { w = BIG_MIN + Math.floor(rng() * (BIG_MAX - BIG_MIN)); h = BIG_MIN + Math.floor(rng() * (BIG_MAX - BIG_MIN)); behavior = "bigger on the inside"; }
    else if (roll < 0.08) { w = SMALL_MIN + Math.floor(rng() * (SMALL_MAX - SMALL_MIN)); h = SMALL_MIN + Math.floor(rng() * (SMALL_MAX - SMALL_MIN)); behavior = "smaller on the inside"; }
  }
  const palette = paletteFor(type, PALETTES[Math.floor(rng() * PALETTES.length)]);
  const room = new Room(world.rooms.length, w, h, palette);
  room.type = type; room.dark = dark; room.behavior = behavior;
  maybeOrganic(rng, room, keepFree);
  buildStructural(rng, room);
  buildItems(rng, room);
  buildLights(rng, room);
  buildDamage(rng, room);
  buildGrid(room);
  buildOre(rng, room);
  world.rooms.push(room);
  return room;
}

// give a room its onward door stubs (and an occasional self-loop)
function addStubs(world, room, keepFree) {
  const rng = world.rng;
  const free = freeSides(room).filter((s) => s !== keepFree);

  // rare self-loop: two opposite free sides linked to each other (seamless)
  if (free.length >= 2 && rng() < 0.05) {
    const s1 = ["N", "E"].find((s) => free.includes(s) && free.includes(OPP[s]));
    if (s1) {
      const s2 = OPP[s1], i1 = room.doors.length;
      room.doors.push({ side: s1, center: pickCenter(rng, sideLength(room, s1)), width: DOOR_W, link: { room: room.id, door: i1 + 1 } });
      room.doors.push({ side: s2, center: pickCenter(rng, sideLength(room, s2)), width: DOOR_W, link: { room: room.id, door: i1 } });
      room.used.add(s1); room.used.add(s2);
      room.behavior = room.behavior || "self-looping room";
    }
  }

  const open = freeSides(room).filter((s) => s !== keepFree);
  let added = 0;
  for (const s of open) {
    if (rng() < 0.55) { room.doors.push({ side: s, center: pickCenter(rng, sideLength(room, s)), width: DOOR_W, link: null }); room.used.add(s); added++; }
  }
  if (added === 0 && open.length) {
    const s = open[Math.floor(rng() * open.length)];
    room.doors.push({ side: s, center: pickCenter(rng, sideLength(room, s)), width: DOOR_W, link: null });
    room.used.add(s);
  }
}

// a target room that still has side `need` free (so the fold can connect there)
function pickFoldTarget(world, room, need) {
  for (let t = 0; t < 16; t++) {
    const r = world.rooms[Math.floor(world.rng() * world.rooms.length)];
    if (r.id !== room.id && !r.used.has(need)) return r;
  }
  return null;
}

// turn one stub door into a real connection (new room, or a fold to an old one)
export function expandDoor(world, room, di) {
  const door = room.doors[di];
  if (door.link) return;
  const rng = world.rng;

  // hub doors always fold; other doors occasionally do — a wormhole to an
  // already-generated room. The fold connects OPPOSITE sides (rot 0) so walking
  // through it is a seamless translation, never a rotated snap-cut.
  if ((room.type === "hub" || rng() < 0.07)) {
    const need = OPP[door.side];
    const target = pickFoldTarget(world, room, need);
    if (target) {
      const ti = target.doors.length;
      target.doors.push({ side: need, center: pickCenter(rng, sideLength(target, need)), width: DOOR_W, link: { room: room.id, door: di }, fold: true });
      target.used.add(need);
      door.link = { room: target.id, door: ti };
      door.fold = true;
      return;
    }
  }

  // normal: a fresh neighbour on the opposite side (seamless, rot 0).
  // pipe rooms tend to chain into long pipe hallways.
  const nbSide = OPP[door.side];
  const force = room.type === "pipe" && rng() < 0.6 ? "pipe" : false;
  const nb = makeRoom(world, nbSide, force);
  const entryIdx = nb.doors.length;
  nb.doors.push({ side: nbSide, center: pickCenter(rng, sideLength(nb, nbSide)), width: DOOR_W, link: { room: room.id, door: di } });
  nb.used.add(nbSide);
  door.link = { room: nb.id, door: entryIdx };

  addStubs(world, nb, nbSide);
}

// keep every room within `depth` hops of `room` fully expanded
export function ensureLoaded(world, room, depth = STREAM_DEPTH) {
  const seen = new Set([room.id]);
  let frontier = [room];
  for (let d = 0; d <= depth && frontier.length; d++) {
    const next = [];
    for (const r of frontier) {
      for (let i = 0; i < r.doors.length; i++) expandDoor(world, r, i);
      if (d < depth) {
        for (const door of r.doors) {
          const nb = door.link && world.rooms[door.link.room];
          if (nb && !seen.has(nb.id)) { seen.add(nb.id); next.push(nb); }
        }
      }
    }
    frontier = next;
  }
}

export function generateWorld(seed) {
  const world = { rooms: [], rng: mulberry32(seed >>> 0) };
  const start = makeRoom(world, null, true);
  addStubs(world, start, null);
  start.visited = true;
  world.start = start;
  ensureLoaded(world, start);
  return world;
}
