"""Builds the senior woman. blender --background --python build_character.py"""
import bpy
from pathlib import Path
HERE = Path(__file__).resolve().parent
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.locationservice import LocationService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

macro = TargetService.get_default_macro_info_dict()
macro.update(gender=0.0, age=0.84, muscle=0.42, weight=0.5, proportions=0.62, height=0.45, cupsize=0.5, firmness=0.35)
macro["race"] = {"asian": 0.0, "caucasian": 1.0, "african": 0.0}
base = HumanService.create_human(macro_detail_dict=macro, feet_on_ground=True, scale=0.1)
base.name = "senior"
rig = HumanService.add_builtin_rig(base, "game_engine", import_weights=True)
rig.name = "rig"

data = Path(LocationService.get_user_data())
def asset(rel, kind):
    return HumanService.add_mhclo_asset(str(data / rel), base, asset_type=kind, subdiv_levels=1, material_type="MAKESKIN")

HumanService.set_character_skin(str(data / "skins/old_caucasian_female/old_caucasian_female.mhmat"), base, skin_type="ENHANCED_SSS")
eyes = asset("eyes/high-poly/high-poly.mhclo", "Eyes")
brows = asset("eyebrows/eyebrow003/eyebrow003.mhclo", "Eyebrows")
lashes = asset("eyelashes/eyelashes01/eyelashes01.mhclo", "Eyelashes")
hair = asset("hair/short01/short01.mhclo", "Hair")
suit = asset("clothes/female_casualsuit01/female_casualsuit01.mhclo", "Clothes")
shoes = asset("clothes/shoes05/shoes05.mhclo", "Clothes")

# Eyes: a plain textured iris, because MPFB's procedural eye nodes fail on Blender 5
m = bpy.data.materials.new("eye"); m.use_nodes = True
n = m.node_tree.nodes; b = n["Principled BSDF"]; b.inputs["Roughness"].default_value = 0.08
tex = n.new("ShaderNodeTexImage"); tex.image = bpy.data.images.load(str(data / "eyes/materials/brownlight_eye.png"))
m.node_tree.links.new(tex.outputs["Color"], b.inputs["Base Color"])
eyes.data.materials.clear(); eyes.data.materials.append(m)

# Plain workout clothes: the suit's T-shirt has a logo and its jeans aren't exercise wear
def fabric(name, color, sheen=0.3):
    m = bpy.data.materials.new(name); m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    b = n["Principled BSDF"]; b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = 0.82
    if "Sheen Weight" in b.inputs: b.inputs["Sheen Weight"].default_value = sheen
    noise = n.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 900; noise.inputs["Detail"].default_value = 3
    bump = n.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.12
    l.new(noise.outputs["Fac"], bump.inputs["Height"]); l.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m
suit.data.materials.clear()
suit.data.materials.append(fabric("top", (0.16, 0.42, 0.43)))
suit.data.materials.append(fabric("trousers", (0.045, 0.05, 0.075)))
verts = suit.data.vertices
for p in suit.data.polygons:
    z = sum(verts[i].co.z for i in p.vertices) / len(p.vertices)
    p.material_index = 0 if z > 0.86 else 1
# Silver hair and brows: desaturate and lift whatever colour the texture has
def silver(o, sat, val):
    for mm in o.data.materials:
        t = mm.node_tree; bsdf = next(n for n in t.nodes if n.type == "BSDF_PRINCIPLED")
        link = bsdf.inputs["Base Color"].links[0]; src = link.from_socket; t.links.remove(link)
        hsv = t.nodes.new("ShaderNodeHueSaturation"); hsv.inputs["Saturation"].default_value = sat; hsv.inputs["Value"].default_value = val
        t.links.new(src, hsv.inputs["Color"]); t.links.new(hsv.outputs["Color"], bsdf.inputs["Base Color"])
silver(hair, 0.1, 1.0); silver(brows, 0.2, 1.8)
for mm in hair.data.materials:
    t = mm.node_tree; bsdf = next(n for n in t.nodes if n.type == "BSDF_PRINCIPLED")
    link = bsdf.inputs["Base Color"].links[0]; src = link.from_socket; t.links.remove(link)
    sc = t.nodes.new("ShaderNodeMixRGB"); sc.blend_type = "SCREEN"; sc.inputs[0].default_value = 1.0; sc.inputs[2].default_value = (0.5, 0.5, 0.48, 1)
    t.links.new(src, sc.inputs[1]); t.links.new(sc.outputs[0], bsdf.inputs["Base Color"])

# The shoes come with tall socks that poke through the trousers: cut them off at the ankle
import bmesh
bm = bmesh.new(); bm.from_mesh(shoes.data)
bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.calc_center_median().z > 0.1], context="FACES")
bm.to_mesh(shoes.data); bm.free()

# Lift the clothes a few millimetres so skin can't poke through when arms and legs bend
fat = suit.modifiers.new("fat", "DISPLACE"); fat.strength = 0.006; fat.mid_level = 0.0

# Lighter, clearer eyes: no heavy lashes, and a little glow so they don't read as black in the socket
lashes.hide_render = True
ei = m.node_tree.nodes["Principled BSDF"]
m.node_tree.links.new(tex.outputs["Color"], ei.inputs["Emission Color"]); ei.inputs["Emission Strength"].default_value = 0.6
# Calm the orange tint the old-skin texture puts on the eyelids
for mm in base.data.materials:
    if not mm.node_tree: continue
    for node in list(mm.node_tree.nodes):
        if node.type == "TEX_IMAGE" and node.image and "diffuse" in node.image.name.lower():
            for link in list(node.outputs["Color"].links):
                hsv = mm.node_tree.nodes.new("ShaderNodeHueSaturation"); hsv.inputs["Saturation"].default_value = 0.72
                to = link.to_socket; mm.node_tree.links.remove(link)
                mm.node_tree.links.new(node.outputs["Color"], hsv.inputs["Color"]); mm.node_tree.links.new(hsv.outputs["Color"], to)

# Hide the skin under the clothes, so it can never poke through when she bends
hidden = base.vertex_groups.new(name="under_clothes"); idx = []
for v in base.data.vertices:
    x, z = abs(v.co.x), v.co.z
    legs = 0.1 < z < 0.86 and x < 0.3
    torso = 0.86 <= z < 1.26 and x < 0.2
    upper_arm = 1.17 < z < 1.3 and x < 0.2
    if legs or torso or upper_arm: idx.append(v.index)
hidden.add(idx, 1.0, "REPLACE")
mask = base.modifiers.new("hide_under_clothes", "MASK"); mask.vertex_group = "under_clothes"; mask.invert_vertex_group = True
print("MASKED", len(idx), "of", len(base.data.vertices))

bpy.ops.wm.save_as_mainfile(filepath=str(HERE / "character.blend"))
print("SAVED")
