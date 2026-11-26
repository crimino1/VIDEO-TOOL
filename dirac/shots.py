"""Film list: "The Dirac Equation" — how an equation predicted antimatter (16:58 + 2 s hold). Style v2.1 documentary 3D + archival photos + real footage.
Shot kinds: 3d / v (CLIPS) / p / f / q / card. Overlays: line, cap, eq, big, title."""
FILM_END = 1020.60


def sec(s):
    if isinstance(s, (int, float)):
        return float(s)
    m, x = s.split(":")
    return int(m) * 60 + float(x)


S = [
    # ---------------- HOOK: ANDERSON'S PHOTOGRAPH
    ("0:00.00", "3d", "chamber", "photo", [("cap", "2 August 1932 · Pasadena, California", "0:00.8", "0:07.4")]),
    ("0:08.16", "q", ["anderson"], [("Carl Anderson", "Physicist · Caltech")], []),
    ("0:11.50", "3d", "chamber", "rays", [("cap", "cosmic rays", "0:12.2", "0:14.8")]),
    ("0:14.98", "3d", "chamber", "box", [("cap", "a cloud chamber", "0:17.6", "0:21.6")]),
    ("0:21.84", "3d", "chamber", "trail", []),
    ("0:25.54", "v", "contrail", []),
    ("0:28.60", "3d", "chamber", "bend", []),
    ("0:32.60", "3d", "chamber", "bend2", [("cap", "electrons · negative charge", "0:33.0", "0:36.4")]),
    ("0:36.62", "3d", "chamber", "other", [("line", "But one trail curved the other way.", "0:37.0", "0:41.0")]),
    ("0:42.62", "f", "positron", [("cap", "Anderson's photograph · 2 August 1932", "0:43.0", "0:47.3")]),
    ("0:47.48", "v", "england", []),
    ("0:52.10", "3d", "eqpaper", "reveal", [("line", "No telescope. No laboratory. An equation.", "0:53.2", "0:58.6")]),
    ("0:58.92", "3d", "eqpaper", "strange", []),
    ("1:05.18", "3d", "sea", "twins", []),
    ("1:09.50", "3d", "cosmos", "flash", [("big", "antimatter", "", "1:13.6", "1:16.0")]),
    ("1:16.10", "3d", "eqpaper", "symbols", []),
    ("1:20.96", "v", "nightsky", [("title", "Nobody explained it like this", "The Dirac Equation", "How an equation predicted antimatter", "1:21.6", "1:29.2")]),
    # ---------------- PAUL DIRAC
    ("1:29.50", "q", ["dirac"], [("Paul Dirac", "Born 1902 · Bristol, England")], []),
    ("1:33.60", "v", "bristol", []),
    ("1:36.38", "v", "engineering", [("cap", "electrical engineering · graduated at 19", "1:36.8", "1:41.3")]),
    ("1:41.56", "v", "cambridge", []),
    ("1:45.40", "f", "dirac61", [("line", "A single word, or not at all.", "1:47.4", "1:51.3")]),
    ("1:51.46", "3d", "eqpaper", "clock", [("big", "1 dirac", "= one word per hour", "1:55.8", "2:00.2")]),
    ("2:00.40", "3d", "eqpaper", "mind", [("cap", "the late 1920s", "2:03.0", "2:08.6")]),
    # ---------------- TWO THEORIES
    ("2:09.48", "f", "solvay27", [("cap", "Physics, 1927: two great theories", "2:10.0", "2:14.6")]),
    ("2:14.84", "q", ["einstein"], [("Albert Einstein", "Special relativity · 1905")], []),
    ("2:20.14", "3d", "theories", "fast", []),
    ("2:24.40", "3d", "theories", "clock", [("cap", "clocks run slow · lengths shrink", "2:25.0", "2:29.8")]),
    ("2:30.00", "3d", "theories", "mass", [("eq", "E = mc²", "mass and energy are the same thing", "2:30.3", "2:33.0")]),
    ("2:33.18", "3d", "theories", "quantum", [("cap", "quantum mechanics", "2:34.0", "2:38.6")]),
    ("2:44.18", "q", ["schro"], [("Erwin Schrödinger", "His wave equation · 1926")], []),
    ("2:48.80", "3d", "theories", "wave", []),
    ("2:51.28", "3d", "theories", "spectrum", [("cap", "the colours of light atoms give off", "2:51.6", "2:54.4")]),
    ("2:54.60", "v", "chemistry", []),
    ("2:57.98", "3d", "theories", "slow", [("line", "It ignored relativity.", "2:58.2", "3:03.8")]),
    ("3:04.10", "3d", "gold", "atom", [("big", "> 50%", "of light speed · gold's innermost electrons", "3:08.9", "3:12.6")]),
    ("3:12.80", "3d", "gold", "bars", [("line", "Fast electrons are a big part of why gold is yellow.", "3:18.9", "3:23.2")]),
    ("3:26.42", "3d", "eqpaper", "need", []),
    ("3:36.68", "3d", "eqpaper", "tries", []),
    ("3:41.58", "v", "rain", [("big", "−30% chance of rain", "a negative probability makes no sense", "3:42.0", "3:47.4")]),
    ("3:47.62", "3d", "eqpaper", "properly", []),
    # ---------------- THE TRIANGLE
    ("3:49.90", "3d", "triangle", "einstein", [("eq", "E = mc²", "energy of a particle sitting still", "3:53.4", "4:01.3")]),
    ("4:01.54", "3d", "triangle", "moving", []),
    ("4:08.26", "3d", "triangle", "tri", []),
    ("4:28.90", "3d", "triangle", "squares", [("eq", "E² = (mc²)² + (pc)²", "Einstein's full formula", "4:33.5", "4:38.4")]),
    ("4:38.54", "3d", "triangle", "problem", [("eq", "E = √( (mc²)² + (pc)² )", "a square root", "4:46.3", "4:50.0")]),
    ("4:50.16", "3d", "triangle", "first", [("line", "No squares. Just the plain first power.", "4:55.3", "4:59.0")]),
    ("5:05.62", "3d", "triangle", "root", [("eq", "√(9 + 16) = 5", "not 3 + 4", "5:12.3", "5:16.9")]),
    # ---------------- MATRICES
    ("5:17.14", "3d", "matrix", "bold", []),
    ("5:24.66", "3d", "matrix", "grid", [("cap", "matrices", "5:25.0", "5:30.8")]),
    ("5:31.24", "3d", "matrix", "order", []),
    ("5:34.38", "v", "socks", []),
    ("5:39.02", "v", "shoes", []),
    ("5:42.88", "3d", "matrix", "book", [("line", "Same two steps. Different order. Different outcome.", "5:43.0", "5:46.5"),
                                         ("eq", "3 × 4 = 4 × 3", "ordinary numbers", "5:47.0", "5:51.3")]),
    ("5:51.50", "3d", "matrix", "ab", [("eq", "A × B ≠ B × A", "matrices", "5:51.8", "5:56.5")]),
    ("5:56.70", "3d", "matrix", "fit", []),
    ("6:03.92", "3d", "matrix", "four", [("big", "4 × 4", "the smallest grids that worked", "6:04.2", "6:07.0")]),
    ("6:09.06", "3d", "matrix", "parts", [("big", "4 parts", "for one electron", "6:16.9", "6:20.0")]),
    # ---------------- SPIN
    ("6:22.02", "3d", "spin", "magnet", [("cap", "spin", "6:24.8", "6:29.0")]),
    ("6:33.74", "3d", "spin", "experiment", []),
    ("6:40.84", "3d", "spin", "bolted", []),
    ("6:47.54", "3d", "spin", "appears", [("line", "In Dirac's equation, spin simply appeared.", "6:47.7", "6:52.4")]),
    ("6:59.00", "3d", "eqpaper", "published", [("cap", "Proceedings of the Royal Society · 1928", "6:59.4", "7:04.2")]),
    ("7:04.54", "v", "germany", [("line", "“Doing physics that way just wasn't done.”", "7:08.6", "7:11.8")]),
    ("7:11.92", "f", "solvay33", [("cap", "recognised at once as the answer", "7:12.3", "7:15.8")]),
    ("7:16.00", "3d", "matrix", "parts2", [("cap", "spin up · spin down", "7:17.0", "7:21.6")]),
    # ---------------- THE SECOND ANSWER
    ("7:22.56", "3d", "roots", "pm", [("eq", "3 × 3 = 9", "", "7:27.2", "7:29.4"), ("eq", "(−3) × (−3) = 9", "", "7:29.6", "7:32.2"),
                                      ("eq", "√9 = 3  or  −3", "every square root hides a second answer", "7:32.3", "7:36.4")]),
    ("7:36.54", "3d", "roots", "ball", [("big", "−2 seconds", "time doesn't run backward", "7:43.0", "7:48.3")]),
    ("7:48.52", "3d", "matrix", "parts3", [("line", "Negative energy. Less than nothing.", "7:52.2", "7:57.8")]),
    ("7:57.94", "3d", "ladder", "down", []),
    ("8:05.80", "v", "steamcup", []),
    ("8:08.02", "3d", "ladder", "fall", [("line", "No bottom.", "8:17.9", None)]),
    ("8:20.06", "3d", "ladder", "collapse", []),
    ("8:27.08", "v", "crowd", [("line", "Yet here you are.", "8:27.3", "8:30.1")]),
    ("8:30.24", "3d", "ladder", "either", []),
    # ---------------- THE DIRAC SEA
    ("8:35.86", "3d", "eqpaper", "sea", [("cap", "1929", "8:36.4", "8:41.0")]),
    ("8:42.80", "3d", "sea", "full", [("line", "What if all those negative energy places are already full?", "8:42.9", "8:47.0")]),
    ("8:47.18", "q", ["pauli"], [("Wolfgang Pauli", "The exclusion principle")], []),
    ("8:51.96", "3d", "sea", "pauli", [("line", "No two electrons in exactly the same state.", "8:52.1", "8:55.4")]),
    ("8:55.62", "v", "cinema", []),
    ("9:01.82", "3d", "sea", "fill", [("line", "A bottomless, completely full sea.", "9:08.6", "9:11.2")]),
    ("9:11.34", "3d", "sea", "cant", []),
    ("9:17.24", "3d", "sea", "smooth", []),
    ("9:22.70", "v", "fish", []),
    ("9:24.68", "3d", "sea", "knock", []),
    ("9:34.10", "v", "bubble", []),
    ("9:43.92", "3d", "sea", "hole", [("cap", "a missing negative electron acts positive", "9:50.2", "9:53.2")]),
    ("9:53.42", "3d", "sea", "proton", [("cap", "the proton · the only positive particle known in 1929", "9:56.4", "10:04.6")]),
    ("10:04.94", "3d", "eqpaper", "guess", []),
    ("10:09.08", "q", ["oppie", "weyl"], [("Robert Oppenheimer", "Physicist"), ("Hermann Weyl", "Mathematician")], []),
    ("10:15.80", "3d", "sea", "mass", [("big", "≈ 1,836 ×", "a proton vs an electron", "10:19.2", "10:23.6")]),
    ("10:23.88", "3d", "sea", "fall", []),
    ("10:33.06", "3d", "sea", "hydrogen", []),
    ("10:39.76", "3d", "sea", "leap", [("cap", "1931", "10:40.2", "10:45.0")]),
    ("10:47.70", "3d", "sea", "anti", [("cap", "anti-electron · same mass, opposite charge", "10:51.4", "10:55.2")]),
    ("10:55.34", "3d", "sea", "antiproton", []),
    ("10:59.64", "3d", "eqpaper", "logic", []),
    # ---------------- BACK TO CALIFORNIA
    ("11:05.34", "v", "pasadena", [("cap", "Pasadena, California", "11:05.7", "11:10.4")]),
    ("11:10.56", "3d", "chamber", "ambig", []),
    ("11:22.88", "3d", "chamber", "lead", [("cap", "a 6 mm plate of lead", "11:23.4", "11:28.0")]),
    ("11:35.20", "3d", "chamber", "track", []),
    ("11:47.10", "3d", "chamber", "up", [("line", "Moving upward. It had to be positive.", "11:47.4", "11:52.6")]),
    ("11:52.76", "f", "positron", [("line", "Anderson called it the positron.", "11:57.7", "12:02.6")]),
    ("12:02.80", "3d", "chamber", "plates", []),
    ("12:06.74", "v", "oldlab", []),
    ("12:16.86", "q", ["blackocc"], [("Patrick Blackett & Giuseppe Occhialini", "Cambridge · confirmed the positron, 1933")], []),
    ("12:25.26", "3d", "chamber", "real", [("line", "The anti-electron was real.", "12:27.9", "12:30.8")]),
    # ---------------- NOBEL
    ("12:31.00", "f", "dirac", [("cap", "Nobel Prize in Physics, 1933 · aged 31", "12:35.4", "12:40.5")]),
    ("12:40.72", "3d", "eqpaper", "refuse", []),
    ("12:46.10", "q", ["rutherford"], [("Ernest Rutherford", "Nobel laureate · Cambridge")], []),
    ("12:53.44", "v", "stockholm", [("cap", "Stockholm", "12:53.8", None)]),
    ("12:56.86", "q", ["anderson"], [("Carl Anderson", "Nobel Prize in Physics · 1936, aged 31")], []),
    # ---------------- WHAT IS ANTIMATTER
    ("13:01.48", "3d", "anti", "pairs", [("cap", "same mass · opposite charge", "13:09.7", "13:14.3")]),
    ("13:14.46", "3d", "anti", "antiproton", [("cap", "the antiproton · made in 1955", "13:18.4", "13:22.0")]),
    ("13:22.18", "3d", "anti", "antih", [("cap", "anti-hydrogen", "13:24.0", "13:27.0")]),
    ("13:27.16", "v", "geneva", [("cap", "Geneva, Switzerland", "13:27.5", "13:31.9")]),
    ("13:32.08", "3d", "cosmos", "meet", [("eq", "E = mc²", "their entire mass becomes energy", "13:40.9", "13:44.5")]),
    ("13:44.68", "p", "alpha", [("cap", "the ALPHA experiment at CERN", "13:45.0", "13:51.4")]),
    ("13:51.56", "3d", "cosmos", "drop", [("big", "It falls down.", "", "13:57.9", None)]),
    ("13:59.44", "v", "lab2", []),
    ("14:03.28", "v", "banana", []),
    ("14:08.46", "3d", "cosmos", "potassium", [("cap", "potassium-40", "14:08.8", "14:11.6")]),
    ("14:11.70", "v", "lightning", [("line", "Satellites have caught antimatter shooting up from lightning.", "14:13.7", "14:17.9")]),
    ("14:18.02", "3d", "cosmos", "tiny", [("big", "nanograms", "all the antimatter ever made at CERN", "14:21.0", "14:27.7")]),
    ("14:27.92", "3d", "sea", "sea", [("line", "Physics eventually moved past it.", "14:32.6", "14:35.0")]),
    ("14:40.40", "f", "positron2", [("line", "But the prediction was exactly right.", "14:40.6", "14:43.6")]),
    # ---------------- THE BIGGEST MYSTERY
    ("14:43.78", "v", "nightsky2", []),
    ("14:46.42", "3d", "bang", "bang", [("cap", "the Big Bang: matter and antimatter, one for one", "14:48.4", "14:53.9")]),
    ("14:58.98", "3d", "bang", "light", [("line", "No stars. No planets. No people.", "15:03.5", "15:07.3")]),
    ("15:07.46", "3d", "bang", "tip", [("big", "1,000,000,001", "for every 1,000,000,000 of antimatter", "15:12.6", "15:19.4")]),
    ("15:19.60", "3d", "bang", "left", []),
    ("15:28.36", "v", "sunearth", []),
    ("15:33.06", "3d", "bang", "why", [("line", "Nobody knows.", "15:36.5", "15:39.8")]),
    # ---------------- LEGACY
    ("15:45.78", "f", "dirac61", [("cap", "Paul Dirac · 1902–1984", "15:46.2", "15:49.4")]),
    ("15:49.62", "v", "westminster", [("cap", "Westminster Abbey, London", "15:50.0", "15:55.8")]),
    ("15:56.22", "3d", "stone", "slab", []),
    ("16:05.28", "3d", "stone", "close", [("line", "Spin. A mirror world. A question about why anything exists.", "16:07.4", "16:16.0")]),
    # ---------------- RECAP + END
    ("16:16.24", "3d", "eqpaper", "recap", []),
    ("16:26.36", "3d", "triangle", "recap", []),
    ("16:32.46", "3d", "roots", "recap", [("line", "He refused to throw the second one away.", "16:32.6", "16:35.2")]),
    ("16:41.44", "3d", "chamber", "proof", [("line", "A track in a cloud chamber proved the math was right.", "16:41.6", "16:46.8")]),
    ("16:46.94", "v", "milkyway", []),
    ("16:52.78", "3d", "bang", "end", [("line", "The one in a billion that didn't meet its twin.", "16:55.6", None)]),
]

