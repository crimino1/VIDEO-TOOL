"""Scenes 0:00 to 2:04, timed to the user's transcript."""
from lib import *

# 0:00 hook
scene(0, 5.63,
      img(0, "assets/img/openai_w.png", 810, 250, 300, cls="logo", eid="hooklogo")
      + txt(1.57, '<span class="mono g">Nov 5, 2026</span>', 0, 360, 34, align="center")
      + txt(3.25, f"GPT-6 {B}Cyber{E}", 0, 420, 168, align="center")
      + underline(4.29, 720, 640, 480)
      + txt(4.4, "a new model from OpenAI", 0, 690, 38, align="center", cls="lab"), fade_in=False)

tl.append('tl.set("#hooklogo",{opacity:1},0);')
# the real launch post
scene(5.63, 11.33,
      img(5.63, "assets/raw/web/tw_openai.png", 560, 60, 640)
      + note(8.55, "an AI built for<br>security work", 1280, 260, 52, "left", -95, 110)
      + src(5.9, "@OpenAI on X · Nov 5, 2026", y=1010))

# what people picture
chat = ('<div class="mono g" style="font-size:22px;margin-bottom:22px">chatbot</div>'
        '<div class="cb u">is my account safe?</div>'
        '<div class="cb bot" id="cbb">Have you tried a <b>strong password</b>? 🔒</div>')
tl.append('tl.fromTo("#cbb",{opacity:0},{opacity:1,duration:.25},16.45);')
scene(11.33, 20.6,
      txt(11.4, "what people picture when they hear", 0, 150, 40, align="center", cls="lab")
      + txt(13.47, f"“AI for {B}cybersecurity{E}”", 0, 205, 84, align="center")
      + card(15.69, chat, 610, 400, 700, 330)
      + note(16.9, "very helpful. thanks.", 1350, 610, 44, "left", -85, 40)
      + bigx(19.48, 590, 380, 740, 370))

# what it actually does
steps = [(20.82, "reads code", "the whole codebase"), (22.42, "finds weak spots", "where it can break"),
         (24.08, "proves they're real", "a working test"), (26.48, "suggests a fix", "a patch to ship")]
inner = txt(20.6, f"This {B}isn't{E} that.", 0, 150, 84, align="center")
for i, (t, lab, sub) in enumerate(steps):
    x = 150 + i * 420
    inner += card(t, f'<div class="ct">{lab}</div><div class="cs">{sub}</div>', x, 430, 340, 160, cls="card sel" if i == 2 else "card")
    if i:
        inner += link(t - .15, x - 68, 500, 56)
inner += note(25.0, "this is the new part", 960, 650, 46, "up", 50, -70)
scene(20.6, 28.86, inner)

# meme: it can hack
scene(28.86, 31.65,
      txt(28.86, "so, basically…", 0, 130, 46, align="center", cls="lab")
      + vcard(29.54, 31.65, "memes/hackerman.mp4", 3.4, 560, 230, 800, 450, anim="pop")
      + note(30.42, "it can hack", 1400, 560, 62, "left", -95, 10))

# on purpose
scene(31.65, 34.23,
      person(31.65, "altman.jpg", "Sam Altman", "CEO, OpenAI", 440, 250, 340)
      + txt(32.35, "OpenAI built it", 900, 370, 84)
      + txt(33.09, f"{B}on purpose.{E}", 900, 480, 104)
      + src(31.9, "Photo: TechCrunch / Flickr, CC BY 2.0", 440, 800, center=False))

# what, then why
scene(34.23, 40.71,
      card(34.23, '<div class="ct" style="font-size:52px;text-align:center">what it is</div>', 470, 440, 400, 120)
      + link(36.2, 900, 490, 120)
      + card(36.33, f'<div class="ct" style="font-size:52px;text-align:center">{B}why{E}</div>', 1050, 440, 400, 120, cls="card sel")
      + note(38.25, "the interesting part", 1110, 620, 50, "up", 70, -72))

# Astra -> Cyber
scene(40.71, 52.25,
      logo(40.8, "openai_w.png", 860, 150, 200)
      + card(40.71, f'<div class="mono g" style="font-size:22px">specialized version</div><div class="ct" style="font-size:54px;margin-top:8px">GPT-6 {B}Cyber{E}</div>', 1140, 400, 520, 180, cls="card sel")
      + card(43.45, '<div class="mono g" style="font-size:22px">built from</div><div class="ct" style="font-size:54px;margin-top:8px">GPT-6 Astra</div>', 260, 400, 520, 180)
      + txt(45.65, "OpenAI's top general model, right now", 260, 610, 30, cls="lab")
      + link(48.39, 820, 480, 280, "tuned for security research"))

