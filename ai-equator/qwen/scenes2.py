"""Qwen 4 Max review: 3:41 to the end."""
from lib import *
from toon import *
from props import *
from props2 import *
from scenes1 import fix

LAB = '<div class="room" style="background:linear-gradient(#2E3F63 0 64%,#222B45 64%)"></div>'
MS = "mindstudio.ai/blog/qwen4-max-review"

# ---------- independent tests
scene(220.70, 239.28,
      txt(220.70, f"so what do {B}independent testers{E} say?", 0, 50, 56, align="center")
      + tweet(222.54, "aa", 160, 140, 600, .62)
      + txt(223.0, "Artificial Analysis Intelligence Index", 860, 150, 34, cls="lab")
      + bars(225.84, [(225.84, "Qwen4-Max (xhigh)", 43, True, "qwen_w.png"), (229.40, "Claude Opus 5.5 (max)", 59, False, "claude.png"), (232.84, "Claude Fable 5.2 (max)", 65, False, "claude.png")],
             x=860, y=250, wmax=480, gap=120, dec=0, suf="")
      + note(236.06, "not a small gap: a different league", 860, 640, 50)
      + src(226.2, "artificialanalysis.ai · AA lists whole numbers: 43 / 59 / 65", 160, 1000, center=False))
scene(239.28, 252.36,
      tweet(239.28, "vals", 300, 60, 640, .95)
      + txt(240.0, "Vals AI index", 1040, 180, 34, cls="lab")
      + card(241.28, f'<div class="li">Qwen4-Max</div><div class="big blue" style="font-size:90px">63.2%</div><div class="cs">#11 of 38 · top Chinese model</div>', 1040, 240, 600, 240, cls="card sel")
      + card(243.64, f'<div class="li">Claude Fable 5.2</div><div class="big" style="font-size:90px">71.3%</div>', 1040, 510, 600, 200)
      + note(247.48, "clearly behind the frontier", 1060, 760, 52))
scene(252.36, 258.12,
      txt(252.36, f"but leaderboards aren't the {B}whole story{E}", 0, 400, 72, align="center")
      + txt(254.96, "what happens when people actually use it?", 0, 520, 44, align="center", cls="lab"))

# Atomic Agent coding test
scene(258.12, 279.10,
      mac(258.12, "at_pass", "atomicagent.io/blog/qwen-4-max", (.0, .0, 1.0, .62), 160, 110, 840, 258.12, 279.10)
      + txt(258.4, "Atomic Agent's real coding job", 1080, 120, 34, cls="lab")
      + card(261.28, '<div class="li">a ~1,400-line stock library</div>', 1080, 180, 680, 90)
      + card(262.4, '<div class="li">13 planted bugs + 1 missing feature</div>', 1080, 290, 680, 90)
      + card(265.52, '<div class="li">checked by 59 hidden tests</div>', 1080, 400, 680, 90)
      + card(268.20, f'<div class="mono g" style="font-size:22px">Qwen4-Max (high)</div><div class="big blue" style="font-size:72px">59/59 <span class="g" style="font-size:36px">in 3 of 3 runs</span></div>', 1080, 530, 680, 180, cls="card ok")
      + card(272.48, '<div class="li">Qwen3.8-Max: didn\'t finish it in the comparable runs</div>', 160, 760, 840, 90, cls="card red")
      + note(277.0, "a big jump over the last Qwen", 1100, 760, 48))
scene(279.10, 296.62,
      txt(279.10, f"but look at the {B}clock{E}", 220, 70, 60)
      + race_bar(281.46, "Qwen4-Max", 220, 280, 1100, 25.0, 6.0, "#5B8FF0", "rq", "~25 min")
      + race_bar(281.46, "Claude Opus 5.5", 220, 460, 1100, 4.2, 1.0, "#D97757", "ro", "4.2 min")
      + race_bar(281.46, "GPT-6.1 Sol", 220, 640, 1100, 2.4, .6, "#E5E7EB", "rs", "2.4 min")
      + card(290.90, '<div class="li">and Sol was cheaper too: <span style="color:#3FB950">~29¢</span> vs Qwen\'s ~65¢ per task</div>', 220, 800, 1100, 90)
      + src(281.7, "Source: Atomic Agent, Nov 16, 2026", y=1000))

