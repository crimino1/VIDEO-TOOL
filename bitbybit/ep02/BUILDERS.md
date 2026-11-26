# Bit by Bit EP2 — pixel scene builders brief (QUALITY BAR RAISED)

Film: "How to Actually Get Good at Coding" (9:06) for the YouTube channel **Bit by Bit**. Sarcastic, smart narrator.
The owner rejected the last episode's visuals as "not very high quality". This time every scene must look like a
**polished indie pixel-art game** (think lo-fi room scenes, Hyper Light / Celeste / VA-11 Hall-A level of finish):
full illustrated environments, depth, light, motion. Not icons floating on black. Not clip-art.

You build **pixel scene kinds**. Others do the timeline, text overlays, stock footage, mascot and sound.

## Files
- Engine (read, **never edit**): `assets/js/px.js` (v2: 640x360 low-res canvas ×3, camera, transitions, light helpers).
- **Quality reference — study it first**: `assets/js/scenes/core.js` → `room` kind and the `PX.core` pieces
  (skyline, editor, monitor, coder, mug, typed code). Render it:
  `node tools/pxsheet.cjs room '{"mode":"setup","cam":{"z":[1,1.12]}}' 6 "$TEMP/room.png" --at 3`
  You may reuse `PX.core.*` (editor screens, monitor, coder from behind, skyline, mug).
- **Your file only**: `assets/js/scenes/<yours>.js`. Don't touch other files.
- Test: `node tools/pxsheet.cjs <kind> '<opts json>' <dur> <out.png> [frames=12] [cols=4]` (contact sheet) and
  `... --at <t>` (one 1920x1080 frame). Run from `C:\Users\daggu222105\VIDEO-TOOL\bitbybit\ep02` in Git Bash, PNGs to
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
Each: `kind` (typical d) — what it shows; beats at `o.*` (seconds from shot start).

### Builder A — `assets/js/scenes/open.js`
- `keeb` (3.2) — extreme close-up of a chunky mechanical keyboard on a desk at night: big keycaps (3D: top face, side
  shade, legend letters), RGB under-glow cycling, keys pressing in sequence with "CLACK!" comic pops; a hand's fingers
  (simple, skin shaded) hit keys; shallow depth (blurred-looking darker desk items behind via par).
- `neovim` (7.0) — a monitor fills most of the frame (desk edge + wall behind): terminal with a big block-letter ASCII
  splash "NVIM", then a plugin manager installing: rows "installing plugin 37/412 ███░░" racing; a wall calendar beside
  the monitor flips FRI → SAT → SUN at `o.days` [1.5, 3.0, 4.5]; a window behind goes day → night → day; energy drink
  cans pile up on the desk. At `o.done` (5.8) the screen shows "0 projects" blinking.
- `tutorials` (5.5) — a video-site page on a big monitor: grid of 8 video thumbnails (each a tiny code scene + duration
  badge), a big player playing a tutorial with "2x" badge; the viewer's progress bars race to full one after another;
  a counter "WATCHED: 1 → 347"; reflection of the screen on the viewer's glasses in the foreground (back of head + glasses edge).
- `logo2` (2.4) — channel sting: an old CRT TV on a desk in a dark room powers on (white line → expands), static,
  then pixels assemble into "BIT BY BIT" (Press Start 2P 24/32, cyan with yellow drop shadow) next to a 16x16 cyan
  pixel cube with eyes + smile (the channel mascot head icon only), scanline shimmer, by `o.done` (1.4).
- `two_paths` (11) — split screen with a wall between, two rooms: LEFT "FEELS LIKE PROGRESS" — someone on a beanbag
  watching tutorials, a giant "progress" bar on the wall filling and sparkling; RIGHT "ACTUAL PROGRESS" — someone at a
  messy desk building, errors popping, a small staircase growing step by step behind them. Labels at `o.labels` (1.0).
  At `o.reveal` (6.0) the left bar turns out to be painted on the wall (it peels off); right staircase keeps climbing.
- `quit_curve` (7.5) — a mountain at sunset in pixel art: a winding trail, a tiny climber turning back near a glowing
  summit marked "?"; ghost footprints of many others turning back at the same spot; at `o.q` (3.0) "MOST PEOPLE QUIT HERE"
  sign appears at the turn.
