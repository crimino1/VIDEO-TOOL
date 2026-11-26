# Math film — pixel scene builders brief

Film: "Only Video That Will Make You BETTER at MATH" (11:43). Calm, warm, intelligent narrator. NOT for the Bit by Bit
channel: **no mascot, no Bit, no channel branding**. It reuses only the animation style: premium pixel-art scenes in a
calm documentary palette. The actual maths (sums, curves, charts, equations) is done separately in Manim; you build the
**story scenes**: people, places, metaphors.

The story: George Dantzig (Berkeley, 1939) arrived late, copied two "homework" problems that were famous unsolved
problems, solved them because nobody told him they were impossible. Most people decide "I'm not a math person" around age
10–12. Fast is not deep: Laurent Schwartz felt stupid at school but won the Fields Medal (1950); Maryam Mirzakhani did
badly at 12, then became the first woman to win the Fields Medal (2014), working slowly "lost in a jungle", drawing on
giant paper on the floor (her daughter called it painting). Sprinters vs mountain climbers. Math anxiety: a 2012 brain
scan study showed pain-like activity while *waiting* for math, gone while *doing* it; worry fills working memory (the
mental desk); writing worries down for 10 minutes before a test helped. Gauss as a schoolboy summing 1 to 100 by pairing.
Desirable difficulty: testing yourself beats re-reading; Ebbinghaus's forgetting curve and spacing; shuffled practice beat
blocked practice (72% vs 38%); the gym. Negative × negative via a video of someone walking played forward/in reverse. Andrew
Wiles: 7 years secretly in his attic on Fermat's Last Theorem, announced in Cambridge in June 1993, a gap was found, a
year stuck, the fix on a Monday morning in September 1994; math is walking through dark rooms. Ending: back to Dantzig.
Full narration with timestamps: `transcript.txt`.

**Owner's standing rules:** very high quality; premium; "no slop colour" — no neon, no purple-pink synthwave, no rainbow,
no glow halos; calm natural grown-up colour like a well-graded documentary or a premium indie game. Easy to understand,
engaging.

## Files
- Engine (read, **never edit**): `assets/js/px.js` (640x360 low-res ×3, camera, transitions, helpers).
  **Palette: `PX.D` only** (top of px.js). No hex literals except black/alpha for shadows.
- Approved quality references (same palette): `../bitbybit/ep04/assets/js/scenes/brain.js` (`dish_pong`),
  `../bitbybit/ep04/assets/js/scenes/intro.js` (`cabinet`), `../bitbybit/ep05/assets/js/scenes/feed.js` (`ballot`),
  `../bitbybit/ep05/assets/js/scenes/mind.js` (`judge_ladder`). Read one for the level of finish; don't copy code.
- **Your file only**: `assets/js/scenes/<yours>.js`.
- Test **from PowerShell**, JSON opts without spaces:
  `cd C:\Users\daggu222105\VIDEO-TOOL\mathbetter; node tools/pxsheet.cjs <kind> '{\"a\":1}' <dur> "$env:TEMP\x.png" 12 4`
  and one full frame: `... "$env:TEMP\x1.png" --at 3.2`. `'{}'` for defaults. PNGs to `$env:TEMP`; open every PNG
  with the Read tool and look. Page errors from another builder's file: ignore.

## Engine contract
```js
(function () {
  const { K, D } = PX;
  K.mykind = (o) => { const r = PX.rnd(7); return (g, t, d, c) => { t = Math.max(0, t); ... }; };
})();
```
- 0..640 × 0..360, camera push up to ~1.3 → key content in the central ~80%, fill the whole frame.
- Pure function of t (no Math.random/Date/state).
- **Times in `o` are seconds from shot start; defaults scale with d** (default × d / typical d). Explicit values used
  as given. **Every option must work with -5 ("already happened") and 99 ("never in this shot")**; guard indexing.

