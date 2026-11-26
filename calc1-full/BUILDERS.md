# Builder brief: "Calculus 1, the full course" (4:16:38)

Project: C:\Users\daggu222105\VIDEO-TOOL\calc1-full. One long lesson covering all of Calculus 1 (university / AP Calculus AB), on the user's chalkboard theme. It must look like Episodes 1 and 2 of the series, only better animated. Voice: assets/vo.mp3. Word timings: words.json (`{"words":[{"word","start","end"}]}`, seconds). Readable lines with timestamps: script.txt. Your section: work/sections.json gives your range and topic.

The transcript is Whisper only, with no human script, so maths words can be misheard ("He.", "Sin.", "whole" for hole, "x squared" heard as "excess squared"...). Work out the real maths from context; never put a misheard word on screen.

## Read first
1. manim/common.py, fully. It has the Shot clock (self.at / self.go / self.title / self.wipe), M() handwritten LaTeX, H() chalk text, pill(), panel(), and colours. At the bottom is the CALCULUS KIT, and you must use it instead of hand-rolling:
   - axes(x_range, y_range, ...) + ax.labels
   - curve(ax, f, x_range)
   - hole(ax, x, y), pt(ax, x, y)
   - tangent(ax, f, x) and live_tangent(ax, f, ValueTracker), which gives a sliding tangent with a live "slope = 1.8" readout (set readout_pos clear of the curve)
   - secant(ax, f, x, h), rise_run(...)
   - area(ax, f, a, b), riemann(ax, f, a, b, n)
   - number_line(...)
   - steps(rows...), which aligns algebra on "="
   - answer_box(m)
   - note("text", target, direction), a curved chalk arrow annotation
   - draw(mob), a chalk-tip draw-on for curves and drawings
   - focus(self, *keep) / unfocus(self), which dims the rest of the board
2. One approved scene each from the series, for style: ..\calc1-ep02\manim\s05_factoring.py (worked algebra), ..\calc1-ep02\manim\s03_one_sided.py (graphs), ..\calc\manim\s02_derivative.py (derivative intuition), ..\calc\manim\s03_integral.py (area/integral).
3. If your topic was already taught in the series (functions: ..\calc1-ep01\manim\, limits: ..\calc1-ep02\manim\, derivative/integral intuition: ..\calc\manim\), ADAPT that code to your new timings rather than inventing a weaker version.

## The user's quality bar (most important)
In the user's words: "very high quality, high quality explaining visuals, enhance quality of animation". In earlier videos they asked for "looks human-made, NOT AI slop, NOT AI-slop animation effects. Simple, good, understandable". The audience is beginners.

**Better animation means real explanatory motion, not decoration.** For every idea, ask what is moving in the maths and animate THAT:
- A tangent sliding along a curve with its slope readout changing.
- A secant turning into the tangent as h shrinks (ValueTracker h → 0).
- Riemann rectangles multiplying (n = 4 → 8 → 32) and turning into the shaded area.
- A point travelling along a graph toward a hole from both sides.
- A function's input sliding on a number line while the output moves.
- Algebra lines transforming one into the next (TransformMatchingTex), with cancelled factors struck in RED and the final answer boxed in GRN.
- focus() to dim everything except the line being spoken.
- note() arrows like a teacher's chalk annotation.

**Board rules:**
- One idea on the board at a time.
- Clear the board (self.wipe) between ideas.
- At most about 3 things on screen.
- Big and readable, with generous margins.

**Allowed motion:**
- Create / draw()
- Write
- FadeIn / FadeOut (small shift)
- Transform / ReplacementTransform / TransformMatchingTex
- MoveAlongPath and ValueTracker updaters
- Circumscribe or an underline for emphasis
- Run times 0.5–1.2 s with the default ease. Real motion with a tracker may run 2–4 s.

**BANNED:**
- Flash
- Spinning or rotating text
- Bouncing or elastic motion
- Wiggle
- Rainbow colours, glow, particles, sparkles
- Random camera zooms
- Emoji, memes, decorative clutter
- Text typing itself letter by letter
- Captions that just repeat the voice word for word

