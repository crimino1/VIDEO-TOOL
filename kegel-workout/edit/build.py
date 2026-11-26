"""Writes index.html for "Kegel Exercises for Men and Women".
Intro 36 s (live figure, how to find the pelvic floor, today's moves), 8 x (15 s rest/next + 45 s work), outro 20 s.
During work an x-ray panel shows the pelvic floor lifting and relaxing in time with the figure, with a big
SQUEEZE / RELAX cue, a rep counter and a soft glow on the figure's pelvis.  python build.py"""
import json
from pathlib import Path
HERE = Path(__file__).resolve().parent
INTRO, REST, WORK, OUTRO = 36.0, 15.0, 45.0, 20.0
PELVIS = (925, 615)            # pelvic floor in the seated work frame (render coords)
EX = [("breathing_kegel", "Belly Breathing Kegel", "Pelvic floor · Breathing", "Belly rises as you breathe in"),
      ("basic_kegel", "Basic Kegel Hold", "Pelvic floor", "Don't hold your breath"),
      ("pelvic_tilt", "Seated Pelvic Tilt", "Pelvic floor · Lower abs", "Small movement, gentle squeeze"),
      ("quick_flicks", "Quick Flicks", "Pelvic floor · Fast fibres", "Squeeze fast, let go fully"),
      ("knee_squeeze", "Inner Thigh Squeeze", "Pelvic floor · Inner thighs", "Lift up and in, never push down"),
      ("elevator", "Elevator Kegel", "Pelvic floor · Control", "Slow, one floor at a time"),
      ("knee_opener", "Seated Knee Opener", "Pelvic floor · Glutes", "Keep your back tall"),
      ("sit_to_stand", "Sit to Stand + Squeeze", "Pelvic floor · Legs · Glutes", "Lift as you stand up")]
# squeeze rhythm per exercise, in loop seconds (matches the pose loops in chair_ex.py):
# (loop length, [(start, end, label, level, ramp seconds)], squeeze/relax voice cue times for the first cycles)
RHY = {
    "breathing_kegel": (8.0, [(0, 4, "BREATHE IN", 0, 0.8), (4, 8, "OUT · SQUEEZE", 1, 0.8)], [(4, "s"), (8, "r"), (12, "s"), (16, "r")]),
    "basic_kegel": (6.0, [(0, 3, "SQUEEZE", 1, 0.5), (3, 6, "RELAX", 0, 0.5)], [(0.25, "s"), (3, "r"), (6, "s"), (9, "r")]),
    "pelvic_tilt": (4.0, [(0, 2, "SQUEEZE", 1, 0.6), (2, 4, "RELAX", 0, 0.6)], [(0.25, "s"), (2, "r"), (4, "s"), (6, "r")]),
    "quick_flicks": (2.0, [(0, 1, "SQUEEZE", 1, 0.2), (1, 2, "RELAX", 0, 0.2)], []),
    "knee_squeeze": (4.0, [(0, 2.6, "SQUEEZE", 1, 0.6), (2.6, 4, "RELAX", 0, 0.5)], [(0.25, "s"), (2.6, "r"), (4.2, "s"), (6.6, "r")]),
    "elevator": (8.0, [(0, 1, "FLOOR 1", 0.33, 0.4), (1, 2, "FLOOR 2", 0.66, 0.4), (2, 4, "TOP · HOLD", 1, 0.4),
                       (4, 7, "LOWER SLOWLY", 0, 3.0), (7, 8, "RELAX", 0, 0.3)], []),
    "knee_opener": (4.0, [(0, 1.6, "SQUEEZE", 1, 0.6), (1.6, 4, "RELAX", 0, 0.8)], [(0.25, "s"), (1.6, "r"), (4.2, "s"), (5.6, "r")]),
    "sit_to_stand": (3.4, [(0, 0.3, "RELAX", 0, 0.3), (0.3, 1.9, "SQUEEZE", 1, 0.5), (1.9, 3.4, "RELAX", 0, 0.6)], []),
}
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

