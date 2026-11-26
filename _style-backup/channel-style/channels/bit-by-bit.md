# Bit by Bit editing style

Mark every fact: `[measured]`, `[seen 3:20]`, `[user]` or `[unknown: what would settle it]`.

## Summary
Bit by Bit is a computer-science explainer channel (new, 2026-11) [user]. Each video takes one "insane" real-world CS system (spacecraft software, rover autonomy, error correction, AI) and explains it step by step for curious non-experts. The look is a pitch-black starfield world where three layers mix: glowing retro pixel-art / CRT animations that *show the mechanism*, real NASA-style photos and renders that *prove it's real*, and a hand-drawn stick-figure mascot that *reacts and points*. Bold white Arial-Black-style words pop in on the narration's key nouns.

## References
| Video | Link or file | What the user likes in it | Length |
|---|---|---|---|
| Insane Computer Science Concepts | `Downloads/vidssave.com Insane Computer Science Concepts 720P.mp4` (analysis: `VIDEO-TOOL/style-refs/bitbybit/insane-cs/`) | "all the style" — the whole look [user] | 12:52 |

## Pacing
- Shots [measured]: 124 cuts, average 6.2 s, median 3.6 s. Long average because many "shots" are one continuous animated scene with internal motion.
- Cuts per minute [measured]: first 30 s **18**, 30 s–2 m **11.3**, 2–5 m **8.7**, after 5 m **9.0**.
- Shortest 0.04–0.2 s: flash cuts / glitch frames inside zoom transitions [measured 156–158 s]. Longest 81 s at 5:26 [measured]: one continuous pixel-art data-viz scene (height map → path fan → chosen path) where the "cut" is the animation evolving; also 30–34 s scenes at 2:39, 3:13, 3:46.
- Rule: something on screen changes every **2–4 s** even inside a long scene (new label, path draws, mascot pose swap, number counts). A static frame never holds >4 s [seen throughout].
- Cuts land on narration phrases — each new noun/idea gets its visual on the word [seen 0:00–0:10 word-by-word titles]. No beat cutting.

## Hook (first 30 seconds)
[seen hook.jpg, closeup-titles]
- 0:00–0:01 black starfield, white bold words type on **one word at a time**, upper-left: "Computer" → "Computer Science and…".
- 0:01–0:08 galaxy photo fills frame; a **framed archival photo** (Margaret Hamilton with the code stack) fades in centred over it, slow push-in.
- 0:08 cut to Moon-landing photo (framed, not full-screen) → big white words "pretty" → "pretty hard" pop in centre over the darkened photo.
- 0:09–0:13 sci-fi spacecraft console with "Space Computer" title, top centre; title fades out.
- 0:13–0:18 3D Mars rover render, Mars approach shot.
- 0:18–0:24 **Mascot introduced**: stick figure throws arms up, then points at a framed clip ("Space Robot?").
- 0:24–0:26 **Section title**: yellow "Problem 1: / Space hardware & software" scales down from huge to normal while the previous scene dims and fades to plain starfield.
- 0:26–0:40 **Powers-of-ten pixel zoom**: pixel Earth → pixel laptop with neon code → phone → circuit board → chip → transistor grid → one transistor (continuous zoom with glitch flashes).
- Promise: the video lists N problems / concepts, each a numbered "Problem k" section; the title tells you it's "insane" and the hook shows the stakes (Moon landing, Mars) before any explanation.

## Video structure
1. Cold open, 25 s: stakes + famous real images + mascot + the list promise.
2. Numbered sections, each ~2–4 min. Reference timeline [measured transcript]: 0:17 Problem 1 hardware & software (radiation bit-flips, NASA "Power of 10" rules) → 2:03 Problem 2 communication (binary over Deep Space Network, noise, error-correcting codes) → 4:50 autonomy (AutoNav vision + path planning) → 6:47 finding science targets (AEGIS/Rockster edge detection) → 8:38 generative-AI route planning (2025–26) → 9:56 AI finding planets (transit method, neural nets) → 11:37 "you can contribute" outro → 12:00 sponsor → 12:49 subscribe. Each section:
   - yellow section card (2–3 s)
   - **real-world anchor**: photo/render of the real machine (rover, Voyager, telescope) with a big white label word ("Perseverance", "AutoNav", "Transit Method")
   - **mechanism in pixel art**: CRT-styled diagrams that build up step by step (binary, signals, maps, paths)
   - mascot interjections every 20–40 s (point / shrug / head-scratch) with a 2–4 word sub-heading ("Space 101: Make everything foolproof")
   - **receipts**: real source screenshots — GitHub repo, paper flowchart, NASA rule list — shown framed on starfield.
