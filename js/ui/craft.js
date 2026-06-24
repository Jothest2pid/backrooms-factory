// ui/craft.js — the hotbar strip and the crafting panel (DOM overlays)

import { RECIPES, recipeTier, recipeUnlocked } from "../sim/recipes.js";
import { ITEMS, itemName, isTrinket } from "../sim/registry.js";

const EQUIP_SLOTS = ["head", "goggles", "neck", "chest", "legs", "shoes", "back", "gloves", "free1", "free2"];

const EFFECT_LABEL = {
  move: "+move", vision: "+sight", light: "+light", defense: "+armor", regen: "+regen",
  maxhp: "+max HP", mineSpeed: "+tool speed", melee: "+melee", luck: "+luck", noise: "quieter",
  fly: "fly", blink: "blink", foldradar: "fold radar", carry: "+carry", pickup: "item magnet",
  fireimmune: "fireproof", superconductive: "lossless power",
};
function effectText(id) {
  const e = ITEMS[id] && ITEMS[id].effect;
  if (!e) return "";
  const parts = Object.entries(e).map(([k, v]) => `${EFFECT_LABEL[k] || k}${typeof v === "number" && Math.abs(v) !== 1 ? " " + v : ""}`);
  return parts.length ? " (" + parts.join(", ") + ")" : "";
}

export class CraftUI {
  constructor(game) {
    this.game = game;
    this.open = false;
    this.station = "hand";
    this.hotbar = document.getElementById("hotbar");
    this.panel = document.getElementById("craft");
    this.list = document.getElementById("craft-list");
    this.invEl = document.getElementById("inventory");
    this.invList = document.getElementById("inv-list");
    this.equipList = document.getElementById("equip-list");
    this.invOpen = false;

    // click a trinket in the inventory → equip it
    this.invList.addEventListener("click", (e) => {
      const cell = e.target.closest(".icell");
      if (cell && cell.dataset.equip) { this.game.equipItem(cell.dataset.id); this.renderInv(); }
    });
    // click an equipped slot → unequip
    if (this.equipList) this.equipList.addEventListener("click", (e) => {
      const cell = e.target.closest(".ecell");
      if (cell && cell.dataset.has) { this.game.unequip(cell.dataset.slot); this.renderInv(); }
    });

    // hotbar slot clicks select; craft tab clicks switch station
    this.hotbar.addEventListener("click", (e) => {
      const slot = e.target.closest(".slot");
      if (slot) this.game.selectSlot(+slot.dataset.i);
    });
    this.panel.querySelectorAll(".ctab").forEach((b) =>
      b.addEventListener("click", () => {
        this.station = b.dataset.station;
        this.panel.querySelectorAll(".ctab").forEach((x) => x.classList.toggle("active", x === b));
        this.renderList();
      })
    );
    this.list.addEventListener("click", (e) => {
      const r = e.target.closest(".recipe");
      if (r && !r.classList.contains("no")) { this.game.craft(r.dataset.id); this.renderList(); }
    });
  }

  setGame(game) { this.game = game; }

  toggle() {
    this.open = !this.open;
    this.panel.classList.toggle("hidden", !this.open);
    if (this.open) this.renderList();
  }

  // hotbar — a fixed row of 9 slots (Minecraft style), redrawn every frame
  renderHotbar() {
    const g = this.game;
    const SLOTS = 9;
    let html = "";
    for (let i = 0; i < SLOTS; i++) {
      const item = g.hotbar[i];
      const spec = item ? ITEMS[item] : null;
      const cnt = item ? (g.inventory[item] || (spec && spec.kind === "tool" ? 1 : 0)) : 0;
      html += `<div class="slot ${i === g.sel ? "sel" : ""} ${spec ? "" : "empty"}" data-i="${i}">` +
        `<span class="key">${i + 1}</span>` +
        (spec ? `<span class="sw" style="background:${spec.color || "#888"}"></span>` +
          `<span>${spec.name.slice(0, 9)}</span>` +
          (spec.kind !== "tool" ? `<span class="cnt">${cnt}</span>` : "") : "") +
        `</div>`;
    }
    this.hotbar.innerHTML = html;
  }

