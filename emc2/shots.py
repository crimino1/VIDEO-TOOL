"""Film list: "Nobody Explained E = mc² Like THIS!" (10:43 + 2 s hold). Style v2.1 documentary 3D + real footage/photos.
Shot kinds: 3d / v (CLIPS) / p / f / q / card. Overlays: line, cap, capt, eq, big, title."""
FILM_END = 645.40


def sec(s):
    if isinstance(s, (int, float)):
        return float(s)
    m, x = s.split(":")
    return int(m) * 60 + float(x)


S = [
    # ---------------- HOOK: THE CUP OF CHAI
    ("0:00.00", "v", "chaipour", []),
    ("0:04.44", "3d", "chai", "hot", []),
    ("0:08.40", "3d", "chai", "seal", [("line", "Even sealed, so nothing escapes.", "0:10.9", "0:15.2")]),
    ("0:19.00", "3d", "chai", "scale", [("big", "< 0.000 000 000 5 g", "less than half a billionth of a gram", "0:19.3", "0:24.9")]),
    ("0:25.18", "3d", "chai", "title", [("title", "Nobody explained it like this", "E = mc²", "The most famous line in science", "0:28.9", "0:32.1")]),
    ("0:32.32", "3d", "props", "mug", []),
    ("0:43.16", "v", "class", []),
    ("0:46.76", "card", [("big", "What is E = mc² really saying?", "", "0:48.2", "0:52.0")]),
    ("0:52.12", "3d", "chai", "heavier", []),
    ("0:54.78", "3d", "atom", "metal", []),
    ("0:59.98", "v", "sunrise", []),
    # ---------------- 1905
    ("1:04.84", "v", "bern", [("cap", "Bern, Switzerland", "1:05.2", None)]),
    ("1:11.08", "v", "bern2", [("cap", "Albert Einstein · 26 · patent clerk", "1:11.3", None)]),
    ("1:17.12", "3d", "patent", "desk", [("cap", "Swiss Patent Office, Bern", "1:17.5", "1:22.0")]),
    ("1:24.08", "3d", "paper", "papers", [("cap", "Annalen der Physik · 1905", "1:28.8", "1:34.0"),
                                          ("eq", "E = mc²", "as we write it today", "1:35.0", "1:39.6")]),
    ("1:39.84", "3d", "paper", "letter", [("line", "Amusing and appealing, he wrote. But maybe the Lord was laughing at him.", "1:43.2", "1:51.4")]),
    # ---------------- THE LETTERS
    ("1:51.62", "3d", "letters", "e", [("cap", "E · energy", "1:55.4", "2:00.6")]),
    ("2:00.80", "3d", "letters", "m", [("cap", "m · mass", "2:00.9", "2:07.5")]),
    ("2:07.72", "3d", "letters", "c", [("big", "300,000 km/s", "c · the speed of light", "2:09.2", "2:13.8"),
                                       ("line", "What is the speed of light doing in an equation about mass?", "2:16.7", "2:20.7")]),
    # ---------------- AN EXCHANGE RATE
    ("2:20.90", "v", "rupees", []),
    ("2:25.72", "3d", "exchange", "money", [("line", "Same value, different currency.", "2:31.1", "2:33.7")]),
    ("2:33.84", "3d", "exchange", "rate", [("eq", "E = m × c²", "c² is the exchange rate", "2:42.0", "2:45.8")]),
    ("2:45.96", "3d", "exchange", "huge", [("big", "c² = 90,000 trillion", "in metres and seconds", "2:53.2", "2:58.9")]),
    ("2:59.14", "3d", "paperclip", "gram", [("cap", "1 gram · about one paperclip", "2:59.6", "3:04.0"),
                                            ("big", "90 trillion joules", "", "3:06.8", "3:08.9")]),
    ("3:09.04", "v", "indiahome", [("line", "Enough to power an average Indian home for about 20,000 years.", "3:10.2", "3:15.6")]),
    ("3:15.78", "3d", "chai", "divide", [("eq", "Δm = E ÷ c²", "", "3:24.5", "3:29.8"),
                                         ("line", "Energy is cheap in grams.", "3:30.2", "3:32.0"),
                                         ("line", "Grams are expensive in energy.", "3:32.2", "3:34.5")]),
    # ---------------- NOT JUST BOMBS
    ("3:34.68", "card", [("big", "The part most people get wrong.", "", "3:34.9", "3:37.5")]),
    ("3:37.68", "v", "reactor", []),
    ("3:47.02", "3d", "balance", "add", [("line", "Anything that has energy also has mass.", "3:53.0", "3:56.0"),
                                         ("line", "Always.", "4:01.8", "4:02.9")]),
    ("4:03.00", "v", "phone", [("line", "Charge a phone: heavier by less than a billionth of a gram.", "4:03.4", "4:07.9")]),
    ("4:08.04", "3d", "balance", "spring", []),
    ("4:11.56", "3d", "chai", "heavier2", []),
    ("4:14.50", "v", "fire", []),
    ("4:22.42", "3d", "balance", "log", [("line", "That missing mass left as heat and light.", "4:27.1", "4:30.6")]),
    ("4:30.78", "v", "campfire", [("line", "Every fire you've ever sat beside was making things a little lighter.", "4:31.0", "4:35.1")]),
    ("4:35.26", "v", "fire2", []),
    # ---------------- WHERE YOUR MASS COMES FROM
    ("4:42.00", "v", "hand", []),
    ("4:47.98", "3d", "atom", "zoom", []),
    ("4:59.28", "3d", "atom", "sum", [("big", "≈ 1%", "the quarks' share of a proton's mass", "5:05.7", "5:09.6"),
                                      ("line", "The rest is energy.", "5:09.7", "5:11.3")]),
    ("5:11.46", "3d", "atom", "binding", []),
    ("5:23.74", "3d", "atom", "pullback", [("big", "≈ 99%", "of your weight is energy locked in place", "5:24.0", "5:30.6")]),
    ("5:30.90", "v", "bathscale", [("eq", "m = E ÷ c²", "", "5:31.4", "5:37.2")]),
    # ---------------- 1932: THE FIRST TEST
    ("5:37.46", "v", "cambridge", [("cap", "Cambridge, England", "5:41.4", "5:45.8"), ("cap", "John Cockcroft and Ernest Walton · 1932", "5:46.1", "5:50.3")]),
    ("5:50.52", "3d", "lithium", "split", [("line", "The energy matched the missing mass.", "5:58.0", "6:02.6")]),
    # ---------------- LISE MEITNER
    ("6:02.88", "v", "snowforest", []),
    ("6:07.46", "v", "berlin", [("cap", "Lise Meitner · physicist, Berlin", "6:07.7", None)]),
    ("6:11.96", "v", "lab", []),
    ("6:16.44", "v", "train", []),
    ("6:24.46", "v", "snowtown", []),
    ("6:28.22", "v", "snowtown2", [("cap", "Otto Frisch · her nephew · Christmas 1938", "6:28.5", None)]),
    ("6:33.30", "v", "letter", [("cap", "A letter from chemist Otto Hahn in Berlin", "6:33.5", None)]),
    ("6:37.10", "3d", "fission", "barium", []),
    ("6:47.68", "v", "ski", []),
    ("6:54.92", "3d", "snow", "trunk", []),
    ("6:59.60", "3d", "fission", "split", [("big", "≈ 200 million eV", "from every single split", "7:08.7", "7:12.7")]),
    ("7:12.88", "3d", "fission", "mass", []),
    ("7:26.82", "3d", "snow", "calc", [("eq", "Δm × c² ≈ 200 MeV", "", "7:30.4", "7:34.6"), ("line", "The numbers matched.", "7:34.7", "7:36.0")]),
    ("7:36.12", "3d", "fission", "match", []),
    ("7:40.68", "card", [("big", "Fission.", "", "7:40.8", "7:42.6")]),
    # ---------------- HIROSHIMA
    ("7:42.68", "v", "hiroshima", [("cap", "Hiroshima · the A-Bomb Dome today", "7:46.4", None)]),
    ("7:51.40", "3d", "hiroshima", "mass", [("big", "≈ 0.7 g", "the mass that truly vanished", "7:58.3", "8:04.7")]),
    ("8:04.96", "v", "snowforest2", [("line", "Meitner refused to help build the bomb.", "8:07.6", "8:11.2")]),
    ("8:11.46", "card", [("big", "Nobel Prize in Chemistry, 1944", "awarded to Otto Hahn alone", "8:11.6", "8:14.8")]),
    ("8:14.96", "v", "snowforest3", []),
    ("8:18.36", "3d", "snow", "end", [("line", "Meitner was left out.", "8:24.0", "8:26.4")]),
    ("8:26.60", "3d", "props", "tile", []),
    # ---------------- THE SUN
    ("8:31.56", "v", "sunrise2", []),
    ("8:38.28", "3d", "sun", "core", [("big", "0.7%", "of the mass disappears", "8:49.8", "8:53.2")]),
    ("8:53.38", "3d", "sun", "lose", [("big", "≈ 4 million tonnes", "of mass every second", "8:55.0", "9:00.4"),
                                      ("cap", "for 4.5 billion years", "9:00.6", "9:04.6")]),
    ("9:09.18", "v", "sunface", [("line", "Mass the sun gave up, about eight minutes ago.", "9:14.0", "9:17.6")]),
    # ---------------- A HOSPITAL
    ("9:17.74", "v", "scanner", []),
    ("9:26.96", "3d", "pet", "annihilate", [("line", "E = mc², hunting for illness.", "9:42.3", "9:46.4")]),
    # ---------------- WHAT IT REALLY SAYS
    ("9:46.52", "3d", "exchange", "recap", [("line", "Mass is energy, packed into a very concentrated form.", "9:53.7", "9:57.6")]),
    ("9:57.82", "3d", "paperclip", "recap", []),
    ("10:05.90", "3d", "balance", "recap", []),
    ("10:11.96", "v", "fire3", []),
    ("10:13.08", "v", "phone2", []),
    ("10:14.38", "3d", "sun", "star", []),
    ("10:16.16", "3d", "atom", "you", [("line", "Most of what you weigh is energy.", "10:17.4", "10:23.2")]),
    ("10:23.46", "3d", "chai", "cool", []),
    ("10:36.52", "3d", "paper", "laugh", []),
    ("10:40.76", "3d", "chai", "end", [("line", "Every cooling cup of chai says it wasn't.", "10:40.9", None)]),
]

