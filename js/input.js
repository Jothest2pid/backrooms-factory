// input.js — keyboard + mouse state

export class Input {
  constructor() {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0 };  // CSS px (canvas fills the viewport)
    this._click = false;          // pending left-click  (inspect / build)
    this._rclick = false;         // pending right-click (use tool: disassemble/mine)

    this._dirOrder = []; // movement tokens in press order (most recent last)
    const TOKEN = { w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right" };

    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      this.keys.add(k);
      const t = TOKEN[k];
      if (t) { this._dirOrder = this._dirOrder.filter((x) => x !== t); this._dirOrder.push(t); }
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener("blur", () => this.keys.clear());

    window.addEventListener("mousemove", (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
    window.addEventListener("mousedown", (e) => { if (e.button === 0) this._click = true; else if (e.button === 2) this._rclick = true; });
    window.addEventListener("contextmenu", (e) => e.preventDefault()); // right-click is the tool
  }

  has(...k) { return k.some((x) => this.keys.has(x)); }

  // movement intent — FOUR-directional: the most recently pressed of the held
  // directions wins, so holding two keys never produces a diagonal.
  dir() {
    const active = {
      up: this.has("w", "arrowup"), down: this.has("s", "arrowdown"),
      left: this.has("a", "arrowleft"), right: this.has("d", "arrowright"),
    };
    const VEC = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    for (let i = this._dirOrder.length - 1; i >= 0; i--) {
      const t = this._dirOrder[i];
      if (active[t]) return { ...VEC[t] };
    }
    return { x: 0, y: 0 };
  }

  run() { return this.keys.has("shift"); }

  // returns true once per click, then clears
  takeClick() { const c = this._click; this._click = false; return c; }
  takeRightClick() { const c = this._rclick; this._rclick = false; return c; }
}
