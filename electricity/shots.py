"""Film list: "Where Does Electricity Go When You Flip the Switch Off?" (13:00 + 2 s hold). Style v2.1 documentary 3D + real footage.
Shot kinds as in the black holes film: 3d / v (CLIPS) / p / f / q / card. Overlays: line, cap, capt, eq, big, title."""
FILM_END = 781.60


def sec(s):
    if isinstance(s, (int, float)):
        return float(s)
    m, x = s.split(":")
    return int(m) * 60 + float(x)


S = [
    # ---------------- HOOK
    ("0:00.00", "3d", "switch3d", "press", []),
    ("0:05.46", "v", "lamp", []),
    ("0:06.68", "3d", "wire", "zoom", [("big", "130 billion trillion", "free electrons in one metre of wire", "0:11.6", "0:18.3")]),
    ("0:18.66", "3d", "pipe", "drain", [("line", "Did they drain away like water?", "0:21.9", "0:24.6"), ("line", "Rush back to the power plant?", "0:24.8", "0:27.1"), ("line", "Simply switch off?", "0:27.3", "0:29.8")]),
    ("0:30.00", "card", [("big", "None of those.", "", "0:30.1", "0:31.6"), ("big", "Most of what we were taught was a little bit wrong.", "", "0:31.8", "0:36.9")]),
    ("0:37.10", "v", "citynight", [("line", "When you switch off a light, where does the electricity actually go?", "0:38.9", "0:42.8")]),
    ("0:43.00", "3d", "wire", "inside", []),
    ("0:49.18", "v", "pylons", [("line", "A place hundreds of kilometres away feels it every time.", "0:52.3", "0:57.0")]),
    # ---------------- THE WATER PIPE MYTH
    ("0:57.24", "3d", "pipe", "myth", [("cap", "The picture most of us carry", "0:57.6", "1:00.9")]),
    ("1:10.56", "3d", "wire", "drift", [("eq", "≈ 0.2 mm per second", "Electron drift speed · 1.5 mm² copper wire, 4 amps", "1:33.0", "1:37.4")]),
    ("1:37.54", "v", "snail", [("cap", "A garden snail is faster", "1:37.8", None)]),
    ("1:40.00", "3d", "wire", "journey", [("big", "≈ 30 years", "for an electron to travel 200 km", "1:42.0", "1:48.2")]),
    ("1:48.44", "card", [("big", "The light comes on instantly.", "", "1:48.6", "1:53.5")]),
    ("1:53.72", "v", "lamp2", [("line", "If the electrons crawl slower than a snail, how is that possible?", "1:53.9", "1:58.0")]),
    ("1:58.26", "3d", "wire", "ac", [("cap", "Alternating current · 50 times a second", "2:00.2", "2:09.2"),
                                     ("big", "≈ 1/1000 mm", "how far each electron swings", "2:17.3", "2:23.2")]),
    ("2:26.76", "3d", "wire", "years", [("line", "The same electrons that were there the day it was installed.", "2:27.0", "2:34.8")]),
    ("2:37.82", "card", [("big", "No electron from the power plant has ever reached your home.", "", "2:38.0", "2:41.6")]),
    ("2:41.82", "v", "saw", [("line", "It never travels anywhere. It still cuts the wood.", "2:43.7", "2:48.7")]),
    # ---------------- WRONG-WAY ARROWS
    ("2:48.90", "3d", "textbook", "arrows", []),
    ("2:54.56", "q", ["franklin"], [("Benjamin Franklin", "Named positive and negative · 1740s")], []),
    ("3:01.90", "q", ["thomson"], [("J. J. Thomson", "Discovered the electron · 1897")], []),
    ("3:05.40", "3d", "textbook", "flip", [("line", "Nobody ever changed the arrows.", "3:12.5", "3:14.8")]),
    ("3:14.94", "card", [("big", "If the electrons never arrive, what does?", "", "3:16.8", "3:19.9")]),
    # ---------------- THE PUSH
    ("3:20.06", "3d", "marbles", "push", [("big", "230 volts", "the push in an Indian wall socket", "3:25.9", "3:30.4"),
                                          ("line", "No single marble made the trip. The push did.", "3:40.9", "3:44.4")]),
    ("3:44.56", "v", "coalplant", [("line", "A power plant doesn't send you electrons. It sends you a push.", "3:44.8", "3:51.2")]),
    ("3:51.46", "3d", "poynting", "intro", [("line", "What arrives is energy.", "3:51.6", "3:57.5")]),
    # ---------------- POYNTING AND HEAVISIDE
    ("3:57.70", "q", ["poynting"], [("John Henry Poynting", "Physicist · 1884")], []),
    ("4:03.90", "f", "poyntingfig", [("cap", "From Poynting's 1884 paper", "4:04.2", None)]),
    ("4:10.30", "q", ["heaviside"], [("Oliver Heaviside", "Self-taught · telegraph operator")], []),
    ("4:14.00", "3d", "poynting", "fields", [("line", "The energy flows through the fields around the wire.", "4:22.3", "4:29.7")]),
    ("4:48.10", "v", "railway", [("line", "Tracks don't carry passengers. They guide the train.", "4:50.6", "4:55.5")]),
    ("4:55.74", "3d", "poynting", "speed", [("line", "Snail-slow electrons. Lightning-fast energy.", "5:07.2", "5:11.8")]),
    # ---------------- WHAT YOU PAY FOR
    ("5:12.00", "3d", "bill", "units", [("big", "1 unit = 1 kilowatt-hour", "a 1000 W heater for one hour", "5:23.4", "5:29.2"),
                                        ("big", "100 hours", "for a 10 W LED to use one unit", "5:29.4", "5:33.8")]),
    ("5:33.96", "v", "chain", [("line", "The chain never gets used up. The effort gets delivered.", "5:39.7", "5:44.1")]),
    ("5:44.28", "3d", "wire", "stay", [("line", "The electrons stay put. The energy is what moves.", "5:57.9", "6:02.2")]),
    # ---------------- THE SWITCH
    ("6:02.46", "3d", "switch3d", "cutaway", [("cap", "A gap of air a few millimetres wide", "6:12.0", "6:18.5")]),
    ("6:20.60", "3d", "wire", "still", [("line", "They just sit.", "6:33.4", "6:34.9")]),
    ("6:35.00", "3d", "switch3d", "spark", []),
    ("6:51.56", "v", "breaker", [("line", "Turning off a light does not make the wiring safe to touch.", "6:58.7", "7:03.1")]),
    # ---------------- WHERE THE ENERGY GOES
    ("7:06.18", "v", "led", [("cap", "Light and heat", "7:12.2", None)]),
    ("7:15.00", "3d", "room", "light", [("big", "300,000 km/s", "", "7:17.1", "7:21.0")]),
    ("7:35.60", "v", "nighthouse", []),
    ("7:47.94", "3d", "room", "space", [("line", "The electrons stay home. The energy leaves the planet.", "7:56.3", "8:00.3")]),
    # ---------------- THE GRID
    ("8:00.56", "v", "pylons2", [("line", "Something changes far away from your house.", "8:03.9", "8:09.2")]),
    ("8:09.44", "v", "coalplant2", [("cap", "Most of India's electricity comes from coal", "8:12.4", None)]),
    ("8:16.46", "3d", "generator", "station", []),
    ("8:30.52", "q", ["faraday"], [("Michael Faraday", "Bookbinder's apprentice · 1791–1867")], []),
    ("8:40.78", "3d", "generator", "faraday", [("cap", "1831", "8:41.0", "8:46.0")]),
    ("8:51.76", "v", "turbine", [("line", "Nearly every big power station still runs on his idea.", "8:52.0", "8:55.8")]),
    ("8:56.00", "3d", "grid", "store", [("line", "Most power is made at the same moment it's used.", "9:15.2", "9:18.3")]),
    ("9:24.02", "v", "fan", []),
    ("9:28.00", "3d", "grid", "tug", [("big", "50 Hz", "India's grid frequency", "9:40.6", "9:44.4")]),
    ("9:51.08", "v", "control", []),
    ("10:00.08", "3d", "grid", "cascade", [("line", "It spreads like falling dominoes.", "10:38.2", "10:40.5")]),
    # ---------------- 2012
    ("10:45.66", "3d", "indiamap", "jul30", [("capt", "30 July 2012", "10:46.0", None)]),
    ("11:01.80", "3d", "indiamap", "jul31", [("capt", "31 July 2012 · about 1 pm", "11:02.0", None),
                                             ("big", "≈ 620 million people", "about half of India", "11:09.8", "11:15.9")]),
    ("11:16.22", "card", [("big", "The biggest blackout in history.", "", "11:16.4", "11:19.0")]),
    ("11:19.16", "v", "indiatrain", []),
    ("11:21.86", "v", "candle", []),
    ("11:27.62", "v", "mine", [("line", "More than 200 miners were stuck underground in the dark.", "11:28.0", "11:38.0")]),
    ("11:38.22", "3d", "grid", "mine", [("big", "≈ 6 hours", "", "11:38.4", "11:40.5"), ("line", "All of them made it home.", "11:46.0", "11:48.0")]),
    ("11:48.22", "v", "coal", [("line", "The grid trapped the very people keeping it alive.", "11:53.4", "11:58.1")]),
    ("11:58.36", "v", "dam", [("cap", "Hydroelectric plants can start on their own", "12:07.7", None)]),
    ("12:13.78", "3d", "indiamap", "restore", []),
    # ---------------- ANSWER
    ("12:20.48", "3d", "wire", "answer", [("line", "The electrons go nowhere. They stop jiggling and sit.", "12:24.6", "12:33.0")]),
    ("12:33.26", "3d", "poynting", "energy", [("line", "The energy was the part that moved.", "12:33.4", "12:39.0")]),
    ("12:39.06", "3d", "room", "space2", []),
    ("12:44.14", "3d", "grid", "end", []),
    ("12:51.88", "3d", "switch3d", "end", [("line", "You didn't empty the wire.", "12:55.8", "12:57.5"), ("line", "You just told it to stop pushing.", "12:57.6", None)]),
]

CLIPS = {
    "lamp": ("lamp_0", 0), "lamp2": ("lamp_0", 6), "citynight": ("citynight_0", 0), "pylons": ("pylons_0", 0), "pylons2": ("pylons_2", 0),
    "snail": ("snail_0", 5), "saw": ("saw_2", 0), "railway": ("railway_0", 2), "coalplant": ("coalplant_1", 0), "coalplant2": ("coalpower_0", 2),
    "chain": ("chain_1", 0), "breaker": ("breaker_0", 0), "led": ("ledon_2", 0), "turbine": ("turbine_0", 4), "fan": ("fan_1", 0),
    "control": ("control_0", 0), "indiatrain": ("indiatrain_0", 3), "metro": ("metro_1", 2), "traffic": ("traffic_2", 0), "mine": ("mine_0", 0),
    "mine2": ("mine_0", 14), "dam": ("dam_1", 0), "nighthouse": ("nighthouse_0", 2), "candle": ("outage_2", 2), "coal": ("coal_0", 3),
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
