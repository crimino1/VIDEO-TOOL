# Alien Anatoly editing style

Mark every fact: `[measured]`, `[seen 3:20]`, `[user]` or `[unknown: what would settle it]`.

## Summary
New fitness/body-building explainer channel "Alien Anatoly" `[user]`. One recurring mascot (a faceless, muscular, cel-shaded **green** figure in black shorts) acts out every idea inside photoreal AI-made places (office, night street, bedroom mirror, gym), cut against plain whiteboard icon cards. One slow shot of about 6 seconds per narration sentence. Every shot fades through black, and there are no captions. The style is calm, confident and "straight to the point".

## References
| Video | Link or file | What the user likes in it | Length |
|---|---|---|---|
| How to Build a Body That Scares People (Straight to the Point) | `alien-anatoly/ref/reference_src.mp4` (from Downloads) | "everything": the white character does all the acting, plus the animation and story style `[user]` | 14:40 |

Measurements: `style-refs/alien-anatoly/body-scares/` (report.md, overview-1..3.jpg, hook.jpg); close-ups in `alien-anatoly/ref/closeup-*.jpg`, `cu-*.jpg`; dip list in `alien-anatoly/ref/blacks.txt`.

## The character `[user]`
- Source image: `alien-anatoly/character_green.webp`. Saturated green (about #22C32E) skin, cel shading with darker green muscle shadows, thin black outline, black athletic shorts with a drawstring, barefoot, bodybuilder build, head an egg shape.
- **Fully faceless: no eyes.** The reference figure has two dark eye sockets; ours has none. Never add eyes, a mouth or a nose.
- The same build, shorts and colour in every shot. Clothing changes only when the story needs it (the reference puts him in a dress shirt once to show shoulder width `[seen ~5:10]`).
- He is the only drawn thing in a shot. People, rooms and props around him are photoreal.

## Pacing
- 139 shots in 14:40: average **6.3 s**, median **6.4 s** `[measured: blackdetect dips]`. The scene-cut script found 0 cuts because every change is a fade, so count dips instead.
- Cuts per minute: first 30 s **8**, 30 s–2 m **10**, 2–5 m **10.7**, after 5 m **9** `[measured]`. The pace is even with no rush; the hook is not faster than the body.
- Shortest real shot about 1.4 s (rare); most fall between 3 and 12 s; longest 13.9 s `[measured]`. Long shots are explainer cards or a "listen to this" moment.
- One shot = one sentence or idea, and the shot changes on the sentence end: 128 of 138 cuts land within 1 s of one `[measured]`. At about 210 wpm a 6 s shot covers 1–2 sentences.
- No hard cuts at all: scene detection at threshold 0.25 found none `[measured]`.

## Hook (first 30 seconds) `[seen hook.jpg]`
- 0:00–0:06: the figure walks straight toward camera down an office corridor while office workers walk past and glance. This is the "people notice you" promise.
- 0:06–0:14: a night city sidewalk, the figure walking side-on with head down while steam drifts from a vent. A moody contrast shot.
- 0:14–0:21: an empty room with a big mirror; the figure seen from behind with his reflection facing camera (self-assessment).
- 0:21–0:26: a solid black silhouette of the body in a grey room (the "target body" idea).
- 0:26–0:31: the first whiteboard card, a line-drawn torso with orange arrows showing a V-taper.
- 0:31–0:40: a bedroom mirror with a red vertical bar on his back (a measurement overlay).
- There is no title card or logo sting; the topic is carried by visuals plus voice from frame 1 (after a 0.4 s fade from black).

## Video structure
Narration `[measured: words.json, faster-whisper small]`: 3,083 words in 14:40, so **about 210 wpm (fast, dense)**, 237 sentences. 128 of 138 cuts land within 1 s of a sentence end, so **cut on sentence ends**. Pauses are short, with 119 over 0.6 s and the longest 1.1 s.

Script shape `[measured: transcript]`. This is the structure to copy; the wording is theirs:
1. 0:00–1:00 **Status hook**: "there's a type of man the room adjusts to … and then there's you", followed by a do-it-now test that pulls the viewer in.
2. 1:00–2:30 **Promise and retention loops**: "sounds like an easy promise, stay", "at the end I'll hand you two things", plus a mechanism-versus-copying line.
3. 2:30–4:00 **Reframe**: the problem is not X but Y (contrast, not size).
4. 4:00–5:30 **Why your effort failed**: the mistake (partial range, wrong priorities), and "it's not your genetics / not that you started late".
5. 5:30–10:00 **Four pillars**, each with a concrete prescription (sets, rest, numbers) and one form detail.
6. 10:00–11:00 **Recap**, the reasoning in one sentence.
7. ~11:00 **Own-product mention** (they plug their "protocol"). Use our own CTA or product here, or skip it.
8. 12:00–13:00 **Myth bust** plus the one metric that matters.
9. 13:00–14:00 **Minimum version** for a bad week (3 × 20-min sessions).
10. 14:00–14:40 **CTA**: subscribe for the next one (teased), send it to a friend (a joke), and a punchy closing line.

What the frames show `[seen overviews]`:
1. Hook: the promise and the problem (office, street, mirror).
2. Framework: a whiteboard with 4 numbered pillars (barbell, hourglass, ruler, trend chart) `[seen ~1:30]`, then a target card.
3. Numbered pillars/"beats" in turn, each with: the figure demonstrating (gym, bench, lateral raise, plank), right/wrong marks (red X), and a whiteboard metaphor (spring, zig-zag, graph). A small grey circle badge with the beat number sits bottom-right on demo shots `[seen ~5:50 "4"]`, and a small "BEAT 5" text appears top-right once `[seen ~5:30]`.
4. Lifestyle/consistency: food plates, notebook logging, sleep, a clock.
5. Recap: whiteboard with icons around a big number "4", then a calendar + "8" + ruler.
6. Ending: the figure reads a notebook with a trophy in a gym with a gold rim light, the figure standing in a calm studio, an arrow sliding off right, a phone "share" icon card, then the figure in a dusk city square as the last shot, which fades out `[seen 14:10–14:40]`.

## Visual sources
Rough share `[seen]`: **about 60% character shots** (AI still of the figure composited in a photoreal AI background, then animated), **about 30% whiteboard icon cards**, **about 10% object stills** (bathroom scale with tape, dumbbells and watch on a bench, meal plates, office chair with a phone, log sheet with a clock).
- For us: character shots via `media-use generate --type image --reference character_green.webp` then `--type video --first-frame`. Whiteboards are built in HyperFrames as SVG on a whiteboard photo (free). Object stills come from Pexels photos with a slow push (free).

## Shots and camera
- Mostly a **locked wide or medium-wide shot with a slow push-in** (about 3–6% over the shot) `[seen closeup-street, cu-board-a]`. No fast moves, whip pans or handheld.
- Character shots are lightly animated: walking, breathing, steam drifting, head turns, one rep of an exercise. Some are near-still with only the push `[seen closeup-mid: mirror shot]`.
- Common framings: full body centred (he stands in the middle third), full body back view toward a mirror, side view for exercises (plank, bench press), waist-up close for anatomy marks.
- Whiteboard cards are framed straight-on, filling the frame; the board's aluminium edge and marker tray are sometimes visible.
- Never shown: real people's faces in close-up, logos or brand names, gore, before/after photos of real people.

## Transitions
- **Only one: a dip to black on every shot change.** Linear fade-out of about 0.7 s (16–17 frames at 24 fps) to near black, then a linear fade-in of 0.7–1.0 s, with no hold on black `[measured: luma ramps at 1:44, 3:30, 3:47]`.
- 0.4 s fade from black at the very start; the last shot fades to black.

## Colour and texture
- Natural, slightly warm photoreal backgrounds; office and bedroom warm, night street teal/blue with orange lights, gyms neutral grey `[seen]`.
- The character is the brightest, cleanest thing in frame: flat cel colour, black outline, no film grain on him.
- Backgrounds are often slightly soft (shallow depth of field) so the figure pops.
- No letterbox, vignette, grain or LUT. The source is 1280x714 with a thin dark border from the download: **don't copy the border**; build at 1920x1080.
- Occasional mood light: a gold rim glow on the "winner" shot at the end `[seen 14:15]`.

## Text on screen
- **No captions or subtitles** `[seen: none in any sheet]`.
- Text is rare and always part of the image or card:
  - Whiteboard headline sentence in black hand-lettered caps, centred top (for example a "… responds to three measurable things." card) `[seen ~7:00]`.
  - Big numbers in bold black sans or gold (1–4 pillars, "4", "8", "10 → 20", "+1", "20" in clocks).
  - A beat-number badge: a small grey circle with a white number, bottom-right, about 40 px at 1080p `[seen ~5:50]`.
- When we add text, use a bold rounded sans (Arial Rounded / Nunito Black) in black on the whiteboard; no animated kinetic type.

## Graphics
- **Whiteboard icon cards**: a white board photo background (light smudges, marker tray), thick black-outline flat icons (stroke about 8–10 px at 1080p), accent fills in **orange (#E8732A), red (#D9201C), green (#3DB54A)**, and grey. Typical cards: a torso outline with arrows, a target with an arrow, numbered panels, a bar chart, a rising arrow, converging arrows, a brain-muscle-mind triangle, clocks, a spring with a notebook. The cards are static, with only the slow push-in `[seen cu-board-a, cu-board-b]`.
- **On-body marks** baked into the character shot: red bar, orange double-arrow across the shoulders, dots on muscles, a red X over the wrong move, a red X in a circle top-right for "don't". **On our green figure, never use green marks** (they vanish into the skin): use **orange, red or white with a black outline** `[derived from the user's green figure]`.
- Arrows that **slide** in or out of frame (orange block arrow) are the only moving graphic `[seen 14:20]`.
- No logo or watermark is visible.

## Sound
- Loudness of the reference: **-18.3 LUFS**, range 4.3 LU `[measured]`. Our channel target is -14 LUFS (the channel default) `[unknown: user to confirm, -18 if they want the reference's quiet feel]`.
- Voice: `[unknown: user to describe, or vidIQ watch (25 credits)]`. The transcript shows one narrator speaking in second person ("you") at about 210 wpm, in a confident, slightly provocative coaching tone `[measured: transcript]`. Gender and timbre are `[unknown]`. **The ai33 voice key is for the health channel only**; this channel needs its own voice source.
- Music: `[unknown]`. Sound effects: `[unknown]`. Silence: `[unknown]`.
- **Tools (2026-11-23):** effects can come from `sfx-library/openverse` or earshot and be placed with real-sfx. Music and effects are still `[unknown]`: ask before choosing either.

## Do and don't
Do:
- Keep the green figure identical in every shot (same green, outline, shorts, faceless).
- One idea per shot at about 6 s, with a dip to black between every shot.
- Alternate character shot → whiteboard → character shot so the eye rests.
- Put the figure centre-frame and full body unless the point is anatomical.

Don't:
- Add eyes or a face, swap the shorts colour, or change the skin green.
- Use hard cuts, zooms, glitches, whooshes or kinetic captions.
- Draw green marks on the green body.
- Copy the reference's exact scenes, cards or script order. Make new places and metaphors per topic (see "Similarity" below).

## Similarity warning
The reference channel's mascot is a white faceless muscle figure in black shorts. Ours is the **same design recoloured green**, so viewers may link the two channels. To keep a distinct identity, the fully faceless head (no eye holes) helps; consider also a small signature (an antenna? a channel colour in the shorts' drawstring?) `[unknown: user decision]`. Never reuse their footage, cards, narration or music.

## Build notes
- Folder: `alien-anatoly/` (ref/, character_green.webp). Render 1920x1080, 24 fps (matches the reference; 30 is fine too).
- **Default: code only, $0** `[user 2026-11-18: "can you do with code"]`:
  - `blender/aa_build.py` turns `chair-workout/blender/um_auto.blend` (the rigged muscle man) into `aa_figure.blend`: a faceless egg head (head verts projected onto an ellipsoid and relaxed), green toon emission (Diffuse → Shader to RGB → EASE ramp × green), clean black shorts (hem z 0.70, waist 0.985, pushed out 6 mm).
  - `blender/aa_poses.py`: still poses (`POSES`) and looping animations (`ANIMS`, fn(b, t)) built on `chair_ex` helpers and `rigkit.Body`. Add new actions here.
  - `blender/aa_render.py -- <out_dir> <names> [w h]` renders transparent PNGs with EEVEE, one sun with **shadows off** (16 samples, about 0.4 s a frame at 1080x1350).
  - The outline is 2D: alpha dilate 5 px in `aa_ink.py` or `ink()` in `test/make_test2.py`. Don't use an inverted hull (specks poke through the sculpt) or Freestyle (noisy silhouettes on the dense mesh).
  - Compositing: `test/make_test2.py` puts the figure on a Pexels photo background (blurred 2–3 px) with a ground shadow, a 4.5% push and 0.7 s dips to black, and pipes the frames to FFmpeg.
  - Known gaps: the background has no photoreal people interacting; fists are lumpy in close-up; the look is 3D-toon, not a hand drawing.
- Optional paid route (HeyGen through `npx hyperframes media-use generate`, ask before spending):
  - still: `--type image --reference alien-anatoly/character_green.webp --prompt "<scene>"`, $0.067 list (quoted $0.09) each
  - motion: `--type video --first-frame <still> --prompt "slow push in, <action>" --seconds 6`, $0.02/s at 768p (about $0.12 a shot; 1080p about twice). `--reference` mode costs $0.05/s, so avoid it.
  - Estimate for a 10-minute video (about 95 shots, about 60 with the character): about $13 at 768p, about $20 at 1080p.
- Whiteboards: HyperFrames composition, SVG icons on one reused whiteboard photo, CSS scale 1.00→1.05 over the shot.
- Assembly: HyperFrames or FFmpeg; each shot gets a black fade-in of 0.7 s and fade-out of 0.7 s.

## Rules from feedback
- 2026-11-18: The character is the user's green faceless muscle figure (not white); he does everything the white figure did in the reference `[user]`.
