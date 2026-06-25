// sim/logistics.js — belts and automator arms moving items between tiles.
//
// Belts carry a single file of items along their facing; when the front item
// reaches the end it tries to hand off to whatever sits in the next tile (belt,
// chest/crate, machine input, generator fuel). Arms actively pull one item from
// the tile behind them and drop it into the tile ahead. Everything ticks only
// for the current room (the one the player is standing in).

import { machineInputs } from "./machines.js";
import { applyProcess } from "./transforms.js";

// facing 0 down, 1 left, 2 up, 3 right  (matches furniture facing convention)
const DIRV = [[0, 1], [-1, 0], [0, -1], [1, 0]];
const BELT_SPEED = 1.6; // tiles / second
const SPACING = 0.26;   // min gap between items on a belt
const ARM_CYCLE = 0.7;  // seconds per arm grab at full power

// entity whose footprint covers tile (tx,ty)
function entityAtTile(room, tx, ty) {
  for (const e of room.entities) {
    const w = e.w || 1, h = e.h || 1;
    if (tx >= e.tx && tx < e.tx + w && ty >= e.ty && ty < e.ty + h) return e;
  }
  return null;
}

// can `tgt` take one `item`? if so, put it there and return true
function accept(tgt, item) {
  if (!tgt) return false;
  if (tgt.logi === "belt") {
    tgt.items = tgt.items || [];
    if (tgt.items.some((it) => it.pos < SPACING)) return false; // entry blocked
    tgt.items.push({ item, pos: 0 });
    return true;
  }
  if (tgt.machine === "chest") { tgt.store = tgt.store || {}; tgt.store[item] = (tgt.store[item] || 0) + 1; return true; }
  if (tgt.type === "wood_generator") { if (item === "fuel") { tgt.fuel = (tgt.fuel || 0) + 1; return true; } return false; }
  if (tgt.machine) { // processing machine: only valid inputs
    const inputs = machineInputs(tgt.machine);
    if (!inputs.has(item)) return false;
    if (item === "fuel") tgt.fuel = (tgt.fuel || 0) + 1;
    else { tgt.input = tgt.input || {}; tgt.input[item] = (tgt.input[item] || 0) + 1; }
    return true;
  }
  return false;
}

// pull one item out of `src`, or null. (front of a belt / any stored / any output)
function takeFrom(src) {
  if (!src) return null;
  if (src.logi === "belt") {
    if (!src.items || !src.items.length) return null;
    src.items.sort((a, b) => b.pos - a.pos);
    if (src.items[0].pos < 0.5) return null; // only grab items that have travelled
    return src.items.shift().item;
  }
  if (src.machine === "chest") return takeAny(src.store);
  if (src.machine) return takeAny(src.output);
  return null;
}

function takeAny(buf) {
  if (!buf) return null;
  for (const k of Object.keys(buf)) if (buf[k] > 0) { buf[k]--; return k; }
  return null;
}

// belt entity covering tile (tx,ty), if any
function beltAt(room, tx, ty) {
  for (const e of room.entities) if (e.logi === "belt" && e.tx === tx && e.ty === ty) return e;
  return null;
}

export function tickTransport(room, dt, ratio) {
  // 1. advance belt items (front to back so they queue without overlapping)
  for (const e of room.entities) {
    if (e.logi !== "belt") continue;
    e.items = e.items || [];
    e.items.sort((a, b) => b.pos - a.pos);
    const sp = e.speed || BELT_SPEED; // stygian belts run faster
    for (let i = 0; i < e.items.length; i++) {
      const cap = i > 0 ? Math.max(0, e.items[i - 1].pos - SPACING) : 1.0; // never push a lane item negative
      e.items[i].pos = Math.min(e.items[i].pos + sp * dt, cap);
    }
    if (e.items.length && e.items[0].pos >= 1) {
      const [dx, dy] = DIRV[e.facing || 0];
      if (accept(entityAtTile(room, e.tx + dx, e.ty + dy), e.items[0].item)) e.items.shift();
    }
  }
  // 2. arms transfer behind -> ahead (slower under brownout)
  for (const e of room.entities) {
    if (e.logi !== "arm") continue;
    if (ratio <= 0) continue; // no power -> arm idle (don't let cool stick negative)
    e.cool = (e.cool || 0) - dt * ratio;
    if (e.cool > 0) continue;
    const [dx, dy] = DIRV[e.facing || 0];
    const dst = entityAtTile(room, e.tx + dx, e.ty + dy);
    const cycle = e.fast ? ARM_CYCLE * 0.45 : ARM_CYCLE; // stygian arms swing faster
    if (e.held != null) {
      // carrying — try to deliver, else keep holding until the target frees up
      if (accept(dst, e.held)) { e.held = null; e.cool = cycle; }
    } else {
      const item = takeFrom(entityAtTile(room, e.tx - dx, e.ty - dy));
      if (item == null) continue;
      if (accept(dst, item)) e.cool = cycle;
      else e.held = item; // couldn't deliver this tick — hold it
    }
  }
  // 3. belt-mounted processors: transform ONE passing item per cooldown. Chain
  //    several on a belt to keep up with throughput. Powered ones scale with grid.
  for (const e of room.entities) {
    if (!e.process) continue;
    if (e._flash) e._flash -= dt;
    if (e.draw && ratio <= 0) continue; // belt processors need power; no grid = idle (not 1-then-freeze)
    e.cool = (e.cool || 0) - dt * (e.draw ? ratio : 1);
    if (e.cool > 0) continue;
    const belt = beltAt(room, e.tx, e.ty);
    if (!belt || !belt.items) continue;
    for (const it of belt.items) {
      if (it.pos < 0.35 || it.pos > 0.95) continue; // in the working window
      const out = applyProcess(e.process, it.item);
      if (out) {
        let spd = 0; for (const m of e.modules || []) spd += (m === "speed_module" ? 0.5 : 0);
        it.item = out; e.cool = 1 / ((e.rate || 1) * (1 + spd)); e._flash = 0.12; break;
      }
    }
  }
}
