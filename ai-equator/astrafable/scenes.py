"""GPT-6.2 Astra vs Claude Fable 5.2: the solar system test. On-screen facts come from the recordings and sources.
No footage of GPT-6.2 Sol is used (user, 2026-11-23): r3 before 16 s, r4, and r7 before 46 s stay out."""
import json, re
from lib import *

_W = json.load(open(H / "words.json"))
_N = [re.sub(r"[^a-z0-9]", "", w["w"].lower()) for w in _W]
_S, _I = "", []
for i, n in enumerate(_N):
    _S += n
    _I += [i] * len(n)


def W(phrase, after=None):
    """Start time of the first spoken occurrence of phrase after `after` (default: the latest scene's start); whole words only."""
    after = CUR["t"] if after is None else after
    p = re.sub(r"[^a-z0-9]", "", phrase.lower())
    k = _S.find(p)
    while k >= 0:
        i, e = _I[k], k + len(p)
        if (k == 0 or _I[k - 1] != i) and (e == len(_S) or _I[e] != _I[e - 1]) and _W[i]["t"] >= after - .01:
            _CALLS.append((phrase, _W[i]["t"]))
            return _W[i]["t"]
        k = _S.find(p, k + 1)
    raise KeyError(phrase)


_CALLS, _scene = [], scene


def scene(a, b, *args, **kw):
    """lib.scene plus a guard: every phrase looked up for this scene must be spoken inside it."""
    bad = [(p, t) for p, t in _CALLS if not a - .05 <= t <= b]
    _CALLS.clear()
    if bad:
        raise ValueError(f"scene {a:.2f}-{b:.2f}: cues outside it: {bad}")
    _scene(a, b, *args, **kw)


P = {p["id"]: p["start"] for p in json.load(open(H / "paragraphs.json", encoding="utf-8"))}
VO = json.load(open(H / "paragraphs.json", encoding="utf-8"))[-1]["end"]
END = round(VO + 1.6, 2)  # the closing card holds after the last word
CL, OA = "assets/img/claude.png", "assets/img/openai_k.png"
R1, R2, R3, R5, R7, R8, R9 = (f"rec/clean/{n}.mp4" for n in ("r1_slow", "r2_paste_claude", "r3_paste_codex", "r5_both_a", "r7_both_c", "r8_chatgpt_result", "r9_snapit"))
FL = f'<img src="{CL}" alt="">Claude Fable 5.2'
AL = f'<img src="{OA}" alt="">GPT-6.2 Astra · Codex'
CR9 = (1824, 1026, 48, 54)    # Fable's page without the browser bar
CR9A = (1244, 700, 676, 250)  # first 27 s: the simulation half beside Claude's notes
CR8 = (1904, 816, 8, 258)     # Solar Atlas viewport without the Codex app chrome (7:3)
CR8S = (1465, 824, 455, 256)  # 16:9 window on the planet side of Solar Atlas


def fable(a, b, ss, crop=CR9, caps=(), instant=False):
    return clipbox(a, b, R9, ss, 192, 120, 1536, 864, caps, crop, FL, instant)


def astra(a, b, ss, caps=(), instant=False):
    return clipbox(a, b, R8, ss, 120, 190, 1680, 720, caps, CR8, AL, instant)


def montage(cuts, shot):
    """cuts: (time, source second). Hard cuts inside one scene; returns the frame html of the first."""
    out = None
    for i, (t, ss) in enumerate(cuts):
        nxt = cuts[i + 1][0] if i + 1 < len(cuts) else None
        f = shot(t, nxt, ss, instant=i > 0)
        out = out or f
    return out


def win_row(t, claim, who):
    lg = {"fable": (CL, "FABLE 5.2", "f"), "astra": (OA, "ASTRA", "o"), "tie": (None, "TIE", "")}[who]
    im = f'<img src="{lg[0]}" alt="">' if lg[0] else ""
    return item(t, f'<div class="hd" style="font-size:38px;flex:1;min-width:0">{claim}</div><div class="wpill {lg[2]}">{im}{lg[1]}</div>', "crow")


