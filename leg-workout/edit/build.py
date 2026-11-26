"""Writes index.html for "Top 9 Leg Strength Exercises for Seniors".
Intro 30 s (live figure, why strong legs, before you start, today's moves), 9 x (15 s rest/next + 45 s work), outro 20 s.
During work a LEG POWER panel shows two legs (calf, lower thigh, upper thigh) that light up from the bottom in time
with the figure - only the working leg for one-leg moves - with a big move cue and a rep counter.  python build.py"""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
INTRO, REST, WORK, OUTRO = 30.0, 15.0, 45.0, 20.0
EX = [("seated_march", "Seated March", "Hip flexors · Thighs", "Sit tall, lift with control"),
      ("leg_extension", "Seated Leg Extension", "Quads · Knees", "Squeeze your thigh at the top"),
      ("knee_raise", "Seated Knee Raise", "Hip flexors · Thighs", "Keep your back straight"),
      ("knee_opener", "Seated Knee Opener", "Hips · Outer thighs", "Keep your feet together"),
      ("leg_raise", "Seated Leg Raise", "Quads · Hip flexors", "Too hard? One leg at a time"),
      ("calf_raise", "Standing Calf Raise", "Calves · Ankles", "Hold the chair if unsteady"),
      ("side_leg_raise", "Standing Side Leg Raise", "Hips · Outer thighs", "Stand tall, toes forward"),
      ("flutter_kicks", "Seated Flutter Kicks", "Thighs · Hip flexors", "Keep the kicks small"),
      ("sit_to_stand", "Sit to Stand", "Quads · Glutes · Hamstrings", "Use your hands if you need to")]
# leg rhythm per exercise, in loop seconds (matches the pose loops in chair_ex.py):
# (loop length, [(start, end, label, leg level, ramp seconds, side)]); side b = both legs, r / l = his right / left leg
RHY = {
    "seated_march": (2.4, [(0, 0.75, "RIGHT KNEE", 1, 0.45, "r"), (0.75, 1.2, "RIGHT KNEE", 0.35, 0.45, "r"), (1.2, 1.95, "LEFT KNEE", 1, 0.45, "l"), (1.95, 2.4, "LEFT KNEE", 0.35, 0.45, "l")]),
    "leg_extension": (3.2, [(0, 1.0, "RIGHT LEG", 1, 0.6, "r"), (1.0, 1.6, "LOWER", 0.15, 0.6, "r"), (1.6, 2.6, "LEFT LEG", 1, 0.6, "l"), (2.6, 3.2, "LOWER", 0.15, 0.6, "l")]),
    "knee_raise": (3.2, [(0, 1.0, "RIGHT KNEE", 1, 0.6, "r"), (1.0, 1.6, "RIGHT KNEE", 0.3, 0.6, "r"), (1.6, 2.6, "LEFT KNEE", 1, 0.6, "l"), (2.6, 3.2, "LEFT KNEE", 0.3, 0.6, "l")]),
    "knee_opener": (4.0, [(0, 1.6, "OPEN", 1, 0.9, "b"), (1.6, 2.6, "CLOSE", 0.3, 1.0, "b"), (2.6, 4.0, "RELAX", 0, 0.6, "b")]),
    "leg_raise": (3.6, [(0, 1.5, "LEGS UP", 1, 0.9, "b"), (1.5, 2.7, "LOWER SLOWLY", 0.3, 1.2, "b"), (2.7, 3.6, "REST", 0, 0.5, "b")]),
    "calf_raise": (2.0, [(0, 1.1, "UP ON TOES", 1, 0.7, "b"), (1.1, 2.0, "LOWER", 0.15, 0.7, "b")]),
    "side_leg_raise": (3.6, [(0, 1.0, "RIGHT LEG", 1, 0.6, "r"), (1.0, 1.8, "LOWER", 0.15, 0.6, "r"), (1.8, 2.8, "LEFT LEG", 1, 0.6, "l"), (2.8, 3.6, "LOWER", 0.15, 0.6, "l")]),
    "flutter_kicks": (1.2, [(0, 0.6, "KEEP KICKING", 1, 0.3, "b"), (0.6, 1.2, "KEEP KICKING", 0.75, 0.3, "b")]),
    "sit_to_stand": (3.4, [(0, 0.35, "LEAN FORWARD", 0.4, 0.3, "b"), (0.35, 1.85, "STAND UP", 1, 1.0, "b"), (1.85, 3.15, "SIT SLOWLY", 0.5, 1.2, "b"), (3.15, 3.4, "SIT SLOWLY", 0.1, 0.25, "b")]),
}
ACC, ACC2 = "#2ec4ff", "#ffd21f"     # sky blue / yellow accents for this video
N = len(EX)
OUT_START = INTRO + N * (REST + WORK); DUR = OUT_START + OUTRO
items, tw, audio, jsdata = [], [], [], []
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

