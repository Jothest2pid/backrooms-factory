// world/palettes.js — backrooms colour sets
//
// Canon: the backrooms substrate is the constant; a location only "bleeds
// through". So everything stays in the stained-fluorescent-yellow family, with
// only slight shifts per room type.

export const PALETTES = [
  { floor: "#b6ad5e", floor2: "#a89f52", wall: "#cfc77f", trim: "#8d8645", line: "#9b9249" },
  { floor: "#a8a85a", floor2: "#9a9a4f", wall: "#c4c479", trim: "#83833f", line: "#909049" },
  { floor: "#bcaf72", floor2: "#aea267", wall: "#d6cb8c", trim: "#94884c", line: "#a1955a" },
  { floor: "#9ea25c", floor2: "#909453", wall: "#bcc07c", trim: "#7d8044", line: "#8b8e4d" },
  { floor: "#c2b46a", floor2: "#b3a660", wall: "#dccd84", trim: "#9a8d4d", line: "#a89a58" },
];

// subtle per-type tints layered on the yellow substrate
export const TYPE_TINT = {
  pipe:      { floor: "#9c9760", floor2: "#8d8956", wall: "#b3ad78", trim: "#74714a", line: "#857f50" },
  pool:      { floor: "#a8b48a", floor2: "#99a57d", wall: "#c6cf9f", trim: "#7e8a63", line: "#8f9a72" },
  christmas: { floor: "#2b2620", floor2: "#241f1a", wall: "#352d24", trim: "#1c1813", line: "#2f281f" },
  library:   { floor: "#b0a566", floor2: "#a1965c", wall: "#c8bd80", trim: "#857a45", line: "#968b52" },
};

export function paletteFor(type, fallback) {
  return TYPE_TINT[type] || fallback;
}
