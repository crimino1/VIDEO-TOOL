---
name: physics-channel
description: "User's physics explainer channel — \"Glow & Doodle\" style; Maxwell film built from user's own VO (no music); reusable pipeline in VIDEO-TOOL/maxwell"
metadata:
  node_type: memory
  type: project
  originSessionId: 568d41b3-33e4-4dda-82d3-5395ea4a2738
  modified: 2026-11-09T19:00:09.394Z
---

User runs a physics explainer channel (name not given yet). On 2026-11-09 they asked to MIX two reference videos into one look: the Maxwell's-equations explainer (navy stage, glowing gold/cyan diagrams, colour-coded equations) + "ALL OF PHYSICS in 14 Minutes" (big white keywords on black, emoji, doodle arrows, fast cuts). Guide: channel-style skill channels/physics.md.

Film 1 (2026-11-10): "Nobody Explained Maxwell's Equations Like THIS!" from the user's own voiceover + their own timed transcript (more accurate than whisper small, use it). User asked: internet images, memes, SFX, Pexels, NO background music. Output done/maxwell.mp4 + done/maxwell-credits-for-youtube-description.txt.

Pipeline in VIDEO-TOOL/maxwell: shots.py (kinds m=Manim, k=black keyword card with emoji/doodles, p=Pexels photo, q=portrait card), manim/common.py (Glow&Doodle look: navy bg, Inter+Kalam, eq() colour-coded, doodle(), emoji()), tools/build_index.py writes index.html + SFX, tools/make_sfx.py synthesises SFX (Pexels has no audio), tools/finish.py sets -14 LUFS. Noto emoji PNGs from fonts.gstatic.com/s/e/notoemoji/latest/<cp>/512.png. 24 Manim scenes were written in parallel by 3 subagents (sa_/sb_/sc_ files) ~45 min.
Gotchas: "→" in Manim Inter Text renders as a box; updaters on camera.frame need the frame added to the scene.
EP2 idea script "Why NOTHING Can Go Faster Than Light" is in VIDEO-TOOL/physics-ep1-lightspeed/.

**Why:** user wants their own recognisable look and finished files. **How to apply:** copy maxwell/ for the next physics film; ask music only if they don't say. Tools in [[video-toolchain]]; similar build [[schrodinger-project]].

**2026-11-15 style v2:** user sent a third reference (Gravitation 3D, Class 11) and called the v1 gold/cyan/coral glow "AI slop colour". New rules are in channels/physics.md "STYLE v2": real 3D objects with real materials (Three.js engine VIDEO-TOOL/maxwell3d/assets/js/lab3d.js), calm slate palette, chevron arrows, step-by-step boxed formulas with symbol legend; keep photo/portrait cards. User loved the 3D but rejected the classroom text (tags, panels, popups): channel is DOCUMENTARY style, see "STYLE v2.1" (serif line, small caps captions, pinned labels, no boxes). Test: done/maxwell-3d-style-test.mp4.

**Film 2 (2026-11-15): "Nobody Explained String Theory Like THIS!"** from VO "In 1968, a young Ita.mp3" (13:50), first full film in STYLE v2.1 documentary 3D. Output done/string-theory.mp4 + done/string-theory-credits-for-youtube-description.txt. No music (voice + few SFX), -14 LUFS.
Pipeline VIDEO-TOOL/strings: shots.py (3d/p/q/card + overlay items line/cap/eq/big/title, KINDS briefs), assets/js core3d.js (L3 toolkit: stages studio/void/space, materials, liveTube, build-ready counter) + boot3d.js (pins pool) + k_micro/k_cosmos/k_dims/k_ideas.js (27 kinds written by 4 parallel subagents, ~30 min), tools/try.py (test one kind -> sheet), tools/build.py (4 parts), tools/render_parts.sh (~6.5 min per 3.5-min part), tools/mix.py.
Gotchas: Commons has no free photos of John Schwarz, Joël Scherk, Michael Green -> name-only cards; Commons upload server 429s, fetch slowly. Whisper medium misheard "hasn't" as "made" (793s): re-check key negations with large-v3.

