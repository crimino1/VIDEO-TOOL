from pathlib import Path
p = Path("blender/build_figure.py"); s = p.read_text(encoding="utf-8")
s = s.replace('mix.inputs["A"].default_value = (0.62, 0.63, 0.65, 1)', 'mix.inputs["A"].default_value = (0.50, 0.51, 0.53, 1)')
s = s.replace('fib.color_ramp.elements[0].color = (0.50, 0.05, 0.03, 1); fib.color_ramp.elements[1].color = (0.95, 0.20, 0.11, 1)',
              'fib.color_ramp.elements[0].color = (0.30, 0.02, 0.015, 1); fib.color_ramp.elements[1].color = (0.80, 0.08, 0.04, 1)')
s = s.replace('gm.inputs["To Min"].default_value = 0.25', 'gm.inputs["To Min"].default_value = 0.2')
p.write_text(s, encoding="utf-8")
r = Path("blender/sample_still.py"); u = r.read_text(encoding="utf-8")
u = u.replace('scene.view_settings.view_transform = "AgX"; scene.view_settings.look = "AgX - Medium High Contrast"; scene.view_settings.exposure = -0.55',
              'scene.view_settings.view_transform = "Standard"; scene.view_settings.look = "Medium High Contrast"; scene.view_settings.exposure = -0.35')
r.write_text(u, encoding="utf-8")
c = Path("tools/composite.py"); t = c.read_text(encoding="utf-8")
t = t.replace('cx, cy, rw = (x0 + x1) / 2, y1 - 8, (x1 - x0) * 0.33\nd.ellipse([cx - rw, cy - 26, cx + rw, cy + 22], fill=120)',
              'cx, cy, rw = (x0 + x1) / 2 - 20, y1 - 40, (x1 - x0) * 0.24\nd.ellipse([cx - rw, cy - 34, cx + rw, cy + 30], fill=175)')
c.write_text(t, encoding="utf-8"); print("ok")
