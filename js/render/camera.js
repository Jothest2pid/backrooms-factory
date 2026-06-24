// render/camera.js — world->screen transform
//
// Fixed, north-up, factorio-style. The player is pinned at screen centre and
// the world scrolls beneath them; the camera never rotates.

import { PX } from "../config.js";

export function setCamera(ctx, dpr, cw, ch, player) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.translate(cw / 2, ch / 2);
  ctx.scale(PX, PX);
  ctx.translate(-player.pos.x, -player.pos.y);
}
