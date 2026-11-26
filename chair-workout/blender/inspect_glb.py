import bpy, sys
from mathutils import Vector
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[-1])
lo = Vector((9e9,) * 3); hi = -lo
for o in bpy.data.objects:
    info = ""
    if o.type == "MESH":
        info = f"verts {len(o.data.vertices)} faces {len(o.data.polygons)} mats {[m.name for m in o.data.materials]} vgroups {len(o.vertex_groups)} shapekeys {len(o.data.shape_keys.key_blocks) if o.data.shape_keys else 0} uv {len(o.data.uv_layers)} attrs {[a.name for a in o.data.attributes if not a.name.startswith('.')][:10]}"
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c); lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
    if o.type == "ARMATURE":
        info = f"bones {len(o.data.bones)} {[b.name for b in o.data.bones][:60]}"
    print("OBJ", o.name, o.type, "parent", o.parent.name if o.parent else None, info)
print("BOX", [round(x, 3) for x in lo], [round(x, 3) for x in hi])
for m in bpy.data.materials:
    imgs = [n.image.name + f" {n.image.size[0]}x{n.image.size[1]}" for n in (m.node_tree.nodes if m.node_tree else []) if n.type == "TEX_IMAGE" and n.image]
    print("MAT", m.name, imgs)
print("ACTIONS", [a.name for a in bpy.data.actions])
