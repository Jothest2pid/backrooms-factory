// sim/game.js — movement, collision, and seamless door traversal

import { WALK, RUN, TRAVERSE_COOLDOWN } from "../config.js";
import { add, scale, norm, dist } from "../core/vec.js";
import { doorTransform } from "../model/transform.js";
import { Player } from "../model/player.js";
import { TILE } from "../model/tiles.js";
import { ORES } from "../world/ore.js";
import { itemInfo, disassembleSpec } from "../world/items.js";
import { ensureLoaded } from "../world/generate.js";
import { canPlace, canBuild } from "./build.js";
import { ITEMS, KIND, itemName, isBuildable, isTool, isTrinket, trinketSlot, itemEffect, isModule } from "./registry.js";
import { recipeById, canCraft, applyCraft } from "./recipes.js";
import { toolStats } from "./tools.js";
import { tickMachine, interactMachine } from "./machines.js";
import { computePower } from "./power.js";
import { tickTransport } from "./logistics.js";
import { spawnMobs, tickMobs, meleeMob, fireMusket, fireBow, throwExplosive, tickTurrets } from "./mobs.js";
import { rollLoot } from "./loot.js";
import { sfx } from "./audio.js";

import { telemetry } from "./telemetry.js";

// resources you "use" by selecting them and left-clicking (no dedicated key)
const EDIBLE = { food: 12, bread: 18, meat: 22, egg: 8, milk: 10, tonic: 45 };
const USABLE = new Set(["string", "almond_water", ...Object.keys(EDIBLE)]);
// thrown weapons that can sit on the hotbar and be lobbed with left-click
const THROWN = new Set(["grenade", "molotov"]);

export class Game {
  constructor(world, input) {
    this.world = world;
    this.rooms = world.rooms; // same array ref — grows as the world streams in
    this.current = world.start;
    this.current.visited = true;
    this.player = new Player({ x: this.current.w / 2, y: this.current.h / 2 });
    this.input = input;
    this.lastEvent = "";
    this.traverseCooldown = 0;
    this.baseMaxHealth = 100;
    this.maxHealth = 100; this.health = 100;
    this.maxStamina = 100; this.stamina = 100;

    // equipment: 4 armor + 4 placed trinkets + 2 free trinkets
    this.equip = { head: null, goggles: null, neck: null, chest: null, legs: null, shoes: null, back: null, gloves: null, free1: null, free2: null };

    // base-building / mining state
    this.inventory = {};      // item id -> count
    this.discovered = new Set(); // item ids ever obtained — gates which recipes show
    this.everPlaced = new Set(); // buildable/surface ids ever placed — drives the progression guide
    this.held = null;         // furniture item being carried (move mode)
    this.buildMode = false;   // B toggles: the build menu + furniture pick-up / place
    this.buildItem = null;    // buildable chosen in the build menu, ready to place
    this.god = false;         // ~ toggles: noclip + infinite stamina

    // crafting / tools / placement
    this.hotbar = [];         // item ids the player can equip/place (tools, buildables)
    this.sel = 0;             // selected hotbar slot
    this.placeFacing = 0;     // rotation for the buildable being placed
    this.power = { supply: 0, draw: 0, ratio: 1 };
    this.reach = 4.0;         // how far you can mine / disassemble / interact (tiles)
    this.actCD = 0;           // action cooldown — no instant spam-mining/stripping

    // survival
    this.spawn = { room: this.current.id, x: this.player.pos.x, y: this.player.pos.y };
    this.layingString = false; // G toggles a breadcrumb trail
    this._stringFrom = null;
    this.deaths = 0;
  }

  inReach(x, y) { return dist(this.player.pos, { x, y }) <= this.reach; }