# Kingy AI study
rows = [(306.16, "GPT-6 Astra", 19.8, "openai_sym_w.png", False), (310.5, "GPT-6.1 Sol", 19.6, "openai_sym_w.png", False), (312.84, "Claude Opus 5.5", 19.2, "claude.png", False),
        (315.20, "Qwen4-Max", 18.65, "qwen_w.png", True), (318.28, "Claude Fable 5.2", 17.3, "claude.png", False)]
inner = (mac(296.62, "kingy", "kingy.ai", (.0, .0, .80, .62), 160, 110, 620, 296.62, 344.46)
         + txt(299.46, "10 practical tasks · 5 models · 2 runs · 200 graded stages", 860, 120, 30, cls="lab"))
for i, (t, lab, v, lg, hero) in enumerate(rows):
    y = 200 + i * 104
    fid = nid("kb")
    inner += el(t, f'<img src="assets/img/{lg}" alt="" style="width:36px;height:36px;object-fit:contain;vertical-align:-8px;margin-right:12px">{lab}', f"left:860px;top:{y}px;font-size:30px;width:400px", "bl")
    inner += f'<div class="track" style="left:1260px;top:{y + 4}px;width:440px;height:36px"></div><div id="{fid}" class="fill{" hero" if hero else ""}" style="left:1260px;top:{y + 4}px;width:0;height:36px"></div>'
    inner += el(t, f'<span class="{"blue" if hero else ""}">{v}</span>', f"left:{1260 + int(440 * (v - 15) / 5) + 14}px;top:{y - 2}px;font-size:36px", "bvl")
    grow(f"#{fid}", t, int(440 * (v - 15) / 5), .6)
inner += note(322.08, "Fable: some outputs failed or got cut off", 860, 730, 40)
inner += card(325.38, f'<div class="li">study cost: Qwen4-Max <span style="color:#3FB950">$3.62</span> · Fable 5.2 <span style="color:#F85149">$61.30</span></div>', 860, 790, 900, 90)
inner += note(333.10, "4th on quality, 2nd cheapest", 880, 900, 46)
inner += txt(296.9, '<span class="mono g" style="font-size:20px">score out of 20 (bars start at 15)</span>', 1260, 160, 20)
scene(296.62, 336.86, inner)
scene(336.86, 344.46,
      LAB
      + card(336.86, '<div class="mono g" style="font-size:22px">customer-support task · ticket</div><div class="ct" style="margin-top:8px">refund: <span style="color:#F85149">$0.00</span></div><div class="cs">…but the refund hadn\'t been decided yet</div>', 300, 260, 700, 250, cls="card red")
      + bean("qs", 1300, 900, 1.4, "purple", kind="robot", label="Qwen4-Max")
      + note(338.66, "two real slips, both here", 300, 560, 50)
      + src(337.0, "Source: Kingy AI run files (tickets T703, T708)", y=1000))
appear("qs", 337.0); bob("qs", 337, 344.4); shock("qs", 341.0)

# MindStudio hands-on
scene(344.46, 368.44,
      mac(344.46, "ms_dash", MS, (.18, .33, .82, .67), 160, 110, 1000, 344.46, 368.44)
      + txt(346.0, "MindStudio hands-on tests", 1240, 120, 32, cls="lab")
      + card(350.10, '<div class="mono g" style="font-size:22px">full-stack scoring dashboard · 4 judges</div>'
             '<div style="display:flex;gap:14px;margin-top:14px">' + "".join(f'<div class="judge" id="jd{i}">{s}</div>' for i, s in enumerate(["8.5", "9.0", "8.0", "9.5"])) + '</div>', 1240, 180, 560, 210)
      + card(354.08, '<div class="mono" style="font-size:28px;line-height:1.6">for i in range(len(judges)):<br>&nbsp;&nbsp;if i <span id="op" style="color:#F85149">&lt;</span> 3: total += s[i]</div>', 160, 740, 1000, 150, cls="card")
      + note(357.10, "dropping the 4th judge's score, no hints", 1240, 420, 42)
      + card(360.94, '<div class="li">found it ✓ rebuilt the app ✓ reset the DB ✓ checked the fix ✓</div>', 1240, 500, 560, 140, cls="card ok")
      + note(366.38, "the right champion came back", 1240, 680, 48))
