"""Check every W("word", hint) / WX(...) cue in manim/scenes.py: MISS (no match) or FAR (lands > 3 s after hint)."""
import re, sys
sys.path.insert(0, ".")
from lib import W
src = open("manim/scenes.py", encoding="utf-8").read()
for m in re.finditer(r'\b(WX?)\("([^"]+)",\s*([\d.+ ]+)\)', src):
    fn, w, h = m.group(1), m.group(2), eval(m.group(3))
    try:
        t = W(w, h, exact=(fn == "WX"))
        if t - h > 3: print(f"FAR  {w!r} hint {h} -> {t:.2f}")
    except KeyError:
        print(f"MISS {w!r} hint {h}")
print("checked")
