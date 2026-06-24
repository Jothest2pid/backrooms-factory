// sim/save.js — full game snapshot to / from a plain JSON object.
//
// The world is a streamed portal graph, so a faithful save isn't just "seed +
// player state": rooms expand in RNG order as you explore, and you mutate their
// contents (mine ore, place machines, lay floors). So we snapshot the whole room
// graph AND the RNG counter — that way reloading restores the exact non-euclidean
// layout, and continued exploration keeps generating the same way it would have.

import { mulberry32 } from "../core/rng.js";
import { Room } from "../model/room.js";
import { Game } from "./game.js";

const SAVE_VERSION = 1;

// compact byte<->base64 for the tile grids (smaller than a JSON int array)
const b64enc = (u8) => (typeof btoa !== "undefined")
  ? btoa(String.fromCharCode.apply(null, u8))
  : Buffer.from(u8).toString("base64");
const b64dec = (s) => (typeof atob !== "undefined")
  ? Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
  : new Uint8Array(Buffer.from(s, "base64"));

// ---- rooms ----
function dumpRoom(r) {
  return {
    id: r.id, w: r.w, h: r.h, palette: r.palette, wallT: r.wallT,
    type: r.type, dark: r.dark, behavior: r.behavior, height: r.height, gx: r.gx, gy: r.gy,
    doors: r.doors, lights: r.lights, damage: r.damage, furniture: r.furniture,
    features: r.features, organic: r.organic, outline: r.outline,
    used: [...r.used], visited: r.visited,
    entities: r.entities, ores: r.ores, mobs: r.mobs || [],
    grid: r.grid ? b64enc(r.grid) : null,
    floored: r._floored ? [...r._floored] : null,
    papered: r._papered ? [...r._papered] : null,
    string: r._string || null,
    // collision shapes: replace object back-refs (furniture / placed entity) with
    // indices so the graph is acyclic and JSON-safe; re-linked on revive.
    solids: r.solids.map((s) => {
      const o = { ...s };
      if ("furn" in o) { o.furnIdx = r.furniture.indexOf(s.furn); delete o.furn; }
      if ("ent" in o) { o.entIdx = r.entities.indexOf(s.ent); delete o.ent; }
      return o;
    }),
  };
}

function reviveRoom(rd) {
  const r = new Room(rd.id, rd.w, rd.h, rd.palette);
  r.wallT = rd.wallT;
  r.type = rd.type; r.dark = rd.dark; r.behavior = rd.behavior; r.height = rd.height;
  r.gx = rd.gx; r.gy = rd.gy;
  r.doors = rd.doors; r.lights = rd.lights; r.damage = rd.damage; r.furniture = rd.furniture;
  r.features = rd.features; r.organic = rd.organic; r.outline = rd.outline;
  r.used = new Set(rd.used); r.visited = rd.visited;
  r.entities = rd.entities; r.ores = rd.ores; r.mobs = rd.mobs || [];
  r.grid = rd.grid ? b64dec(rd.grid) : null;
  if (rd.floored) r._floored = new Set(rd.floored);
  if (rd.papered) r._papered = new Set(rd.papered);
  if (rd.string) r._string = rd.string;
  r.solids = (rd.solids || []).map((s) => {
    const o = { ...s };
    if ("furnIdx" in o) { if (o.furnIdx >= 0) o.furn = r.furniture[o.furnIdx]; delete o.furnIdx; }
    if ("entIdx" in o) { if (o.entIdx >= 0) o.ent = r.entities[o.entIdx]; delete o.entIdx; }
    return o;
  });
  r._chunks = null; r._bake = null; r._mat = null; // caches re-bake on demand
  return r;
}

// ---- whole game ----
export function snapshot(game) {
  const w = game.world;
  return {
    v: SAVE_VERSION,
    seed: w.seed,
    rng: w.rng.state(),
    startId: w.start.id,
    curId: game.current.id,
    rooms: w.rooms.map(dumpRoom),
    player: { pos: game.player.pos, dir: game.player.dir, radius: game.player.radius },
    held: game.held || null,
    inventory: game.inventory,
    equip: game.equip,
    discovered: [...game.discovered],
    everPlaced: [...game.everPlaced],
    hotbar: game.hotbar, sel: game.sel, placeFacing: game.placeFacing,
    health: game.health, maxHealth: game.maxHealth, baseMaxHealth: game.baseMaxHealth,
    stamina: game.stamina, maxStamina: game.maxStamina,
    reach: game.reach, deaths: game.deaths, spawn: game.spawn,
    god: game.god, buildItem: game.buildItem,
  };
}

export function restore(data, input) {
  const world = { rooms: [], rng: mulberry32(data.seed >>> 0), grid: new Map(), seed: data.seed >>> 0 };
  world.rng.restore(data.rng);
  for (const rd of data.rooms) {
    const r = reviveRoom(rd);
    world.rooms.push(r);
    if (r.gx != null) world.grid.set(`${r.gx},${r.gy}`, r);
  }
  world.start = world.rooms[data.startId] || world.rooms[0];

  const game = new Game(world, input);
  game.current = world.rooms[data.curId] || world.start;
  game.current.visited = true;
  game.player.pos = data.player.pos;
  game.player.dir = data.player.dir || { x: 0, y: 1 };
  game.held = data.held || null;
  game.inventory = data.inventory || {};
  game.equip = Object.assign(game.equip, data.equip || {});
  game.discovered = new Set(data.discovered || []);
  game.everPlaced = new Set(data.everPlaced || []);
  game.hotbar = data.hotbar || [];
  game.sel = data.sel || 0;
  game.placeFacing = data.placeFacing || 0;
  game.health = data.health; game.maxHealth = data.maxHealth; game.baseMaxHealth = data.baseMaxHealth;
  game.stamina = data.stamina; game.maxStamina = data.maxStamina;
  game.reach = data.reach; game.deaths = data.deaths || 0;
  game.spawn = data.spawn || { room: game.current.id, x: game.player.pos.x, y: game.player.pos.y };
  game.god = !!data.god; game.buildItem = data.buildItem || null;
  return game;
}
