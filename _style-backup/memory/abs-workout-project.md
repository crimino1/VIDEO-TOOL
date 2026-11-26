---
name: abs-workout-project
description: "Health channel 'Easy Chair Abs Workout at Home' (VIDEO-TOOL\\abs-workout, ~9:50): first video with the thin, skin-toned figure (um_thin.blend), home-gym background, six-pack CORE meter"
metadata:
  node_type: memory
  type: project
  originSessionId: b354c296-90c4-4934-b758-f14141f567d7
  modified: 2026-11-10T12:39:34.058Z
---

Fourth anatomy-figure workout (2026-11-10), built unattended. The user asked for a "thin model" in "European human skin" colour. chair-workout/blender/um_thin.py makes um_thin.blend from um_auto.blend: each vertex moves toward the axis of its weighted bones (per-bone factors, e.g. upperarm 0.74, spine_01 0.77; head, hands and feet 1.0), so the rig and poses are unchanged. The material "skin" is a flat light skin colour with subsurface; the red target-muscle glow is kept but capped at 0.72.

Three new poses were added to chair_ex.py (lean_back, leg_raise, russian_twist; ABS list of 9 moves). render_ex.py gained a --peek flag (4 EEVEE frames for a quick look). Background: Pexels gym_0.jpg (home gym, black floor). Music: Soundrider/Dope and Felixjd, CC BY 3.0. Voice: 5 new lines, with 7 clips reused from the belly and chair videos; 4,976 of 5,000 characters used on 2026-11-10.

**Why:** the user wants a thin, realistic skin figure, plus a new background every video ([[health-workout-style]]).
**How to apply:** render future workouts from um_thin.blend unless the user asks for the muscle look again. Backgrounds already used: lawn_6, studio_2, gym_0. Related: [[kegel-workout-project]], [[health-voice-api]].
