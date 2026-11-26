import socket, urllib.request, os
_g=socket.getaddrinfo; socket.getaddrinfo=lambda h,p,f=0,*a,**k:_g(h,p,socket.AF_INET,*a,**k)
L={"pxb_plane":"2016/06/14/3473-170690984","pxb_kings_cam":"2018/09/05/18088-288458760","pxb_chalkboard":"2023/04/15/159050-818026307",
"pxb_climber_fog":"2022/07/07/123450-727993887","pxb_peaks":"2022/05/22/117763-713302144","pxb_kids_class":"2023/03/18/155164-809618953",
"pxb_answer_sheet":"2023/04/12/158618-817153712","pxb_library_student":"2022/11/20/139802-773444492","pxb_factory":"2021/07/12/81241-576082910",
"pxb_gym":"2023/01/27/148204-793717940","pxb_jungle":"2024/10/04/234735","pxb_whiteboard":"2016/05/12/3161-166338902",
"pxb_study_group":"2023/04/15/159029-818026300","pxb_student_lamp":"2023/01/05/145428-787039445","pxb_paris":"2018/07/19/17399-281493934",
"pxb_sketch":"2015/08/08/80-135733160","pxb_runner":"2019/10/04/27539-364430966","pxb_student_papers":"2019/04/01/22515-328940117",
"pxb_window_light":"2018/12/26/20263-308335545","pxb_tehran_metro":"2020/04/19/36541-411342266","pxb_writing":"2021/03/31/69625-531621058"}
for k,v in L.items():
    out=f"stock/raw/{k}.mp4"
    if os.path.exists(out): continue
    for q in ("large","medium"):
        try:
            d=urllib.request.urlopen(urllib.request.Request(f"https://cdn.pixabay.com/video/{v}_{q}.mp4",headers={"User-Agent":"Mozilla/5.0"}),timeout=180).read()
            open(out,"wb").write(d); print(k,q,len(d)//1024,"KB",flush=True); break
        except Exception as e: print(k,q,e,flush=True)
