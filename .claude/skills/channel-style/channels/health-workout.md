# Health channel: anatomy workout style (follow-along)

DRAFT built 2026-11-10 from two reference videos the user chose. It replaces the 3D-woman style in `senior-fitness.md` for workout videos `[user]`. The user calls it "2D"; both references are really shaded anatomy figures (3D renders or 3D-look illustrations), so the plan is to build that look in Blender `[seen]`.

Marks: `[measured]` from the analysis script or frames, `[seen m:ss]` from frames, `[user]` said by the user, `[unknown: what would settle it]`.

## Summary
Follow-along home workouts: one faceless anatomy figure does each exercise in a loop while the muscles it works glow red, a big countdown runs, and the exercise name appears before each move `[seen]`. There is no presenter, no cutting and no stock footage; the whole video is one locked camera on the figure, broken only by short rest/get-ready breaks between exercises `[measured: 0 to 1 cuts in 16-17 min]`. For this channel it serves people over 50/65 doing safe home and chair workouts `[user, earlier videos]`.

## Decisions needed
1. **Look:** anatomy figure like the references (recommended) or a flat cartoon 2D figure? `[unknown: ask the user]`
2. **Background:** dark grey studio (ref 1) or a bright scene such as a patio (ref 2)? `[unknown: ask the user]`
3. **Timing:** 30-40 s work with ~8-10 s get-ready (ref 1), or 45 s work with ~21 s rest and a "Next" preview (ref 2)? `[unknown: ask the user]`
4. **Sound:** a little voice, generated with the user's ai33.pro key `[user 2026-11-10]`. Whether music goes under it is `[unknown: ask]`.
5. **Figure source:** the muscle-detailed body must come from a free model (CC0/CC-BY) or be built; settle it with a one-exercise test render `[unknown]`.

## References
| Video | File | What the user likes in it | Length |
|---|---|---|---|
| 15 Min Full Body Workout at Home, No Equipment | `Downloads\vidssave.com 15 Min Full Body Workout at Home — No Equipment 480P.mp4` (analysis: `VIDEO-TOOL\style-refs\workout2d\ref1-fullbody`) | `[unknown: ask]` | 17:16, 854x480, 23.98 fps |
| Chair Workout for Men Over 50, Full Body Strength at Home | `Downloads\vidssave.com Chair Workout for Men Over 50 _ Full Body Strength at Home 360P.mp4` (analysis: `...\ref2-chair`) | `[unknown: ask]` | 16:26, 640x360, 30 fps |

## Pacing
- No cuts inside an exercise: ref 1 measured 2 shots in 17 min, ref 2 one shot in 16 min `[measured]`. The figure loops the move for the whole work block.
- Ref 1 cycle: work 30 s (side bends 0:53-1:22) or 40 s (half squat 1:32-2:12), then 8-10 s break: about 5 s showing the next move's start pose with its name, then a 5-4-3-2-1 get-ready `[measured from 1 s frames]`.
- Ref 2 cycle: work 45 s (1:12-1:57), rest about 21 s: 16 s "Next" preview, then a 3-3-2-1-0 countdown `[measured]`. About 15 exercises in 16 min `[measured: 66.5 s cycle]`.
- Movement tempo: about one rep every 2 s, steady and slow `[seen 0:53-1:22]`.

## Hook (first 30 seconds)
- Ref 1 opens straight on the figure standing in the first move's start pose with the name "STANDING AIR BIKE", no title card or talking `[seen 0:00-0:10]`. Get-ready 5-1 at 0:11-0:15, first work timer "30" at 0:16 `[seen]`.
- Ref 2 opens on the empty patio background, the figure appears with a 3-2-1-0 countdown, and work starts at about 0:05 with a 45 s timer `[seen 0:00-0:05]`.
- Neither has a spoken intro or channel promo in the first 30 s `[seen]`. Where the ebook promo goes in this format is `[unknown: ask]`.

## Video structure
| Part | Ref 1 | Ref 2 |
|---|---|---|
| Start | Name + start pose, get-ready | Empty scene, countdown |
| Exercise | Figure loops, timer top right | Figure loops, timer top left with WORK, progress % top right |
| Break | Fade dark, name + start pose, GET READY ring | Figure shrinks into a white-framed box labelled "NEXT: name", REST timer, subscribe button pops up |
| Repeat | ~24 exercises | ~15 exercises |

## Visual sources
- 100% animated figure on a background; no stock, no photos, no presenter `[seen]`.
- Ref 2's patio background looks AI-generated `[seen]`; ref 1 uses a plain studio cyclorama `[seen]`.

## Shots and camera
- Locked camera, full body, figure centred and filling about 80% of the frame height `[seen]`.
- Front or slight 3/4 view; turns to a side or 3/4 view when the move reads better that way, such as bent-over reverse flyes `[seen ref 1, 13:00]`.
- Seated moves: 3/4 view of figure on a simple grey chair `[seen ref 2]`.
- The figure is faceless (smooth mannequin head) `[seen]`.

