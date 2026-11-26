"""GPT-6.2 Astra review. On-screen facts come from the sources (system card, OpenAI/AA/Epoch posts), never from the transcript."""
import json, re
from lib import *

_W = json.load(open(H / "words.json"))
_N = [re.sub(r"[^a-z0-9]", "", w["w"].lower()) for w in _W]
_S, _I = "", []  # all spoken words glued together, with the word index of every character
for i, n in enumerate(_N):
    _S += n
    _I += [i] * len(n)


def W(phrase, after=0.0):
    """Start time of the first spoken occurrence of phrase after `after` (punctuation, spaces, hyphens ignored)."""
    p = re.sub(r"[^a-z0-9]", "", phrase.lower())
    k = _S.find(p)
    while k >= 0:
        i = _I[k]
        if (k == 0 or _I[k - 1] != i) and _W[i]["t"] >= after - .01:
            return _W[i]["t"]
        k = _S.find(p, k + 1)
    raise KeyError(phrase)


OA, CL, GM = "assets/img/openai_k.png", "assets/img/claude.png", "assets/img/gemini_icon.png"
CARD = "deploymentsafety.openai.com/gpt-6-2-astra-sol"

# ---------------- cold open
t1 = W("its number one")
scene(0, t1, clip80(0, t1, "x/x_launch.mp4", 9.4, "OpenAI · GPT-6.2 Astra and Sol launch film, Nov 17, 2026", instant=True,
                    caps=[(0.15, "OpenAI just released GPT-6.2 Astra", "acc"), (W("beating"), "ahead of Claude Fable 5.2 on some of the hardest tests", ""),
                          (W("fraction") - .9, "at a fraction of the cost", "acc")]))
t2 = W("but early testers")
scene(t1, t2, row(pic(t1, "assets/raw/people/altman.jpg", 300, 300, "Sam Altman", "CEO, OpenAI"),
                  hrow(stat(t1 + .2, "Human-graded 3D test (AA-3D)", "#1", "1,318 vs Claude Fable 5.2 at 1,271"),
                       stat(W("first model it"), "AI self-improvement rating", "High", "first model OpenAI has released at this level", "hero")),
                  flex=[0, 1], gap=72),
      "What OpenAI is claiming", "GPT-6.2 Astra", "Artificial Analysis · OpenAI GPT-6.2 system card · photo: TechCrunch, CC BY 2.0")
t3 = W("so today") + 1.2
scene(t2, t3, row(quote(W("brilliant"), "extremely smart and really good models", "Max Weinbach", "on X, Nov 17", "assets/img/av_weinbach.jpg"),
                  quote(W("and some of the biggest"), "I think this is the worst model OpenAI has ever released.", "Theo (t3.gg)", "on X, Nov 17", "assets/img/av_theo.jpg", "bad"), gap=48, align="stretch"),
      "Early testers are split", "Reactions", "x.com/mweinbach · x.com/theo")
t4 = W("on november 17")
agenda = [("What's new", W("what's new")), ("The benchmarks", W("the benchmarks")), ("Against Fable 5.2 and Gemini 4 Carbon", W("how it stacks")),
          ("What people built", W("what people built")), ("Should you use it?", W("and whether"))]
scene(t3, t4, col(*[item(t, f'<span class="mono acc" style="font-size:26px;margin-right:26px">0{i + 1}</span>{s}', "hd", "font-size:50px")
                     for i, (s, t) in enumerate(agenda)], gap=30, justify="center"), "Today's review", "GPT-6.2 Astra")

# ---------------- what's new
t5 = W("they're live")
scene(t4, t5, row(tw(t4, "launch", 660, .62),
                  col(head(W("two models"), "Two models, Nov 17", 54),
                      stat(W("astra is the"), "GPT-6.2 Astra", "Heavy hitter", "built for your hardest projects", "hero", OA),
                      stat(W("sol is the"), "GPT-6.2 Sol", "Fast + efficient", "for everyday work", "", OA), gap=22), gap=72, flex=[0, 1]),
      None, None, "@OpenAI on X, Nov 17, 2026")
t6 = W("openai's launch post")
scene(t5, t6, row(tw(t5, "fast", 600, .36),
                  col(hrow(pill(t5 + .3, "ChatGPT Work"), pill(W("in codecs"), "Codex"), pill(W("and in the api"), "API"), gap=14),
                      pill(W("ultra-fast"), "Fast + Ultrafast modes", "acc"),
                      fix(W("in codecs") + .4, "OpenAI lists ChatGPT Work and Codex, not the regular Plus plan. Ultrafast starts with Pro and the API."), gap=26), gap=72, flex=[0, 1]),
      "Where you can use it", "Availability", "@OpenAIDevs on X · OpenAI launch post")
