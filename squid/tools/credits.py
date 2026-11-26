"""Writes description-and-credits.txt from what the build actually used (usage.json) plus image credits."""
import json, os, re
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
used = set(json.load(open(os.path.join(H, "usage.json"))))
px = json.load(open(os.path.join(H, "assets", "raw", "pexels.json"), encoding="utf-8"))
imgs = json.load(open(os.path.join(H, "assets", "img", "credits-commons.json"), encoding="utf-8"))
scenes = open(os.path.join(H, "scenes.py"), encoding="utf-8").read() + open(os.path.join(H, "build.py"), encoding="utf-8").read()
used_imgs = [k for k in imgs if re.search(rf'["\']{re.escape(k)}["\']', scenes)]
YT = {"soi": ("Schmidt Ocean Institute, first live colossal squid, 2025", "lzPoG9H8Hlo"), "tepapa_exam": ("Museum of New Zealand Te Papa Tongarewa", "drwwoJ8TAJc"),
      "tepapa_oil": ("Museum of New Zealand Te Papa Tongarewa", "ZanG27yuxwg"), "noaa_giant": ("NOAA Ocean Exploration (giant squid, E. Widder and N. Robinson)", "Lqim34DvCrs"),
      "noaa_red": ("NOAA Ocean Exploration", "lKgFurhTT0w"), "noaa_sq1": ("NOAA Ocean Exploration", "i00jvra5y7M"), "noaa_biolum": ("NOAA / E. Widder", "kF8oEcH1_yo"),
      "nautilus_sperm": ("Ocean Exploration Trust / Nautilus Live", "SkBpummjR5I"), "austral_tooth": ("Austral Fisheries", "zFC-TRTj8nE")}
L = ["TITLE", "Why You'd Never Want To Meet A Colossal Squid", "",
     "DESCRIPTION", "2,000 metres under the Southern Ocean, an eye the size of a dinner plate is watching. This is the colossal squid: the heaviest invertebrate on Earth, armed with swivelling hooks and a razor beak, and almost never seen alive.", "",
     "Animation: the 3D squid, sperm whale and submarine scenes and the diagrams are computer-made illustrations for this video, not real footage.", "",
     "CHAPTERS", "0:00 You're being watched", "1:24 The dark", "3:21 The 2007 catch", "4:48 The eye", "6:17 The body", "10:40 The hunt", "12:30 The hunter", "15:43 The first footage", "17:30 What we don't know", "18:24 Back in the dark", "",
     "SOURCES AND CREDITS", "", "Video clips (short excerpts used for commentary and education):"]
for k, (who, vid) in YT.items():
    if f"yt:{k}" in used: L.append(f"{who}: https://www.youtube.com/watch?v={vid}")
L += ["", "Stock video from Pexels (https://www.pexels.com):"]
for key in sorted(used):
    m = re.match(r"px_(\w+)_(\d+)$", key)
    if m:
        for e in px.get(m.group(1), []):
            if e["i"] == int(m.group(2)): L.append(f"{e['by']}: {e['url']}")
pin = [k for k in used if k.startswith("pin_")]
if pin:
    L += ["", "Clips found on Pinterest (owners unknown):"]
    for line in open(os.path.join(H, "assets", "raw", "pinterest-sources-NOT-licensed.txt"), encoding="utf-8").read().splitlines()[1:]:
        if line.split()[0] in pin: L.append(line.split()[1])
L += ["", "Images:"]
for k in used_imgs:
    c = imgs[k]
    L.append(f"{c['file'].replace('File:', '')} by {c.get('artist') or 'unknown'} ({c.get('license') or 'see page'}): {c.get('page')}")
L += ["Coastlines: Natural Earth (public domain)", "",
      "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/",
      "Tracks: Lightless Dawn, Dark Fog, Ossuary 6 - Air, Unseen Horrors, Long Note Two", "",
      "Sperm whale clicks: Ocean Networks Canada, https://www.youtube.com/watch?v=VhQ3CGSZMqU", "Other sound effects made for this video.", "",
      "Science sources: Robson 1925 (species description); Te Papa (2007 specimen, 495 kg, eye about 27 cm); Nilsson et al. 2012, Current Biology (giant eyes and sperm whales);",
      "Rosa & Seibel 2010 (metabolism estimate); Schmidt Ocean Institute, March 2025 (first live footage, South Sandwich Islands)."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L))
