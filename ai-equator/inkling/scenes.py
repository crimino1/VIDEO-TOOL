"""Inkling 2 Mini review: tester-style, real footage first. Facts from thinkingmachines.ai/news/inkling-2-mini, the HF model
card, Artificial Analysis, Vals, and the testers credited on screen. We did not run the model ourselves (16 GB laptop)."""
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
TM = "assets/img/tm_logo.png"
TMURL = "thinkingmachines.ai/news/inkling-2-mini"
TMS = "Thinking Machines, “Introducing Inkling 2 Mini”"


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


def loop_blocks(t0, t1, t_mid, t_count, t_split=None):
    """Four stored blocks of six layers. At t1 a token climbs: block 1 once, blocks 2-3 three times (looping back
    twice along the arc), block 4 once. The middle blocks light up at t_mid; the 48/24 counter lands at t_count."""
    y = lambda i: 30 + (3 - i) * 130          # top of block i (0 = bottom)
    cy = lambda i: y(i) + 50 - 15             # token top when centred on block i
    sid, tok, arc = nid("lb"), nid("tk"), nid("arc")
    lay = ""
    for i in range(4):
        lid = f"{sid}b{i}"
        lay += f'<div id="{lid}" class="lyr" style="top:{y(i)}px;height:100px;font-size:24px">Block {i + 1} · 6 layers</div>'
        if t_split is not None:
            tl.append(f'tl.fromTo("#{lid}",{{backgroundColor:"#DBEAFE"}},{{backgroundColor:"#EDEDF0",duration:.6}},{t_split + i * .25:.3f});')
        if i in (1, 2):
            tl.append(f'tl.to("#{lid}",{{backgroundColor:"#DBEAFE",borderColor:"#1D4ED8",color:"#1D4ED8",duration:.4}},{t_mid:.3f});')
    t = t1
    tl.append(f'tl.fromTo("#{tok}",{{opacity:1,x:0,y:{cy(-1) + 40}}},{{opacity:1,y:{cy(0)},duration:.5,ease:"none"}},{t:.3f});')
    t += .5
    for k in range(3):
        tl.append(f'tl.to("#{tok}",{{y:{cy(2)},duration:.7,ease:"none"}},{t:.3f});')
        t += .7
        if k < 2:
            tl.append(f'tl.to("#{tok}",{{x:80,y:{(cy(2) + cy(1)) / 2:.0f},duration:.3,ease:"sine.out"}},{t:.3f});')
            tl.append(f'tl.to("#{tok}",{{x:0,y:{cy(1)},duration:.3,ease:"sine.in"}},{t + .3:.3f});')
            t += .6
    tl.append(f'tl.to("#{tok}",{{y:{cy(3)},duration:.5,ease:"none"}},{t:.3f});')
    tl.append(f'tl.to("#{tok}",{{y:{cy(4)},opacity:0,duration:.4}},{t + .5:.3f});')
    tl.append(f'tl.fromTo("#{arc}",{{opacity:0}},{{opacity:1,duration:.3}},{t1 + 1.2:.3f});')
    y2, y1 = y(2) + 50, y(1) + 50
    svg = (f'<svg id="{arc}" style="position:absolute;left:430px;top:0;opacity:0" width="150" height="560">'
           f'<path d="M20 {y2} C 140 {y2}, 140 {y1}, 26 {y1}" fill="none" stroke="#1D4ED8" stroke-width="4" stroke-dasharray="10 8"/>'
           f'<path d="M26 {y1} l14 -9 l0 18 z" fill="#1D4ED8"/>'
           f'<text x="104" y="{(y1 + y2) / 2 + 9:.0f}" font-family="JetBrains Mono" font-size="26" font-weight="700" fill="#1D4ED8">×3</text></svg>')
    return item(t0, f'{lay}{svg}<div id="{tok}" class="tok" style="top:0;opacity:0"></div>', "lst", "height:560px")


