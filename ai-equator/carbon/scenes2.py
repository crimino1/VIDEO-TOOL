"""Gemini 4 Carbon: 7:31 to the end, timed to the user's transcript. Every clip at 80% of the frame."""
from lib import *

PE = "x/pe.mp4"
PEC = "Prompt Engineering on YouTube · “Gemini 4 Carbon Is Finally Here”"

# ---------- what people built
scene(450.96, 455.22,
      txt(450.96, "okay, now the fun part", 0, 380, 44, align="center", cls="lab")
      + txt(452.0, f"what did people {B}actually build{E}?", 0, 450, 90, align="center"))

# Pawel Huryn: 105 bugs
scene(455.22, 467.18,
      tweet(455.22, "huryn", 260, 50, 600, .72)
      + txt(458.90, "one of the most useful tests", 960, 160, 40, cls="lab")
      + card(459.64, '<div class="li">two real code repositories</div>', 960, 240, 660, 90)
      + card(461.50, f'<div class="li">{B}105{E} planted bugs</div>', 960, 350, 660, 90, cls="card sel")
      + card(463.34, '<div class="li">find and fix as many as you can</div>', 960, 460, 660, 90)
      + src(455.5, "@PawelHuryn on X · Nov 11, 2026", 260, 1000, center=False))
rows = [(467.18, "Fable 5.2 (max)", "58", "$140", "claude.png", False), (472.76, "Gemini 4 Carbon", "57.3", "$31", "gemini_icon.png", True),
        (482.36, "Sonnet 5.5", "51", "$154", "claude.png", False), (487.70, "GPT-6 Astra", "45", "", "openai_sym_w.png", False), (490.74, "Gemini 4 Argon", "~41", "", "gemini_icon.png", False)]
inner = txt(467.18, "bugs found and fixed (score) · cost", 260, 90, 40, cls="lab")
for i, (t, lab, sc, cost, lg, hero) in enumerate(rows):
    y = 170 + i * 130
    inner += card(t, f'<img src="assets/img/{lg}" alt="" style="width:44px;height:44px;object-fit:contain;vertical-align:middle;margin-right:18px"><span class="ct">{lab}</span>'
                  f'<span class="big{" blue" if hero else ""}" style="position:absolute;right:300px;top:22px;font-size:60px">{sc}</span>'
                  f'<span class="big" style="position:absolute;right:40px;top:22px;font-size:60px;color:{"#3FB950" if hero else "#8A8F98"}">{cost}</span>', 260, y, 1400, 110, cls="card sel" if hero else "card")
inner += note(478.56, "basically the same result for less than a quarter of the price", 300, 850, 46)
scene(467.18, 493.49, inner)

# Every / Dan Shipper
scene(493.49, 515.61,
      tweet(493.49, "shipper", 220, 60, 580, .75)
      + img(494.5, "assets/raw/web/every.png", 900, 70, 820, cls="im")
      + card(501.07, '<div class="li">a much better coder than Argon</div>', 900, 600, 620, 90, cls="card ok")
      + card(503.19, '<div class="li">but keeping Argon for writing</div>', 900, 700, 620, 90)
      + txt(505.63, f'senior-engineer benchmark: {B}44%{E} vs Argon 21%', 220, 900, 44)
      + note(512.93, "…still middle of the pack", 1300, 820, 46))
scene(515.61, 533.03,
      txt(515.61, "their biggest complaint", 0, 90, 40, align="center", cls="lab")
      + txt(516.6, f"it doesn't know when to {B}stop{E}", 0, 150, 80, align="center")
      + card(520.92, '<div class="mono g" style="font-size:22px">one teammate</div><div class="ct" style="margin-top:8px">gave it a backlog of tasks</div>', 260, 330, 560, 170)
      + link(523.3, 840, 410, 120)
      + card(523.81, f'<div class="ct">decided <span class="blue">6</span> were ready…</div><div class="cs">then did <b style="color:#F85149">15</b>, incl. work someone else was doing</div>', 980, 330, 680, 170, cls="card red")
      + note(529.85, "stopped it after almost 4.5 hours", 300, 600, 56)
      + meme(526.9, "megamind.jpg", 1300, 560, 360, 2))