def duel(t, name, fv, av, fwin, sub=None):
    s = f'<div class="ssub">{sub}</div>' if sub else ""
    return item(t, f'<div class="slab" style="font-size:25px">{name}</div>'
                   f'<div class="drow{" win" if fwin else ""}"><img src="{CL}" alt="">Fable 5.2<b>{fv}</b></div>'
                   f'<div class="drow{"" if fwin else " win"}"><img src="{OA}" alt="">Astra<b>{av}</b></div>{s}', "stat", "flex:1")


def plist(t0, rows, size=40):
    """rows: (t, text, tone). One line each, entering on its word."""
    return col(*[item(t, s, f"hd {tone}", f"font-size:{size}px") for t, s, tone in rows], gap=18)


# ================= hook
t = W("one prompt")
scene(0, t, col(hrow(stat(0, "Anthropic", "Fable 5.2", "Claude", "hero", CL, vs=96), stat(0, "OpenAI", "GPT-6.2 Astra", "ChatGPT · Codex", "", OA, vs=96), gap=28),
                text(1.4, "Two of the smartest models in the world. One prompt.", 40, tone=""), gap=36),
      "One job: build our solar system", "The solar system test")
t2 = W("every planet")
scene(t, t2, clip80(t, t2, R1, 0, "The prompt, in Notepad",
                    caps=[(W("more than"), "6,194 characters", ""), (W("in a single file"), "one HTML file", "acc")]))
t3 = P["p02"]
scene(t2, t3, clipbox(t2, t3, R9, 34, 120, 300, 816, 459, (), CR9, FL) + clipbox(t2, t3, R8, 134, 984, 300, 816, 459, (), CR8S, AL.replace(" · Codex", ""))
      + item(W("same words"), "Same words. Same settings. No help.", "hd", "position:absolute;left:120px;top:830px;font-size:44px"))
t = P["p03"]
scene(t3, t, col(hrow(stat(t3 + .2, "One finished in", "22m 26s", None, "", vs=110), stat(W("the other took"), "The other was still checking at", "29m 36s", None, "", vs=110), gap=28),
                 hrow(pill(W("needed a reminder"), "One needed a reminder halfway through"), pill(W("by the end"), "Which built the better universe?", "acc"), gap=20), gap=36),
      "Two simulations, one winner", "The solar system test")

# ================= the models
t2 = W("on artificial analysis")
scene(t, t2, clip80(t, t2, "x/x_fable_launch.mp4", 0, "Anthropic launch film, Nov 9, 2026 (@claudeai on X)",
                    caps=[(t + .4, "Claude Fable 5.2 · Anthropic · Nov 9", ""), (W("public version"), "Mythos 5.2 + extra safeguards (cyber, biology)", "")]))
t3 = P["p04"]
scene(t2, t3, row(shot(t2 + .1, "aa_compare", "artificialanalysis.ai", (.0, .37, .42, .53), 1000),
                  col(stat(t2 + .3, "Intelligence Index", "65", "#1 on Artificial Analysis right now", "hero", CL, 65, vs=150), gap=0), gap=56, flex=[0, 1]),
      "In one corner: Claude Fable 5.2", "The contenders", "artificialanalysis.ai · @claudeai on X, Nov 10, 2026")
t = W("openai calls it")
scene(t3, t, clip80(t3, t, "x/x_astra_launch.mp4", 8, "OpenAI launch film, Nov 17, 2026 (@OpenAI on X)",
                    caps=[(t3 + .4, "GPT-6.2 Astra · OpenAI · Nov 17", ""), (W("it scores"), "Intelligence Index: 62, second place", "")]))
t2 = P["p05"]
scene(t, t2, col(bars(t + .2, [(t + .2, "Fable 5.2", 65, False, CL, None), (t + .5, "GPT-6.2 Astra", 62, False, OA, None)], 70, label_w=380, val_w=120),
                 hrow(stat(W("best model in the world"), "OpenAI's pitch", "Best for scientists", None, "", OA, vs=52),
                      stat(W("by openai's own"), "Agents' Last Exam (OpenAI's numbers)", "+5.5 pts", "Astra over Fable · long professional tasks", "hero", vs=72), gap=24), gap=40),
      "In the other corner: GPT-6.2 Astra", "The contenders", "artificialanalysis.ai · OpenAI")
