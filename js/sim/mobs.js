// sim/mobs.js — the things in the dark. Hostiles spawn in unlit rooms, shamble
// toward the player, and deal contact damage. Melee them with a weapon, or shoot
// them with the musket (the era's capstone). Kept deliberately simple: mobs only
// think while you're in their room.

import { dist } from "../core/vec.js";
import { sfx } from "./audio.js";
import { ITEMS, itemName } from "./registry.js";

// mobs inside `cone` half-angle of `ang`, within `range`, nearest first
function targetsInCone(game, ang, range, cone) {
  const p = game.player.pos, out = [];
  for (const m of game.current.mobs || []) {
    const d = dist(p, m);
    if (d > range) continue;
    const a = Math.atan2(m.y - p.y, m.x - p.x);
    const da = Math.abs(((a - ang + Math.PI) % (2 * Math.PI)) - Math.PI);
    if (da < cone) out.push({ m, d });
  }
  return out.sort((x, y) => x.d - y.d);
}

// rotate angle `cur` toward `target` by at most `step` radians (shortest way)
function turnToward(cur, target, step) {
  let diff = ((target - cur + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (Math.abs(diff) <= step) return target;
  return cur + Math.sign(diff) * step;
}

// entity kinds — stats per type. blindman is the main enemy: a blind doppelganger
// of the player (same silhouette), player-sized, that still hunts you down.
export const MOB_TYPES = {
  blindman: { hp: 28, speed: 3.2, dmg: 8, r: 0.3 },   // MAIN — player-sized hitbox
  shambler: { hp: 24, speed: 3.0, dmg: 7, r: 0.38 },
  hound:    { hp: 16, speed: 5.2, dmg: 6, r: 0.34 },  // fast rusher
  husk:     { hp: 50, speed: 1.8, dmg: 13, r: 0.52 }, // heavy tank
};
function pickKind(rng) {
  const r = rng();
  if (r < 0.70) return "blindman"; // the main enemy
  if (r < 0.85) return "shambler";
  if (r < 0.95) return "hound";
  return "husk";
}

// populate a dark room with a mix of entities the first time it's entered
export function spawnMobs(world, room, player) {
  if (room._spawned) return;
  room._spawned = true;
  if (!room.dark) return; // only the unlit rooms are hostile, for now
  const rng = world.rng;
  const n = 2 + Math.floor(rng() * 3);
  room.mobs = room.mobs || [];
  for (let i = 0; i < n; i++) {
    let x, y, tries = 0;
    do { x = 1.5 + rng() * (room.w - 3); y = 1.5 + rng() * (room.h - 3); tries++; }
    while (tries < 12 && Math.hypot(x - player.pos.x, y - player.pos.y) < 5);
    const kind = pickKind(rng), t = MOB_TYPES[kind];
    room.mobs.push({ kind, x, y, hp: t.hp, maxHp: t.hp, r: t.r, speed: t.speed, dmg: t.dmg, cool: 0 });
  }
}

// advance the current room's mobs: chase + contact damage
export function tickMobs(game, dt) {
  const room = game.current, mobs = room.mobs;
  if (!mobs || !mobs.length) return;
  const p = game.player.pos;
  // stealth: quieter gear (negative `noise`) shrinks how close a mob notices you.
  // Base 11 tiles; reaper's cloak (-2) -> ~5, so you can actually sneak past.
  const detect = Math.max(2.5, 11 + (game.effect ? game.effect("noise") : 0) * 3);
  for (const m of mobs) {
    m.cool -= dt;
    const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy) || 1;
    const aware = d <= detect; // out of earshot -> mob holds position
    if (m.kind === "blindman") {
      // blind pathing: only re-aims every so often (delay) and turns slowly toward
      // its target heading, so it overshoots corners and can be juked.
      if (aware) {
        m._rt = (m._rt || 0) - dt;
        if (m._rt <= 0) { m._tAng = Math.atan2(dy, dx); m._rt = 0.7; }
        if (m._hAng == null) m._hAng = m._tAng;
        m._hAng = turnToward(m._hAng, m._tAng, 2.4 * dt); // ~2.4 rad/s turn rate
      }
      if (aware && d > 0.5 && m._hAng != null) {
        const s = m.speed * dt;
        m.x += Math.cos(m._hAng) * s; m.y += Math.sin(m._hAng) * s;
        m.dir = { x: Math.cos(m._hAng), y: Math.sin(m._hAng) };
        m.animClock = (m.animClock || 0) + dt;
      }
    } else if (aware && d > 0.6) { // other kinds: direct beeline chase
      const s = m.speed * dt;
      m.x += (dx / d) * s; m.y += (dy / d) * s;
      m.dir = { x: dx / d, y: dy / d };
      m.animClock = (m.animClock || 0) + dt;
    }
    // entities can't leave the room (no slipping through doorways)
    m.x = Math.max(m.r, Math.min(room.w - m.r, m.x));
    m.y = Math.max(m.r, Math.min(room.h - m.r, m.y));
    if (d < m.r + 0.4 && m.cool <= 0) { game.takeDamage(m.dmg); m.cool = 0.8; }
  }
  room.mobs = mobs.filter((m) => m.hp > 0);
}

// melee the mob under the cursor with the equipped weapon's damage
export function meleeMob(game, m, melee) {
  m.hp -= melee;
  // a little knockback away from the player
  const p = game.player.pos, dx = m.x - p.x, dy = m.y - p.y, d = Math.hypot(dx, dy) || 1;
  m.x += (dx / d) * 0.5; m.y += (dy / d) * 0.5;
  game.lastEvent = m.hp > 0 ? `hit it (${Math.max(0, m.hp)} hp)` : "killed it";
}

// fire any modular gun: reads the weapon's stat block, spends the best available
// ammo variant, and applies scatter (pellets to the nearest N) / pierce (a line
// through several) + variant modifiers (AP pierces, incendiary/heavy hit harder).
export function fireGun(game, aim, id, w) {
  const ammoList = Array.isArray(w.ammo) ? w.ammo : [w.ammo];
  const ammo = ammoList.find((a) => (game.inventory[a] || 0) >= 1);
  if (!ammo) { game.lastEvent = `out of ammo for ${itemName(id)}`; return; }
  game.inventory[ammo] -= 1;
  let dmg = w.dmg, pierce = w.pierce || 0;
  if (ammo === "incendiary_bullet") dmg *= 1.3;
  if (ammo === "heavy_bullet") dmg *= 1.25;
  if (ammo === "ap_bullet") pierce += 1;
  const shots = w.scatter || (1 + pierce); // scatter = pellets; else line of pierce+1
  const p = game.player.pos, ang = Math.atan2(aim.y - p.y, aim.x - p.x);
  const cands = targetsInCone(game, ang, w.range, w.cone);
  let hits = 0;
  // scatter pellets / pierce shots beyond the target count pile onto the nearest
  // mob, so a point-blank shotgun shreds a lone enemy instead of wasting pellets.
  for (let i = 0; i < shots && cands.length; i++) { cands[Math.min(i, cands.length - 1)].m.hp -= dmg; hits++; }
  game.current.mobs = (game.current.mobs || []).filter((m) => m.hp > 0);
  game._muzzle = { x: p.x, y: p.y, ang, t: 0.1 }; sfx("shoot");
  game.lastEvent = hits ? `${itemName(id)} — hit ${hits}!` : `${itemName(id)} — missed`;
}

// legacy entry kept for any old callers: route the equipped gun through fireGun
export function fireMusket(game, aim) {
  const id = game.equippedTool(), w = (ITEMS[id] && ITEMS[id].weapon) || ITEMS.musket.weapon;
  fireGun(game, aim, id, w);
}

// bow/crossbow: fire an arrow at the nearest mob in a cone. Picks the best loaded
// arrow variant — broadhead (+dmg), fold (pierces), explosive (small AoE).
export function fireBow(game, aim, w) {
  const variants = ["explosive_arrow", "fold_arrow", "broadhead_arrow", "arrow"];
  const ammo = variants.find((a) => (game.inventory[a] || 0) >= 1);
  if (!ammo) { game.lastEvent = "out of arrows"; return; }
  game.inventory[ammo] -= 1;
  const range = (w && w.range) || 16, cone = (w && w.cone) || 0.2;
  const p = game.player.pos, ang = Math.atan2(aim.y - p.y, aim.x - p.x);
  game._muzzle = { x: p.x, y: p.y, ang, t: 0.1 }; sfx("bow");
  let dmg = 30, shots = 1, aoe = 0;
  if (ammo === "broadhead_arrow") dmg = 48;
  if (ammo === "fold_arrow") { dmg = 38; shots = 3; }       // pierces a line
  if (ammo === "explosive_arrow") { dmg = 22; aoe = 2.6; }  // bursts on impact
  const cands = targetsInCone(game, ang, range, cone);
  let hits = 0;
  for (let i = 0; i < shots && i < cands.length; i++) { cands[i].m.hp -= dmg; hits++; }
  if (aoe && cands.length) { // explosive: splash around the first target
    const t = cands[0].m;
    for (const m of game.current.mobs || []) if (m !== t && Math.hypot(m.x - t.x, m.y - t.y) <= aoe) m.hp -= dmg;
    game._blast = { x: t.x, y: t.y, r: aoe, t: 0.2 }; sfx("boom");
  }
  game.current.mobs = (game.current.mobs || []).filter((m) => m.hp > 0);
  game.lastEvent = hits ? `${itemName(ammo)} — hit ${hits}!` : "arrow — missed";
}

// throw a grenade/molotov/dynamite/etc: AoE damage to mobs near the aim point.
const THROW_STATS = {
  molotov: { dmg: 30, r: 3.5 }, grenade: { dmg: 50, r: 2.8 },
  dynamite: { dmg: 95, r: 3.8 }, pipe_bomb: { dmg: 60, r: 3.0 },
  smoke_bomb: { dmg: 0, r: 3.5 }, firecracker: { dmg: 0, r: 2.0 },
};
export function throwExplosive(game, item, aim) {
  if ((game.inventory[item] || 0) < 1) { game.lastEvent = `no ${itemName(item)}`; return; }
  game.inventory[item] -= 1;
  const s = THROW_STATS[item] || { dmg: 40, r: 2.6 };
  let hit = 0;
  for (const m of game.current.mobs || []) {
    if (Math.hypot(m.x - aim.x, m.y - aim.y) <= s.r) { if (s.dmg) m.hp -= s.dmg; hit++; }
  }
  game.current.mobs = (game.current.mobs || []).filter((m) => m.hp > 0);
  game._blast = { x: aim.x, y: aim.y, r: s.r, t: 0.25 }; sfx("boom");
  game.lastEvent = hit ? `${itemName(item)} — hit ${hit}!` : `${itemName(item)} — boom`;
}

// auto-turrets: target the nearest mob in range and fire while powered + fed
export function tickTurrets(game, dt, ratio) {
  const room = game.current, mobs = room.mobs || [];
  for (const e of room.entities) {
    if (e.machine !== "turret") continue;
    if (e._flash) e._flash -= dt;
    e.cool = (e.cool || 0) - dt * ratio;
    const ammo = (e.input && e.input.ammo) || 0;
    e.active = ratio > 0 && ammo > 0;
    if (!mobs.length || !e.active) { e._target = null; continue; }
    const cx = e.tx + (e.w || 1) / 2, cy = e.ty + (e.h || 1) / 2;
    let best = null, bd = 1e9;
    for (const m of mobs) { const d = Math.hypot(m.x - cx, m.y - cy); if (d < 9 && d < bd) { best = m; bd = d; } }
    e._target = best;
    if (!best) continue;
    e._aim = Math.atan2(best.y - cy, best.x - cx);
    if (e.cool <= 0) {
      e.input.ammo = ammo - 1;
      best.hp -= 16;
      e.cool = 0.5;
      e._flash = 0.08;
      if (best.hp <= 0) room.mobs = mobs.filter((m) => m.hp > 0);
    }
  }
}
