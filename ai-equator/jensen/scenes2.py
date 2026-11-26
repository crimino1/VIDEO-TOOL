"""Nvidia CEO affair + spy probe: 3:32 to the end, timed to the user's transcript."""
from lib import *

NVM = "nvidianews.nvidia.com/news/a-message-to-our-company"
AAU = "aa.com.tr"


def chapter(t, label, title):
    return (txt(t, f'<span class="mono g">{label}</span>', 0, 420, 30, align="center")
            + txt(t + .1, title, 0, 470, 96, align="center"))


# what's still unconfirmed
items = [(217.18, "the intelligence memo hasn't been released"), (219.92, "no public proof Alice Huang was actually recruited"),
         (223.20, "no public proof she got any secrets"), (225.58, "no proof Jensen shared anything confidential")]
inner = (txt(211.89, "the part a lot of videos will skip", 0, 80, 40, align="center", cls="lab")
         + txt(214.51, f"a lot of this is still {B}unconfirmed{E}", 0, 140, 76, align="center"))
for i, (t, lab) in enumerate(items):
    inner += card(t, f'<div class="li">{lab}</div>', 360, 300 + i * 130, 1200, 100)
    inner += el(t + .2, '<span class="big" style="font-size:44px;color:#F0A818">?</span>', f"left:1500px;top:{318 + i * 130}px", "")
scene(211.89, 227.96, inner)

scene(227.96, 237.17,
      card(227.96, '<div class="li">not charged with anything</div>', 300, 130, 620, 100, cls="card ok")
      + mac(230.10, "aa_noreason", AAU, (.04, .38, .66, .62), 300, 280, 1320, 230.1, 237.17)
      + note(230.6, "Nvidia's board", 1000, 150, 54))

scene(237.17, 246.89,
      card(237.17, f'<div class="mono g" style="font-size:24px">confirmed</div>'
           '<div class="li" style="margin-top:18px">the affair (he admitted it)</div>'
           '<div class="li" style="margin-top:12px">the investigations</div>'
           '<div class="li" style="margin-top:12px">the letters from Congress</div>', 260, 240, 680, 400, cls="card ok")
      + card(243.97, f'<div class="mono g" style="font-size:24px">still an allegation</div><div class="ct" style="font-size:60px;margin-top:22px">{B}everything else{E}</div>', 1000, 240, 660, 400, cls="card red"))

# the board
scene(246.89, 255.72,
      txt(246.89, f"now, the {B}board{E}", 300, 80, 60)
      + mac(248.13, "nv_board", "nvidianews.nvidia.com", (.0, .05, .70, .80), 300, 170, 960, 248.13, 255.72)
      + card(249.55, '<div class="li">independent investigation</div>', 1320, 260, 440, 90, cls="card sel")
      + card(251.07, '<div class="li">committee of independent directors</div>', 1320, 380, 440, 130)
      + card(253.95, '<div class="li">outside lawyers</div>', 1320, 540, 440, 90))
scene(255.72, 262.02,
      txt(255.72, "it's focused on whether Jensen was", 0, 230, 44, align="center", cls="lab")
      + txt(256.68, f"the target of a {B}foreign intelligence operation{E}", 0, 300, 72, align="center")
      + txt(259.96, "not on the affair itself", 0, 460, 52, align="center", cls="h strike2"))
scene(262.02, 270.82,
      vcard(262.02, 270.82, "x/yt_bloom_probe.mp4", 89.8, 260, 180, 900, 506, "Bloomberg Television")
      + card(262.80, '<div class="li">board: still has confidence in him</div>', 1220, 220, 480, 130, cls="card ok")
      + card(264.64, '<div class="li">he stays on as CEO</div>', 1220, 380, 480, 90)
      + note(266.82, "“will not slow NVIDIA”", 1220, 530, 56))

