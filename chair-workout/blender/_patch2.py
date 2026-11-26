from pathlib import Path
p = Path("build_figure.py"); s = p.read_text(encoding="utf-8")
a = s.index("# faceless mannequin head"); b = s.index("me.update()", a)
new = '''# faceless mannequin head: press the face onto a smooth egg shape fitted to the skull
helper = {v.index for v in me.vertices if w(v, "HelperGeometry", "JointCubes") > 0.01} - eye
hv = [v for v in me.vertices if v.index not in helper and v.index not in eye and w(v, "head") > 0.7 and w(v, "ears") < 0.1]
cx = 0.0; cz = sum(v.co.z for v in hv) / len(hv); cy = sorted(v.co.y for v in hv)[len(hv) // 2] + 0.01
def pct(vals, q): vals = sorted(vals); return vals[int(q * (len(vals) - 1))]
rx = pct([abs(v.co.x) for v in hv], 0.97); ryb = pct([v.co.y - cy for v in hv if v.co.y > cy], 0.97)
ryf = ryb * 0.93; rzu = pct([v.co.z - cz for v in hv if v.co.z > cz], 0.98); rzd = rzu * 1.08
print("HEAD", round(cy, 3), round(cz, 3), round(rx, 3), round(ryf, 3), round(rzu, 3))
for v in hv:
    d = v.co - Vector((cx, cy, cz))
    if d.y > 0.01: continue
    k = math.sqrt((d.x / rx) ** 2 + (d.y / (ryf if d.y < 0 else ryb)) ** 2 + (d.z / (rzu if d.z > 0 else rzd)) ** 2)
    target = Vector((cx, cy, cz)) + d / max(k, 1e-6)
    f = ss(0.0, 0.35, -d.y / ryf) * (1 - ss(-0.75, -0.95, d.z / rzd))
    v.co = v.co.lerp(target, f)
for i in eye: me.vertices[i].co = Vector((cx, cy, cz)) + (me.vertices[i].co - Vector((cx, cy, cz))) * 0.6
'''
s = s[:a] + new + s[b:]
p.write_text(s, encoding="utf-8")
q = Path("bellies.py"); t = q.read_text(encoding="utf-8")
t = t.replace("            mask = 1.0 - ss(0.75, 1.15, rr)", "            mask = 1.0 - ss(1.1, 1.6, rr)")
t = t.replace("            if rr < 1.6:\n                cands.append((rr, grp, depth * bw,", "            if rr < 1.8:\n                cands.append((rr, grp, depth * bw,")
t = t.replace("            if rr < 1.6:\n                fc =", "            if rr < 1.8:\n                fc =")
q.write_text(t, encoding="utf-8"); print("ok")
