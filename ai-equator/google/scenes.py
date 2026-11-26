"""Google Was Losing the AI Race. Then It Did This. On-screen facts come from the sources, never from the transcript."""
import json, re
from lib import *

_W = json.load(open(H / "words.json"))
_N = [re.sub(r"[^a-z0-9]", "", w["w"].lower()) for w in _W]
_S, _I = "", []
for i, n in enumerate(_N):
    _S += n
    _I += [i] * len(n)


def W(phrase, after=0.0):
    """Start time of the first spoken occurrence of phrase after `after` (punctuation and spaces ignored)."""
    p = re.sub(r"[^a-z0-9]", "", phrase.lower())
    k = _S.find(p)
    while k >= 0:
        i = _I[k]
        e = k + len(p)  # must start and end on word boundaries ("yes" never matches "yesterday")
        if (k == 0 or _I[k - 1] != i) and (e == len(_S) or _I[e] != _I[e - 1]) and _W[i]["t"] >= after - .01:
            return _W[i]["t"]
        k = _S.find(p, k + 1)
    raise KeyError(phrase)


GM, GL, OA, CL = "assets/raw/logos/gemini_icon.png", "assets/raw/logos/google.png", "assets/img/openai_k.png", "assets/img/claude.png"
AA = "artificialanalysis.ai"


def tag(t, s, tone="acc"):
    return item(t, s, f"kick {tone}", "font-size:24px")


# ---------------- cold open: has Google lost the AI race?
t1 = W("the company that invented")
scene(0, t1, col(hrow(shot(0, "n_delay", "9to5google.com · Jul 16, 2026", (.05, .12, .63, .62), 500),
                      shot(0, "n_tc", "techcrunch.com · Jul 21, 2026", (.30, .04, 1.0, .60), 500),
                      shot(0, "n_cancel", "officechai.com · Aug 10, 2026", (.10, .15, .64, .62), 500), gap=32, justify="center"),
                 item(W("has google lost"), "Has Google lost the AI race?", "hd", "font-size:84px;text-align:center"), gap=56),
      None, None, "9to5Google · TechCrunch · OfficeChai (SemiAnalysis report)")
t2 = W("its big summer")
scene(t1, t2, row(stat(t1 + .2, "2017 · Google researchers", "“Attention Is All You Need”", "the Transformer: the T in ChatGPT", "", GL, vs=58),
                  col(big(W("had gone more"), "7+ months", 160, "bad"), text(W("had gone more") + .4, "without a new top-tier Gemini model", 40, tone=""), gap=10), gap=72, flex=[1, 1]),
      "The company that invented the technology behind ChatGPT", "Mid-2026", "Vaswani et al., Google, 2017 · Artificial Analysis (“first model above Flash class in over 7 months”)")
t3 = W("now look at the last")
scene(t2, t3, row(pic(t2, "assets/raw/people/hassabis.jpg", 240, 300, "Demis Hassabis", "moved to DeepMind chair, Aug 5"),
                  timeline([(t2 + .2, "Feb 19", "Gemini 3.1 Pro tops AA", "on"), (W("its big summer") + .9, "June", "Gemini 3.5 Pro misses its date", "bad"),
                            (W("its ai lab"), "Aug 5", "DeepMind shake-up", "bad"), (W("and openai and anthropic"), "Sep 1–22", "Fable 5.1, GPT-6 Astra, Opus 5.5", "")]),
                  gap=64, flex=[0, 1]),
      "Seven quiet months", "How bad it got", "TheNextWeb, Aug 5, 2026 · 9to5Google · TechCrunch · photo: Duncan Hull, CC BY-SA 4.0")

# ---------------- the last nine days
t4 = W("and today google has")
scene(t3, t4, hrow(tile(W("november 10th"), "C", "Nov 10 · open to everyone", w=440), tile(W("november 12th"), "H", "Nov 12 · inside Google Search", w=440),
                   tile(W("november 18th"), "Ne", "Nov 18 · released", "on", w=440), gap=40, justify="center"),
      "Now look at the last nine days", "The comeback")
