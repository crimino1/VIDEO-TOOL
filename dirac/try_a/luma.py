# mean luma of each full-res snapshot + lower-left box (x 5-60%, y 78-95%) + centre box (x 25-75%, y 32-62%)
import glob, os, sys
import numpy as np
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__))
for f in sorted(glob.glob(os.path.join(D, ".hyperframes", "artifacts", "snapshots", "*", "frame-*.png"))):
    a = np.asarray(Image.open(f).convert("L")).astype(float); h, w = a.shape
    ll = a[int(.78*h):int(.95*h), int(.05*w):int(.60*w)]; cc = a[int(.32*h):int(.62*h), int(.25*w):int(.75*w)]
    print(f"{f.split('-at-')[1][:-4]:>8}  mean {a.mean():5.1f}  LL mean {ll.mean():5.1f} p99 {np.percentile(ll,99):5.1f}  centre mean {cc.mean():5.1f} p99 {np.percentile(cc,99):5.1f}")
