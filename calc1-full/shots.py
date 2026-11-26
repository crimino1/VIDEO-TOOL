"""The film list, one source of truth. Each chapter file shotlist/cNN.py defines S = [rows]; this joins them in time order.

Row: ("m:ss.ss", kind, Name, {options})   - a shot runs until the next row's start (the last until FILM_END).
  "m" Manim class Name (in manim/sNN_*.py) rendered to assets/manim/<Name>.mp4
  "p" images on the board   dict(imgs=[(img, "m:ss.ss"), ...], title="...", caps=[("text", "m:ss.ss")])  - click sound on each image
  "g" meme clip             dict(clip="name", cap="...", title="...", t_in=0)   - assets/memes/name.mp4, click sound at start
  "c" chapter card (2D)     dict(num=6, title="The Unit Circle", doodle="circle")
  "q" practice card (2D)    dict(sub="Pause the video and try it")
"""
import importlib, os, sys

FPS = 30
FILM_END = 15398.13


def sec(s):
    if isinstance(s, (int, float)):
        return float(s)
    t = 0.0
    for part in s.split(":"):  # "m:ss.ss", "mmm:ss.ss" or "h:mm:ss.ss"
        t = t * 60 + float(part)
    return t


HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
S = []
for f in sorted(os.listdir(os.path.join(HERE, "shotlist"))):
    if f.startswith("c") and f.endswith(".py"):
        S += importlib.import_module("shotlist." + f[:-3]).S
S.sort(key=lambda r: sec(r[0]))

SHOTS = []
for i, row in enumerate(S):
    st = sec(row[0])
    en = sec(S[i + 1][0]) if i + 1 < len(S) else FILM_END
    SHOTS.append(dict(start=st, end=en, kind=row[1], name=row[2], **(row[3] if len(row) > 3 else {})))
BY_NAME = {s["name"]: s for s in SHOTS}

if __name__ == "__main__":
    names = [s["name"] for s in SHOTS]
    dup = {n for n in names if names.count(n) > 1}
    assert not dup, f"duplicate names {dup}"
    bad = [s["name"] for s in SHOTS if s["end"] - s["start"] < 0.5]
    assert not bad, f"shots under 0.5s: {bad}"
    by = {}
    for s in SHOTS:
        by[s["kind"]] = by.get(s["kind"], 0) + s["end"] - s["start"]
    print(len(SHOTS), "shots;", {k: f"{v:.0f}s" for k, v in by.items()}, "covered", f"{SHOTS[0]['start']:.2f}..{SHOTS[-1]['end']:.2f}" if SHOTS else "-")
