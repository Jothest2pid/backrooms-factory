// world/generate.js — infinite, streamed room generation on a logical grid
//
// The world is a portal graph, but rooms now live on a logical integer grid
// (room.gx, room.gy). A door on side N/E/S/W points at the adjacent grid cell;
// when that cell is already occupied the door LINKS BACK to the room that's
// there, so the map reads like a navigable grid full of loops — walk a block and
// you come back where you started. The deliberate exception is the ~1/10 PORTAL
// door: a non-euclidean fold to a distant room. Because everything else is a
// sensible grid, those portals stand out as obviously "wrong", which is the
// point. (Loops are also what make "bigger on the inside" mean anything — you
// can go around a room and notice it doesn't add up.)
//
// Rooms are still streamed: a stub door only resolves into a neighbour (new,
// linked-back, or folded) when the player gets near. Everything stays in memory.

import { STREAM_DEPTH, DOOR_W, BIG_MIN, BIG_MAX, SMALL_MIN, SMALL_MAX } from "../config.js";
import { mulberry32 } from "../core/rng.js";
import { Room } from "../model/room.js";
import { PALETTES, paletteFor } from "./palettes.js";
import { OPP, SIDES, pickCenter, sideLength, freeSides } from "./geometry.js";
import { rollType } from "./roomTypes.js";
import { maybeOrganic } from "./organic.js";
import { buildStructural } from "./structural.js";
import { buildItems } from "./items.js";
import { buildLights, buildDamage } from "./decor.js";
import { buildGrid } from "./grid.js";
import { buildOre } from "./ore.js";

// side -> grid step. y grows downward (S), matching screen space.
const DIR = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const cellKey = (x, y) => `${x},${y}`;
const PORTAL_CHANCE = 0.1; // ~1 in 10 non-hub doors are a non-euclidean wormhole

// build a fully-populated room (content only — no onward doors yet) and register
// it at grid cell (gx, gy). gx may be null for the rare off-grid "pocket" room.
function makeRoom(world, keepFree, force, gx, gy) {
  const rng = world.rng;
  let { type, w, h, height, dark } = rollType(rng, force);
  let behavior = null;
  if (type === "yellow") {
    const roll = rng();
    if (roll < 0.04) { w = BIG_MIN + Math.floor(rng() * (BIG_MAX - BIG_MIN)); h = BIG_MIN + Math.floor(rng() * (BIG_MAX - BIG_MIN)); behavior = "bigger on the inside"; }
    else if (roll < 0.08) { w = SMALL_MIN + Math.floor(rng() * (SMALL_MAX - SMALL_MIN)); h = SMALL_MIN + Math.floor(rng() * (SMALL_MAX - SMALL_MIN)); behavior = "smaller on the inside"; }
  }
  const palette = paletteFor(type, PALETTES[Math.floor(rng() * PALETTES.length)]);
  const room = new Room(world.rooms.length, w, h, palette);
  room.type = type; room.dark = dark; room.behavior = behavior;
  room.height = height || 1; // ceiling height multiplier (renderer scales walls by it)
  room.gx = gx; room.gy = gy;
  maybeOrganic(rng, room, keepFree);
  buildStructural(rng, room);
  buildItems(rng, room);
  buildLights(rng, room);
  buildDamage(rng, room);
  buildGrid(room);
  buildOre(rng, room);
  world.rooms.push(room);
  if (gx != null) world.grid.set(cellKey(gx, gy), room);
  return room;
}

