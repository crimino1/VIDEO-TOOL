---
name: cutaway-survival-channel
description: "New Shorts channel cloned from @ink_tested format (3D cutaway \"How a X Becomes a Secret Bunker\"); guide channels/cutaway-survival.md"
metadata:
  node_type: memory
  type: project
  originSessionId: 81c3b135-14b1-4054-9653-52d06cff3fa5
  modified: 2026-11-26T10:58:53.728Z
---

2026-11-26: user wants the @ink_tested Shorts format rebuilt as their own new channel (working name "Cutaway Survival Builds", real name not chosen yet). Style guide: channel-style skill `channels/cutaway-survival.md`. Raw research (14 shorts, scripts, contact sheets, spectrograms): `VIDEO-TOOL/style-refs/ink-tested/`.

Key: 3D realistic cutaway diorama, second-person "But... So you..." chain at ~230 wpm, one-word captions with yellow keywords, yellow callout tags, comic sound-word bursts, "Congratulations. You have built a ___". Reference's 11M hit = river hideout from soldiers.

**Why:** user asked to clone the format; copy format only, not footage/scripts/name.
**How to apply:** user said 2026-11-26 "DON'T USE BLENDER, CREATE WITH CODE": build in three.js inside HyperFrames (template cutaway/waterfall; gotchas in the guide's Build notes), overlays in the same page; music NOT settled: reference has no stereo bed, maybe quiet mono music; [[no-ambience-beds]] applies until the user decides. Voice set by user 2026-11-26: **Akira** `elevenlabs_aHYS10erl9IGphnXtDeD` via ai33 (tools/aieq_tts.py now reads "voice" from the project's assets/vo/usage.json; budget 3,000 per short). Pause trim to ~225 wpm: cutaway/waterfall/tools/clean_voice.py (0.07/0.13 s gaps, 0.35 before "Congratulations", -14.5 LUFS). faster-whisper hangs at 0% CPU on a hub check: run with HF_HUB_OFFLINE=1. base.en misheard "camp" as "can't" (small.en is right), so check captions. First short DELIVERED 2026-11-26: done/How a Waterfall Becomes a Secret Hideout.mp4 (52 s, three.js in HyperFrames, 31 real CC0 SFX). Full render ~34 min on the iGPU (2 workers); stop the preview server before rendering or WebGL loses its context. Re-render only a changed span with --start/--end and splice. real-sfx mix.py: never set keep_audio "no" with --base-audio (it drops the voice); use --voice-depth light under nonstop narration; SFX needed +9 dB to sit ~11 dB under the voice. Day/night: fade backgroundIntensity, never swap scene.background (one-frame flash). Nexlev weekly limit hit 2026-11-26 (resets 11-28); vidIQ had 1 credit.
