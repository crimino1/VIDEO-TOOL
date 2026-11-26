"""Contact sheets of pixel shots with their real film options: realsheet.py <outdir> [kind ...]  (all shots if no kinds)."""
import json, subprocess, sys
from pathlib import Path
H = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
want = set(sys.argv[2:])
PARTS = [0.0, 154.04, 300.14, 448.22]
for k in range(1, 5):
    s = (H / "parts" / f"p{k}.html").read_text(encoding="utf-8")
    i = s.index("window.PXS = ") + 13; j = s.index(";</script>", i)
    for a, b, kind, o in json.loads(s[i:j]):
        if want and kind not in want: continue
        t0 = a + PARTS[k - 1]
        f = out / f"{int(t0 // 60)}m{t0 % 60:05.2f}_{kind}.png"
        r = subprocess.run(["node", str(H / "tools" / "pxsheet.cjs"), kind, json.dumps(o), f"{b - a:.3f}", str(f), "8", "4"], capture_output=True, text=True, cwd=H)
        print(f.name, (r.stdout + r.stderr).strip().splitlines()[-1][:200] if (r.stdout + r.stderr).strip() else "")