t5 = W("so today let's talk")
AAB = lambda t0, gap=24: [(t0, "Claude Fable 5.2", 65, False, CL, None), (t0 + .3, "GPT-6.2 Astra", 62, False, OA, None), (t0 + .6, "Gemini 4 Neon", 61, True, GM, "#3"),
                          (t0 + .9, "Gemini 4 Carbon", 60, True, GM, "#4"), (t0 + 1.2, "Claude Opus 5.5", 59, False, CL, None), (t0 + 1.5, "GPT-6.2 Sol", 57, False, OA, None)]
scene(t4, t5, col(bars(t4 + .3, AAB(t4 + .3), 100, 0, "", label_w=380, val_w=120, gap=10, h=40),
                  text(W("two of the four"), f"Two of the four smartest models: {B}Google's{E}", 40, tone=""), gap=26),
      "Artificial Analysis Intelligence Index, today", "Independent leaderboard", "Artificial Analysis, Nov 18, 2026 (v5.0.1)")
t6 = W("let's rewind")
agenda = [("How the comeback happened", W("how it happened")), ("Every new model", W("what every one")), ("Against OpenAI and Anthropic", W("how they stack")), ("Is Google actually back?", W("and whether google"))]
scene(t5, t6, col(*[item(t, f'<span class="mono acc" style="font-size:26px;margin-right:26px">0{i + 1}</span>{s}', "hd", "font-size:54px") for i, (s, t) in enumerate(agenda)], gap=30),
      "Today", "Google's comeback")

# ---------------- rewind
t7 = W("then things went quiet")
scene(t6, t7, row(pic(t6, "assets/raw/people/pichai.jpg", 280, 330, "Sundar Pichai", "CEO, Google and Alphabet"),
                  hrow(stat(W("gemini 3 pro launched"), "Nov 18, 2025", "Gemini 3 Pro", "launches", "", GM, vs=72),
                       stat(W("and gemini 3.1"), "Feb 19, 2026", "#1", "Gemini 3.1 Pro tops Artificial Analysis (57)", "hero", GM), gap=28), gap=64, flex=[0, 1]),
      "Google was doing great", "Rewind", "Artificial Analysis · Google · photo: Lukasz Kobus / European Commission, CC BY 4.0")
t8 = W("meanwhile openai")
scene(t7, t8, row(shot(t7, "n_delay", "9to5google.com/2026/07/16/gemini-3-5-pro-delays", (.05, .10, .63, .88), 640, t8),
                  col(stat(W("google promised"), "Promised at I/O in May", "June 2026", "Gemini 3.5 Pro", "", GM, vs=80),
                      stat(W("june came"), "June", "Didn't ship", None, "bad", vs=80),
                      fix(W("eventually google"), "SemiAnalysis reported it shelved in August. Google told Reuters on Sep 30 it no longer plans to release 3.5 Pro."), gap=20),
                  gap=56, flex=[0, 1]),
      "Then things went quiet", "Rewind", "9to5Google · OfficeChai (SemiAnalysis) · Reuters via secondary reports")
t9 = W("and google's own messaging")
scene(t8, t9, hrow(stat(W("openai released gpt-6"), "OpenAI · Sep 9", "GPT-6 Astra", None, "", OA, vs=64),
                   stat(W("anthropic released fable"), "Anthropic · Sep 1", "Fable 5.1", None, "", CL, vs=64),
                   stat(W("then opus"), "Anthropic · Sep 22", "Opus 5.5", None, "", CL, vs=64), gap=28),
      "Meanwhile, the rivals kept shipping", "Rewind", "TechCrunch · Artificial Analysis")
t10 = W("then on september")
scene(t9, t10, row(shot(t9, "n_tc", "techcrunch.com · Jul 21, 2026", (.0, .04, 1.0, .62), 680, t10),
                   col(item(t9 + .6, '<span style="text-decoration:line-through;text-decoration-thickness:5px;color:var(--ink3)">“we’re the smartest”</span>', "hd", "font-size:60px"),
                       item(W("to we're the cheapest"), "“we’re the cheapest”", "hd", "font-size:60px;color:var(--bad)"),
                       text(W("that's usually"), "Not what a leader sounds like.", 40, tone="ink3"), gap=18), gap=64, flex=[0, 1]),
      "The message changed", "Rewind", "TechCrunch, Jul 21, 2026: 3.6 Flash, 3.5 Flash-Lite, 3.5 Flash Cyber, no 3.5 Pro")

