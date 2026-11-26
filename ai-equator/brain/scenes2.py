"""AI Can Now Edit Another AI's Brain: 3:58 to the end (times = trimmed voice)."""
from lib import *
from toon import *
from props import *

BLOG = "rikiyat.github.io/blog/weight-space-programming"
LAB = '<div class="room" style="background:linear-gradient(#2E3F63 0 64%,#222B45 64%)"></div>'
PEW = "x/pe_wsp.mp4"
PEWC = "Prompt Engineering on YouTube · “Weight-Space Programming: AI Is Now Rewriting Other AI Models”"


def pair(t, label, a, b, y, unit="%"):
    """Before -> after bar pair, true to scale (100 = 900 px)."""
    ba, bb = nid("pa"), nid("pb")
    out = el(t, label, f"left:220px;top:{y}px;font-size:34px;width:420px", "bl")
    out += f'<div class="track" style="left:660px;top:{y - 8}px;width:900px;height:30px"></div><div id="{ba}" class="fill" style="left:660px;top:{y - 8}px;width:0;height:30px"></div>'
    out += f'<div class="track" style="left:660px;top:{y + 30}px;width:900px;height:30px"></div><div id="{bb}" class="fill hero" style="left:660px;top:{y + 30}px;width:0;height:30px"></div>'
    out += el(t, f'<span class="g">{a}{unit}</span>', f"left:{660 + int(9 * a) + 16}px;top:{y - 14}px;font-size:30px", "bvl")
    out += el(t + .9, f'<span class="blue">{b}{unit}</span>', f"left:{660 + int(9 * b) + 16}px;top:{y + 22}px;font-size:36px", "bvl")
    grow(f"#{ba}", t, int(9 * a), .6)
    grow(f"#{bb}", t + .5, int(9 * b), .9)
    return out


# ---------- results
scene(238.01, 273.93,
      txt(238.01, f"the results · {B}50{E} test runs", 220, 70, 56)
      + txt(238.4, "before the edit (grey) → after (blue)", 220, 160, 30, cls="lab")
      + pair(242.47, "MATH-500", 7.9, 48.1, 280)
      + note(249.65, "the “6×” in the headlines", 1220, 220, 46)
      + pair(252.91, "GSM8K", 13.8, 67.1, 470)
      + pair(261.07, "IFEval", 21, 62, 660)
      + note(268.11, "nearly 3× on instructions, and nobody asked for that", 220, 860, 46)
      + src(238.5, "Source: Takehi, Teoh, Zhang, Khattab · MIT CSAIL blog, Nov 2, 2026", y=1000))

scene(273.93, 294.05,
      LAB
      + txt(273.93, f"why? the fix wasn't a {B}math{E} fix", 0, 60, 60, align="center")
      + bean("qw4", 380, 900, 1.4, "purple", kind="robot", label="Qwen")
      + bubble("rb", 560, 260, "let me think… wait… let me think again… wait… let me think…", 760, size=28)
      + '<div class="toon" id="maxl" style="left:1340px;top:200px;width:8px;height:380px;background:#F85149;box-shadow:0 0 18px #F85149"></div>'
      + txt(279.0, '<span style="color:#F85149" class="mono">MAX LENGTH</span>', 1190, 590, 26)
      + card(279.43, f'<div class="mono g" style="font-size:22px">answers cut off at the limit · before</div><div class="big" style="font-size:90px;color:#F85149">93%</div>', 1420, 200, 380, 220, cls="card red")
      + card(286.57, f'<div class="mono g" style="font-size:22px">after the edit</div><div class="big blue" style="font-size:90px">~33%</div>', 1420, 450, 380, 220, cls="card sel")
      + bubble("rb2", 560, 460, "…so the answer is 84. ✓", 420, size=30)
      + note(289.71, "once it could finish its thoughts, everything improved", 560, 760, 44))
appear("qw4", 273.93); appear("rb", 275.43); appear("maxl", 278.37, 0); appear("rb2", 289.71); talk("qw4", 275.5, 286.0); bob("qw4", 274, 294)

