"""Writes description-and-credits.txt: YouTube description, chapters and credits for images, clips, textures and music actually used."""
import html, json, os, re
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
src = open(os.path.join(H, "build.py"), encoding="utf-8").read()
img = json.load(open(os.path.join(H, "assets", "img", "credits.json"), encoding="utf-8"))
px = json.load(open(os.path.join(H, "assets", "raw", "pexels.json"), encoding="utf-8"))
used_img = [n for n in img if re.search(r'["\']' + re.escape(n) + r'["\']', src)]
used_px = sorted(set(re.findall(r'"px_([a-z]+)_(\d)"', src)))
CH = [("0:00", "Saturn's rings disappeared"), ("1:03", "How big is Saturn?"), ("1:38", "The rings: wide, thin and made of ice"), ("3:17", "Galileo and the vanishing lumps"),
      ("4:13", "Why the rings vanished in 2025"), ("5:31", "Ring rain"), ("7:24", "Cassini's Grand Finale"), ("9:08", "What Saturn will look like"),
      ("10:03", "How old are the rings?"), ("11:07", "Chrysalis: the moon that died"), ("12:15", "The self-cleaning rings"), ("13:41", "Every giant planet has rings"), ("14:36", "Rings are like seasons")]
out = ["Saturn's Rings Are Disappearing (And We Finally Know How Fast)", "",
       "In March 2025 Saturn's rings vanished from our telescopes. That was an illusion. But the rings really are disappearing: Saturn is eating them, tons every second.", "",
       "CHAPTERS"] + [f"{t} {n}" for t, n in CH] + ["", "CREDITS", "", "Images:"]
for n in used_img:
    c = img[n]
    out.append(f"- {html.unescape(c.get('credit_line') or c['file'].replace('File:', ''))}: {html.unescape(c.get('artist', ''))} ({c.get('license', '')}) {c.get('page', '')}")
out += ["", "Stock footage (Pexels):"]
for name, i in used_px:
    v = next((x for x in px.get(name, []) if x["i"] == int(i)), None)
    if v: out.append(f"- {v['by']}: {v['url']}")
out += ["", "Planet textures: Solar System Scope (solarsystemscope.com/textures), CC BY 4.0, based on NASA mission data.",
        "Music by Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/",
        "Tracks: Lightless Dawn, Spacial Harvest, Echoes of Time v2, Long Note Two, Dreams Become Real, Long Note Three, Night Vigil, Reawakening, Long Note Four",
        "", "3D animation and graphics made for this video."]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(out))
print("\n".join(out))
