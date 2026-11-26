"""Seedance 2.5 review: tester-style, real footage first. Facts from seed.bytedance.com, BytePlus, Dreamina, fal, Artificial
Analysis, Arena and the testers credited on screen."""
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
BLOG = "seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5"
BS = "ByteDance Seed, “Introducing Seedance 2.5”"


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



def vbox(a, b, raw, ss, w, h, credit, side):
    """A vertical/odd-shaped clip on the left (x 160) with a text column on the right half."""
    return row(clipbox(a, b, raw, ss, 160, int(540 - h / 2), w, h, (), None, credit), side, gap=0, flex=[1, 1])


# ================= hook
t = W("this is the model")
scene(0, t, col(big(0, "Seedance 2.5", 170), text(0, "ByteDance · now in 4K, plus a cheaper Flash version", 36),
                hrow(pill(W("up to 4k"), "4K", "acc"), pill(W("flash version"), "Flash"), gap=18), gap=20),
      None, "AI video · November 2026")
t2 = W("so in this video")
scene(t, t2, clip(t, t2, "x/seed_film.mp4", 34, "ByteDance Seed · “The Missing Pair”, made with Seedance 2.5",
                  caps=[(t + .3, "30 seconds · video and sound · one generation", "acc")]))
t = P["p02"]
scene(t2, t, col(hrow(pill(W("what it can"), "What it can do"), pill(W("the real tests"), "Real tests"), pill(W("where it breaks"), "Where it breaks", "bad"), gap=18),
                 hrow(pill(W("how it ranks"), "vs Google · Kling · Wan"), pill(W("one clip really"), "Cost per clip", "acc"), gap=18), gap=22),
      "In this video", "Seedance 2.5")

# ================= background
t2 = W("then cdance")
_CALLS.pop()
scene(t, t2, timeline([(W("came out in february"), "Feb 12", "Seedance 2.0 goes viral", ""),
                       (W("disney"), "Feb 13–20", "Disney, Paramount, MPA legal letters", "bad")],
                      "The MPA said 2.0 used US copyrighted works “on a massive scale”."),
      "First, Seedance 2.0", "Background", "Axios · TechCrunch · Variety, Feb 2026")
t = W("and cdance 25 flash")
scene(t2, t, clip(t2, t, "x/x_bp_4k.mp4", 1, "@BytePlusGlobal on X, Nov 17, 2026",
                  caps=[(W("launched on july"), "Jul 31: Seedance 2.5 (Dreamina, Jimeng, Doubao)", ""),
                        (W("a 4k version"), "Nov 17: 4K API opens, after a 20-studio trial", "acc")]))
t2 = P["p03"]
scene(t, t2, clip(t, t2, "x/x_flash.mp4", 0, "@dreamina_ai on X, Nov 15, 2026", caps=[(t + .2, "Nov 15: Seedance 2.5 Flash · faster, cheaper", "acc")]))

# ================= specs
t = W("and you can feed")
scene(t2, t, clip(t2, t, "x/seed_demo1.mp4", 4, "ByteDance Seed demo · one continuous generation",
                  caps=[(W("the big one"), "Up to 30 s in one generation (2.0: 15 s)", "acc"), (W("video and audio"), "Dialogue with lip sync · sound effects · ambience", "")]))
t2 = P["p04"]
scene(t, t2, row(hshot(t + .1, "seed_blog", BLOG, (.52, .04, .97, .068), 820, [(W("up to 30 images"), .0, .45, 1.0, 1.0)]),
                 col(stat(W("up to 30 images"), "References per generation", "50", "30 images · 10 videos · 10 audio", "hero", None, 50, vs=120),
                     text(W("10 audio clips"), "Seedance 2.0 allowed 12 in total.", 32, tone="ink3"), gap=18), gap=48, flex=[0, 1]),
      "Feed it a lot of references", "What's new", BS)
t = P["p05"]
scene(t2, t, clip(t2, t, "x/seed_demo6.mp4", 0, "ByteDance Seed demo · camera edit on an existing shot",
                  caps=[(t2 + .3, "480p → 4K · six aspect ratios · extend for minutes", ""), (W("edit at the timestamp"), "Timestamp edits · camera angle · green screen", ""),
                        (W("the 4k tier"), "4K tier: 10-bit color · cheap 480p drafts", "acc")]))

# ================= tips
t2 = W("and early testers")
scene(t, t2, row(hshot(t + .1, "byteplus_4k", "byteplus.com/en/blog/seedance 2.5", (.26, .03, .70, .09), 760),
                 col(text(W("fine text"), "4K keeps fine text from references sharp:", 34, tone=""), item(W("posters"), "posters · packaging · labels", "hd acc", "font-size:46px"),
                     text(W("big deal for ads"), "That matters for ads.", 32, tone="ink3"), gap=14), gap=48, flex=[0, 1]),
      "The 4K tier", "What's new", "BytePlus blog, Oct 27, 2026")