# ---------------- model 1: Argon
t11 = W("and google picked")
scene(t10, t11, clip80(t10, t11, "x/x_argon_pichai.mp4", 4.6, crop=(1876, 1044, 22, 18), credit="@sundarpichai on X · Gemini 4 Argon demos, Oct 13, 2026",
                       caps=[(t10 + .3, "Sep 30, 2026", ""), (W("model 1"), "Model 1 · Gemini 4 Argon", "acc"), (W("argon was google's"), "first frontier model in 7+ months", "")]))
t12 = W("on google's own numbers")
scene(t11, t12, col(hrow(tile(W("argon carbon"), "Ar", w=300), tile(W("argon carbon") + .5, "C", w=300), tile(W("hydrogen neon"), "H", w=300),
                         tile(W("hydrogen neon") + .5, "Ne", w=300), gap=28, justify="center"),
                    item(W("goodbye"), '<span style="text-decoration:line-through;text-decoration-thickness:4px">Pro</span> &nbsp; <span style="text-decoration:line-through;text-decoration-thickness:4px">Flash</span>', "hd", "font-size:56px;text-align:center;color:var(--ink3)"), gap=40),
      "A new naming system: chemical elements", "Model 1 · Argon", "Google hasn't officially explained the names")
t13 = W("but the independent picture")
scene(t12, t13, row(chart(t12, "assets/raw/web/c_argon_deepswe.gif", 760, None, t13, "Google: DeepSWE v1.1, long-horizon software engineering"),
                    col(stat(W("including the top"), "DeepSWE v1.1", "77.9%", "state of the art at launch", "hero", GM, 77.9, 1, "", "%"),
                        fix(t12 + 1.5, "Recounts of Google's 19-row table: Argon is best on 13 of 19 against the top rival, 14 of 19 head-to-head with GPT-6 Astra or Opus 5.5."), gap=22),
                    gap=56, flex=[0, 1]),
      "On Google's own numbers", "Model 1 · Argon", "blog.google (Gemini 4 Argon) · Apidog recount of Google's table")
t14 = W("and at first")
scene(t13, t14, hrow(stat(W("artificial analysis gave"), "Gemini 4 Argon", "53", "AA Intelligence Index", "hero", GM, 53),
                     stat(W("tied with"), "GPT-6 Astra (max)", "53", "a tie", "", OA, 53),
                     stat(W("and behind"), "Anthropic's best", "Fable 5.1", "still led the index", "", CL, vs=72), gap=28),
      "The independent picture: more modest", "Model 1 · Argon", "Artificial Analysis, Sep 30, 2026")
t15 = W("still analysts")
scene(t14, t15, row(tw(t14, "argon_gov", 520, .40),
                    col(text(t14 + .5, "At first, almost nobody could use it.", 44, tone=""),
                        quote(t14 + 1.0, "it's with the US gov't and going to a set of trusted cyber defenders through our Fairwind Program", "Sundar Pichai", "on X, Sep 30", None), gap=26),
                    gap=60, flex=[0, 1]), None, None, "@sundarpichai on X, Sep 30, 2026")
t16 = W("model 2")
scene(t15, t16, row(shot(t15, "aa_argon", "artificialanalysis.ai/articles/gemini-4-argon", (.20, .07, .72, .60), 760, t16),
                    col(quote(W("google was back"), "Google returns as one of the top three labs on intelligence", "Artificial Analysis", "Sep 30, 2026"),
                        text(W("not leading"), f"Not leading. But {B}in the race again{E}.", 44, tone=""), gap=26), gap=56, flex=[0, 1]),
      None, None, "artificialanalysis.ai")

# ---------------- model 2: Carbon
t17 = W("and this is the moment")
t16b = W("carbon is google's heavyweight")
scene(t16, t16b, clip80(t16, t16b, "x/g_atlantis.mp4", 0.0, "Google · Gemini 4 Carbon demo: an underwater city built in Blender and Three.js",
                        caps=[(t16 + .3, "Model 2 · Gemini 4 Carbon", "acc"), (W("announced october"), "announced Oct 28 · public Nov 10", "")]))
scene(t16b, t17, clip80(t16b, t17, "x/g_atlantis.mp4", 47.0, crop=(1742, 980, 89, 0), credit="Google · Gemini 4 Carbon demo: an underwater city built in Blender and Three.js",
                        caps=[(t16b + .3, "Google's heavyweight", "acc"), (W("cybersecurity and long"), "cybersecurity + tasks that run for hours or days", "")]))
