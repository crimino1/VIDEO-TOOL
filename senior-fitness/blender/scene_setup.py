"""Builds the room once, then places rig, chair and camera for one exercise."""
import bpy, math
import room

def base():
    room.build_room(); chair = room.build_chair(); room.build_lights()
    return chair

def place(spec, chair, cam=None):
    rig = bpy.data.objects["rig"]
    x, y, rz = spec.get("rig", (0, 0, 0))
    rig.location = (x, y, 0); rig.rotation_euler = (0, 0, math.radians(rz))
    cx, cy, crz = spec.get("chair", (0, 0.85, 0))
    chair.location = (cx, cy, 0); chair.rotation_euler = (0, 0, math.radians(crz))
    for o in bpy.data.objects:
        if o.type == "MESH" and o.parent == rig: o.hide_render = bool(spec.get("hide"))
    loc, target, lens = spec["cam"]
    if cam is None:
        return room.build_camera(loc, target, lens)
    cam.location = loc; cam.data.lens = lens; room.aim(cam, target)
    return cam
