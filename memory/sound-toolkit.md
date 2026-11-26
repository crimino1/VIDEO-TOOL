---
name: sound-toolkit
description: "2026-11-23 sound tools for every channel - Openverse CC0 library, real-sfx placement skill, earshot sound maker (light install)"
metadata:
  node_type: memory
  type: reference
  originSessionId: 10b135ce-c154-4b5f-a545-46f4c14e33de
  modified: 2026-11-23T07:15:15.007Z
---

The user asked (2026-11-23) for three GitHub tools so every video gets the best sound: "Openverse finds sounds, Real SFX places them, Earshot hears + makes". They chose the **light install**.

- **earshot** (github.com/Leonxlnx/earshot, MIT): installed into `VIDEO-TOOL/.venv` (`.venv/Scripts/earshot.exe make "a soft whoosh" -o x.wav`), base package only. The listening extra (torch plus models, about 4 GB) is **not** installed, so it can't describe sounds. Skills copied to `~/.claude/skills/earshot` and `real-sound`. Its plugin and MCP server are not installed.
- **real-sfx** (Clipwing/skills, no license file on GitHub): `~/.claude/skills/real-sfx`. Run its scripts from that folder with `PYTHONUTF8=1` and the venv Python. `setup.py check` passes (ffmpeg, Node, uisfx). It needs a library registered with `setup.py add-library openverse <path> --tier main --index`.
- **Openverse:** there is no separate tool. `VIDEO-TOOL/tools/build_sfx_library.py` downloads CC0 and public-domain Freesound files into `VIDEO-TOOL/sfx-library/openverse/<category>/` with `catalog.json` (creator, license, source). The anonymous API rate-limits hard (429), and the script backs off.
- Downloaded third-party code was reviewed first: standard dependencies, no exfiltration; network use is only optional Hugging Face model downloads.
- Every channel guide's Sound section and channel-style SKILL.md ("Sound toolkit") now point to these tools; each channel's own music rules still decide. Related: [[ai-equator-white-style]], [[video-toolchain]]
