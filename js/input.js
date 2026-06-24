// input.js — keyboard + mouse state

export class Input {
  constructor() {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0 };  // CSS px (canvas fills the viewport)
    this._click = false;          // pending left-click  (inspect / build)
    this._rclick = false;         // pending right-click (use tool: disassemble/mine)

    window.addEventListener("keydown", (e) => {
      this.keys.add(e.key.toLowerCase());
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener("blur", () => this.keys.clear());

    window.addEventListener("mousemove", (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
    window.addEventListener("mousedown", (e) => { if (e.button === 0) this._click = true; else if (e.button === 2) this._rclick = true; });
    window.addEventListener("contextmenu", (e) => e.preventDefault()); // right-click is the tool
  }

  has(...k) { return k.some((x) => this.keys.has(x)); }

  // movement intent in fixed (north-up) world axes
  dir() {
    let x = 0, y = 0;
    if (this.has("w", "arrowup")) y -= 1;
    if (this.has("s", "arrowdown")) y += 1;
    if (this.has("a", "arrowleft")) x -= 1;
    if (this.has("d", "arrowright")) x += 1;
    return { x, y };
  }

  run() { return this.keys.has("shift"); }

  // returns true once per click, then clears
  takeClick() { const c = this._click; this._click = false; return c; }
  takeRightClick() { const c = this._rclick; this._rclick = false; return c; }
}
