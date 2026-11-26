import sys, os
sys.path.insert(0, sys.argv[1])
from net import get
picks = {"pxg_nile":"2026/09/19/377554","pxg_flood":"2022/10/20/135765-764361819","pxg_fields":"2023/06/18/167742-838892740","pxg_karnak":"2020/05/03/37997-415950683",
"pxg_bridge":"2023/05/29/165003-831362593","pxg_bridge2":"2024/03/23/205346-926737188","pxg_pylon":"2025/04/16/272355","pxg_honey":"2025/04/22/273484","pxg_bees":"2015/10/18/1073-142790237",
"pxg_elephant":"2024/06/29/218643","pxg_spider":"2017/01/09/7199-198727626","pxg_rail":"2022/12/12/142723-780599564","pxg_plane":"2022/12/12/142647-780599383",
"pxg_sat":"2020/04/30/37713-414754681","pxg_earth":"2017/05/03/8947-215890483","pxg_moon":"2022/12/20/143598-782758384","pxg_wheel":"2017/04/22/8812-215588783",
"pxg_pizza":"2026/05/17/353257","pxg_desert":"2020/05/12/38921-418897650","pxg_city":"2020/01/31/31820-389009325"}
for n, v in picks.items():
    f = os.path.join(sys.argv[2], n + ".mp4")
    if os.path.exists(f): continue
    b = get(f"https://cdn.pixabay.com/video/{v}_large.mp4", {"User-Agent": "Mozilla/5.0"})
    print(n, len(b) // 1024 if b else "MISS", flush=True)
    if b: open(f, "wb").write(b)
