// ui/guide.js — the always-on objective tracker + the dynamic "how to progress"
// panel. Both read the live progression state, so a stuck player always sees the
// exact next step from where they actually are.

import { progressState } from "../sim/progression.js";

export class Guide {
  constructor(game) {
    this.game = game;
    this.objEl = document.getElementById("objective");
    this.bodyEl = document.getElementById("guide-body");
    this.panel = document.getElementById("guide");
    this._objSig = "";
    this._guideSig = "";
  }
  setGame(game) { this.game = game; this._objSig = this._guideSig = ""; }

  guideOpen() { return this.panel && !this.panel.classList.contains("hidden"); }

  // cheap per-frame call: re-render only when the progression actually changes
  update(started) {
    if (!this.objEl) return;
    if (!started) { this.objEl.classList.add("hidden"); return; }
    const st = progressState(this.game);

    // always-on tracker: current goal + how far along you are
    const objSig = st.index + "|" + st.completed;
    if (objSig !== this._objSig) {
      this._objSig = objSig;
      this.objEl.classList.remove("hidden");
      this.objEl.innerHTML =
        `<div class="obj-head"><span class="obj-tag">NEXT</span> ${st.current.title}` +
        `<span class="obj-prog">${st.completed}/${st.total}</span></div>` +
        `<div class="obj-goal">${st.current.goal}</div>` +
        `<div class="obj-hint">press <b>H</b> for the full guide</div>`;
    }

    // full guide panel: a checklist that marks where you are
    if (this.guideOpen()) {
      const gSig = st.index + "|" + st.completed;
      if (gSig !== this._guideSig) { this._guideSig = gSig; this.renderGuide(st); }
    }
  }

  renderGuide(st) {
    if (!this.bodyEl) return;
    const rows = st.stages.map((s, i) => {
      const icon = s.status === "done" ? "✓" : s.status === "current" ? "▶" : "○";
      const detail = s.status === "current" ? `<div class="gstep-hint">${s.hint}</div>` : "";
      return `<div class="gstep ${s.status}">` +
        `<div class="gstep-head"><span class="gicon">${icon}</span>` +
        `<span class="gtitle">${i + 1}. ${s.title}</span></div>` +
        (s.status !== "current" ? `<div class="gstep-goal">${s.goal}</div>` : "") +
        detail + `</div>`;
    });
    const intro = `<p class="gintro">You're on step <b>${st.index + 1}</b> of ${st.total}. The highlighted step is your next move — everything above it is done.</p>`;
    this.bodyEl.innerHTML = intro + rows.join("");
  }
}
