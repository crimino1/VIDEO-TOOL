"""Claude Fable 5.2 Review: 0:00 to 3:45, timed to the user's transcript."""
from lib import *

ANT = "anthropic.com/claude-fable-and-mythos-5-2"
TOPC = (.0, .0, 1.0, .092)   # benchmark table: header + FrontierCode row
AUTOC = (.0, .0, 1.0, .206)  # header down to AutomationBench

# 0:00 hook (visible on frame 0)
scene(0, 4.12,
      img(0, "assets/img/anthropic_w.png", 760, 250, 400, cls="logo", eid="hooklogo")
      + txt(.6, '<span class="mono g">Nov 9, 2026</span>', 0, 340, 34, align="center")
      + txt(1.56, f"Claude {B}Fable 5.2{E}", 0, 400, 150, align="center")
      + underline(3.24, 660, 600, 600), fade_in=False)
tl.append('tl.set("#hooklogo",{opacity:1},0);')

scene(4.12, 7.59,
      vcard(4.12, 7.59, "x/x_launch.mp4", 11.5, 360, 150, 1200, 675, "@claudeai on X · Nov 9, 2026")
      + note(5.92, "+ Mythos 5.2", 1250, 880, 60, "up", -60, -80))

# same model, two versions
scene(7.59, 22.14,
      txt(7.59, "quick context", 0, 110, 40, align="center", cls="lab")
      + txt(9.01, f"same {B}underlying model{E}", 0, 170, 76, align="center")
      + card(12.27, f'<div class="mono g" style="font-size:22px">public version</div><div class="ct" style="font-size:54px;margin-top:8px">Fable 5.2</div><div class="cs">strong safety filters</div>', 300, 380, 600, 250, cls="card sel")
      + card(15.55, f'<div class="mono g" style="font-size:22px">restricted version</div><div class="ct" style="font-size:54px;margin-top:8px">Mythos 5.2</div><div class="cs">looser filters: cyber + biology</div>', 1020, 380, 600, 250)
      + note(19.53, "vetted organizations only", 1080, 670, 52, "up", 60, -80))

# what changed
scene(22.14, 30.95,
      txt(22.14, f"so what {B}changed{E}?", 0, 130, 80, align="center")
      + card(23.74, f'<div class="big blue" style="font-size:110px">30%</div><div class="ct" style="margin-top:6px">faster</div><div class="cs">than Fable 5.1 (up to)</div>', 360, 330, 540, 320, cls="card sel")
      + card(27.48, '<div class="big" style="font-size:110px;color:#3FB950">↓</div><div class="ct" style="margin-top:6px">cheaper</div><div class="cs">per token</div>', 1020, 330, 540, 320, cls="card ok")
      + note(28.36, "almost never happens with a top model", 620, 720, 52))

price = ('<div class="mono g" style="font-size:24px">per million tokens</div>'
         '<div class="prow"><span class="pl">input</span><span class="old">$10</span><span class="new">$8</span></div>'
         '<div class="prow"><span class="pl">output</span><span class="old">$50</span><span class="new">$40</span></div>')
scene(30.95, 36.48,
      card(31.04, price, 560, 250, 800, 380)
      + src(31.3, "Source: Anthropic, Nov 9, 2026", y=700))
tl.append('tl.fromTo(".prow .old",{color:"#FFFFFF"},{color:"#6B7079",textDecoration:"line-through",duration:.25},34.34);'
          'tl.fromTo(".prow .new",{opacity:0,x:-10},{opacity:1,x:0,duration:.3,stagger:.2},34.5);')

# fast mode
scene(36.48, 42.59,
      mac(36.48, "a_fast", ANT, (.25, .33, .79, .67), 260, 160, 1400, 36.48, 42.59)
      + card(38.14, f'<div class="ct">{B}fast mode{E}: up to 2.5× faster</div>', 260, 790, 760, 110, cls="card sel")
      + card(40.64, '<div class="ct" style="color:#F85149">costs double: $16 / $80</div>', 1060, 790, 600, 110, cls="card red"))

# Anthropic's own table
scene(42.59, 47.69,
      mac(42.59, "a_table_el", ANT, AUTOC, 360, 120, 1200, 42.59, 47.69)
      + note(44.75, "their numbers", 1220, 880, 56, "up", 40, -80))

