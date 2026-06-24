// sim/loot.js — treasure & junk drops from searching/dismantling furniture.
//
// Per the design: mob/dismantle drops are RNG (use Math.random, NOT world.rng,
// so loot never desyncs the seeded world generation). Each room TYPE is a loot
// biome with its own junk + trinket pools. Trinkets are the rare exciting pulls.

const pick = (arr) => (arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);

export const LOOT = {
  default:   { junk: ["scrap", "wood", "fabric", "fuel", "rag", "single_shoe"],
               trinket: ["worn_sneakers", "cracked_glasses", "lucky_penny", "heely"] },
  office:    { junk: ["scrap", "plastic", "keys", "duct_tape", "battery", "electronics", "stapler", "tape_dispenser", "calculator", "typewriter", "rotary_phone", "clipboard", "letter_opener", "desk_lamp", "paperweight", "keycard", "ruler", "name_badge", "lanyard", "paper", "flashlight", "photo"],
               trinket: ["cracked_glasses", "hard_hat", "worn_sneakers", "walkman", "fortune_charm", "office_compass", "pocketknife", "brass_knuckle", "magnifier", "pedometer"] },
  pool:      { junk: ["fabric", "plastic", "almond_water", "swim_cap", "kickboard", "pool_noodle", "towel", "flip_flops", "diving_mask", "snorkel", "flippers", "inflatable", "beach_ball", "lifebuoy", "bucket", "canteen", "chlorine", "mop", "spray_bottle", "spores"],
               trinket: ["oxygen_tank", "cracked_glasses", "ghost_step", "felt_slipper", "canteen_sip", "galoshes"] },
  library:   { junk: ["fuel", "plastic", "wire", "paper", "vhs", "projector", "cookbook", "board_game", "silk", "seeds", "bone"],
               trinket: ["fold_goggles", "regen_amulet", "magnifier", "disposable_camera", "pocket_mirror", "schem_cast_plate", "schem_fast_wire", "schem_drum_mag"] },
  pipe:      { junk: ["scrap", "wire", "electronics", "fuel", "radio", "walkie_talkie", "cassette", "cassette_player", "motherboard", "hard_drive", "server_blade", "soldering_iron", "capacitor", "vacuum_tube", "led_strip", "speaker", "headphones", "multimeter", "circuit_tester", "extension_cord", "wd40", "jumper_cables", "flashlight"],
               trinket: ["powered_gauntlet", "tractor_glove", "static_glove", "adrenaline_vial", "penlight"] },
  christmas: { junk: ["heartwood", "battery", "fuel", "christmas_lights", "ornament", "tinsel", "snow_globe", "skeleton_key", "tuning_fork", "jar_of_teeth", "fold_compass"],
               trinket: ["anomalous_marble", "rabbits_foot", "almond_pendant", "chipped_marble", "red_balloon", "moth_jar", "helium_pocket", "rosary", "schem_superconductor"] },
  suburb:    { junk: ["wood", "fabric", "food", "kitchen_knife", "frying_pan", "pan_lid", "toaster", "microwave", "blender", "kettle", "can_opener", "cutlery", "mason_jar", "spice_rack", "sewing_kit", "yarn", "quilt", "pillow", "alarm_clock", "wind_up_clock", "music_box", "harmonica", "ukulele", "picture_frame", "vase", "candlestick", "matchbook", "lighter", "deck_of_cards", "dice", "marbles", "yo_yo", "broom_handle", "nails", "beans", "ladder", "photo", "silk", "grain", "seeds"],
               trinket: ["fire_axe", "kevlar_vest", "sprint_boots", "backpack", "spring_shoe", "oven_mitt", "wool_sock", "pill_bottle", "sand_timer"] },
  hub:       { junk: ["scrap", "plastic", "keys", "keycard", "wrench", "screwdriver", "pliers", "power_strip", "surge_protector"],
               trinket: ["fortune_charm", "regen_amulet", "lucky_penny", "keyring", "multitool", "zippo", "everlasting_battery", "magnet_bit"] },
  pillar:    { junk: ["concrete", "scrap", "gravel", "nails", "hammer", "bolt_cutters", "light_tube", "fire_extinguisher", "first_aid_kit", "defibrillator", "bone", "mop"],
               trinket: ["brace_leggings", "hard_hat", "knee_brace", "dust_mask", "dowsing_twig", "nail_bracelet"] },
};

// roll one drop (or null). luck (0..1) raises the trinket chance.
export function rollLoot(roomType, luck = 0) {
  const t = LOOT[roomType] || LOOT.default;
  const r = Math.random();
  if (r < 0.12 + luck * 0.5) return pick(t.trinket); // the exciting pull
  if (r < 0.6) return pick(t.junk);                  // common mat
  return null;
}
