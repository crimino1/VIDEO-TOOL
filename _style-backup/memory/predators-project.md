---
name: predators-project
description: "Unseen Kingdom \"Every Deep Sea Predator Explained In 9 Minutes\" (9:13): animals animated from real Commons photo cut-outs (deep.js/sc.js), research footage, IPv4 fix for downloads"
metadata:
  node_type: memory
  type: project
  originSessionId: b15489ea-08eb-46fc-8ef6-5bb1e88695fa
  modified: 2026-11-09T20:01:14.323Z
---

Started 2026-11-10 in VIDEO-TOOL/predators; delivered done/deep-sea-predators.mp4 (9:13, -14 LUFS) plus done/deep-sea-predators-description.txt on 2026-11-10. Waiting for user feedback. Voice "[intrigued] Down the.mp3", says "Unseen Kingdom" (main channel, nothing cut).

User's ask: very high quality animation using good animal stock photos from the internet, "one of the best videos". Built as: real Wikimedia Commons photos per species (tools/find_photos.py contact sheets, tools/get_photos.py at standard 1920 px sizes), cut out with tools/cut.py (HyperFrames remove-background, or --white/--black threshold modes for specimens on plain pages; OPEN=0 keeps thin parts like the harp sponge). assets/js/deep.js = rig (depth-of-field snow, bokeh, bioluminescence, ROV torch, rim light, strip-warp swimming, schools, shrimp); assets/js/sc.js = per-predator scenes (lure strike, red beam, ultra-black, swallow, slingshot jaw, gulper, ice, e-jelly, clicks, tunicate, harp). Footage from NOAA, MBARI, Nautilus, Okeanos, Minderoo-UWA (crops drop logos).

Network quirk: yt-dlp and Python urllib hang ~20 s per request over IPv6 here; use --force-ipv4 and an ipv4-only getaddrinfo patch. Wikimedia rate-limits originals and odd thumbnail widths (429/400): ask the API for 1920/1280/960 renditions and pause between requests.

**Why:** user wants realistic animation and fast finished films. **How to apply:** reuse deep.js/sc.js and the cut-outs for any deep-sea or fish film. Related: [[trench-project]], [[spermorca-project]], [[video-toolchain]].
