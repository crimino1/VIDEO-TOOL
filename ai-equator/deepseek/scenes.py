"""DeepSeek V5: what's real, what's rumor. On-screen facts come from the sources, never from the transcript."""
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
            return _W[i]["t"]
        k = _S.find(p, k + 1)
    raise KeyError(phrase)


DS, DSI, HW, NV = "assets/raw/logos/deepseek_logo.png", "assets/raw/logos/deepseek_icon.png", "assets/raw/logos/huawei.png", "assets/raw/logos/nvidia_logo.png"
OA = "assets/img/openai_k.png"
SPEC = "deepseek-harness · packages/llm/llm-deepseek-account/tests/provider.spec.ts"
REPO = "github.com/deepseek-ai/deepseek-harness"

# ---------------- cold open
t1 = W("three model names")
scene(0, t1, row(shot(0, "gh_repo", REPO, (.08, .0, .72, .62), 900, t1),
                 col(logo(0, DS, 64), text(0, "The next big model leaked from DeepSeek's own code on GitHub.", 42, tone=""),
                     text(W("it didn't come"), "Not a stage. Not a blog post. Not a launch event.", 34), gap=26), gap=56, flex=[0, 1]),
      None, None, "github.com/deepseek-ai/deepseek-harness")
t2 = W("within hours")
scene(t1, t2, col(code(t1 + .2, ["    { ...PRO, id: 'deepseek-v5' },", "    { ...PRO, id: 'deepseek-v5-open', ...requires('0.0.1') },",
                                  "    { ...PRO, id: 'deepseek-v5-next', ...requires('99.0.0-alpha.1') },"], SPEC,
                       {159: ("acc", W("three model names") + .9), 160: ("acc", W("next open")), 161: ("acc", W("next open") + 1.4)}, start=159, size=30), gap=0),
      "Three model names", "The leak", f"{REPO} (commit 074889e)")
t3 = W("so today i'm breaking")
scene(t2, t3, row(tw(t2, "glitch", 520, .55),
                  col(*[check_row(t, c, "CLAIM", "warn") for c, t in [("“V5 beats GPT-6 Astra”", W("v5 beats")), ("“V5 drops in November”", W("v5 drops")),
                                                                     ("“2 trillion parameters”", W("2 trillion")), ("“trained fully on Chinese chips”", W("2 trillion") + .9)]], gap=16),
                  gap=56, flex=[0, 1]),
      "Within hours, X went crazy", "The hype", "@glitch_catAI on X, Sep 26, 2026")
t4 = W("it isn't about")
scene(t3, t4, hrow(*[col(verdict(t, lab, tone, 60), text(t + .2, sub, 40, tone=""), gap=20, align="flex-start") for lab, tone, sub, t in
                     [("REAL", "good", "What's real?", W("what's real")), ("RUMOR", "warn", "What's a rumor?", W("what's a rumor")), ("MADE UP", "bad", "What's made up?", W("and what's someone"))]], gap=60),
      "Every DeepSeek V5 leak, checked", "Today", None)
t5 = W("first why does")
scene(t4, t5, col(item(t4 + .2, f'<div style="display:flex;justify-content:center;align-items:center;gap:90px"><img src="{NV}" alt="" style="height:110px"><div class="hd ink3" style="font-size:44px">vs</div><img src="{HW}" alt="" style="height:96px"></div>', ""),
                  text(W("and who controls"), f"The real story: {B}who controls the future of AI chips{E}", 48, "center", tone=""), gap=46),
      None, None, None)

# ---------------- why one name moves markets
t6 = W("in a single day")
scene(t5, t6, row(logo(t5 + .2, DSI, 220),
                  col(stat(W("deepseek drops r1"), "Jan 20, 2025", "DeepSeek-R1", "reasoning model, close to the best US models at a fraction of the cost", "hero", DSI, vs=84), gap=0), gap=64, flex=[0, 1]),
      "Go back to January 2025", "Why it matters", "DeepSeek API change log")
