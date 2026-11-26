"""tile.py out.jpg name1 name2 ...  tiles test/<name>_60.png (or given file names) three across."""
import sys, os
from PIL import Image
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test")
out, names = sys.argv[1], sys.argv[2:]
ims = [Image.open(os.path.join(here, n if n.endswith(".png") else n + "_60.png")).convert("RGB").resize((640, 360)) for n in names]
s = Image.new("RGB", (640 * 3, 360 * ((len(ims) + 2) // 3)))
for i, im in enumerate(ims): s.paste(im, ((i % 3) * 640, (i // 3) * 360))
s.save(os.path.join(here, out), quality=88)