t = P["p06"]
scene(t2, t, col(bars(W("and there"), [(W("and there"), "GPT-6.2 Astra", 1318, True, OA, "#1"), (W("1271"), "Fable 5.2", 1271, False, CL, None)], 1400, label_w=380, val_w=170, h=64),
                 text(W("so on paper"), "So on paper, a 3D solar system is <b class='acc'>Astra's home turf</b>.", 40, tone=""), gap=40),
      "Real people judge interactive 3D builds", "Artificial Analysis · human-graded 3D test", "artificialanalysis.ai")
t2 = W("so this comes down")
scene(t, t2, row(tw(t + .1, "fable_price", 620, .42),
                 col(hrow(stat(t + .3, "Input, per 1M tokens", "$8", "both models", "", vs=110), stat(t + .6, "Output, per 1M tokens", "$40", "both models", "", vs=110), gap=24),
                     text(W("fable actually"), "Fable just got cheaper: it was $10 / $50.", 36, tone=""), gap=28), gap=56, flex=[0, 1]),
      "Same price per token", "Price", "@claudeai on X, Nov 10, 2026")
t = P["p07"]
scene(t2, t, col(item(t2 + .1, "What do they actually <b class='acc'>build</b>?", "hd", "font-size:96px;text-align:center"), gap=0), push=False)

# ================= the prompt
t2 = P["p08"]
scene(t, t2, clip80(t, t2, R1, 0, "The full prompt: 6,194 characters",
                    caps=[(W("a living sun"), "A living Sun: plasma that boils and flares", ""), (W("each with its own"), "Mercury → Neptune, plus Pluto", ""),
                          (W("with real shadows"), "Saturn's rings, real shadows", ""), (W("15000"), "15,000 asteroids, each on its own orbit", ""),
                          (W("comets whose"), "Comet tails point away from the Sun", "acc")]))
t = P["p09"]
scene(t2, t, row(col(item(t2 + .2, "M = E − e · sin E", "hd mono acc", "font-size:76px"),
                     text(t2 + .5, "Kepler's equation: planets speed up as they swing close to the Sun.", 36, tone=""), gap=20),
                 plist(0, [(W("two scale modes"), "Two scale modes", ""), (W("a cinematic"), "A cinematic camera tour", ""), (W("a time slider"), "A time slider", ""),
                           (W("keyboard shortcuts"), "Keyboard shortcuts", ""), (W("and all of it"), "All of it in <b class='acc'>one HTML file</b>", "")], 44), gap=72),
      "Physics, not just pictures", "The prompt")
t2 = W("astra runs inside")
scene(t, t2, clip80(t, t2, R2, 14, "Claude Code (desktop app)", caps=[(t + .4, "Same prompt, word for word", ""), (W("fable 52 runs"), "Claude Code · Fable 5.2 · High effort", "acc")]))
t = P["p10"]
scene(t2, t, clip80(t2, t, R3, 16, "Codex (desktop app)", caps=[(t2 + .3, "Codex · GPT-6.2 Astra · High", "acc")]))
t2 = P["p11"]
scene(t, t2, col(timeline([(W("one honest note") + .6, "Start", "The Codex run began on GPT-6.2 Sol: wrong model selected", "bad"),
                           (W("i switched"), "Partway", "Switched to GPT-6.2 Astra", ""),
                           (W("and astra did"), "Final build", "Astra did the whole single-file rebuild", "on")]),
                 text(W("and astra did") + 1.5, "Every Codex result you'll see is Astra's rebuild. No Sol footage is shown.", 34, tone=""), gap=40),
      "One honest note", "Before we start")

# ================= the builds
t = W("so i told it again")
scene(t2, t, clip80(t2, t, R5, 2, "Codex · GPT-6.2 Astra",
                    caps=[(t2 + .4, "First attempt: a whole project, build tool, separate files", ""), (W("instead of one file"), "Not what the prompt asked for", "bad")]))
