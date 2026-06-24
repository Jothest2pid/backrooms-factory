// sim/loot.js — treasure & junk drops from searching/dismantling furniture.
//
// Per the design: mob/dismantle drops are RNG (use Math.random, NOT world.rng,
// so loot never desyncs the seeded world generation). Each room TYPE is a loot
// biome with its own junk + trinket pools. Trinkets are the rare exciting pulls.

const pick = (arr) => (arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);

export const LOOT = {
  default:   { junk: ["scrap", "wood", "fabric", "fuel"], trinket: ["worn_sneakers", "cracked_glasses", "lucky_penny"] },
  office:    { junk: ["scrap", "plastic", "keys", "adhesive", "battery", "electronics"], trinket: ["cracked_glasses", "hard_hat", "worn_sneakers", "walkman", "fortune_charm"] },
  pool:      { junk: ["fabric", "plastic", "almond_water"], trinket: ["oxygen_tank", "cracked_glasses", "ghost_step"] },
  library:   { junk: ["fuel", "plastic", "wire"], trinket: ["fold_goggles", "regen_amulet", "schem_cast_plate", "schem_fast_wire", "schem_drum_mag"] },
  pipe:      { junk: ["scrap", "wire", "electronics", "fuel"], trinket: ["powered_gauntlet", "tractor_glove"] },
  christmas: { junk: ["heartwood", "battery", "fuel"], trinket: ["anomalous_marble", "rabbits_foot", "almond_pendant", "schem_superconductor"] },
  suburb:    { junk: ["wood", "fabric", "food"], trinket: ["fire_axe", "kevlar_vest", "sprint_boots", "backpack"] },
  hub:       { junk: ["scrap", "plastic", "keys"], trinket: ["fortune_charm", "regen_amulet", "lucky_penny"] },
  pillar:    { junk: ["concrete", "scrap", "gravel"], trinket: ["brace_leggings", "hard_hat"] },
};

// roll one drop (or null). luck (0..1) raises the trinket chance.
export function rollLoot(roomType, luck = 0) {
  const t = LOOT[roomType] || LOOT.default;
  const r = Math.random();
  if (r < 0.12 + luck * 0.5) return pick(t.trinket); // the exciting pull
  if (r < 0.6) return pick(t.junk);                  // common mat
  return null;
}
