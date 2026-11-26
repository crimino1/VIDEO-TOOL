import bpy, bmesh, heapq, math
from mathutils import Vector
body, rig = bpy.data.objects["body"], bpy.data.objects["rig"]; me = body.data
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
adj = [[(e.other_vert(v).index, e.calc_length()) for e in v.link_edges] for v in bm.verts]; co = [v.co.copy() for v in bm.verts]
# islands
seen = [False] * len(co); n_isl = 0; sizes = []
for i in range(len(co)):
    if seen[i]: continue
    n_isl += 1; st = [i]; seen[i] = True; c = 0
    while st:
        u = st.pop(); c += 1
        for v, _ in adj[u]:
            if not seen[v]: seen[v] = True; st.append(v)
    sizes.append(c)
print("ISLANDS", n_isl, sorted(sizes, reverse=True)[:6])
wrist = rig.data.bones["lowerarm_l"].tail_local
seeds = [i for i in range(len(co)) if (co[i] - wrist).length < 0.045]
d = [math.inf] * len(co); h = []
for s in seeds: d[s] = 0; heapq.heappush(h, (0, s))
while h:
    x, u = heapq.heappop(h)
    if x > d[u]: continue
    for v, w in adj[u]:
        if x + w < d[v]: d[v] = x + w; heapq.heappush(h, (x + w, v))
for p in [(0.19, 0.0, 0.80), (0.19, 0.02, 0.92), (0.17, 0.05, 1.0), (0.17, 0.05, 1.15), (0.20, 0.03, 0.72)]:
    p = Vector(p); i = min(range(len(co)), key=lambda k: (co[k] - p).length)
    print("PT", tuple(round(x, 2) for x in co[i]), "straight", round((co[i] - wrist).length, 3), "geo", round(d[i], 3))
