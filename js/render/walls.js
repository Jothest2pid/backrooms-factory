// render/walls.js — walls that follow the room outline, with door gaps

import { add, scale } from "../core/vec.js";
import { poly, tracePoly } from "./shape.js";

// rectangle covering a door opening across the wall thickness (a wall hole)
function doorGapRect(room, d) {
  const g = room.doorGeom(d);
  const wt = room.wallT * 1.4;
  const a = add(g.p, scale(g.t, g.halfW));
  const b = add(g.p, scale(g.t, -g.halfW));
  return [add(a, scale(g.n, wt)), add(b, scale(g.n, wt)), add(b, scale(g.n, -wt)), add(a, scale(g.n, -wt))];
}

export function drawThreshold(ctx, room, d) {
  if (d.locked) return; // one-way: no doorway shown on the blocked side
  const g = room.doorGeom(d);
  const a = add(g.p, scale(g.t, g.halfW));
  const b = add(g.p, scale(g.t, -g.halfW));
  const inward = scale(g.n, -room.wallT);
  poly(ctx, [a, b, add(b, inward), add(a, inward)]);
  ctx.fillStyle = "rgba(20,18,10,0.55)";
  ctx.fill();
}

// clip to [outline MINUS open-door rects], then thick-stroke the outline:
// inner half of the stroke becomes the wall; locked doors stay solid.
export function drawWalls(ctx, room) {
  const wt = room.wallT;
  ctx.save();
  ctx.beginPath();
  tracePoly(ctx, room.outline);
  for (const d of room.doors) if (!d.locked) tracePoly(ctx, doorGapRect(room, d));
  ctx.clip("evenodd");

  ctx.beginPath();
  tracePoly(ctx, room.outline);
  ctx.lineJoin = "miter";
  ctx.lineWidth = wt * 2;
  ctx.strokeStyle = room.palette.wall;
  ctx.stroke();
  ctx.lineWidth = wt * 0.5;
  ctx.strokeStyle = room.palette.trim;
  ctx.stroke();
  ctx.restore();
}
