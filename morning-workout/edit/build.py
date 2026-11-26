"""Writes index.html for "Morning Stretch Routine for Seniors". Calm palette, own type style (Nunito / Nunito).
Intro 30 s, 8 x (10 s rest/next + 40 s work), outro 20 s.  python build.py"""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
INTRO, REST, WORK, OUTRO = 30.0, 10.0, 40.0, 20.0
HALF = 3
EX = [('overhead_reach', 'Seated Overhead Reach', 'Shoulders · Spine', 'Breathe in as you reach'),
      ('torso_twist_m', 'Gentle Torso Twist', 'Spine · Waist', 'Turn from your middle'),
      ('ankle_circles', 'Ankle Circles', 'Ankles · Calves', 'Slow, full circles'),
      ('cat_cow_m', 'Seated Cat-Cow', 'Spine · Back', 'Move with your breath'),
      ('shoulder_rolls_m', 'Shoulder Rolls', 'Shoulders · Neck', 'Big, slow circles'),
      ('sit_to_stand_m', 'Sit to Stand', 'Legs · Hips', 'Push through your heels'),
      ('standing_side_bend', 'Standing Side Bend', 'Side body', 'Hold the chair if needed'),
      ('standing_march_m', 'Easy Standing March', 'Legs · Heart', 'Swing your arms')]
RHY = {
    'overhead_reach': (4.4, [(0, 2.4, 'REACH UP', 1, 1.4, 'b'), (2.4, 4.4, 'LOWER', 0.2, 1.4, 'b')]),
    'torso_twist_m': (3.2, [(0, 0.8, 'TURN', 1, 0.8, 'b'), (0.8, 1.6, 'CENTER', 0.3, 0.8, 'b'), (1.6, 2.4, 'TURN', 1, 0.8, 'b'), (2.4, 3.2, 'CENTER', 0.3, 0.8, 'b')]),
    'ankle_circles': (3.2, [(0, 1.6, 'CIRCLE', 0.9, 0.8, 'b'), (1.6, 3.2, 'CIRCLE', 0.6, 0.8, 'b')]),
    'cat_cow_m': (5.0, [(0, 2.5, 'ROUND', 1, 1.2, 'b'), (2.5, 5.0, 'ARCH', 0.7, 1.2, 'b')]),
    'shoulder_rolls_m': (3.2, [(0, 1.6, 'UP AND BACK', 1, 1.2, 'b'), (1.6, 3.2, 'DOWN', 0.3, 1.2, 'b')]),
    'sit_to_stand_m': (3.4, [(0, 0.35, 'LEAN FORWARD', 0.4, 0.3, 'b'), (0.35, 1.85, 'STAND UP', 1, 1.0, 'b'), (1.85, 3.15, 'SIT SLOWLY', 0.5, 1.2, 'b'), (3.15, 3.4, 'SIT SLOWLY', 0.1, 0.25, 'b')]),
    'standing_side_bend': (6.4, [(0, 2.2, 'REACH OVER', 1, 1.1, 'b'), (2.2, 3.2, 'CENTER', 0.2, 0.8, 'b'), (3.2, 5.4, 'REACH OVER', 1, 1.1, 'b'), (5.4, 6.4, 'CENTER', 0.2, 0.8, 'b')]),
    'standing_march_m': (2.8, [(0, 0.9, 'RIGHT KNEE', 1, 0.5, 'b'), (0.9, 1.4, 'RIGHT KNEE', 0.4, 0.5, 'b'), (1.4, 2.3, 'LEFT KNEE', 1, 0.5, 'b'), (2.3, 2.8, 'LEFT KNEE', 0.4, 0.5, 'b')]),
}
ACC, ACC2 = "#7FB3D5", "#F4F1EA"
NR = 6
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
    T(f'tl.fromTo("#{tid} .tm",{{scale:0.6,opacity:0}},{{scale:1,opacity:1,duration:0.45,ease:"power3.out"}},{t0:.2f});')
    T(f'tl.fromTo("#{tid}r",{{strokeDashoffset:0}},{{strokeDashoffset:540,duration:{dur},ease:"none"}},{t0:.2f});')
    T(f'(()=>{{const o={{v:{dur}}};tl.fromTo(o,{{v:{dur}}},{{v:0.001,duration:{dur},ease:"none",onUpdate:()=>{{document.getElementById("{tid}n").textContent=Math.ceil(o.v);}}}},{t0:.2f});}})();')