scene(294.05, 314.41,
      LAB
      + txt(294.05, f"a smart {B}control test{E}", 0, 60, 60, align="center")
      + bean("gem", 420, 900, 1.4, "green", kind="robot", label="Gemma 3 270M")
      + card(298.69, '<div class="li">a tiny model that rarely loops</div><div class="cs">loops on 8.5% of answers (Qwen: 93%)</div>', 760, 200, 760, 150)
      + card(301.61, f'<div class="mono g" style="font-size:22px">what Astra could add</div><div class="big" style="font-size:90px">~1 <span class="g" style="font-size:44px">point at most</span></div>', 760, 390, 760, 200)
      + dial("knob", 860, 760, 70, "#F2B33D")
      + txt(308.23, "no magic “be smarter” knob", 980, 720, 44)
      + bigx(308.4, 780, 680, 160, 160)
      + card(311.53, f'<div class="li">it found {B}one specific bug{E} and fixed it</div>', 760, 860, 900, 90, cls="card ok")
      + src(296.6, "Source: lm_understand-logs, exp8_math/gemma_followup", y=1010))
appear("gem", 296.47); bob("gem", 296.5, 314.3); appear("knob", 308.23); turn("knob", 308.5, 300, .8)

# ---------- the wilder experiments
scene(314.41, 342.87,
      txt(314.41, f"some other experiments are even {B}wilder{E}", 0, 60, 56, align="center")
      + "".join(numgrid(f"tn{i}", 220 + i * 390, 200, 6, 6, 44, seed=40 + i) for i in range(4))
      + "".join(txt(325.0, '<span class="big" style="font-size:70px;color:#F0A818">?</span>', 330 + i * 390, 480, 40) for i in range(4))
      + chip(329.99, "no game footage", 220, 620, "ovc red") + chip(331.25, "no labels", 560, 620, "ovc red")
      + chip(332.33, "no running the networks", 820, 620, "ovc red") + chip(334.03, "just numbers", 1260, 620)
      + txt(335.55, "which game was this network trained on?", 0, 720, 46, align="center")
      + "".join(icon(f"gi{i}", 260 + i * 390, 800, k, 130) for i, k in enumerate(["pacman", "pong", "breakout", "freeway"]))
      + "".join(check(339.2 + i * .25, 400 + i * 390, 820, 56) for i in range(4)))
for i in range(4):
    appear(f"tn{i}", 323.95 + i * .2, 10); appear(f"gi{i}", 336.6 + i * .2)

