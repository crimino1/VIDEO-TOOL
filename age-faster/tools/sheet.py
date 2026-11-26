"""Contact sheet of every clip in assets/stock (frame at 40%) with name, duration and size -> stock/check.jpg, stock/info.json"""
import json, subprocess, io
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
FP = FF.replace("ffmpeg.exe", "ffprobe.exe")
R = Path(__file__).resolve().parents[1]
files = sorted((R / "assets/stock").glob("*.mp4"))
info, tiles = {}, []
for f in files:
    p = json.loads(subprocess.run([FP, "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", str(f)], capture_output=True, text=True).stdout)
    d = float(p["format"]["duration"]); w, h = p["streams"][0]["width"], p["streams"][0]["height"]
    info[f.stem] = {"dur": round(d, 2), "w": w, "h": h}
    png = subprocess.run([FF, "-v", "error", "-ss", str(d * 0.4), "-i", str(f), "-frames:v", "1", "-vf", "scale=320:-2", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
    t = Image.open(io.BytesIO(png)).convert("RGB"); t.thumbnail((320, 180))
    tiles.append((f.stem, d, w, h, t))
cols = 8; S = Image.new("RGB", (320 * cols, 180 * ((len(tiles) + cols - 1) // cols)))
D = ImageDraw.Draw(S); F = ImageFont.truetype("arial.ttf", 18)
for i, (n, d, w, h, t) in enumerate(tiles):
    x, y = i % cols * 320, i // cols * 180
    S.paste(t, (x, y)); D.rectangle([x, y, x + 320, y + 22], fill="black"); D.text((x + 3, y + 2), f"{n} {d:.0f}s {w}x{h}", fill="yellow", font=F)
S.save(R / "stock/check.jpg", quality=80)
(R / "stock/info.json").write_text(json.dumps(info, indent=1))
