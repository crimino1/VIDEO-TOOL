# Bit by Bit EP1 — pixel scene builders brief

Film: "Is a CS degree worth it in 2027?" for the YouTube channel **Bit by Bit** (computer-science explainers).
Look (copied from the channel reference): pitch-black starfield; on top, **glowing retro pixel-art / CRT animations**
that *show* the idea, like an 8-bit game or an old monitor. Neon on black: cyan, CRT green, amber yellow, hot pink,
purple, orange. Chunky pixels, simple shapes that read instantly, a bit funny. The narrator is sarcastic and smart.

You build **pixel scene kinds** for the engine. Other people build the timeline, text overlays, photos, mascot and
sound — not you. Each kind is shown for one shot (usually 3–12 s) while the narrator talks about it.

## Files

- Engine (read it, **never edit it**): `assets/js/px.js`. Helpers live on `window.PX`.
- Reference scene (match its quality and style): `assets/js/scenes/core.js` (`bars`, `title`).
- **Your file only**: `assets/js/scenes/<yours>.js` (named in your task). Don't touch other files.
- Test harness:
  `node tools/pxsheet.cjs <kind> '<opts json>' <dur> <out.png> [frames=12] [cols=4]` → contact sheet over the shot
  `node tools/pxsheet.cjs <kind> '<opts json>' <dur> <out.png> --at 2.5` → one full 1920x1080 frame
  Run from `C:\Users\daggu222105\VIDEO-TOOL\bitbybit\ep01` (Git Bash). Write PNGs to your scratchpad/`$TEMP`, not the project.
  It loads every file in `assets/js/scenes/`; a "PAGE ERRORS" line about **another** builder's file is not yours — ignore it.
  Then open the PNG with the Read tool and look at it. Iterate until it is good.

## Engine contract

```js
(function () {
  const { K, C } = PX;
  K.mykind = (o) => {          // o = options from the shot list; precompute anything deterministic here
    return (g, t, d) => {      // g = 480x270 CanvasRenderingContext2D (1 low-res px = 4 screen px)
      ...                      // t = seconds since shot start (can be slightly < 0), d = shot length
    };
  };
})();
```
- Draw in **low-res pixel coordinates 0..480 x 0..270**. The engine upscales ×4 nearest-neighbour, adds scanlines,
  RGB mask and bloom. Background is transparent (stars show through) unless you fill it.
- **Pure function of t.** No `Math.random()` (use `PX.rnd(seed)` created in the outer function), no Date, no timers,
  no state carried between calls (frames are drawn in any order). Recompute everything from `t` each call.
- Times in `o` are **seconds from shot start** (`o.at`, `o.flip`, items[i].at ...). Always give sensible defaults
  relative to `d` so the scene works with `{}`.
- Helpers (see px.js): `PX.rect, line, box, panel (CRT monitor frame), circle, sprite (string-art), text (font "p" =
  Press Start 2P sizes 8/16/24/32, font "v" = VT323 sizes 12–32), tw (text width), typed, person (7x13 pixel human,
  options col/skin/hair/cap/frame/flip/sc), coin, zoom, alpha, glitch, p(t,a,d,ease) progress, ease, KF keyframes,
  q (quantise), blink, rnd, clamp, lerp`. Palette `PX.C` (bg ink dim panel grid cyan green yellow pink purple orange
  red blue white teal brown skin[]). Text measures with `PX.tw`.
- Need another helper? Define it inside your own file (prefix it with your file name to avoid clashes).

## What makes a scene good (read twice)

1. **Big and readable.** The hero object fills ≥ 40% of the frame (≥ ~190 px wide or ~110 px tall in low-res).
   Never a small thing floating in the middle of empty black. Use `sc` (sprite scale 2–4) for hero sprites.
2. **Reads without narration.** A stranger names every object: a laptop looks like a laptop (screen, bezel, keyboard),
   a chair like a chair. Use 2–3 shades per object (light top/edge, base, dark side) like real pixel art.