## Transitions
- Ref 1: about 0.5 s dip to dark at the end of each work block, then the next move's start pose `[seen 0:45, 1:22]`.
- Ref 2: the scene shrinks into a framed inset for rest, then grows back for work `[seen 0:50, 1:57]`.

## Colour and texture
- Figure: matte white-grey plaster body with sculpted muscle definition, black shorts `[seen]`.
- Target muscles: red-orange (about `#e8402f`) with fibre stripes, only on the muscles the move works; they change per exercise `[seen]`.
- Ref 1 ground: dark grey studio, soft top light, soft contact shadow, faint vignette `[seen]`.
- Ref 2 ground: bright warm outdoor scene, figure lit evenly `[seen]`.

## Text on screen
- **Ref 1 timer:** white ring top right, about 125 px across at 854x480 (about 280 px at 1080p), ring depletes as time runs; big white bold number with "SECONDS" small underneath `[seen]`.
- **Ref 1 name:** white bold uppercase on a cyan (`#1ec8d8`-ish) box, bottom left, only during the break; fades as work starts `[seen 0:00-0:16]`.
- **Ref 1 get-ready:** large white number centred on the figure inside a purple progress ring, "GET READY" small above `[seen 0:11]`.
- **Ref 2:** green glowing ring timer top left with WORK or REST under it; green outlined exercise name bottom left; white progress bar with % top right; "NEXT: name" in green above the inset `[seen]`.
- No captions, no voice text `[seen]`.
- For this channel's older viewers, keep text large (channel rule from `senior-fitness.md`) `[user, earlier]`.

## Graphics
- Countdown ring, get-ready ring, name box, progress bar, "Next" inset, a subscribe button animation during rest (ref 2) `[seen]`.
- Faint channel watermark behind the figure (ref 1) `[seen]`. Don't copy either channel's name or watermark.

## Sound
- Ref 1: -16.5 LUFS, range 12.8 LU `[measured]`. Ref 2: -43.1 LUFS, nearly silent `[measured]`.
- What is heard (music, beeps on the countdown, a voice) is `[unknown: user to describe]`.
- Keep the channel's -15 LUFS target if there is voice or music `[senior-fitness guide]`.
- **Voice** `[user 2026-11-10]`: use only a little (move names, short cues, start and end), ElevenLabs v3 with [emotion] tags, voice elevenlabs_1qz7q3ZW54FIyiWDvo33, speed 0.94. Generate only with `VIDEO-TOOL	ools\health_tts.py --channel health`; the key is for this channel only and never more than 5,000 characters a day, which the tool enforces.
- **Tools (2026-11-23):** countdown ticks, the set-complete chime and rest beeps can come from earshot (`clock tick`, `soft success`) or `sfx-library/openverse` (tick, chime, bell). Music is still `[unknown: ask]`.

## Do and don't
**Do**
- Highlight only the muscles that exercise works, and change them per move `[seen]`.
- Show the next move's start pose and name before every work block `[seen]`.
- Keep moves slow and safe for older viewers; chair versions where possible `[user, earlier]`.

**Don't**
- Don't cut during a work block `[measured]`.
- Don't copy the references' figure files, backgrounds, names or watermarks; copy the format only.
- Don't use tiny text `[senior-fitness guide]`.

## Build notes
- **This PC** `[measured 2026-11-10]`: AMD Ryzen 7 7730U, integrated AMD Radeon (Vega) with 2 GB shared video memory, 14 GB RAM, Blender 5.2.3.
- Blender's Cycles cannot use this GPU (HIP lists only the CPU) `[measured]`, so render with **EEVEE** (uses the GPU through OpenGL). On the first channel video EEVEE took about 7 s a frame at 1080p, 24 samples, with a full room `[measured]`.
- Render only **one rep loop per exercise** (about 60-90 frames at 30 fps), with a transparent background, as PNG frames. HyperFrames loops it for the work block, adds the background, timers and text. About 15 exercises x 75 frames = 1,100 frames, roughly 1.5-2 hours of render.
- Keep the Blender scene light for 2 GB: one character, a simple chair, 2-3 lights, no volumetrics, no raytracing, shadow resolution 2048 or less, textures 2K or less.
- Rig and moves: reuse the MPFB rig and the "move as a function of time" approach from `senior-fitness\blender\exercises.py`; make each loop start and end on the same pose.
- Muscle highlight: one red emission/colour layer per muscle group, switched on per exercise with a mask, so the same render setup serves every move.

## Rules from feedback
- 2026-11-10: Change the health channel to an anatomy-figure workout style like the two references, made in Blender, on a PC with a 2 GB graphics card `[user]`.
- 2026-11-10: Voice via the user's ai33.pro key: health channel only, max 5,000 characters a day, a little voice, emotion tags, speed 0.94 `[user]`.
