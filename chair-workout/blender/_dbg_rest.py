import bpy, sys
from pathlib import Path
sys.path.insert(0, str(Path(bpy.data.filepath).parent)); import room
scene = bpy.data.scenes.new("dbg")
rig, body = bpy.data.objects["rig"], bpy.data.objects["body"]
for o in (rig, body): scene.collection.objects.link(o)
rig.data.pose_position = "REST"
gi = {g.index: g.name for g in body.vertex_groups}
import collections
c = collections.Counter(); none = 0
for v in body.data.vertices:
    if v.co.z > 1.55:
        if not v.groups: none += 1
        for g in v.groups:
            if g.weight > 0.3: c[gi[g.group]] += 1
print("HEADW", dict(c), "noweight", none)
hands = sum(1 for v in body.data.vertices if abs(v.co.x) > 0.27 and v.co.z < 0.86); print("HANDVERTS", hands)
cd = bpy.data.cameras.new("c"); cam = bpy.data.objects.new("c", cd); scene.collection.objects.link(cam); cam.location = (0, -3.6, 0.95); room.aim(cam, (0, 0, 0.88)); scene.camera = cam; cd.lens = 45
scene.render.engine = "BLENDER_WORKBENCH"; scene.render.resolution_x, scene.render.resolution_y = 960, 540
scene.render.filepath = sys.argv[-1]; bpy.ops.render.render(write_still=True, scene=scene.name)
