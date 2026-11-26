---
name: ai-equator-white-style
description: "2026-11-18 AI Equator feedback - white background everywhere, no dark neon, no overlapping animations, clean the voice and cut long pauses"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 10b135ce-c154-4b5f-a545-46f4c14e33de
  modified: 2026-11-17T22:53:41.039Z
---

On the GPT-6.2 Astra video (2026-11-18) the user asked for: a white background everywhere ("no dark neon slop, only white"), very high quality with no slop, and said many past animations overlapped or looked bad. They also asked me to edit the audio: clear voice, remove big pauses.

**Why:** they saw text and elements colliding in earlier dark-style videos (hand-placed absolute positions, cross-fading scenes, fixed-height cards), and the dark glow look read as AI slop to them.

**How to apply:**
- Use the white editorial kit (latest copy: ai-equator\riemann, which adds mathviz.py; first: ai-equator\oai) (lib.py + build.py): flex row/col layout inside fixed regions, ink type, one blue accent (#1D4ED8), light browser frames, quote and stat cards. Scenes never overlap in time; the old one fades out before the next starts.
- Before rendering, run `node tools/overlap.mjs` (checks overlaps, off-frame items, text spilling out of cards, labels that wrap) plus `hyperframes check`, and treat its content_overlap errors as real. Don't stamp data-layout-allow-overlap on scene hosts. Watch out: `flex:0` collapses a media column, so use "none".
- Time beats with W("phrase") from words.json (whole-word match). Check the opening frame isn't empty and that page crops don't cut off headlines.
- Voice: tools/clean_voice.py keeps 0.25 s pauses mid-sentence, 0.4 s at sentence ends and 0.55 s at section turns, plus clarity EQ, de-ess and -15 LUFS. Re-run transcription afterwards and diff the words.
- Assume white is the default for later AI Equator videos until the user says otherwise. Related: [[ai-equator-channel]]
