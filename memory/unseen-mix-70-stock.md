---
name: unseen-mix-70-stock
description: User feedback 2026-11-15: Unseen By Eye films had too much animation; now only 20-30% animation (where detail is needed), about 70% high-quality stock, photos and researched footage
metadata:
  type: feedback
---

On 2026-11-15 the user said: "animation to much .. animation should 20-30 .. where need to give detail .. when have no specific stocks... remaining 70 percentage, stocks, images, research things more .. high quality ... dont use bad".

**Why:** the full flat-cartoon films (sharkorca 69%, orcakill 70%) felt like too much animation.

**How to apply:**
- Plan animation only for ideas footage can't show: diagrams, maps, odds, timelines, documents, a cutaway. Keep it to about 20-30% and measure the share before rendering.
- Fill the rest with high-quality footage, in this order:
  - Pexels 1080p (`tools/pexels.py`, key in .env)
  - YouTube excerpts of the real animals and places, credited on screen
  - Wikimedia Commons research photos, such as historic expedition photos
- Scan every clip with high-contrast corner crops. This catches handles like "@richardsidey" and burned-in subtitles in the SEA LIFE clips.
- YouTube search: the nexlev search tool has a 50-calls-per-week limit, so use yt-dlp "ytsearch8:query" with --flat-playlist instead.

First film made this way: VIDEO-TOOL/penguins ("Why Are So Many Penguins Gay?"). Related: [[unseen-no-captions]], [[sharkorca-project]], [[orcakill-project]].
