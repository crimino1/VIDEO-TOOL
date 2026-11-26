"""Real strands for hair, brows and beard stubble, grown each frame on the posed body (geometry nodes after the armature),
so they follow every move. Strands flow out from the crown; brows grow sideways; stubble is very short.
blender -b um_<name>_r.blend --python um_hair.py -- <name> [hair_len] [beard_len]     (saves in place)"""
import bpy, sys
args = sys.argv[sys.argv.index("--") + 1:]
name = args[0]
HAIR_LEN = float(args[1]) if len(args) > 1 else 0.009
BEARD_LEN = float(args[2]) if len(args) > 2 else 0.0
body = bpy.data.objects["body"]; me = body.data
if body.modifiers.get("hair_gn"):                    # re-run: replace the old hair
    body.modifiers.remove(body.modifiers["hair_gn"])
    for g in [g for g in bpy.data.node_groups if g.name.startswith("grow_hair")]: bpy.data.node_groups.remove(g)

# crown = highest scalp vertex, face front = most forward head vertex (indices are stable, positions are read posed)
hv = [0.0] * len(me.vertices); me.attributes["hair"].data.foreach_get("value", hv)
crown = max((v for v in me.vertices if hv[v.index] > 0.5), key=lambda v: v.co.z).index
# head frame from two mid-line vertices: nose tip (front) and back of the skull, so "combed back" follows the posed head
mid = [v for v in me.vertices if abs(v.co.x) < 0.006 and 1.59 < v.co.z < 1.66]
nose = min(mid, key=lambda v: v.co.y).index; occ = max(mid, key=lambda v: v.co.y).index

