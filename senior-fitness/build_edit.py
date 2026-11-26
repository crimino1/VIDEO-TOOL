"""Writes index.html: stock, ebook demo and exercise clips cut to the voiceover, with large readable labels."""
from pathlib import Path
from html import escape

HERE = Path(__file__).resolve().parent
DUR = 433.31
GREEN, YELLOW, INK = "#0b5a3a", "#ffd21f", "#ffffff"

# (start, end, Pexels id, offset into the clip)
STOCK = [
    (0.00, 4.60, 8970852, 1.0), (4.60, 10.38, 7500728, 1.0), (10.38, 16.48, 3196293, 2.0), (16.48, 22.18, 6975012, 4.0),
    (22.18, 26.98, 3191859, 1.0), (26.98, 31.18, 8865343, 0.5), (31.18, 37.86, 7522213, 0.5), (37.86, 43.30, 7999677, 0.5),
    (43.30, 47.86, 6248325, 1.0), (47.86, 54.50, 7999597, 1.0), (54.50, 59.26, 7546183, 0.5),
    (139.60, 146.32, 8527061, 2.0), (146.32, 150.34, 6830734, 1.0), (150.34, 153.82, 5270504, 2.0), (153.82, 156.66, 3195810, 2.0),
    (156.66, 163.82, 8375439, 3.0), (163.82, 168.82, 8795414, 4.0), (168.82, 173.22, 8795169, 3.0),
    (392.02, 395.74, 8086633, 2.0), (395.74, 401.98, 8970851, 1.0), (401.98, 405.00, 6786514, 3.0),
    (412.24, 416.20, 7999597, 4.0), (416.20, 421.48, 6248325, 6.0), (421.48, 424.28, 5270504, 8.0), (424.28, 429.16, 7893112, 3.0), (429.16, 433.31, 8928021, 2.0),
]
ANIM = [("chair", 173.22, 177.14), ("ex1", 177.14, 200.64), ("ex2a", 200.64, 210.92), ("ex2b", 210.92, 225.28), ("ex3", 225.28, 262.04),
        ("ex4", 262.04, 288.24), ("ex5", 288.24, 311.38), ("ex6", 311.38, 337.84), ("ex7", 337.84, 363.54),
        ("ex8a", 363.54, 374.04), ("ex8b", 374.04, 383.46), ("ex8c", 383.46, 392.02)]
# Exercise titles: number, name, start
TITLES = [(1, "Seated Marching", 177.14), (2, "Shoulder Rolls &amp;<br>Arm Circles", 200.64), (3, "Sit to Stand", 225.28), (4, "Wall Push-Ups", 262.04),
          (5, "Heel Raises", 288.24), (6, "Side Leg Raises", 311.38), (7, "Seated Knee Extensions", 337.84), (8, "Heel-to-Toe Walk", 363.54)]
# Coaching cues shown large at the bottom: (start, end, text)
CUES = [
    (186.68, 191.82, "Right knee, then left knee"), (195.24, 200.64, "30 seconds"),
    (205.6, 210.92, "Roll shoulders &middot; 10 times"), (215.52, 225.28, "10 forward, 10 backward"),
    (236.58, 241.38, "Press through your heels"), (246.22, 251.06, "Sit down slowly"), (251.76, 262.04, "8 to 10 times"),
    (265.2, 271.9, "An arm's length from the wall"), (278.14, 280.76, "Body straight like a plank"), (280.76, 288.24, "10 times"),
    (296.2, 300.98, "Rise onto your toes"), (300.98, 305.08, "Hold 1 second"), (305.08, 311.38, "12 times"),
    (322.32, 326.4, "Toes forward, back straight"), (328.06, 331.44, "10 times"), (331.44, 337.84, "Switch to the left leg"),
    (353.34, 357.02, "Hold 2 seconds"), (357.02, 363.54, "10 on each leg"),
    (374.04, 383.46, "Heel directly in front of toes"), (383.46, 392.02, "10 slow steps, then come back"),
    (10.38, 16.48, "8 safe exercises"), (16.48, 22.18, "Just a chair and a wall"), (22.18, 26.98, "No gym. No floor."),
    (158.94, 163.82, "Check with your doctor first"), (163.82, 168.82, "Never push through pain"), (168.82, 173.22, "Dizzy? Stop and rest"), (173.22, 177.14, "Chair against the wall"),
    (395.74, 404.16, "3 times a week"), (405.0, 412.24, "Your step-by-step plan, day by day"), (412.24, 421.48, "Link in the description"), (424.28, 429.16, "Like, subscribe and share"),
]
# Ebook checkout steps over the demo
STEPS = [(59.26, 71.2, "1", "Open the link in the description"), (86.48, 97.6, "2", "Tap the ebook you like"), (97.6, 105.44, "3", "Tap Add to Cart"),
         (105.44, 108.78, "4", "Tap the green Checkout button"), (108.78, 116.84, "5", "Type your email"), (116.84, 123.22, "6", "Country and zip code"),
         (123.22, 134.88, "7", "Pay by card or PayPal"), (134.88, 139.6, "8", "Tap Complete Order")]
