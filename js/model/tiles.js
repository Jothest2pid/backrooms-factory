// model/tiles.js — the tile substrate every room is built on
//
// Rooms are now a w×h grid of tiles plus a list of placed entities. This is the
// foundation base-building and mining hang off: a tile says what's underfoot
// (and whether you can build/mine there), an entity is something placed on it.

export const TILE = {
  FLOOR: 0,    // intact carpet — buildable
  CONCRETE: 1, // torn carpet, bare concrete — buildable, yields concrete
  WET: 2,      // damp carpet — buildable, trace almond water
  WATER: 3,    // pool — not buildable, almond-water source, blocks ground
  PIT: 4,      // hole — blocks ground (unless bridged)
  PILLAR: 5,   // column — blocks, not buildable
  BUILDING: 6, // house intrusion / solid structure — blocks
  VOID: 7,     // outside the room outline (organic notch) — nothing here
};

export const TILE_NAME = {
  0: "floor", 1: "concrete", 2: "wet carpet", 3: "almond water",
  4: "pit", 5: "pillar", 6: "structure", 7: "void",
};

// tiles you cannot walk onto
export const SOLID = new Set([TILE.WATER, TILE.PIT, TILE.PILLAR, TILE.BUILDING, TILE.VOID]);
// tiles you can place buildings on
export const BUILDABLE = new Set([TILE.FLOOR, TILE.CONCRETE, TILE.WET]);
// what a tile yields when mined/harvested (for the future economy)
export const RESOURCE = {
  [TILE.CONCRETE]: "concrete",
  [TILE.WET]: "almond_water",
  [TILE.WATER]: "almond_water",
};
