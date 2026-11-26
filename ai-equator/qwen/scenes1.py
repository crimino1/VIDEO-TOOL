"""Qwen 4 Max review: 0:00 to 3:41. All on-screen names and numbers come from the sources, not the transcript."""
from lib import *
from toon import *
from props import *

QB = "qwen.ai/blog?id=qwen4-max"
X0 = [.030, .278, .525, .772]   # Alibaba's 4x4 benchmark chart panels
Y0 = [.012, .250, .490, .728]
LAB = '<div class="room" style="background:linear-gradient(#2E3F63 0 64%,#222B45 64%)"></div>'


def panel(t, c, r, x, y, w, eid=None):
    s, _ = page_img("q_table", (X0[c], Y0[r], X0[c] + .215, Y0[r] + .205))
    return img(t, s, x, y, w, cls="im chartp", eid=eid)


def fix(t, text, x, y, w=620):
    """An honest on-screen correction where the narration and the source disagree."""
    return card(t, f'<div class="mono" style="font-size:22px;color:#F0A818">source check</div><div class="li" style="margin-top:6px">{text}</div>', x, y, w, None, cls="card fixc")


# ---------- hook: Alibaba's own launch film at 80%, visible on frame 0
scene(0, 8.30, clip80(0, 8.30, "x/yt_official.mp4", 0.5, "Qwen · “Qwen4-Max is now available.”", instant=True), fade_in=False)
scene(0, 8.30,
      chip(0.3, "Alibaba just launched Qwen4-Max", 230, 110)
      + chip(3.04, "the new flagship of the Qwen family", 230, 190)
      + ov(5.46, "Alibaba calls it a “frontier model”", 1150, 860, 46), fade_in=False)

scene(8.30, 19.22,
      txt(8.30, "on output tokens", 0, 110, 40, align="center", cls="lab")
      + card(8.92, '<img src="assets/img/qwen_w.png" alt="" style="width:64px;height:64px;vertical-align:middle;margin-right:16px"><span class="ct">Qwen4-Max</span><div class="big blue" style="font-size:110px;margin-top:10px">$4.50</div><div class="cs">per million output tokens</div>', 260, 200, 620, 330, cls="card sel")
      + card(10.72, '<img src="assets/img/claude.png" alt="" style="width:60px;height:60px;vertical-align:middle;margin-right:16px"><span class="ct">Claude Fable 5.2</span><div class="big" style="font-size:110px;margin-top:10px;color:#F85149">$40</div><div class="cs">per million output tokens</div>', 1040, 200, 620, 330, cls="card red")
      + txt(11.6, f'≈ {B}9× cheaper{E} on output', 0, 600, 76, align="center", cls="big")
      + note(12.76, "is it actually that good…", 560, 730, 54)
      + note(16.10, "…or is the price the only frontier thing about it?", 520, 810, 50))

pl = [(21.98, "what it is"), (23.08, "what it costs"), (24.24, "how it scores"), (25.58, "vs the top models"), (27.06, "real-world tests")]
inner = txt(19.22, f"reviewing {B}Qwen4-Max{E}", 0, 150, 76, align="center")
for i, (t, lab) in enumerate(pl):
    inner += card(t, f'<div class="mono g" style="font-size:22px">0{i + 1}</div><div class="ct" style="margin-top:6px">{lab}</div>', 170 + i * 320, 420, 290, 150, cls="card sel" if i == 4 else "card")
scene(19.22, 30.30, inner)

# ---------- the news
scene(30.30, 38.38,
      txt(30.30, "let's start with the news", 260, 70, 40, cls="lab")
      + tweet(32.38, "launch", 260, 130, 640, .70)
      + txt(32.6, '<span class="mono g">Nov 16, 2026</span>', 1000, 200, 34)
      + txt(33.4, f'officially {B}launched{E}', 1000, 260, 76)
      + note(35.76, "but the Qwen4 family isn't brand new", 1010, 400, 46)
      + src(32.6, "@Alibaba_Qwen on X · Nov 16, 2026", 260, 1000, center=False))
scene(38.38, 54.32,
      mac(38.38, "ac_apsara", "alibabacloud.com/blog", (.0, .25, .78, .95), 160, 120, 900, 38.38, 54.32)
      + txt(39.0, '<span class="mono g">Sept 22, 2026 · Apsara Conference, Hangzhou</span>', 1120, 140, 28)
      + tweet(43.58, "apsara", 1120, 200, 620, .80)
      + card(49.98, '<div class="li">only names on a slide</div>', 160, 820, 420, 90, cls="card dash")
      + card(52.0, '<div class="li">no specs · no prices · no benchmarks</div>', 620, 820, 640, 90, cls="card red"))