t = P["p06"]
scene(t2, t, col(text(t2 + .2, "2.5 follows instructions more strictly than 2.0, so vague prompts do worse.", 36, tone=""),
                 hrow(stat(W("who is in"), "Say", "Who", "is in the shot", "", vs=72), stat(W("where they are"), "Say", "Where", "they are", "", vs=72),
                      stat(W("what the camera"), "Say", "Camera", "what it does", "", vs=72), stat(W("what we hear"), "Say", "Sound", "what we hear", "hero", vs=72), gap=18), gap=30),
      "Prompt tip: be specific", "Early testers", "Jiemian, early tester reports")

# ================= official demos
t2 = P["p07"]
scene(t, t2, clip(t, t2, "x/seed_film.mp4", 60, "ByteDance Seed · “The Missing Pair” (4-min short film)",
                  caps=[(W("the missing pair"), "“The Missing Pair”: made end to end with Seedance 2.5", ""), (W("but remember"), "Their own showcase, so the best case", "bad")]))
t = W("this one turns")
scene(t2, t, clip(t2, t, "x/seed_demo5.mp4", 0, "ByteDance Seed demo · green-screen edit",
                  caps=[(W("green screen clip"), "Green-screen training → real defenders → a goal", "")]))
t2 = W("and this concert")
scene(t, t2, clip(t, t2, "x/seed_demo8.mp4", 1, "ByteDance Seed demo · grey 3D model as reference", caps=[(t + .2, "Grey 3D model → photoreal car", "")]))
t = P["p08"]
scene(t2, t, clip(t2, t, "x/seed_demo3.mp4", 12, "ByteDance Seed demo · references for every performer",
                  caps=[(t2 + .3, "A whole orchestra and choir, consistent in one shot", "acc")]))

# ================= creators
t2 = W("another made")
scene(t, t2, clip(t, t2, "x/x_14shots.mp4", 0, "@AIFrontliner on X", caps=[(W("14 different"), "14 shots in one generation · synced dialogue · a fight", "acc")]))
t = W("16 more")
scene(t2, t, clip(t2, t, "x/x_diner.mp4", 0, "@techhalla on X", caps=[(t2 + .2, "1950s diner: time freezes, then rewinds", "")]))
t2 = W("and this one is")
scene(t, t2, clip(t, t2, "x/x_venture.mp4", 0, "Justine Moore (@venturetwins) on X, a16z", caps=[(t + .2, "Her own face and voice, cloned from references", "acc")]))
t = P["p09"]
scene(t2, t, clip(t2, t, "x/x_f1jet.mp4", 2, "@Strength04_X on X", caps=[(t2 + .2, "A whole commercial: F1 car vs fighter jet", "")]))

# ================= Kling 4.0 test
t2 = W("cling got a two")
scene(t, t2, clip(t, t2, "yt/yt_youri_breakfast.mp4", 4, "Youri van Hofwegen on YouTube, “Kling 4.0 vs Seedance 2.5” · six prompts",
                  caps=[(W("a guy making"), "Round 1: a man making breakfast", ""), (W("got a four"), "Seedance 2.5: 4/5 · one egg cracked, two came out", "acc")]))
t = P["p10"]
scene(t2, t, clip(t2, t, "yt/yt_youri_breakfast.mp4", 66, "Youri van Hofwegen on YouTube",
                  caps=[(t2 + .1, "Kling 4.0: 2/5", "bad"), (W("next to the burner"), "Pot beside the burner · toast never toasted · plastic look", "")]))
t2 = P["p11"]
scene(t, t2, clip(t, t2, "yt/yt_youri_end.mp4", 40, "Youri van Hofwegen on YouTube",
                  caps=[(t + .2, "Final: Seedance 5 rounds, Kling 1 · avg 3.5 vs 2.7", "acc"), (W("cling looked better"), "Kling: better animation, about half the price", ""),
                        (W("so his advice"), "Realistic people → Seedance · anime, bulk → Kling", "")]))

# ================= Curious Refuge
t = W("in another test")
scene(t2, t, clip(t2, t, "yt/yt_cur_lantern.mp4", 4, "Curious Refuge on YouTube, “Seedance 2.5 Is Incredible... Until It Isn't”",
                  caps=[(W("reference photos"), "Built from reference photos of an antique shop", ""), (W("out of nowhere"), "…and then he turns into Green Lantern", "bad")]))
