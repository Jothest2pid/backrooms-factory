// sim/power.js — a simple per-room power grid.
//
// Generators burn fuel to make supply; powered machines/arms draw it. When draw
// exceeds supply the whole grid browns out: everything runs at supply/draw speed.
// (v1 treats every machine in a room as one grid — power poles extend reach
// cosmetically for now; a real wiring graph comes with the late era.)

const GEN_BURN = 1; // fuel units burned per second while a generator runs

export function computePower(room, dt) {
  let supply = 0, draw = 0;
  for (const e of room.entities) {
    if (e.machine === "generator") {
      if ((e.fuel || 0) > 0) {
        supply += e.supply || 10;
        e._burn = (e._burn || 0) + dt * GEN_BURN;
        if (e._burn >= 1) { e._burn -= 1; e.fuel -= 1; }
        e.active = true;
      } else e.active = false;
    } else if (e.draw) {
      let eff = 0;
      for (const m of e.modules || []) eff += (m === "efficiency_module" ? 0.3 : 0);
      draw += e.draw * Math.max(0.1, 1 - eff); // efficiency modules cut draw
    }
  }
  const ratio = draw === 0 ? 1 : Math.min(1, supply / draw);
  return { supply, draw, ratio };
}