# ================= hook
t = W("its an open weights")
scene(0, t, col(row(item(0, f'<img src="{TM}" alt="" style="width:150px;height:150px;display:block">', "lg"),
                    col(big(0, "Inkling 2 Mini", 150), text(0, "Thinking Machines · open weights · Nov 20, 2026", 34), gap=10), gap=44, flex=[0, 1]), gap=0),
      None, "New model")
t2 = W("thats their claim")
scene(t, t2, clip(t, t2, "x/tm_planebench-demo3.mp4", 168, "Thinking Machines launch demo: MacBook Pro (M5 Pro, 48GB), airplane mode",
                  caps=[(t + .3, "Open weights · runs on a laptop", ""), (W("on coding agent"), "Beats every open model under 100B on coding agents (their claim)", "acc")]))
t = W("what it is") - .2
_CALLS.pop()  # boundary only: the cue belongs to the next scene
scene(t2, t, hshot(t2 + .1, "tm_full", TMURL, (.205, .0335, .69, .0458), 1400, [(t2 + .6, .0, .58, 1.0, 1.0)]),
      "“Leads every open-weights model with less than 100B”", "Their claim", TMS)
t2 = P["p02"]
scene(t, t2, col(hrow(pill(W("what it is"), "What it is"), pill(W("looping trick"), "The loop"), pill(W("actually ran it"), "Real tests"), gap=18),
                 hrow(pill(W("tokens per second"), "Mac &amp; GPU speed", "acc"), pill(W("stacks up"), "vs Qwen · Gemma · more"), pill(W("who should"), "Who should use it"), gap=18), gap=22),
      "In this video", "Inkling 2 Mini")

# ================= company
t = P["p03"]
scene(t2, t, row(pic(t2 + .2, "assets/img/murati.jpg", 330, 440, "Mira Murati", "Founder, ex-CTO of OpenAI"),
                 timeline([(W("february last year"), "Feb 2025", "Lab founded", ""),
                           (W("2 billion"), "Jul 2025", "$2B at $12B", ""),
                           (W("inkling in july"), "Jul 2026", "Inkling · 975B", ""),
                           (W("came out earlier"), "Nov 5", "Inkling 2 Small · 594B", ""),
                           (W("now theres mini"), "Nov 20", "Inkling 2 Mini · 26B", "on")]), gap=64, flex=[0, 1]),
      "Thinking Machines Lab", "Background", "Photo: SWinxy, CC BY 4.0, Wikimedia Commons · Wikipedia · Hugging Face")

# ================= specs
t2 = P["p04"]
scene(t, t2, clip(t, t2, "rec/hf_scroll36.mp4", 0, "huggingface.co/thinkingmachines/Inkling-2-Mini (model card)",
                  caps=[(W("264 billion"), "26.4B total · 3.4B active per token", ""), (W("every token gets"), "8 of 128 experts", ""),
                        (W("it takes text"), "Text + images in · 1M context", ""), (W("apache 20"), "Apache 2.0 + usage policy", ""),
                        (W("official download"), "~20 GB · 32 GB+ memory", "acc")]))

# ================= loop
t = W("if you watched")
scene(t2, t, row(loop_blocks(W("a normal model"), W("but the middle"), W("but the middle"), W("so you get"), W("split into")),
                 plist([(W("a normal model"), "A normal model: every layer, <b class='acc'>once</b>.", ""),
                        (W("24 layers"), "Inkling 2 Mini: 24 layers in 4 blocks.", ""),
                        (W("the first block"), "First block: once. Last block: once.", "ink3"),
                        (W("but the middle"), "The middle 12 run <b class='acc'>three times</b>.", ""),
                        (W("so you get"), "48 layer passes per token.", ""),
                        (W("actually stored"), "Only 24 layers stored on disk.", ""),
                        (W("thinks harder"), "Thinks harder, <b class='acc'>same size on disk</b>.", "ink3")], 36, 14), gap=64, flex=[0, 1]),
      "Same layers, three times", "The loop", "Simplified from " + TMS, push=False)
