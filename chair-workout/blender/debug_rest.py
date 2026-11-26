import bpy, sys
from pathlib import Path
sys.path.insert(0, str(Path(bpy.data.filepath).parent)); import room
scene = bpy.context.scene; body = bpy.data.objects["body"]; bpy.data.objects["chair"].hide_render = True
me = body.data; n = len(me.vertices); vals = [0.0] * n
for k in ["quads", "abs", "chest", "biceps", "calves", "shoulders", "obliques"]:
    a = [0.0] * n; me.attributes["m_" + k].data.foreach_get("value", a); vals = [max(x, y) for x, y in zip(vals, a)]
me.attributes["active"].data.foreach_set("value", vals); me.update()
for o in list(bpy.data.objects):
    if o.type in ("LIGHT", "CAMERA"): bpy.data.objects.remove(o, do_unlink=True)
d = bpy.data.lights.new("k", "SUN"); d.energy = 3; o = bpy.data.objects.new("k", d); scene.collection.objects.link(o); o.rotation_euler = (0.9, 0, -0.5)
room.build_camera((0, -4.2, 1.0), (0, 0, 0.92), 45); room.eevee(scene, 960, 540, 8)
scene.render.filepath = sys.argv[-1]; bpy.ops.render.render(write_still=True)