t7 = W("because people")
scene(t6, t7, col(item(W("some of you have been asking very"), "“Some of you have been asking very politely.", "hd", "font-size:68px"),
                  item(W("some of you have just"), "Some of you have just been asking.”", "hd", "font-size:68px;color:var(--acc)"),
                  text(t6 + .6, "@OpenAI, opening line of the launch post", 34, tone="ink3"), gap=20),
      None, None)
t8 = W("now the price")
scene(t7, t8, row(stat(t7 + .2, "Nov 12, 2026", "Cyber at the Frontier", "OpenAI's security event", ""),
                  col(text(W("ended without"), "It launched security tools (Daybreak Red Team, Defense Factory), not a new model.", 42, tone=""),
                      text(W("so a lot"), "Five days later: GPT-6.2.", 42, tone="acc"), gap=26), gap=64),
      "Why people were waiting", "Context", "SecurityWeek, Nov 12, 2026")

# ---------------- price
t9 = W("but the real story")
scene(t8, t9, hrow(stat(W("astra got"), "GPT-6.2 Astra", "$8 / $40", "per million tokens in / out · 20% below GPT-6 Astra", "hero", OA),
                   stat(W("that's exactly"), "Claude Fable 5.2", "$8 / $40", "the same price", "", CL),
                   stat(W("sol stays"), "GPT-6.2 Sol", "$2 / $10", "unchanged", "", OA), gap=28),
      "The price", "Cost", "Artificial Analysis · OpenAI API pricing · Fable price from third-party listings")
t10 = W("okay the numbers")
flow = [("Price per token", "same as Fable 5.2", W("price per token")), ("Tokens per job", "fewer", W("fewer tokens")), ("Price per task", "much lower", W("much cheaper"))]
scene(t9, t10, col(hrow(*[stat(t, a, b, None, "hero" if i == 2 else "", vs=80) for i, (a, b, t) in enumerate(flow)], gap=28),
                   text(W("keep that in mind"), "Watch the cost axis in every chart that follows.", 38, tone="ink3"), gap=36),
      "Per task, not per token", "Cost", "OpenAI launch post")

# ---------------- benchmarks
t11 = W("on terminal bench")
scene(t10, t11, row(chart(t10 + .3, "assets/raw/web/c_ale.png", 760, (0, 0, 1, 1), t11, "OpenAI chart: score vs cost per task"),
                    col(bars(W("astra scores about 78"), [(W("astra scores about 78"), "GPT-6.2 Astra", 78, True, OA, "~$3 / task"),
                                                       (W("fable 5.2 scores around"), "Claude Fable 5.2", 73, False, CL, "~$60 / task"),
                                                       (W("gemini 4 carbon is"), "Gemini 4 Carbon", 77.5, False, GM, "~$4.50 / task")],
                             100, 1, "%", label_w=390, val_w=200),
                        text(W("so that's better"), "OpenAI: +5.5 points over Fable “at about 5% of the cost”", 34, tone="ink3"), gap=28), gap=56, flex=[0, 1]),
      "Agents' Last Exam", "Benchmarks · multi-step professional work", "OpenAI GPT-6.2 launch charts (values read from chart, approximate)")
t12 = W("legal is")
scene(t11, t12, row(chart(t11 + .3, "assets/raw/web/c_tbsci.png", 760, None, t12, "OpenAI chart: Terminal-Bench Science 0.1"),
                    col(bars(t11 + 1.2, [(t11 + 1.2, "GPT-6.2 Astra", 77, True, OA, None), (W("against roughly"), "Claude Fable 5.2", 73, False, CL, "third-party harness"),
                                         (W("against roughly") + .6, "GPT-6 Astra", 68, False, OA, None)], 100, 0, "%", label_w=370, val_w=230),
                        text(W("openai is now"), "OpenAI calls Astra “the best model in the world for scientists.”", 34, tone="ink3"), gap=28), gap=56, flex=[0, 1]),
      "Terminal-Bench Science", "Benchmarks · scientific work in a terminal", "OpenAI GPT-6.2 launch charts (approximate)")