3. Wrap-up: wide cosmic photo (nebula), number reveal ("1,500,000" counter).
4. Sponsor read at the end (in reference: Brilliant, with QR card) — only if the user has a sponsor; otherwise end card / subscribe.
Hand-over between sections = the yellow section title zoom.

## Visual sources
Rough share [seen overviews]:
- **~45 % custom pixel-art / CRT animations** (built in code: HyperFrames/canvas). Chunky pixels, scanline + RGB-mask texture. Reference uses neon on near-black; since EP4 the channel uses the calm documentary palette (see Rules from feedback 2026-11-16).
- **~25 % real photos & renders**: NASA/JPL/ESA public-domain imagery (Mars rovers, Moon, Voyager, JWST/Hubble galaxies & nebulae, planets), archival B&W photos of people. Sources: NASA Image Library (images.nasa.gov), JPL photojournal, ESA/Webb, Wikimedia Commons (PD).
- **~15 % mascot shots** (stick figure + helmet) over starfield or beside a framed clip.
- **~10 % documents/screens**: GitHub pages, paper diagrams, code, UI.
- **~5 % stock/film clips**: sci-fi console, starfield warp, robot render.
- Pinterest search terms that fit: "pixel art planet gif", "retro crt computer screen", "nasa mars rover render", "james webb nebula", "8 bit circuit board", "vaporwave grid space".
- Never: on-camera presenter, AI-looking photoreal people, generic stock offices.

## Shots and camera
- **Framed inset**: most real photos are NOT full-screen — placed as a rectangle ~45–55 % of frame width, centred or right of centre, over the starfield or a blurred galaxy [seen 0:03, 0:08, 0:18]. Plain edge, no border/shadow.
- Full-screen for renders and pixel scenes.
- Slow push-in on stills (~3–5 % scale over the shot) [seen 0:02–0:07].
- **Powers-of-ten zoom**: signature move — continuous scale-up from macro to micro (Earth → device → chip → transistor) with brief glitch flashes at each level [seen 0:26–0:40].
- Pixel diagrams draw on progressively: lines trace, cells fill, numbers type.
- Mascot always stands in a lower corner, cropped at the knees/feet by the frame bottom, ~60 % frame height; body faces the content it points at.

## Transitions
- Default: **hard cut** [measured 124 cuts].
- **Section title zoom**: previous shot dims to ~40 % and fades over ~0.8 s while yellow title scales from ~250 % to 100 % (ease-out, ~0.6 s), holds 2 s, fades [seen 0:24–0:26, frame-title.png].
- **Text fade-out**: titles fade over ~0.5 s before the cut [seen 0:11–0:13 "Space Computer"].
- **Glitch flash**: 1–5 frames of digital noise between zoom levels [measured 156.0–158.1 s cut burst].
- **Cross-dissolve** ~0.5 s between real photos in the cold open [seen 0:02].
Frequency: hard cuts ~85 %, section zooms once per section, glitch only inside zooms.

