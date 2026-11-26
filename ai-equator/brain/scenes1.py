"""AI Can Now Edit Another AI's Brain: 0:00 to 3:58 (times = trimmed voice). 2D cartoon explainers + real sources."""
from lib import *
from toon import *
from props import *

ROOM = '<div class="room" style="background:linear-gradient(#33466E 0 66%,#25304D 66%)"></div>'
LAB = '<div class="room" style="background:linear-gradient(#2E3F63 0 64%,#222B45 64%)"></div><div class="room" style="top:62%;height:6px;background:#17181C;opacity:.5"></div>'
AUTH = "Rikiya Takehi<br>Jayden Teoh<br>Alex Zhang<br>Omar Khattab"


def cross_card(t, label, x, y, w=420):
    return card(t, f'<div class="li">{label}</div>', x, y, w, 90, cls="card red") + cross(t + .1, x + w + 14, y + 14, 56)


# ---------- hook: the doctor analogy (frame 0 already shows the scene)
scene(0, 14.43,
      ROOM
      + bean("doc", 520, 900, 1.7, "teal", 1, hair="short", glasses=True, coat=True, label="the doctor")
      + bean("pat", 1300, 900, 1.7, "yellow", 0, hair="bun", label="the patient")
      + bubble("pb1", 1380, 240, "so I was… so I was…", 380, size=32)
      + bubble("pb2", 1380, 240, "so I was… so I was… so I was…", 440, size=32)
      + brain("pbr", 1020, 40, 560, 380, cols=(4, 6, 6, 4))
      + magnifier("mag", 1160, 100, 180)
      + wrench("wr", 1460, 280, 130)
      + card(7.33, '<div class="li">instead of years of therapy…</div>', 160, 120, 600, 90, cls="card dash"), fade_in=False)
tl.append('tl.set("#doc, #pat",{opacity:1},0);')
bob("doc", 0, 14.4); bob("pat", 0, 9.0); blink("doc", [2.2, 6.0, 11.5]); blink("pat", [3.4, 8.0])
appear("pb1", 1.77); tl.append('tl.to("#pb1",{opacity:0,duration:.2},4.3);')
appear("pb2", 4.47); talk("pat", 1.8, 7.0); tl.append('tl.to("#pb2",{opacity:0,duration:.2},8.9);')
appear("pbr", 9.27); point("doc", 9.4, hold=4.5)
appear("mag", 10.75); tl.append('tl.to("#mag",{x:-60,y:30,duration:1.0,ease:"sine.inOut"},11.0);')
fire("pbr", [(2, 3)], 11.6, "#F85149")
tl.append('tl.to("#mag",{opacity:0,duration:.2},13.0);')
appear("wr", 13.23); tl.append('tl.to("#wr",{rotation:-40,duration:.18,yoyo:true,repeat:3},13.5);')
fire("pbr", [(2, 3)], 13.9, "#3FB950")

scene(14.43, 21.19,
      txt(14.43, "you touch less than", 0, 120, 44, align="center", cls="lab")
      + txt(15.2, f'{B}0.02%{E} of it', 0, 180, 120, align="center", cls="big")
      + numgrid("g0", 360, 400, 26, 6, 46, seed=11, dim=True)
      + card(17.77, f'<div class="mono g" style="font-size:22px">the next day · math score</div><div class="big blue" style="font-size:110px">6×</div>', 1460, 120, 300, 230, cls="card ok"))
appear("g0", 14.6); light("g0", [(13, 3)], 16.0, "#F0A818")

# ---------- what actually happened
scene(21.19, 31.65,
      LAB
      + bean("mit", 360, 880, 1.5, "red", 2, hair="short", label="MIT researchers")
      + bean("ast", 900, 880, 1.7, "blue", kind="robot", label="GPT-6 Astra")
      + img(21.4, "assets/img/openai_w.png", 760, 110, 300)
      + bean("qw", 1540, 880, 1.2, "purple", kind="robot", label="another AI")
      + brain("qbr", 1340, 260, 400, 280, cols=(4, 6, 6, 4), seed=4)
      + bubble("mb", 420, 300, "make this better at math", 400, size=30))
for e, t in (("mit", 21.19), ("ast", 22.9), ("qw", 26.6), ("qbr", 27.0)):
    appear(e, t)
