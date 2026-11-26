---
name: geometry-project
description: "Geometry Explained Like You're 5" (16:06, delivered 2026-11-22): math series #3, Manim-heavy + 12 pixel kinds + Pixabay stock, in VIDEO-TOOL/geometry
metadata:
  type: project
  modified: 2026-11-22T16:05:12.782Z
---

User asked 2026-11-22 (voice "[calm] In ancient Eg.mp3") for a very high-quality geometry explainer with no AI-slop colours. It is the same series as [[euler-project]] and [[mathbetter-project]].

Built in VIDEO-TOOL/geometry (copied from euler/):
- **Manim:** 24 scenes in manim/scenes.py.
  - GlobeTri is a ThreeDScene (Shot3D class, no bg.png). Render it on its own: with 6 parallel renders it failed silently at HD.
- **Pixel scenes:** ancient.js (nile_flood, rope_stretchers, euclid_class, altar_ropes, syene_well, walkers) and modern.js (string_circle, pizza_order, giant_ant, bolyai_letter, gps_street, builder_corner).
- **Stock:** pxg_* clips from Pixabay.
- **Structure:** 11 chapter cards, 7 render parts.
- **Output:** done/geometry-explained-like-youre-5.mp4, plus description-and-credits.txt and description-no-sources.txt.

New tools:
- tools/transcribe.py writes words.json and transcript.txt.
- tools/mncheck.py checks the W()/WX() cues in scenes.py.

Lesson: W() hints must be at or before the word (use the line start). A late hint jumps to a later occurrence and silently stretches the scene.

Accuracy notes (RESEARCH.md):
- Euclid's circle rule is Postulate 3, labelled as such on screen.
- The "professional walkers" story is undocumented, so no on-screen claim is made.
- There is no authentic portrait of János Bolyai.

**Why:** the series continues.
**How to apply:** copy geometry/ for the next math video (it has the latest tools).