t2 = W("their conclusion")
scene(t, t2, clip(t, t2, "yt/yt_cur_v20.mp4", 0, "Curious Refuge on YouTube", caps=[(t + .2, "This test: Seedance 2.0 did better than 2.5", "bad")]))
t = P["p12"]
scene(t2, t, clip(t2, t, "yt/yt_cur_shots.mp4", 20, "Curious Refuge on YouTube",
                  caps=[(t2 + .3, "Best physics and emotion on the market…", "acc"), (W("none of their"), "…but no 30 s clip usable as it came out", "bad")]))

# ================= failures
t2 = W("one creator tried")
scene(t, t2, vbox(t, t2, "x/x_fail_dogfight.mp4", 0, 600, 750, "@PromptSin on X · Kling 4.0 (top) vs Seedance 2.5",
                  col(item(t + .2, "Dogfight test", "hd", "font-size:56px"), text(W("bullets come"), "Tracers come out of nowhere, and both planes vanish.", 36, tone=""), gap=18)))
t = W("and another tried")
scene(t2, t, clip(t2, t, "x/x_fail_faceswap.mp4", 0, "@johnmccoyx on X", caps=[(t2 + .2, "Face swap: Seedance 2.5 $3.61 vs Kling 4.0 $0.26", ""), (W("failed twice"), "Seedance failed twice", "bad")]))
t2 = W("itself says")
scene(t, t2, clip(t, t2, "x/x_fail_tattoo.mp4", 4, "@AIWarper on X", caps=[(t + .2, "Edit: remove the hand tattoos… they never went away", "bad")]))
t = P["p13"]
scene(t2, t, col(quote(t2 + .1, "room for improvement in the physics of complex motion and in interactions between several subjects", "ByteDance Seed", "Seedance 2.5 launch blog (paraphrased)"), gap=0),
      "Their own words", "Limitations", BS)

# ================= benchmarks
t2 = W("for imagetovideo")
scene(t, t2, hshot(t + .1, "aa_t2v", "artificialanalysis.ai/video/leaderboard/text-to-video", (.15, .075, .80, .32), 850,
                   [(W("number 5"), .0, .30, 1.0, .355), (W("wan 30"), .0, .07, 1.0, .12), (W("gemini omni flash"), .0, .355, 1.0, .41)]),
      "Text to video, with audio: #5", "Artificial Analysis · blind votes", "artificialanalysis.ai, Nov 25, 2026")
t = P["p14"]
scene(t2, t, hshot(t2 + .1, "aa_i2v", "artificialanalysis.ai/video/leaderboard/image-to-video", (.15, .08, .80, .33), 810,
                   [(W("number 2"), .0, .068, 1.0, .12)]),
      "Image to video, with audio: #2", "Artificial Analysis · blind votes", "artificialanalysis.ai, Nov 25, 2026")
t2 = W("and the new flash")
scene(t, t2, bars(t + .1, [(t + .2, "Gemini Omni 1.2 Flash", 1540, False, None, "#1"), (t + .4, "Grok Imagine 1.5", 1488, False, None, "#4"),
                           (W("one spot below"), "Seedance 2.0", 1483, False, None, "#5"), (W("one spot below") + .4, "Seedance 2.5 (720p)", 1479, True, None, "#6"),
                           (t + .6, "Sora 2 Pro", 1367, False, None, "#13"), (t + .8, "Veo 3.1", 1363, False, None, "#14")], 1600, 0, label_w=420, val_w=200, h=40, gap=10,
                      note="LMArena text-to-video Elo, Nov 8, 2026"),
      "LMArena: 2.5 sits below 2.0", "Benchmarks", "arena.ai text-to-video leaderboard")
t = P["p15"]
scene(t2, t, clip(t2, t, "yt/yt_js_film.mp4", 12, "JSFILMZ on YouTube, “Seedance 2.5 Flash vs Seedance 2.5”",
                  caps=[(t2 + .2, "Flash: #17 text-to-video · #7 image-to-video", ""), (W("mix and match"), "Flash vs full: “mix and match”, a tie on multi-scene", "acc")]))
t2 = P["p16"]
scene(t, t2, row(tw(t + .1, "omni", 600, .45),
                 col(hrow(stat(W("35"), "Seedance 2.5", "~$3.50", "his clip", "", None, vs=84), stat(W("about 1"), "Gemini Omni 1.2", "~$1", "same prompt", "hero", None, vs=84), gap=16),
                     item(W("three times better"), "Does it look <b class='acc'>3× better</b>?", "hd", "font-size:48px"), gap=20), gap=48, flex=[0, 1]),
      "Against Google's Gemini Omni", "Comparison", "@maxxmalist on X")

