// render/entities.js — placed buildings/machines, drawn LIVE over the baked floor
//
// Entities are deliberately NOT part of bakeChunk: drawing them every frame on
// top of the cached floor means placing or removing one (base-building, belts)
// never re-bakes the room. Coordinates are room-local; `ox,oy` is the room's
// world offset under the current transform.

import { ITEMS } from "../sim/registry.js";

export function drawEntities(ctx, room, ox, oy) {
  if (!room.entities || !room.entities.length) return;
  for (const e of room.entities) {
    const spec = ITEMS[e.type] || {};
    const w = e.w || 1, h = e.h || 1;
    const x = ox + e.tx, y = oy + e.ty;
    const m = 0.08; // inset

    // body
    ctx.fillStyle = spec.color || "#7a7a82";
    ctx.fillRect(x + m, y + m, w - 2 * m, h - 2 * m);
    ctx.lineWidth = 0.05;
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.strokeRect(x + m, y + m, w - 2 * m, h - 2 * m);

    if (e.process) drawProcessor(ctx, e, x, y);
    else if (e.logi === "belt") drawBelt(ctx, e, x, y);
    else if (e.logi === "arm") drawArm(ctx, e, x, y);
    else if (e.machine === "turret") drawTurret(ctx, e, x, y, w, h);
    else if (e.machine) drawMachine(ctx, e, x, y, w, h);
    else if (e.type === "torch") drawTorch(ctx, x, y);
    else if (e.type === "wooden_door") drawDoor(ctx, x, y, w, h);
    else if (e.type === "concrete_wall" || e.type === "stygian_wall") drawWall(ctx, x, y, w, h);
    else if (e.type === "power_pole") drawPole(ctx, x, y);
    else if (e.type === "bedroll") drawBedroll(ctx, x, y, w, h);
  }
}

const DIRV = [[0, 1], [-1, 0], [0, -1], [1, 0]]; // facing 0 down,1 left,2 up,3 right

function drawBelt(ctx, e, x, y) {
  const [dx, dy] = DIRV[e.facing || 0];
  // chevrons pointing along travel
  ctx.strokeStyle = "rgba(200,200,210,0.5)";
  ctx.lineWidth = 0.06;
  const cx = x + 0.5, cy = y + 0.5;
  for (let k = -1; k <= 1; k++) {
    const ox = cx + dx * k * 0.28, oy = cy + dy * k * 0.28;
    ctx.beginPath();
    ctx.moveTo(ox - dy * 0.18 - dx * 0.1, oy - dx * 0.18 - dy * 0.1);
    ctx.lineTo(ox + dx * 0.12, oy + dy * 0.12);
    ctx.lineTo(ox + dy * 0.18 - dx * 0.1, oy + dx * 0.18 - dy * 0.1);
    ctx.stroke();
  }
  // items riding the belt
  if (e.items) {
    for (const it of e.items) {
      const ix = cx + dx * (it.pos - 0.5), iy = cy + dy * (it.pos - 0.5);
      ctx.fillStyle = ITEMS[it.item] ? ITEMS[it.item].color || "#ccc" : "#ccc";
      ctx.fillRect(ix - 0.14, iy - 0.14, 0.28, 0.28);
      ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 0.03;
      ctx.strokeRect(ix - 0.14, iy - 0.14, 0.28, 0.28);
    }
  }
}

function drawArm(ctx, e, x, y) {
  const [dx, dy] = DIRV[e.facing || 0];
  const cx = x + 0.5, cy = y + 0.5;
  ctx.fillStyle = "#3a322a";
  ctx.beginPath(); ctx.arc(cx, cy, 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#caa23a"; ctx.lineWidth = 0.09;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * 0.42, cy + dy * 0.42); ctx.stroke();
  ctx.fillStyle = "#caa23a";
  ctx.beginPath(); ctx.arc(cx + dx * 0.42, cy + dy * 0.42, 0.08, 0, Math.PI * 2); ctx.fill();
  if (e.held) { // carried item on the hand
    ctx.fillStyle = ITEMS[e.held] ? ITEMS[e.held].color || "#ccc" : "#ccc";
    ctx.fillRect(cx + dx * 0.42 - 0.1, cy + dy * 0.42 - 0.1, 0.2, 0.2);
  }
}

function drawTurret(ctx, e, x, y, w, h) {
  const cx = x + w / 2, cy = y + h / 2;
  const ammo = (e.input && e.input.ammo) || 0;
  // base
  ctx.fillStyle = "#3a3644";
  ctx.beginPath(); ctx.arc(cx, cy, 0.34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = e.active ? "#6a6480" : "#4a4658";
  ctx.beginPath(); ctx.arc(cx, cy, 0.24, 0, Math.PI * 2); ctx.fill();
  // barrel toward target (or facing)
  const a = e._aim != null ? e._aim : -Math.PI / 2;
  ctx.strokeStyle = "#2a2636"; ctx.lineWidth = 0.12;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 0.5, cy + Math.sin(a) * 0.5); ctx.stroke();
  // muzzle flash
  if (e._flash > 0) {
    ctx.fillStyle = "rgba(255,225,140,0.95)";
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 0.55, cy + Math.sin(a) * 0.55, 0.14, 0, Math.PI * 2); ctx.fill();
  }
  // out-of-ammo / unpowered pip
  if (ammo <= 0 || !e.active) {
    ctx.fillStyle = "#d24a4a";
    ctx.beginPath(); ctx.arc(cx, cy, 0.07, 0, Math.PI * 2); ctx.fill();
  }
}

