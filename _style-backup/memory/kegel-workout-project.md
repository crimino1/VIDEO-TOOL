---
name: kegel-workout-project
description: "Health channel 'Kegel Exercises for Men and Women' (VIDEO-TOOL\\kegel-workout, 8:56): new sunroom background, x-ray pelvic floor panel, calm CC BY music"
metadata:
  node_type: memory
  type: project
  originSessionId: b354c296-90c4-4934-b758-f14141f567d7
  modified: 2026-11-10T10:09:50.804Z
---

Third anatomy-figure workout (2026-11-10), built unattended. Seven new seated poses were added to chair-workout/blender/chair_ex.py (KEGEL list: breathing_kegel, basic_kegel, pelvic_tilt, quick_flicks, knee_squeeze, elevator, knee_opener); sit_to_stand frames were reused. Layout: intro 36 s (title, how to find the pelvic floor, today's moves), 8 x (15 s rest + 45 s work), outro 20 s.

The pelvic floor is internal, so edit/build.py adds an x-ray panel during work: an SVG pelvis whose sling lifts in time with each pose loop (RHY table), a SQUEEZE/RELAX label, a rep counter and a soft glow on the figure's pelvis. One GSAP proxy per set drives all of it with onUpdate, which is seek-safe. "Squeeze"/"And relax" voice cues play for the first two cycles only.

Background: Pexels studio_2.jpg (sunroom with a wooden floor). Music: zero-project and thomas saliba, CC BY 3.0 (kegel-workout/music/CREDITS.txt). Voice used 1,300 characters (4,498 of 5,000 on 2026-11-10).

**Why:** the user asked for a new background in every video ([[health-workout-style]]). **How to apply:** next time pick a background not yet used: lawn_6 (chair and belly videos) and studio_2 (Kegel) are taken. Related: [[belly-workout-project]], [[health-voice-api]].