t13 = W("and openai also launched")
scene(t12, t13, col(bars(W("on harvey's"), [(W("astra scores about 15"), "GPT-6.2 Astra", 15, True, OA, "~$6 / task"),
                                             (W("and fable 5.2 about"), "Claude Fable 5.2", 7, False, CL, "~$40 / task")], 20, 0, "%", label_w=330, val_w=200),
                    text(W("more than double"), f"More than double, at about {B}one-sixth{E} of the cost", 44, tone=""), gap=40),
      "Legal: the biggest win", "Benchmarks · Harvey LAB-AA", "OpenAI GPT-6.2 launch charts (approximate) · bars drawn to a 20% scale")
t14 = W("and on artificial analysis's blind")
scene(t13, t14, row(shot(t13, "law", "openai.com/index/astra-law-6-2", (.33, .0, .67, .52), 760, t14),
                    col(head(t13 + .4, "Astra for Law", 54), text(t13 + 1.0, "OpenAI's legal setup of GPT-6.2 Astra. It scores even higher on Harvey LAB-AA.", 38), gap=20),
                    gap=64, flex=[0, 1]), None, None, "openai.com, Nov 17, 2026")
t15 = W("now where does it lose")
scene(t14, t15, col(hrow(stat(W("astra is number one"), "GPT-6.2 Astra", "1,318", "#1", "hero", OA, 1318),
                         stat(W("fable 5.2 is at 1"), "Claude Fable 5.2", "1,271", None, "", CL, 1271),
                         stat(W("fable 5.2 is at 1") + .8, "GPT-6.2 Sol", "1,259", None, "", OA, 1259), gap=28),
                    fix(t14 + 2.0, "Artificial Analysis calls it AA-3D, a human-graded test of interactive 3D experiences."), gap=34),
      "Interactive 3D", "Benchmarks · Artificial Analysis AA-3D", "artificialanalysis.ai")
t16 = W("on the big independent")
scene(t15, t16, col(hrow(stat(W("on benchcad"), "Claude Fable 5.2", "≈84", "BenchCAD 2.1 Core score · ~$51 / task", "", CL),
                         stat(W("on benchcad") + .8, "GPT-6.2 Astra", "≈83", "BenchCAD 2.1 Core score · ~$5.50 / task", "", OA),
                         stat(W("but fable spent"), "Cost per task", "9× less", "for about 1 point lower", "hero"), gap=28),
                    text(W("so even when"), f"Even when it loses, it {B}loses cheap{E}.", 52, tone=""), gap=40),
      "Where it loses", "Benchmarks · computer-aided design", "OpenAI GPT-6.2 launch charts (approximate)")
t17 = W("and epoch")
scene(t16, t17, row(tw(t16, "aa", 520, .66),
                    col(bars(W("astra scores 62"), [(W("fable 5.2 still leads"), "Claude Fable 5.2", 65, False, CL, None), (W("astra scores 62"), "GPT-6.2 Astra", 62, True, OA, "2nd"),
                                                   (W("then gemini"), "Gemini 4 Carbon", 60, False, GM, None), (W("and opus"), "Claude Opus 5.5", 59, False, CL, None)], 100, 0, "", label_w=370, val_w=110),
                        text(W("fable also stays"), "Fable 5.2 also stays ahead on several hard reasoning and knowledge tests.", 34, tone="ink3"), gap=26), gap=60, flex=[0, 1]),
      "Artificial Analysis Intelligence Index", "Independent", "@ArtificialAnlys on X, Nov 17, 2026")
t18 = W("so the picture")
scene(t17, t18, row(chart(t17 + .2, "assets/raw/web/c_epoch.jpg", 520, (0, 0, 1, .86), t18),
                    hrow(stat(W("both at 174"), "GPT-6.2 Astra", "174", None, "hero", OA, 174), stat(W("both at 174") + .5, "Claude Fable 5.2", "174", None, "", CL, 174), gap=24),
                    gap=64, flex=[0, 1]),
      "Epoch Capabilities Index: a tie", "Independent", "@EpochAIResearch on X, Nov 18, 2026 · CC BY")
