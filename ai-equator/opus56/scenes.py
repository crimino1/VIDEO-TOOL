"""Claude Opus 5.6: leaks, news and launch-date signals. Every leak is labelled official, reported or rumour on screen.
"""
import json, re
from lib import *
from lib import _wh

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
    bad = [(p, t) for p, t in _CALLS if not a - .05 <= t <= b]
    _CALLS.clear()
    if bad:
        raise ValueError(f"scene {a:.2f}-{b:.2f}: cues outside it: {bad}")
    _scene(a, b, *args, **kw)


P = {p["id"]: p["start"] for p in json.load(open(H / "paragraphs.json", encoding="utf-8"))}
VO = json.load(open(H / "paragraphs.json", encoding="utf-8"))[-1]["end"]
END = round(VO + 1.6, 2)
ANTH = "assets/img/anthropic.png"
SRC = "anthropic.com"


def clip(a, b, raw, ss, credit, caps=(), crop=None):
    """A real clip at 80%; every clip is credited under it."""
    return clip80(a, b, raw, ss, credit, caps, crop)


def hshot(t, name, url, crop, w, boxes=(), b=None):
    """A captured page in a browser frame with highlight boxes that draw in on their cue.
    boxes: (t, x0, y0, x1, y1) as fractions of the cropped image."""
    s = page_img(name, crop)
    w, h = _wh(s, w)
    kb = nid("k")
    if b:
        media_push(kb, t, b, 1.03)
    hl = ""
    for bt, x0, y0, x1, y1 in boxes:
        bid = nid("hl")
        tl.append(f'tl.fromTo("#{bid}",{{opacity:0,scale:1.04}},{{opacity:1,scale:1,duration:.35,ease:"power2.out"}},{T(bt):.3f});')
        hl += (f'<div id="{bid}" style="position:absolute;left:{x0 * w:.0f}px;top:{y0 * h:.0f}px;width:{(x1 - x0) * w:.0f}px;height:{(y1 - y0) * h:.0f}px;'
               f'border:4px solid #1D4ED8;border-radius:8px;background:rgba(29,78,216,.08);opacity:0"></div>')
    return item(t, f'<div class="wbar"><i></i><i></i><i></i><span>{url}</span></div><div class="wbody" style="height:{h}px;position:relative">'
                   f'<img id="{kb}" src="{s}" alt="" style="width:{w}px;height:{h}px">{hl}</div>', "win", f"width:{w}px")


def plist(rows, size=40, gap=18):
    return col(*[item(t, s, f"hd {tone}", f"font-size:{size}px") for t, s, tone in rows], gap=gap)


CL = "assets/img/claude.png"
DOCS = "platform.claude.com/docs/en/about-claude/models/overview"


def vbox(a, b, raw, ss, w, h, credit, side):
    """A square/vertical clip on the left with a text column on the right half."""
    return row(clipbox(a, b, raw, ss, 160, int(540 - h / 2), w, h, (), None, credit), side, gap=0, flex=[1, 1])


# ================= hook
t = W("people say")
scene(0, t, col(row(item(0, f'<img src="{CL}" alt="" style="width:130px;height:130px;display:block">', "lg"),
                    col(big(0, "Claude Opus 5.6?", 150), text(0, "Leaks, betting odds and the likely launch date", 34), gap=10), gap=40, flex=[0, 1]), gap=0),
      None, "Leaks · November 25, 2026")
t2 = W("theres a leaked")
scene(t, t2, clip(t, t2, "x/x_stealth_cc.mp4", 2, "@intheworldofai on X, Nov 24 (claimed Opus 5.6 output)",
                  caps=[(t + .2, "Claim: secretly tested inside Claude Code", "")]))
t = W("but anthropic")
scene(t2, t, row(tw(t2 + .1, "pirat", 560, .52),
                 col(stat(W("20"), "Leaked spec sheet", "−20%", "price (unverified)", "", None, vs=96),
                     stat(W("82"), "Kalshi · before Dec 16", "82%", "chance of release", "hero", None, 82, suf="%", vs=96), gap=18), gap=48, flex=[0, 1]),
      "The hype", "Opus 5.6", "@Pirat_Nation on X · Kalshi")
t2 = P["p02"]
scene(t, t2, col(verdict(t + .1, "ANTHROPIC: NO ANNOUNCEMENT", "warn", 40),
                 hrow(pill(W("every leak"), "Every leak"), pill(W("whats real"), "What's real", "acc"), pill(W("whats not"), "What's not", "bad"), pill(W("likely to launch"), "Launch date"), gap=18), gap=36),
      None, None)