bob("ast", 23, 31.6); bob("qw", 27, 31.6); blink("mit", [24.0, 29.5]); blink("ast", [25.0, 30.0])
appear("mb", 29.51); talk("mit", 29.5, 31.4); point("mit", 26.8, hold=3.0)

scene(31.65, 39.59,
      cross_card(31.65, "no retraining", 160, 160)
      + cross_card(33.01, "no new data", 160, 280)
      + bean("ast2", 420, 920, 1.3, "blue", kind="robot", label="Astra")
      + numgrid("g1", 780, 220, 18, 12, 52, seed=3)
      + note(36.3, "it changed them by hand", 900, 880, 52))
appear("ast2", 34.0); appear("g1", 34.39); bob("ast2", 34, 39.5)
light("g1", [(4, 2), (4, 3), (4, 4), (11, 6), (11, 7), (11, 8), (15, 1)], 35.9, "#F0A818")

pl = [(44.29, "what actually happened"), (46.85, "why it matters"), (48.07, "what critics are saying")]
inner = txt(39.59, f"but this story has a {B}twist{E}", 0, 180, 76, align="center") + txt(41.63, "and a lot of people who covered it skipped it", 0, 290, 38, align="center", cls="lab")
for i, (t, lab) in enumerate(pl):
    inner += card(t, f'<div class="mono g" style="font-size:22px">0{i + 1}</div><div class="ct" style="margin-top:6px">{lab}</div>', 230 + i * 500, 460, 460, 150, cls="card red" if i == 2 else "card")
scene(39.59, 49.39, inner + meme(42.3, "megamind.jpg", 1500, 720, 280, 2))

# ---------- the paper
scene(49.39, 71.27,
      mac(49.39, "mit_top", "csail.mit.edu", (.0, .0, 1.0, .70), 260, 110, 1000, 49.39, 71.27)
      + txt(50.0, '<span class="mono g">Nov 2, 2026 · MIT CSAIL</span>', 1320, 140, 30)
      + card(57.73, f'<div class="mono g" style="font-size:22px">four researchers</div><div class="li" style="margin-top:12px" id="authors">{AUTH}</div>', 1320, 210, 470, 330)
      + note(61.19, "first-year PhD student", 1330, 560, 44)
      + card(67.57, f'<div class="mono g" style="font-size:22px">they call it</div><div class="ct" style="font-size:46px;margin-top:8px">{B}weight-space programming{E}</div>', 1320, 640, 470, 190, cls="card sel"))

# ---------- what weights are
scene(71.27, 90.87,
      txt(71.27, f"first: what are {B}weights{E}?", 0, 60, 64, align="center")
      + numgrid("g2", 160, 170, 34, 13, 47, seed=21)
      + chip(79.37, "small model: hundreds of millions", 220, 820)
      + chip(82.19, "big ones: trillions", 920, 820, "ovc red")
      + chip(86.69, "what it knows", 220, 900)
      + chip(88.03, "how it talks", 620, 900)
      + chip(89.17, "how it reasons", 980, 900))
appear("g2", 75.19, 20)

