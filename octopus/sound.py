"""Sound design for the blue-ringed octopus film: real Mixkit recordings (free licence) on every visible action plus a matching
ambience bed for every shot. SND rows: [start, file, vol, dur or 0, kind]; "hit" = one-shot lined up on its measured peak/onset,
"bed" = looped ambience with fades. No music (the user's choice on the last film)."""
import json, itertools
from pathlib import Path
H = Path(__file__).parent
INFO = json.load(open(H / "assets" / "sfx" / "info.json"))
SND = []
_cyc = {}


def _f(prefix):
    for k in INFO:
        if k.startswith(prefix + "_"): return k
    raise KeyError(prefix)


GROUPS = {"pop": ["mk2357", "mk3005"], "whoosh": ["mk1489", "mk1492"], "glitch": ["mk2595", "mk1455"], "crab": ["mk1128"], "egg": ["mk3192", "mk2925"]}


def pick(g):
    if g not in _cyc: _cyc[g] = itertools.cycle(GROUPS[g])
    return _f(next(_cyc[g]))


def hit(t, f, vol=1.0, at="peak"):
    SND.append([round(max(0.0, t - (INFO[f][at] if at else 0)), 3), f, vol, 0, "hit"])


def bed(t0, t1, f, vol=1.0):
    if t1 - t0 > 0.3: SND.append([round(t0, 3), f, vol, round(t1 - t0, 3), "bed"])


UNDER = ("yt:23Yw6", "yt:A_fka", "yt:gBru", "yt:EseuJ", "yt:tu0KP", "yt:PsX0", "yt:aepPD", "yt:vFSV", "yt:5qdE", "yt:kHOu", "yt:LK0s", "yt:iu1q", "yt:xpN6",
         "octo", "reef", "seagrass", "bottle", "shell", "fish", "diver", "puffer", "crab_0", "shrimp_0")
SHORE = ("tidepool", "rockpool", "hand", "beach", "crab_1", "crab_2", "starfish", "yt:_YhN", "yt:FQFf", "yt:5Nhz")


def underwater(a, b, k=1.0):
    bed(a, b, _f("mk1209"), 0.55 * k); bed(a, b, _f("mk3017"), 0.35 * k)


def clip(a, b, src):
    s = src
    if s.startswith(UNDER) or any(s.startswith(u) for u in UNDER): underwater(a, b)
    elif s.startswith("kids"): bed(a, b, _f("mk1193"), 0.8)
    elif s.startswith("coast"): bed(a, b, _f("mk1185"), 0.8)
    elif any(s.startswith(u) for u in SHORE): bed(a, b, _f("mk1190"), 0.75)
    elif s.startswith(("dawn", "dusk")): bed(a, b, _f("mk1208"), 0.8)
    elif s.startswith("waves"): bed(a, b, _f("mk1206"), 0.9)
    elif s.startswith("ambulance"): bed(a, b, _f("mk1650"), 0.8)
    elif s.startswith("hospital"): bed(a, b, _f("mk2229"), 0.8); bed(a, b, _f("mk494"), 0.4)
    elif s.startswith("lungs"): bed(a, b, _f("mk1166"), 0.8)
    elif s.startswith("lab"): hit(a + 0.4, _f("mk1116"), 0.5, at="onset")
    elif s.startswith("nerve"): bed(a, b, _f("mk2593"), 0.5)
    hit(a, pick("whoosh"), 0.22)   # soft air on every cut keeps the edit moving


def photo(a, b): hit(a, _f("mk3005"), 0.4, at="onset")
def lab(t): hit(t, _f("mk2357"), 0.45, at="onset")
def title(t): hit(t, _f("mk1143"), 0.6)


