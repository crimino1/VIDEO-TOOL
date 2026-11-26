"""Writes description-and-credits.txt for the deep-sea predators film from usage.json, the clip list and the photo credits."""
import json, os, re, html
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
used = set(json.load(open(os.path.join(H, "usage.json"))))
ids = dict(l.split() for l in open(os.path.join(H, "tools", "clips.txt")) if l.strip())
for other, pre, fn in (("trench", "", "clips.txt"), ("spermorca", "sperm_", "clips.txt"), ("spermorca", "sperm_", "clips2.txt")):
    p = os.path.join(H, "..", other, "tools", fn)
    if os.path.exists(p):
        for l in open(p):
            if l.strip(): k, v = l.split()[:2]; ids.setdefault(k, v); ids.setdefault(pre + k, v)
src = open(os.path.join(H, "build.py"), encoding="utf-8").read()
credit = dict(re.findall(r'"(\w+)": "Footage: ([^"]+)"', src))
photos = json.load(open(os.path.join(H, "assets", "photo", "credits.json"), encoding="utf-8"))
px = json.load(open(os.path.join(H, "assets", "raw", "pexels.json"), encoding="utf-8"))
clean = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*$", "", re.sub(r"<[^>]+>", "", s or "")))).strip()

L = ["TITLE", "Every Deep Sea Predator Explained In 9 Minutes", "",
     "DESCRIPTION", "No light, almost no food, nowhere to hide: so nearly everything down there became a hunter. From the last trace of sunlight to the bottom of the deepest trench, "
     "meet every major deep-sea predator: lights that lure, jaws that launch out of the face, stomachs that stretch around prey twice the hunter's size, and even sponges that hunt.", "",
     "The animated animals are made from real photographs of each species; the behaviour shown follows what scientists have observed and filmed.", "",
     "CHAPTERS", "0:00 Down there", "0:26 200 m: the swordfish", "0:57 Humboldt squid", "1:17 500 m: the viperfish", "1:45 Stoplight loosejaw", "2:26 1,000 m: black dragonfish",
     "2:54 Anglerfish", "3:15 Fangtooth", "3:30 Black swallower", "4:01 Gulper eel", "4:21 Goblin shark", "4:40 Frilled shark", "4:57 Greenland shark", "5:33 Giant squid",
     "6:00 Sperm whale", "6:29 3,000 m: predatory tunicate", "6:54 Harp sponge", "7:20 Tripod fish", "7:34 Dumbo octopus", "7:50 6,000 m: snailfish", "8:24 The deep", "",
     "SOURCES AND CREDITS", "", "Video clips (short excerpts for commentary and education):"]
seen = set()
for key in sorted(used):
    if not key.startswith("yt:"): continue
    k = key[3:]
    if k in seen: continue
    seen.add(k)
    vid = ids.get(k)
    who = credit.get(k, k)
    L.append(f"{who}" + (f": https://www.youtube.com/watch?v={vid}" if vid and len(vid) == 11 else ""))
L += ["", "Stock video from Pexels (https://www.pexels.com):"]
for key in sorted(used):
    m = re.match(r"px_(\w+)_(\d+)$", key)
    if m:
        for e in px.get(m.group(1), []):
            if e["i"] == int(m.group(2)): L.append(f"{e['by']}: {e['url']}")
L += ["", "Animal photographs used for the animation (Wikimedia Commons):"]
for name, c in photos.items():
    if re.search(rf'["\']{re.escape(name)}["\']', src) or f"img_{name}" in src:
        L.append(f"{c['file'].replace('File:', '')} by {clean(c.get('artist')) or 'unknown'} ({c.get('license') or 'see page'}): {c.get('page')}")
L += ["Sperm whale painting: NOAA (public domain). Diver photograph: Pexels.", "Coastlines: Natural Earth (public domain)", "",
      "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/",
      "Tracks: Ossuary 6 - Air, Spacial Harvest, Ossuary 5 - Rest, Echoes of Time v2, Dreams Become Real, Long Note Two, Bittersweet, Long Note Four", "",
      "Sound effects made for this video.", "",
      "Science: Carey 1982 (swordfish brain heater); Nielsen et al. 2016, Science (Greenland shark longevity); Kubodera & Mori 2005 / NHK 2012 and Widder et al. 2019 (giant squid filmed alive);",
      "Lee et al. 2012 (Chondrocladia lyra, the harp sponge); Davis et al. 2020, Current Biology (ultra-black fish skin); Douglas et al. 1998 (loosejaw red light);",
      "Jamieson et al. 2023 (snailfish filmed at 8,336 m); Nakaya et al. 2016 (goblin shark slingshot feeding)."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print(len(L), "lines")
