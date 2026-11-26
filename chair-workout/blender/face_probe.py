"""Print a depth map of the front of the head (how far forward the surface is, mm) to locate hairline, brows and eyes."""
import bpy, collections
b = bpy.data.objects["body"]; mw = b.matrix_world
grid = collections.defaultdict(lambda: 9.0)
top = 0
for v in b.data.vertices:
    p = mw @ v.co
    top = max(top, p.z)
    if p.z > 1.56 and abs(p.x) < 0.075 and p.y < 0.02:
        k = (round(p.x / 0.006), round(p.z / 0.006)); grid[k] = min(grid[k], p.y)
print("TOP", top)
xs = range(-12, 13)
print("ZROW " + "".join(f"{x * 6:5d}" for x in xs))
for zi in range(int(1.81 / 0.006), int(1.58 / 0.006), -1):
    print("Z%.3f " % (zi * 0.006) + "".join((f"{int(-grid[(x, zi)] * 1000):5d}" if grid[(x, zi)] < 9 else "    .") for x in xs))
# side profile: for x near 0, the min y (front) and max y (back) per z
side = collections.defaultdict(lambda: [9.0, -9.0])
for v in b.data.vertices:
    p = mw @ v.co
    if p.z > 1.5 and abs(p.x) < 0.01:
        k = round(p.z / 0.006); side[k][0] = min(side[k][0], p.y); side[k][1] = max(side[k][1], p.y)
for k in sorted(side, reverse=True):
    print("SIDE z=%.3f front=%.3f back=%.3f" % (k * 0.006, side[k][0], side[k][1]))