def progress(pid, t0, dur, i):
    dots = "".join(f'<i class="{"on" if k < i else ("cur" if k == i else "")}"></i>' for k in range(N))
    items.append(clip(pid, t0, dur, f'<div class="pg"><span>Exercise {i + 1} of {N}</span><div class="dots">{dots}</div></div>', 12))

def core_svg(pid):
    """Meter outline with segments; cp() lights rows from the bottom up. Column 0 = his right side."""
    rows = ((238, 40, 96), (194, 38, 88), (152, 36, 80), (112, 34, 72), (74, 32, 64), (38, 30, 56)); cols = (200,)
    outline = '<path d="M172,6 L228,6 L234,30 C296,42 328,64 332,106 C328,168 312,230 300,294 L100,294 C88,230 72,168 68,106 C72,64 104,42 166,30 Z" fill="rgba(255,255,255,.04)" stroke="#F4F1EA" stroke-opacity=".35" stroke-width="4" stroke-linejoin="round"/>'
    def sx(r, c, cx): return cx + ((rows[r][3] if c == 0 else -rows[r][3]) if len(rows[r]) > 3 else 0)
    segs = "".join(f'<rect x="{sx(r, c, cx) - row[2] / 2}" y="{row[0]}" width="{row[2]}" height="{row[1]}" rx="16" fill="rgba(255,255,255,.10)"/><rect id="{pid}s{r}{c}" x="{sx(r, c, cx) - row[2] / 2}" y="{row[0]}" width="{row[2]}" height="{row[1]}" rx="16" fill="{ACC}" opacity="0"/>'
                   for r, row in enumerate(rows) for c, cx in enumerate(cols))
    return f'<svg viewBox="0 0 400 300" class="pv">{outline}{segs}</svg>'

# ---------- intro: live figure on the right, title on the left, then who it's for, before you start, today's moves
items.append(f'<div class="frame" id="wi"><video id="introvid" class="clip full" src="assets/clips/intro_live.mp4" muted playsinline data-start="0" data-duration="{INTRO:.2f}" data-track-index="1"></video></div>')
T(f'tl.fromTo("#wi",{{scale:1.30,x:300,y:110}},{{scale:1.36,x:300,y:110,duration:{INTRO},ease:"none"}},0);')
items.append(clip("shade", 0, INTRO, '<div class="lshade"></div>', 5))
items.append(clip("ttl", 0.2, 6.6,
    f'<div class="title left" id="ttli"><div class="t0" id="t0">GOOD MORNING · 7 MINUTES</div><div class="t1">{words("Morning", 0.6, "tw", 0.15)}</div>'
    f'<div class="t1 sm">{words("Stretch", 1.0, "tx", 0.15)}</div><div class="uline" id="ul"></div>'
    f'<div class="t2" id="t2">8 gentle moves to wake up</div>'
    f'<div class="t3" id="t3">Loosen stiff joints · start the day right</div></div>', 10))
T('tl.fromTo("#t0",{opacity:0,x:-40},{opacity:1,x:0,duration:0.5,ease:"expo.out"},0.3);')
T('tl.fromTo("#ul",{scaleX:0},{scaleX:1,duration:0.6,ease:"expo.out"},1.5);')
T('tl.fromTo("#t2",{opacity:0,y:30},{opacity:1,y:0,duration:0.5,ease:"expo.out"},1.9);')
T('tl.fromTo("#t3",{opacity:0},{opacity:1,duration:0.6},2.5);')
T('tl.to("#ttli",{opacity:0,x:-60,duration:0.4,ease:"power2.in"},6.4);')
# who it's for
chips = "".join(f'<em id="who{k}">{w}</em>' for k, w in enumerate(["Less stiffness", "More energy", "Easier movement", "Better mood"]))
items.append(clip("who", 6.6, 6.55, f'<div class="rlx" id="whoi"><div class="fh">WHY <b>MORNINGS?</b></div><div class="rchips">{chips}</div></div>', 10))
T('tl.fromTo("#whoi",{opacity:0,y:40},{opacity:1,y:0,duration:0.5,ease:"expo.out"},6.65);')
for k in range(4):
    T(f'tl.fromTo("#who{k}",{{opacity:0,scale:0.5}},{{opacity:1,scale:1,duration:0.4,ease:"power3.out"}},{7.0 + k * 0.3:.2f});')
