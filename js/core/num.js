// core/num.js — scalar helpers

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp  = (a, b, t) => a + (b - a) * t;
export const fract = (x) => x - Math.floor(x);
