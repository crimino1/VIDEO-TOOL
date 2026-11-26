from pathlib import Path
p = Path("build_figure.py"); s = p.read_text(encoding="utf-8")
a = s.index("cx = 0.0; cz = sum("); b = s.index("print(\"HEAD\"")
s = s[:a] + "cx, cy, cz = 0.0, -0.055, 1.685   # measured skull centre (height slices of this body)\nrx, ryf, ryb, rzu, rzd = 0.082, 0.100, 0.102, 0.110, 0.115\n" + s[b:]
s = s.replace("    if d.y > 0.01: continue", "    if d.y > -0.01: continue")
s = s.replace("    f = ss(0.0, 0.35, -d.y / ryf) * (1 - ss(-0.75, -0.95, d.z / rzd))", "    f = ss(0.15, 0.6, -d.y / ryf) * (1 - ss(-0.8, -1.0, d.z / rzd))")
p.write_text(s, encoding="utf-8"); print("ok")
