import re,subprocess,io,glob,os
from PIL import Image,ImageDraw
names=[k for k in re.findall(r'^ "(\w+)":',open("tools/build_clips.py",encoding="utf-8").read(),re.M)]
W,H=170,110;cols=12;per=6
rows=(len(names)*per+cols-1)//cols
S=Image.new("RGB",(W*cols,H*rows),(20,20,20));d=ImageDraw.Draw(S);n=0
for k in names:
    f=f"assets/v/{k}.mp4"
    D=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
    for i in range(per):
        t=D*(i+.5)/per
        b=subprocess.run(["ffmpeg","-v","error","-ss",str(t),"-i",f,"-frames:v","1","-vf",f"scale={W-4}:{H-18}:force_original_aspect_ratio=decrease","-f","image2pipe","-c:v","mjpeg","-"],capture_output=True).stdout
        x=n%cols*W;y=n//cols*H
        if b: S.paste(Image.open(io.BytesIO(b)),(x+2,y+15))
        d.text((x+2,y+1),f"{k} {t:.1f}",fill=(255,255,0));n+=1
S.save("stock/scan.jpg",quality=85);print(S.size)
