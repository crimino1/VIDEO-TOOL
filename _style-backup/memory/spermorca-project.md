---
name: spermorca-project
description: "Unseen Kingdom \"What If Sperm Whales Hunted Like Orcas?\" (22 min): code-only animation from NOAA whale paintings on canvas, wild footage, tested music"
metadata:
  node_type: memory
  type: project
  originSessionId: b15489ea-08eb-46fc-8ef6-5bb1e88695fa
  modified: 2026-11-08T23:02:06.002Z
---

Delivered 2026-11-09: done/sperm-whales-like-orcas.mp4 (22:14, -14 LUFS). Project VIDEO-TOOL/spermorca.

User's choices: no Blender (too slow); animation by code only, about 40%, realistic story animation (whales swimming, hunting); stock and images from Pinterest, YouTube and the internet, all 16:9; good effects; I pick the music after testing it ("choose by yourself"), and music a little lower than the squid film.

How it is built: tools/cutout.py cuts NOAA species paintings (Wikimedia Commons, public domain) off their white page; assets/js/ocean.js draws water, light rays, marine snow and animals that swim by strip-warping the cutout; assets/js/scenes.js holds the story scenes; scenes2d.py the SVG graphics; build.py shot list writes parts/p1..p4.html; tools/finish.sh builds, renders parts (about 12 min each) and runs tools/mix.py. tools/music_test.py scores free tracks (brightness, onsets, swells, voice clarity at our level). Music now 14 dB under the voice in pauses.

Pexels "orca" results are captive animals and its "sperm whale" aerials may be other species: use wild YouTube footage (Bremer Bay, Dominica sperm whales, Antarctic wave-washing) instead.

**Why:** the user wants realistic results fast and judges after watching. **How to apply:** reuse ocean.js/scenes.js and the cutouts for the next ocean film. Related: [[squid-project]], [[video-toolchain]].
