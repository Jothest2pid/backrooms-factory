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

  // ===== MODULAR WEAPON PARTS (§6) — craft at the workbench, assemble at tinker =====
  { id: "pipe_frame", out: ["pipe_frame", 1], in: [["scrap", 4], ["wooden_gear", 1]], station: "workbench" },
  { id: "sidearm_frame", out: ["sidearm_frame", 1], in: [["machine_frame", 1], ["electrum_plate", 1]], station: "workbench" },
  { id: "scatter_frame", out: ["scatter_frame", 1], in: [["machine_frame", 1], ["scrap", 2]], station: "workbench" },
  { id: "longgun_frame", out: ["longgun_frame", 1], in: [["machine_frame", 1], ["stygian_plate", 1]], station: "workbench" },
  { id: "nailgun_frame", out: ["nailgun_frame", 1], in: [["scrap", 3], ["wire", 1]], station: "workbench" },
  { id: "flare_frame", out: ["flare_frame", 1], in: [["scrap", 2], ["brimstone", 1]], station: "workbench" },
  { id: "short_barrel", out: ["short_barrel", 1], in: [["scrap", 2]], station: "workbench" },
  { id: "long_barrel", out: ["long_barrel", 1], in: [["scrap", 3]], station: "workbench" },
  { id: "rifled_barrel", out: ["rifled_barrel", 1], in: [["stygian_plate", 1], ["scrap", 1]], station: "workbench" },
  { id: "heavy_barrel", out: ["heavy_barrel", 1], in: [["stygian_plate", 2]], station: "workbench" },
  { id: "foldglass_barrel", out: ["foldglass_barrel", 1], in: [["foldglass", 1], ["scrap", 1]], station: "workbench" },
  { id: "wooden_stock", out: ["wooden_stock", 1], in: [["plank", 2]], station: "workbench" },
  { id: "padded_stock", out: ["padded_stock", 1], in: [["plank", 1], ["fabric", 2]], station: "workbench" },
  { id: "folding_stock", out: ["folding_stock", 1], in: [["scrap", 1], ["wire", 1]], station: "workbench" },
  { id: "box_mag", out: ["box_mag", 1], in: [["scrap", 2]], station: "workbench" },
  { id: "drum_mag", out: ["drum_mag", 1], in: [["scrap", 3], ["wire", 1]], station: "workbench" },
  { id: "speed_mag", out: ["speed_mag", 1], in: [["scrap", 2], ["wire", 1]], station: "workbench" },
  { id: "scope", out: ["scope", 1], in: [["lens", 1], ["scrap", 1]], station: "workbench" },
  { id: "bayonet", out: ["bayonet", 1], in: [["scrap", 1], ["stygian_plate", 1]], station: "workbench" },
  { id: "suppressor", out: ["suppressor", 1], in: [["scrap", 2], ["fabric", 1]], station: "workbench" },
  { id: "incendiary_chamber", out: ["incendiary_chamber", 1], in: [["scrap", 1], ["brimstone", 1]], station: "workbench" },
  { id: "foldpiercing_chamber", out: ["foldpiercing_chamber", 1], in: [["foldglass", 1], ["scrap", 1]], station: "workbench" },

  // ===== GUN ASSEMBLY (tinker bench: frame + parts -> a finished gun) =====
  { id: "asm_pipe_gun", out: ["pipe_gun", 1], in: [["pipe_frame", 1], ["short_barrel", 1]], station: "tinker" },
  { id: "asm_pistol", out: ["pistol", 1], in: [["sidearm_frame", 1], ["short_barrel", 1], ["box_mag", 1]], station: "tinker" },
  { id: "asm_smg", out: ["smg", 1], in: [["sidearm_frame", 1], ["short_barrel", 1], ["drum_mag", 1], ["folding_stock", 1]], station: "tinker" },
  { id: "asm_hunting_rifle", out: ["hunting_rifle", 1], in: [["longgun_frame", 1], ["long_barrel", 1], ["wooden_stock", 1], ["box_mag", 1]], station: "tinker" },
  { id: "asm_marksman_rifle", out: ["marksman_rifle", 1], in: [["longgun_frame", 1], ["rifled_barrel", 1], ["padded_stock", 1], ["scope", 1], ["box_mag", 1]], station: "tinker" },
  { id: "asm_sniper_rifle", out: ["sniper_rifle", 1], in: [["longgun_frame", 1], ["rifled_barrel", 1], ["brass_scope", 1], ["box_mag", 1]], station: "tinker" },
  { id: "asm_sawn_shotgun", out: ["sawn_shotgun", 1], in: [["scatter_frame", 1], ["sawnoff_barrel", 1]], station: "tinker" },
  { id: "asm_combat_shotgun", out: ["combat_shotgun", 1], in: [["scatter_frame", 1], ["short_barrel", 1], ["drum_mag", 1]], station: "tinker" },
  { id: "asm_heavy_rifle", out: ["heavy_rifle", 1], in: [["longgun_frame", 1], ["heavy_barrel", 1], ["drum_mag", 1]], station: "tinker" },
  { id: "asm_auto_rifle", out: ["auto_rifle", 1], in: [["longgun_frame", 1], ["long_barrel", 1], ["extended_drum", 1]], station: "tinker" },
  { id: "asm_ranger_rifle", out: ["ranger_rifle", 1], in: [["longgun_frame", 1], ["chrome_barrel", 1], ["walnut_stock", 1], ["box_mag", 1]], station: "tinker" },
  { id: "asm_fold_rifle", out: ["fold_rifle", 1], in: [["longgun_frame", 1], ["foldglass_barrel", 1], ["box_mag", 1]], station: "tinker" },
  { id: "asm_nail_gun", out: ["nail_gun", 1], in: [["nailgun_frame", 1], ["box_mag", 1]], station: "tinker" },
  { id: "asm_flare_gun", out: ["flare_gun", 1], in: [["flare_frame", 1], ["short_barrel", 1]], station: "tinker" },
  { id: "asm_arc_gun", out: ["arc_gun", 1], in: [["longgun_frame", 1], ["circuit_board", 1], ["capacitor", 1], ["foldglass", 1]], station: "tinker" },
  { id: "asm_railgun", out: ["railgun", 1], in: [["longgun_frame", 1], ["magnetiron", 2], ["circuit_board", 1], ["foldglass", 1]], station: "tinker" },

  // ===== AMMO (§7) — workbench. black sulfur is the powder. =====
  { id: "casing", out: ["casing", 4], in: [["scrap", 1]], station: "workbench" },
  { id: "paper_cartridge", out: ["paper_cartridge", 4], in: [["black_sulfur", 1], ["lead_ball", 1]], station: "workbench" },
  { id: "bullet", out: ["bullet", 4], in: [["casing", 1], ["black_sulfur", 1], ["lead_ball", 1]], station: "workbench" },
  { id: "ap_bullet", out: ["ap_bullet", 4], in: [["bullet", 2], ["stygian_plate", 1]], station: "workbench" },
  { id: "incendiary_bullet", out: ["incendiary_bullet", 4], in: [["bullet", 2], ["brimstone", 1]], station: "workbench" },
  { id: "heavy_bullet", out: ["heavy_bullet", 4], in: [["casing", 1], ["black_sulfur", 1], ["galena", 1]], station: "workbench" },
  { id: "shell", out: ["shell", 2], in: [["casing", 1], ["black_sulfur", 1], ["lead_ball", 2]], station: "workbench" },
  { id: "energy_cell", out: ["energy_cell", 2], in: [["battery", 1], ["wire", 1], ["capacitor", 1]], station: "workbench" },
  { id: "broadhead_arrow", out: ["broadhead_arrow", 4], in: [["arrow", 2], ["stygian_plate", 1]], station: "workbench" },
  { id: "explosive_arrow", out: ["explosive_arrow", 2], in: [["arrow", 2], ["black_sulfur", 1]], station: "workbench" },
  { id: "fold_arrow", out: ["fold_arrow", 2], in: [["arrow", 2], ["foldglass", 1]], station: "workbench" },
  { id: "flare_ammo", out: ["flare", 4], in: [["black_sulfur", 1], ["fabric", 1]], station: "workbench" },

  // ===== THROWN explosives (§7) =====
  { id: "dynamite", out: ["dynamite", 2], in: [["black_sulfur", 2], ["fabric", 1]], station: "workbench" },
  { id: "pipe_bomb", out: ["pipe_bomb", 2], in: [["black_sulfur", 1], ["scrap", 2]], station: "workbench" },
  { id: "smoke_bomb", out: ["smoke_bomb", 2], in: [["black_sulfur", 1], ["chlorine", 1]], station: "workbench" },

  // ===== FARM machines (§9) — workbench buildables =====
  { id: "planter", out: ["planter", 1], in: [["plank", 4], ["wire", 1]], station: "workbench" },
  { id: "mushroom_bed", out: ["mushroom_bed", 1], in: [["plank", 4], ["spores", 1]], station: "workbench" },
  { id: "worm_bin", out: ["worm_bin", 1], in: [["plank", 4], ["fabric", 2]], station: "workbench" },
  { id: "compost", out: ["compost", 2], in: [["food", 1]], station: "hand" }, // rot food → fertilizer

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

  // ===== TREASURE TINKER TREES (§8f) — refine duplicates >> / merge different + =====
  // mobility
  { id: "runners_boot", out: ["runners_boot", 1], in: [["heely", 2]], station: "tinker" },
  { id: "track_spike", out: ["track_spike", 1], in: [["runners_boot", 2]], station: "tinker" },
  { id: "dash_boot", out: ["dash_boot", 1], in: [["spring_shoe", 2]], station: "tinker" },
  { id: "cloud_jar", out: ["cloud_jar", 1], in: [["red_balloon", 2]], station: "tinker" },
  { id: "cumulus", out: ["cumulus", 1], in: [["cloud_jar", 2]], station: "tinker" },
  { id: "sprint_boots_alt", out: ["sprint_boots", 1], in: [["runners_boot", 1], ["dash_boot", 1]], station: "tinker" },
  { id: "hover_boots_alt", out: ["hover_boots", 1], in: [["sprint_boots", 1], ["cumulus", 1]], station: "tinker" },
  { id: "momentum_pendant", out: ["momentum_pendant", 1], in: [["sand_timer", 1], ["wire", 1]], station: "tinker" },
  { id: "swim_fins", out: ["swim_fins", 1], in: [["flippers", 1], ["duct_tape", 1]], station: "tinker" },
  // devices (the Walkman + Phone family)
  { id: "walkman_alt", out: ["walkman", 1], in: [["cassette_player", 1], ["walkie_talkie", 1]], station: "tinker" },
  { id: "brass_compass", out: ["brass_compass", 1], in: [["office_compass", 2]], station: "tinker" },
  { id: "reading_glasses", out: ["reading_glasses", 1], in: [["cracked_glasses", 2]], station: "tinker" },
  { id: "loupe", out: ["loupe", 1], in: [["reading_glasses", 2]], station: "tinker" },
  { id: "surveyor_rod", out: ["surveyor_rod", 1], in: [["dowsing_twig", 2]], station: "tinker" },
  { id: "instant_camera", out: ["instant_camera", 1], in: [["disposable_camera", 2]], station: "tinker" },
  { id: "fold_monocle", out: ["fold_monocle", 1], in: [["magnifier", 1], ["foldglass", 1]], station: "tinker" },
  { id: "fold_lens", out: ["fold_lens", 1], in: [["fold_monocle", 2]], station: "tinker" },
  { id: "detector", out: ["detector", 1], in: [["multimeter", 1], ["circuit_tester", 1]], station: "tinker" },
  { id: "navigator", out: ["navigator", 1], in: [["brass_compass", 1], ["fold_monocle", 1]], station: "tinker" },
  { id: "recorder", out: ["recorder", 1], in: [["navigator", 1], ["reading_glasses", 1]], station: "tinker" },
  { id: "logistics_lens", out: ["logistics_lens", 1], in: [["reading_glasses", 1], ["circuit_board", 1]], station: "tinker" },
  { id: "blueprint_goggles", out: ["blueprint_goggles", 1], in: [["magnifier", 1], ["clipboard", 1]], station: "tinker" },
  { id: "nightsight_goggles", out: ["nightsight_goggles", 1], in: [["reading_glasses", 1], ["led_strip", 1]], station: "tinker" },
  // combat
  { id: "spiked_knuckle", out: ["spiked_knuckle", 1], in: [["brass_knuckle", 2]], station: "tinker" },
  { id: "knuckle_duster", out: ["knuckle_duster", 1], in: [["spiked_knuckle", 2]], station: "tinker" },
  { id: "tesla_glove", out: ["tesla_glove", 1], in: [["static_glove", 1], ["capacitor", 1]], station: "tinker" },
  { id: "combat_stim", out: ["combat_stim", 1], in: [["adrenaline_vial", 2]], station: "tinker" },
  { id: "berserker_core", out: ["berserker_core", 1], in: [["combat_stim", 1], ["pill_bottle", 1]], station: "tinker" },
  { id: "shock_aura", out: ["shock_aura", 1], in: [["tesla_glove", 1], ["tuning_fork", 1]], station: "tinker" },
  { id: "bloodlust_amulet", out: ["bloodlust_amulet", 1], in: [["berserker_core", 1], ["jar_of_teeth", 1]], station: "tinker" },
  { id: "shield_gauntlet", out: ["shield_gauntlet", 1], in: [["pan_lid", 1], ["stygian_plate", 1]], station: "tinker" },
  // survival / tank
  { id: "first_aid_core", out: ["first_aid_core", 1], in: [["pill_bottle", 2]], station: "tinker" },
  { id: "brimming_heart", out: ["brimming_heart", 1], in: [["canteen_sip", 1], ["almond_water", 4]], station: "tinker" },
  { id: "regen_core", out: ["regen_core", 1], in: [["first_aid_core", 1], ["brimming_heart", 1]], station: "tinker" },
  { id: "fireman_coat", out: ["fireman_coat", 1], in: [["oven_mitt", 1], ["rag", 2]], station: "tinker" },
  { id: "hazmat_coat", out: ["hazmat_coat", 1], in: [["fireman_coat", 1], ["dust_mask", 1]], station: "tinker" },
  { id: "capacitor_vest", out: ["capacitor_vest", 1], in: [["kevlar_vest", 1], ["capacitor", 1]], station: "tinker" },
  { id: "bulwark_plate", out: ["bulwark_plate", 1], in: [["galena_plate_armor", 1], ["galena", 2]], station: "tinker" },
  { id: "ablative_pack", out: ["ablative_pack", 1], in: [["backpack", 1], ["galena", 1]], station: "tinker" },
  { id: "bottomless_toolbag", out: ["bottomless_toolbag", 1], in: [["backpack", 1], ["leather", 2]], station: "tinker" },
  { id: "taunt_amulet", out: ["taunt_amulet", 1], in: [["speaker", 1], ["wire", 1]], station: "tinker" },
  { id: "life_ring", out: ["life_ring", 1], in: [["lifebuoy", 1], ["rope", 1]], station: "tinker" },
  { id: "the_towel", out: ["the_towel", 1], in: [["towel", 1], ["string", 1]], station: "tinker" },
  { id: "lanyard_id", out: ["lanyard_id", 1], in: [["name_badge", 1], ["lanyard", 1]], station: "tinker" },
  // stealth / anomalous
  { id: "ghost_sole", out: ["ghost_sole", 1], in: [["felt_slipper", 2]], station: "tinker" },
  { id: "moth_shroud", out: ["moth_shroud", 1], in: [["moth_jar", 2]], station: "tinker" },
  { id: "warp_marble", out: ["warp_marble", 1], in: [["chipped_marble", 2]], station: "tinker" },
  { id: "chrono_charm", out: ["chrono_charm", 1], in: [["sand_timer", 2]], station: "tinker" },
  { id: "recall_stone", out: ["recall_stone", 1], in: [["pocket_mirror", 1], ["fold_compass", 1]], station: "tinker" },
  { id: "phase_charm", out: ["phase_charm", 1], in: [["warp_marble", 1], ["chrono_charm", 1]], station: "tinker" },
  { id: "bone_charm", out: ["bone_charm", 1], in: [["jar_of_teeth", 1], ["bone", 1]], station: "tinker" },
  // utility / luck
  { id: "master_key", out: ["master_key", 1], in: [["keyring", 1], ["skeleton_key", 1]], station: "tinker" },
  { id: "good_fortune", out: ["good_fortune", 1], in: [["deck_of_cards", 1], ["dice", 1]], station: "tinker" },
  { id: "jackpot_charm", out: ["jackpot_charm", 1], in: [["good_fortune", 1], ["rabbits_foot", 1]], station: "tinker" },

  // ===== JUNK FUSIONS (§8i) — improvised weapons / devices / lights (tinker) =====
  { id: "skillet_bat", out: ["skillet_bat", 1], in: [["frying_pan", 1], ["broom_handle", 1]], station: "tinker" },
  { id: "shiv", out: ["shiv", 1], in: [["letter_opener", 1], ["ruler", 1]], station: "tinker" },
  { id: "knife_fan", out: ["knife_fan", 1], in: [["cutlery", 1], ["duct_tape", 1]], station: "tinker" },
  { id: "glaive", out: ["glaive", 1], in: [["mop", 1], ["kitchen_knife", 1]], station: "tinker" },
  { id: "bladed_yoyo_alt", out: ["bladed_yoyo", 1], in: [["yo_yo", 1], ["kitchen_knife", 1]], station: "tinker" },
  { id: "co2_blaster", out: ["co2_blaster", 1], in: [["fire_extinguisher", 1], ["spray_bottle", 1]], station: "tinker" },
  { id: "flame_sprayer", out: ["flame_sprayer", 1], in: [["spray_bottle", 1], ["wd40", 1], ["lighter", 1]], station: "tinker" },
  { id: "shock_whip", out: ["shock_whip", 1], in: [["christmas_lights", 1], ["battery", 1]], station: "tinker" },
  { id: "paperclip_crossbow", out: ["paperclip_crossbow", 1], in: [["ruler", 1], ["string", 1], ["nails", 1]], station: "tinker" },
  { id: "glow_jar", out: ["glow_jar", 2], in: [["mason_jar", 1], ["spores", 1]], station: "tinker" },
  { id: "moth_lantern", out: ["moth_lantern", 1], in: [["mason_jar", 1], ["moth_jar", 1]], station: "tinker" },
  { id: "portable_lamp", out: ["portable_lamp", 1], in: [["desk_lamp", 1], ["battery", 1]], station: "tinker" },
  { id: "candle", out: ["candle", 2], in: [["candlestick", 1], ["matchbook", 1]], station: "tinker" },
  { id: "firecracker", out: ["firecracker", 4], in: [["matchbook", 1], ["black_sulfur", 1]], station: "tinker" },
  { id: "coffee", out: ["coffee", 2], in: [["kettle", 1], ["beans", 1]], station: "tinker" },
  { id: "bandages", out: ["bandages", 2], in: [["first_aid_kit", 1]], station: "tinker" },

  // ===== JUNK SALVAGE (§8c) — break a found object down into a base material =====
  { id: "salvage_tape", out: ["adhesive", 2], in: [["duct_tape", 1]], station: "hand" },
  { id: "salvage_speaker", out: ["magnet", 1], in: [["speaker", 1]], station: "hand" },
  { id: "salvage_board", out: ["circuit_board", 1], in: [["motherboard", 1]], station: "hand" },
  { id: "salvage_radio", out: ["electronics", 2], in: [["radio", 1]], station: "hand" },
  { id: "salvage_sewing", out: ["string", 2], in: [["sewing_kit", 1]], station: "hand" },
  { id: "salvage_yarn", out: ["fabric", 2], in: [["yarn", 1]], station: "hand" },
  { id: "salvage_ladder", out: ["plank", 2], in: [["ladder", 1]], station: "hand" },
  { id: "salvage_clock", out: ["wooden_gear", 1], in: [["wind_up_clock", 1]], station: "hand" },
  { id: "salvage_tube", out: ["glass", 1], in: [["light_tube", 1]], station: "hand" },
  { id: "salvage_cord", out: ["wire", 2], in: [["extension_cord", 1]], station: "hand" },
  { id: "salvage_hd", out: ["electronics", 1], in: [["hard_drive", 1]], station: "hand" },
  { id: "salvage_vacuum", out: ["electronics", 1], in: [["vacuum_tube", 1]], station: "hand" },

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
  // animal pen — husbandry. With a LIVESTOCK animal loaded it's kept (a catalyst,
  // never consumed) and converts feed into product; these are listed first so a
  // stocked pen always uses them. Without an animal it falls back to the plain
  // grain/compost recipes below (so the pen still works early).
  pen: [
    { in: [["pale_hen", 1], ["grain", 1]], out: ["egg", 2], time: 5, keep: ["pale_hen"] },
    { in: [["cave_swine", 1], ["grain", 2]], out: ["meat", 2], time: 6, keep: ["cave_swine"], extra: [["leather", 1]] },
    { in: [["blind_goat", 1], ["grain", 1]], out: ["milk", 2], time: 6, keep: ["blind_goat"] },
    { in: [["almond_moth", 1], ["spores", 1]], out: ["almond_water", 2], time: 5, keep: ["almond_moth"] },
    { in: [["grain", 2]], out: ["meat", 1], time: 6 },
    { in: [["grain", 1]], out: ["egg", 2], time: 5 },
    { in: [["compost", 2]], out: ["leather", 1], time: 7 },
    { in: [["grain", 3]], out: ["milk", 1], time: 6 },
  ],
  // crop planter — seeds <-> grain (a renewable food loop)
  planter: [
    { in: [["seeds", 1]], out: ["grain", 2], time: 5 },
    { in: [["grain", 1]], out: ["seeds", 2], time: 4 },
  ],
  // dark mushroom bed — spores grow + become food (light-free organics)
  mushroom: [
    { in: [["spores", 1]], out: ["spores", 2], time: 6 },
    { in: [["spores", 2]], out: ["food", 1], time: 4 },
  ],
  // silk worm bin — compost into silk; fabric back into compost
  worm: [
    { in: [["compost", 1]], out: ["silk", 1], time: 6 },
    { in: [["fabric", 1]], out: ["compost", 1], time: 3 },
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
