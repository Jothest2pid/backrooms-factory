// sim/audio.js — tiny procedural sound system (WebAudio, no asset files).
// Every meaningful action gets an auditory signal to pair with its visual one,
// so the game gives feedback through two senses. Guarded so it's a no-op in
// non-browser contexts (e.g. node smoke tests).

let ctx = null;
function ac() {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
  return ctx;
}

// resume on a user gesture (autoplay policy) — called when the game starts
export function resumeAudio() { const c = ac(); if (c && c.state === "suspended") c.resume(); }

// one short tone; `slide` bends the pitch over its duration
function tone(c, t, { freq = 440, dur = 0.08, type = "square", vol = 0.2, slide = 0 }) {
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + dur);
}

const SOUNDS = {
  mine:        (c, t) => tone(c, t, { freq: 190, type: "square", dur: 0.1, slide: -70, vol: 0.18 }),
  strip:       (c, t) => tone(c, t, { freq: 320, type: "sawtooth", dur: 0.06, vol: 0.1 }),
  hit:         (c, t) => tone(c, t, { freq: 150, type: "square", dur: 0.07, slide: -50, vol: 0.2 }),
  break:       (c, t) => { tone(c, t, { freq: 200, type: "square", dur: 0.09, slide: -120, vol: 0.2 }); tone(c, t + 0.05, { freq: 120, type: "square", dur: 0.1, slide: -60, vol: 0.16 }); },
  place:       (c, t) => tone(c, t, { freq: 520, type: "triangle", dur: 0.07, vol: 0.18 }),
  deconstruct: (c, t) => tone(c, t, { freq: 300, type: "square", dur: 0.12, slide: -180, vol: 0.16 }),
  craft:       (c, t) => { tone(c, t, { freq: 520, type: "triangle", dur: 0.06, vol: 0.16 }); tone(c, t + 0.07, { freq: 780, type: "triangle", dur: 0.08, vol: 0.16 }); },
  equip:       (c, t) => tone(c, t, { freq: 680, type: "triangle", dur: 0.06, vol: 0.15 }),
  pickup:      (c, t) => tone(c, t, { freq: 900, type: "triangle", dur: 0.06, vol: 0.16, slide: 200 }),
  eat:         (c, t) => tone(c, t, { freq: 330, type: "sine", dur: 0.12, vol: 0.18 }),
  hurt:        (c, t) => tone(c, t, { freq: 220, type: "sawtooth", dur: 0.18, slide: -120, vol: 0.26 }),
  shoot:       (c, t) => tone(c, t, { freq: 130, type: "square", dur: 0.11, slide: -60, vol: 0.24 }),
  bow:         (c, t) => tone(c, t, { freq: 500, type: "sine", dur: 0.12, slide: -260, vol: 0.16 }),
  boom:        (c, t) => { tone(c, t, { freq: 90, type: "sawtooth", dur: 0.22, slide: -50, vol: 0.3 }); },
  blink:       (c, t) => tone(c, t, { freq: 700, type: "sine", dur: 0.12, slide: 500, vol: 0.16 }),
  deny:        (c, t) => tone(c, t, { freq: 150, type: "square", dur: 0.1, slide: -30, vol: 0.13 }),
};

export function sfx(name) {
  const c = ac(); if (!c || c.state !== "running") return;
  const f = SOUNDS[name];
  if (f) f(c, c.currentTime);
}