  // ---- equipment / trinket effects ----
  // sum an effect stat across everything equipped
  effect(stat) {
    let t = 0;
    for (const k in this.equip) { const it = this.equip[k]; if (it) t += (itemEffect(it)[stat] || 0); }
    return t;
  }
  // which slot key an item uses (free items take the first open free slot)
  slotFor(item) {
    const s = trinketSlot(item);
    if (s === "free") return this.equip.free1 ? (this.equip.free2 ? "free1" : "free2") : "free1";
    return s;
  }
  equipItem(item) {
    if (!isTrinket(item) || (this.inventory[item] || 0) <= 0) return false;
    const key = this.slotFor(item);
    if (!key) return false;
    if (this.equip[key]) this.give(this.equip[key], 1); // swap old back to inventory
    this.equip[key] = item;
    this.inventory[item] -= 1;
    this.recalcMax();
    sfx("equip"); this.lastEvent = `equipped ${itemName(item)}`;
    return true;
  }
  unequip(key) {
    const it = this.equip[key];
    if (!it) return;
    this.give(it, 1);
    this.equip[key] = null;
    this.recalcMax();
    sfx("equip"); this.lastEvent = `unequipped ${itemName(it)}`;
  }
  recalcMax() {
    this.maxHealth = this.baseMaxHealth + this.effect("maxhp");
    this.health = Math.min(this.health, this.maxHealth);
  }
  visionRange() { return 14 + this.effect("vision"); }   // goggles/phone widen the cone
  lightBonus() { return this.effect("light"); }           // phone/etc. add a small carry light

  // anomalous blink: teleport forward (marble / blink boots)
  blink() {
    if (this.effect("blink") <= 0) { this.lastEvent = "no blink trinket equipped"; return; }
    const d = this.player.dir || { x: 0, y: 1 }, r = this.player.radius;
    let np = { x: this.player.pos.x + d.x * 4, y: this.player.pos.y + d.y * 4 };
    np.x = Math.max(r, Math.min(this.current.w - r, np.x));
    np.y = Math.max(r, Math.min(this.current.h - r, np.y));
    np = this.pushOutOfSolids(this.current, np, r);
    this.player.pos = np;
    this._blink = { t: 0.15 }; sfx("blink");
    this.lastEvent = "blink!";
  }

  // ---- survival: damage / respawn / drink / breadcrumbs ----
  takeDamage(n) {
    if (this.god) return;
    n = Math.max(1, n - this.effect("defense")); // armor soaks damage (min 1)
    this.health = Math.max(0, this.health - n);
    this._hurt = 0.35;  // red screen flash (visual feedback)
    sfx("hurt");        // + auditory
    if (this.health <= 0) this.respawn();
  }

  respawn() {
    this.deaths++;
    telemetry.log("death", { room: this.current.id });
    const room = this.rooms[this.spawn.room] || this.world.start;
    this.current = room; room.visited = true;
    this.player.pos = { x: this.spawn.x, y: this.spawn.y };
    this.health = this.maxHealth; this.stamina = this.maxStamina;
    ensureLoaded(this.world, room);
    this.lastEvent = "you woke at your bedroll";
  }

  // drink almond water -> restores health and stamina
  drink() {
    if ((this.inventory.almond_water || 0) <= 0) { this.lastEvent = "no almond water"; return; }
    this.inventory.almond_water -= 1;
    this.health = Math.min(this.maxHealth, this.health + 20);
    this.stamina = this.maxStamina;
    sfx("eat"); this.lastEvent = "drank almond water (+20 HP)";
  }

  // fire/throw the equipped ranged weapon toward a world-space aim point
  fire(aim) {
    const w = this.equippedTool();
    if (w === "bow" || w === "crossbow") fireBow(this, aim);
    else fireMusket(this, aim);
  }
  throwItem(item, aim) { throwExplosive(this, item, aim); }

  toggleString() {
    this.layingString = !this.layingString;
    this._stringFrom = this.layingString ? { ...this.player.pos } : null;
    this.lastEvent = this.layingString ? "laying string trail" : "stopped laying string";
  }

  // ---- hotbar / equipped ----
  selectedItem() { return this.hotbar[this.sel] || null; }
  equippedTool() { const it = this.selectedItem(); return isTool(it) ? it : "fist"; }
  selectedBuildable() {
    // build menu pick wins while building; otherwise a buildable held on the hotbar
    if (this.buildMode && this.buildItem && isBuildable(this.buildItem) && (this.inventory[this.buildItem] || 0) > 0) return this.buildItem;
    const it = this.selectedItem(); return isBuildable(it) && (this.inventory[it] || 0) > 0 ? it : null;
  }
  addToHotbar(item) { if ((isTool(item) || isBuildable(item) || USABLE.has(item) || THROWN.has(item)) && !this.hotbar.includes(item)) this.hotbar.push(item); }
  selectedUsable() { const it = this.selectedItem(); return USABLE.has(it) && (this.inventory[it] || 0) > 0 ? it : null; }