3. **Something moves every 1–3 s.** Typing, blinking cursor, walking frames (alternate `frame` every ~0.25 s),
   counters, packets flowing, bobbing (step in whole pixels: `Math.round`). Use chunky/stepped motion (`PX.q`), not
   smooth floaty drift. Build things up piece by piece at their `at` times; never everything at once.
4. **Short labels only**: 1–4 words, CAPS, Press Start 2P 8px (or 16px for a hero word) or VT323 14–20px.
   Minimum readable: Press Start 2P 8px / VT323 14px. Max ~3 labels visible at once. The narrator carries the rest.
5. Colours: cyan = computer science / good-neutral, yellow = highlights & titles, green = success/✓, red = fail/✗,
   pink & purple = accents, white = numbers. Objects that are dark (laptop body etc.) use greys `#3a4654 #5a6b78
   #8b9bab`. Keep the bloom in mind: large pure-white or pure-cyan areas glow a lot — prefer mid tones for big fills.
6. Pixel crisp: integer coordinates (`Math.round`), no anti-aliased shapes (no `arc`/`stroke` paths; use
   `PX.circle`, `PX.line`, rects). `PX.text` is fine.
7. Funny is welcome (the script is sarcastic): small sight gags, sweat drops, "!" pops, a robot stuck under a sink.
8. Don't draw the channel mascot or any brand/logo. Don't write long sentences. No emoji glyphs (draw icons).

## Process

For each kind: write it → sheet over its typical duration (12 frames) → Read the PNG → also one `--at` full frame
at the busiest moment → fix what looks weak (too small, unreadable, static, cluttered) → next kind.
When all are done, run every kind once more with `{}` (defaults) to be sure nothing throws, then report:
for each kind its name, the opts you support (with defaults), and anything you could not do.

## Your kinds

Each line: `kind` (typical d seconds) — what it shows. Option names are suggestions; keep them if you can.
Your task message lists which kinds are yours.

### Builder A — `assets/js/scenes/open.js` (cold open + intro)
- `calendar` (5.5) — big tear-off desk calendar (hero, ~200 px tall) showing "2026"; at `o.flip` (2.0) the page tears off and
  falls, revealing "2027" in big pixel digits with a tiny grad-cap icon; at `o.bad` (3.8) a red stamp "BAD NEWS" slams on (scale pop).
- `money` (4.5) — open pixel wallet on the left spitting gold coins that arc away and vanish; a 4-segment progress bar
  labelled YR1 YR2 YR3 YR4 fills one segment per `o.years` times (default spread over d); a "$" counter ticking up in white
  (illustrative, no real figure; label "TUITION").
- `chatbot` (4.5) — pixel laptop (hero) with a chat window: user bubble types `o.prompt` ("DO MY CS HOMEWORK") at `o.ask` (0.3);
  the bot answers with colourful code lines streaming in; a stopwatch top-right counts 00:00 → 00:11 between `o.ask` and
  `o.done` (default d-0.6) then blinks green "DONE".
- `race` (3.2) — side-view running track; two pixel runners (sc 3) with name tags PHILOSOPHY (yellow) and COMP SCI (cyan);
  philosophy runs ahead and breaks a tape under a sign "HIRED" at `o.win` (2.2); CS runner lags, sweat drops.
- `chair` (3.6) — a wooden chair (hero, sc 3–4) centred; label `CHAIR.EXISTS =` with TRUE/FALSE flipping every ~0.45 s,
  chair dither-flickers in and out in sync; two tiny bearded philosophers either side with "?" and "!" bubbles.
- `robot_sink` (3.8) — kitchen sink cabinet with doors open and U-pipes; a boxy robot tries to crawl under, gets stuck
  and shakes; at `o.err` (2.0) a red box "ERROR: CANNOT FIT" pops; a wrench lies on the floor.
- `warning` (3.3) — full-screen red alert: hazard stripes top & bottom, big triangle "!" icon, big blinking text lines
  `o.lines` (["DO NOT", "LEARN TO CODE"]) in Press Start 2P 16/24; flashing red/black background pulse.
