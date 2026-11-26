"""Nvidia CEO affair + spy probe: 0:00 to 3:32, timed to the user's transcript.
Rules for this story: no photos of Alice Huang or his family, no AI-made images of real people,
every allegation labelled as reported."""
from lib import *

NVM = "nvidianews.nvidia.com/news/a-message-to-our-company"
MEMOC = (.03, .40, .66, .62)   # crop around a highlighted memo line


def chapter(t, label, title):
    return (txt(t, f'<span class="mono g">{label}</span>', 0, 420, 30, align="center")
            + txt(t + .1, title, 0, 470, 96, align="center"))


# 0:00 hook (frame 0 shows Jensen)
scene(0, 6.08,
      img(0, "assets/img/stage.jpg", 300, 200, 560, 560, cls="person0", eid="hookimg")
      + img(.3, "assets/img/nvidia_w.png", 960, 250, 420)
      + txt(1.14, "CEO Jensen Huang", 960, 360, 64)
      + card(1.98, '<div class="mono g" style="font-size:22px">sent a memo to his employees</div><div class="ct" style="margin-top:8px">Nov 8, 2026</div>', 960, 480, 620, 150, cls="card sel")
      + note(4.38, "…and it wasn't about GPUs", 990, 680, 54)
      + src(.4, "Photo: Masaru Kamikura, CC BY 2.0", 300, 780, center=False), fade_in=False)
tl.append('tl.set("#hookimg",{opacity:1},0);')

scene(6.08, 11.18,
      txt(6.08, f"He admitted he'd had an {B}affair{E}.", 0, 110, 72, align="center")
      + mac(8.04, "nv_memo1", NVM, MEMOC, 260, 260, 1400, 8.04, 11.18)
      + src(8.3, "Nvidia newsroom · “A Message to Our Company” · Nov 8, 2026", y=1000))
scene(11.18, 17.56,
      mac(11.18, "nv_memo2", NVM, MEMOC, 260, 160, 1400, 11.18, 17.56)
      + card(11.98, '<div class="li">hurt his wife and children</div>', 260, 760, 520, 90)
      + card(13.22, '<div class="li">“no excuse”</div>', 820, 760, 320, 90)
      + card(15.14, '<div class="li">full responsibility</div>', 1180, 760, 480, 90, cls="card sel"))

scene(17.56, 22.74,
      txt(17.56, "normally, a CEO's personal life", 0, 380, 56, align="center", cls="lab")
      + txt(18.6, f"isn't {B}tech news{E}.", 0, 450, 96, align="center")
      + txt(21.34, "but this one is.", 0, 620, 60, align="center"))

scene(22.74, 27.92,
      vcard(22.74, 27.92, "x/yt_cnbc_oct29.mp4", 30.0, 360, 130, 1200, 675, "CNBC Television · Oct 29, 2026")
      + note(24.52, "US intelligence reportedly believes: a Chinese spy", 420, 880, 50))
scene(27.92, 34.18,
      vcard(27.92, 34.18, "x/yt_gtc.mp4", 188.0, 300, 150, 1100, 619, "NVIDIA · GTC 2026 keynote")
      + img(28.5, "assets/img/nvidia_w.png", 1450, 300, 360)
      + note(30.38, "the chips behind<br>basically the entire<br>AI industry", 1440, 420, 46))

pills = [(36.00, "the spying side"), (37.04, "the GPU side"), (38.14, "the stock"), (39.40, "the memes")]
inner = txt(34.18, f"let's go through it {B}properly{E}", 0, 200, 76, align="center")
for i, (t, lab) in enumerate(pills):
    inner += card(t, f'<div class="mono g" style="font-size:22px">0{i + 1}</div><div class="ct" style="margin-top:6px">{lab}</div>', 180 + i * 400, 440, 360, 150, cls="card sel" if i == 0 else "card")
scene(34.18, 40.63, inner)

# ---------- how it started
scene(40.63, 46.93,
      txt(40.63, '<span class="mono g">Oct 29, 2026</span>', 300, 90, 30)
      + mac(42.21, "cnbc_oct29", "cnbc.com", (.03, .15, .80, .60), 300, 150, 1100, 42.21, 46.93)
      + note(43.53, "New York Times report", 1440, 320, 52, "left", -90, 30))
scene(46.93, 58.41,
      card(46.93, f'<div class="mono g" style="font-size:22px">named in the report</div><div class="ct" style="font-size:60px;margin-top:8px">Alice Huang</div><div class="cs">also known as Huang Le</div>', 300, 260, 640, 260, cls="card sel")
      + card(49.99, '<div class="mono g" style="font-size:22px">alleged by US intelligence</div><div class="ct" style="margin-top:8px">a Chinese intelligence asset</div>', 1000, 260, 620, 200, cls="card red")
      + txt(53.09, f"not related to {B}Jensen{E}", 300, 640, 64)
      + note(55.83, "same last name, different family", 310, 750, 54))
