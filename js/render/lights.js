// render/lights.js — fluorescent ceiling tubes (baked statically)

import { fract } from "../core/num.js";
import { poly } from "./shape.js";

export function drawLight(ctx, light, time) {
  let b = 0.82 + 0.18 * Math.sin(time * 2.5 + light.id);
  const flick = fract(Math.sin(light.id * 78.233 + Math.floor(time * 9)) * 43758.5453);
  if (flick < 0.07) b *= 0.2;

  const hw = 1.3, hh = 0.32;
  const pts = [
    { x: light.x - hw, y: light.y - hh }, { x: light.x + hw, y: light.y - hh },
    { x: light.x + hw, y: light.y + hh }, { x: light.x - hw, y: light.y + hh },
  ];
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = `rgba(255,248,210,${0.5 * b})`;
  poly(ctx, pts);
  ctx.fillStyle = `rgba(255,250,225,${0.6 * b + 0.25})`;
  ctx.fill();
  ctx.restore();
}
