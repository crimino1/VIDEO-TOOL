"""Download NASA SVS clips (public domain) -> assets/raw/nasa_<name>.mp4, credits in assets/raw/nasa.json."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from net import get
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "raw"))
B = "https://svs.gsfc.nasa.gov/vis/a010000/a015100/a015120/"
PAGE = "https://svs.gsfc.nasa.gov/15120/"
WANT = {f"voyager_beauty{i}": f"15120_VoyagerBeauty_S0{i}_1080.mp4" for i in range(1, 6)}
WANT |= {"voyager_launch_earth": "15120_VoyagerLightDay_01_Launch_from_Earth_clean_1080.mp4",
         "voyager_orbit_exit": "15120_VoyagerLightDay_02_Orbit_Exit_1080.mp4",
         "voyager_earth_moon_neptune": "15120_VoyagerLightDay_03_Earth_to_Moon_to_Neptune_clean_1080.mp4",
         "voyager_earth_moon_neptune_v": "15120_VoyagerLightDay_03_Earth_to_Moon_to_Neptune_WithVoyager_1080.mp4"}
cp = os.path.join(OUT, "nasa.json")
cred = json.load(open(cp, encoding="utf-8")) if os.path.exists(cp) else {}
for name, f in WANT.items():
    if name in cred:
        continue
    data = get(B + f.replace(" ", "%20"))
    if not data:
        print("FAIL", name); continue
    open(os.path.join(OUT, f"nasa_{name}.mp4"), "wb").write(data)
    cred[name] = {"file": f, "title": "How Far Away Is Voyager 1? One Light-Day, Explained (SVS 15120)", "license": "Public domain (NASA)",
                  "artist": "NASA's Scientific Visualization Studio / NASA Goddard", "page": PAGE}
    print(name, len(data) // 1_000_000, "MB", flush=True)
    json.dump(cred, open(cp, "w", encoding="utf-8"), indent=1)
