import socket, urllib.request, sys, os
_g=socket.getaddrinfo; socket.getaddrinfo=lambda h,p,f=0,*a,**k:_g(h,p,socket.AF_INET,*a,**k)
L={"pxb_tokyo_train":"2026/06/08/357246","pxb_shinkansen":"2021/02/26/66410-517408323","pxb_tokyo_tunnel":"2017/05/06/9005-216332135",
"pxb_tokyo_bay":"2024/05/26/213815","pxb_tokyo_tower":"2024/11/14/241395","pxb_shinjuku":"2023/09/18/181116-865745512",
"pxb_forest_log":"2019/10/25/28280-369325202","pxb_cpu_pins":"2019/10/07/27593-364702362","pxb_chip":"2017/12/14/13370-247710847",
"pxb_pipette_petri":"2024/01/20/197486-905015022","pxb_tips_a":"2021/06/03/76395-559159183","pxb_tips_b":"2021/06/03/76396-559159185",
"pxb_scope_petri":"2025/03/03/262188","pxb_scope_slide":"2025/03/03/262187","pxb_scope_stage":"2021/03/30/69527-531102357",
"pxb_nyc_night":"2017/01/12/7260-199191197","pxb_nyc_day":"2017/07/23/10815-226624962","pxb_la":"2019/11/20/29263-374392542",
"pxb_melb":"2020/10/23/53141-472583449","pxb_melb2":"2024/12/17/247250","pxb_dc_hall":"2024/11/21/242599",
"pxb_hdd":"2021/05/07/73328-548173357","pxb_bulbs":"2015/08/08/113-135736259"}
for k,v in L.items():
    out=f"stock/raw/{k}.mp4"
    if os.path.exists(out): continue
    for q in ("large","medium"):
        try:
            d=urllib.request.urlopen(urllib.request.Request(f"https://cdn.pixabay.com/video/{v}_{q}.mp4",headers={"User-Agent":"Mozilla/5.0"}),timeout=120).read()
            open(out,"wb").write(d); print(k,q,len(d)//1024,"KB",flush=True); break
        except Exception as e: print(k,q,e,flush=True)
