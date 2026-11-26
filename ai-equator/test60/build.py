"""AI Equator 60-second test edit. Every beat is timed to a word in the voiceover. Writes index.html."""
import json, math, random, shutil
from pathlib import Path
from PIL import Image

H = Path(__file__).parent
Image.MAX_IMAGE_PIXELS = None
W = json.load(open(H / "words.json", encoding="utf-8"))
WORDS = W["words"]
END = round(W["duration"] + 0.9, 2)
SK = Path(r"C:\Users\daggu222105\.claude\skills\media-use\audio\assets\sfx")
(H / "sfx").mkdir(exist_ok=True)


def at(word, n=1):
    """Start of the nth word beginning with this text."""
    k = 0
    for x in WORDS:
        if x["word"].lower().strip(".,?!") == word.lower():
            k += 1
            if k == n:
                return round(x["start"], 3)
    raise SystemExit("word not found: " + word)


def crop(src, dst, box, size=None):
    im = Image.open(H / "img" / src)
    w, h = im.size
    im = im.convert("RGBA" if dst.endswith("png") else "RGB").crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    im.save(H / "img" / dst, **({} if dst.endswith("png") else {"quality": 93}))
    return dst


crop("c_aa.jpg", "d_aa.jpg", (0, 0, 0.62, 1))
crop("tw_sundar.png", "d_tw_sundar.png", (0, 0, 1, 0.282))
crop("tw_google.png", "d_tw_google.png", (0, 0.505, 1, 0.80))
crop("ah_fair.png", "d_fair.jpg", (0.225, 0.227, 0.617, 0.625))
crop("blog_soon.png", "d_soon.jpg", (0.24, 0.885, 0.70, 1))
crop("c_ah_head.jpg", "d_head.jpg", (0, 0.005, 1, 0.215))
crop("c_ah_head.jpg", "d_crystal.jpg", (0.02, 0.28, 0.98, 0.92))
crop("c_guard.jpg", "d_guard.jpg", (0, 0.0, 1, 1))
crop("c_fairwind.jpg", "d_fairwind.jpg", (0, 0.08, 1, 0.66))

html, tl, audio = [], [], []
Z = {"n": 10}


def scene(sid, a, b, inner, bg=True):
    Z["n"] += 1
    html.append(f'<div id="s_{sid}" class="clip scene" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="2" style="z-index:{Z["n"]}" data-layout-allow-overflow data-layout-allow-overlap><div class="inner" id="i_{sid}">{inner}</div></div>')


def pop(sel, t, rot=0):
    tl.append(f'tl.fromTo("{sel}",{{opacity:0,scale:.55,rotation:{rot}}},{{opacity:1,scale:1,rotation:{rot},duration:.16,ease:"back.out(2.4)"}},{t:.3f});')


def slide(sel, t, x=0, y=0, rot=0, dur=.42):
    tl.append(f'tl.fromTo("{sel}",{{x:{x},y:{y},opacity:1,rotation:{rot}}},{{x:0,y:0,opacity:1,rotation:{rot},duration:{dur},ease:"power3.out"}},{t:.3f});')


def drift(sel, t, d, a=1, b=1.035):
    tl.append(f'tl.fromTo("{sel}",{{scale:{a}}},{{scale:{b},duration:{d:.3f},ease:"none"}},{t:.3f});')


def hide(sel):
    return f'<style>{sel}{{opacity:0}}</style>'


def sfx(name, t, v):
    if not (H / "sfx" / f"{name}.mp3").exists():
        shutil.copyfile(SK / f"{name}.mp3", H / "sfx" / f"{name}.mp3")
    n = len(audio)
    audio.append(f'<audio id="fx{n}" class="clip" src="sfx/{name}.mp3" data-start="{t:.3f}" data-duration="1.2" data-volume="{v}" data-track-index="12"></audio>')


def img(eid, src, style, cls="doc"):
    return f'<img id="{eid}" class="{cls}" src="img/{src}" alt="{eid}" style="{style}">'


def cap(eid, text, style, cls="cap"):
    return f'<div id="{eid}" class="{cls}" style="{style}">{text}</div>'


