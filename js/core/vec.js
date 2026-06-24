// core/vec.js — 2D vector math

export const add   = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub   = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a, s) => ({ x: a.x * s, y: a.y * s });
export const len   = (a)    => Math.hypot(a.x, a.y);
export const dist  = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export const norm = (a) => {
  const l = Math.hypot(a.x, a.y) || 1;
  return { x: a.x / l, y: a.y / l };
};

// rotate a vector by `ang` radians (CCW)
export const rotate = (p, ang) => {
  const c = Math.cos(ang), s = Math.sin(ang);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
};
