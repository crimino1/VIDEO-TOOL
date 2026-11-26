# Outside Lay (space channel) editing style

Mark every fact: `[measured]`, `[seen 3:20]`, `[user]` or `[unknown: what would settle it]`.

## Summary
New space/astronomy explainer channel `[user]`. Long calm explainers (~16 min) that live in two worlds and swap between them: **photoreal 3D space** (planets and moons on pure black with stars, slow orbiting camera) and **flat 2D infographic** on deep navy (violet planet disks, thin orbit rings, neon yellow-green headers, tiny monospace labels) `[seen]`. Very few hard cuts: one idea is one long animated "shot" that builds, morphs and wipes into the next `[measured]`.

## References
| Video | Link or file | What the user likes in it | Length |
|---|---|---|---|
| "Jupiter isn't a planet" | `Downloads/vidssave.com Jupiter isn't a planet 720P.mp4`, analysis in `VIDEO-TOOL/style-refs/space/jupiter/` | the whole style `[user]` | 16:18 |

## Pacing
- Shot detector: 19 shots, average 51.5s, median 30.2s `[measured]`. Cuts per minute: first 30s 10.0, 30s-2m 0.7, 2m-5m 0.3, after 5m 1.0 `[measured]`. The detector misses morphs and dissolves; real **visual beats** (a new label, a moon flying in, a number counting, a zoom) land every **4-8s** `[seen]`, tied to the narration phrase.
- Fast burst only in the hook (movie-clip montage around 0:21-0:28) `[measured]`.
- Longest held "shots" are 2D diagrams that keep adding elements for 1-3 min `[measured 217s]`.
- Beats land on narration phrases, not music `[seen]`.

## Hook (first 30 seconds)
- 0:00-0:01 black. 0:01 tiny monospace yellow tag fades in centre (the reference's own credit line, don't copy the words) `[seen]`.
- 0:02-0:08 dark planet silhouette, bright corona/rim light grows behind it, moons drift `[seen]`.
- 0:06-0:09 planet lights up orange → white-hot like it is igniting into a star, flashes to full white frame `[seen]` — the "what if" promise of the title, shown not said.
- 0:10-0:30 sci-fi movie montage with the film title in yellow monospace lower-left `[seen]`. **Our version: replace with our own 3D/2D shots or properly licensed/public-domain NASA footage** (see Copying).
- ~0:35 cold open ends on a big 3D Jupiter limb with the Sun and moons above `[seen]`.

## Video structure
Topic split into chapters, each opened by a **neon header** top-left on navy (e.g. "JUPITER SYSTEM", "MOON & TIDES", "GALILEAN MOONS", "THE HILL SPHERE", "THE OUTER MOONS") `[seen 3:00-15:00]`. Inside a chapter: 2D diagram explains the idea → 3D photoreal shot shows the real object → back to 2D for the next number. Progress beats like "8 COVERED / 107 REMAINING" over 3D `[seen ~13:30]`. Ends zooming out to the whole solar system in 3D with a big-picture twist ("the Jupiter system mirrors our solar system") `[seen 15:50+, transcript]`. CTA: no "subscribe" ask; last line hands off to the next video ("...and it's waiting for you on screen right now") over an end screen `[transcript 16:02]`.

