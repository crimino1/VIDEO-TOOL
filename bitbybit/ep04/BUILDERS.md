# Bit by Bit EP4 — pixel scene builders brief

Film: "Weird Computer Science Concepts: five living computers" (9:25), YouTube channel **Bit by Bit**. Curious, warm,
smart narrator with dry jokes. Five real stories: a slime mould that rebuilt the Tokyo rail network (2010), Leonard
Adleman's DNA test-tube computer (1994), DNA data storage that held an operating system and a short movie (2017),
MIT's Cello compiler that turns Verilog code into DNA for E. coli (2016), and DishBrain, 800,000 neurons on a chip that
learned Pong (2022). Full narration with timestamps: `transcript.txt` (read it for tone).

**What the owner asked for this time** (read twice):
- The pixel animation stays (they liked it) and must be **very high quality**.
- The edit is **documentary style**: real researchers, places, years, footage. Your scenes are the "how it works"
  part of a nature/science documentary. Think a museum exhibit, a field notebook, a lab at night, a microscope view.
- **"Little good colour, no AI-slop colour."** No neon, no purple-pink synthwave, no rainbow, no glowing cyan
  everything, no big glow halos. Calm, natural, grown-up colour like a well-graded documentary or a premium indie game
  (Eastward, Sea of Stars interiors, Hyper Light Drifter dusk, Kentucky Route Zero calm): dark neutral bases, warm
  cream lamp light, and **one or two natural accents per scene** from the palette below.

You build **pixel scene kinds**. Others do the timeline, text, real footage, photos, mascot and sound.