def core_svg(pid):
    """Front view of two legs (viewer's left = his right leg); cp() lights calf, lower thigh, upper thigh from the
    bottom up. Column 0 = his right leg, column 1 = his left leg."""
    rows = ((206, 68, 46), (140, 58, 54), (78, 56, 60))          # (y, height, width): calf, lower thigh, upper thigh
    segs = "".join(f'<rect x="{cx - w / 2}" y="{y}" width="{w}" height="{h}" rx="20" fill="#3a4b5e"/><rect id="{pid}s{r}{c}" x="{cx - w / 2}" y="{y}" width="{w}" height="{h}" rx="20" fill="{ACC}" opacity="0"/>'
                   for r, (y, h, w) in enumerate(rows) for c, cx in enumerate((160, 240)))
    return (f'<svg viewBox="0 0 400 300" class="pv"><defs><radialGradient id="{pid}g"><stop offset="0" stop-color="{ACC}" stop-opacity=".85"/><stop offset="1" stop-color="{ACC}" stop-opacity="0"/></radialGradient></defs>'
            f'<ellipse id="{pid}gl" cx="200" cy="160" rx="150" ry="140" fill="url(#{pid}g)" opacity=".1"/>'
            f'<path d="M116,20 L284,20 C290,60 282,110 274,140 C270,180 268,230 262,276 L276,292 L214,292 L212,200 C210,160 204,120 200,96 C196,120 190,160 188,200 L186,292 L124,292 L138,276 C132,230 130,180 126,140 C118,110 110,60 116,20 Z" fill="rgba(255,255,255,.06)" stroke="#cfe3f5" stroke-opacity=".55" stroke-width="5" stroke-linejoin="round"/>'
            f'{segs}</svg>')

# ---------- intro: live figure on the right, title on the left, then who it's for, before you start, today's moves
items.append(f'<div class="frame" id="wi"><video id="introvid" class="clip full" src="assets/clips/intro_live.mp4" muted playsinline data-start="0" data-duration="{INTRO:.2f}" data-track-index="1"></video></div>')
T(f'tl.fromTo("#wi",{{scale:1.30,x:300,y:110}},{{scale:1.36,x:300,y:110,duration:{INTRO},ease:"none"}},0);')
items.append(clip("shade", 0, INTRO, '<div class="lshade"></div>', 5))
items.append(clip("ttl", 0.2, 6.6,
    f'<div class="title left" id="ttli"><div class="t0" id="t0">SENIORS · 10 MINUTES</div><div class="t1">{words("STRONG", 0.6, "tw", 0.15)}</div>'
    f'<div class="t1 sm">{words("LEGS WORKOUT", 1.0, "tx", 0.15)}</div><div class="uline" id="ul"></div>'
    f'<div class="t2" id="t2">Top 9 moves · just a chair</div>'
    f'<div class="t3" id="t3">Walk better · climb stairs · stay steady</div></div>', 10))