Script shape `[transcript]`: open on a "What if...?" question (0:02) → pop-culture tie-in → "in reality..." reveal (0:30) → a surprising count ("115 in total") → relatable comparison (Earth's moon, "978 Earths") → chapters → twist → hand-off.

## Visual sources
- ~55% 3D renders: textured planets/moons (NASA/USGS maps), spacecraft models (Juno/Europa Clipper style), surface flyovers, cutaway interiors `[seen]`. **Build: Blender (EEVEE, 2 GB iGPU) or Three.js in HyperFrames** with NASA public-domain texture maps.
- ~35% 2D motion graphics (code: HyperFrames/HTML canvas or SVG) `[seen]`.
- ~5% real mission imagery (Juno JunoCam Jupiter close-up, Galileo moon photos) inside circular insets `[seen 5:50]`. NASA = public domain.
- ~5% movie clips (2001, 2010) in hook `[seen]` — skip for us.

## Shots and camera
- 3D: planet centred or a huge limb filling one side; slow orbit/dolly, slow push-in (about 5-10% scale over 8s); planet rotates slowly. Lighting hard from one side, crisp terminator, deep black space, fine star field `[seen]`.
- Scale comparisons: Earth tiny next to planet; planet made of 978 tiny Earths `[seen 1:40]`.
- Cutaway: quarter wedge removed, layers labelled `[seen 2:00]`.
- 2D: object dead centre, orbit rings concentric, camera rarely moves; elements scale/pop in `[seen]`.
- Circular "lens" insets: white-stroked circle (~6px) holding a photo or 3D close-up, slides in over the 2D diagram; yellow dashed circle marks a crater `[seen 5:20-5:50]`.

## Transitions
- Default: soft dissolve (~0.5-1s) between 3D and 2D worlds `[seen]`.
- Soft-edged vertical wipe: a dark feathered column slides across, revealing a close-up texture (e.g. Great Red Spot) `[seen 2:05]`.
- Morph inside 2D: a dot grows into a planet, colour shifts white → peach → orange to show mass rising `[seen 2:20]`.
- White flash (planet ignites) once, in hook `[seen 0:09]`.
- Hard cuts only in the hook montage `[measured]`.

## Colour and texture
- 2D background navy **#000E26** flat, with faint sparse star dust `[measured]`.
- 3D background pure black **#000000**, fine white stars `[seen]`.
- Accent palette `[measured]`: violet **#6F1CEE** (Jupiter disk), neon yellow-green **#DEEF45** (headers, highlights, dashed marks), hot pink/red **#FF2D55** (highlighted moon), orange **#F7941D** (Sun), light grey **#E6E6E6** (other moons, Earth), thin rings in desaturated **#5C6472**.
- Clean, no grain, no vignette, no letterbox `[seen]`.

## Text on screen (at 1920x1080)
- **Chapter header**: heavy condensed sans, ALL CAPS, tight tracking, #DEEF45, ~56px, top-left at (40,40) or centred top. Use **Anton** (Google Fonts) `[seen; font name unknown, Anton is the closest free match]`. Fades/slides in ~0.3s, stays the whole chapter.
- **Big number callout**: number in the same font ~56px + small caps unit text ~22px next to it, #DEEF45, lower third left of centre: "978 EARTHS FIT INSIDE JUPITER", "318 TIMES THE WEIGHT OF EARTH". Number counts up (36 → 128 → 318) `[seen 1:40-2:10]`.
- **Statement line**: same font ~64px bottom centre, "ONCE EVERY 7 HOURS" `[seen 4:45]`.
- **Object labels**: monospace (use **Space Mono** or IBM Plex Mono), ALL CAPS, 14-18px, #DEEF45 or white, next to the dot; on 3D shots in a small white box with dark text ("CORE", "METALLIC HYDROGEN", "HILL SPHERE"); violet box variant for a second category `[seen]`.
- **Planet name inside disk**: monospace white, centred in the violet disk `[seen]`.
- Bar charts: thin horizontal bars violet + yellow, tiny mono labels, white dots per row `[seen 11:00]`.
- No captions/subtitles burned in `[seen]`.

## Graphics
Orbit diagrams (thin 1-2px rings, moons as solid dots moving along), cutaways, magnetic field lines (thin yellow loops), bar charts, tide graph, ratio "4:2:1" with the last digit in pink, irregular orbit spaghetti in violet `[seen]`. Everything flat, no gradients except the corona glow.

## Sound
- Loudness: reference -18.9 LUFS, range 3.2 LU `[measured]`. **Our target -14 LUFS** (channel rule from other channels) `[unknown: confirm with user]`.
- Voice: single narrator, conversational "you" ("you probably know one or two of them"), ~173 words/min, almost no pauses (5 gaps over 1s in 16 min) `[measured from transcript]`. Voice character `[unknown: user supplies the voiceover]`.
- Transcript of the reference: `VIDEO-TOOL/style-refs/space/jupiter.transcript.txt`.
- Music: `[unknown: user to describe]` — probably soft ambient synth under voice.
- SFX: `[unknown]`.

## Do and don't
- Do: switch worlds (3D black ↔ 2D navy) every 30-90s; give every number its own callout; keep labels tiny and mono; one accent colour per meaning (violet = Jupiter/main, yellow = text/highlight, pink = the thing we're talking about now).
- Do: keep shots long and alive — something moves or appears every 4-8s.
- Don't: hard-cut between unrelated shots after the hook; don't use gradients/glows on 2D; don't add captions; don't use movie clips; don't copy the "ANIMATIONS MADE BY ACTUAL HUMANS" corner tag or the exact header wording.

## Build notes
- **EP1 pipeline to copy: `VIDEO-TOOL/space/ep1`** (Saturn rings, 15:24). `assets/js/space.js` Three.js engine (Saturn with ring shadows, edge-on crossings, Earths-in-Saturn, ring flythrough, field-line ring rain, Cassini orbits, moon breakup into a ring, micrometeoroid impact); `scenes2d.py` navy infographics; `build.py` shot list timed to words; `tools/mix.py`; `tools/credits.py`.
- Mix in EP1: ~55% 3D, ~30% navy 2D, ~15% NASA/Commons stills and Pexels clips `[user: "use little bit stocks & images"]`. Low-res NASA images go in white-bordered cards on navy, not full-frame. Label artist's concepts as such.
- 2D + compositing: HyperFrames (HTML/SVG/canvas, 1920x1080, 30fps). 3D planets: Three.js sphere with NASA texture maps inside HyperFrames, or Blender EEVEE for spacecraft/cutaways.
- Voice + transcript from user → `transcribe.py` word timings → beats clocked to phrases.
- Reference analysis: `VIDEO-TOOL/style-refs/space/jupiter/`.

## Rules from feedback
- 2026-11-11: channel name is "Outside Lay"; user supplies voiceover, Claude transcribes `[user]`
- 2026-11-20: "no AI slop colour or animation" `[user]` -> from EP2 the neon #DEEF45/violet/hot pink are replaced by a calm palette: sand #e4cd92 headers/numbers, ink #eeebe4 type, slate navy #0a111d, slate blue #5d7398; no bouncy/overshoot pops, no glows on 2D, particles capped small, text never overlaps objects. Keep the structure (3D on black + navy 2D, Anton headers, mono labels). Real NASA/ESA imagery wherever it exists; label artist's concepts.
