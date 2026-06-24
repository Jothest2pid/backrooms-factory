// render/playerMarker.js — the player, drawn Stardew-style as a front-facing
// walk sprite (feet near the position, body extending up). Only the "down" walk
// exists for now, so the character always faces the camera. Falls back to a disc
// marker until the sprite decodes.

const sheet = new Image();
let ready = false;
sheet.onload = () => (ready = true);
sheet.src = "sprites/people/player/walk.png";

const FW = 32, FH = 32, FRAMES = 4; // 128x32 strip, 4-frame walk cycle
const TALL = 1.5;                   // sprite height in world tiles

export function drawPlayer(ctx, player) {
  const p = player.pos;
  if (ready) {
    const f = player.moving ? Math.floor((player.animClock || 0) * 8) % FRAMES : 0;
    const w = TALL * (FW / FH), h = TALL;
    const sm = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false; // crisp pixel art
    // anchor: feet a touch below the logical position, body rising upward
    ctx.drawImage(sheet, f * FW, 0, FW, FH, p.x - w / 2, p.y - h * 0.72, w, h);
    ctx.imageSmoothingEnabled = sm;
    return;
  }
  // fallback marker (sprite not yet decoded)
  ctx.save();
  ctx.shadowBlur = 22;
  ctx.shadowColor = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(p.x, p.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f4f4ec";
  ctx.fill();
  ctx.restore();
}