skin = me.materials["skin"]
ramp = skin.node_tree.nodes["Color Ramp.003"]
c0, c1 = ramp.color_ramp.elements[0].color, ramp.color_ramp.elements[1].color
def strand_mat(nm, mix, rough):
    m = bpy.data.materials.get(nm) or bpy.data.materials.new(nm); m.use_nodes = True
    nt = m.node_tree; N, L = nt.nodes, nt.links
    b = N["Principled BSDF"]
    # per-strand colour variation between the two hair tones
    info = N.new("ShaderNodeHairInfo"); rmp = N.new("ShaderNodeValToRGB")
    rmp.color_ramp.elements[0].color = tuple(c0[i] * (1 - mix) + c1[i] * mix * 0.6 for i in range(3)) + (1,)
    rmp.color_ramp.elements[1].color = tuple(c1[i] * 1.05 for i in range(3)) + (1,)
    L.new(info.outputs["Random"], rmp.inputs["Fac"]); L.new(rmp.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough; b.inputs["Specular IOR Level"].default_value = 0.5
    return m
hair_m = strand_mat("hair_strand", 0.5, 0.42)
brow_m = strand_mat("brow_strand", 0.2, 0.5)
for m in (hair_m, brow_m):
    if m.name not in [x.name for x in me.materials if x]: me.materials.append(m)

ng = bpy.data.node_groups.new("grow_hair", "GeometryNodeTree")
ng.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
ng.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
N, L = ng.nodes, ng.links
gi = N.new("NodeGroupInput"); go = N.new("NodeGroupOutput")
join = N.new("GeometryNodeJoinGeometry")
L.new(gi.outputs[0], join.inputs[0])

def V(op, a=None, b=None, **kw):
    n = N.new("ShaderNodeVectorMath"); n.operation = op
    if a is not None: L.new(a, n.inputs[0])
    if b is not None: L.new(b, n.inputs[1])
    return n

GRAV = {"crown": 0.25, "side": 0.15, "stubble": 0.1}
def grow(attr, thr, density, length, radius, mat, mode, seed):
    na = N.new("GeometryNodeInputNamedAttribute"); na.data_type = "FLOAT"; na.inputs["Name"].default_value = attr
    cmp = N.new("FunctionNodeCompare"); cmp.data_type = "FLOAT"; cmp.operation = "GREATER_THAN"; cmp.inputs[1].default_value = thr
    L.new(na.outputs["Attribute"], cmp.inputs[0])
    dist = N.new("GeometryNodeDistributePointsOnFaces"); dist.distribute_method = "RANDOM"
    L.new(gi.outputs[0], dist.inputs["Mesh"]); L.new(cmp.outputs[0], dist.inputs["Selection"])
    dist.inputs["Density"].default_value = density; dist.inputs["Seed"].default_value = seed
    # posed crown position, read from the mesh each frame
    pos = N.new("GeometryNodeInputPosition")
    si = N.new("GeometryNodeSampleIndex"); si.data_type = "FLOAT_VECTOR"; si.domain = "POINT"
    L.new(gi.outputs[0], si.inputs["Geometry"]); L.new(pos.outputs[0], si.inputs["Value"]); si.inputs["Index"].default_value = crown
    nrm = dist.outputs["Normal"]
    if mode == "crown":            # combed back and a little down, lying flat on the scalp (older man's short cut)
        def samp(ix):
            s2 = N.new("GeometryNodeSampleIndex"); s2.data_type = "FLOAT_VECTOR"; s2.domain = "POINT"
            L.new(gi.outputs[0], s2.inputs["Geometry"]); L.new(pos.outputs[0], s2.inputs["Value"]); s2.inputs["Index"].default_value = ix
            return s2.outputs[0]
        pn, po = samp(nose), samp(occ)
        back = V("NORMALIZE", V("SUBTRACT", po, pn).outputs[0])
        mid_p = V("SCALE", V("ADD", po, pn).outputs[0]); mid_p.inputs["Scale"].default_value = 0.5
        up = V("NORMALIZE", V("SUBTRACT", si.outputs[0], mid_p.outputs[0]).outputs[0])
        dn_up = V("SCALE", up.outputs[0]); dn_up.inputs["Scale"].default_value = -0.45
        rn = V("ADD", back.outputs[0], dn_up.outputs[0])
        d = V("DOT_PRODUCT", rn.outputs[0], nrm); sc = V("SCALE", nrm); L.new(d.outputs["Value"], sc.inputs["Scale"])
        t = V("SUBTRACT", rn.outputs[0], sc.outputs[0])
        lift = V("SCALE", nrm); lift.inputs["Scale"].default_value = 0.18
        dirv = V("ADD", t.outputs[0], lift.outputs[0])
    else:                          # brows / stubble: mostly along the surface, outward from the face centre line
        r = V("SUBTRACT", pos.outputs[0], si.outputs[0]); rn = V("NORMALIZE", r.outputs[0])
        lift = V("SCALE", nrm); lift.inputs["Scale"].default_value = 0.8 if mode == "stubble" else 0.35
        dirv = V("ADD", rn.outputs[0], lift.outputs[0])
    dn = V("NORMALIZE", dirv.outputs[0])
    # strand: a short line with 4 points, bent a little by noise
    line = N.new("GeometryNodeCurvePrimitiveLine"); line.inputs["End"].default_value = (0, 0, length)
    res = N.new("GeometryNodeResampleCurve"); res.inputs["Count"].default_value = 4
    L.new(line.outputs[0], res.inputs["Curve"])
    rot = N.new("FunctionNodeAlignRotationToVector"); rot.axis = "Z"
    L.new(dn.outputs[0], rot.inputs["Vector"])
    inst = N.new("GeometryNodeInstanceOnPoints")
    L.new(dist.outputs["Points"], inst.inputs["Points"]); L.new(res.outputs[0], inst.inputs["Instance"]); L.new(rot.outputs[0], inst.inputs["Rotation"])
    rnd = N.new("FunctionNodeRandomValue"); rnd.data_type = "FLOAT"; rnd.inputs["Seed"].default_value = seed
    fin = [x for x in rnd.inputs if x.type == "VALUE" and x.name in ("Min", "Max")]
    fin[0].default_value = 0.6; fin[1].default_value = 1.15
    rout = next(x for x in rnd.outputs if x.type == "VALUE")
    sc_i = N.new("GeometryNodeScaleInstances"); L.new(inst.outputs[0], sc_i.inputs["Instances"]); L.new(rout, sc_i.inputs["Scale"])
    real = N.new("GeometryNodeRealizeInstances"); L.new(sc_i.outputs[0], real.inputs[0])
    # tips droop and wander slightly
    par = N.new("GeometryNodeSplineParameter"); noise = N.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 180.0
    cen = V("SUBTRACT", noise.outputs["Color"]); cen.inputs[1].default_value = (0.5, 0.5, 0.5)
    amt = N.new("ShaderNodeMath"); amt.operation = "MULTIPLY"; amt.inputs[1].default_value = length * 0.6
    L.new(par.outputs["Factor"], amt.inputs[0])
    off = V("SCALE", cen.outputs[0]); L.new(amt.outputs[0], off.inputs["Scale"])
    sq = N.new("ShaderNodeMath"); sq.operation = "POWER"; sq.inputs[1].default_value = 2.0; L.new(par.outputs["Factor"], sq.inputs[0])
    gv = N.new("ShaderNodeMath"); gv.operation = "MULTIPLY"; gv.inputs[1].default_value = -length * GRAV[mode]; L.new(sq.outputs[0], gv.inputs[0])
    gvec = N.new("ShaderNodeCombineXYZ"); L.new(gv.outputs[0], gvec.inputs["Z"])
    tot = V("ADD", off.outputs[0], gvec.outputs[0])
    sp = N.new("GeometryNodeSetPosition"); L.new(real.outputs[0], sp.inputs["Geometry"]); L.new(tot.outputs[0], sp.inputs["Offset"])
    rad = N.new("GeometryNodeSetCurveRadius"); rad.inputs["Radius"].default_value = radius
    L.new(sp.outputs[0], rad.inputs["Curve"])
    mt = N.new("GeometryNodeSetMaterial"); mt.inputs["Material"].default_value = mat
    L.new(rad.outputs[0], mt.inputs["Geometry"])
    # strands as thin 3-sided tubes (plain curves from a mesh object do not render)
    prof = N.new("GeometryNodeCurvePrimitiveCircle"); prof.inputs["Resolution"].default_value = 3; prof.inputs["Radius"].default_value = radius
    c2m = N.new("GeometryNodeCurveToMesh"); L.new(mt.outputs[0], c2m.inputs["Curve"]); L.new(prof.outputs["Curve"], c2m.inputs["Profile Curve"])
    shade = N.new("GeometryNodeSetShadeSmooth"); L.new(c2m.outputs[0], shade.inputs["Geometry"])
    L.new(shade.outputs[0], join.inputs[0])

grow("hair", 0.68, 560000.0, HAIR_LEN, 0.00030, hair_m, "crown", 3)      # half the strands, a little thicker: same look at full-body size, ~2x faster
grow("brow", 0.7, 450000.0, 0.0032, 0.00012, brow_m, "side", 5)
if BEARD_LEN > 0 and me.attributes.get("beard"):
    grow("beard", 0.5, 900000.0, BEARD_LEN, 0.00020, hair_m, "stubble", 7)
L.new(join.outputs[0], go.inputs[0])

mod = body.modifiers.new("hair_gn", "NODES"); mod.node_group = ng
print("HAIR ADDED", name, "crown vertex", crown)
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
