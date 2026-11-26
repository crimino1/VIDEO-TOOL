"""Search ESO / ESA-Hubble / ESA-Webb / NOIRLab image archives: agency_q.py <eso|hubble|webb|noirlab> "query" ..."""
import re, sys, urllib.parse, os
sys.path.insert(0, os.path.dirname(__file__))
from net import get
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
BASE = {"eso": "https://www.eso.org/public/images/", "hubble": "https://esahubble.org/images/",
        "webb": "https://esawebb.org/images/", "noirlab": "https://noirlab.edu/public/images/"}
for q in sys.argv[2:]:
    print("==", q)
    h = (get(BASE[sys.argv[1]] + "?" + urllib.parse.urlencode({"search": q}), tries=2) or b"").decode("utf-8", "replace")
    for m in list(re.finditer(r"id: '([^']+)',\s*title: '(.*?)',\s*width: (\d+),\s*height: (\d+)", h))[:14]:
        print(f"  {m[1]:22s} {m[3]}x{m[4]:6s} {m[2][:70]}")