scene(342.87, 355.87,
      mac(342.87, "willison", "simonwillison.net", (.0, .0, .76, .70), 160, 120, 1000, 342.87, 355.87)
      + txt(345.0, "Qwen 3.8 27B, on his laptop", 1260, 160, 36, cls="lab")
      + "".join(icon(f"wi{i}", 1260 + (i % 2) * 260, 260 + (i // 2) * 260, k, 200) for i, k in enumerate(["pacman", "pong", "breakout", "freeway"]))
      + check(351.0, 1440, 290) + check(352.11, 1700, 290) + check(352.55, 1440, 550) + cross(353.87, 1700, 550, 70)
      + txt(350.71, f'{B}3{E} out of 4', 1300, 800, 64, cls="big"))
for i in range(4):
    appear(f"wi{i}", 349.69 + i * .15)

# writing weights from scratch: real footage at 80%
scene(355.87, 378.23, clip80(355.87, 378.23, PEW, 197.0, PEWC))
scene(355.87, 378.23,
      ov(355.87, "then they flipped it: write the weights from scratch", 230, 110, 44)
      + chip(361.19, "given: the rules + source code of Breakout", 230, 190)
      + chip(367.75, "no training at all", 230, 270, "ovc red")
      + chip(369.53, "hand-written network: average 517 points", 1060, 760)
      + chip(373.37, "baseline trained 100M rounds: 25", 1060, 840, "ovc red"))

g, ns = goboard("go", 260, 200, 520, stones=30), 30
scene(378.23, 399.69,
      card(378.23, '<div class="li">to be fair: on the other two games, it fell behind the longest-trained networks</div>', 220, 70, 1480, 100, cls="card dash")
      + g
      + txt(383.89, f"the board game {B}Go{E} · 9×9", 860, 240, 56)
      + card(388.87, f'<div class="mono g" style="font-size:22px">network written by Astra</div><div class="big" style="font-size:80px">~1.5M <span class="g" style="font-size:40px">parameters</span></div>', 860, 330, 760, 200, cls="card sel")
      + card(393.41, '<div class="li">50 rounds of testing + corrections…</div><div class="cs">beat a comparable model trained on ~20 million games</div>', 860, 570, 760, 160, cls="card ok"))
appear("go", 385.9); place_stones("go", ns, 386.2, 399.0)

road = '<div class="room" style="background:linear-gradient(#2E3F63 0 70%,#3A3F4A 70%)"></div><div class="toon" id="gap" style="left:1080px;top:756px;width:150px;height:330px;background:#121521;opacity:1"></div>'
scene(399.69, 411.81,
      road
      + car("cr", 300, 560, 1.0, "#F2B33D")
      + txt(399.69, f"a little {B}self-driving car{E} policy", 0, 70, 56, align="center")
      + chip(402.95, "stuck: failing every time", 220, 180, "ovc red")
      + chip(404.41, "Astra edited 3.5% of its weights, in one shot", 220, 260)
      + txt(408.77, f'success: 0% → {B}100%{E}', 1000, 200, 80, cls="big"))
appear("cr", 399.69, 0)
tl.append('tl.to("#cr",{x:420,duration:.8,ease:"power2.in"},400.2); tl.to("#cr",{x:330,duration:.3,ease:"power2.out"},401.0); tl.to("#cr",{x:420,duration:.6,ease:"power2.in"},401.6); tl.to("#cr",{x:330,duration:.3},402.2);')
tl.append('tl.to("#cr",{x:930,duration:1.5,ease:"power1.in"},406.4); tl.to("#cr",{y:-120,duration:.45,ease:"power2.out",yoyo:true,repeat:1},406.85);')

# ---------- others reproduce it
scene(411.81, 428.17,
      txt(411.81, f"people tried it with {B}other models{E} right away", 0, 50, 52, align="center")
      + tweet(419.27, "krentsel", 520, 140, 880, .78)
      + note(423.25, "GPT-6.1 Sol and Claude Opus 5.5 could do it too", 560, 960, 46)
      + src(419.5, "@AlexKrentsel on X · Nov 3, 2026", 520, 1030, center=False))
scene(428.17, 447.01,
      tweet(428.17, "legora", 220, 120, 760, .9)
      + card(429.27, '<div class="mono g" style="font-size:22px">CTO of legal AI company Legora</div><div class="ct" style="margin-top:8px">Claude Fable hand-wrote a 100K-parameter model: real vs fake legal citations</div>', 1060, 160, 660, 200, cls="card sel")
      + note(437.51, "the one-shot result beat training it", 1080, 400, 48)
      + card(440.81, f'<div class="ct">not one magic model: maybe something {B}frontier models{E} can now do</div>', 1060, 560, 660, 170, cls="card ok")
      + src(428.4, "@jacsebl (Jacob Lauritzen) on X · Nov 3, 2026", 220, 1000, center=False))

# ---------- the twist
scene(447.01, 485.39,
      txt(447.01, f"okay, now the {B}twist{E}", 0, 50, 64, align="center")
      + mac(452.23, "honnibal", "honnibal.dev", (.18, .0, .82, .58), 160, 160, 900, 452.23, 485.39)
      + txt(452.4, "Matthew Honnibal · ML engineer", 1120, 180, 34, cls="lab")
      + card(464.43, '<div class="mono g" style="font-size:22px">“just looking at raw weights” (no tools)</div><div class="ct" style="margin-top:8px">only on tiny networks: ~17K–172K weights</div>', 1120, 250, 640, 190)
      + card(472.33, '<div class="mono g" style="font-size:22px">every real language-model test</div><div class="ct" style="margin-top:8px">used Python and actually ran the model</div>', 1120, 470, 640, 190, cls="card red")
      + note(479.15, "impressive… but a skilled human ML engineer could do it too", 1120, 700, 40)
      + src(452.5, "honnibal.dev/blog/astra-read-write-misleading · Nov 3, 2026", 160, 1000, center=False))
scene(485.39, 494.19,
      card(485.39, f'<div class="mono g" style="font-size:22px">BuildMVPFast</div><div class="ct" style="font-size:60px;margin-top:10px">a “{B}method swap{E}”</div>', 460, 260, 1000, 200, cls="card red")
      + card(489.29, '<div class="li">the abstract describes one method…</div>', 460, 520, 1000, 90)
      + card(491.63, '<div class="li">…the headline number comes from another</div>', 460, 630, 1000, 90))

scene(494.19, 542.49,
      txt(494.19, f"the {B}baseline problem{E}", 220, 50, 60)
      + note(495.77, "the part I find most important", 900, 70, 46)
      + mac(499.57, "toledo", "carlostoledo.co", (.0, .05, 1.0, .62), 1240, 170, 520, 499.57, 542.49)
      + txt(500.5, "Carlos Toledo reran the untouched Qwen on MATH-500", 220, 160, 34, cls="lab")
      + bars(504.0, [(506.05, "study settings", 7.2, False, None), (513.91, "model-card settings", 22.5, False, None),
                     (518.03, "thinking mode off", 43.95, False, None), (523.85, "edited model (paper)", 48.1, True, None)], x=220, y=260, wmax=520, gap=110)
      + note(528.13, "doesn't mean the edit did nothing…", 220, 730, 46)
      + note(530.31, "but the 6× only applies to the original setup", 220, 800, 46)
      + card(539.33, '<div class="li">nobody has run that matched comparison yet</div>', 220, 880, 900, 90, cls="card red"))

# ---------- the researchers' own limits
scene(542.49, 559.07,
      txt(542.49, f"the researchers are {B}honest{E} about limits too", 0, 60, 56, align="center")
      + pipe("pp", 360, 260, 1200)
      + note(545.81, "the edit removed a blockage…", 400, 420, 50)
      + note(548.63, "…suppressing abilities Qwen already had", 400, 490, 46)
      + card(551.31, '<div class="li">it couldn\'t add skills the model fundamentally lacks</div>', 360, 620, 1200, 90, cls="card red")
      + card(554.45, '<div class="li">loops not fully gone: about a third still hit the limit</div>', 360, 740, 1200, 90, cls="card red"))
appear("pp", 543.0); unclog("pp", 546.6, 1200)
scene(559.07, 581.39,
      LAB
      + bean("ya", 360, 860, 1.2, "red", kind="robot", label="model A")
      + bean("yb", 760, 860, 1.2, "red", kind="robot", label="model B")
      + bean("ast6", 1300, 900, 1.5, "blue", kind="robot", label="Astra")
      + bubble("yq", 1100, 280, "which one was trained to just agree with you?", 520, "right", 28)
      + txt(565.93, '<span class="big" style="font-size:120px;color:#F0A818">?</span>', 1420, 460, 40)
      + card(568.41, '<div class="li">only solved it after seeing what the models paid attention to</div>', 160, 120, 860, 90, cls="card dash")
      + card(572.81, '<div class="li">a blog post, not peer-reviewed · math result not replicated under matched settings</div>', 160, 960, 1600, 90, cls="card red"))
appear("ya", 559.07); appear("yb", 559.3); appear("ast6", 559.6); appear("yq", 561.99); bob("ya", 559, 581); bob("yb", 559, 581); bob("ast6", 559, 581)

# ---------- why it matters
scene(581.39, 609.39,
      txt(581.39, f"so why does this {B}matter{E}?", 0, 60, 64, align="center")
      + card(587.31, '<div class="mono g" style="font-size:22px">01</div><div class="ct">security audits</div><div class="cs">check the weights directly for hidden back doors or dangerous capabilities</div>', 160, 220, 520, 260, cls="card sel")
      + card(596.63, '<div class="mono g" style="font-size:22px">02</div><div class="ct">fix one bug</div><div class="cs">without retraining the whole thing, which costs a fortune and can break other things</div>', 700, 220, 520, 260)
      + card(604.11, '<div class="mono g" style="font-size:22px">03</div><div class="ct">less sycophancy</div><div class="cs">AI telling you what you want to hear</div>', 1240, 220, 520, 260)
      + magnifier("m4", 300, 560, 200) + wrench("w4", 860, 580, 180)
      + bean("yes", 1500, 980, 1.0, "yellow", kind="robot")
      + bubble("yb2", 1250, 560, "great idea!", 240, "right", 30))
appear("m4", 589.0); appear("w4", 598.0); appear("yes", 606.0); appear("yb2", 606.69)
tl.append('tl.to("#w4",{rotation:-25,duration:.2,yoyo:true,repeat:5},598.5);')

scene(609.39, 636.89,
      txt(609.39, f"and then there's the {B}big one{E}", 0, 60, 52, align="center")
      + txt(610.95, "recursive self-improvement", 0, 140, 76, align="center")
      + bean("self", 900, 880, 1.6, "blue", kind="robot", label="an AI")
      + loop_arrow("la", 1000, 340, 300)
      + chip(616.19, "edit its own weights", 1300, 380)
      + chip(620.03, "→ smarter version", 1300, 460)
      + chip(621.61, "→ edits itself again… and again", 1300, 540)
      + card(624.39, f'<div class="ct" style="color:#F85149">that is not what happened here</div><div class="cs">Astra edited a different, much smaller model</div>', 160, 300, 560, 170, cls="card red")
      + card(631.01, '<div class="li">“a proposed application, not a result”</div>', 160, 520, 560, 90, cls="card dash"))
appear("self", 614.47); appear("la", 616.19); spin("la", 616.5, 624.3, 4); bob("self", 614.5, 636.8)

scene(636.89, 655.89,
      LAB
      + txt(636.89, f"but think about the {B}direction{E}", 0, 60, 56, align="center")
      + '<div class="toon" id="bb2" style="left:200px;top:260px;width:360px;height:280px;background:#0B0B0E;border:6px solid #17181C;border-radius:22px;box-shadow:0 0 0 3px #3A4A72;display:flex;align-items:center;justify-content:center;font-size:140px;font-weight:900;color:#3A4A72">?</div>'
      + txt(638.63, "a few years ago: a black box", 200, 580, 34, cls="lab")
      + bean("a7", 980, 900, 1.4, "blue", kind="robot", label="one model")
      + bean("q7", 1440, 900, 1.2, "purple", kind="robot", label="another")
      + brain("b7", 1240, 260, 420, 280, cols=(4, 6, 6, 4), seed=7)
      + note(648.27, "even if the headline was oversold, that part is real", 900, 120, 44)
      + card(652.19, '<div class="li">others reproduced pieces of it within days</div>', 160, 700, 700, 90, cls="card ok"))
appear("bb2", 638.63); appear("a7", 642.73); appear("q7", 643.0); appear("b7", 644.07)
fire("b7", [(1, 2), (2, 4)], 644.81, "#F85149"); fire("b7", [(1, 2), (2, 4)], 647.23, "#3FB950"); point("a7", 644.5, hold=3)

scene(655.89, 668.01,
      tweet(655.89, "mccandlish", 220, 120, 700, .8)
      + card(657.05, '<div class="mono g" style="font-size:22px">METR · independent assessment, Nov 5</div><div class="ct" style="margin-top:8px">AI is speeding up Anthropic\'s own research</div>', 1000, 200, 700, 190, cls="card sel")
      + txt(662.19, f"AI that improves AI isn't sci-fi anymore.", 1000, 460, 44, w=760)
      + txt(666.33, f"it's a {B}research area{E}.", 1000, 620, 64)
      + src(656.1, "@Sam_McCandlish (Anthropic co-founder) on X · metr.org, Nov 5, 2026", 220, 1000, center=False))

# ---------- my take
scene(668.01, 686.93,
      LAB
      + txt(668.01, f"my {B}take{E}", 0, 50, 60, align="center")
      + txt(669.03, "not magic brain surgery yet", 0, 140, 44, align="center", cls="h strike2")
      + car("mc", 560, 600, 1.2, "#E5484D")
      + bean("mech", 360, 900, 1.4, "blue", kind="robot", label="the mechanic")
      + wrench("w9", 430, 520, 130)
      + note(672.57, "a skilled mechanic: opens the hood, fixes one known problem", 160, 230, 44)
      + card(677.43, f'<div class="ct" style="font-size:44px">for the first time, the mechanic is {B}also an AI{E}</div>', 1200, 300, 600, 190, cls="card sel")
      + txt(679.77, "what do you think?", 1200, 560, 44, cls="lab")
      + card(681.13, '<div class="li">first step toward AI improving itself…</div>', 1200, 630, 600, 90)
      + card(684.21, '<div class="li">…or good engineering with a big headline?</div>', 1200, 740, 600, 120))
appear("mc", 671.25, 0); appear("mech", 672.0); appear("w9", 674.13); bob("mech", 672, 686.9)
tl.append('tl.to("#mc_hood",{rotation:-38,svgOrigin:"300 95",duration:.6,ease:"back.out(1.5)"},674.13);')
tl.append('tl.to("#w9",{rotation:-30,duration:.2,yoyo:true,repeat:5},675.0);')

scene(686.93, 691.30,
      img(686.93, "assets/img/aiequator.png", 760, 200, 400, 400)
      + note(686.93, "let me know in the comments", 700, 640, 56)
      + txt(688.75, "subscribe for more AI news", 0, 760, 40, align="center", cls="lab"), out=False)
