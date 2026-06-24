// sim/recipes.js — the one data-driven recipe table everything reads from.
//
// CRAFT recipes are made by the player from the craft menu; station "hand" is
// always available, "workbench" needs a workbench placed in the current room.
// MACHINE recipes are processed automatically by a hand-fed machine over time.

// { id, out:[item,n], in:[[item,n]...], station }
export const RECIPES = [
  // --- hand ---
  { id: "plank", out: ["plank", 1], in: [["wood", 1]], station: "hand" },
  { id: "string", out: ["string", 2], in: [["fabric", 1]], station: "hand" },
  { id: "wooden_pick", out: ["wooden_pick", 1], in: [["plank", 3]], station: "hand" },
  { id: "axe", out: ["axe", 1], in: [["plank", 2], ["scrap", 1]], station: "hand" },
  { id: "crowbar", out: ["crowbar", 1], in: [["scrap", 2]], station: "hand" },
  { id: "torch", out: ["torch", 1], in: [["plank", 1], ["fabric", 1]], station: "hand" },
  { id: "lantern", out: ["lantern", 1], in: [["scrap", 2], ["fuel", 2]], station: "hand" },
  { id: "chest", out: ["chest", 1], in: [["plank", 4]], station: "hand" },
  { id: "belt", out: ["belt", 2], in: [["scrap", 1]], station: "hand" },
  { id: "bedroll", out: ["bedroll", 1], in: [["fabric", 3]], station: "hand" },
  { id: "workbench", out: ["workbench", 1], in: [["plank", 4], ["scrap", 1]], station: "hand" },

  // --- workbench ---
  { id: "wooden_gear", out: ["wooden_gear", 1], in: [["plank", 2]], station: "workbench" },
  { id: "concrete_block", out: ["concrete_block", 1], in: [["concrete", 2]], station: "workbench" },
  { id: "electrum_plate", out: ["electrum_plate", 1], in: [["electrum_ingot", 1]], station: "workbench" },
  { id: "wire", out: ["wire", 2], in: [["electrum_ingot", 1]], station: "workbench" },
  { id: "machine_frame", out: ["machine_frame", 1], in: [["plank", 2], ["wooden_gear", 2], ["electrum_plate", 1]], station: "workbench" },
  { id: "concrete_wall", out: ["concrete_wall", 2], in: [["concrete_block", 2]], station: "workbench" },
  { id: "wooden_door", out: ["wooden_door", 1], in: [["plank", 3]], station: "workbench" },
  { id: "crate", out: ["crate", 1], in: [["plank", 6], ["scrap", 2]], station: "workbench" },
  { id: "arm", out: ["arm", 1], in: [["scrap", 2], ["wooden_gear", 1]], station: "workbench" },
  { id: "power_pole", out: ["power_pole", 2], in: [["plank", 2], ["wire", 1]], station: "workbench" },
  { id: "electrum_pick", out: ["electrum_pick", 1], in: [["electrum_plate", 2], ["plank", 1]], station: "workbench" },
  { id: "electrum_axe", out: ["electrum_axe", 1], in: [["electrum_plate", 2], ["plank", 1]], station: "workbench" },
  { id: "electrum_blade", out: ["electrum_blade", 1], in: [["electrum_plate", 2], ["scrap", 1]], station: "workbench" },
  // the FIRST smelter — must be buildable WITHOUT electrum (it's what makes electrum ingots)
  { id: "concrete_forge", out: ["concrete_forge", 1], in: [["concrete_block", 6], ["scrap", 2]], station: "workbench" },
  { id: "crusher", out: ["crusher", 1], in: [["machine_frame", 1], ["scrap", 4]], station: "workbench" },
  { id: "assembler", out: ["assembler", 1], in: [["machine_frame", 2], ["wire", 2]], station: "workbench" },
  { id: "wood_generator", out: ["wood_generator", 1], in: [["machine_frame", 1], ["plank", 4]], station: "workbench" },
  { id: "musket", out: ["musket", 1], in: [["machine_frame", 1], ["electrum_plate", 2], ["wooden_gear", 1]], station: "workbench" },

  // belt-mounted processors (the core automation — place on belts)
  { id: "smelter", out: ["smelter", 1], in: [["machine_frame", 1], ["concrete_block", 2]], station: "workbench" },
  { id: "presser", out: ["presser", 1], in: [["machine_frame", 1], ["electrum_plate", 2]], station: "workbench" },
  { id: "mill", out: ["mill", 1], in: [["machine_frame", 1], ["electrum_plate", 1]], station: "workbench" },
  { id: "washer", out: ["washer", 1], in: [["machine_frame", 1], ["wire", 2]], station: "workbench" },

  // ===== MID ERA — industrial stygian (unlocked once you have stygian powder) =====
  { id: "stygian_forge", out: ["stygian_forge", 1], in: [["machine_frame", 1], ["stygian_powder", 4], ["concrete_block", 4]], station: "workbench" },
  { id: "stygian_plate", out: ["stygian_plate", 1], in: [["stygian_iron", 1]], station: "workbench" },
  { id: "stygian_gear", out: ["stygian_gear", 1], in: [["stygian_iron", 1], ["wooden_gear", 1]], station: "workbench" },
  { id: "circuit_board", out: ["circuit_board", 1], in: [["wire", 2], ["stygian_plate", 1]], station: "workbench" },
  { id: "advanced_frame", out: ["advanced_frame", 1], in: [["machine_frame", 1], ["stygian_plate", 2], ["stygian_gear", 2]], station: "workbench" },
  { id: "ammo", out: ["ammo", 4], in: [["stygian_plate", 1], ["stygian_powder", 2]], station: "workbench" },
  { id: "stygian_assembler", out: ["stygian_assembler", 1], in: [["advanced_frame", 2], ["circuit_board", 2]], station: "workbench" },
  { id: "powder_generator", out: ["powder_generator", 1], in: [["advanced_frame", 1], ["stygian_plate", 2]], station: "workbench" },
  { id: "turret", out: ["turret", 1], in: [["advanced_frame", 1], ["stygian_plate", 2], ["circuit_board", 1]], station: "workbench" },
  { id: "rifle", out: ["rifle", 1], in: [["advanced_frame", 1], ["stygian_plate", 2], ["circuit_board", 1]], station: "workbench" },
  { id: "stygian_pick", out: ["stygian_pick", 1], in: [["stygian_plate", 2], ["plank", 1]], station: "workbench" },
  { id: "stygian_axe", out: ["stygian_axe", 1], in: [["stygian_plate", 2], ["plank", 1]], station: "workbench" },
  { id: "stygian_blade", out: ["stygian_blade", 1], in: [["stygian_plate", 2], ["scrap", 1]], station: "workbench" },
  { id: "stygian_wall", out: ["stygian_wall", 2], in: [["stygian_plate", 2]], station: "workbench" },
  { id: "stygian_belt", out: ["stygian_belt", 2], in: [["stygian_plate", 1]], station: "workbench" },
  { id: "stygian_arm", out: ["stygian_arm", 1], in: [["stygian_plate", 2], ["stygian_gear", 1]], station: "workbench" },

  // recipe-select factories
  { id: "cauldron", out: ["cauldron", 1], in: [["brick", 6], ["stygian_plate", 2]], station: "workbench" },
  { id: "crucible", out: ["crucible", 1], in: [["brick", 8], ["machine_frame", 1]], station: "workbench" },
  { id: "loom", out: ["loom", 1], in: [["plank", 4], ["wooden_gear", 2]], station: "workbench" },

  // stone / glass line (basalt = structural+insulative, quartz = glass+optics)
  { id: "basalt_block", out: ["basalt_block", 1], in: [["basalt", 2]], station: "workbench" },
  { id: "basalt_wall", out: ["basalt_wall", 2], in: [["basalt_block", 2]], station: "workbench" },
  { id: "brick", out: ["brick", 2], in: [["gravel", 2]], station: "workbench" },
  { id: "window", out: ["window", 2], in: [["glass", 1]], station: "workbench" },
  { id: "lens", out: ["lens", 1], in: [["glass", 2]], station: "workbench" },

  // alloys & motors (magnetiron → motor → the moving layer)
  { id: "motor", out: ["motor", 1], in: [["magnetiron", 1], ["wire", 2]], station: "workbench" },

  // textiles & food (hand fallbacks; the loom automates the silk steps)
  { id: "dough", out: ["dough", 1], in: [["flour", 2], ["almond_water", 1]], station: "hand" },
  { id: "silk_thread", out: ["silk_thread", 1], in: [["silk", 1]], station: "hand" },
  { id: "silk_cloth", out: ["silk_cloth", 1], in: [["silk_thread", 2]], station: "workbench" },
  { id: "silk_rope", out: ["rope", 2], in: [["silk_thread", 3]], station: "workbench" },

  // late: foldglass (refractive + volatile) — cut quartz with unobtanium
  { id: "foldglass", out: ["foldglass", 1], in: [["lens", 1], ["unobtanium", 1]], station: "workbench" },

  // ===== stations & weapons =====
  { id: "tinker_bench", out: ["tinker_bench", 1], in: [["plank", 4], ["scrap", 2], ["wire", 1]], station: "workbench" },
  { id: "wallpaper", out: ["wallpaper", 4], in: [["fabric", 1], ["adhesive", 1]], station: "hand" },
  { id: "floor_tile", out: ["floor_tile", 4], in: [["gravel", 1], ["concrete", 1]], station: "hand" },
  { id: "animal_pen", out: ["animal_pen", 1], in: [["plank", 6], ["wire", 2]], station: "workbench" },
  { id: "bow", out: ["bow", 1], in: [["plank", 2], ["string", 2]], station: "workbench" },
  { id: "crossbow", out: ["crossbow", 1], in: [["plank", 2], ["stygian_plate", 1], ["string", 2]], station: "workbench" },
  { id: "arrow", out: ["arrow", 8], in: [["wood", 1], ["scrap", 1]], station: "workbench" },
  { id: "lead_ball", out: ["lead_ball", 4], in: [["galena", 1]], station: "workbench" },
  { id: "grenade", out: ["grenade", 2], in: [["black_sulfur", 1], ["scrap", 1]], station: "workbench" },

  // ===== TINKER (needs a tinker bench) — refine duplicates / merge different =====
  // refine: fuse duplicates into a stronger version
  { id: "swift_sneakers", out: ["sprint_boots", 1], in: [["worn_sneakers", 2]], station: "tinker" },
  // merge: combine effects into cooler gear
  { id: "hover_boots", out: ["hover_boots", 1], in: [["sprint_boots", 1], ["battery", 1]], station: "tinker" },
  { id: "ghost_step", out: ["ghost_step", 1], in: [["worn_sneakers", 1], ["fabric", 2]], station: "tinker" },
  { id: "fold_goggles", out: ["fold_goggles", 1], in: [["cracked_glasses", 1], ["foldglass", 1]], station: "tinker" },
  { id: "the_phone", out: ["the_phone", 1], in: [["walkman", 1], ["cracked_glasses", 1], ["circuit_board", 1], ["battery", 1]], station: "tinker" },
  { id: "walkman", out: ["walkman", 1], in: [["battery", 1], ["wire", 1], ["plastic", 1]], station: "tinker" },
  { id: "power_fist", out: ["power_fist", 1], in: [["magnetiron", 1], ["leather", 1]], station: "tinker" },
  { id: "powered_gauntlet", out: ["powered_gauntlet", 1], in: [["motor", 1], ["battery", 1]], station: "tinker" },
  { id: "tractor_glove", out: ["tractor_glove", 1], in: [["magnetiron", 1], ["wire", 2]], station: "tinker" },
  { id: "regen_amulet", out: ["regen_amulet", 1], in: [["almond_water", 4], ["wire", 1]], station: "tinker" },
  { id: "fortune_charm", out: ["fortune_charm", 1], in: [["lucky_penny", 1], ["rabbits_foot", 1]], station: "tinker" },
  { id: "bladed_yoyo", out: ["bladed_yoyo", 1], in: [["string", 2], ["electrum_blade", 1]], station: "tinker" },
  { id: "molotov", out: ["molotov", 2], in: [["fuel", 1], ["fabric", 1]], station: "tinker" },
  { id: "kevlar_vest", out: ["kevlar_vest", 1], in: [["fabric", 4], ["stygian_plate", 1]], station: "tinker" },
  { id: "galena_plate_armor", out: ["galena_plate_armor", 1], in: [["galena", 4], ["stygian_plate", 2]], station: "tinker" },
  { id: "backpack", out: ["backpack", 1], in: [["fabric", 4], ["string", 2]], station: "tinker" },
  { id: "quiver", out: ["quiver", 1], in: [["leather", 2], ["string", 1]], station: "tinker" },
  { id: "grenade_bandolier", out: ["grenade_bandolier", 1], in: [["leather", 2], ["fabric", 2]], station: "tinker" },
  { id: "oxygen_tank", out: ["oxygen_tank", 1], in: [["galena", 1], ["wire", 2], ["glass", 1]], station: "tinker" },

  // --- tinker capstone merges (the deep endpoints) ---
  { id: "storm_boots", out: ["storm_boots", 1], in: [["hover_boots", 1], ["ghost_step", 1]], station: "tinker" },
  { id: "blink_boots", out: ["blink_boots", 1], in: [["sprint_boots", 1], ["anomalous_marble", 1]], station: "tinker" },
  { id: "jetpack", out: ["jetpack", 1], in: [["oxygen_tank", 1], ["motor", 1], ["black_sulfur", 2]], station: "tinker" },
  { id: "wings", out: ["wings", 1], in: [["hover_boots", 1], ["silk_cloth", 4], ["foldglass", 1]], station: "tinker" },
  { id: "scanner", out: ["scanner", 1], in: [["fold_goggles", 1], ["circuit_board", 1]], station: "tinker" },
  { id: "war_rig", out: ["war_rig", 1], in: [["power_fist", 1], ["kevlar_vest", 1], ["circuit_board", 1]], station: "tinker" },
  { id: "hazard_suit", out: ["hazard_suit", 1], in: [["kevlar_vest", 1], ["galena", 2], ["glass", 1]], station: "tinker" },
  { id: "survivors_rig", out: ["survivors_rig", 1], in: [["galena_plate_armor", 1], ["regen_amulet", 1]], station: "tinker" },
  { id: "reapers_cloak", out: ["reapers_cloak", 1], in: [["ghost_step", 1], ["silk_cloth", 3], ["foldglass", 1]], station: "tinker" },
  { id: "glow_moth_charm", out: ["glow_moth_charm", 1], in: [["spores", 2], ["wire", 1]], station: "tinker" },
  { id: "diving_suit", out: ["diving_suit", 1], in: [["oxygen_tank", 1], ["galena_plate_armor", 1]], station: "tinker" },
  { id: "shock_baton", out: ["shock_baton", 1], in: [["magnetiron", 1], ["battery", 1], ["plank", 1]], station: "tinker" },
  { id: "almond_pendant", out: ["almond_pendant", 1], in: [["almond_water", 6], ["wire", 1]], station: "tinker" },
  { id: "weakpoint_visor", out: ["weakpoint_visor", 1], in: [["cracked_glasses", 1], ["lens", 1]], station: "tinker" },
  { id: "headlamp", out: ["headlamp", 1], in: [["flashlight", 1], ["leather", 1]], station: "tinker" },
  { id: "riot_helm", out: ["riot_helm", 1], in: [["hard_hat", 1], ["stygian_plate", 1]], station: "tinker" },
  { id: "featherweave", out: ["featherweave", 1], in: [["silk_cloth", 2], ["foldglass", 1]], station: "tinker" },

  // machine modules (workbench)
  { id: "speed_module", out: ["speed_module", 1], in: [["circuit_board", 1], ["electrum_plate", 1]], station: "workbench" },
  { id: "efficiency_module", out: ["efficiency_module", 1], in: [["circuit_board", 1], ["wire", 2]], station: "workbench" },
  { id: "productivity_module", out: ["productivity_module", 1], in: [["circuit_board", 2], ["stygian_plate", 1]], station: "workbench" },

  // --- alternate recipes unlocked by FOUND SCHEMATICS (better ratios) ---
  { id: "cast_plate", out: ["electrum_plate", 2], in: [["electrum_ingot", 1], ["brick", 1]], station: "workbench", unlockedBy: "schem_cast_plate" },
  { id: "fast_wire", out: ["wire", 4], in: [["electrum_ingot", 1]], station: "workbench", unlockedBy: "schem_fast_wire" },
  { id: "superconductor", out: ["superconductor", 1], in: [["electrum", 1], ["unobtanium", 1]], station: "workbench", unlockedBy: "schem_superconductor" },
];

