// ui/settings.js — live render settings bound to the slider panel
//
// A connected room `d` rooms away renders at opacity = opacity * falloff^(d-1).
// So OPACITY sets the first ring (1 room away) and FALLOFF dims each ring after.

export class Settings {
  constructor() {
    this.opacity = 0.5; // opacity of the first ring of connected rooms
    this.falloff = 0.5; // multiplier applied per extra room of depth
    this.render = 16;   // how far (world units) to render connected rooms
    this.chunks = 8;    // chunk size in world units (off-screen chunks aren't baked)

    this._bind("opacity", "opacity-val", (v) => { this.opacity = parseFloat(v); return parseFloat(v).toFixed(2); });
    this._bind("falloff", "falloff-val", (v) => { this.falloff = parseFloat(v); return parseFloat(v).toFixed(2); });
    this._bind("render", "render-val", (v) => { this.render = parseInt(v, 10); return v; });
    this._bind("chunks", "chunks-val", (v) => { this.chunks = parseInt(v, 10); return v; });
  }

  _bind(id, valId, apply) {
    const el = document.getElementById(id);
    const out = document.getElementById(valId);
    if (!el) return;
    const update = () => { out.textContent = apply(el.value); };
    el.addEventListener("input", update);
    update();
  }
}