- `feed` (5.0) — tall pixel phone (hero, ~200 px tall) with a vertical social feed scrolling up: posts with avatar square,
  name bar and big text from `o.posts` (["IT'S OVER", "CS IS DEAD", "LEARN A TRADE", "AI TOOK MY JOB", "SO OVER"]),
  pixel skull/fire/arrow-down icons, view counts.
- `sheet` (4.5) — spreadsheet panel (wide, hero). `o.rows` (row labels, default ["COMP SCI","COMP ENG","PHILOSOPHY","ALL MAJORS"]),
  `o.cols` [{h, vals[]}] (default UNEMPLOYED 7.0/7.8/5.1/4.8, UNDEREMPLOYED 19/22/47/39, PAY $87K/$90K/$?/$58K).
  Only the first data column fits at first; at `o.pan` (1.6) the view slides right one column to `o.target` (default 1),
  which gets a blinking yellow highlight box around its header and cells. Grid lines, header row in yellow.
- `logo` (1.8) — channel name sting: dozens of tiny "0"/"1" glyphs and squares fly in from scattered positions and snap
  into big pixel text "BIT BY BIT" (Press Start 2P 24, cyan with yellow shadow) by `o.done` (1.1); a small cyan pixel
  cube icon (12x12, two dark eye pixels, smile) sits left of the text. Optional `o.sub` types under it.
- `shatter` (3.8) — the question `o.lines` (["IS A CS DEGREE", "WORTH IT IN 2027?"]) in pixel text (yellow, 16px);
  at `o.at` (1.5) it splits into blocks (word or glyph blocks) that separate a few pixels and step-rotate, numbered tags
  "1" "2" "3" "4" pop on the pieces (taking it apart one piece at a time).
- `two_students` (8.5) — left: a teen (sc 3) labelled "17" standing before three doors CS / ART / BIZ with a "?" ;
  at `o.right` (4.0) right side: an older student (sc 3, backpack) labelled "20" with a progress bar "DEGREE 50%".

### Builder B — `assets/js/scenes/data.js` (Part 1 numbers)
- `students` (8.0) — grid ~16x8 of tiny pixel students (varied shirt colours, a few caps), subtle idle bob; at `o.drop` (2.5)
  about 8.4% of them (scattered, seeded) flash red and drop out of the grid; a counter "-8.4%" pops above (`o.label` under it,
  default "CS MAJORS, 1 YEAR").
- `counter` (5.0) — big number counting 0 → `o.v` (default 53000) with commas, `o.prefix`/`o.suffix`, Press Start 2P 32
  white inside a cyan rounded panel; label lines `o.label` (["FEWER STUDENTS"]) under it; starts `o.at` (0.3) over `o.cd` (1.4).
  A few pixel figures walking away beside it is a plus.
- `payroll` (5.0) — conveyor belt of pixel pay stubs / ID cards sliding into a scanner box labelled "STANFORD" with a
  scanning light; a record counter ticking up fast; label "MILLIONS OF PAYROLL RECORDS".
- `lines` (16) — line chart panel (hero, wide). x labels `o.years` (2018..2025), y = index (100 at start). `o.series`
  [{label, col, pts[], at, dd}] each drawn progressively with pixel lines from `at` over `dd`; `o.notes` [{i (x index), label,
  col, at}] markers (dot + short label) e.g. "PEAK", "-20%". Defaults: AGES 22–25 cyan pts [100,104,108,116,128,118,108,102]
  at 0.5 dd 4, note at i=4 "PEAK" at 3.0 and i=7 "-20%" at 5.5; OLDER WORKERS yellow pts [100,101,102,104,105,107,109,110]
  at 9.0 dd 3, note i=7 "+6–9%" at 11.5.
- `office` (7.5) — pixel office: rows of desks with grey-haired seniors working (typing frames, monitors on); at right a door
  with a sign "HIRING" that flips to "NOT HIRING" at `o.flip` (4.0); a queue of young grads with caps outside the door,
  they slump at the flip.
- `ladder` (4.5) — tall ladder (hero, ~220 px); seniors standing on the upper rungs; at `o.saw` (1.6) a saw cuts the bottom
  rung (sparks), the rung drops; a young grad at the bottom jumps at `o.jump` (2.8) and can't reach.
