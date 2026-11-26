"""words.json -> hf/assets/js/cues.js : window.CUE (phrase start times) + window.WORDS (caption words).
Whole-word phrase lookup; fails loudly if a phrase is missing."""
import json, re
from pathlib import Path
W = json.load(open("words.json"))
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
toks = [norm(w["w"]) for w in W]
def at(phrase, after=0.0):
    p = [norm(x) for x in phrase.split()]
    for i in range(len(toks) - len(p) + 1):
        if toks[i:i + len(p)] == p and W[i]["t"] >= after:
            return W[i]["t"]
    raise SystemExit(f"cue not found: {phrase!r}")
C = {}
for k, ph in [("tracks", "brush your tracks"), ("freeze", "you'll freeze by morning"), ("dig", "so you dig into"),
              ("outside", "outside it's"), ("inhere", "but in here"), ("cave", "this is a snow cave"), ("stale", "the air goes stale"),
              ("stick", "push a stick"), ("vent", "this is your air vent"), ("night", "but at night"), ("glow", "the whole drift glow"),
              ("byday", "only light it by day"), ("soldiers", "then the soldiers"), ("stab", "stab every drift"),
              ("logs", "line your roof"), ("wood", "hits wood"), ("storm", "a storm is coming"), ("search", "search every drift"),
              ("newroom", "so you dig a new room"), ("mistake", "that's not a mistake"), ("packed", "packed snow sets"),
              ("standing", "they're standing on"), ("bed", "add a bed"), ("fox", "an arctic fox"), ("tunnel", "in your tunnel"),
              ("congrats", "congratulations")]:
    C[k] = at(ph)
C["end"] = W[-1]["e"]
Path("hf/assets/js").mkdir(parents=True, exist_ok=True); open("hf/assets/js/cues.js", "w").write("window.CUE=" + json.dumps(C) + ";\nwindow.WORDS=" +
    json.dumps([[w["w"], w["t"], w["e"]] for w in W]) + ";\n")
for k, v in C.items(): print(f"{k:9} {v:6.2f}")
