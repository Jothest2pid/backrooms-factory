// render/mobsprite.js — load entity sprites by kind, with graceful fallback.
//
// Drop a file named like the mob kind into sprites/ (e.g. sprites/shambler.png
// or sprites/shambler.svg) and it renders automatically. Until then the mob
// draws as the procedural placeholder. Tries .png first, then .svg.

const KINDS = ["shambler", "watcher", "hound", "crawler", "husk"];
const cache = {};
const loaded = new Set();

function load(name) {
  const img = new Image();
  img.onload = () => loaded.add(name);
  img.onerror = () => {
    // no .png — try an .svg with the same name, then give up to the fallback
    if (!img._triedSvg) { img._triedSvg = true; img.src = `sprites/${name}.svg`; }
  };
  img.src = `sprites/${name}.png`;
  cache[name] = img;
}
KINDS.forEach(load);

export function getMobSprite(kind) {
  return loaded.has(kind) ? cache[kind] : null;
}