// give a room its onward door stubs. We always stub a side whose grid neighbour
// already exists (so it will link back into a loop), plus a chance on the rest.
function addStubs(world, room, keepFree) {
  const rng = world.rng;

  // rare seamless self-loop: two opposite free sides wired to each other
  if (freeSides(room).filter((s) => s !== keepFree).length >= 2 && rng() < 0.05) {
    const s1 = ["N", "E"].find((s) => !room.used.has(s) && !room.used.has(OPP[s]) && s !== keepFree && OPP[s] !== keepFree);
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
  // rooms with a non-euclidean behaviour stub every side so you can circle them
  const wantAll = !!room.behavior;
  for (const s of open) {
    const neighbourExists = room.gx != null && world.grid.has(cellKey(room.gx + DIR[s][0], room.gy + DIR[s][1]));
    if (wantAll || neighbourExists || rng() < 0.55) {
      room.doors.push({ side: s, center: pickCenter(rng, sideLength(room, s)), width: DOOR_W, link: null });
      room.used.add(s); added++;
    }
  }
  if (added === 0 && open.length) {
    const s = open[Math.floor(rng() * open.length)];
    room.doors.push({ side: s, center: pickCenter(rng, sideLength(room, s)), width: DOOR_W, link: null });
    room.used.add(s);
  }
}

// link a stub door BACK to an already-placed neighbour (forming a loop). Prefers
// an unlinked stub already facing us; else adds a fresh reciprocal door. Returns
// false if the neighbour's facing side is fully taken.
function linkBack(world, room, di, target, need) {
  for (let ti = 0; ti < target.doors.length; ti++) {
    const d = target.doors[ti];
    if (d.side === need && !d.link) { // a stub already reaching toward us — wire them
      d.link = { room: room.id, door: di };
      room.doors[di].link = { room: target.id, door: ti };
      return true;
    }
  }
  if (!target.used.has(need)) { // that side is free — add the reciprocal door
    const ti = target.doors.length;
    target.doors.push({ side: need, center: pickCenter(world.rng, sideLength(target, need)), width: DOOR_W, link: { room: room.id, door: di } });
    target.used.add(need);
    room.doors[di].link = { room: target.id, door: ti };
    return true;
  }
  return false;
}

// a target room that still has side `need` free (so a rot-0 fold connects there)
function pickFoldTarget(world, room, need) {
  for (let t = 0; t < 16; t++) {
    const r = world.rooms[Math.floor(world.rng() * world.rooms.length)];
    if (r.id !== room.id && !r.used.has(need)) return r;
  }
  return null;
}

// any room with any free side (rotated wormhole) — last resort so a door always opens
function pickAnyFreeRoom(world, room) {
  for (let t = 0; t < 24; t++) {
    const r = world.rooms[Math.floor(world.rng() * world.rooms.length)];
    if (r.id === room.id) continue;
    const free = freeSides(r);
    if (free.length) return { room: r, side: free[Math.floor(world.rng() * free.length)] };
  }
  return null;
}

// turn a stub into a non-euclidean PORTAL: fold to a distant room. rot-0 when the
// target's opposite side is free (seamless), otherwise a rotated wormhole.
function tryPortal(world, room, di) {
  const door = room.doors[di], rng = world.rng;
  const need = OPP[door.side];
  let target = pickFoldTarget(world, room, need), tside = need;
  if (!target) { const r = pickAnyFreeRoom(world, room); if (r) { target = r.room; tside = r.side; } }
  if (!target) return false;
  const ti = target.doors.length;
  target.doors.push({ side: tside, center: pickCenter(rng, sideLength(target, tside)), width: DOOR_W, link: { room: room.id, door: di }, fold: true, portal: true });
  target.used.add(tside);
  door.link = { room: target.id, door: ti };
  door.fold = true; door.portal = true;
  return true;
}

// resolve one stub door into a real connection: portal, link-back, or new room
export function expandDoor(world, room, di) {
  const door = room.doors[di];
  if (door.link) return;
  const rng = world.rng;

  // hubs are pure wormholes; other doors portal ~1/10 of the time
  if (room.type === "hub" || rng() < PORTAL_CHANCE) {
    if (tryPortal(world, room, di)) return;
  }

  const need = OPP[door.side];

  // grid path: look at the adjacent cell
  if (room.gx != null) {
    const nx = room.gx + DIR[door.side][0], ny = room.gy + DIR[door.side][1];
    const existing = world.grid.get(cellKey(nx, ny));
    if (existing) {
      if (linkBack(world, room, di, existing, need)) return; // loop closed
      if (tryPortal(world, room, di)) return;                // its face was taken — fold instead
    } else {
      // fresh neighbour in the empty cell (seamless, rot 0)
      const force = room.type === "pipe" && rng() < 0.6 ? "pipe" : false;
      const nb = makeRoom(world, need, force, nx, ny);
      const entryIdx = nb.doors.length;
      nb.doors.push({ side: need, center: pickCenter(rng, sideLength(nb, need)), width: DOOR_W, link: { room: room.id, door: di } });
      nb.used.add(need);
      door.link = { room: nb.id, door: entryIdx };
      addStubs(world, nb, need);
      return;
    }
  }

  // off-grid fallback (pocket room) — guarantees the stub never dangles
  if (tryPortal(world, room, di)) return;
  const nb = makeRoom(world, need, false, null, null);
  const entryIdx = nb.doors.length;
  nb.doors.push({ side: need, center: pickCenter(rng, sideLength(nb, need)), width: DOOR_W, link: { room: room.id, door: di } });
  nb.used.add(need);
  door.link = { room: nb.id, door: entryIdx };
  addStubs(world, nb, need);
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
  const world = { rooms: [], rng: mulberry32(seed >>> 0), grid: new Map() };
  const start = makeRoom(world, null, true, 0, 0);
  addStubs(world, start, null);
  start.visited = true;
  world.start = start;
  ensureLoaded(world, start);
  return world;
}
