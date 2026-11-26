"""Download Poly Haven CC0 assets for three.js.
  tools_ph.py model <outdir> <res> ids...   -> glTF + textures
  tools_ph.py tex   <outdir> <res> ids...   -> diffuse/normal/rough jpgs
  tools_ph.py hdri  <outdir> <res> ids...   -> .hdr"""
import sys, json, os, urllib.request
kind, out, res, ids = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
H = {"User-Agent": "video-tool/1.0"}
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=180).read()
def save(p, u):
    os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "wb").write(get(u))
for i in ids:
    f = json.loads(get(f"https://api.polyhaven.com/files/{i}"))
    d = os.path.join(out, i)
    if kind == "model":
        g = f["gltf"][res]["gltf"]; save(os.path.join(d, os.path.basename(g["url"])), g["url"])
        for p, inc in g.get("include", {}).items(): save(os.path.join(d, p), inc["url"])
    elif kind == "tex":
        for m, nm in (("Diffuse", "diff"), ("nor_gl", "nor"), ("Rough", "rough"), ("AO", "ao"), ("Displacement", "disp")):
            if m in f and res in f[m] and "jpg" in f[m][res]: save(os.path.join(d, f"{nm}.jpg"), f[m][res]["jpg"]["url"])
    elif kind == "hdri":
        save(os.path.join(out, f"{i}.hdr"), f["hdri"][res]["hdr"]["url"])
    print("ok", i, flush=True)
