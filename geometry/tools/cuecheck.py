"""List every word cue in the shot list that is missing or lands >4 s after its hint."""
import sys; sys.path.insert(0, ".")
import lib
orig = lib.W
def W2(word, after=0.0, end=False, exact=False):
    try:
        t = orig(word, after, end, exact)
        if t - after > 4: print(f"FAR  {word!r} after {after} -> {t:.2f}")
        return t
    except KeyError:
        print(f"MISS {word!r} after {after}"); return after
lib.W = W2
src = open("build.py", encoding="utf-8").read().replace("from lib import *", "from lib import *\nW = lib.W")
exec(compile(src.split('if __name__ == "__main__":')[0], "build.py", "exec"), {"__name__": "chk", "lib": lib})