t7 = W("and 2026 has been")
scene(t6, t7, row(shot(t6, "n_statista", "statista.com · Jan 28, 2025", (.26, .43, .73, .78), 760, t7),
                  col(stat(t6 + .4, "Nvidia market value, Jan 27, 2025", "−$589B", "in one day: the biggest one-day loss in US history at the time", "bad", NV, vs=96),
                      text(W("since then"), "Since then, every time “DeepSeek” trends, markets get nervous.", 34, tone=""), gap=24), gap=56, flex=[0, 1]),
      "One model from a lab in Hangzhou", "Why it matters", "Statista · Bloomberg ($589B)")
t8 = W("that's a 552")
scene(t7, t8, col(timeline([(W("v4 launched"), "Apr 24", "V4 Preview · 1.6T total, 49B active", ""), (W("v4 pro went"), "Aug 13", "V4 Pro fully public", ""),
                            (W("then on september 10"), "Sep 10", "V4.1 Flash", "on")]),
                  text(W("and 2026 has been") + .5, "All open weights.", 34, tone="ink3"), gap=30),
      "2026 has been busy", "DeepSeek this year", "DeepSeek API news · @deepseek_ai on X")
t9 = W("the price")
scene(t8, t9, row(tw(t8, "v41flash", 520, .62),
                  col(hrow(stat(t8 + .2, "Mixture of experts", "552B", "total parameters", "", DSI, vs=84),
                           stat(W("but only about 8"), "Active", "8B / 16B", "reading input / writing output", "hero", vs=84), gap=20),
                      hrow(stat(W("it's natively"), "Context", "1M", "tokens, native image input", "", vs=84),
                           stat(W("under the mit"), "Open weights", "MIT", "anyone can download and run it", "", vs=84), gap=20), gap=20),
                  gap=56, flex=[0, 1]),
      "DeepSeek V4.1 Flash", "DeepSeek this year", "@deepseek_ai on X · Hugging Face model card")
t10 = W("then on october 17")
scene(t9, t10, row(shot(t9, "ds_pricing", "api-docs.deepseek.com · pricing", (.0, .18, .62, .98), 700, t10),
                   col(hrow(stat(W("15 cents"), "Input, off-peak", "$0.15", "per million tokens", "hero", vs=96), stat(W("15 cents") + .9, "Output, off-peak", "$0.60", "per million tokens", "", vs=96), gap=20),
                       fix(W("15 cents") + 2.0, "Both are off-peak prices. Peak: $0.30 input, $1.20 output."), gap=22), gap=56, flex=[0, 1]),
      "The price", "DeepSeek V4.1 Flash", "api-docs.deepseek.com")
t11 = W("and deepseek has publicly")
scene(t10, t11, clip80(t10, t11, "x/grid_1017.mp4", 0.0, "@deepseek_ai on X · V4.1-Flash-1017 demos, Oct 17, 2026",
                       caps=[(t10 + .3, "Oct 17 · DeepSeek-V4.1-Flash-1017", "acc")]))
t12 = W("now leak number one")
scene(t11, t12, row(shot(t11, "ds_news0910", "api-docs.deepseek.com/news · Sep 10, 2026", (.0, .08, .55, .80), 720, t12),
                    col(stat(t11 + .3, "Next model DeepSeek has named", "V4.1 Pro", None, "hero", DSI, vs=96),
                        stat(W("as of today"), "Shipped?", "Not yet", "pricing still lists V4-Pro-0813", "bad", vs=96),
                        text(W("remember that"), "Remember that. It matters later.", 34, tone="ink3"), gap=20), gap=56, flex=[0, 1]),
      None, None, "DeepSeek API news, Sep 10, 2026")

