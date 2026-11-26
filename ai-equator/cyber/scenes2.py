"""Scenes 2:09 to the end, timed to the user's transcript."""
from lib import *

# everything has bugs
things = [(131.64, "your phone"), (132.56, "your browser"), (133.48, "your bank's app"), (135.20, "hospitals"), (135.98, "power grids")]
inner = txt(128.96, f"Every piece of software has {B}bugs{E}.", 0, 150, 76, align="center")
for i, (t, lab) in enumerate(things):
    x = 130 + i * 340
    inner += card(t, f'<div class="ct" style="text-align:center">{lab}</div><div class="bugrow"><i></i><i></i><i class="r" id="bug{i}"></i></div>', x, 430, 300, 150)
    tl.append(f'tl.to("#bug{i}",{{backgroundColor:"#F85149",boxShadow:"0 0 18px #F85149",duration:.3}},{137.32 + i * .12:.2f});')
inner += note(138.1, "some are security holes", 1150, 650, 48, "up", 90, -80)
scene(128.96, 139.70, inner)

# the race
scene(139.70, 157.75,
      txt(139.70, f"a constant {B}race{E}", 0, 110, 76, align="center")
      + txt(142.16, "who finds the hole first?", 0, 210, 38, align="center", cls="lab")
      + card(143.96, '<div class="ct" style="color:#F85149;text-align:center">the attacker</div>', 300, 330, 560, 100, cls="card red")
      + card(144.86, f'<div class="ct" style="text-align:center">{B}the defender{E}</div>', 1060, 330, 560, 100, cls="card sel")
      + card(148.17, '<div class="li">data leaks</div>', 300, 480, 560, 80)
      + card(149.57, '<div class="li">ransomware</div>', 300, 580, 560, 80)
      + card(150.65, '<div class="li">systems going down</div>', 300, 680, 560, 80)
      + card(154.33, '<div class="li">patched quietly</div>', 1060, 480, 560, 80, cls="card ok")
      + check(154.6, 1540, 490)
      + note(155.97, "nobody ever hears about it", 1080, 600, 48))

# not enough people
scene(157.75, 163.35,
      txt(157.75, f"not enough skilled {B}security researchers{E}", 0, 400, 72, align="center")
      + note(161.85, "not even close", 820, 520, 60))

# millions of lines
code = "".join(f'<div class="cl{" bad" if i == 9 else ""}" id="{"badline" if i == 9 else ""}">{l}</div>' for i, l in enumerate([
    "for (i = 0; i <= len; i++)", "  buf[i] = input[i];", "if (user.role == ADMIN)", "  grant(user);", "free(session);", "log(session->id);",
    "parse(header, size);", "copy(dst, src, n);", "check(token);", "  memcpy(out, in, size + 1);", "return ok;", "cleanup();"]))
scene(163.35, 172.09,
      txt(163.35, f'<span id="loc">1,000,000</span> lines of code', 120, 150, 70)
      + txt(163.8, "and codebases keep getting bigger", 120, 250, 32, cls="lab")
      + card(165.65, f'<div class="codewall mono">{code}</div>', 1040, 140, 760, 620, cls="card")
      + card(165.65, '<div class="ct">a human team</div><div class="cs">reads line by line</div>', 120, 420, 520, 140)
      + cross(167.35, 660, 460)
      + note(168.93, "one tiny mistake", 1380, 800, 50, "up", 40, -80)
      + card(170.53, f'<div class="ct">{B}an AI can{E}</div><div class="cs">reads all of it</div>', 120, 620, 520, 140, cls="card sel")
      + check(170.8, 660, 660))
count("#loc", 163.6, 1000000, 40000000, 0, "", "", 2.2)
tl.append('tl.to("#badline",{backgroundColor:"rgba(240,168,24,.25)",color:"#F0A818",duration:.3},168.93);')

# OpenAI's argument
scene(172.09, 182.41,
      logo(172.09, "openai_w.png", 300, 150, 220)
      + txt(172.3, "OpenAI's argument", 560, 150, 50)
      + card(174.83, '<div class="li">attackers will get tools like this anyway</div>', 300, 330, 1320, 100)
      + card(178.13, '<div class="li">open models keep getting better</div>', 300, 460, 1320, 100)
      + card(180.09, '<div class="li">other labs are building similar stuff</div>', 300, 590, 1320, 100))

