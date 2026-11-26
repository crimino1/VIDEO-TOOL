"""Print snapshot times (part-relative) at the middle of every shot in part k: python tools/midtimes.py k [frac]"""
import sys; sys.path.insert(0, ".")
import build
k = int(sys.argv[1]) - 1; frac = float(sys.argv[2]) if len(sys.argv) > 2 else 0.6
P = build.PARTS; out = []
for i, (st, fn) in enumerate(build.SHOTS):
    a = build.s(st); b = build.s(build.SHOTS[i + 1][0]) if i + 1 < len(build.SHOTS) else build.END
    if P[k] - 0.05 <= a < P[k + 1] - 0.05: out.append(round(a + (b - a) * frac - P[k], 2))
print(",".join(str(x) for x in out))
