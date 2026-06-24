// model/player.js — the wanderer

import { PLAYER_R } from "../config.js";

export class Player {
  constructor(pos) {
    this.pos = pos;            // position in the CURRENT room's local space
    this.radius = PLAYER_R;
    this.dir = { x: 0, y: 1 }; // last facing direction (for the marker)
  }
}