**Film 3 (2026-11-16): "How Did Humans Discover Black Holes?"** VO "[calm] No one discov.mp3" (24:39). User asked for MORE REALISTIC visuals (someone at a telescope etc.), same documentary quality, animation only where needed. Built in VIDEO-TOOL/blackholes (copy of strings pipeline): shots.py (+ "v" stock video shots via CLIPS map and tools/cut_clips.py, "f" framed archival images), kinds.py (briefs), k_gravity/k_collapse/k_cygnus/k_waves.js (19 kinds, 4 subagents ~1 h), tools/shotsheet.py (start/mid/end of every shot per part), 7 parts. Mix: voice + few SFX, no music, -14 LUFS. Real media: Pexels video (telescope silhouette, church, WWI trench, waterfall, sun), Commons (EHT M87*/Sgr A* CC BY 4.0, 1919 eclipse plate, Uhuru, Aerobee 1965, 1904 hammer throw, SS Rajputana, LIGO, ALMA, SPT, 17 portraits). No portrait of John Michell exists -> name-only card.
Gotchas: C: drive nearly full (≈3-4 GB free) -> render with --workers 1, no joined picture.mp4 (mix reads renders/list.txt), FLAC temp audio; try.py does NOT surface WebGL shader/JS errors (run node --check); text cards need a line from the first second (no black lead-in).

**Film 3b (2026-11-17):** user asked to re-render Black Holes "more good voice and animation", chose sound sample A (sparse SFX, no music) -> done/black-holes-v2.mp4. Prefers sparse sound over dense sound design.

**Film 4 (2026-11-20): "Where Does Electricity Go When You Flip the Switch Off?"** VO "[calm] It's late at .mp3" (13:01). User: "so good, engaging, high quality, no slop". Built in VIDEO-TOOL/electricity (copy of blackholes): kinds.py briefs with a THESIS (electrons only jiggle, energy flows through fields E×B, enters bulb from the side), k_wire/k_energy/k_grid.js (11 kinds, 3 subagents ~1.3 h), India 2012 blackout = NASA VIIRS map with region masks fitted to city lights. Output done/electricity.mp4 + done/electricity-credits-for-youtube-description.txt. Early look of part 1 sent first (done/electricity-part1-preview.mp4).
Review lessons: freezedetect flagged name-only portrait cards (7 s still) -> build.py now pushes cards/name-only cards and shots trimmed to ~3.5 s; check big overlays at full size (3D brackets/meters collided with centre text); never put stock that contradicts the words (lit metro over "Metro shut down"); don't reuse one clip twice; cut_clips.py cache is now source-aware (.src tag) — before, swapping a CLIPS source silently kept the old cut. Wikimedia 429-blocked this IP for hours (Thomson, Heaviside portraits missing) — retry loops prolong it; make one attempt later.

**Film 5 (2026-11-22): "Nobody Explained E = mc² Like THIS!"** VO "[calm] Make yourself-enhanced-v2.mp3" (10:43). Built in VIDEO-TOOL/emc2 (copy of electricity): 82 shots, 70% 3D by 4 parallel helpers (k_chai / k_atom / k_history / k_rate.js, ~1.5-2 h each). NEW: assets/js/k_0shared.js (name sorts first, loads before other kinds) = window.X3 shared brass balance / nucleus / paperclip / LCD so every helper uses one look — do this whenever a prop recurs across helpers. Output done/emc2.mp4 + done/emc2-credits-for-youtube-description.txt; early look done/emc2-part1-preview.mp4.
User chose "Skip the photos" (Wikimedia still 429 for this IP after 2 days; using the user's email in the UA was blocked by the privacy plugin — only via an env var the user sets themselves): history shots became captioned stock (Bern, River Cam, Berlin Cathedral, B/W lab, A-Bomb Dome today). Captions name people/places only, never claim the clip shows them. tools/credits.py now handles films without Commons images. Weakest 3D: the snowy log bark (still clay-like).
