"""Print GLB stats (meshes, triangles, textures): glb_info.py file.glb ..."""
import json, struct, sys
for f in sys.argv[1:]:
    b = open(f, "rb").read()
    if b[:4] != b"glTF":
        print(f, "NOT A GLB:", b[:80]); continue
    n = struct.unpack_from("<I", b, 12)[0]
    g = json.loads(b[20:20 + n])
    acc, tris, verts = g.get("accessors", []), 0, 0
    for m in g.get("meshes", []):
        for p in m["primitives"]:
            verts += acc[p["attributes"]["POSITION"]]["count"]
            tris += (acc[p["indices"]]["count"] if "indices" in p else acc[p["attributes"]["POSITION"]]["count"]) // 3
    print(f, f"{len(b)/1e6:.1f} MB", "meshes", len(g.get("meshes", [])), "tris", tris, "verts", verts,
          "materials", len(g.get("materials", [])), "textures", len(g.get("textures", [])),
          "images", [i.get("mimeType") or i.get("uri") for i in g.get("images", [])])