CLIPS = {
    "contrail": ("contrail_0", 0), "england": ("england_2", 4), "bristol": ("bristol_0", 0), "engineering": ("engineering_1", 0), "cambridge": ("cambridge_1", 2),
    "chemistry": ("chemistry_0", 0), "rain": ("rain_0", 2), "socks": ("socks_2", 3), "shoes": ("shoes_2", 0), "steamcup": ("steamcup_2", 1), "crowd": ("crowd_0", 2),
    "cinema": ("cinema_0", 0), "fish": ("fish_1", 3), "bubble": ("bubble_1", 2), "germany": ("germany_1", 6), "pasadena": ("pasadena_0", 1), "oldlab": ("oldlab_0", 0),
    "stockholm": ("stockholm_2", 2), "geneva": ("geneva_0", 0), "lab2": ("lab2_0", 2), "banana": ("banana_2", 2), "lightning": ("lightning_0", 0),
    "nightsky": ("nightsky_1", 2), "nightsky2": ("milkyway_0", 0), "sunearth": ("sunearth_1", 2), "westminster": ("westminster_0", 10), "milkyway": ("milkyway_1", 0),
}

SHOTS = []
for i, s in enumerate(S):
    d = dict(start=sec(s[0]), end=sec(S[i + 1][0]) if i + 1 < len(S) else FILM_END, kind=s[1])
    if s[1] == "3d":
        d.update(k=s[2], mode=s[3], ov=s[4])
    elif s[1] == "v":
        d.update(clip=s[2], ov=s[3], ss=s[4] if len(s) > 4 else None)
    elif s[1] in ("p", "f"):
        d.update(img=s[2], ov=s[3])
    elif s[1] == "q":
        d.update(imgs=s[2], names=s[3], ov=s[4])
    else:
        d.update(ov=s[2])
    d["ov"] = [tuple(o[:-2]) + (sec(o[-2]), sec(o[-1]) if o[-1] is not None else None) for o in d["ov"]]
    SHOTS.append(d)

if __name__ == "__main__":
    from collections import Counter
    dur = Counter()
    for s in SHOTS:
        dur[s["kind"]] += s["end"] - s["start"]
    print(len(SHOTS), "shots;", {k: f"{v / FILM_END:.0%}" for k, v in dur.items()})
    kk = Counter()
    for s in SHOTS:
        if s["kind"] == "3d": kk[s["k"]] += s["end"] - s["start"]
    print({k: round(v) for k, v in kk.most_common()})
    print("long:", [(s["start"], s["kind"], round(s["end"] - s["start"], 1)) for s in SHOTS if s["end"] - s["start"] > 12])
    bad = [(s["start"], o) for s in SHOTS for o in s["ov"] if o[-2] < s["start"] - 0.01 or (o[-1] or 0) > s["end"] + 0.01]
    print("ov outside shot:", bad)