# ---------------- leak 1: the code
t13 = W("in those test files")
scene(t12, t13, row(col(verdict(t12 + .2, "LEAK #1", ""), head(W("the code"), "The code", 72),
                        text(W("inside it are test files"), "Test files that check which models show up in the app, and when the app needs an update.", 36, tone=""), gap=20),
                    shot(W("deepseek has an open"), "gh_repo", REPO, (.08, .0, .72, .62), 860, t13), gap=56, flex=[1, 0]),
      None, None, "github.com/deepseek-ai/deepseek-harness · public since Aug 13, 2026")
t14 = W("then it exploded")
scene(t13, t14, col(code(t13 + .2, ["  const server = await listing(json({ data: [", "    FLASH,", "    { ...PRO, id: 'deepseek-v5' },",
                                    "    { ...PRO, id: 'deepseek-v5-open', ...requires('0.0.1') },", "    { ...PRO, id: 'deepseek-v5-next', ...requires('99.0.0-alpha.1') },",
                                    "    { id: 'deepseek-v4-pro' },"], SPEC, {159: ("acc", W("someone spotted")), 160: ("acc", W("v5 open")), 161: ("acc", W("v5 next"))}, start=157, size=26),
                    hrow(stat(W("the names were reportedly"), "Added", "Sep 24", "commit 0a13e89, by a DeepSeek engineer", "", vs=64),
                         stat(W("but nobody noticed"), "Noticed", "Oct 27–28", "then it exploded", "hero", vs=64), gap=20), gap=24),
      "Three names in the test files", "Leak #1", f"{REPO} · commits 0a13e89 and 7755d97 (Sep 24, 2026)")
t15 = W("so is this real")
scene(t14, t15, row(tw(t14, "viral", 520, .62),
                    col(shot(W("a chinese tech site"), "n_kuaikeji", "news.mydrivers.com · Oct 28, 2026", (.0, .24, .66, .80), 640),
                        quote(W("a chinese tech site") + .6, "本月应该没戏，要到11月份了 · October is unlikely, it will be November", "快科技 (Kuai Keji)", "guessing V5 Pro and V5 Flash in mid-November"), gap=20),
                    gap=48, flex=[0, 1]),
      None, None, "@0x0SojalSec on X, Oct 28 · 快科技 (mydrivers.com)")
t16 = W("but look at what")
scene(t15, t16, col(verdict(W("the names are real"), "REAL", "good"), item(W("the names are real"), "The names are real.", "hd", "font-size:84px"),
                    text(W("they're in deepseek's"), "They're in DeepSeek's official repo. Nobody faked that.", 44, tone=""), gap=22),
      "So, is this real?", "Leak #1", REPO)
t17 = W("in two of the tests")
scene(t16, t17, col(code(t16 + .2, ["    { ...PRO, id: 'deepseek-v5' },", "    { ...PRO, id: 'deepseek-v5-open', ...requires('0.0.1') },",
                                    "    { ...PRO, id: 'deepseek-v5-next', ...requires('99.0.0-alpha.1') },", "    { id: 'deepseek-v4-pro' },", "  ] }))", "  …",
                                    "  expect(…listModels(…)).toEqual(['deepseek-flash', 'deepseek-v5-open'])", "  await expect(…'deepseek-v5' …).rejects.toMatchObject({ code: 'MODEL_UNSUPPORTED' })",
                                    "  …", "    .rejects.toMatchObject({ code: 'CLIENT_UPGRADE_REQUIRED', …99.0.0-alpha.1 })"], SPEC,
                         {160: ("acc", W("deepseek-v5-open is a test")), 165: ("acc", W("next to flash")), 159: ("bad", W("plain deepseek")), 166: ("bad", W("plain deepseek") + .6),
                          161: ("warn", W("and deepseek-v5 next requires")), 168: ("warn", W("version 99"))}, start=159, size=24),
                    fix(W("that version doesn't exist"), "Plain deepseek-v5 is refused because it declares no minimum version. Give it requires('0.0.1') and it's accepted. The real Harness is version 0.2.x."), gap=20),
      "What the tests actually do", "Leak #1", f"{SPEC} L159–171 (excerpted)")
