---
name: leg-workout-project
description: "Health channel 'Top 9 Leg Strength Exercises for Seniors' (VIDEO-TOOL\\leg-workout, 9:50): voice almost all reused clips, LEG POWER meter, gym_0 reused at user's request"
metadata:
  node_type: memory
  type: project
  originSessionId: b354c296-90c4-4934-b758-f14141f567d7
  modified: 2026-11-10T18:47:51.435Z
---

Fifth anatomy-figure workout (2026-11-10/11), built unattended from abs-workout (copied tools/, edit/build.py). The user said the previous background was good and to use it like that, so gym_0 was reused. That overrides the new-background-every-video rule only for this video.

- Moves (chair_ex.py LEGS list): seated march, leg extension, knee raise, knee opener, leg raise, standing calf raise, standing side leg raise (new pose), flutter kicks, sit to stand.
- chair_ex.py overrides EXERCISES muscles for seated_march, knee_raise, leg_raise and flutter_kicks to leg-only (no red abs). Re-rendering the abs video would now show no abs on those moves.
- Voice: only 24 characters were left that day. One new clip, "Next, side leg raises." (22 characters, no emotion tag), brought the total to 4,998. Everything else was reused from the chair, belly, Kegel and abs voice folders. The intro is the chair intro with the "whole body" sentence cut out, located with faster_whisper word timestamps (faster_whisper is in .venv).
- build.py: the leg meter has two legs × 3 segments and lights only the working leg (6th RHY field r/l/b). Accents are sky blue #2ec4ff and yellow.
- Music: Josh Woodward ×2 and Felixjd, CC BY 3.0.

**Why:** when the daily voice budget runs out, reuse clips whose words still match the move.
**How to apply:** check the voice txt folders for reusable lines before spending characters. Related: [[abs-workout-project]], [[health-voice-api]], [[health-workout-style]].