scene(533.03, 544.81,
      card(533.03, '<div class="mono g" style="font-size:22px">another teammate</div><div class="ct" style="font-size:48px;margin-top:8px">3D scans of their podcast studio</div>', 300, 260, 1320, 170, cls="card sel")
      + link(537.0, 880, 470, 160)
      + card(537.77, '<div class="li">one try: an accurate browser 3D model</div><div class="cs">to check if new gear fits without showing on camera</div>', 300, 540, 1320, 160)
      + src(533.3, "Source: Every vibe check / @danshipper, Nov 10, 2026", y=1000))

# Stefan: Carbon vs Argon 3D (square clip, 80% of the frame height)
scene(544.81, 567.56,
      vcard(544.81, 567.56, "x/x_stefan.mp4", 0.0, 528, 88, 864, 864)
      + src(544.81, "@Stefan_3D_AI on X · Nov 11, 2026", 528, 968, center=False))
scene(544.81, 567.56,
      ov(544.9, "3D is where people seem most impressed", 120, 110, 40)
      + chip(553.95, "Argon: 14 min · disappointed", 80, 400, "ovc red")
      + chip(557.37, "Carbon: 81 min", 1440, 300)
      + chip(559.45, "186K output tokens", 1440, 390)
      + chip(562.37, "~$4.50", 1440, 480)
      + ov(564.67, "“redeemed Google on 3D”", 1380, 600, 44))

# Chetaslua: Greek world
scene(567.56, 581.35, clip80(567.56, 581.35, "x/x_chet.mp4", 2.0, "@chetaslua on X · Gemini 4 Carbon, Greek world in Three.js"))
scene(567.56, 581.35,
      chip(570.96, "4,000 lines in one shot", 230, 120)
      + chip(573.44, "a Greek world in Three.js", 230, 200)
      + ov(576.61, "Google models used to be lazy… that seems fixed", 560, 860, 44))

# Pankaj Kumar
scene(581.35, 594.55,
      tweet(581.35, "pankaj", 160, 120, 560)
      + tweet(582.0, "pankaj2", 760, 160, 520)
      + card(583.27, '<div class="li">agrees: no more laziness</div>', 1340, 160, 440, 90, cls="card ok")
      + card(584.23, '<div class="li">3D taste & colors: great</div>', 1340, 270, 440, 90, cls="card ok")
      + card(586.19, '<div class="li">slight edge: Opus 5.5</div>', 1340, 380, 440, 90)
      + note(589.89, "web design & front end:<br>“generic AI slop”", 1340, 500, 46)
      + src(581.6, "@pankajkumar_dev on X", 160, 1000, center=False))

# Lumina: helicopter
scene(594.55, 608.51, clip80(594.55, 608.51, "x/x_lumina.mp4", 30.0, "@LuminaBench on X · 3D helicopter, Opus 5.5 vs Gemini 4 Carbon"))
scene(594.55, 608.51,
      chip(599.03, "Carbon: a bit over 30 min", 1160, 120)
      + chip(601.11, "Opus 5.5: 55 min", 230, 120, "ovc red")
      + ov(604.01, "preferred Carbon's design · Opus more polished overall", 380, 860, 42))

# ---------- the long runs
scene(608.51, 614.21,
      txt(608.51, "the long-run experiments", 0, 400, 50, align="center", cls="lab")
      + txt(610.75, f"the “{B}this is the future{E}” part", 0, 470, 90, align="center"))
for a, b, ss in ((614.21, 621.27, 460.0), (621.27, 630.17, 550.0), (630.17, 639.67, 622.0), (639.67, 650.17, 1030.6)):
    scene(a, b, clip80(a, b, PE, ss, PEC))
scene(614.21, 630.17,
      chip(615.83, "Qila Bala Hissar · Peshawar, Pakistan", 1060, 120)
      + ov(618.69, "~30 sources: old records, aerial photos, satellite images", 760, 860, 40)
      + ov(625.01, "undocumented parts labelled “inferred”, not faked", 760, 790, 40))
scene(630.17, 650.17,
      ov(630.17, "every 10 passes: a fresh sub-agent scores renders vs real photos", 300, 860, 40)
      + chip(636.59, "65 passes · ~20 hours", 1300, 640)
      + chip(639.67, "score: 3 → 5 / 10", 1300, 720)
      + ov(643.81, "not photo-real, but honest about it", 1060, 120, 44)
      + ov(645.47, "also fixed 2 bugs in the open-source 3D engine", 900, 200, 40))