# ================= cadence
t = W("the average gap")
scene(t2, t, timeline([(W("opus 45"), "Nov 24 '25", "Opus 4.5", ""), (W("46 in february"), "Feb 5", "Opus 4.6", ""), (W("47 in april"), "Apr 16", "Opus 4.7", ""),
                       (W("48 in may"), "May 28", "Opus 4.8", ""), (W("opus 5 in july"), "Jul 24", "Opus 5", ""), (W("on september"), "Sep 22", "Opus 5.5", ""),
                       (W("opus 5 in july") + .8, "?", "Opus 5.6", "on")]),
      "A new Opus about every two months", "The pattern", "Anthropic release notes")
t2 = P["p03"]
scene(t, t2, col(hrow(stat(t + .1, "Average gap between Opus releases", "~60", "days", "", vs=130),
                      stat(W("64 days"), "Since Opus 5.5 (Sep 22)", "64", "days, as of today", "hero", None, 64, vs=130), gap=24),
                 verdict(W("overdue"), "OVERDUE ON THE CALENDAR", "warn", 34), gap=30),
      "The calendar says…", "The pattern", "Anthropic release notes")

# ================= October
t = W("another built")
scene(t2, t, clip(t2, t, "x/x_oct_js.mp4", 0, "@chetaslua on X, Oct 11",
                  caps=[(W("a different"), "Oct: some Opus 5.5 requests went to an unannounced checkpoint?", ""), (W("27 million"), "A JavaScript animation: ~27M tokens", "acc")]))
t2 = W("testing catalog")
scene(t, t2, clip(t, t2, "x/x_oct_blender.mp4", 0, "@marmaduke091 on X, Oct 11", caps=[(t + .1, "A 3D scene built in Blender over two hours", "")]))
t = P["p04"]
scene(t2, t, row(hshot(t2 + .1, "testingcatalog", "testingcatalog.com", (.3, .015, .72, .12), 620),
                 col(text(t2 + .3, "TestingCatalog reported it, and added:", 32, tone="ink3"),
                     item(W("fresher training data"), "Maybe just <b class='acc'>fresher training data</b>, not a smarter model.", "hd", "font-size:46px"), gap=16), gap=48, flex=[0, 1]),
      None, None, "TestingCatalog, Oct 12, 2026")
t2 = P["p05"]
scene(t, t2, row(tw(t + .1, "kol", 600, .5), col(item(W("fable 55"), "“Fable 5.5, is that you?”", "hd", "font-size:52px"),
                                                 text(W("the next release"), "The next model could be a Fable, not an Opus.", 34, tone="ink3"), gap=18), gap=48, flex=[0, 1]),
      None, None, "@koltregaskes on X, Oct 11")

# ================= the hint
t = P["p06"]
scene(t2, t, col(quote(W("the best is yet"), "The best is yet to come. Stay tuned.", "Anthropic partnerships team member", "on X, Oct 11 (post since removed)"),
                 verdict(W("closest thing"), "THE ONLY HINT FROM ANTHROPIC", "warn", 30), gap=30),
      "A hint?", "October")

# ================= the spec sheet
t2 = W("heres the problem")
scene(t, t2, col(check_row(W("90"), "SWE-bench", "90%", "warn"), check_row(W("81 on"), "RiemannBench", "81%", "warn"),
                 check_row(W("a score of 61"), "Artificial Analysis Index", "61", "warn"), check_row(W("lower prices"), "Price", "−20%", "warn"),
                 check_row(W("higher usage"), "Usage limits", "HIGHER", "warn"), gap=10),
      "The Nov 2 “spec sheet”", "Leak · unverified", "@Pirat_Nation, @hiarun02 on X (reshares)")
t = P["p07"]
scene(t2, t, row(tw(t2 + .1, "arun", 620, .62),
                 col(verdict(W("nobody can find"), "NO ORIGINAL POST", "bad", 36), text(W("none of it"), "Even accounts sharing it: “None of this is confirmed”.", 34, tone=""),
                     item(W("treat this one"), "Treat it as a <b class='acc'>rumour</b>.", "hd", "font-size:50px"), gap=20), gap=48, flex=[0, 1]),
      None, None, "@hiarun02 on X, Nov 1")

# ================= stealth routing
t2 = P["p08"]
scene(t, t2, row(tw(t + .1, "pankaj", 600, .62),
                 col(text(t + .4, "Nov 24 claim, about 266K views:", 30, tone="ink3"),
                     item(W("routed in"), "Routed in Claude Code and on the web", "hd", "font-size:42px"),
                     text(W("he predicted"), "Prediction: late Nov or the first week of Dec.", 34, tone=""),
                     verdict(W("again no proof"), "NO PROOF", "bad", 30), gap=16), gap=48, flex=[0, 1]),
      None, None, "@pankajkumar_dev on X, Nov 24")