t = dict(on=at("On"), it=at("It"), one=at("There's"), right=at("Right"), rea=at("And"), those=at("Those"), but=at("But"), claude=at("Claude"), almost=at("almost", 2), fair=at("To", 3), but2=at("But", 2), bye=at("This", 2))
PUSH = .36

# 1. TWO WEEKS over a demo someone built with the previous model
html.append(f'<div class="vw" id="w_demo" style="z-index:5"><video id="v_demo" class="clip full" src="clips/alok_solar.mp4" muted playsinline data-start="0" data-duration="{t["on"] + PUSH:.3f}" data-media-start="8" data-track-index="1"></video></div>')
scene("a", 0, t["on"] + PUSH, cap("a1", "TWO WEEKS", "left:0;right:0;top:390px;text-align:center;font-size:190px")
      + img("a2", "g.png", "right:90px;bottom:90px;width:190px", "stick")
      + cap("a3", "GEMINI 4 ARGON", "left:90px;bottom:120px", "plate")
      + cap("a4", "Demo by @analogalok on X, made with Gemini 4 Argon", "left:90px;bottom:62px", "credit"))
pop("#a1", 0.0)
pop("#a2", at("Google's"), -9)
pop("#a3", at("best"))
tl.append(f'tl.fromTo("#a4",{{opacity:0}},{{opacity:1,duration:.2}},0.3);')
sfx("pop", at("Google's"), .35)

# push: demo out, launch page in
tl.append(f'tl.fromTo("#w_demo",{{x:0}},{{x:-1920,duration:{PUSH},ease:"power3.inOut"}},{t["on"]:.3f});')
tl.append(f'tl.fromTo("#i_a",{{x:0}},{{x:-1920,duration:{PUSH},ease:"power3.inOut"}},{t["on"]:.3f});')
sfx("whoosh-short", t["on"], .22)

# 2. the launch page, recorded
html.append(f'<div class="vw stage" id="w_blog" style="z-index:6"><video id="v_blog" class="clip" src="clips/blog_scroll.mp4" muted playsinline data-start="{t["on"]:.3f}" data-duration="{t["it"] - t["on"]:.3f}" data-track-index="1" style="position:absolute;left:130px;top:73px;width:1660px;height:934px"></video></div>')
tl.append(f'tl.fromTo("#w_blog",{{x:1920}},{{x:0,duration:{PUSH},ease:"power3.inOut"}},{t["on"]:.3f});')
scene("b", t["on"], t["it"], cap("b1", "OCT 28", "right:70px;top:60px;font-size:120px;color:#d52243", "cap pix")
      + cap("b2", "GEMINI 4 CARBON", "left:0;right:0;bottom:70px;text-align:center;font-size:118px"))
pop("#b1", at("October"), 7)
pop("#b2", at("Gemini"))

# 3. number one, from the live leaderboard and Pichai's post
scene("c", t["it"], t["one"], img("c1", "d_tw_sundar.png", "left:70px;top:60px;width:800px;border-radius:18px", "doc")
      + img("c2", "d_aa.jpg", "left:240px;top:470px;width:1440px;box-shadow:0 18px 60px #000", "doc")
      + '<div id="c3" class="ring" style="left:240px;top:622px;width:1440px;height:74px"></div>'
      + cap("c4", "#1", "right:310px;top:70px;font-size:200px;color:#d52243", "cap pix")
      + cap("c5", "SCORE: 60", "right:90px;top:300px;font-size:92px"), True)
slide("#c1", t["it"], x=-1100, rot=-3)
slide("#c2", t["it"] + .12, y=800, rot=-1.2)
pop("#c4", at("number"), -6)
pop("#c3", at("number"), -1.2)
pop("#c5", at("score"))
sfx("pop", at("number"), .35)
sfx("impact-bass-2", at("score"), .22)

# 4. the turn
scene("d", t["one"], t["right"], cap("d1", "JUST ONE PROBLEM", "left:0;right:0;top:170px;text-align:center;font-size:130px")
      + img("d2", "pichai_cut.png", "right:-30px;bottom:-120px;height:900px", "stick")
      + cap("d3", "YOU CAN'T USE IT", "left:80px;top:480px;font-size:128px;padding:18px 34px", "stamp"))
