---
name: health-workout-style
description: "Health channel switched (2026-11-10) to an anatomy-figure follow-along workout style in Blender; PC has a 2 GB integrated AMD GPU, so EEVEE only"
metadata:
  type: project
---

On 2026-11-10 the user asked to change the health/senior channel to a "2D workout" style modelled on two references (anatomy muscle figure, red target muscles, countdown timer, no cuts). Draft guide: ~/.claude/skills/channel-style/channels/health-workout.md; reference analysis in VIDEO-TOOL\style-refs\workout2d.

PC: Ryzen 7 7730U with integrated Radeon (Vega), 2 GB shared VRAM, 14 GB RAM, Blender 5.2.3. Cycles sees only the CPU, so render with EEVEE, one rep loop per exercise on a transparent background, and loop it in HyperFrames.

**Why:** the user explicitly asked to fit the 2 GB card.
**How to apply:** keep Blender scenes light (one figure, chair, 2-3 lights, 2K textures); open decisions are listed at the top of the guide. Related: [[senior-fitness-project]], [[video-toolchain]].

User rule (2026-11-10): use a different background in every new workout video. Backgrounds used so far: lawn_6 (chair, belly), studio_2 sunroom (Kegel), gym_0 home gym (abs; reused for legs because the user asked), living_3 (balance), yoga_2 (back pain), loftw_3 (arms), beige_4 (knee), beige_7 (neck), beige_6 (walking), sunny_2 (morning), japandi_6 (hip), office_0 (posture). Since 2026-11-12 the figure is um_look.blend and the edit palette is calm (see batch3-workouts-project). Since the abs video the figure is the thin skin-tone um_thin.blend. See [[kegel-workout-project]].
