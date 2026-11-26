"""Writes description-and-credits.txt for EP2: description, chapters, hashtags, and credits for the images, clips, model, textures and music actually used."""
import html, json, os, re
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
src = open(os.path.join(H, "build.py"), encoding="utf-8").read()
img = json.load(open(os.path.join(H, "assets", "img", "credits.json"), encoding="utf-8"))
px = json.load(open(os.path.join(H, "assets", "raw", "pexels.json"), encoding="utf-8"))
nasa = json.load(open(os.path.join(H, "assets", "raw", "nasa.json"), encoding="utf-8"))
used_img = [n for n in img if re.search(r'["\']' + re.escape(n) + r'["\']', src)]
used_px = sorted(set(re.findall(r'"px_([a-z]+)_(\d)"', src)))
used_nasa = [k for k in nasa if ("nasa_" + k in src) or (k in src)]
CH = [("0:00", "Voyager 1 reaches one light-day"), ("0:55", "Step 1: Earth"), ("1:15", "Step 2: Every planet fits between Earth and the Moon"), ("1:41", "Step 3: The Sun"),
      ("2:05", "Step 4: Betelgeuse"), ("2:25", "Measuring with light"), ("3:04", "Step 5: The nearest star"), ("3:27", "Step 6: The Milky Way"),
      ("4:34", "Step 7: Other galaxies"), ("5:06", "Step 8: Laniakea"), ("5:24", "The Hubble Ultra Deep Field"), ("6:12", "The observable universe"),
      ("7:09", "Beyond the edge"), ("7:51", "The Pale Blue Dot")]
out = ["How Big Is Our Universe? A Size Comparison That Breaks Your Brain", "",
       "On November 18, 2026, Voyager 1 became the first human-made object one full light-day from Earth. Starting from your doorstep, we zoom out step by step: the Moon, the Sun, Betelgeuse, the nearest star, the Milky Way, Andromeda, the Laniakea supercluster, the Hubble Ultra Deep Field, and finally the 93-billion-light-year observable universe.",
       "", "CHAPTERS"] + [f"{t} {n}" for t, n in CH] + ["", "#Universe #Space #Astronomy", "", "CREDITS", "", "Images:"]
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
out += ["", "Sun: NASA/SDO (AIA 171), public domain", "Voyager 3D model: NASA 3D Resources (public domain), github.com/nasa/NASA-3D-Resources",
        "Planet textures: Solar System Scope (solarsystemscope.com/textures), CC BY 4.0, based on NASA mission data.",
        "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/",
        "Tracks: Lightless Dawn, Spacial Harvest, Dreams Become Real, Long Note Two, Echoes of Time v2, Long Note Three, Long Note Four",
        "", "The Milky Way seen from outside and the cosmic web are artist's concepts / simulations; no one has photographed them from outside.",
        "3D animation and graphics made for this video."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(out))
print(len(out), "lines")
