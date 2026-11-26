---
name: video-toolchain
description: "Where the video editing tools live on this Windows machine and how to call them (FFmpeg full path, .venv, local npm, Manim, MiKTeX)"
metadata:
  node_type: memory
  type: reference
  originSessionId: b15489ea-08eb-46fc-8ef6-5bb1e88695fa
  modified: 2026-11-06T21:13:39.686Z
---

Claude acts as the user's video editor in C:\Users\daggu222105\VIDEO-TOOL (folders: raw, references, done).

- FFmpeg (winget Gyan.FFmpeg, full build with libass): C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe. The folder name holds the version, so a winget upgrade changes this path; C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe follows upgrades.
- Python packages: .venv here (Python 3.13). faster-whisper, yt-dlp and Manim Community 0.22 run from .venv\Scripts. A separate older yt-dlp sits in the global Python313 and comes first on PATH, so call the .venv one by path.
- Manim: needs the FFmpeg bin folder on PATH. MiKTeX is installed, so MathTex works. schrodinger/tools/render_manim.py renders shots in parallel (16 cores; 12 jobs is fine) and schrodinger/manim/common.py clocks scenes to voiceover timestamps; reuse both for the next Manim video.
- Captions flow: transcribe.py writes word timings to src/speech.words.json, audio goes in public/, and the Captions composition in src/index.jsx reads both. Remotion Studio runs on port 3001 because LOR-TOOLS holds 3000.
- Stock footage: Pexels API keys are in C:\Users\daggu222105\VIDEO-TOOL\.env as PEXELS_API_KEYS (comma separated). Read them from there, never print them. Send as the Authorization header to https://api.pexels.com/videos/search (photos: /v1/search) with a User-Agent set.
- yt-dlp needs `--js-runtimes node` and `--ffmpeg-location <ffmpeg bin dir>` for YouTube.
- Remotion and HyperFrames are local npm packages here: `npx remotion`, `npx hyperframes`.
- HyperFrames renders run one at a time per user account (render.lock). A render in another project makes new ones wait; never kill it, it may be the user's work.
- HyperFrames `render --start/--end` fails with PLAN_TOO_LARGE when the film has lots of video. To fix one shot, render it from a copy with video and audio stripped, then overlay it with FFmpeg at frame ceil(start*30); the first patch frame can be black, so check. schrodinger/tools/patch_final.py does this.
- The final HyperFrames mix came out about 3 dB under the voiceover's own loudness on the Schrödinger film: measure with ebur128 after rendering and correct to -14 LUFS.
- HDR sources (HLG/PQ, e.g. 4K YouTube AV1) push HyperFrames into "HDR layered composite" mode: about 2 fps plus Main10 output that breaks concat with SDR parts. Tone-map them to bt709 when trimming (trench/lib.py trim). ffprobe `csv=p=0` prints `arib-std-b67,` with a trailing comma, so split on the comma before comparing. Check every clip's color_transfer before rendering.
- Before the final render, make a contact sheet of every clip used (two frames each, from the parts' assets/clips list) and look for logos, burned-in subtitles and labels. On the trench film this caught 14 of them that slipped past the crops.
- Never leave a render_parts.sh loop alive when restarting: TaskStop of the shell may not end the loop, and two loops swapping index.html give parts rendered from the wrong page. Check p*.log staticDuration matches each part's length.
- HyperFrames renders write every frame to TEMP first: a 170 s part needs roughly 20 GB free on C:. On 2026-11-17 a render failed with ENOSPC at about 10 GB free; the fix was splitting the part in two (build.py PARTS plus the join list in render_parts.sh), with nothing deleted.