T('tl.to("#whoi",{opacity:0,x:-60,duration:0.4,ease:"power2.in"},12.7);')
# before you start
tips = ["Sit near the front edge", "Slow, deep breaths", "Never bounce"]
rows = "".join(f'<div class="frow" id="bs{k}"><i>{k + 1}</i>{t}</div>' for k, t in enumerate(tips))
items.append(clip("bstart", 13.2, 5.2, f'<div class="find" id="bsi"><div class="fh">BEFORE YOU <b>START</b></div>{rows}</div>', 10))
T('tl.fromTo("#bsi",{opacity:0,y:40},{opacity:1,y:0,duration:0.5,ease:"expo.out"},13.25);')
for k in range(3):
    T(f'tl.fromTo("#bs{k}",{{opacity:0,x:-50}},{{opacity:1,x:0,duration:0.5,ease:"expo.out"}},{13.8 + k * 0.8:.2f});')
T('tl.to("#bsi",{opacity:0,x:-60,duration:0.4,ease:"power2.in"},18.0);')
# today's moves
rows = "".join(f'<div class="mv" id="mv{k}"><i>{k + 1}</i>{n}</div>' for k, (_, n, _, _) in enumerate(EX))
items.append(clip("moves", 18.5, INTRO - 18.7, f'<div class="moves"><div class="dh" id="mvh">TODAY\'S {N} MOVES</div><div class="mvl">{rows}</div></div>', 10))
T('tl.fromTo("#mvh",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.6,ease:"power3.out"},18.6);')
for k in range(N):
    T(f'tl.fromTo("#mv{k}",{{opacity:0,x:-40}},{{opacity:1,x:0,duration:0.4,ease:"expo.out"}},{19.3 + k * 0.35:.2f});')
