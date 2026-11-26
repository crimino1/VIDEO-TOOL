"""Decode the NASA Voyager GLB (Draco) into assets/js/voyager_mesh.js: window.VOYAGER_MESH = {parts: [{pos, idx, color, rough, metal}]} (base64)."""
import base64, json, struct, sys
import numpy as np, DracoPy
src = sys.argv[1] if len(sys.argv) > 1 else "assets/models/Voyager_Probe_A.glb"
f = open(src, "rb").read()
L = struct.unpack("<I", f[12:16])[0]; j = json.loads(f[20:20 + L])
binstart = 20 + L + 8; BIN = f[binstart:]
node_m = None
for n in j["nodes"]:
    if "mesh" in n: node_m = n
parts = []
for p in j["meshes"][0]["primitives"]:
    ext = p["extensions"]["KHR_draco_mesh_compression"]; bv = j["bufferViews"][ext["bufferView"]]
    m = DracoPy.decode(BIN[bv.get("byteOffset", 0): bv.get("byteOffset", 0) + bv["byteLength"]])
    pos = np.asarray(m.points, dtype=np.float32).reshape(-1, 3); idx = np.asarray(m.faces, dtype=np.uint32).reshape(-1)
    mat = j["materials"][p.get("material", 0)]; pb = mat.get("pbrMetallicRoughness", {})
    col = pb.get("baseColorFactor", [0.8, 0.8, 0.8, 1])[:3]
    name = mat.get("name", "")
    rough = pb.get("roughnessFactor", 0.7); metal = 0.55 if any(k in name for k in ("Gold", "Bronze")) else 0.15
    if any(k in name for k in ("Gold", "Bronze")): rough = 0.45
    parts.append({"name": name, "pos": base64.b64encode(pos.tobytes()).decode(), "idx": base64.b64encode(idx.tobytes()).decode(), "color": [round(c, 4) for c in col], "rough": round(rough, 3), "metal": metal})
    print(f"{name:28s} {len(pos):6d} verts {len(idx) // 3:6d} tris {col}")
open("assets/js/voyager_mesh.js", "w").write("window.VOYAGER_MESH = " + json.dumps({"parts": parts, "node": node_m}) + ";\n")
print("wrote assets/js/voyager_mesh.js")