## Files
- Engine (read, **never edit**): `assets/js/px.js` (640x360 low-res canvas ×3, camera, transitions, helpers).
  **Palette: use `PX.D` only** (it's at the top of px.js). Never write hex colour literals in your file except
  pure black/alpha for shadows; derive shades from PX.D entries (each accent is `[light, base, shadow]`).
- Quality reference for detail level (old palette, ignore its colours): `assets/js/scenes/core.js` → `room` kind.
- **Your file only**: `assets/js/scenes/<yours>.js`. Don't touch other files.
- Test **from PowerShell** (Git Bash can't launch the browser here), JSON opts **without spaces**:
  `cd C:\Users\daggu222105\VIDEO-TOOL\bitbybit\ep04; node tools/pxsheet.cjs <kind> '{\"a\":1}' <dur> "$env:TEMP\x.png" 12 4`
  and one full frame: `... "$env:TEMP\x1.png" --at 3.2`. Use `'{}'` for defaults. PNGs to `$env:TEMP` only.
  Open every PNG with the Read tool and look. Page errors from another builder's file: ignore.

## Engine contract
```js
(function () {
  const { K, D } = PX;
  K.mykind = (o) => { const r = PX.rnd(7); /* precompute */ return (g, t, d, c) => { ... }; };
})();
```
- Draw in 0..640 × 0..360. The engine applies the camera (default slow push 1.0→1.05; the timeline may push up to
  ~1.25), upscales ×3 nearest-neighbour, adds scanlines + a little bloom. Keep key content inside the central ~85%;
  fill the WHOLE frame edge to edge.
- Pure function of t: no Math.random (use `PX.rnd(seed)`), no Date, no state between frames.
- Times in `o` are seconds from shot start; defaults scaled to `d` so `{}` works.
- Helpers: rect, line, box, panel, circle, sprite, text (font "p" Press Start 2P 8/16, "v" VT323 10–32), otext, tw,
  typed, p (progress), ease, KF, q, blink, rnd, clamp, lerp, glow, vignette, vgrad (dithered gradient), par (parallax),
  particles, glitch. Use `PX.glow` small and soft (it's light, not neon).

## Quality bar (every scene)
1. **A place, not a diagram.** Full-frame environment: lab bench, specimen cabinet, microscope eyepiece view, forest
   floor, old map table, server room, workshop. Diagrams live inside something (a lab notebook page, a chalkboard, a
   monitor on a bench, a light table, a petri dish under a lamp).
2. **Depth**: ≥ 3 layers; far layers darker and lower contrast, in `PX.par` 0.3–0.7.
3. **Natural light**: a lamp, a window, a microscope lamp, a monitor. Lit edges facing the light (1 px highlight), soft
   falloff, `PX.vignette(g, 0.45–0.6)`. Large areas are mid/dark tones; bright colour only where the eye should go.
4. **Native-resolution art only.** Never scale a sprite with PX.zoom. Characters 40–110 px tall, 3 shades per material.
5. **Life, but calm**: dust in lamp light, steam, slow breathing, flickering bulb, liquid wobble, tiny cells drifting.
   Story beats at `o.*` times; something changes every 2–3 s. Eases "out"/"io"; "back" only for small pops. No shaking
   screens, no flashing.
6. **One focal point per beat**, max ~3 short labels (Press Start 2P 8 or VT323 12–20, CAPS, `PX.otext`, cream or the
   scene's accent). The narrator carries the words.
7. **Biology looks organic**: slime mould = branching veins with soft wobbling edges and pulsing flow, cells = round,
   translucent, slightly irregular; DNA = clean ladder/helix with base colours `PX.D.dna`.
8. Dry humour where the script jokes (small sight gags), never slapstick.
9. No logos/brands/real UI, no emoji glyphs, no mascot, no real people's faces (generic researchers are fine:
   lab coat, simple face).
10. **Only numbers listed in your kind's description may appear on screen** (no invented values, no fake data labels).

Recurring characters (draw them yourself, consistent): **the researcher** — lab coat, dark hair in a bun, glasses,
medium skin; **the assistant** — lab coat, short ginger hair, light skin. Both ~70–100 px tall when full body.

## Process
For each kind: build → 12-frame sheet over its typical d → Read it → one `--at` full frame at the busiest beat → be a
harsh art director ("would this look at home in a premium indie game or a BBC science doc?"; "is any colour loud or
neon?"). Fix and redo. Finally run every kind with `'{}'` and report: name, opts with defaults, anything weak.

## Kinds
Each: `kind` (typical d) — what it shows; beats at `o.*` (seconds from shot start).

### Builder A — `assets/js/scenes/intro.js` (cold open, index, finale)
- `two_worlds` (5.4) — one continuous wide scene split by a vertical seam: left a spotless chip clean room (steel
  blue, white suits, wafer on a stage, soft overhead strip lights), right a wet forest floor at dusk (moss, a rotting
  log, ferns, droplets, a little yellow slime mould). Camera starts centred; `o.left` (1.0) the left side brightens,
  `o.right` (3.0) the right side brightens (light shifts, not a cut). Accents: steel + moss/amber.
- `def_machine` (8.8) — a tinkerer's workbench at night (lamp, tools on a pegboard): a wooden-and-brass box machine
  with an IN slot, a window showing gears labelled "RULES", and an OUT tray. Beats: `o.in` (1.0) a punched card goes in
  ("IN" label lights), `o.rules` (3.0) gears turn in the window, `o.out` (5.2) a small card drops in the tray with a
  check mark ("ANSWER"). Labels IN / RULES / ANSWER.
- `alive_reveal` (5.3) — same bench, closer: at `o.open` (1.2) the box's front panel swings open and inside, instead of
  gears, there is soft living tissue: a glowing amber slime network pulsing, tiny cells drifting. Warm lamp light.
- `cabinet` (5.0) — a natural-history museum specimen cabinet at night (wood, glass doors, brass labels, a reading
  lamp): five display jars/stands on two shelves numbered 1–5: (1) a petri dish with yellow slime mould, (2) a test
  tube with clear liquid, (3) a tiny vial with a speck, (4) a petri dish with pale bacteria colonies, (5) a small chip
  with a pink tissue dot. Opts: `o.lit` = array of times when jar k's little lamp turns on (default all lit at 0.5,
  1.2, 1.9, 2.6, 3.3); `o.focus` = 1..5 or 0 (none): the camera-independent "focus" — that jar gets a soft spotlight and
  the others dim; `o.check` = array of [jar, time] when a small cream tick appears on that jar's label.
- `textbook` (16.0) — an open CS textbook on a desk under a lamp; left page has a contents list that writes itself
  line by line at `o.items` (default [1, 2.5, 4, 5.5, 7]): "SHORTEST PATHS", "PARALLEL SEARCH", "ERROR CORRECTION",
  "LOGIC GATES", "LEARNING FROM FEEDBACK"; beside each line a tiny drawing of its living computer (slime, tube, vial,
  bacterium, neuron dish). At `o.same` (11.0) the right page shows "THE HARDWARE GOT WEIRD" small, and a pencil
  underlines "THE IDEAS STAYED THE SAME".
- `weird_hw` (6.0) — a lab bench "conveyor" of hardware swapping in the same socket: a silicon chip → slime dish →
  test tube → DNA vial → bacteria dish → neuron chip (one every ~1 s), while above it a single calm cream "idea" lamp
  (a lightbulb drawn as a simple glowing circle) stays constant.

### Builder B — `assets/js/scenes/slime.js` (Physarum, the Tokyo rail experiment)
Slime mould look: bright egg-yolk yellow `PX.D.amber` network of branching tubes with fan-shaped feeding fronts, soft
wobbling edges, flow pulsing along the tubes; it lives on a dark wet agar/ log surface.
- `log_macro` (4.0) — macro view of a rotting log in a dim forest, moss, a beetle, droplets; yellow slime fans creep
  slowly across the bark. Camera low. Use for "lives on rotting logs".
- `one_cell` (4.2) — microscope eyepiece view (round field, dark surround, faint crosshair): inside the slime, many
  nuclei drifting in one shared membrane with streaming cytoplasm; label "ONE CELL" at `o.label` (1.5).
- `no_brain` (5.6) — a lab notebook page on a bench (paper `PX.D.paper`, pencil, coffee ring): a hand-drawn blob with
  a checklist beside it: "BRAIN", "NEURONS", "EYES" each crossed out at `o.x` (default [0.8, 1.6, 2.4]); at `o.maze`
  (4.0) a small maze sketch appears with a tick.
- `maze_solve` (13.0) — top-down petri dish under a lamp holding an agar maze (raised walls, dark wet corridors).
  Slime starts in one corner (o.start 0.5), an oat flake at the opposite exit. `o.spread` (1.0–5.5): slime floods
  every corridor at once (fans branch into all paths); `o.retract` (6.5–10.5): it pulls back from the dead ends;
  final state: one thick yellow tube along the shortest path, pulsing. Option `o.state`: "end" = start in final state.
- `oat_map` (16.0) — top-down wet dish (black agar, rim highlight) on a light table; a faint printed coastline of the
  Tokyo area under the glass. Beats: `o.oats` (0.5–5.0) oat flakes placed one by one at 36 city positions (a counter
  "36" may appear when done); slime starts at the central "TOKYO" spot (o.slime 5.5); `o.lights` (7.0): a few soft
  white light patches appear over areas (mountains/lakes) — slime avoids them; `o.grow` (time or null) the network
  grows over ~6 s into a rail-like web linking the oats, with a small clock in a corner sweeping one day ("1 DAY").
  Option `o.state`: "net" = start with the finished network. Option `o.build` (time) = for the finale: the network
  draws itself one connection at a time, slowly.
- `rail_compare` (12.0) — a map room / light table: left the slime network on its dish, right a schematic rail map
  of the same area (lines in muted colours, not any real operator's style). At `o.overlay` (2.0) the slime web slides
  over the rail map and they nearly match. Then three small brass gauges or bars fill, labelled "COST" (`o.m1` 5.5),
  "EFFICIENCY" (`o.m2` 7.5), "SURVIVES A BROKEN LINK" (`o.m3` 9.0) — for each, two bars SLIME vs RAIL ending roughly
  equal. No numbers. At `o.cut` (9.0) one rail link breaks (spark) and the network reroutes.
- `oat_gag` (4.0) — close-up of the slime engulfing an oat flake on the dish, contentedly pulsing; tiny "nom" bubble
  is NOT allowed (no text) — just the oat shrinking. Dry gag.
- `tube_rule` (13.0) — cutaway close-up of a few slime tubes like glass pipes with streaming particles: at `o.thick`
  (1.0) a busy tube (lots of flow) visibly thickens ("MORE FLOW = THICKER"); at `o.thin` (4.0) a quiet tube narrows,
  then fades away at `o.gone` (7.0) ("LESS FLOW = THINNER"); at `o.local` (9.0) small "local rule" markers appear on
  every junction, nobody holds a map.
- `model_sim` (6.5) — a researcher's monitor on a bench at night showing a simulation: dots (cities) and a network
  thinning to an efficient web over time; a chalkboard behind with simple flow/thickness doodles (no real equations).
- `slime_slow` (5.5) — gag: a lab bench, the researcher typing on a keyboard plugged into a petri dish of slime with a
  cable; nothing happens; a wall clock spins hours; a snail on the bench overtakes the slime's creeping front.

### Builder C — `assets/js/scenes/dnacalc.js` (Adleman's DNA computer, 1994)
- `zoom_dna` (7.0) — powers-of-ten zoom (signature move, continuous): a hand holding a test tube → a drop → a cell →
  the nucleus → a DNA double helix unwinding. Each level ~1.3 s, soft focus-blur dissolve between levels (no glitch).
- `flight_map` (14.0) — a 1990s airport departures board / an old route map pinned to a cork wall under a lamp: 7
  city pins (labels CITY 1 … CITY 7 or letters A–G), one-way flight arrows between some pairs appear at `o.flights`
  (1.5–4.0). At `o.rule` (5.0) small text "VISIT EVERY CITY ONCE"; at `o.path` (8.0) a red string traces a route from
  the first to the last city through all 7, pins ticking as it passes.
- `dna_blocks` (9.0) — a lab notebook / light table: each city is a short DNA strand drawn as a coloured brick of 4–6
  bases (letters A C G T, colours `PX.D.dna`); at `o.flights` (2.5) "flight" strands appear as connector bricks whose
  two halves match the end of one city and the start of the next, snapping between them (complementary pairing shown
  by matching notches). Label "CITY" and "FLIGHT".
- `tube_chains` (16.0) — inside a glass test tube in a rack under lab light (macro, liquid with gentle caustics):
  hundreds of tiny strands drift, bump and join into chains of different lengths (`o.link` 1.0–8.0); at `o.right`
  (10.0) one chain lights amber (the correct route) while all the other chains stay dim.
- `serial_parallel` (9.5) — split frame like a museum diorama: left a tiny old computer with one worker robot checking
  routes one after another (a queue of route cards, slowly); right the test tube with trillions of tiny worker dots all
  busy at once. Labels "ONE AFTER ANOTHER" (o.left 0.5) / "ALL AT ONCE" (o.right 3.5).
- `lab_week` (9.5) — a lab bench at night: the researcher hunched over gel electrophoresis trays, beakers, a wall
  calendar flipping through 7 days (`o.days` 0.5–5.5), coffee cups piling up. At `o.paper` (6.0) a small inset /
  foreground: the assistant solves the same 7-city puzzle on a paper napkin with a pencil next to a stopwatch reading
  "1:00" — done.
- `dna_vs_earth` (8.0) — a giant balance scale floating in space (stars, Earth light): left pan the Earth, right pan a
  growing heap of DNA (tangled helix pile). At `o.cities` (1.0) a small counter "200 CITIES"; the DNA heap grows and
  the scale tips past the Earth at `o.tip` (4.0).

### Builder D — `assets/js/scenes/dnastore.js` (DNA data storage, 2017)
- `bits_bases` (12.0) — a printing-house / typesetter's desk under a lamp: four wooden type blocks A, C, G, T (base
  colours) and beside each a pair of bits. Beats: `o.four` (0.5) letters appear, `o.two` (4.5) "4 OPTIONS = 2 BITS",
  `o.map` (7.0) mapping lines A=00 C=01 G=10 T=11 written in a ledger one by one.
- `file_bits` (14.0) — a desk with an old monitor: a photo, a music note and a film-strip icon on screen dissolve into
  streams of 1s and 0s (`o.bits` 1.5), the bit stream is re-typed as A/C/G/T letters (`o.letters` 6.0), and the letters
  fold up into a real DNA helix rising from the screen (`o.helix` 10.0).
- `order_vial` (9.5) — a night-time lab: 72,000 strands shown as a long scroll of letter-rows printing out
  (counter "72,000 STRANDS" at `o.count` 1.0), packed into an envelope "ORDER" sent through a pneumatic tube /
  courier window at `o.send` (4.0); back comes a tiny glass vial at `o.vial` (6.5) — a magnifier hovers over it showing
  a barely visible speck.
- `sequencer` (7.0) — a benchtop DNA sequencer (generic, beige/white plastic, a small screen) on a lab bench; the
  vial goes in at `o.load` (0.5), coloured base traces scroll on its screen, at `o.done` (4.0) the screen shows
  "0 ERRORS" in moss green.
- `boot_mine` (5.0) — an old beige PC on a lab bench: boot text scrolls, a simple generic desktop appears (`o.boot`
  1.5), a generic mine-sweeping grid game opens and squares get revealed, a flag placed; a small party popper / confetti
  from the side at `o.party` (3.5) (calm, small).
- `gram_scale` (14.0) — a lab balance with a tiny pinch of DNA on it reading "1 GRAM" next to a paperclip (`o.clip`
  7.0) for size; behind it, through a glass wall, an endless warehouse of hard drives / data racks receding into fog
  (par). Labels: "215 PETABYTES" (`o.pb` 2.5) and "215 MILLION GIGABYTES" (`o.gb` 7.0).
- `deep_time` (7.5) — a geological cross-section / museum timeline wall: layers of ice and rock; a DNA vial sits safe
  in cold ice deep down with "HUNDREDS OF THOUSANDS OF YEARS" (`o.dna` 0.5); near the top a hard drive rusts and
  crumbles at `o.hdd` (4.5) with "10 YEARS".
- `price_tag` (9.5) — a shop counter / lab invoice: a small "2 MB" file icon; a receipt prints out: "WRITE $7,000"
  (`o.write` 2.5) and "READ $2,000" (`o.read` 4.5); the researcher's eyebrows rise.
- `fountain` (10.0) — data droplets: a stone fountain in a courtyard at dusk spraying droplets each carrying a few
  letters; some droplets fall off and are lost (`o.lost` 2.0) but a bucket still fills and the picture reassembles
  (`o.rebuild` 5.0); at `o.phone` (7.0) a phone streaming video catches the same droplets.

### Builder E — `assets/js/scenes/cello.js` (Cello, MIT 2016)
- `verilog_ed` (13.0) — a molecular-biology lab bench at night: pipettes, a rack of tubes, and a monitor with a code
  editor. Code types out (generic Verilog-like lines: `module sensor(input a, input b, output y);`, `assign y = a & ~b;`,
  `endmodule`) from `o.code` 0.5; at `o.gate` (5.0) a small logic-gate diagram (AND with one inverted input) appears
  on a sticky note / side panel with labels "A PRESENT", "B MISSING", "OUTPUT ON"; at `o.compile` (10.5) a hand
  presses a key: "COMPILE".
- `compile_dna` (5.0) — close on the monitor: a progress bar fills; a ghost chip layout appears and gets crossed out,
  replaced by a long DNA sequence string (A C G T in base colours) at `o.dna` (2.5).
- `ecoli_in` (6.5) — microscope view: pale rod-shaped E. coli bacteria drifting with tiny flagella; a small circular
  DNA ring (plasmid, amber) slides into one bacterium at `o.in` (2.0); that bacterium gets a faint inner glow.
- `cell_circuit` (10.5) — a big cutaway of one bacterium as a living circuit board: on the membrane two sensors
  labelled "OXYGEN" and "SUGAR" (`o.in` 0.5), inside gene blocks (striped bars) with blunt repressor arrows switching
  each other off (`o.gates` 4.0, label "GENES = GATES"), at `o.out` (7.5) the output gene glows and the cell fills
  with a coloured protein ("OUTPUT").
- `plate60` (8.5) — a lab plate reader / multi-well plate on a light box: 60 wells (e.g. 6×10); wells light up in moss
  green one after another, 45 of them working by `o.end` (5.0); counter "45 / 60" at `o.count` (5.5). The others stay
  dark.
- `my_code` (3.0) — gag: the same monitor, a cosy dev desk instead of the lab; the build output scrolls with lots of
  red "ERROR" lines; a sad tiny cactus.
- `tumor_drug` (4.3) — inside a blood vessel / tissue (soft rose tones): engineered bacteria swim past healthy cells
  doing nothing, reach a lumpy darker tumour cell at `o.detect` (1.5) and release small drug particles only there.
- `root_microbes` (5.6) — underground cross-section of a plant: roots, soil layers, tiny microbes on the roots; a
  caterpillar starts chewing a leaf above ground at `o.attack` (1.5); the microbes respond by releasing insecticide
  particles up the plant at `o.spray` (3.0); the caterpillar leaves.
- `grow_prog` (4.0) — a petri dish on a windowsill at dawn where a tiny program window / code-shaped leaf sprouts and
  grows like a seedling (`o.grow` 0.5–3.5). Calm, pretty.

### Builder F — `assets/js/scenes/brain.js` (DishBrain, 2022, and power)
Neurons look: soft rose cell bodies with fine branching dendrites, tiny sparks travelling along them.
- `mea_chip` (9.0) — macro shot of a lab: a petri dish with a small chip at the bottom covered in an electrode grid
  (tiny gold/steel dots); neurons grow over it (`o.grow` 0.5–5.0), spikes flicker; label "800,000 BRAIN CELLS" at
  `o.label` (5.5).
- `two_sources` (3.6) — split: left a small lab mouse silhouette icon card "MOUSE NEURONS" (`o.mouse` 0.3), right a
  human silhouette card "HUMAN NEURONS" (`o.human` 1.8); both feed a stream of cells into the dish below.
- `dish_pong` (12.0) — a lab at night: the dish on a stage wired by cables to an old CRT TV showing a simple
  two-paddle ball game (generic, white blocks on dark). Beats: `o.sense` (2.0) electrodes light where the ball is
  ("BALL POSITION"), `o.move` (5.5) neurons fire and the paddle moves ("NEURONS MOVE THE PADDLE").
- `feedback` (16.0) — two oscilloscopes on a bench: on a hit (`o.hit` 1.5) one scope shows a neat regular pulse
  pattern ("HIT = PREDICTABLE"); on a miss (`o.miss` 5.5) the other shows noisy static ("MISS = NOISE"). At `o.adapt`
  (9.0) the neuron network in the dish rearranges its connections, sparks become more regular.
- `rally` (8.0) — the TV game plus a small lab monitor plotting hits over time crossing a dashed "CHANCE" line at
  `o.cross` (3.0); a clock label "5 MIN". No other numbers.
- `kid_wins` (4.0) — gag: an arcade at night, a ten-year-old kid (cap, sneakers) at the same game cabinet utterly
  destroying the dish (the dish sits on a stool with a tiny sad paddle); score blocks pile up on the kid's side.
- `power` (8.5) — balance of power at night: left a human head silhouette with a soft brain glow next to a light bulb,
  label "20 WATTS" (`o.brain` 1.0); at `o.dc` (4.5) the camera-independent right side reveals a huge data center
  building humming with lights and cooling fans, steam rising, "A WHOLE DATA CENTER".
