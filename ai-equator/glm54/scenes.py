"""GLM-5.4: Z.ai's first Loop Transformer. On-screen facts come from Z.ai's blog (z.ai/blog/glm-5.4), the posts shown,
Artificial Analysis (GLM-5), TechNode/TNW and docs.z.ai. Nothing here is a GLM-5.4 benchmark: none were published."""
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
END = round(VO + 1.6, 2)
ZL = "assets/img/zai.svg"
BLOG = "z.ai/blog/glm-5.4"


def blog(t, crop, w, b=None):
    return shot(t, "blog_full", BLOG, crop, w, b)


def plist(t0, rows, size=40):
    """rows: (t, text, tone). One line each, entering on its word."""
    return col(*[item(t, s, f"hd {tone}", f"font-size:{size}px") for t, s, tone in rows], gap=18)


def reply(t, name, w):
    return chart(t, f"assets/raw/web/tw_{name}.png", w, crop=(0, .695, 1, 1))


def loop_stack(t0, t1, t2, t_mid):
    """Ten layers. At t1 a token passes through each once; at t_mid the middle block lights up; at t2 the token
    climbs to the top of the block, loops back down along the arc and climbs through it a second time."""
    y = lambda i: 20 + (9 - i) * 58        # top of layer i (0 = bottom)
    ty = lambda i: y(i) + 21 - 15          # token top when centred on layer i
    sid, tok, arc = nid("ls"), nid("tk"), nid("arc")
    lay = ""
    for i in range(10):
        lid = f"{sid}l{i}"
        mid = 3 <= i <= 6
        lay += f'<div id="{lid}" class="lyr" style="top:{y(i)}px">layer {i + 1 if i < 9 else "…"}</div>'
        tl.append(f'tl.fromTo("#{lid}",{{backgroundColor:"#DBEAFE"}},{{backgroundColor:"#EDEDF0",duration:.45}},{t1 + .15 + i * .2:.3f});')
        if mid:
            tl.append(f'tl.to("#{lid}",{{backgroundColor:"#DBEAFE",borderColor:"#1D4ED8",color:"#1D4ED8",duration:.4}},{t_mid:.3f});')
    tl.append(f'tl.fromTo("#{tok}",{{opacity:1,y:{ty(-1) + 20}}},{{opacity:1,y:{ty(10)},duration:2.2,ease:"none"}},{t1:.3f});')
    tl.append(f'tl.to("#{tok}",{{opacity:0,duration:.2}},{t1 + 2.2:.3f});')
    tl.append(f'tl.set("#{tok}",{{y:{ty(-1) + 20},opacity:1}},{t2:.3f});')
    tl.append(f'tl.to("#{tok}",{{y:{ty(6)},duration:.9,ease:"none"}},{t2:.3f});')
    tl.append(f'tl.fromTo("#{arc}",{{opacity:0}},{{opacity:1,duration:.3}},{t2 + .9:.3f});')
    tl.append(f'tl.to("#{tok}",{{x:70,y:{(ty(6) + ty(3)) / 2:.0f},duration:.35,ease:"sine.out"}},{t2 + .9:.3f});')
    tl.append(f'tl.to("#{tok}",{{x:0,y:{ty(3)},duration:.35,ease:"sine.in"}},{t2 + 1.25:.3f});')
    tl.append(f'tl.to("#{tok}",{{y:{ty(6)},duration:.8,ease:"none"}},{t2 + 1.6:.3f});')
    tl.append(f'tl.to("#{tok}",{{y:{ty(10)},duration:.7,ease:"none"}},{t2 + 2.4:.3f});')
    tl.append(f'tl.to("#{tok}",{{opacity:0,duration:.25}},{t2 + 3.1:.3f});')
    y6, y3 = y(6) + 21, y(3) + 21
    svg = (f'<svg id="{arc}" style="position:absolute;left:430px;top:0;opacity:0" width="130" height="620">'
           f'<path d="M20 {y6} C 120 {y6}, 120 {y3}, 26 {y3}" fill="none" stroke="#1D4ED8" stroke-width="4" stroke-dasharray="10 8"/>'
           f'<path d="M26 {y3} l14 -9 l0 18 z" fill="#1D4ED8"/></svg>')
    return item(t0, f'{lay}{svg}<div id="{tok}" class="tok" style="top:0;opacity:0"></div>', "lst")


