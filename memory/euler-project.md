---
name: euler-project
description: "\"The Most Beautiful Equation Explained Like You're 12\" (11:02, delivered 2026-11-20): same math series as mathbetter, Manim-heavy, in VIDEO-TOOL/euler"
metadata:
  node_type: memory
  type: project
  originSessionId: 0ead386e-c8fb-41b5-bfd6-376af8997d71
  modified: 2026-11-19T22:46:20.038Z
---

User asked 2026-11-19 (voice "[calm] In 2014, scie-enhanced-v2.mp3") for a premium explainer on Euler's identity, with very strong animation and explanation visuals. It belongs to the same series as [[mathbetter-project]]: pixel style, no mascot, Manim for the maths.

Built in VIDEO-TOOL/euler (a copy of the mathbetter pipeline):
- **Manim:** 26 scenes in manim/scenes.py. Each of the five characters keeps one colour through the film: e amber, i teal, pi rust, 1 moss, 0 cream. Key scenes: the road/quarter turn, the bank-interest staircase converging to e, the unit-circle walk, (1+iπ/n)^n steps with a zoom inset, and the finale.
- **Pixel scenes:** story.js, history.js and world.js from three builders.
- **Real material:** Pixabay pxe_* stock and Zeki 2014 figures (CC BY).
- **Output:** done/euler-most-beautiful-equation-explained.mp4, plus description-and-credits.txt and description-no-sources.txt.

Accuracy notes (RESEARCH.md):
- The narration at 0:16 says equations "filled the whole screen". That is wrong: all 60 fit on one line. The visuals show the study's real equation list instead, and the user was told.
- Euler's identity tied on the count of "Beautiful" votes but won on the average.

lib.trim() cache key now includes the source file's mtime. Before that fix, re-rendered Manim clips were silently reused from assets/clips.

**Why:** it continues the math series and reuses this setup.
**How to apply:** for future math videos, copy euler/ (it has the latest fixes: WX exact word match, cuecheck exact, mix apad for a closing hold).