# the real question
scene(182.41, 189.10,
      txt(182.41, "the real question isn't", 0, 200, 40, align="center", cls="lab")
      + txt(183.85, "should hacking-capable AI exist?", 0, 280, 70, align="center", cls="h strike", eid="q1")
      + txt(186.65, "it's whether", 0, 480, 40, align="center", cls="lab")
      + txt(187.0, f"{B}defenders{E} get it first.", 0, 550, 104, align="center"))
tl.append('tl.to("#q1",{opacity:.35,duration:.3},186.4);')

# who gets access
scene(189.10, 194.88,
      txt(189.10, "the part that matters most", 0, 340, 40, align="center", cls="lab")
      + txt(191.0, f"who actually gets {B}access{E}?", 0, 420, 104, align="center")
      + underline(193.4, 1120, 560, 330))

# you can't use it
scene(194.88, 199.94,
      card(194.88, '<div class="ct" style="text-align:center">you</div>', 360, 420, 320, 130)
      + cross(195.3, 700, 450)
      + card(197.04, '<div class="ct" style="text-align:center">me</div>', 800, 420, 320, 130)
      + cross(197.4, 1140, 450)
      + card(198.18, '<img src="assets/img/chatgpt_w.png" alt="" style="width:64px;height:64px;vertical-align:middle;margin-right:18px"><span class="ct">ChatGPT</span>', 1240, 420, 360, 130)
      + cross(198.88, 1610, 450)
      + meme(197.04, "pablo.jpg", 760, 640, 400, 2))

# Daybreak Red
scene(199.94, 205.40,
      mac(199.94, "oai_red", "openai.com/index/introducing-gpt-6-cyber", (.25, .33, .79, .67), 220, 230, 1480, 199.94, 205.4)
      + note(202.0, "selected customers only", 1180, 880, 50, "up", 60, -80))

scene(205.40, 211.57,
      card(205.40, f'<div class="mono g" style="font-size:22px">OpenAI · Daybreak {B}Red{E}</div><div class="ct" style="font-size:50px;margin-top:10px">application only</div>', 610, 170, 700, 170, cls="card sel")
      + card(207.08, '<div class="li">vetted security teams</div>', 300, 470, 600, 100, cls="card ok")
      + check(207.4, 920, 490)
      + card(208.92, '<div class="li">random people with a credit card</div>', 1020, 470, 640, 100)
      + cross(209.3, 1680, 490))

# stays in its lane
scene(211.57, 226.80,
      txt(211.57, f"staying in its {B}lane{E}", 0, 110, 76, align="center")
      + card(214.88, '<div class="mono g" style="font-size:22px">authorized scope</div><div class="ct" style="margin-top:14px">the system it was asked to test</div>', 300, 300, 640, 240, cls="card sel")
      + card(217.91, '<div class="mono g" style="font-size:22px">out of scope</div><div class="ct" style="margin-top:14px;color:#8A8F98">everything else nearby</div>', 1080, 300, 540, 240, cls="card dash")
      + note(219.45, "not allowed to touch", 1180, 560, 46, "up", 40, -70)
      + txt(221.85, '<span id="sc">0.00</span>% <span class="g" style="font-size:60px">to 100%</span>', 300, 680, 130, cls="big")
      + txt(222.2, "of tests stayed in scope", 300, 850, 32, cls="lab")
      + src(222.0, "Source: OpenAI, ExploitGym Honeypot test, company-reported"))
count("#sc", 221.85, 90, 99.93, 2, "", "", 1.6)

scene(226.80, 230.0,
      txt(226.80, f"that matters {B}more{E} than people think", 0, 440, 80, align="center"))

# the messy stretch
scene(230.0, 233.6,
      mac(230.0, "forkast_dns", "forkast.news", (.24, .06, .76, .52), 460, 110, 1000, 230.0, 233.6)
      + note(231.2, "a few weeks earlier", 1490, 300, 48, "left", -85, 40))

scene(233.6, 240.04,
      card(233.6, '<div class="mono g" style="font-size:22px;padding:6px 0 0 6px">training sandbox</div>', 260, 300, 600, 420, cls="card dash")
      + card(234.6, '<div class="ct" style="text-align:center">OpenAI agent</div>', 360, 470, 400, 110, cls="card sel")
      + link(237.0, 880, 525, 340, "DNS loophole")
      + card(238.25, '<div class="ct" style="text-align:center;color:#F85149">the live internet</div>', 1260, 460, 420, 130, cls="card red")
      + src(234.0, "Reported Sept 2026 · OpenAI disclosure"))