// machine processing: input items -> output over `time` seconds, optional fuel
export const MACHINE_RECIPES = {
  forge: [
    { in: [["electrum", 1]], out: ["electrum_ingot", 1], time: 2, fuel: 1 },
    { in: [["stygium", 1]], out: ["electrum_ingot", 0] }, // stygium must be crushed first (no forge recipe)
  ].filter((r) => r.out[1] > 0),
  crusher: [
    { in: [["stygium", 1]], out: ["stygian_powder", 2], time: 2 },
  ],
  assembler: [
    { in: [["plank", 2]], out: ["wooden_gear", 1], time: 1.5 },
    { in: [["electrum_ingot", 1]], out: ["wire", 2], time: 1.5 },
  ],
  // mid era: grid-powered industrial machines
  styforge: [
    { in: [["stygium", 1]], out: ["stygian_iron", 1], time: 2 },
  ],
  styassembler: [
    { in: [["stygian_iron", 1]], out: ["stygian_plate", 1], time: 1.4 },
    { in: [["stygian_iron", 1], ["wooden_gear", 1]], out: ["stygian_gear", 1], time: 1.8 },
    { in: [["wire", 2], ["stygian_plate", 1]], out: ["circuit_board", 1], time: 2.4 },
  ],
  // alchemy — transmutation (the cauldron shows the chosen recipe's sign)
  cauldron: [
    { in: [["brimstone", 1], ["stygian_powder", 1]], out: ["black_sulfur", 2], time: 2.5, sign: "🜍" },
    { in: [["brimstone", 1], ["almond_water", 1]], out: ["acid", 1], time: 2, sign: "🜈" },
    { in: [["cobalt", 1], ["charcoal", 1]], out: ["pigment", 2], time: 2, sign: "🜟" },
    { in: [["almond_water", 2], ["heartwood", 1]], out: ["tonic", 1], time: 3, sign: "🜔" },
    { in: [["acid", 1], ["quicksilver", 1]], out: ["amalgam", 1], time: 2, sign: "☿" },
  ],
  // metal crucible — alloys
  crucible: [
    { in: [["stygian_iron", 1], ["cobalt", 1]], out: ["magnetiron", 1], time: 2.5 },
  ],
  // loom — textiles
  loom: [
    { in: [["silk", 1]], out: ["silk_thread", 1], time: 1.2 },
    { in: [["silk_thread", 2]], out: ["silk_cloth", 1], time: 1.5 },
    { in: [["fabric", 1]], out: ["string", 2], time: 1 },
  ],
  // animal pen — feed grain/compost, get food + leather over time (husbandry)
  pen: [
    { in: [["grain", 2]], out: ["meat", 1], time: 6 },
    { in: [["grain", 1]], out: ["egg", 2], time: 5 },
    { in: [["compost", 2]], out: ["leather", 1], time: 7 },
    { in: [["grain", 3]], out: ["milk", 1], time: 6 },
  ],
};