# the stock
scene(270.82, 286.62,
      txt(270.82, f"let's talk {B}stock{E}", 300, 90, 60)
      + txt(272.22, '<span class="mono g">Nov 5, 2026</span>', 300, 190, 32)
      + card(273.62, f'<img src="assets/img/nvidia_w.png" alt="" style="width:240px;height:44px;object-fit:contain"><div class="big" style="font-size:120px;color:#F85149;margin-top:20px">−9.3%</div>', 300, 270, 620, 300)
      + card(279.66, f'<img src="assets/img/amd_w.png" alt="" style="width:200px;height:48px;object-fit:contain"><div class="big" style="font-size:120px;color:#F85149;margin-top:16px">−17.3%</div>', 1000, 270, 620, 300, cls="card red")
      + note(277.08, "a wider AI chip sell-off", 320, 620, 50)
      + note(283.36, "can't blame all of that on Jensen", 1020, 620, 50)
      + meme(284.0, "thisisfine.jpg", 1240, 720, 400, 2)
      + src(274.0, "Sources: CNBC, Trefis", 300, 1000, center=False))
scene(286.62, 291.98,
      vcard(286.62, 291.98, "x/yt_cnbc_invest.mp4", 36.0, 300, 150, 1100, 619, "CNBC Television · Nov 9, 2026")
      + note(287.4, "after the memo: down 2%+ after hours (reported)", 300, 840, 44)
      + note(289.2, "Monday premarket: about −5% (CNBC)", 300, 910, 44))
scene(291.98, 304.80,
      vcard(291.98, 304.80, "x/yt_ives.mp4", 1.0, 260, 150, 900, 506, "CNBC International · Dan Ives")
      + tweet(293.0, "ives2", 1220, 150, 500)
      + note(294.54, "a risk Jensen could be removed as CEO", 260, 760, 50)
      + note(301.14, "“Jensen basically is the Nvidia story”", 260, 850, 46))

scene(304.80, 319.37,
      txt(304.80, f"that's the real {B}business risk{E}", 300, 80, 56)
      + vcard(307.70, 319.37, "x/yt_gtc.mp4", 196.0, 260, 180, 1000, 562, "NVIDIA · GTC 2026 keynote")
      + card(311.14, f'<div class="ct">the {B}face{E} of the AI boom</div>', 1320, 220, 420, 100, cls="card sel")
      + card(313.92, '<div class="li">on stage at every launch</div>', 1320, 350, 420, 90)
      + card(315.78, '<div class="li">does the deals</div>', 1320, 460, 420, 90)
      + card(317.14, '<div class="li">meets the presidents</div>', 1320, 570, 420, 90))

# ---------- the memes
scene(319.37, 325.95,
      chapter(319.37, "04", f"the {B}memes{E}")
      + note(321.99, "the Jensen meme universe existed long before this", 560, 640, 48))
scene(325.95, 333.27,
      mac(325.95, "toms", "tomshardware.com", (.10, .35, .72, .62), 300, 200, 1320, 325.95, 333.27)
      + note(327.65, "his own 2016 Reddit AMA", 300, 800, 50)
      + note(329.95, "“the guy in the leather jacket who repeats things three times”", 300, 880, 44))
scene(333.27, 345.03,
      tweet(333.27, "jacket", 300, 60, 600, .62)
      + note(334.87, "people tracked his jacket prices vs the stock", 1000, 300, 46)
      + txt(341.35, f'both down {B}23%{E}', 1000, 420, 90, cls="big")
      + note(343.23, "coincidence?", 1010, 560, 64)
      + src(333.5, "@WangUWS on X · March 2025", 300, 1000, center=False))
scene(345.03, 358.28,
      vcard(345.03, 358.28, "px_chip_1.mp4", 1.0, 1220, 300, 520, 292)
      + mac(345.03, "oc3d", "overclock3d.net", (.08, .25, .72, .55), 260, 160, 900, 345.03, 358.28)
      + note(346.25, "gamers: roasting him for years", 1220, 640, 46)
      + note(351.71, "approval with gamers: lower than 2017?", 1220, 720, 44))
