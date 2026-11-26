---
name: calc1-full-project
description: "Calculus 1 FULL COURSE video (4h16m voiceover, started 2026-11-24) in VIDEO-TOOL\calc1-full; pilot-first, waves of builders, status file"
metadata:
  type: project
---

User asked 2026-11-24 for a "full course on Calculus 1" from a 15,398 s (4:16:38) voiceover, "very high quality, high quality explaining visuals, enhance quality of animation". Folder VIDEO-TOOL\calc1-full, copied from calc1-ep02 (same chalkboard pipeline: shots.py + shotlist/cNN.py, manim/common.py Shot clock, build_reel.py, assemble.py -> done/calculus1-full-course.mp4). shots.sec() now accepts h:mm:ss.ss. No pasted script: words.json from Whisper small only, maths may be misheard.

Plan (advisor-reviewed): fix copied constants first; cut sections from the script's own chapter phrases into sections.json; upgrade animation quality in common.py + BUILDERS.md + one exemplar scene; (user 2026-11-24: NO pilot, no approval stops, build all and deliver); then waves of ~5 builders (--jobs 1, foreground renders, short handback); render 1080p per wave; keep work/STATUS.md current (compaction-proof); per-section contact sheets + grep logs for "!!". Reuse scene code from calc1-ep01/ep02 and calc for overlapping topics. Expect ~8-9 h of 1080p rendering total.

**Why:** the job is ~11x Episode 2; a look nobody approved must not be multiplied across ~70 builders. **How to apply:** read work/STATUS.md first when resuming. Related: [[calc1-series]], [[calc-project]], [[trig-course-project]].

**DELIVERED 2026-11-25:** done\calculus1-full-course.mp4 (4:16:38, 1080p30, -14.0 LUFS, 3.5 GB). 40 sections / 656 shots, built by parallel builders using the calculus kit in common.py (live_tangent, riemann, steps, note, focus). SEO in calc1-full\YOUTUBE-SEO.txt. Gotchas: an empty cached SVG in manim/media/.../texts causes "ParseError: no element found", so delete zero-size SVGs; the assemble WAV goes over 4 GB at this length (warning only, audio checked OK to the end); check render_done.txt after killing a queue.