# ================= demos
t = W("an animated svg")
scene(t2, t, clip(t2, t, "x/x_anime.mp4", 55, "@chetaslua on X, Nov 24 (claimed Opus 5.6)", caps=[(t2 + .2, "“Anime in pure code” (claimed 5.6)", "")]))
t2 = W("and the same panda")
scene(t, t2, vbox(t, t2, "x/x_svg_film.mp4", 4, 720, 720, "@marcthecreatorr on X, Nov 24",
                  col(item(t + .2, "SVG short film", "hd", "font-size:56px"), text(t + .5, "Top: “Opus 5.6 (routing)” · bottom: Opus 5.5", 32, tone=""), gap=16)))
t = W("one account even")
scene(t2, t, row(tw(t2 + .1, "legit", 640, .62), col(text(t2 + .3, "Same panda prompt:", 32, tone="ink3"), item(t2 + .6, "“Opus-next” vs Fable 5.2", "hd", "font-size:46px"),
                                                     text(t2 + 1, "“Opus-next” is a testers' label, not an official name.", 28, tone="ink3"), gap=14), gap=48, flex=[0, 1]),
      None, None, "@legit_api on X, Nov 24")
t2 = P["p09"]
scene(t, t2, row(tw(t + .1, "codebynz", 600, .45), col(stat(W("2 in"), "Claimed price", "$2 / $10", "per 1M tokens", "", None, vs=90),
                                                       verdict(W("doesnt match"), "CONTRADICTS THE OTHER LEAK", "bad", 28), gap=18), gap=48, flex=[0, 1]),
      None, None, "@CodeByNZ on X, Nov 24")

# ================= the docs
t = W("and on november 23rd")
scene(t2, t, row(hshot(t2 + .1, "docs_models", DOCS, (.25, .015, .83, .14), 980, [(W("the models page"), .0, .55, 1.0, .92)]),
                 col(verdict(W("no opus 56"), "NO OPUS 5.6", "bad", 34), text(W("no model id"), "No model ID on Bedrock or Google Cloud either.", 30, tone=""), gap=18), gap=40, flex=[0, 1]),
      "Anthropic's docs, today", "Official", DOCS)
t2 = P["p10"]
scene(t, t2, row(hshot(t + .1, "docs_deprec", "docs: model deprecations", (.76, .01, .96, .09), 340, [(t + .5, .0, .525, 1.0, .585)]),
                 col(text(t + .3, "Nov 23: Opus 4.5 retired. The recommended replacement:", 34, tone=""), item(W("as the replacement"), "Opus <b class='acc'>5.5</b>. Not 5.6.", "hd", "font-size:64px"), gap=18),
                 gap=56, flex=[0, 1]),
      "The newest clue points backwards", "Official", "Anthropic model deprecations page")

# ================= markets
t = W("manifold is")
scene(t2, t, row(hshot(t2 + .1, "kalshi_pub", "public.com · Kalshi market", (.18, .02, .75, .10), 640),
                 col(bars(W("december 1st"), [(W("december 1st"), "Before Dec 1", 7, False, None, None), (W("before december 16th"), "Before Dec 16", 82, True, None, None),
                                             (W("before january"), "Before Jan 1", 84, False, None, None)], 100, 0, "%", label_w=230, val_w=130, h=48, gap=14, note="Kalshi “Yes” price, Nov 25"), gap=0),
                 gap=40, flex=[0, 1]),
      "What the betting markets say", "Prediction markets", "Kalshi via public.com")
t2 = P["p11"]
scene(t, t2, row(hshot(t + .1, "manifold", "manifold.markets", (.25, .02, .62, .34), 560, [(W("15"), .0, .21, 1.0, .29), (W("15") + .5, .0, .30, 1.0, .38), (W("15") + 1, .0, .39, 1.0, .47)]),
                 col(text(t + .3, "Manifold (play money) is more careful:", 32, tone="ink3"), item(W("15"), "15% · 64% · 81%", "hd", "font-size:60px"),
                     verdict(W("these same markets"), "“BEFORE NOV 16” RESOLVED NO", "bad", 28), gap=18), gap=48, flex=[0, 1]),
      None, None, "manifold.markets")
t = P["p12"]
scene(t2, t, col(bars(t2 + .2, [(W("45"), "By Nov 30", 4.5, False, None, None), (W("815"), "By Dec 15", 81.5, True, None, None), (W("92"), "By Dec 31", 92, False, None, None)],
                      100, 1, "%", label_w=230, val_w=200, h=52, gap=16, note="Polymarket, about $58K traded"),
                 item(W("every market agrees"), "Not this week. Very likely the <b class='acc'>first half of December</b>.", "hd", "font-size:44px"), gap=26),
      "Polymarket, the biggest market", "Prediction markets", "polymarket.com")