pop("#d1", t["one"])
slide("#d2", at("problem"), x=900, dur=.3)
pop("#d3", at("You"), -3)
sfx("impact-bass-1", at("You"), .28)

# 5. who gets it
scene("e", t["right"], t["rea"], img("e1", "d_tw_google.png", "right:70px;top:90px;width:900px;border-radius:18px", "doc")
      + img("e2", "d_fairwind.jpg", "left:70px;top:430px;width:1110px;box-shadow:0 18px 60px #000", "doc")
      + cap("e3", "FAIRWIND PROGRAM", "left:760px;bottom:60px;font-size:60px", "plate")
      + cap("e4", "CYBER DEFENDERS ONLY", "left:70px;top:150px;font-size:74px;width:760px"))
slide("#e1", t["right"], x=1100, rot=2.5)
slide("#e2", t["right"] + .15, x=-1300, rot=-1.5)
pop("#e4", at("small"))
pop("#e3", at("Fairwind"))

# 6. the numbers, built one per sentence
BOX = [("FIND", "88.2%", "SEC-bench Pro", "#2de1c2", "#0d3a36", at("88"), 160), ("EXPLOIT", "54.8%", "ExploitGym", "#fa9432", "#3c2610", at("Almost"), 730), ("FIX", "71.0%", "CWE-bench", "#7b8cff", "#1c2147", at("71"), 1300)]
inner = cap("f0", "THE REASON IS IN THE NUMBERS", "left:0;right:0;top:120px;text-align:center;font-size:78px")
for i, (a, b, c, col, bg, tt, x) in enumerate(BOX):
    inner += f'<div id="f{i + 1}" class="box" style="left:{x}px;top:360px;background:{bg};border-color:{col}"><div class="bl" style="color:{col}">{a}</div><div class="bn">{b}</div><div class="bs">{c}</div></div>'
    if i:
        inner += f'<svg id="fa{i}" class="arrow" style="left:{x - 110}px;top:520px" width="110" height="60" viewBox="0 0 110 60"><path d="M6 30 H92 M72 10 L98 30 L72 50" fill="none" stroke="#f8f3d9" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
scene("f", t["rea"], t["those"], inner)
pop("#f0", t["rea"])
for i, (a, b, c, col, bg, tt, x) in enumerate(BOX):
    pop(f"#f{i + 1}", tt)
    sfx("pop", tt, .3)
    if i:
        tl.append(f'tl.fromTo("#fa{i}",{{opacity:0,x:-30}},{{opacity:1,x:0,duration:.18}},{tt - .05:.3f});')

# 7. the caveat, on the page itself
scene("g", t["those"], t["but"], img("g1", "d_guard.jpg", "left:330px;top:40px;width:1260px;box-shadow:0 18px 60px #000", "doc")
      + cap("g2", "GOOGLE'S OWN NUMBERS", "left:60px;top:760px;font-size:90px;padding:14px 30px", "stamp")
      + cap("g3", "GUARDRAILS OFF", "right:60px;bottom:50px;font-size:80px"))
slide("#g1", t["those"], y=1000, dur=.34)
drift("#g1", t["those"] + .34, t["but"] - t["those"] - .34, 1, 1.02)
pop("#g2", at("Google's", 2), -2)
pop("#g3", at("guardrails"))

# 8. glitch, then the other benchmark
scene("h", t["but"], t["claude"], img("h1", "d_head.jpg", "left:120px;top:90px;width:1200px;transform-origin:50% 50%;box-shadow:0 18px 60px #000", "doc")
      + cap("h2", "SEMIANALYSIS", "left:140px;top:560px;font-size:124px")
      + cap("h3", "206 TASKS", "right:120px;top:700px;font-size:150px;color:#d52243", "cap pix"))
slide("#h1", t["but"] + .1, x=-1500, rot=2)
pop("#h2", at("Semi"))
pop("#h3", at("206"), -4)
html.append('<div id="tear" class="clip" data-start="%.3f" data-duration=".34" data-track-index="3" style="z-index:90;position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden">' % (t["but"] - .17)
            + "".join(f'<i id="tb{i}" class="tb"></i>' for i in range(22)) + "</div>")
