// render/playerMarker.js — the player as a 4-direction walk sprite (Stardew-style).
//
// Sheet: 96x128, 3 columns x 4 rows of 32x32 cells.
//   row 0 = down (facing camera), 1 = up, 2 = right, 3 = left
//   columns are the 3 walk frames; idle rests on the middle frame (col 1).
// The character doesn't fill its 32x32 cell and the side frames are offset, so at
// load we scan each cell's opaque pixels to find its real content box, then draw
// anchored by that box (feet at the position, content centred horizontally). That
// way the "interesting" side hitboxes line up without guessing.

const sheet = new Image();
let ready = false;
let trims = null;                 // [row*3+col] -> {sx,sy,sw,sh} content rect in px
const COLS = 3, ROWS = 4, CELL = 32;
const CELLW = 1.5;                // world size a full 32px cell maps to
const FOOT = 0.34;                // how far below the position the feet sit

sheet.onload = () => { computeTrims(); ready = true; };
sheet.src = "sprites/people/player/walk.png";

function computeTrims() {
  try {
    const c = document.createElement("canvas");
    c.width = sheet.width; c.height = sheet.height;
    const x = c.getContext("2d");
    x.drawImage(sheet, 0, 0);
    const data = x.getImageData(0, 0, c.width, c.height).data;
    trims = [];
    for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
      const ox = col * CELL, oy = r * CELL;
      let minx = CELL, miny = CELL, maxx = -1, maxy = -1;
      for (let yy = 0; yy < CELL; yy++) for (let xx = 0; xx < CELL; xx++) {
        if (data[((oy + yy) * c.width + (ox + xx)) * 4 + 3] > 16) {
          if (xx < minx) minx = xx; if (xx > maxx) maxx = xx;
          if (yy < miny) miny = yy; if (yy > maxy) maxy = yy;
        }
      }
      trims[r * COLS + col] = maxx < 0
        ? { sx: ox, sy: oy, sw: CELL, sh: CELL }
        : { sx: ox + minx, sy: oy + miny, sw: maxx - minx + 1, sh: maxy - miny + 1 };
    }
  } catch (e) { trims = null; } // tainted canvas -> fall back to whole cells
}

function rowFor(dir) {
  const dx = dir ? dir.x : 0, dy = dir ? dir.y : 1;
  if (Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 1 : 0; // up : down
  return dx < 0 ? 3 : 2;                                   // left : right
}

export function drawPlayer(ctx, player) {
  const p = player.pos;
  if (ready) {
    const row = rowFor(player.dir);
    const col = player.moving ? Math.floor((player.animClock || 0) * 6) % COLS : 1;
    const scale = CELLW / CELL;
    let t = trims && trims[row * COLS + col];
    if (!t) t = { sx: col * CELL, sy: row * CELL, sw: CELL, sh: CELL }; // fallback
    const w = t.sw * scale, h = t.sh * scale;
    const sm = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sheet, t.sx, t.sy, t.sw, t.sh, p.x - w / 2, p.y + FOOT - h, w, h);
    ctx.imageSmoothingEnabled = sm;
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x, p.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f4f4ec";
  ctx.fill();
  ctx.restore();
}
