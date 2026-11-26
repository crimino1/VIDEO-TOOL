"""Claude Fable 5.2 Review: 3:45 to the end, timed to the user's transcript."""
from lib import *

ANT = "anthropic.com/claude-fable-and-mythos-5-2"
X = RAW / "x"
OS = ("x/yt_os.mp4", 4.0) if (X / "yt_os.mp4").exists() else ("ant_36cbf7.webm", 0.0)
DEV = ("x/yt_devices.mp4", 21.0) if (X / "yt_devices.mp4").exists() else ("ant_f079d0.webm", 0.0)

# the fun part
scene(225.76, 229.94,
      txt(225.76, "now the fun part", 0, 380, 44, align="center", cls="lab")
      + txt(227.3, f"what people {B}actually built{E}", 0, 450, 96, align="center"))

# rerouted in September
scene(229.94, 238.75,
      tweet(229.94, "chetroute", 300, 70, 600, .45)
      + txt(232.19, '<span class="mono g">Sept 2026</span>', 1000, 260, 36)
      + card(233.45, f'<div class="ct">Fable 5.1 requests</div><div class="cs">quietly routed to a newer model</div>', 1000, 330, 620, 170, cls="card sel")
      + src(230.2, "@chetaslua on X · Sep 18, 2026", 300, 1010, center=False))

# Chetaslua one-shot games
scene(238.75, 244.37,
      vcard(238.75, 244.37, "x/x_chet_game.mp4", 6.0, 360, 150, 1200, 675, "@chetaslua on X · one-shot game, pure JavaScript")
      + note(240.33, "pure JS · no image files", 1250, 880, 52, "up", -50, -80))
scene(244.37, 249.02,
      vcard(244.37, 249.02, "x/x_chet_snacks.mp4", 8.0, 360, 150, 1200, 675, "@chetaslua on X · Sep 20, 2026")
      + note(245.31, "every animal got its own snack", 1060, 880, 52, "up", -50, -80))

# Jazzy
scene(249.02, 257.30,
      tweet(249.02, "jazzy", 300, 90, 560, .27)
      + card(250.82, f'<div class="mono g" style="font-size:22px">Jazzy · Three.js</div><div class="ct" style="margin-top:8px">Brawl Stars-style 3D arena</div>', 960, 300, 660, 170, cls="card sel")
      + card(252.56, '<div class="li">about an hour</div>', 960, 510, 320, 90)
      + card(254.0, '<div class="li">one-line prompt</div>', 1300, 510, 320, 90)
      + note(255.0, "about lighting and shadows", 1000, 640, 48)
      + src(249.3, "@notjazii on X · Sep 2026", 300, 1010, center=False))

# Pankaj
scene(257.30, 263.32,
      tweet(257.30, "pankaj", 360, 80, 620)
      + note(258.84, "3D cliffside house", 1060, 330, 56, "left", -90, 30)
      + note(260.64, "“lighting and reflections were really good”", 1060, 430, 42)
      + src(257.6, "@pankajkumar_dev on X · Sep 20, 2026", 360, 1010, center=False))

# unconfirmed
scene(263.32, 269.94,
      txt(263.32, "to be fair…", 0, 250, 44, align="center", cls="lab")
      + txt(264.32, f"nobody could confirm it was {B}really 5.2{E}", 0, 320, 72, align="center")
      + note(268.06, "it just lined up", 820, 470, 60)
      + meme(266.0, "megamind.jpg", 760, 560, 400, -2))

# Matthew Berman
scene(269.94, 278.18,
      tweet(269.94, "berman", 300, 80, 640, .62)
      + txt(272.6, f'<span id="tok">0</span>B+', 1060, 280, 130, cls="big")
      + txt(272.8, "tokens burned testing it", 1060, 430, 32, cls="lab")
      + note(275.30, "“by far the best model I've ever used”", 1040, 520, 46)
      + meme(276.0, "cinema.png", 1180, 620, 380, 2))
count("#tok", 272.6, 0, 100, 0, "", "", 1.2)
scene(278.18, 285.56,
      vcard(278.18, 285.56, "x/x_berman_gears.mp4", 17.0, 360, 130, 1200, 675, "@MatthewBerman on X · Gears of War-style clone in Unreal Engine")
      + card(281.90, '<div class="li">cover mechanics</div>', 360, 880, 360, 90)
      + card(282.86, '<div class="li">enemy AI</div>', 740, 880, 260, 90)
      + card(284.02, '<div class="li">timed reload</div>', 1020, 880, 300, 90))