t18 = W("so these are placeholders")
scene(t17, t18, row(code(t17 + .2, ["  modelOverrides: { …, 'deepseek-v5': { contextWindow: 9 } }", "  …",
                                    "  …resolveModelInfo(…, 'deepseek-v5')", "    .resolves.toMatchObject({ context: { contextWindow: 9 } })"], SPEC,
                         {186: ("warn", W("context window is set")), 189: ("warn", W("context window is set") + .8)}, start=186, size=22, w=1000),
                    col(big(W("nine not nine million"), "9", 220, "bad", "center"), text(W("nine not nine million"), "tokens. Not 9 million. Not 9,000.", 34, "center", tone=""), gap=0),
                    gap=48, flex=[0, 1]),
      "The context window: 9 tokens", "Leak #1", f"{SPEC} L186, L195 (excerpted) · also listed-catalog.spec.ts L167")
t19 = W("that said")
scene(t18, t19, col(item(t18 + .2, "Placeholders: dummy names to test the plumbing", "hd", "font-size:56px"),
                    hrow(verdict(W("there are no specs"), "NO SPECS", "bad"), verdict(W("no benchmarks"), "NO BENCHMARKS", "bad"), verdict(W("and no release date"), "NO RELEASE DATE", "bad"), gap=22), gap=40),
      None, None, REPO)
t20 = W("leak number two")
scene(t19, t20, col(check_row(W("out of every possible"), "A DeepSeek engineer typed “V5”: they're thinking about it", "FAIR", "good"),
                    check_row(W("and it's launching"), "“V5 launches in November”", "NOT IN THE CODE", "bad"), gap=22),
      "One point to the hype crowd", "Leak #1", None)

# ---------------- leak 2: the viral post
t21 = W("and the proof")
scene(t20, t21, row(col(verdict(t20 + .2, "LEAK #2", ""), tw(W("on september 26th"), "glitch", 520, .55), gap=18),
                    col(*[check_row(t, c, "CLAIM", "warn") for c, t in [("Imminent V5 launch", W("deepseek is preparing")), ("Liang Wenfeng: “biggest bet”", W("founder liang")),
                                                                      ("About 2 trillion parameters", W("it has about")), ("Trained fully on Huawei Ascend", W("it's the first deepseek")),
                                                                      ("Beats Astra", W("and it beats"))]], gap=12),
                    gap=48, flex=[0, 1]),
      None, None, "@glitch_catAI on X, Sep 26, 2026 · 846K views")
t22 = W("so let's go through")
scene(t21, t22, row(chart(t21 + .2, "assets/raw/web/p_glitch.jpg", 820, None, t22, "The image attached to the post"),
                    col(*[verdict(t, lab, "bad") for lab, t in [("NO CHART", W("no chart")), ("NO TABLE", W("no table")), ("NO SCORE", W("no score"))]], gap=18, align="flex-start"),
                    gap=60, flex=[0, 1]),
      "The proof: a logo", "Leak #2", "@glitch_catAI on X")
t23 = W("biggest bet")
scene(t22, t23, col(check_row(W("beats gpt-6 astra"), "“Beats Astra”", "NO SOURCE", "bad", "no benchmark, no number"),
                    check_row(W("imminent launch"), "“Imminent launch”", "CONTRADICTED", "bad", "later reporting points to 2027"),
                    fix(W("beats gpt-6 astra") + 1.0, "The post's headline says “Beats Astra”. It never names GPT-6 or gives a benchmark."), gap=18),
      "Let's go through it", "Leak #2", "@glitch_catAI on X")
t24 = W("two trillion parameters")
scene(t23, t24, row(tw(t23, "theinfo", 600, .40),
                    col(check_row(W("liang reportedly"), "“Biggest bet”", "OUT OF CONTEXT", "warn"),
                        quote(W("but according to"), "training AI models on Huawei chips is one of the company's biggest bets and “has to work”", "The Information", "Sep 21, 2026: about Huawei chips, not V5"), gap=18),
                    gap=48, flex=[0, 1]),
      None, None, "@theinformation on X, Sep 21, 2026")