## Quality bar
1. A place, not a diagram (1939 lecture hall, dorm room, 1780s schoolroom, 1930s French lycée, attic study, lecture hall,
   exam hall, gym, jungle, mountain). Text and numbers live on blackboards, papers, slates, calendars.
2. Depth ≥ 3 layers (`PX.par` 0.3–0.7). 3. Natural light: lamps, windows, chalk-dust in sunbeams, `PX.vignette`.
4. Native resolution only; characters 40–110 px tall, 3 shades per material, expressive faces. **No real faces** —
   period-appropriate generic people (no likeness of the real person needed).
5. Life, calm: dust, breathing, flickering lamp, pages turning, pencil moving. Beats at `o.*`, change every 2–3 s.
6. ≤ 3 short labels (Press Start 2P 8 / VT323 12–20, CAPS, `PX.otext`) — prefer handwriting-like chalk text on boards.
7. **Never show maths answers the narrator hasn't reached** (no "5050", no "101" on boards before the narration).
8. **Only numbers listed in your kind's description may appear on screen.**
9. Recurring look for "the learner" (the viewer's stand-in in modern scenes): teen/young adult, dark curly hair, teal
   sweater, medium skin.

## Process
Build → 12-frame sheet → Read → full frame at the busiest beat → harsh art-director pass → fix. Test `'{}'`, all beats
-5, all beats 99. Report each kind, options with defaults, weaknesses.

## Kinds
`kind` (typical d) — content; beats `o.*` seconds from shot start.

### Builder A — `assets/js/scenes/dz.js` (Dantzig + the verdict)
- `late_class` (7.0) — a 1939 university lecture hall (tiered wooden benches, tall windows, morning light): students
  seated; a young man in a jacket with a satchel slips in late through a side door (`o.enter` 0.5); at `o.board` (3.0)
  the camera's focus is the blackboard where two long problems are written in chalk (squiggly formula lines, no real
  maths needed, no numbers).
- `copy_night` (9.0) — a small rented room at night: desk lamp, papers, he works hunched; a window shows night → day →
  night (`o.days` 1.0–6.0, days pass); crumpled papers pile up; a coffee cup.
- `hand_in` (4.5) — a professor's office: he places papers on a cluttered desk, rubs the back of his neck apologetically;
  the professor barely looks up.
- `knock` (7.0) — early Sunday morning, a quiet street of small houses, low sun: the professor in a coat bangs on a front
  door holding papers (`o.knock` 0.8, door shakes); the young man opens in pyjamas, bleary (`o.open` 3.5).
- `impossible` (4.5) — close on the blackboard from the first scene: the two chalk problems; at `o.label` (1.0) a small
  chalk word "UNSOLVED" appears above each; at `o.solved` (2.8) a tick appears under each.
- `at_board` (8.0) — a modern classroom: the learner stands at the whiteboard holding a marker, the class watching; a
  problem on the board; at `o.blank` (3.0) the learner's thought bubble fills with static, the marker freezes.
- `verdict` (6.0) — the learner at a desk receiving a test paper with a red circled grade "D" (`o.paper` 0.5), the
  teacher's disappointed face in the background; at `o.words` (3.0) the words "I'M JUST NOT A MATH PERSON" appear as if
  written in pencil on the desk.
- `schedules` (6.0) — the ending: an airport departures board and planes at gates (`o.planes` 0.5) cross-fading to a
  factory floor with conveyor lines (`o.factory` 3.0), both orderly and calm.

### Builder B — `assets/js/scenes/minds.js` (fast vs deep)
- `fast_hand` (5.0) — a modern classroom from the side: the teacher starts a question, one kid's hand shoots up
  instantly (`o.hand` 1.0) while others are still thinking.
- `lycee` (13.0) — a 1930s French lycée classroom (tall windows, wooden desks, a stove, a map on the wall): a teacher asks
  questions; other boys' hands go up quickly (`o.hands` 1.0–5.0); one thin boy with round glasses sits still, frowning in
  deep thought, writing slowly in a notebook; at `o.worry` (8.0) a small rain cloud of worry sits over him.