t2 = P["p05"]
scene(t, t2, row(tw(t + .1, "tm_loop", 640, .55),
                 col(check_row(W("did something similar"), "GLM-5.4 (Zhipu)", "LOOPS ×2", ""), check_row(W("loops three times"), "Inkling 2 Mini", "LOOPS ×3", "good"), gap=16),
                 gap=56, flex=[0, 1]), "Not the only looped model", "The loop", "@thinkymachines on X, Nov 20, 2026")

t = W("but theres a catch")
scene(t2, t, row(hshot(t2 + .1, "tm_full", TMURL, (.16, .412, .70, .443), 900),
                 col(stat(W("27 out of 28"), "Middle loop beat last-layer loop", "27/28", "evaluations", "hero", None, 27, suf="/28", vs=100),
                     stat(W("140"), "No-loop model needs", "+140%", "compute on long agent tasks", "", None, 140, pre="+", suf="%", vs=100), gap=20), gap=48, flex=[0, 1]),
      "They tested where the loop goes", "The loop", TMS)
t2 = P["p06"]
scene(t, t2, col(row(stat(W("better at reasoning"), "Looping helps", "Reasoning", None, "hero", vs=84), stat(W("remember more facts"), "Looping doesn't help", "Facts", None, "", vs=84), gap=24),
                 text(W("total size"), "Knowledge still comes down to total size: 26.4B.", 38, tone=""),
                 text(W("keep that in mind"), "Remember this one. It comes back later.", 32, tone="ink3"), gap=28),
      "The catch", "The loop", TMS)

# ================= training
t = P["p07"]
scene(t2, t, col(row(stat(W("natively in 4bit"), "Trained natively in", "4-bit", "NVFP4 (last 4 layers MXFP8)", "hero", None, vs=110),
                     stat(W("384 experts"), "Experts", "384 → 128", "two-thirds pruned mid-training", "", None, vs=96), gap=24),
                 text(W("it is the model"), "The official 4-bit weights <b class='acc'>are</b> the model: no quantization loss.", 36, tone=""), gap=28),
      "Built small on purpose", "Training", TMS + " · Hugging Face model card")

# ================= demos intro
t2 = P["p08"]
scene(t, t2, col(hrow(stat(W("16 gigs"), "My editing laptop", "16 GB", "RAM", "", vs=120), stat(W("2bit build"), "Recommended", "32 GB+", "for the official weights", "hero", vs=120), gap=24),
                 text(W("so for this video"), "So: Thinking Machines' demos, plus real tests people posted. Credited on screen.", 34, tone=""), gap=30),
      "I can't run this one properly", "The tests")

# ================= the demos
t = P["p09"]
scene(t2, t, clip(t2, t, "x/tm_planebench-demo3.mp4", 166, "Thinking Machines demo · MacBook Pro (M5 Pro, 48GB) · airplane mode",
                  caps=[(t2 + .4, "Built offline, on a flight, in a few minutes", ""), (W("youve got terrain"), "Terrain · a plane you can fly · HUD", ""),
                        (W("but this is"), "A 20 GB model, offline, at 30,000 ft", "acc")]))
t2 = P["p10"]
scene(t, t2, clip(t, t2, "x/tm_thinkyville.mp4", 18, "Thinking Machines demo · Thinkyville · one offline MacBook Pro (M5 Pro, 48GB)",
                  caps=[(t + .4, "Thinkyville: a town Inkling 2 Mini built", ""), (W("all 20 villagers"), "All 20 villagers run by the same model", "acc")]))
t = P["p11"]
scene(t2, t, clip(t2, t, "x/x_ollama2048.mp4", 8, "@ollama on X, Nov 20, 2026", caps=[(t2 + .4, "ollama run inkling-2-mini · playing 2048 live", "")]))
t2 = P["p12"]
scene(t, t2, clip(t, t2, "x/x_ajay_island.mp4", 3, "@ItsmeAjayKV on X · RTX 3090 · Unsloth Q4",
                  caps=[(W("one prompt"), "One prompt: a snowy floating island in 3D", ""), (W("23000 tokens"), "~23K tokens · one shot", "acc")]))