items.append(clip("safe", 23.5, INTRO - 23.9, '<div class="safe" id="safei">Move gently · Stop if anything hurts</div>', 11))
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
    T(f'tl.fromTo("#nh{i}",{{opacity:0,scale:1.1}},{{opacity:1,scale:1,duration:0.6,ease:"expo.out"}},{rs + 0.1:.2f});')
    T(f'tl.fromTo(["#nbi{i}","#nvw{i}"],{{scale:0.94,opacity:0}},{{scale:1,opacity:1,duration:0.6,ease:"power3.out"}},{rs + 0.15:.2f});')
    timer(f"tr{i}", rs, REST, "REST", ACC2)
    progress(f"pr{i}", rs, REST, i)
    aud(f"vo_ex{i}", f"assets/voice/ex{i + 1:02d}.mp3", rs + 0.6)
    if i == HALF:   # halfway banner
        items.append(clip("half", rs + 0.2, 3.2, '<div class="half" id="halfi"><span>HALFWAY!</span></div>', 15))
        T(f'tl.fromTo("#halfi",{{scale:0.9,opacity:0}},{{scale:1,opacity:1,duration:0.5,ease:"power3.out"}},{rs + 0.2:.2f});')
        T(f'tl.to("#halfi",{{scale:1.3,opacity:0,duration:0.35,ease:"power2.in"}},{rs + 3.0:.2f});')
    for k in (3, 2, 1):
        t0 = ws - k
        items.append(clip(f"cd{i}_{k}", t0, 0.98, f'<div class="cdring" id="cr{i}_{k}"></div><div class="cd" id="cd{i}_{k}i">{k}</div>', 14))
        T(f'tl.fromTo("#cd{i}_{k}i",{{scale:1.12,opacity:0}},{{scale:1,opacity:1,duration:0.35,ease:"power3.out"}},{t0:.2f});')
        T(f'tl.fromTo("#cr{i}_{k}",{{scale:1,opacity:0.8}},{{scale:1.35,opacity:0,duration:0.8,ease:"power2.out"}},{t0:.2f});')
        aud(f"bp{i}_{k}", "assets/sfx/beep.wav", t0 + 0.02, 0.5)
    aud(f"go{i}", "assets/sfx/go.wav", ws + 0.02, 0.55)
    # work
    items.append(f'<video id="wv{i}" class="clip full" src="assets/clips/{key}_work.mp4" muted playsinline data-start="{ws:.2f}" data-duration="{WORK:.2f}" data-track-index="2" style="z-index:2"></video>')
    items.append(clip(f"wipe{i}", ws - 0.05, 0.75, f'<div class="wipe" id="wp{i}"><i></i></div>', 16))
    T(f'tl.fromTo("#wp{i}",{{x:-2600}},{{x:2600,duration:0.7,ease:"power2.inOut"}},{ws - 0.05:.2f});')
    items.append(clip(f"go{i}t", ws + 0.1, 0.9, f'<div class="gotxt" id="go{i}ti">GO!</div>', 14))
    T(f'tl.fromTo("#go{i}ti",{{scale:0.5,opacity:0}},{{scale:1,opacity:1,duration:0.3,ease:"power3.out"}},{ws + 0.1:.2f});')
    T(f'tl.to("#go{i}ti",{{opacity:0,scale:1.3,duration:0.3}},{ws + 0.65:.2f});')
    timer(f"tw{i}", ws, WORK, "WORK", ACC)
    progress(f"pw{i}", ws, WORK, i)
    chips = "".join(f'<em id="mc{i}_{k}">{m}</em>' for k, m in enumerate(muscles.split(" · ")))
    items.append(clip(f"nm{i}", ws + 0.4, WORK - 0.7, f'<div class="name" id="nm{i}i"><div class="nbar" id="nb{i}"></div><b>{name}</b><div class="chips">{chips}</div></div>', 11))
    T(f'tl.fromTo("#nm{i}i",{{opacity:0,x:-80}},{{opacity:1,x:0,duration:0.6,ease:"expo.out"}},{ws + 0.45:.2f});')
    T(f'tl.fromTo("#nb{i}",{{scaleY:0}},{{scaleY:1,duration:0.5,ease:"expo.out"}},{ws + 0.6:.2f});')
    for k in range(len(muscles.split(" · "))):
        T(f'tl.fromTo("#mc{i}_{k}",{{opacity:0,y:14}},{{opacity:1,y:0,duration:0.35,ease:"power3.out"}},{ws + 0.9 + k * 0.12:.2f});')
    # leg panel: leg meter + move cue + reps, driven by one proxy (seek-safe)
    loop, segs = RHY[key]
    labels = list(dict.fromkeys(s[2] for s in segs))
    lab_html = "".join(f'<div class="st{" up" if max(s[3] for s in segs if s[2] == l) >= 0.5 else ""}" id="st{i}_{k}">{l}</div>' for k, l in enumerate(labels))
    items.append(clip(f"xr{i}", ws + 0.6, WORK - 0.9, f'<div class="xray" id="xr{i}i"><div class="xh">STRETCH</div><div class="xpv">{core_svg(f"p{i}")}</div>'
                      f'<div class="stbox">{lab_html}</div><div class="reps">REPS <b id="rp{i}">0</b></div></div>', 11))
    T(f'tl.fromTo("#xr{i}i",{{opacity:0,x:120}},{{opacity:1,x:0,duration:0.6,ease:"expo.out"}},{ws + 0.65:.2f});')
    js = []
    for k, s in enumerate(segs):   # label start = start of the run of segments sharing this label, so it doesn't blink
        j = k
        while j > 0 and segs[j - 1][2] == s[2]: j -= 1
        js.append([s[0], s[1], labels.index(s[2]), s[3], s[4], segs[j][0], s[5]])
    jsdata.append({"i": i, "T": loop, "segs": js, "n": len(labels)})
    T(f'(()=>{{const o={{t:0}};tl.fromTo(o,{{t:0}},{{t:{WORK},duration:{WORK},ease:"none",onUpdate:()=>work({i},o.t)}},{ws:.2f});}})();')
    items.append(clip(f"tip{i}", ws + 13, 6.5, f'<div class="tip" id="tp{i}"><svg viewBox="0 0 24 24" width="46" height="46"><circle cx="12" cy="12" r="10" fill="{ACC}"/><path d="M12 6v8M12 17v1" stroke="#10241b" stroke-width="2.6" stroke-linecap="round"/></svg><span>{tip}</span></div>', 12))
    T(f'tl.fromTo("#tp{i}",{{opacity:0,x:80}},{{opacity:1,x:0,duration:0.5,ease:"expo.out"}},{ws + 13.05:.2f});')
    T(f'tl.to("#tp{i}",{{opacity:0,x:60,duration:0.3,ease:"power2.in"}},{ws + 19.1:.2f});')
    aud(f"vo_ten{i}", "assets/voice/ten.mp3", ws + WORK - 10.5)
    aud(f"bell{i}", "assets/sfx/bell.wav", we - 0.1, 0.5)

