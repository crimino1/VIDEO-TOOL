import subprocess, sys
sys.path.insert(0, ".")
from shots import BY_NAME
from PIL import Image
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
for name in sys.argv[1:]:
    s = BY_NAME[name]; d = s["end"] - s["start"]; ims = []
    for f in (0.3, 0.6, 0.85, 0.95):
        out = f"work/check/{name}_{f}.png"
        subprocess.run([FF, "-v", "error", "-y", "-ss", f"{d * f:.2f}", "-i", f"assets/manim_low/{name}.mp4", "-frames:v", "1", out])
        ims.append(Image.open(out))
    W, H = ims[0].size; S = Image.new("RGB", (W * 2, H * 2))
    for i, im in enumerate(ims): S.paste(im, ((i % 2) * W, (i // 2) * H))
    S.save(f"work/check/{name}_sheet.jpg")
