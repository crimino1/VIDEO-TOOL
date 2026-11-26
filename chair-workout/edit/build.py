"""Writes index.html for "Chair Workout for Men Over 50": intro, 10 x (15 s rest/next + 42 s work), outro.
python build.py"""
from pathlib import Path
HERE = Path(__file__).resolve().parent
INTRO, REST, WORK, OUTRO = 24.0, 15.0, 42.0, 20.0
EX = [("seated_march", "Seated March", "Hip flexors · Quads · Core"),
      ("arm_circles", "Arm Circles", "Shoulders · Upper back"),
      ("sit_to_stand", "Sit to Stand", "Quads · Glutes · Hamstrings"),
      ("overhead_press", "Seated Overhead Press", "Shoulders · Triceps"),
      ("knee_raise", "Knee Raise, Arms Out", "Core · Hip flexors · Shoulders"),
      ("chest_press", "Seated Chest Press", "Chest · Triceps · Shoulders"),
      ("torso_twist", "Seated Torso Twist", "Obliques · Core"),
      ("leg_extension", "Seated Leg Extension", "Quads"),
      ("calf_raise", "Standing Calf Raise", "Calves"),
      ("biceps_curl", "Seated Biceps Curl", "Biceps · Forearms")]
N = len(EX)
OUT_START = INTRO + N * (REST + WORK)
DUR = OUT_START + OUTRO
items, tw, audio = [], [], []
def clip(cid, t0, dur, inner, z, cls="", tag="div", extra=""):
    return f'<{tag} id="{cid}" class="clip {cls}" data-start="{t0:.2f}" data-duration="{dur:.2f}" data-track-index="{z}" style="z-index:{z}"{extra}>{inner}</{tag}>'
def T(s): tw.append(s)
def aud(aid, src, t0, vol=1.0, dur=None):
    d = f' data-duration="{dur:.2f}"' if dur else ""
    audio.append(f'<audio id="{aid}" class="clip" src="{src}" data-start="{t0:.2f}"{d} data-volume="{vol}" data-track-index="20"></audio>')
def timer(tid, t0, dur, label, color):
    """Ring timer top-left counting dur -> 0."""
    items.append(clip(tid, t0, dur, f'<div class="tm"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="86" class="tbg"/><circle id="{tid}r" cx="100" cy="100" r="86" class="tfg" style="stroke:{color}"/></svg><b id="{tid}n">{int(dur)}</b><span style="color:{color}">{label}</span></div>', 12))
    T(f'tl.fromTo("#{tid}r",{{strokeDashoffset:0}},{{strokeDashoffset:540,duration:{dur},ease:"none"}},{t0:.2f});')
    T(f'(()=>{{const o={{v:{dur}}};tl.fromTo(o,{{v:{dur}}},{{v:0.001,duration:{dur},ease:"none",onUpdate:()=>{{document.getElementById("{tid}n").textContent=Math.ceil(o.v);}}}},{t0:.2f});}})();')
def progress(pid, t0, dur, i):
    items.append(clip(pid, t0, dur, f'<div class="pg"><span>Exercise {i + 1} of {N}</span><div class="pbar"><i style="width:{(i + 1) / N * 100:.0f}%"></i></div></div>', 12))

# ---------- intro
items.append(f'<div class="frame" id="wi"><img id="introimg" class="clip full" src="assets/clips/idle.jpg" data-start="0" data-duration="{INTRO:.2f}" data-track-index="1" alt=""></div>')
T(f'tl.fromTo("#wi",{{scale:1.18,x:170,y:70}},{{scale:1.22,x:170,y:70,duration:{INTRO},ease:"none"}},0);')
items.append(clip("ttl", 0.2, INTRO - 0.4, '<div class="title left"><div class="t1" id="t1">CHAIR<br>WORKOUT</div><div class="t2" id="t2">Full Body Strength · Men Over 50</div><div class="t3" id="t3">10 exercises · about 10 minutes · just a chair</div></div>', 10))
T('tl.fromTo("#t1",{opacity:0,y:40},{opacity:1,y:0,duration:0.7,ease:"expo.out"},0.3);')
T('tl.fromTo("#t2",{opacity:0,y:30},{opacity:1,y:0,duration:0.6,ease:"expo.out"},0.9);')
T('tl.fromTo("#t3",{opacity:0},{opacity:1,duration:0.6},1.6);')
items.append(clip("safe", 13.0, INTRO - 13.4, '<div class="safe" id="safei">Go at your own pace · Stop if anything hurts</div>', 10))
T('tl.fromTo("#safei",{opacity:0,y:20},{opacity:1,y:0,duration:0.5,ease:"expo.out"},13.05);')
aud("vo_intro", "assets/voice/intro.mp3", 0.8)

