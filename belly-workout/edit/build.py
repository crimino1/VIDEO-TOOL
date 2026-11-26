"""Writes index.html for "10 Min Chair Workout for Seniors | Belly Fat Exercises for Men Over 50".
Intro 24 s (live figure), 10 x (15 s rest/next + 42 s work), outro 20 s (checklist). Extra motion: green wipe into
each set, ring bursts on the countdown, form-tip pop-ups, HALFWAY banner, per-word titles.  python build.py"""
from pathlib import Path
HERE = Path(__file__).resolve().parent
INTRO, REST, WORK, OUTRO = 24.0, 15.0, 42.0, 20.0
EX = [("seated_march", "Seated March", "Warm-up · Core · Hip flexors", "Pull your belly button in"),
      ("side_bend", "Seated Side Bend", "Obliques · Core", "Bend from your waist, not your neck"),
      ("knee_raise", "Knee Raise, Arms Out", "Lower abs · Hip flexors", "Keep your chest tall"),
      ("twist_punch", "Seated Twist Punches", "Obliques · Core · Shoulders", "Turn from your waist as you punch"),
      ("knee_tuck", "Seated Knee Tuck", "Lower abs · Hip flexors", "Breathe out as the knees come up"),
      ("torso_twist", "Seated Torso Twist", "Obliques · Core", "Slow and controlled"),
      ("cross_crunch", "Seated Cross Crunch", "Abs · Obliques", "Elbow toward the opposite knee"),
      ("flutter_kicks", "Seated Flutter Kicks", "Lower abs · Hip flexors", "Small kicks, back against the chair"),
      ("woodchopper", "Seated Woodchopper", "Obliques · Abs · Shoulders", "Chop high to low, then switch sides"),
      ("sit_to_stand", "Sit to Stand", "Legs · Glutes · Core", "Push through your heels")]
N = len(EX)
OUT_START = INTRO + N * (REST + WORK); DUR = OUT_START + OUTRO
items, tw, audio = [], [], []
def clip(cid, t0, dur, inner, z, cls="", extra=""):
    return f'<div id="{cid}" class="clip {cls}" data-start="{t0:.2f}" data-duration="{dur:.2f}" data-track-index="{z}" style="z-index:{z}"{extra}>{inner}</div>'
def T(s): tw.append(s)
def aud(aid, src, t0, vol=1.0):
    audio.append(f'<audio id="{aid}" class="clip" src="{src}" data-start="{t0:.2f}" data-volume="{vol}" data-track-index="20"></audio>')
def words(text, t0, prefix, gap=0.09, cls="w"):
    out = []
    for k, wd in enumerate(text.split(" ")):
        wid = f"{prefix}{k}"
        out.append(f'<span class="{cls}" id="{wid}">{wd}</span>')
        T(f'tl.fromTo("#{wid}",{{opacity:0,y:50,filter:"blur(8px)"}},{{opacity:1,y:0,filter:"blur(0px)",duration:0.45,ease:"expo.out"}},{t0 + k * gap:.2f});')
    return " ".join(out)
def timer(tid, t0, dur, label, color):
    items.append(clip(tid, t0, dur, f'<div class="tm"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="86" class="tbg"/><circle id="{tid}r" cx="100" cy="100" r="86" class="tfg" style="stroke:{color}"/></svg><b id="{tid}n">{int(dur)}</b><span style="color:{color}">{label}</span></div>', 12))
    T(f'tl.fromTo("#{tid} .tm",{{scale:0.6,opacity:0}},{{scale:1,opacity:1,duration:0.45,ease:"back.out(1.7)"}},{t0:.2f});')
    T(f'tl.fromTo("#{tid}r",{{strokeDashoffset:0}},{{strokeDashoffset:540,duration:{dur},ease:"none"}},{t0:.2f});')
    T(f'(()=>{{const o={{v:{dur}}};tl.fromTo(o,{{v:{dur}}},{{v:0.001,duration:{dur},ease:"none",onUpdate:()=>{{document.getElementById("{tid}n").textContent=Math.ceil(o.v);}}}},{t0:.2f});}})();')
