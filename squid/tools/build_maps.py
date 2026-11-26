"""South-polar map of real coastlines (Natural Earth via world-atlas, public domain) as one SVG path.
Orthographic projection centred on the South Pole; writes assets/map_south.json with the path and named places."""
import json, math
from pathlib import Path
H = Path(__file__).resolve().parent.parent
topo = json.loads((H.parent / "polar-bear" / "tools" / "land-50m.json").read_text(encoding="utf-8"))
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
    for poly in (g["arcs"] if g["type"] == "MultiPolygon" else [g["arcs"]]):
        for r in poly: rings.append(ring(r))

R, CX, CY, ROT = 1000, 960, 540, 0.0


def proj(lon, lat):
    la, lo = math.radians(lat), math.radians(lon + ROT)
    rr = R * math.cos(la)
    return CX + rr * math.sin(lo), CY + rr * math.cos(lo)   # south up-view: lon 0 points down


parts = []
for r in rings:
    if min(p[1] for p in r) > -12: continue
    pts = [proj(lo, max(-89.9, min(la, -12))) for lo, la in r]
    if len(pts) < 3: continue
    d = "M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts[::1]) + "Z"
    parts.append(d)
places = {"ross": proj(180, -73), "ssi": proj(-26.4, -57.8), "sgeorgia": proj(-36.5, -54.3), "pole": proj(0, -90),
          "nz": proj(172, -41), "ross_sea_label": proj(-175, -72)}
circles = {str(l): R * math.cos(math.radians(l)) for l in (-40, -50, -60, -70, -80)}
json.dump({"land": " ".join(parts), "places": places, "circles": circles, "center": [CX, CY]}, open(H / "assets" / "map_south.json", "w"))
print(len(parts), "rings", {k: (round(v[0]), round(v[1])) for k, v in places.items()})
