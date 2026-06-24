// sim/mobs.js — the things in the dark. Hostiles spawn in unlit rooms, shamble
// toward the player, and deal contact damage. Melee them with a weapon, or shoot
// them with the musket (the era's capstone). Kept deliberately simple: mobs only
// think while you're in their room.

import { dist } from "../core/vec.js";

// entity kinds — stats per type (sprites loaded by kind in render/mobsprite.js)
export const MOB_TYPES = {
  shambler: { hp: 24, speed: 3.0, dmg: 7, r: 0.38 },  // baseline
  watcher:  { hp: 32, speed: 2.4, dmg: 9, r: 0.42 },  // tall, slow, hits hard
  hound:    { hp: 16, speed: 5.2, dmg: 6, r: 0.34 },  // fast rusher
  crawler:  { hp: 12, speed: 4.4, dmg: 5, r: 0.30 },  // small, skittery
  husk:     { hp: 50, speed: 1.8, dmg: 13, r: 0.52 }, // heavy tank
};
function pickKind(rng) {
  const r = rng();
  if (r < 0.40) return "shambler";
  if (r < 0.62) return "watcher";
  if (r < 0.80) return "hound";
  if (r < 0.91) return "crawler";
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
  for (const m of mobs) {
    m.cool -= dt;
    const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy) || 1;
    if (d > 0.6) { const s = m.speed * dt; m.x += (dx / d) * s; m.y += (dy / d) * s; }
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

// fire the equipped gun toward an aim point: nearest mob in a narrow cone.
// musket burns stygian powder for 40 dmg; the rifle burns crafted ammo for 75
// at longer range and a tighter cone.
export function fireMusket(game, aim) {
  const rifle = game.equippedTool() === "rifle";
  const ammoItem = rifle ? "ammo" : "stygian_powder";
  if ((game.inventory[ammoItem] || 0) < 1) {
    game.lastEvent = rifle ? "out of ammo — craft more" : "out of ammo — crush stygium into powder";
    return;
  }
  game.inventory[ammoItem] -= 1;
  const range = rifle ? 20 : 14, cone = rifle ? 0.18 : 0.28, dmg = rifle ? 75 : 40;
  const p = game.player.pos;
  const ang = Math.atan2(aim.y - p.y, aim.x - p.x);
  let best = null, bestD = 1e9;
  for (const m of game.current.mobs || []) {
    const d = dist(p, m);
    if (d > range) continue;
    const a = Math.atan2(m.y - p.y, m.x - p.x);
    const da = Math.abs(((a - ang + Math.PI) % (2 * Math.PI)) - Math.PI);
    if (da < cone && d < bestD) { best = m; bestD = d; }
  }
  game._muzzle = { x: p.x, y: p.y, ang, t: 0.1 };
  const name = rifle ? "rifle" : "musket";
  if (best) { best.hp -= dmg; game.lastEvent = best.hp <= 0 ? `${name} — kill!` : `${name} hit!`; game.current.mobs = game.current.mobs.filter((m) => m.hp > 0); }
  else game.lastEvent = `${name} — missed`;
}

// bow/crossbow: fire an arrow at the nearest mob in a cone (recoverable-ish)
export function fireBow(game, aim) {
  if ((game.inventory.arrow || 0) < 1) { game.lastEvent = "out of arrows"; return; }
  game.inventory.arrow -= 1;
  const p = game.player.pos;
  const ang = Math.atan2(aim.y - p.y, aim.x - p.x);
  let best = null, bd = 1e9;
  for (const m of game.current.mobs || []) {
    const d = dist(p, m); if (d > 16) continue;
    const a = Math.atan2(m.y - p.y, m.x - p.x);
    if (Math.abs(((a - ang + Math.PI) % (2 * Math.PI)) - Math.PI) < 0.2 && d < bd) { best = m; bd = d; }
  }
  game._muzzle = { x: p.x, y: p.y, ang, t: 0.1 };
  if (best) { best.hp -= 30; game.lastEvent = best.hp <= 0 ? "arrow — kill!" : "arrow hit!"; game.current.mobs = game.current.mobs.filter((m) => m.hp > 0); }
  else game.lastEvent = "arrow — missed";
}

// throw a grenade/molotov: AoE damage to mobs near the aim point
export function throwExplosive(game, item, aim) {
  if ((game.inventory[item] || 0) < 1) { game.lastEvent = `no ${item}`; return; }
  game.inventory[item] -= 1;
  const dmg = item === "molotov" ? 30 : 50, r = item === "molotov" ? 3.5 : 2.8;
  let hit = 0;
  for (const m of game.current.mobs || []) {
    if (Math.hypot(m.x - aim.x, m.y - aim.y) <= r) { m.hp -= dmg; hit++; }
  }
  game.current.mobs = (game.current.mobs || []).filter((m) => m.hp > 0);
  game._blast = { x: aim.x, y: aim.y, r, t: 0.25 };
  game.lastEvent = hit ? `${item} — hit ${hit}!` : `${item} — boom`;
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