t = W("but when he asked")
scene(t2, t, clip(t2, t, "yt/yt_sq_pagoda.mp4", 24, "Square Pc on YouTube, “Inkling 2 Mini Review” · RTX 5090",
                  caps=[(W("inside an agent harness"), "Inside an agent harness: it screenshots and fixes its own work", ""),
                        (W("night sky"), "Night sky · flapping banners · butterflies", "acc")]))
t2 = P["p13"]
scene(t, t2, clip(t, t2, "yt/yt_sq_camel.mp4", 12, "Square Pc on YouTube · camel riding a bike",
                  caps=[(t + .3, "One shot, no harness: much rougher", "bad"), (W("the first try"), "First try: a broken bike", "bad"),
                        (W("and it took"), "Fixed over a few renders: it really likes a harness", "acc")]))
t = W("he didnt know")
scene(t2, t, clip(t2, t, "yt/yt_otis_app.mp4", 1, "Otis's AI Lab on YouTube · his blind-test scoring app, Qwen 3.8 Flash Next vs Inkling 2 Mini",
                  caps=[(W("a pixel fishing"), "Fishing game · comedy set · 3D coaster", "")]))
t3 = W("clearly won")
scene(t, t3, clip(t, t3, "yt/yt_otis_reveal.mp4", 6, "Otis's AI Lab on YouTube · the reveal",
                  caps=[(W("inkling had won"), "Comedy 5.8 vs 5.5 · Fishing 7.0 vs 6.0: Inkling", "acc")]))
t2 = P["p14"]
scene(t3, t2, clip(t3, t2, "yt/yt_otis_final.mp4", 5, "Otis's AI Lab on YouTube · round 3 result",
                   caps=[(t3 + .1, "3D coasters: Qwen won, 6.3 vs 5.0", "bad"), (W("for 3d work"), "For 3D work, he'd still pick Qwen", "")]))
t = W("it pulled all")
scene(t2, t, clip(t2, t, "yt/yt_rit_vision_fail.mp4", 2, "AI WITH Rithesh on YouTube · 3-bit MLX · 24GB MacBook Air, no fan",
                  caps=[(W("seven out of seven"), "Broken repo fixed: 7/7 tests in ~1.5 min", "acc")]))
t3 = W("but when he asked")
scene(t, t3, clip(t, t3, "yt/yt_rit_vision_fail.mp4", 76, "AI WITH Rithesh on YouTube",
                  caps=[(t + .2, "Invoice → JSON: all 17 fields right", ""), (W("six out of six"), "Screen clicks: 6 of 6", "acc")]))
t = t3
t2 = P["p15"]
scene(t, t2, col(check_row(t + .1, "A plain fact, no search", "WRONG DATE", "bad", "Bengaluru Terminal 2: said Oct 2016, opened Jan 2023"),
                 check_row(W("with search"), "Same question, search on", "RIGHT", "good", "in a few seconds"), gap=18),
      "Facts: let it search", "AI WITH Rithesh's test", "AI WITH Rithesh on YouTube")
t = W("thinking machines even admits")
scene(t2, t, clip(t2, t, "yt/yt_rit_vision_fail.mp4", 117, "AI WITH Rithesh on YouTube · where it broke",
                  caps=[(W("for a flight sim"), "Flight sim: 20,000+ thinking tokens, ~30 min, no code", "bad"),
                        (W("four agents"), "Four agents at once: under 4 tok/s each", "bad")]))
