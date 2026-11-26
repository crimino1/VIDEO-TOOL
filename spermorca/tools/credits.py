"""Writes description-and-credits.txt from what the build used (usage.json), image credits and the music plan."""
import json, os, re
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
used = set(json.load(open(os.path.join(H, "usage.json"))))
px = json.load(open(os.path.join(H, "assets", "raw", "pexels.json"), encoding="utf-8"))
imgs = json.load(open(os.path.join(H, "assets", "img", "credits-commons.json"), encoding="utf-8"))
src = open(os.path.join(H, "build.py"), encoding="utf-8").read() + open(os.path.join(H, "scenes2d.py"), encoding="utf-8").read()
used_imgs = [k for k in imgs if re.search(rf'["\']{re.escape(k)}["\']', src) or k.startswith("il_")]
YT = {"bremer": ("Whale Watch Western Australia", "Aoz78QeHneQ"), "bremer2": ("Whale Watch Western Australia", "E7TQWuu7HC4"), "starboard": ("White Shark Ocean", "3gVHB_vF2Ig"),
      "portstar": ("Good Morning South Africa", "oL9qejf2ktk"), "wavewash": ("Lindblad Expeditions-National Geographic", "K16lZU0agbg"), "beach": ("Jorge Cazenave", "mVShFwrqxX4"),
      "beach2": ("Anthropocene.Photography", "AsoI6V6TTtQ"), "ceti_birth": ("Project CETI / Associated Press", "XlM9sBhhx1g"), "dominica": ("Nadia Aly Underwater", "iJeesm2Nst0"),
      "seaswap": ("SEASWAP", "5panVo_3oVQ")}
MUSIC = ["Ossuary 6 - Air", "Floating Cities", "Echoes of Time v2", "Bittersweet", "Dreams Become Real", "Hiding Your Reality", "Rising Tide", "Reawakening", "Long Note Four"]
L = ["TITLE", "What If Sperm Whales Hunted Like Orcas?", "",
     "DESCRIPTION", "The sperm whale has the biggest brain on Earth, a head that can sink a ship, families, dialects and culture. So why doesn't it hunt like an orca? We rewrite evolution to find out what would happen to the ocean if it did.", "",
     "The animated scenes are illustrations made for this video from NOAA whale paintings, not real footage. The scenario is speculative.", "",
     "CHAPTERS", "0:00 Twelve shapes", "1:10 The king", "4:20 The challenger", "8:33 The family", "11:12 The 1997 attack", "12:20 Why they don't", "13:55 Rewrite evolution", "16:37 Two kings", "18:22 What breaks", "19:51 The real crown", "",
     "SOURCES AND CREDITS", "", "Video clips (short excerpts for commentary and education):"]
for k, (who, vid) in YT.items():
    if f"yt:{k}" in used: L.append(f"{who}: https://www.youtube.com/watch?v={vid}")
L += ["", "Stock video from Pexels (https://www.pexels.com):"]
for key in sorted(used):
    m = re.match(r"px_(\w+)_(\d+)$", key)
    if m:
        for e in px.get(m.group(1), []):
            if e["i"] == int(m.group(2)): L.append(f"{e['by']}: {e['url']}")
L += ["", "Images (Wikimedia Commons unless noted):"]
for k in used_imgs:
    c = imgs[k]
    L.append(f"{c['file'].replace('File:', '')} by {c.get('artist') or 'unknown'} ({c.get('license') or 'see page'}): {c.get('page')}")
L += ["Whale illustrations: NOAA Fisheries (public domain)", "",
      "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/",
      "Tracks: " + ", ".join(MUSIC), "",
      "Sperm whale clicks: Ocean Networks Canada, https://www.youtube.com/watch?v=VhQ3CGSZMqU", "Other sound effects made for this video.", "",
      "Science: Totterdell et al. 2022 (orcas killing blue whales, Bremer Bay); Towers et al. 2022 (Port and Starboard); Pitman et al. 2001 (1997 attack on sperm whales off California);",
      "Sharma et al. 2024, Nature Communications (Project CETI coda structure); Lavery et al. 2010 (sperm whale iron and carbon export); Norris & Møhl 1983 (big bang hypothesis)."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print(len(L), "lines")
