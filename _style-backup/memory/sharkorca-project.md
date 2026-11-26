---
name: sharkorca-project
description: "Unseen By Eye: 'The Great White Shark Has One Weakness. Orcas Found It' (16:26), first full film in the flat cartoon style, ~68% animation + Pinterest clips + Commons photos"
metadata:
  type: project
---

Started 2026-11-13 in VIDEO-TOOL/sharkorca. Voice "October 1997. A whal (1)-enhanced-v2.mp3" (986.5 s). The user asked for:
- 50-70% animation
- the rest good stock from Pinterest and images from the internet
- the flat style on **Unseen By Eye**
- documentary-type camera angles

"Kingdom" was cut after "subscribe to Unseen" (assets/vo.wav, 975.935-976.84 s, with a 0.3 s pause inserted).

Rig:
- assets/js/flat.js (from flat-test) plus shark.js (flat great white: roll for belly-up, open jaw, see-through liver)
- story.js (scenes: deep with actors on paths, hold/carry/limp, farallon, ambush, tracker, flip, gills, pump, xray, jaw, senses, size, beach, portstar, cage, drone, pod, web, map, bars, end)
- Every scene goes through SC with a documentary camera (o.cam z0/z1/x/y plus handheld drift). HUDs draw in screen space.

Gotchas:
- A Commons artist field with a truncated HTML tag broke the page: every later layer nested inside it and rendered black. Credits are now stripped and escaped.
- Part boundaries must sit on a shot start, or the spanning shot is dropped.
- Pinterest clip watermarks found: reef_1 (envato), deep_1 (PowerDirector), jaws_3 (quote text), kelp_0 (pillarbox and caption), storm_1 (faint Stocksy, only visible at high contrast). Check every clip with an autocontrast sheet.

Related: [[flat-style-test]], [[orcahuman-project]], [[trench-project]].
