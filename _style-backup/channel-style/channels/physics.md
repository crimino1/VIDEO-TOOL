# Physics channel editing style ("Glow & Doodle")

Mark every fact: `[measured]`, `[seen 3:20]`, `[user]` or `[unknown: what would settle it]`.
Channel name `[unknown: ask user]`. Style is a deliberate MIX of two references `[user]`.

## Summary
Physics explainers for curious non-experts. A story-driven deep dive (history, a mystery, a payoff) shown with glowing gold/cyan diagrams on a deep navy stage, interrupted every few seconds by big white kinetic keywords, hand-drawn arrows, emoji and a joke. Serious visuals, casual voice: "a beautiful lab with a funny friend narrating".

## References
| Video | File | What we take from it | Length |
|---|---|---|---|
| Nobody Explained Maxwell's Equations Like THIS! | Downloads/vidssave.com Nobody Explained Maxwell's Equations Like THIS! 360P.mp4 | Navy stage, glowing 3D diagrams, colour-coded equations, portrait name cards, small caps section labels, mystery-story structure, promise-heavy hook `[seen]` | 19:26 `[measured]` |
| ALL OF PHYSICS explained in 14 Minutes | Downloads/vidssave.com ALL OF PHYSICS explained in 14 Minutes 1080P.mp4 | Big white keyword captions, emoji, hand-drawn arrows + labels, jokes, fast cutting, meme/photo inserts, "wait, what?" interruptions `[seen]` | 14:19 `[measured]` |

Measured differences: Maxwell 8 shots, median 24s, ~0.1 cuts/min after 5m, -19.3 LUFS, ~176 wpm. All Physics 183 shots, median 1.5s, 64 cuts/min first 30s then 8-16/min, -13.7 LUFS, ~223 wpm `[measured]`.

## Pacing (the mix)
- Visual beat (cut, new keyword, new object, camera move) every 2-4s in the body; never hold a frame with nothing changing longer than 6s. Between Maxwell (24s) and All Physics (1.5s) medians.
- Hook first 30s: one beat per ~1s (All Physics energy). 30s-2m: every 2s. Body: every 3s. Big "payoff" diagrams may run 8-15s as one slow camera move with labels arriving on it (Maxwell way).
- Keyword captions change on narration phrases, 1-4 words at a time.
- Voice ~190 wpm: faster than Maxwell, slower than All Physics so the visuals can be read.

## Hook (first 30-60 seconds)
1. 0-5s: a funny, concrete everyday line on pure black with one emoji/object (All Physics "hi, you're on a rock").
2. 5-20s: "wait... why?" interruption, the mystery stated as a question.
3. 20-50s: the promise list in Maxwell style: "There's a ... There's a ... And right at the centre..." each item gets one glowing icon.
4. "By the end of this video you'll ..." promise, then the title card.

## Video structure
Hook -> title card -> 4-6 chapters, each opened by a small caps section label -> one "THE BIG IDEA" payoff diagram -> callback joke to the hook -> one-line CTA. 8-12 min.
Each chapter: everyday picture -> question -> history character (portrait name card) -> glowing diagram -> one equation built term by term -> joke beat.

