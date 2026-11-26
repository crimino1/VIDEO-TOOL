# Chapter builder brief (shared by all parallel builders)

Project: C:\Users\daggu222105\VIDEO-TOOL\edu — 55-min trigonometry course on the user's chalkboard theme. Voice: assets/vo.mp3, word timings words.json, sentences script.txt.

## Your files only (NN = your two-digit number, Kxx = your class/name prefix)
- shotlist/cNN.py : `S = [ ("m:ss.ss", kind, "KNN_Name", {...}), ... ]` — first row starts EXACTLY at your range start; your range ends where the next builder starts (automatic).
- manim/sNN_<topic>.py : `from common import *`, classes `class KNN_Name(Shot): def body(self): ...` clocked with self.at / self.go / self.title / self.wipe.
- images: assets/img/kNN_<name>.jpg via `python -I tools/img.py search pexels|commons "q"` (look at the sheet jpg it prints) then `tools/img.py get kNN_name pexels:<id>|commons:"File.jpg"`.
- memes: find with the pinterest_search tool (look at thumbnails), fetch `python -I tools/meme.py kNN_name <url> <pin_url> [start] [len]`.
- Never edit common.py, shots.py, tools/*, or another builder's files. Need a helper? Put it in your own sNN file.

## Shot kinds (details in shots.py docstring)
- "m" Manim — the bulk (~75-85%). Each Manim shot <= ~60 s (split long stretches). Teach visually: build triangles, circles, graphs, step-by-step LaTeX, colour-coded (PINK sine/opposite, BLUE cosine/adjacent, GRN tangent/hypotenuse, YEL theta/highlights, ORG, PURP panels). Use self.title("Topic") for the top heading, pill() headers, panel() boxes, M() handwritten LaTeX, H() chalk notes. Content stays below y=2.45 (title zone) and inside x=±6.8, y>=-3.8. Every element appears on the word that names it (exact times from words.json). Never sit static > ~6 s: underline, box, colour, move. After "pause" moments, reveal the worked answer step by step on the words.
- "p" images on the board (Enter-key click plays automatically on each image time): use when the voice names a real-world thing (mountain, ladder, lighthouse, Euler portrait, mp3...). 1-3 images, optional title and caps. Do NOT put photos inside Manim scenes (the click sound only exists for p/g shots).
- "g" meme clip (muted, click at start): 1-3 per range where the joke lands (crying, mind blown, high five, "no thank you"...), 2-5 s.
- "c" chapter card (2D HyperFrames): at each "Chapter N" word, 2-4 s, dict(num=N, title="...", doodle=triangle|circle|wave|star).
- "q" practice card (2D): at each "Practice time" phrase, ~1.5-3 s.

## Spelling fixes (transcript errors): Sign->Sine, "Soca toa"->SOH CAH TOA, Radiance->Radians, coderminal->coterminal, Herron->Heron, oilers->Euler's, "arc a sign"->arccosine (check context), "190 degree angle"->one 90-degree angle, "the he answer"->the answer, cut-off "pi over..." -> pi over 2.

## Check before you report
1. `../.venv/Scripts/python.exe shots.py` passes (no duplicates, no shot < 0.5 s).
2. `../.venv/Scripts/python.exe tools/render_manim.py --low --jobs 3 <your class names>` -> all ok, no "!!" late/over lines (fix timing if any).
3. Look at your work: for each Manim shot pull 3-4 stills (`ffmpeg -ss T -i assets/manim_low/X.mp4 -frames:v 1 work/check/X_T.png`) and read them: no overlaps, nothing off-frame, no text over the title zone, readable sizes (maths >= 44, notes >= 32).
4. `../.venv/Scripts/python.exe tools/build_reel.py` runs (all images/memes found). Do NOT run hyperframes snapshot/render and do NOT render full resolution — the lead does that.
Report: shot count, Manim seconds vs images/memes/cards, anything doubtful.
