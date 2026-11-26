---
name: senior-fitness-project
description: "Senior fitness video in VIDEO-TOOL\\senior-fitness: decisions made, how the 3D exercise animation is built and rendered"
metadata:
  node_type: memory
  type: project
  originSessionId: b15489ea-08eb-46fc-8ef6-5bb1e88695fa
  modified: 2026-11-05T22:41:26.006Z
---

Senior fitness video with Senior Fit Shop ebook promo, started 2026-11-05. Project: C:\Users\daggu222105\VIDEO-TOOL\senior-fitness (HyperFrames). No channel-style guide existed, so the user approved a "simple senior style": calm pacing, large text, exercise name and reps on screen, soft music, -15 LUFS; turn it into a guide after they approve the video.

User's choices: 3D character (not AI video), senior woman; "demonetized" line stays because they say it is true; crop the ebook demo and keep its Quantity 2 / $30. Stock is Pexels only (about 30%), because YouTube/Pinterest rights are unclear.

3D: Blender 5.2 + MPFB (MakeHuman, CC0 assets) in senior-fitness\blender. build_character.py makes character.blend; exercises.py holds the 8 movements as pure functions of time; render_all.py renders frames to frames\<name> and skips existing ones, so it can resume. build_clips.py then builds assets\anim from frames, build_edit.py writes index.html.

Delivered done\senior-fitness-final.mp4 on 2026-11-06 (7:13, -15.5 LUFS). Style guide saved at ~/.claude/skills/channel-style/channels/senior-fitness.md; the channel's real name is still unknown, so rename it when the user gives it.

**Why:** HyperFrames music/video generation needs a Pro plan (refused on Free), so music came from vidIQ (25 credits).
**How to apply:** after render finishes run `build_clips.py anim all`, then `build_edit.py`, check, preview, and wait for approval before the delivery render to done\. The user asked for the finished file, so render after the preview opens. Send render output to senior-fitness\final_render.log and write done\senior-fitness-final.mp4, because the progress page (progress.py, localhost:3010) reads those. Related: [[video-toolchain]].
