# EP1 review — Is a CS degree worth it in 2027? (9:38)

## Creative calls
- Look follows the Bit by Bit guide: starfield black, neon pixel/CRT scenes (480x270 ×4 with scanlines, RGB mask, bloom),
  framed real photos, source screenshots with a yellow highlight, mascot "Bit" with sub-headings, white Archivo Black
  keywords hard-on per spoken word, yellow "Part N" section cards that zoom down.
- Structure from the script: cold open rant → logo → Part 1 scary numbers → Part 2 second column → Part 3 looking forward →
  Part 4 what are you buying → verdict → upside → ending + subscribe.
- 101 shots, ~60 custom pixel scene kinds built by 5 parallel builders (assets/js/scenes/*.js).
- Receipts: real NY Fed, Stanford Digital Economy Lab and BLS pages captured 2026-11-13; they match the script's numbers
  (BLS: developers +10% 2025–35, programmers −7%, bachelor's typical).
- Only numbers the script states are on screen; unknown table cells show "-". "JOB NEEDS DEGREE 81% / 53%" is 100 minus the
  script's underemployment figures. The tuition counter in the cold open is illustrative (no figure in the script).
- Sound: Pixabay SFX (30 files, 16 families, takes rotated) on visible events; Pixabay music per section
  (Pixel Dreams → Morning Coffee → Mellow Encounter → Chipmusic Box Dancer → Pixel Dreams).

## Measured vs looked at
- Measured: final −14.0 LUFS, true peak −1.4 dBTP; voice −14 LUFS; music −35 LUFS average (12 dB under voice in pauses,
  ducked under speech). Part lengths match the shot plan within 1 frame each (~0.06 s total drift by the end).
- Looked at: every pixel scene with its real film options (contact sheets), full-film contact sheets every 8 s, overlay
  snapshots. Not heard: music mood and SFX choice were picked by title/tags and measured, not listened to.

## Fixed during review
- Part 4 overlays were shifted: a keyword matched an earlier "cheap" (negative timeline position). Fixed + build now asserts.
- Placeholder numbers from the builder brief removed from the spreadsheet and high-score table.
- Pixel-person eyes were transparent (engine sprite), sub-heading text enlarged, NY Fed highlight retargeted, BLS crop.

## Weakest spots / with more time
- Section cards are small-ish (as in the reference); could be bigger.
- BLS "how to become" screenshot is text-dense; the highlight carries it.
- Music not auditioned by ear: swap tracks in tools/mix.py PLAN if any feel wrong.

## Warnings kept
- Lint "nested_structure_needs_subcomposition" / "timeline_track_too_dense": generated parts, same as earlier films.
- film_silent in check: audio is mixed after render by tools/mix.py.
