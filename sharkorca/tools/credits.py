"""Writes description-and-credits.txt and stock/pinterest-sources-NOT-licensed.txt for The Great White Shark Has One Weakness."""
import json, os, re, html
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
used = set(json.load(open(os.path.join(H, "usage.json"))))
src = json.load(open(os.path.join(H, "stock", "sources.json"), encoding="utf-8"))
photos = json.load(open(os.path.join(H, "assets", "photo", "credits.json"), encoding="utf-8"))
shots = open(os.path.join(H, "shots.py"), encoding="utf-8").read()
clean = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*$", "", re.sub(r"<[^>]+>", "", s or "")))).strip()

pins = [k[4:] for k in sorted(used) if k.startswith("pin:")]
L = ["TITLE", "The Great White Shark Has One Weakness. Orcas Found It", "",
     "DESCRIPTION", "October 1997, Farallon Islands: a female orca holds a great white shark upside down until it goes limp, then swims off with its liver. "
     "Every other great white in the area disappears. Years later, in South Africa, two orcas named Port and Starboard empty the world's most famous white shark coast. "
     "This is the story of the great white's hidden weakness: tonic immobility, a body that has to keep moving to breathe, and a giant oily liver worth the risk.", "",
     "The animation is drawn for this video; the behaviour shown follows what researchers have observed and filmed.", "",
     "CHAPTERS", "0:00 October 1997, the Farallon Islands", "1:54 What a great white normally is", "3:21 The tracking data", "5:06 Tonic immobility",
     "6:41 It has to keep moving to breathe", "7:49 The liver", "8:58 South Africa: Port and Starboard", "11:04 Mossel Bay: caught on camera",
     "12:20 Why can't a great white fight back?", "13:35 What changes next", "14:39 The one weakness", "",
     "SOURCES AND CREDITS", "", f"Stock video ({len(pins)} short clips found on Pinterest; sources listed in the project file pinterest-sources-NOT-licensed.txt)."]
L += ["", "Photographs (Wikimedia Commons):"]
for name, c in photos.items():
    if re.search(rf'["\']{re.escape(name)}["\']', shots):
        L.append(f"{c['file'].replace('File:', '')} by {clean(c.get('artist')) or 'unknown'} ({c.get('license') or 'see page'}): {c.get('page')}")
L += ["Coastlines: Natural Earth (public domain).", "",
      "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/", "",
      "Sound effects made for this video.", "",
      "Science: Pyle et al. 1999, Marine Mammal Science (the 1997 Farallon Islands predation); Jorgensen et al. 2019, Scientific Reports (white sharks leave the Farallons when orcas visit);",
      "Engelbrecht et al. 2019 and Towers et al. 2022, African Journal of Marine Science (white shark carcasses at Gansbaai, Port and Starboard);",
      "Towers et al. 2024 (orcas hunting white sharks off Mossel Bay, helicopter and drone footage; a single orca, Starboard, killing a young white shark in 2023);",
      "Hammerschlag et al. 2022 and others (changes in False Bay after white sharks left, including broadnose sevengill sharks);",
      "Watsky & Gruber 1990 and Brooks et al. 2011 (tonic immobility in sharks)."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
P = ["Pinterest clips used in the video. Pinterest does not say who owns a video or what reuse is allowed: check each before monetising.", ""]
for k in pins:
    s = src.get(k, {})
    P.append(f"{k}: {s.get('pin', '?')}  {s.get('title', '')}")
open(os.path.join(H, "stock", "pinterest-sources-NOT-licensed.txt"), "w", encoding="utf-8").write("\n".join(P) + "\n")
print(len(L), "lines,", len(pins), "pins")
