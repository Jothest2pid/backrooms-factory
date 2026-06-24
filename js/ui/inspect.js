// ui/inspect.js — hover tooltip (name) + click-to-inspect detail panel
//
// Takes the descriptor from sim/interact.js (carrying .info), or null.

export class Inspect {
  constructor() {
    this.tip = document.getElementById("tooltip");
    this.panel = document.getElementById("inspect");
    this.canvas = document.getElementById("game");
  }

  hover(desc, mouse) {
    if (desc) {
      this.tip.textContent = desc.info.name;
      this.tip.style.left = mouse.x + 14 + "px";
      this.tip.style.top = mouse.y + 14 + "px";
      this.tip.classList.add("show");
      this.canvas.style.cursor = "pointer";
    } else {
      this.tip.classList.remove("show");
      this.canvas.style.cursor = "default";
    }
  }

  open(desc) {
    const info = desc.info;
    this.panel.innerHTML =
      `<h2>${info.name}</h2>` +
      `<div class="row"><span class="lbl">YIELDS</span> ${info.yields}</div>` +
      `<div class="row"><span class="lbl">PICKUP</span> ${info.pickup ? "yes" : "no (must disassemble)"}</div>` +
      `<div class="hint">interact &mdash; more actions coming</div>`;
    this.panel.classList.add("show");
  }

  close() { this.panel.classList.remove("show"); }
}