scene(54.32, 60.64,
      '<div class="tline" style="left:300px;top:520px;width:1320px"></div>'
      + el(54.32, '<i class="dot"></i><div class="big" style="font-size:56px;margin-top:24px">Nov 11</div><div class="ct" style="font-size:34px;margin-top:6px">preview opens</div>', "left:280px;top:506px;width:520px", "tp")
      + el(57.64, f'<i class="dot hero"></i><div class="big" style="font-size:56px;margin-top:24px">{B}Nov 16{E}</div><div class="ct" style="font-size:34px;margin-top:6px">Max goes live</div>', "left:1300px;top:506px;width:520px", "tp")
      + note(57.9, "five days later", 820, 400, 56)
      + tweet(54.6, "preview", 760, 600, 420, .35))

# ---------- what you get: Alibaba's official 3D-design demo at 80%
scene(60.64, 70.00, clip80(60.64, 70.00, "x/x_3d.mp4", 12.0, "@Alibaba_Qwen on X · Qwen4-Max 3D understanding & design demo"))
scene(60.64, 70.00,
      chip(61.86, "1,000,000-token context window", 230, 110)
      + chip(64.22, "three thinking levels:", 230, 190)
      + chip(65.82, "low", 600, 190) + chip(66.54, "high", 720, 190) + chip(66.92, "xhigh", 850, 190)
      + ov(68.02, "high is the default", 230, 270, 44))

price = ('<div class="mono g" style="font-size:24px">per million tokens</div>'
         '<div class="prow"><span class="pl">input</span><span class="new">$1.50</span><span class="old" style="color:#8A8F98">vs Fable 5.2 $8</span></div>'
         '<div class="prow"><span class="pl">output</span><span class="new">$4.50</span><span class="old" style="color:#8A8F98">vs Fable 5.2 $40</span></div>')
scene(70.00, 83.60,
      txt(70.00, f"the price is the {B}headline{E}", 260, 90, 64)
      + card(71.90, price, 260, 220, 1400, 380, cls="card sel")
      + note(80.9, "“9× cheaper” = output only (input ≈ 5×)", 280, 680, 44)
      + src(72.2, "Sources: Alibaba Cloud Model Studio pricing · Anthropic", y=1000))
tl.append('tl.fromTo(".prow .old",{opacity:0},{opacity:1,duration:.3,stagger:.3},77.64);')

scene(83.60, 94.16,
      card(83.60, '<div class="mono g" style="font-size:22px">try it</div><div class="ct" style="margin-top:8px">Qwen Chat / Qwen Studio</div>', 160, 150, 620, 170)
      + fix(84.6, "Alibaba's launch post names Qwen Studio, QwenWork and Qoder", 160, 360, 620)
      + mac(86.42, "tp_page", "qwencloud.com/pricing/token-plan", (.10, .02, .90, .55), 860, 140, 900, 86.42, 94.16)
      + note(89.74, "Token Plan: from about $6 a month", 880, 720, 50)
      + note(91.94, "or $3 for new users", 880, 800, 50))

scene(94.16, 105.16,
      LAB
      + txt(94.16, f"what it's {B}not{E}: open source", 0, 70, 64, align="center")
      + '<div class="toon" id="lock" style="left:250px;top:260px;width:360px;height:420px"><svg width="360" height="420" viewBox="0 0 360 420"><path d="M90 190 V120 A90 90 0 0 1 270 120 V190" fill="none" stroke="#17181C" stroke-width="30"/><path d="M90 190 V120 A90 90 0 0 1 270 120 V190" fill="none" stroke="#C9D1DC" stroke-width="18"/><rect x="40" y="180" width="280" height="220" rx="34" fill="#F2B33D" stroke="#17181C" stroke-width="8"/><circle cx="180" cy="270" r="26" fill="#17181C"/><rect x="170" y="280" width="20" height="60" rx="6" fill="#17181C"/></svg></div>'
      + card(97.06, '<div class="ct">Qwen4-Max weights: closed</div>', 760, 280, 860, 120, cls="card red")
      + card(99.64, '<div class="ct">smaller Qwen4 models: open weights “coming”</div><div class="cs">no date given</div>', 760, 440, 860, 170, cls="card dash"))
appear("lock", 95.0)

scene(105.16, 124.14,
      txt(105.16, "and the size?", 160, 70, 56)
      + chip(106.36, "“2.4 trillion parameters” everywhere online", 160, 170)
      + img(108.0, "assets/raw/web/q_arch.png", 160, 260, 520, cls="im chartp")
      + note(111.44, "narration: “2.4T is Qwen3.8-Max's size”", 760, 260, 44)
      + fix(113.0, "Alibaba's Qwen4-Max blog: <b>2.4T backbone parameters, 71B activated per token</b>, plus 328B N-gram embedding parameters", 760, 340, 960)
      + card(117.9, '<div class="li">Qwen3.8-Max was also 2.4T in total (95B active)</div><div class="cs">so Qwen4-Max keeps the size and activates ~25% fewer parameters</div>', 760, 560, 960, 160)
      + src(108.3, "Architecture diagram and text: qwen.ai/blog?id=qwen4-max, Nov 16, 2026", 160, 1000, center=False))

