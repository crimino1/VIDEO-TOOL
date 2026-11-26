"""Writes description-and-credits.txt and stock/pinterest-sources-NOT-licensed.txt for The Great White Shark Has One Weakness."""
import json, os, re, html
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
used = set(json.load(open(os.path.join(H, "usage.json"))))
src = json.load(open(os.path.join(H, "stock", "sources.json"), encoding="utf-8"))
photos = json.load(open(os.path.join(H, "assets", "photo", "credits.json"), encoding="utf-8"))
shots = open(os.path.join(H, "shots.py"), encoding="utf-8").read()
clean = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*$", "", re.sub(r"<[^>]+>", "", s or "")))).strip()

pins = [k[4:] for k in sorted(used) if k.startswith("pin:")]
L = ["TITLE", "Orcas Kill These Animals and Never Eat Them", "",
     "DESCRIPTION", "There are only 76 Southern Resident killer whales left, and they are starving. Yet for more than 60 years these same hungry orcas have chased down harbour porpoises, "
     "killed them, and swum away without taking a single bite, while the Bigg's orcas next door eat porpoises all the time. Is it a game, training, or something much sadder? "
     "Scientists have three theories, and the third one changes how you see the whole thing.", "",
     "The animation is drawn for this video; the behaviour shown follows what researchers have observed and recorded.", "",
     "CHAPTERS", "0:00 76 orcas left", "0:43 What people see in the Salish Sea", "1:43 Sixty years of records", "2:41 The Southern Residents",
     "3:24 Why they are starving", "4:47 The neighbours: Bigg's killer whales", "5:41 Culture", "6:52 Theory 1: Play", "8:33 Theory 2: School",
     "9:50 Theory 3: Tahlequah and mis-mothering", "11:50 All three at once?", "12:17 Killing without eating, elsewhere", "12:57 The real story", "",
     "SOURCES AND CREDITS", "", f"Stock video ({len(pins)} short clips found on Pinterest; sources listed in the project file pinterest-sources-NOT-licensed.txt)."]
L += ["", "Photographs (Wikimedia Commons):"]
for name, c in photos.items():
    if re.search(rf'["\']{re.escape(name)}["\']', shots):
        L.append(f"{c['file'].replace('File:', '')} by {clean(c.get('artist')) or 'unknown'} ({c.get('license') or 'see page'}): {c.get('page')}")
L += ["Coastlines: Natural Earth (public domain).", "",
      "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/", "",
      "Sound effects made for this video.", "",
      "Science: Giles et al. 2024, Marine Mammal Science (78 incidents of Southern Resident killer whales harassing and killing porpoises, 1962-2020; none eaten);",
      "Center for Whale Research (annual Southern Resident census); SR3 / NOAA drone body-condition studies ('peanut head');",
      "Ford et al. 1998 (resident and Bigg's ecotypes and diets); the 1987 salmon-hat fad and its 2024 return (Center for Whale Research);",
      "Tahlequah (J35) carrying her dead calves in 2018 and 2025; Ross & Wilson 1996 (bottlenose dolphins killing porpoises);",
      "Esteban et al. 2022 (Iberian orca interactions with sailboats)."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
P = ["Pinterest clips used in the video. Pinterest does not say who owns a video or what reuse is allowed: check each before monetising.", ""]
for k in pins:
    s = src.get(k, {})
    P.append(f"{k}: {s.get('pin', '?')}  {s.get('title', '')}")
open(os.path.join(H, "stock", "pinterest-sources-NOT-licensed.txt"), "w", encoding="utf-8").write("\n".join(P) + "\n")
print(len(L), "lines,", len(pins), "pins")