def progress(pid, t0, dur, i):
    dots = "".join(f'<i class="{"on" if k < i else ("cur" if k == i else "")}"></i>' for k in range(N))
    items.append(clip(pid, t0, dur, f'<div class="pg"><span>Exercise {i + 1} of {N}</span><div class="dots">{dots}</div></div>', 12))

# ---------- intro: live figure on the right, title on the left
items.append(f'<div class="frame" id="wi"><video id="introvid" class="clip full" src="assets/clips/intro_live.mp4" muted playsinline data-start="0" data-duration="{INTRO:.2f}" data-track-index="1"></video></div>')
T(f'tl.fromTo("#wi",{{scale:1.30,x:280,y:110}},{{scale:1.34,x:280,y:110,duration:{INTRO},ease:"none"}},0);')
items.append(clip("shade", 0, INTRO, '<div class="lshade"></div>', 5))
items.append(clip("ttl", 0.2, INTRO - 0.4,
    f'<div class="title left"><div class="t0" id="t0">10 MIN CHAIR WORKOUT</div><div class="t1">{words("BELLY FAT", 0.6, "tw", 0.15)}</div>'
    f'<div class="t1 sm">{words("EXERCISES", 1.0, "tx")}</div><div class="uline" id="ul"></div><div class="t2" id="t2">For Seniors · Men Over 50</div>'
    f'<div class="t3" id="t3">10 moves · 42 s each · just a chair</div></div>', 10))
T('tl.fromTo("#t0",{opacity:0,x:-40},{opacity:1,x:0,duration:0.5,ease:"expo.out"},0.3);')
T('tl.fromTo("#ul",{scaleX:0},{scaleX:1,duration:0.6,ease:"expo.out"},1.4);')
T('tl.fromTo("#t2",{opacity:0,y:30},{opacity:1,y:0,duration:0.5,ease:"expo.out"},1.8);')
T('tl.fromTo("#t3",{opacity:0},{opacity:1,duration:0.6},2.4);')
items.append(clip("safe", 13.0, INTRO - 13.4, '<div class="safe" id="safei">Breathe out as you squeeze · Stop if anything hurts</div>', 10))
T('tl.fromTo("#safei",{opacity:0,y:20},{opacity:1,y:0,duration:0.5,ease:"expo.out"},13.05);')
aud("vo_intro", "assets/voice/intro.mp3", 0.8)

