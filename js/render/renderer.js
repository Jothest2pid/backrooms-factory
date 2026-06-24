// render/renderer.js — orchestrates the per-frame draw: camera, room blits, FX

import { PX } from "../config.js";
import { fract } from "../core/num.js";
import { doorTransform, composeXf, IDENTITY } from "../model/transform.js";
import { setCamera } from "./camera.js";
import { bakeChunk } from "./bake.js";
import { drawEntities } from "./entities.js";
import { drawFurniture } from "./furniture.js";
import { drawPlayer } from "./playerMarker.js";

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.caches = { carpet: {} };
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.cw = window.innerWidth;
    this.ch = window.innerHeight;
    // offscreen layer for the darkness/lightmap pass
    if (!this.lightCanvas) this.lightCanvas = document.createElement("canvas");
    this.lightCanvas.width = this.canvas.width;
    this.lightCanvas.height = this.canvas.height;
  }

  cam(player) {
    setCamera(this.ctx, this.dpr, this.cw, this.ch, player);
  }

  draw(game, time, hovered = null, settings = { opacity: 0.5, falloff: 0.5, render: 35, chunks: 24 }, ghost = null) {
    const ctx = this.ctx;
    const room = game.current;
    const player = game.player;

    this._frame = (this._frame || 0) + 1;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = "#070705";
    ctx.fillRect(0, 0, this.cw, this.ch);

    this.cam(player);

    // Walk the portal graph outward (breadth-first), composing transforms, and
    // collect rooms to draw. Three culls keep the non-euclidean fan-out bounded:
    //  - off-screen footprints are skipped (a far room only draws its visible
    //    part — the "chunk" behaviour), and so is everything beyond them
    //  - rooms past RENDER DIST are skipped
    //  - once a room would be drawn near-invisible (opacity*falloff^depth), it
    //    and its subtree are skipped — so the opacity sliders also cap depth
    // rooms dimmer than this are never even baked (the "don't load it" cut);
    // chunks caps how many rooms render at once so dense overlap can't lag-nuke
    const MIN_ALPHA = 0.1, NODE_CAP = 50, FOG_DEPTH = 1; // FOW: only 1 room away
    this._vis = this.visibleWorldRect(player);
    this._chunkDim = Math.max(2, settings.chunks);
    this.metrics = { roomsDrawn: 0, chunksDrawn: 0, chunksBaked: 0, considered: 0 };
    // hubs fan out to many random rooms — only ever render 1 room out of/through one
    const hubLimit = room.type === "hub" ? 1 : Infinity;
    const vis = this._vis;
    const nodes = [];
    const seen = new Set();             // dedupe by ROOM, so a room never double-overlays
    const queue = [{ rm: room, xf: IDENTITY, depth: 0, entry: -1 }];
    let head = 0; // index pointer instead of shift() -> O(1) dequeue (linear BFS)
    while (head < queue.length && nodes.length < NODE_CAP && head < 500) {
      const { rm, xf, depth, entry } = queue[head++];
      this.metrics.considered++;
      if (seen.has(rm.id)) continue; // already drawn this room (nearest path wins)
      const alpha = depth === 0 ? 1 : settings.opacity * Math.pow(settings.falloff, depth - 1);
      if (depth > 0 && alpha < MIN_ALPHA) continue;
      if (depth > hubLimit) continue;
      // one AABB, reused for the screen test and the distance test
      const box = this.roomAABB(rm, xf);
      if (box.maxx <= vis.x0 || box.minx >= vis.x1 || box.maxy <= vis.y0 || box.miny >= vis.y1) continue;
      const dx = Math.max(box.minx - player.pos.x, 0, player.pos.x - box.maxx);
      const dy = Math.max(box.miny - player.pos.y, 0, player.pos.y - box.maxy);
      if (Math.hypot(dx, dy) > settings.render) continue;
      seen.add(rm.id);
      nodes.push({ rm, xf, depth, alpha });
      // don't expand past a hub (its random links would pull in the whole map)
      if (rm.type === "hub" && depth > 0) continue;
      if (depth >= FOG_DEPTH) continue; // FOW: stop at 1 room out — neighbors don't expand further
      rm.doors.forEach((door, di) => {
        if (di === entry || !door.link) return; // skip backtrack + unexpanded stubs
        const nb = game.rooms[door.link.room];
        // render through ALL linked doors (folds, one-ways, self-loops) so the
        // non-euclidean effect reads from both sides — only the culls below bound it
        const dt = doorTransform(rm, door, nb, nb.doors[door.link.door]);
        queue.push({ rm: nb, xf: composeXf(xf, dt), depth: depth + 1, entry: door.link.door });
      });
    }

    // draw far rooms first so nearer ones layer on top
    nodes.sort((a, b) => b.depth - a.depth);
    for (const n of nodes) {
      if (n.depth === 0) continue; // current room drawn last, below
      this.blit(n.rm, n.xf, n.alpha, !n.rm.visited);
    }

    // current room, fully in focus
    this.blit(room, IDENTITY, 1, false);

    // hovered furniture highlight box
    if (hovered) this.outline(hovered);

    // ghost of the furniture being carried, snapped to the target tile
    if (ghost) this.drawGhost(ghost);

    // cheap fluorescent flicker
    const f = fract(Math.sin(Math.floor(time * 6) * 12.9898) * 43758.5453);
    if (f < 0.1) {
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(0, 0, this.cw, this.ch);
      this.cam(player);
    }

    drawPlayer(ctx, player);

    // musket tracer (current room, camera still active)
    if (game._muzzle) {
      const mz = game._muzzle;
      ctx.save();
      ctx.strokeStyle = `rgba(255,225,140,${Math.min(1, mz.t * 8)})`;
      ctx.lineWidth = 0.09;
      ctx.beginPath();
      ctx.moveTo(mz.x, mz.y);
      ctx.lineTo(mz.x + Math.cos(mz.ang) * 14, mz.y + Math.sin(mz.ang) * 14);
      ctx.stroke();
      ctx.restore();
    }

    // explosion flash
    if (game._blast) {
      const b = game._blast;
      ctx.save();
      ctx.globalAlpha = Math.min(1, b.t * 4);
      ctx.fillStyle = "rgba(255,170,60,0.85)";
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (1.3 - b.t), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Project-Zomboid vision: a forward cone + a small awareness circle. Outside
    // it is fogged (near-black in dark rooms, dim otherwise). Lights cut through.
    this.drawVision(game);

    // periodically release baked bitmaps for rooms that scrolled off screen
    if (this._frame % 120 === 0) this.cullOffscreen(game.rooms);
  }

  // Project-Zomboid vision: build a fog layer, punch a forward cone + a small
  // awareness circle + any lights, then composite over the scene. Dark rooms fog
  // to near-black; lit rooms only dim, so you feel the space but can't see behind.
  drawVision(game) {
    const lc = this.lightCanvas, lx = lc.getContext("2d");
    const player = game.player, PXn = PX, cx = this.cw / 2, cy = this.ch / 2;
    lx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    lx.globalCompositeOperation = "source-over";
    lx.clearRect(0, 0, this.cw, this.ch);
    lx.fillStyle = game.current.dark ? "rgba(3,3,5,0.97)" : "rgba(8,8,11,0.68)";
    lx.fillRect(0, 0, this.cw, this.ch);

    lx.globalCompositeOperation = "destination-out";
    const lb = game.lightBonus ? game.lightBonus() : 0;      // trinket carry-light
    this.punchLight(lx, cx, cy, (3.0 + lb) * PXn);           // awareness around you
    const range = game.visionRange ? game.visionRange() : 14; // goggles/phone widen it
    const d = player.dir || { x: 0, y: 1 };
    this.punchCone(lx, cx, cy, range * PXn, Math.atan2(d.y, d.x), 0.62); // forward cone
    const sel = game.selectedItem && game.selectedItem();    // held torch/lantern widens it
    if (sel === "torch" || sel === "lantern") this.punchLight(lx, cx, cy, (sel === "lantern" ? 10 : 7.5) * PXn);
    for (const e of game.current.entities) {                 // placed lights cut through
      if (!e.light) continue;
      const sx = cx + (e.tx + (e.w || 1) / 2 - player.pos.x) * PXn;
      const sy = cy + (e.ty + (e.h || 1) / 2 - player.pos.y) * PXn;
      this.punchLight(lx, sx, sy, (e.light + 2) * PXn);
    }
    lx.globalCompositeOperation = "source-over";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.drawImage(lc, 0, 0, this.cw, this.ch);
  }

  // soft-edged wedge from (sx,sy) facing `ang`, half-width `half` radians
  punchCone(lx, sx, sy, r, ang, half) {
    const g = lx.createRadialGradient(sx, sy, r * 0.12, sx, sy, r);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.7, "rgba(0,0,0,0.92)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    lx.fillStyle = g;
    lx.beginPath();
    lx.moveTo(sx, sy);
    lx.arc(sx, sy, r, ang - half, ang + half);
    lx.closePath();
    lx.fill();
  }

  // hostile mobs (room-local coords): a dark shambler with glowing eyes + hp bar
  drawMobs(ctx, room, xf) {
    for (const m of room.mobs) {
      const p = xf.apply(m);
      ctx.fillStyle = "rgba(30,20,40,0.45)"; // murky aura
      ctx.beginPath(); ctx.arc(p.x, p.y, m.r * 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#16121c";
      ctx.beginPath(); ctx.arc(p.x, p.y, m.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e0503a";
      ctx.beginPath(); ctx.arc(p.x - 0.13, p.y - 0.05, 0.06, 0, Math.PI * 2); ctx.arc(p.x + 0.13, p.y - 0.05, 0.06, 0, Math.PI * 2); ctx.fill();
      if (m.hp < m.maxHp) {
        ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(p.x - m.r, p.y - m.r - 0.22, m.r * 2, 0.1);
        ctx.fillStyle = "#d24a4a"; ctx.fillRect(p.x - m.r, p.y - m.r - 0.22, m.r * 2 * (m.hp / m.maxHp), 0.1);
      }
    }
  }

  // breadcrumb string trail laid through a room (room-local coords)
  drawString(ctx, room, xf) {
    const s = room._string;
    ctx.save();
    ctx.strokeStyle = "rgba(230,220,180,0.7)";
    ctx.lineWidth = 0.07;
    ctx.beginPath();
    for (let i = 0; i < s.length; i++) {
      const p = xf.apply(s[i]);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(240,230,190,0.85)";
    for (const pt of s) { const p = xf.apply(pt); ctx.beginPath(); ctx.arc(p.x, p.y, 0.06, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  punchLight(lx, sx, sy, r) {
    const g = lx.createRadialGradient(sx, sy, r * 0.25, sx, sy, r);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.7, "rgba(0,0,0,0.85)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    lx.fillStyle = g;
    lx.beginPath();
    lx.arc(sx, sy, r, 0, Math.PI * 2);
    lx.fill();
  }

  // exact visible world rectangle, centred on the player (no margin: anything
  // fully off-screen is not rendered at all)
  visibleWorldRect(player) {
    const hw = this.cw / 2 / PX;
    const hh = this.ch / 2 / PX;
    return { x0: player.pos.x - hw, x1: player.pos.x + hw, y0: player.pos.y - hh, y1: player.pos.y + hh };
  }

  // bounding box of room `rm` under transform `xf`, computed once
  roomAABB(rm, xf) {
    const cs = [{ x: 0, y: 0 }, { x: rm.w, y: 0 }, { x: rm.w, y: rm.h }, { x: 0, y: rm.h }].map(xf.apply);
    let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    for (const c of cs) { minx = Math.min(minx, c.x); maxx = Math.max(maxx, c.x); miny = Math.min(miny, c.y); maxy = Math.max(maxy, c.y); }
    return { minx, maxx, miny, maxy };
  }

  // translucent preview of held furniture at the target tile (green=ok, red=blocked)
  drawGhost(ghost) {
    const ctx = this.ctx;
    if (ghost.build) { this.drawBuildGhost(ghost); return; }
    const f = ghost.f;
    const cx = ghost.tx + 0.5, cy = ghost.ty + 0.5;
    ctx.save();
    ctx.globalAlpha = 0.55;
    drawFurniture(ctx, { ...f, x: cx, y: cy }); // same draw path as live furniture
    ctx.globalAlpha = 1;
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = ghost.valid ? "rgba(120,255,140,0.95)" : "rgba(255,90,90,0.95)";
    ctx.strokeRect(cx - f.w / 2, cy - f.h / 2, f.w, f.h);
    ctx.restore();
  }

  // footprint preview of a buildable about to be placed
  drawBuildGhost(g) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = g.color || "#888";
    ctx.fillRect(g.tx + 0.08, g.ty + 0.08, g.w - 0.16, g.h - 0.16);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = g.valid ? "rgba(120,255,140,0.95)" : "rgba(255,90,90,0.95)";
    ctx.strokeRect(g.tx + 0.04, g.ty + 0.04, g.w - 0.08, g.h - 0.08);
    ctx.restore();
  }

  outline(desc) {
    const ctx = this.ctx;
    const w = desc.w + 0.3, h = desc.h + 0.3;
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255,255,210,0.7)";
    ctx.lineWidth = 0.09;
    ctx.strokeStyle = "rgba(255,255,210,0.95)";
    ctx.strokeRect(desc.x - w / 2, desc.y - h / 2, w, h);
    ctx.restore();
  }

  // draw a room as chunks, skipping (and never baking) off-screen chunks.
  // fuzzy (unvisited) rooms just render a touch dimmer — NO canvas blur filter,
  // which is a GPU killer (a full blur pass per drawImage tanks the frame rate).
  blit(room, xf, alpha, fuzzy) {
    const ctx = this.ctx;
    const C = this._chunkDim, vis = this._vis, m = this.metrics;
    const nx = Math.ceil(room.w / C), ny = Math.ceil(room.h / C);
    ctx.save();
    ctx.globalAlpha = fuzzy ? alpha * 0.8 : alpha;
    let drew = false;
    for (let cy = 0; cy < ny; cy++) {
      for (let cx = 0; cx < nx; cx++) {
        const ox = xf.t.x + cx * C, oy = xf.t.y + cy * C;
        const wU = Math.min(C, room.w - cx * C), hU = Math.min(C, room.h - cy * C);
        if (ox + wU <= vis.x0 || ox >= vis.x1 || oy + hU <= vis.y0 || oy >= vis.y1) continue; // off-screen chunk
        const chunk = bakeChunk(room, cx, cy, C, this.caches, m);
        ctx.drawImage(chunk.canvas, ox, oy, chunk.w, chunk.h);
        m.chunksDrawn++;
        drew = true;
      }
    }
    // placed structures drawn live over the floor (never baked)
    if (drew) drawEntities(ctx, room, xf.t.x, xf.t.y);
    if (drew && room._string && room._string.length) this.drawString(ctx, room, xf);
    if (drew && room.mobs && room.mobs.length) this.drawMobs(ctx, room, xf);
    ctx.restore();
    if (drew) { m.roomsDrawn++; room._seenFrame = this._frame; }
  }

  // Free the baked bitmaps + material caches of rooms we haven't drawn in a
  // while. They're a pure function of the (seeded, deterministic) room data, so
  // this loses nothing — they re-bake identically the next time the room is on
  // screen. Keeps memory flat no matter how far you explore.
  cullOffscreen(rooms) {
    const cutoff = this._frame - 180; // ~3s at 60fps of grace
    for (const r of rooms) {
      if (r._chunks && (r._seenFrame || 0) < cutoff) {
        r._chunks = null;
        r._mat = null;
      }
    }
  }
}
