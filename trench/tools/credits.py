"""Writes description-and-credits.txt for the trench film from usage.json, the clip list, Pexels and Commons credits."""
import json, os, re
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
used = set(json.load(open(os.path.join(H, "usage.json"))))
ids = dict(l.split() for l in open(os.path.join(H, "tools", "clips.txt")) if l.strip())
px = json.load(open(os.path.join(H, "assets", "raw", "pexels.json"), encoding="utf-8"))
imgs = json.load(open(os.path.join(H, "assets", "img", "credits-commons.json"), encoding="utf-8"))
divers = json.load(open(os.path.join(H, "assets", "diver", "credits.json"), encoding="utf-8"))
src = open(os.path.join(H, "build.py"), encoding="utf-8").read()
credit = dict(re.findall(r'"(\w+)": "Footage: ([^"]+)"', src) + re.findall(r'"(\w+)": "Archive footage: ([^"]+)"', src))
L = ["TITLE", "What Would Happen If You Fell Into The Mariana Trench", "",
     "DESCRIPTION", "You're floating 300 km southwest of Guam, and you let go. Fall with us through every zone of the ocean, past glowing anglerfish, the deepest fish ever filmed and the last of the light, all the way to the bottom of Challenger Deep, 11 km down.", "",
     "The falling diver is an animation made from real diver photographs; the journey is imagined, the animals and facts are real.", "",
     "CHAPTERS", "0:00 On the surface", "1:12 The sunlight zone", "2:31 The twilight zone", "4:17 The midnight zone", "6:45 The abyss", "7:33 The hadal zone",
     "10:00 Challenger Deep", "11:16 What got there first", "12:10 Who has been there", "13:04 Total darkness", "14:00 The way up", "",
     "SOURCES AND CREDITS", "", "Video clips (short excerpts for commentary and education):"]
for k, vid in ids.items():
    if f"yt:{k}" in used: L.append(f"{credit.get(k, k)}: https://www.youtube.com/watch?v={vid}")
L += ["", "Stock video from Pexels (https://www.pexels.com):"]
for key in sorted(used):
    m = re.match(r"px_(\w+)_(\d+)$", key)
    if m:
        for e in px.get(m.group(1), []):
            if e["i"] == int(m.group(2)): L.append(f"{e['by']}: {e['url']}")
L += ["", "Diver photographs (Pexels):"]
for k in ("d4628217", "d4961416", "d4551102", "d73759", "d3098932"):
    if k in divers: L.append(f"{divers[k]['by']}: {divers[k]['url']}")
L += ["", "Images (Wikimedia Commons):"]
for k, c in imgs.items():
    if re.search(rf'["\']{re.escape(k)}["\']', src + open(os.path.join(H, "scenes_t.py"), encoding="utf-8").read()) or k in ("il_angler", "il_lantern"):
        L.append(f"{c['file'].replace('File:', '')} by {c.get('artist') or 'unknown'} ({c.get('license') or 'see page'}): {c.get('page')}")
L += ["Coastlines: Natural Earth (public domain)", "",
      "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/",
      "Tracks: Bittersweet, Spacial Harvest, Ossuary 6 - Air, Ossuary 5 - Rest, Echoes of Time v2, Dreams Become Real, Long Note Two, Long Note Four", "",
      "Sound effects made for this video.", "",
      "Science: Gerringer et al. 2017 (Mariana snailfish, Pseudoliparis swirei); Jamieson et al. 2023 (snailfish filmed at 8,336 m, Izu-Ogasawara Trench);",
      "Jamieson et al. 2017, Nature Ecology & Evolution (PCBs in Mariana Trench amphipods); JAMSTEC Deep-sea Debris Database (plastic bag at 10,898 m);",
      "Kobayashi et al. 2012 (Hirondellea gigas enzymes); Gooday et al. (xenophyophores in the Mariana Trench); US Navy (Trieste, 1960)."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print(len(L), "lines")