- `training` (7.3) — left: items appear at `o.items` [{label, at}] (TEXTBOOKS book stack, DOCS pages, FORUM ANSWERS many
  speech bubbles); streams of tiny pixel packets flow right into a chip labelled "LLM" (hero, with pins) that glows brighter.
- `grad_books` (4.2) — pixel graduate (cap & gown, sc 3) holding the same book/doc stack on the left, the LLM chip on the right,
  a big "=" appears between at `o.eq` (1.5); label "WRITTEN-DOWN KNOWLEDGE".
- `prod2am` (9.3) — night scene: dev at desk, monitor flashing red "PROD DOWN", wall clock 2:00 AM, server rack with
  red blinking LEDs and small flames; at `o.lesson` (5.0) a lightbulb pops over the dev with label "NOT IN ANY TEXTBOOK".
- `worldmap` (9.0) — blocky pixel world map (dim teal continents); the USA lights cyan with label "US DATA" at `o.us` (0.6);
  at `o.others` (4.5) other continents get blinking yellow "?" markers.
- `warnsign` (7.0) — big yellow pixel warning triangle road sign on a post (hero) with "!"; at `o.at` (2.5) two labels:
  "WARNING SIGN" + green tick vs "MEASUREMENT" + red cross with a ruler icon.
- `laptop_close` (4.0) — open laptop with code on screen; lid closes at `o.close` (1.2) (stepped angle frames); then a pixel
  phone slides in dialling "PLUMBER..." with ring waves.

### Builder C — `assets/js/scenes/money.js` (Parts 2–3)
- `median` (4.5) — 21 pixel people in a row, each with a salary bar above (ascending heights, cyan); the middle one gets a
  yellow highlight + label "MEDIAN $87K" at `o.mid` (0.6); the left half dims at `o.half` (2.2) with label "HALF MAKE LESS".
- `rank` (5.5) — arcade "HIGH SCORES" table: `o.rows` [{name, v}] (default 1 COMP ENG $90K, 2 COMP SCI $87K, 3 ... more
  plausible majors with lower values, last row "ALL MAJORS $58K"); rows type in one by one from `o.at` (0.3); row `o.hi` (1)
  blinks highlighted with a pixel "2ND" medal.
- `compare` (13) — two RPG character stat cards side by side: "COMP SCI" (cyan, small pixel character on the card) vs
  "PHILOSOPHY" (yellow). `o.stats` [{label, a, b, at, good:"low"|"high"}]; defaults: OUT OF WORK 7.0% vs 5.1% at 1.5;
  JOB NEEDS DEGREE 81% vs 53% at 4.5; PAY VS AVERAGE +50% vs ? at 7.5. Bars fill with stepped motion; the better value
  of each row gets a small green up-triangle. At `o.verdict` (11) a yellow banner "DIFFERENT TRADE-OFFS".
- `projection` (21) — government table "BLS PROJECTIONS 2025–2035" (hero panel). Row 1 SOFTWARE DEVELOPERS types at `o.r1`
  (1.5) with a green up-arrow "+10%" growing and a counter "106,000 OPENINGS/YR" at `o.open` (4.5); row 2 COMPUTER
  PROGRAMMERS at `o.r2` (9.0) with a red down-arrow "-7%" at `o.down` (13.5). Arrows step-animate.
- `design2code` (5.0) — a blueprint sheet (blue grid paper with boxes/arrows) → arrow → a pixel worker typing → code lines
  coming out; label "COMPUTER PROGRAMMER".
- `value` (9.8) — left: a price tag "DESIGN → CODE" whose price shrinks "$$$$" → "$" at `o.cheap` (0.8) with a down arrow;
  right: two tags "DECIDE WHAT TO BUILD" at `o.a` (3.5) and "JUDGE IF IT'S GOOD" at `o.b` (6.5) with prices growing to "$$$$"
  and sparkles.
