---
name: bitbybit-channel
description: "CS explainer channel \"Bit by Bit\": style guide, mascot \"Bit\", EP1 pipeline in VIDEO-TOOL/bitbybit/ep01 (pixel CRT engine + 5 parallel scene builders)"
metadata:
  node_type: memory
  type: project
  originSessionId: 0ead386e-c8fb-41b5-bfd6-376af8997d71
  modified: 2026-11-13T05:05:17.642Z
---

User started channel "Bit by Bit" on 2026-11-12 — computer-science explainers. Style ref "Insane Computer Science Concepts" (analysis VIDEO-TOOL/style-refs/bitbybit/insane-cs/). Guide: ~/.claude/skills/channel-style/channels/bit-by-bit.md. Workflow: user sends topic + voice-over mp3 (sarcastic, smart narrator), Claude builds everything.

EP1 "Is a CS degree worth it in 2027?" (9:38) in VIDEO-TOOL/bitbybit/ep01, started 2026-11-13:
- assets/js/px.js = pixel engine: scenes draw on a 480x270 canvas, upscaled x4 + scanlines/RGB mask/bloom onto #crt, starfield on #stars. Scene kinds in assets/js/scenes/*.js (open/data/money/buy/end/core, ~60 kinds) — reuse them.
- BUILDERS.md = brief for parallel scene-builder subagents; tools/pxsheet.cjs renders a kind's contact sheet; tools/realsheet.py renders every shot with its real film options.
- lib.py + build.py: SHOTS timed with W("word", after) on words.json; keywords (Archivo Black, hard-on per word), yellow section cards, mascot (Python port), framed Pexels photos, source screenshots with yellow highlight (tools/shots.cjs). 4 parts, tools/render_parts.sh, tools/mix.py (-14 LUFS, music 12 dB under + sidechain).
- SFX + music from Pixabay (user's request): curl is blocked (403) but the built-in browser works; SFX URLs via hooking HTMLMediaElement.play on search pages, music via cdn.pixabay.com/download/audio link in a track page's HTML; CDN downloads with curl are fine.
- Render ~2.4x realtime (126 s part in 5 min).

- User feedback 2026-11-13 (final): NO background music — voice + SFX only (mix.py MUSIC=False). Earlier the same day: chiptune music = "bad music". Use informative/explainer tech background music, no Content ID (Pixabay track page must not say "Content ID Registered"). Levels "voice 1.10 / music 0.80" → MUSIC_UNDER=18 dB.

EP2 "How to Actually Get Good at Coding" (9:06) in VIDEO-TOOL/bitbybit/ep02, after the user called EP1's visuals "not very high quality" and its SFX "very bad, louder than voice":
- Engine v2 (assets/js/px.js): 640x360 ×3, per-shot camera (opts.cam z/x/y keyframes, scenes get c for PX.par parallax), tin/tout zoom|glitch|fade, helpers glow/vignette/vgrad/particles/otext. Reference scene core.js `room` (lofi night desk, PX.core.coder/monitor/editor/skyline).
- BUILDERS.md v2 quality bar: full environments, 3 depth layers, light, native-res characters (never PX.zoom a sprite), ambient life. 5 builders → 45 kinds (open/learn/practice/debug/ship.js); result was a big step up.
- Stock: Pixabay videos (cdn large mp4 = 1080p/4K, free; harvested via built-in browser) + real screen recordings via tools/scroll_rec.cjs (puppeteer scroll → mp4; GitHub, Wikipedia, norvig.com). Mixkit 1080p needs login for newer clips (403), only 720p free.
- SFX: soft Pixabay set (swooshes, soft UI clicks/pops, notifications, real mech keyboard, short glitch, soft impacts); mix.py levels each SFX by the quieter of peak 16 dB under voice peak and loudness 16 dB under voice LUFS; ~85 cues. No music.

EP3 "Why AI Is Making Programmers Worse" (8:57) in VIDEO-TOOL/bitbybit/ep03, 2026-11-13: user asked for real internet material (YouTube clips, Google images, photos of the real people). Done with real X posts/chat screenshots over dimmed pixel scenes (RX), quote card with exact post text, name tags, Commons/profile photos with credits, study page recordings and chart crops; 6 builders → 45 kinds; shots in shots_ep3.py. yt-dlp section downloads hang/403 → download full video and trim.

EP4 "Weird Computer Science Concepts" (five living computers, 9:25) in VIDEO-TOOL/bitbybit/ep04, 2026-11-16. User asked: keep the animation, cut it like a documentary (introduce real people), "little good colour, no AI slop colour". Done with: PX.D calm palette + PX.BLOOM 0.2 in px.js (old PX.C names remapped), opts.filter per-shot grade, lib chap()/place()/refrain()/portrait(), shots_ep4.py helpers CHAP/PERSON/REF/FV (framed real clip over dimmed scene)/PO (photo over dimmed scene). Research subagent wrote RESEARCH.md (verified names, licences, clip timestamps). EP3 outro replaced by a cabinet end card (old outro/logo are neon). tools/framegrab.cjs grabs composited part frames without rendering; tools/cuecheck.py lists missing/far word cues. Gotchas: run pxsheet/renders from PowerShell (Git Bash can't launch Edge now); Python 3.13 by full path (PATH has 3.12 first, no PIL); backdrop scenes need their beats pushed to 99 or labels fire early in short shots.

EP5 "Creepy Computer Science Concepts" (recommendation systems, 9:23) in VIDEO-TOOL/bitbybit/ep05, 2026-11-16: same EP4 pipeline (documentary cut, PX.D, chapter cards "PIECE No. N"), colder night mood, recurring amber YOU dot across all scene files, RX() receipts with amber highlight (paper pages, leaderboard, CNET), AT&T/WSJ clips framed with credits. Brief now requires every beat option to accept -5 and 99 (EP4 crash). A render failed once with a transient ENOENT in hf-render temp; a plain retry worked. User asks for SEO packs with "no source" list: keep only credits.

**Why:** user asked for "high quality, take time", sfx from Pixabay.
**How to apply:** for EP2 copy ep01 (engine, scenes, lib, tools), new words.json + SHOTS; never put numbers on screen that the script doesn't state (placeholder data slipped into builder defaults once). Related: [[video-toolchain]].