tl.append('tl.to("#jd3",{opacity:.25,duration:.3},357.1); tl.to("#op",{color:"#3FB950",duration:.2},361.6); tl.set("#op",{innerHTML:"&lt;="},361.7); tl.to("#jd3",{opacity:1,duration:.3},362.6);')
scene(368.44, 379.98,
      mac(368.44, "ms_kebab", MS, (.18, .33, .82, .67), 160, 110, 900, 368.44, 379.98)
      + kebab("kb", 1220, 250, .9)
      + chip(374.74, "spin speed", 1560, 300) + chip(375.98, "heat", 1560, 380) + chip(376.74, "slice thickness", 1560, 460)
      + note(377.84, "meat that slowly browns", 1500, 560, 44)
      + note(371.44, "hand-drawn sketch → working simulation in ~15 min", 160, 760, 44))
appear("kb", 370.0); kebab_run("kb", 374.74, 379.9)
langs = ["Español", "日本語", "Kiswahili", "Deutsch", "हिन्दी", "Português", "한국어", "Türkçe", "Polski", "العربية", "Tiếng Việt", "Suomi", "Ελληνικά", "Bahasa", "Nederlands", "ไทย", "Yorùbá", "Čeština"]
scene(379.98, 388.70,
      mac(379.98, "ms_lang", MS, (.18, .33, .82, .67), 160, 120, 900, 379.98, 388.70)
      + "".join(chip(381.3 + i * .12, l, 1110 + (i % 3) * 250, 170 + (i // 3) * 80) for i, l in enumerate(langs))
      + txt(384.14, f'all {B}82{E} in ~4 minutes', 1110, 680, 60, cls="big")
      + note(386.90, "without skipping one", 1120, 790, 48))

# the X tester's chip benchmark: their real renders at 80%
scene(388.70, 409.32, clip80(388.70, 409.32, "x/x_spac.mp4", 0.0, "@SPAC89 on X · Nov 16, 2026 · chip benchmark renders"))
scene(388.70, 409.32,
      chip(391.76, "6 rounds of improvements, on its own", 230, 110)
      + chip(395.76, "checked every rendered frame visually", 230, 190)
      + chip(401.32, "~1 day · ~half of a $5 plan", 1180, 760, "ovc")
      + ov(406.0, "“the first Qwen model that's really surprised me”", 600, 860, 42))

# ---------- the problems
scene(409.32, 419.52,
      txt(409.32, f"now the {B}problems{E}", 0, 60, 64, align="center")
      + txt(411.42, "1 · speed", 220, 200, 52)
      + race_bar(413.04, "Qwen4-Max", 220, 400, 1100, 25.0, 5.0, "#5B8FF0", "rq2", "slowest")
      + race_bar(413.04, "the competition", 220, 580, 1100, 4.0, 1.0, "#9AA3B2", "rc2", "done")
      + note(417.04, "the coding test backs that up", 220, 720, 50))
scene(419.52, 438.70,
      txt(419.52, "2 · judgment on game design", 220, 60, 52)
      + tweet(422.60, "gamefeel", 220, 150, 640, .92)
      + txt(424.28, "GameFeel RE: can it tell if a game change is balanced?", 960, 170, 30, cls="lab", w=820)
      + card(427.90, f'<div class="li">Qwen4-Max preview</div><div class="big" style="font-size:80px;color:#F85149">10.3</div>', 960, 260, 380, 210, cls="card red")
      + card(430.24, f'<div class="li">old Qwen3.8-Max</div><div class="big" style="font-size:80px">12.1</div>', 1380, 260, 380, 210)
      + card(435.00, '<div class="li">even the small early Qwen4 models beat it</div><div class="cs">27B-Early 14.9 · Flash-Early 20.0</div>', 960, 510, 800, 160, cls="card dash")
      + src(423.0, "@follistatindev on X · GameFeel data as of Nov 12, 2026 (later rescaled)", 220, 1000, center=False))
scene(438.70, 452.14,
      txt(438.70, "3 · small details", 220, 60, 52)
      + txt(439.84, "the classic test: draw a pelican riding a bicycle", 220, 150, 34, cls="lab")
      + pelican_bike("pb", 300, 250, 1.4)
      + note(444.34, "feet don't line up with the pedals", 1180, 400, 50, "left", -90, 30)
      + note(449.12, "looked finished, but wasn't quite right", 1180, 520, 44)
      + card(441.0, '<div class="mono g" style="font-size:20px">illustration · we could not find the original tester post</div>', 1180, 700, 600, 70, cls="card dash"))
appear("pb", 440.5); tl.append('tl.to("#pb_miss",{opacity:1,duration:.3},444.5);')
scene(452.14, 462.18,
      txt(452.14, "4 · the subscription rules", 220, 60, 52)
      + mac(453.00, "tp_rule", "alibabacloud.com/help · Token Plan", (.0, .38, .80, .66), 220, 150, 1480, 453.0, 462.18)
      + note(458.24, "building a real product on it is complicated, for now", 240, 820, 48))

# ---------- verdict
scene(462.18, 482.00,
      txt(462.18, f"so, is Qwen4-Max really a {B}frontier model{E}?", 0, 70, 56, align="center")
      + txt(465.64, "honestly: no.", 0, 180, 100, align="center", cls="big")
      + card(468.78, '<div class="li">Artificial Analysis: ~20+ points behind Fable 5.2</div>', 260, 400, 1400, 90, cls="card red")
      + card(474.04, '<div class="li">Alibaba\'s own chart: Opus 5.5 wins most rows</div>', 260, 510, 1400, 90, cls="card red")
      + card(478.7, '<div class="li">top models (Fable 5.2, Gemini 4 Carbon) not invited</div>', 260, 620, 1400, 90, cls="card red"))
scene(482.00, 500.10,
      txt(482.00, "but here's what a lot of people are missing", 0, 70, 44, align="center", cls="lab")
      + card(484.60, f'<div class="ct" style="font-size:50px">not trying to beat Fable at Fable\'s price…</div>', 260, 180, 1400, 130)
      + card(487.54, f'<div class="ct" style="font-size:50px">…trying to get {B}close{E} at a fraction of the cost</div>', 260, 340, 1400, 130, cls="card sel")
      + card(490.58, '<div class="li">real work tests: finished jobs the last Qwen couldn\'t</div>', 260, 520, 1400, 90, cls="card ok")
      + card(494.40, '<div class="li">same range as Opus 5.5 for a small slice of the price</div>', 260, 630, 1400, 90, cls="card ok"))
# what Alibaba says it built: real demo footage at 80%
scene(500.10, 508.90, clip80(500.10, 508.90, "x/q_game1.mp4", 14.0, "Qwen · game demo from the Qwen4-Max launch post"))
scene(508.90, 516.26, clip80(508.90, 516.26, "x/q_game3.mp4", 4.0, "Qwen · game demo from the Qwen4-Max launch post"))
scene(500.10, 516.26,
      chip(501.58, "verdict: not on the frontier", 230, 110, "ovc red")
      + chip(503.32, "right behind it, for almost nothing", 230, 190)
      + ov(506.92, "agents all day? big coding jobs? the bill matters more than a leaderboard", 300, 860, 38)
      + chip(512.58, "and watch those open weights", 1180, 760))
scene(516.26, 527.36,
      txt(516.26, "if Alibaba releases even a smaller Qwen4 this good…", 0, 240, 52, align="center")
      + txt(520.32, f"that could hit {B}harder than Max{E}", 0, 340, 80, align="center")
      + txt(522.42, "would you trade a bit of quality for 9× cheaper?", 0, 560, 50, align="center")
      + note(525.78, "let me know in the comments", 700, 680, 56))
scene(527.36, 529.60,
      img(527.36, "assets/img/aiequator.png", 760, 230, 400, 400)
      + txt(527.36, "subscribe for more AI news", 0, 680, 40, align="center", cls="lab"), out=False)
