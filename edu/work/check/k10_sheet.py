import subprocess, sys
from PIL import Image
FF = r'C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe'
out = sys.argv[1]
ims = []
for a in sys.argv[2:]:
    n, t = a.split('@')
    o = f'work/check/{n}_{t}.png'
    subprocess.run([FF, '-v', 'error', '-y', '-ss', t, '-i', f'assets/manim_low/{n}.mp4', '-frames:v', '1', o])
    ims.append(Image.open(o))
W, H = 854, 480
cols = 3
s = Image.new('RGB', (W * cols, H * ((len(ims) + cols - 1) // cols)))
for i, im in enumerate(ims):
    s.paste(im, ((i % cols) * W, (i // cols) * H))
s.save(out)