T('tl.fromTo("#t0",{opacity:0,x:-40},{opacity:1,x:0,duration:0.5,ease:"expo.out"},0.3);')
T('tl.fromTo("#ul",{scaleX:0},{scaleX:1,duration:0.6,ease:"expo.out"},1.5);')
T('tl.fromTo("#t2",{opacity:0,y:30},{opacity:1,y:0,duration:0.5,ease:"expo.out"},1.9);')
T('tl.fromTo("#t3",{opacity:0},{opacity:1,duration:0.6},2.5);')
T('tl.to("#ttli",{opacity:0,x:-60,duration:0.4,ease:"power2.in"},6.4);')
# who it's for
chips = "".join(f'<em id="who{k}">{w}</em>' for k, w in enumerate(["Walk farther", "Climb stairs", "Better balance", "Fewer falls"]))
items.append(clip("who", 6.6, 6.55, f'<div class="rlx" id="whoi"><div class="fh">WHY STRONG <b>LEGS?</b></div><div class="rchips">{chips}</div></div>', 10))
T('tl.fromTo("#whoi",{opacity:0,y:40},{opacity:1,y:0,duration:0.5,ease:"expo.out"},6.65);')
for k in range(4):
    T(f'tl.fromTo("#who{k}",{{opacity:0,scale:0.5}},{{opacity:1,scale:1,duration:0.4,ease:"back.out(2.2)"}},{7.0 + k * 0.3:.2f});')
T('tl.to("#whoi",{opacity:0,x:-60,duration:0.4,ease:"power2.in"},12.7);')
# before you start
tips = ["Sturdy chair, no wheels", "Wear non-slip shoes", "Hold on if unsteady"]
rows = "".join(f'<div class="frow" id="bs{k}"><i>{k + 1}</i>{t}</div>' for k, t in enumerate(tips))
items.append(clip("bstart", 13.2, 5.2, f'<div class="find" id="bsi"><div class="fh">BEFORE YOU <b>START</b></div>{rows}</div>', 10))
T('tl.fromTo("#bsi",{opacity:0,y:40},{opacity:1,y:0,duration:0.5,ease:"expo.out"},13.25);')
for k in range(3):
    T(f'tl.fromTo("#bs{k}",{{opacity:0,x:-50}},{{opacity:1,x:0,duration:0.5,ease:"expo.out"}},{13.8 + k * 0.8:.2f});')
T('tl.to("#bsi",{opacity:0,x:-60,duration:0.4,ease:"power2.in"},18.0);')
# today's moves
rows = "".join(f'<div class="mv" id="mv{k}"><i>{k + 1}</i>{n}</div>' for k, (_, n, _, _) in enumerate(EX))
items.append(clip("moves", 18.5, INTRO - 18.7, f'<div class="moves"><div class="dh" id="mvh">TODAY\'S 9 MOVES</div><div class="mvl">{rows}</div></div>', 10))
T('tl.fromTo("#mvh",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.6,ease:"back.out(1.6)"},18.6);')
for k in range(N):
    T(f'tl.fromTo("#mv{k}",{{opacity:0,x:-40}},{{opacity:1,x:0,duration:0.4,ease:"expo.out"}},{19.3 + k * 0.35:.2f});')
items.append(clip("safe", 23.5, INTRO - 23.9, '<div class="safe" id="safei">Keep breathing · Stop if anything hurts</div>', 11))
T('tl.fromTo("#safei",{opacity:0,y:20},{opacity:1,y:0,duration:0.5,ease:"expo.out"},23.55);')
aud("vo_intro", "assets/voice/intro.mp3", 0.8)