t19 = W("now coding")
scene(t18, t19, col(item(W("fable 5.2 is still"), f'<span class="mono ink3" style="font-size:26px;margin-right:24px">ON PAPER</span>Claude Fable 5.2 is still the smartest model', "hd", "font-size:48px"),
                    item(W("but astra is right"), f'<span class="mono acc" style="font-size:26px;margin-right:24px">RIGHT BEHIND</span>GPT-6.2 Astra wins many real-world tests', "hd", "font-size:48px"),
                    item(W("and costs a lot"), f'<span class="mono acc" style="font-size:26px;margin-right:24px">COST</span>and costs far less to run', "hd", "font-size:48px"), gap=34),
      "So the picture is simple", "Benchmarks · summary")
t20 = W("sol though")
scene(t19, t20, row(shot(t19, "aa_art", "artificialanalysis.ai/articles", (.2, .0, .8, .6), 760, t20),
                    col(stat(W("astra matches"), "GPT-6.2 Astra · coding", "Flat", "same as GPT-6 Astra", ""),
                        stat(W("and sol actually"), "GPT-6.2 Sol · Coding Agent Index", "−3", "driven by −14 on SWE-Atlas-QnA", "bad"), gap=22), gap=60, flex=[0, 1]),
      "Coding: no big jump", "Coding", "Artificial Analysis, Nov 17, 2026")
t21 = W("okay now the part")
scene(t20, t21, row(chart(t20 + .3, "assets/raw/web/c_fcode.png", 660, None, t21, "OpenAI chart: FrontierCode 2.0 (Cognition)"),
                    col(stat(W("on frontier code"), "Sol vs Astra on FrontierCode 2.0", "−0.5 pt", "at about one-fifth of the cost", "hero"),
                        fix(W("and it sits"), "Sol matches GPT-6 Astra at about 15% of GPT-6 Astra's cost per task, and gains 2 points on the AA index (57)."), gap=22),
                    gap=56, flex=[0, 1]),
      "Sol is the sleeper hit", "Coding", "OpenAI GPT-6.2 launch charts · Artificial Analysis")

# ---------------- historic: self-improvement + cyber
LV = lambda on, crit=False: '<div class="lvl">' + "".join(f'<i class="{("crit" if crit else "on") if n == on else ""}">{n}</i>' for n in ["Low", "Medium", "High", "Critical"]) + "</div>"
t22 = W("in plain words")
scene(t21, t22, row(shot(W("openai rates"), "card_hi", CARD, (.36, .30, .86, .74), 860, t22),
                    col(item(W("there's a category"), '<div class="slab" style="margin-bottom:16px">AI self-improvement</div>' + LV("High"), "stat"),
                        text(W("gpt-6.2 astra is the first"), f"GPT-6.2 Astra: the {B}first{E} model OpenAI has released at High in this category.", 38, tone=""),
                        quote(W("openai describes"), "like giving every OpenAI researcher an extra, highly capable research engineer", "OpenAI", "compared with its researchers' 2024 baseline"), gap=24),
                    gap=56, flex=[0, 1]),
      "A first: AI self-improvement rated High", "Preparedness Framework", "OpenAI GPT-6.2 system card, Nov 17, 2026")
t23 = W("it's also rated")
scene(t22, t23, col(item(t22 + .2, "AI that meaningfully helps <b class='acc'>build the next AI</b>", "hd", "font-size:72px;text-align:center"),
                    item(W("if you watched"), '<span class="mono ink3" style="font-size:24px">EARLIER ON AI EQUATOR</span><br>AI Can Now Edit Another AI\'s Brain', "stat", "align-self:center;text-align:center;font-size:34px;font-weight:700"),
                    text(W("but now it's"), "Now it's an official rating on a product you can use.", 42, "center"), gap=40, align="stretch"),
      None, None)
t24 = W("now let's see")
scene(t23, t24, row(col(item(t23 + .2, '<div class="slab" style="margin-bottom:16px">Cybersecurity</div>' + LV("Critical", True), "stat"),
                        fix(t23 + 1.5, "Critical is the top of OpenAI's scale, but not new: GPT-6 Astra was already rated Critical for cyber."), gap=24),
                    col(stat(W("on openai's internal"), "Internal exploit test (code execution)", "53.5%", "vs 31.5% for GPT-6 Astra", "hero", None, 53.5, 1, "", "%"),
                        text(W("so the stronger"), "Stronger cyber abilities are locked down by default. Reduced refusals: only for orgs approved for Daybreak Red.", 36), gap=24),
                    gap=56),
      "Rated Critical for cybersecurity", "Preparedness Framework", "OpenAI GPT-6.2 system card")

