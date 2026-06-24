// render/dualgrid.js — dual-grid wall rendering (Stalberg / jess::codes technique)
//
// World grid = wall-or-floor truth. The display grid is offset by half a cell so
// each display tile straddles a 2x2 block of world cells; a 4-bit mask picks one
// of 16 tiles. For the backrooms we only need wall-vs-floor, so 15 hard-corner
// tiles generated procedurally per palette. Walls are the 1-cell ring just
// OUTSIDE each room's floor (so floor stays [0,w]x[0,h] and matches collision),
// opened at doorways.

import { pointInPoly } from "../core/polygon.js";

const TILE = 32;            // sheet tile size in px
const CELL = 1;             // one world unit per cell
const sheetCache = {};

// procedural 16-tile strip: fill the wall-colored quadrants for each mask
function wallSheet(pal) {
  if (sheetCache[pal.wall]) return sheetCache[pal.wall];
  const cv = document.createElement("canvas");
  cv.width = 16 * TILE; cv.height = TILE;
  const c = cv.getContext("2d");
  const H = TILE / 2;
  for (let m = 0; m < 16; m++) {
    const ox = m * TILE;
    c.fillStyle = pal.wall;
    const TL = m & 8, TR = m & 4, BL = m & 2, BR = m & 1;
    if (TL) c.fillRect(ox, 0, H, H);
    if (TR) c.fillRect(ox + H, 0, H, H);
    if (BL) c.fillRect(ox, H, H, H);
    if (BR) c.fillRect(ox + H, H, H, H);
    // outline ONLY the wall/floor seam (edge between a set and an unset
    // quadrant), so the whole wall mass gets a continuous outline but tile-to-
    // tile interiors don't show a grid.
    c.strokeStyle = pal.trim;
    c.lineWidth = 2.5;
    c.beginPath();
    if (!!TL !== !!TR) { c.moveTo(ox + H, 0); c.lineTo(ox + H, H); }          // vertical, top half
    if (!!BL !== !!BR) { c.moveTo(ox + H, H); c.lineTo(ox + H, TILE); }       // vertical, bottom half
    if (!!TL !== !!BL) { c.moveTo(ox, H); c.lineTo(ox + H, H); }              // horizontal, left half
    if (!!TR !== !!BR) { c.moveTo(ox + H, H); c.lineTo(ox + TILE, H); }       // horizontal, right half
    c.stroke();
  }
  sheetCache[pal.wall] = cv;
  return cv;
}

function inFloor(room, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return false;
  if (room.organic && !pointInPoly({ x: tx + 0.5, y: ty + 0.5 }, room.outline)) return false;
  return true;
}

// is this boundary cell part of a door opening (so the wall stays open there)?
function doorGap(room, tx, ty) {
  for (const d of room.doors) {
    const c = d.center, hw = d.width / 2;
    if (d.side === "N" && ty === -1 && tx + 0.5 >= c - hw && tx + 0.5 <= c + hw) return true;
    if (d.side === "S" && ty === room.h && tx + 0.5 >= c - hw && tx + 0.5 <= c + hw) return true;
    if (d.side === "W" && tx === -1 && ty + 0.5 >= c - hw && ty + 0.5 <= c + hw) return true;
    if (d.side === "E" && tx === room.w && ty + 0.5 >= c - hw && ty + 0.5 <= c + hw) return true;
  }
  return false;
}

// wall = a non-floor cell on the boundary ring (adjacent to floor), minus doors
function isWall(room, tx, ty) {
  if (inFloor(room, tx, ty)) return false;
  if (doorGap(room, tx, ty)) return false;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++)
      if ((dx || dy) && inFloor(room, tx + dx, ty + dy)) return true;
  return false;
}

export function drawDualWalls(ctx, room) {
  const sheet = wallSheet(room.palette);
  for (let cy = 0; cy <= room.h + 1; cy++) {
    for (let cx = 0; cx <= room.w + 1; cx++) {
      const tl = isWall(room, cx - 1, cy - 1) ? 1 : 0;
      const tr = isWall(room, cx, cy - 1) ? 1 : 0;
      const bl = isWall(room, cx - 1, cy) ? 1 : 0;
      const br = isWall(room, cx, cy) ? 1 : 0;
      const m = (tl << 3) | (tr << 2) | (bl << 1) | br;
      if (m === 0) continue;
      // half-cell shift up/left places the tile on the world corner
      ctx.drawImage(sheet, m * TILE, 0, TILE, TILE, cx * CELL - 0.5, cy * CELL - 0.5, CELL, CELL);
    }
  }
}
