---
name: trig-course-project
description: "55-min trigonometry course (VIDEO-TOOL\\edu): user's chalkboard theme, Manim + handwritten LaTeX, HyperFrames reel for images/memes/cards, FFmpeg assembly, Enter-click rule"
metadata:
  node_type: memory
  type: project
  originSessionId: 79d691c1-3d53-4d12-9479-3db62010b023
  modified: 2026-11-08T19:21:57.688Z
---

Started 2026-11-09 from the user's voiceover "[excited] Welcome, e.mp3" (54:40, 15 chapters). Project folder edu/.

User's choices: Manim + LaTeX, images and meme GIFs, a little HyperFrames 2D animation, NO background music, and the only sound effect is a keyboard Enter click whenever an image or meme appears. Theme set by the user's reference images: their own dark chalkboard image (assets/img/chalkboard.jpg), chalk-handwritten text everywhere (Kalam), coloured rounded "pill" headers, yellow brush underline under the title, LaTeX in handwritten glyphs (XeLaTeX + mathspec: Kalam letters, Segoe Print Greek; template HANDTEX in manim/common.py).

Build: shotlist/cNN.py per chapter range (built by parallel fork builders following BUILDERS.md) → shots.py; tools/render_manim.py renders Manim; tools/build_reel.py writes index.html holding only the image/meme/card shots back to back (a 55-min HyperFrames timeline would take ~100 min to render); tools/assemble.py cuts reel + Manim clips frame-exact and mixes voice + clicks at -14 LUFS → done/trigonometry-full-course.mp4. tools/img.py and tools/meme.py fetch media with credits.

**Why:** the user wants a finished file fast, then gives feedback. **How to apply:** for changes edit the chapter's shotlist/sNN file, re-render that shot, rerun build_reel/assemble. Related: [[video-toolchain]], [[schrodinger-project]].
