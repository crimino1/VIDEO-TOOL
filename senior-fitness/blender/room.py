"""Room, chair, light and camera shared by every exercise."""
import bpy, math
from mathutils import Vector

def mat(name, color, rough=0.6, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    return m

def box(name, loc, size, material, bevel=0.0, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        mod = o.modifiers.new("b", "BEVEL"); mod.width = bevel; mod.segments = 3
    o.data.materials.append(material)
    for p in o.data.polygons: p.use_smooth = True
    if parent: o.parent = parent
    return o

def wood_floor():
    m = bpy.data.materials.new("floor"); m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    b = n["Principled BSDF"]; b.inputs["Roughness"].default_value = 0.42
    tc = n.new("ShaderNodeTexCoord")
    br = n.new("ShaderNodeTexBrick"); br.inputs["Color1"].default_value = (0.42, 0.27, 0.16, 1); br.inputs["Color2"].default_value = (0.5, 0.33, 0.2, 1); br.inputs["Mortar"].default_value = (0.2, 0.12, 0.07, 1)
    br.inputs["Scale"].default_value = 1.0; br.inputs["Mortar Size"].default_value = 0.004; br.inputs["Brick Width"].default_value = 1.4; br.inputs["Row Height"].default_value = 0.16
    no = n.new("ShaderNodeTexNoise"); no.inputs["Scale"].default_value = 3.0; no.inputs["Detail"].default_value = 8
    mix = n.new("ShaderNodeMixRGB"); mix.blend_type = "MULTIPLY"; mix.inputs[0].default_value = 0.35
    l.new(tc.outputs["Object"], br.inputs["Vector"]); l.new(tc.outputs["Object"], no.inputs["Vector"])
    l.new(br.outputs["Color"], mix.inputs[1]); l.new(no.outputs["Fac"], mix.inputs[2]); l.new(mix.outputs[0], b.inputs["Base Color"])
    return m

SEAT_H, SEAT_D = 0.46, 0.44

def build_room():
    wall_m = mat("wall", (0.8, 0.68, 0.52), 0.85); trim = mat("trim", (0.93, 0.92, 0.89), 0.5)
    bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, 0)); f = bpy.context.active_object; f.name = "floor"; f.data.materials.append(wood_floor())
    box("wall_back", (0, 1.15, 1.6), (14, 0.1, 3.2), wall_m)
    box("wall_left", (-3.6, 0, 1.6), (0.1, 14, 3.2), wall_m)
    box("skirting", (0, 1.09, 0.06), (14, 0.02, 0.12), trim)
    # window glow on the back wall, out of the way of the figure
    glow = mat("window", (1, 1, 1)); b = glow.node_tree.nodes["Principled BSDF"]; b.inputs["Emission Color"].default_value = (1, 0.97, 0.9, 1); b.inputs["Emission Strength"].default_value = 2.2
    box("win_frame", (-2.15, 1.09, 1.65), (1.5, 0.03, 1.9), trim)
    box("win_glass", (-2.15, 1.075, 1.65), (1.34, 0.01, 1.74), glow)
    box("win_bar_v", (-2.15, 1.065, 1.65), (0.04, 0.01, 1.74), trim)
    box("win_bar_h", (-2.15, 1.065, 1.65), (1.34, 0.01, 0.04), trim)
    # a framed picture so the room feels lived in
    box("pic", (1.4, 1.09, 1.75), (0.8, 0.03, 0.6), mat("picframe", (0.2, 0.15, 0.11), 0.4))
    box("pic_in", (1.4, 1.075, 1.75), (0.7, 0.01, 0.5), mat("picart", (0.55, 0.66, 0.68), 0.7))
    return wall_m

def build_chair():
    """Sturdy wooden chair facing the camera (-Y), back close to the wall."""
    w = mat("chair", (0.3, 0.17, 0.09), 0.38); cushion = mat("cushion", (0.28, 0.42, 0.4), 0.85)
    bpy.ops.object.empty_add(location=(0, 0, 0)); root = bpy.context.active_object; root.name = "chair"
    w2, d2 = 0.23, SEAT_D / 2; t = 0.045
    box("seat", (0, 0, SEAT_H - 0.03), (w2 * 2, SEAT_D, 0.045), w, 0.008, root)
    box("cush", (0, -0.005, SEAT_H - 0.002), (w2 * 2 - 0.02, SEAT_D - 0.02, 0.03), cushion, 0.012, root)
    for sx in (-1, 1):
        box("leg_f", (sx * (w2 - t / 2), -d2 + t / 2, (SEAT_H - 0.05) / 2), (t, t, SEAT_H - 0.05), w, 0.005, root)
        box("leg_b", (sx * (w2 - t / 2), d2 - t / 2, 0.47), (t, t, 0.94), w, 0.005, root)
    box("rail_top", (0, d2 - t / 2, 0.9), (w2 * 2, 0.03, 0.09), w, 0.008, root)
    box("rail_mid", (0, d2 - t / 2, 0.68), (w2 * 2, 0.02, 0.05), w, 0.006, root)
    return root

def aim(o, target):
    o.rotation_euler = (Vector(target) - o.location).to_track_quat("-Z", "Y").to_euler()

def build_lights():
    world = bpy.data.worlds.new("w"); bpy.context.scene.world = world; world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.82, 0.86, 0.95, 1); world.node_tree.nodes["Background"].inputs[1].default_value = 0.3
    bpy.ops.object.light_add(type="AREA", location=(-2.6, -2.4, 2.6)); k = bpy.context.active_object; k.name = "key"; k.data.size = 0.9; k.data.energy = 340; k.data.color = (1, 0.95, 0.86); aim(k, (0, 0, 1))
    bpy.ops.object.light_add(type="AREA", location=(2.6, -2.0, 1.8)); f = bpy.context.active_object; f.name = "fill"; f.data.size = 3; f.data.energy = 60; f.data.color = (0.85, 0.92, 1); aim(f, (0, 0, 1))
    bpy.ops.object.light_add(type="AREA", location=(0.6, 0.9, 2.9)); r = bpy.context.active_object; r.name = "rim"; r.data.size = 1.6; r.data.energy = 45; aim(r, (0, 0, 1.1))

def build_camera(loc, target, lens=50):
    bpy.ops.object.camera_add(location=loc); c = bpy.context.active_object; c.name = "cam"; c.data.lens = lens
    aim(c, target)
    bpy.context.scene.camera = c
    return c

def eevee(scene, w=1920, h=1080, samples=48):
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.eevee.taa_render_samples = samples
    if hasattr(scene.eevee, "use_raytracing"): scene.eevee.use_raytracing = True
    for k, v in (("shadow_ray_count", 2), ("shadow_step_count", 6), ("use_shadow_jitter_viewport", False)):
        if hasattr(scene.eevee, k): setattr(scene.eevee, k, v)
    scene.view_settings.view_transform = "AgX"; scene.view_settings.look = "AgX - Medium High Contrast"