- `secbg` (any) — section-card backdrop: synthwave pixel horizon (purple/pink grid floor scrolling toward the viewer,
  sun with stripes, distant mountains, stars). Leave the middle third calm (text goes there).
- `recap` (18.6) — a quest-complete style board in a cozy room (cork board on a wall, lamp light): 6 cards pin on at
  `o.at` [6 times] each with a big pixel icon: TV with X (stop counting watched), box slightly too big, target, open
  book, hourglass/brain, rocket to a person. Short labels: "STOP WATCHING", "BUILD TOO BIG", "PRACTICE WEAK SPOTS",
  "READ BETTER CODE", "STRUGGLE FIRST", "SHIP TO HUMANS". Each pin lands with a bounce + dust.
- `outro` (8.0) — the room at dawn (reuse PX.core): window turning orange, the coder stretching; a big pixel
  "SUBSCRIBE" button on the monitor gets clicked at `o.press` (1.5) (cursor), turns "SUBSCRIBED"; at `o.comment` (3.5) a
  comment card types "WHAT ARE YOU BUILDING?".

### Builder B — `assets/js/scenes/learn.js`
- `gauge` (3.8) — a car-dashboard style console in a dim cockpit/desk: two big analogue gauges with glowing needles:
  "CONFIDENCE" needle swings to max (red zone, shaking), "SKILL" needle barely moves; at `o.wrong` (2.0) a warning light
  "WRONG METER" blinks.
- `recog` (8.0) — a classroom: LEFT a whiteboard multiple-choice question "WHAT DOES THIS PRINT?" A/B/C, a student
  instantly ticks B (green, smug face); RIGHT a blank exam paper on a desk "WRITE IT FROM SCRATCH", the same student
  sweating, pencil frozen. Labels at `o.labels` (5.0): "RECOGNITION" over left, "RECALL" over right; then
  "TUTORIAL" and "YOUR JOB" tags at `o.tags` (6.5).
- `test` (17) — laptop on a bed/desk at night (close): beats: tutorial window open (video player) → at `o.close` (2.0)
  cursor clicks X, it shrinks away → `o.blank` (3.5) blank editor, blinking cursor → `o.peek` (6.0) sticky note "NO
  PEEKING" slaps on the screen bezel, a hand covering the tutorial tab → `o.timer` (9.6) a kitchen timer 00:00 → 10:00
  ticking fast, coder (from behind, PX.core.coder) stuck, sweat → `o.flag` (13.5) a glowing flag "LEARNING STARTS HERE"
  plants on the desk / the screen lights up with the first line typed.
- `waiting` (3.9) — a lonely bus stop at night in rain (streetlight cone, puddle reflections): sign "READY", a person
  waits checking the watch; buses pass labelled "NOT YET"; seasons flicker (rain → snow → leaves) over the duration.
- `goldilocks` (8.2) — a gym/arena with three weight stations on a stage, spotlights: "TOO EASY" a feather on a
  barbell, the lifter yawning; "TOO HARD" a huge boulder flattening the lifter (cartoon); "JUST RIGHT" the lifter
  strains then lifts with sparkle. Beats `o.at` [0.3, 2.8, 5.5].
- `eighty` (9.9) — a map/table in an adventurer's tent (lantern light): a big pie/progress bar "80% KNOWN" (green,
  charted land) and "20%" dark fog with glowing monster eyes ("HERE BE DRAGONS"); at `o.grow` (6.5) a sapling sprouts in
  the 20% zone and grows into a glowing tree, arrows "GROWTH".
- `projects_ladder` (22.8) — a giant ladder rising through clouds against a night sky; camera starts at the bottom and
  the scene itself scrolls up rung by rung (draw a tall world and offset by time). 4 rungs, each a little floating
  island-vignette revealed at `o.at` [4 times]: "DOWNLOADS CLEANER" (messy folder icons flying into tidy folders),
  "PRICE SCRAPER" (price tag dropping, phone buzz), "MULTIPLAYER GAME" (two browser windows passing a ball), "MINI GIT"
  (a commit graph with branches lighting). A climber goes up as rungs appear; at `o.climb` (19) "CLIMB A RUNG" flag.
- `academy` (6.0) — Berlin music academy at dusk: grand old building facade, warm lit windows, silhouettes of violin
  students in the windows bowing, snow-light street lamps, a sign "BERLIN, EARLY 90s".
