# Hero poses to generate (vidIQ image generate, after credits renew 2026-11-27)

Reference: `src/photos/hero_kneel.jpg` (Pexels 6263503, rois martin) — sent downscaled as a data URI.
Same man in every image. Plain pure white background (cut out afterwards with `npx hyperframes remove-background`).
Cost: at most 22 credits per image → 6 images ≤ 132 of 150 credits.

Character line used in every prompt:
"the same man from the reference photo: black hooded winter parka, black beanie, black neck gaiter over nose and mouth, red gloves, dark grey trousers, black winter boots"

| file | pose prompt |
|---|---|
| hero_walk.png | walking to the left, seen exactly from the side, mid-stride, full body |
| hero_back.png | walking backwards to the left, seen from the side, sweeping the ground behind him with a pine branch held low in both hands |
| hero_kneel.png | kneeling on one knee, seen from the side, digging into snow in front of him with both gloved hands, leaning forward |
| hero_poke.png | kneeling on one knee, seen from the side, pushing a long thin wooden stick straight up above his head with both hands |
| hero_sit.png | sitting on the ground, knees up, arms around his knees, seen three-quarters from the front, tired |
| hero_lie.png | lying flat on his back asleep, seen exactly from the side, head to the left, hands on his chest |

Then: copy the cut-outs into `hf/assets/chars/`, set `P` in world.js (`walk/back/kneel/poke/sit/lie`), re-render, run `tools/sfx_cues.py render/picture.mp4` and the real-sfx mix.
