// sim/telemetry.js — record every play so you can trace desire paths.
//
// Samples the player's position into a path (per room) and logs key actions
// (room enters, crafts, mines, places, deaths). Press L in-game to download the
// session as JSON; it also autosaves to localStorage so reloads don't lose it.

export const telemetry = {
  now: 0,
  events: [],
  path: [],     // [{t, room, x, y}] — sampled walk, for desire-path heatmaps
  _accum: 0,

  // call every frame: advances the clock and samples position ~2x/second
  tick(dt, room, x, y) {
    this.now += dt;
    this._accum += dt;
    if (this._accum >= 0.5) {
      this._accum = 0;
      this.path.push({ t: Math.round(this.now * 10) / 10, room, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
      if (this.path.length % 40 === 0) this.save();
    }
  },

  log(type, data = {}) {
    this.events.push({ t: Math.round(this.now * 100) / 100, type, ...data });
    if (this.events.length % 25 === 0) this.save();
  },

  save() {
    try { localStorage.setItem("backrooms:playlog", JSON.stringify({ events: this.events, path: this.path })); } catch (e) {}
  },

  // download the session (desire paths + events) as JSON
  export() {
    const data = JSON.stringify({ events: this.events, path: this.path });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    a.download = "backrooms-playlog.json";
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
