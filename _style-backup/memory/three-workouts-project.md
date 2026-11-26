---
name: three-workouts-project
description: "Health videos 6-8 built in one go (2026-11-11): balance (falls), back-pain seated stretches, seated arms; 17 new poses, a per-video meter panel, clean bright Pexels rooms"
metadata:
  node_type: memory
  type: project
  originSessionId: b354c296-90c4-4934-b758-f14141f567d7
  modified: 2026-11-11T09:56:08.685Z
---

On 2026-11-11 the user asked for three full videos at once, each with its own "clean" background, and no questions. Folders: VIDEO-TOOL\balance-workout, back-workout, arms-workout. Outputs: done\*-workout-final.mp4.

- **Poses:** chair_ex.py gained the BALANCE, BACK and ARMS lists, with 17 new pose functions. Balance moves are standing in front of the chair with arms out low or hands on hips (helpers stand, balance_arms, hips_hands). Existing poses are reused under new keys (e.g. torso_twist_b) so they get different muscle highlights.
- **Fix:** side_leg_raise's weight shift was reversed and has been fixed. The legs video was rendered before the fix.
- **Muscle groups:** the rig only has abs, adductors, back, biceps, calves, chest, forearms, glutes, hamstrings, hipflexors, neck, obliques, quads, shins, shoulders, traps, triceps. There is no lowerback or lats.
- **Backgrounds:** Pexels living_3 (balance), yoga_2 (back) and loftw_3 (arms).
  - White rooms need the background dimmed in make_clips (0.86–0.9).
  - The rest-screen backdrop is darkened to 0.6, or the NEXT title fails contrast.
- **build.py meters:** legs ("BALANCE"), a 6-vertebra spine ("SPINE STRETCH") and two arms ("ARM POWER"). The NR rows count is in the JS. A scratchpad script generated the three build.py files from the leg one.
- **Standing intro:** needs scale 1.18 / x 160 so the frame still covers the left edge.
- **Voice:** 3,367 characters total, all new lines.
- **Music:** back pain uses calm piano at volume 0.15.

**Why:** the user wants batches of finished videos with clearly different looks.
**How to apply:** for the next batch, reuse these build.py files and pose lists, and pick another unused clean room. Backgrounds used so far: lawn_6, studio_2, gym_0, living_3, yoga_2, loftw_3. Related: [[health-workout-style]], [[leg-workout-project]], [[health-voice-api]].