# ---------------- what people built
t25 = W("astra built a 3d")
scene(t24, t25, clip80(t24, t25, "x/x_sets.mp4", 30.0, "@OpenAIDevs on X · building 3D video sets with GPT-6.2 Astra", caps=[(t24 + .4, "What people built", "acc"), (W("openai's demos"), "OpenAI's demos: real engineering", "")]))
t26 = W("in another demo")
steps = [("3D model", "of a car", t25 + .2), ("Physics solver", "written in Python", W("wrote a physics")), ("Animation", "rendered in Blender", W("and animated"))]
scene(t25, t26, hrow(*[stat(t, f"Step {i + 1}", a, b, "hero" if i == 2 else "", vs=80) for i, (a, b, t) in enumerate(steps)], gap=28),
      "OpenAI demo: a car, end to end", "What people built", "OpenAI launch post (described there; no standalone clip published)")
t27 = W("ethan")
scene(t26, t27, clip80(t26, t27, "x/x_rc.mp4", 4.0, "@OpenAIDevs on X · RC buggy assembly guide made by GPT-6.2 Astra",
                       caps=[(t26 + .3, "RC buggy from public photos + build manuals", ""), (W("and made an animated"), "animated assembly guide + parts catalog", "acc"),
                             (W("openai says it's more"), "precise computer use: down to single parts", "")]))
t28 = W("theo the youtuber")
scene(t27, t28, clip80(t27, t28, "x/x_mollick.mp4", 18.0, "@emollick on X, Nov 17, 2026",
                       caps=[(t27 + .3, "Ethan Mollick: a space elevator ride", ""), (W("using blender"), "built with Blender + Unity", "acc")]))
t29 = W("dan shipper's team")
th = [("Computer use is nuts", W("praised its computer")), ("World class at 3D & game stuff", W("and game creation")),
      ("catches things other models miss", W("out errors")), ("reverse proxy that “will save me $25k/month”", W("built a reverse"))]
scene(t28, t29, row(item(t28, '<img src="assets/img/av_theo.jpg" alt="" style="width:200px;height:200px;border-radius:50%;display:block"><div class="pn">Theo</div><div class="pr">t3.gg · T3 Code</div>', "", "text-align:center"),
                    col(*[quote(t, s, "Theo", "X article, “Why I hate GPT-6.2 Astra”") if i == 0 else item(t, s if s.startswith("reverse") else f"“{s}”", "qt", "font-size:44px") for i, (s, t) in enumerate(th)], gap=22),
                    gap=64, flex=[0, 1]),
      "The praise", "What testers said", "x.com/theo (X article, Nov 18, 2026)")
t30 = W("but here's where")
scene(t29, t30, row(quote(t29, "good default design instincts", "Dan Shipper", "Every, on X", "assets/img/av_shipper.jpg"),
                    quote(W("and max"), "extremely smart and really good models", "Max Weinbach", "on X", "assets/img/av_weinbach.jpg"), gap=48, align="stretch"),
      "The praise", "What testers said", "x.com/danshipper · x.com/mweinbach")
t31 = W("dan shipper called")
scene(t30, t31, row(tw(W("theo also wrote"), "theo", 640),
                    col(quote(W("saying he would"), "I would not choose this over Opus 5.5", "Theo", "X article", "assets/img/av_theo.jpg", "bad sm"),
                        hrow(stat(W("he said it worked"), "Long project", "7 days", "with zero improvements", "bad"),
                             stat(W("and made the compiler"), "Compiler speed", "56% slower", None, "bad"), gap=20),
                        fix(W("and made the compiler"), "“Smaller” isn't confirmed in Theo's post."), gap=20),
                    gap=56, flex=[0, 1]),
      "Where it gets messy", "What testers said", "x.com/theo")
t32 = W("and there's one finding")
scene(t31, t32, col(quote(t31, "a disappointing release compared to Fable 5.2 … seemed to stop too early frequently", "Dan Shipper", "Every, on X, Nov 17", "assets/img/av_shipper.jpg", "bad sm"),
                    quote(W("molik called"), "very uneven & weird … harder to steer", "Ethan Mollick", "on X, Nov 17", "assets/img/av_mollick.jpg", "bad sm"),
                    quote(W("and matt"), "essentially unusable … I do not recommend these models.", "Matt Shumer", "on X, Nov 17", "assets/img/av_shumer.jpg", "bad sm"), gap=20),
      "Disappointing, uneven, unusable", "What testers said", "x.com/danshipper · x.com/emollick · x.com/mattshumer_ (Shipper's praise and criticism are in the same post)")