- `practice_rooms` (12.6) — cut-away building (doll-house cross-section) of 6 practice rooms: most students play
  happily the same tune (music notes, hearts), one student alone in a dark room under a lamp repeating 2 bars with intense
  focus, a counter "x37"; at `o.focus` (5.0) a spotlight singles out the focused student, label "PRACTICED THE HARD PARTS".

### Builder C — `assets/js/scenes/practice.js`
- `sheet_music` (10.9) — a music stand with a big sheet of music lit by a desk lamp in a practice room: staves scroll;
  most bars glow green as a playhead passes, 2 bars flash red; at `o.loop` (4.0) a magnifier frames the red bars and they
  repeat with a counter x1 → x40 until they turn green at `o.clean` (9.0).
- `recursion` (7.4) — a dark office: a monitor showing a function calling itself — nested frames receding into the
  screen like a mirror tunnel (each frame smaller, "recurse(n-1)"); a desk calendar MON..SUN with every day stamped
  "RECURSION".
- `sql50` (5.6) — a server room aisle (racks with blinking LEDs, cold blue light) and a terminal on a cart in front:
  queries typing "SELECT ... FROM sales", a counter "QUERY 1/50" racing to "50/50", the database cylinder glowing.
- `target` (2.9) — archery range at night: target with label "THE THING YOU AVOID", an arrow flies and hits bullseye
  with screen shake at `o.hit` (1.2).
- `todo_clones` (10.6) — a giant wall of monitors (like a TV shop window on a street) all showing the same TO-DO app in
  different colour schemes, multiplying in waves; a person keeps repainting one, a banner "PROGRESS?" flickers at `o.q` (6).
- `blueprint_build` (9.4) — a workshop table under a lamp: a phone/app (generic) is lifted onto a blueprint sheet and
  "explodes" into labelled parts (UI, network, storage, logic), each part with a little animated detail; title strip
  "BUILD YOUR OWN VERSION" at `o.title` (5.5).
- `diy_bench` (16.4) — a long maker workbench (camera pans across: draw wide content and pan by t): 4 stations revealed at
  `o.at` [4 times]: HASH MAP (keys dropping into bucket slots), REGEX (a pattern scanning text, matches highlight),
  INTERPRETER ("print", "let", "if" — 3 keyword blocks feeding a little machine), WEB SERVER (a box answering a browser
  with "HELLO"). At `o.worse` (10.5) everything gets wobbly: duct tape, smoke puffs, a sign "0 USERS — THAT'S FINE".
- `dict_xray` (7.1) — a big Python-dict card `{"name": "Ana", "age": 31}` floating in a lab; at `o.xray` (2.0) x-ray
  goggles/scanner beam sweeps and reveals the inside: hash function gears, bucket array, keys landing in slots.
- `clean_code` (6.6) — two monitors side by side on a desk: LEFT messy code (tangled lines, red squiggles), RIGHT
  clean code (aligned, calm); lightbulbs pop over the right one; label "CLEAN CODE FEELS DIFFERENT".

### Builder D — `assets/js/scenes/debug.js`
- `time_machine` (15.4) — the coder's room: a desk calendar spins back 3 months at `o.back` (0.8); an old file
  "final_v2_REAL.py" opens on the monitor with spaghetti code; at `o.cringe` (6.0) a big close-up pixel face (front view)
  cringes hard, then confetti "CONGRATS!" at `o.yay` (7.5); at `o.still` (11.5) cut to a treadmill in the room where the
  coder walks in place, a "PERFECT CODE" sign, dust.
- `paste_loop` (12.5) — a desk with a monitor: red error popup → ctrl-c → a chat app window → fix → ctrl-v → green
  check; the loop speeds up; beside the monitor a jar "LEARNING" drains empty at `o.drain` (6.6); at `o.rewire` (8.6)
  cut to a glowing pixel brain on a dark background? NO black: show it as an X-ray lightbox on a clinic wall, neurons
  connecting new glowing paths "STRUGGLE = REWIRING".
- `think_vs_real` (6.0) — two framed screens on a wall: "WHAT YOU THINK IT DOES" (neat flowchart, calm) vs "WHAT IT
  ACTUALLY DOES" (chaotic tangled flow, sparks, a little gremlin bug running around).