def pelvis_svg(pid):
    """Front view: two hip bones and the sacrum, with the pelvic floor sling hanging between them.
    pv() bends the sling path #{pid}h upward as it lifts; #{pid}a arrows fade in."""
    bone = 'fill="url(#' + pid + 'b)" stroke="#8a6f47" stroke-width="4" stroke-linejoin="round" fill-rule="evenodd"'
    return (f'<svg viewBox="0 0 400 320" class="pv"><defs>'
            f'<linearGradient id="{pid}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf1dc"/><stop offset="1" stop-color="#d8c19b"/></linearGradient>'
            f'<radialGradient id="{pid}g"><stop offset="0" stop-color="#ff5470" stop-opacity=".9"/><stop offset="1" stop-color="#ff5470" stop-opacity="0"/></radialGradient></defs>'
            f'<path d="M168,66 L232,66 C230,118 218,160 200,190 C182,160 170,118 168,66 Z" fill="#d6bf96" stroke="#8a6f47" stroke-width="4" stroke-linejoin="round"/>'
            f'<path d="M40,46 C78,34 136,46 166,88 C178,118 172,150 162,176 C156,200 160,222 166,244 C162,266 140,276 120,266 C100,254 98,224 108,198 C78,172 44,122 40,46 Z M133,206 C142,206 147,218 147,230 C147,242 141,250 133,250 C125,250 119,242 119,230 C119,218 124,206 133,206 Z" {bone}/><path d="M360,46 C322,34 264,46 234,88 C222,118 228,150 238,176 C244,200 240,222 234,244 C238,266 260,276 280,266 C300,254 302,224 292,198 C322,172 356,122 360,46 Z M267,206 C258,206 253,218 253,230 C253,242 259,250 267,250 C275,250 281,242 281,230 C281,218 276,206 267,206 Z" {bone}/>'
            f'<ellipse id="{pid}gl" cx="200" cy="262" rx="105" ry="48" fill="url(#{pid}g)" opacity=".2"/>'
            f'<path id="{pid}h" d="M150,250 Q200,300 250,250" fill="none" stroke="#e8304f" stroke-width="26" stroke-linecap="round"/>'
            f'<path id="{pid}f" d="M150,250 Q200,300 250,250" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 9"/>'
            f'<g id="{pid}a" opacity="0" fill="#ffd21f"><path d="M168,318 L168,300 L156,300 L176,280 L196,300 L184,300 L184,318 Z"/><path d="M216,318 L216,300 L204,300 L224,280 L244,300 L232,300 L232,318 Z"/></g>'
            f'</svg>')

# ---------- intro: live figure on the right, title on the left, then how-to-find and today's moves
items.append(f'<div class="frame" id="wi"><video id="introvid" class="clip full" src="assets/clips/intro_live.mp4" muted playsinline data-start="0" data-duration="{INTRO:.2f}" data-track-index="1"></video></div>')
T(f'tl.fromTo("#wi",{{scale:1.30,x:300,y:110}},{{scale:1.36,x:300,y:110,duration:{INTRO},ease:"none"}},0);')
items.append(clip("shade", 0, INTRO, '<div class="lshade"></div>', 5))
items.append(clip("ttl", 0.2, 6.9,
    f'<div class="title left" id="ttli"><div class="t0" id="t0">PELVIC FLOOR WORKOUT</div><div class="t1">{words("KEGEL", 0.6, "tw", 0.15)}</div>'
    f'<div class="t1 sm">{words("EXERCISES", 1.0, "tx")}</div><div class="uline" id="ul"></div>'
    f'<div class="t2" id="t2">for Men <i class="sym m">&#9794;</i> &amp; Women <i class="sym f">&#9792;</i></div>'
    f'<div class="t3" id="t3">8 moves · 8 minutes · just a chair</div></div>', 10))
T('tl.fromTo("#t0",{opacity:0,x:-40},{opacity:1,x:0,duration:0.5,ease:"expo.out"},0.3);')
T('tl.fromTo("#ul",{scaleX:0},{scaleX:1,duration:0.6,ease:"expo.out"},1.4);')
T('tl.fromTo("#t2",{opacity:0,y:30},{opacity:1,y:0,duration:0.5,ease:"expo.out"},1.8);')
T('tl.fromTo("#t3",{opacity:0},{opacity:1,duration:0.6},2.4);')
T('tl.to("#ttli",{opacity:0,x:-60,duration:0.4,ease:"power2.in"},6.65);')
# how to find it (voice ~6.5-14 s)
items.append(clip("find", 7.0, 8.7,
    f'<div class="find" id="findi"><div class="fh">HOW TO FIND YOUR <b>PELVIC FLOOR</b></div><div class="fpv">{pelvis_svg("ip")}</div>'
    f'<div class="frow" id="fr0"><i>1</i>Imagine stopping the flow of urine</div><div class="frow" id="fr1"><i>2</i>Or holding in gas</div>'
    f'<div class="fkey" id="fk">That squeeze &amp; lift = a Kegel</div></div>', 10))