t25 = W("so the post took")
scene(t24, t25, row(shot(t24, "n_36kr8t", "eu.36kr.com · Sep 23, 2026", (.0, .30, .55, .80), 700, t25),
                    col(check_row(W("the information did report"), "“2 trillion parameters”", "NOT TIED TO V5", "warn", "The Standard: the market reads 2T as V4.1 Pro"),
                        check_row(W("36k also reported"), "“8 trillion parameters”", "FUTURE GOAL", "warn", "Liang at an investor meeting (36Kr)"), gap=18),
                    gap=48, flex=[0, 1]),
      "The parameter counts", "Leak #2", "The Information via The Standard · 36Kr")
t26 = W("now here's the part")
src_chips = [("Huawei-chip reporting", W("real reporting about chips")), ("2T, 8T parameter counts", W("and parameter counts")), ("a model name: V5", W("glued it onto"))]
scene(t25, t26, row(col(*[item(t, s, "pill") for s, t in src_chips], gap=16, align="flex-start"),
                    item(W("glued it onto"), '<div class="hd ink3" style="font-size:72px">→</div>', ""),
                    col(stat(W("and added a fake"), "The viral post", "“V5 beats Astra”", "+ a benchmark claim with no benchmark", "bad", vs=64),
                        text(W("classic leak culture"), "Classic leak culture.", 40, tone=""), gap=20), gap=40, flex=[0, 0, 1]),
      "How a leak gets built", "Leak #2", None)

# ---------------- the real news
t27 = W("it says v5 training")
scene(t26, t27, row(shot(W("on november 3rd"), "n_caiwen", "tech.ifeng.com · Caiwen (财闻), Nov 3, 2026", (.12, .02, .70, .52), 760, t27),
                    col(verdict(t26 + .2, "THE REAL NEWS", "good"),
                        stat(W("on november 3rd"), "Nov 3 · Caiwen + Star Market Daily", "Huawei Ascend", "V5 to be pre-trained on it, citing the chip supply chain", "hero", HW, vs=72),
                        text(W("kai wen goes further"), f"Caiwen names the chip: {B}Ascend 950{E}.", 38, tone=""), gap=20), gap=48, flex=[0, 1]),
      None, None, "Caiwen (via ifeng.com) · Star Market Daily · TechNode, Nov 4")
t28 = W("but look at all the signals")
scene(t27, t28, col(check_row(t27 + .1, "V5 training", "STILL IN SELECTION", "warn"),
                    check_row(W("that the parameters"), "Parameters, features, date", "INTERNAL SECRETS", "warn"),
                    item(W("so 2027"), f'<span class="mono ink3" style="font-size:26px">LIKELY RELEASE</span><br><b class="acc">2027</b>, first or second half', "hd", "font-size:60px"),
                    check_row(W("neither deepseek"), "Confirmed by DeepSeek or Huawei?", "NO · REPORTED PLAN", "warn"), gap=16),
      "What Caiwen reported", "The real news", "Caiwen (财闻), Nov 3, 2026")
t29 = W("the information reported that liang")
scene(t28, t29, clip80(t28, t29, "x/yt_ascend950.mp4", 52.0, "Huawei Ascend 950 SuperPoD at WAIC 2026 (CN.科技发布会 on YouTube)",
                       caps=[(W("in september bloomberg"), "Bloomberg, Sep 4: at least 160,000 Ascend 950DT chips", ""), (W("at a site"), "for a site in Inner Mongolia (Ulanqab)", ""),
                             (W("one source said"), "one source: not currently planned for training", "acc")]))