**Drawings, timing, labels:**
- Draw real, simple line drawings in chalk where the voice uses an example (a car, a ball thrown up, a balloon inflating, a ladder sliding, a water tank, a box with the corners cut out). Clean geometry, not clip-art.
- Everything appears ON the word that names it (exact times from words.json).
- Never sit fully static for more than about 6 s: add the next small piece, an underline, or a move.
- Short labels, not sentences. Use concrete numbers with units.

**Colour meaning (keep it consistent):**
- YEL = highlight / key word
- BLUE = function / graph
- PINK = derivative / slope / tangent / rate
- GRN = integral / area / total / correct answer
- ORG = example numbers / points
- RED = cancel / wrong / undefined
- DIM = secondary labels

**Layout:**
- Headings via self.title("..."), short (2–5 words).
- Content below y = 2.45, inside x = ±6.8, and y >= -3.8.
- Maths size >= 48, labels >= 34.
- Graphs: never draw through asymptotes or holes (split the domain).

**Kalam glyph rule:** Kalam (the text font) has NO θ, →, ×, ², ∫, Δ, π, Greek or maths glyphs. Put any maths or symbol in M() or TX(), never in H()/T()/pill().

## Your files only (NN = your two-digit number, class prefix KNN_)
- shotlist/cNN.py: `S = [("h:mm:ss.ss", kind, "KNN_Name", {...}), ...]`.
  - Times are strings like "0:51.28" (under an hour) or "1:23:45.60" (over an hour); seconds as a float also work.
  - The first row starts EXACTLY at your range start. Your range ends where the next builder begins (automatic).
- manim/sNN_<topic>.py: `from common import *`, with classes `class KNN_Name(Shot): def body(self): ...` that use self.at("1:23:45.60") / self.go / self.title / self.wipe.
  - Each Manim shot should be <= ~45 s. Split long stretches at natural sentence breaks.
- Images: `..\.venv\Scripts\python.exe -I tools/img.py search pexels "query"` (or `commons`). READ the contact-sheet jpg it prints, then run `tools/img.py get kNN_name pexels:<id>`. Use them rarely, only when the voice names a real thing (Newton, Leibniz, a speedometer, a real bridge).
- Never edit common.py, shots.py, tools/*, sections.json, or another builder's files. If the kit lacks something, write a small local helper in your own file.

## Shot kinds
- "m": Manim. This is the bulk, about 90%.
- "p": real photos pinned on the board. An Enter-key click plays automatically on each image time.
  - Options: dict(imgs=[(img, "h:mm:ss.ss"), ...], title="...", caps=[("text", "h:mm:ss.ss")]).
  - 1–3 images, 3–8 s. Clean real photos only: no AI look, no watermarks.
- "c": chapter / part card (2D chalk card), at each new chapter or unit the voice announces.
  - Options: dict(label="Unit 3", title="The Chain Rule", doodle="triangle"|"circle"|"wave"|"star"). 2.5–4 s.
- "q": practice card, at "practice"/"try this"/"pause" moments.
  - dict() gives the plain "Practice Time!" card; dict(title="Quick Check", sub="Pause and try") gives a custom one. 1.5–3 s.
- "s": subscribe card. Only if the voice asks to subscribe: dict(line="..."). Up to ~8 s.

## Check before you report. Run everything in the FOREGROUND, never run_in_background, and never end your turn waiting.
1. `..\.venv\Scripts\python.exe shots.py` passes.
2. `..\.venv\Scripts\python.exe tools/render_manim.py --low --jobs 1 <your class names>` gives all ok, with no "!!" late/over lines. Fix the timing if there are any.
   - Run ONE render at a time: several builders share a 14 GB machine.
   - Long renders: give the Bash call timeout 600000. Split the class list across calls if needed.
3. Look at your work. For each Manim shot, pull 3–4 stills with `ffmpeg -v error -y -ss T -i assets/manim_low/X.mp4 -frames:v 1 work/check/X_T.png`, tile them into one sheet with PIL, and READ it. Check for:
   - no overlaps
   - nothing off-frame or over the title
   - readable, uncluttered
   - correct maths
   - no misheard words
   - nothing that looks cheap
   Fix and re-render.
4. `..\.venv\Scripts\python.exe tools/build_reel.py` runs. Do NOT run hyperframes or full-resolution renders: the lead does that.

Report via your final handback in 10 lines or fewer:
- the class names in order
- Manim seconds vs other kinds
- anything doubtful
