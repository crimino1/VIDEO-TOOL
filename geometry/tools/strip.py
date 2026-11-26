import subprocess, sys, os
from PIL import Image, ImageDraw
FF=r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
src, out, names = sys.argv[1], sys.argv[2], sys.argv[3].split(",")
N, W, H = 8, 256, 144
sheet = Image.new("RGB", (N*W, len(names)*H), "black")
for r, n in enumerate(names):
    f = os.path.join(src, f"mn_{n}.mp4")
    d = float(subprocess.run([FF+r"\ffprobe.exe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
    for k in range(N):
        t = (d-1.5) * (k+0.7)/N
        p = os.path.join(os.environ["TEMP"], "_fr.png")
        subprocess.run([FF+r"\ffmpeg.exe","-v","error","-y","-ss",f"{t:.2f}","-i",f,"-frames:v","1","-vf",f"scale={W}:{H}",p])
        sheet.paste(Image.open(p), (k*W, r*H))
    ImageDraw.Draw(sheet).text((4, r*H+2), n, fill="red")
sheet.save(out)
