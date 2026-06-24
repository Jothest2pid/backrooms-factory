// render/playerMarker.js — the player drawn from the shared 4-direction walk
// sheet (Stardew-style). Falls back to a disc until the sheet decodes.

import { CharSheet } from "./charsheet.js";

const sheet = new CharSheet("sprites/people/player/walk.png");

export function drawPlayer(ctx, player) {
  const p = player.pos;
  if (sheet.draw(ctx, p.x, p.y, player.dir, player.moving, player.animClock)) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f4f4ec";
  ctx.fill();
  ctx.restore();
}