# FrontierCode 2.0
scene(47.69, 66.61,
      txt(47.69, f"Frontier{B}Code{E} 2.0", 300, 150, 64)
      + txt(49.51, "agentic coding · Anthropic-reported", 300, 240, 28, cls="lab")
      + bars(47.69, [(52.45, "Fable 5.2", 49.1, True, "claude.png"), (55.41, "Opus 5.5", 45.5, False, "claude.png"),
                     (58.81, "GPT-6 Astra", 42.8, False, "openai_sym_w.png"), (61.71, "Fable 5.1", 32.4, False, "claude.png")], y=360, gap=110)
      + note(64.59, "+16.7 points in two months", 760, 840, 52)
      + src(48.0, "Source: Anthropic, Nov 9, 2026"))

# RoboDojo: Anthropic's real chart
scene(66.61, 81.92,
      txt(66.61, f"the robotics one is {B}wild{E}", 0, 70, 64, align="center")
      + txt(70.04, "model controls a simulated two-arm robot from camera images", 0, 160, 30, align="center", cls="lab")
      + mac(68.80, "a_robo", ANT, (.19, .0, .81, .60), 340, 230, 1000, 68.8, 81.92)
      + note(75.24, "Fable 5.2: 64.9%", 1420, 300, 52, "left", -90, 40)
      + note(78.86, "GPT-6 Astra: 29.8%", 1420, 520, 46)
      + note(80.74, "more than double", 1420, 620, 56))

# real robots
scene(81.92, 87.15,
      vcard(81.92, 87.15, "x/x_robots.mp4", 0.3, 360, 150, 1200, 675, "@claudeai on X · Fable 5.2 controlling real robot arms")
      + note(84.0, "puzzle cube", 1590, 300, 50, "left", -90, 30))
scene(84.9, 87.15,  # bottle cap moment, same frame position
      vcard(84.9, 87.15, "x/x_robots.mp4", 6.2, 360, 150, 1200, 675)
      + note(85.22, "bottle cap", 1590, 300, 50, "left", -90, 30))

# doesn't win everything
scene(87.15, 93.59,
      mac(87.15, "a_table_el", ANT, AUTOC, 360, 120, 1200, 87.15, 93.59)
      + logo(88.87, "gemini_w.png", 1400, 860, 300)
      + note(89.85, "Gemini 4 Carbon wins AutomationBench", 380, 880, 50))

# independent testers
scene(93.59, 101.63,
      txt(93.59, f"what {B}independent testers{E} found", 0, 100, 70, align="center")
      + tweet(98.55, "aa", 160, 260, 380, .55, "pop")
      + tweet(99.0, "vals", 590, 300, 380, .55, "pop")
      + tweet(99.47, "arc", 1020, 260, 380, .6, "pop")
      + tweet(99.9, "yuchen", 1450, 300, 330, .75, "pop")
      + note(98.9, "X was full of tests within hours", 640, 900, 52))

# Artificial Analysis
scene(101.63, 107.70,
      tweet(101.63, "aa", 620, 60, 680, .62)
      + src(101.9, "@ArtificialAnlys on X · Nov 9, 2026", y=1010))
scene(107.70, 117.60,
      mac(107.70, "aa_full", "artificialanalysis.ai", (.004, .0325, .28, .0605), 560, 130, 760, 107.7, 117.6)
      + note(108.5, "#1 · score 65", 1490, 300, 58, "left", -90, 40)
      + note(110.0, "Gemini 4 Carbon 60 · Opus 5.5 59 · GPT-6 Astra 57", 470, 960, 44)
      + note(114.52, "~15 points above Fable 5.1", 1490, 520, 46))

# Terminal-Bench 4.0
scene(117.60, 126.10,
      txt(117.60, f"Terminal-Bench {B}4.0{E}", 300, 150, 64)
      + txt(117.8, "as reported by Artificial Analysis", 300, 240, 28, cls="lab")
      + bars(117.6, [(124.56, "Kimi K3.1 Pro", 67, True, "kimi.png"), (119.56, "Fable 5.2", 60, False, "claude.png"), (121.26, "Opus 5.5", 60, False, "claude.png")], y=380)
      + note(122.9, "level with Opus, behind Kimi", 760, 780, 50))

# cost
scene(126.10, 135.72,
      mac(126.10, "aa_full", "artificialanalysis.ai", (.553, .0325, .828, .0605), 380, 150, 740, 126.1, 135.72)
      + txt(128.18, f'{B}$26.5{E}', 1290, 300, 130, cls="big")
      + txt(128.5, "per task, max effort (avg)", 1290, 450, 32, cls="lab")
      + note(132.18, "~2.6× Opus 5.5", 1290, 540, 58))
