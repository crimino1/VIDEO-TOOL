---
name: space-channel
description: "Space channel \"Outside Lay\" (started 2026-11-11): Jupiter-reference style, EP1 Saturn rings film, reusable Three.js pipeline in VIDEO-TOOL/space/ep1"
metadata:
  node_type: memory
  type: project
  originSessionId: 00314fbd-4cea-495d-ac19-fe785c0de44e
  modified: 2026-11-11T13:56:42.167Z
---

Channel name: **Outside Lay** (user, 2026-11-11). Workflow: user sends topic + voiceover mp3 (+ maybe script); Claude transcribes and builds the full video. User wants "a little bit" of stock and internet images on top of animation.

Style guide: `~/.claude/skills/channel-style/channels/space.md`. EP1 "Saturn's rings are disappearing" (15:24) built in `VIDEO-TOOL/space/ep1`:
- `assets/js/space.js` = Three.js engine (one WebGL canvas per part, shot kinds sat/body/row/earths/fly/sat_rain/sat_orbits/sat_pour/cassini/breakup/impact), planet textures from Solar System Scope (CC BY 4.0).
- `lib.py` + `scenes2d.py` = navy 2D infographics (Anton + Space Mono), `build.py` SHOTS list timed with `w("word", after)` lookups into words.json, writes 4 parts; `tools/render_parts.sh`, `tools/mix.py` (-14 LUFS, Kevin MacLeod tracks), `tools/credits.py`.
- Gotcha: dynamic Points/InstancedMesh must have frustumCulled=false (stale bounding spheres made the moon-breakup debris vanish in renders only).
- render_parts.sh copies parts/pN.html to index.html: never snapshot while it runs.

EP2 "How Big Is Our Universe?" (8:53, 2026-11-20) in `VIDEO-TOOL/space/ep2` -> done/outside-lay-how-big-is-the-universe.mp4 (+ -description.txt). User asked: high-quality animation + internet stock/images, "no AI slop colour or animation". Applied: calm palette (sand #e4cd92 accent, ink #eeebe4 type, slate navy #0a111d), no back.out overshoot, slow push on every 2D scene (freezedetect), exact-match word cues + cues.txt, dip-to-black part seams, persistent SCALE readout top-right.
- New engine file `assets/js/kinds_ep2.js` (space.js now exposes window.SPK and needs SP_start()): earth (day/night/clouds/atmo), gap (planets between Earth and Moon, polar diameters), sun (real SDO disk sprite + 1.3M Earth dots), betel, lightloop, lightsys, galaxy (particles + NASA art), localgroup, web, deepfield (real HUDF), observable (Planck CMB reprojected by tools/moll2eq.py), voyager (NASA GLB via tools/glb2js.py + DracoPy).
- Gotchas: `flat` is a reserved GLSL3 word; point clouds need a size cap (max 7 px) or they look blown out; tex() must not prefix "assets/tex/" onto assets/img paths; NASA SVS 15120 Voyager clips are clean PD.

EP3 "The Most Terrifying Types of Black Holes" (14:34, 2026-11-23) in `VIDEO-TOOL/space/ep3` -> done/outside-lay-black-holes.mp4. User: "visual very high quality, animation very understandable". Ranked list #8..#1 with rank cards + top-right rank readout.
- Hero = `assets/js/kinds_ep3.js` K.bh: full-screen GLSL ray tracer of Schwarzschild light paths (disk with Keplerian fbm swirl, Doppler beaming, gravitational redshift, hue-preserving tone map, 4x AA, ~0.3 s/frame on the iGPU), options: disk/diskK, temp, tint, jet/jetK, star/starKK (lensed point star -> Einstein arcs, used for microlensing), comp (companion star), shiftX/shiftY, skyRotSp. Fly-ins via distK.
- Lessons: noise on raw atan angle makes a seam (blend two samples); per-channel tone map turns orange disks olive/beige (use luminance tone map); text over a full-frame black hole collides -> place captions top (y~100) or move camera back; ffmpeg drawtext segfaults here (label sheets with PIL).

**How to apply:** copy space/ep3 (latest: calm palette, kinds_ep2.js + kinds_ep3.js black-hole ray tracer) for the next episode; reuse engine and 2D scenes. Related: [[video-toolchain]].