- `medal` (4.0) — a gold medal with a laurel relief on dark velvet under a spotlight, a small brass plaque "1950"
  (`o.plaque` 1.0). Generic medal (no real design).
- `deep_quick` (6.0) — two divers at a lake: one splashes quickly at the surface (`o.quick` 0.5), the other descends
  slowly into the deep where light falls (`o.deep` 2.0). Labels "QUICK" and "DEEP".
- `jungle` (8.0) — dense dark-green jungle: a small explorer with a lantern tries one path, then another (`o.tries`
  0.5–5.0), at `o.path` (5.5) a clear path opens, sunlight through leaves.
- `paper_floor` (8.0) — a bright room, a woman with dark short hair kneels drawing large curving pencil diagrams across
  giant sheets of paper covering the floor; a small girl (about 3) watches (`o.girl` 2.0), holding a crayon, then adds a
  little drawing of her own (`o.paint` 5.0).
- `sprint_climb` (8.0) — split frame like two posters: left a sprinter bursting down a running track (`o.sprint` 0.5);
  right a climber steadily ascending a huge mountain face (`o.climb` 2.5). At `o.judge` (5.0) a stopwatch hovers over the
  climber with a puzzled look — wrong tool.

### Builder C — `assets/js/scenes/dread.js` (anxiety and working memory)
- `scanner` (10.0) — a hospital MRI room seen through the control-room window: a person slides into the scanner
  (`o.slide` 0.5); on the operator's monitor a brain outline; at `o.signal` (4.0) a small screen in the scanner shows a
  generic "math is coming" symbol (a clock with a plus sign) and areas of the brain light amber-rust on the monitor
  (`o.light` 5.0).
- `waiting` (9.0) — split in time: a student in a waiting corridor watching a clock, a dark storm cloud over their head
  (`o.dread` 0.5, grows); at `o.doing` (5.0) the scene shifts into the exam room, the student working, the cloud gone.
- `mental_desk` (10.0) — a small wooden desk floating inside a cutaway of a head (warm light): number cards neatly on it
  (`o.cards` 0.5); at `o.worry` (3.5) crumpled worry notes start landing on the desk and pushing number cards off the
  edge; label "WORKING MEMORY" (`o.label` 1.0).
- `phone_apps` (5.0) — a phone on a table running a simple game that stutters (`o.lag` 1.5); a stack of many open app
  cards fans out behind it (`o.apps` 0.5) with a small tag "40 APPS".
- `write_worry` (11.0) — an exam hall before the exam: an anxious student writes on a sheet labelled "WORRIES" (`o.write`
  0.5); dark scribbles flow from a cloud over their head onto the paper (`o.flow` 3.0); at `o.calm` (7.0) the paper is
  folded away, the cloud gone, the student turns over the exam paper calmly.
- `exam_hall` (6.0) — a school gym set up as an exam hall with rows of desks, ninth graders writing, a clock on the wall,
  a teacher walking slowly. Calm, focused.

### Builder D — `assets/js/scenes/gauss.js` (the Gauss story)
- `old_school` (9.0) — a 1780s German village schoolroom: low beams, small windows, a stern schoolmaster with a cane at a
  lectern, boys on benches with slates. At `o.task` (1.0) he writes on the board "1 + 2 + 3 + … + 100" in chalk (this text
  only); at `o.quiet` (4.0) the boys bend over their slates.
- `slow_add` (8.0) — close on a boy's slate: chalk numbers being added one at a time, a running total that gets messy;
  at `o.giveup` (5.0) he slumps, chalk rolls away. (No totals visible; show scribbles, not real sums.)
- `quick_slate` (6.0) — a small boy (young Gauss) writes something short on his slate in seconds (`o.write` 0.5) and
  walks up to place it face-down on the master's desk (`o.place` 3.0); the master raises an eyebrow. Never show what's
  on the slate.
