---
name: alien-anatoly-channel
description: "New fitness channel \"Alien Anatoly\" (2026-11-18): green faceless muscle mascot copies the style of a white-figure reference, style guide written, paid pose test not yet approved"
metadata:
  node_type: memory
  type: project
  originSessionId: 07993cb9-389a-44b6-8d4d-e6f93b16345d
  modified: 2026-11-18T00:12:20.353Z
---

New channel "Alien Anatoly" started 2026-11-18. The style guide is at ~/.claude/skills/channel-style/channels/alien-anatoly.md; the files are in VIDEO-TOOL/alien-anatoly/ (ref/reference_src.mp4, character_green.webp).

- Mascot: the user's green, cel-shaded, FULLY faceless (no eyes) muscle figure in black shorts. It acts out everything the white figure did in the reference ("How to Build a Body That Scares People").
- Look: AI still of the figure in photoreal AI places, lightly animated with a slow push. About 30% whiteboard icon cards. A 6.3 s average shot. Every change is a dip to black (0.7 s out / 0.7-1.0 s in). No captions.
- Pipeline: CODE ONLY, $0. The user was alarmed by a $0.65 paid quote and asked "can you do with code". Blender: alien-anatoly/blender/aa_build.py turns um_auto.blend into aa_figure.blend (faceless egg head, green toon, shorts); aa_poses.py holds the poses and anims; aa_render.py renders them; the 2D alpha outline goes on in aa_ink.py; test/make_test2.py composites onto Pexels photos. Test video: test/look_test2.mp4. Never use paid generation unless the user asks.
- Still open: voice source (the ai33 key is health-only), music, the LUFS target, a signature detail to set it apart from the reference mascot, and the user's verdict on look_test2.

**Why:** the user wants the reference's story and animation style with their own character.
**How to apply:** read the guide before any Alien Anatoly video. Never put green marks on the green body; use orange, red or white instead. Related: [[video-toolchain]], [[health-workout-style]].
