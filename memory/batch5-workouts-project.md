---
name: batch5-workouts-project
description: "Health videos 15-17 (2026-11-18): belly fat (stand + mat), Tai Chi, neuropathy feet; floor/mat poses, cloth-shell realism pass um_real.py, real shadows, breathing"
metadata:
  node_type: memory
  type: project
  originSessionId: b354c296-90c4-4934-b758-f14141f567d7
  modified: 2026-11-18T01:33:11.374Z
---

On 2026-11-18 the user picked topics 1-3 from a view-count check: belly fat, Tai Chi and neuropathy feet. Their words: "all exercise not only chair .. some are floor", "increase character quality, enhance model look to real, animation should realistic". Folders: bellyfat-workout (10:00), taichi-workout (12:50), neuropathy-workout (7:46).

**Realism pass**
- chair-workout/blender/um_real.py turns um_<name>.blend into um_<name>_r.blend.
- The shirt and shorts/trousers faces are duplicated into offset, smoothed cloth shells (hems pinned, pin-holes closed), with weave/fold bump, sheen, and muscle glow at 0.7 on cloth.
- Eyes get a wet highlight.
- Tried and dropped: a hair shell (looked like a helmet) and particle hair (wrong scale, 4x slower).
- um_variant.py now supports top="long" (sleeves to the wrist) and pants=True. The tee neck cut is fixed so it no longer leaves holes over the traps.

**Characters**
- henry: fair skin, white hair, blue-grey tee, khaki shorts (belly video).
- kenji: white long-sleeve top, black trousers (Tai Chi).
- raj: brown skin, salt-and-pepper beard, slate tee, charcoal joggers (feet).

**render_ex.py**
- Mode field: False seated, True standing, "floor" for lying on a mat (mat mesh, low floor camera).
- The chair shows only when seated or for sit_to_stand.
- A shadow catcher plane (Shader to RGB, radial fade, SHADOW_LO/HI env) gives real floor shadows, so make_clips no longer paints an ellipse.
- RT=0 turns raytracing off for speed.
- rigkit.BREATH adds breathing with period T/n.

**Poses and edit**
- batch5_ex.py holds the BELLY, TAICHI and FEET lists.
- Floor body lies along X with the head at -X. Straight-leg foot pitch is negative for toes up.
- Floor clips are shifted 150 px left so the feet clear the meter panel.

**Media**
- Backgrounds (Pexels): bf_a_3 (Alex Tyson), tc_a_3 garden deck (Max Vakhtbovych), nf_b_2 bedroom (Curtis Adams).
- Fonts: Archivo, Cormorant Garamond + Lato, Rubik.
- Voice: 2,716 characters on 2026-11-18.

**Speed:** full HD renders at about 7-10 s per frame at 24 samples, or about 6 s with RT=0 and 16 samples (used for feet and Tai Chi). The batch took about 9 hours of Blender time.

**Disk:** C: has under 10 GB free. HyperFrames needs `render --workers 1`, because parallel workers store every frame on disk. Its video extract cache (%TEMP%/hyperframes-extract-cache-u, about 2 GB per render) must be deleted after each render. ~/.cache/hyperframes/history is 8.5 GB: ask the user before touching it.

**Mastering:** the scratchpad master.py takes a make-up gain argument. Gains used: belly 1.9, feet 2.8, Tai Chi 1.5, giving -15.1 to -15.4 LUFS at -1.4 dBTP.

**Delivered:** done/bellyfat-workout-final.mp4, neuropathy-workout-final.mp4, taichi-workout-final.mp4.

**Why:** the user wants variety and more realism without giving up the anatomy-glow format.
**How to apply:** start new videos from um_real.py variants and the batch-5 render options. Backgrounds used so far: the list in [[batch4-workouts-project]] plus bf_a_3, tc_a_3, nf_b_2. Related: [[health-workout-style]], [[health-voice-api]].
