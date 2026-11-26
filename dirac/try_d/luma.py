import glob, os, sys
from PIL import Image, ImageStat
D = os.path.dirname(os.path.abspath(__file__))
for f in sorted(glob.glob(os.path.join(D, ".hyperframes", "artifacts", "snapshots", "*", "frame-*.png"))):
    im = Image.open(f).convert("L"); w, h = im.size
    ll = im.crop((int(w*.05), int(h*.78), int(w*.6), int(h*.95))); cb = im.crop((int(w*.25), int(h*.32), int(w*.75), int(h*.62)))
    print(f.split("-at-")[1][:-4], "mean %.0f | lowerleft mean %.0f max %d | centre mean %.0f max %d" % (ImageStat.Stat(im).mean[0], ImageStat.Stat(ll).mean[0], ll.getextrema()[1], ImageStat.Stat(cb).mean[0], cb.getextrema()[1]))