  // ---- crafting ----
  hasStation(type) { return this.current.entities.some((e) => e.type === type); }
  hasWorkbench() { return this.hasStation("workbench"); }
  craftable(r) {
    if (r.station === "workbench" && !this.hasWorkbench()) return false;
    if (r.station === "tinker" && !this.hasStation("tinker_bench")) return false;
    return canCraft(this.inventory, r);
  }
  craft(id) {
    const r = recipeById(id);
    if (!r || !this.craftable(r)) { this.lastEvent = "can't craft that yet"; return false; }
    applyCraft(this.inventory, r);
    this.discovered.add(r.out[0]);
    this.addToHotbar(r.out[0]);
    telemetry.log("craft", { item: r.out[0] }); sfx("craft");
    this.lastEvent = `crafted ${itemName(r.out[0])}`;
    return true;
  }

  // rotate the carried furniture 90° (4-way facing), swapping its footprint
  rotateHeld() {
    const f = this.held;
    if (!f) return;
    f.facing = ((f.facing ?? (f.orient === "front" ? 0 : 3)) + 1) % 4;
    f.orient = f.facing % 2 === 0 ? "front" : "side";
    const t = f.w; f.w = f.h; f.h = t; // footprint turns with it
  }

  give(resource, n) {
    this.inventory[resource] = (this.inventory[resource] || 0) + n;
    this.discovered.add(resource);
    if (USABLE.has(resource) || THROWN.has(resource)) this.addToHotbar(resource);
  }

  // right-click verb: mine ore / disassemble furniture / strip carpet, using
  // whatever tool is equipped (fist by default)
  useTool(hovered, tile) {
    if (this.actCD > 0) return;                 // still on cooldown — can't act yet
    const tgt = hovered ? { x: hovered.x, y: hovered.y } : tile ? { x: tile.tx + 0.5, y: tile.ty + 0.5 } : null;
    if (tgt && !this.inReach(tgt.x, tgt.y)) { this.lastEvent = "too far — move closer"; return; }
    const spd = this.toolSpeed() * (1 + this.effect("mineSpeed")); // tools + powered gauntlet
    if (hovered && hovered.kind === "mob") { meleeMob(this, hovered.ref, toolStats(this.equippedTool()).melee + this.effect("melee")); this.actCD = 0.45; return; }
    if (hovered && hovered.kind === "ore") { this.mine(hovered.ref, hovered.curve); this.actCD = 0.6 / spd; return; }
    if (hovered && hovered.kind === "item") { this.hit(hovered.ref); this.actCD = 0.45 / spd; return; }
    if (hovered && hovered.kind === "entity") { this.deconstruct(hovered.ref); this.actCD = 0.3; return; }
    if (hovered && hovered.kind === "feature") { this.mineFeature(hovered); this.actCD = 0.7 / spd; return; }
    if (tile) { this.stripCarpet(tile.tx, tile.ty); this.actCD = 0.5 / spd; }
  }

  // how fast the equipped tool swings (scales mining/stripping cooldown)
  toolSpeed() {
    const t = toolStats(this.equippedTool());
    return 1 + (Math.max(t.mine, t.fell, t.strip) - 1) * 0.25; // tier ~ speed
  }

  // left-click while holding a usable item -> use it (string trail / drink)
  useUsable(item) {
    if (item === "string") this.toggleString();
    else if (item === "almond_water") this.drink();
    else if (EDIBLE[item]) this.eat(item);
  }

  // eat food for a health bump
  eat(item) {
    if ((this.inventory[item] || 0) <= 0) return;
    this.inventory[item] -= 1;
    const heal = EDIBLE[item] || 10;
    this.health = Math.min(this.maxHealth, this.health + heal);
    sfx("eat"); this.lastEvent = `ate ${itemName(item)} (+${heal} HP)`;
  }

  // chip a pillar down for concrete (needs a pickaxe); scoop almond water from pools
  mineFeature(hovered) {
    const room = this.current;
    if (hovered.info && hovered.info.name === "Almond-water pool") {
      this.give("almond_water", 1);
      sfx("pickup"); this.lastEvent = "scooped almond water (+1) — press F to drink";
      return;
    }
    const ft = room.features.find((f) => f.type === "pillar" && Math.abs(f.x - hovered.x) < 0.01 && Math.abs(f.y - hovered.y) < 0.01);
    if (!ft) { this.lastEvent = "nothing to mine here"; return; }
    if (toolStats(this.equippedTool()).mine < 2) { this.lastEvent = "pillar needs a pickaxe"; return; }
    ft.hp = (ft.hp ?? 4) - toolStats(this.equippedTool()).mine;
    if (ft.hp > 0) { this.lastEvent = `chipping pillar — ${ft.hp} left`; return; }
    room.features.splice(room.features.indexOf(ft), 1);
    room.solids = room.solids.filter((s) => !(s.type === "circle" && Math.abs(s.x - ft.x) < 0.01 && Math.abs(s.y - ft.y) < 0.01));
    room._chunks = null;
    this.give("concrete", 4); sfx("mine");
    this.lastEvent = "mined pillar (+4 concrete)";
  }

