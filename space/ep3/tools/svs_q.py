"""List video files on NASA SVS pages: svs_q.py <id> ...  (mp4s, width, title of the media item)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from net import get
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
for i in sys.argv[1:]:
    d = json.loads(get(f"https://svs.gsfc.nasa.gov/api/{i}", tries=2) or b"{}")
    print("==", i, d.get("title"))
    for g in d.get("media_groups", []):
        for it in g.get("items", []):
            ins = it.get("instance") or {}
            u = ins.get("url", "")
            if u.endswith(".mp4") and (ins.get("width") or 0) in (1920, 3840, 1280):
                print(f"  {ins.get('width')}x{ins.get('height')} {ins.get('pixels') and ''}{u}  | {(it.get('title') or ins.get('alt_text') or '')[:70]}")
