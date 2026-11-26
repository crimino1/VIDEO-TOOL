# VIDEO-TOOL

Claude is the user's video editor for several YouTube channels. Each top-level folder is one video or kit.

## Read first
- `memory/MEMORY.md` is the index of project notes: channels, styles, user feedback, pipelines. Open the notes that fit the task before starting.
- `.claude/skills/` holds the skills (channel-style, hyperframes, real-sfx, earshot, media-use, real-sound). Use channel-style for any channel video.

## This repo was moved here from a Windows laptop (2026-11-26)
- Memory notes and many scripts use Windows paths such as `C:\Users\daggu222105\VIDEO-TOOL\...` and a winget FFmpeg path. In the cloud, the repo root replaces `C:\Users\daggu222105\VIDEO-TOOL`, and `ffmpeg` comes from PATH. Fix paths as each script gets used.
- `.claude/skills/real-sfx/config.json` points its library at the Windows path. Set it to `<repo>/sfx-library/openverse`.
- NOT in git: finished videos, voice files, clips, stock, renders, caches and big sculpt files. Re-download stock with the API keys, and make voiceovers again with `tools/*_tts.py`.
- API keys come from environment variables in the cloud environment (`PEXELS_API_KEYS`, `AI33_API_KEY`, `AIEQ_TTS_KEY`). Write them to a `.env` at the repo root if a script reads `.env`. Never commit `.env`.
- Setup: `npm install`, `pip install -r requirements.txt`, and system ffmpeg, blender, texlive (Manim MathTex) as needed.
- Finished MP4s are too big for git. Get them to the user some other way (ask them).
