// render/features.js — draw structural features

import { poly } from "./shape.js";

const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];

export function drawFeatures(ctx, room) {
  const pal = room.palette;
  for (const ft of room.features) {
    if (ft.type === "pillar") {
      // a column that juts UP like the walls (same treatment, no side faces)
      const H = 1.2, r = ft.r;
      ctx.fillStyle = pal.wall;
      ctx.fillRect(ft.x - r, ft.y - H, r * 2, H);                   // shaft body
      ctx.beginPath(); ctx.arc(ft.x, ft.y, r, 0, Math.PI * 2); ctx.fill(); // rounded base
      ctx.fillStyle = "rgba(0,0,0,0.18)";                           // shaded side
      ctx.fillRect(ft.x + r * 0.4, ft.y - H, r * 0.6, H);
      ctx.fillStyle = pal.trim;                                     // top-cap rim
      ctx.beginPath(); ctx.ellipse(ft.x, ft.y - H, r, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = pal.wall;                                     // top-cap face
      ctx.beginPath(); ctx.ellipse(ft.x, ft.y - H, r * 0.84, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 0.06; ctx.strokeStyle = pal.trim;             // shaft edges
      ctx.beginPath();
      ctx.moveTo(ft.x - r, ft.y - H); ctx.lineTo(ft.x - r, ft.y);
      ctx.moveTo(ft.x + r, ft.y - H); ctx.lineTo(ft.x + r, ft.y);
      ctx.stroke();
    } else if (ft.type === "pitfall") {
      if (ft.water) drawWater(ctx, ft);
      else drawPit(ctx, ft);
      if (ft.bridge) {
        ctx.fillStyle = "#6e5733";
        if (ft.bridge === "h") poly(ctx, rect(ft.x, ft.y + ft.h / 2 - 0.7, ft.w, 1.4));
        else poly(ctx, rect(ft.x + ft.w / 2 - 0.7, ft.y, 1.4, ft.h));
        ctx.fill();
      }
    } else if (ft.type === "pipes") {
      drawPipes(ctx, room);
    } else if (ft.type === "sunken") {
      poly(ctx, rect(ft.x, ft.y, ft.w, ft.h));
      ctx.fillStyle = "rgba(0,0,0,0.26)"; ctx.fill();
      ctx.lineWidth = 0.12; ctx.strokeStyle = "rgba(0,0,0,0.45)"; ctx.stroke();
    } else if (ft.type === "alcove") {
      drawAlcove(ctx, room, ft);
    }
  }
}

// dark hole with a crumbling concrete rim (drawn at world scale, no stretch)
function drawPit(ctx, ft) {
  poly(ctx, rect(ft.x, ft.y, ft.w, ft.h));
  ctx.fillStyle = "#5f5d56"; ctx.fill(); // exposed concrete rim
  const m = 0.5;
  poly(ctx, rect(ft.x + m, ft.y + m, ft.w - 2 * m, ft.h - 2 * m));
  ctx.fillStyle = "#0c0c0a"; ctx.fill(); // the void
}

// almond-water pool: pale tiles + ripples spaced in world units (never stretched)
function drawWater(ctx, ft) {
  ctx.save();
  poly(ctx, rect(ft.x, ft.y, ft.w, ft.h));
  ctx.clip();
  poly(ctx, rect(ft.x, ft.y, ft.w, ft.h));
  ctx.fillStyle = "#5e7a72"; ctx.fill();
  // pool tiling, 2-unit grid
  ctx.lineWidth = 0.05; ctx.strokeStyle = "rgba(40,60,55,0.5)";
  for (let x = Math.ceil(ft.x); x < ft.x + ft.w; x += 2) { ctx.beginPath(); ctx.moveTo(x, ft.y); ctx.lineTo(x, ft.y + ft.h); ctx.stroke(); }
  for (let y = Math.ceil(ft.y); y < ft.y + ft.h; y += 2) { ctx.beginPath(); ctx.moveTo(ft.x, y); ctx.lineTo(ft.x + ft.w, y); ctx.stroke(); }
  // ripples
  ctx.lineWidth = 0.08; ctx.strokeStyle = "rgba(170,200,190,0.4)";
  for (let y = ft.y + 1.5; y < ft.y + ft.h; y += 3) {
    ctx.beginPath();
    for (let x = ft.x; x < ft.x + ft.w; x += 0.5) ctx.lineTo(x, y + Math.sin(x * 1.5) * 0.18);
    ctx.stroke();
  }
  ctx.restore();
}

// metal pipes running along the walls of a pipe room
function drawPipes(ctx, room) {
  const wt = room.wallT;
  const draw = (x0, y0, x1, y1) => {
    ctx.lineCap = "round";
    ctx.lineWidth = 0.32; ctx.strokeStyle = "#4f4f56";
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.lineWidth = 0.22; ctx.strokeStyle = "#8a8a92";
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.lineWidth = 0.07; ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    // joint bands
    const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len;
    ctx.lineWidth = 0.4; ctx.strokeStyle = "#3a3a40";
    for (let s = 2; s < len; s += 3) {
      const jx = x0 + ux * s, jy = y0 + uy * s;
      ctx.beginPath(); ctx.moveTo(jx - uy * 0.22, jy + ux * 0.22); ctx.lineTo(jx + uy * 0.22, jy - ux * 0.22); ctx.stroke();
    }
  };
  const m = 0.4;
  for (const o of [wt + 0.35, wt + 0.75]) {
    draw(m, o, room.w - m, o);                       // N wall
    draw(m, room.h - o, room.w - m, room.h - o);     // S wall
    draw(o, m, o, room.h - m);                        // W wall
    draw(room.w - o, m, room.w - o, room.h - m);      // E wall
  }
}

// a recessed niche / hidey-hole set into a wall
function drawAlcove(ctx, room, ft) {
  const a = ft.at, hw = ft.width / 2, d = ft.depth;
  let r;
  if (ft.side === "N") r = rect(a - hw, 0, ft.width, d);
  else if (ft.side === "S") r = rect(a - hw, room.h - d, ft.width, d);
  else if (ft.side === "W") r = rect(0, a - hw, d, ft.width);
  else r = rect(room.w - d, a - hw, d, ft.width);
  poly(ctx, r);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.fill();
  ctx.lineWidth = 0.1;
  ctx.strokeStyle = room.palette.trim;
  ctx.stroke();
}