const PROC_ACCENT = { smelt: "#ff7a3a", press: "#c0c0cc", crush: "#9a9aa6", wash: "#5ab0d0" };
function drawProcessor(ctx, e, x, y) {
  const cx = x + 0.5, cy = y + 0.5;
  // body straddling the belt, leaving the belt visible through a slot
  ctx.fillStyle = (ITEMS[e.type] && ITEMS[e.type].color) || "#777";
  ctx.fillRect(x + 0.1, y + 0.1, 0.8, 0.28);
  ctx.fillRect(x + 0.1, y + 0.62, 0.8, 0.28);
  ctx.lineWidth = 0.04; ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.strokeRect(x + 0.1, y + 0.1, 0.8, 0.28);
  ctx.strokeRect(x + 0.1, y + 0.62, 0.8, 0.28);
  // process accent + flash when it fires
  ctx.fillStyle = e._flash > 0 ? "rgba(255,225,150,0.95)" : (PROC_ACCENT[e.process] || "#ccc");
  ctx.beginPath(); ctx.arc(cx, y + 0.24, 0.07, 0, Math.PI * 2); ctx.fill();
}

function drawPole(ctx, x, y) {
  ctx.fillStyle = "#5a4a2c";
  ctx.fillRect(x + 0.42, y + 0.42, 0.16, 0.16);
  ctx.strokeStyle = "rgba(110,160,210,0.6)"; ctx.lineWidth = 0.04;
  ctx.strokeRect(x + 0.34, y + 0.34, 0.32, 0.32);
}

function drawMachine(ctx, e, x, y, w, h) {
  const cx = x + w / 2, cy = y + h / 2;
  // a darker inner core so machines read distinct from walls
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x + 0.28, y + 0.28, w - 0.56, h - 0.56);

  // active glow + progress bar when running
  if (e.active) {
    ctx.fillStyle = "rgba(255,196,80,0.9)";
    ctx.beginPath(); ctx.arc(cx, cy, 0.16, 0, Math.PI * 2); ctx.fill();
  }
  const recipeTime = e._t || 2;
  if (e.progress > 0) {
    const frac = Math.min(1, e.progress / recipeTime);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(x + 0.2, y + h - 0.28, w - 0.4, 0.14);
    ctx.fillStyle = "#7fe07f";
    ctx.fillRect(x + 0.2, y + h - 0.28, (w - 0.4) * frac, 0.14);
  }
  // an output dot when finished goods are waiting
  const hasOut = e.output && Object.values(e.output).some((n) => n > 0);
  if (hasOut) {
    ctx.fillStyle = "#ffe27a";
    ctx.beginPath(); ctx.arc(x + w - 0.22, y + 0.22, 0.1, 0, Math.PI * 2); ctx.fill();
  }
}

function drawTorch(ctx, x, y) {
  ctx.fillStyle = "#6e4d2c";
  ctx.fillRect(x + 0.44, y + 0.4, 0.12, 0.45);
  ctx.fillStyle = "#ffb24a";
  ctx.beginPath(); ctx.arc(x + 0.5, y + 0.36, 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,220,120,0.5)";
  ctx.beginPath(); ctx.arc(x + 0.5, y + 0.36, 0.28, 0, Math.PI * 2); ctx.fill();
}

function drawDoor(ctx, x, y, w, h) {
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 0.04;
  ctx.beginPath(); ctx.moveTo(x + w / 2, y + 0.1); ctx.lineTo(x + w / 2, y + h - 0.1); ctx.stroke();
}

function drawWall(ctx, x, y, w, h) {
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 0.03;
  ctx.beginPath();
  ctx.moveTo(x + 0.1, y + h / 2); ctx.lineTo(x + w - 0.1, y + h / 2);
  ctx.stroke();
}

function drawBedroll(ctx, x, y, w, h) {
  ctx.fillStyle = "#9a7070";
  ctx.fillRect(x + 0.18, y + 0.18, w - 0.36, 0.4);
}
