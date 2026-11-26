"""Gemini 4 Carbon: 0:00 to 7:31, timed to the user's transcript. Every clip at 80% of the frame."""
from lib import *

GB = "blog.google/…/introducing-gemini-4-carbon"
GN = "blog.google/…/gemini-4-carbon-now-available"
PE = "x/pe.mp4"                      # Prompt Engineering, "Gemini 4 Carbon Is Finally Here"
PEC = "Prompt Engineering on YouTube · fort, galaxies, robot, Breakout demos"
TBL = "assets/raw/web/g__evals-table.png"
TX, TY, TW = 110, 70, 1150           # Google's table on screen
TS = TW / 1200
ROW = {"tb4": 296, "ale": 346, "vend": 511, "blue": 616, "riem": 716, "fswe": 245}


def rowbox(t, key, eid):
    y = TY + int((ROW[key] - 26) * TS)
    return el(t, "", f"left:{TX - 6}px;top:{y}px;width:{TW + 12}px;height:{int(52 * TS)}px", "rowbox", eid=eid)


# 0:00 the fort hook (frame 0 already shows the clip frame)
scene(0, 9.0, clip80(0, 9.0, PE, 1030.6, PEC, instant=True), fade_in=False)
scene(9.0, 17.60, clip80(9.0, 17.60, PE, 640.0, PEC))
scene(0, 17.60,
      ov(1.84, "one job", 230, 120, 56)
      + ov(2.68, "rebuild a historic fort in 3D", 230, 210, 48)
      + ov(5.58, "using only what it could find online", 230, 300, 44)
      + chip(8.84, "~20 hours straight", 1290, 640)
      + chip(11.14, "65 rounds of building + checking", 1100, 720)
      + chip(14.82, "its own grade: 5 / 10", 1290, 800), fade_in=False)

scene(17.60, 25.08,
      txt(18.48, "meanwhile, in another test…", 0, 200, 44, align="center", cls="lab")
      + card(19.72, '<div class="mono g" style="font-size:22px">via security firm Wiz</div><div class="ct" style="font-size:54px;margin-top:10px">real security holes in two big software companies</div>', 360, 300, 1200, 220, cls="card red")
      + txt(23.24, f'in under {B}two hours{E}', 0, 580, 84, align="center")
      + src(19.9, "Source: Google, Nov 10, 2026", y=1000))

scene(25.08, 28.94,
      img(25.08, "assets/img/gemini_w.png", 760, 300, 400)
      + txt(26.0, f"Gemini 4 {B}Carbon{E}", 0, 420, 140, align="center")
      + txt(27.34, "Google's new frontier model", 0, 600, 40, align="center", cls="lab"))
scene(28.94, 34.54,
      mac(28.94, "gn_top", GN, (.0, .0, 1.0, .62), 360, 120, 1200, 28.94, 34.54)
      + note(30.80, "public since November 10", 600, 900, 54))