t30 = W("deepseek has also been porting")
scene(t29, t30, row(quote(t29 + .2, "training on Huawei chips “has to work”", "Liang Wenfeng, per The Information", "Sep 21, 2026"),
                    col(stat(W("and in mid-october"), "The Information, mid-October", "End of 2026", "pre-training on Ascend 950DT could start as early as then", "hero", HW, vs=84),
                        text(W("with huawei engineers"), "Huawei engineers reportedly work inside DeepSeek's offices.", 34, tone=""), gap=20), gap=48),
      "The signals all point one way", "The real news", "The Information (paywalled; via AI Weekly summary)")
t31 = W("right now no top")
scene(t30, t31, row(shot(t30, "gh_flashmla", "github.com/deepseek-ai/FlashMLA", (.0, .0, .62, .62), 720, t31),
                    col(stat(W("their flash mla"), "FlashMLA on Ascend 950 · prefill", "410 TFLOPS", "95% of the chip's peak", "hero", HW, vs=96),
                        stat(W("that's about 95"), "Decode", "360 TFLOPS", "83% of peak", "", vs=64), gap=20), gap=56, flex=[0, 1]),
      "DeepSeek's own code, ported to Ascend", "The real news", "FlashMLA README, Sep 30, 2026")
t32 = W("if v5 gets")
scene(t31, t32, row(col(stat(W("a team did run"), "Post-training", "the finishing step", "V4 Pro: post-trained on 1,000 Ascend 910C chips by a Huawei-led team", "", HW, vs=60),
                        fix(W("a team did run") + 1.2, "That was reported around June 2026, not this autumn."), gap=18),
                    stat(W("pre-training is the giant"), "Pre-training", "the giant part", "months long, most of the cost, where the model learns. Everyone still does it on Nvidia.", "bad", NV, vs=60),
                    gap=32, align="stretch"),
      "Why it's a big deal", "The real news", "Tom's Hardware · SCMP")
t33 = W("and look at the timing")
scene(t32, t33, col(item(t32 + .1, "DeepSeek moment #2?", "hd", "font-size:96px;text-align:center"),
                    text(W("and this one wouldn't"), f"Not about cost this time. About China {B}not needing Nvidia{E}.", 46, "center", tone=""),
                    item(W("and this one wouldn't"), f'<div style="display:flex;justify-content:center;align-items:center;gap:72px"><img src="{DSI}" alt="" style="height:90px"><img src="{HW}" alt="" style="height:70px"></div>', ""), gap=36),
      None, None, None)
t34 = W("so the deepseek on huawei")
scene(t33, t34, row(pic(W("jensen huang is out"), "assets/raw/people/jensen.jpg", 260, 300, "Jensen Huang", "no longer Nvidia CEO"),
                    col(stat(W("this week nvidia"), "Nov 17–18 · earnings call", "No AI chips to China", "“no longer shipping licensed Hopper data center products”", "bad", NV, vs=56),
                        stat(W("jensen huang is out"), "Nov 11 · SEC filing", "Interim CEO: Colette Kress", None, "", NV, vs=56),
                        stat(W("washington is tightening"), "Nov 16 · Commerce Dept.", "Tighter chip rules", "closing the remote-access loophole", "", None, vs=56), gap=14),
                    gap=48, flex=[0, 1]),
      "And look at the timing", "The real news", "SEC 8-K (Nov 11) · CNBC, Bloomberg (Nov 18) · Boston Globe/AP (Nov 16) · photo: Anderseidesvik, CC BY-SA 4.0")
t35 = W("so when is v5")
scene(t34, t35, col(item(t34 + .1, "Not a side detail.", "hd", "font-size:72px;text-align:center"),
                    text(W("it might be"), f"Maybe {B}the most important AI hardware story of 2027{E}.", 48, "center", tone=""), gap=24),
      None, None, None)