t18 = W("but the point was made")
scene(t17, t18, row(tw(t17, "carbon_pichai", 560, .40),
                    col(hrow(stat(W("at launch carbon"), "AA Intelligence Index v5.0", "#1", "59 at launch, Oct 28", "hero", GM),
                             stat(W("it held that"), "Held the top spot", "12 days", "until Claude Fable 5.2, Nov 9", "", CL), gap=22),
                        fix(t17 + 2.0, "Google's blog says Carbon shares Argon's safety and security stack; it doesn't say the model is built on Argon."), gap=22),
                    gap=56, flex=[0, 1]),
      "The comeback becomes real", "Model 2 · Carbon", "@sundarpichai on X, Oct 28, 2026 · Artificial Analysis")
t19 = W("model 3")
scene(t18, t19, clip80(t18, t19, "x/g_eiffel.mp4", 26.0, crop=(1800, 1012, 60, 0), credit="Google · Gemini 4 Carbon demo",
                       caps=[(t18 + .3, "Google can build a #1 model again", "acc"), (W("if you want the full"), "Full Carbon review: earlier on AI Equator", "")]))

# ---------------- model 3: Hydrogen
t20 = W("it's in the gemini app")
scene(t19, t20, row(shot(W("two days after"), "b_hyd", "blog.google · Introducing Gemini 4 Hydrogen", (.26, .38, .76, .90), 700, t20),
                    col(tile(t19 + .2, "H", "Nov 12 · model 3", "on", w=360),
                        stat(W("it's now the model"), "Powers Google Search", "Every user", "worldwide", "hero", GL, vs=80), gap=22),
                    gap=56, flex=[0, 1]),
      "The most important launch: where it went", "Model 3 · Hydrogen", "blog.google, Nov 12, 2026")
t21 = W("it's fast and cheap")
scene(t20, t21, row(tw(t20, "hyd_logan", 620),
                    col(text(t20 + .3, "In the Gemini app, too.", 44, tone=""),
                        text(W("more people will use"), f"More people will use Hydrogen this month than most AI models {B}will ever touch{E}.", 40, tone=""),
                        fix(t20 + 1.2, "Free users get it via auto model selection. 3.8 Flash stays in the API."), gap=24),
                    gap=60, flex=[0, 1]),
      None, None, "@OfficialLoganK on X, Nov 12, 2026 · blog.google")
t22 = W("google also built")
scene(t21, t22, col(hrow(stat(t21 + .2, "Price per million tokens", "$1.50 / $7.50", "input / output", "", GM, vs=84),
                         stat(t21 + .8, "Speed vs 3.8 Flash", "2.5×", "faster", "", None, vs=84), gap=28),
                    bars(W("and on terminal bench"), [(W("it's scored 57"), "Gemini 4 Hydrogen", 57.0, True, GM, None), (W("the old 3.8"), "Gemini 3.8 Flash", 18.2, False, GM, None)], 100, 1, "%", label_w=380, val_w=170),
                    text(W("that's more than three"), f"More than {B}3× better{E} on Terminal-Bench 4.1 in one generation.", 38, tone=""), gap=30),
      "Fast and cheap", "Model 3 · Hydrogen", "blog.google (Hydrogen benchmarks)")
t23 = W("model 4")
flowc = item(W("carbon does the thinking"), f'<div style="display:flex;align-items:center;gap:28px">'
             f'<div class="stat" style="flex:1"><div class="slab">Gemini 4 Carbon</div><div class="hd" style="font-size:44px;margin-top:8px">thinks and plans</div></div>'
             f'<div class="hd ink3" style="font-size:56px">→</div>'
             f'<div class="stat hero" style="flex:1"><div class="slab">Gemini 4 Hydrogen</div><div class="hd" style="font-size:44px;margin-top:8px">writes code, updates packages, runs tests</div></div></div>', "")
scene(t22, t23, col(flowc,
                    hrow(stat(W("google says that"), "Task success", "≈ Carbon", None, "", vs=72), stat(W("24"), "Quota used", "−24%", None, "hero", vs=72), stat(W("and finishing"), "Time", "19% faster", None, "hero", vs=72), gap=22),
                    fix(W("google says that") + 1.0, "Google measured these on Terminal-Bench 4.0."), gap=24),
      "Orchestrator, inside Antigravity", "Model 3 · Hydrogen", "blog.google (Hydrogen)")

