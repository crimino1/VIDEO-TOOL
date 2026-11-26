# Bit by Bit EP5 — pixel scene builders brief

Film: "Creepy Computer Science Concepts: how your feed knows you" (9:23), YouTube channel **Bit by Bit**. Calm, smart
narrator, a little unsettling, fair-minded. The story: your phone isn't listening (a 2018 Northeastern study of 17,000+
apps found no secret mic use), so how did it know about the hiking boots? We build a recommendation system piece by
piece: collaborative filtering (a giant spreadsheet of people × videos), the Netflix Prize (2006–2009, $1M, beat us by
10%, won by 20 minutes), matrix factorization (everyone becomes 50 numbers; the numbers turn into hidden ideas like
serious vs silly; you are a dot in a 50-direction space), the Wall Street Journal's 2021 TikTok bots (they only paused
longer; figured out in under 2 hours), YouTube's two stages (rough candidate grab, careful watch-time prediction), the
2015 Cambridge/Stanford study (likes predict personality better than a coworker / friend / family / spouse), the catch
(what you keep watching ≠ what you're glad you watched), what you can do, and the "exploring" random video.
Full narration with timestamps: `transcript.txt` (read it for tone).

**The owner's standing rules (EP4 was approved in this look; push quality even higher):**
- Pixel animation, **very high quality**, like a premium indie game or a BBC documentary's explainer inserts.
- **No AI-slop colour.** No neon, no purple-pink synthwave, no rainbow, no glow halos everywhere. Calm, natural,
  grown-up colour. For this episode lean **cool and nocturnal** (it's the "creepy" one): dark neutral nights, steel/teal
  for machines and phone light, warm cream lamp light for homes, and ONE warm accent for the viewer: the **YOU dot**.
- Engaging: every scene tells its beat clearly with life and small surprises.

You build **pixel scene kinds**. Others do the timeline, text overlays, real footage, photos, mascot and sound.

## Files
- Engine (read, **never edit**): `assets/js/px.js` (640x360 low-res ×3, camera, transitions, helpers).
  **Palette: `PX.D` only** (top of px.js). No hex literals except black/alpha for shadows; derive shades by mixing PX.D
  entries (accents are `[light, base, shadow]`).
- Detail/quality references from EP4 (same palette, approved): `../ep04/assets/js/scenes/brain.js` (`dish_pong`),
  `../ep04/assets/js/scenes/dnastore.js` (`gram_scale`), `../ep04/assets/js/scenes/intro.js` (`cabinet`). Read one for
  the level of finish; do not copy them into your file.
- **Your file only**: `assets/js/scenes/<yours>.js`.
- Test **from PowerShell** (Git Bash can't launch the browser), JSON opts without spaces:
  `cd C:\Users\daggu222105\VIDEO-TOOL\bitbybit\ep05; node tools/pxsheet.cjs <kind> '{\"a\":1}' <dur> "$env:TEMP\x.png" 12 4`
  and one full frame: `... "$env:TEMP\x1.png" --at 3.2`. `'{}'` for defaults. PNGs to `$env:TEMP` only; open every
  PNG with the Read tool and look. Page errors from another builder's file: ignore.

## Engine contract
```js
(function () {
  const { K, D } = PX;
  K.mykind = (o) => { const r = PX.rnd(7); /* precompute */ return (g, t, d, c) => { ... }; };
})();
```
- Draw in 0..640 × 0..360. Camera default push 1.0→1.05 (timeline may push to ~1.3). Key content inside the central
  ~80%; fill the whole frame.
- Pure function of t (no Math.random, Date, state). `t` may be negative: clamp it.
- **Times in `o` are seconds from shot start; defaults scale with d** (default × d / typical d) so `'{}'` works at any
  length. Explicit values are used as given. **Every option must tolerate a negative value (meaning "already
  happened") or 99 (meaning "never in this shot")** — guard array indexing (use ((i % n) + n) % n). Test both.
- Helpers: rect, line, box, panel, circle, sprite, text (font "p" Press Start 2P 8/16, "v" VT323 10–32), otext, tw,
  typed, p, ease, KF, q, blink, rnd, clamp, lerp, glow (soft, small), vignette, vgrad, par, particles.

## Quality bar (every scene)
1. **A place, not a diagram**: bedroom at night, café, server aisle, office with a wall screen, video-rental archive,
   lab with phone racks, stage, warehouse, couch at 1 a.m. Diagrams live inside something (wall screen, whiteboard,
   phone screen, light table, notebook).
2. **Depth**: ≥ 3 layers, far layers darker/lower contrast in `PX.par` 0.3–0.7.
3. **Light**: lamp, window moonlight, phone glow on faces (cool light from below), monitor light. Lit edges, soft falloff,
   `PX.vignette(g, 0.45–0.6)`.
4. **Native resolution only** (never PX.zoom a sprite). Characters 40–110 px tall, 3 shades per material, faces that
   change expression.
5. **Life, calm and a little uncanny**: dust in lamp light, slow blinking LEDs, phone notifications lighting a dark
   room, curtains breathing, a cursor waiting. Beats at `o.*`; something changes every 2–3 s. Eases "out"/"io".
6. One focal point per beat, ≤ 3 short labels (Press Start 2P 8 or VT323 12–20, CAPS, `PX.otext`, cream or accent).
7. **The YOU dot** (recurring motif across files): a small warm amber dot (`PX.D.amber`) with a soft 1-px cream ring
   and a faint pulse. Other people's dots are cool cream/steel. Videos are small teal squares. Keep this consistent.
8. **Recurring characters** (draw consistently): **You** — 20s, dark wavy hair, mustard-amber hoodie, medium-brown skin;
   **the friend** — short ginger hair, green jacket, light skin. Generic researchers: lab coat, simple faces.
9. No logos/brands/real UI (draw a generic "video app", "feed", "spreadsheet", "contest website"; no TikTok/YouTube/
   Netflix logos or red play buttons), no emoji glyphs, no mascot, no real faces.
10. **Only numbers listed in your kind's description may appear on screen.** No invented data labels.
11. Dry humour where the script jokes; never slapstick.

## Process
Build → 12-frame sheet at typical d → Read → full frame at busiest beat → harsh art director pass ("premium indie game
or BBC doc?", "anything loud or neon?", "does the beat read in one second?") → fix. Test `'{}'`, all beats = -5 and all
beats = 99. Report: each kind, options with defaults, weaknesses.

## Kinds
`kind` (typical d) — content; beats `o.*` in seconds from shot start.

### Builder A — `assets/js/scenes/home.js` (cold open + ending, the boots story)
- `boots_talk` (6.4) — cosy living room at night: You and the friend on a sofa talking (mouth anims); a speech bubble
  shows a small pixel hiking boot. A phone lies face-up on the coffee table. At `o.ad` (4.0) the phone lights up: a
  generic ad card with the same boot; You freeze and slowly look at the phone. Uncanny, quiet.
- `mic_myth` (6.0) — dark bedroom, phone on the nightstand glowing faintly; a ghostly ear silhouette made of dotted lines
  forms over it (`o.ear` 0.5) and then dissolves as a small "MIC OFF" icon on the phone settles (`o.off` 3.5).
- `phone_wall` (12.0) — a university lab at night: a wall of racks holding many Android-style phones (generic), screens
  flicking through app icons; a researcher at a monitor that shows network traffic graphs. Labels: "17,000+ APPS"
  (`o.count` 1.0); at `o.zero` (6.0) the monitor shows "MIC IN SECRET: 0" and at `o.zero2` (8.5) "AUDIO SENT: 0".
- `crumbs` (9.0) — You walking through a rainy night street holding a phone; every action leaves a tiny glowing crumb
  (pause, scroll, location pin, wifi wave, tap) that drifts up into the sky toward a distant data-centre tower on a hill;
  at `o.out` (6.0) the tower answers with a single beam that lands as a small boot icon on You's phone.
- `wifi_morning` (13.0) — a small shared apartment at morning (window light): the friend at a laptop searching trails
  (`o.friend` 0.5, a map/trail page glows), a Wi-Fi router on the shelf with both devices linked to it (`o.wifi` 2.5);
  You on the sofa pauses on a mountain photo for two seconds (`o.pause` 5.0, a small dwell bar fills); a wall calendar
  shows spring flowers (`o.spring` 8.0) with a few distant dots near the YOU dot buying boots (tiny boot icons).

### Builder B — `assets/js/scenes/sheet.js` (collaborative filtering)
- `big_sheet` (9.0) — a dark open-plan office at night; a huge wall screen shows a spreadsheet: rows = people (tiny
  avatar per row), columns = video thumbnails (teal squares). At `o.rows` (1.0) rows highlight, `o.cols` (3.0) columns
  highlight, `o.ones` (5.0) "1"s pop into cells. Labels "PERSON", "VIDEO".
- `twin_row` (16.0) — close on the wall screen: your row (amber) at `o.you` (0.5); scanning beams compare rows; at
  `o.twin` (4.0) a stranger's row lights (cream) with a small label switching "BRAZIL?" → "POLAND?"; at `o.same` (7.0)
  "SAME 40 VIDEOS" with matching cells joined by thin lines; at `o.extra` (10.0) one extra cell in the twin's row glows and
  slides across into your row as "NEXT".
- `blind_clerk` (9.5) — a dim video-rental archive with endless shelves of blank tapes; a clerk wearing a blindfold sorts
  tapes only by the little tags of who borrowed them (strings connecting people cards to tapes). Labels appearing with
  question marks: "COOKING?" (`o.q1` 3.0), "FOOTBALL?" (`o.q2` 4.5), "SADNESS?" (`o.q3` 6.0).
- `strangers` (8.5) — night city plaza seen from above: many faint stranger silhouettes walking different routes; their
  paths converge on the same few lit doorways where You also arrives (`o.converge` 3.0). Calm and eerie.
- `sparse` (16.0) — the spreadsheet zooms out to a vast dark grid with very few lit cells (stars in a night sky effect).
  Counters appear: "100 MILLION RATINGS" (`o.c1` 2.5), "480,000 CUSTOMERS" (`o.c2` 4.5), "18,000 MOVIES" (`o.c3` 6.5);
  at `o.empty` (10.0) "99% EMPTY" as most cells dim further.
- `no_twin` (6.0) — two rows on a light table: yours and a would-be twin with almost no overlapping cells; a postcard of a
  beach city with a "?" stamp; the connecting line fails to form (`o.fail` 2.5).

### Builder C — `assets/js/scenes/prize.js` (the Netflix Prize)
- `big_cheque` (7.0) — a press-conference stage with spotlights: a giant cheque "$1,000,000" wheeled in (`o.cheque`
  0.5), a banner "BEAT OUR SYSTEM BY 10%" unrolls (`o.banner` 3.0). Generic company, no logo.
- `leaderboard` (16.0) — a cramped home office at night (2007 vibes: CRT monitor, pizza box): a contest leaderboard on
  screen, a progress bar toward "10%" climbing and stalling near "8%" (`o.stuck` 6.0); a wall calendar flips years
  2006 → 2009 (`o.years` 1.0–10.0); a small team counter "THOUSANDS OF TEAMS" (`o.teams` 3.0).
- `merge` (6.0) — small team badges (round pins with simple symbols) drifting on a cork board, snapping together into
  bigger clusters (`o.m1` 1.0), merging again (`o.m2` 3.0) until two big super-teams remain.
- `photo_finish` (8.5) — a racetrack photo-finish camera shot: two super-team runners crossing almost together; a
  timestamp strip below shows "20 MINUTES" between their marks (`o.finish` 3.5); quiet confetti for the winner
  (`o.win` 5.5).
- `shrink` (9.0) — a giant spreadsheet on a wall screen compresses (`o.shrink` 1.0–4.0) into two thin strips: a person
  strip and a movie strip, each "50 NUMBERS" (`o.label` 5.0), shown as little bars.
- `dot_product` (12.0) — a workbench like an abacus/loom: your strip of 50 beads above a movie's strip; pairs light up
  left to right (`o.pairs` 1.0–5.5) with tiny multiply sparks, flowing into a brass gauge; `o.big` (6.5) gauge high →
  "BIG TOTAL: LOVE IT"; `o.small` (9.0) another movie strip → gauge low → "SMALL TOTAL: SKIP".

### Builder D — `assets/js/scenes/space.js` (learning the numbers, the dot space)
- `nudge` (14.0) — a vast dim control room with a giant mixing desk of sliders (rows for people, columns for movies),
  sliders start random (`o.random` 0.5); waves of tiny nudges ripple across (`o.nudge` 3.0 onward), an error meter on the
  wall falls step by step; a counter word "AGAIN" then "BILLIONS OF TIMES" (`o.billions` 10.5).
- `axes` (20.0) — a darkroom light table: generic movie posters (simple shapes, no text) slide into position along a
  labelled axis as it appears: "SERIOUS ↔ SILLY" (`o.a1` 2.0), then a second axis "KIDS ↔ ADULTS" (`o.a2` 6.0), then
  "EXPLOSIONS ↔ CONVERSATIONS" (`o.a3` 9.5); at `o.nobody` (14.0) a small card "NOBODY TOLD IT" pinned.
- `dot_space` (17.0) — a vast dark space of dots (like a calm starfield but each dot a person or video), slow parallax
  drift; the YOU dot appears (`o.you` 0.5) with "YOU"; `o.dims` (3.0) "50 DIRECTIONS" with faint axis lines; `o.near`
  (6.0) people dots nearby brighten; `o.videos` (9.0) teal video squares close by; `o.walk` (12.0) a short dotted walk
  from YOU to one video.
- `dot_moves` (6.5) — close on the YOU dot inside the space; small action icons (tap, pause, scroll) pop near it and
  each nudges it a little (`o.moves` 0.5–5.5), leaving a faint trail; a server rack silhouette in the far background.

### Builder E — `assets/js/scenes/feed.js` (TikTok bots, YouTube two stages)
- `bot_farm` (12.0) — a news-room basement at night: shelves holding 100 phones on stands (bots), each screen scrolling
  a feed; tiny tags under phones with simple icons (dog, dancer, star sign). `o.count` (1.0) "100+ BOTS"; `o.dog`
  (3.0), `o.dance` (4.0), `o.astro` (5.0) highlight a phone with each icon; `o.nosearch` (7.0) a crossed-out keyboard
  icon "NO SEARCHING".
- `linger` (11.0) — extreme close-up of one bot phone scrolling: videos pass; on dog videos the scroll slows and a dwell
  bar fills longer (`o.linger` 1.0 onward); the like button stays untouched; at `o.figured` (6.0) the feed fills with
  dogs and a small clock reads "UNDER 2 HOURS" (`o.clock` 7.0).
- `ballot` (9.0) — You on a couch at 1 a.m. scrolling (phone light on the face, a lamp off, city window); every pause
  drops a glowing ballot into a ballot box beside the sofa (`o.votes` 1.0 onward, faster over time); label
  "HESITATION" (`o.label` 0.5).
- `two_stage` (16.0) — a huge warehouse of video cassettes/cards to the horizon. Stage 1 (`o.s1` 1.0): a fast forklift
  sweeps up a crate of a few hundred near the YOU dot ("ROUGH AND FAST"). Stage 2 (`o.s2` 7.0): a careful inspector at a
  desk examines each with a stopwatch, writing one number ("SLOW AND CAREFUL"). At `o.watch` (12.0) the stopwatch label
  "WATCH TIME" lights.
- `clickbait` (6.0) — a market stall of loud thumbnails (generic shapes with "!!!" marks, but in the calm palette) drawing
  quick clicks; shoppers walk off fast (`o.leave` 2.5); a sign "CLICKS" gets crossed out (`o.cross` 4.0).
- `seventy` (8.0) — a canal city at dusk: a river of tiny boats (viewers) flowing; most of them take the channel through a
  lantern gate "RECOMMENDED" (`o.gate` 2.0) with "70%" on the gate (`o.pct` 3.5).

### Builder F — `assets/js/scenes/mind.js` (personality, the catch, what you can do, exploring)
- `volunteers` (8.0) — a big study hall: rows of volunteers filling long paper personality tests (`o.test` 0.5); a quiet
  machine on the stage reads only a wall of thumbs-up page cards (`o.likes` 4.0). "86,000 VOLUNTEERS" (`o.count` 1.0).
- `judge_ladder` (13.0) — a tall library ladder or staircase; a small robot climbs past figures standing on steps:
  COWORKER (`o.s1` 1.0, "10 LIKES"), FRIEND (`o.s2` 4.0, "70"), FAMILY (`o.s3` 6.5, "150"), SPOUSE (`o.s4` 9.5,
  "300"); each figure looks surprised as the robot passes.
- `neighborhood` (5.0) — the dot space seen like a small night town: dots as lit windows in houses; the YOU dot's
  house glows; neighbouring houses show similar silhouettes in their windows.
- `inside_machine` (9.0) — the back panel of a big machine opens (`o.open` 1.0): no little person inside, only abacus
  gears doing sums; a chute drops a ridiculous recommendation (an old boot? a traffic cone) into a bin (`o.garbage` 5.0).
- `two_lists` (10.0) — a corkboard in a dim room: two paper lists "WHAT YOU KEEP WATCHING" (`o.l1` 0.5) and "WHAT
  YOU'RE GLAD YOU WATCHED" (`o.l2` 3.0); at `o.measure` (6.0) a measuring tape/meter clamps onto only the first list.
- `sad_feed` (10.0) — a phone on a desk in a rainy dark room; its feed tiles slowly turn from mixed colours to grey-blue
  rainy tiles (`o.sad` 1.0–7.0); clock "36 MIN" (`o.clock` 7.5). Nothing broken; quiet and sad.
- `controls` (17.0) — close on You's hands holding a phone over a kitchen table at night; four actions in turn, each
  sending the YOU dot (shown in a small inset space) moving: "NOT INTERESTED" (`o.b1` 1.0), "PAUSE HISTORY" (`o.b2`
  6.0), "SEARCH ON PURPOSE" (`o.b3` 9.5), "FINISH IT" (`o.b4` 13.0, loudest move).
- `explore` (17.0) — a feed of familiar tiles with one odd woodworking tile (a small chair-and-saw icon) at `o.odd`
  (1.0); cut-in idea: a flashlight beam in a dark house searching an unopened door (`o.search` 6.0), label "EXPLORING"
  (`o.label` 10.0); at `o.scroll` (13.0) the odd tile scrolls past and the door stays shut.
