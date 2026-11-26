---
name: batch4-workouts-project
description: "Health videos 12-14 (2026-11-13): morning stretch 7:30, sciatica/hip 10:50, posture 14:50; character variants (um_variant.py: skin, hair, beard, tee/tank), own font per video"
metadata:
  node_type: memory
  type: project
  originSessionId: b354c296-90c4-4934-b758-f14141f567d7
  modified: 2026-11-12T18:54:49.932Z
---

On 2026-11-12/13 the user asked for three videos with different lengths (16 minutes at most), different backgrounds, different text styles, and a slightly different character per video (colour, dress, skin). They also asked to "enhance character". Folders: morning-workout, hip-workout, posture-workout. Outputs: done\*-workout-final.mp4.

**Characters** (chair-workout/blender/um_variant.py <name>, built from um_look.blend into um_<name>.blend)
- **arthur:** light skin, silver hair, grey beard, navy tee, grey shorts.
- **marco:** olive skin, dark hair, sage tank top, charcoal shorts.
- **daniel:** deep brown skin, black hair and beard, light heather tee, navy shorts.
- Clothing is painted from body regions and vertex weights, under the muscle glow, so worked muscles glow through the shirt.

**Timing**
- Morning: REST 10 / WORK 40, 8 moves.
- Hip: 15 / 45, 10 moves.
- Posture: 15 / 55, 12 moves.
- The halfway banner index is set by HALF in build.py, to match the voice line.

**Fonts** (open-licence TTFs from google/fonts in VIDEO-TOOL\fonts_dl, loaded with @font-face from edit/assets/fonts)
- Morning: Nunito, pill shapes.
- Hip: DM Serif Display headings with Inter.
- Posture: Oswald in capitals with Montserrat.

**Accents and meters**
- Accents: morning sky #7FB3D5, hip dusty rose #C9939A, posture teal #4FA3A5.
- Meters: SPINE (morning), LEGS (hip), TRAPS (posture).

**Poses and media**
- 12 new poses in the MORNING, HIP and POSTURE lists.
- Backgrounds: sunny_2 bedroom, japandi_6 (dada _design), office_0.
- Voice (3,081 characters) was generated after midnight, because the previous day had only 1,457 left.

**Why:** the user wants variety across videos while keeping the calm, quality style.
**How to apply:** for new videos, add another um_variant entry and font pairing instead of reusing these. Backgrounds used so far: lawn_6, studio_2, gym_0, living_3, yoga_2, loftw_3, beige_4, beige_7, beige_6, sunny_2, japandi_6, office_0. Related: [[batch3-workouts-project]], [[health-workout-style]], [[health-voice-api]].