scene(58.41, 66.68,
      mac(58.41, "megaspeed", "megaspeed.ai", (.0, .0, 1.0, 1.0), 300, 130, 1050, 58.41, 66.68)
      + note(58.9, "she's an executive here", 1390, 260, 52, "left", -90, 30)
      + note(61.85, "report: a close<br>relationship with Jensen", 1390, 440, 46))

# Nvidia pushes back
scene(66.68, 82.33,
      card(66.68, f'<div class="mono g" style="font-size:22px">Nvidia spokesperson</div><div class="ct" style="font-size:44px;margin-top:10px">“Jensen\'s interactions with Ms. Huang are {B}not unusual or unexpected{E}.”</div>', 260, 220, 700, 330, cls="card sel")
      + underline(71.33, 300, 560, 560)
      + vcard(74.15, 82.33, "x/yt_bloom_probe.mp4", 183.0, 1020, 220, 640, 360, "Bloomberg Television")
      + note(75.07, "meeting customers = part of the job", 280, 620, 50)
      + txt(78.31, f'{B}thousands{E} of customer executives a year', 280, 720, 40)
      + src(67.0, "Statement quoted by TechCrunch and CNBC, Oct 29, 2026", 260, 1000, center=False))

scene(82.33, 87.21,
      card(82.33, '<div class="mono g" style="font-size:22px">Bloomberg · Oct 29, 2026</div><div class="ct" style="font-size:52px;margin-top:10px">Nvidia\'s Huang defends Megaspeed ties</div>', 360, 300, 1200, 200)
      + note(84.24, "“normal”", 1380, 540, 70))

scene(87.21, 93.97,
      card(87.21, f'<div class="mono g" style="font-size:22px">China\'s foreign ministry</div><div class="ct" style="font-size:52px;margin-top:10px">“{B}groundless{E} speculation”</div>', 300, 280, 620, 220)
      + card(90.15, f'<div class="mono g" style="font-size:22px">Chinese embassy</div><div class="ct" style="font-size:52px;margin-top:10px">“smears” against China</div>', 1000, 280, 620, 220, cls="card red")
      + src(87.5, "Sources: SCMP, Oct 30 · TweakTown, Oct 29, 2026", y=700))

# the story grows
scene(93.97, 101.80,
      txt(93.97, f"then the story {B}kept growing{E}", 0, 80, 56, align="center")
      + mac(95.95, "house", "foreignaffairs.house.gov", (.0, .0, 1.0, .70), 360, 170, 1200, 95.95, 101.8)
      + note(98.0, "Nov 4: closed-door briefing request", 600, 960, 50))
scene(101.80, 117.05,
      mac(101.80, "tc_memo", "techcrunch.com", (.06, .05, .72, .85), 300, 110, 760, 101.8, 117.05)
      + txt(102.39, '<span class="mono g">Nov 6–7</span>', 1140, 220, 32)
      + card(103.5, '<div class="ct">FT and NYT report on a government memo</div>', 1140, 280, 520, 150)
      + card(108.29, '<div class="mono g" style="font-size:22px">memo reportedly says</div><div class="ct" style="margin-top:8px">China\'s Ministry of State Security recruited Alice Huang</div>', 1140, 470, 520, 230, cls="card red")
      + note(114.21, "relationship: “romantic”", 1160, 740, 54))
scene(117.05, 120.77,
      img(117.05, "assets/img/coons.jpg", 300, 220, 400, 520, cls="person0")
      + tweet(117.3, "coons", 800, 300, 820)
      + src(117.3, "@ChrisCoons on X · Nov 7, 2026 · Photo: US Senate", 300, 1000, center=False))

scene(120.77, 125.05,
      txt(120.77, '<span class="mono g">Sunday, Nov 8</span>', 300, 120, 34)
      + txt(121.2, f"…came the {B}memo{E}", 300, 180, 76)
      + tweet(120.9, "email", 1000, 90, 660)
      + src(121.0, "@FearedBuck on X · Nov 9, 2026", 1000, 1000, center=False))

tlx = '<div class="tline" style="left:300px;top:520px;width:1320px"></div>'
scene(125.05, 133.06,
      tlx
      + el(125.05, '<i class="dot"></i><div class="mono g" style="font-size:26px;margin-top:22px">Oct 29</div><div class="ct" style="font-size:38px;margin-top:6px">“just business meetings”</div>', "left:280px;top:506px;width:520px", "tp")
      + el(128.33, f'<i class="dot hero"></i><div class="mono g" style="font-size:26px;margin-top:22px">Nov 8</div><div class="ct" style="font-size:38px;margin-top:6px">{B}CEO admits the affair{E}</div>', "left:1300px;top:506px;width:520px", "tp")
      + note(131.23, "about 10 days", 820, 380, 60)
      + meme(131.4, "pikachu.jpg", 820, 640, 320, -2))

