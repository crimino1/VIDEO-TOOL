import bpy, sys, time
from pathlib import Path
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
import room
scene = bpy.context.scene
rig = bpy.data.objects["rig"]
print("BONES", " ".join(b.name for b in rig.data.bones if not any(k in b.name for k in ("thumb", "index", "middle", "ring", "pinky"))))
for n in ("pelvis", "spine_01", "head", "thigh_l", "calf_l", "foot_l", "upperarm_l", "lowerarm_l", "hand_l", "ball_l"):
    b = rig.data.bones.get(n)
    if b: print("BONE", n, [round(v, 3) for v in rig.matrix_world @ b.head_local], [round(v, 3) for v in rig.matrix_world @ b.tail_local])
for o in bpy.data.objects:
    if o.type == "MESH": print("MESH", o.name, [round(d, 3) for d in o.dimensions], [m.name for m in o.data.materials])
room.build_room(); room.build_chair(); room.build_lights()
rig.location = (0.75, -0.6, 0)
room.build_camera((0.3, -4.6, 1.15), (0.3, 0, 0.88), 42)
room.eevee(scene, 1280, 720, 32)
scene.render.filepath = str(HERE / "out" / "test_room.png")
t = time.time(); bpy.ops.render.render(write_still=True); print("RENDER SECONDS", round(time.time() - t, 1))
room.build_camera((0.75, -1.5, 1.45), (0.75, -0.6, 1.42), 60)
scene.render.filepath = str(HERE / "out" / "test_face.png")
t = time.time(); bpy.ops.render.render(write_still=True); print("RENDER SECONDS", round(time.time() - t, 1))
