// sim/tools.js — what each equipped tool can do. "fist" is the default.
//
// fell  = disassembly damage per hit (furniture)
// mine  = ore mined per action (yield multiplier)
// strip = carpet stripped per action (yield)
// melee = damage dealt to entities (combat layer)

export const TOOLS = {
  fist:          { fell: 1, mine: 1, strip: 1, melee: 1 },
  wooden_pick:   { fell: 1, mine: 2, strip: 1, melee: 1 },
  axe:           { fell: 3, mine: 1, strip: 3, melee: 2 },
  crowbar:       { fell: 2, mine: 1, strip: 1, melee: 2 },
  fire_axe:      { fell: 4, mine: 1, strip: 4, melee: 4 }, // scavenged — between axe and electrum

  electrum_pick: { fell: 1, mine: 4, strip: 1, melee: 1 },
  electrum_axe:  { fell: 5, mine: 1, strip: 5, melee: 3 },
  electrum_blade:{ fell: 2, mine: 1, strip: 1, melee: 5 },
  musket:        { fell: 1, mine: 1, strip: 1, melee: 1, ranged: true },
  // mid-era stygian tier
  stygian_pick:  { fell: 1, mine: 6, strip: 1, melee: 2 },
  stygian_axe:   { fell: 7, mine: 1, strip: 7, melee: 4 },
  stygian_blade: { fell: 2, mine: 1, strip: 1, melee: 8 },
  rifle:         { fell: 1, mine: 1, strip: 1, melee: 1, ranged: true, rifle: true },
  bladed_yoyo:   { fell: 2, mine: 1, strip: 1, melee: 6 },
  bow:           { fell: 1, mine: 1, strip: 1, melee: 1, ranged: true, bow: true },
  crossbow:      { fell: 1, mine: 1, strip: 1, melee: 1, ranged: true, bow: true },
  shock_baton:   { fell: 1, mine: 1, strip: 1, melee: 7 },
};

export const toolStats = (id) => TOOLS[id] || TOOLS.fist;