scene(240.04, 245.68,
      mac(240.04, "cso_astra", "csoonline.com", (.04, .18, .92, .62), 380, 120, 1160, 240.04, 245.68)
      + note(243.2, "canceled", 1580, 300, 60, "left", -90, 50))

scene(245.68, 251.27,
      card(245.68, f'<div class="mono g" style="font-size:22px">canceled · in testing</div><div class="ct" style="font-size:50px;margin-top:8px">GPT-6.1 Astra</div>', 260, 180, 600, 170)
      + card(246.44, '<div class="li">went ahead without permission</div>', 260, 420, 760, 100, cls="card red")
      + card(248.36, '<div class="li">didn\'t always report honestly</div>', 260, 550, 760, 100, cls="card red")
      + meme(248.6, "megamind.jpg", 1180, 300, 480, 2))

# the whole point
scene(251.27, 259.89,
      card(251.27, '<div class="mono g" style="font-size:22px">same company</div><div class="ct" style="margin-top:8px">a model that can write exploits</div>', 300, 340, 620, 170)
      + card(255.37, f'<div class="ct">{B}"it stays in scope"{E}</div><div class="cs">is not a small detail</div>', 1000, 340, 620, 170, cls="card sel")
      + note(258.06, "that's the whole point", 1060, 560, 56, "up", 70, -80))

# four cyber models this year
pts = [(266.45, "Apr", "GPT-5.4 Cyber"), (269.23, "Jun", "GPT-5.5 Cyber"), (271.83, "Aug", "GPT-5.6 Cyber"), (262.5, "Nov", "GPT-6 Cyber")]
inner = txt(259.89, f"OpenAI isn't {B}alone{E} here", 0, 120, 70, align="center") + txt(262.5, "its 4th cyber model this year", 0, 215, 36, align="center", cls="lab")
inner += '<div class="tline" style="left:240px;top:560px;width:1440px"></div>'
for i, (t, m, n) in enumerate(pts):
    x = 240 + i * 440
    hero = i == 3
    inner += el(t, f'<i class="dot{" hero" if hero else ""}"></i><div class="mono g" style="font-size:26px;margin-top:22px">{m} 2026</div><div class="ct" style="font-size:36px;margin-top:6px">{B + n + E if hero else n}</div>', f"left:{x - 20}px;top:546px;width:360px", "tp")
inner += note(274.4, "roughly one every two months", 760, 790, 50)
scene(259.89, 276.76, inner)

# Google
scene(276.76, 278.84,
      person(276.76, "pichai.jpg", "Sundar Pichai", "CEO, Google", 520, 240, 320)
      + logo(277.0, "gemini_w.png", 1000, 420, 440)
      + txt(277.3, "doing the same thing", 1000, 560, 40, cls="lab"))

scene(278.84, 288.14,
      img(278.84, "assets/raw/web/tw_google.png", 560, 40, 560)
      + note(284.5, "selected defenders first", 1180, 560, 50, "left", -90, 30)
      + txt(286.0, "via Google's Fairwind program", 1190, 650, 28, cls="lab")
      + src(279.1, "@Google on X · Oct 28, 2026", y=1010))

scene(288.14, 301.88,
      txt(288.14, f"Exploit{B}Gym{E}", 300, 160, 64)
      + txt(288.3, "pass rate · each company's own number", 300, 250, 28, cls="lab")
      + bars(288.14, [(289.62, "Gemini 4 Carbon", 54.8, True, "gemini_icon.png"), (288.6, "GPT-6 Cyber", 48.5, False, "openai_sym_w.png")], y=400)
      + note(294.54, "testing setups might not match", 760, 680, 50)
      + txt(299.0, "not a clean head-to-head", 760, 780, 44, cls="h strike2")
      + src(288.5, "Sources: Google, Oct 28, 2026 · OpenAI, Nov 5, 2026"))

# Moonshot
scene(301.88, 308.48,
      mac(301.88, "tnw_kimi", "thenextweb.com", (.10, .02, .90, .42), 380, 130, 1160, 301.88, 308.48)
      + logo(303.3, "kimi.png", 1580, 640, 160, "pop"))