# ================= hook
t = W("it started with")
scene(0, t, col(row(item(0, f'<img src="{ZL}" alt="" style="width:150px;height:150px;display:block">', "lg"),
                    col(big(0, "GLM-5.4", 190), text(0, "Z.ai · Zhipu AI · Beijing", 36), gap=8), gap=48, flex=[0, 1]),
                hrow(pill(W("no launch event"), "No launch event"), pill(W("no benchmark chart"), "No benchmark chart", "bad"), gap=20), gap=56),
      None, "New model · November 23, 2026")
t2 = W("its called")
scene(t, t2, row(tw(t + .1, "zixuan", 900),
                 col(stat(W("which hit"), "Views in hours", "800K+", "Zixuan Li, Z.ai, on X", "hero", None, 800, suf="K+", vs=120), gap=0), gap=56, flex=[0, 1]),
      "It started with one post", "The launch", "@ZixuanLi_ on X, Nov 23, 2026")
t = P["p02"]
scene(t2, t, row(chart(t2 + .1, "assets/raw/web/blog_cover.jpg", 900, b=t),
                 col(text(t2 + .4, "GLM-5.4", 44, tone=""), item(W("it reads"), "It reads some of its own layers <b class='acc'>twice</b>.", "hd", "font-size:58px"), gap=16),
                 gap=56, flex=[0, 1]), None, None, "Z.ai, GLM-5.4 blog cover")

# ================= who made it
t2 = P["p03"]
scene(t, t2, col(row(item(t + .1, f'<img src="{ZL}" alt="" style="width:110px;height:110px;display:block">', "lg"),
                     col(head(t + .2, "Zhipu AI, now Z.ai", 64), text(W("out of beijing"), "Beijing, China", 34), gap=6), gap=36, flex=[0, 1]),
                 timeline([(W("in january last year"), "Jan 2025", "On the US entity list", "bad"),
                           (W("this january"), "Jan 2026", "Hong Kong IPO · 02513.HK", ""),
                           (W("and through all"), "All along", "Open weights", "on")]), gap=56),
      None, "Who made it", "Federal Register, Jan 16 2025 · TechNode, Jan 8 2026")

# ================= the pace
t = W("51 could")
scene(t2, t, row(shot(t2 + .2, "aa_glm5", "artificialanalysis.ai · Feb 2026", (.12, .02, .88, .42), 900),
                 col(stat(W("744"), "GLM-5 · Feb 2026", "744B", "parameters, open weights", "", ZL, vs=96),
                     stat(W("the first open model"), "Intelligence Index", "50", "first open-weights model to reach it", "hero", None, 50, vs=96), gap=20),
                 gap=48, flex=[0, 1]),
      "GLM-5: the open model that hit 50", "The pace", "Artificial Analysis, “GLM-5: Everything You Need to Know”")
t2 = P["p04"]
scene(t, t2, timeline([(t + .1, "Feb", "GLM-5 · 744B", ""),
                       (W("51 could"), "Apr", "5.1 · 8 hours solo", ""),
                       (W("52 got"), "Jun", "5.2 · 1M context", ""),
                       (W("53 in august"), "Aug", "5.3 · all code", ""),
                       (W("three months later"), "Nov 23", "5.4", "on")], "Five releases since February."),
      "A new GLM every two months", "The pace", "docs.z.ai release notes")

# ================= what's new
t = W("it keeps the million")
scene(t2, t, row(tw(W("it can see"), "mileson", 760),
                 col(check_row(W("53 could only"), "GLM-5.3", "TEXT ONLY", "warn"),
                     check_row(W("drop in a screenshot"), "GLM-5.4", "SEES IMAGES", "good"),
                     text(W("drop in a screenshot") + .3, "Translated: “Button out of place? Send it the screenshot.”", 28, tone="ink3"), gap=16),
                 gap=48, flex=[0, 1]),
      "New: it can see", "What's new", "@Mileson07 on X, Nov 23, 2026 (translated)")
t2 = P["p05"]
scene(t, t2, hrow(stat(t + .1, "Context", "1M", "tokens", "", vs=120),
                  stat(W("says coding"), "Coding", "Stronger", "“all-round”, says Z.ai", "", vs=84),
                  stat(W("gets 50"), "Weekly quota", "+50%", "vs GLM-5.3, Coding Plan", "hero", None, 50, pre="+", suf="%", vs=120), gap=24),
      "And everything else", "What's new", "@ZixuanLi_ on X · TechNode")