  hit(f) {
    if (f.fixed) { this.lastEvent = `${itemInfo(f.type).name} — can't disassemble`; return; }
    const room = this.current;
    const spec = disassembleSpec(f.type);
    if (f.hp === undefined) f.hp = spec.hp;
    f.hp -= toolStats(this.equippedTool()).fell; // axe bites harder than a fist
    if (f.hp > 0) { sfx("hit"); this.lastEvent = `${itemInfo(f.type).name} — ${f.hp} hit${f.hp > 1 ? "s" : ""} left`; return; }
    const i = room.furniture.indexOf(f);
    if (i >= 0) room.furniture.splice(i, 1);
    room.solids = room.solids.filter((s) => s.furn !== f);
    room._chunks = null;
    const got = [];
    for (const [res, n] of Object.entries(spec.drops)) { this.give(res, n); got.push(`${n} ${res}`); }
    sfx("break");
    const loot = rollLoot(room.type, this.effect("luck")); // treasure/junk pull
    if (loot) { this.give(loot, 1); got.push(itemName(loot)); telemetry.log("loot", { item: loot }); sfx("pickup"); }
    this.lastEvent = `disassembled ${itemInfo(f.type).name} (+${got.join(", ")})`;
  }

  // mine an ore deposit -> resources into inventory (stygium/unobtanium need a pick).
  // mining a curve/edge cell of the vein yields less than the solid core.
  mine(ore, curve) {
    const room = this.current;
    const i = room.ores.indexOf(ore);
    if (i < 0) return;
    const spec = ORES[ore.type];
    if (spec.resource !== "electrum" && toolStats(this.equippedTool()).mine < 2) {
      this.lastEvent = `${spec.name} needs a pickaxe`;
      return;
    }
    room.ores.splice(i, 1);
    room._mat = null; room._chunks = null;
    const yld = curve ? Math.ceil(spec.yield / 2) : spec.yield;
    this.give(spec.resource, yld);
    telemetry.log("mine", { ore: spec.resource }); sfx("mine");
    this.lastEvent = `mined ${spec.name} (+${yld} ${spec.resource})`;
  }

  // strip carpet by hand or axe: intact -> torn -> bare concrete. each step
  // yields carpet; the final step removes the carpet entirely, exposing concrete.
  stripCarpet(tx, ty) {
    const room = this.current;
    if (room.type === "pipe" || !room.inBounds(tx, ty)) return;
    if (room.ores.some((o) => o.tx === tx && o.ty === ty)) return;
    const d = room.damage.find((x) => x.tx === tx && x.ty === ty);
    if (d && d.bare) { this.lastEvent = "already bare concrete"; return; }
    const yield_ = toolStats(this.equippedTool()).strip;
    if (!d) room.damage.push({ tx, ty, torn: true });   // intact -> torn
    else { d.bare = true; d.wet = false; d.torn = false; } // torn/wet -> bare concrete
    room._mat = null; room._chunks = null;
    this.give("carpet", yield_); sfx("strip");
    this.lastEvent = (d ? "stripped to concrete" : "tore up carpet") + " (+carpet)";
  }

  // pick up a furniture item (removes it + its collision solid)
  pickUp(f) {
    if (f.fixed) return; // houses & other fixed structures can't be carried
    if (!this.inReach(f.x, f.y)) { this.lastEvent = "too far — move closer"; return; }
    const room = this.current;
    const i = room.furniture.indexOf(f);
    if (i < 0) return;
    room.furniture.splice(i, 1);
    room.solids = room.solids.filter((s) => s.furn !== f);
    room._chunks = null; // furniture is baked — re-bake without it
    this.held = f; sfx("pickup");
    this.lastEvent = "carrying furniture — click a clear tile to drop";
  }