# ================= rivals
t2 = P["p13"]
scene(t, t2, col(timeline([(t + .3, "Nov 9", "Claude Fable 5.2", ""), (W("astra on"), "Nov 17", "GPT-6.2 Astra", "bad"), (W("gemini 4 neon"), "Nov 18", "Gemini 4 Neon · $3 in", "bad")]),
                 hrow(stat(W("slipped from"), "Opus 5.5 on Artificial Analysis", "#1 → #10", "launch → today", "hero", CL, vs=90), gap=0), gap=30),
      "Why Anthropic might hurry", "Competition", "OpenAI · Google · artificialanalysis.ai")

# ================= baseline
t = W("even the leaked")
scene(t2, t, clip(t2, t, "x/x_opus55_launch.mp4", 0, "@claudeai on X, Sep 22, 2026 (Opus 5.5 launch)",
                  caps=[(W("costs 4"), "Opus 5.5: $4 / $20 per 1M tokens · 1M context", ""), (W("664"), "Terminal-Bench 4: 66.4% · OSWorld: 81.8% · AA index: 59", "acc")]))
t2 = P["p14"]
scene(t, t2, bars(t + .1, [(W("fable 52 at 65"), "Claude Fable 5.2", 65, False, CL, None), (W("astra at 62"), "GPT-6.2 Astra", 62, False, None, None),
                           (t + .2, "Opus 5.6 (leaked claim)", 61, True, CL, "unverified"), (t + .5, "Claude Opus 5.5", 59, False, CL, None)], 70, 0,
                  label_w=470, val_w=200, h=52, gap=16, note="Artificial Analysis Intelligence Index"),
      "Even the leak wouldn't be #1", "Baseline", "artificialanalysis.ai")
t = P["p15"]
scene(t2, t, hrow(stat(t2 + .2, "Opus 5.5 today", "$4 / $20", "per 1M tokens", "", CL, vs=76), stat(W("320"), "If −20% were real", "$3.20 / $16", "per 1M tokens", "hero", None, vs=76),
                  stat(W("gemini 4 neon"), "Gemini 4 Neon", "$3 / $15", "per 1M tokens", "", None, vs=76), gap=18),
      "The price cut, if it's real", "Rumour math", "anthropic.com · Google")

# ================= against
t2 = P["p16"]
scene(t, t2, col(check_row(W("recent events"), "The “ask about recent events” test", "PROVES NOTHING", "bad", "Opus 5.5's training data already reaches June 2026"),
                 check_row(W("viral demo"), "Viral demo in the last Opus leak", "WAS FAKE", "bad"),
                 check_row(W("skip the name"), "It might not even be called 5.6", "5.7? 6?", "warn"), gap=14),
      "Reasons to doubt the hype", "Reality check")
t = P["p17"]
scene(t2, t, row(tw(t2 + .1, "berman", 680), col(item(W("went even further"), "Matthew Berman:", "hd ink3", "font-size:36px"),
                                                 item(W("is lying"), "“not real demos”", "hd", "font-size:64px"), gap=14), gap=48, flex=[0, 1]),
      None, None, "@MatthewBerman on X")

# ================= what to watch for
t2 = P["p18"]
scene(t, t2, col(check_row(W("model id"), "New model ID in Anthropic's docs", "NOT YET", "warn"),
                 check_row(W("bedrock"), "Bedrock and Google Cloud model IDs", "NOT YET", "warn"),
                 check_row(W("model picker"), "Claude app model picker", "NOT YET", "warn"),
                 check_row(W("official post"), "Official Anthropic post", "NOT YET", "warn"), gap=12),
      "How you'll know it's real", "Watch for")

# ================= verdict
t = W("let me know")
scene(t2, t, hrow(stat(W("clearly being tested"), "Being tested?", "Likely", "something new", "", vs=70), stat(W("overdue"), "On schedule?", "Overdue", "64 vs ~60 days", "", vs=70),
                  stat(W("no official word"), "Confirmed?", "No", "no ID, no docs", "", vs=70), stat(W("my guess"), "My guess", "Early–mid Dec", "", "hero", vs=58), gap=16),
      "My take", "Opus 5.6")
t2 = W("ill see you")
scene(t, t2, col(item(t + .1, "When do you think Opus 5.6 drops?", "hd", "font-size:76px;text-align:center"),
                 text(t + .6, "Tell me in the comments.", 40, "center", "ink3"),
                 text(W("subscribe so"), "Subscribe to catch it the day it drops.", 32, "center", "ink3"), gap=24), push=False)
scene(t2, END, col(item(t2, '<img src="assets/img/aiequator_k.png" alt="" style="width:300px;height:300px;display:block;margin:0 auto">', ""),
                   text(t2, "Subscribe for more AI news", 32, "center", "ink3"), gap=30), push=False, last=True)
