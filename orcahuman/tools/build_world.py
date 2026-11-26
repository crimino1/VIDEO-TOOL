"""World land outline (Natural Earth 50m, public domain) in an equirectangular projection, 1920 px wide.
Writes assets/map_world.json: {"land": svg path, "w": 1920, "h": 960}; x = (lon+180)/360*W, y = (90-lat)/180*H."""
import json
from pathlib import Path
H = Path(__file__).resolve().parent.parent
topo = json.loads((H.parent / "polar-bear" / "tools" / "land-50m.json").read_text(encoding="utf-8"))
sc, tr = topo["transform"]["scale"], topo["transform"]["translate"]
arcs = []
for a in topo["arcs"]:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy; pts.append((x * sc[0] + tr[0], y * sc[1] + tr[1]))
    arcs.append(pts)
W, Hh = 1920, 960
P = lambda lon, lat: ((lon + 180) / 360 * W, (90 - lat) / 180 * Hh)
d = []
for g in topo["objects"]["land"]["geometries"]:
    for poly in (g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]):
        for r in poly:
            out = []
            for i in r:
                p = arcs[i] if i >= 0 else arcs[~i][::-1]
                out += p if not out else p[1:]
            if len(out) < 4: continue
            pts = [P(*q) for q in out[::2]]
            un, off = [], 0.0          # unwrap rings that cross the date line, then draw them shifted both ways
            for i, (x, y) in enumerate(pts):
                if i and x + off - un[-1][0] > 960: off -= W
                elif i and x + off - un[-1][0] < -960: off += W
                un.append((x + off, y))
            shifts = [0] if all(0 <= x <= W for x, _ in un) else [0, -W, W]
            for sh in shifts:
                d.append("M" + "L".join(f"{x + sh:.1f},{y:.1f}" for x, y in un) + "Z")
(H / "assets" / "map_world.json").write_text(json.dumps({"land": "".join(d), "w": W, "h": Hh}), encoding="utf-8")
print(len(d), "rings")
