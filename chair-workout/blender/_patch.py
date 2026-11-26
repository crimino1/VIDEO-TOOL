from pathlib import Path
p = Path("build_figure.py"); s = p.read_text(encoding="utf-8")
a = s.index("N = len(me.vertices)\nG = {k:"); b = s.index("# faceless mannequin head")
new = '''N = len(me.vertices)
import sys; sys.path.insert(0, str(HERE)); import bellies
G, height, fib = bellies.build(me, w, bone, ss, eye)
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
nbr = [[e.other_vert(bv).index for e in bv.link_edges] for bv in bm.verts]; bm.free()
def blur(vals, it):
    for _ in range(it):
        vals[:] = [(vals[i] * 2 + sum(vals[j] for j in nbr[i])) / (2 + len(nbr[i])) for i in range(N)]
for k in G: blur(G[k], 2)
blur(height, 2)
for v in me.vertices:
    v.co += v.normal * height[v.index]
# nipples flattened (mannequin)
nip = [v.index for v in me.vertices if w(v, "nipple", "nippleTip") > 0.05]
ring = set(nip)
for _ in range(2): ring |= {j for i in list(ring) for j in nbr[i]}
pos = {i: me.vertices[i].co.copy() for i in ring}
for _ in range(40):
    pos = {i: sum((pos.get(j, me.vertices[j].co) for j in nbr[i]), Vector()) / len(nbr[i]) for i in ring}
for i in ring: me.vertices[i].co = pos[i]

'''
s = s[:a] + new + s[b:]
s = s.replace("for _ in range(160):\n    pos = {i: pos[i] * 0.3 +", "for _ in range(500):\n    pos = {i: pos[i] * 0.05 +")
s = s.replace('for k, vals in G.items():\n    a = me.attributes.new("m_" + k, "FLOAT", "POINT"); a.data.foreach_set("value", [min(1.0, x * 1.3) for x in vals])',
              'for k, vals in G.items():\n    a = me.attributes.new("m_" + k, "FLOAT", "POINT"); a.data.foreach_set("value", [min(1.0, x) for x in vals])\nme.attributes.new("fib", "FLOAT", "POINT").data.foreach_set("value", fib)')
# fibres: wave along the per-muscle fibre coordinate instead of world X
s = s.replace('rest = Nn.new("ShaderNodeAttribute"); rest.attribute_name = "rest"\n    wave = Nn.new("ShaderNodeTexWave"); wave.wave_profile = "SIN"; wave.bands_direction = "X"',
              'fibat = Nn.new("ShaderNodeAttribute"); fibat.attribute_name = "fib"\n    rest = Nn.new("ShaderNodeCombineXYZ"); L.new(fibat.outputs["Fac"], rest.inputs["X"])\n    wave = Nn.new("ShaderNodeTexWave"); wave.wave_profile = "SIN"; wave.bands_direction = "X"')
s = s.replace('wave.inputs["Scale"].default_value = 110; wave.inputs["Distortion"].default_value = 1.2', 'wave.inputs["Scale"].default_value = 160; wave.inputs["Distortion"].default_value = 0.6')
p.write_text(s, encoding="utf-8"); print("patched")