t3 = W("and then checked")
scene(t, t3, row(chart(t + .1, "assets/raw/web/codex_done.png", 900, b=t3), col(text(W("single html file", t), "“i say in single html file”", 40, tone=""),
                                                                                text(W("astra took it"), "Astra rebuilt everything as one file.", 36, tone="ink3"), gap=16),
                 gap=48, flex=[0, 1]),
      "So I told it again", "Codex · GPT-6.2 Astra", "Codex conversation")
t = P["p12"]
scene(t3, t, clip80(t3, t, R5, 15, "Codex · GPT-6.2 Astra", caps=[(t3 + .3, "Astra checks screenshots of its own build", "acc")]))
t2 = P["p13"]
scene(t, t2, clip80(t, t2, R7, 125, "Claude Code · Fable 5.2 · its own task list", crop=(720, 405, 0, 430)))
t3 = W("it notices")
scene(t2, t3, clip80(t2, t3, R7, 99, "Claude Code · Fable 5.2", caps=[(W("it opens"), "Fable opens its own build in a browser", "acc")]))
t = W("it smooths")
scene(t3, t, clip80(t3, t, R7, 130, "Fable's own words, mid-build", crop=(720, 405, 0, 230)))
t2 = P["p14"]
scene(t, t2, clip80(t, t2, R7, 200, "Then: realistic scale, clicking, the tour, the time controls", crop=(720, 405, 0, 330)))
t = P["p15"]
scene(t2, t, col(hrow(stat(t2 + .2, "Codex · GPT-6.2 Astra", "22m 26s", "done, including the restart", "", OA, vs=100),
                      stat(W("fable was still"), "Claude Code · Fable 5.2", "29m 36s", "and still checking its work", "", CL, vs=100), gap=24),
                 text(W("fun fact"), "Output speed, tokens per second:", 30, tone="ink3"),
                 bars(W("fun fact") + .3, [(W("fun fact") + .3, "Fable 5.2", 110, True, CL, None), (W("fun fact") + .6, "GPT-6.2 Astra", 49, False, OA, None)], 120, label_w=330, val_w=110, h=44, gap=16), gap=20),
      "Time", "The build", "Codex and Claude Code timers · output speed: Artificial Analysis")
t2 = P["p16"]
scene(t, t2, col(item(t + .1, "Speed: <b class='acc'>Codex</b>.", "hd", "font-size:84px;text-align:center"),
                 item(W("now let's see"), "Now, the results.", "hd ink3", "font-size:56px;text-align:center"), gap=24), push=False)

# ================= Astra's result
t = W("a loading screen")
scene(t2, t, clip80(t2, t, R8, 2, "Codex · GPT-6.2 Astra", caps=[(t2 + .4, "“Built Solar Atlas as a single self-contained HTML file”", "")]))
t3 = W("click a planet")
scene(t, t3, clip80(t, t3, R8, 45, "Codex's built-in browser", caps=[(t + .2, "Loading screen while the shaders compile", ""), (W("a planet bar"), "A planet bar along the top", "acc")]))
t = W("jupiter")
scene(t3, t, astra(t3, t, 112))
t3, t = t, P["p17"]
scene(t3, t, astra(t3, t, 118.8, caps=[(W("its size"), "Size, mass, distance, day, year, moons, a fun fact", "")]), push=False)
t2 = P["p18"]
CUR["t"] = t
scene(t, t2, montage([(t, 52), (W("mercury"), 86), (W("venus"), 93), (W("earth"), 107), (W("mars"), 114), (W("jupiter"), 122), (W("saturn"), 135),
                      (W("uranus"), 142), (W("neptune"), 151), (W("honestly"), 65)], lambda a, b, ss, instant: astra(a, b or t2, ss, instant=instant)), push=False)
t = W("pull back")
scene(t2, t, astra(t2, t, 168, caps=[(W("click pluto"), "Pluto: a lovely info card…", ""), (W("an empty patch"), "…and no Pluto", "bad")]))
t3 = W("itself admitted")
scene(t, t3, astra(t, t3, 186, caps=[(t + .5, "Full system view: the planets shrink to dots", "")]))
t2 = P["p19"]
scene(t3, t2, row(chart(t3 + .1, "assets/raw/web/codex_done.png", 900, b=t2),
                  col(check_row(W("the 60 frames"), "60 frames per second target", "NEVER CHECKED", "warn"), text(W("the 60 frames") + .8, "Codex's own words: the target “remains unverified”.", 32, tone=""), gap=18),
                  gap=48, flex=[0, 1]),
      "Codex admits a gap", "GPT-6.2 Astra · Solar Atlas", "Codex conversation")