# what the demos cost (Fall Guys and Excel shots from his YouTube review)
scene(285.56, 298.99,
      txt(285.56, "what those demos cost", 300, 110, 50)
      + card(285.9, f'<div class="mono g" style="font-size:22px">Gears of War clone</div><div class="big" style="font-size:76px;margin-top:10px">{B}$15,000{E}</div><div class="cs">several days · ~8.5B tokens</div>', 300, 220, 620, 250, cls="card sel")
      + vcard(291.32, 298.99, "x/yt_berman.mp4", 379.5, 1000, 200, 620, 349)
      + txt(291.6, f'Fall Guys-style multiplayer · {B}~$13,000{E}', 1000, 570, 30)
      + vcard(296.12, 298.99, "x/yt_berman.mp4", 147.0, 300, 530, 560, 315)
      + txt(296.4, f'Excel clone · {B}~50 hours{E}', 900, 700, 34)
      + src(286.0, "Matthew Berman · “Anthropic just dropped the best model ever... (Fable 5.2)”", y=1000))

# keeps Opus day to day
scene(298.99, 306.92,
      txt(298.99, "and even after all that…", 0, 140, 40, align="center", cls="lab")
      + card(300.74, f'<img src="assets/img/claude.png" alt="" style="width:70px;height:70px;vertical-align:middle;margin-right:20px"><span class="ct" style="font-size:52px">Opus 5.5</span><div class="cs" style="margin-top:12px">his day-to-day pick</div>', 360, 300, 640, 220, cls="card sel")
      + note(304.42, "rarely runs out of quota", 420, 560, 52)
      + meme(302.0, "monkey.jpg", 1100, 300, 560, 2))

# Ethan Mollick
scene(306.92, 310.70,
      tweet(306.92, "mollick", 300, 100, 640, .5)
      + vcard(307.2, 310.70, "x/x_mollick_scooby.mp4", 4.0, 1000, 260, 680, 383)
      + note(308.72, "“a sort of jagged AGI”", 1010, 700, 54))

# Matt Shumer
scene(310.70, 318.36,
      tweet(310.70, "shumer", 260, 80, 620, .52)
      + vcard(311.0, 318.36, "x/x_shumer_voxel.mp4", 20.0, 960, 240, 720, 405)
      + note(311.60, "“the best model ever created”", 980, 700, 46)
      + note(316.48, "…and a “school hall monitor”", 980, 790, 46))
scene(318.36, 323.32,
      card(318.36, f'<div class="mono g" style="font-size:22px">Matt Shumer\'s review</div><div class="ct" style="margin-top:8px">one of its agents sent emails without his approval</div>', 300, 340, 760, 230, cls="card red")
      + meme(319.5, "harold.jpg", 1180, 300, 480, 2)
      + src(318.6, "Source: somethingbig.ai/fable-5-2-review", y=1000))

# Anthropic showcase: OS
scene(323.32, 338.88,
      txt(323.32, f"Anthropic's own {B}showcase{E}", 160, 70, 56)
      + vcard(326.02, 338.88, OS[0], OS[1], 160, 170, 1120, 630, "Anthropic · Fable 5.2 builds an operating system from an empty folder")
      + card(330.72, '<div class="li">1,000+ subagents</div>', 1340, 220, 440, 90, cls="card sel")
      + card(331.86, '<div class="li">8 days</div>', 1340, 330, 440, 90)
      + card(333.66, '<div class="li">boots on a real laptop</div>', 1340, 440, 440, 90, cls="card ok")
      + txt(335.02, "drivers · windows · login · installer", 1340, 560, 26, cls="lab"))

# three devices
scene(338.88, 346.54,
      vcard(338.88, 346.54, DEV[0], DEV[1], 360, 130, 1200, 675, "Anthropic · three devices designed by Fable 5.2, built with Diode")
      + note(340.10, "3 devices from a one-paragraph prompt", 380, 880, 48)
      + note(343.52, "all worked, no electrical fixes", 1180, 880, 48))

# Fermat
scene(346.54, 357.03,
      mac(346.54, "a_fermat_el", ANT, (0, 0, 1, .77), 260, 120, 1000, 346.54, 357.03)
      + card(347.28, f'<div class="ct">1,000 agents</div><div class="cs">Fermat\'s Last Theorem</div>', 1340, 220, 440, 150, cls="card sel")
      + card(349.20, f'<div class="big blue" style="font-size:90px">30 h</div>', 1340, 400, 440, 150)
      + note(351.35, "translating the proof so a<br>computer can check it,<br>not a new proof", 1340, 600, 42))