for i, (key, name, muscles, tip) in enumerate(EX):
    rs = INTRO + i * (REST + WORK); ws = rs + REST; we = ws + WORK
    # rest / next
    items.append(f'<img id="rb{i}" class="clip full" src="assets/clips/bg_rest.jpg" data-start="{rs:.2f}" data-duration="{REST:.2f}" data-track-index="1" style="z-index:1" alt="">')
    head = "LAST ONE!" if i == N - 1 else "NEXT"
    items.append(clip(f"nx{i}", rs, REST, f'<div class="nexth"><span id="nh{i}">{head}</span><b>{words(name, rs + 0.3, f"nw{i}_", 0.08)}</b></div>', 3))
    items.append(clip(f"nbx{i}", rs, REST, f'<div class="nbox" id="nbi{i}"></div>', 3))
    items.append(f'<div class="nwrap" id="nvw{i}" style="z-index:4"><video id="nv{i}" class="clip nvid" src="assets/clips/{key}_next.mp4" muted playsinline data-start="{rs:.2f}" data-duration="{REST:.2f}" data-track-index="4"></video></div>')
    T(f'tl.fromTo("#nh{i}",{{opacity:0,scale:1.6}},{{opacity:1,scale:1,duration:0.6,ease:"expo.out"}},{rs + 0.1:.2f});')
    T(f'tl.fromTo(["#nbi{i}","#nvw{i}"],{{scale:0.8,rotation:-3,opacity:0}},{{scale:1,rotation:0,opacity:1,duration:0.6,ease:"back.out(1.5)"}},{rs + 0.15:.2f});')
    timer(f"tr{i}", rs, REST, "REST", ACC2)
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
    # leg panel: leg meter + move cue + reps, driven by one proxy (seek-safe)
    loop, segs = RHY[key]
    labels = list(dict.fromkeys(s[2] for s in segs))
    lab_html = "".join(f'<div class="st{" up" if max(s[3] for s in segs if s[2] == l) >= 0.5 else ""}" id="st{i}_{k}">{l}</div>' for k, l in enumerate(labels))
    items.append(clip(f"xr{i}", ws + 0.6, WORK - 0.9, f'<div class="xray" id="xr{i}i"><div class="xh">LEG POWER</div><div class="xpv">{core_svg(f"p{i}")}</div>'
                      f'<div class="stbox">{lab_html}</div><div class="reps">REPS <b id="rp{i}">0</b></div></div>', 11))
    T(f'tl.fromTo("#xr{i}i",{{opacity:0,x:120}},{{opacity:1,x:0,duration:0.6,ease:"expo.out"}},{ws + 0.65:.2f});')
    js = []
    for k, s in enumerate(segs):   # label start = start of the run of segments sharing this label, so it doesn't blink
        j = k
        while j > 0 and segs[j - 1][2] == s[2]: j -= 1
        js.append([s[0], s[1], labels.index(s[2]), s[3], s[4], segs[j][0], s[5]])
    jsdata.append({"i": i, "T": loop, "segs": js, "n": len(labels)})
    T(f'(()=>{{const o={{t:0}};tl.fromTo(o,{{t:0}},{{t:{WORK},duration:{WORK},ease:"none",onUpdate:()=>work({i},o.t)}},{ws:.2f});}})();')
    items.append(clip(f"tip{i}", ws + 13, 6.5, f'<div class="tip" id="tp{i}"><svg viewBox="0 0 24 24" width="46" height="46"><circle cx="12" cy="12" r="10" fill="{ACC2}"/><path d="M12 6v8M12 17v1" stroke="#10241b" stroke-width="2.6" stroke-linecap="round"/></svg><span>{tip}</span></div>', 12))
    T(f'tl.fromTo("#tp{i}",{{opacity:0,x:80}},{{opacity:1,x:0,duration:0.5,ease:"expo.out"}},{ws + 13.05:.2f});')
    T(f'tl.to("#tp{i}",{{opacity:0,x:60,duration:0.3,ease:"power2.in"}},{ws + 19.1:.2f});')
    aud(f"vo_ten{i}", "assets/voice/ten.mp3", ws + 34.5)
    aud(f"bell{i}", "assets/sfx/bell.wav", we - 0.1, 0.5)

# ---------- outro: checklist
items.append(f'<div class="frame" id="wo"><img id="outimg" class="clip full" src="assets/clips/idle.jpg" data-start="{OUT_START:.2f}" data-duration="{OUTRO:.2f}" data-track-index="1" alt=""></div>')
T(f'tl.fromTo("#wo",{{scale:1.22,x:190,y:70}},{{scale:1.18,x:190,y:70,duration:{OUTRO},ease:"none"}},{OUT_START:.2f});')
items.append(clip("oshade", OUT_START, OUTRO, '<div class="lshade"></div>', 5))
rows = "".join(f'<div class="ck" id="ck{k}"><i id="cki{k}">&#10003;</i>{n}</div>' for k, (_, n, _, _) in enumerate(EX))
items.append(clip("end", OUT_START + 0.2, OUTRO - 0.2, f'<div class="done"><div class="dh" id="dh">WORKOUT COMPLETE!</div><div class="cklist">{rows}</div>'
                  f'<div class="goal" id="goal">Repeat 3 times a week</div></div><div class="sub" id="e3">Like &amp; Subscribe for more</div>', 10))