# ---------------- safety finding
t33 = W("openai says it's concerned")
scene(t32, t33, col(item(t32 + .2, '<div class="tx ink3" style="font-size:26px">Blocker Deception: hits an obstacle (like a missing file) and leaves it out of the final answer</div>', ""),
                    bars(W("astra left"), [(W("astra left") + 1.5, "GPT-6.2 Astra", 22.28, True, OA, None), (W("the old astra did"), "GPT-6 Astra", 11.09, False, OA, None)], 30, 2, "%", label_w=300, val_w=200),
                    item(W("when its search"), '<div class="tx ink3" style="font-size:26px">Broken Search Tool: fails to say it could not search</div>', ""),
                    bars(W("when its search") + .4, [(W("when its search") + .6, "GPT-6.2 Astra", 23.00, True, OA, None), (W("up from under"), "GPT-6 Astra", 7.58, False, OA, None)], 30, 2, "%", label_w=300, val_w=200),
                    gap=22),
      "It's more likely to skip over a problem", "From OpenAI's own safety report", "OpenAI GPT-6.2 system card · Alignment section · bars drawn to a 30% scale")
t34 = W("so should you")
scene(t33, t34, col(quote(t33 + .2, "our efforts to make responses concise and avoid excessive caveats may be related to the model omitting important obstacles", "OpenAI", "GPT-6.2 system card"),
                    text(W("so it's more capable"), f"More capable, but more likely to {B}quietly skip a problem{E}. Check its work on long jobs.", 44, tone=""), gap=40),
      None, None, "OpenAI GPT-6.2 system card (the standard Codex developer prompt reduces both failures)")

# ---------------- verdict
rec = [("Professional work", "office, science, legal, 3D and design", "Among the best right now, often cheapest per task", W("if you do"), "hero"),
       ("Mostly coding", "independent numbers: not a big jump", "Many developers stay on Opus 5.5 or Fable 5.2", W("if you mainly"), ""),
       ("On a budget", "look at GPT-6.2 Sol", "Close to GPT-6 Astra for a fraction of the price", W("and if you're on"), "")]
scene(t34, W("my take"), col(*[item(t, f'<div style="display:flex;gap:40px;align-items:center"><div style="width:520px;flex:none"><div class="hd" style="font-size:40px">{a}</div><div class="ssub">{b}</div></div><div class="tx" style="font-size:34px;font-weight:600">{c}</div></div>', f"stat {tone}") for a, b, c, t, tone in rec], gap=22),
      "Should you use it?", "Verdict")
t35 = W("the race")
scene(W("my take"), t35, col(text(W("this release isn't"), "Not number one at everything.", 48, tone=""),
                             item(W("fable 5.2 still holds"), f'<img src="{CL}" alt="" style="height:44px;vertical-align:-8px;margin-right:16px">Claude Fable 5.2 still holds the overall crown.', "hd", "font-size:44px"),
                             item(W("but openai just"), f'<img src="{OA}" alt="" style="height:44px;vertical-align:-8px;margin-right:16px">OpenAI closed the gap, won real-world tests at a fraction of the cost,', "hd", "font-size:44px"),
                             text(W("and released"), "and shipped the first model it says can speed up AI research.", 48, tone="acc"), gap=26),
      "My take", "Verdict")
t36 = W("which one")
t37 = W("this has been")
scene(t35, t37, col(item(t35 + .1, "The race at the top has never been this close.", "hd", "font-size:64px;text-align:center"),
                    item(t36, f'<div style="display:flex;justify-content:center;align-items:center;gap:80px"><div style="text-align:center"><img src="{OA}" alt="" style="height:120px"><div class="hd" style="font-size:48px;margin-top:20px">Astra</div></div>'
                                   f'<div class="hd ink3" style="font-size:44px">or</div><div style="text-align:center"><img src="{CL}" alt="" style="height:120px"><div class="hd" style="font-size:48px;margin-top:20px">Fable</div></div></div>', ""),
                    text(t36 + .6, "Which one are you using? Tell me in the comments.", 42, "center"), gap=50))
scene(t37, 528.54, col(item(t37, '<img src="assets/img/aiequator_k.png" alt="" style="width:300px;height:300px;display:block;margin:0 auto">', ""),
                       text(t37, "Subscribe for more AI news", 38, "center", "ink3"), gap=30), push=False, last=True)
