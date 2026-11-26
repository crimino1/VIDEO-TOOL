"""Writes description-and-credits.txt for Why Are So Many Penguins Gay? from usage.json, the clip lists and the photo credits."""
import json, os, re, html
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
used = set(json.load(open(os.path.join(H, "usage.json"))))
ids = {l.split()[0]: l.split()[1] for l in open(os.path.join(H, "tools", "clips.txt")) if l.strip()}
ns = {"CREDIT": {}}
exec(re.search(r"CREDIT\.update\(\{.*?\}\)\n", open(os.path.join(H, "shots.py"), encoding="utf-8").read(), re.S).group(0), ns)
pex = json.load(open(os.path.join(H, "stock", "sources.json"), encoding="utf-8"))
photos = json.load(open(os.path.join(H, "assets", "photo", "credits.json"), encoding="utf-8"))
shots = open(os.path.join(H, "shots.py"), encoding="utf-8").read()
clean = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*$", "", re.sub(r"<[^>]+>", "", s or "")))).strip()

L = ["TITLE", "Why Are So Many Penguins Gay?", "",
     "DESCRIPTION", "In 1999, a male chinstrap penguin at the Central Park Zoo sat on a rock and tried to hatch it, with his partner Roy. Since then, same-sex penguin couples have turned up "
     "from Sydney to Berlin, and scientists found the same thing in wild king penguins on Kerguelen. A century earlier, an Antarctic explorer saw it at Cape Adare and was so shocked "
     "he wrote his notes in Greek. Why does this one family of birds keep pairing up this way, and is \"gay\" even the right word?", "",
     "CHAPTERS", "0:00 Roy and Silo", "1:23 Bremerhaven", "2:24 Why penguins?", "2:37 Can penguins tell male from female?", "3:08 The Kerguelen experiment",
     "4:11 1911: Levick's hidden notes", "5:34 Courting is only step one", "6:35 Is gay the right word?", "7:01 Why: raising a chick takes two",
     "8:21 The Laysan albatross", "9:10 Sphen and Magic", "10:49 The answer", "",
     "SOURCES AND CREDITS", "", "Video clips (short excerpts for commentary and education):"]
seen = set()
for key in sorted(used):
    if key.startswith("yt:"):
        k = key[3:]
        if k in seen: continue
        seen.add(k); vid = ids.get(k)
        L.append(ns["CREDIT"].get(k, k) + (f": https://www.youtube.com/watch?v={vid}" if vid else ""))
L += ["", "Stock video from Pexels (free to use):"]
for key in sorted(used):
    if key.startswith("px:"):
        s = pex.get(key[3:] + ".mp4")
        if s: L.append(f"{s['by']}: {s['page']}")
L += ["", "Photographs (Wikimedia Commons):"]
for name, c in photos.items():
    if re.search(rf'["\']{re.escape(name)}["\']', shots):
        L.append(f"{c['file'].replace('File:', '')} by {clean(c.get('artist')) or 'unknown'} ({c.get('license') or 'see page'}): {c.get('page')}")
L += ["Coastlines: Natural Earth (public domain).", "",
      "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/", "",
      "Sound effects made for this video.", "",
      "Sources: Smith, 'Love Takes Wing' (New York Times, 2004) on Roy, Silo and Tango; Bremerhaven Zoo am Meer Humboldt penguins (2005);",
      "Pincemy, Dobson & Jouventin 2010, PLoS ONE (same-sex courtship in king penguins on Kerguelen); Russell, Sladen & Ainley 2012, Polar Record (Levick's 'Not for Publication' notes, 1915);",
      "Young, Zaun & VanderWerf 2008, Biology Letters (female-female pairs in Laysan albatrosses, Oahu); SEA LIFE Sydney Aquarium (Sphen and Magic, 2018-2024);",
      "Bagemihl 1999 and Monk et al. 2019 (same-sex behaviour across more than a thousand animal species)."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print(len(L), "lines")
