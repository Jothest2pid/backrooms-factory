// main.js — bootstrap: build world, wire input, run the loop

import { PX } from "./config.js";
import { generateWorld } from "./world/generate.js";
import { Game } from "./sim/game.js";
import { Input } from "./input.js";
import { Renderer } from "./render/renderer.js";
import { pickInteractable } from "./sim/interact.js";
import { canPlace, canBuild } from "./sim/build.js";
import { ITEMS } from "./sim/registry.js";
import { Inspect } from "./ui/inspect.js";
import { Settings } from "./ui/settings.js";
import { CraftUI } from "./ui/craft.js";
import { onSpritesReady } from "./render/sprites.js";
import { onFloorReady } from "./render/floor.js";
import { telemetry } from "./sim/telemetry.js";
import { resumeAudio } from "./sim/audio.js";

const canvas = document.getElementById("game");
const renderer = new Renderer(canvas);
const input = new Input();
const inspect = new Inspect();
const settings = new Settings();

let game = newGame();
const craftUI = new CraftUI(game);
let last = performance.now();
let t = 0;
let started = false;

function newGame() {
  const seed = Math.floor(Math.random() * 0xffffffff);
  return new Game(generateWorld(seed), input);
}

// once sprite / floor tilesets decode, drop any chunk bakes made before they were ready
const dropBakes = () => { if (game) game.rooms.forEach((r) => (r._chunks = null)); };
onSpritesReady(dropBakes);
onFloorReady(dropBakes);

const elRoom = document.getElementById("hud-room");
const elExplored = document.getElementById("hud-explored");
const elEvent = document.getElementById("hud-event");
const elHealth = document.getElementById("bar-health");
const elStamina = document.getElementById("bar-stamina");
const elMode = document.getElementById("hud-mode");
const elInv = document.getElementById("hud-inv");
const elPower = document.getElementById("hud-power");

function updateHud() {
  elRoom.textContent = String(game.current.id).padStart(2, "0");
  elExplored.textContent = `${game.exploredCount()} / ${game.rooms.length}`;
  elEvent.textContent = game.lastEvent || " ";
  elHealth.style.width = (100 * game.health / game.maxHealth) + "%";
  elStamina.style.width = (100 * game.stamina / game.maxStamina) + "%";
  elMode.textContent = game.god ? "GOD" : game.held ? "CARRYING" : (game.buildMode ? "BUILD" : "EXPLORE");
  const inv = Object.entries(game.inventory).filter(([, n]) => n > 0);
  elInv.textContent = inv.length ? inv.map(([k, n]) => `${k} ${n}`).join("  ") : "empty";
  const pw = game.power;
  elPower.textContent = pw && (pw.supply || pw.draw)
    ? `${pw.supply}/${pw.draw}${pw.ratio < 1 ? "  BROWNOUT" : ""}` : "—";
}

// ---- perf debug (toggle with P) ----
const elDebug = document.getElementById("debug");
const perf = { on: false, frames: 0, frameMs: 0, stepMs: 0, drawMs: 0, hoverMs: 0, last: performance.now() };