t2 = P["p16"]
scene(t, t2, row(hshot(t + .1, "hf", "huggingface.co/thinkingmachines/Inkling-2-Mini", (.11, .86, .55, .925), 820),
                 plist([(W("long reasoning loops"), "Can get stuck in long reasoning loops", ""), (W("destructive actions"), "Can act destructively without asking", "bad"),
                        (W("misreport"), "…and misreport what it did", "bad"), (W("so please"), "Run it in a sandbox.", "acc")], 38), gap=48, flex=[0, 1]),
      "Their own warning", "Model card", "Hugging Face model card, “Known issues”")

t = P["p17"]
scene(t2, t, col(check_row(W("with one pass"), "1 pass · almost 2× faster", "GIBBERISH", "bad"),
                 check_row(W("two passes"), "2 passes", "STUCK REPEATING", "bad"),
                 check_row(W("three passes"), "3 passes · as shipped", "4 / 4", "good"),
                 check_row(W("and four passes"), "4 passes · more thinking?", "0 / 4", "bad"),
                 item(W("trained for exactly"), "Trained for exactly <b class='acc'>three</b>. Don't touch it.", "hd", "font-size:44px"), gap=12),
      "He changed the loop count", "AI WITH Rithesh's test", "AI WITH Rithesh on YouTube, “Inkling 2 Mini: #1 on Hugging Face!”")

# ================= speed
t2 = P["p18"]
scene(t, t2, col(item(t + .1, "How fast is it", "hd", "font-size:96px;text-align:center"),
                 item(W("on my machine"), "on <b class='acc'>my</b> machine?", "hd", "font-size:96px;text-align:center"),
                 text(W("doesnt publish"), "No official local tokens/s. These are measured by people.", 36, "center", "ink3"),
                 hrow(pill(W("doesnt publish") + 1.5, "Mac mini"), pill(W("doesnt publish") + 1.7, "MacBook"), pill(W("doesnt publish") + 1.9, "Mac Studio"),
                      pill(W("doesnt publish") + 2.1, "RTX cards"), pill(W("doesnt publish") + 2.3, "DGX Spark"), gap=16, justify="center"), gap=24), push=False)
t = W("on a macbook pro")
scene(t2, t, row(hshot(t2 + .1, "macmini_bench", "huggingface.co/datasets/pratikgx/inkling-2-mini-m5-pro-mac-mini-bench", (.065, .305, .39, .365), 700),
                 col(text(t2 + .3, "Mac mini · M5 Pro · 64 GB · IQ4_NL · llama.cpp", 28, tone="ink3"),
                     bars(W("about 30"), [(W("about 30"), "Short prompt", 30.0, True, None, None), (W("25 at"), "32K context", 25.0, False, None, None),
                                         (W("17 at"), "131K context", 17.4, False, None, None)], 35, 1, label_w=250, val_w=130, h=48, gap=16, note="tokens per second, generation"), gap=16),
                 gap=48, flex=[0, 1]),
      "Mac mini", "Speed", "pratikgx on Hugging Face (community benchmark)")
t2 = P["p19"]
scene(t, t2, col(bars(t + .1, [(t + .1, "MacBook Pro · M4 Pro", 27, False, None, "36 GB · Ollama"),
                               (W("mac studio"), "Mac Studio · M5 Ultra", 83.4, True, None, "oMLX · 8-bit")], 100, 1, label_w=480, val_w=220, h=56),
                 gap=0), "MacBook and Mac Studio", "Speed", "flaviocopes.com · omlx.ai benchmarks (community)")
t = W("even an eight")
G = [("RTX 4090 · 24 GB", 58.5, "57–60"), ("RTX 3090 · 4-bit", 73.5, None), ("2× RTX 3090", 89.8, None), ("DGX Spark", 45, None), ("RTX 4060 · 8 GB · 3-bit", 18, None)]
scene(t2, t, row(col(bars(t2 + .1, [(W("rtx 4090"), G[0][0], G[0][1], False, None, "57–60"), (W("a single rtx"), G[1][0], G[1][1], False, None, None),
                                    (W("two of them"), G[2][0], G[2][1], True, None, None), (W("dgx spark"), G[3][0], G[3][1], False, None, None)], 100, 0, label_w=390, val_w=120, h=40, gap=12, note="tokens per second, generation"), gap=0),
                 gap=0), "Nvidia GPUs", "Speed", "community measurements: Hugging Face, GitHub (tonyd2wild)")
