// sim/registry.js — the item registry: every thing the player can hold, craft,
// or place, in one data-driven table. kind drives how it behaves:
//   resource     raw / decomposed material
//   intermediate crafted part feeding deeper recipes
//   tool         equippable, changes the right-click verb
//   buildable    placeable structure (machine / wall / belt / ...)

export const KIND = { RESOURCE: "resource", INTERMEDIATE: "intermediate", TOOL: "tool", BUILDABLE: "buildable", TRINKET: "trinket" };

export const ITEMS = {
  // ---- raw / decomposed resources ----
  wood:          { name: "Wood", kind: KIND.RESOURCE, stack: 200, color: "#6e4d2c" },
  fabric:        { name: "Fabric", kind: KIND.RESOURCE, stack: 200, color: "#7a5a5a" },
  scrap:         { name: "Metal scrap", kind: KIND.RESOURCE, stack: 200, color: "#8a8a92" },
  concrete:      { name: "Concrete", kind: KIND.RESOURCE, stack: 200, color: "#6f6d66" },
  carpet:        { name: "Carpet strip", kind: KIND.RESOURCE, stack: 200, color: "#b6ad5e" },
  string:        { name: "String", kind: KIND.RESOURCE, stack: 200, color: "#d8d2bd" },
  fuel:          { name: "Fuel", kind: KIND.RESOURCE, stack: 200, color: "#caa23a" },
  fiber:         { name: "Fiber", kind: KIND.RESOURCE, stack: 200, color: "#7a8a4a" },
  electronics:   { name: "Electronics", kind: KIND.RESOURCE, stack: 200, color: "#3a5a7a" },
  wiring:        { name: "Wiring", kind: KIND.RESOURCE, stack: 200, color: "#b07a3a" },
  plastic:       { name: "Plastic", kind: KIND.RESOURCE, stack: 200, color: "#cfd6da" },
  food:          { name: "Food", kind: KIND.RESOURCE, stack: 200, color: "#9a6a3a" },
  almond_water:  { name: "Almond water", kind: KIND.RESOURCE, stack: 200, color: "#8fb6a4" },
  heartwood:     { name: "Heartwood", kind: KIND.RESOURCE, stack: 200, color: "#3a8a45" },
  electrum:      { name: "Raw electrum", kind: KIND.RESOURCE, stack: 200, color: "#d9c25a" },
  stygium:       { name: "Stygium ore", kind: KIND.RESOURCE, stack: 200, color: "#7c8190" },
  unobtanium:    { name: "Unobtanium", kind: KIND.RESOURCE, stack: 200, color: "#a45ff0" },

  // ---- minerals (mined; each carries a property — see depth-design.md) ----
  basalt:        { name: "Basalt", kind: KIND.RESOURCE, stack: 200, color: "#3a3a40", prop: "insulative" },
  quartz:        { name: "Quartz", kind: KIND.RESOURCE, stack: 200, color: "#d8d2e0", prop: "refractive" },
  cobalt:        { name: "Cobalt", kind: KIND.RESOURCE, stack: 200, color: "#3a5aa0", prop: "magnetic" },
  brimstone:     { name: "Brimstone", kind: KIND.RESOURCE, stack: 200, color: "#b6a23a", prop: "reactive" },
  galena:        { name: "Galena", kind: KIND.RESOURCE, stack: 200, color: "#5a5a66", prop: "dense" },
  quicksilver:   { name: "Quicksilver", kind: KIND.RESOURCE, stack: 100, color: "#c0c4cc", prop: "liquid-conductive" },
  niter:         { name: "Niter", kind: KIND.RESOURCE, stack: 200, color: "#e6e0c0", prop: "oxidizer" },

  // ---- organics (farmed / decomposed) ----
  silk:          { name: "Raw silk", kind: KIND.RESOURCE, stack: 200, color: "#e8e2cf" },
  spores:        { name: "Spores", kind: KIND.RESOURCE, stack: 200, color: "#7ad0a0" },
  leather:       { name: "Leather", kind: KIND.RESOURCE, stack: 200, color: "#8a5a3a" },
  bone:          { name: "Bone", kind: KIND.RESOURCE, stack: 200, color: "#ddd6c0" },
  seeds:         { name: "Seeds", kind: KIND.RESOURCE, stack: 200, color: "#9a8a4a" },
  grain:         { name: "Grain", kind: KIND.RESOURCE, stack: 200, color: "#c2a85a" },
  meat:          { name: "Meat", kind: KIND.RESOURCE, stack: 200, color: "#a4503a" },
  egg:           { name: "Egg", kind: KIND.RESOURCE, stack: 200, color: "#efe6d0" },
  milk:          { name: "Milk", kind: KIND.RESOURCE, stack: 200, color: "#f0f0e8" },

  // ---- intermediates ----
  plank:         { name: "Plank", kind: KIND.INTERMEDIATE, stack: 200, color: "#8a6536" },
  electrum_ingot:{ name: "Electrum ingot", kind: KIND.INTERMEDIATE, stack: 200, color: "#e0cf6a" },
  electrum_plate:{ name: "Electrum plate", kind: KIND.INTERMEDIATE, stack: 200, color: "#cabf66" },
  wire:          { name: "Wire", kind: KIND.INTERMEDIATE, stack: 200, color: "#b07a3a" },
  concrete_block:{ name: "Concrete block", kind: KIND.INTERMEDIATE, stack: 200, color: "#7a7870" },
  wooden_gear:   { name: "Wooden gear", kind: KIND.INTERMEDIATE, stack: 200, color: "#7a5a30" },
  machine_frame: { name: "Machine frame", kind: KIND.INTERMEDIATE, stack: 100, color: "#9a8a5a" },
  stygian_powder:{ name: "Stygian powder", kind: KIND.INTERMEDIATE, stack: 200, color: "#4a4658" },

  // ---- mid era: stygian iron chain (industrial) ----
  stygian_iron:  { name: "Stygian iron", kind: KIND.INTERMEDIATE, stack: 200, color: "#6a5f86" },
  stygian_plate: { name: "Stygian plate", kind: KIND.INTERMEDIATE, stack: 200, color: "#7a6f96" },
  stygian_gear:  { name: "Stygian gear", kind: KIND.INTERMEDIATE, stack: 200, color: "#5a5276" },
  circuit_board: { name: "Circuit board", kind: KIND.INTERMEDIATE, stack: 200, color: "#2f6a4a" },
  advanced_frame:{ name: "Advanced frame", kind: KIND.INTERMEDIATE, stack: 100, color: "#8a7faa" },
  ammo:          { name: "Ammo", kind: KIND.INTERMEDIATE, stack: 200, color: "#b8945a" },
  electrum_dust: { name: "Electrum dust", kind: KIND.INTERMEDIATE, stack: 200, color: "#c9b86a" },
  // alchemy / processed minerals
  black_sulfur:  { name: "Black sulfur", kind: KIND.INTERMEDIATE, stack: 200, color: "#2a2630", prop: "combustive" },
  acid:          { name: "Acid", kind: KIND.INTERMEDIATE, stack: 100, color: "#9ad24a", prop: "reactive" },
  magnetiron:    { name: "Magnetiron", kind: KIND.INTERMEDIATE, stack: 200, color: "#4a4a6a", prop: "magnetic" },
  stygian_steel: { name: "Stygian steel", kind: KIND.INTERMEDIATE, stack: 200, color: "#54506a" },
  pigment:       { name: "Pigment", kind: KIND.INTERMEDIATE, stack: 200, color: "#c05a8a" },
  tonic:         { name: "Tonic", kind: KIND.INTERMEDIATE, stack: 50, color: "#5ad0b0" },
  amalgam:       { name: "Amalgam", kind: KIND.INTERMEDIATE, stack: 100, color: "#aab0bc" },
  // machine modules — slot into a machine to specialize it
  speed_module:  { name: "Speed module", kind: KIND.INTERMEDIATE, stack: 50, color: "#d86a6a", module: { speed: 0.5 } },
  efficiency_module: { name: "Efficiency module", kind: KIND.INTERMEDIATE, stack: 50, color: "#6ad88a", module: { eff: 0.3 } },
  productivity_module: { name: "Productivity module", kind: KIND.INTERMEDIATE, stack: 50, color: "#c06ad8", module: { prod: 0.25 } },
  // kiln / mill products
  glass:         { name: "Glass", kind: KIND.INTERMEDIATE, stack: 200, color: "#bfe0e6" },
  brick:         { name: "Brick", kind: KIND.INTERMEDIATE, stack: 200, color: "#9a5a44" },
  charcoal:      { name: "Charcoal", kind: KIND.INTERMEDIATE, stack: 200, color: "#2c2c2c", prop: "fuel" },
  gravel:        { name: "Gravel", kind: KIND.INTERMEDIATE, stack: 200, color: "#7a7870" },
  sand:          { name: "Sand", kind: KIND.INTERMEDIATE, stack: 200, color: "#d8c890" },
  lens:          { name: "Lens", kind: KIND.INTERMEDIATE, stack: 200, color: "#cfeaf0" },
  motor:         { name: "Motor", kind: KIND.INTERMEDIATE, stack: 100, color: "#5a5a72" },
  foldglass:     { name: "Foldglass", kind: KIND.INTERMEDIATE, stack: 100, color: "#b0e0d8", prop: "volatile" },
  basalt_block:  { name: "Basalt block", kind: KIND.INTERMEDIATE, stack: 200, color: "#34343a" },
  superconductor:{ name: "Superconductor", kind: KIND.INTERMEDIATE, stack: 100, color: "#9ad8ff", prop: "superconductive" },
  // schematics (found loot) — picking one up unlocks its alternate recipe
  schem_cast_plate:    { name: "Schematic: cast plate", kind: KIND.RESOURCE, stack: 20, color: "#cfe0a0", schematic: true },
  schem_fast_wire:     { name: "Schematic: wire die", kind: KIND.RESOURCE, stack: 20, color: "#cfe0a0", schematic: true },
  schem_drum_mag:      { name: "Schematic: drum mag", kind: KIND.RESOURCE, stack: 20, color: "#cfe0a0", schematic: true },
  schem_superconductor:{ name: "Schematic: superconductor", kind: KIND.RESOURCE, stack: 20, color: "#cfe0a0", schematic: true },
  // textiles & food
  silk_thread:   { name: "Silk thread", kind: KIND.INTERMEDIATE, stack: 200, color: "#efe9d8" },
  silk_cloth:    { name: "Silk cloth", kind: KIND.INTERMEDIATE, stack: 200, color: "#f2eddf" },
  rope:          { name: "Rope", kind: KIND.INTERMEDIATE, stack: 200, color: "#b8a878" },
  compost:       { name: "Compost", kind: KIND.INTERMEDIATE, stack: 200, color: "#5a4a30" },
  flour:         { name: "Flour", kind: KIND.INTERMEDIATE, stack: 200, color: "#e6dcc0" },
  dough:         { name: "Dough", kind: KIND.INTERMEDIATE, stack: 200, color: "#d8c89a" },
  bread:         { name: "Bread", kind: KIND.INTERMEDIATE, stack: 200, color: "#b88a4a" },
  // found objects (scavenged — usable and/or dismantle into the above)
  adhesive:      { name: "Adhesive", kind: KIND.RESOURCE, stack: 200, color: "#ccc0a0" },
  battery:       { name: "Battery", kind: KIND.RESOURCE, stack: 100, color: "#3a8a5a" },
  keys:          { name: "Keys", kind: KIND.RESOURCE, stack: 100, color: "#d8c060" },
  flashlight:    { name: "Flashlight", kind: KIND.BUILDABLE, stack: 5, w: 1, h: 1, color: "#d8d060", light: 5 },

  // ---- tools (equippable) ----
  wooden_pick:   { name: "Wooden pickaxe", kind: KIND.TOOL, stack: 1 },
  axe:           { name: "Axe", kind: KIND.TOOL, stack: 1 },
  crowbar:       { name: "Crowbar", kind: KIND.TOOL, stack: 1 },
  electrum_pick: { name: "Electrum pickaxe", kind: KIND.TOOL, stack: 1 },
  electrum_axe:  { name: "Electrum axe", kind: KIND.TOOL, stack: 1 },
  electrum_blade:{ name: "Electrum blade", kind: KIND.TOOL, stack: 1 },
  musket:        { name: "Musket", kind: KIND.TOOL, stack: 1 },
  // mid-era stygian tools + the rifle
  stygian_pick:  { name: "Stygian pickaxe", kind: KIND.TOOL, stack: 1 },
  stygian_axe:   { name: "Stygian axe", kind: KIND.TOOL, stack: 1 },
  stygian_blade: { name: "Stygian blade", kind: KIND.TOOL, stack: 1 },
  rifle:         { name: "Rifle", kind: KIND.TOOL, stack: 1 },
  fire_axe:      { name: "Fire axe", kind: KIND.TOOL, stack: 1 }, // found, not crafted

  // ---- buildables ----
  // `draw` = power units consumed when running; `supply` = power produced.
  workbench:     { name: "Workbench", kind: KIND.BUILDABLE, stack: 50, w: 2, h: 1, color: "#6b4a2b" },
  concrete_forge:{ name: "Concrete forge", kind: KIND.BUILDABLE, stack: 50, w: 2, h: 2, color: "#5a5550", machine: "forge" },
  crusher:       { name: "Crusher", kind: KIND.BUILDABLE, stack: 50, w: 2, h: 2, color: "#54545a", machine: "crusher", draw: 4 },
  assembler:     { name: "Assembler", kind: KIND.BUILDABLE, stack: 50, w: 2, h: 2, color: "#4a5a6a", machine: "assembler", draw: 5 },
  wood_generator:{ name: "Wood generator", kind: KIND.BUILDABLE, stack: 50, w: 2, h: 2, color: "#6e4d2c", machine: "generator", supply: 10, burns: "fuel" },
  // mid-era industrial machines (grid-powered)
  stygian_forge: { name: "Stygian forge", kind: KIND.BUILDABLE, stack: 50, w: 2, h: 2, color: "#4a4458", machine: "styforge", draw: 6 },
  stygian_assembler: { name: "Stygian assembler", kind: KIND.BUILDABLE, stack: 50, w: 2, h: 2, color: "#3f4a5a", machine: "styassembler", draw: 8 },
  powder_generator: { name: "Powder generator", kind: KIND.BUILDABLE, stack: 50, w: 2, h: 2, color: "#54506a", machine: "generator", supply: 35, burns: "stygian_powder" },
  turret:        { name: "Auto-turret", kind: KIND.BUILDABLE, stack: 30, w: 1, h: 1, color: "#5a5266", machine: "turret", draw: 3 },
  stygian_wall:  { name: "Stygian wall", kind: KIND.BUILDABLE, stack: 100, w: 1, h: 1, color: "#5a5470" },
  basalt_wall:   { name: "Basalt wall", kind: KIND.BUILDABLE, stack: 100, w: 1, h: 1, color: "#2e2e34" },
  window:        { name: "Window", kind: KIND.BUILDABLE, stack: 100, w: 1, h: 1, color: "#bfe0e6" },
  // recipe-select factories (combine inputs; show the chosen recipe)
  cauldron:      { name: "Alchemy cauldron", kind: KIND.BUILDABLE, stack: 30, w: 2, h: 2, color: "#3a3030", machine: "cauldron", draw: 4 },
  crucible:      { name: "Metal crucible", kind: KIND.BUILDABLE, stack: 30, w: 2, h: 2, color: "#5a3a2a", machine: "crucible", draw: 6 },
  loom:          { name: "Loom", kind: KIND.BUILDABLE, stack: 30, w: 2, h: 2, color: "#7a6a4a", machine: "loom", draw: 2 },
  stygian_belt:  { name: "Stygian belt", kind: KIND.BUILDABLE, stack: 200, w: 1, h: 1, color: "#46465a", logi: "belt", speed: 3.0 },
  stygian_arm:   { name: "Stygian arm", kind: KIND.BUILDABLE, stack: 100, w: 1, h: 1, color: "#5a4a6a", logi: "arm", draw: 2, fast: true },
  chest:         { name: "Chest", kind: KIND.BUILDABLE, stack: 50, w: 1, h: 1, color: "#7a5a36", machine: "chest" },
  crate:         { name: "Crate", kind: KIND.BUILDABLE, stack: 50, w: 1, h: 1, color: "#6a4a2a", machine: "chest" },

  // logistics — belts/arms are walkable (not solid)
  belt:          { name: "Belt", kind: KIND.BUILDABLE, stack: 200, w: 1, h: 1, color: "#3a3a40", logi: "belt" },
  arm:           { name: "Automator arm", kind: KIND.BUILDABLE, stack: 100, w: 1, h: 1, color: "#5a4a3a", logi: "arm", draw: 1 },

  // belt-mounted processors — sit ON a belt, transform whatever passes (not recipe-specific)
  smelter:       { name: "Smelter", kind: KIND.BUILDABLE, stack: 50, w: 1, h: 1, color: "#7a4a3a", process: "smelt", beltMount: true, draw: 3, rate: 1.2 },
  presser:       { name: "Presser", kind: KIND.BUILDABLE, stack: 50, w: 1, h: 1, color: "#5a5a64", process: "press", beltMount: true, draw: 3, rate: 1.0 },
  mill:          { name: "Mill", kind: KIND.BUILDABLE, stack: 50, w: 1, h: 1, color: "#6a6a72", process: "crush", beltMount: true, draw: 3, rate: 1.0 },
  washer:        { name: "Washer", kind: KIND.BUILDABLE, stack: 50, w: 1, h: 1, color: "#4a6a7a", process: "wash", beltMount: true, draw: 2, rate: 1.0 },

  concrete_wall: { name: "Concrete wall", kind: KIND.BUILDABLE, stack: 100, w: 1, h: 1, color: "#7a7870" },
  wooden_door:   { name: "Wooden door", kind: KIND.BUILDABLE, stack: 50, w: 1, h: 1, color: "#8a6536" },
  power_pole:    { name: "Power pole", kind: KIND.BUILDABLE, stack: 50, w: 1, h: 1, color: "#7a6a4a" },
  torch:         { name: "Torch", kind: KIND.BUILDABLE, stack: 50, w: 1, h: 1, color: "#caa23a", light: 4 },
  lantern:       { name: "Lantern", kind: KIND.BUILDABLE, stack: 20, w: 1, h: 1, color: "#e0b24a", light: 6 },
  bedroll:       { name: "Bedroll", kind: KIND.BUILDABLE, stack: 5, w: 1, h: 2, color: "#7a5a5a" },
  tinker_bench:  { name: "Tinker bench", kind: KIND.BUILDABLE, stack: 20, w: 2, h: 1, color: "#6a5a7a" },
  // base-building cozy layer (apply to built walls / floors — placement-special)
  wallpaper:     { name: "Wallpaper", kind: KIND.BUILDABLE, stack: 200, w: 1, h: 1, color: "#c9b86a", surface: "wall" },
  floor_tile:    { name: "Floor tiling", kind: KIND.BUILDABLE, stack: 200, w: 1, h: 1, color: "#9aa0a6", surface: "floor" },
  animal_pen:    { name: "Animal pen", kind: KIND.BUILDABLE, stack: 20, w: 2, h: 2, color: "#7a6a44", machine: "pen" },

  // ---- weapons / ammo as items (modular + thrown + bow) ----
  bow:           { name: "Bow", kind: KIND.TOOL, stack: 1, ranged: true, bow: true },
  crossbow:      { name: "Crossbow", kind: KIND.TOOL, stack: 1, ranged: true, bow: true },
  bladed_yoyo:   { name: "Bladed yo-yo", kind: KIND.TOOL, stack: 1 },
  arrow:         { name: "Arrow", kind: KIND.INTERMEDIATE, stack: 200, color: "#b8a878" },
  grenade:       { name: "Grenade", kind: KIND.INTERMEDIATE, stack: 50, color: "#5a6a4a" },
  molotov:       { name: "Molotov", kind: KIND.INTERMEDIATE, stack: 50, color: "#b8643a" },
  lead_ball:     { name: "Lead ball", kind: KIND.INTERMEDIATE, stack: 200, color: "#5a5a66" },

  // ===== TRINKETS & ARMOR (equip in a slot for an EFFECT; no durability) =====
  // slot: head|goggles|neck|chest|legs|shoes|back|gloves|free
  // armor (head/chest/legs/shoes)
  hard_hat:      { name: "Hard hat", kind: KIND.TRINKET, slot: "head", stack: 1, color: "#d8c000", effect: { defense: 2 } },
  riot_helm:     { name: "Riot helm", kind: KIND.TRINKET, slot: "head", stack: 1, color: "#3a4654", effect: { defense: 5 } },
  kevlar_vest:   { name: "Kevlar vest", kind: KIND.TRINKET, slot: "chest", stack: 1, color: "#3a3f34", effect: { defense: 6 } },
  galena_plate_armor: { name: "Galena plate", kind: KIND.TRINKET, slot: "chest", stack: 1, color: "#5a5a66", effect: { defense: 12, move: -0.12 } },
  featherweave:  { name: "Featherweave", kind: KIND.TRINKET, slot: "chest", stack: 1, color: "#cfc7e0", effect: { move: 0.12, melee: 2 } },
  brace_leggings:{ name: "Brace leggings", kind: KIND.TRINKET, slot: "legs", stack: 1, color: "#5a5240", effect: { defense: 3 } },
  // goggles
  cracked_glasses:{ name: "Cracked glasses", kind: KIND.TRINKET, slot: "goggles", stack: 1, color: "#bfe0e6", effect: { vision: 2 } },
  fold_goggles:  { name: "Fold goggles", kind: KIND.TRINKET, slot: "goggles", stack: 1, color: "#b0e0d8", effect: { vision: 4 } },
  weakpoint_visor:{ name: "Weakpoint visor", kind: KIND.TRINKET, slot: "goggles", stack: 1, color: "#e05a5a", effect: { melee: 2 } },
  // neck
  regen_amulet:  { name: "Regen amulet", kind: KIND.TRINKET, slot: "neck", stack: 1, color: "#5ad0a0", effect: { regen: 1.5 } },
  fortune_charm: { name: "Fortune charm", kind: KIND.TRINKET, slot: "neck", stack: 1, color: "#d8c060", effect: { luck: 0.25 } },
  almond_pendant:{ name: "Almond-water heart", kind: KIND.TRINKET, slot: "neck", stack: 1, color: "#8fb6a4", effect: { maxhp: 40 } },
  // shoes
  worn_sneakers: { name: "Worn sneakers", kind: KIND.TRINKET, slot: "shoes", stack: 1, color: "#cfcfc0", effect: { move: 0.12 } },
  sprint_boots:  { name: "Sprint boots", kind: KIND.TRINKET, slot: "shoes", stack: 1, color: "#d8a040", effect: { move: 0.3 } },
  hover_boots:   { name: "Hover boots", kind: KIND.TRINKET, slot: "shoes", stack: 1, color: "#a0d8ff", effect: { move: 0.35 } },
  ghost_step:    { name: "Ghost step", kind: KIND.TRINKET, slot: "shoes", stack: 1, color: "#8a8aa0", effect: { move: 0.18, noise: -1 } },
  // gloves
  power_fist:    { name: "Power fist", kind: KIND.TRINKET, slot: "gloves", stack: 1, color: "#7a5a3a", effect: { melee: 4 } },
  powered_gauntlet:{ name: "Powered gauntlet", kind: KIND.TRINKET, slot: "gloves", stack: 1, color: "#5a6a7a", effect: { mineSpeed: 0.5 } },
  tractor_glove: { name: "Tractor glove", kind: KIND.TRINKET, slot: "gloves", stack: 1, color: "#6a7a5a", effect: { pickup: 3 } },
  // back
  backpack:      { name: "Backpack", kind: KIND.TRINKET, slot: "back", stack: 1, color: "#6a4a2a", effect: { carry: 1 } },
  wings:         { name: "Wings", kind: KIND.TRINKET, slot: "back", stack: 1, color: "#e0e0f0", effect: { move: 0.25, fly: 1 } },
  quiver:        { name: "Quiver", kind: KIND.TRINKET, slot: "back", stack: 1, color: "#8a6a3a", effect: {} },
  grenade_bandolier:{ name: "Grenade bandolier", kind: KIND.TRINKET, slot: "back", stack: 1, color: "#5a6a4a", effect: {} },
  oxygen_tank:   { name: "Oxygen tank", kind: KIND.TRINKET, slot: "back", stack: 1, color: "#7aa0c0", effect: {} },
  headlamp:      { name: "Headlamp", kind: KIND.TRINKET, slot: "goggles", stack: 1, color: "#e8e060", effect: { light: 3, vision: 1 } },
  // free / pocket devices + charms
  the_phone:     { name: "The Phone", kind: KIND.TRINKET, slot: "free", stack: 1, color: "#202028", effect: { vision: 3, light: 1, foldradar: 1 } },
  walkman:       { name: "Walkman", kind: KIND.TRINKET, slot: "free", stack: 1, color: "#444", effect: {} },
  lucky_penny:   { name: "Lucky penny", kind: KIND.TRINKET, slot: "free", stack: 1, color: "#b87333", effect: { luck: 0.1 } },
  rabbits_foot:  { name: "Rabbit's foot", kind: KIND.TRINKET, slot: "free", stack: 1, color: "#d8d0c0", effect: { luck: 0.15 } },
  anomalous_marble:{ name: "Anomalous marble", kind: KIND.TRINKET, slot: "free", stack: 1, color: "#a45ff0", effect: { blink: 1 } },
  // ---- capstone trinkets (tinker-merge endpoints) ----
  storm_boots:   { name: "Storm boots", kind: KIND.TRINKET, slot: "shoes", stack: 1, color: "#6ad0ff", effect: { move: 0.4 } },
  blink_boots:   { name: "Blink boots", kind: KIND.TRINKET, slot: "shoes", stack: 1, color: "#b06aff", effect: { move: 0.3, blink: 1 } },
  jetpack:       { name: "Jetpack", kind: KIND.TRINKET, slot: "back", stack: 1, color: "#c0c0d0", effect: { move: 0.2, fly: 1 } },
  scanner:       { name: "Scanner", kind: KIND.TRINKET, slot: "free", stack: 1, color: "#2a4a3a", effect: { vision: 3, foldradar: 1 } },
  war_rig:       { name: "War rig", kind: KIND.TRINKET, slot: "chest", stack: 1, color: "#5a2a2a", effect: { defense: 8, melee: 4 } },
  hazard_suit:   { name: "Hazard suit", kind: KIND.TRINKET, slot: "chest", stack: 1, color: "#c0a030", effect: { defense: 8, fireimmune: 1 } },
  survivors_rig: { name: "Survivor's rig", kind: KIND.TRINKET, slot: "chest", stack: 1, color: "#3a5a3a", effect: { defense: 10, regen: 1.5 } },
  reapers_cloak: { name: "Reaper's cloak", kind: KIND.TRINKET, slot: "back", stack: 1, color: "#2a2230", effect: { move: 0.2, noise: -2 } },
  glow_moth_charm:{ name: "Glow-moth charm", kind: KIND.TRINKET, slot: "neck", stack: 1, color: "#9ad0a0", effect: { light: 2 } },
  diving_suit:   { name: "Diving suit", kind: KIND.TRINKET, slot: "back", stack: 1, color: "#3a6a8a", effect: { defense: 4 } },
  shock_baton:   { name: "Shock baton", kind: KIND.TOOL, stack: 1 },
};

export const itemName = (id) => (ITEMS[id] ? ITEMS[id].name : id);
export const itemKind = (id) => (ITEMS[id] ? ITEMS[id].kind : null);
export const isBuildable = (id) => itemKind(id) === KIND.BUILDABLE;
export const isTool = (id) => itemKind(id) === KIND.TOOL;
export const isTrinket = (id) => itemKind(id) === KIND.TRINKET;
export const trinketSlot = (id) => (ITEMS[id] ? ITEMS[id].slot : null);
export const itemEffect = (id) => (ITEMS[id] && ITEMS[id].effect) || {};
export const isModule = (id) => !!(ITEMS[id] && ITEMS[id].module);
export const moduleStats = (id) => (ITEMS[id] && ITEMS[id].module) || {};