T('tl.fromTo("#findi",{opacity:0,y:40},{opacity:1,y:0,duration:0.6,ease:"expo.out"},7.05);')
T('tl.fromTo("#fr0",{opacity:0,x:-50},{opacity:1,x:0,duration:0.5,ease:"expo.out"},8.4);')
T('tl.fromTo("#fr1",{opacity:0,x:-50},{opacity:1,x:0,duration:0.5,ease:"expo.out"},10.6);')
T('tl.fromTo("#fk",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.5,ease:"back.out(2)"},12.4);')
T('tl.to("#findi",{opacity:0,x:-60,duration:0.4,ease:"power2.in"},15.3);')
T('(()=>{const o={t:0};tl.fromTo(o,{t:0},{t:8.7,duration:8.7,ease:"none",onUpdate:()=>{const c=(o.t%2.6)/2.6;const l=c<0.45?Math.sin(Math.PI*c/0.9):Math.max(0,Math.cos(Math.PI*(c-0.45)/1.1));pv("ip",l);}},7.0);})();')
# keep these relaxed (voice ~14-18.5 s)
chips = "".join(f'<em id="rx{k}">{w}</em>' for k, w in enumerate(["Belly", "Thighs", "Buttocks"]))
items.append(clip("relax", 15.7, 6.6, f'<div class="rlx" id="rlxi"><div class="fh">KEEP THESE <b>RELAXED</b></div><div class="rchips">{chips}</div><div class="fkey" id="br">Keep breathing the whole time</div></div>', 10))
T('tl.fromTo("#rlxi",{opacity:0,y:40},{opacity:1,y:0,duration:0.5,ease:"expo.out"},15.75);')
for k in range(3):
    T(f'tl.fromTo("#rx{k}",{{opacity:0,scale:0.5}},{{opacity:1,scale:1,duration:0.4,ease:"back.out(2.2)"}},{16.3 + k * 0.45:.2f});')
T('tl.fromTo("#br",{opacity:0,y:20},{opacity:1,y:0,duration:0.5,ease:"expo.out"},18.2);')
T('tl.to("#rlxi",{opacity:0,x:-60,duration:0.4,ease:"power2.in"},21.9);')
# today's moves
rows = "".join(f'<div class="mv" id="mv{k}"><i>{k + 1}</i>{n}</div>' for k, (_, n, _, _) in enumerate(EX))
items.append(clip("moves", 22.4, INTRO - 22.6, f'<div class="moves"><div class="dh" id="mvh">TODAY\'S 8 MOVES</div><div class="mvl">{rows}</div></div>', 10))
T('tl.fromTo("#mvh",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.6,ease:"back.out(1.6)"},22.5);')
for k in range(N):
    T(f'tl.fromTo("#mv{k}",{{opacity:0,x:-40}},{{opacity:1,x:0,duration:0.4,ease:"expo.out"}},{23.3 + k * 0.4:.2f});')