for i, (key, name, muscles, tip) in enumerate(EX):
    rs = INTRO + i * (REST + WORK); ws = rs + REST; we = ws + WORK
    # rest / next
    items.append(f'<img id="rb{i}" class="clip full" src="assets/clips/bg_rest.jpg" data-start="{rs:.2f}" data-duration="{REST:.2f}" data-track-index="1" style="z-index:1" alt="">')
    items.append(clip(f"nx{i}", rs, REST, f'<div class="nexth"><span id="nh{i}">NEXT</span><b>{words(name, rs + 0.3, f"nw{i}_", 0.08)}</b></div>', 3))
    items.append(clip(f"nbx{i}", rs, REST, f'<div class="nbox" id="nbi{i}"></div>', 3))
    items.append(f'<div class="nwrap" id="nvw{i}" style="z-index:4"><video id="nv{i}" class="clip nvid" src="assets/clips/{key}_next.mp4" muted playsinline data-start="{rs:.2f}" data-duration="{REST:.2f}" data-track-index="4"></video></div>')
    T(f'tl.fromTo("#nh{i}",{{opacity:0,scale:1.6}},{{opacity:1,scale:1,duration:0.6,ease:"expo.out"}},{rs + 0.1:.2f});')
    T(f'tl.fromTo(["#nbi{i}","#nvw{i}"],{{scale:0.8,rotation:-3,opacity:0}},{{scale:1,rotation:0,opacity:1,duration:0.6,ease:"back.out(1.5)"}},{rs + 0.15:.2f});')
    timer(f"tr{i}", rs, REST, "REST", "#ffd21f")
    progress(f"pr{i}", rs, REST, i)
    aud(f"vo_ex{i}", f"assets/voice/ex{i + 1:02d}.mp3", rs + 0.6)
    if i == N // 2:   # halfway banner
        items.append(clip("half", rs + 0.2, 3.2, '<div class="half" id="halfi"><span>HALFWAY!</span></div>', 15))
        T(f'tl.fromTo("#halfi",{{scale:0.3,rotation:-8,opacity:0}},{{scale:1,rotation:-4,opacity:1,duration:0.5,ease:"back.out(2)"}},{rs + 0.2:.2f});')
        T(f'tl.to("#halfi",{{scale:1.3,opacity:0,duration:0.35,ease:"power2.in"}},{rs + 3.0:.2f});')
    for k in (3, 2, 1):
        t0 = ws - k
        items.append(clip(f"cd{i}_{k}", t0, 0.98, f'<div class="cdring" id="cr{i}_{k}"></div><div class="cd" id="cd{i}_{k}i">{k}</div>', 14))
        T(f'tl.fromTo("#cd{i}_{k}i",{{scale:1.6,opacity:0}},{{scale:1,opacity:1,duration:0.35,ease:"back.out(1.7)"}},{t0:.2f});')
        T(f'tl.fromTo("#cr{i}_{k}",{{scale:0.9,opacity:0.9}},{{scale:1.9,opacity:0,duration:0.8,ease:"power2.out"}},{t0:.2f});')
        aud(f"bp{i}_{k}", "assets/sfx/beep.wav", t0 + 0.02, 0.5)
    aud(f"go{i}", "assets/sfx/go.wav", ws + 0.02, 0.55)
    # work
    items.append(f'<video id="wv{i}" class="clip full" src="assets/clips/{key}_work.mp4" muted playsinline data-start="{ws:.2f}" data-duration="{WORK:.2f}" data-track-index="2" style="z-index:2"></video>')
    items.append(clip(f"wipe{i}", ws - 0.05, 0.75, f'<div class="wipe" id="wp{i}"><i></i></div>', 16))
    T(f'tl.fromTo("#wp{i}",{{x:-2600}},{{x:2600,duration:0.7,ease:"power2.inOut"}},{ws - 0.05:.2f});')
    items.append(clip(f"go{i}t", ws + 0.1, 0.9, f'<div class="gotxt" id="go{i}ti">GO!</div>', 14))
    T(f'tl.fromTo("#go{i}ti",{{scale:0.5,opacity:0}},{{scale:1,opacity:1,duration:0.3,ease:"back.out(2)"}},{ws + 0.1:.2f});')
    T(f'tl.to("#go{i}ti",{{opacity:0,scale:1.3,duration:0.3}},{ws + 0.65:.2f});')
    timer(f"tw{i}", ws, WORK, "WORK", "#3ee07a")
    progress(f"pw{i}", ws, WORK, i)
    chips = "".join(f'<em id="mc{i}_{k}">{m}</em>' for k, m in enumerate(muscles.split(" · ")))
    items.append(clip(f"nm{i}", ws + 0.4, WORK - 0.7, f'<div class="name" id="nm{i}i"><div class="nbar" id="nb{i}"></div><b>{name}</b><div class="chips">{chips}</div></div>', 11))
    T(f'tl.fromTo("#nm{i}i",{{opacity:0,x:-80}},{{opacity:1,x:0,duration:0.6,ease:"expo.out"}},{ws + 0.45:.2f});')
    T(f'tl.fromTo("#nb{i}",{{scaleY:0}},{{scaleY:1,duration:0.5,ease:"expo.out"}},{ws + 0.6:.2f});')
    for k in range(len(muscles.split(" · "))):
        T(f'tl.fromTo("#mc{i}_{k}",{{opacity:0,y:14}},{{opacity:1,y:0,duration:0.35,ease:"back.out(2)"}},{ws + 0.9 + k * 0.12:.2f});')
    items.append(clip(f"tip{i}", ws + 13, 6.5, f'<div class="tip" id="tp{i}"><svg viewBox="0 0 24 24" width="46" height="46"><circle cx="12" cy="12" r="10" fill="#ffd21f"/><path d="M12 6v8M12 17v1" stroke="#10241b" stroke-width="2.6" stroke-linecap="round"/></svg><span>{tip}</span></div>', 11))
    T(f'tl.fromTo("#tp{i}",{{opacity:0,x:80}},{{opacity:1,x:0,duration:0.5,ease:"expo.out"}},{ws + 13.05:.2f});')
    T(f'tl.to("#tp{i}",{{opacity:0,x:60,duration:0.3,ease:"power2.in"}},{ws + 19.1:.2f});')
    aud(f"vo_ten{i}", "assets/voice/ten.mp3", ws + 31.5)
    aud(f"bell{i}", "assets/sfx/bell.wav", we - 0.1, 0.5)