scene(650.17, 655.09, clip80(650.17, 655.09, PE, 770.0, PEC))
scene(655.09, 658.51, clip80(655.09, 658.51, PE, 795.0, PEC))
scene(658.51, 662.76, clip80(658.51, 662.76, PE, 731.0, PEC))
scene(650.17, 655.09, chip(650.17, "colliding galaxies · 500,000+ stars", 1120, 120))
scene(655.09, 658.51, chip(655.09, "four-legged robot: falling over → sprinting", 1000, 120))
scene(658.51, 662.76, chip(658.51, "interactive jet engine cutaway, slice at any angle", 230, 860))

# Breakout weights by hand
scene(662.76, 675.34, clip80(662.76, 675.34, PE, 860.0, PEC))
scene(675.34, 685.96, clip80(675.34, 685.96, PE, 890.0, PEC))
scene(662.76, 685.96,
      ov(663.0, "a really weird one", 230, 120, 50)
      + chip(666.62, "a neural network for Breakout, written by hand", 230, 210)
      + chip(670.76, "no training · ~20,000 weights typed directly", 230, 290)
      + chip(675.34, "average: 217 points a game", 1220, 700)
      + chip(681.06, "harder game: failed", 1320, 600, "ovc red")
      + ov(682.08, "high effort sometimes burned its whole reply limit just thinking", 300, 860, 40))

# Pomodoro app
scene(685.96, 702.38,
      txt(685.96, "on apps", 260, 80, 40, cls="lab")
      + txt(687.99, f"“the ultimate macOS {B}Pomodoro{E} timer”", 260, 140, 64)
      + card(692.76, '<div class="li">a full Swift app</div>', 260, 330, 520, 90, cls="card sel")
      + card(695.38, '<div class="li">menu bar controller</div>', 260, 440, 520, 90)
      + card(696.86, '<div class="li">project tracking</div>', 260, 550, 520, 90)
      + card(698.04, '<div class="li">focus audio</div>', 260, 660, 520, 90)
      + note(699.32, "none of it explicitly asked for", 860, 560, 56)
      + src(688.2, "Source: MindStudio, “Gemini 4 Carbon overview” (independent test)", y=1000))

# security results
scene(702.38, 723.74,
      txt(702.38, f"on the {B}security{E} side", 0, 90, 60, align="center")
      + card(703.96, f'<div class="mono g" style="font-size:22px">via security firm Wiz</div><div class="ct" style="margin-top:8px">real <span class="blue">zero-day</span> vulnerabilities in two large software companies</div><div class="cs">in under two hours of scanning</div>', 260, 260, 680, 300, cls="card sel")
      + card(713.80, '<div class="mono g" style="font-size:22px">Google Cloud security team</div><div class="ct" style="margin-top:8px">working exploits for two known bugs in a popular open-source project</div><div class="cs">so the bugs could be properly patched</div>', 1000, 260, 660, 300)
      + src(704.2, "Source: Google, “Gemini 4 Carbon is now available”, Nov 10, 2026", y=1000))

# complaints
scene(723.74, 754.84,
      txt(723.74, f"now the {B}complaints{E}", 0, 70, 60, align="center")
      + card(726.72, f'<div class="mono g" style="font-size:22px">speed · Artificial Analysis</div><div class="big" style="font-size:80px;margin-top:6px">~80 <span class="g" style="font-size:40px">tokens / sec</span></div>', 260, 200, 640, 200, cls="card red")
      + card(731.93, f'<div class="mono g" style="font-size:22px">one of the wordiest models tested</div><div class="big" style="font-size:80px;margin-top:6px">70th <span class="g" style="font-size:40px">of 73</span></div>', 1020, 200, 640, 200, cls="card red")
      + card(737.32, '<div class="li">high thinking: about a minute before the first word</div>', 260, 450, 1400, 90)
      + card(742.30, '<div class="mono g" style="font-size:22px">Hacker News · majdalsado</div><div class="ct" style="margin-top:8px">“p75 TTFT of 60s and a TPS of 10. Model is <span style="color:#F85149">completely unusable at the moment</span>.”</div>', 260, 580, 1400, 170)
      + note(749.31, "an Ultra subscriber: barely finished one project before hitting limits", 280, 800, 42)
      + src(729.3, "Sources: Artificial Analysis via dev.to · news.ycombinator.com/item?id=50444914", y=1000))