# ---------- outro: checklist
items.append(f'<div class="frame" id="wo"><img id="outimg" class="clip full" src="assets/clips/idle.jpg" data-start="{OUT_START:.2f}" data-duration="{OUTRO:.2f}" data-track-index="1" alt=""></div>')
T(f'tl.fromTo("#wo",{{scale:1.22,x:190,y:70}},{{scale:1.18,x:190,y:70,duration:{OUTRO},ease:"none"}},{OUT_START:.2f});')
items.append(clip("oshade", OUT_START, OUTRO, '<div class="lshade"></div>', 5))
rows = "".join(f'<div class="ck" id="ck{k}"><i id="cki{k}">&#10003;</i>{n}</div>' for k, (_, n, _, _) in enumerate(EX))
items.append(clip("end", OUT_START + 0.2, OUTRO - 0.2, f'<div class="done"><div class="dh" id="dh">WORKOUT COMPLETE!</div><div class="cklist">{rows}</div>'
                  f'<div class="goal" id="goal">Every morning</div></div><div class="sub" id="e3">Like &amp; Subscribe for more</div>', 10))
T(f'tl.fromTo("#dh",{{opacity:0,scale:0.7}},{{opacity:1,scale:1,duration:0.6,ease:"power3.out"}},{OUT_START + 0.3:.2f});')
for k in range(N):
    T(f'tl.fromTo("#ck{k}",{{opacity:0,x:-40}},{{opacity:1,x:0,duration:0.35,ease:"expo.out"}},{OUT_START + 1.2 + k * 0.3:.2f});')
    T(f'tl.fromTo("#cki{k}",{{scale:0}},{{scale:1,duration:0.35,ease:"power3.out"}},{OUT_START + 1.35 + k * 0.3:.2f});')
T(f'tl.fromTo("#goal",{{opacity:0,y:20}},{{opacity:1,y:0,duration:0.5,ease:"expo.out"}},{OUT_START + 4.4:.2f});')
T(f'tl.fromTo("#e3",{{opacity:0,y:30}},{{opacity:1,y:0,duration:0.6,ease:"expo.out"}},{OUT_START + 8:.2f});')
aud("vo_outro", "assets/voice/outro.mp3", OUT_START + 0.6)

# music: one continuous upbeat bed (three tracks crossfaded), under the voice
audio.append(f'<audio id="music" class="clip" src="assets/music/bed.wav" data-start="0" data-duration="{DUR:.2f}" data-volume="0.16" data-fade-in="1.5" data-fade-out="3" data-track-index="21"></audio>')

