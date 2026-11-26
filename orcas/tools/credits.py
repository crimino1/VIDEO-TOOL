"""Writes description-and-credits.txt for Why Orcas Never Hunt Alone from usage.json, the clip lists and the photo credits."""
import json, os, re, html
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
used = set(json.load(open(os.path.join(H, "usage.json"))))
ids = {}
for p in (os.path.join(H, "tools", "clips.txt"), os.path.join(H, "..", "spermorca", "tools", "clips.txt"), os.path.join(H, "..", "spermorca", "tools", "clips2.txt")):
    if os.path.exists(p):
        for l in open(p):
            if l.strip(): k, v = l.split()[:2]; ids.setdefault(k, v)
ns = {}
exec(re.search(r"CREDIT = \{.*?\}\n", open(os.path.join(H, "build.py"), encoding="utf-8").read(), re.S).group(0), ns)
credit = {k: v.replace("Footage: ", "") for k, v in ns["CREDIT"].items()}
credit.update({"starboard": "White Shark Ocean", "wavewash": "Lindblad Expeditions", "beach": "Jorge Cazenave", "seaswap": "SEASWAP / NOAA Fisheries"})
photos = json.load(open(os.path.join(H, "assets", "photo", "credits.json"), encoding="utf-8"))
clean = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*$", "", re.sub(r"<[^>]+>", "", s or "")))).strip()
src = open(os.path.join(H, "shots.py"), encoding="utf-8").read() + open(os.path.join(H, "build.py"), encoding="utf-8").read()

L = ["TITLE", "Why Orcas Never Hunt Alone", "",
     "DESCRIPTION", "Five orcas swim at an ice floe in a perfect line, dive together and wash a seal into the sea with a wave. The ocean's most powerful predator could hunt alone, "
     "yet it almost never does. The real reason has less to do with hunting than with how orcas live: grandmothers who remember, sons who never leave, "
     "and hunting techniques taught from one generation to the next.", "",
     "The animated orcas are made from real photographs; the behaviour shown follows what researchers have observed and filmed.", "",
     "CHAPTERS", "0:00 The wave", "1:07 Could one orca hunt alone?", "2:04 Families run by females", "3:07 Grandmothers and menopause", "4:31 Ecotypes",
     "5:05 The fish-eaters: sharing salmon", "5:48 Carousel feeding in Norway", "6:42 The mammal hunters", "7:48 Gray whale calves", "8:58 The blue whale hunt",
     "10:02 The beach at Punta Norte", "11:10 Old Tom and the law of the tongue", "12:38 Luna", "13:44 The answer", "",
     "SOURCES AND CREDITS", "", "Video clips (short excerpts for commentary and education):"]
seen = set()
for key in sorted(used):
    if not key.startswith("yt:"): continue
    k = key[3:]
    if k in seen: continue
    seen.add(k); vid = ids.get(k)
    L.append(credit.get(k, k) + (f": https://www.youtube.com/watch?v={vid}" if vid and len(vid) == 11 else ""))
L += ["", "Photographs (Wikimedia Commons):"]
for name, c in photos.items():
    if re.search(rf'["\']{re.escape(name)}["\']', src) or f"img_{name}" in src:
        L.append(f"{c['file'].replace('File:', '')} by {clean(c.get('artist')) or 'unknown'} ({c.get('license') or 'see page'}): {c.get('page')}")
L += ["Gray and blue whale paintings: NOAA (public domain). Diver photograph: Pexels. Coastlines: Natural Earth (public domain).", "",
      "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/", "",
      "Sound effects made for this video.", "",
      "Science: Foster et al. 2012, Science (adult sons' survival after their mother dies); Brent et al. 2015, Current Biology (post-reproductive females lead, especially in poor salmon years);",
      "Wright et al. 2016 (salmon sharing in resident orcas); Similä & Ugarte 1993 (carousel feeding); Baird & Dill 1996 (group size and food intake in mammal-eating orcas);",
      "Totterdell et al. 2022, Marine Mammal Science (orcas killing blue whales, Western Australia); Lopez & Lopez 1985 (intentional stranding at Punta Norte);",
      "Pitman & Durban 2012 (wave-washing); Towers et al. 2024 (Starboard and white sharks); Eden Killer Whale Museum (Old Tom)."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print(len(L), "lines")