items.append(clip("safe", 28.5, INTRO - 28.9, '<div class="safe" id="safei">Never hold your breath · Stop if anything hurts</div>', 11))
T('tl.fromTo("#safei",{opacity:0,y:20},{opacity:1,y:0,duration:0.5,ease:"expo.out"},28.55);')
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
    if key != "sit_to_stand":   # the pelvis moves in sit to stand; glow only where it stays put
        items.append(clip(f"glw{i}", ws, WORK, f'<div class="glow" id="gl{i}" style="left:{PELVIS[0] - 130}px;top:{PELVIS[1] - 52}px"></div>', 3))
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
    # x-ray panel: pelvic floor + squeeze cue + reps, driven by one proxy (seek-safe)
    loop, segs, cues = RHY[key]
    labels = list(dict.fromkeys(s[2] for s in segs))
    lab_html = "".join(f'<div class="st{" up" if any(s[3] > 0 for s in segs if s[2] == l) else ""}" id="st{i}_{k}">{l}</div>' for k, l in enumerate(labels))
    items.append(clip(f"xr{i}", ws + 0.6, WORK - 0.9, f'<div class="xray" id="xr{i}i"><div class="xh">PELVIC FLOOR</div><div class="xpv">{pelvis_svg(f"p{i}")}</div>'
                      f'<div class="stbox">{lab_html}</div><div class="reps">REPS <b id="rp{i}">0</b></div></div>', 11))
    T(f'tl.fromTo("#xr{i}i",{{opacity:0,x:120}},{{opacity:1,x:0,duration:0.6,ease:"expo.out"}},{ws + 0.65:.2f});')
    jsdata.append({"i": i, "T": loop, "segs": [[s[0], s[1], labels.index(s[2]), s[3], s[4]] for s in segs], "n": len(labels), "glow": key != "sit_to_stand"})
    T(f'(()=>{{const o={{t:0}};tl.fromTo(o,{{t:0}},{{t:{WORK},duration:{WORK},ease:"none",onUpdate:()=>work({i},o.t)}},{ws:.2f});}})();')
    for t, c in cues:
        aud(f"cue{i}_{int(t * 100)}", f"assets/voice/{'squeeze' if c == 's' else 'relax'}.mp3", ws + t, 0.9)
    items.append(clip(f"tip{i}", ws + 13, 6.5, f'<div class="tip" id="tp{i}"><svg viewBox="0 0 24 24" width="46" height="46"><circle cx="12" cy="12" r="10" fill="#ffd21f"/><path d="M12 6v8M12 17v1" stroke="#10241b" stroke-width="2.6" stroke-linecap="round"/></svg><span>{tip}</span></div>', 12))
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
                  f'<div class="goal" id="goal">Do it every day · results in 4 to 6 weeks</div></div><div class="sub" id="e3">Like &amp; Subscribe for more</div>', 10))
T(f'tl.fromTo("#dh",{{opacity:0,scale:0.7}},{{opacity:1,scale:1,duration:0.6,ease:"back.out(1.6)"}},{OUT_START + 0.3:.2f});')
for k in range(N):
    T(f'tl.fromTo("#ck{k}",{{opacity:0,x:-40}},{{opacity:1,x:0,duration:0.35,ease:"expo.out"}},{OUT_START + 1.2 + k * 0.3:.2f});')
    T(f'tl.fromTo("#cki{k}",{{scale:0}},{{scale:1,duration:0.35,ease:"back.out(2.5)"}},{OUT_START + 1.35 + k * 0.3:.2f});')
T(f'tl.fromTo("#goal",{{opacity:0,y:20}},{{opacity:1,y:0,duration:0.5,ease:"expo.out"}},{OUT_START + 4.4:.2f});')
T(f'tl.fromTo("#e3",{{opacity:0,y:30}},{{opacity:1,y:0,duration:0.6,ease:"expo.out"}},{OUT_START + 9:.2f});')
aud("vo_outro", "assets/voice/outro.mp3", OUT_START + 0.6)

# music: one continuous calm bed (three tracks crossfaded), under the voice
audio.append(f'<audio id="music" class="clip" src="assets/music/bed.wav" data-start="0" data-duration="{DUR:.2f}" data-volume="0.17" data-fade-in="1.5" data-fade-out="3" data-track-index="21"></audio>')

