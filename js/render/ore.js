// render/ore.js — mineable ore deposits, drawn live over the floor

import { ORES } from "../world/ore.js";

export function drawOre(ctx, room, ox, oy) {
  if (!room.ores.length) return;
  for (const o of room.ores) {
    const x = ox + o.tx + 0.5, y = oy + o.ty + 0.5;
    ctx.fillStyle = ORES[o.type].color;
    ctx.beginPath();
    ctx.arc(x - 0.18, y - 0.1, 0.17, 0, Math.PI * 2);
    ctx.arc(x + 0.16, y + 0.06, 0.21, 0, Math.PI * 2);
    ctx.arc(x - 0.02, y + 0.22, 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.beginPath();
    ctx.arc(x + 0.1, y - 0.02, 0.07, 0, Math.PI * 2);
    ctx.fill();
  }
}
