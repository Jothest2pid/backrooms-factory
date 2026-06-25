# Backrooms Factory

A proof of concept non-euclidean factory builder made by Claude, prompted by
jothest2pid as part of an AI-based game design program.

It is a top-down Backrooms walking sim that grows into a Factorio-style factory
and base builder. The hook is that the space is non-euclidean: rooms fold into
each other, corridors loop back on themselves, and a room can be larger inside
than its outer footprint. The web build exists to prove out the concept and the
core loop. The finished game is intended to be rebuilt in the Godot engine.

## Getting started
The game is plain JavaScript using ES modules, so it has to be served over HTTP
(it will not load from a raw file path). From the project folder:

```
python -m http.server 8000
```

Then open http://localhost:8000 in a browser and click ENTER. Everything is
static files, so it can also be hosted on any static host such as GitHub Pages.

## Controls
- WASD or arrow keys to move, Shift to run
- Right click: mine ore, disassemble furniture, strip carpet, or deconstruct a
  placed object
- Left click: use whatever is in the selected hotbar slot (place a building,
  shoot, throw, eat) or operate a machine
- 1 to 9: select a hotbar slot
- C: crafting and the tinker bench
- I: inventory and equipment
- B: the build menu (pick a building you own, then left click a tile to place it)
- R: rotate the thing being placed, V: short blink (needs a blink trinket equipped)
- H: the in-game progress guide, ~: god mode, P: debug overlay

Your progress saves automatically as you play. On the title screen, CONTINUE
picks up where you left off.

<details>
<summary><b>How to progress (click to open)</b></summary>

1. Break furniture with right click for wood, fabric, scrap and fuel. It sometimes drops loot or a trinket. Strip carpet and mine ore the same way.
2. Press C and craft planks, a wooden pickaxe and axe, then a workbench. Press B to open the build menu and place it.
3. Mine grey pillars for concrete, make concrete blocks, and build a concrete forge (it smelts ore without power). Near the workbench, make gears, electrum plate, wire and a machine frame.
4. Build a wood generator and fuel it. Belt machines need electricity, so without a generator a belt smelter just sits idle (the PWR meter shows the grid load).
5. Lay a belt and drop a smelter onto it so ore becomes ingots as it rides past. Add a presser for plates and chain processors to keep up with the belt. Arms move items between belts, chests and machines.
6. Press I to equip looted trinkets into the 10 slots. Build a tinker bench to refine duplicates and merge different ones into stronger gear, and to assemble modular guns from parts.
7. Dark rooms have enemies that hunt by sound. Make a gun, bow, or auto-turret, and use the cauldron to turn brimstone and powder into black sulfur for ammo and explosives. Eat food and place a bedroll to respawn there.
8. Go industrial with the stygian tier (crusher, stygian forge, advanced frames, circuit boards, motors) and set up farms (planter, mushroom bed, worm bin, animal pen).
9. Reach unobtanium and cut foldglass for the endgame: a superconductor and fold reactor for power, energy weapons, and capstone trinkets like the Phone, wings, or the war rig.

The same guide is in the game itself: click the GUIDE button or press H.
</details>

## What's in it
- An infinite, streamed, non-euclidean world with a vision-cone fog of war and
  rendering that draws through the folds.
- Belt-pass processing: machines sit on belts and transform whatever item rides
  past them, so a smelter turns ore into ingots as it passes. Chaining more of
  them raises throughput.
- Recipe machines for the things that combine inputs: forge, crusher, assembler,
  alchemy cauldron, metal crucible, loom, and an animal pen.
- A power grid that browns out and slows everything down if draw exceeds supply.
- Ten equipment slots and a large set of trinkets with stacking effects, plus a
  tinker bench that refines duplicate trinkets and merges different ones into
  stronger capstone gear.
- Loot dropped from furniture and seeded around rooms, found schematics that
  unlock alternate recipes, and a large treasure system: weak trinket "seeds"
  you find and then grow at the tinker bench, plus junk you fuse into improvised
  gadgets and weapons.
- Modular weapons built from parts (frame, barrel, stock, magazine, mod) into
  guns across several classes, with ammo families (bullets, AP, incendiary,
  shells, energy cells, arrow tips). Plus bows, thrown explosives, melee, and an
  auto-turret.
- Animal husbandry where a penned animal converts feed into eggs, meat, milk and
  leather, alongside crop, mushroom and silk-worm farming.
- A guided progression with an on-screen objective tracker that reads your
  actual save state and always points to the next step, ending at an unobtanium
  and foldglass endgame. Automatic saving, cozy base-building (flooring and
  wallpaper), and light survival against the things in the dark rooms.

Around 450 items and 250 recipes in this build.

## Credits
- Concept, creative direction, the full Game Design Document, and the pixel-art
  floor and ore tilesets by jothest2pid.
- The code, the furniture/machine SVG sprites, and this prototype build were
  generated by Claude (Opus 4.8) from jothest2pid's prompts and design.
