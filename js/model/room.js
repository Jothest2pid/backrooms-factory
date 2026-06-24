// model/room.js — a single room and its door geometry

import { DOOR_W } from "../config.js";
import { TILE, SOLID, BUILDABLE, RESOURCE } from "./tiles.js";

export class Room {
  constructor(id, w, h, palette) {
    this.id = id;
    this.w = w;
    this.h = h;
    this.palette = palette;
    this.wallT = 0.42;

    this.type = "yellow";     // special room type (see world/roomTypes.js)
    this.dark = false;        // unlit room (christmas)
    this.behavior = null;     // non-euclidean behavior label

    this.doors = [];          // { side, center, width, link:{room,door}, locked }
    this.lights = [];         // { x, y, id }
    this.damage = [];         // { tx, ty, wet }
    this.furniture = [];      // { type, x, y, w, h, rot }
    this.features = [];       // structural features (render) — see world/structural.js
    this.solids = [];         // collision shapes: {type:'circle'|'rect', ...}
    this.organic = null;      // corner-notch descriptor or null
    this.outline = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];

    this.used = new Set();    // sides already occupied by a door
    this.visited = false;
    this._bake = null;        // cached offscreen render

    // tile substrate + placed structures (the base-building / mining layer)
    this.grid = null;         // Uint8Array(w*h) of TILE.* — set by world/grid.js
    this.entities = [];       // { type, tx, ty, ... } placed buildings
    this.ores = [];           // { tx, ty, type } mineable deposits
  }

  // ---- tile / building API --------------------------------------------------
  inBounds(tx, ty) { return tx >= 0 && ty >= 0 && tx < this.w && ty < this.h; }
  tileAt(tx, ty) { return this.inBounds(tx, ty) ? this.grid[ty * this.w + tx] : TILE.VOID; }
  setTile(tx, ty, v) { if (this.inBounds(tx, ty)) this.grid[ty * this.w + tx] = v; }
  solidAt(tx, ty) { return SOLID.has(this.tileAt(tx, ty)); }
  resourceAt(tx, ty) { return RESOURCE[this.tileAt(tx, ty)] || null; }
  entityAt(tx, ty) { return this.entities.find((e) => e.tx === tx && e.ty === ty) || null; }
  buildableAt(tx, ty) { return BUILDABLE.has(this.tileAt(tx, ty)) && !this.entityAt(tx, ty); }
  placeEntity(e) { if (this.buildableAt(e.tx, e.ty)) { this.entities.push(e); return true; } return false; }
  removeEntity(tx, ty) { this.entities = this.entities.filter((e) => !(e.tx === tx && e.ty === ty)); }

  // door geometry in local space: p = midpoint, n = outward normal, t = tangent
  doorGeom(d) {
    const hw = (d.width ?? DOOR_W) / 2;
    switch (d.side) {
      case "N": return { p: { x: d.center, y: 0 },      n: { x: 0, y: -1 }, t: { x: 1, y: 0 },  halfW: hw };
      case "S": return { p: { x: d.center, y: this.h }, n: { x: 0, y: 1 },  t: { x: -1, y: 0 }, halfW: hw };
      case "W": return { p: { x: 0, y: d.center },      n: { x: -1, y: 0 }, t: { x: 0, y: -1 }, halfW: hw };
      case "E": return { p: { x: this.w, y: d.center }, n: { x: 1, y: 0 },  t: { x: 0, y: 1 },  halfW: hw };
    }
  }
}
