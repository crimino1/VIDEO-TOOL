"""Bakes real coastlines (Natural Earth, public domain, via world-atlas) into assets/js/maps.js."""
import json, math, urllib.request
from pathlib import Path
HERE = Path(__file__).resolve().parent.parent
src = HERE / "tools" / "land-50m.json"
if not src.exists():
    src.write_bytes(urllib.request.urlopen("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json", timeout=120).read())
topo = json.loads(src.read_text(encoding="utf-8"))
sc, tr = topo["transform"]["scale"], topo["transform"]["translate"]
arcs = []
for a in topo["arcs"]:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy
        pts.append((x * sc[0] + tr[0], y * sc[1] + tr[1]))
    arcs.append(pts)
def ring(r):
    out = []
    for i in r:
        p = arcs[i] if i >= 0 else arcs[~i][::-1]
        out += p if not out else p[1:]
    return out
rings = []
for g in topo["objects"]["land"]["geometries"]:
    polys = g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]
    for poly in polys:
        for r in poly: rings.append(ring(r))
W, H = 1920, 1080
def path(pts):
    s, last = "", None
    for x, y in pts:
        c = (round(x), round(y))
        if c == last: continue
        s += ("L" if s else "M") + f"{c[0]} {c[1]}"; last = c
    return s + "Z"
out = {}
# Polar view
lon0, R, latEdge = -70, 560, 45
def polar(lon, lat):
    r = (90 - lat) / (90 - latEdge) * R; a = math.radians(lon - lon0)
    return (960 + r * math.sin(a), 540 + r * math.cos(a))
d = ""
for r in rings:
    if max(p[1] for p in r) < latEdge: continue
    d += path([polar(*p) for p in r])
out["polar"] = {"d": d, "type": "polar", "lon0": lon0, "R": R, "latEdge": latEdge}
# Regional views: plain lon/lat scaled for latitude, filling the frame
for name, (lo0, lo1, la0, la1) in {"beaufort": (-170, -112, 64, 78), "hudson": (-104, -68, 51, 67), "svalbard": (2, 38, 75.5, 82.5), "wales": (-176, -152, 61.5, 69), "novaya": (38, 80, 66, 79), "nunavut": (-105, -75, 55, 68)}.items():
    latc = (la0 + la1) / 2; k = math.cos(math.radians(latc))
    sx = W / ((lo1 - lo0) * k); sy = H / (la1 - la0); s = max(sx, sy)
    cx, cy = (lo0 + lo1) / 2, latc
    P = lambda lon, lat: (960 + (lon - cx) * k * s, 540 - (lat - cy) * s)
    d = ""
    for r in rings:
        xs = [p[0] for p in r]; ys = [p[1] for p in r]
        if max(xs) < lo0 - 15 or min(xs) > lo1 + 15 or max(ys) < la0 - 6 or min(ys) > la1 + 6: continue
        # Land that crosses the 180 degree line is split there, so it can't draw a band across the map
        piece = [r[0]]
        for a, b in zip(r, r[1:]):
            if abs(b[0] - a[0]) > 180:
                d += path([P(*p) for p in piece]); piece = []
            piece.append(b)
        d += path([P(*p) for p in piece])
    out[name] = {"d": d, "type": "plain", "cx": cx, "cy": cy, "k": k, "s": s}
(HERE / "assets" / "js" / "maps.js").write_text("const MAPS = " + json.dumps(out) + ";\n", encoding="utf-8")
print({k: len(v["d"]) for k, v in out.items()})