- `suspects` (13) — police lineup wall with height lines; three suspects appear at `o.at` [1.0, 6.0, 8.0]: a robot "AI",
  a giant "%" sign "INTEREST RATES", a crowd with a balloon "2021 HIRING BINGE"; each with a "?" above; a spotlight
  sweeps; label "WHO DID IT?" top; at `o.none` (11) stamp "NO CLEAN ANSWER".
- `thumb` (2.6) — pixel YouTube-style thumbnail (hero, 16:9 frame with red play bar): shocked pixel face + big text
  "CS IS DEAD" + red arrow; at `o.at` (1.4) tiny fine print appears under it "*NOT PROVEN".

### Builder D — `assets/js/scenes/buy.js` (Part 4)
- `shop` (7.0) — pixel shop shelf/counter; item card "GUARANTEED JOB" with a price tag; at `o.dead` (3.0) a red stamp "SOLD OUT"
  slams on; at `o.dead2` (5.0) a skull icon appears.
- `oldpath` (7.0) — retro game overworld path with 4 nodes; labels `o.steps` [{label, at}] (SHOW UP 0.5, PASS CLASSES 1.8,
  1 INTERNSHIP 3.4, OFFER 5.0); a pixel character hops node to node at those times, nodes light up; last node a trophy/
  envelope "OFFER".
- `receipt` (6.7) — receipt printer pushing out a long receipt: lines `o.lines` at times (CS DEGREE, 4 YEARS, TUITION,
  "TOTAL PAID" + tick); at `o.empty` (4.5) a line "SKILLS ATTACHED: NONE" blinks red.
- `slots` (3.0) — three big locked item slots numbered 1 2 3 (padlocks), unlock one by one at `o.at` [0.6,1.3,2.0]
  revealing `?` glow (contents revealed later).
- `fundamentals` (9.3) — four tiles appear at `o.at` [0.5,2.3,4.4,5.6]: DATA STRUCTURES (binary tree), OPERATING SYSTEMS
  (window + gear), NETWORKS (nodes with packets moving), DATABASES (cylinder); at `o.row` (7.0) the DB tile opens into a small
  table with one row highlighted "ROW 42".
- `review` (7.5) — code panel (hero) scrolling very fast, line counter "LINE 1/400" climbing; at `o.find` (4.5) scrolling
  stops and a magnifying glass slides over one red line tagged "BUG"; the rest of the code is plausible colourful lines.
- `query` (7.3) — terminal: "SELECT * FROM ORDERS" — run 1 "100 ROWS" finishes instantly "0.01S" + green tick at `o.a` (0.6);
  run 2 "10,000,000 ROWS" at `o.b` (3.0): progress bar crawls, timer climbs, at `o.fail` (5.6) red "TIMEOUT" and the panel
  shakes, a pixel fire.
- `lecture` (4.8) — chalkboard (hero) titled "INDEXES" with a small B-tree drawn line by line; a pixel professor pointing;
  a sleepy student with "Z z"; at `o.save` (3.0) a yellow star burst "THIS ONE SAVES YOU".
- `math` (5.0) — three panels pop at `o.at` [0.4, 1.6, 3.0]: LINEAR ALGEBRA (matrix of numbers with brackets), PROBABILITY
  (two dice rolling + small histogram), DISCRETE MATH (graph of nodes/edges lighting a path).
- `stack` (7.8) — tower: base blocks drop in at `o.at` [0.3,0.9,1.5] LINEAR ALGEBRA / PROBABILITY / DISCRETE MATH; then a
  glowing "AI" block (with a tiny neural-net drawing) lands on top at `o.ai` (2.5); at `o.crack` (5.0) beside it a thin
  block "WEEKEND TUTORIAL" tries to hold a mini AI block and cracks.
- `campus` (7.0) — pixel campus: building with columns and steps, trees, paths, students walking (walk frames); counter
  "YEAR 1 → 4" ticking in a corner panel.
- `door` (8.0) — wall with a big door labelled "INTERNSHIPS" and a plaque "ENROLLED STUDENTS ONLY"; a student with a cap
  walks up; door opens at `o.open` (4.5) with light spilling out; label "SIDE DOOR" glows at `o.side` (6.0).
