// sim/progression.js — a state-aware progression spine.
//
// Each stage is a milestone with a `done(game)` check and a concrete hint for
// what to do next. The guide walks this list, marks finished stages, and points
// at the first unfinished one — so the game can always tell a stuck player the
// exact next step from where they actually are (what they've discovered, built,
// and gathered), not a fixed script.

const got = (g, id) => g.discovered.has(id);          // ever obtained/crafted/mined
const built = (g, id) => g.everPlaced.has(id);        // ever placed in the world
const gotAny = (g, ...ids) => ids.some((id) => got(g, id));
const builtAny = (g, ...ids) => ids.some((id) => built(g, id));

// ordered milestones. `goal` is the one-liner for the always-on tracker; `hint`
// is the fuller explanation shown in the guide for the CURRENT stage.
export const STAGES = [
  {
    id: "scavenge", title: "Scavenge the rooms",
    goal: "Right-click furniture to break it for wood, scrap, fabric and fuel.",
    hint: "Right-click furniture to smash it apart — you'll get wood, scrap, fabric and fuel, and sometimes loot or a trinket. Right-click carpet to strip it and ore patches to mine them. Press I to see what you're carrying.",
    done: (g) => gotAny(g, "wood", "scrap", "fabric"),
  },
  {
    id: "tools", title: "Craft your first tools",
    goal: "Press C → craft planks, then a wooden pickaxe and an axe.",
    hint: "Press C to open crafting. Turn wood into planks, then craft a wooden pickaxe (mines ore and pillars) and an axe (chops furniture faster). A torch helps you see in dark rooms.",
    done: (g) => got(g, "wooden_pick") && got(g, "axe"),
  },
  {
    id: "workbench", title: "Set up a workbench",
    goal: "Craft a workbench (C), then press B and place it on an open tile.",
    hint: "Craft a workbench (4 planks + scrap). Then press B to open the build menu, click the workbench, and left-click an open floor tile to place it. Standing in the same room as a workbench unlocks its recipes.",
    done: (g) => built(g, "workbench"),
  },
  {
    id: "concrete", title: "Make concrete blocks",
    goal: "Mine grey pillars for concrete, then craft concrete blocks at the workbench.",
    hint: "Find a pillar room and mine the pillars with your pickaxe — each gives 4 concrete. Near your workbench, craft concrete into concrete blocks. While you're at it, craft a wooden gear (2 planks) — you'll need gears for machines.",
    done: (g) => got(g, "concrete_block") && got(g, "wooden_gear"),
  },
  {
    id: "forge", title: "Build your first smelter",
    goal: "Build a concrete forge (6 concrete blocks); feed it electrum ore + fuel.",
    hint: "Build a concrete forge — it's the bootstrap smelter and needs no electricity, but it does BURN FUEL. Place it, then left-click it with both electrum ore (golden veins) and fuel (wood, charcoal, anything flammable) to load it. It smelts electrum into ingots over time; left-click again to collect them.",
    done: (g) => built(g, "concrete_forge"),
  },
  {
    id: "metal", title: "Smelt metal & make parts",
    goal: "Smelt electrum into ingots, then craft electrum plate and wire.",
    hint: "Feed electrum ore into the forge to get electrum ingots. At the workbench, turn ingots into electrum plate and wire — the building blocks for frames, power, and tools.",
    done: (g) => got(g, "electrum_plate"),
  },
  {
    id: "frame", title: "Craft a machine frame",
    goal: "Craft a machine frame (planks + gears + electrum plate).",
    hint: "Craft a machine frame from planks, wooden gears and an electrum plate. Almost every machine — smelter, crusher, assembler — is built on a frame, so this unlocks the whole automation tier.",
    done: (g) => got(g, "machine_frame"),
  },
  {
    id: "power", title: "Generate power",
    goal: "Build a wood generator and fuel it — belt machines need electricity.",
    hint: "Build a wood generator and left-click it with fuel (wood, charcoal — anything that burns) to feed it. Belt processors and every industrial machine draw from the room's power grid; with no generator they sit idle. Watch the PWR meter — overbuild and it browns out, slowing everything. (The hand-fed concrete forge is the exception: it needs no power.)",
    done: (g) => built(g, "wood_generator") || built(g, "powder_generator"),
  },
  {
    id: "automate", title: "Automate with belts",
    goal: "Lay a belt, drop a powered smelter onto it — ore passing over becomes ingots.",
    hint: "Lay a line of belt (B → belt → left-click), then place a smelter directly ONTO a belt tile. With power flowing, ore carried past it smelts automatically. Add a presser for plate and a mill for powder down the line, and chain processors along a fast belt — this is the heart of the factory. Automator arms move items between belts, chests, and machines.",
    done: (g) => built(g, "smelter") && built(g, "belt"),
  },
  {
    id: "defense", title: "Survive the dark",
    goal: "Arm yourself — bow / musket / turret — and brew black sulfur for ammo.",
    hint: "Dark rooms spawn the blind ones; they hunt by sound (stealth gear quiets you) and struggle with corners. Craft a bow, a musket, or place an auto-turret. Build an alchemy cauldron and brew brimstone + stygian powder into BLACK SULFUR — the game's gunpowder — then load it into ammo, grenades, and dynamite. Set a bedroll so death returns you there.",
    done: (g) => gotAny(g, "bow", "musket", "crossbow", "rifle", "turret") || got(g, "black_sulfur") || built(g, "bedroll"),
  },
  {
    id: "gear", title: "Tinker your treasure",
    goal: "Build a tinker bench; equip trinkets (I) and fuse them into stronger gear.",
    hint: "Build a tinker bench. Press I for your 10 equipment slots. Equip looted trinkets, then at the bench REFINE duplicates into stronger tiers or MERGE different ones into capstones — sprint→hover→blink boots, the Walkman→Phone line, the war rig, the reaper's cloak. You also assemble modular guns here from frame + barrel + stock + mag parts.",
    done: (g) => built(g, "tinker_bench"),
  },
  {
    id: "industrialize", title: "Go industrial (stygian tier)",
    goal: "Crush stygium → stygian forge → advanced frames, circuit boards, motors.",
    hint: "Mine stygium and crush it (mill/crusher) into powder and iron. Build a stygian forge and assembler for stygian plate, gears, and CIRCUIT BOARDS, then ADVANCED FRAMES — the backbone of every late machine. A crucible alloys stygian iron + cobalt into magnetiron → motors. Switch to a powder generator for far more power. Set up farms — planter, mushroom bed, worm bin, animal pen — for a steady supply line.",
    done: (g) => gotAny(g, "advanced_frame", "circuit_board", "motor"),
  },
  {
    id: "endgame", title: "Master the Backrooms", final: true,
    goal: "Reach unobtanium: cut FOLDGLASS, build a railgun or the Phone, finish a capstone build.",
    hint: "The deep end. Mine UNOBTANIUM and cut it with a lens into FOLDGLASS — refractive, volatile, space-bending. From here: a superconductor for lossless power, energy weapons (arc gun, RAILGUN), and the showpiece trinkets — THE PHONE (GPS + fold radar + item info), WINGS or a jetpack, the WAR RIG, the survivor's rig, the reaper's cloak. Assemble a loadout across your 10 slots that fits how you play, build the base you want, and make the non-euclidean sprawl yours.",
    done: (g) => gotAny(g, "foldglass", "the_phone", "wings", "war_rig", "railgun", "superconductor", "jetpack"),
  },
];

// where the player is: just past the FURTHEST milestone they've reached, so the
// guide always points forward and never snaps back to a step they've blown past.
export function currentIndex(game) {
  let last = -1;
  for (let i = 0; i < STAGES.length; i++) if (STAGES[i].done(game)) last = i;
  return Math.min(last + 1, STAGES.length - 1);
}

// full snapshot for the guide: each stage tagged done/current/upcoming. `done` is
// each stage's own truthful check; `current` is where to look next.
export function progressState(game) {
  const cur = currentIndex(game);
  const stages = STAGES.map((s, i) => {
    const done = s.done(game);
    return { ...s, done, status: i === cur ? "current" : done ? "done" : "upcoming" };
  });
  const completed = stages.filter((s) => s.done).length;
  const mastered = STAGES[STAGES.length - 1].done(game); // finished the final stage
  return { stages, current: stages[cur], index: cur, completed, total: STAGES.length, mastered };
}
