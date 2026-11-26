"""Add the black outer outline to transparent Alien Anatoly renders (alpha dilate), in place.
python aa_ink.py <png> [<png> ...] [--px N]"""
import sys
from PIL import Image, ImageFilter
args = sys.argv[1:]; px = 6
if "--px" in args: i = args.index("--px"); px = int(args[i + 1]); del args[i:i + 2]
for f in args:
    im = Image.open(f).convert("RGBA"); a = im.getchannel("A")
    grow = a.point(lambda v: 255 if v > 100 else 0).filter(ImageFilter.MaxFilter(2 * px + 1)).filter(ImageFilter.GaussianBlur(0.9))
    out = Image.new("RGBA", im.size, (8, 14, 8, 0)); out.putalpha(grow)
    out.alpha_composite(im); out.save(f)
    print("inked", f)
