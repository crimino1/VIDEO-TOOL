# Euler film — pixel scene builders brief

Film: "The Most Beautiful Equation Explained Like You're 12" (11:00), Euler's identity e^(iπ) + 1 = 0. Calm, warm,
clear narrator. Same look as our previous math film (`../mathbetter`): premium pixel-art story scenes in a calm
documentary palette, while all the actual maths (number lines, circles, rotations, curves) is done separately in
Manim. You build **story and metaphor scenes**: people, places, everyday objects. **No mascot, no channel branding.**
Full narration with timestamps: `transcript.txt`.

**Owner's rules:** very high animation quality; "no slop colour": no neon, no purple-pink synthwave, no rainbow, no
glow halos; calm natural colour (well-graded documentary / premium indie game). Easy to understand, engaging.

## Files
- Engine (read, never edit): `assets/js/px.js`. **Palette `PX.D` only**, no hex literals except black for shadows.
- Approved references for the level of finish (same palette): `../mathbetter/assets/js/scenes/dz.js`
  (`late_class`, `knock`), `../mathbetter/assets/js/scenes/wiles.js` (`attic`, `dark_room`),
  `../mathbetter/assets/js/scenes/practice.js` (`ebbinghaus`). Read one; don't copy code.
- **Your file only**: `assets/js/scenes/<yours>.js`. `dread.js` (MRI `scanner` kind) already exists; don't touch it.
- Test from **PowerShell**, JSON opts without spaces:
  `cd C:\Users\daggu222105\VIDEO-TOOL\euler; node tools/pxsheet.cjs <kind> '{\"a\":1}' <dur> "$env:TEMP\x.png" 12 4`
  plus one full frame `... --at 3.2`. Open every PNG with Read and look.

## Engine contract (same as before)
`K.kind = (o) => { ...; return (g, t, d, c) => { t = Math.max(0, t); ... } }`, 640×360, pure function of t, times in
`o` are seconds from shot start, defaults scale with d, every option must work at -5 ("already") and 99 ("never").
Key content inside the central 80% (camera pushes to ~1.25); fill the whole frame.

## Quality bar
A real place with ≥3 depth layers, natural light (lamp, window, candle, sun), native-resolution characters 40–110 px
with expressive faces (no real likenesses needed; period-appropriate generic people), calm life (dust, flicker,
breathing), something changes every 2–3 s, ≤3 short labels (Press Start 2P 8 / VT323), only numbers or formulas
listed in your kind, harsh art-director self-review. Test `'{}'`, all beats -5, all beats 99.

## Kinds
`kind` (typical d) — content; beats `o.*` seconds from shot start.

### Builder A — `assets/js/scenes/story.js` (the beauty study, Feynman, galleries)
- `rating` (6.0) — a quiet modern research room in London (rain on a tall window, desk lamp): a mathematician sorts a
  long row of small equation cards (scribble lines, no real maths) along a table strip labelled "UGLY" at the left end
  and "BEAUTIFUL" at the right (`o.sort` 0.5 onward: cards slide to positions one by one).
- `gallery` (6.0) — split warm scene: left a person in an art gallery standing before a large landscape painting
  (`o.paint` 0.5), right a teenager on a bed with headphones nodding to music (`o.song` 2.5). Both have a soft warm
  light of delight. No brain imagery.
- `notebook` (8.0) — a teenage boy (14, short dark hair, 1930s sweater) at a small desk at night in a New York
  apartment (window with city lights, radiator, lamp), writing in a notebook (`o.write` 0.5); at `o.big` (3.5) a close
  insert of the notebook page shows big bold handwritten "e^(iπ) + 1 = 0" (draw it as handwriting: e, superscript iπ,
  + 1 = 0) and he underlines it twice, grinning.
- `magazine` (5.0) — a reading chair by a window, a math magazine open on a side table with a reader filling in a
  little ballot card and dropping it into an envelope (`o.vote` 1.5). Generic magazine, no real logo or title text.