- `funnel` (11) — resumes (pixel papers) drop into a big funnel; a gate "HAS DEGREE?" lets some pass (green) and bounces
  others (red); counter "JUNIOR SEATS: 3"; the funnel narrows at `o.harsh` (4.0).
- `difficulty` (4.0) — retro menu "SELECT DIFFICULTY" with EASY / NORMAL / HARD; small grey notes "DEGREE" next to NORMAL,
  "SELF-TAUGHT" next to HARD; cursor moves to HARD at `o.at` (1.5), HARD blinks red, a skull icon.
- `coast` (3.8) — pixel character on a skateboard coasting down a slope with speed lines; at `o.stop` (2.2) hits a sign
  "NO COASTING" and tumbles; dust.

### Builder E — `assets/js/scenes/end.js` (verdict + ending)
- `checklist` (6–12) — CRT checklist panel (hero) title `o.title` ("DO IT IF..."), items `o.items` [{text, at, mark:"ok"|"x"}]
  that type in and get a big tick (green) or cross (red) box with a pop; defaults 2 items.
- `loans` (6.2) — balance scale (hero): left pan bag "SALARY 87K"; right pan bag "LOANS 20K" at `o.a` (0.4) — scale tilts in
  favour of salary, green; at `o.b` (3.6) the right bag swaps to a giant "LOANS 200K" — scale slams down to the loan side, red.
- `safe` (7.5) — big vault safe "SAFE CHOICE (2019)"; dial spins, door swings open at `o.open` (3.0): empty inside, dust
  puffs, a moth flutters out; label "SAFE IS GONE" at `o.gone` (6.5).
- `profile` (7.5) — resume card "CS GRAD, 2027" (hero) with fields PROJECTS BUILT / INTERNSHIP / CURIOSITY, each gets a red
  "NONE"/"???" + cross at `o.at` [1.5, 3.0, 4.5]; card border blinks red at the end.
- `door_ai` (7.3) — corridor of department doors (BIOLOGY, BUSINESS, MEDIA, ...); at `o.at` (3.5) an "AI" sticker slaps onto
  one door with sparkles and the door suddenly has a queue; a student with a cap shrugs "DON'T PANIC".
- `quest` (21) — RPG quest log panel "QUESTS 0/3" with `o.items` [{text, at, done}] (defaults: BUILD SOMETHING REAL at 0.5
  done 9; ONE INTERNSHIP at 12 done 14; HARD MATH ELECTIVES at 15 done 18). Header counter updates; tick with sparkle;
  between 3–5 s a sub-line "TO-DO APP" appears struck through under quest 1.
- `rename` (6.7) — file list panel: filenames "IMG_4821.JPG"... rewritten one per frame into "STUDIO_WK46_001.JPG" etc,
  progress "000/500" → "500/500"; at `o.complain` (4.5) a phone notification pops "COUSIN: IT BROKE!!".
- `queue` (17) — long line of pixel people toward a door "CS"; at `o.leave` (3.0) about 40% walk away out of frame with "$"
  icons over their heads; the rest step forward closing gaps; at `o.love` (9.0) small hearts above the remaining ones.
- `ticket` (7.0) — left: a big ticket "JOB TICKET" gets a red cross stamp at `o.no` (0.6); right: a dumbbell "TRAINING" gets a
  green tick at `o.yes` (2.2); at `o.only` (3.8) the dumbbell lifts up and down (rep counter "REPS: 0" climbing).
- `checker` (5.5) — left: a pixel person at a desk with a magnifier reviewing a robot's code printout, ticking marks;
  right: an empty chair with a faint ghost outline labelled "REPLACED" at `o.ghost` (3.0).
- `subscribe` (10) — pixel "SUBSCRIBE" button (hero, red); a pixel hand cursor moves and presses it at `o.press` (1.2) → it turns
  grey "SUBSCRIBED", a bell rings; at `o.comment` (3.0) a comment box types `o.comment` ("WHAT ARE YOU STUDYING?").
