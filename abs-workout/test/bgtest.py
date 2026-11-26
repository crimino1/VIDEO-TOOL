import sys; from pathlib import Path
sys.argv = ["x"]; src = Path("tools/make_clips.py").read_text().split("def run(")[0]
from PIL import Image
for bgname in ["gym_0.jpg", "loft_1.jpg"]:
    ns = {"__file__": str(Path("tools/make_clips.py").resolve())}; exec(src.replace('BG = "gym_0.jpg"', f'BG = "{bgname}"'), ns)
    fr = Image.open("test/idle/0000.png").resize((1920, 1080)); fr.save("test/idle_big.png")
    ns["background"](Path("test/idle_big.png"), Path(f"test/bg_{bgname}"))
    im = Image.open(f"test/bg_{bgname}").convert("RGBA"); im.alpha_composite(fr.convert("RGBA")); im.convert("RGB").resize((960, 540)).save(f"test/comp_{bgname}")
a, b = Image.open("test/comp_gym_0.jpg"), Image.open("test/comp_loft_1.jpg")
o = Image.new("RGB", (960, 1080)); o.paste(a, (0, 0)); o.paste(b, (0, 540)); o.save("test/bgcomp.jpg")