# ---------- exercises
for i, (key, name, muscles) in enumerate(EX):
    rs = INTRO + i * (REST + WORK); ws = rs + REST; we = ws + WORK
    # rest / next screen
    items.append(f'<img id="rb{i}" class="clip full" src="assets/clips/bg_rest.jpg" data-start="{rs:.2f}" data-duration="{REST:.2f}" data-track-index="1" style="z-index:1" alt="">')
    items.append(clip(f"nx{i}", rs, REST, f'<div class="nexth"><span>NEXT</span><b>{name}</b></div><div class="nbox"></div>', 3))
    items.append(f'<video id="nv{i}" class="clip nvid" src="assets/clips/{key}_next.mp4" muted playsinline data-start="{rs:.2f}" data-duration="{REST:.2f}" data-track-index="4" style="z-index:4"></video>')
    T(f'tl.fromTo("#nx{i} .nexth",{{opacity:0,y:-30}},{{opacity:1,y:0,duration:0.6,ease:"expo.out"}},{rs + 0.1:.2f});')
    timer(f"tr{i}", rs, REST, "REST", "#ffd21f")
    progress(f"pr{i}", rs, REST, i)
    aud(f"vo_ex{i}", f"assets/voice/ex{i + 1:02d}.mp3", rs + 0.6)
    for k in (3, 2, 1):
        t0 = ws - k
        items.append(clip(f"cd{i}_{k}", t0, 0.98, f'<div class="cd" id="cd{i}_{k}i">{k}</div>', 14))
        T(f'tl.fromTo("#cd{i}_{k}i",{{scale:1.6,opacity:0}},{{scale:1,opacity:1,duration:0.35,ease:"back.out(1.7)"}},{t0:.2f});')
        aud(f"bp{i}_{k}", "assets/sfx/beep.wav", t0 + 0.02, 0.55)
    aud(f"go{i}", "assets/sfx/go.wav", ws + 0.02, 0.6)
    # work
    items.append(f'<video id="wv{i}" class="clip full" src="assets/clips/{key}_work.mp4" muted playsinline data-start="{ws:.2f}" data-duration="{WORK:.2f}" data-track-index="2" style="z-index:2"></video>')
    items.append(clip(f"go{i}t", ws, 0.9, f'<div class="gotxt" id="go{i}ti">GO!</div>', 14))
    T(f'tl.fromTo("#go{i}ti",{{scale:0.5,opacity:0}},{{scale:1,opacity:1,duration:0.3,ease:"back.out(2)"}},{ws:.2f});')
    T(f'tl.to("#go{i}ti",{{opacity:0,scale:1.3,duration:0.3}},{ws + 0.55:.2f});')
    timer(f"tw{i}", ws, WORK, "WORK", "#3ee07a")
    progress(f"pw{i}", ws, WORK, i)
    items.append(clip(f"nm{i}", ws + 0.3, WORK - 0.6, f'<div class="name" id="nm{i}i"><b>{name}</b><span>{muscles}</span></div>', 11))
    T(f'tl.fromTo("#nm{i}i",{{opacity:0,x:-60}},{{opacity:1,x:0,duration:0.6,ease:"expo.out"}},{ws + 0.35:.2f});')
    aud(f"vo_ten{i}", "assets/voice/ten.mp3", ws + 31.5)
    aud(f"bell{i}", "assets/sfx/bell.wav", we - 0.1, 0.55)

# ---------- outro
items.append(f'<div class="frame" id="wo"><img id="outimg" class="clip full" src="assets/clips/idle.jpg" data-start="{OUT_START:.2f}" data-duration="{OUTRO:.2f}" data-track-index="1" alt=""></div>')
T(f'tl.fromTo("#wo",{{scale:1.22,x:170,y:70}},{{scale:1.18,x:170,y:70,duration:{OUTRO},ease:"none"}},{OUT_START:.2f});')
items.append(clip("end", OUT_START + 0.3, OUTRO - 0.3, '<div class="title left"><div class="t1" id="e1">GREAT<br>JOB!</div><div class="t2" id="e2">Do this workout 3 times a week</div></div><div class="sub" id="e3">Like &amp; Subscribe for more</div>', 10))
T(f'tl.fromTo("#e1",{{opacity:0,scale:0.7}},{{opacity:1,scale:1,duration:0.6,ease:"back.out(1.6)"}},{OUT_START + 0.4:.2f});')
T(f'tl.fromTo("#e2",{{opacity:0,y:30}},{{opacity:1,y:0,duration:0.6,ease:"expo.out"}},{OUT_START + 1.2:.2f});')
T(f'tl.fromTo("#e3",{{opacity:0,y:30}},{{opacity:1,y:0,duration:0.6,ease:"expo.out"}},{OUT_START + 8:.2f});')
aud("vo_outro", "assets/voice/outro.mp3", OUT_START + 0.6)

