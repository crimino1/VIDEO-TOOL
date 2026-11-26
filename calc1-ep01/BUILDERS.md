# Builder brief: "Calculus 1 course, Episode 1: Functions, the warm-up"

Project: C:\Users\daggu222105\VIDEO-TOOL\calc1-ep01 — a 17:04 lesson, episode 1 of a full Calculus 1 (university / AP Calculus AB) series, on the user's chalkboard theme. It must look like the approved beginner calculus video in ..\calc (read ..\calc\manim\s02_derivative.py and ..\calc\manim\s03_integral.py for that style). Voice: assets/vo.mp3; word timings words.json (`{"words":[{"word","start","end"}]}`); readable lines in script.txt.
This pipeline already made a 55-min trig course; the look is proven. Read manim/common.py fully first (Shot clock, title(), pill(), panel(), M() handwritten LaTeX, H() chalk text, colours). For a worked style example read ..\edu\manim\s02_right_triangle.py.

## The user's quality bar (most important)
"High quality, looks human-made, NOT AI slop, NOT AI-slop animation effects. Simple, good, understandable." Audience: beginners starting Calculus 1, explained very simply. So:
- One idea on the board at a time. Clear the board (self.wipe) between ideas. Max ~3 things on screen. Big, readable, generous margins.
- Motion vocabulary ONLY: Create (draw lines/shapes like chalk), Write (maths/text), FadeIn/FadeOut (small shift), Transform/ReplacementTransform (change one thing into another), MoveAlongPath / ValueTracker updaters for real motion (a car moving, a tangent line sliding, rectangles splitting), Circumscribe or an underline for emphasis. Run times 0.5-1.2 s, ease default.
- BANNED: Flash, spinning/rotating text, bouncing/elastic, Wiggle, rainbow colours, glow, particles, sparkles, random camera zooms, emoji, decorative clutter, text that types itself letter-by-letter for no reason, captions that just repeat the voice word-for-word.
- Draw real, simple line drawings in chalk: a car (body + 2 wheels), a bicycle on a hill, a stick-figure walker, a wall, a square with strips, a pizza, a bucket. Clean geometry, not clip-art.
- Graphs: labelled axes (time →, distance ↑) with units; points and lines appear as they are spoken; the slope/tangent shown as a short PINK line with a little triangle (rise/run).
- Colour meaning, keep it consistent: YEL = highlight/key word, BLUE = graph line/distance, PINK = derivative/slope/speed, GRN = integral/area/total, ORG = example numbers, DIM = secondary labels.
- Everything appears ON the word that names it (exact times from words.json). Never sit fully static > ~6 s: add the next small piece, underline, or move.
- Short labels, not sentences. Numbers concrete with units (50 m, 1 min, 60 km/h).
- Headings: self.title("...") — short (2-5 words). Content below y = 2.45, inside x = ±6.8, y >= -3.8. Maths size >= 48, labels >= 34.
- Graphs of functions are the heart of this episode: Axes with labelled x and y, integer ticks, curves via ax.plot; split the domain around asymptotes/undefined points (never draw through them). Curves BLUE by default. Notation always in M(): f(x), f^{-1}(x), f(g(x)), \ln x, e^x, \sqrt{x-5}.
- Kalam (the text font) has NO θ, →, ×, ², Greek or math glyphs: put any maths/symbol in M() or TX(), never in H()/T()/pill().

## Your files only (NN = your number, prefix KNN_)
- shotlist/cNN.py: `S = [("m:ss.ss", kind, "KNN_Name", {...}), ...]` — first row starts EXACTLY at your range start; the range ends where the next builder begins (automatic).
- manim/sNN_<topic>.py: `from common import *`; classes `class KNN_Name(Shot): def body(self): ...` using self.at / self.go / self.title / self.wipe. Each Manim shot <= ~45 s (split long stretches at natural sentence breaks).
- images: `..\.venv\Scripts\python.exe -I tools/img.py search pexels "query"` (or `commons`), READ the contact-sheet jpg it prints, then `tools/img.py get kNN_name pexels:<id>` (or `commons:"File.jpg"`). Credits are written automatically. If Commons rate-limits, wait and retry.
- Never edit common.py, shots.py, tools/*, or another builder's files.

## Shot kinds
- "m" Manim — the bulk (~85-90%).
- "p" real photos pinned on the board, an Enter-key click plays on each image time automatically: dict(imgs=[(img, "m:ss.ss"), ...], title="...", caps=[("text", "m:ss.ss")]). Use only when the voice names a real thing (speedometer, Earth, Newton, a rocket...). 1-3 images, 3-8 s. Pick clean, real, well-lit photos — no AI-looking images, no watermarks, no text-heavy stock.
- "c" part card (2D chalk card): at each "Part N" phrase, dict(label="Part 3", title="Domain and Range", doodle="triangle"|"circle"|"wave"|"star") — 2.5-4 s.
- "q" practice card (2D): at "Quick practice" / "Practice time" phrases dict() gives the plain "Practice Time!" card; dict(title="Quick Check", sub="Answer out loud") for a custom one — 1.5-3 s.
- "s" subscribe card (2D, hand-drawn button + bell): dict(line="Full calculus course coming soon") — up to ~8 s; it is followed by Manim if the voice continues.
- No memes in this series (the user asked for clean and simple).

## Check before you report
1. `..\.venv\Scripts\python.exe shots.py` passes.
2. `..\.venv\Scripts\python.exe tools/render_manim.py --low --jobs 1 <your class names>` -> all ok, no "!!" late/over lines (fix timing if any). ONE render at a time (RAM is limited: 5 builders share a 14 GB machine).
3. Look at your work: for each Manim shot pull 3-4 stills (`ffmpeg -v error -y -ss T -i assets/manim_low/X.mp4 -frames:v 1 work/check/X_T.png`, ffmpeg is on PATH as C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe) and READ them: no overlaps, nothing off-frame, nothing over the title, readable, uncluttered, nothing that looks cheap. Fix and re-render.
4. `..\.venv\Scripts\python.exe tools/build_reel.py` runs (your images exist). Do NOT run hyperframes snapshot/render or full-resolution renders — the lead does that.
Report: shot list summary, Manim seconds vs other kinds, anything doubtful.