# ================= the loop
t = P["p06"]
scene(t2, t, row(loop_stack(W("a tall stack"), W("every word goes"), W("runs them twice"), W("takes 28")),
                 plist(0, [(W("a normal model"), "A normal model: every word, every layer, <b class='acc'>once</b>.", ""),
                           (W("takes 28"), "GLM-5.4: 28 layers, run <b class='acc'>twice</b> per word.", ""),
                           (W("its like rereading"), "Like rereading a hard paragraph.", "ink3"),
                           (W("the model gets deeper"), "Deeper. <b class='acc'>Not bigger.</b>", "")], 44), gap=64, flex=[0, 1]),
      "Same layers, twice", "The loop", "Simplified from Z.ai's architecture notes", push=False)
t2 = W("its about 750")
scene(t, t2, row(blog(t + .1, (.24, .095, .76, .213), 760, t2),
                 col(text(t + .4, "Z.ai's diagram: loop pass 1, loop pass 2, shared weights.", 32, tone="ink3"),
                     item(W("they didnt train"), "Not trained from scratch: <b class='acc'>GLM-5, taught to loop</b>.", "hd", "font-size:50px"), gap=20),
                 gap=56, flex=[0, 1]),
      "Their first Loop Transformer", "The loop", BLOG)
t = W("and they admit")
scene(t2, t, hrow(stat(t2 + .1, "Size", "750B", "parameters, per Z.ai", "", ZL, vs=110),
                  stat(W("they claim"), "Claimed to think like", "2–3T", "Z.ai's claim, no scores shown", "", vs=110),
                  stat(W("it runs up"), "Speed", "200", "tokens/s off-peak · 70–80 at peak", "hero", None, 200, vs=110), gap=24),
      "The numbers Z.ai gave", "The loop", BLOG)
t2 = P["p07"]
scene(t, t2, col(quote(W("sometimes it gets"), "it tends to get caught in overly long “marathon thinking” loops", "Z.ai", "GLM-5.4 blog, Limitations"),
                 gap=0), "Its own flaw, in its own words", "The loop", BLOG)

# ================= the one test
t = W("on the 30")
scene(t2, t, col(item(t2 + .2, "The loop, tried at four sizes before the real thing:", "hd ink3", "font-size:40px"),
                 hrow(stat(W("idea at") + .4, "Test model", "1B", "parameters", vs=110), stat(W("430"), "Test model", "4B", "parameters", vs=110),
                      stat(W("430") + .6, "Test model", "30B", "parameters", vs=110), stat(W("and finally"), "GLM-5.4", "750B", "parameters", "hero", ZL, vs=110), gap=24), gap=36),
      "How they tested it", "The evidence", BLOG)
t3 = W("but thats the small")
scene(t, t3, row(blog(t + .1, (.24, .407, .76, .485), 900),
                 col(stat(W("11 points"), "AIME25 · 30B test model", "+11.3", "19.17 → 30.42 with the loop", "hero", None, 11.3, 1, "+", vs=100),
                     text(W("the looped version"), "Won all five tests, with shorter answers.", 34, tone=""), gap=20),
                 gap=48, flex=[0, 1]),
      "Same size, looped: it won", "The evidence", BLOG + " · 30B test model, ~10% more training compute")
t = P["p08"]
scene(t3, t, col(verdict(t3 + .1, "30B TEST MODEL", "warn", 44), item(W("not 54"), "Not GLM-5.4.", "hd", "font-size:88px"), gap=30), push=False)

# ================= what's missing
t2 = W("so that 2")
scene(t, t2, col(check_row(W("there are no benchmark"), "Benchmark scores for GLM-5.4", "NOT PUBLISHED", "bad", "not from Z.ai, not from anyone yet"),
                 check_row(W("the api"), "API", "COMING SOON", "warn", "after a safety evaluation"),
                 check_row(W("the weights"), "Open weights", "PROMISED", "warn", "after safety hardening, no date"), gap=16),
      "What's missing", "The catch", BLOG)
t = P["p09"]
scene(t2, t, col(row(tw(t2 + .1, "karan", 720), col(reply(W("and the replies"), "bash", 640), reply(W("say exactly"), "deshiou", 640), gap=20), gap=40, flex=[0, 0]), gap=0),
      None, None, "@karanC_12, @they_bash, @deshiou0604 on X, Nov 23, 2026")

