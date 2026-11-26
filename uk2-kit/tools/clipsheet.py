import subprocess,glob,os,io,json
from PIL import Image,ImageDraw
fs=sorted(glob.glob("stock/raw/*.mp4"));W=210;H=190;cols=12
rows=(len(fs)*3+cols-1)//cols
S=Image.new("RGB",(W*cols,H*rows),(20,20,20));d=ImageDraw.Draw(S);n=0;info={}
for f in fs:
    p=subprocess.run(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height:format=duration","-of","json",f],capture_output=True,text=True).stdout
    j=json.loads(p);w,h=j["streams"][0]["width"],j["streams"][0]["height"];D=float(j["format"]["duration"]);info[os.path.basename(f)[:-4]]=[w,h,round(D,1)]
    for a in (.15,.5,.85):
        t=D*a;b=subprocess.run(["ffmpeg","-v","error","-ss",str(t),"-i",f,"-frames:v","1","-vf","scale=-2:165","-f","image2pipe","-c:v","mjpeg","-"],capture_output=True).stdout
        x=n%cols*W;y=n//cols*H
        if b:
            im=Image.open(io.BytesIO(b));im.thumbnail((W-4,H-22));S.paste(im,(x+2,y+20))
        d.text((x+3,y+4),f"{os.path.basename(f)[:-4]} {t:.0f}s {w}x{h}",fill=(255,255,0));n+=1
S.save("stock/clips.jpg",quality=85);json.dump(info,open("stock/info.json","w"))
print(info)