# ---------- outro: checklist
items.append(f'<div class="frame" id="wo"><img id="outimg" class="clip full" src="assets/clips/idle.jpg" data-start="{OUT_START:.2f}" data-duration="{OUTRO:.2f}" data-track-index="1" alt=""></div>')
T(f'tl.fromTo("#wo",{{scale:1.22,x:170,y:70}},{{scale:1.18,x:170,y:70,duration:{OUTRO},ease:"none"}},{OUT_START:.2f});')
items.append(clip("oshade", OUT_START, OUTRO, '<div class="lshade"></div>', 5))
rows = "".join(f'<div class="ck" id="ck{k}"><i id="cki{k}">&#10003;</i>{n}</div>' for k, (_, n, _, _) in enumerate(EX))
items.append(clip("end", OUT_START + 0.2, OUTRO - 0.2, f'<div class="done"><div class="dh" id="dh">WORKOUT COMPLETE!</div><div class="cklist">{rows}</div></div><div class="sub" id="e3">Like &amp; Subscribe for more</div>', 10))
T(f'tl.fromTo("#dh",{{opacity:0,scale:0.7}},{{opacity:1,scale:1,duration:0.6,ease:"back.out(1.6)"}},{OUT_START + 0.3:.2f});')
for k in range(N):
    T(f'tl.fromTo("#ck{k}",{{opacity:0,x:-40}},{{opacity:1,x:0,duration:0.35,ease:"expo.out"}},{OUT_START + 1.2 + k * 0.28:.2f});')
    T(f'tl.fromTo("#cki{k}",{{scale:0}},{{scale:1,duration:0.35,ease:"back.out(2.5)"}},{OUT_START + 1.35 + k * 0.28:.2f});')
T(f'tl.fromTo("#e3",{{opacity:0,y:30}},{{opacity:1,y:0,duration:0.6,ease:"expo.out"}},{OUT_START + 9:.2f});')
aud("vo_outro", "assets/voice/outro.mp3", OUT_START + 0.6)