t2 = W("and square pc")
scene(t, t2, clip(t, t2, "x/x_alok4060.mp4", 2, "@analogalok on X · RTX 4060 8GB · Unsloth Q3_K_XL · llama.cpp",
                  caps=[(t + .2, "8 GB RTX 4060: about 18 tok/s, 3-bit build", "acc")]))
t, t2 = t2, P["p20"]
scene(t, t2, clip(t, t2, "yt/yt_sq_camel.mp4", 0, "Square Pc on YouTube · RTX 5090 · optimized engine (Basalt)",
                  caps=[(t + .3, "Bursts over 400 tok/s · usually ~250", "acc")]))
t = W("on thinking machines own")
scene(t2, t, row(clipbox(t2, t, "x/x_exo.mp4", 2, 192, 140, 760, 760, (), None, "@exolabs on X (launch partner)"),
                 col(stat(W("210"), "Exo Labs' claim, M5 Ultra", "210", "tok/s · settings not shared", "", None, 210, vs=110),
                     stat(W("best independent"), "Best independent, same chip", "83", "tok/s", "hero", None, 83, vs=110), gap=20), gap=0, flex=[1, 1]))
t2 = P["p21"]
scene(t, t2, row(hshot(t + .1, "aa_model", "artificialanalysis.ai/models/inkling-2-mini", (.12, .012, .83, .03), 900, [(W("197"), .23, .42, .47, 1.0)]),
                 col(stat(W("197"), "On Thinking Machines' servers", "197", "tok/s · Artificial Analysis", "hero", TM, 197, vs=120),
                     text(W("so thats the cloud"), "That's the cloud number, not your laptop.", 34, tone="ink3"), gap=20), gap=48, flex=[0, 1]),
      "The cloud number", "Speed", "artificialanalysis.ai")

t = W("one person fed")
scene(t2, t, col(text(t2 + .2, "Prefill: how fast it reads your prompt before answering. Mac mini, M5 Pro:", 32, tone="ink3"),
                 bars(W("about 490"), [(W("about 490"), "Short prompt", 491, True, None, None), (W("only about 95"), "131K tokens", 95, False, None, None)], 520, 0,
                      label_w=300, val_w=140, h=56, note="prompt tokens per second"), gap=24),
      "The weak spot: prefill", "Speed", "pratikgx on Hugging Face (community benchmark)")
t2 = P["p22"]
scene(t, t2, row(clipbox(t, t2, "x/x_dogukan3060.mp4", 2, 140, 330, 760, 428, (), None, "@DogukanUrker on X · RTX 3060"),
                 col(stat(t + .1, "950K-token prompt on a DGX Spark", "26.5 min", "before the first word", "hero", None, vs=96),
                     text(W("slowest"), "“prefill is crazy slow, the slowest i have ever posted”", 30, tone=""), gap=20), gap=0, flex=[1, 1]))

t = W("but long context")
scene(t2, t, row(hshot(t2 + .1, "unsloth", "unsloth.ai/docs/models/inkling-2-mini", (.27, .07, .64, .097), 760),
                 col(bars(W("fourbit builds"), [(W("fourbit builds"), "4-bit", 17.6, True, None, None), (W("the threebit"), "3-bit", 14, False, None, None),
                                               (W("twobit version"), "2-bit", 10.5, False, None, None)], 24, 1, " GB", label_w=140, val_w=220, h=48, gap=14,
                          note="community GGUF builds (Unsloth)"), gap=0), gap=48, flex=[0, 1]),
      "Memory", "Hardware", "unsloth.ai docs")
