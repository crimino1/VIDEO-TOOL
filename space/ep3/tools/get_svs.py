"""Download NASA SVS clips (public domain) -> assets/raw/nasa_<name>.mp4, credits in assets/raw/nasa.json. 4K-only files are scaled to 1080p."""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from net import get
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "raw"))
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
V = "https://svs.gsfc.nasa.gov/vis/a010000/"
CI = "NASA's Goddard Space Flight Center Conceptual Image Lab"
WANT = {  # name: (url, svs id, title, artist)
    "tde_a": (V + "a014600/a014620/3-Tidal_disruption_by_black_hole-HD.mp4", 14620, "Isolated Black Hole Visualization: tidal disruption", "NASA/JPL-Caltech/R. Hurt (Caltech-IPAC)"),
    "tde_b": (V + "a013800/a013805/TDE_animation_HQ.mp4", 13805, "Swift Links Neutrino to Star-destroying Black Hole: TDE animation", CI),
    "tde_c": (V + "a012000/a012005/12005_Swift_Tidal_Music_MPEG4_1920X1080_2997.mp4", 12005, "Massive Black Hole Shreds Passing Star", CI),
    "bh_disk_orbit": (V + "a014600/a014619/2-Orbiting_a_black_hole-HD.mp4", 14619, "Black Hole with Accretion Disk Visualization: orbiting", "NASA/JPL-Caltech/R. Hurt (Caltech-IPAC)"),
    "bh_disk_approach": (V + "a014600/a014619/1-Approaching_a_black_hole-HD.mp4", 14619, "Black Hole with Accretion Disk Visualization: approaching", "NASA/JPL-Caltech/R. Hurt (Caltech-IPAC)"),
    "bh_bare_orbit": (V + "a014600/a014620/1-Orbiting_a_bare_black_hole-HD.mp4", 14620, "Isolated Black Hole Visualization: orbiting a bare black hole", "NASA/JPL-Caltech/R. Hurt (Caltech-IPAC)"),
    "blazar_earth_a": ("https://svs.gsfc.nasa.gov/vis/a020000/a020200/a020281/Blazar_EarthShot_A_v05_H264.mp4", 20281, "Blazar Animations: Earth shot A", CI),
    "blazar_earth_b": ("https://svs.gsfc.nasa.gov/vis/a020000/a020200/a020281/Blazar_EarthShot_B_v05_H264.mp4", 20281, "Blazar Animations: Earth shot B", CI),
    "microlens_bh": ("https://svs.gsfc.nasa.gov/vis/a020000/a020300/a020315/Microlensing_BH_4k_30fps_h264.mp4", 20315, "Roman Space Telescope Microlensing Animations: black hole lens", CI),
}
cp = os.path.join(OUT, "nasa.json")
cred = json.load(open(cp, encoding="utf-8")) if os.path.exists(cp) else {}
names = sys.argv[1:] or [n for n in WANT if n not in cred]
for name in names:
    url, sid, title, artist = WANT[name]
    data = get(url, tries=3)
    if not data:
        print("FAIL", name); continue
    dst = os.path.join(OUT, f"nasa_{name}.mp4")
    if "4k" in url.lower():
        tmp = dst + ".4k.mp4"
        open(tmp, "wb").write(data)
        subprocess.run([FF, "-v", "error", "-y", "-i", tmp, "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-an", dst], check=True)
        os.remove(tmp)
    else:
        open(dst, "wb").write(data)
    cred[name] = {"file": url.rsplit("/", 1)[1], "title": f"{title} (SVS {sid})", "license": "Public domain (NASA)", "artist": artist,
                  "page": f"https://svs.gsfc.nasa.gov/{sid}/", "source_url": url}
    print(name, len(data) // 1_000_000, "MB", flush=True)
    json.dump(cred, open(cp, "w", encoding="utf-8"), indent=1)
