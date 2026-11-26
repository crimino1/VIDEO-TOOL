"""words.json -> hf/assets/js/cues.js : window.CUE (phrase start times) + window.WORDS (caption words).
Whole-word phrase lookup; fails loudly if a phrase is missing."""
import json, re
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
for k, ph in [("shadow", "they can see your shadow"), ("dig", "so you dig a cave"), ("door", "the only door"),
              ("secret", "this is a secret entrance"), ("brown", "the fresh dirt"), ("night", "dump it at night"),
              ("carry", "the falls carry"), ("dogs", "they bring dogs"), ("through", "only come and go"),
              ("scent", "washes your scent"), ("stale", "the air turns stale"), ("chip", "chip a crack"),
              ("ferns", "the ferns on top"), ("vent", "this is your air vent"), ("camp", "the soldiers camp"),
              ("listen", "just to listen"), ("deeper", "so you dig deeper"), ("loudest", "the loudest part"),
              ("mistake", "that's not a mistake"), ("louder", "a waterfall is louder"), ("nothing", "hear nothing"),
              ("moss", "add a bed of moss"), ("otter", "an otter who"), ("fish", "stealing your fish"),
              ("congrats", "congratulations")]:
    C[k] = at(ph)
C["end"] = W[-1]["e"]
open("hf/assets/js/cues.js", "w").write("window.CUE=" + json.dumps(C) + ";\nwindow.WORDS=" +
    json.dumps([[w["w"], w["t"], w["e"]] for w in W]) + ";\n")
for k, v in C.items(): print(f"{k:9} {v:6.2f}")
