# mean luma: whole frame, lower-left (x5-60%, y78-95%), centre block (x25-75%, y32-62%)
import glob, sys
from PIL import Image
for f in sorted(glob.glob(sys.argv[1] + "/.hyperframes/artifacts/snapshots/*/frame-*.png")):
    im = Image.open(f).convert("L"); w, h = im.size
    m = lambda b: sum(im.crop(b).getdata()) / ((b[2] - b[0]) * (b[3] - b[1]))
    print(f.split("-at-")[1][:-4], "all %.0f  LL %.0f  CC %.0f  EQ %.0f" % (m((0, 0, w, h)), m((int(w*.05), int(h*.78), int(w*.6), int(h*.95))), m((int(w*.25), int(h*.32), int(w*.75), int(h*.62))), m((int(w*.25), int(h*.68), int(w*.75), int(h*.92)))))
