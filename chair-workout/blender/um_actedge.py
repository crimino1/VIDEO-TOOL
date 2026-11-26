import bpy
m = bpy.data.objects["body"].data.materials[0]; nt = m.node_tree
for n in list(nt.nodes):
    if n.type == "ATTRIBUTE" and n.attribute_name == "act":
        for l in list(n.outputs["Fac"].links):
            to = l.to_socket; nt.links.remove(l)
            mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0.42; mr.inputs["From Max"].default_value = 0.58
            nt.links.new(n.outputs["Fac"], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], to); print("EDGE node added")
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath, compress=True); print("SAVED")
