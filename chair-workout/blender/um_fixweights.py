"""Remove arm weights from torso/thigh skin (and leg weights from hands) using distance along the skin:
a point that is close to the wrist in a straight line but far along the surface is not part of that arm.
blender -b --disable-autoexec um_figure.blend --python um_fixweights.py"""
import bpy, bmesh, heapq, math

body, rig = bpy.data.objects["body"], bpy.data.objects["rig"]
me = body.data
J = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in rig.data.bones}
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
adj = [[(e.other_vert(v).index, e.calc_length()) for e in v.link_edges] for v in bm.verts]
co = [v.co.copy() for v in bm.verts]; bm.free()
N = len(co)

def geodesic(seeds, limit=1.6):
    d = [math.inf] * N; h = []
    for s in seeds: d[s] = 0.0; heapq.heappush(h, (0.0, s))
    while h:
        dist, u = heapq.heappop(h)
        if dist > d[u] or dist > limit: continue
        for v, w in adj[u]:
            nd = dist + w
            if nd < d[v]: d[v] = nd; heapq.heappush(h, (nd, v))
    return d

gidx = {g.name: g.index for g in body.vertex_groups}
removed = 0
for s in "lr":
    for anchor, bones in ((J[f"lowerarm_{s}"][1], ("upperarm", "lowerarm", "hand")), (J[f"calf_{s}"][0], ("thigh", "calf", "foot", "ball"))):
        seeds = [i for i in range(N) if (co[i] - anchor).length < 0.045]
        if not seeds: print("NO SEEDS", s, bones[0]); continue
        g = geodesic(seeds)
        ids = {gidx[f"{b}_{s}"] for b in bones}
        for v in me.vertices:
            if not any(x.group in ids for x in v.groups): continue
            straight = (co[v.index] - anchor).length
            if g[v.index] > 1.5 * straight + 0.10:
                for x in [x for x in v.groups if x.group in ids]:
                    body.vertex_groups[x.group].remove([v.index]); removed += 1
from mathutils import Vector
rules = []
for s in "lr":   # elbow anchor: torso skin must not follow the upper/lower arm
    rules.append(([J[f"lowerarm_{s}"][0]], {gidx[f"upperarm_{s}"], gidx[f"lowerarm_{s}"], gidx[f"hand_{s}"]}))
# belly/back anchor: arms and hands must not follow the hips and lower spine
rules.append(([Vector((0, -0.10, 1.05)), Vector((0, 0.14, 1.05)), Vector((0, -0.10, 0.95))], {gidx[n] for n in ("pelvis", "spine_01", "spine_02")}))
for anchors, ids in rules:
    seeds = [i for i in range(N) if min((co[i] - a).length for a in anchors) < 0.05]
    if not seeds: print("NO SEEDS rule"); continue
    g = geodesic(seeds, 2.5)
    for v in me.vertices:
        if not any(x.group in ids for x in v.groups): continue
        straight = min((co[v.index] - a).length for a in anchors)
        if g[v.index] > 1.5 * straight + 0.15:
            for x in [x for x in v.groups if x.group in ids]:
                body.vertex_groups[x.group].remove([v.index]); removed += 1
print("REMOVED weights", removed)

# fill any vertex left without weights from its neighbours (a few rounds of spreading)
def total(v): return sum(x.weight for x in v.groups)
for _ in range(30):
    empty = [v for v in me.vertices if total(v) < 1e-4]
    if not empty: break
    for v in empty:
        acc = {}
        for n, _ in adj[v.index]:
            for x in me.vertices[n].groups:
                acc[x.group] = acc.get(x.group, 0.0) + x.weight
        for gi, wsum in acc.items():
            body.vertex_groups[gi].add([v.index], wsum, "REPLACE")
print("EMPTY left", sum(1 for v in me.vertices if total(v) < 1e-4))
bpy.context.view_layer.objects.active = body
bpy.ops.object.vertex_group_normalize_all(lock_active=False)
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath, compress=True)
print("SAVED")