# ================= Fable's result
t = P["p20"]
scene(t2, t, fable(t2, t, 2, CR9A, caps=[(W("an info panel"), "Info panel on the side", ""), (W("drifting past"), "The asteroid belt: real 3D rocks", "acc")]))
t3 = P["p21"]
CUR["t"] = t
scene(t, t3, montage([(t, 85), (W("a comet"), 77), (W("earth"), 114), (W("saturn"), 148), (W("uranus"), 162), (W("neptune"), 177), (W("pluto"), 194)],
                     lambda a, b, ss, instant: fable(a, b or t3, ss, instant=instant)), push=False)
t = P["p22"]
scene(t3, t, fable(t3, t, 205, caps=[(W("as a faint ring"), "The Kuiper belt: a faint ring beyond Neptune", "acc")]))
t2 = P["p23"]
scene(t, t2, row(chart(t + .1, "assets/raw/web/fable_notes_sky.png", 470, b=t2),
                 col(check_row(W("saturn's rings"), "Saturn's rings: nearly edge-on to the Sun", "NOTED", ""),
                     check_row(W("halley's comet"), "Halley's comet: far end of its orbit, no tail", "NOTED", ""),
                     check_row(W("is close to the sun"), "Comet Encke: close to the Sun, both tails", "NOTED", ""),
                     item(W("that's not decoration"), "Not decoration. <b class='acc'>Physics, running.</b>", "hd", "font-size:48px"), gap=14), gap=48, flex=[0, 1]),
      "The sky, set to today's date", "A detail I never asked for", "Fable 5.2's notes in Claude Code")
t3 = W("it wasn't perfect")
FPS = [("Full system", 11.2), ("Sun on screen", 12.3), ("Earth on screen", 10.2), ("Saturn on screen", 8.1), ("Jupiter on screen", 6.9)]
scene(t2, t3, row(chart(t2 + .1, "assets/raw/web/fable_notes_fps.png", 470, b=t3),
                  col(bars(t2 + .4, [(t2 + .4 + i * .2, lab, v, False, None, None) for i, (lab, v) in enumerate(FPS)], 16.7, 1, " ms", label_w=300, val_w=210, h=40, gap=10,
                           note="Milliseconds per frame. Bar end = 16.7 ms = 60 frames per second."),
                      text(W("fast enough"), "Every view under the line, on integrated graphics.", 34, tone=""), gap=10), gap=48, flex=[0, 1]),
      "It measured its own speed", "Fable 5.2", "Fable 5.2's notes in Claude Code")
t = P["p24"]
scene(t3, t, col(check_row(W("ceres"), "Ceres", "SKIPPED", "warn", "an optional extra, and it said so"),
                 check_row(W("ice particles"), "Tiny ice particles in Saturn's rings", "SKIPPED", "warn", "also optional, also reported"),
                 check_row(W("it needs internet"), "Needs internet on first load: three.js comes from a CDN", "ALLOWED", "", "the prompt allowed it"),
                 check_row(W("and it took longer"), "It took longer", "29½ MIN+", "warn"), gap=14),
      "Not perfect", "Fable 5.2 · what it told me")

# ================= verdict on this test
t2 = P["p25"]
scene(t, t2, col(win_row(W("speed"), "Speed", "astra"), win_row(W("interface design"), "Interface design", "astra"),
                 win_row(W("following the brief"), "Following the brief the first time", "fable"), win_row(W("3d realism"), "3D realism", "fable"),
                 win_row(W("physics and accuracy"), "Physics and accuracy", "fable"), win_row(W("and honesty"), "Honesty about what was skipped", "tie"), gap=12),
      "Scorecard", "This test")
