---
name: orcashort-project
description: "First vertical short \"Cute Face, Killer Brain\" (orcashort/): all real footage in 9:16 windows, pauses cut from voice, ducked music"
metadata:
  node_type: memory
  type: project
  originSessionId: b15489ea-08eb-46fc-8ef6-5bb1e88695fa
  modified: 2026-11-17T07:09:47.220Z
---

Vertical 1080x1920 short, 50.57 s, delivered 2026-11-17 (v2 adds ~8 s flat animation from assets/js/vert.js: trance, liver x-ray, sunfish hold+ram, via A(name) in build_short.py; canvas 1080x1920) as done/cute-face-killer-brain-short.mp4 (+ -description.txt).
Pipeline in orcashort/: build_short.py (SHOTS list, `V(src, ss, cx, y0, y1)` cuts a 9:16 window from 16:9 clips, credit line top-left), lib.py with OUT_W/OUT_H/SHARPEN, tools/mix_short.py (voice loudnorm -13.3 lands ~-14.5 final, Kevin MacLeod bed at -26 ducked).
Voice pauses tightened by RMS to 0.15 s (0.27 at topic turns): 59.9 s -> 50.6 s, every word re-checked with whisper.

**Why:** user asked for fully stock, high quality, smooth/engaging, no dead air.
**How to apply:** reuse this folder as the template for future shorts. Avoid sub-1080p sources (a 9:16 window from 1080p is only ~608 px wide). sunfish_nbc (NBC 1080p) needs window y 0.02-0.8 to hide the banner. No captions per [[unseen-no-captions]]. Related: [[orcahuman-project]], [[orcakill-project]].