scene(308.48, 317.64,
      txt(308.48, "Kimi K3.1 Pro training data", 300, 150, 56)
      + card(308.6, '<div class="li">general text</div>', 300, 280, 620, 80)
      + card(308.8, '<div class="li">coding tasks</div>', 300, 380, 620, 80)
      + card(309.10, '<div class="li" id="cyb">cyber-related data</div>', 300, 480, 620, 80, cls="card red")
      + note(310.2, "removed first", 420, 600, 50, "up", -60, -70)
      + card(312.5, f'<div class="ct">{B}open weights{E}</div><div class="cs">anyone can download them</div>', 1120, 280, 520, 150, cls="card sel")
      + card(316.24, '<div class="li">application form</div>', 1120, 480, 520, 80)
      + cross(316.6, 1660, 490))
tl.append('tl.to("#cyb",{textDecoration:"line-through",opacity:.5,duration:.2},310.0);')

# two approaches
scene(317.64, 330.61,
      txt(317.64, f"the industry is splitting in {B}two{E}", 0, 110, 70, align="center")
      + card(322.11, '<div class="mono g" style="font-size:22px">closed</div><div class="ct" style="margin-top:8px">top hacking skills stay locked behind vetted access</div>', 260, 300, 640, 220, cls="card sel")
      + logo(323.0, "openai_w.png", 300, 570, 200) + logo(323.3, "gemini_w.png", 560, 560, 260)
      + card(326.36, '<div class="mono g" style="font-size:22px">open</div><div class="ct" style="margin-top:8px">the dangerous parts deliberately toned down</div>', 1020, 300, 640, 220)
      + logo(327.0, "kimi.png", 1060, 560, 110))

# will it hold
scene(330.61, 342.47,
      txt(330.61, f"will that {B}hold up{E} long term?", 0, 120, 76, align="center")
      + note(332.47, "I honestly don't know", 780, 230, 52)
      + card(334.37, '<div class="li">access programs can leak</div>', 300, 380, 760, 100, cls="card red")
      + card(335.87, '<div class="li">accounts get compromised</div>', 300, 510, 760, 100, cls="card red")
      + card(337.59, '<div class="li">smarter models, higher stakes</div>', 300, 640, 760, 100, cls="card red")
      + meme(340.0, "thisisfine.jpg", 1140, 420, 560, 2))

# a real win
scene(342.47, 351.34,
      card(344.02, '<div class="ct">a small team</div><div class="cs">with a model like this</div>', 220, 400, 420, 150, cls="card sel")
      + link(345.7, 660, 465, 120)
      + card(346.0, '<div class="ct">fixes a hole</div><div class="cs">in a hospital system</div>', 800, 400, 420, 150)
      + link(347.9, 1240, 465, 120, "before")
      + card(348.0, '<div class="ct" style="color:#F85149">ransomware gangs</div><div class="cs">find it</div>', 1380, 400, 380, 150, cls="card red")
      + note(349.88, "that's a real win", 820, 640, 60))

scene(351.34, 361.07,
      mac(351.34, "oai_bil", "openai.com/index/introducing-gpt-6-cyber", (.25, .33, .79, .67), 220, 160, 1480, 351.34, 361.07)
      + txt(352.8, f'{B}$1 billion{E}', 260, 820, 90, cls="big")
      + txt(353.2, "for under-resourced defenders", 760, 850, 36, cls="lab")
      + note(358.62, "we'll see how that plays out", 1180, 930, 44))

# recap
scene(361.07, 371.59,
      txt(361.07, f"GPT-6 {B}Cyber{E}", 0, 170, 120, align="center")
      + txt(363.39, "an AI that can hack…", 0, 360, 60, align="center")
      + txt(365.21, f"built so the {B}good guys{E} can hack first", 0, 450, 60, align="center")
      + card(367.61, '<div class="ct" style="text-align:center">does the bet pay off?</div><div class="cs" style="text-align:center">only if the walls around it hold</div>', 560, 640, 800, 160, cls="card dash"))

# your turn
scene(371.59, 379.15,
      txt(371.59, "what do you think?", 0, 170, 70, align="center")
      + card(372.99, '<div class="ct" style="text-align:center">should models like this exist at all?</div>', 260, 380, 660, 150)
      + card(375.17, f'<div class="ct" style="text-align:center">or is {B}locking them down{E} enough?</div>', 1000, 380, 660, 150, cls="card sel")
      + note(377.53, "drop it in the comments", 760, 640, 56))

# sign-off
scene(379.15, 381.20,
      img(379.15, "assets/img/aiequator.png", 760, 230, 400, 400)
      + txt(379.15, "subscribe for more AI news", 0, 680, 40, align="center", cls="lab"), out=False)