# music: one continuous upbeat bed (three tracks crossfaded), under the voice
audio.append(f'<audio id="music" class="clip" src="assets/music/bed.wav" data-start="0" data-duration="{DUR:.2f}" data-volume="0.16" data-fade-in="1.5" data-fade-out="3" data-track-index="21"></audio>')

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#000}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000;font-family:"Poppins",sans-serif;color:#fff}
.frame{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}
.full{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}
.w{display:inline-block}
.lshade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.25) 45%,rgba(0,0,0,0) 65%)}
.title.left{position:absolute;left:80px;top:150px;width:1000px}
.t0{display:inline-block;font-size:44px;font-weight:800;color:#10241b;background:#3ee07a;padding:6px 26px;border-radius:12px;letter-spacing:2px}
.t1{font-size:150px;font-weight:900;line-height:1.0;margin-top:14px;text-shadow:0 8px 30px rgba(0,0,0,.5)}
.t1 .w{color:#ff4d3d}
.t1.sm{font-size:96px;margin-top:0}.t1.sm .w{color:#fff}
.uline{width:520px;height:14px;background:#ffd21f;border-radius:7px;margin:14px 0 18px;transform-origin:left}
.t2{display:inline-block;font-size:50px;font-weight:800;color:#10241b;background:#ffd21f;padding:6px 30px;border-radius:14px;white-space:nowrap}
.t3{margin-top:20px;font-size:40px;font-weight:600;text-shadow:0 4px 16px rgba(0,0,0,.7)}
.safe,.sub{position:absolute;left:80px;bottom:80px;white-space:nowrap;background:rgba(6,40,27,.92);font-size:48px;font-weight:700;padding:14px 40px;border-radius:16px}
.sub{background:#e63946}
.tm{position:absolute;left:56px;top:46px;width:250px;height:250px;border-radius:50%;background:rgba(0,0,0,.45)}
.tm svg{position:absolute;inset:0;width:250px;height:250px;transform:rotate(-90deg)}
.tbg{fill:none;stroke:rgba(255,255,255,.18);stroke-width:14}
.tfg{fill:none;stroke-width:14;stroke-linecap:round;stroke-dasharray:540}
.tm b{position:absolute;left:0;right:0;top:44px;text-align:center;font-size:118px;font-weight:800;line-height:1}
.tm span{position:absolute;left:0;right:0;top:168px;text-align:center;font-size:36px;font-weight:800;letter-spacing:3px}
.pg{position:absolute;right:60px;top:60px;width:440px;text-align:right;text-shadow:0 3px 12px rgba(0,0,0,.6)}
.pg span{font-size:40px;font-weight:700}
.dots{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}
.dots i{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.35);border:3px solid rgba(255,255,255,.6)}
.dots i.on{background:#3ee07a;border-color:#3ee07a}
.dots i.cur{background:#ffd21f;border-color:#fff}
.name{position:absolute;left:56px;bottom:56px;background:rgba(6,40,27,.92);border-radius:16px;padding:16px 40px 20px 52px;overflow:hidden}
.nbar{position:absolute;left:0;top:0;bottom:0;width:16px;background:#ffd21f;transform-origin:top}
.name b{display:block;font-size:72px;font-weight:800;line-height:1.1}
.chips{display:flex;gap:12px;margin-top:8px}
.chips em{font-style:normal;font-size:32px;font-weight:700;color:#10241b;background:#9ff0bd;padding:2px 16px;border-radius:10px}
.tip{position:absolute;right:56px;bottom:70px;display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.95);color:#10241b;font-size:44px;font-weight:800;padding:14px 32px;border-radius:50px;box-shadow:0 12px 30px rgba(0,0,0,.3)}
.nexth{position:absolute;left:0;right:0;top:40px;text-align:center}
.nexth > span{display:block;font-size:52px;font-weight:800;color:#ffd21f;letter-spacing:6px}
.nexth b{display:block;font-size:84px;font-weight:900;text-shadow:0 6px 24px rgba(0,0,0,.6)}
.nbox{position:absolute;left:374px;top:282px;width:1172px;height:668px;background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(0,0,0,.5)}
.nwrap{position:absolute;left:384px;top:292px;width:1152px;height:648px;border-radius:12px;overflow:hidden}
.nvid{position:absolute;left:0;top:0;width:1152px;height:648px;object-fit:cover}
.cd{position:absolute;left:50%;top:50%;width:330px;height:330px;margin:-165px 0 0 -165px;border-radius:50%;background:rgba(62,224,122,.94);box-shadow:0 0 60px 20px rgba(62,224,122,.5);display:flex;align-items:center;justify-content:center;font-size:220px;font-weight:900;color:#0b3d24}
.cdring{position:absolute;left:50%;top:50%;width:330px;height:330px;margin:-165px 0 0 -165px;border-radius:50%;border:12px solid #3ee07a}
.gotxt{position:absolute;left:0;right:0;top:400px;text-align:center;font-size:200px;font-weight:900;color:#ffd21f;text-shadow:0 10px 40px rgba(0,0,0,.6)}
.wipe{position:absolute;left:-200px;top:-200px;width:1400px;height:1480px}
.wipe i{position:absolute;inset:0;background:linear-gradient(90deg,rgba(62,224,122,0),#3ee07a 30%,#ffd21f 70%,rgba(255,210,31,0));transform:skewX(-18deg);opacity:.85}
.half{position:absolute;left:50%;top:50%;margin:-130px 0 0 -460px;width:920px;height:260px;border-radius:30px;background:#e63946;box-shadow:0 20px 60px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center}
.half span{font-size:150px;font-weight:900;letter-spacing:4px}
.done{position:absolute;left:80px;top:90px;width:1000px}
.dh{display:inline-block;font-size:76px;font-weight:900;color:#10241b;background:#3ee07a;padding:8px 34px;border-radius:16px;transform-origin:left center}
.cklist{margin-top:22px;display:grid;grid-template-columns:1fr;gap:8px}
.ck{display:flex;align-items:center;gap:14px;font-size:36px;font-weight:700;text-shadow:0 3px 12px rgba(0,0,0,.7)}
.ck i{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:#3ee07a;color:#0b3d24;font-style:normal;font-weight:900;font-size:30px;flex:none}
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