# Named ebook covers: (start, end, scale, x, y) over the shop frame
COVERS = [(71.2, 75.6, 1.4, 893, 140), (75.6, 81.26, 1.4, 305, 140), (81.26, 86.48, 1.4, -280, 140)]

clips, tl = [], []
def clip(cid, start, end, tag, inner, track, extra=""):
    return f'<{tag} id="{cid}" class="clip" data-start="{start:.2f}" data-duration="{end - start:.2f}" data-track-index="{track}"{extra}>{inner}</{tag}>'

for i, (a, b, pid, off) in enumerate(STOCK):
    clips.append(f'<div class="frame" id="w{i}"><video id="s{i}" class="clip full" src="assets/stock/px{pid}.mp4" muted playsinline data-start="{a:.2f}" data-duration="{b - a:.2f}" data-media-start="{off}" data-track-index="1"></video></div>')
    tl.append(f'tl.fromTo("#w{i}",{{scale:1.0}},{{scale:1.05,duration:{b - a:.2f},ease:"none"}},{a:.2f});')
for n, a, b in ANIM:
    if (HERE / "assets" / "anim" / f"{n}.mp4").exists():
        clips.append(f'<div class="frame" id="w{n}"><video id="v{n}" class="clip full" src="assets/anim/{n}.mp4" muted playsinline data-start="{a:.2f}" data-duration="{b - a:.2f}" data-track-index="1"></video></div>')
        tl.append(f'tl.fromTo("#w{n}",{{scale:1.0}},{{scale:1.035,duration:{b - a:.2f},ease:"none"}},{a:.2f});')

# Ebook demo inside a clean card with the shop address in place of the browser bar
clips.append(clip("demoBg", 59.26, 139.6, "div", "", 2))
clips.append(clip("demoBar", 59.26, 139.6, "div", '<span class="dot"></span><span>seniorfit-shop.fourthwall.com</span>', 4))
clips.append(f'<video id="demo" class="clip" src="assets/demo.mp4" muted playsinline data-start="59.26" data-duration="80.34" data-track-index="3"></video>')
clips.append(f'<div id="coverWrap" class="clip" data-start="71.20" data-duration="15.28" data-track-index="5"><img id="covers" src="assets/shop-crop.png" alt="The three ebooks"></div>')
# Closing ebook shot
clips.append(clip("endBg", 405.0, 412.24, "div", '<img id="endCovers" src="assets/shop-crop.png" alt="The three ebooks">', 2))
tl.append('tl.fromTo("#endCovers",{scale:1.0},{scale:1.05,duration:7.24,ease:"none"},405.0);')
for j, (a, b, s, x, y) in enumerate(COVERS):
    tl.append(f'tl.to("#covers",{{scale:{s},x:{x},y:{y},duration:0.8,ease:"power2.inOut"}},{a:.2f});')
tl.append('tl.to("#covers",{scale:1,x:0,y:0,duration:0.5,ease:"power2.inOut"},85.9);')

for n, name, a in TITLES:
    b = a + 5.5
    clips.append(clip(f"t{n}", a, b, "div", f'<div class="tcard" id="tc{n}"><div class="tnum">Exercise {n}</div><div class="tname">{name}</div></div>', 7))
    tl.append(f'tl.fromTo("#tc{n}",{{opacity:0,x:-50}},{{opacity:1,x:0,duration:0.5,ease:"power3.out"}},{a + 0.1:.2f});')
    tl.append(f'tl.to("#tc{n}",{{opacity:0,duration:0.25,ease:"power2.in"}},{b - 0.3:.2f});')