## Visual sources
- 60% original motion graphics on navy: glowing lines, particles, waves, fields, clocks, light beams (HyperFrames/Manim).
- 15% equations (MathTex), colour-coded.
- 15% kinetic keywords on pure black with emoji/doodles.
- 10% public-domain portraits and photos (Wikimedia Commons), Pexels stock for everyday moments. Memes only public-domain or self-made; no copyrighted movie stills (All Physics used Toy Story — don't).

## Shots and camera
- Diagram scenes: slow push-in or orbit, 3-5% scale over the shot, ease in-out.
- Keyword cards: static, text pops.
- Photo inserts: small framed rectangle (~40% width) on black, slight 1.03 zoom.

## Transitions
- Default: hard cut.
- Navy diagram <-> black keyword card: hard cut (the contrast IS the rhythm).
- Chapter change: 0.4s fade through black + section label.
- "WAIT" beat: freeze + 3-frame white flash + record-scratch SFX. Use 2-4 times per video max. Channel signature.

## Colour and texture
- Stage A (diagrams): deep navy radial gradient, centre #0E1A2B -> edge #05080F, soft floor grid optional.
- Stage B (keywords/jokes): pure #000000.
- Physics colour code, same in every video: GOLD #FFC23D = energy, light, E-field, "the hero". CYAN #3FD8FF = fields, B-field, space/time. CORAL #FF5A6E = problem, contradiction, warning. WHITE #F2F2F2 = labels, doodles.
- Glow: gold/cyan objects get a 12-20px outer glow. No grain.

## Text on screen
- Keyword captions: Inter Medium, 84px, #F2F2F2, centred, no outline, 1-4 words, pop in 0.12s (scale 0.92->1), cut out. Emphasis word in ALL CAPS or gold.
- Section labels: Inter Bold, 22px, letter-spacing 0.12em, ALL CAPS, top centre (y=60), gold or cyan, coral for problems. Subline in white 26px under it optional. Fade 0.3s.
- Equations: LaTeX (Computer Modern), white with variables in their colour code; build term by term, underline the term being explained in coral.
- Portrait name card: framed photo + name Inter SemiBold 30px + years 18px grey, lower-left or beside portrait, slide in 0.3s.
- Doodle labels: handwritten-style font (Caveat or "Kalam") 44px white with hand-drawn curved arrow, arrow draws on in 0.25s.

## Graphics
Glowing vector diagrams, arrows as particles, waves made of little arrows, clocks, rulers, light beams. Emoji (Noto) used as characters: a stick person or emoji as the "viewer". Hand-drawn arrows over glowing diagrams = the mix's signature.

## Sound
- Loudness: -14 LUFS integrated.
- Voice: friendly, curious, a little cheeky, ~190 wpm `[user to confirm: own voice or AI]`.
- Music: `[unknown: user to choose]` suggested soft ambient synth pad under diagrams, music drops out for jokes.
- SFX: soft pop on each keyword, whoosh on chapter change, record scratch on WAIT beats, light "ding" on the payoff equation.
- Silence: 0.5-1s before the big payoff line.

## Do and don't
- Do: every abstract sentence gets a picture; every 30s gets a laugh or a "wait"; keep the colour code fixed.
- Do: tell it as a mystery with real people.
- Don't: copy either reference's exact wording, title format or clips. Don't use copyrighted meme stills.
- Don't: hold an equation on screen with nothing moving.

## Build notes
HyperFrames for kinetic text + composites, Manim (reuse schrodinger/tools/render_manim.py and schrodinger/manim/common.py) for diagrams/equations. 1920x1080, 30 fps.

## Rules from feedback
- 2026-11-09: mix both references into one unique look `[user]`

## STYLE v2 (2026-11-15) — replaces the colour and diagram rules above `[user]`
Third reference: "Gravitation – 3D Animated, Class 11 Full Chapter" (Downloads, 9:57, one continuous 3D camera, -19.4 LUFS `[measured]`). User: "see how detail visual, explain in 2-3D, add this style in ours, fix AI slop colour style you are using; keep previous style for images and a little more formula".
- Diagrams are REAL 3D objects with real materials and studio light (copper coil, painted magnet, meter, textured Earth/Sun), not glowing outlines. Engine: VIDEO-TOOL/maxwell3d/assets/js/lab3d.js (Three.js r160, PMREM softbox env, shadows, ACES). Planet textures: space/ep1/assets/tex.
- BANNED (the "AI slop colour"): neon gold/cyan/coral glow, navy radial gradient, glow halos, rainbow accents, bouncy pops, emoji as main visuals.
- Palette: background #0b0c10 (space scenes: black + stars), text off-white #f1efe9, panels rgba(14,18,26,.86) with 1.5px #4c6a8c border, topic tag steel blue #24405f top-left, field/orbit lines thin pale blue #8db8e8 at 50%, ONE accent amber #e2a84b only for the final formula box or one key word. Object colours come from the real material.
- Motion arrows: rows of chevrons (>>>>) moving along the wire / force direction `[seen gravitation 3:30]`.
- Formulas: built step by step in a bordered panel, plain bold sans with stacked fractions, each symbol explained underneath (M = mass of Earth...) `[seen 8:30]`. Slightly more formula than v1: school form first (EMF = −N ΔΦ/Δt), Maxwell form second.
- Kept from v1: portrait cards and full-screen Pexels photos (now with a calm panel caption, no gold glow), Inter type, story structure, SFX, -14 LUFS.

## STYLE v2.1 (2026-11-15) — documentary treatment `[user]`
User: "I love 3D. I make documentary-type videos; the Gravitation reference is a class 12 education channel — I do NOT want its text style or text popups, only its 2-3D animation. Everything should feel like a documentary explaining a big problem."
- Take from the Gravitation reference ONLY the 3D animation. No topic tag strip, no notes/bullet panels, no boxed legends, no popup text.
- Text is rare and quiet: one EB Garamond serif line (66px, lower-left, 0.9s fade) for a key statement; small letter-spaced caps (Inter 500, 24-30px, .2em, thin rule above) for a state caption, one at a time; thin leader-line labels pinned to 3D objects (LAB_PINS in lab3d.js). All fades, no pops.
- Formula: at most one per idea, EB Garamond italic ~92px centred low, no box, one plain-words line under it.
- Cinematic: slow orbiting camera, soft vignette, real photos full-screen with bottom fade + small caps caption.