T(f'tl.fromTo("#dh",{{opacity:0,scale:0.7}},{{opacity:1,scale:1,duration:0.6,ease:"back.out(1.6)"}},{OUT_START + 0.3:.2f});')
for k in range(N):
    T(f'tl.fromTo("#ck{k}",{{opacity:0,x:-40}},{{opacity:1,x:0,duration:0.35,ease:"expo.out"}},{OUT_START + 1.2 + k * 0.3:.2f});')
    T(f'tl.fromTo("#cki{k}",{{scale:0}},{{scale:1,duration:0.35,ease:"back.out(2.5)"}},{OUT_START + 1.35 + k * 0.3:.2f});')
T(f'tl.fromTo("#goal",{{opacity:0,y:20}},{{opacity:1,y:0,duration:0.5,ease:"expo.out"}},{OUT_START + 4.4:.2f});')
T(f'tl.fromTo("#e3",{{opacity:0,y:30}},{{opacity:1,y:0,duration:0.6,ease:"expo.out"}},{OUT_START + 8:.2f});')
aud("vo_outro", "assets/voice/outro.mp3", OUT_START + 0.6)

# music: one continuous upbeat bed (three tracks crossfaded), under the voice
audio.append(f'<audio id="music" class="clip" src="assets/music/bed.wav" data-start="0" data-duration="{DUR:.2f}" data-volume="0.17" data-fade-in="1.5" data-fade-out="3" data-track-index="21"></audio>')

