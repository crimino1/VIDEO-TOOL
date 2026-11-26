import socket, urllib.request, os
_g=socket.getaddrinfo; socket.getaddrinfo=lambda h,p,f=0,*a,**k:_g(h,p,socket.AF_INET,*a,**k)
L={"pxb_boot_step":"2023/11/23/190324-887815658","pxb_hikers":"2019/12/15/30221-380473792","pxb_hiker_trail":"2021/11/30/99388-653120182",
"pxb_phone_hands_dark":"2024/03/04/202987-919379330","pxb_phone_night_table":"2023/06/30/169445-841382824","pxb_phone_glow":"2016/12/29/6945-197509768",
"pxb_feed_dark":"2020/10/29/53701-475234202","pxb_bench_phones":"2023/04/17/159459-818908453","pxb_crowd_top":"2016/11/15/6387-191695740",
"pxb_crowd_cross":"2016/06/27/3630-172488409","pxb_router":"2020/07/25/45535-443134283","pxb_couch_think":"2021/01/11/61702-500316065",
"pxb_kings":"2018/09/05/18088-288458760","pxb_mountain":"2023/11/10/188595-883402169","pxb_man_phone_laugh":"2020/06/17/42408-431511624"}
for k,v in L.items():
    out=f"stock/raw/{k}.mp4"
    if os.path.exists(out): continue
    for q in ("large","medium"):
        try:
            d=urllib.request.urlopen(urllib.request.Request(f"https://cdn.pixabay.com/video/{v}_{q}.mp4",headers={"User-Agent":"Mozilla/5.0"}),timeout=120).read()
            open(out,"wb").write(d); print(k,q,len(d)//1024,"KB",flush=True); break
        except Exception as e: print(k,q,e,flush=True)