r = random.Random(7)
for i in range(22):
    y, hh = r.randint(0, 1040), r.randint(8, 70)
    col = r.choice(["#f8f3d9", "#0f0c0d", "#2de1c2", "#d52243", "#7b8cff", "#0f0c0d"])
    tl.append(f'tl.set("#tb{i}",{{y:{y},height:{hh},background:"{col}",x:{r.randint(-300, 300)},opacity:{r.choice([0, 1, 1])}}},{t["but"] - .17:.3f});')
    tl.append(f'tl.set("#tb{i}",{{y:{r.randint(0, 1040)},x:{r.randint(-500, 500)},opacity:{r.choice([0, 1, 1])}}},{t["but"] - .06:.3f});')
    tl.append(f'tl.set("#tb{i}",{{y:{r.randint(0, 1040)},x:{r.randint(-700, 700)},opacity:{r.choice([0, 1])}}},{t["but"] + .06:.3f});')
sfx("glitch-1", t["but"] - .1, .28)

# 9. the money, bars drawn to scale
MAXH = 620
h51, h16 = MAXH, round(MAXH * 16 / 51)
inner = (f'<div class="bar" id="j1b" style="left:400px;bottom:170px;width:360px;height:{h51}px;background:#d97757"></div>'
         f'<div class="bar" id="j2b" style="left:1160px;bottom:170px;width:360px;height:{h16}px;background:#2de1c2"></div>'
         + cap("j1v", "$51", f"left:400px;width:360px;bottom:{170 + h51 - 145}px;text-align:center;font-size:120px;color:#0f0c0d;-webkit-text-stroke:0", "cap")
         + cap("j2v", "$16", f"left:1160px;width:360px;bottom:{170 + h16 + 14}px;text-align:center;font-size:120px")
         + cap("j1n", "CLAUDE OPUS 5.5", "left:290px;width:580px;bottom:90px;text-align:center;font-size:54px")
         + cap("j2n", "GEMINI 4 CARBON", "left:1050px;width:580px;bottom:90px;text-align:center;font-size:54px")
         + cap("j1r", "1ST", "left:130px;bottom:570px;font-size:120px;color:#d52243", "cap pix")
         + cap("j2r", "2ND", "left:1560px;bottom:300px;font-size:120px;color:#d52243", "cap pix")
         + cap("j3", "Cost per task. SemiAnalysis GDPx, via Android Headlines", "left:0;right:0;bottom:34px;text-align:center", "credit"))
scene("j", t["claude"], t["almost"], inner)
tl.append(f'tl.fromTo("#j1b",{{scaleY:0}},{{scaleY:1,duration:.5,ease:"power3.out"}},{at("$51") - .35:.3f});')
tl.append(f'tl.fromTo("#j2b",{{scaleY:0}},{{scaleY:1,duration:.4,ease:"power3.out"}},{at("$16") - .25:.3f});')
pop("#j1n", t["claude"])
pop("#j1v", at("$51"))
pop("#j1r", at("first"), -5)
pop("#j2n", at("Carbon", 3))
pop("#j2r", at("second"), 5)
pop("#j2v", at("$16"))
sfx("impact-bass-2", at("$16"), .2)

# 10. the line
scene("k", t["almost"], t["fair"], cap("k1", "ALMOST THE SAME BRAIN", "left:0;right:0;top:300px;text-align:center;font-size:124px")
      + cap("k2", "1/3 OF THE PRICE", "left:360px;top:560px;font-size:128px;padding:18px 34px", "stamp"))
pop("#k1", t["almost"])
pop("#k2", at("third"), -2)

# 11. the honest footnote
scene("l", t["fair"], t["but2"], img("l1", "d_fair.jpg", "left:230px;top:210px;width:1460px;box-shadow:0 18px 60px #000", "doc")
      + cap("l2", "TO BE FAIR", "left:60px;top:40px;font-size:120px"))
slide("#l1", t["fair"], x=1800, rot=1.5, dur=.32)
pop("#l2", t["fair"])

# 12. what happens next
scene("m", t["but2"], t["bye"], img("m1", "d_crystal.jpg", "left:340px;top:70px;width:1240px;height:760px;object-fit:cover", "doc")
      + img("m2", "d_soon.jpg", "left:330px;top:680px;width:1260px;box-shadow:0 18px 60px #000", "doc")
      + cap("m3", "VERY INTERESTING", "left:0;right:0;top:420px;text-align:center;font-size:130px"))
