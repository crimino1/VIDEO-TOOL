"""Refine the user-model figure: clean degenerate faces (black specks), snap muscle-zone borders to the sculpted
grooves (curvature-weighted label smoothing), keep fibres only on red muscle.
blender -b --disable-autoexec um_auto.blend --python um_refine.py"""
import bpy, bmesh, math
from collections import defaultdict
body = bpy.data.objects["body"]; me = body.data

# ---- degenerate faces -> black specks
bm = bmesh.new(); bm.from_mesh(me)
n0 = len(bm.faces)
bmesh.ops.dissolve_degenerate(bm, dist=1e-6, edges=bm.edges)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bm.to_mesh(me); bm.free(); me.update()
print("FACES", n0, "->", len(me.polygons))

# ---- curvature per vertex (positive = groove / concave)
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); bm.normal_update()
nbr = [[e.other_vert(v).index for e in v.link_edges] for v in bm.verts]
conc = []
for v in bm.verts:
    if not v.link_edges: conc.append(0.0); continue
    avg = sum((e.other_vert(v).co for e in v.link_edges), v.co * 0) / len(v.link_edges)
    el = sum(e.calc_length() for e in v.link_edges) / len(v.link_edges)
    conc.append((avg - v.co).dot(v.normal) / max(el, 1e-6))   # >0 when the neighbours sit above: a groove
bm.free()
# smooth curvature a little
for _ in range(2):
    conc = [(conc[i] * 2 + sum(conc[j] for j in nbr[i])) / (2 + len(nbr[i])) for i in range(len(conc))]
cs = sorted(conc); hi = cs[int(0.92 * len(cs))]
print("GROOVE threshold", round(hi, 4))

# ---- label smoothing: neighbours vote, but votes across grooves count little
g = [0.0] * len(me.vertices); me.attributes["grp"].data.foreach_get("value", g)
fixed = [x == -1.0 for x in g]          # head/hands/feet stay white
for it in range(25):
    new = g[:]
    for i in range(len(g)):
        if fixed[i]: continue
        votes = defaultdict(float); votes[g[i]] += 1.5
        for j in nbr[i]:
            groove = max(0.0, (conc[i] + conc[j]) * 0.5)
            w = math.exp(-6.0 * groove / max(hi, 1e-6))
            votes[g[j]] += w
        new[i] = max(votes.items(), key=lambda kv: kv[1])[0]
    g = new
me.attributes["grp"].data.foreach_set("value", g)

# ---- material: no fibres on white, softer fibres on red
mat = me.materials[0]
for n in mat.node_tree.nodes:
    if n.type == "VALTORGB":
        c0, c1 = n.color_ramp.elements[0].color, n.color_ramp.elements[1].color
        if c1[0] < 0.7 and abs(c1[0] - c1[2]) < 0.05:   # the white-muscle ramp
            n.color_ramp.elements[0].color = (0.60, 0.60, 0.62, 1); n.color_ramp.elements[1].color = (0.60, 0.60, 0.62, 1)
        elif c1[0] > 0.7:
            n.color_ramp.elements[0].color = (0.62, 0.07, 0.04, 1); n.color_ramp.elements[1].color = (0.80, 0.11, 0.06, 1)
    if n.type == "TEX_WAVE": n.inputs["Scale"].default_value = 300; n.inputs["Distortion"].default_value = 0.8
    if n.type == "MIX" and n.data_type == "RGBA" and n.blend_type == "MIX":
        b = n.inputs["B"].default_value
        if abs(b[0] - 0.58) < 0.03 and abs(b[2] - 0.60) < 0.03: n.inputs["B"].default_value = (0.60, 0.60, 0.62, 1)
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath, compress=True)
print("SAVED")
