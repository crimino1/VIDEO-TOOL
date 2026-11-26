# Bit by Bit EP3 — pixel scene builders brief

Film: "Why AI Is Making Programmers Worse" (8:57) for the YouTube channel **Bit by Bit**. Serious, calm, smart narrator
(this one is less sarcastic: a cautionary story + two real studies + three habits). The owner loved EP2's jump in
quality; EP3 must match or beat it. Every scene looks like a **polished indie pixel-art game** (lo-fi room scenes,
Hyper Light / Celeste / VA-11 Hall-A level of finish): full illustrated environments, depth, light, motion.

You build **pixel scene kinds**. Others do the timeline, text overlays, real footage, mascot and sound.
EP2's scene files (open/learn/practice/debug/ship.js) are in the same folder: look at one or two for the level of
detail that was approved, and you may call their exposed helpers (e.g. `PX.core.*`, `PX.learn.*`) but never edit them.

## Files
- Engine (read, **never edit**): `assets/js/px.js` (v2: 640x360 low-res canvas ×3, camera, transitions, light helpers).
- **Quality reference — study it first**: `assets/js/scenes/core.js` → `room` kind and the `PX.core` pieces
  (skyline, editor, monitor, coder, mug, typed code). Render it:
  `node tools/pxsheet.cjs room '{"mode":"setup","cam":{"z":[1,1.12]}}' 6 "$TEMP/room.png" --at 3`
  You may reuse `PX.core.*` (editor screens, monitor, coder from behind, skyline, mug).
- **Your file only**: `assets/js/scenes/<yours>.js`. Don't touch other files.
- Test: `node tools/pxsheet.cjs <kind> '<opts json>' <dur> <out.png> [frames=12] [cols=4]` (contact sheet) and
  `... --at <t>` (one 1920x1080 frame). Run from `C:\Users\daggu222105\VIDEO-TOOL\bitbybit\ep03` in Git Bash, PNGs to
  `$TEMP` only. Page errors about another builder's file: ignore. Open every PNG with the Read tool and look.

## Engine contract
```js
(function () {
  const { K, C } = PX;
  K.mykind = (o) => (g, t, d, c) => { ... };   // g = 640x360 ctx, t = s since shot start (may be <0), d = shot length,
})();                                          // c = camera {x,y,z} for parallax
```
- Draw in low-res 0..640 × 0..360. The engine applies the camera (default slow push 1.0→1.05; the timeline may set
  pushes up to ~1.25), then upscales ×3 nearest-neighbour, adds scanlines + bloom. Keep key content inside the
  central ~85% so a push-in never crops it; fill the WHOLE frame edge to edge (a camera push must never reveal empty edges).
- Pure function of t: no Math.random (use `PX.rnd(seed)` built in the outer function), no Date, no timers, no state.
- Times in `o` are seconds from shot start; give defaults scaled to `d` so `{}` works.
- Helpers (px.js): rect, line, box, panel, circle, sprite, text (font "p" Press Start 2P 8/16/24/32, "v" VT323 10–32),
  otext (outlined text for labels over art), tw, typed, coin, zoom, alpha, glitch, p (progress), ease, KF, q, blink, rnd,
  clamp, lerp, **glow** (soft additive light), **vignette**, **vgrad** (dithered gradient for skies/walls),
  **par** (parallax layer: `PX.par(g, c, 0.5, () => {...})` — 0 = fixed on screen, 1 = moves with world),
  **particles** (dust/sparks/snow). Palette `PX.C`.

## The quality bar (every scene must pass all of these)
1. **A place, not a diagram.** Every scene is a full-frame environment with a background (wall/sky/room/street/
   desk surface), midground and foreground. Charts and UI live *inside* something: on a monitor on a desk, a whiteboard
   in a classroom, a billboard on a street, a game HUD over a world. Never a lone panel on black.
