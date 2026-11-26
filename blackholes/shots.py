"""Film list: "How Did Humans Discover Black Holes?" (24:39). Style v2.1 documentary (channels/physics.md) + more real footage:
3D only where a camera can't show the idea; stock video, real NASA/ESO/EHT/LIGO images and portraits for the rest.

Shot kinds
  ("3d", kind, mode, ov)          3D scene (assets/js/k_*.js)
  ("v", clip, ov[, ss])           stock video (CLIPS maps subject -> file, in-point ss seconds)
  ("p", img, ov)                  full-screen photo, slow push-in
  ("f", img, ov)                  framed image on dark (diagrams, small archival photos, scientific images that must not be cropped)
  ("q", [imgs], [(name, meta)], ov)   portrait card(s); missing image -> name-only card
  ("card", ov)                    black card
Overlay items as in strings: line, cap, capt, eq, big, title.
"""
FILM_END = 1481.50


def sec(s):
    if isinstance(s, (int, float)):
        return float(s)
    m, x = s.split(":")
    return int(m) * 60 + float(x)


S = [
    # ---------------- COLD OPEN
    ("0:00.00", "v", "telescope", []),
    ("0:03.60", "3d", "eyepiece", "open", []),
    ("0:06.50", "v", "nightsky", []),
    ("0:09.20", "3d", "notebook", "field", [("cap", "The equations of gravity", "0:12.6", "0:19.2")]),
    ("0:23.42", "f", "cygx1art", [("cap", "Cygnus X-1 · artist's impression (NASA)", "0:24.2", None)]),
    ("0:29.54", "f", "m87", [("cap", "The first image · Event Horizon Telescope · 2019", "0:31.0", None)]),
    ("0:36.50", "3d", "escape", "intro", []),
    ("0:40.68", "3d", "escape", "toss", []),
    ("0:50.70", "3d", "escape", "throws", [("big", "11.2 km/s", "Earth's escape velocity", "1:09.3", "1:16.8"),
                                           ("line", "The stronger the gravity, the faster you must go to escape it.", "1:29.4", "1:33.0")]),
    ("1:33.16", "3d", "shrink", "full", [("cap", "Earth squeezed to the size of a marble", "2:03.8", "2:11.5"),
                                         ("line", "Not a stone, not a rocket, not light itself.", "2:16.0", "2:19.7")]),
    ("2:19.90", "card", [("big", "That is where the idea of a black hole was born.", "", "2:20.1", "2:24.3"), ("big", "But an idea isn't a discovery.", "", "2:24.6", "2:27.0")]),
    ("2:27.00", "v", "observatory2", [("line", "How did a strange thought become real black holes in space?", "2:27.3", "2:33.2")]),
    ("2:35.74", "v", "stargaze", []),
    # ---------------- 1783: DARK STARS
    ("2:42.30", "v", "church", [("capt", "Yorkshire, England · 1783", "2:44.9", None)]),
    ("2:52.98", "q", ["michell"], [("John Michell", "Clergyman and natural philosopher · 1724–1793")], []),
    ("3:00.08", "3d", "darkstar", "light", [("line", "He called these objects dark stars.", "3:20.9", "3:23.9")]),
    ("3:24.04", "3d", "darkstar", "binary", [("line", "A star moving around nothing.", "3:31.4", "3:37.4")]),
    ("3:40.20", "q", ["laplace"], [("Pierre-Simon Laplace", "Mathematician · 1749–1827")], []),
    ("3:46.70", "v", "nightsky2", []),
    ("3:55.60", "card", [("big", "Newton's gravity pulled on things that have weight.", "", "3:55.8", "3:59.0"), ("big", "Does light have weight?", "Nobody could say", "3:59.3", "4:02.3")]),
    ("4:02.30", "3d", "notebook", "michell", [("cap", "A clever guess, left on the shelf for 100 years", "4:03.0", None)]),
    # ---------------- 1915: GRAVITY IS CURVED SPACE
    ("4:09.16", "q", ["einstein1915"], [("Albert Einstein", "General relativity · November 1915")], []),
    ("4:18.96", "3d", "spacetime", "tug", []),
    ("4:35.38", "3d", "trampoline", "full", []),
    ("5:02.68", "3d", "spacetime", "light", [("line", "That includes light.", "5:06.6", "5:08.0")]),
    ("5:08.10", "q", ["eddington"], [("Arthur Eddington", "Astronomer · 1882–1944")], []),
    ("5:14.36", "f", "eclipse1919", [("cap", "Eclipse plate · 29 May 1919", "5:14.8", None)]),
    ("5:21.26", "3d", "lightbend", "full", [("line", "Gravity can bend light.", "5:24.3", "5:26.6")]),
    # ---------------- 1916: SCHWARZSCHILD
    ("5:35.96", "q", ["schwarzschild"], [("Karl Schwarzschild", "Astronomer · 1873–1916")], []),
    ("5:39.08", "v", "soldier", [("cap", "Schwarzschild was serving in the war · 1915", "5:40.0", None)]),
    ("5:52.00", "3d", "notebook", "schwarz", []),
    ("6:07.52", "q", ["schwarzschild"], [("Karl Schwarzschild", "Died May 1916")], []),
    ("6:16.06", "3d", "horizon", "radius", [("cap", "The Sun: 3 km", "6:32.7", "6:36.0"), ("cap", "1.4 million km wide", "6:36.2", "6:44.9")]),
    ("6:45.26", "3d", "horizon", "notwall", [("cap", "The event horizon", "6:45.6", "6:51.2")]),
    ("6:57.08", "v", "river", []),
    ("7:07.00", "v", "river2", [("line", "The event horizon is that line — and the current is space itself.", "7:12.96", "7:21.1")]),
    ("7:21.36", "3d", "notebook", "schwarz2", [("line", "By 1916, the black hole existed on paper.", "7:21.5", "7:27.0")]),
    ("7:28.84", "q", ["einstein_old"], [("Albert Einstein", "1939 · argued they could not form")], []),
    ("7:44.14", "v", "sunsurface", [("line", "Can a star collapse that far?", "7:47.1", "7:49.6")]),
    # ---------------- WHY STARS DON'T COLLAPSE
    ("7:54.70", "3d", "starlife", "balance", []),
    ("8:04.00", "v", "sunsurface3", [("cap", "The Sun's core · 15 million °C", "8:04.3", None)]),
    ("8:17.56", "3d", "starlife", "balance", []),
    ("8:34.70", "3d", "starlife", "dwarf", [("cap", "White dwarf · the size of the Earth", "8:40.7", "8:52.2")]),
    ("9:02.18", "f", "liner", [("capt", "1930 · India to England", "9:05.8", None), ("cap", "A liner on the India–England route, 1930s", "9:06.0", None)]),
    ("9:14.84", "q", ["chandra"], [("Subrahmanyan Chandrasekhar", "Age 19 · 1910–1995")], []),
    ("9:24.44", "3d", "notebook", "chandra", [("eq", "1.4 M<sub style='font-size:.5em'>☉</sub>", "The Chandrasekhar limit", "9:26.2", "9:34.7")]),
    ("9:34.90", "q", ["eddington"], [("Arthur Eddington", "London · 1935")], [("line", "He mocked it in front of the room.", "9:37.1", "9:43.4")]),
    ("9:55.72", "q", ["chandra"], [("Subrahmanyan Chandrasekhar", "Nobel Prize · 1983")], []),
    ("10:03.42", "3d", "starlife", "neutron", [("cap", "Neutron star · about 20 km across", "10:15.5", "10:22.5"),
                                               ("line", "A teaspoon would weigh more than a billion tonnes.", "10:22.7", "10:27.6")]),
    ("10:29.52", "q", ["bell"], [("Jocelyn Bell", "Student · 1967")], [("cap", "A ticking radio signal: a spinning neutron star", "10:31.0", None)]),
    ("10:40.02", "3d", "starlife", "limit", [("cap", "Two to three times the Sun", "10:45.3", "10:50.1")]),
    ("10:55.50", "q", ["oppenheimer"], [("J. Robert Oppenheimer", "with Hartland Snyder · 1939")], []),
    ("11:08.56", "3d", "starlife", "collapse", []),
    ("11:17.74", "card", [("big", "1 September 1939", "The paper is published", "11:18.0", "11:21.9")]),
    ("11:22.02", "f", "poland1939", [("cap", "The same day, the Second World War began", "11:22.4", None)]),
    ("11:30.56", "card", [("big", "The paper was mostly ignored for twenty years.", "", "11:30.7", "11:34.3")]),
    ("11:34.40", "q", ["wheeler"], [("John Wheeler", "Physicist · 1911–2008")], [("big", "Black hole", "1967", "11:45.4", "11:50.9")]),
    # ---------------- HOW TO SEE SOMETHING BLACK
    ("11:51.18", "v", "nightsky3", [("line", "How do you find something black in a sky that's black?", "11:53.0", "11:59.5")]),
    ("11:59.72", "3d", "lightband", "full", []),
    ("12:13.36", "v", "stove", [("cap", "A few hundred degrees · red", "12:13.8", None)]),
    ("12:16.78", "v", "sunsurface2", [("cap", "5,500 degrees · yellow-white", "12:17.2", None)]),
    ("12:22.02", "3d", "infall", "full", [("cap", "Millions of degrees · X-rays", "12:22.4", "12:26.3")]),
    ("12:41.30", "3d", "xray", "atmosphere", []),
    ("12:50.58", "f", "aerobee", [("cap", "An Aerobee sounding rocket · 1965", "12:51.0", None)]),
    ("13:01.48", "3d", "xray", "cygnus", [("cap", "Cygnus X-1 · 1964", "13:10.0", None)]),
    ("13:14.98", "f", "uhuru", [("cap", "Uhuru · the first X-ray satellite · 1970", "13:15.4", None)]),
    ("13:29.70", "3d", "flicker", "full", [("line", "An object can't flicker faster than light can cross it.", "13:42.4", "13:46.0")]),
    # ---------------- CYGNUS X-1
    ("13:57.74", "3d", "cygx1", "star", [("cap", "HDE 226868 · a blue supergiant", "14:05.0", "14:12.0")]),
    ("14:17.64", "v", "motorbike", []),
    ("14:30.12", "3d", "cygx1", "doppler", [("cap", "Toward us: bluer · away: redder", "14:32.3", "14:40.6"), ("cap", "One orbit every 5.6 days", "14:51.7", "14:58.3")]),
    ("15:03.30", "f", "hammer", [("cap", "Hammer throw · Olympic Games, 1904", "15:03.6", None)]),
    ("15:17.10", "3d", "cygx1", "weigh", [("line", "Look for a star moving around nothing.", "15:21.6", "15:26.0"),
                                          ("big", "21", "times the mass of the Sun", "15:37.9", "15:41.6")]),
    ("15:41.80", "3d", "cygx1", "suspects", []),
    ("16:02.50", "3d", "cygx1", "disk", []),
    ("16:19.50", "3d", "funnel", "full", []),
    ("16:30.20", "3d", "cygx1", "disk2", [("line", "The black hole itself is black.", "16:50.6", "16:53.4")]),
    ("16:57.48", "q", ["hawking", "thorne"], [("Stephen Hawking", "1942–2018"), ("Kip Thorne", "b. 1940")], [("capt", "1974 · the bet", "17:00.8", None),
                                                                                                         ("line", "By 1990, Hawking paid up.", "17:18.4", "17:24.0")]),
    # ---------------- GIANTS: QUASARS AND THE MILKY WAY
    ("17:24.18", "v", "nightsky4", []),
    ("17:31.28", "q", ["schmidt"], [("Maarten Schmidt", "Astronomer · 1963")], []),
    ("17:39.64", "f", "quasar", [("cap", "Quasar 3C 273 · two billion light-years away", "17:40.0", None)]),
    ("17:54.06", "3d", "galcenter", "approach", [("cap", "Sagittarius A* · 1974", "18:13.0", None)]),
    ("18:18.44", "q", ["ghez", "genzel"], [("Andrea Ghez", "Telescopes in Hawaii"), ("Reinhard Genzel", "Telescopes in Chile")], [("capt", "1990s", "18:18.8", None)]),
    ("18:28.30", "v", "observatory", [("cap", "Infrared light passes through the dust", "18:29.0", None)]),
    ("18:36.80", "3d", "galcenter", "orbits", [("cap", "S2 · one orbit in 16 years", "18:40.9", "18:46.6"), ("cap", "7,000 km per second", "18:51.9", "18:58.2"),
                                               ("big", "4 million", "times the mass of the Sun", "19:02.6", "19:08.4")]),
    ("19:17.86", "q", ["ghez", "genzel"], [("Andrea Ghez", "Nobel Prize 2020"), ("Reinhard Genzel", "Nobel Prize 2020")], []),
    ("19:22.14", "3d", "bhslow", "full", [("line", "Every bit of evidence came from things near black holes.", "19:25.9", "19:32.0")]),
    # ---------------- RIPPLES IN SPACE
    ("19:35.84", "3d", "merger", "ripples", []),
    ("19:51.14", "q", ["einstein_old"], [("Albert Einstein", "doubted they could ever be detected")], []),
    ("19:54.32", "3d", "merger", "ripples", []),
    ("20:22.54", "f", "ligo", [("cap", "LIGO Hanford, Washington", "20:23.0", None)]),
    ("20:30.72", "3d", "merger", "ligo", [("cap", "14 September 2015", "20:45.8", "20:54.4")]),
    ("20:57.26", "f", "gwchirp", [("cap", "The signal: GW150914", "20:57.6", None)]),
    ("21:04.14", "3d", "merger", "masses", [("big", "36 + 29 = 65 → 62", "three suns of mass became gravitational waves", "21:26.3", "21:34.2")]),
    ("21:43.90", "card", [("big", "Only one thing was still missing.", "", "21:44.0", "21:46.2"), ("big", "A picture.", "", "21:46.4", "21:47.84")]),
    # ---------------- THE PHOTOGRAPH
    ("21:47.84", "v", "stargaze2", []),
    ("21:50.20", "3d", "eyepiece", "m87", []),
    ("21:52.00", "3d", "eht", "orange", [("cap", "M87* · 55 million light-years away", "21:56.0", "22:02.2"), ("line", "Like spotting an orange on the Moon.", "22:02.3", "22:06.4")]),
    ("22:10.60", "3d", "eht", "earth", []),
    ("22:19.00", "p", "alma", [("cap", "ALMA, Chile · one of eight observatories", "22:19.4", None)]),
    ("22:25.74", "3d", "eht", "earth", [("cap", "The Event Horizon Telescope · April 2017", "22:31.3", None)]),
    ("22:34.36", "v", "harddrive", []),
    ("22:39.60", "v", "plane", []),
    ("22:43.18", "f", "spt", [("cap", "South Pole Telescope", "22:43.6", None)]),
    ("22:51.20", "f", "m87", [("capt", "10 April 2019", "22:51.4", None), ("cap", "M87* · Event Horizon Telescope", "22:56.1", None)]),
    ("23:01.64", "3d", "eht", "shadow", [("line", "Not the black hole itself — its shadow.", "23:11.3", "23:18.8")]),
    ("23:25.76", "f", "sgra", [("capt", "May 2022", "23:26.0", None), ("cap", "Sagittarius A* · the centre of our galaxy", "23:30.2", None)]),
    # ---------------- RECAP AND ENDING
    ("23:36.24", "card", [("big", "So how did humans discover black holes?", "", "23:36.4", "23:42.4")]),
    ("23:42.58", "3d", "notebook", "michell2", [("cap", "A priest made a guess", "23:42.8", None)]),
    ("23:44.20", "q", ["schwarzschild"], [("Karl Schwarzschild", "A soldier solved an equation")], []),
    ("23:46.44", "f", "liner", [("cap", "A teenager did a calculation on a ship", "23:46.6", None)]),
    ("23:49.02", "q", ["oppenheimer"], [("J. Robert Oppenheimer", "A paper on the first day of a war")], []),
    ("23:51.88", "f", "aerobee", [("cap", "A rocket above the sky", "23:52.0", None)]),
    ("23:54.88", "f", "cygx1art", [("cap", "X-rays from falling gas", "23:58.7", None)]),
    ("24:00.60", "3d", "galcenter", "orbits2", [("cap", "Stars circling an empty point", "24:00.8", None)]),
    ("24:02.30", "f", "ligo", [("cap", "Ripples in space", "24:02.5", None)]),
    ("24:04.10", "f", "m87", [("cap", "A shadow in a photograph", "24:04.3", None)]),
    ("24:06.72", "3d", "bhslow", "end", [("line", "Every method keeps agreeing with the others.", "24:14.1", "24:19.7")]),
    ("24:19.90", "3d", "notebook", "end", [("line", "Watch a normal star move around nothing.", "24:24.7", "24:30.0")]),
    ("24:30.00", "3d", "cygx1", "end", [("line", "A black hole can hide its light.", "24:34.98", "24:37.5"), ("line", "It can't hide its gravity.", "24:37.6", None)]),
]

# stock clip picks (assets/raw/px_<file>.mp4, in-point seconds)
CLIPS = {
    "telescope": ("telescope_2", 0), "nightsky": ("nightsky_0", 0), "nightsky2": ("nightsky_2", 0), "nightsky3": ("nightsky_0", 7),
    "nightsky4": ("nightsky_0", 11), "stargaze": ("stargaze_2", 0), "church": ("church_2", 2), "soldier": ("soldier_0", 0),
    "river": ("river_2", 0), "river2": ("river_1", 1), "sunsurface": ("sunsurface_0", 0), "sunsurface2": ("sunsurface_0", 10),
    "sunsurface3": ("sunsurface_0", 2), "stove": ("stove_1", 4), "motorbike": ("motorbike_2", 40), "observatory": ("observatory_2", 0),
    "harddrive": ("harddrive_2", 0), "observatory2": ("observatory_2", 3), "stargaze2": ("stargaze_2", 4), "plane": ("plane_2", 0),
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
    print("3D kinds:", sorted({(s["k"]) for s in SHOTS if s["kind"] == "3d"}))
    bad = [(s["start"], s["end"]) for s in SHOTS if s["end"] - s["start"] < 1.4]
    print("very short shots:", bad)