  // drop the held furniture, centred on tile (tx,ty)
  placeHeld(tx, ty) {
    const room = this.current, f = this.held;
    if (!f || !canPlace(room, tx, ty)) return false;
    f.x = tx + 0.5; f.y = ty + 0.5;
    room.furniture.push(f);
    room.solids.push({ type: "rect", x: f.x - f.w / 2, y: f.y - f.h / 2, w: f.w, h: f.h, furn: f });
    room._chunks = null; // furniture is baked — re-bake with it
    this.held = null; sfx("place");
    this.lastEvent = "placed furniture";
    return true;
  }

  // ---- buildable placement (dynamic layer — entities, never baked) ----
  selectSlot(i) { if (i >= 0 && i < this.hotbar.length) { this.sel = i; this.buildItem = null; } }
  scrollSel(d) { const n = this.hotbar.length; if (n) this.sel = (this.sel + d + n) % n; }
  rotatePlacement() { this.placeFacing = (this.placeFacing + 1) % 4; }

  // place the selected buildable with its top-left at (tx,ty)
  placeBuildable(tx, ty) {
    const item = this.selectedBuildable();
    if (!item) return false;
    const spec = ITEMS[item];
    if (spec.surface) return this.applySurface(spec.surface, tx, ty, item);
    const w = spec.w || 1, h = spec.h || 1;
    if (spec.beltMount) {
      // processors mount ON a belt: require a belt here, ignore it for collision
      const belt = this.current.entities.find((e) => e.logi === "belt" && e.tx === tx && e.ty === ty);
      if (!belt) { this.lastEvent = "processors mount on a belt"; return false; }
      if (this.current.entities.some((e) => e.process && e.tx === tx && e.ty === ty)) { this.lastEvent = "already a processor here"; return false; }
    } else if (!canBuild(this.current, tx, ty, w, h)) {
      this.lastEvent = "can't build there"; return false;
    }
    const e = {
      type: item, tx, ty, w, h, facing: this.placeFacing,
      machine: spec.machine || null, input: {}, output: {}, store: {}, progress: 0, fuel: 0,
      light: spec.light || 0, draw: spec.draw || 0, supply: spec.supply || 0,
      burns: spec.burns || null, speed: spec.speed || null, fast: spec.fast || false,
      logi: spec.logi || null,                        // "belt" | "arm"
      process: spec.process || null, rate: spec.rate || 1, beltMount: !!spec.beltMount,
      items: spec.logi === "belt" ? [] : undefined,   // belt lane
      held: null, cool: 0,                            // arm carry/cooldown
    };
    this.current.entities.push(e);
    // machines and walls block movement; belts/torches/doors/bedrolls don't
    if (spec.machine || item.endsWith("_wall"))
      this.current.solids.push({ type: "rect", x: tx, y: ty, w, h, ent: e });
    this.inventory[item] -= 1;
    this.everPlaced.add(item);
    telemetry.log("place", { item });
    if (item === "bedroll") { this.spawn = { room: this.current.id, x: tx + 0.5, y: ty + 0.5 }; this.lastEvent = "bedroll set — you'll respawn here"; return true; }
    sfx("place"); this.lastEvent = `placed ${spec.name}`;
    return true;
  }

  // cozy base-building: lay flooring / wallpaper on the floor cell under cursor
  applySurface(kind, tx, ty, item) {
    const room = this.current;
    if (!room.inBounds(tx, ty)) { this.lastEvent = "out of bounds"; return false; }
    const set = kind === "floor" ? (room._floored || (room._floored = new Set())) : (room._papered || (room._papered = new Set()));
    const key = tx + "," + ty;
    if (set.has(key)) { this.lastEvent = "already surfaced here"; return false; }
    set.add(key);
    room._chunks = null;
    this.inventory[item] -= 1;
    this.everPlaced.add(item);
    sfx("place"); this.lastEvent = kind === "floor" ? "laid flooring" : "hung wallpaper";
    return true;
  }

  // tear a placed buildable back down, refunding it and any contents
  deconstruct(e) {
    const room = this.current;
    const i = room.entities.indexOf(e);
    if (i < 0) return;
    room.entities.splice(i, 1);
    room.solids = room.solids.filter((s) => s.ent !== e);
    this.give(e.type, 1);
    for (const buf of [e.input, e.output, e.store])
      for (const [it, n] of Object.entries(buf || {})) if (n > 0) this.give(it, n);
    for (const m of e.modules || []) this.give(m, 1); // refund slotted modules
    sfx("deconstruct"); this.lastEvent = `deconstructed ${itemName(e.type)}`;
  }