# ================= cost
t = P["p17"]
scene(t2, t, row(hshot(t2 + .1, "fal", "fal.ai/models/bytedance/seedance-2.5/text-to-video", (.33, .108, .72, .126), 720),
                 col(bars(W("a second at"), [(W("a second at"), "480p", .22, False, None, None), (W("047"), "720p", .473, False, None, None),
                                         (W("116 at 1080p"), "1080p", 1.164, False, None, None), (W("184 at 4k"), "4K", 1.84, True, None, None),
                                         (W("flash is around"), "Flash", .15, False, None, None)], 2.0, 2, label_w=130, val_w=170, h=38, gap=10, note="US$ per second of video (fal)"),
                     text(W("10 second clip in 4k"), "10 s in 4K ≈ <b class='acc'>$18.40</b>", 36, tone=""), gap=14), gap=40, flex=[0, 1]),
      "Cost per second", "Cost", "fal.ai · Artificial Analysis (Flash)")
t2 = P["p18"]
scene(t, t2, col(bars(t + .2, [(t + .2, "Seedance 2.5 · 1080p", 11.64, True, None, None), (W("vio 31"), "Veo 3.1", 4.0, False, None, None),
                               (W("cling 30 pro"), "Kling 3.0 Pro · 1080p", 1.68, False, None, None), (W("runways"), "Runway Gen-4.5", 1.2, False, None, None),
                               (W("viofast"), "Veo 3.1 Fast", 1.2, False, None, None), (W("starts at just"), "Gemini Omni 1.2 Flash", .7, False, None, None)], 12, 2,
                      label_w=420, val_w=150, h=38, gap=10, note="US$ per 10-second clip"),
                 verdict(W("sora isnt"), "SORA API: SHUT DOWN SEPT 24", "bad", 26), gap=16),
      "A 10-second clip, compared", "Cost", "fal · Artificial Analysis · Google · Runway · OpenAI docs")
t = P["p19"]
scene(t2, t, row(hshot(t2 + .1, "dreamina_price", "dreamina.capcut.com/seedance/seedance-price", (.13, .17, .86, .52), 900),
                 col(stat(W("37 credits"), "Seedance 2.5 · 720p", "37", "credits per second (2.0: 17)", "hero", None, 37, vs=96),
                     stat(W("first month"), "US first month", "$0.29", "1,575 credits ≈ 42 s of 2.5", "", None, vs=84), gap=16), gap=40, flex=[0, 1]),
      "In Dreamina", "Cost", "dreamina.capcut.com")

# ================= safety
t2 = P["p20"]
scene(t, t2, col(check_row(W("visible watermarks"), "Visible watermark + C2PA content credentials", "ON", "good"),
                 check_row(W("real peoples faces"), "Limits on real people's faces · likeness checks", "ON", "good"),
                 check_row(W("virtual humans"), "10,000+ licensed virtual humans", "LIBRARY", "good"),
                 check_row(W("united states"), "Official BytePlus API in the US", "NOT AVAILABLE", "warn", "fal, Runway and others still offer it"), gap=12),
      "After the Hollywood trouble", "Safety", "BytePlus blog, Aug 6, 2026")

# ================= verdict
t = P["p21"]
card = lambda t0, head_, rows_, tone: item(t0, f'<div class="slab">{head_}</div>' +
                                          "".join(f'<div class="hd" style="font-size:36px;margin-top:14px">{r}</div>' for r in rows_), f"stat {tone}", "flex:1")
scene(t2, t, hrow(card(W("films or ads"), "Use it for", ["Realistic people", "Talking scenes", "Same character, many shots", "Reference-heavy shots"], "hero"),
                  card(W("but if you make"), "Skip it for", ["Anime", "Lots of clips on a budget", "Heavy physics"], ""), gap=28),
      "Who is it for?", "Verdict")
t2 = W("let me know")
scene(t, t2, hrow(stat(W("stunning"), "When it works", "Stunning", "30 s with sound", "hero", vs=76), stat(W("expensive"), "Cost", "High", "~7× Kling at 1080p", "", vs=76),
                  stat(W("messes up"), "Reliability", "Retries", "budget for them", "", vs=76), gap=18), "My take", "Seedance 2.5")
t = W("if you enjoyed")
scene(t2, t, col(item(t2 + .1, "Which video model are you using?", "hd", "font-size:80px;text-align:center"),
                 text(t2 + .6, "Tell me in the comments.", 40, "center", "ink3"), gap=30), push=False)
scene(t, END, col(item(t, '<img src="assets/img/aiequator_k.png" alt="" style="width:300px;height:300px;display:block;margin:0 auto">', ""),
                  text(t, "Subscribe for more AI news", 32, "center", "ink3"), gap=30), push=False, last=True)