- `pattern_eyes` (5.0) — the small boy looking at a long row of number tiles on the board with a thoughtful look; a
  little lightbulb-like spark of insight over his head at `o.idea` (2.5). Tiles are blank (no digits).

### Builder E — `assets/js/scenes/practice.js` (desirable difficulty)
- `reread` (6.0) — the learner in a library re-reading highlighted notes again and again (page flips, highlighter),
  looking confident and relaxed (`o.relax` 2.0).
- `recall` (6.0) — another student closes the book (`o.close` 0.5) and writes from memory on a blank page, frowning with
  effort, pausing, then writing again.
- `week_later` (8.0) — a wall calendar flips one week (`o.flip` 0.5); the two students side by side in a quiz: the
  re-reader stares at a blank page (dim), the self-tester writes fluently (warm light) at `o.result` (3.0).
- `ebbinghaus` (10.0) — an 1880s study at night: a bearded man in a waistcoat at a desk with a metronome and stacks of
  small cards with three-letter nonsense syllables (letters only, e.g. "DAX", "BUP", "ZOL"), a pocket watch; he reads cards
  aloud (`o.cards` 0.5), later tests himself (`o.test` 5.0).
- `cram` (10.0) — split frame: left one long night of cramming (a single student, a pile of energy drinks, the clock racing
  through the night, exhausted); right three calm short sessions across a week (a calendar with three marked days,
  `o.sessions` 2.0–6.0).
- `classroom7` (9.0) — a seventh-grade classroom: worksheets on desks. Left half of the room: worksheets with the same
  icon repeated (blocked, `o.blocked` 0.5). Right half: worksheets with mixed icons (shuffled, `o.mixed` 3.0); students
  on the right look more puzzled during practice.
- `gym` (8.0) — a gym: the learner lifts a tiny weight easily (`o.easy` 0.5, bored), then a heavy barbell with real strain
  (`o.heavy` 4.0), muscles visibly working.

### Builder F — `assets/js/scenes/wiles.js` (Andrew Wiles, dark rooms, negative × negative)
- `attic` (10.0) — an attic study at night: sloped ceiling, a skylight with stars, a desk covered in papers, a man with
  glasses working by lamplight; a calendar flips years (`o.years` 1.0–7.0) and stacks of paper grow; a library book open
  on the desk.
- `lecture93` (8.0) — a lecture hall with a large chalkboard: the man writing at the board (`o.write` 0.5); at `o.done`
  (4.0) he steps back and the audience applauds (hands moving).
- `presses` (5.0) — newspapers rolling off a press and stacking on a news stand with generic headlines (wavy lines, no
  real paper names, no real headline text).
- `gap` (5.0) — a reviewer's desk with a manuscript; a red pencil circles a spot on a page (`o.circle` 1.0) and a small
  label "GAP" appears (`o.label` 2.5).
- `stuck_year` (9.0) — the same attic: crumpled papers around the bin, the man's head in his hands (`o.slump` 3.0), leaves
  outside the skylight change through a year; faint silhouettes of watching people in the window glass.
- `epiphany` (8.0) — a quiet Monday morning study: sunlight gradually floods in (`o.light` 2.0); the man looks up from his
  papers (`o.look` 3.5), a still moment of realization.
- `dark_room` (12.0) — a pitch-dark room seen faintly: a figure feels their way, bumping into furniture (`o.bump` 1.5,
  4.0); at `o.switch` (7.0) finds the switch and the room lights warmly, revealing the furniture they bumped; at `o.next`
  (10.0) a door opens to another dark room.
- `walk_film` (16.0) — a small cinema/classroom projector screen showing a person walking. Beats: `o.fwd` (0.5) walking
  forward (label "FORWARD"), `o.back` (3.0) walking backward ("BACKWARD"), `o.play` (5.0) a "PLAY ▶" sign over normal
  playback, `o.rev` (7.5) "REVERSE ◀◀": a forward walker played in reverse looks like walking backward, `o.both` (11.0) a
  backward walker played in reverse looks like walking forward.