  // left-click on a placed entity: insert a held module, else drive machine logic
  interactEntity(e) {
    if (!this.inReach(e.tx + (e.w || 1) / 2, e.ty + (e.h || 1) / 2)) { this.lastEvent = "too far — move closer"; return; }
    const held = this.selectedItem();
    if (held && isModule(held) && (e.machine || e.process)) { this.insertModule(e, held); return; }
    if (e.machine) interactMachine(this, e);
  }

  // slot a module into a machine (max 2); deconstruct refunds them
  insertModule(e, item) {
    e.modules = e.modules || [];
    if (e.modules.length >= 2) { this.lastEvent = "module slots full (2)"; return; }
    if ((this.inventory[item] || 0) <= 0) return;
    e.modules.push(item);
    this.inventory[item] -= 1;
    this.lastEvent = `slotted ${itemName(item)}`;
  }

  findDoor(room, side, coord) {
    const pad = 0.3;
    for (const d of room.doors) {
      if (d.side !== side) continue;
      const lo = d.center - d.width / 2 + pad;
      const hi = d.center + d.width / 2 - pad;
      if (coord >= lo && coord <= hi) return d;
    }
    return null;
  }

  step(dt) {
    const room = this.current;
    const p = this.player;
    const r = p.radius;

    if (this.traverseCooldown > 0) this.traverseCooldown -= dt;
    if (this.actCD > 0) this.actCD -= dt;
    // trinket health regen
    const rg = this.effect("regen");
    if (rg && this.health < this.maxHealth) this.health = Math.min(this.maxHealth, this.health + rg * dt);

    // intent — fixed north-up controls
    let dir = this.input.dir();
    const moving = dir.x || dir.y;
    if (moving) { dir = norm(dir); p.dir = dir; }
    p.moving = !!moving;                          // for the walk animation
    p.animClock = (p.animClock || 0) + (moving ? dt : 0);
    // sprinting burns stamina; it regenerates when you don't (god = unlimited)
    const running = this.input.run() && moving && (this.god || this.stamina > 1);
    if (this.god) this.stamina = this.maxStamina;
    else if (running) this.stamina = Math.max(0, this.stamina - 32 * dt);
    else this.stamina = Math.min(this.maxStamina, this.stamina + 18 * dt);
    // wading through an almond-water pool is slower
    const swimming = room.grid && room.tileAt(Math.floor(p.pos.x), Math.floor(p.pos.y)) === TILE.WATER;
    const moveMul = 1 + this.effect("move"); // boots/wings/etc.
    const speed = (running ? RUN : WALK) * (swimming && !this.god ? 0.55 : 1) * Math.max(0.3, moveMul);
    let np = add(p.pos, scale(dir, speed * dt));

    if (!this.god) {
      // wall collision (clamp), but never clamp where an open doorway is
      if (np.x < r && !this.findDoor(room, "W", np.y)) np.x = r;
      if (np.x > room.w - r && !this.findDoor(room, "E", np.y)) np.x = room.w - r;
      if (np.y < r && !this.findDoor(room, "N", np.x)) np.y = r;
      if (np.y > room.h - r && !this.findDoor(room, "S", np.x)) np.y = room.h - r;
      if (room.organic) np = this.pushOutOfNotch(room, np, r);
      np = this.pushOutOfSolids(room, np, r);
    }
    p.pos = np;

    // breadcrumb trail: drop string into the current room as you walk
    if (this.layingString) {
      if (!this._stringFrom) this._stringFrom = { ...p.pos };
      if (dist(p.pos, this._stringFrom) > 1.1) {
        (room._string || (room._string = [])).push({ x: p.pos.x, y: p.pos.y });
        if (room._string.length > 400) room._string.shift();
        this._stringFrom = { ...p.pos };
      }
    }

    // power grid: generators supply, machines/arms draw; brownout slows everything
    this.power = computePower(room, dt);
    const ratio = this.power.ratio;
    // hand-fed machines tick whether or not you're watching (powered ones scale with the grid)
    for (const e of room.entities) if (e.machine && e.machine !== "generator" && e.machine !== "chest")
      tickMachine(e, e.draw ? dt * ratio : dt);
    tickTransport(room, dt, ratio);
    tickTurrets(this, dt, ratio);             // auto-turrets shoot mobs (power + ammo)
    tickMobs(this, dt);                       // hostiles chase + bite
    if (this._muzzle) { this._muzzle.t -= dt; if (this._muzzle.t <= 0) this._muzzle = null; }
    if (this._blast) { this._blast.t -= dt; if (this._blast.t <= 0) this._blast = null; }
    if (this._hurt) this._hurt -= dt;

    // door traversal: crossed a wall line inside an opening
    let door = null;
    if (np.x < 0) door = this.findDoor(room, "W", np.y);
    else if (np.x > room.w) door = this.findDoor(room, "E", np.y);
    if (!door) {
      if (np.y < 0) door = this.findDoor(room, "N", np.x);
      else if (np.y > room.h) door = this.findDoor(room, "S", np.x);
    }
    if (door && this.traverseCooldown <= 0) this.traverse(door);
  }