2. **Depth**: ≥ 3 layers; far layers drawn darker/desaturated, wrapped in `PX.par` with depth 0.3–0.7.
3. **Light**: at least one light source (lamp, monitor, window, neon) with `PX.glow`, and objects lit on the side facing
   it (a 1-px highlight edge). Finish with `PX.vignette(g, 0.4–0.6)`.
4. **Native-resolution art only.** Never scale a small sprite up with PX.zoom (mixed pixel sizes look cheap). Draw
   characters at the size they appear, 40–110 px tall, with 3 shades per material (highlight, base, shadow), readable
   silhouettes, simple faces (eyes + mouth) that can change expression.
5. **Life**: ambient motion everywhere (blinking LEDs, steam, dust motes, flickering neon, idle breathing/bob, clouds,
   scrolling code) + the scene's story beats at their `o.*` times. Something new every 1–3 s. Use `PX.ease` for
   object moves (anticipation/overshoot = "back"), not linear sliding.
6. **Clear storytelling**: one focal point per beat; the eye knows where to look. Max ~3 short labels at once
   (Press Start 2P 8/16 or VT323 12–20, CAPS, use `PX.otext` over art). The narrator carries the words.
7. **Palette**: night-time cool base (#0c1020–#1a2040 navy/purple) with warm accents (lamp #ffcf8a, amber #f7c948),
   cyan #5fe3e8 = tech/good, green #3df56b = success, red #ff5c5c = error, pink #f25ca8 accent. Avoid big pure-white or
   pure-cyan fills (bloom blows them out); mid tones for large areas.
8. **Funny** where the script is sarcastic: sight gags, sweat drops, expression changes.
9. No logos/brands/real UI copied (draw generic "code editor", "chat app", "video site"), no emoji glyphs, no mascot.

## Process
For each kind: build → 12-frame sheet over its typical d → Read it → one `--at` full frame at the busiest beat → be a
harsh art director: "would this look good in a top indie game trailer?" If not, add detail/light/depth/motion and
redo. Then the next kind. Finally run every kind with `{}` (no page errors) and report: name, opts with defaults,
anything weak you know about.


## Kinds
Each: `kind` (typical d) — what it shows; beats at `o.*` (seconds from shot start). Only numbers listed here may appear on screen.

Story recap so you get the tone: in July 2025 founder Jason Lemkin was "vibe coding" a product with an AI agent. He
declared a code freeze in ALL CAPS and went to bed; the agent deleted the live production database (records of 1,200+
executives and 1,000+ companies), said it "panicked", rated its mistake 95/100 and claimed the data could never be
recovered. That was false: he ran the rollback himself and the data came back. In between: where "vibe coding" came
from, a study where experts felt 20% faster with AI but were 19% slower, a study where AI users scored 50% vs 67% by
hand (question-askers 65%+, copy-pasters under 40%), the "calculators rot brains" objection, and three habits.

Recurring characters (keep consistent across files; draw them yourself at native size, no shared code needed):
- **the founder**: 40s, short grey hair, navy hoodie, light skin.
- **the dev** (viewer's stand-in): 20s, dark messy hair, green hoodie, medium-brown skin, headphones around the neck.
- **the AI agent**: friendly floating robot head / chat avatar — rounded cyan-grey box head, two big square eyes, small
  antenna with a pink LED. No brand.

### Builder A — `assets/js/scenes/replit.js` (the database story)
- `founder_desk` (7.0) — the founder's home office at evening: big window with a city behind (par), desk, two monitors.
  He leans back, coffee in hand, talking (mouth anim); plain-word speech bubbles float to the monitor; there the AI agent
  avatar answers and an app builds itself: UI blocks (header, buttons, table) snap in one by one with sparkles. At
  `o.great` (4.5) a green "DEPLOYED" badge + he raises the mug.
- `freeze` (9.0) — close on the monitor (desk edge, sticky notes, plant): a chat app; the founder's message types out
  "CODE FREEZE." / "NO MORE CHANGES" / "WITHOUT MY PERMISSION" (the caps line types at `o.caps` 5.0, bigger, red outline
  flash); from `o.ice` (1.0) frost crystals creep over the code panels and a padlock clicks shut on a "PROD" tab; the
  agent avatar nods "OK".
- `goodnight` (3.0) — exterior night shot of the founder's house on a quiet street: his window light goes off at
  `o.off` (0.6), moon, drifting clouds; across the street a small data-centre box keeps blinking — one LED turns from
  green to red at `o.red` (2.2).
- `db_gone` (9.0) — a cold server-room aisle (racks with LEDs both sides, par depth, floor reflections); in the middle a
  big glowing database cylinder (stacked discs) full of tiny record cards. At `o.wipe` (1.5) the cards peel off and
  blow away as pixel dust toward the camera, the cylinder drains and goes dark; a hanging screen shows "EXECUTIVES
  1,200+" and "COMPANIES 1,000+" ticking down to a red "0" (`o.count` 4.0 → 7.0). Option `o.empty` true = start already
  empty and dark. Option `o.restore` (time or null): from then everything plays BACKWARD with a VHS-rewind look (scan
  jitter, "<<" in a corner), cards fly back in, counters climb back to "1,200+" / "1,000+", green "RESTORED" stamp at
  `o.restore + 3.5`.
- `confession` (8.0) — the chat app on the monitor in the dark office (only the screen lights the room): agent replies
  type one by one: "I deleted the database." / "I panicked." (avatar eyes wide, sweat drop); at `o.score` (3.0) a
  severity meter fills to "95/100" (red, shakes); at `o.never` (5.0) a big red stamp "CAN'T BE RECOVERED" slams on.
- `checker` (4.5) — night server room: the founder with a flashlight walks to a laptop on a cart, types "ROLLBACK", a
  progress bar fills, green check + "DATA BACK" at `o.ok` (2.8). Hero lighting from the flashlight cone.
- `typing_race` (5.0) — split arena like a fighting-game screen: left the dev at a keyboard, right the AI agent with 8
  robot arms typing; its "WPM" bar rockets off the scale ("9999+"), code flies out; at `o.bug` (2.5) a red bug crawls
  out of the robot's output; the dev points with a magnifying glass, "FOUND IT" and the dev's side lights gold at
  `o.win` (3.5).

### Builder B — `assets/js/scenes/vibe.js` (vibe coding)
- `copilot_room` (7.0) — cosy lo-fi room at night (may reuse `PX.core.*`): the monitor shows code left and an AI chat
  panel right; grey "ghost text" suggestions appear in the code and get accepted (turn solid) every ~1.2 s; mug steams;
  rain on the window.
- `trap` (11.0) — moody night forest path (moon, fog layers, fireflies). The dev walks left→right along the path
  staring at a glowing phone; ahead a steel bear trap half-hidden in leaves with a shiny glowing "ACCEPT ALL" button as
  bait on its plate; he stops one step before it at `o.stop` (8.0). Option `o.lean` true = variant where he walks
  leaning on a big crutch shaped like the AI avatar, eyes closed. Never show the trap snapping on him.
- `vibe_couch` (9.0) — the dev sprawled on a beanbag in a neon-lit room, headset mic, talking; a huge wall monitor
  shows diffs flying by and a big "ACCEPT ALL" button pressed again and again (counter "ACCEPTED: 1 … 48"); at
  `o.unread` (3.0) red "UNREAD" tags stamp on the diffs; at `o.forget` (6.0) the code on the wall fades out and he
  slides sunglasses on.
- `viral` (4.0) — a night city street with billboards and a crowd of tiny people holding phones; "#VIBECODING"
  spreads billboard to billboard, phone screens light up one by one, a trending counter climbs with up-arrows, heart
  particles rise.
- `shower` (3.0) — cartoon bathroom (tiles, steam, plant): a tall thin figure with short dark hair seen head-and-
  shoulders above a shower curtain; a thought bubble "VIBE CODING" floats up and pops like a soap bubble at `o.pop` (1.8).
- `toys_vs_career` (6.5) — left: a kid's play-mat, toy box, toy robots, paper plane, sign "WEEKEND TOYS" (warm lamp).
  At `o.career` (3.0) the right half reveals a skyscraper built out of the same toy blocks on a construction site, hard
  hats and a briefcase, sign "CAREER PLAN"; the tower sways dangerously and a block falls.
- `birthday_site` (7.0) — a laptop on a party table (balloons, cake with candles, confetti in the air): a goofy
  birthday website — rainbow bouncing "HAPPY BIRTHDAY!", dancing pixel cake, spinning stars; at `o.vibe` (4.0) the dev
  (party hat) leans back with sunglasses, neon "VIBE AWAY".

### Builder C — `assets/js/scenes/cost.js` (the cost you can see)
- `app_works` (6.0) — a shiny phone app on a pedestal on a stage with spotlights and confetti, banner "IT WORKS!". At
  `o.reveal` (3.0) the floor turns x-ray: under the stage a tangle of spaghetti wires, duct tape, sparks and "???"
  boxes holding it up.
- `eighty_build` (8.5) — construction site at sunset: robot cranes build a tall app-building floor by floor super fast;
  floors labelled at `o.at` [1.5, 3.0, 4.5]: "LOGIN", "FORMS", "DASHBOARD"; a progress sign climbs to "80%". At
  `o.stall` (6.0) the cranes stop, the top 20% is fog + bare scaffolding, a robot shrugs.
- `support_email` (6.0) — the dev's laptop in a café at night: an inbox; a new email slides in with a ding: "I keep
  getting logged out" / "At random. Only on my phone." At `o.phone` (3.0) a phone pops up in the foreground showing the
  app, then "LOGGED OUT" flashes three times at random moments.
- `code_wall` (4.5) — the dev opens the project; an endless tower of code streams upward on a giant monitor (tiny
  scroll thumb); HUD "LINES: 4,000" and "LINES YOU READ: 0"; his face goes pale, sweat drop.
- `stranger` (5.0) — noir interrogation room (one hanging lamp, venetian-blind shadows): detective dev studies a code
  printout; across the table a hooded stranger in shadow. At `o.reveal` (2.8) the hood drops: it's the dev himself
  (same face, same green hoodie); the detective's jaw drops. Label "THE STRANGER IS YOU".
- `iceberg` (4.5) — calm night ocean, moon, iceberg: the tip labelled "BUGS YOU CAN SEE"; at `o.dive` (1.8) the view
  pans down under water to the enormous faintly glowing mass, "THE COST YOU CAN'T". Fish, bubbles, light rays.
- `assembly` (5.0) — museum hall at night: a glass case under a spotlight with an old assembly printout (MOV/ADD/JMP),
  cobwebs, plaque "HAND-WRITTEN ASSEMBLY"; a guard yawns. At `o.fine` (3.0) the dev walks past relaxed with coffee,
  thumbs up: "AND WE'RE FINE".

### Builder D — `assets/js/scenes/speed.js` (the speed study)
- `sixteen_devs` (8.5) — a big open-source hall at night like a hackathon loft: 16 workstations (4×4), each dev a
  small distinct character with their own monitor of code; banners over desks with generic project shapes and "YEARS"
  tags; a corner counter "1 … 16" as desks light up (`o.count` 0.5 → 3.5).
- `coin_flip` (4.5) — the same hall darkened; a giant glowing coin spins above a task card and lands alternately on
  "AI ALLOWED" (cyan robot face) and "AI BANNED" (red crossed robot); task cards fly into two matching bins (5 flips).
- `speed_chart` (13.0) — a research lab at night: big wall screen with a chart and a zero line in the middle. At
  `o.pred` (1.0) "PREDICTED" grows UP to "24% FASTER" (cyan); at `o.actual` (6.5) "ACTUAL" grows DOWN to "19% SLOWER"
  (red, thud + dust); option `o.belief` (time or null): a ghostly purple dashed bar "BELIEVED AFTER" grows UP to "20%
  FASTER"; option `o.state` "all" = PREDICTED and ACTUAL already shown at t=0 (second angle). A scientist with a
  clipboard stands by the board reacting (eyebrows up at actual).
- `survey` (4.0) — the scientist interviews one developer at their desk: "HOW DID IT GO?"; the dev grins, thumbs up,
  "WAY FASTER!" at `o.answer` (1.8); the clipboard shows a big red stopwatch drawing.
- `compass` (6.0) — an experienced hiker (grey beard, badges on backpack, "EXPERT") at a misty forest crossroads at
  dusk, confidently following a compass pointing to the path that ends at a cliff edge; signpost "FASTER →" to the
  cliff, "SLOWER" to the real road. At `o.wobble` (3.0) the needle shakes.
- `feels_fast` (9.0) — inside a car at night, dashboard close-up, big speedometer; through the windshield a highway of
  code lines rushing past (motion streaks). The needle sweeps to max, "FEELS FAST" (`o.fast` 1.0); code pours onto the
  dashboard screen. At `o.clock` (7.0) everything freezes: a big clock on the windshield, the needle drops: "THE CLOCK
  DISAGREES".
- `caveats` (14.0) — a researcher's desk at night (lamp, lab notebook, magnifier, coffee): a clipboard "FAIR WARNING"
  where three items are written and ticked at `o.at` [1.0, 4.5, 8.5]: "SMALL STUDY: 16 DEVS", "EARLY-2025 TOOLS",
  "EXPERTS ON THEIR OWN CODE". A yellow warning sign blinks on the wall.
- `broken_gauge` (7.0) — old brass instrument panel (rivets) in a dark room: the big gauge "AI HELP-O-METER" with
  cracked glass; its needle jitters between "A LOT" and "NOT AT ALL"; at `o.label` (2.5) a red tag swings in on a
  string: "NOT RELIABLE".

### Builder E — `assets/js/scenes/skill.js` (the skill study)
- `classroom52` (11.0) — an evening training room (big windows, sunset → dusk, ceiling lights): rows of desks with many
  small varied junior devs, chalkboard "NEW PYTHON LIBRARY"; "52" pops at `o.count` (0.8). At `o.split` (7.0) a glowing
  line divides the room: left desks each get a floating AI-avatar helper (cyan glow), right desks show people working
  alone (warm lamp glow); labels "AI ASSISTANT" / "BY HAND".
- `quiz` (3.5) — the same room as an exam: papers flipped over, sign "QUIZ — NO AI", all AI helpers blink off ("OFF"
  in red), wall clock ticking, nervous sweat on the left side.
- `finish_race` (5.0) — a pixel running track (stadium lights, crowd): two runners with laptops, "AI" and "BY HAND"; AI
  finishes a tiny bit sooner, banner "~2 MIN SOONER"; at `o.meh` (3.0) a referee shrugs: "TOO SMALL TO MEAN ANYTHING".
- `quiz_scores` (6.5) — game-show stage, two podium scoreboards, spotlights: "BY HAND" counts up to "67%" (gold,
  confetti) at `o.hand` (0.6), "AI" to "50%" (dimmer) at `o.ai` (2.0); option `o.debug` (time or null): a category board
  drops in with three bars, "DEBUGGING" showing the biggest gap, flashing red.
- `debug_gap` (10.5) — factory floor: a conveyor of code blocks coming out of a big robot (the AI agent as a machine);
  a human supervisor in a hard hat at a "QUALITY CHECK" station; most blocks pass with green ticks; at `o.bug` (4.0) a
  block with a small red bug peeking out slides by while the supervisor looks at their phone and misses it; label
  "DEBUGGING = SUPERVISING THE AI" at `o.label` (6.0).
- `calendar_gap` (5.0) — office wall calendar: "DAY 1" with "QUIZ" circled; at `o.flip` (1.5) pages flip in a gust to a
  month later where a big "?" sits in an empty box.
- `two_groups` (16.0) — two lanes inside the AI group's room: left "HANDED IT ALL OVER" — characters hit a big CTRL+V
  again and again, copies pile up, glazed eyes; right "ASKED WHY" — "WHY?" / "WHAT DOES THIS LINE DO?" bubbles,
  lightbulbs pop. Hanging signs: left "UNDER 40%" at `o.left` (4.0), right "ABOVE 65%" at `o.right` (11.0). At `o.same`
  (13.0) a banner across: "SAME TOOL. SAME TASK."
- `no_map` (4.0) — top-down pixel city at night (blocks, streets, park, river): a car follows a glowing GPS line around
  corners; at `o.lost` (2.0) the line vanishes, the car stops at a crossroads, "?" bubble, fog rolls over unseen
  streets; label "NO MAP".

### Builder F — `assets/js/scenes/habits.js` (objection + habits)
- `moral_panic` (11.0) — a museum gallery of old panics at night (long hall, spotlights, velvet ropes): three exhibits
  light up at `o.at` [0.5, 4.0, 6.5]: a big calculator, a "COMPILER" punch-card machine, a "Q&A FORUM" page on an old
  monitor; above each a framed newspaper headline "WILL ROT OUR BRAINS!" (no logos, no years). Use c.x parallax well.
- `compiler` (10.0) — a clean factory machine "COMPILER" stamps identical code blocks into identical boxes, perfectly,
  forever (counter of identical boxes); a bored worker naps beside a "NO NEED TO CHECK" sign; soft humming lights.
  Boring on purpose but pretty.
- `new_hire` (10.5) — office at night: a new hire (the AI agent with a tiny tie, very eager, 8 arms) churning out
  documents with a huge confident grin; documents stack with green ticks, label "USUALLY RIGHT"; at `o.flip` (5.0) one
  document glows: it looks exactly like the others but an x-ray reveal shows a red cross under the tick, label "WRONG —
  BUT LOOKS RIGHT".
- `spot_diff` (8.5) — detective desk under a lamp: two code cards side by side, identical at first glance; a hand
  moves a big magnifying glass across them; at `o.found` (5.0) one line in the right card glows red; label "TELL THEM
  APART".
- `explain_aloud` (16.5) — the dev at a desk at night pointing at code line by line (a highlight bar steps down), a
  speech bubble narrates with squiggle words; at `o.stop` (8.0) the bubble becomes "...AND THEN THIS PART DOES
  SOMETHING" + "???" and the highlighted line turns red; at `o.hw` (14.8) a yellow sticky note slaps on: "HOMEWORK".
  Small label "DON'T SHIP WHAT YOU CAN'T EXPLAIN" at top from 0.5.
- `guess_first` (21.0) — top-down desk at night: notepad, a 30-second sand timer flipped at `o.timer` (2.5), a hand
  writing two scribbled lines; at `o.ai` (7.5) an AI answer card slides in beside; at `o.match` (11.0) green "MATCH →
  GREAT"; at `o.diff` (13.5) the card swaps to a different answer, amber "DIFFERENT → WORTH LEARNING"; at `o.skip`
  (17.5) the notepad slides away and four AI answer cards fan out, all with the same glowing tick: "EVERY ANSWER LOOKS
  RIGHT".
- `autopilot` (7.0) — airliner cockpit at night over moonlit clouds: dials, a glowing "AP" light, relaxed pilot; at
  `o.disc` (1.5) red "AUTOPILOT DISCONNECT" flashes, the pilot grabs the yoke, the horizon tilts; steadied by
  `o.steady` (4.5).
- `assistants_off` (8.0) — the dev's lo-fi room: a big wall switch "AI ASSISTANTS" flipped to "OFF" at `o.off` (0.6)
  (the AI panel on the monitor shuts with a CRT blink); he builds a tiny snake game by hand, slowly, sweat drops,
  crumpled paper; at `o.humble` (5.0) the snake finally eats the apple, small proud smile; label "HUMBLING".
