// sim/machines.js — hand-fed processing machines and their per-tick simulation.
// Machines hold input/output buffers; the player loads them by clicking (which
// dumps matching inventory in and pulls finished output out). They tick whether
// or not the player is watching, as long as their room is loaded.

import { MACHINE_RECIPES } from "./recipes.js";
import { itemName, moduleStats } from "./registry.js";

// aggregate module bonuses on a machine: { speed, prod, eff }
export function moduleAgg(e) {
  const a = { speed: 0, prod: 0, eff: 0 };
  for (const m of e.modules || []) { const s = moduleStats(m); a.speed += s.speed || 0; a.prod += s.prod || 0; a.eff += s.eff || 0; }
  return a;
}

// item ids a machine accepts as input (plus "fuel" if any recipe burns fuel)
export function machineInputs(machine) {
  const recipes = MACHINE_RECIPES[machine] || [];
  const set = new Set();
  for (const r of recipes) {
    for (const [it] of r.in) set.add(it);
    if (r.fuel) set.add("fuel");
  }
  return set;
}

// advance one machine by dt seconds
export function tickMachine(e, dt) {
  const recipes = MACHINE_RECIPES[e.machine];
  if (!recipes) return; // chests / generators have no recipe yet
  const r = recipes.find(
    (rc) => rc.in.every(([it, n]) => (e.input[it] || 0) >= n) && (!rc.fuel || (e.fuel || 0) >= rc.fuel)
  );
  if (!r) { e.progress = 0; e.active = false; return; }
  const mod = moduleAgg(e); // speed/prod modules
  e.active = true;
  e._t = r.time;
  e.progress = (e.progress || 0) + dt * (1 + mod.speed);
  if (e.progress >= r.time) {
    e.progress = 0;
    for (const [it, n] of r.in) e.input[it] -= n;
    if (r.fuel) e.fuel -= r.fuel;
    let n = r.out[1];
    if (mod.prod > 0 && Math.random() < mod.prod) n += 1; // productivity bonus
    e.output[r.out[0]] = (e.output[r.out[0]] || 0) + n;
  }
}

// click a machine: dump matching inventory into it, pull finished output out
export function interactMachine(game, e) {
  const inv = game.inventory;
  if (e.machine === "chest") {
    // chest: deposit everything you're not holding as a tool/buildable? keep simple —
    // deposit the selected stack, or pull it all back when empty-handed
    return depositOrWithdraw(game, e);
  }
  if (e.machine === "generator") {
    const burn = e.burns || "fuel";
    const n = inv[burn] || 0;
    if (n > 0) { e.fuel = (e.fuel || 0) + n; inv[burn] = 0; game.lastEvent = `fueled generator (+${n})`; }
    else game.lastEvent = `generator: ${(e.fuel || 0) | 0} ${itemName(burn)} left`;
    return;
  }
  if (e.machine === "turret") {
    const n = inv.ammo || 0;
    e.input = e.input || {};
    if (n > 0) { e.input.ammo = (e.input.ammo || 0) + n; inv.ammo = 0; game.lastEvent = `loaded turret (+${n} ammo)`; }
    else game.lastEvent = `turret: ${(e.input.ammo || 0) | 0} ammo left`;
    return;
  }
  const inputs = machineInputs(e.machine);
  let moved = false;
  for (const it of inputs) {
    const n = inv[it] || 0;
    if (n <= 0) continue;
    if (it === "fuel") e.fuel = (e.fuel || 0) + n;
    else e.input[it] = (e.input[it] || 0) + n;
    inv[it] = 0;
    moved = true;
  }
  let pulled = false;
  for (const [it, n] of Object.entries(e.output)) { if (n > 0) { game.give(it, n); pulled = true; } }
  e.output = {};
  game.lastEvent = pulled ? `collected from ${itemName(e.type)}` : moved ? `loaded ${itemName(e.type)}` : `${itemName(e.type)} idle`;
}

function depositOrWithdraw(game, e) {
  e.store = e.store || {};
  const inv = game.inventory;
  // if you have resources of the selected kind, deposit; else withdraw all
  const sel = game.selectedItem();
  if (sel && (inv[sel] || 0) > 0) {
    e.store[sel] = (e.store[sel] || 0) + inv[sel]; inv[sel] = 0;
    game.lastEvent = `stored ${itemName(sel)}`;
  } else {
    for (const [it, n] of Object.entries(e.store)) game.give(it, n);
    e.store = {};
    game.lastEvent = "emptied chest";
  }
}