JS = """
const RH = %s;
function cp(id, lv){
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    const a = Math.max(0, Math.min(1, lv[c] * 3 - r)).toFixed(3);
    const el = document.getElementById(`${id}s${r}${c}`); if (el) el.setAttribute("opacity", a); }
  const g = document.getElementById(id + "gl"); if (g) g.setAttribute("opacity", (0.08 + 0.7 * Math.max(lv[0], lv[1])).toFixed(3));
}
function lev(s){ return [s[6] === "l" ? 0 : s[3], s[6] === "r" ? 0 : s[3]]; }
function work(i, t){
  const r = RH[i]; const lt = t %% r.T; const S = r.segs;
  let k = 0; while (k < S.length - 1 && lt >= S[k][1]) k++;
  const pv = lev(S[(k + S.length - 1) %% S.length]), cv = lev(S[k]);
  const u = Math.min(1, (lt - S[k][0]) / S[k][4]); const e = 0.5 - 0.5 * Math.cos(Math.PI * u);
  cp("p" + i, [pv[0] + (cv[0] - pv[0]) * e, pv[1] + (cv[1] - pv[1]) * e]);
  for (let j = 0; j < r.n; j++) { const el = document.getElementById(`st${i}_${j}`); const on = j === S[k][2];
    const since = lt - S[k][5];
    el.style.opacity = (on ? Math.min(1, since / 0.15) : 0).toFixed(3); el.style.transform = `scale(${on ? 0.85 + 0.15 * Math.min(1, since / 0.25) : 0.85})`; }
  document.getElementById("rp" + i).textContent = Math.floor(t / r.T) + 1;
}
""" % json.dumps({d["i"]: d for d in jsdata})

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#000}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000;font-family:"Poppins",sans-serif;color:#fff}
.frame{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}
.full{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}
.w{display:inline-block}
.lshade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.66) 0%,rgba(0,0,0,.34) 45%,rgba(0,0,0,0) 66%)}
.title.left{position:absolute;left:80px;top:150px;width:1000px}
.t0{display:inline-block;font-size:44px;font-weight:800;color:#062a3d;background:ACC;padding:6px 26px;border-radius:12px;letter-spacing:2px}
.t1{font-size:170px;font-weight:900;line-height:1.0;margin-top:14px;text-shadow:0 8px 30px rgba(0,0,0,.5)}
.t1 .w{color:ACC}
.t1.sm{font-size:104px;margin-top:0}.t1.sm .w{color:#fff}
.uline{width:620px;height:14px;background:ACC2;border-radius:7px;margin:14px 0 18px;transform-origin:left}
.t2{display:inline-block;font-size:52px;font-weight:800;color:#10241b;background:ACC2;padding:6px 30px;border-radius:14px;white-space:nowrap}
.t3{margin-top:20px;font-size:40px;font-weight:600;text-shadow:0 4px 16px rgba(0,0,0,.7)}
.find,.rlx{position:absolute;left:80px;top:150px;width:960px}
.fh{font-size:64px;font-weight:900;line-height:1.1;text-shadow:0 6px 20px rgba(0,0,0,.6)}
.fh b{color:ACC}
.pv{width:100%;height:100%;overflow:visible}
.frow{display:flex;align-items:center;gap:18px;font-size:50px;font-weight:700;margin-top:26px;text-shadow:0 4px 14px rgba(0,0,0,.7)}
.frow i,.mv i{display:inline-flex;align-items:center;justify-content:center;width:62px;height:62px;border-radius:50%;background:ACC2;color:#10241b;font-style:normal;font-weight:900;font-size:36px;flex:none}
.fkey{display:inline-block;margin-top:40px;font-size:46px;font-weight:800;color:#10241b;background:#3ee07a;padding:8px 30px;border-radius:14px}
.rchips{display:flex;flex-wrap:wrap;gap:20px;margin-top:40px;width:900px}
.rchips em{font-style:normal;font-size:58px;font-weight:800;background:rgba(10,24,40,.85);border:4px solid ACC;padding:12px 34px;border-radius:20px}
.moves{position:absolute;left:80px;top:80px;width:980px}
.mvl{margin-top:20px;display:grid;grid-template-columns:1fr;gap:8px}
.mv{display:flex;align-items:center;gap:18px;font-size:40px;font-weight:700;text-shadow:0 3px 12px rgba(0,0,0,.7)}
.mv i{width:50px;height:50px;font-size:28px}
.safe,.sub{position:absolute;left:80px;bottom:50px;white-space:nowrap;background:rgba(4,22,40,.94);font-size:42px;font-weight:700;padding:12px 36px;border-radius:16px}
.sub{background:#e63946;bottom:80px;font-size:48px}
.tm{position:absolute;left:56px;top:46px;width:250px;height:250px;border-radius:50%;background:rgba(0,0,0,.5)}
.tm svg{position:absolute;inset:0;width:250px;height:250px;transform:rotate(-90deg)}
.tbg{fill:none;stroke:rgba(255,255,255,.18);stroke-width:14}
.tfg{fill:none;stroke-width:14;stroke-linecap:round;stroke-dasharray:540}
.tm b{position:absolute;left:0;right:0;top:44px;text-align:center;font-size:118px;font-weight:800;line-height:1}
.tm span{position:absolute;left:0;right:0;top:168px;text-align:center;font-size:36px;font-weight:800;letter-spacing:3px}
.pg{position:absolute;right:60px;top:60px;width:470px;text-align:right;text-shadow:0 3px 12px rgba(0,0,0,.6)}
.pg span{font-size:40px;font-weight:700;background:rgba(4,22,40,.6);padding:2px 16px;border-radius:12px}
.dots{display:flex;justify-content:flex-end;gap:12px;margin-top:14px}
.dots i{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.35);border:3px solid rgba(255,255,255,.6)}
.dots i.on{background:#3ee07a;border-color:#3ee07a}
.dots i.cur{background:ACC2;border-color:#fff}
.name{position:absolute;left:56px;bottom:56px;background:rgba(4,22,40,.92);border-radius:16px;padding:16px 40px 20px 52px;overflow:hidden}
.nbar{position:absolute;left:0;top:0;bottom:0;width:16px;background:ACC;transform-origin:top}
.name b{display:block;font-size:66px;font-weight:800;line-height:1.1}
.chips{display:flex;gap:12px;margin-top:8px}
.chips em{font-style:normal;font-size:30px;font-weight:700;color:#062a3d;background:#bfeaff;padding:2px 16px;border-radius:10px}
.tip{position:absolute;right:56px;bottom:56px;display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.96);color:#10241b;font-size:40px;font-weight:800;padding:12px 30px;border-radius:50px;box-shadow:0 12px 30px rgba(0,0,0,.3)}
.xray{position:absolute;right:56px;top:250px;width:440px;background:rgba(10,24,40,.86);border-radius:26px;padding:18px 22px 20px;box-shadow:0 20px 50px rgba(0,0,0,.4);text-align:center}
.xh{font-size:34px;font-weight:900;letter-spacing:6px;color:ACC}
.xpv{width:396px;height:297px}
.stbox{position:relative;height:96px;margin-top:6px}
.st{position:absolute;left:0;right:0;top:0;height:96px;display:flex;align-items:center;justify-content:center;border-radius:18px;background:#3a4b5e;font-size:44px;font-weight:900;letter-spacing:1px;opacity:0;white-space:nowrap}
.st.up{background:#1688c9;box-shadow:0 0 30px rgba(46,196,255,.6)}
.reps{margin-top:12px;font-size:34px;font-weight:800;letter-spacing:2px;color:#cfe3f5}
.reps b{font-size:46px;color:ACC2;margin-left:8px}
.nexth{position:absolute;left:0;right:0;top:40px;text-align:center}
.nexth > span{display:block;font-size:52px;font-weight:800;color:ACC2;letter-spacing:6px}
.nexth b{display:block;margin:0 auto;max-width:1060px;font-size:74px;font-weight:900;text-shadow:0 6px 24px rgba(0,0,0,.6)}
.nbox{position:absolute;left:374px;top:282px;width:1172px;height:668px;background:#fff;border-radius:18px;box-shadow:0 30px 70px rgba(0,0,0,.5)}
.nwrap{position:absolute;left:384px;top:292px;width:1152px;height:648px;border-radius:12px;overflow:hidden}
.nvid{position:absolute;left:0;top:0;width:1152px;height:648px;object-fit:cover}
.cd{position:absolute;left:50%;top:50%;width:330px;height:330px;margin:-165px 0 0 -165px;border-radius:50%;background:rgba(62,224,122,.94);box-shadow:0 0 60px 20px rgba(62,224,122,.5);display:flex;align-items:center;justify-content:center;font-size:220px;font-weight:900;color:#0b3d24}
.cdring{position:absolute;left:50%;top:50%;width:330px;height:330px;margin:-165px 0 0 -165px;border-radius:50%;border:12px solid #3ee07a}
.gotxt{position:absolute;left:0;right:0;top:400px;text-align:center;font-size:200px;font-weight:900;color:ACC2;text-shadow:0 10px 40px rgba(0,0,0,.6)}
.wipe{position:absolute;left:-200px;top:-200px;width:1400px;height:1480px}
.wipe i{position:absolute;inset:0;background:linear-gradient(90deg,rgba(46,196,255,0),ACC 30%,ACC2 70%,rgba(255,210,31,0));transform:skewX(-18deg);opacity:.85}
.half{position:absolute;left:50%;top:50%;margin:-130px 0 0 -460px;width:920px;height:260px;border-radius:30px;background:#e63946;box-shadow:0 20px 60px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center}
.half span{font-size:150px;font-weight:900;letter-spacing:4px}
.done{position:absolute;left:80px;top:70px;width:1000px}
.dh{display:inline-block;font-size:72px;font-weight:900;color:#10241b;background:#3ee07a;padding:8px 34px;border-radius:16px;transform-origin:left center}
.cklist{margin-top:18px;display:grid;grid-template-columns:1fr;gap:6px}
.ck{display:flex;align-items:center;gap:14px;font-size:38px;font-weight:700;text-shadow:0 3px 12px rgba(0,0,0,.7)}
.ck i{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:#3ee07a;color:#0b3d24;font-style:normal;font-weight:900;font-size:30px;flex:none}
.goal{display:inline-block;margin-top:18px;font-size:38px;font-weight:800;color:#10241b;background:ACC2;padding:6px 26px;border-radius:12px}
""".replace("ACC2", ACC2).replace("ACC", ACC)
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
{JS}
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
