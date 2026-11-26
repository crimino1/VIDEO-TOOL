---
name: mathbetter-project
description: "\"Only Video That Will Make You BETTER at MATH\" (11:43, 2026-11-17): Bit by Bit pixel style without mascot/branding + Manim maths, documentary cut, in VIDEO-TOOL/mathbetter"
metadata:
  node_type: memory
  type: project
  originSessionId: 0ead386e-c8fb-41b5-bfd6-376af8997d71
  modified: 2026-11-16T20:23:21.718Z
---

User asked 2026-11-17 for a math video (voice "[calm] In 1939, a gr.mp3") NOT for Bit by Bit: "don't use his pixel character, use only his animation style, use Manim for math, no slop colour, premium, easy to understand, engaging".

Built in VIDEO-TOOL/mathbetter (copy of bitbybit/ep05 pipeline; tool paths patched one level up):
- 6 pixel builders (dz/minds/dread/gauss/practice/wiles.js), PX.D calm palette, no mascot, no logo sting/outro; chapter cards "CHAPTER · ONE…SIX".
- Manim: manim/mc.py (dark slate bg.png, cream/amber/teal, Archivo + LaTeX, Shot.until(abs_time) clocks to words) + manim/scenes.py (12 scenes: Gauss pairing, 1..1000, dot-staircase n(n+1)/2, anxiety graph, forgetting curve, 72/38 bars, negatives, Fermat, simplex). Windows in mshots.py; tools/render_mn.py → stock/raw/mn_<Name>.mp4 (padded 1.5 s); placed with MN() (zoom=None, grade="").
- Research in RESEARCH.md + assets/img/credits.tsv; real clips: Simons Foundation (Mirzakhani), Isaac Newton Institute (Wiles).
- Voice TTS glitch at 5:37 ("500 times 1,001" x3, never says 500,500): on-screen shows 500,500; voice untouched.

**Why:** separate channel/brand from Bit by Bit; keep its look minus character.
**How to apply:** reuse this folder's Manim setup for future math videos; keep accuracy notes (Rohrer 72/38 is same students on two practice types; Ramirez-Beilock classroom exam was biology). Related: [[bitbybit-channel]], [[calc-project]].