  traverse(door) {
    const room = this.current;
    const nb = this.rooms[door.link.room];
    const nbDoor = nb.doors[door.link.door];
    const xf = doorTransform(room, door, nb, nbDoor);

    // Seamless: remap position exactly (all links are opposite-side -> pure
    // translation). Player stays centred; the world scrolls. Cooldown stops
    // instant re-triggering.
    const local = xf.applyInv(this.player.pos);
    this.traverseCooldown = TRAVERSE_COOLDOWN;

    const firstTime = !nb.visited;
    this.current = nb;
    nb.visited = true;
    this.player.pos = local;
    telemetry.log("enter_room", { room: nb.id, type: nb.type });
    if (this.layingString) this._stringFrom = { ...local }; // continue the trail in the new room
    ensureLoaded(this.world, nb); // stream in the rooms now ahead of the player
    spawnMobs(this.world, nb, this.player); // dark rooms wake up hostile
    if (nb.behavior) this.lastEvent = `room ${nb.id} — ${nb.behavior}`;
    else if (nb.type !== "yellow") this.lastEvent = `room ${nb.id} — ${nb.type}`;
    else this.lastEvent = firstTime ? `entered room ${nb.id}` : `back in room ${nb.id}`;
  }

  // keep the player out of an organic room's cut-away notch (AABB push-out)
  pushOutOfNotch(room, np, r) {
    const { cw, ch, corner } = room.organic;
    let bx0, bx1, by0, by1;
    if (corner === 0) { bx0 = 0; bx1 = cw; by0 = 0; by1 = ch; }
    else if (corner === 1) { bx0 = room.w - cw; bx1 = room.w; by0 = 0; by1 = ch; }
    else if (corner === 2) { bx0 = room.w - cw; bx1 = room.w; by0 = room.h - ch; by1 = room.h; }
    else { bx0 = 0; bx1 = cw; by0 = room.h - ch; by1 = room.h; }
    if (np.x <= bx0 - r || np.x >= bx1 + r || np.y <= by0 - r || np.y >= by1 + r) return np;
    const dx = bx0 === 0 ? bx1 + r - np.x : np.x - (bx0 - r);
    const dy = by0 === 0 ? by1 + r - np.y : np.y - (by0 - r);
    if (Math.abs(dx) < Math.abs(dy)) np.x = bx0 === 0 ? bx1 + r : bx0 - r;
    else np.y = by0 === 0 ? by1 + r : by0 - r;
    return np;
  }

  // push the player out of structural obstacles (pillars, pitfalls, houses)
  pushOutOfSolids(room, np, r) {
    for (const s of room.solids) {
      if (s.type === "circle") {
        const d = dist(np, s);
        const min = s.r + r;
        if (d < min && d > 0.0001) { const k = (min - d) / d; np = { x: np.x + (np.x - s.x) * k, y: np.y + (np.y - s.y) * k }; }
      } else { // rect
        const x0 = s.x - r, x1 = s.x + s.w + r, y0 = s.y - r, y1 = s.y + s.h + r;
        if (np.x <= x0 || np.x >= x1 || np.y <= y0 || np.y >= y1) continue;
        const dl = np.x - x0, dr = x1 - np.x, dt = np.y - y0, db = y1 - np.y;
        const m = Math.min(dl, dr, dt, db);
        if (m === dl) np.x = x0; else if (m === dr) np.x = x1;
        else if (m === dt) np.y = y0; else np.y = y1;
      }
    }
    return np;
  }

  exploredCount() {
    return this.rooms.filter((r) => r.visited).length;
  }
}
