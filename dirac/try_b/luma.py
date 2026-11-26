"""Luma per snapshot: mean / p98 for whole frame, centre block (x25-75 y32-62), real eq band (x22-78 y73-90), lower-left (x5-60 y78-95)."""
import glob, os
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__))
for f in sorted(glob.glob(os.path.join(D, ".hyperframes", "artifacts", "snapshots", "*", "frame-*.png"))):
    im = Image.open(f).convert("L"); W, H = im.size
    def st(x0, y0, x1, y1):
        h = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H))).histogram(); n = sum(h)
        mean = sum(i * c for i, c in enumerate(h)) / n; acc = 0
        for i in range(256):
            acc += h[i]
            if acc >= n * 0.98: return f"{mean:5.1f}/{i:3d}"
    print(f"{os.path.basename(f):24s} all {st(0,0,1,1)} | centre {st(.25,.32,.75,.62)} | eq {st(.22,.73,.78,.90)} | LL {st(.05,.78,.60,.95)}")