# ---------------- model 4: Neon
t24 = W("the pitch is simple")
scene(t23, t24, row(chart(W("neon is adapted"), "assets/raw/web/c_neon_family.webp", 820, None, t24, "Google: the Gemini 4 lineup"),
                    col(tile(t23 + .2, "Ne", "Nov 18 · model 4", "on", w=360), text(W("neon is adapted"), "Adapted from Gemini 4 Carbon (model card). Sits between Hydrogen and Carbon.", 34, tone=""), gap=22),
                    gap=56, flex=[0, 1]),
      "The newest one: Gemini 4 Neon", "Model 4 · Neon", "blog.google · Gemini 4 Neon model card")
t25 = W("on the artificial analysis intelligence index neon")
scene(t24, t25, row(shot(t24, "n_neon", "9to5google.com · Nov 18, 2026", (.05, .10, .63, .88), 680, t25),
                    col(quote(t24 + .8, "Carbon quality at Flash speeds", "9to5Google", "headline, Nov 18"),
                        fix(t24 + 2.4, "“Carbon-level intelligence at much faster speeds” is a paraphrase, not Google's wording."), gap=22), gap=56, flex=[0, 1]),
      "The pitch", "Model 4 · Neon", "9to5google.com")
t26 = W("on the vals index")
scene(t25, t26, row(tw(t25, "neon_aa", 470, .52),
                    col(bars(t25 + .4, [(W("only two models"), "Claude Fable 5.2", 65, False, CL, None), (W("and gpt 6.2 astra at"), "GPT-6.2 Astra", 62, False, OA, None),
                                        (W("neon scores 61"), "Gemini 4 Neon", 61, True, GM, "#3"), (W("above carbon"), "Gemini 4 Carbon", 60, False, GM, None),
                                        (W("above claude opus"), "Claude Opus 5.5", 59, False, CL, None), (W("and above gpt"), "GPT-6.2 Sol", 57, False, OA, None)], 100, 0, "", label_w=360, val_w=110, gap=8, h=40),
                        text(W("so neon which"), f"Google's mid-sized model: {B}#3 in the world{E}.", 38, tone=""), gap=20), gap=56, flex=[0, 1]),
      "Artificial Analysis Intelligence Index", "Model 4 · Neon", "@ArtificialAnlys on X, Nov 18, 2026")
t27 = W("some wins are big")
scene(t26, t27, row(chart(t26, "assets/raw/web/p_neon_vals.jpg", 600, (0, 0, 1, .97), t27),
                    hrow(stat(W("neon scores 70"), "Gemini 4 Neon", "70.9%", "#2 on the Vals Index", "hero", GM, 70.9, 1, "", "%"),
                         stat(W("and just behind"), "Claude Fable 5.2", "71.3%", "#1", "", CL, 71.31, 1, "", "%"), gap=22), gap=56, flex=[0, 1]),
      "Vals Index: 0.4 points from first", "Model 4 · Neon", "@ValsAI on X, Nov 18, 2026")


def mini(t0, title, rows, t_title):
    return '<div style="flex:1;min-width:0">' + col(item(t_title, title, "hd", "font-size:34px"),
               bars(t0, rows, 100, 1, "%", label_w=100, val_w=180, gap=4, h=36), gap=12) + "</div>"


t28 = W("it doesn't win everything")
scene(t27, t28, hrow(mini(W("neon gets 56"), "AutomationBench", [(W("neon gets 56"), "Neon", 56.3, True, None, None), (W("against 42"), "Opus", 42.5, False, None, None)], W("on automation bench")),
                     mini(W("it gets 75"), "Agents' Last Exam", [(W("it gets 75"), "Neon", 75.8, True, None, None), (W("against 71"), "Opus", 71.6, False, None, None), (W("and 73 for sol"), "Sol", 73.0, False, None, None)], W("on agents last exam")),
                     mini(W("it scores 95"), "GraphWalks (long context)", [(W("it scores 95"), "Neon", 95.2, True, None, None), (W("against 66"), "Opus", 66.8, False, None, None)], W("and on a long")), gap=40),
      "Some wins are big", "Model 4 · Neon vs Claude Opus 5.5 and GPT-6.2 Sol", "Gemini 4 Neon model card (Google's own comparisons)")
