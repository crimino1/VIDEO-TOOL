"""The film list. Times come from the voiceover. One source of truth: Manim shots and the HyperFrames root both read it.

"m" = Manim class rendered to assets/manim/<name>.mp4
"p" = photo shot built in HyperFrames: img, optional caps [(text, "start", style)], layout full|portrait
"""
FILM_END = 831.63


def sec(s):
    if isinstance(s, (int, float)):
        return float(s)
    m, x = s.split(":")
    return int(m) * 60 + float(x)


S = [
    # --- hook
    ("0:00.00", "m", "Open"),
    ("0:05.59", "p", "phone", dict(img="phone")),
    ("0:07.11", "p", "sun1", dict(img="sun", kb="in")),
    ("0:08.79", "p", "neon", dict(img="neon", kb="out")),
    ("0:10.99", "m", "AtomsHold"),
    ("0:16.25", "m", "ComesDown"),
    ("0:19.18", "p", "lecture", dict(img="lecture", caps=[("Most people who learn this equation in college", "0:21.14", "low"), ("never actually understand it.", "0:23.30", "low2")])),
    ("0:25.74", "m", "Memorize"),
    ("0:33.22", "m", "Changes"),
    # --- the clockwork years
    ("0:51.11", "p", "solvay1911", dict(img="solvay1911", kb="pan", caps=[("The early 1900s", "0:52.05", "tag")])),
    ("0:57.33", "p", "newton", dict(img="newton", layout="portrait", who="Isaac Newton", line="explained motion")),
    ("0:59.59", "p", "maxwell", dict(img="maxwell", layout="portrait", side="left", who="James Clerk Maxwell", line="explained light")),
    ("1:01.71", "m", "Clockwork"),
    ("1:10.68", "m", "AtomHappened"),
    ("1:14.16", "m", "AtomModel"),
    ("1:23.72", "m", "Spiral"),
    ("1:36.12", "m", "HowFast"),
    ("1:39.86", "m", "AllDead"),
    ("1:51.66", "m", "Stable"),
    ("1:54.38", "p", "h_tube", dict(img="h_tube", kb="in", caps=[("Hydrogen gas, glowing", "1:56.18", "tag")])),
    ("1:59.34", "m", "Barcode"),
    ("2:05.12", "m", "Stairs"),
    ("2:13.06", "m", "Why"),
    # --- the two ingredients
    ("2:20.74", "m", "TwoIdeas"),
    ("2:28.72", "m", "Packets"),
    ("2:42.66", "m", "Ehf"),
    ("2:51.83", "p", "uv", dict(img="uv", kb="in", caps=[("Ultraviolet: big chunks of energy", "2:52.10", "low")])),
    ("2:55.31", "p", "radio", dict(img="radio", kb="out", caps=[("Radio: tiny chunks, they pass right through", "2:55.50", "low")])),
    ("2:58.53", "m", "Hbar"),
    ("3:15.52", "p", "debroglie", dict(img="debroglie", layout="portrait", who="Louis de Broglie", line="PhD student, 1924",
                                       quote=[("If waves can act like particles,", "3:26.33"), ("can particles act like waves?", "3:28.88"), ("Yes.", "3:33.12")])),
    ("3:34.68", "m", "EveryParticle"),
    ("3:54.08", "m", "Diffraction"),
    ("4:02.88", "p", "ripples", dict(img="ripples", kb="in")),
    ("4:04.42", "m", "WhatEq"),
    # --- the story
    ("4:16.56", "p", "eth", dict(img="eth", kb="in", caps=[("Zürich, 1925", "4:17.50", "tag")])),
    ("4:19.66", "p", "debye1", dict(img="debye", layout="portrait", who="Peter Debye", line="")),
    ("4:22.24", "p", "schrod1", dict(img="schrodinger", layout="portrait", side="left", who="Erwin Schrödinger", line="")),
    ("4:27.20", "p", "debye2", dict(img="debye", layout="portrait", who="Peter Debye", line="", quote=[("If there's a wave,", "4:28.44"), ("there ought to be a wave equation.", "4:30.92")])),
    ("4:33.60", "p", "schrod2", dict(img="schrodinger", layout="portrait", side="left", who="Erwin Schrödinger", line="", kb="in")),
    ("4:35.94", "p", "arosa", dict(img="arosa", kb="pan", caps=[("Christmas 1925", "4:36.66", "tag"), ("Arosa, Swiss Alps", "4:40.74", "tag2")])),
    ("4:44.62", "m", "Published"),
    ("4:51.57", "p", "city", dict(img="city", kb="in", caps=[("One holiday.", "4:51.70", "mid"), ("One equation.", "4:52.91", "mid2"), ("The entire modern world.", "4:54.11", "mid3")])),
    ("4:57.31", "m", "LetsBuild"),
    # --- the build
    ("5:01.73", "m", "EnergySentence"),
    ("5:34.47", "m", "Corkscrew"),
    ("5:51.26", "m", "SpaceRule"),
    ("6:17.63", "m", "TimeRule"),
    ("6:26.70", "m", "Hiding"),
    ("6:34.86", "m", "Dictionary"),
    ("6:48.64", "m", "Translate"),
    ("7:31.34", "m", "NotMagic"),
    ("7:48.20", "m", "Fair"),
    ("8:04.51", "m", "Compact"),
    # --- what is the wave
    ("8:24.23", "m", "WhatWave"),
    ("8:33.06", "p", "water", dict(img="water", kb="in", caps=[("Water moving", "8:33.30", "low")])),
    ("8:35.60", "m", "AirWave"),
    ("8:39.90", "m", "Cloud"),
    ("8:45.08", "p", "born1", dict(img="born", layout="portrait", who="Max Born", line="1926")),
    ("8:51.37", "m", "Possibility"),
    ("9:11.94", "m", "NoSpot"),
    ("9:29.24", "p", "einstein", dict(img="einstein", layout="portrait", who="Albert Einstein", line="", quote=[("God does not play dice", "9:33.26"), ("with the universe.", "9:34.98")])),
    ("9:36.72", "p", "born2", dict(img="born", layout="portrait", side="left", who="Max Born", line="every experiment since agrees", kb="in")),
    ("9:40.32", "p", "schrod3", dict(img="schrodinger", layout="portrait", who="Erwin Schrödinger", line="")),
    ("9:46.84", "m", "Cat"),
    ("10:14.74", "p", "solvay1927", dict(img="solvay", kb="pan", caps=[("Still argued about today", "10:15.52", "tag")])),
    # --- the equation answers
    ("10:19.36", "m", "Recap"),
    ("10:30.08", "p", "guitar", dict(img="guitar", kb="in")),
    ("10:32.18", "m", "GuitarString"),
    ("10:49.68", "m", "ParticleBox"),
    ("11:18.21", "m", "Orbitals"),
    ("11:31.11", "m", "LowestStep"),
    ("11:50.62", "m", "Jump"),
    # --- the world it built
    ("12:15.60", "p", "sun2", dict(img="sun", kb="out", caps=[("Quantum tunneling", "12:19.80", "tag")])),
    ("12:21.89", "m", "Tunnel"),
    ("12:32.55", "p", "chip", dict(img="chip", kb="in", caps=[("Billions of transistors", "12:34.55", "low")])),
    ("12:39.71", "p", "laser", dict(img="laser", caps=[("Lasers", "12:39.80", "low")])),
    ("12:40.79", "p", "led", dict(img="led", caps=[("LEDs", "12:40.90", "low")])),
    ("12:41.91", "p", "mri", dict(img="mri", caps=[("MRI scanners", "12:42.00", "low")])),
    ("12:43.29", "p", "solar", dict(img="solar", caps=[("Solar panels", "12:43.40", "low")])),
    ("12:44.63", "p", "chem", dict(img="chem", caps=[("Chemistry itself", "12:44.75", "low")])),
    ("12:46.32", "p", "waterbend", dict(img="waterbend", kb="in")),
    ("12:48.44", "p", "gold", dict(img="gold", kb="in")),
    ("12:49.92", "p", "wire", dict(img="wire", kb="out")),
    ("12:53.62", "m", "Reprise"),
    ("12:58.00", "p", "arosa2", dict(img="arosa", kb="out", caps=[("A hundred years ago", "13:00.32", "tag")])),
    # --- close
    ("13:02.01", "m", "Terrifying"),
    ("13:19.42", "p", "you", dict(img="you", kb="in", caps=[("Trillions of tiny waves", "13:21.84", "low")])),
    ("13:24.22", "m", "Waves"),
    ("13:33.22", "m", "Music"),
    ("13:36.54", "m", "Outro"),
]

SHOTS = []
for i, row in enumerate(S):
    st = sec(row[0])
    en = sec(S[i + 1][0]) if i + 1 < len(S) else FILM_END
    SHOTS.append(dict(start=st, end=en, kind=row[1], name=row[2], **(row[3] if len(row) > 3 else {})))

BY_NAME = {s["name"]: s for s in SHOTS}

if __name__ == "__main__":
    m = sum(s["end"] - s["start"] for s in SHOTS if s["kind"] == "m")
    print(len(SHOTS), "shots,", sum(s["kind"] == "m" for s in SHOTS), "manim", f"{m:.0f}s of {FILM_END}s = {m/FILM_END:.0%}")
    assert all(a["start"] < a["end"] for a in SHOTS)
    print("longest:", sorted(((round(s["end"] - s["start"], 1), s["name"]) for s in SHOTS), reverse=True)[:6])
