---
name: trench-project
description: "Mariana Trench film for the second channel Unseen By Eye: same style as the sperm whale film plus a realistic human (real diver photo cut-outs); cut 'Kingdom' from the voice"
metadata:
  node_type: memory
  type: project
  originSessionId: b15489ea-08eb-46fc-8ef6-5bb1e88695fa
  modified: 2026-11-09T09:41:10.052Z
---

Started 2026-11-09 in VIDEO-TOOL/trench; delivered done/mariana-trench.mp4 (15:34) plus done/mariana-trench-description.txt on 2026-11-09, after a full clip scan removed logos and burned-in subtitles. Waiting for user feedback.

User's choices: same style as the sperm whale film (code-only HyperFrames animation, real footage, 16:9), plus human animation that must look realistic; channel name on screen "UNSEEN BY EYE" (second channel, same type of videos as Unseen Kingdom). The narration says "Unseen Kingdom", so the word "Kingdom" is cut from the voice (assets/vo.wav, cut 926.40-926.93 s of vo_raw.mp3, verified by re-transcribing).

How it is built: the human is real Pexels diver photos (original resolution) cut out with `npx hyperframes remove-background`, alpha below 60 cleared, drawn in assets/js/trench.js through its own offscreen layer (tinting on the main canvas drew a visible box). The user rejects pictogram people, so body diagrams use the real diver photo too. scenes_t.py holds graphics (depth gauge, trench cross-section with Everest, lungs, subduction, fish depth limit). Music 14 dB under the voice, tracks chosen by me.

**Why:** the user wants realistic people and fast finished files. **How to apply:** reuse trench.js diver() and the cut-outs for any human-in-the-ocean story; end card text per channel. Related: [[spermorca-project]], [[squid-project]].