t29 = W("on arena")
scene(t28, t29, row(chart(t28, "assets/raw/web/c_neon_table.webp", 600, (0, 0, 1, 1), t29),
                    col(stat(W("it trails opus"), "Terminal-Bench 4.1", "65.2 vs 65.8", "Neon vs Opus 5.5", "", vs=58),
                        stat(W("frontier code"), "FrontierCode 2.0", "46.2 vs 47.3", "Neon vs Opus 5.5", "", vs=58),
                        stat(W("and sol beats"), "Chartography (chart reading)", "73.5 vs 75.1", "Neon vs GPT-6.2 Sol", "bad", vs=58), gap=12),
                    gap=56, flex=[0, 1]),
      "Where it trails", "Model 4 · Neon", "Gemini 4 Neon model card · these are Google's own comparisons")
t30 = W("google's logan")
scene(t29, t30, row(chart(t29, "assets/raw/web/p_neon_arena.png", 600, (0, 0, 1, .82), t30),
                    hrow(stat(W("neon is third"), "Text Arena", "#3", "real people vote", "", GM), stat(W("and second on"), "Agent Arena", "#2", "behind only Claude Fable 5.2", "hero", GM), gap=22),
                    gap=56, flex=[0, 1]),
      "Arena: where real people vote", "Model 4 · Neon", "@arena on X, Nov 18, 2026 · Text Arena rank via TestingCatalog")
t31 = W("in the gemini app neon")
scene(t30, t31, row(tw(t30, "neon_logan", 600, .30),
                    col(quote(W("neon feels"), "punching above its model class in a meaningful way. To me, Neon feels like the right balance of intelligence, speed, and usability.", "Logan Kilpatrick", "Google, on X, Nov 18"),
                        fix(W("neon feels") + 2.0, "His exact words say “balance”, not “mix”."), gap=22), gap=56, flex=[0, 1]),
      None, None, "@OfficialLoganK on X, Nov 18, 2026")
t32 = W("now the price")
scene(t31, t32, hrow(stat(t31 + .2, "Gemini app · Pro and Ultra", "Neon", "replaces Argon", "hero", GM, vs=84), stat(W("and the old gemini"), "Gemini 3.1 Pro", "Gone", "finally retired", "bad", GM, vs=84), gap=28),
      "In the Gemini app", "Model 4 · Neon", "9to5Google, Nov 18, 2026")
t33 = W("google also says that")
scene(t32, t33, col(hrow(stat(W("neon costs"), "Gemini 4 Neon", "$3 / $15", "per million tokens", "hero", GM, vs=84),
                         stat(W("right now that's"), "Carbon today (discount)", "$2 / $10", "Neon costs 50% more per token today", "", GM, vs=84),
                         stat(W("but on december"), "Carbon from Dec 1", "$4 / $20", "Neon becomes the cheaper one", "bad", GM, vs=84), gap=24),
                    fix(W("but on december") + 1.2, "Carbon moves to $4 input / $20 output per million tokens, not “4.20”."), gap=26),
      "The price, and the catch", "Model 4 · Neon", "blog.google · Gemini 4 lineup table")
t34 = W("okay so let's put")
scene(t33, t34, col(big(W("neon matches"), "−32%", 180, "acc", "center"), text(W("neon matches") + .5, "cost per task vs Carbon, same score, at Neon's default setting (fewer tokens)", 40, "center", tone=""), gap=16),
      "Same score, cheaper per task", "Model 4 · Neon", "blog.google (Gemini 4 Neon)")

# ---------------- put it together
t35 = W("but let's be fair")
scene(t34, t35, col(item(W("fifty days ago"), f'<span class="mono acc" style="font-size:26px">50 DAYS AGO</span><br>No Google frontier model on the market', "hd", "font-size:44px"),
                    hrow(tile(W("carbon for the hardest"), "C", "hardest long jobs", w=420), tile(W("neon for fast"), "Ne", "fast, high-level reasoning", "on", w=420),
                         tile(W("hydrogen for speed"), "H", "speed and scale, in Search", w=420), gap=36, justify="flex-start"),
                    text(W("and on artificial analysis neon"), f"Artificial Analysis: Neon {B}#3{E}, Carbon {B}#4{E}.", 40, tone=""), gap=30),
      "Today: a full lineup", "Put together", "Artificial Analysis (“fourth model in just seven weeks”)")
