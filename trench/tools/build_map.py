"""Western Pacific map around Guam and the Mariana Trench (Natural Earth coastlines, public domain).
Orthographic projection; writes assets/map_pacific.json with land paths for a wide view and the trench line, Guam and Challenger Deep."""
import json, math
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
rings = []
for g in topo["objects"]["land"]["geometries"]:
    for poly in (g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]):
        for r in poly:
            out = []
            for i in r:
                p = arcs[i] if i >= 0 else arcs[~i][::-1]
                out += p if not out else p[1:]
            rings.append(out)
LAT0, LON0 = math.radians(14), math.radians(143)


def proj(lon, lat, R):
    la, lo = math.radians(lat), math.radians(lon)
    c = math.sin(LAT0) * math.sin(la) + math.cos(LAT0) * math.cos(la) * math.cos(lo - LON0)
    x = R * math.cos(la) * math.sin(lo - LON0)
    y = R * (math.cos(LAT0) * math.sin(la) - math.sin(LAT0) * math.cos(la) * math.cos(lo - LON0))
    return 960 + x, 540 - y, c > 0


def land(R):
    parts = []
    for r in rings:
        pts = [proj(lo, la, R) for lo, la in r]
        vis = [p for p in pts if p[2]]
        if len(vis) < 3: continue
        if all(p[0] < -400 or p[0] > 2320 or p[1] < -400 or p[1] > 1480 for p in vis): continue
        parts.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y, _ in vis) + "Z")
    return " ".join(parts)


TRENCH = [(141.2, 11.0), (142.0, 11.3), (142.6, 11.37), (143.6, 11.8), (144.8, 12.6), (145.9, 13.6), (146.9, 15.0), (147.6, 17.0), (147.9, 19.0), (147.6, 21.0), (146.8, 23.0)]
out = {}
for name, R in (("wide", 2600), ("close", 14000)):
    out[name] = {"land": land(R), "trench": [proj(lo, la, R)[:2] for lo, la in TRENCH],
                 "guam": proj(144.79, 13.45, R)[:2], "deep": proj(142.59, 11.37, R)[:2]}
json.dump(out, open(H / "assets" / "map_pacific.json", "w"))
print({k: (round(v["guam"][0]), round(v["guam"][1]), round(v["deep"][0]), round(v["deep"][1])) for k, v in out.items()})
