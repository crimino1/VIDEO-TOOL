"""Free look test for Alien Anatoly: 2 frames (character shot + whiteboard card) at 1920x1080 x1.1 for push room."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
S=1.1; W,H=int(1920*S),int(1080*S)
# --- shot 1: figure in gym
bg=Image.open('gym.jpg').convert('RGB')
r=max(W/bg.width,H/bg.height); bg=bg.resize((int(bg.width*r)+1,int(bg.height*r)+1),Image.LANCZOS)
bg=bg.crop(((bg.width-W)//2,(bg.height-H)//2,(bg.width-W)//2+W,(bg.height-H)//2+H)).filter(ImageFilter.GaussianBlur(3))
fig=Image.open('figure_cut.png'); fh=int(H*0.86); fig=fig.resize((int(fig.width*fh/fig.height),fh),Image.LANCZOS)
fx,fy=(W-fig.width)//2,H-fh-int(H*0.03)
sh=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(sh)
d.ellipse((fx-30,fy+fh-40,fx+fig.width+30,fy+fh+25),fill=(0,0,0,110)); sh=sh.filter(ImageFilter.GaussianBlur(18))
bg=bg.convert('RGBA'); bg.alpha_composite(sh); bg.alpha_composite(fig,(fx,fy))
# on-body mark: orange double arrow across shoulders (never green on the green body)
d=ImageDraw.Draw(bg); y=fy+int(fh*0.215); x0,x1=fx+int(fig.width*0.08),fx+int(fig.width*0.92)
def arrow(d,x0,y,x1,c,w=14):
    d.line((x0+30,y,x1-30,y),fill='black',width=w+8); d.line((x0+30,y,x1-30,y),fill=c,width=w)
    for xe,s in ((x0,1),(x1,-1)):
        p=[(xe,y),(xe+s*48,y-30),(xe+s*48,y+30)]
        d.polygon(p,fill=c,outline='black',width=4)
arrow(d,x0,y,x1,(232,115,42))
bg.convert('RGB').save('look_char.png')
# --- shot 2: whiteboard card
b=Image.new('RGB',(W,H),(236,237,235)); d=ImageDraw.Draw(b)
for i in range(H):  # soft light falloff
    v=int(244-14*abs(i-H*0.4)/H); d.line((0,i,W,i),fill=(v,v,v-1))
d.rectangle((0,0,W-1,H-1),outline=(150,152,155),width=26)
d.rectangle((W*0.3,H-40,W*0.7,H-14),fill=(120,122,125))
try: F=ImageFont.truetype('arialbd.ttf',150)
except: F=ImageFont.load_default()
cols=[(232,115,42),(217,32,28),(61,181,74)]
pw,ph=360,520; gap=110; tx=(W-3*pw-2*gap)//2; ty=(H-ph)//2
for i in range(3):
    x=tx+i*(pw+gap); d.rounded_rectangle((x,ty,x+pw,ty+ph),18,outline='black',width=12)
    d.text((x+pw/2,ty+110),str(i+1),font=F,fill='black',anchor='mm')
    cx,cy=x+pw/2,ty+350
    if i==0:  # dumbbell
        d.rectangle((cx-110,cy-10,cx+110,cy+10),fill='black')
        for s in (-1,1):
            d.rounded_rectangle((cx+s*95-22,cy-60,cx+s*95+22,cy+60),8,fill=cols[0],outline='black',width=8)
    if i==1:  # clock
        d.ellipse((cx-95,cy-95,cx+95,cy+95),fill='white',outline='black',width=12)
        d.line((cx,cy,cx,cy-62),fill=cols[1],width=12); d.line((cx,cy,cx+48,cy+20),fill='black',width=12)
    if i==2:  # plate
        d.ellipse((cx-100,cy-100,cx+100,cy+100),fill='white',outline='black',width=12)
        d.ellipse((cx-60,cy-60,cx+60,cy+60),fill=cols[2],outline='black',width=8)
b.save('look_board.png')
