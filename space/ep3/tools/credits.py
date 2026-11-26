"""Writes description-and-credits.txt for EP2: description, chapters, hashtags, and credits for the images, clips, model, textures and music actually used."""
import html, json, os, re
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
src = open(os.path.join(H, "build.py"), encoding="utf-8").read()
img = json.load(open(os.path.join(H, "assets", "img", "credits.json"), encoding="utf-8"))
px = json.load(open(os.path.join(H, "assets", "raw", "pexels.json"), encoding="utf-8"))
nasa = json.load(open(os.path.join(H, "assets", "raw", "nasa.json"), encoding="utf-8"))
used_img = [n for n in img if re.search(r'["\'/]' + re.escape(n) + r'(\.png)?["\']', src)]
used_px = sorted(set(re.findall(r'"px_([a-z]+)_(\d)"', src)))
used_nasa = [k for k in nasa if ('"nasa_' + k + '"') in src]
CH = [("0:00", "The invisible thing that bent a star's light"), ("1:24", "#8 The Silent One"), ("2:58", "#7 The Shredder"), ("4:32", "#6 The Wanderer"),
      ("5:55", "#5 The Ghost from the Big Bang"), ("7:26", "#4 The Sniper"), ("8:52", "#3 The Runaway"), ("10:17", "#2 The Glutton"), ("11:28", "#1 The One We Might Be Inside")]
out = ["The Most Terrifying Types of Black Holes", "",
       "In 2011 an invisible black hole drifted in front of a star and bent its light for 270 days. Today we rank the most terrifying types of black holes that exist, or might exist: from the silent ones and the shredders to rogue wanderers, blazars aimed at Earth, a runaway giant, the brightest quasar ever found, and the idea that our whole universe might be inside one.",
       "", "CHAPTERS"] + [f"{t} {n}" for t, n in CH] + ["", "#BlackHoles #Space #Astronomy", "", "CREDITS", "", "Images:"]
for n in used_img:
    c = img[n]
    title = html.unescape(c.get("title") or c.get("file", n)).replace("File:", "")
    out.append(f"- {title}: {html.unescape(c.get('artist', ''))} ({c.get('license', '')}) {c.get('page', '')}".rstrip())
out += ["", "Video:"]
for k in used_nasa:
    c = nasa[k]; out.append(f"- {c.get('title', k)}: {c.get('artist', '')} ({c.get('license', '')}) {c.get('page', '')}")
for name, i in used_px:
    v = next((x for x in px.get(name, []) if x["i"] == int(i)), None)
    if v: out.append(f"- Pexels / {v['by']}: {v['url']}")
out += ["",
        "Planet textures: Solar System Scope (solarsystemscope.com/textures), CC BY 4.0, based on NASA mission data.",
        "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/",
        "Tracks: Lightless Dawn, Long Note Two, Night Vigil, Echoes of Time v2, Spacial Harvest, Long Note Three, Dreams Become Real, Reawakening, Long Note Four",
        "", "The black holes are ray-traced simulations made for this video (Schwarzschild light paths, Doppler-brightened accretion disks). The Milky Way from outside is an artist's concept.",
        "3D animation and graphics made for this video."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(out))
print(len(out), "lines")
