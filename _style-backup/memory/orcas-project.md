---
name: orcas-project
description: "Unseen Kingdom \"Why Orcas Never Hunt Alone\" (15:04): orca photo cut-outs animated in orca.js (split-level wave-wash, pod, carousel, beach, sepia Eden, Luna), real research footage"
metadata:
  node_type: memory
  type: project
  originSessionId: b15489ea-08eb-46fc-8ef6-5bb1e88695fa
  modified: 2026-11-09T22:35:36.126Z
---

Started 2026-11-10 in VIDEO-TOOL/orcas; delivered done/why-orcas-never-hunt-alone.mp4 (15:04, -14 LUFS) plus description file on 2026-11-10. Waiting for user feedback. Voice "A seal is lying on a.mp3" (904 s, says "Unseen Kingdom"). User asked for "your best", more and higher-quality animation.

How it is built: orca cut-outs from Commons aquarium side-view photos (orca_a/b/c) — the background remover punches holes in the white patches, so cut with SOLID=1 (fill) and SAT=0.3 (removes the tank-blue cast). assets/js/orca.js holds the scenes: split (half above / half below the surface: floe, seal, five fins abreast with tall drawn dorsal fins, dive, travelling wave, seal falls in), pod (family, leader glow, call rings), share (salmon torn in half), carousel (herring ball, bubbles, tail-slap shockwave), graycalf, bluewhale (role labels), beach (high view of the shoreline), eden (sepia old-film look), luna. Shot list lives in shots.py, executed by build.py. Graphics in scenes_orca.py (family tree, bars, lifespan, ecotype cards, group-size chart) plus scenes_pred.py (world_pins, size_compare).

world_pins zoom must be a CSS transform on an HTML wrapper; GSAP scale on the SVG group rendered an empty map (this bug reached the delivered predators film at 7:02 and was re-rendered on 2026-11-10).

Footage to avoid: Russell Baker carousel clips (watermark across frame), NatureFootage (centre watermark). Related: [[predators-project]], [[spermorca-project]].
