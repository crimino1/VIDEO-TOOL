"""Sound design for the 100 men film: real SFX (Mixkit free licence) placed on every visible action, plus a bed per scene.
Cues go to SND as [start, file, vol, dur or 0, kind]; kind "hit" = one-shot (peak-normalised), "bed" = looped ambience (loudness-normalised).
hit() lines the sound's measured peak (or onset) up with the picture time."""
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


GROUPS = {
    # animal voices
    "vraptor": ["mk307", "mk1965", "mk1969"], "direwolf": ["mk1773", "mk1969"], "kelenken": ["mk24", "mk70"],
    "smilodon": ["mk6", "mk13", "mk95"], "utah": ["mk1963", "mk307"], "arctodus": ["mk1728", "mk13"], "trex": ["mk1976", "mk1972", "mk1970", "mk1726"],
    "giga": ["mk1727"], "spino": ["mk306"], "deino": ["mk1957", "mk1966"], "mosa": ["mk1966"], "meg": ["mk1321"], "cavelion": ["mk6", "mk95"],
    "mammoth": ["mk15"], "pain": ["mk15", "mk5"],
    # men and hits
    "punch": ["mk2055", "mk2052"], "scream": ["mk391", "mk392"], "bodyfall": ["mk756", "mk2070"], "swoosh": ["mk1472", "mk1489", "mk1488"],
    # big moments
    "stomp": ["mk1974", "mk1975"], "rumble": ["mk1296", "mk1297"], "card": ["mk788", "mk1143", "mk780"], "drop": ["mk549", "mk563"], "splash": ["mk1311", "mk1180", "mk1198"],
}
SPECIES = {"vraptor": "vraptor", "direwolf": "direwolf", "kelenken": "kelenken", "terrorbird": "kelenken", "smilodon": "smilodon", "utah": "utah", "arctodus": "arctodus",
           "trex": "trex", "giga": "giga", "spino": "spino", "deino": "deino", "mosa": "mosa", "meg": "meg", "cavelion": "cavelion", "mammoth": "mammoth"}
BIG = {"trex", "giga", "spino", "mammoth"}


def pick(group):
    """cycle through a group so repeats are spread out"""
    if group not in _cyc: _cyc[group] = itertools.cycle(GROUPS[group])
    return _f(next(_cyc[group]))


def hit(t, file, vol=1.0, at="peak"):
    off = INFO[file][at] if at else 0.0
    SND.append([round(max(0.0, t - off), 3), file, vol, 0, "hit"])


def bed(t0, t1, file, vol=1.0):
    if t1 - t0 > 0.3: SND.append([round(t0, 3), file, vol, round(t1 - t0, 3), "bed"])


def species_of(img_id):
    n = img_id[2:] if img_id.startswith("c_") else img_id
    for k, v in SPECIES.items():
        if n.startswith(k): return v
    return None


def kfv(v, t, default=0.0):
    if v is None: return default
    if isinstance(v, (int, float)): return v
    if t <= v[0][0]: return v[0][1]
    for p, q in zip(v, v[1:]):
        if t <= q[0]: return p[1] + (q[1] - p[1]) * (t - p[0]) / max(1e-6, q[0] - p[0])
    return v[-1][1]


PLATE_BED = {"p_field": ("mk1166", 0.8), "p_savanna": ("mk1166", 0.8), "p_dusk": ("mk1736", 0.7), "p_storm": ("mk1289", 0.55), "p_mongolia_0": ("mk1733", 1.0),
             "p_patagonia_3": ("mk1733", 1.0), "p_savanna_3": ("mk1213", 0.8), "p_forest": ("mk40", 0.9), "p_deep2": ("mk1209", 0.6), "p_fire": ("mk1329", 1.0)}