function frame(now) {
  let dt = (now - last) / 1000;
  last = now;
  dt = Math.min(dt, 0.05);
  t += dt;

  const a = performance.now();
  if (started) { game.step(dt); telemetry.tick(dt, game.current.id, game.player.pos.x, game.player.pos.y); }
  const b = performance.now();
  const pt = cursorWorld();
  const hovered = started ? pickInteractable(game.current, pt) : null;
  const tile = { tx: Math.floor(pt.x), ty: Math.floor(pt.y) };
  const ghost = buildGhost(tile);
  const c = performance.now();
  renderer.draw(game, t, hovered, settings, ghost);
  const d = performance.now();
  updateHud();
  craftUI.renderHotbar();
  craftUI.refresh(); // in-place update so clicks aren't eaten by a rebuild
  // (inventory popup renders on open + after equip/unequip, NOT every frame — clicks survive)
  // tooltip only when not carrying something
  inspect.hover(game.held ? null : hovered, input.mouse);
  if (started && input.takeClick()) handleClick(hovered, tile, pt);
  if (started && input.takeRightClick()) game.useTool(hovered, tile); // mine / disassemble / strip / deconstruct

  // accumulate timings
  perf.frames++;
  perf.frameMs += dt * 1000;
  perf.stepMs += b - a;
  perf.hoverMs += c - b;
  perf.drawMs += d - c;
  if (now - perf.last >= 500) updateDebug(now);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function updateDebug(now) {
  const n = perf.frames || 1;
  const fps = Math.round((n * 1000) / (now - perf.last));
  const m = renderer.metrics || {};
  const line =
    `FPS ${fps}  frame ${(perf.frameMs / n).toFixed(1)}ms\n` +
    `draw ${(perf.drawMs / n).toFixed(2)}ms  step ${(perf.stepMs / n).toFixed(2)}ms  hover ${(perf.hoverMs / n).toFixed(2)}ms\n` +
    `rooms ${m.roomsDrawn}  chunks ${m.chunksDrawn}  baked ${m.chunksBaked}  considered ${m.considered}\n` +
    `room ${game.current.id} (${game.current.type})  render ${settings.render}  chunk ${settings.chunks}`;
  if (perf.on) { elDebug.textContent = line; console.log("[perf] " + line.replace(/\n/g, " | ")); }
  perf.frames = perf.frameMs = perf.stepMs = perf.drawMs = perf.hoverMs = 0;
  perf.last = now;
}

// cursor position in the current room's world coords
function cursorWorld() {
  const m = input.mouse;
  return {
    x: game.player.pos.x + (m.x - renderer.cw / 2) / PX,
    y: game.player.pos.y + (m.y - renderer.ch / 2) / PX,
  };
}

// preview overlay: carried furniture, or the selected buildable's footprint
function buildGhost(tile) {
  if (!started) return null;
  if (game.held) return { f: game.held, tx: tile.tx, ty: tile.ty, valid: canPlace(game.current, tile.tx, tile.ty) };
  const item = game.selectedBuildable();
  if (item) {
    const spec = ITEMS[item], w = spec.w || 1, h = spec.h || 1;
    let valid;
    if (spec.beltMount) {
      const ents = game.current.entities;
      valid = ents.some((e) => e.logi === "belt" && e.tx === tile.tx && e.ty === tile.ty)
        && !ents.some((e) => e.process && e.tx === tile.tx && e.ty === tile.ty);
    } else valid = canBuild(game.current, tile.tx, tile.ty, w, h);
    return { build: item, tx: tile.tx, ty: tile.ty, w, h, color: spec.color, valid };
  }
  return null;
}

function handleClick(hovered, tile, pt) {
  if (game.held) { game.placeHeld(tile.tx, tile.ty); return; }   // drop what we carry
  const sel = game.selectedItem();
  if (sel === "musket" || sel === "rifle" || sel === "bow" || sel === "crossbow") { game.fire(pt); return; } // shoot
  if ((sel === "grenade" || sel === "molotov") && (game.inventory[sel] || 0) > 0) { game.throwItem(sel, pt); return; } // throw
  if (game.selectedUsable()) { game.useUsable(game.selectedUsable()); return; } // string trail / drink
  if (game.selectedBuildable()) { game.placeBuildable(tile.tx, tile.ty); return; } // place selected building
  if (hovered && hovered.kind === "entity") { game.interactEntity(hovered.ref); return; } // load/collect machine
  if (!hovered) { inspect.close(); return; }
  // build mode: left-click moves furniture (not fixed structures like houses)
  if (hovered.kind === "item" && game.buildMode && !hovered.ref.fixed) { game.pickUp(hovered.ref); return; }
  inspect.open(hovered);                                          // otherwise inspect (right-click = mine/disassemble)
}

// ---- intro / controls ----
const intro = document.getElementById("intro");
function start() {
  if (started) return;
  started = true;
  resumeAudio(); // unlock WebAudio on the start-button gesture (autoplay policy)
  last = performance.now();
  intro.classList.add("hidden");
}
document.getElementById("start-btn").addEventListener("click", start);
// how-to-progress guide (button + H)
const guideEl = document.getElementById("guide");
const toggleGuide = () => guideEl.classList.toggle("hidden");
document.getElementById("guide-btn").addEventListener("click", toggleGuide);
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (!started && (k === "enter" || k === " " || k.startsWith("arrow") || "wasd".includes(k))) start();
  if (k === "r") { if (game.held) game.rotateHeld(); else if (game.selectedBuildable()) game.rotatePlacement(); else { game = newGame(); craftUI.setGame(game); started = true; intro.classList.add("hidden"); } }
  if (k === "p") { perf.on = !perf.on; elDebug.classList.toggle("show", perf.on); }
  if (k === "b") { game.buildMode = !game.buildMode; if (!game.buildMode && game.held) game.placeHeld(Math.floor(game.player.pos.x), Math.floor(game.player.pos.y)); }
  if (k === "c") { craftUI.toggle(); }
  if (k === "i") { craftUI.toggleInv(); }
  if (k === "v") { game.blink(); } // anomalous blink (needs a blink trinket)
  if (k === "h") { toggleGuide(); } // how-to-progress guide
  if (k === "l") { telemetry.export(); } // download this session's play log
  if (k >= "1" && k <= "9") { game.selectSlot(+k - 1); }
  if (k === "0") { game.sel = -1; } // bare hands / nothing selected
  if (k === "`" || k === "~") { game.god = !game.god; }
});
// mouse wheel cycles the hotbar
window.addEventListener("wheel", (e) => { if (started && game.hotbar.length) game.scrollSel(e.deltaY > 0 ? 1 : -1); }, { passive: true });
