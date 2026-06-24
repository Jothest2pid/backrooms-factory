// config.js — all tunable constants in one place

// rendering
export const PX = 34;        // screen px per world unit (zoom)
export const BAKE = 40;      // px per world unit rooms are pre-rendered at
export const CARPET_T = 64;  // carpet tile texture size (px)

// movement
export const WALK = 7.5;
export const RUN = 13;
export const TRAVERSE_COOLDOWN = 0.08;

// world — infinite, streamed: rooms (the "chunks") generate lazily behind doors
export const STREAM_DEPTH = 3;  // how many rooms ahead of the player to keep loaded
export const DOOR_W = 1.3;      // door opening width
export const PLAYER_R = 0.35;

// room sizing
export const ROOM_MIN = 9;
export const ROOM_MAX = 15;
export const BIG_MIN = 22, BIG_MAX = 30;   // bigger-on-the-inside
export const SMALL_MIN = 5, SMALL_MAX = 7; // smaller-on-the-inside