# ---------- benchmarks: Alibaba's real chart
scene(124.14, 159.80,
      txt(124.14, f"okay, {B}benchmarks{E}", 160, 50, 56)
      + img(126.0, "assets/raw/web/q_table.png", 160, 140, 1200, cls="im chartp")
      + txt(131.48, "Alibaba's chart compares Qwen4-Max with", 1400, 160, 30, cls="lab", w=400)
      + chip(134.18, "Claude Opus 5.5", 1400, 260) + chip(136.56, "GPT-6.1 Sol", 1400, 340) + chip(139.0, "Kimi K3.1", 1400, 420)
      + card(142.98, '<div class="li">not in it: Fable 5.2 · Gemini 4 Carbon</div>', 1400, 520, 420, 130, cls="card red")
      + fix(146.6, "GPT-6 Astra <b>is</b> in Alibaba's chart (last-but-one column)", 1400, 680, 420)
      + note(154.28, "lined up against the next tier", 300, 960, 46)
      + src(126.3, "Chart: @Alibaba_Qwen launch post / qwen.ai blog", 160, 1010, center=False))

scene(159.80, 185.38,
      txt(159.80, f"where it {B}wins{E}", 0, 50, 60, align="center")
      + panel(161.56, 0, 0, 120, 170, 540, "pw1") + panel(168.24, 1, 1, 690, 170, 540, "pw2") + panel(175.38, 0, 2, 1260, 170, 540, "pw3")
      + card(164.5, f'<div class="mono g" style="font-size:22px">DeepSWE v1.1 · coding agent</div><div class="big blue" style="font-size:64px">75.7</div>', 120, 600, 540, 150, cls="card sel")
      + card(172.18, f'<div class="mono g" style="font-size:22px">Agents\' Last Exam v1.1</div><div class="big blue" style="font-size:64px">46.7</div>', 690, 600, 540, 150, cls="card sel")
      + card(178.56, f'<div class="mono g" style="font-size:22px">HLAB-Vals-1.1 · legal agents</div><div class="big blue" style="font-size:64px">21.3 <span class="g" style="font-size:36px">vs Opus 9.2</span></div>', 1260, 600, 540, 150, cls="card sel")
      + note(183.70, "that one's a blowout", 1300, 790, 56))
scene(185.38, 208.48,
      txt(185.38, f"where it {B}loses{E}", 0, 50, 60, align="center")
      + panel(187.26, 2, 0, 120, 170, 540) + panel(195.44, 3, 0, 690, 170, 540) + panel(202.34, 1, 3, 1260, 170, 540)
      + card(189.0, f'<div class="mono g" style="font-size:22px">Terminal-Bench 4.0</div><div class="big" style="font-size:56px;color:#F85149">48.5</div><div class="cs">Opus 59.6 · Kimi 67.2</div>', 120, 600, 540, 190, cls="card red")
      + card(197.16, f'<div class="mono g" style="font-size:22px">ProgramBench</div><div class="big" style="font-size:56px;color:#F85149">31.5</div><div class="cs">Opus 65, more than double</div>', 690, 600, 540, 190, cls="card red")
      + card(204.20, f'<div class="mono g" style="font-size:22px">Humanity\'s Last Exam</div><div class="big" style="font-size:56px;color:#F85149">51.7</div><div class="cs">Opus 59.8</div>', 1260, 600, 540, 190, cls="card red"))
scene(208.48, 220.70,
      txt(208.48, "count it up: rows topped in Alibaba's own chart", 0, 90, 48, align="center")
      + card(209.38, f'<img src="assets/img/qwen_w.png" alt="" style="width:60px;height:60px;vertical-align:middle;margin-right:14px"><span class="ct">Qwen4-Max</span><div class="big blue" style="font-size:120px">3–4</div>', 300, 240, 600, 300, cls="card sel")
      + card(212.68, f'<img src="assets/img/claude.png" alt="" style="width:56px;height:56px;vertical-align:middle;margin-right:14px"><span class="ct">Claude Opus 5.5</span><div class="big" style="font-size:120px">7</div>', 1020, 240, 600, 300)
      + fix(210.5, "counting every chart panel, Qwen tops 4 (DeepSWE, Agents' Last Exam, HLAB, BioMysteryBench)", 300, 580, 1320)
      + note(216.44, "…in the chart where Alibaba picked the opponents", 420, 760, 52))
