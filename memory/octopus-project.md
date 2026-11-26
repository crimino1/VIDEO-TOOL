---
name: octopus-project
description: "Unseen By Eye \"Blue-Ringed Octopus\" (10:22), delivered 2026-11-23: CC BY YouTube dives + Pexels + flat explainers (oct.js), tightened voice, SFX only"
metadata:
  node_type: memory
  type: project
  originSessionId: fae1fb12-2f56-480d-a5aa-eea12b7ae6fd
  modified: 2026-11-23T13:10:50.004Z
---

Built in `VIDEO-TOOL\octopus` from the user's voice "The most dangerous a.mp3". The voice says "subscribe to Unseen By", so it is an Unseen By Eye film. The user said "dont ask any things just complete full video", plus: high quality, use sound effects very well, high-quality voice, no big silences.

- **Voice (`make_vo.py`):** shrinks every silence of 0.55 s or more (below -42 dB) to 0.36 s, then applies EQ, de-ess and two-stage compression. One extra 2 s gap was cut by hand at 479.8 s. Result: 654 s became 617 s. Re-transcribe after cutting.
- **Footage:**
  - CC BY YouTube clips found with yt-dlp search using the CC filter (`&sp=EgIwAQ%253D%253D`). Roser Gari Perez's blue-ringed octopus dives are the main source; uploader names are credited on screen.
  - Pexels for everything else.
  - Commons for photos of the four species.
- **Animation:** flat explainers in `assets/js/oct.js` (`OC.S` scenes via `SC2`): paralysis body, range map, ring mirror-cell mechanism, Darwin 1954, toxin bars, bacteria, sodium gates, aware, recover, hunt, three hearts, neurons, eggs, end card. About 37% of the film, above the 20–30% rule, because the voice explains mechanisms.
- **Sound:** `sound.py` places 444 Mixkit cues plus an ambience bed per shot. Mixed with `tools/mix_sfx.py` (`HIT_UNDER` 2, `BED_UNDER` 12, smart duck), no music. Effects sit about 19 dB under speech, and nothing is silent for more than 1 s.
- **Gotcha:** `5qdExmPcR5Q` has dark title cards at 0–11 s and after 20 s; use 12–19 s only.
- **Delivered:** `done\blue-ringed-octopus.mp4` and `done\blue-ringed-octopus-description.txt` (chapters, hashtags, tags, credits).

**Why:** a template for future Unseen By Eye animal films. **How to apply:** copy `octopus/` (build, sound, mix, `oct.js`) for the next one. Related: [[men100-project]], [[unseen-mix-70-stock]], [[unseen-no-captions]].