pl = [(35.50, "what it is"), (36.38, "the benchmarks"), (37.40, "vs Claude & GPT"), (39.78, "what people built"), (40.78, "the reviews"), (42.16, "the problems")]
inner = txt(34.54, "in this video", 0, 150, 40, align="center", cls="lab")
for i, (t, lab) in enumerate(pl):
    x, y = 260 + (i % 3) * 480, 320 + (i // 3) * 200
    inner += card(t, f'<div class="mono g" style="font-size:22px">0{i + 1}</div><div class="ct" style="margin-top:6px">{lab}</div>', x, y, 440, 150, cls="card red" if i == 5 else "card")
inner += note(42.84, "the bit nobody puts in thumbnails", 1100, 760, 46, "up", 140, -80)
scene(34.54, 45.22, inner)

# timeline
scene(45.22, 61.64,
      txt(45.22, f"first, the {B}timeline{E}", 0, 110, 70, align="center")
      + '<div class="tline" style="left:300px;top:470px;width:1320px"></div>'
      + el(48.88, '<i class="dot"></i><div class="big" style="font-size:56px;margin-top:24px">Oct 28</div><div class="ct" style="font-size:34px;margin-top:6px">announced</div><div class="cs">only cybersecurity defenders,<br>via the Fairwind program</div>', "left:280px;top:456px;width:600px", "tp")
      + el(58.22, f'<i class="dot hero"></i><div class="big" style="font-size:56px;margin-top:24px">{B}Nov 10{E}</div><div class="ct" style="font-size:34px;margin-top:6px">generally available</div><div class="cs">two weeks later</div>', "left:1300px;top:456px;width:520px", "tp"))

# where to get it
scene(61.64, 76.50,
      txt(61.64, "where you can use it right now", 0, 100, 56, align="center")
      + card(62.40, '<div class="mono g" style="font-size:22px">paid Gemini API</div><div class="ct" style="margin-top:8px">Google AI Studio</div>', 260, 260, 640, 160, cls="card sel")
      + card(66.32, '<div class="mono g" style="font-size:22px">companies</div><div class="ct" style="margin-top:8px">Gemini for business</div>', 1020, 260, 640, 160)
      + txt(68.20, "Google AI Ultra subscribers:", 260, 480, 32, cls="lab")
      + card(69.18, '<div class="li">Gemini app</div>', 260, 540, 400, 90)
      + card(71.78, '<div class="li">AI Mode</div>', 700, 540, 400, 90)
      + card(72.48, f'<div class="li">{B}Antigravity{E}</div>', 1140, 540, 520, 90, cls="card sel")
      + note(73.60, "Google's answer to Claude Code", 1150, 660, 50, "up", 80, -80))

# what it is
scene(76.50, 91.72,
      txt(76.50, f"what is it {B}exactly{E}?", 0, 100, 70, align="center")
      + card(77.98, '<div class="mono g" style="font-size:22px">released weeks earlier</div><div class="ct" style="font-size:54px;margin-top:8px">Gemini 4 Argon</div>', 260, 280, 560, 180)
      + link(78.98, 860, 360, 200, "built on top")
      + card(79.4, f'<div class="mono g" style="font-size:22px">new</div><div class="ct" style="font-size:54px;margin-top:8px">Gemini 4 {B}Carbon{E}</div>', 1100, 280, 560, 180, cls="card sel")
      + card(84.80, '<div class="li">mixture-of-experts model</div>', 260, 540, 560, 90)
      + card(86.34, '<div class="li">heavy reinforcement learning on</div><div class="cs">reasoning · problem solving · theorem proving</div>', 260, 650, 760, 140))
scene(91.72, 102.72,
      txt(91.72, "Carbon pushes harder on two things", 0, 140, 56, align="center")
      + card(94.88, f'<div class="ct" style="font-size:56px;text-align:center">{B}cybersecurity{E}</div>', 300, 330, 620, 180, cls="card sel")
      + card(96.32, '<div class="ct" style="font-size:56px;text-align:center">long-horizon work</div>', 1000, 330, 620, 180)
      + note(99.16, "tasks that take hours, not seconds", 1040, 560, 52))
scene(102.72, 107.31,
      card(102.72, '<div class="mono g" style="font-size:22px">Google</div><div class="ct" style="font-size:52px;margin-top:10px">“Internally, our teams have seen Carbon run for <span class="blue">days</span>.”</div>', 360, 330, 1200, 240)
      + src(103.0, "Source: Google, “Gemini 4 Carbon: our next frontier model”, Oct 28, 2026", y=640))

scene(107.31, 122.22,
      txt(107.31, f'<span id="ctx">0</span> tokens', 300, 160, 130, cls="big")
      + txt(108.2, "context window", 300, 330, 40, cls="lab")
      + card(109.91, f'<div class="mono g" style="font-size:22px">new</div><div class="ct" style="font-size:52px;margin-top:8px">{B}long decode{E}</div><div class="cs">output way past the usual limits</div>', 300, 430, 640, 220, cls="card sel")
      + card(116.55, '<div class="li">a full multi-file code change</div>', 1040, 430, 580, 100)
      + card(118.0, '<div class="li">or a long proof</div>', 1040, 550, 580, 100)
      + note(119.5, "in a single response", 1060, 680, 54))
count("#ctx", 107.31, 0, 1000000, 0, "", "", 1.4)

# price
scene(122.22, 132.16,
      txt(122.22, f"now the {B}price{E}", 260, 70, 56)
      + mac(124.0, "gb_price", GB, (.30, .30, .99, .62), 260, 170, 1400, 124.0, 132.16)
      + note(125.24, "until November 30", 300, 880, 56))
price = ('<div class="mono g" style="font-size:24px">per million tokens</div>'
         '<div class="prow"><span class="pl">input</span><span class="old">$2</span><span class="new">$4</span></div>'
         '<div class="prow"><span class="pl">output</span><span class="old">$10</span><span class="new">$20</span></div>')
scene(132.16, 141.81,
      txt(132.16, f"from {B}December 1{E}", 560, 100, 64)
      + card(132.4, price, 560, 230, 800, 380, cls="card red")
      + note(136.47, "test it this month: cheap", 560, 680, 54)
      + note(140.21, "next month: it won't be", 1060, 760, 54)
      + src(133.0, "Source: Google price note via dev.to review", y=1000))
tl.append('tl.fromTo(".prow .old",{color:"#FFFFFF"},{color:"#6B7079",textDecoration:"line-through",duration:.25},134.3);'
          'tl.fromTo(".prow .new",{opacity:0,x:-10},{opacity:1,x:0,duration:.3,stagger:.2},134.5);')
scene(141.81, 147.45,
      txt(141.81, f'{B}−95%{E}', 0, 300, 220, align="center", cls="big")
      + txt(142.6, "on cached input", 0, 560, 50, align="center")
      + note(144.79, "helps a lot for long agent runs", 700, 660, 54))

scene(147.45, 157.09,
      mac(147.45, "gn_argon", GN, (.30, .28, .99, .60), 260, 150, 1400, 147.45, 157.09)
      + note(150.49, "Carbon and Argon: same price per token", 300, 880, 50)
      + note(153.3, "Google still recommends Argon for everyday work", 300, 950, 44))
scene(157.09, 165.37,
      card(157.09, f'<div class="mono g" style="font-size:22px">Carbon is for</div><div class="ct" style="font-size:56px;margin-top:8px">the {B}hardest{E} stuff</div>', 300, 300, 620, 220, cls="card sel")
      + card(159.73, '<div class="mono g" style="font-size:22px">but it uses a lot more tokens</div><div class="ct" style="margin-top:8px">so the same task usually costs more</div>', 1000, 300, 620, 220, cls="card red"))

# ---------- benchmarks: Google's own table
scene(165.37, 247.70,
      img(167.25, TBL, TX, TY, TW)
      + rowbox(183.77, "tb4", "rb1")
      + src(167.6, "Google DeepMind · Gemini 4 Carbon evals table (company-reported)", TX, TY + int(1009 * TS) + 8, center=False)
      + txt(165.37, f"okay, {B}benchmarks{E}", 1320, 90, 52)
      + note(178.65, "17 benchmarks", 1330, 190, 52)
      + txt(179.97, f'first on {B}15{E}', 1320, 270, 70, cls="big")
      + card(183.77, f'<div class="mono g" style="font-size:22px">Terminal-Bench 4.0</div><div class="big blue" style="font-size:84px;margin-top:8px">65.2%</div><div class="cs">GPT-6 Astra 59.1 · Opus 5.5 59.6</div>', 1320, 400, 480, 230, cls="card sel", eid="bm1")
      + card(196.57, f'<div class="mono g" style="font-size:22px">Agents\' Last Exam</div><div class="big blue" style="font-size:84px;margin-top:8px">77.4</div><div class="cs">Astra 73.1 · Opus 71.6</div>', 1320, 400, 480, 230, cls="card sel", eid="bm2")
      + card(207.94, f'<div class="mono g" style="font-size:22px">RiemannBench (math)</div><div class="big blue" style="font-size:84px;margin-top:8px">80%</div><div class="cs">GPT-6 Astra 72</div>', 1320, 400, 480, 230, cls="card sel", eid="bm3")
      + card(213.72, f'<div class="mono g" style="font-size:22px">Vending-Bench 2 · runs a vending business</div><div class="big blue" style="font-size:76px;margin-top:8px">$16,484</div><div class="cs">Astra $15,515 · Opus 5.5 $9,235</div>', 1320, 400, 480, 250, cls="card sel", eid="bm4")
      + note(232.64, "need an AI for your snack machine?", 1320, 670, 40)
      + card(237.84, f'<div class="mono g" style="font-size:22px">Blueprint-Bench 2 · room photo → floor plan</div><div class="big blue" style="font-size:84px;margin-top:8px">58.6</div><div class="cs">Opus 5.5 51.2</div>', 1320, 400, 480, 250, cls="card sel", eid="bm5"))
# move the row highlight and swap the stat card on each beat
for t, key in ((196.57, "ale"), (207.94, "riem"), (213.72, "vend"), (237.84, "blue")):
    dy = int((ROW[key] - ROW["tb4"]) * TS)
    tl.append(f'tl.to("#rb1",{{y:{dy},duration:.4,ease:"power3.inOut"}},{t:.2f});')
for a, b in (("bm1", 196.57), ("bm2", 207.94), ("bm3", 213.72), ("bm4", 237.84)):
    tl.append(f'tl.to("#{a}",{{opacity:0,duration:.2}},{b - .05:.2f});')
tl.append('tl.to("#rb1, #bm5",{opacity:0,duration:.3},247.4);')
# (the table scene now ends where the cyber scene begins)
scene(234.6, 237.6, meme(234.6, "cinema.png", 1420, 740, 300, 2))

# cyber charts (overlay on the table scene)
scene(247.70, 284.27,
      '<div class="dimbg" style="background:#000"></div>'
      + txt(247.70, f"and then {B}cybersecurity{E}: Carbon's main thing", 0, 60, 52, align="center")
      + img(251.69, "assets/raw/web/g_secbench-pro.png", 160, 170, 760)
      + img(256.63, "assets/raw/web/g_exploitgym.png", 1000, 170, 760)
      + card(251.69, '<div class="mono g" style="font-size:22px">SEC-bench Pro · finding real vulnerabilities</div><div class="big blue" style="font-size:64px">88.2%</div>', 160, 620, 760, 150, cls="card sel")
      + card(256.63, '<div class="mono g" style="font-size:22px">ExploitGym · proving a bug can be exploited</div><div class="big blue" style="font-size:64px">54.8%</div>', 1000, 620, 760, 150, cls="card sel")
      + note(262.21, "ahead of GPT-6 Astra (42.4) and even OpenAI's GPT-6 Cyber (48.5)", 300, 810, 42)
      + card(274.35, '<div class="li">CWE-bench · patching the root cause: <span class="blue">71%</span></div>', 300, 890, 820, 90)
      + note(278.97, "Google's own numbers, run without guardrails", 1160, 900, 40)
      + src(252.0, "Charts: Google DeepMind", y=1010))
scene(284.27, 302.81,
      img(284.27, TBL, TX, TY, TW)
      + rowbox(284.27, "fswe", "rb2")
      + txt(284.27, f"where did it {B}lose{E}?", 1320, 120, 56)
      + card(286.13, f'<div class="mono g" style="font-size:22px">FrontierSWE 2</div><div class="big" style="font-size:84px;margin-top:8px">61.2</div><div class="cs">GPT-6 Astra <span class="blue">65.5</span> · Opus 5.5 62.3</div>', 1320, 260, 480, 230, cls="card red")
      + note(299.29, "pure software engineering<br>isn't where it dominates", 1320, 540, 46))

# ---------- independent testing
scene(302.81, 320.65,
      txt(303.09, f"independent testing: {B}a bit messy{E}", 0, 60, 52, align="center")
      + tweet(308.33, "aa_launch", 260, 150, 620, .62)
      + txt(313.89, f'#1 at launch · {B}59{E}', 980, 300, 76, cls="big")
      + note(314.95, "1 ahead of Opus 5.5, 2 ahead of GPT-6 Astra", 990, 420, 44)
      + src(308.6, "@ArtificialAnlys on X · Oct 28, 2026", 260, 1000, center=False))
scene(320.65, 337.87,
      tweet(320.65, "aa", 260, 80, 620, .66)
      + note(320.9, "that lead lasted about 12 days", 980, 200, 52)
      + card(323.09, f'<div class="mono g" style="font-size:22px">Nov 9 · Claude Fable 5.2 (max)</div><div class="big" style="font-size:84px;margin-top:8px">65</div>', 980, 300, 620, 200, cls="card sel")
      + card(329.85, '<div class="li">Fable 5.2 holds the top three spots</div>', 980, 530, 620, 90)
      + card(334.23, f'<div class="li">Carbon: <span class="blue">4th</span> · updated score 60</div>', 980, 640, 620, 90))
scene(337.87, 362.81,
      tweet(337.87, "aa_cost", 220, 70, 520, .62)
      + txt(338.8, "cost per task (Artificial Analysis)", 860, 120, 36, cls="lab")
      + card(343.61, f'<div class="li">Gemini 4 Carbon</div><div class="big blue" style="font-size:60px">$7.76</div>', 860, 200, 440, 160, cls="card sel")
      + card(346.17, '<div class="li">Opus 5.5 (max)</div><div class="big" style="font-size:60px">~$10</div>', 1340, 200, 440, 160)
      + card(349.41, '<div class="li">GPT-6 Astra</div><div class="big" style="font-size:60px">~$6.25</div>', 860, 390, 440, 160)
      + card(352.39, '<div class="li">Fable 5.2 (max)</div><div class="big" style="font-size:60px;color:#F85149">~$26.5</div>', 1340, 390, 440, 160, cls="card red")
      + note(357.13, "not the smartest anymore…", 880, 620, 52)
      + note(359.05, "but one of the best value-for-money picks at the top", 880, 700, 44))
scene(362.81, 379.45,
      tweet(362.81, "vals", 220, 60, 600, .78)
      + txt(363.79, f'Vals AI: {B}#3{E} of 36', 920, 160, 76, cls="big")
      + note(366.11, "just behind Fable 5.2", 930, 270, 48)
      + card(368.37, '<div class="li">#1 on their finance index</div>', 920, 360, 600, 90, cls="card ok")
      + txt(370.95, "cost per test", 920, 490, 32, cls="lab")
      + card(370.95, f'<div class="li">Carbon <span class="blue">$10.5</span></div>', 920, 540, 300, 90, cls="card sel")
      + card(374.03, '<div class="li">Fable 5.2 $18</div>', 1240, 540, 300, 90)
      + card(376.63, '<div class="li">Opus 5.5 $25</div>', 1560, 540, 300, 90)
      + src(363.0, "@ValsAI on X · Nov 9, 2026", 220, 1000, center=False))
scene(379.45, 404.55,
      mac(379.45, "arc", "arcprize.org/leaderboard", (.22, .02, .98, .98), 160, 120, 760, 379.45, 404.55)
      + txt(379.6, "ARC Prize tested it on two", 1000, 110, 40, cls="lab")
      + card(381.77, f'<div class="mono g" style="font-size:22px">ARC-AGI-2</div><div class="big" style="font-size:64px;margin-top:6px"><span class="blue">94.2%</span> <span class="g" style="font-size:40px">vs Fable 5.2 93.8</span></div>', 1000, 180, 760, 170, cls="card sel")
      + card(389.59, f'<div class="mono g" style="font-size:22px">ARC-AGI-3 · newer, harder</div><div class="big" style="font-size:64px;margin-top:6px">65.1% <span class="g" style="font-size:40px">vs Fable 5.2 <span class="blue">81.2</span></span></div>', 1000, 380, 760, 170)
      + card(398.97, f'<div class="li">run cost: Carbon <span class="blue">~$7,200</span> · Fable ~$22,000</div>', 1000, 580, 760, 100))
scene(404.55, 415.05,
      card(404.55, f'<div class="mono g" style="font-size:22px">Arena · text leaderboard</div><div class="big blue" style="font-size:100px;margin-top:8px">#1</div>', 300, 300, 620, 260, cls="card sel")
      + note(409.07, "preliminary, lead inside the margin of error", 300, 600, 44)
      + card(412.59, f'<div class="mono g" style="font-size:22px">WebDev Arena</div><div class="big" style="font-size:100px;margin-top:8px">#4</div>', 1000, 300, 620, 260))

# hallucination
scene(415.05, 437.89,
      txt(415.05, "the result Google won't put in its ads", 0, 90, 40, align="center", cls="lab")
      + txt(418.55, f"{B}hallucination{E}", 0, 150, 90, align="center")
      + card(422.59, f'<div class="mono g" style="font-size:22px">knowledge test · answers correct</div><div class="big" style="font-size:80px;margin-top:6px"><span class="blue">58%</span> <span class="g" style="font-size:44px">vs Argon 48</span></div>', 260, 330, 680, 200, cls="card ok")
      + card(427.93, '<div class="li">but when it doesn\'t know…</div><div class="cs">it\'s more likely to make something up</div>', 1000, 330, 660, 200, cls="card red")
      + txt(432.73, f'hallucination rate: 4% → <span style="color:#F85149">11%</span>', 260, 620, 84, cls="big")
      + src(420.6, "Source: Artificial Analysis AA-Omniscience, via VentureBeat", y=1000))
scene(437.89, 450.96,
      mac(437.89, "vb_hall", "venturebeat.com", (.0, .0, .80, .75), 260, 120, 900, 437.89, 450.96)
      + note(438.79, "still the 2nd lowest measured, behind Argon", 1220, 260, 44)
      + note(442.67, "but going the wrong direction", 1220, 360, 52)
      + card(444.75, '<div class="li">legal · medical · financial?</div><div class="cs">test it on your own questions first</div>', 1220, 470, 520, 160, cls="card red"))
