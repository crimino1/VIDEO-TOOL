"""Writes description-and-credits.txt for EP4: description, chapters, hashtags, and credits for the images, clips, model, textures and music actually used."""
import html, json, os, re
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
src = open(os.path.join(H, "build.py"), encoding="utf-8").read()
img = json.load(open(os.path.join(H, "assets", "img", "credits.json"), encoding="utf-8"))
px = json.load(open(os.path.join(H, "assets", "raw", "pexels.json"), encoding="utf-8"))
nasa = json.load(open(os.path.join(H, "assets", "raw", "nasa.json"), encoding="utf-8"))
used_img = [n for n in img if re.search(r'["\'/]' + re.escape(n) + r'(\.png)?["\']', src)]
used_px = sorted(set(re.findall(r'"px_([a-z_]+?)_(\d)"', src)))
used_nasa = [k for k in nasa if ('"nasa_' + k + '"') in src]
CH = [("0:00", "The goodbye, the trip, the return"), ("2:03", "Part One: The Universal Clock"), ("6:45", "Part Two: Leaving Home"),
      ("8:02", "Part Three: The Edge"), ("9:49", "Part Four: Why Time Bends")]
out = ["What If You Traveled to a Black Hole and Came Back to Earth?", "",
       "You say goodbye to your best friend at 25, fly to a black hole, hover at its edge for one day, and come home to find him an old man. That is not science fiction: it is general relativity. We follow the clock from Earth to the edge of a black hole: the NIST clocks that tick faster 33 cm higher, the atomic clocks flown around the world, GPS satellites, Scott Kelly's year in space, the Sun, neutron stars, and the event horizon where time falls off a cliff.",
       "", "CHAPTERS"] + [f"{t} {n}" for t, n in CH] + ["", "#BlackHole #TimeDilation #Space #Einstein #Relativity", "", "CREDITS", "", "Images:"]
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
sys_path = os.path.join(H, "tools"); import sys; sys.path.insert(0, H); sys.path.insert(0, sys_path)
cat = json.load(open(os.path.join(H, "..", "..", "sfx-library", "openverse", "catalog.json"), encoding="utf-8"))
import mix4
used_sfx = sorted(set(c[1] for c in mix4.CUES))
out += ["", "Sound effects (Openverse / Freesound):"]
for f in used_sfx:
    c = next((v for v in cat.values() if v["file"] == f), None)
    if c: out.append(f"- {c['title']}: {c['creator']} ({c['license'].upper()}) {c['source']}")
out += ["",
        "Planet textures: Solar System Scope (solarsystemscope.com/textures), CC BY 4.0, based on NASA mission data.",
        "No music: voice and real recorded sound effects only.",
        "", "The black holes are ray-traced simulations made for this video (Schwarzschild light paths, Doppler-brightened accretion disks). The spacetime grid and the Milky Way from outside are illustrations. Interstellar is referenced but no film footage is used.",
        "3D animation and graphics made for this video."]
seen = set(); out = [l for l in out if not l.startswith("- ") or not (l in seen or seen.add(l))]
open(os.path.join(H, "description-and-credits.txt"), "w", encoding="utf-8").write("\n".join(out))
print(len(out), "lines")
