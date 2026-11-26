---
name: squid-project
description: "Unseen Kingdom \"Why You'd Never Want To Meet A Colossal Squid\" (20 min): Blender 3D plates + HyperFrames 2D scenes + real footage, rendered in four parts, user's audio levels"
metadata:
  node_type: memory
  type: project
  originSessionId: b15489ea-08eb-46fc-8ef6-5bb1e88695fa
  modified: 2026-11-07T15:13:00.423Z
---

Started 2026-11-07 in C:\Users\daggu222105\VIDEO-TOOL\squid. Voice: assets/vo.mp3 (20:05, -21.3 LUFS raw). User asked: 60% high-quality 2D/3D animation, stock from Pexels/Pinterest/YouTube/internet, voice "107", music "95-85", effects "95-98".

How it is built:
- 3D: blender/squidkit.py (procedural colossal squid: lofted mantle, fins, eyes, arms bent along driver-animated guide curves), models.py (sperm whale, submersible), plates.py (12 scenes), render_plates.py (EEVEE 1600x900, 16 samples, every other frame, resumable). tools/plates_to_mp4.py makes 30 fps clips with minterpolate. stills.py makes transparent cutouts for 2D scenes.
- EEVEE world volumetrics band into a dotted pattern on this laptop (AMD iGPU): use haze=0 and K.beam() fake light shafts.
- 2D: lib.py helpers + scenes.py (SVG/GSAP scenes), build.py shot list writes parts/p1..p4.html (copy one to index.html to check or render; two root HTML files at once is a lint error). Video wrappers must have no background or they stack black boxes.
- Audio: tools/mix.py reads sfx.json. Levels read as dB steps under the voice: voice -14 LUFS, music 12 dB under in pauses, ducked ~19 dB under on average, effect peaks ~10 dB under voice peaks. Music: Kevin MacLeod (Lightless Dawn, Dark Fog, Ossuary 6 - Air, Unseen Horrors, Long Note Two), CC BY. Effects synthesized by tools/make_sfx.py; real sperm whale clicks from Ocean Networks Canada.

**Why:** the user's earlier rule is free music, not generated, and to keep voice loud and everything else low. Related: [[video-toolchain]], [[ai-equator-channel]].
**How to apply:** for the next Unseen Kingdom film reuse squidkit/models/plates and scenes.py patterns; check the user's verdict on the 3D look before treating it as the channel standard.