def scene(a, b, name, o):
    d = b - a
    rel = lambda x: a + x
    if name == "paralysis":
        bed(a, b, _f("mk494"), 0.75)
        for k in ("lips", "face", "arms", "legs", "chest"):
            if k in o and o[k] < d:
                hit(rel(o[k]), _f("mk1455") if k == "lips" else pick("glitch"), 0.55, at="onset")
                if k in (o.get("labels") or {}): lab(rel(o[k]))
        if "chest" in o and o["chest"] < d: hit(rel(o["chest"] + 0.6), _f("mk490"), 0.8, at="onset")
    elif name == "aware":
        bed(a, b, _f("mk494"), 0.7); hit(rel(0.4), _f("mk873"), 0.5, at="onset"); lab(rel(1.0))
    elif name == "flash":
        underwater(a, b, 0.8)
        on = o.get("on", 1.0)
        if 0 <= on < d: hit(rel(on), _f("mk870"), 0.85, at="onset"); hit(rel(on + 0.05), _f("mk871"), 0.5, at="onset")
        if o.get("off", 1e9) < d: hit(rel(o["off"]), _f("mk1492"), 0.6, at="onset")
    elif name == "map":
        bed(a, b, _f("mk1209"), 0.3); hit(a, _f("mk1489"), 0.5)
        if o.get("range", 99) < d: hit(rel(o["range"]), _f("mk873"), 0.5, at="onset")
        for p in o.get("pins", []):
            if p[3] < d: lab(rel(p[3]))
    elif name == "size":
        underwater(a, b, 0.8); lab(rel(0.2)); lab(rel(0.45)); lab(rel(o.get("hand", 2.6)))
    elif name == "reefocto": underwater(a, b)
    elif name == "ring":
        bed(a, b, _f("mk1209"), 0.35)
        lab(rel(o.get("mirror", 0.5))); hit(rel(o.get("light", 1.0)), _f("mk873"), 0.5, at="onset"); lab(rel(o.get("musc", 2.2)))
        hit(rel(o.get("tight", 3)), _f("mk870"), 0.85, at="onset"); hit(rel(o.get("darkT", 9)), _f("mk1492"), 0.55, at="onset"); lab(rel(o.get("darkT", 9) + 0.2))
    elif name == "darwin":
        bed(a, b, _f("mk1190"), 0.7); bed(a, b, _f("mk1185"), 0.4)
        bt = o.get("bite", 3.5); hit(rel(bt), _f("mk2364"), 0.9); hit(rel(bt + 0.1), _f("mk489"), 0.7, at="onset")
    elif name == "clock":
        bed(a, b, _f("mk1050"), 0.8); bed(a, b, _f("mk494"), 0.45); lab(rel(0.8))
    elif name == "toxin":
        hit(rel(0.3), _f("mk1492"), 0.5, at="onset"); lab(rel(0.2))
        p = o.get("people")
        if p is not None and p < d:
            hit(rel(p), _f("mk1143"), 0.5)
            for i in range(0, 20, 4): hit(rel(p + 0.3 + i * 0.08), pick("pop"), 0.3, at="onset")
    elif name == "bacteria":
        bed(a, b, _f("mk3000"), 0.6); underwater(a, b, 0.5); hit(rel(o.get("zoom", 1.2)), _f("mk873"), 0.5, at="onset"); lab(rel(o.get("zoom", 1.2) + 0.3))
        for k in ("home", "weapon"):
            if k in o: lab(rel(o[k]))
    elif name == "everywhere":
        underwater(a, b, 0.6)
        for k in ("arms", "skin", "eggs"):
            if o.get(k, 99) < d: hit(rel(o[k]), _f("mk871"), 0.6, at="onset"); lab(rel(o[k]))
    elif name == "nerve":
        blk = o.get("block", 99)
        bed(a, min(b, rel(blk + 1.0)), _f("mk2593"), 0.65); lab(rel(0.2)); lab(rel(0.8))
        if blk < d:
            for n in range(6): hit(rel(blk + n * 0.12 + 0.3), _f("mk2365"), 0.5, at="onset")
            hit(rel(blk + 1.0), _f("mk2595"), 0.7, at="onset"); lab(rel(blk + 0.3))
    elif name == "recover":
        bed(a, b, _f("mk2229"), 0.75); bed(a, b, _f("mk1050"), 0.4); lab(rel(0.2)); lab(rel(1.0))
        if o.get("rec", 99) < d: hit(rel(o["rec"]), _f("mk873"), 0.55, at="onset")
    elif name == "hunt":
        underwater(a, b)
        for t in (0.2, 0.7): hit(rel(t), pick("crab"), 0.45, at="onset")
        pc, bt = o.get("pounce", 1.5), o.get("bite", 3.0)
        hit(rel(pc), _f("mk1472"), 0.6); hit(rel(pc + 0.3), _f("mk1311"), 0.6)
        if bt < d: hit(rel(bt), _f("mk2364"), 0.9); hit(rel(bt + 0.02), _f("mk2055"), 0.6); lab(rel(bt + 0.4))
    elif name == "hearts":
        bed(a, b, _f("mk496"), 0.75); underwater(a, b, 0.4); lab(rel(0.3)); lab(rel(o.get("third", 2.5)))
        if o.get("blood", 99) < d: hit(rel(o["blood"]), _f("mk870"), 0.6, at="onset"); lab(rel(o["blood"]))
    elif name == "neurons":
        bed(a, b, _f("mk2593"), 0.4); hit(rel(0.3), _f("mk871"), 0.6, at="onset"); lab(rel(o.get("arms", 2)))
    elif name == "eggs":
        underwater(a, b)
        if "count" in o: lab(rel(o["count"]))
        if o.get("hatch", 99) < d:
            for i in range(6): hit(rel(o["hatch"] + i * 0.18), pick("egg"), 0.45, at="onset")
    elif name == "end":
        underwater(a, b, 0.6); hit(rel(0.6), _f("mk870"), 0.7, at="onset"); hit(rel(1.0), _f("mk2357"), 0.6, at="onset")