for j, (a, b, text) in enumerate(CUES):
    clips.append(clip(f"c{j}", a, b, "div", f'<span class="cue{" top" if 177 <= a < 392 else ""}" id="ci{j}">{text}</span>', 8))
    tl.append(f'tl.fromTo("#ci{j}",{{opacity:0,y:18}},{{opacity:1,y:0,duration:0.35,ease:"power3.out"}},{a + 0.05:.2f});')
    tl.append(f'tl.to("#ci{j}",{{opacity:0,duration:0.2,ease:"power2.in"}},{b - 0.22:.2f});')
for j, (a, b, num, text) in enumerate(STEPS):
    clips.append(clip(f"st{j}", a, b, "div", f'<span class="step" id="si{j}"><b>{num}</b>{text}</span>', 8))
    tl.append(f'tl.fromTo("#si{j}",{{opacity:0,y:18}},{{opacity:1,y:0,duration:0.35,ease:"power3.out"}},{a + 0.05:.2f});')
    tl.append(f'tl.to("#si{j}",{{opacity:0,duration:0.2,ease:"power2.in"}},{b - 0.22:.2f});')
clips.append(clip("shop", 47.86, 54.5, "div", '<span class="cue" id="shopi">Senior Fit Shop</span>', 8))
tl.append('tl.fromTo("#shopi",{opacity:0,y:18},{opacity:1,y:0,duration:0.35,ease:"power3.out"},47.95);')

# Sound: voice plus music repeated under it; volume dips are set here
audio = ['<audio id="vo" class="clip" src="assets/vo.mp3" data-start="0" data-duration="433.31" data-volume="1.9" data-track-index="10"></audio>']
for i, start in enumerate((0, 174.9, 349.8)):
    d = min(174.9, DUR - start)
    audio.append(f'<audio id="m{i}" class="clip" src="assets/music/bed.wav" data-start="{start}" data-duration="{d:.2f}" data-volume="0.08" data-fade-in="0.5" data-fade-out="0.5" data-track-index="11"></audio>')

html = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1920px;height:1080px;overflow:hidden;background:#000}}
#root{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000;font-family:"Poppins",sans-serif;color:{INK}}}
.frame{{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}}
.full{{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}}
#demoBg,#endBg{{position:absolute;left:0;top:0;width:1920px;height:1080px;background:linear-gradient(160deg,#0f6e47,#0a4a30)}}
#demoBar{{position:absolute;left:96px;top:44px;width:1728px;height:60px;background:#f2f5f3;border-radius:16px 16px 0 0;display:flex;align-items:center;gap:16px;padding:0 28px;color:#17352a;font-size:28px;font-weight:600}}
.dot{{width:20px;height:20px;border-radius:50%;background:#0f8a4f}}
#demo{{position:absolute;left:96px;top:104px;width:1728px;height:784px;object-fit:cover;background:#fff}}
#coverWrap{{position:absolute;left:96px;top:104px;width:1728px;height:784px;overflow:hidden;background:#f2fbfb}}
#covers{{position:absolute;left:0;top:0;width:1728px;height:784px;object-fit:cover}}
#endCovers{{position:absolute;left:96px;top:64px;width:1728px;height:784px;object-fit:cover;border-radius:16px}}
.tcard{{position:absolute;left:96px;top:70px;background:{GREEN};padding:22px 44px 26px;border-radius:14px;border-left:14px solid {YELLOW}}}
.tnum{{font-size:40px;font-weight:600;color:{YELLOW};line-height:1.15}}
.tname{{font-size:68px;font-weight:800;line-height:1.1}}
.cue,.step{{position:absolute;left:50%;bottom:58px;transform:none;white-space:nowrap;background:rgba(6,40,27,.92);color:#fff;font-size:58px;font-weight:700;padding:14px 40px;border-radius:14px;translate:-50% 0}}
.cue.top{{left:auto;right:96px;bottom:auto;top:70px;translate:0 0;background:{GREEN};font-size:52px}}
.step b{{display:inline-block;background:{YELLOW};color:#17352a;border-radius:50%;width:74px;height:74px;line-height:74px;text-align:center;margin-right:22px;font-weight:800}}
.step{{bottom:44px;padding:10px 36px 10px 12px;border-radius:50px}}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1920" data-height="1080">
{chr(10).join(clips)}
{chr(10).join(audio)}
</div>
<script>
const tl = gsap.timeline({{paused:true}});
{chr(10).join(tl)}
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
(HERE / "index.html").write_text(html, encoding="utf-8")
print("written", len(clips), "clips")