## Colour and texture
- Base: near-black **#05060A** with a faint moving starfield (tiny white streaks drifting diagonally, like slow warp) — on almost every non-photo frame [seen everywhere].
- Pixel palette: EP1-EP3 used neon (cyan #5FE3E8, green #3DF56B, yellow #F7C948, pink #F25CA8, purple #8A5CF6). **Since EP4: `PX.D` calm documentary palette in px.js** (dark neutrals #090b0f-#7f8894, cream #ece4d2, lamp #f2cf8e, accents amber #e0b23a, moss #8fae6a, teal #4f8a8b, rust #c0583e, rose #c98a86, steel #5f7c9c), bloom 0.2. Bit's cyan head stays (brand). Viridis-style heat maps (purple→teal→yellow) for data.
- CRT texture on pixel scenes: visible RGB sub-pixel/scanline pattern, slight bloom, mild vignette, rounded-corner cyan frames (2–3 px glow line) around "monitor" panels.
- Real photos kept natural, slightly darkened when text sits on them.
- Synthwave purple perspective grid floor for ground scenes [seen 2:45 dish].
- No letterbox, no film grain on photos.

## Text on screen
- **Key-word callouts** (main text type): white, Arial Black / "Archivo Black"-style heavy sans, ~64–80 px at 1080p for words, up to ~140 px for one-word heroes ("Transit Method", "planet"). Soft dark drop shadow. Appears **word by word in sync with the voice** (no animation — hard on), centre or upper-left. 1–4 words. Holds while spoken + ~1 s [seen 0:00, 0:08, 10:00].
- **Section titles**: yellow **#F5C842**, same heavy sans, ~60 px, two lines centred ("Problem 1:" / "Space hardware & software"). Zoom-in as described.
- **Mascot sub-heads**: white heavy sans left of mascot, heading ~64 px + 2-line body ~40 px ("Space 101:" / "Make everything foolproof") [seen 2:08].
- **Labels over photos**: white heavy sans ~90 px, semi-transparent (~70 %) centred on the subject ("Perseverance", "AutoNav", "Disparity Map") [seen 4:20–4:40].
- **CRT text inside pixel scenes**: pixel/monospace font (e.g. "Press Start 2P" for headers, "VT323"/"IBM Plex Mono" for data), yellow or cyan, small caps like "THE POWER OF 10", "WHEEL DROP RISK", "HIGH/LOW" legend [seen 1:15, 5:40].
- Numbers: big pixel-font counters in a cyan rounded box ("1,500,000") [seen 9:40].
- No subtitles/captions track.

## Graphics
- **Mascot (needs our own version — see Do and don't)**: white hand-drawn stick body (thick ~14 px rough marker line, round caps), poses swapped by cutting between drawings — arms up "ta-da", pointing right, head-scratch, shrug. Head is a cartoon astronaut helmet; the visor shows a pixel logo. Pose changes every 2–4 s while on screen.
- Pixel-art set pieces: planets, satellites, dishes, laptops, phones, chips, transistors, Mona-Lisa-noise comparisons, signals/waveforms with bit boxes under them (0 1 1 0…), binary walls in CRT green, path-planning fans, heat maps with HIGH/LOW legend, pixel hand cursor clicking.
- Data boxes: rounded cyan or coloured rectangles with digits (blue tiles "1 0 1" [seen 3:10]).
- Diagrams build step by step, never appear complete.
- Watermark/logo: none on screen [seen].

## Sound
- Loudness target: **-14 LUFS** delivery (reference measured -15.1 LUFS, LRA 3.7 [measured]) — matches the user's other channels.
- Voice (reference): one male narrator, casual-smart "friend explaining" tone, **~245 words/min** [measured: 3,173 words in 12:52] — fast and dense, so visuals must change on nearly every sentence (~1 visual idea per 4–5 s). Our VO comes from the user [user]; clock to its word timings whatever its pace.
- Script devices [measured transcript]: question hooks ("But how do you build something that can explore the unknown when it can't rely on you?"), "Well, the first problem is…", "But even if… there's still another problem", "But what if we wanted to…", everyday analogy first (your phone → transistors) then the space version, a real NASA rule/date as proof, closing "you can contribute too" message.
- Music: [unknown: can't hear it — ask user; likely light synth/lo-fi electronic bed under voice].
- SFX: [unknown] — likely blips/bleeps on pixel builds, whooshes on zooms; ask user.
- Silence: [unknown].

## Do and don't
Do:
- Starfield black background behind everything that isn't full-screen.
- Pair every concept with: real image → pixel mechanism → mascot reaction.
- Pop keywords on the exact spoken word.
- Show receipts (repos, papers, NASA docs) framed and small.
- Build diagrams incrementally; something moves every 2–4 s.
Don't:
- Copy the reference creator's mascot (helmet with that pixel logo) — it's their brand. Bit by Bit's mascot is **"Bit"**: a glowing cyan 8×8 pixel-cube head (checker face #5FE3E8/#57D6DC, light top #B4F7F9, dark side #2A9FAD, pixel eyes + smile, cyan glow) on the white rough-marker stick body [user chose pixel cube 2026-11-12]. Code: `VIDEO-TOOL/bitbybit/assets/mascot.js` → `mascotSVG(pose, {blink})`, poses idle / tada / point / scratch / shrug / think; preview `mascot-poses.png`. Swap poses by hard cut; blink ~every 2.6 s for 0.14 s.
- Reuse their footage, music or narration.
- Use glossy 3D/AI motion-graphics, gradients-on-white, or corporate stock.
- Show long blocks of real code full-screen.
- Add captions track or emojis.

## Build notes
- Tool: HyperFrames (HTML→video) for pixel/CRT scenes, text and assembly; canvas `image-rendering: pixelated` for pixel art; CSS for scanline/RGB mask overlay; starfield as a canvas layer.
- Render 1920×1080, 30 fps (reference is 1280×720 24 fps — upscale ours).
- Voice-over clocks every scene: transcribe user VO with faster-whisper word timings (`.venv`) and key text/visual hits to word times.
- Real imagery: NASA/ESA public domain, downloaded via IPv4 fix noted in toolchain memory.
- Project folder: `VIDEO-TOOL/bitbybit/ep01/` (to be created).

## EP1 build (2026-11-13) — reusable
- Project `VIDEO-TOOL/bitbybit/ep01`: pixel engine `assets/js/px.js` (480x270 low-res ×4, scanlines + RGB mask + bloom), ~60 scene kinds in `assets/js/scenes/`, `build.py` shot list on word timings, `tools/mix.py`.
- Sound: Pixabay SFX + Pixabay chiptune/lo-fi music [user asked for Pixabay SFX]. Voice -14 LUFS, music 12 dB under + ducking, SFX peaks ~9 dB under voice peaks.
- Section cards worded "Part N: <title>", last one "The verdict: Where I land".
- Only numbers the script states go on screen; unknown cells show "-".

## Rules from feedback
- 2026-11-13 (after EP1): "starting visual is not good, not very high quality". Every video needs **very high quality animation**: full illustrated environments (not icons floating on black), depth/parallax, lighting, particles, a moving camera in every scene, zoom-through transitions; a cinematic first 10 s; no frames that are only text on black. `[user]`
- 2026-11-13: stock must be **high-quality footage from the internet, not Pexels** (EP2: Mixkit 1080p/4K free license, real screen recordings of the sites named). `[user]`
- 2026-11-13: EP1 SFX were "very bad" and **louder than the voice-over**. Use soft, clean, modern SFX (no harsh 8-bit explosions/hurt sounds), few cues, set well under the voice by loudness. `[user]`
- 2026-11-13: chiptune/lo-fi music was "bad music". Use calm **informative / explainer / tech background** music, no-copyright for YouTube: Pixabay tracks WITHOUT "Content ID Registered" on the track page (check the page HTML). EP1 used Tutorial Explainer (AtlasAudio), Digital Technology (Monume), Corporate Explainer Video (alex-morgan), Think Bright (kissan4). `[user]`
- 2026-11-13 (latest, overrides the two music lines): **no background music at all** — voice + sound effects only (mix.py MUSIC=False). `[user]`
- 2026-11-13: levels "music 0.80, voice 1.10": voice clearly on top; music 18 dB under the voice in pauses, ducked ~27 dB under during speech (mix.py MUSIC_UNDER=18). `[user]`
- 2026-11-13 (EP3 request): use real material from the internet, not only stock: YouTube clips, Google/press images and **photos of the real people in the story**, plus their real posts and study pages as receipts. `[user]` EP3 did this as: real X post screenshots and chat screenshots framed over a dimmed pixel scene (`RX()` in ep03/shots_ep3.py), a quote card with a post's exact text and a yellow marker sweep (`quote()`), lower-third name tags (`tag()`), the person's public profile photo or a CC Commons photo with credit, recordings of the study pages, cropped study charts. Credit every one on screen (small `credit()` line) and in the description.

- 2026-11-16 (EP4 request): keep the pixel animation (liked) but **edit like a documentary**: chapter title cards ("LIVING COMPUTER · No. 1" + title + amber rule + italic Latin name), lower-left place/year supers, real researchers introduced with portrait + name tag, real footage and papers, a recurring end-of-chapter refrain line. And **"little good colour, no AI slop colour"**: no neon, no purple/pink synthwave, no rainbow, no glossy 3D stock renders (Pixabay DNA/neuron/bacteria renders are out), calm natural palette (`PX.D`), text cream #f1ebdd + amber #e0b23a. `[user]`

## EP3 build (2026-11-13) — reusable
- Project `VIDEO-TOOL/bitbybit/ep03` ("Why AI Is Making Programmers Worse", 8:57): engine v2 copied from ep02, 6 parallel builders → 45 kinds (replit/vibe/cost/speed/skill/habits.js), shot list in `shots_ep3.py` exec'd from build.py.
- YouTube section downloads (`--download-sections`) hang or 403 here; download the full video (video-only `bv*[height<=1080][ext=mp4]`, `--force-ipv4`) and trim locally.
- Pixabay 2026 uploads are often AI-generated: check for AI look before using people shots.
- Voice polish (2026-11-13, user asked to "enhance voice"): ep03/tools/enhance_vo.py makes public/vo_enh.wav from vo.mp3 (24 dB/oct highpass 70 Hz, -3 dB at 230 Hz, -1 dB at 500 Hz, +2 dB at 3.2 kHz, +1.5 dB shelf at 8 kHz, light aexciter above the MP3's 11 kHz cutoff, de-esser, 2:1 compressor); User heard the A/B and preferred the ORIGINAL voice, so mix.py uses vo.mp3 again; do not apply this polish by default.