drift("#m1", t["but2"], t["bye"] - t["but2"], 1, 1.05)
slide("#m2", at("wider") - .1, y=500, rot=-1)
pop("#m3", at("interesting"))

# 13. the channel's own date card
logo = ('<svg id="n1" class="glob" width="300" height="300" viewBox="0 0 300 300" style="left:810px;top:230px">'
        '<circle cx="150" cy="150" r="130" fill="none" stroke="#f8f3d9" stroke-width="16"/>'
        '<ellipse cx="150" cy="150" rx="60" ry="130" fill="none" stroke="#f8f3d9" stroke-width="10"/>'
        '<path id="n1e" d="M-20 150 H320" stroke="#2de1c2" stroke-width="26" stroke-linecap="round"/></svg>')
scene("n", t["bye"], END, logo + cap("n2", "AI EQUATOR", "left:0;right:0;top:570px;text-align:center;font-size:150px")
      + cap("n3", "NOV 7TH, 2026", "left:0;right:0;top:760px;text-align:center;font-size:64px;color:#d52243;-webkit-text-stroke:0;text-shadow:none"))
pop("#n1", t["bye"])
pop("#n2", t["bye"] + .25)
tl.append(f'tl.fromTo("#n3",{{opacity:0}},{{opacity:1,duration:.25}},{t["bye"] + .6:.3f});')

doc = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1920px;height:1080px;overflow:hidden;background:#0e0c0d}}
#root{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#0e0c0d;font-family:"Archivo Black",sans-serif;color:#f8f3d9}}
.scene{{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}}
.inner{{position:absolute;left:0;top:0;width:1920px;height:1080px}}
.vw{{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}}
.stage{{background:#0e0c0d}}
.full{{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}}
.doc,.stick{{position:absolute}}
.cap{{position:absolute;font-size:96px;line-height:1.04;color:#f8f3d9;-webkit-text-stroke:16px #0f0c0d;paint-order:stroke fill;opacity:0}}
.pix{{font-family:"Space Mono",monospace;font-weight:700;letter-spacing:-.04em;word-spacing:-.32em}}
.plate{{position:absolute;background:#ecede5;color:#0f0c0d;font-size:44px;padding:8px 22px;border:5px solid #0f0c0d;opacity:0}}
.stamp{{position:absolute;background:#d52243;color:#f8f3d9;opacity:0;white-space:nowrap}}
.credit{{position:absolute;font-family:Inter,sans-serif;font-size:26px;color:#f8f3d9;text-shadow:0 1px 8px #000;opacity:0}}
#j3{{opacity:.85;font-size:24px}}
.ring{{position:absolute;border:7px solid #fa9432;border-radius:12px;opacity:0}}
.box{{position:absolute;width:460px;height:400px;border:6px solid;border-radius:26px;padding:34px;text-align:center;opacity:0}}
.bl{{font-size:64px}}
.bn{{font-size:112px;margin-top:30px;color:#f8f3d9;letter-spacing:-.03em}}
.bs{{font-family:Inter,sans-serif;font-size:34px;color:#c9c5b4;margin-top:26px}}
.arrow{{position:absolute;opacity:0}}
.bar{{position:absolute;transform-origin:50% 100%;border-radius:14px 14px 0 0}}
.tb{{position:absolute;left:-200px;width:2320px;display:block;opacity:0}}
.glob{{position:absolute}}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1920" data-height="1080">
{chr(10).join(html)}
<audio id="vo" class="clip" src="vo_n.wav" data-start="0" data-duration="{END}" data-volume="1" data-track-index="10"></audio>
<audio id="bed" class="clip" src="bed.mp3" data-start="0" data-duration="{END}" data-volume="0.27" data-fade-in="0.5" data-fade-out="1.2" data-track-index="11"></audio>
{chr(10).join(audio)}
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
tl.set({{}}, {{}}, {END});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
(H / "index.html").write_text(doc, encoding="utf-8")
print("built", END, "s", {k: v for k, v in t.items()})
