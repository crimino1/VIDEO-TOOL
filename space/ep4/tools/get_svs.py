"""Download NASA SVS clips (public domain) -> assets/raw/nasa_<name>.mp4, credits in assets/raw/nasa.json. 4K-only files are scaled to 1080p."""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from net import get
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "raw"))
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
V = "https://svs.gsfc.nasa.gov/vis/a010000/"
CI = "NASA's Goddard Space Flight Center Conceptual Image Lab"
WANT = {  # name: (url, svs id, title, artist)
    "neutron_star": ("https://svs.gsfc.nasa.gov/vis/a010000/a013800/a013832/Neutron_Star_1080.mp4", 13832, "NASA's NICER Tests Matter's Limits: neutron star", "NASA's Goddard Space Flight Center"),
    "ns_spots": ("https://svs.gsfc.nasa.gov/vis/a010000/a013200/a013240/8kNeutronStar2Spots90r1_1080.mp4", 13240, "NICER pulsar J0030 surface visualization", "NASA's Goddard Space Flight Center"),
    "ns_size": ("https://svs.gsfc.nasa.gov/vis/a010000/a013800/a013832/Diameter_Comparison_XMM_4k.mp4", 13832, "NASA's NICER Tests Matter's Limits: diameter comparison", "NASA's Goddard Space Flight Center"),
    "sn_pulsar": ("https://svs.gsfc.nasa.gov/vis/a020000/a020400/a020413/SN_HQ_Full_1080_V001.mp4", 20413, "Supernova explosion animation, with pulsar", "NASA's Goddard Space Flight Center Conceptual Image Lab"),
    "magnetar": ("https://svs.gsfc.nasa.gov/vis/a020000/a020300/a020359/02_MAGNETAR_Wide_view_BlipOnly_1080.mp4", 20359, "Migrating Magnetar Hot Spot Animations", "NASA's Goddard Space Flight Center"),
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
