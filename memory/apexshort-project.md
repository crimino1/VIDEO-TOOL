---
name: apexshort-project
description: "Short 'You vs 5 Apex Predators: How Long Do You Last?' (apexshort/) — delivered 2026-11-19 as done/you-vs-5-apex-predators-short.mp4 (47.96 s, -13.9 LUFS)"
metadata:
  node_type: memory
  type: project
  originSessionId: b15489ea-08eb-46fc-8ef6-5bb1e88695fa
  modified: 2026-11-19T08:11:12.541Z
---

Vertical 1080x1920 short, started 2026-11-19 in VIDEO-TOOL/apexshort from "You versus the five .mp3". User asked for: high-quality realistic animation, best stock footage (Instagram named, but vidIQ has 1 credit left so no IG search; used Pexels 4K + YouTube 4K), no slop colours.

Done:
- Voice tightened by tools/tighten.py: 55.1 s to 47.26 s, all 133 words re-checked. Verdict lines keep 0.42 s pauses.
- assets/js/hud.js is one overlay canvas: survival clock per round, title, ECG, 1-mile scent map, outrun/outswim strike, bite bars (3,700 lb vs 160 lb), tiger blind spot, 6-ton size panel (orca_a + diver_sil cut-outs from orcas/), prey tally, "0 recorded deaths", 5-band end card. Calm palette: #F4F1EA ink, dark glass panels, accents #D7835F, #D9A441, #8DB59A.
- Layout fixes applied but not yet re-snapshotted: clock label row, Inter mono digits, size panel moved down, end-card labels.
- build_apex.py + shots.py (V(src, original_time, cx, cy); OFF subtracts section starts from tools/sec.txt). tools/mix_short.py END = vo + 0.7. Music: Five Armies (Kevin MacLeod, CC BY).

Rejected sources:
- AI-generated: bear_ns, croc_doc, tig_mist.
- 720p: croc_jump.
- Not the right animal: shark_3 (whale shark), blueL_0.

Delivered with done/you-vs-5-apex-predators-short-description.txt. bear_sit/tig_roar never downloaded (slow 4K sections); replaced by bear_arc 12.6 and tig_8k 6.8/361.4/367.2.
Gotchas: running 5 parallel 4K section downloads with --force-keyframes-at-cuts runs out of memory (use -P 1-2); 360p previews + contact sheets first, then 4K sections only. mix_short.py needs apad on the voice or sidechain output ends with the voice (cut the end card); voice chain now loudnorm -13.3 + volume 1.2dB.

**How to apply:** apexshort/ is the template for overlay-style vertical shorts (hud.js canvas + build_apex.py/shots.py). Related: [[orcashort-project]].
