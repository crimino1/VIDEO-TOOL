"""Copies the chosen Pexels options into assets/img and writes the credits list for the YouTube description."""
import json, os, shutil
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IMG = os.path.join(ROOT, "assets", "img")
PICK = dict(phone=2, neon=1, lecture=1, uv=2, radio=3, ripples=0, city=2, water=2, guitar=1, chip=0, laser=0, led=0, mri=0, solar=1, chem=1, waterbend=2, gold=0, wire=1, you=0)
px = json.load(open(os.path.join(IMG, "credits-pexels.json"), encoding="utf-8"))
cm = json.load(open(os.path.join(IMG, "credits-commons.json"), encoding="utf-8"))
lines = ["IMAGE CREDITS", "", "Historical images, Wikimedia Commons:"]
for k, c in cm.items():
    if k in ("arosa2",):
        continue
    lines.append(f"- {c['file'][5:] if c['file'].startswith('File:') else c['file']} | {c['artist'] or 'unknown'} | {c['license']} | {c['page']}")
lines += ["", "Photos from Pexels (free licence, no attribution required, listed as a courtesy):"]
for k, i in PICK.items():
    shutil.copyfile(os.path.join(IMG, "_opts", f"{k}_{i}.jpg"), os.path.join(IMG, k + ".jpg"))
    o = next(x for x in px[k]["options"] if x["i"] == i)
    lines.append(f"- {k}: {o['by']} | {o['page']}")
open(os.path.join(ROOT, "credits-for-youtube-description.txt"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("ok", len(PICK))
