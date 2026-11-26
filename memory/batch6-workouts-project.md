---
name: batch6-workouts-project
description: "Health videos 18-20 (2026-11-26): before-bed stretches on a 3D bed, get up off the floor (hands-and-knees + full get-up), Japanese five x2; all exactly 10:00; strand hair, softer body, junk-vertex fix"
metadata:
  node_type: memory
  type: project
  originSessionId: b354c296-90c4-4934-b758-f14141f567d7
  modified: 2026-11-26T00:52:44.779Z
---

On 2026-11-25 the user picked 3 topics and said: "create all 3 .. length 8-12 min .. every video should have same length .. first enhance model .. more realistic .. then create, render full video .. dont ask any permission". All three are 10:00: INTRO 30, then 10 × (15 rest + 40 work), OUTRO 20.

**Folders and setup**
- bedtime-stretch: character walter, in pyjamas, on a rendered bed (BED=1). Background bd_c_5 (Shantae Shaffer). Font Quicksand, accent #8FA8C8.
- floor-getup: character samuel. Background fg_a_3 (Alex Tyson). Font Barlow Condensed, accent #D49A5B.
- japanese-five: character hiro. Five moves × 2 rounds. Background jp_a_3, a tatami room (Jens F). Font Shippori Mincho, accent #B8594E.

**Figure realism (chair-workout/blender)**
- um_hair.py grows real strands with geometry nodes on the posed mesh. The hair is combed back from a head frame (nose and back-of-skull vertices).
- Strand density was halved (hair 560k at radius 0.0003). It looks the same at full-body size and saves 3.7 s → about 1 s per frame.
- um_real.py:
  - Softens the bodybuilder muscles with a Laplacian smooth that leaves the head, hands and feet alone.
  - Adds face colour detail.
  - Shells use any() face selection, straightened hems and no islands under 300 faces.
  - Deletes the base mesh's junk vertices below the floor (z < 0, edges over 0.12 m). They had shown as thin rods from the heel whenever a foot lifted, so earlier videos may have had them.
- An HDRI was tested and made no visible difference, so it is not used.

**Poses (batch6_ex.py)**
- Turned(b) wraps the body so standing-style code ("facing -Y") renders as a side view facing -X.
- snap/apply_mix blends whole poses (every bone, slerp). GETUP uses it over keys: lying → side → hands and knees → kneel → half-kneel → push up → stand, then back down, T = 20 s.
- quad() is the hands-and-knees pose; it solves pelvis height and chest tilt.
- EXTRA dict per move gives the chair (world location, rotation) and the camera. render_ex reads it.
- The bed is mattress, base, headboard and blanket, with the top at mat height, so all the floor poses work unchanged on it.

**Render**
- About 6.5 s per frame at RT=0 and 16 samples.
- The scratchpad render_batch6.sh runs the batch. render_ex skips frames that already exist, so a stopped render can be restarted.

**Voice**
- 3,050 characters on 2026-11-26, checked with Whisper.
- Two Openverse koto tracks had Russian vocals: check every track with Whisper before using it, because earshot listening is not installed.

**How to apply:** start future videos from these characters (um_variant → um_real → um_hair) and use EXTRA, Turned and apply_mix for new floor or kneeling moves. Backgrounds used so far: the list in [[batch5-workouts-project]] plus bd_c_5, fg_a_3, jp_a_3. Related: [[health-workout-style]], [[health-voice-api]].