# ---------- music bed under everything
t = 0.0; k = 0
while t < DUR:
    d = min(175.0, DUR - t)
    audio.append(f'<audio id="mus{k}" class="clip" src="assets/music/bed.wav" data-start="{t:.2f}" data-duration="{d:.2f}" data-volume="0.07" data-fade-in="1" data-fade-out="1.5" data-track-index="21"></audio>')
    t += 175.0; k += 1

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#000}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000;font-family:"Poppins",sans-serif;color:#fff}
.frame{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}
.full{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}
.title{position:absolute;left:0;right:0;top:70px;text-align:center}
.title.left{left:80px;right:auto;top:190px;width:1000px;text-align:left}
.title.left .t2{white-space:nowrap;font-size:48px}
.title.left .t3{max-width:820px}
.t1{line-height:1.02;font-size:128px;font-weight:900;letter-spacing:4px;text-shadow:0 8px 30px rgba(0,0,0,.55)}
.t2{display:inline-block;margin-top:10px;font-size:58px;font-weight:800;color:#10241b;background:#ffd21f;padding:6px 34px;border-radius:14px}
.t3{margin-top:22px;font-size:42px;font-weight:600;text-shadow:0 4px 16px rgba(0,0,0,.7)}
.safe,.sub{position:absolute;left:90px;bottom:90px;white-space:nowrap;background:rgba(6,40,27,.92);font-size:50px;font-weight:700;padding:14px 40px;border-radius:16px}
.sub{background:#e63946}
.tm{position:absolute;left:56px;top:46px;width:250px;height:250px;border-radius:50%;background:rgba(0,0,0,.45)}
.tm svg{position:absolute;inset:0;width:250px;height:250px;transform:rotate(-90deg)}
.tbg{fill:none;stroke:rgba(255,255,255,.18);stroke-width:14}
.tfg{fill:none;stroke-width:14;stroke-linecap:round;stroke-dasharray:540}
.tm b{position:absolute;left:0;right:0;top:44px;text-align:center;font-size:118px;font-weight:800;line-height:1}
.tm span{position:absolute;left:0;right:0;top:168px;text-align:center;font-size:36px;font-weight:800;letter-spacing:3px}
.pg{position:absolute;right:60px;top:60px;width:420px;text-align:right;text-shadow:0 3px 12px rgba(0,0,0,.6)}
.pg span{font-size:40px;font-weight:700}
.pbar{margin-top:12px;height:18px;border-radius:9px;background:rgba(255,255,255,.3);overflow:hidden}
.pbar i{display:block;height:100%;background:#3ee07a;border-radius:9px}
.name{position:absolute;left:56px;bottom:56px;background:rgba(6,40,27,.92);border-left:16px solid #ffd21f;border-radius:16px;padding:16px 40px 18px}
.name b{display:block;font-size:72px;font-weight:800;line-height:1.1}
.name span{display:block;font-size:38px;font-weight:600;color:#9ff0bd}
.nexth{position:absolute;left:0;right:0;top:46px;text-align:center}
.nexth span{display:block;font-size:52px;font-weight:800;color:#ffd21f;letter-spacing:6px}
.nexth b{display:block;font-size:84px;font-weight:900;text-shadow:0 6px 24px rgba(0,0,0,.6)}
.nbox{position:absolute;left:374px;top:282px;width:1172px;height:668px;background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(0,0,0,.5)}
.nvid{position:absolute;left:384px;top:292px;width:1152px;height:648px;object-fit:cover;border-radius:12px}
.cd{position:absolute;left:50%;top:50%;width:330px;height:330px;margin:-165px 0 0 -165px;border-radius:50%;background:rgba(62,224,122,.92);box-shadow:0 0 60px 20px rgba(62,224,122,.55);display:flex;align-items:center;justify-content:center;font-size:220px;font-weight:900;color:#0b3d24}
.gotxt{position:absolute;left:0;right:0;top:400px;text-align:center;font-size:200px;font-weight:900;color:#ffd21f;text-shadow:0 10px 40px rgba(0,0,0,.6)}
"""
html = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>{CSS}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DUR:.2f}" data-width="1920" data-height="1080">
{chr(10).join(items)}
{chr(10).join(audio)}
</div>
<script>
const tl = gsap.timeline({{paused:true}});
{chr(10).join(tw)}
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
(HERE / "index.html").write_text(html, encoding="utf-8")
print("written", len(items), "elements,", len(audio), "audio, duration", DUR)
