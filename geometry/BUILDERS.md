# Geometry film — pixel scene builders brief

Film: "Geometry Explained Like You're 5" (16:03). Calm, warm narrator. It continues our math series (`../euler`,
`../mathbetter`). Premium pixel-art story scenes in the calm documentary palette carry the story, while all the actual
diagrams (angles, triangles, squares, circles, globes) are done separately in Manim. You build **story and metaphor
scenes**: people, places and everyday objects. **No mascot, no channel branding.** The full narration with timestamps
is in `transcript.txt`.

**Owner's rules:** very high animation quality. "No AI-slop colour": no neon, no purple-pink synthwave, no rainbow and
no glow halos. Use calm natural colour, like a well-graded documentary or a premium indie game. Keep it easy to
understand and engaging.

## Files
- Engine (read, never edit): `assets/js/px.js`. **Use the `PX.D` palette only**, with no hex literals except black for
  shadows.
- Approved references for finish and style (same engine and palette). Read one; don't copy code:
  - `../euler/assets/js/scenes/history.js` (`brahmagupta`, `euler_blind`, `italy`)
  - `../euler/assets/js/scenes/story.js` (`notebook`, `gallery`)
  - `../euler/assets/js/scenes/world.js` (`phone_turn`, `ball_string`)
  - A local helper kit at the top of your file is fine.
- **Write to your file only:** `assets/js/scenes/<yours>.js`.
- Test from **PowerShell**, with JSON options containing no spaces:
  `cd C:\Users\daggu222105\VIDEO-TOOL\geometry; node tools/pxsheet.cjs <kind> '{\"a\":1}' <dur> "$env:TEMP\x.png" 12 4`
  Also render one full frame with `... --at 3.2`. Open every PNG with Read and look at it.

## Engine contract
- `K.kind = (o) => { ...; return (g, t, d, c) => { t = Math.max(0, t); ... } }`.
- The canvas is 640×360, and each frame is a pure function of t.
- Times in `o` are seconds from shot start. Defaults scale with d.
- Every option must work at -5 ("already happened") and 99 ("never happens").
- Keep key content inside the central 80%, because the camera pushes in to about 1.15. Fill the whole frame.
- Do not bake in your own camera zoom.

## Quality bar
- A real place with at least three depth layers and natural light (sun, lamp, candle).
- Native-resolution characters, 50–110 px tall, with expressive faces: generic period people, no real likenesses.
- Calm life: dust, ripples, breathing, birds, cloth moving.
- Something changes every 2–3 s.
- At most 3 short labels (Press Start 2P 8 / VT323), and only the numbers listed in your kind.
- Review your own work harshly, like an art director.
- Test `'{}'`, all beats at -5 and all beats at 99.

## Kinds
Each entry gives the kind name, its typical duration d, the content, and its beats as `o.*` seconds from shot start.

### Builder A — `assets/js/scenes/ancient.js`
- `nile_flood` (8.0): ancient Egyptian farmland beside the Nile at the start of summer, with palms, mud-brick houses
  and distant pyramids. Brown floodwater spreads across the green fields (`o.flood` 0.5 until about d·0.7) and swallows
  the small boundary stones. A farmer and his child watch from a raised path.
- `rope_stretchers` (8.0): after the flood, on wet black mud. Two or three men in white kilts stretch a long
  knotted rope taut between wooden pegs (`o.stretch` 0.5), then hammer a corner peg (`o.peg` 3.0) and drag the rope to
  mark a new straight boundary line (`o.mark` 5.0). Villagers watch. The knots on the rope are evenly spaced.
- `euclid_class` (8.0): Alexandria, about 300 BC. A sunlit colonnade with the harbour and the lighthouse in the
  distance. A bearded Greek teacher kneels at a sand tray with a stick and a compass and draws a straight line
  between two dots (`o.line` 0.8), then a circle around a dot (`o.circle` 3.5). Three young students watch and one
  nods. Papyrus scrolls sit in niches.
- `altar_ropes` (8.0): ancient India, a Vedic fire altar being laid out at dawn. Priests stretch measuring ropes
  between bamboo pegs to make a perfect square base of bricks (`o.ropes` 0.5). Bricks are laid in a pattern
  (`o.bricks` 3.0), and a small flame is lit in the middle (`o.fire` 6.0).
- `syene_well` (7.0): a split frame at noon. On the left is Syene: a deep stone well, and from above, sunlight
  reaching all the way to the water at the bottom, with no shadow (`o.sun` 0.5). On the right is Alexandria: an upright
  stick in a courtyard casting a short shadow, and a scholar (Eratosthenes, generic older Greek, scroll) measuring the
  shadow angle with a cord (`o.measure` 3.5).
- `walkers` (7.0): a desert road along the Nile with palms. Two professional walkers (bematists) pace in perfectly
  even steps, counting on knotted cords (`o.walk` 0.3). Milestones pass, and a caravan and boats on the river pass
  behind.

### Builder B — `assets/js/scenes/modern.js`
- `string_circle` (6.0): a sunny sandy schoolyard. A child pins one end of a string with a peg, ties a stick to the
  other end and walks around, scratching a circle in the sand (`o.walk` 0.5; the circle closes at about d·0.75).
  Friends watch.
- `pizza_order` (7.0): a warm pizza shop counter. A customer looks up at a chalk menu board that shows one large
  pizza and two medium ones with simple circles (no prices). Two boxes and one big box are opened on the counter
  (`o.open` 2.5). A small "18 IN" label is on the large box and "12 IN" on the medium boxes.
- `giant_ant` (7.0): a playful scale comparison on a savanna at golden hour. An elephant walks with its tree-trunk
  legs, a spider runs on thread-thin legs on a branch in the foreground, and a GIANT ant stands as tall as the
  elephant (`o.grow` 1.0 grows the ant from normal size). Its thin legs buckle and it sinks down onto its belly
  (`o.collapse` 4.0, comic but not violent).
- `bolyai_letter` (8.0): about 1820. On the left, a candlelit study in Transylvania: an old father (Farkas) writes a
  worried letter with a quill (`o.write` 0.5) and seals it. On the right, a young officer in a military coat (János)
  at an army post reads it by lamplight (`o.read` 4.0), sets it down and goes back to his diagrams, determined.
- `gps_street` (7.0): a busy evening city street. A person stops and looks at their phone; a map pin drops on the
  screen (`o.pin` 4.0). Four faint dotted lines go up from the phone to four small satellites in the darkening sky,
  which appear one by one (`o.sats` 0.5, then about every 0.8 s).
- `builder_corner` (6.0): a construction site in morning sun. Two builders check a new brick corner with a tape: one
  marks 3 units along one wall (`o.three` 0.5), the other marks 4 along the other (`o.four` 2.0), and then they stretch
  the tape across the gap (`o.five` 3.5), read "5" and give a thumbs up. The labels are only "3", "4" and "5".
