// render/furniture.js — draw furniture as sprites oriented by a 4-way facing
// (0 down, 1 left, 2 up, 3 right).
//
// Two kinds of furniture:
//  - FLAT pieces (desks, beds, chairs, rugs) read fine from above — we just fill
//    their footprint with the sprite, mirrored for up/left facings.
//  - STANDING pieces (lockers, bookshelves) are tall billboards. Turning one to
//    face sideways is a rotation about the VERTICAL axis: it keeps its height and
//    only gets thinner (front face -> thin side panel). So we never swap W/H into
//    a wide-short smear — we draw it at the long axis as height, narrow width, and
//    swap in a dedicated thin "_side" sprite.

import { ITEMS } from "../world/items.js";
import { getSprite } from "./sprites.js";
import { poly } from "./shape.js";

// tall pieces that read as upright billboards: turning them to the side keeps
// their height and just makes them thin (vertical-axis rotation, _side sprite)
const STANDING = new Set([
  "lockers", "bookshelf", "filingCabinet", "shelving",
  "serverRack", "vending", "electricalPanel",
]);

// facing -> orientation flags (kept for any callers that still want them)
export function facingInfo(f) {
  const facing = f.facing ?? (f.orient === "front" ? 0 : 3);
  const side = facing === 1 || facing === 3;
  return { facing, side, variant: side ? "side" : "front", flipH: facing === 1, flipV: facing === 2 };
}

export function drawFurniture(ctx, f) {
  const facing = f.facing ?? (f.orient === "front" ? 0 : 3);
  const side = facing === 1 || facing === 3;

  if (STANDING.has(f.type)) { drawStanding(ctx, f, side); return; }

  // flat piece: fill the footprint, mirror for up/left
  const img = getSprite(f.type, side ? "side" : "front") || getSprite(f.type);
  if (!img) { fallback(ctx, f); return; }
  ctx.save();
  ctx.translate(f.x, f.y);
  if (facing === 2) ctx.scale(1, -1);
  else if (facing === 1) ctx.scale(-1, 1);
  ctx.drawImage(img, -f.w / 2, -f.h / 2, f.w, f.h);
  ctx.restore();
}

// a tall billboard standing on its tile: same height front-on or side-on, just
// thinner from the side (vertical-axis rotation), using the _side sprite.
function drawStanding(ctx, f, side) {
  const H = Math.max(f.w, f.h);          // standing height — preserved either way
  const frontW = Math.min(f.w, f.h);     // width of the front face
  const drawW = side ? Math.min(frontW * 0.72, 0.95) : frontW;
  const img = side ? (getSprite(f.type, "side") || getSprite(f.type)) : getSprite(f.type);
  if (!img) { fallback(ctx, f); return; }
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.drawImage(img, -drawW / 2, -H / 2, drawW, H);
  ctx.restore();
}

function fallback(ctx, f) {
  const spec = ITEMS[f.type] || { color: "#5a4428" };
  ctx.save();
  ctx.fillStyle = spec.color;
  if (spec.shape === "plant" || spec.shape === "tree") {
    ctx.beginPath();
    ctx.arc(f.x, f.y, Math.max(f.w, f.h) / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    poly(ctx, [
      { x: f.x - f.w / 2, y: f.y - f.h / 2 }, { x: f.x + f.w / 2, y: f.y - f.h / 2 },
      { x: f.x + f.w / 2, y: f.y + f.h / 2 }, { x: f.x - f.w / 2, y: f.y + f.h / 2 },
    ]);
    ctx.fill();
  }
  ctx.restore();
}
