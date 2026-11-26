"""List body islands that stretch in the seated pose (rest vs pose measured with the rig's REST/POSE switch).
Pass --delete to remove islands above the threshold."""
import bpy, bmesh, sys
from pathlib import Path
from mathutils import Vector
sys.path.insert(0, str(Path(bpy.data.filepath).parent))
from rigkit import Body
DELETE = "--delete" in sys.argv
rig, body = bpy.data.objects["rig"], bpy.data.objects["body"]
me = body.data
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); bm.edges.ensure_lookup_table()
isl_of = [-1] * len(bm.verts); islands = []
for v in bm.verts:
    if isl_of[v.index] >= 0: continue
    k = len(islands); stack = [v]; isl_of[v.index] = k; cur = []
    while stack:
        x = stack.pop(); cur.append(x.index)
        for e in x.link_edges:
            o = e.other_vert(x)
            if isl_of[o.index] < 0: isl_of[o.index] = k; stack.append(o)
    islands.append(cur)
edges = [(e.verts[0].index, e.verts[1].index) for e in bm.edges]
def evalpos():
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); ev = body.evaluated_get(dg); m = ev.to_mesh()
    P = [v.co.copy() for v in m.vertices]; ev.to_mesh_clear(); return P
rig.data.pose_position = "REST"; R = evalpos(); rig.data.pose_position = "POSE"
b = Body(rig)
b.hips((0, -0.03, 0.611), pitch=3); b.spine()
for s, sx in (("l", 1), ("r", -1)):
    up = s == "r"
    b.foot(s, (sx * 0.12, -0.33 if up else -0.42, 0.30 if up else 0.07), knee=(sx * 0.14, -1.2, 1.0 if up else 0.6))
    sh = b.pos(f"upperarm_{s}"); b.hand(s, sh + Vector((sx * 0.52, -0.05, 0.02)), elbow=sh + Vector((sx * 0.3, 0.2, -0.3)))
P = evalpos()
worst = [0.0] * len(islands)
for a, c in edges:
    r = (R[a] - R[c]).length
    if r < 1e-4: continue
    s = (P[a] - P[c]).length - r; k = isl_of[a]   # metres of growth
    if s > worst[k]: worst[k] = s
top = sorted(range(len(islands)), key=lambda k: -worst[k])[:20]
for k in top:
    c = sum((R[i] for i in islands[k]), Vector()) / len(islands[k])
    print("ISL", k, "grow_m", round(worst[k], 3), "verts", len(islands[k]), "rest centre", [round(x, 3) for x in c])
if DELETE:
    def cen(k): return sum((R[i] for i in islands[k]), Vector()) / len(islands[k])
    bad = [k for k in range(len(islands)) if worst[k] > float(sys.argv[-1]) and abs(cen(k).x) < 0.03 and cen(k).z < 0.4]
    kill = [bm.verts[i] for k in bad for i in islands[k]]
    bmesh.ops.delete(bm, geom=kill, context="VERTS"); bm.to_mesh(me); bm.free()
    for pb in rig.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0)
    bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath, compress=True); print("DELETED", len(bad))