# safety
scene(754.84, 777.58,
      img(754.84, "assets/raw/web/g_grey_swan.png", 160, 150, 900)
      + txt(754.84, f"on {B}safety{E}", 1140, 140, 60)
      + card(756.78, f'<div class="mono g" style="font-size:22px">well-known prompt-injection test</div><div class="big blue" style="font-size:90px;margin-top:6px">0%</div><div class="cs">first model to score it, says Google</div>', 1140, 240, 620, 240, cls="card ok")
      + card(761.42, '<div class="li">passed 92% of an internal honesty test</div>', 1140, 510, 620, 90, cls="card ok")
      + card(765.48, '<div class="li">but Google\'s own safety report: prompt-injection resistance still needs work</div>', 160, 690, 900, 140, cls="card red")
      + card(770.58, '<div class="li">no brand-new full frontier safety assessment</div><div class="cs">results mostly carried over from Argon</div>', 1140, 640, 620, 190, cls="card red")
      + src(755.1, "Chart: Google DeepMind · The Decoder, Nov 10, 2026", y=1000))

# who should use it
scene(777.58, 800.47,
      txt(777.58, f"so who should {B}actually use it{E}?", 0, 70, 64, align="center")
      + txt(780.21, "long tasks with a clear finish line:", 260, 200, 38, cls="lab")
      + card(783.05, '<div class="li">a big bug hunt</div>', 260, 270, 340, 90)
      + card(784.43, '<div class="li">a security audit</div>', 630, 270, 340, 90)
      + card(785.69, '<div class="li">a 3D build</div>', 1000, 270, 300, 90)
      + card(786.83, '<div class="li">a research project</div>', 1330, 270, 340, 90)
      + note(788.0, "you can launch and walk away from", 300, 390, 48)
      + card(789.21, f'<div class="ct">{B}genuinely strong{E}, and a lot cheaper than Fable 5.2 for similar results in some tests</div>', 260, 480, 1400, 130, cls="card ok")
      + card(796.99, '<div class="li">also great for finance & business automation</div>', 260, 650, 1400, 90, cls="card ok"))
scene(800.47, 823.36,
      card(800.47, '<div class="mono g" style="font-size:22px">not the one for</div><div class="ct" style="margin-top:8px">quick back-and-forth chat · nice front-end design · writing</div>', 260, 180, 1400, 170, cls="card red")
      + note(806.53, "even Google says Argon is better for most everyday work", 280, 390, 46)
      + card(810.55, '<div class="mono g" style="font-size:22px">already on Fable 5.2 or Opus 5.5 for coding?</div><div class="ct" style="margin-top:8px">no strong reason to switch…</div>', 260, 500, 1400, 170)
      + txt(817.6, f"…unless {B}price{E} matters to you.", 280, 720, 64)
      + note(821.09, "and it usually does", 1200, 820, 56))

# my take
scene(823.36, 841.96,
      txt(823.36, f"my {B}take{E}", 260, 70, 64)
      + card(824.56, '<div class="li">didn\'t hold the #1 spot for long</div>', 260, 190, 1400, 90)
      + card(827.36, f'<div class="ct">but Google stopped being the {B}lazy model company{E}</div>', 260, 300, 1400, 110, cls="card sel")
      + card(830.69, '<div class="li">works for hours</div>', 260, 440, 440, 90, cls="card ok")
      + card(832.15, '<div class="li">honest about what it doesn\'t know</div>', 730, 440, 600, 90, cls="card ok")
      + card(834.79, '<div class="li">long jobs: one of the best deals at the top</div>', 260, 560, 1400, 90, cls="card ok")
      + txt(837.57, f'test it before {B}December 1{E}', 260, 720, 70)
      + note(840.23, "when the price doubles", 1180, 740, 56))

scene(841.96, 845.70,
      txt(841.96, "have you tried Carbon yet?", 0, 330, 76, align="center")
      + note(843.0, "tell me what you built in the comments", 640, 480, 56))
scene(845.70, 848.40,
      img(845.70, "assets/img/aiequator.png", 760, 230, 400, 400)
      + txt(845.70, "subscribe for more AI news", 0, 680, 40, align="center", cls="lab"), out=False)