t2 = P["p23"]
scene(t, t2, row(tw(t + .1, "lasse", 640, .55),
                 col(bars(W("131000 tokens"), [(W("131000 tokens"), "Inkling 2 Mini", 31.2, True, TM, None), (W("used 21"), "Qwen 3.8 27B", 20.9, False, None, None)], 36, 1, " GB",
                          label_w=290, val_w=210, h=42, note="memory at 131K context"),
                     verdict(W("didnt fit"), "262K: DIDN'T FIT", "bad", 28), gap=20), gap=48, flex=[0, 1]),
      "Long context eats memory", "Hardware", "@lasse_ai on X")

# ================= benchmarks
t = W("on the artificial analysis")
scene(t2, t, clip(t2, t, "rec/tm_bench.mp4", 20, "thinkingmachines.ai/news/inkling-2-mini (screen recording)",
                  caps=[(t2 + .4, "Their own table, against open models of similar size", ""), (W("googles"), "Qwen 3.8 27B · Gemma 4 31B · Muse Glimmer · Nemotron 3.5", "acc")]))
t2 = W("where it really")
scene(t, t2, bars(t + .1, [(W("201"), "Inkling 2 Mini", 20.1, True, TM, None), (W("exactly tied"), "Qwen 3.8 27B", 20.1, False, None, None),
                           (W("gets 44") + .5, "Nemotron 3.5 Super VL", 13.6, False, None, None), (W("gets 44") + .25, "Muse Glimmer (Meta)", 6.3, False, None, None),
                           (W("gets 44"), "Gemma 4 31B (Google)", 4.4, False, None, None)], 25, 1, label_w=470, val_w=120, h=46, gap=14),
      "Intelligence Index: tied with Qwen", "Benchmarks", "Artificial Analysis Intelligence Index v5 · " + TMS)
t = P["p25"]
D = lambda tt, name, a, b, c, sub: item(tt, f'<div class="slab" style="font-size:25px">{name}</div>'
                                         f'<div class="drow win"><img src="{TM}" alt="">Inkling 2 Mini<b>{a}</b></div><div class="drow">Qwen 3.8 27B<b>{b}</b></div>'
                                         f'<div class="drow">Gemma 4 31B<b>{c}</b></div><div class="ssub">{sub}</div>', "stat", "flex:1")
scene(t2, t, hrow(D(W("swe bench verified"), "SWE-bench Verified", "79.2", "77.8", "46.1", "fixing real GitHub issues"),
                  D(W("another coding"), "DeepSWE v1.1", "48.2", "42.2", "0.3", "coding agent test"),
                  D(W("browse comp"), "BrowseComp", "79.0", "61.6", "37.0", "digging through the web"), gap=20),
      "Where it pulls ahead: coding agents", "Benchmarks", TMS)
t2 = W("artificial analysis ranks")
scene(t, t2, col(check_row(W("terminal bench"), "Terminal-Bench 2.1", "QWEN 73.0 vs 71.6", "warn"),
                 check_row(W("gdp val"), "GDPval-AA (office work)", "QWEN 1427 vs 1319", "warn"),
                 check_row(W("automation bench"), "AutomationBench", "QWEN 48.2 vs 41.8", "warn"),
                 check_row(W("vision reasoning"), "MMMU Pro (vision)", "QWEN 76.3 vs 74.9", "warn"),
                 check_row(W("avoids hallucinating"), "Doesn't hallucinate (AA-Omniscience)", "QWEN 71.4 vs 63.4", "bad"), gap=10),
      "Where Qwen wins", "Benchmarks", TMS)
t = P["p27"]
scene(t2, t, clip(t2, t, "rec/aa_model30.mp4", 0, "artificialanalysis.ai/models/inkling-2-mini (screen recording)",
                  caps=[(t2 + .3, "#2 of 16 in its size class, behind Nanbeige4.3-33B", ""),
                        (W("59 cents"), "$0.59 per index task · Qwen 3.8 27B: $3.53", "acc"),
                        (W("about half the time"), "About half the time, ~38% more output tokens", "")]))