# ---------------- when is V5 coming
t36 = W("v3 came out")
scene(t35, t36, col(check_row(W("bank of america"), "Bank of America: second half of 2026", "OUTDATED", "warn", "analyst note, September (via 36Kr)"),
                    check_row(W("kuai keji guessed"), "快科技: November 2026", "NOT HAPPENING", "bad", "based on the placeholder code"),
                    check_row(W("taiwan says"), "财闻 (Caiwen): 2027", "LATEST REPORT", "good", "training still being planned"), gap=18),
      "So when is V5 actually coming?", "Timing", "36Kr · 快科技 · Caiwen")
t37 = W("quick scorecard")
scene(t36, t37, col(timeline([(t36 + .1, "Dec 2024", "V3", ""), (W("v4 came out"), "Apr 2026", "V4 · about 16 months later", "on"),
                              (W("v3.1"), "between", "V3.1, V3.2, V4 Pro, V4.1 Flash", ""), (W("and they've already publicly"), "next", "V4.1 Pro", "on")]),
                    text(W("so if you're waiting"), f"Waiting for something soon? The realistic answer is {B}V4.1 Pro{E}, not V5.", 40, tone=""), gap=34),
      "DeepSeek's own history", "Timing", "DeepSeek API change log")

# ---------------- scorecard
rows = [("V5 names in DeepSeek's code", "REAL · PLACEHOLDERS", "good", W("v5 names in")), ("V5 launching in November", "NO EVIDENCE", "bad", W("v5 launching")),
        ("V5 beats GPT-6 Astra", "NO SOURCE", "bad", W("v5 beats gpt-6 astra", 540)), ("2 trillion parameters", "NOT TIED TO V5", "warn", W("two trillion parameters", 540)),
        ("Trained on Huawei Ascend", "REPORTED · UNCONFIRMED", "warn", W("trained on huawei")), ("Open weights", "LIKELY · NOT PROMISED", "warn", W("open weights", 540))]
t38 = W("here's my take")
scene(t37, t38, col(*[check_row(t, c, lab, tone) for c, lab, tone, t in rows], gap=10),
      "The scorecard (screenshot this)", "Verdict", None)
t39 = W("nvidia just lost")
scene(t38, t39, row(col(big(W("the v5 hype"), "90%", 180, "ink3"), text(W("the v5 hype"), "noise: test files and a whale logo", 36, tone=""), gap=6),
                    col(big(W("but the remaining"), "10%", 180, "acc"), text(W("but the remaining"), "huge: pre-training a frontier model on Chinese chips", 36, tone=""), gap=6),
                    gap=72),
      "My take", "Verdict", None)
t40 = W("what do you think")
scene(t39, t40, clip80(t39, t40, "x/yt_bbg_huawei.mp4", 52.0, "Bloomberg Television · Huawei AI chip coverage", crop=(1600, 900, 160, 0),
                       caps=[(t39 + .2, "Nvidia: lost its CEO, pulling back from China", ""), (W("won't be a price"), "the next DeepSeek shock: not a price war", ""),
                             (W("it'll be a chip"), "a chip war", "acc"), (W("but keep watching"), "watch DeepSeek and Huawei closely", "")]))
t41 = W("this has been")
scene(t40, t41, col(item(t40 + .1, f'<div style="display:flex;justify-content:center;align-items:center;gap:64px"><img src="{DSI}" alt="" style="height:120px"><img src="{HW}" alt="" style="height:90px"><div class="hd ink3" style="font-size:44px">without</div><img src="{NV}" alt="" style="height:100px"></div>', ""),
                    item(W("can deepseek build"), "Can DeepSeek build a frontier model without Nvidia?", "hd", "font-size:60px;text-align:center"),
                    text(W("tell me in"), "Tell me in the comments. I'll cover V5 the day it actually lands.", 34, "center", "ink3"), gap=40))
scene(t41, 626.70, col(item(t41, '<img src="assets/img/aiequator_k.png" alt="" style="width:300px;height:300px;display:block;margin:0 auto">', ""),
                       text(t41, "Subscribe for more AI news", 32, "center", "ink3"), gap=30), push=False, last=True)
