# Backrooms Factory (prototype)

A browser game I put together as a prototype for an AI game jam through a UNCA
program. It's a top-down Backrooms walking sim that turns into a factory builder,
and the gimmick is that the space is non-euclidean, so rooms loop around and
connect in ways that don't add up if you try to map them.

It's just a proof of concept to see if the idea actually plays well. The real
version is getting built in Godot later. This web build was the fast way to find
out whether the core loop was fun before committing to it.

## Credits
The art, sprites and tilesets are all mine (jothest2pid), and so is the design. I
wrote the whole thing out as a fairly big GDD first, and everything here follows
from that.

## Running it
It has to be served over http or the modules won't load:

```
python -m http.server 8000
```

Then open localhost:8000. Everything is static files so you can host it anywhere
that serves static pages, including GitHub Pages.

## Controls
WASD or the arrow keys move, shift runs. Right click mines ore, breaks furniture,
strips carpet, or pulls up something you placed. Left click uses whatever you're
holding, so that's placing a building, shooting, throwing, or eating, and it also
works machines. 1 through 9 pick a hotbar slot. C is crafting and the tinker
bench, I is your inventory and gear. B is build mode, R rotates what you're about
to place, and V is a quick blink if you've got the trinket for it. ~ is god mode
and P shows debug stats.

## What's actually in it
You wander around breaking stuff for materials and slowly start automating. Belts
carry items, and you drop processors onto the belts that change whatever rides
past them, so a smelter turns ore into ingots as it goes by. There are bigger
machines too like the forge, assembler and an alchemy cauldron, and power runs on
a grid that browns out if you pull more than you make. You get ten equipment slots
and a pile of trinkets you can fuse at a tinker bench into stronger ones. There's
loot, a few kinds of weapons, some light combat against things in the dark rooms,
and you can floor and wallpaper your base if you want it to look nice.

Written in plain JavaScript with no engine and no build step.