t2 = P["p28"]
scene(t, t2, row(hshot(t + .1, "vals", "vals.ai/models/thinkingmachines_inkling-2-mini", (.42, .03, .82, .195), 780, [(W("vals own page"), .03, .7, .32, 1.0)]),
                 col(stat(W("465"), "Thinking Machines says", "46.5%", "Vals Index", "", TM, vs=96), stat(W("vals own page"), "Vals' own page", "44.0%", "rank 38 of 43", "hero", None, vs=96), gap=18),
                 gap=48, flex=[0, 1]), "Check the Vals number", "Benchmarks", "vals.ai")
t = P["p29"]
scene(t2, t, col(check_row(W("deepseek"), "DeepSeek's smallest: V4.1 Flash", "552B", "warn", "nothing in this size range"),
                 check_row(W("20b is still"), "OpenAI gpt-oss-20b", "NO INDEX SCORE", "warn", "Artificial Analysis lists N/A"),
                 check_row(W("so in the 20"), "20–35B, top of the index", "INKLING · QWEN · NANBEIGE", "good", "all at about 20"), gap=14),
      "What about the others?", "Open models, 20–35B", "artificialanalysis.ai · OpenRouter")
t2 = P["p30"]
scene(t, t2, bars(t + .1, [(W("claude fable"), "Claude Fable 5.2 (closed)", 65, False, None, None), (W("best open model"), "Kimi K3.1 Pro (best open)", 46, False, None, None),
                           (W("at 20"), "Inkling 2 Mini", 20, True, TM, None)], 70, 0, label_w=480, val_w=110, h=56, gap=20),
      "For perspective", "Artificial Analysis Intelligence Index", "artificialanalysis.ai leaderboard")

# ================= who should / shouldn't
t = P["p31"]
scene(t2, t, col(check_row(W("privacy"), "Privacy: nothing leaves your machine", "YES", "good"),
                 check_row(W("work offline"), "Offline work: flights, bad internet", "YES", "good"),
                 check_row(W("coding agents"), "Coding and search agents on a budget", "YES", "good"),
                 check_row(W("apache 20"), "Fine-tune and ship it (Apache 2.0)", "YES", "good"), gap=12),
      "Who should use it", "Verdict")
t2 = W("so thats inkling")
scene(t, t2, col(check_row(W("factual questions"), "Fact questions without search", "MAKES THINGS UP", "bad"),
                 check_row(W("other than english"), "Languages other than English", "WEAKER", "warn"),
                 check_row(W("16gig machine"), "16 GB machines: 2- or 3-bit only", "SLOW", "warn"),
                 check_row(W("hard engineering"), "Hard engineering · Terminal-Bench 4: 5.6%", "SAME AS QWEN", "warn"),
                 check_row(W("still early"), "Runtimes still need patches", "EARLY", "warn"), gap=10),
      "Who shouldn't", "Verdict")
t = P["p32"] + 13.0
t = W("let me know")
scene(t2, t, hrow(stat(W("tied with"), "Intelligence", "= Qwen", "AA Index 20.1", "", vs=80), stat(W("better at coding"), "Coding agents", "Better", "SWE-bench, BrowseComp", "hero", vs=80),
                  stat(W("a lot cheaper"), "Cost per task", "~6× less", "vs Qwen 3.8 27B", "", vs=80), stat(W("but its slow"), "Long prompts", "Slow", "prefill", "", vs=80), gap=18),
      "My take", "Inkling 2 Mini")
t2 = W("if you enjoyed")
scene(t, t2, col(item(t + .1, "Tried it? What speed do you get?", "hd", "font-size:80px;text-align:center"),
                 text(t + .6, "Tell me in the comments.", 40, "center", "ink3"), gap=30), push=False)
scene(t2, END, col(item(t2, '<img src="assets/img/aiequator_k.png" alt="" style="width:300px;height:300px;display:block;margin:0 auto">', ""),
                   text(t2, "Subscribe for more AI news", 32, "center", "ink3"), gap=30), push=False, last=True)