# complaints: writing
scene(357.03, 366.26,
      txt(357.03, f"now the {B}complaints{E}", 0, 70, 56, align="center")
      + mac(358.56, "hn_writing", "news.ycombinator.com", (.05, .40, .65, .58), 260, 300, 1400, 358.56, 366.26)
      + note(361.46, "split on its writing", 1250, 760, 52))

# unfair to Gemini
scene(366.26, 373.83,
      mac(366.26, "a_table_el", ANT, (0, 0, 1, .092), 260, 200, 1400, 366.26, 373.83)
      + note(369.34, "Gemini ran at medium effort", 1000, 560, 52, "up", 450, -90)
      + note(371.0, "inside a different tool", 1000, 650, 48))

# usage limits
scene(373.83, 386.07,
      txt(373.83, f"usage limits {B}confused{E} people", 0, 120, 70, align="center")
      + card(376.39, '<div class="mono g" style="font-size:22px">Max plan</div><div class="ct" style="margin-top:8px">Fable resets</div>', 300, 320, 560, 170, cls="card sel")
      + link(379.0, 880, 395, 120)
      + card(379.45, '<div class="ct">only give back Fable usage</div><div class="cs">not your whole weekly quota</div>', 1020, 320, 600, 170)
      + note(384.57, "you can burn through limits faster", 300, 640, 54)
      + meme(385.0, "thisisfine.jpg", 1240, 640, 420, 2))

# suspects it's being tested
scene(386.07, 398.11,
      txt(386.07, "a detail I found genuinely interesting", 0, 70, 40, align="center", cls="lab")
      + mac(388.79, "a_test", ANT, (.25, .33, .79, .67), 260, 150, 1400, 388.79, 398.11)
      + note(392.41, "harder to trust safety tests", 300, 870, 50)
      + card(395.61, '<div class="li">risk still rated: low</div>', 1180, 850, 480, 90, cls="card ok"))

# 55% fewer blocks
scene(398.11, 404.57,
      mac(398.11, "a_55", ANT, (.25, .33, .79, .67), 260, 150, 1400, 398.11, 404.57)
      + txt(400.79, f'{B}−55%{E}', 300, 830, 110, cls="big")
      + txt(401.0, "blocked requests vs Fable 5.1", 680, 870, 34, cls="lab"))

# my take
scene(404.57, 417.07,
      txt(404.57, f"so, {B}my take{E}", 0, 100, 70, align="center")
      + card(406.01, f'<div class="mono g" style="font-size:22px">long, hard technical work</div><div class="ct" style="margin-top:8px">strongest model out right now</div>', 300, 280, 640, 180, cls="card sel")
      + card(411.73, '<div class="mono g" style="font-size:22px">independent tests</div><div class="ct" style="margin-top:8px">mostly back that up</div>', 1000, 280, 620, 180, cls="card ok")
      + card(414.65, f'<div class="ct" style="text-align:center">use {B}High{E} effort, <span class="strike2">not Max</span></div>', 560, 560, 800, 130))

scene(417.07, 421.73,
      mac(417.07, "a_opus", ANT, (.25, .33, .79, .67), 260, 150, 1400, 417.07, 421.73)
      + note(418.6, "even Anthropic says: Opus 5.5 for everyday stuff", 400, 880, 50))

scene(421.73, 428.41,
      txt(421.73, "the crazy demos took days and thousands of dollars", 0, 220, 48, align="center", cls="lab")
      + txt(425.07, f"it's {B}smarter{E}…", 0, 380, 96, align="center")
      + txt(426.0, "but it isn't magic,", 0, 520, 72, align="center")
      + txt(426.99, "and it isn't cheap.", 0, 620, 72, align="center"))

# your turn
scene(428.41, 432.12,
      txt(428.41, "have you tried it yet?", 0, 330, 76, align="center")
      + note(429.79, "tell me what you built in the comments", 640, 480, 56))

# sign-off
scene(432.12, 434.40,
      img(432.12, "assets/img/aiequator.png", 760, 230, 400, 400)
      + txt(432.12, "subscribe for more AI news", 0, 680, 40, align="center", cls="lab"), out=False)
