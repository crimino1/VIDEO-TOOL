"""Frames just before and after each sharp sound, to see what on screen each sound belongs to."""
import os, subprocess, tempfile
from PIL import Image, ImageDraw
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
D = r"C:\Users\daggu222105\Downloads"
B = "vidssave.com Did the AI bubble just pop_ 720P.mp4"
T = "vidssave.com The one thing holding theoretical CS together just broke... kinda 720P.mp4"
A = "vidssave.com AI finally sleeps, Gemini 4 Carbon, ETH cracked, energy-based models, Anthropic IPO_ AI NEWS 360P.mp4"
EV = [(B, t) for t in (3.4, 5.5, 26.9, 44.3, 45.8, 47.2, 62.5, 130.3, 135.3, 154.9, 167.4, 169.1, 236.8, 267.0)] + [(T, t) for t in (5.8, 34.0, 72.5, 118.4)] + [(A, t) for t in (0.4, 2.8, 24.4, 144.2, 192.0, 349.4)]
W, H = 240, 135
tmp = tempfile.mkdtemp()
sheet = Image.new("RGB", (W * 8, H * ((len(EV) + 1) // 2)))
d = ImageDraw.Draw(sheet)
for i, (f, t) in enumerate(EV):
    for j, dt in enumerate((-0.25, 0.0, 0.25, 0.6)):
        p = os.path.join(tmp, f"{i}_{j}.jpg")
        subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{max(t + dt, 0):.2f}", "-i", os.path.join(D, f), "-frames:v", "1", "-vf", f"scale={W}:{H}", "-q:v", "4", p])
        x = ((i % 2) * 4 + j) * W
        y = (i // 2) * H
        sheet.paste(Image.open(p), (x, y))
        if j == 0:
            d.text((x + 3, y + 2), f"{f[13:20]} {t}", fill=(255, 230, 0))
sheet.save(r"C:\Users\daggu222105\VIDEO-TOOL\style-refs\ai-equator\sfx-frames.jpg", quality=84)
print(sheet.size)