scene(90.87, 116.59,
      LAB
      + txt(90.87, f"no human ever sets those numbers {B}by hand{E}", 0, 60, 52, align="center")
      + bean("gd", 420, 900, 1.6, "grey", 0, label="gradient descent")
      + blindfold("bf", 376, 448, 140)
      + "".join(dial(f"d{i}", 820 + (i % 6) * 170, 300 + (i // 6) * 170, 54, ["#4F7DF3", "#2FA36B", "#F2B33D", "#E5484D", "#8B5CF6", "#14B8A6"][i % 6]) for i in range(18))
      + card(97.05, '<div class="li">a ton of examples</div>', 160, 140, 440, 90)
      + note(101.33, "nudges every number a tiny bit… millions of times", 820, 860, 44))
appear("gd", 95.43); bob("gd", 95.5, 116.5)
for i in range(18):
    appear(f"d{i}", 98.81 + i * .05, 10)
for k in range(40):
    turn(f"d{(k * 7) % 18}", 101.33 + k * .35, 25 if k % 3 else -35, .3)
appear("bf", 107.35, 0)
tl.append('tl.fromTo("#bf",{scaleX:0},{scaleX:1,duration:.3,ease:"back.out(2)"},107.35);')

scene(112.29, 123.17,
      '<div class="dimbg" style="background:#000"></div>'
      + card(112.29, '<div class="mono g" style="font-size:22px">error</div><svg width="560" height="240" viewBox="0 0 560 240"><path id="errp" d="M10 30 C80 40 90 90 160 110 C230 130 260 170 330 185 C400 198 470 205 550 210" fill="none" stroke="#3FB950" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>', 200, 220, 640, 330)
      + '<div class="toon" id="bbox" style="left:1160px;top:240px;width:420px;height:320px;background:#0B0B0E;border:6px solid #17181C;border-radius:24px;box-shadow:0 0 0 3px #3A4A72;display:flex;align-items:center;justify-content:center;font-size:160px;font-weight:900;color:#3A4A72">?</div>'
      + txt(116.59, f"AI models are {B}black boxes{E}", 1100, 600, 52)
      + card(119.65, '<div class="li">we know how to grow them ✓</div>', 1100, 700, 560, 90, cls="card ok")
      + card(121.15, '<div class="li">we don\'t really know how to read them ✗</div>', 1100, 810, 640, 90, cls="card red"))
tl.append('tl.to("#errp",{strokeDashoffset:0,duration:3.2,ease:"power1.inOut"},112.6);')
appear("bbox", 116.59)

# ---------- the strange question
scene(123.17, 140.63,
      LAB
      + txt(123.17, f"so MIT asked a {B}strange question{E}", 0, 60, 56, align="center")
      + bean("ast3", 380, 900, 1.5, "blue", kind="robot", label="a smart AI")
      + numgrid("g3", 760, 200, 18, 11, 54, seed=8)
      + magnifier("mag3", 760, 220, 180)
      + chip(133.59, "read them like code", 160, 160)
      + chip(134.97, "find the bug", 160, 240, "ovc red")
      + chip(136.05, "fix it on purpose", 160, 320))
appear("ast3", 129.43); appear("g3", 129.8); appear("mag3", 131.0); bob("ast3", 129.5, 140.5)
tl.append('tl.to("#mag3",{x:520,y:260,duration:3.0,ease:"sine.inOut"},131.2);')
light("g3", [(10, 5)], 134.97, "#F85149"); light("g3", [(10, 5)], 136.3, "#3FB950")

# ---------- the patient: Qwen
scene(140.63, 155.39,
      LAB
      + bean("qw2", 520, 900, 1.6, "purple", kind="robot", label="Qwen3.5-0.8B")
      + card(144.65, f'<div class="mono g" style="font-size:22px">small open-source model · Alibaba</div><div class="big" style="font-size:74px;margin-top:6px">&lt; 1 {B}billion{E}</div><div class="cs">parameters</div>', 960, 200, 700, 250)
      + chip(148.97, "cheap", 960, 500) + chip(150.0, "fast", 1140, 500)
      + card(152.05, '<div class="li">but they have problems…</div>', 960, 600, 700, 90, cls="card red"))
appear("qw2", 140.63); bob("qw2", 140.7, 155.3); blink("qw2", [143.0, 149.5])
scene(155.39, 163.27,
      mac(155.39, "hf_loop", "huggingface.co/Qwen", (.0, .25, .75, .65), 160, 150, 1000, 155.39, 163.27)
      + loop_arrow("lp1", 1340, 230, 220, "#F85149")
      + bubble("qb", 1300, 520, "and so… and so… and so…", 420, size=30))
appear("lp1", 157.23); spin("lp1", 157.23, 163.2, 4); appear("qb", 159.19)

# ---------- the setup
code = ('<div class="mono" style="font-size:26px;line-height:1.7;color:#C9D1DC">'
        '<span class="g">&gt;&gt;&gt;</span> import torch<br><span class="g">&gt;&gt;&gt;</span> qwen = load_weights(<span style="color:#F0A818">"qwen3.5-0.8b"</span>)<br>'
        '<span class="g">&gt;&gt;&gt;</span> qwen.layers[15].mlp.down_proj<br><span class="g"># device: cpu</span></div>')
scene(163.27, 189.45,
      card(163.27, '<div class="mono g" style="font-size:22px">Astra\'s Python session</div><div style="margin-top:14px">' + code + '</div>', 160, 120, 900, 330, cls="card sel")
      + chip(167.23, "no GPU", 160, 490, "ovc red")
      + chip(168.21, "practice math problems", 400, 490)
      + card(171.35, f'<div class="mono g" style="font-size:22px">allowed runs of Qwen</div><div class="big" style="font-size:80px;margin-top:6px">10 · 25 · {B}50{E}</div>', 1140, 120, 620, 250)
      + txt(178.97, "and the key rules:", 160, 610, 40, cls="lab")
      + cross_card(180.45, "no training loop", 160, 680, 440)
      + card(183.35, '<div class="li">every change written straight into the numbers</div>', 800, 680, 820, 90, cls="card ok")
      + cross_card(186.85, "no web search", 160, 800, 440))

# ---------- what Astra did
scene(189.45, 206.93,
      LAB
      + bean("qw3", 380, 900, 1.3, "purple", kind="robot", label="Qwen")
      + bubble("qb3", 120, 260, "first, let's compute 12×7… first, let's compute 12×7… first,", 560, size=26)
      + card(192.65, '<div class="li">not a math problem at all: it never finished its answers</div>', 160, 140, 760, 90, cls="card red")
      + "".join(el(198.83 + i * .02, f'<div class="lnum">{i}</div>', f"left:{1000 + (i % 14) * 56}px;top:{300 + (i // 14) * 260}px;width:44px;height:200px", "layer", eid=f"ly{i}") for i in range(28))
      + bean("ast4", 1200, 960, 1.0, "blue", kind="robot", label="Astra goes hunting")
      + note(204.87, "layers 15 and 19", 1240, 220, 54))
appear("qw3", 189.45); appear("qb3", 194.33); appear("ast4", 198.83)
walk("ast4", 199.5, 204.5, 380)
tl.append('tl.to("#ly15, #ly19",{backgroundColor:"#F0A818",boxShadow:"0 0 30px #F0A818",duration:.3},204.87);')

dots = "".join(f'<circle cx="{x}" cy="{y}" r="9" fill="#8FA3C8"/>' for x, y in ((120, 300), (170, 250), (240, 330), (300, 210), (340, 290), (420, 240), (470, 330), (520, 190), (560, 280), (210, 180)))
scene(206.93, 224.23,
      txt(206.93, "a simple way to think about it", 0, 60, 40, align="center", cls="lab")
      + card(208.95, f'<div class="mono g" style="font-size:22px">inside the model: every word = a point in a huge space</div><svg width="700" height="420" viewBox="0 0 700 420"><line x1="40" y1="380" x2="680" y2="380" stroke="#3A4A72" stroke-width="3"/><line x1="60" y1="400" x2="60" y2="20" stroke="#3A4A72" stroke-width="3"/>{dots}'
             '<g id="vec"><line x1="300" y1="260" x2="620" y2="90" stroke="#F85149" stroke-width="10" stroke-linecap="round"/><path d="M590 82 L630 86 L612 120" fill="none" stroke="#F85149" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g></svg>', 160, 130, 780, 560)
      + note(215.91, "one direction: “keep going… and going”", 1000, 240, 50)
      + card(221.71, f'<div class="ct" style="font-size:50px">so it {B}subtracted{E} that direction out</div>', 1000, 360, 760, 160, cls="card sel")
      + bean("ast5", 1360, 960, 1.0, "blue", kind="robot"))
tl.append('tl.set("#vec",{opacity:0},0); tl.to("#vec",{opacity:1,duration:.3},215.91); tl.to("#vec",{scale:0,transformOrigin:"300px 260px",opacity:0,duration:.6,ease:"power2.in"},222.4);')
appear("ast5", 221.71); wave("ast5", 222.3)

scene(224.23, 238.01,
      txt(224.23, "it edited 64 output columns in each of two layers", 0, 60, 46, align="center")
      + txt(225.0, '<span class="mono g">layer 15</span>', 160, 140, 30) + numgrid("g15", 160, 190, 16, 9, 46, seed=15)
      + txt(225.2, '<span class="mono g">layer 19</span>', 1010, 140, 30) + numgrid("g19", 1010, 190, 16, 9, 46, seed=19)
      + txt(228.29, f'<span id="cw">0</span> weights', 160, 640, 96, cls="big")
      + txt(231.0, "out of 800,000,000", 160, 760, 44, cls="lab")
      + txt(235.09, f'= {B}0.016%{E}', 1010, 660, 120, cls="big"))
appear("g15", 224.3, 10); appear("g19", 224.4, 10)
for c in (3, 7, 12):
    column("g15", c, 9, 225.5 + c * .05); column("g19", c, 9, 226.0 + c * .05)
count("#cw", 229.29, 0, 131072, 0, "", "", 2.0)