t36 = W("and google's own safety")
scene(t35, t36, row(col(bars(W("google is not number"), AAB(W("google is not number"))[:3], 100, 0, "", label_w=360, val_w=110, gap=8, h=40),
                        text(W("fable 5.2 still leads"), "Fable 5.2 leads Neon by 4 points. GPT-6.2 Astra is ahead too.", 34, tone=""), gap=20),
                    stat(W("carbon's number 1"), "Carbon at #1", "< 2 weeks", "Oct 28 → Nov 9", "bad", GM, vs=84), gap=56, flex=[1, 0]),
      "Google is not #1 right now", "The other side", "Artificial Analysis")
t37 = W("the other thing")
scene(t36, t37, row(shot(t36, "card_p9", "Gemini 4 Neon model card · page 8", (.06, .43, .80, .72), 760, t37),
                    col(text(t36 + .4, "Carried forward from Argon to Neon:", 36, tone=""),
                        quote(t36 + 1.2, "CCL cannot be ruled out", "Biological uplift and cybersecurity uplift", "Frontier Safety Assessment table"),
                        fix(t36 + 2.6, "The model card says “cannot be ruled out”, not “unresolved”. Neon's full safety report is “coming soon”."), gap=20),
                    gap=56, flex=[0, 1]),
      "Google's own safety report", "The other side", "Gemini 4 Neon model card, Google DeepMind")
t38 = W("so is google back")
scene(t37, t38, col(timeline([(t37 + .3, "Nov 9", "Claude Fable 5.2", ""), (t37 + .8, "Nov 10", "Carbon for everyone", "on"), (t37 + 1.3, "Nov 12", "Hydrogen", "on"),
                              (W("openai shipped"), "Nov 17", "GPT-6.2 Astra + Sol", ""), (W("openai shipped") + .8, "Nov 18", "Neon", "on")]),
                    text(W("so any lead"), f"Any lead in this race lasts {B}weeks, not months{E}.", 46, tone=""), gap=40),
      "The speed of competition", "The other side", "9to5Mac · MarkTechPost · blog.google")

# ---------------- verdict
t39 = W("and google has something")
scene(t38, t39, col(big(W("yes"), "Yes.", 200, "acc", "center"), text(W("not as the clear"), "Not as the clear leader. As a real threat at the very top again.", 44, "center", tone=""), gap=20),
      "Is Google back?", "My answer")
t40 = W("seven months ago people were writing")
scene(t39, t40, col(hrow(*[stat(W(n.lower()) if n != "Search" else W("search android"), "Google", n, None, "hero" if n == "Search" else "", GL, vs=72) for n in ["Search", "Android", "Chrome", "Workspace"]], gap=22),
                    text(W("when google ships"), f"A good model can reach {B}billions of people the same day{E}, like Hydrogen in Search.", 40, tone=""), gap=36),
      "What OpenAI and Anthropic don't have", "My answer", None)
t41 = W("do you think")
scene(t40, t41, clip80(t40, t41, "x/x_argon_promo.mp4", 24.0, "Google DeepMind on X · building with Gemini 4 Argon, Oct 13, 2026",
                       caps=[(t40 + .3, "7 months ago: written off", ""), (W("now it's shipping"), "now: shipping faster than anyone", "acc"),
                             (W("the race isn't"), "not a two-horse race anymore", "")]))
t42 = W("this has been")
scene(t41, t42, col(item(t41 + .1, f'<div style="display:flex;justify-content:center;align-items:center;gap:72px"><img src="{GM}" alt="" style="height:130px"><div class="hd ink3" style="font-size:44px">vs</div><img src="{CL}" alt="" style="height:130px"><img src="{OA}" alt="" style="height:130px"></div>', ""),
                    item(t41 + .3, "Can Google take #1 back before the end of the year?", "hd", "font-size:60px;text-align:center"),
                    text(t41 + .8, "Tell me in the comments.", 36, "center", "ink3"), gap=40))
scene(t42, 546.40, col(item(t42, '<img src="assets/img/aiequator_k.png" alt="" style="width:300px;height:300px;display:block;margin:0 auto">', ""),
                       text(t42, "Subscribe for more AI news", 32, "center", "ink3"), gap=30), push=False, last=True)
