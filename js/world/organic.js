// world/organic.js — "organic" rooms: a notch cut from one corner (L-shape)

// corner index -> the two wall sides the notch touches (can't host doors)
const BLOCKED = [["N", "W"], ["N", "E"], ["S", "E"], ["S", "W"]];

// 1 in 10 rooms gets a corner notch. keepFree = a side that must stay door-able
// (its spanning-tree connection), so we only pick corners that don't block it.
export function maybeOrganic(rng, room, keepFree = null) {
  if (rng() >= 0.1) return;
  const corners = [0, 1, 2, 3].filter((c) => !keepFree || !BLOCKED[c].includes(keepFree));
  if (!corners.length) return;
  const corner = corners[Math.floor(rng() * corners.length)];
  const cw = (0.25 + rng() * 0.45) * room.w;
  const ch = (0.25 + rng() * 0.45) * room.h;
  room.organic = { cw, ch, corner };

  const w = room.w, h = room.h;
  if (corner === 0) room.outline = [{ x: cw, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }, { x: 0, y: ch }, { x: cw, y: ch }];
  else if (corner === 1) room.outline = [{ x: 0, y: 0 }, { x: w - cw, y: 0 }, { x: w - cw, y: ch }, { x: w, y: ch }, { x: w, y: h }, { x: 0, y: h }];
  else if (corner === 2) room.outline = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h - ch }, { x: w - cw, y: h - ch }, { x: w - cw, y: h }, { x: 0, y: h }];
  else room.outline = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: cw, y: h }, { x: cw, y: h - ch }, { x: 0, y: h - ch }];

  room.used.add(BLOCKED[corner][0]);
  room.used.add(BLOCKED[corner][1]);
}