def scene(a, b, o):
    """all the sound for one PZ.scene"""
    d = b - a
    if o.get("bg"):
        f, v = PLATE_BED.get(o["bg"]["img"], ("mk1166", 0.7)); bed(a, b, _f(f), v)
    if o.get("swim"): bed(a, b, _f("mk1209"), 0.5)
    for t in o.get("flash", []): hit(a + t, pick("punch"), 0.9)
    for sh in (o.get("cam") or {}).get("shake", []):
        if sh[1] >= 12: hit(a + sh[0], pick("rumble"), 0.6, at="onset")
    beasts = (o.get("beasts") or []) + (o.get("under") or [])
    lineup = len([x for x in beasts if not x.get("snake")]) >= 4
    for bs in beasts:
        if bs.get("snake"):
            hit(a + 0.4, _f("mk1964"), 0.6, at="onset")
            if kfv(bs.get("writhe"), 3, 0) > 0.5: hit(a + 2.6, _f("mk1964"), 0.8, at="onset")
            continue
        sp = species_of(bs["img"])
        if not sp or lineup: continue
        fall = bs.get("fall")
        t_in = None
        al = bs.get("alpha")
        if isinstance(al, list) and len(al) > 1 and al[0][1] == 0: t_in = al[-1][0]
        xs = bs.get("x")
        if isinstance(xs, list) and len(xs) > 1 and abs(xs[-1][1] - xs[0][1]) > 300 and bs.get("walk"):
            t_in = min(xs[-1][0], d) - 0.4
        if t_in is None and not bs.get("lunge") and fall is None: t_in = 0.35
        if t_in is not None and t_in < d - 0.3:
            hit(a + max(0.2, t_in), pick(sp), 0.95 if sp in BIG else 0.75, at="onset")
        for l in bs.get("lunge", []):
            hit(a + l[0], pick(sp), 0.85, at="onset"); hit(a + l[0] + 0.1, pick("swoosh"), 0.5)
        if fall is not None and 0 <= fall < d:
            hit(a + fall + 0.1, pick("pain"), 0.7, at="onset"); hit(a + fall + 0.9, _f("mk1975"), 0.8)
        w = bs.get("walk")
        if sp in BIG and w:
            t = 0.25
            while t < d - 0.2:
                rate = kfv(w, t, 0)
                if rate <= 0.05:
                    t += 0.2; continue
                hit(a + t, pick("stomp"), 0.75 if sp == "trex" else 0.5); t += 1.0 / rate
        for sw in bs.get("swap", []):
            if sw[0] > 0 and "direwolf_3" in sw[1]: hit(a + sw[0], pick("direwolf"), 0.6, at="onset")
    if lineup: hit(a + 0.6, _f("mk1727"), 0.8, at="onset")
    for cr in [o.get("crowd"), o.get("crowd2")]:
        if not cr: continue
        acts = cr.get("acts", []); n = cr.get("n", 100)
        if cr.get("item") in ("mix", "torch"): bed(a, b, _f("mk1329"), 1.0)
        kinds = {x["kind"] for x in acts}
        for x in acts:
            t = x["t"]
            if x["kind"] == "ring" and n >= 10 and "cheer" not in kinds:
                bed(a + (t if x.get("dur", 1) > 0.05 else 0), b, _f("mk458"), 0.85)
                if x.get("dur", 1) > 0.05: hit(a + t, _f("mk1236"), 0.5, at="onset")
            elif x["kind"] == "cheer": hit(a + t + 0.2, _f("mk462") if n >= 40 else _f("mk459"), 0.8, at="onset")
            elif x["kind"] == "flee": bed(a + t, b, _f("mk376"), 0.8); bed(a + t, b, _f("mk1236"), 0.8)
            elif x["kind"] == "walk" and abs(x.get("dx", 0)) > 50: bed(a + t, min(b, a + t + x.get("dur", 1)), _f("mk461") if cr.get("item") else _f("mk1921"), 0.6)
            elif x["kind"] == "throw": hit(a + t, _f("mk1488"), 0.7); hit(a + t + 0.15, _f("mk1491"), 0.7)
        if not acts and n >= 40 and not beasts: bed(a, b, _f("mk455"), 1.0)
        for fl in cr.get("fling", []):
            if 0 <= fl[0] < d:
                hit(a + fl[0], pick("scream"), 0.5 if fl[3] < 8 else 0.7, at="onset"); hit(a + fl[0] + 0.75, pick("bodyfall"), 0.6)
    for g in (o.get("swim") or {}).get("gone", []):
        hit(a + g[0], pick("splash"), 0.9); hit(a + g[0] + 0.2, pick("scream"), 0.5, at="onset")


CLIP_BED = {"gorilla": ("mk8", 0.8), "wolf": ("mk1775", 0.5), "wolfpack": ("mk1775", 0.5), "lion": ("mk95", 0.9), "croc": ("mk40", 0.9), "ocean": ("mk1199", 0.9),
            "river": ("mk40", 0.8), "fire": ("mk1335", 0.7), "storm": ("mk1301", 1.0), "elephant": ("mk1166", 0.8), "coal": ("mk1301", 0.8), "fossil": ("mk1733", 1.0),
            "maasai": ("mk1166", 0.9), "sunset": ("mk1166", 0.9), "bear": ("mk1728", 0.25), "turkey": ("mk1166", 0.8), "skeleton": ("mk455", 0.5), "bus": ("mk1166", 0.5)}


def clip(a, b, name):
    key = name.rsplit("_", 1)[0]
    if key in CLIP_BED:
        f, v = CLIP_BED[key]; bed(a, b, _f(f), v)
    if key == "lion": hit(a + 0.8, _f("mk6"), 0.6, at="onset")
    if key == "gorilla": hit(a + 0.5, _f("mk8"), 0.6, at="onset")


def photo(a, b): hit(a, _f("mk1489"), 0.35)
def stamp(t): hit(t, _f("mk563"), 0.35)
def size(a, b, t0=0.5): hit(a + t0 + 0.5, _f("mk1143"), 0.55); bed(a, b, _f("mk1209"), 0.25)
def card(a, b): hit(a + 0.4, pick("card"), 0.9)
def drop(t): hit(t, pick("drop"), 0.8)
def move(t): hit(t + 0.1, _f("mk1472"), 0.6)