- `stacktrace` (14.5) — first `o.timer` (0.3): a big kitchen timer on the desk set to "20:00" (rule: 20 minutes alone);
  then at `o.trace` (4.4) the monitor fills with a long red traceback; an eye-shaped reading cursor reads the first line
  → panic sweat; at `o.scan` (8.5) it scans down; at `o.found` (11.0) the last line "File main.py, line 42" highlights
  with a big arrow and a tiny "!" pop.
- `prints` (5.9) — editor on a monitor: `print()` lines slot into the code one by one (green), a console panel below
  prints values; a sticky note "GUESS: total is None" then a tick at `o.ok` (4.2).
- `journal` (17.5) — a leather notebook open on the desk under a lamp: entries write themselves line by line
  ("BROKE: login • WHY: None • FOUND: print"); pages flip (months pass, `o.months` (7.0)); at `o.five` (10.0) tally marks
  collapse into a "TOP 5 MISTAKES" list (OFF BY ONE x23, NONE CHECK x17, TYPO x12, WRONG TYPE x9, MUTATED LIST x6).
- `duck` (18.6) — a big cute rubber duck (hero, ~120 px, glossy highlights) on the desk under the lamp, the coder
  talking to it with speech bubbles of code lines; at `o.say` (10.6) bubble "THIS IS DEFINITELY A NUMBER..."; at
  `o.oops` (14.0) the variable flips to `"42"` (a string) with a lightbulb and the duck's eyes widen.
- `chat_explain` (17.2) — a chat app on a big monitor: user message with a code block "why didn't my version work?";
  the assistant answers with an explanation (lines + small diagram); a toggle "FIX IT FOR ME / EXPLAIN IT" flips to
  EXPLAIN at `o.toggle` (2.0); at `o.patch` (11.0) a comparison: a bandage icon "PATCH" vs a lit brain "UNDERSTANDING".

### Builder E — `assets/js/scenes/ship.js`
- `recruiter` (4.5) — an office: a recruiter at a desk flipping portfolio pages, a big stopwatch "6 SEC", pages flying
  into a bin.
- `tuition` (4.7) — a small tuition-centre classroom (desks, students, whiteboard): a laptop on the teacher's desk shows
  a fees table: names with PAID ticks / UNPAID crosses filling in.
- `bill` (5.9) — a cozy house at night in cutaway: kitchen with family members, a ceiling light bulb, a fridge door
  with a phone app "WHOSE TURN? → YOU" rotating avatars; electricity meter spinning.
- `jenga` (6.4) — an app drawn as a tall tower of UI blocks on a table; a giant user finger pokes one block at `o.poke`
  (2.0) and the tower collapses in stepped physics, dust.
- `users_break` (9.2) — one scene, three phone/browser vignettes in a row on a wall of screens, lit one after another at
  `o.at` [0.2, 2.9, 5.9]: a name field with a smiley glyph (draw it) → red error; a payment "PROCESSING..." + a back-arrow
  click → "CHARGED TWICE"; an old cracked phone where the layout overflows and breaks.
- `level_up` (7.3) — RPG style: bug creatures fly into the coder (front-facing hero, sword = keyboard?) and turn into XP;
  an XP bar fills and "LEVEL UP: EDGE-CASE VISION" banner at `o.lvl` (5.0).
- `taste_gap` (30) — a big chart drawn on a glass whiteboard in a dark studio with neon edge light: x = time, lines
  appear at times: SKILL (cyan) at `o.skill` (0.5); TASTE (yellow) rising faster at `o.taste` (6.5); the area between
  shades and gets the label "THE GAP" at `o.gap` (23.6); tiny climbers inside the gap at `o.climbers` (30*0.9).
- `doubt` (12.4) — the coder's room: the monitor shows wobbly, clumsy code with a red ×; a thought bubble "I'M BAD AT
  THIS"; at `o.leave` (7.5) the coder gets up and walks to the door; at `o.opposite` (12.0) freeze-frame + a big
  "IT MEANS THE OPPOSITE" stamp. (Side view of the room is fine here.)
- `books_24h` (5.7) — a bookstore shelf under warm light, books with spines "C++ IN 24 HOURS", "PYTHON IN A DAY",
  "AI IN A WEEKEND"; at `o.stamp` (2.5) a red stamp "NOPE" slams across them.
- `long_road` (8.7) — a long road through hills to a sunrise horizon, milestones "YEAR 1" … "YEAR 10" receding; a
  small calm walker with a backpack; birds; label at `o.free` (3.0) "NOBODY EXPECTS GREAT BY NEXT MONTH".
