"""NASA images API search with descriptions: nasa_q.py [image|video] "query" ..."""
import json, sys, urllib.parse, os
sys.path.insert(0, os.path.dirname(__file__))
from net import get
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
mt = sys.argv[1]
for q in sys.argv[2:]:
    print("==", q)
    for it in json.loads(get("https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"q": q, "media_type": mt})))["collection"]["items"][:12]:
        d = it["data"][0]
        print(" ", d["nasa_id"], "|", d.get("title", "")[:60], "|", d.get("date_created", "")[:10], "|", (d.get("description") or "")[:110].replace("\n", " "))