# ExploitGym
scene(52.25, 67.21,
      txt(52.25, f"So, how {B}good{E} is it?", 0, 120, 84, align="center")
      + card(54.17, f'<div class="mono" style="font-size:46px;text-align:center">Exploit{B}Gym{E}</div><div class="g" style="font-size:26px;margin-top:10px;text-align:center">a benchmark</div>', 700, 260, 520, 150)
      + card(57.83, '<div class="ct">the model</div><div class="cs">gets one known bug</div>', 300, 560, 360, 150)
      + link(59.97, 690, 625, 180)
      + card(60.49, '<div class="ct">can it really use it?</div><div class="cs">on a remote test machine</div>', 900, 560, 460, 150, cls="card sel")
      + note(63.97, "not just talk about it…", 330, 790, 52)
      + note(65.95, "actually do it", 1080, 790, 58)
      + check(66.2, 1400, 790, 56))

# scores
scene(67.21, 79.43,
      txt(67.21, f"Exploit{B}Gym{E}", 300, 160, 64)
      + txt(67.3, "pass rate · company-reported", 300, 250, 28, cls="lab")
      + bars(67.21, [(68.73, "GPT-6 Cyber", 48.5, True, "openai_sym_w.png"), (74.63, "GPT-5.6 Cyber", 32.1, False, "openai_sym_w.png")], y=400)
      + txt(76.59, f'<span class="blue">+51%</span>', 1300, 700, 150, cls="big")
      + note(77.0, "relative jump", 1330, 880, 46)
      + src(68.0, "Source: OpenAI, “GPT-6 Cyber”, Nov 5, 2026"))

# meme: surprised
scene(79.43, 81.21,
      txt(79.43, "and this one surprised me", 0, 120, 46, align="center", cls="lab")
      + meme(79.6, "pikachu.jpg", 560, 220, 800, -2))

# beat the flagship
scene(81.21, 91.11,
      txt(81.21, f"Exploit{B}Gym{E}", 300, 160, 64)
      + txt(81.3, "pass rate · company-reported", 300, 250, 28, cls="lab")
      + bars(81.21, [(81.4, "GPT-6 Cyber", 48.5, True, "openai_sym_w.png"), (84.21, "GPT-6 Astra", 42.4, False, "openai_sym_w.png"), (81.6, "GPT-5.6 Cyber", 32.1, False, "openai_sym_w.png")], y=400)
      + note(86.47, "the specialist beats the flagship it came from", 760, 790, 50, "up", 600, -90)
      + src(81.5, "Source: OpenAI, “GPT-6 Cyber”, Nov 5, 2026"))

# thousands found, Linux and Firefox
scene(91.11, 97.6,
      mac(91.11, "oai_thou", "openai.com/index/introducing-gpt-6-cyber", (.25, .33, .79, .67), 300, 200, 1320, 91.11, 97.6)
      + src(91.4, "Source: OpenAI, “GPT-6 Cyber”, Nov 5, 2026"))
scene(97.6, 100.3,
      vcard(97.6, 100.3, "yt_oai_mozilla.mp4", 6.4, 300, 170, 960, 540, "OpenAI · “How Mozilla strengthens Firefox security with GPT-6 Cyber”")
      + logo(97.69, "tux.png", 1340, 260, 220, "pop")
      + logo(98.51, "firefox.png", 1350, 520, 210, "pop"))

# their own numbers
scene(100.3, 106.01,
      txt(100.3, f"these are {B}OpenAI's own{E} numbers", 0, 400, 84, align="center")
      + underline(101.3, 640, 510, 640)
      + note(102.3, "keep that in mind", 840, 580, 54)
      + txt(104.7, "but still.", 0, 720, 44, align="center", cls="lab"))

# critical
scene(106.01, 112.47,
      mac(106.01, "oai_crit", "openai.com/index/introducing-gpt-6-cyber", (.25, .33, .79, .67), 260, 220, 1400, 106.01, 112.47)
      + src(106.3, "OpenAI · Preparedness Framework rating"))
levels = [("Low", 0), ("Medium", 0), ("High", 112.47), ("Critical", 115.04)]
inner = txt(112.47, "OpenAI's own risk scale · cybersecurity", 0, 220, 34, align="center", cls="lab")
for i, (lab, t) in enumerate(levels):
    x = 260 + i * 360
    cls = "card lvl" + (" hi" if lab == "High" else "") + (" crit" if lab == "Critical" else "")
    inner += card(t or 112.47, f'<div class="ct" style="text-align:center">{lab}</div>', x, 430, 320, 120, cls=cls)
inner += txt(112.9, "GPT-5.6 Cyber", 980, 580, 28, cls="lab mono") + txt(115.04, f"{B}GPT-6 Cyber{E}", 1340, 580, 28, cls="lab mono")
inner += note(115.2, "top of the scale", 1360, 680, 50, "up", 60, -80)
scene(112.47, 116.76, inner)

# in the wrong hands: real news report
scene(116.76, 123.96,
      vcard(116.76, 123.96, "yt_newsx.mp4", 66.0, 360, 200, 1200, 438, "NewsX · Nov 6, 2026", crop=(1920, 700, 0, 40))
      + note(120.0, "“genuinely dangerous in the wrong hands”", 760, 780, 50))

# meme: why build that
scene(123.96, 128.96,
      txt(124.0, f"why would anyone {B}build that?{E}", 0, 140, 80, align="center")
      + meme(125.0, "monkey.jpg", 610, 300, 700, 1))
