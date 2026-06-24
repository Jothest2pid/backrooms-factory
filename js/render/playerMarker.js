// render/playerMarker.js — the player dot + facing triangle

export function drawPlayer(ctx, player) {
  const p = player.pos;
  ctx.save();
  ctx.shadowBlur = 22;
  ctx.shadowColor = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(p.x, p.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f4f4ec";
  ctx.fill();
  ctx.shadowBlur = 0;

  const ang = Math.atan2(player.dir.y, player.dir.x);
  const tip = { x: p.x + Math.cos(ang) * player.radius * 1.7, y: p.y + Math.sin(ang) * player.radius * 1.7 };
  const lA = ang + 2.5, rA = ang - 2.5;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(p.x + Math.cos(lA) * player.radius, p.y + Math.sin(lA) * player.radius);
  ctx.lineTo(p.x + Math.cos(rA) * player.radius, p.y + Math.sin(rA) * player.radius);
  ctx.closePath();
  ctx.fillStyle = "#2a2a1c";
  ctx.fill();
  ctx.restore();
}
