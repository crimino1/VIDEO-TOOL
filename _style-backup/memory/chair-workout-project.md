---
name: chair-workout-project
description: "Health channel video 'Chair Workout for Men Over 50' (VIDEO-TOOL\chair-workout): user's GLB muscle man rigged in Blender, HyperFrames edit"
metadata:
  type: project
---

First video in the new anatomy-figure workout style (2026-11-10). The user supplied the figure as a GLB (usermodel/model.glb, AI-made sculpt, no rig) after rejecting MakeHuman and Z-Anatomy figures as low quality.

Pipeline (all in chair-workout): blender/um_build.py (scale, rig at measured joints, muscle zones projected from za_sculpt3.blend) -> um_autoweights.py (bone heat on a voxel copy, copied back; direct bone heat fails on this mesh) -> um_fixweights.py (along-skin distance rules) -> um_refine.py / um_normals.py / um_actedge.py -> um_auto.blend. Exercises: blender/chair_ex.py (pure pose functions) + render_ex.py (resumable PNG loops, ~2 s/frame at 32 samples). tools/make_clips.py composites loops on the lawn background; edit/build.py writes the HyperFrames index (intro 24 s, 10 x (15 s rest/next + 42 s work), outro 20 s = 614 s).

**Why:** the user wants reference-level quality (sculpted muscles, real face) and makes decisions fast; they let Claude finish videos unattended.
**How to apply:** for the next workout video reuse um_auto.blend + chair_ex.py (add pose functions), voice via [[health-voice-api]], style in [[health-workout-style]]. Known flaws: small red spot on the shorts' left side, chair shadow faked in compositing.