### Builder B — `assets/js/scenes/history.js` (people of the past)
- `brahmagupta` (8.0) — 7th-century India: a scholar in a courtyard study at dusk (oil lamp, carved pillars, palm-leaf
  manuscripts), writing on a palm leaf with a stylus; at `o.zero` (3.0) a small round symbol (a dot/ring for zero)
  glows softly on the leaf as he finishes it.
- `bank` (8.0) — a warm old-fashioned bank counter (brass grille, ledgers, coin scales): a smiling banker slides one
  coin to a customer (`o.give` 0.5); at `o.grow` (3.0) the coin stack beside it grows in steps (no digits).
- `basel` (6.0) — 1683 Basel study: a man in a wig and dark coat at a desk with a quill, ledgers and a candle,
  calculating (`o.calc` 0.5); at `o.eureka` (3.5) he stops and leans back, intrigued.
- `italy` (6.0) — 1500s Italy: two mathematicians at a public contest table in a sunlit piazza with a small crowd, each
  writing equations (scribbles) on slates; one quietly uses a strange trick (at `o.trick` 2.5 a small glowing "?" symbol
  on his slate) and the rival scoffs.
- `descartes` (7.0) — 1637 France: a man with long hair and moustache writes by candlelight in a quiet room; at
  `o.word` (3.0) he writes the word "IMAGINAIRE" on the page and gives a dismissive little shrug.
- `euler_blind` (10.0) — 1770s St Petersburg study: an older man with an eye patch-like squint (one eye closed), in a
  robe and cap, sits by a window with his eyes closed, dictating (`o.dictate` 0.5, mouth moving, hand gesturing);
  a young helper at a desk writes quickly (pages piling up at `o.pages` 3.0 onward); snow outside the window.
- `euler_young` (5.0) — 1740s: a younger man in a wig writes at a tall desk full of papers by daylight (`o.write`
  0.5), stacks of manuscripts around him.

### Builder C — `assets/js/scenes/world.js` (everyday metaphors and modern world)
- `phone_turn` (10.0) — top-down view of a wooden table with two hands holding a phone flat, screen up, pointing away
  (up the frame) (`o.start` 0.3). At `o.q1` (2.5) the hands turn it a quarter turn to the left (now pointing left);
  at `o.q2` (6.0) another quarter turn (now pointing toward the viewer, down the frame). A tiny arrow on the screen
  shows which way the phone points. Labels "×i" at q1 and "×i ×i" at q2 (small).
- `ball_string` (8.0) — a child in a park at golden hour swinging a ball on a string around their head, seen from
  above at a slight angle: the ball circles steadily (`o.swing` 0.5). Optional `o.arrows` (3.0): faint dotted arrows
  show the string direction and, at right angles to it, the ball's direction of motion.
- `outlet` (6.0) — a home at evening: a wall socket and a lamp plugged in, a faint cutaway of the wire inside the wall
  where a small glowing dot oscillates back and forth fast (`o.flow` 0.5) (alternating current); label "50 TIMES A
  SECOND" at `o.label` 2.5.
- `waves` (8.0) — a city rooftop at dusk with a radio/wifi mast, a lamp, and a speaker on a balcony: gentle concentric
  wave rings come from the speaker (sound, `o.sound` 0.5), from the lamp (light, `o.light` 2.5) and from the mast
  (wifi, `o.wifi` 4.5), each a different calm colour; labels "SOUND", "LIGHT", "WIFI".
- `mri_room` (6.0) — a hospital imaging room: a patient on an MRI table; on the operator's screen a body slice image
  builds up line by line (`o.build` 1.0).
- `particles` (6.0) — a quiet physics lab at night: an old blackboard and, under a magnifier on a bench, a small
  glowing cloud of tiny particles drifting and flickering (`o.zoom` 2.0 the view leans in).
- `wall_frame` (5.0) — a cosy study: someone hangs a small framed card on the wall (`o.hang` 1.0) showing
  "e^(iπ) + 1 = 0" in neat print; they step back and admire it.