  // full inventory grid popup (toggled with I)
  toggleInv() {
    this.invOpen = !this.invOpen;
    if (!this.invEl) return;
    this.invEl.classList.toggle("hidden", !this.invOpen);
    if (this.invOpen) this.renderInv();
  }

  renderInv() {
    if (!this.invEl) return;
    const g = this.game;
    // equipment slots
    if (this.equipList) {
      this.equipList.innerHTML = EQUIP_SLOTS.map((slot) => {
        const it = g.equip[slot];
        const label = slot === "free1" || slot === "free2" ? "free" : slot;
        const spec = it ? (ITEMS[it] || {}) : null;
        return `<div class="ecell ${it ? "filled" : ""}" data-slot="${slot}" ${it ? `data-has="1" title="${itemName(it)}${effectText(it)} — click to unequip"` : ""}>` +
          `<span class="eslot">${label}</span>` +
          (spec ? `<span class="sw" style="background:${spec.color || "#888"}"></span>` : "") +
          `</div>`;
      }).join("");
    }
    // inventory grid (trinkets are clickable to equip)
    const entries = Object.entries(g.inventory).filter(([, n]) => n > 0);
    const cells = entries.map(([id, n]) => {
      const spec = ITEMS[id] || {};
      const trink = isTrinket(id);
      return `<div class="icell ${trink ? "equipable" : ""}" data-id="${id}" ${trink ? 'data-equip="1"' : ""} title="${itemName(id)}${trink ? effectText(id) + " — click to equip" : ""}">` +
        `<span class="sw" style="background:${spec.color || "#888"}"></span>` +
        `<span class="iname">${itemName(id)}</span><span class="cnt">${n}</span></div>`;
    });
    this.invList.innerHTML = entries.length ? cells.join("") : `<div class="dim" style="grid-column:1/-1">empty — punch furniture (right-click) to gather materials</div>`;
  }

  unlockedRecipes() {
    const g = this.game;
    return RECIPES
      .filter((r) => r.station === this.station && recipeUnlocked(g.discovered, r))
      .sort((a, b) => recipeTier(a) - recipeTier(b) || a.out[0].localeCompare(b.out[0]));
  }

  // FULL rebuild — only when the set of visible recipes changes (else clicks die
  // because the node gets replaced between mousedown and mouseup)
  renderList() {
    const g = this.game, recipes = this.unlockedRecipes();
    this._sig = this.station + "|" + recipes.map((r) => r.id).join(",");
    const rows = recipes.map((r) => {
      const ok = g.craftable(r);
      const cost = r.in.map(([it, k]) => `${k} ${itemName(it)} (${g.inventory[it] || 0})`).join(", ");
      return `<div class="recipe ${ok ? "" : "no"}" data-id="${r.id}">` +
        `<div class="rname">${itemName(r.out[0])}${r.out[1] > 1 ? " ×" + r.out[1] : ""}</div>` +
        `<div class="rcost">${cost}</div></div>`;
    });
    const note = this.station === "workbench" && !g.hasWorkbench()
      ? `<div class="rcost" style="margin-bottom:8px">place a workbench in this room to use these</div>` : "";
    const empty = recipes.length ? "" : `<div class="dim">nothing researched yet — gather materials to unlock recipes</div>`;
    this.list.innerHTML = note + (rows.join("") || empty);
  }

  // cheap per-frame refresh: update affordability/counts IN PLACE (no node churn)
  refresh() {
    if (!this.open) return;
    const g = this.game, recipes = this.unlockedRecipes();
    const sig = this.station + "|" + recipes.map((r) => r.id).join(",");
    if (sig !== this._sig) { this.renderList(); return; } // set changed → rebuild once
    const nodes = this.list.querySelectorAll(".recipe");
    recipes.forEach((r, i) => {
      const n = nodes[i]; if (!n) return;
      n.classList.toggle("no", !g.craftable(r));
      const cost = n.querySelector(".rcost");
      if (cost) cost.textContent = r.in.map(([it, k]) => `${k} ${itemName(it)} (${g.inventory[it] || 0})`).join(", ");
    });
  }
}