# ---------- the GPU side
scene(133.06, 138.22,
      chapter(133.06, "02", f"the {B}GPU{E} side")
      + note(135.56, "this is where it gets serious", 700, 620, 54))
scene(138.22, 146.10,
      img(138.22, "assets/img/singapore.jpg", 300, 200, 760, 506)
      + card(139.2, f'<div class="ct" style="font-size:54px">Megaspeed</div><div class="cs">Singapore-based data center company</div>', 1120, 230, 540, 180, cls="card sel")
      + card(141.2, '<div class="li">founded 2023</div>', 1120, 450, 540, 90)
      + card(143.26, '<div class="li">an Nvidia customer. a big one.</div>', 1120, 570, 540, 90)
      + src(138.5, "Photo: Marina Bay, Singapore · Wikimedia Commons", 300, 730, center=False))
scene(146.10, 159.36,
      txt(146.10, "according to the New York Times", 300, 150, 40, cls="lab")
      + txt(147.6, "a Megaspeed-linked company in Malaysia bought", 300, 230, 44)
      + txt(150.4, f'{B}$<span id="b48">0.0</span> billion{E}', 300, 320, 170, cls="big")
      + txt(152.0, "of equipment with Nvidia tech inside (at least)", 300, 520, 40, cls="lab")
      + card(155.58, '<div class="li">June 2024 → February 2026</div>', 300, 620, 640, 90, cls="card sel")
      + src(147.0, "NYT trade records, summarized by Newsweek, Nov 9, 2026", 300, 1000, center=False))
count("#b48", 150.4, 0, 4.8, 1, "", "", 1.4)
scene(159.36, 172.44,
      mac(159.36, "cnbc_mega", "cnbc.com", (.03, .15, .80, .60), 300, 140, 1000, 159.36, 172.44)
      + card(160.22, f'<div class="mono g" style="font-size:22px">alleged</div><div class="big" style="font-size:80px;margin-top:6px;color:#F85149">~$2B</div><div class="cs">of AI chips smuggled into China via Malaysia</div>', 1360, 200, 420, 300, cls="card red")
      + note(167.14, "Commerce Dept probe reported", 1360, 560, 46)
      + note(169.4, "no finding announced", 1360, 640, 54))
scene(172.44, 177.00,
      vcard(172.44, 177.0, "px_datacenter_0.mp4", 1.0, 300, 160, 1000, 562)
      + card(173.34, '<div class="mono g" style="font-size:22px">reportedly</div><div class="ct" style="margin-top:8px">rents computing power to Alibaba</div>', 1360, 300, 420, 200, cls="card sel"))
scene(177.00, 185.56,
      mac(177.0, "cnbc_oct29", "cnbc.com", (.03, .15, .80, .60), 300, 150, 1000, 177.0, 185.56)
      + note(178.36, "Nvidia: Megaspeed<br>has no ties to China", 1340, 320, 46)
      + note(181.36, "diversion claims<br>“investigated and debunked”", 1340, 470, 42))

# why it matters
scene(185.56, 198.74,
      txt(185.56, f"so why does this {B}matter{E} so much?", 0, 80, 64, align="center")
      + vcard(187.78, 198.74, "px_chip_0.mp4", 1.0, 260, 220, 760, 427)
      + card(187.78, '<div class="li">the US restricts which AI chips can be sold to China</div>', 1080, 230, 580, 140)
      + card(191.78, f'<div class="li">Jensen: one of the {B}loudest voices{E} to loosen those rules</div>', 1080, 400, 580, 140, cls="card sel")
      + card(196.56, '<div class="li">close to President Trump</div>', 1080, 570, 580, 90))
scene(198.74, 205.04,
      mac(198.74, "cnbc_h200", "cnbc.com", (.03, .15, .80, .60), 300, 150, 1100, 198.74, 205.04)
      + note(199.72, "January: some H200s allowed for select Chinese buyers", 300, 900, 46))
scene(205.04, 211.89, vcard(205.04, 211.89, "px_capitol_0.mp4", 1.0, 0, 0, 1920, 1080))
scene(205.04, 211.89,  # text layer above the full-frame clip
      '<div class="dimbg"></div>'
      + card(205.04, '<div class="ct">if a foreign spy got close to the person lobbying on that exact issue…</div>', 360, 330, 1200, 170, cls="card dash")
      + note(209.66, "Washington gets nervous", 760, 560, 64))
