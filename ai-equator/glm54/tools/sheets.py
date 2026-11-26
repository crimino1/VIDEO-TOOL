"""Contact sheets of downloaded media for review: python tools/sheets.py"""
import glob, os
from PIL import Image


def first(f):
    im = Image.open(f)
    try:
        im.seek(im.n_frames - 1)  # last frame of an animated gif shows the finished table
    except Exception:
        pass
    return im.convert("RGB")


def sheet(files, out, W=520, cols=5, maxh=900):
    ims = [first(f) for f in files]
    th = [im.resize((W, int(im.height * W / im.width))) for im in ims]
    H = min(max(t.height for t in th), maxh)
    rows = (len(th) + cols - 1) // cols
    s = Image.new("RGB", (W * cols, H * rows), "grey")
    for i, t in enumerate(th):
        s.paste(t.crop((0, 0, W, min(H, t.height))), ((i % cols) * W, (i // cols) * H))
    s.save(out, quality=85)
    for f, im in zip(files, ims):
        print(os.path.basename(f), im.size)


g = lambda p: sorted(glob.glob(f"assets/raw/web/{p}"))
sheet(g("tw_*"), "_charts.jpg", cols=5, W=420, maxh=1000)
sheet(g("b_*") + g("gh_*"), "_photos.jpg", cols=4, W=640, maxh=400)


