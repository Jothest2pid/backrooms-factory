// model/transform.js — rigid transform aligning a neighbour room to a doorway
//
// Maps neighbour-local coords -> the current room's frame so the two linked
// doors coincide. rot is 0 for opposite-side links (seamless walking) and a
// multiple of 90° for self-loops; the renderer/sim fold rot into the camera.

import { add, sub, rotate } from "../core/vec.js";

// identity transform (the current room's own frame)
export const IDENTITY = { rot: 0, t: { x: 0, y: 0 }, apply: (p) => p };

// compose a parent frame with a child door transform: maps grandchild-local
// coords all the way into the current room's frame
export function composeXf(parent, child) {
  const rot = parent.rot + child.rot;
  const t = add(rotate(child.t, parent.rot), parent.t);
  return { rot, t, apply: (p) => add(rotate(p, rot), t) };
}

export function doorTransform(roomCur, doorCur, roomNb, doorNb) {
  const gA = roomCur.doorGeom(doorCur);
  const gB = roomNb.doorGeom(doorNb);
  const angNegA = Math.atan2(-gA.n.y, -gA.n.x);
  const angB = Math.atan2(gB.n.y, gB.n.x);
  let rot = angNegA - angB;
  rot = Math.atan2(Math.sin(rot), Math.cos(rot)); // normalize to (-pi, pi]
  if (Math.abs(rot) < 1e-9) rot = 0;
  const t = sub(gA.p, rotate(gB.p, rot));
  return {
    rot,
    t,
    apply: (pt) => add(rotate(pt, rot), t),
    applyInv: (pt) => rotate(sub(pt, t), -rot),
  };
}