t = P["p26"]
scene(t2, t, col(item(t2 + .1, "On this test, <b class='acc'>Fable 5.2</b> built the better universe.", "hd", "font-size:68px"),
                 text(W("but one test"), "But one test is one test.", 40, tone="ink3"),
                 check_row(W("remember"), "Human-graded 3D benchmark: Astra 1318, Fable 1271", "ASTRA #1", ""), gap=30))

# ================= what other people found
t3 = W("in a blender test")
scene(t, t3, col(text(t + .2, "Their head-to-heads look a lot like mine.", 40, tone=""),
                 hrow(stat(W("in a game test"), "GPT-6.2 Astra · game test", "~4 min", "but faked the 3D", "", OA, vs=96),
                      stat(W("while fable"), "Fable 5.2 · game test", "~10 min", "built the real thing", "hero", CL, vs=96), gap=24), gap=30),
      "Same prompt, other testers", "What other people found", "dev.to/otterdev3, “We gave Claude Fable 5.2 and GPT-6.2 the same game prompt”")
t2 = W("and youtuber")
scene(t3, t2, clip80(t3, t2, "x/x_blender.mp4", 0, "@AmirMushich on X, Nov 18, 2026",
                     caps=[(t3 + .4, "Blender test: Astra modelled better", ""), (t3 + 1.6, "at about a sixth of the cost", "acc")]))
t = P["p27"]
scene(t2, t, row(shot(t2 + .2, "nateherk", "geeky-gadgets.com · Nov 19, 2026", (.05, .48, .85, .9), 820),
                 col(hrow(stat(W("12 tasks"), "Fable 5.2 won", "7", None, "hero", CL, vs=120), stat(W("12 tasks") + .4, "Astra won", "5", None, "", OA, vs=120), gap=20),
                     text(W("but astra was cheaper"), "Astra was cheaper and faster on all 12.", 36, tone=""), gap=20), gap=48, flex=[0, 1]),
      "Nate Herk: 12 tasks", "What other people found", "Nate Herk's test, via geeky-gadgets.com")
t2 = P["p28"]
scene(t, t2, hrow(duel(W("last exam diamond"), "HLE · Diamond", "80.2", "72.2", True),
                  duel(W("physics research"), "CritPt · physics", "76.5", "71.5", True),
                  duel(W("in a terminal"), "Terminal-Bench · Science", "73.3", "78.1", False),
                  item(W("science index"), '<div class="slab" style="font-size:25px">Vals Science Index</div><div class="sval" style="font-size:72px">#1</div><div class="drow win"><img src="' + OA + '" alt="">GPT-6.2 Astra</div>', "stat", "flex:1"), gap=20),
      "The benchmarks split", "Artificial Analysis · head-to-head", "artificialanalysis.ai · vals.ai")
t = P["p29"]
scene(t2, t, col(hrow(stat(W("one task costs"), "GPT-6.2 Astra · max effort", "$4.00", "14.0 min per task", "", OA, vs=96),
                      stat(W("one task costs") + 2, "Fable 5.2 · max effort", "$26.54", "41.4 min per task", "", CL, vs=96), gap=24),
                 text(W("same price per token"), "Same price per token. Fable just uses far more tokens.", 34, tone=""), gap=24),
      "Cost per task", "Artificial Analysis", "artificialanalysis.ai")

# ================= real science
t2 = W("protein designer")
scene(t, t2, row(shot(t + .2, "protein", "xinmingtu.cn · Nov 2026", (.25, .45, .75, .73), 760),
                 col(text(W("predicted the next"), "Next amino acid, real protein sequences:", 32, tone="ink3"),
                     bars(W("predicted the next") + .3, [(W("54"), "Fable 5.2", 54, True, CL, None), (W("54") + .4, "Astra", 0.4, False, OA, "close to zero")], 100, 0, "%", label_w=260, val_w=200), gap=16),
                 gap=48, flex=[0, 1]),
      "Does it know real proteins?", "Real science", "Xinming Tu, protein-sequence test")
