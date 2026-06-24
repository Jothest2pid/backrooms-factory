// render/charsheet.js — a 3x4 directional walk sheet (Stardew-style), shared by
// the player and humanoid enemies (blindman). Rows: 0 down, 1 up, 2 right, 3 left.
// Columns are the 3 walk frames; idle rests on the middle one. Cells are 32x32
// but the art doesn't fill them, so we trim each cell to its opaque content at
// load and anchor by that (feet at the position, content centred).

const COLS = 3, ROWS = 4, CELL = 32;

export class CharSheet {
  constructor(src) {
    this.img = new Image();
    this.ready = false;
    this.trims = null;
    this.img.onload = () => { this.computeTrims(); this.ready = true; };
    this.img.src = src;
  }

  computeTrims() {
    try {
      const c = document.createElement("canvas");
      c.width = this.img.width; c.height = this.img.height;
      const x = c.getContext("2d");
      x.drawImage(this.img, 0, 0);
      const data = x.getImageData(0, 0, c.width, c.height).data;
      this.trims = [];
      for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
        const ox = col * CELL, oy = r * CELL;
        let minx = CELL, miny = CELL, maxx = -1, maxy = -1;
        for (let yy = 0; yy < CELL; yy++) for (let xx = 0; xx < CELL; xx++) {
          if (data[((oy + yy) * c.width + (ox + xx)) * 4 + 3] > 16) {
            if (xx < minx) minx = xx; if (xx > maxx) maxx = xx;
            if (yy < miny) miny = yy; if (yy > maxy) maxy = yy;
          }
        }
        this.trims[r * COLS + col] = maxx < 0
          ? { sx: ox, sy: oy, sw: CELL, sh: CELL }
          : { sx: ox + minx, sy: oy + miny, sw: maxx - minx + 1, sh: maxy - miny + 1 };
      }
    } catch (e) { this.trims = null; }
  }

  static rowFor(dir) {
    const dx = dir ? dir.x : 0, dy = dir ? dir.y : 1;
    if (Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 1 : 0; // up : down
    return dx < 0 ? 3 : 2;                                   // left : right
  }

  // draw centred-on-content, feet at (px, py+foot); cellw = world size of a full cell
  draw(ctx, px, py, dir, moving, clock, cellw = 1.7, foot = 0.34) {
    if (!this.ready) return false;
    const row = CharSheet.rowFor(dir);
    const col = moving ? Math.floor((clock || 0) * 6) % COLS : 1;
    let t = this.trims && this.trims[row * COLS + col];
    if (!t) t = { sx: col * CELL, sy: row * CELL, sw: CELL, sh: CELL };
    const scale = cellw / CELL, w = t.sw * scale, h = t.sh * scale;
    const sm = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.img, t.sx, t.sy, t.sw, t.sh, px - w / 2, py + foot - h, w, h);
    ctx.imageSmoothingEnabled = sm;
    return true;
  }
}