scene(358.28, 366.02,
      txt(358.28, f"a {B}spy thriller{E} around the world's most valuable chip company", 0, 80, 48, align="center")
      + tweet(361.2, "spygf", 160, 220, 520, 1.0, "pop")
      + tweet(362.4, "monday", 720, 200, 460, 1.0, "pop")
      + tweet(363.6, "elon", 1240, 240, 520, 1.0, "pop")
      + note(363.78, "people didn't exactly hold back", 680, 900, 50))
scene(366.02, 372.99,
      txt(366.02, "but I'll keep it to the situation,", 0, 220, 56, align="center")
      + txt(367.98, f"{B}not his family.{E}", 0, 300, 84, align="center")
      + card(369.3, '<div class="ct" style="font-size:40px">“My family bears no responsibility for my choices. I do. Please give them privacy.”</div><div class="cs" style="margin-top:14px">— Jensen Huang\'s memo, Nov 8, 2026</div>', 360, 480, 1200, 230))

# ---------- what happens next
dates = [(377.27, "Nov 11", "today", "deadline to respond to the House request"), (382.61, "Nov 17", "earnings", "Nvidia's Q3 results"),
         (386.67, "Nov 18", "closed-door briefing", "Congress wants him there")]
inner = (txt(372.99, f"so what happens {B}next{E}?", 0, 90, 70, align="center")
         + txt(374.77, "three dates to watch", 0, 190, 36, align="center", cls="lab")
         + '<div class="tline" style="left:300px;top:420px;width:1320px"></div>')
for i, (t, d, lab, sub) in enumerate(dates):
    inner += el(t, f'<i class="dot{" hero" if i == 2 else ""}"></i><div class="big" style="font-size:56px;margin-top:24px">{B + d + E if i == 2 else d}</div><div class="ct" style="font-size:34px;margin-top:6px">{lab}</div><div class="cs">{sub}</div>', f"left:{280 + i * 560}px;top:406px;width:500px", "tp")
inner += src(375.0, "Sources: House committee letter (Nov 4) · Nvidia investor relations", y=1000)
scene(372.99, 390.25, inner)

# my take
scene(390.25, 405.16,
      txt(390.25, f"my {B}take{E}", 300, 80, 64)
      + card(391.11, '<div class="mono g" style="font-size:22px">the affair</div><div class="ct" style="margin-top:8px">his personal life, between him and his family</div>', 300, 220, 620, 200)
      + card(395.32, f'<div class="mono g" style="font-size:22px">the real question</div><div class="ct" style="margin-top:8px">{B}national security{E}</div>', 1000, 220, 620, 200, cls="card sel")
      + txt(398.46, "did a foreign intelligence service get close to the most important person in AI hardware?", 300, 500, 46, w=1320)
      + txt(403.42, f'and did anything {B}leak{E}?', 300, 660, 70))
scene(405.16, 419.22,
      txt(405.16, "right now, nobody has publicly shown that anything did.", 0, 120, 50, align="center")
      + note(409.16, "but the investigations are just starting", 640, 220, 54)
      + txt(411.0, "what could depend on what they find:", 300, 380, 36, cls="lab")
      + card(412.48, '<div class="li">Nvidia\'s China business</div>', 300, 460, 420, 100)
      + card(413.72, '<div class="li">US export rules</div>', 760, 460, 400, 100)
      + card(415.66, f'<div class="li">maybe even {B}Jensen\'s job{E}</div>', 1200, 460, 420, 100, cls="card red"))

scene(419.22, 425.48,
      txt(419.22, "what do you think?", 0, 200, 56, align="center", cls="lab")
      + txt(420.26, f"should Jensen {B}stay as CEO{E} while this plays out?", 0, 280, 70, align="center")
      + card(421.6, '<div class="ct" style="text-align:center">yes, he stays</div>', 560, 480, 380, 120, cls="card ok")
      + card(421.9, '<div class="ct" style="text-align:center">no, step aside</div>', 980, 480, 380, 120, cls="card red")
      + note(423.44, "let me know in the comments", 720, 680, 56))

scene(425.48, 427.80,
      img(425.48, "assets/img/aiequator.png", 760, 230, 400, 400)
      + txt(425.48, "subscribe for more AI news", 0, 680, 40, align="center", cls="lab"), out=False)