# ================= demos
t2 = W("a music video")
scene(t, t2, clip80(t, t2, "x/zai_demo3.mp4", 6, "Z.ai demo, GLM-5.4 blog (also posted by @louszbd)",
                    caps=[(t + .4, "A full game, written by GLM-5.4", ""), (W("12 golden"), "12 golden bricks to find", "acc")]))
t3 = W("a snowy")
scene(t2, t3, clip80(t2, t3, "x/zai_demo1.mp4", 64, "Z.ai demo, GLM-5.4 blog", caps=[(t2, "“Hello World”, a music video", "")]))
t = W("and one independent")
scene(t3, t, clip80(t3, t, "x/zai_demo4.mp4", 2, "Z.ai demo, GLM-5.4 blog", caps=[(t3 + .3, "3D bird-watching, pure geometry and GLSL shaders", "")]))
t2 = P["p10"]
scene(t, t2, clip80(t, t2, "x/x_ajay_vs.mp4", 6, "@ItsmeAjayKV on X, Nov 23, 2026",
                    caps=[(W("build a floating"), "Same prompt, one shot: GLM-5.4 (left) vs Qwen4-Max", ""), (W("he liked"), "His pick: GLM-5.4", "acc"),
                          (W("58"), "58K tokens vs 43K", "")]))

# ================= try it
t = P["p11"]
scene(t2, t, col(row(stat(W("starting at"), "GLM Coding Plan", "$18", "a month, Lite plan", "hero", ZL, 18, pre="$", vs=110),
                     col(text(W("it works in"), "Works in:", 30, tone="ink3"),
                         hrow(pill(W("own chat"), "Z.ai Chat"), pill(W("and in z"), "ZCode"), gap=16),
                         hrow(pill(W("cloud code"), "Claude Code"), pill(W("codecs"), "Codex"), pill(W("or climb"), "Cline"), gap=16), gap=16),
                     gap=48, flex=[0, 1]),
                 item(W("just set the model"), "model: <b class='acc'>glm-5.4</b>", "hd mono", "font-size:52px"), gap=36),
      "How to try it", "Try it", "docs.z.ai/devpack · " + BLOG)

# ================= why it matters
t2 = P["p12"]
card = lambda t0, head_, rows_, tone: item(t0, f'<div class="slab">{head_}</div>' +
                                          "".join(f'<div class="hd" style="font-size:38px;margin-top:16px">{r}</div>' for r in rows_), f"stat {tone}", "flex:1")
scene(t, t2, col(hrow(card(W("the usual way"), "The usual way", ["Make it bigger", "More parameters", "More chips"], ""),
                      card(W("looping is"), "The loop", ["Same parameters", "Run them twice", "Cheaper path"], "hero"), gap=28),
                 text(W("which is hard"), "Zhipu has been on the US entity list since January 2025.", 32, tone="ink3"),
                 text(W("if the scores"), "If the scores hold up, the math changes for everyone.", 40, tone=""), gap=24),
      "Why this one matters", "My take")

# ================= what's next
t = W("one report says")
scene(t2, t, clip80(t2, t, "x/zai_demo2.mp4", 4, "Z.ai demo: GLM-5.4 builds a 6-axis robot arm in FreeCAD",
                    caps=[(W("a significantly larger"), "Next: a “significantly larger model”", ""), (W("in their words"), "“It will be ready soon”: Z.ai", "acc")]))
t2 = P["p13"]
scene(t, t2, col(check_row(t + .1, "The bigger model: December?", "ONE REPORT", "warn", "name and date unconfirmed"),
                 check_row(W("so the benchmarks"), "GLM-5.4 benchmarks", "STILL WAITING", "bad"), gap=18),
      "What's next", "Next", "Z.ai blog · KuCoin/Odaily report (unconfirmed)")

# ================= outro
t = W("this is ai")
scene(t2, t, col(item(t2 + .1, "Would you trust a model that skipped the scoreboard?", "hd", "font-size:72px;text-align:center"),
                 text(t2 + 1.0, "Tell me in the comments.", 40, "center", "ink3"), gap=30), push=False)
scene(t, END, col(item(t, '<img src="assets/img/aiequator_k.png" alt="" style="width:300px;height:300px;display:block;margin:0 auto">', ""),
                  text(t, "Subscribe for more AI news", 32, "center", "ink3"), gap=30), push=False, last=True)