t3 = W("and anthropic says")
scene(t2, t3, row(tw(t2 + .1, "sokrypton", 600, .42), col(text(t2 + .4, "Protein designer Sergey Ovchinnikov:", 32, tone="ink3"),
                                                          item(W("fold correctly"), "Fable predicted a protein's fold correctly, from a simple prompt.", "hd", "font-size:48px"), gap=16),
                  gap=56, flex=[0, 1]),
      None, None, "@sokrypton on X, Nov 18, 2026")
t = P["p30"]
scene(t3, t, row(shot(t3 + .2, "blackhole", "anthropic.com/research · Nov 17, 2026", (.2, .12, .8, .64), 820),
                 col(text(t3 + .5, "Anthropic: Fable helped solve two open problems in black-hole physics.", 38, tone=""),
                     verdict(t3 + 1.6, "NOT PEER-REVIEWED YET", "warn", 30), gap=24), gap=48, flex=[0, 1]),
      None, None, "Anthropic, “Claude solves two open problems in the physics of black holes”")

# ================= builds
t2 = W("with fable")
scene(t, t2, col(item(t + .1, "People are building wild things with both.", "hd", "font-size:72px;text-align:center"), gap=0), push=False)
t3 = W("a webcam")
scene(t2, t3, clip80(t2, t3, "x/x_rover.mp4", 5, "@DilumSanjaya on X", caps=[(t2, "Fable 5.2 · Mars rover suspension sim", "acc")]))
t = W("a live weather")
scene(t3, t, clipbox(t3, t, "x/x_xray.mp4", 8, 717, 88, 486, 864, [(t3, "Fable · webcam X-ray mirror", "acc")])
      + item(t3 + .3, "@HashemGhaili on X", "tx ink3", "position:absolute;left:1240px;top:900px;font-size:22px"))
t2 = W("with astra") + .5
scene(t, t2, clip80(t, t2, "x/x_weather.mp4", 10, "@mattshumer_ on X", caps=[(t, "Fable · live weather globe", "acc")]))
t3 = W("openai's own demo")
scene(t2, t3, clip80(t2, t3, "x/x_elevator.mp4", 18, "Ethan Mollick (@emollick) on X", caps=[(t2 + .3, "Astra · space elevator ride, Blender + Unity", "")]))
t = P["p31"]
scene(t3, t, clip80(t3, t, "x/x_carsolver.mp4", 2, "OpenAI demo, via @AngryTomtweets on X", caps=[(t3 + .3, "Astra writes a car physics solver, animated in Blender", "")]))

# ================= the pattern + recommendation
card = lambda t0, head_, rows_, tone, lg: item(t0, f'<div class="slab"><img src="{lg}" alt="" class="slogo">{head_}</div>' +
                                               "".join(f'<div class="hd" style="font-size:38px;margin-top:16px">{r}</div>' for r in rows_), f"stat {tone}", "flex:1")
t2 = P["p32"]
scene(t, t2, hrow(card(W("fable is the deeper"), "Fable 5.2", ["The deeper, careful builder", "Reads the whole brief", "Checks its own work", "Gets the details right"], "hero", CL),
                  card(W("astra is the faster"), "GPT-6.2 Astra", ["The faster, cheaper one", "A great eye for design", "Surprisingly close"], "", OA), gap=28),
      "The pattern", "Verdict")
t = P["p33"]
scene(t2, t, col(win_row(W("if you want something"), "Polished, fast, cheap per task", "astra"),
                 win_row(W("if you want a model"), "Follows a long brief, checks itself, gets the physics right", "fable"),
                 text(W("the gap at the top"), "The gap at the top is small, and it moves every few weeks.", 38, tone="ink3"), gap=20),
      "Which one should you use?", "Verdict")
t2 = W("this has been")
scene(t, t2, col(item(t + .1, "Which one would you trust with your next project?", "hd", "font-size:72px;text-align:center"),
                 text(W("tell me what"), "And what should they build next?", 40, "center", "ink3"), gap=30), push=False)
scene(t2, END, col(item(t2, '<img src="assets/img/aiequator_k.png" alt="" style="width:300px;height:300px;display:block;margin:0 auto">', ""),
                   text(t2, "Subscribe for more AI news", 32, "center", "ink3"), gap=30), push=False, last=True)