JS = """
const RH = %s;
function cp(id, lv){
  for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) {
    const a = Math.max(0, Math.min(1, lv[c] * 6 - r)).toFixed(3);
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
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000;font-family:"Poppins",sans-serif;color:#F4F1EA}
.frame{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}
.full{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}
.w{display:inline-block}
.lshade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,10,12,.70) 0%,rgba(10,10,12,.38) 45%,rgba(10,10,12,0) 66%)}
.title.left{position:absolute;left:80px;top:150px;width:1000px}
.t0{display:inline-block;font-size:38px;font-weight:700;color:#16181C;background:ACC;padding:6px 22px;border-radius:10px;letter-spacing:3px}
.t1{font-size:168px;font-weight:800;line-height:1.0;margin-top:16px;letter-spacing:-2px}
.t1 .w{color:ACC}
.t1.sm{font-size:100px;margin-top:0;letter-spacing:-1px}.t1.sm .w{color:#F4F1EA}
.uline{width:500px;height:6px;background:ACC;border-radius:3px;margin:18px 0 22px;transform-origin:left}
.t2{display:inline-block;font-size:44px;font-weight:700;color:#F4F1EA;background:rgba(22,24,28,.82);border:1px solid rgba(255,255,255,.10);padding:8px 26px;border-radius:12px;white-space:nowrap}
.t3{margin-top:22px;font-size:38px;font-weight:500;color:#B8B2A7}
.find,.rlx{position:absolute;left:80px;top:150px;width:960px}
.fh{font-size:62px;font-weight:800;line-height:1.1}
.fh b{color:ACC}
.pv{width:100%;height:100%;overflow:visible}
.frow{display:flex;align-items:center;gap:18px;font-size:46px;font-weight:600;margin-top:26px}
.frow i,.mv i{display:inline-flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:50%;background:rgba(22,24,28,.6);border:2px solid ACC;color:#F4F1EA;font-style:normal;font-weight:700;font-size:30px;flex:none}
.rchips{display:flex;flex-wrap:wrap;gap:18px;margin-top:40px;width:920px}
.rchips em{font-style:normal;font-size:50px;font-weight:700;background:rgba(22,24,28,.82);border:1px solid rgba(255,255,255,.10);border-left:8px solid ACC;padding:12px 32px;border-radius:12px}
.moves{position:absolute;left:80px;top:80px;width:980px}
.mvl{margin-top:22px;display:grid;grid-template-columns:1fr;gap:8px}
.mv{display:flex;align-items:center;gap:18px;font-size:38px;font-weight:600}
.mv i{width:48px;height:48px;font-size:24px}
.safe,.sub{position:absolute;left:80px;bottom:50px;white-space:nowrap;background:rgba(22,24,28,.82);border:1px solid rgba(255,255,255,.10);font-size:38px;font-weight:600;padding:12px 34px;border-radius:14px}
.sub{background:#F4F1EA;color:#16181C;border:none;bottom:80px;font-size:44px;font-weight:700}
.tm{position:absolute;left:56px;top:46px;width:240px;height:240px;border-radius:50%;background:rgba(22,24,28,.72)}
.tm svg{position:absolute;inset:0;width:240px;height:240px;transform:rotate(-90deg)}
.tbg{fill:none;stroke:rgba(255,255,255,.14);stroke-width:10}
.tfg{fill:none;stroke-width:10;stroke-linecap:round;stroke-dasharray:540}
.tm b{position:absolute;left:0;right:0;top:42px;text-align:center;font-size:110px;font-weight:700;line-height:1}
.tm span{position:absolute;left:0;right:0;top:160px;text-align:center;font-size:30px;font-weight:700;letter-spacing:5px}
.pg{position:absolute;right:60px;top:60px;width:470px;text-align:right}
.pg span{font-size:36px;font-weight:600;background:rgba(22,24,28,.82);padding:4px 18px;border-radius:10px}
.dots{display:flex;justify-content:flex-end;gap:12px;margin-top:16px}
.dots i{width:24px;height:24px;border-radius:50%;background:rgba(22,24,28,.5);border:2px solid rgba(255,255,255,.55)}
.dots i.on{background:#F4F1EA;border-color:#F4F1EA}
.dots i.cur{background:ACC;border-color:ACC}
.name{position:absolute;left:56px;bottom:56px;background:rgba(22,24,28,.82);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:16px 40px 20px 48px;overflow:hidden}
.nbar{position:absolute;left:0;top:0;bottom:0;width:10px;background:ACC;transform-origin:top}
.name b{display:block;font-size:62px;font-weight:700;line-height:1.1}
.chips{display:flex;gap:10px;margin-top:8px}
.chips em{font-style:normal;font-size:28px;font-weight:600;color:#F4F1EA;background:rgba(255,255,255,.12);padding:2px 14px;border-radius:8px}
.tip{position:absolute;right:56px;bottom:56px;display:flex;align-items:center;gap:16px;background:rgba(244,241,234,.95);color:#16181C;font-size:38px;font-weight:700;padding:12px 30px;border-radius:40px;box-shadow:0 10px 26px rgba(0,0,0,.25)}
.xray{position:absolute;right:56px;top:250px;width:440px;background:rgba(22,24,28,.82);border:1px solid rgba(255,255,255,.10);border-radius:22px;padding:18px 22px 20px;text-align:center}
.xh{font-size:28px;font-weight:700;letter-spacing:5px;color:#B8B2A7}
.xpv{width:396px;height:297px}
.stbox{position:relative;height:92px;margin-top:6px}
.st{position:absolute;left:0;right:0;top:0;height:92px;display:flex;align-items:center;justify-content:center;border-radius:16px;background:rgba(255,255,255,.08);color:#F4F1EA;font-size:40px;font-weight:800;letter-spacing:1px;opacity:0;white-space:nowrap}
.st.up{background:ACC;color:#16181C}
.reps{margin-top:12px;font-size:30px;font-weight:700;letter-spacing:3px;color:#B8B2A7}
.reps b{font-size:42px;color:#F4F1EA;margin-left:8px}
.nexth{position:absolute;left:0;right:0;top:40px;text-align:center}
.nexth > span{display:block;font-size:44px;font-weight:700;color:ACC;letter-spacing:8px}
.nexth b{display:block;margin:0 auto;max-width:980px;font-size:64px;font-weight:800}
.nbox{position:absolute;left:374px;top:282px;width:1172px;height:668px;background:#F4F1EA;border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.45)}
.nwrap{position:absolute;left:384px;top:292px;width:1152px;height:648px;border-radius:10px;overflow:hidden}
.nvid{position:absolute;left:0;top:0;width:1152px;height:648px;object-fit:cover}
.cd{position:absolute;left:50%;top:50%;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;background:rgba(22,24,28,.86);border:6px solid ACC;display:flex;align-items:center;justify-content:center;font-size:190px;font-weight:700;color:#F4F1EA}
.cdring{position:absolute;left:50%;top:50%;width:300px;height:300px;margin:-150px 0 0 -150px;border-radius:50%;border:3px solid ACC}
.gotxt{position:absolute;left:0;right:0;top:410px;text-align:center;font-size:180px;font-weight:800;color:#F4F1EA;text-shadow:0 8px 30px rgba(0,0,0,.5)}
.wipe{display:none}
.half{position:absolute;left:50%;top:50%;margin:-120px 0 0 -420px;width:840px;height:240px;border-radius:24px;background:rgba(22,24,28,.82);border:2px solid ACC;display:flex;align-items:center;justify-content:center}
.half span{font-size:120px;font-weight:800;letter-spacing:6px;color:#F4F1EA}
.done{position:absolute;left:80px;top:70px;width:1000px}
.dh{display:inline-block;font-size:66px;font-weight:800;color:#16181C;background:ACC;padding:8px 32px;border-radius:14px;transform-origin:left center}
.cklist{margin-top:18px;display:grid;grid-template-columns:1fr;gap:6px}
.ck{display:flex;align-items:center;gap:14px;font-size:36px;font-weight:600}
.ck i{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:ACC;color:#16181C;font-style:normal;font-weight:800;font-size:26px;flex:none}
.goal{display:inline-block;margin-top:18px;font-size:36px;font-weight:700;color:#F4F1EA;background:rgba(22,24,28,.82);border:1px solid rgba(255,255,255,.10);padding:6px 24px;border-radius:12px}
@font-face{font-family:"Nunito";src:url("assets/fonts/Nunito.ttf") format("truetype");font-weight:100 900}
#root{font-family:"Nunito",sans-serif}
.t0,.t1,.fh,.dh,.name b,.nexth b,.nexth > span,.half span,.cd,.gotxt,.tm b,.st,.xh,.rchips em,.goal,.sub,.t2{font-family:"Nunito",sans-serif}
.t1{font-weight:900;letter-spacing:-1px}.t1.sm{font-weight:800}
.t0,.t2,.rchips em,.name,.safe,.sub,.goal,.dh,.st,.pg span,.chips em,.tip{border-radius:999px}
.xray{border-radius:40px}.name{padding-left:56px}.nbar{width:14px}
.fh,.dh,.name b,.nexth b{font-weight:800}.rchips em{border-left:2px solid #7FB3D5;padding:12px 40px}
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