JS = """
const RH = %s;
function pv(id, l){
  const h = document.getElementById(id + "h"); if (!h) return;
  const d = `M150,250 Q200,${(300 - 66 * l).toFixed(1)} 250,250`; h.setAttribute("d", d); document.getElementById(id + "f").setAttribute("d", d);
  document.getElementById(id + "a").setAttribute("opacity", Math.max(0, Math.min(1, l * 1.4 - 0.2)).toFixed(3));
  document.getElementById(id + "gl").setAttribute("opacity", (0.15 + 0.75 * l).toFixed(3));
}
function work(i, t){
  const r = RH[i]; const lt = t %% r.T; const S = r.segs;
  let k = 0; while (k < S.length - 1 && lt >= S[k][1]) k++;
  const prev = S[(k + S.length - 1) %% S.length][3];
  const u = Math.min(1, (lt - S[k][0]) / S[k][4]); const e = 0.5 - 0.5 * Math.cos(Math.PI * u);
  const l = prev + (S[k][3] - prev) * e;
  pv("p" + i, l);
  for (let j = 0; j < r.n; j++) { const el = document.getElementById(`st${i}_${j}`); const on = j === S[k][2];
    const a = on ? Math.min(1, (lt - S[k][0]) / 0.15) : 0; el.style.opacity = a.toFixed(3); el.style.transform = `scale(${on ? 0.85 + 0.15 * Math.min(1, (lt - S[k][0]) / 0.25) : 0.85})`; }
  const first = S.findIndex(s => s[3] > 0); const reps = Math.floor(t / r.T) + (lt >= S[first][0] ? 1 : 0);
  document.getElementById("rp" + i).textContent = reps;
  if (r.glow) document.getElementById("gl" + i).style.opacity = (0.08 + 0.62 * l).toFixed(3);
}
""" % json.dumps({d["i"]: d for d in jsdata})

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#000}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000;font-family:"Poppins",sans-serif;color:#fff}
.frame{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}
.full{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}
.w{display:inline-block}
.lshade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.62) 0%,rgba(0,0,0,.32) 45%,rgba(0,0,0,0) 66%)}
.title.left{position:absolute;left:80px;top:150px;width:1000px}
.t0{display:inline-block;font-size:44px;font-weight:800;color:#10241b;background:#3ee07a;padding:6px 26px;border-radius:12px;letter-spacing:2px}
.t1{font-size:170px;font-weight:900;line-height:1.0;margin-top:14px;text-shadow:0 8px 30px rgba(0,0,0,.5)}
.t1 .w{color:#ff5c7a}
.t1.sm{font-size:100px;margin-top:0}.t1.sm .w{color:#fff}
.uline{width:560px;height:14px;background:#ffd21f;border-radius:7px;margin:14px 0 18px;transform-origin:left}
.t2{display:inline-flex;align-items:center;gap:12px;font-size:52px;font-weight:800;color:#10241b;background:#ffd21f;padding:6px 30px;border-radius:14px;white-space:nowrap}
.sym{display:inline-flex;align-items:center;justify-content:center;width:62px;height:62px;border-radius:50%;font-style:normal;font-size:44px;color:#fff}
.sym.m{background:#2f80ed}.sym.f{background:#e8457a}
.t3{margin-top:20px;font-size:40px;font-weight:600;text-shadow:0 4px 16px rgba(0,0,0,.7)}
.find,.rlx{position:absolute;left:80px;top:110px;width:960px}
.fh{font-size:56px;font-weight:900;line-height:1.1;text-shadow:0 6px 20px rgba(0,0,0,.6)}
.fh b{color:#ff5c7a}
.fpv{width:520px;height:390px;margin:10px 0 6px 40px;background:rgba(10,24,40,.82);border-radius:26px;padding:18px 30px;box-shadow:0 20px 50px rgba(0,0,0,.4)}
.pv{width:100%;height:100%;overflow:visible}
.frow{display:flex;align-items:center;gap:18px;font-size:44px;font-weight:700;margin-top:12px;text-shadow:0 4px 14px rgba(0,0,0,.7)}
.frow i,.mv i{display:inline-flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:50%;background:#ffd21f;color:#10241b;font-style:normal;font-weight:900;font-size:36px;flex:none}
.fkey{display:inline-block;margin-top:20px;font-size:46px;font-weight:800;color:#10241b;background:#3ee07a;padding:8px 30px;border-radius:14px}
.rchips{display:flex;gap:20px;margin-top:40px}
.rchips em{font-style:normal;font-size:60px;font-weight:800;background:rgba(10,24,40,.85);border:4px solid #ff5c7a;padding:14px 36px;border-radius:20px}
.moves{position:absolute;left:80px;top:100px;width:980px}
.mvl{margin-top:24px;display:grid;grid-template-columns:1fr;gap:10px}
.mv{display:flex;align-items:center;gap:18px;font-size:42px;font-weight:700;text-shadow:0 3px 12px rgba(0,0,0,.7)}
.mv i{width:52px;height:52px;font-size:30px}
.safe,.sub{position:absolute;left:80px;bottom:60px;white-space:nowrap;background:rgba(6,40,27,.94);font-size:44px;font-weight:700;padding:12px 36px;border-radius:16px}
.sub{background:#e63946;bottom:80px;font-size:48px}
.tm{position:absolute;left:56px;top:46px;width:250px;height:250px;border-radius:50%;background:rgba(0,0,0,.45)}
.tm svg{position:absolute;inset:0;width:250px;height:250px;transform:rotate(-90deg)}
.tbg{fill:none;stroke:rgba(255,255,255,.18);stroke-width:14}
.tfg{fill:none;stroke-width:14;stroke-linecap:round;stroke-dasharray:540}
.tm b{position:absolute;left:0;right:0;top:44px;text-align:center;font-size:118px;font-weight:800;line-height:1}
.tm span{position:absolute;left:0;right:0;top:168px;text-align:center;font-size:36px;font-weight:800;letter-spacing:3px}
.pg{position:absolute;right:60px;top:60px;width:440px;text-align:right;text-shadow:0 3px 12px rgba(0,0,0,.6)}
.pg span{font-size:40px;font-weight:700}
.dots{display:flex;justify-content:flex-end;gap:12px;margin-top:14px}
.dots i{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.35);border:3px solid rgba(255,255,255,.6)}
.dots i.on{background:#3ee07a;border-color:#3ee07a}
.dots i.cur{background:#ffd21f;border-color:#fff}
.name{position:absolute;left:56px;bottom:56px;background:rgba(6,40,27,.92);border-radius:16px;padding:16px 40px 20px 52px;overflow:hidden}
.nbar{position:absolute;left:0;top:0;bottom:0;width:16px;background:#ffd21f;transform-origin:top}
.name b{display:block;font-size:66px;font-weight:800;line-height:1.1}
.chips{display:flex;gap:12px;margin-top:8px}
.chips em{font-style:normal;font-size:30px;font-weight:700;color:#10241b;background:#ffc2cd;padding:2px 16px;border-radius:10px}
.tip{position:absolute;right:56px;bottom:56px;display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.96);color:#10241b;font-size:40px;font-weight:800;padding:12px 30px;border-radius:50px;box-shadow:0 12px 30px rgba(0,0,0,.3)}
.xray{position:absolute;right:56px;top:250px;width:440px;background:rgba(10,24,40,.86);border-radius:26px;padding:18px 22px 20px;box-shadow:0 20px 50px rgba(0,0,0,.4);text-align:center}
.xh{font-size:34px;font-weight:900;letter-spacing:3px;color:#ff8da1}
.xpv{width:396px;height:317px}
.stbox{position:relative;height:96px;margin-top:6px}
.st{position:absolute;left:0;right:0;top:0;height:96px;display:flex;align-items:center;justify-content:center;border-radius:18px;background:#3a4b5e;font-size:46px;font-weight:900;letter-spacing:1px;opacity:0;white-space:nowrap}
.st.up{background:#e8304f;box-shadow:0 0 30px rgba(255,70,100,.6)}
.reps{margin-top:12px;font-size:34px;font-weight:800;letter-spacing:2px;color:#cfe3f5}
.reps b{font-size:46px;color:#ffd21f;margin-left:8px}
.glow{position:absolute;width:260px;height:104px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(255,70,100,.9) 0%,rgba(255,70,100,.45) 40%,rgba(255,70,100,0) 72%);mix-blend-mode:screen;opacity:.1}
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
.wipe i{position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,92,122,0),#ff5c7a 30%,#ffd21f 70%,rgba(255,210,31,0));transform:skewX(-18deg);opacity:.85}
.half{position:absolute;left:50%;top:50%;margin:-130px 0 0 -460px;width:920px;height:260px;border-radius:30px;background:#e63946;box-shadow:0 20px 60px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center}
.half span{font-size:150px;font-weight:900;letter-spacing:4px}
.done{position:absolute;left:80px;top:90px;width:1000px}
.dh{display:inline-block;font-size:76px;font-weight:900;color:#10241b;background:#3ee07a;padding:8px 34px;border-radius:16px;transform-origin:left center}
.cklist{margin-top:22px;display:grid;grid-template-columns:1fr;gap:10px}
.ck{display:flex;align-items:center;gap:14px;font-size:40px;font-weight:700;text-shadow:0 3px 12px rgba(0,0,0,.7)}
.ck i{display:inline-flex;align-items:center;justify-content:center;width:50px;height:50px;border-radius:50%;background:#3ee07a;color:#0b3d24;font-style:normal;font-weight:900;font-size:32px;flex:none}
.goal{display:inline-block;margin-top:22px;font-size:38px;font-weight:800;color:#10241b;background:#ffd21f;padding:6px 26px;border-radius:12px}
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