scene(135.72, 144.04,
      card(135.72, f'<div class="mono g" style="font-size:22px">high effort</div><div class="ct" style="margin-top:8px">still beats every other model</div>', 300, 330, 620, 190, cls="card sel")
      + card(138.84, f'<div class="big blue" style="font-size:96px">−40%</div><div class="cs">output tokens vs Opus 5.5 at max</div>', 1000, 330, 620, 260)
      + src(136.0, "Source: Artificial Analysis", y=700))

# Vals AI
scene(144.04, 151.98,
      tweet(144.04, "vals", 620, 40, 680, .62)
      + note(147.52, "#1 · leads 7 benchmarks", 1350, 380, 52, "left", -90, 30)
      + txt(149.18, "coding · finance · science", 1360, 470, 32, cls="lab"))

# max made it worse
scene(151.98, 161.45,
      txt(151.98, "the finding that got shared a lot", 0, 120, 40, align="center", cls="lab")
      + txt(154.83, f"max effort made it {B}worse{E}", 0, 180, 84, align="center")
      + card(158.03, f'<div class="big" style="font-size:120px;text-align:center">#1 <span class="g">→</span> <span style="color:#F85149">#7</span></div>', 300, 380, 640, 240)
      + note(159.81, "at nearly 3× the cost", 380, 650, 54)
      + meme(155.6, "pikachu.jpg", 1100, 340, 520, 2))
scene(161.45, 170.85,
      txt(161.45, "Vals says, at max effort it…", 300, 160, 40, cls="lab")
      + card(162.42, '<div class="li">spends way more time on tasks</div>', 300, 260, 1000, 100, cls="card red")
      + card(163.99, '<div class="li">often fails to finish</div>', 300, 390, 1000, 100, cls="card red")
      + card(166.31, '<div class="li">runs out of time or tokens</div>', 300, 520, 1000, 100, cls="card red")
      + card(168.49, f'<div class="li">{B}High effort{E} = best setting overall</div>', 300, 690, 1000, 100, cls="card ok")
      + check(168.8, 1330, 710))

# Yuchen
scene(170.85, 177.29,
      tweet(170.85, "yuchen", 620, 70, 680)
      + note(173.6, "the max-effort result", 1340, 260, 50, "left", -90, 30)
      + src(171.1, "@Yuchenj_UW on X · Nov 9, 2026", y=1010))

# refusals
scene(177.29, 186.30,
      txt(177.29, f"Fable still {B}refuses{E} a lot", 0, 200, 80, align="center")
      + card(181.29, f'<div class="big" style="font-size:100px;color:#F85149;text-align:center">10%+</div><div class="cs" style="text-align:center">refusals in some areas</div>', 660, 360, 600, 250, cls="card red")
      + note(183.63, "mostly code migration tasks", 720, 660, 54)
      + src(177.6, "Source: Vals AI", y=760))

# ARC Prize
scene(186.30, 193.40,
      tweet(186.30, "arc", 600, 40, 720, .82)
      + note(189.82, "verified within minutes", 1360, 300, 50, "left", -90, 30))
scene(193.40, 201.44,
      mac(193.40, "arc", "arcprize.org/leaderboard", (.22, .02, .98, .98), 260, 120, 1000, 193.4, 201.44)
      + txt(193.6, f'{B}81.2%{E}', 1340, 260, 120, cls="big")
      + txt(193.8, "ARC-AGI-3 · standard harness · new high", 1340, 400, 28, cls="lab")
      + note(195.26, "~18 points above GPT-6 Astra", 1340, 470, 46)
      + note(198.36, "full run: ~$22,000", 1340, 560, 54))

# ARC-AGI-2
scene(201.44, 214.12,
      txt(201.44, f"ARC-AGI-{B}2{E}", 300, 150, 64)
      + txt(201.6, "verified by ARC Prize", 300, 240, 28, cls="lab")
      + bars(201.44, [(207.82, "GPT-6 Astra", 95.0, False, "openai_sym_w.png"), (210.02, "GPT-6.1 Sol", 94.2, False, "openai_sym_w.png"), (203.72, "Fable 5.2", 93.8, True, "claude.png")], y=380, wmax=900)
      + note(205.46, "actually third", 300, 760, 56))

# Cognition
scene(214.12, 225.76,
      tweet(214.12, "cognition", 300, 60, 640, .78)
      + card(217.94, f'<div class="mono g" style="font-size:22px">Fable 5.2 at low effort</div><div class="ct" style="margin-top:8px">beats Fable 5.1\'s score</div>', 1060, 300, 600, 180, cls="card sel")
      + card(222.0, f'<div class="big blue" style="font-size:90px">⅓</div><div class="cs">of the cost</div>', 1060, 520, 600, 200)
      + src(214.4, "@cognition (makers of Devin) on X · Nov 9, 2026", 300, 1010, center=False))
