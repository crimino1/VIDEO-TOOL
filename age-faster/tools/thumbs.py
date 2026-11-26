import json,urllib.request,io,hashlib,os,concurrent.futures as cf
from PIL import Image,ImageDraw
R={}
for f in ["stock/pin_results.json"]:
    for k,v in json.load(open(f,encoding="utf-8")).items():
        for x in v.get("videos",[]):
            x.setdefault("aspect","16:9"); R.setdefault(k,[]).append(x)
c={}
for k,vs in R.items():
    seen=set();o=[]
    for x in sorted(vs,key=lambda x:(x["aspect"]!="16:9",-x.get("reactions",0))):
        if x["url"] in seen or not x.get("thumbnail") or x.get("duration_sec",0)<3: continue
        seen.add(x["url"]);o.append(x)
    c[k]=o[:14]
json.dump(c,open("stock/pin_cands.json","w",encoding="utf-8"),indent=0)
os.makedirs("stock/thumbs",exist_ok=True)
def get(x):
    p="stock/thumbs/"+hashlib.md5(x["url"].encode()).hexdigest()+".jpg"
    if os.path.exists(p): return
    try:
        b=urllib.request.urlopen(urllib.request.Request(x["thumbnail"],headers={"User-Agent":"Mozilla/5.0"}),timeout=30).read()
        im=Image.open(io.BytesIO(b)).convert("RGB");im.thumbnail((300,300));im.save(p,quality=80)
    except Exception as e: pass
with cf.ThreadPoolExecutor(6) as e: list(e.map(get,[x for v in c.values() for x in v]))
keys=list(c);W=200;H=190
for s in range(0,len(keys),6):
    ks=keys[s:s+6];S=Image.new("RGB",(W*14,H*len(ks)),(20,20,20));d=ImageDraw.Draw(S)
    for r,k in enumerate(ks):
        for i,x in enumerate(c[k]):
            p="stock/thumbs/"+hashlib.md5(x["url"].encode()).hexdigest()+".jpg"
            if os.path.exists(p):
                im=Image.open(p);im.thumbnail((W-4,H-22));S.paste(im,(i*W+2,r*H+20))
            d.text((i*W+3,r*H+4),f'{k}#{i} {x["aspect"]} {x["duration_sec"]}s {x["height"]}p',fill=(255,255,0))
    S.save(f"stock/sheet{s//6}.jpg",quality=82)
print({k:len(v) for k,v in c.items()},len(keys)//6+1)
