// sim/transforms.js — belt-pass processing.
//
// The core factory model: most machines are NOT recipe-specific. A processor
// sits ON a belt and applies its ONE process to whatever item rides past — a
// smelter smelts ore→ingot AND dough→bread, the same throughput either way. A
// processor only catches one item per cooldown, so to keep up with a fast belt
// you chain several in series. (Recipe-select machines like the alchemy cauldron
// and the assembler are the exception — they combine inputs and live elsewhere.)
//
// Each process is a flat item→item map. Add a row and that input is now
// automatable through that machine. Anything can be automated except loot.

export const TRANSFORMS = {
  // heat: ores→ingots, and any other "cook"
  smelt: {
    electrum: "electrum_ingot",
    electrum_dust: "electrum_ingot",
    stygium: "stygian_iron",
    quartz: "glass",        // silica → glass
    sand: "glass",          // washed stone → glass (alt path)
    dough: "bread",         // cook
    wood: "charcoal",       // pyrolysis → fuel
    amalgam: "electrum_ingot", // mercury amalgam → refined metal
  },
  // grind: ore/ingot→powder/dust, grain→flour, stone→gravel
  crush: {
    stygium: "stygian_powder",
    electrum: "electrum_dust",
    concrete: "gravel",
    basalt: "gravel",
    grain: "flour",
    bone: "compost",        // bone meal → compost
  },
  // squeeze: ingot→plate, plate→reinforced. double-press iron = stygian steel.
  press: {
    electrum_ingot: "electrum_plate",
    stygian_iron: "stygian_plate",
    stygian_plate: "stygian_steel",
  },
  // rinse: ore→richer concentrate (more metal per smelt), clean grime off loot
  wash: {
    gravel: "sand",         // washed crushed stone → sand (→ glass via smelt)
  },
};

// what `proc` turns `item` into, or null if it doesn't act on it
export function applyProcess(proc, item) {
  const t = TRANSFORMS[proc];
  return (t && t[item]) || null;
}