CLIPS = {
    "chaipour": ("chaipour_2", 0), "class": ("class_0", 0), "sunrise": ("sunrise_2", 0), "bern": ("bern_1", 2), "rupees": ("rupees_2", 0),
    "reactor": ("reactor_0", 2), "phone": ("phone_0", 0), "phone2": ("phone_0", 6), "fire": ("fire_2", 0), "fire2": ("fire_1", 4), "fire3": ("fire_0", 3),
    "campfire": ("campfire_2", 0), "hand": ("hand_1", 0), "bathscale": ("bathscale_0", 0), "snowforest": ("snowforest_0", 0), "train": ("train_1", 2),
    "snowtown": ("snowtown_1", 0), "ski": ("ski_1", 0), "sunrise2": ("sunrise2_0", 2), "sunface": ("sunface_0", 0), "scanner": ("scanner_2", 0),
    "indiahome": ("indiahome_0", 0), "bern2": ("bern_2", 0), "cambridge": ("cambridge_0", 0), "berlin": ("berlin_1", 0), "lab": ("lab_1", 0),
    "snowtown2": ("snowtown_0", 4), "letter": ("letter_2", 0), "hiroshima": ("hiroshima_0", 0), "snowforest2": ("snowforest_1", 6), "snowforest3": ("snowforest_2", 0),
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
    print("long cards:", [(s["start"], round(s["end"] - s["start"], 1)) for s in SHOTS if s["kind"] == "card" and s["end"] - s["start"] > 5.5])
