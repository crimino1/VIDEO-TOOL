---
name: age-faster-project
description: "Senior channel video 'Stop doing these, they age faster' (VIDEO-TOOL\\age-faster): stock + motion graphics + 2D animation, ebook promo, how it is built"
metadata:
  node_type: memory
  type: project
  originSessionId: b354c296-90c4-4934-b758-f14141f567d7
  modified: 2026-11-07T19:12:52.748Z
---

Second senior-channel video, started 2026-11-08. Script written by Claude (7 habits, ebook promo right after the hook), voiced by the user in ElevenLabs v3 with emotion tags; voice file is assets/vo.mp3 (318.7s).

User's choices: no Blender; stock from Pinterest/YouTube/internet; 60-70% stock video and photos, the rest motion graphics and "high quality to realistic" 2D animation; make it engaging.

Build: `..\.venv\Scripts\python.exe build.py` writes index.html from shot lists (style.css, pose.js for the 2D figures). Stock tools: tools/pexels.py (search/photos/get, sheets in stock/), Pinterest tools copied from the shark film. The demo recording's browser tabs show the user's Gmail address, so demo clips are cropped to 1668x750 at (72,160) — keep that crop for any new shop recording.

Delivered target: done\age-faster-final.mp4 (render.log). SOURCES.txt lists every clip; one Pinterest clip is unlicensed.

**Why:** the user prefers fast delivery of a finished file, then gives feedback.
**How to apply:** for changes, edit build.py times/scenes, rebuild, snapshot the changed seconds, re-render. Related: [[senior-fitness-project]], [[video-toolchain]].
