"""Credits for the YouTube description, built from what shots.py actually uses. credits.py <out.txt>"""
import json, os, re, sys
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
cp = os.path.join(H, "assets/img/credits-commons.json"); c = json.load(open(cp, encoding="utf-8")) if os.path.exists(cp) else {}
p = json.load(open(os.path.join(H, "assets/raw/pexels.json"), encoding="utf-8"))
txt = open(os.path.join(H, "shots.py"), encoding="utf-8").read()
ns = {}; exec(txt, ns)
js = "".join(open(os.path.join(H, "assets/js", f), encoding="utf-8").read() for f in os.listdir(os.path.join(H, "assets/js")) if f.startswith("k_"))
imgs = [k for k in c if re.search(r'"%s"' % k, txt) or k + "." in js]
clips = sorted({ns["CLIPS"][n][0] for n in ns["CLIPS"] if re.search(r'"v", "%s"' % n, txt)})
L = ["CREDITS", "", "Images, Wikimedia Commons:"]
L += [f"- {c[k]['file'][5:]} | {c[k]['artist'].strip() or 'unknown'} | {c[k]['license']} | {c[k]['page']}" for k in imgs]
L += ["", "Stock footage, Pexels (free licence):"]
seen, by = set(), set()
for cl in clips:
    subj, i = cl.rsplit("_", 1)
    v = next(x for x in p[subj] if x["i"] == int(i))
    if v["url"] not in seen:
        seen.add(v["url"]); by.add(v["by"].strip()); L.append(f"- {v['by'].strip()} | {v['url']}")
if not imgs: L = L[:2] + L[3:]  # no Commons images in this film
L += ["", "Sun texture: Solar System Scope, CC BY 4.0.",
      "Sound effects, 3D animation and the recreated 1905 journal pages and letter were made for this video.",
      "", "Short line for the YouTube description:",
      "Stock footage: Pexels (" + ", ".join(sorted(by, key=str.lower)) + ") · Sun texture: Solar System Scope, CC BY 4.0 · 3D animation made for this video."]
open(sys.argv[1], "w", encoding="utf-8").write("\n".join(L) + "\n")
print(len(imgs), "images,", len(seen), "clips")
