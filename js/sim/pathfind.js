// sim/pathfind.js — pathfinding across the non-euclidean room graph
//
// Belts and walkers don't live in one continuous plane — space is a graph of
// rooms stitched by doorways. So a path is a walk over tiles WITHIN a room that
// hops to another room's tiles when it reaches a doorway (a portal edge). The
// non-euclidean transforms only matter for *drawing* the path; for connectivity
// a door is just an edge, so a plain breadth-first search finds the shortest
// hop-count path. One-way (locked) doors are directed edges.
//
// A node is { room: id, tx, ty }. findPath returns an ordered list of nodes
// (room changes mark portal crossings) or null.

const key = (r, x, y) => r + ":" + x + ":" + y;

// the floor tile just inside a door opening
function innerTile(room, door) {
  const c = door.center;
  switch (door.side) {
    case "N": return { x: clamp(Math.floor(c), 0, room.w - 1), y: 0 };
    case "S": return { x: clamp(Math.floor(c), 0, room.w - 1), y: room.h - 1 };
    case "W": return { x: 0, y: clamp(Math.floor(c), 0, room.h - 1) };
    case "E": return { x: room.w - 1, y: clamp(Math.floor(c), 0, room.h - 1) };
  }
}
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// portal edges leaving a room: map "x,y" (an inner door tile) -> {room,tx,ty}
function portalsOf(rooms, room) {
  const map = new Map();
  for (const d of room.doors) {
    if (d.locked) continue; // can't leave through a door locked on this side
    const here = innerTile(room, d);
    const nb = rooms[d.link.room];
    const there = innerTile(nb, nb.doors[d.link.door]);
    map.set(here.x + "," + here.y, { room: nb.id, tx: there.x, ty: there.y });
  }
  return map;
}

const walkable = (rooms, r, x, y) => {
  const room = rooms[r];
  return room.inBounds(x, y) && !room.solidAt(x, y);
};

export function findPath(rooms, start, goal) {
  if (!walkable(rooms, start.room, start.tx, start.ty)) return null;
  const goalKey = key(goal.room, goal.tx, goal.ty);
  const came = new Map();
  const startKey = key(start.room, start.tx, start.ty);
  came.set(startKey, null);
  let frontier = [start];
  const portalCache = new Map();
  const portals = (rid) => {
    if (!portalCache.has(rid)) portalCache.set(rid, portalsOf(rooms, rooms[rid]));
    return portalCache.get(rid);
  };

  while (frontier.length) {
    const next = [];
    for (const cur of frontier) {
      if (key(cur.room, cur.tx, cur.ty) === goalKey) return rebuild(came, cur);
      // 4-adjacent tiles in the same room
      const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of steps) {
        const nx = cur.tx + dx, ny = cur.ty + dy;
        if (!walkable(rooms, cur.room, nx, ny)) continue;
        const k = key(cur.room, nx, ny);
        if (came.has(k)) continue;
        came.set(k, cur);
        next.push({ room: cur.room, tx: nx, ty: ny });
      }
      // portal hop through a doorway
      const portal = portals(cur.room).get(cur.tx + "," + cur.ty);
      if (portal && walkable(rooms, portal.room, portal.tx, portal.ty)) {
        const k = key(portal.room, portal.tx, portal.ty);
        if (!came.has(k)) { came.set(k, cur); next.push(portal); }
      }
    }
    frontier = next;
  }
  return null;
}

function rebuild(came, end) {
  const path = [];
  let n = end;
  while (n) { path.push(n); n = came.get(key(n.room, n.tx, n.ty)); }
  return path.reverse();
}
