"""Writes description-and-credits.txt for The Only Animal Orcas Won't Hunt from usage.json, the clip lists and the photo credits."""
import json, os, re, html
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
used = set(json.load(open(os.path.join(H, "usage.json"))))
ids = {}
for p in ("tools/clips.txt", "../orcas/tools/clips.txt", "../predators/tools/clips.txt", "../spermorca/tools/clips.txt", "../spermorca/tools/clips2.txt"):
    p = os.path.join(H, p)
    if os.path.exists(p):
        for l in open(p):
            if l.strip(): k, v = l.split()[:2]; ids.setdefault(k, v)
ns = {}
exec(re.search(r"CREDIT = \{.*?\n(?=CREDIT = \{k)", open(os.path.join(H, "build.py"), encoding="utf-8").read(), re.S).group(0), ns)
credit = {k: v.replace("Footage: ", "") for k, v in ns["CREDIT"].items()}
photos = json.load(open(os.path.join(H, "assets", "photo", "credits.json"), encoding="utf-8"))
orc = json.load(open(os.path.join(H, "assets", "photo", "credits_orcas.json"), encoding="utf-8"))
clean = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*$", "", re.sub(r"<[^>]+>", "", s or "")))).strip()
src = open(os.path.join(H, "shots.py"), encoding="utf-8").read() + open(os.path.join(H, "scenes_hum.py"), encoding="utf-8").read()

L = ["TITLE", "The Only Animal Orcas Won't Hunt: EXCEPT THIS", "",
     "DESCRIPTION", "Orcas eat stingrays, whale sharks, great white sharks, swimming deer and even blue whales. They share the water with surfers, divers and kayakers "
     "every day, yet there is not a single confirmed case of a wild orca hunting a human. Why? Four theories, from family food traditions and echolocation "
     "to simple energy maths, and the two times orcas suddenly changed what they hunt.", "",
     "The animated orcas are made from real photographs; the behaviour shown follows what researchers have observed and filmed.", "",
     "CHAPTERS", "0:00 Everything orcas eat", "1:09 Except one animal", "1:35 Where the name comes from", "2:08 Stingrays, whale sharks and great whites",
     "3:48 How often they could", "4:32 Point Sur, 1972", "5:20 The darker side: orcas in captivity", "6:41 Theory 1: Food traditions",
     "8:39 Theory 2: Too strange", "9:48 Theory 3: Not worth it", "10:30 Theory 4: Intelligence", "11:36 Eden and the law of the tongue",
     "12:20 Why it can change", "12:44 The Aleutian sea otters", "13:22 The Iberian orcas and rudders", "14:25 Back to the kayak", "",
     "SOURCES AND CREDITS", "", "Video clips (short excerpts for commentary and education):"]
for key in sorted(used):
    if not key.startswith("yt:"): continue
    k = key[3:]; vid = ids.get(k)
    L.append(credit.get(k, k) + (f": https://www.youtube.com/watch?v={vid}" if vid and len(vid) == 11 else ""))
L += ["", "Photographs (Wikimedia Commons):"]
line = lambda c: f"{c['file'].replace('File:', '')} by {clean(c.get('artist')) or 'unknown'} ({c.get('license') or 'see page'}): {c.get('page')}"
for name, c in photos.items():
    if re.search(rf'["\']{re.escape(name)}["\']', src): L.append(line(c))
for name, c in orc.items():  # orca cut-outs are picked by letter (v="a"), so list them explicitly
    if name in ("orca_a", "orca_b", "orca_c", "harbor_seal", "whaleboat") or re.search(rf'["\']{re.escape(name)}["\']', src): L.append(line(c))
L += ["Diver photograph: Pexels. Coastlines: Natural Earth (public domain).", "",
      "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/", "",
      "Sound effects made for this video.", "",
      "Science: Visser 1999 (New Zealand orcas hunting rays); Higuera-Rivas et al. 2023, Frontiers in Marine Science (orcas hunting whale sharks, Gulf of California);",
      "Towers et al. 2022 (Port and Starboard and white sharks, South Africa); Pitman & Durban 2012 (wave-washing); Ford et al. 1998 (ecotypes and diet);",
      "Ford & Ellis 1999, Transients (the 1970 captive orcas that refused fish for 75 days); Au et al. 2004 (orca echolocation);",
      "Estes et al. 1998, Science (orcas and the Aleutian sea otter decline); Esteban et al. 2022, Marine Mammal Science (Iberian orca and boat interactions);",
      "Eden Killer Whale Museum (Old Tom and the law of the tongue); news reports on the 1972 Point Sur bite and on Tilikum."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print(len(L), "lines")
