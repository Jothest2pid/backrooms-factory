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
    goal: "Build a concrete forge (6 concrete blocks) — it smelts ore without electricity.",
    hint: "Build a concrete forge — it's the bootstrap smelter, the only one that needs no metal. Place it, then mine electrum ore (golden veins) and left-click the forge with electrum to load it. It smelts electrum into ingots over time; left-click again to collect them.",
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
    id: "automate", title: "Automate with belts",
    goal: "Lay a belt, then drop a smelter onto it — ore passing over becomes ingots.",
    hint: "Craft belts and a smelter. Lay a line of belt (B → belt → left-click), then place the smelter directly ONTO a belt tile. Ore carried past the smelter is processed automatically. Add a presser further down to turn ingots into plate. This is the heart of the factory — chain processors along a belt.",
    done: (g) => built(g, "smelter") && built(g, "belt"),
  },
  {
    id: "power", title: "Generate power",
    goal: "Build a wood generator and load it with fuel.",
    hint: "Build a wood generator and left-click it with fuel to feed it. Powered machines (the stygian tier and beyond) draw from the grid. Watch the PWR meter — overbuild and it browns out, slowing everything.",
    done: (g) => built(g, "wood_generator") || built(g, "powder_generator"),
  },
  {
    id: "defense", title: "Survive the dark",
    goal: "Craft a bow or musket; brew black sulfur in a cauldron for ammo.",
    hint: "Dark rooms spawn the blind ones — they chase by sound and struggle with corners. Craft a bow, a musket, or place an auto-turret. Build an alchemy cauldron and brew brimstone + stygian powder into black sulfur, the game's gunpowder, for ammo and grenades. Set a bedroll so death returns you there.",
    done: (g) => gotAny(g, "bow", "musket", "crossbow", "rifle", "turret") || built(g, "bedroll"),
  },
  {
    id: "gear", title: "Tinker your gear",
    goal: "Build a tinker bench; equip trinkets (I) and fuse them into stronger gear.",
    hint: "Build a tinker bench. Press I to open equipment — you have 10 slots. Equip the trinkets you've looted, then at the tinker bench fuse duplicates into stronger versions or merge different ones into capstones: sprint/hover/blink boots, wings, armor rigs, or the Phone.",
    done: (g) => built(g, "tinker_bench"),
  },
  {
    id: "deep", title: "Go deeper", final: true,
    goal: "Expand: crusher, assembler, crucible, loom, pen. Find schematics. Make it home.",
    hint: "You're self-sufficient. Branch out: crusher and assembler for stygian gear, a crucible for alloys, a loom for textiles, an animal pen for food and leather. Find schematics in library rooms for better recipes. Lay flooring and wallpaper to make a base that's yours.",
    done: () => false, // open-ended endgame
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
  return { stages, current: stages[cur], index: cur, completed, total: STAGES.length };
}