const has = (inv, item, n) => (inv[item] || 0) >= n;
export const canCraft = (inv, r) => r.in.every(([item, n]) => has(inv, item, n));

export function applyCraft(inv, r) {
  if (!canCraft(inv, r)) return false;
  for (const [item, n] of r.in) inv[item] -= n;
  inv[r.out[0]] = (inv[r.out[0]] || 0) + r.out[1];
  return true;
}

export const recipeById = (id) => RECIPES.find((r) => r.id === id);

// progression depth of an item = how many craft steps deep it sits (raw = 0).
// used to sort the craft menu so earlier-tech recipes list first.
const _tier = {};
function tierOf(item, seen = new Set()) {
  if (item in _tier) return _tier[item];
  const r = RECIPES.find((x) => x.out[0] === item);
  if (!r || seen.has(item)) return 0;
  seen.add(item);
  const t = 1 + Math.max(0, ...r.in.map(([it]) => tierOf(it, seen)));
  _tier[item] = t;
  return t;
}
export const recipeTier = (r) => tierOf(r.out[0]);

// milestone recipes are ALWAYS visible (greyed out until affordable) so the
// factory progression is legible from the start — you can see how to build a
// belt or a smelter before you've gathered the parts, instead of the goal being
// hidden behind its own prerequisites.
export const KEY_RECIPES = new Set([
  "belt", "workbench", "chest", "torch", "bedroll",
  "wooden_gear", "concrete_block", "electrum_plate", "wire", "machine_frame",
  "concrete_forge", "smelter", "presser", "mill", "washer", "crusher",
  "assembler", "wood_generator", "power_pole", "tinker_bench", "musket",
]);

// a recipe is visible if it's a milestone, or once every input has been
// discovered AND (if it needs a found schematic) that schematic was picked up.
export const recipeUnlocked = (discovered, r) =>
  (!r.unlockedBy || discovered.has(r.unlockedBy)) &&
  (KEY_RECIPES.has(r.id) || r.in.every(([it]) => discovered.has(it)));
