"""AI Just Claimed a Proof of the Riemann Hypothesis. On-screen facts come from the sources, never from the transcript."""
import json, re
from lib import *
from mathviz import strip, zcurve, staircase

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


CL, LEAN = "assets/img/claude.png", "assets/raw/logos/lean.png"
NOTE = "alpo.ge/remark.pdf"
P = "assets/raw/people/"

# ---------------- cold open
t1 = W("the first line")
scene(0, t1, row(pic(0, P + "alpoge_c.jpg", 300, 380, "Levent Alpöge", "number theorist, Anthropic"),
                 col(text(0, "Friday, Nov 20, 2026", 30, tone="ink3"),
                     item(0, "A four-page note on his personal website", "hd", "font-size:56px"),
                     shot(0, "remark_p1", NOTE, (.12, .04, .88, .20), 900), gap=20), gap=64, flex=[0, 1]),
      None, None, "alpo.ge · photo: Marlene Ruf (MFO), CC BY-SA 2.0 de")
t2 = W("a problem opened")
scene(t1, t2, col(shot(t1, "remark_p1", NOTE, (.10, .105, .90, .20), 1500, t2), gap=0), "The first line", "The claim", "Levent Alpöge, note, Nov 20, 2026")
t3 = W("and the proof he released")
scene(t2, t3, row(pic(t2, P + "riemann.jpg", 300, 380, "Bernhard Riemann", "1859"),
                  hrow(stat(t2 + .2, "Open since", "1859", "167 years", "", vs=96), stat(W("a million-dollar"), "Clay Millennium Prize", "$1M", None, "hero", vs=96), gap=24),
                  gap=64, flex=[0, 1]),
      "The most famous open problem in math", "The claim", "Clay Mathematics Institute · portrait: public domain")
t4 = W("today i'm breaking")
scene(t3, t4, col(stat(t3 + .1, "The proof he released: Lean code", "17,374,215", "lines, in 175,187 files", "hero", LEAN, 17374215, vs=150), gap=0),
      "Not a paper", "The claim", "Line count: vincitamore/riemann-lean-account")
t5 = W("first 30 seconds")
agenda = [("What was claimed", W("exactly what")), ("What Claude actually did", W("what claude actually")), ("What top mathematicians say", W("what top mathematicians")), ("The twist: a second proof, by a human", W("a second proof"))]
scene(t4, t5, col(*[item(t, f'<span class="mono acc" style="font-size:26px;margin-right:26px">0{i + 1}</span>{s}', "hd", "font-size:52px") for i, (s, t) in enumerate(agenda)], gap=28),
      "Today", "The claim")

# ---------------- why it matters
t6 = W("but in 1859")
scene(t5, t6, row(col(*[item(W("prime numbers") + i * .25, str(p), "pill") for i, p in enumerate([2, 3, 5, 7, 11, 13, 17, 19])], gap=12, align="flex-start"),
                  staircase(W("prime numbers") + .4), gap=64, flex=[0, 1]),
      "Primes look random", "30 seconds on why it matters", "π(x) and Li(x) computed with mpmath")
t7 = W("if it's true")
scene(t6, t7, row(strip(t6 + .2, 760, 660, 10, W("whose zeros"), .3),
                  col(text(t6 + .4, "Riemann's zeta function has zeros that control how primes are spread out.", 36, tone=""),
                      text(W("sit on one"), f"His guess: every important zero sits on {B}one straight line{E}, real part ½.", 40, tone=""),
                      item(W("that guess is"), "That guess is the Riemann Hypothesis.", "hd", "font-size:48px"), gap=24), gap=56, flex=[0, 1]),
      "Riemann's guess", "30 seconds on why it matters", "First 10 nontrivial zeros of ζ(s), computed with mpmath")
t8 = W("so who's claiming")
scene(t7, t8, col(zcurve(t7 + .2, 1640, 380, 4.5),
                  hrow(text(t7 + 1.0, "If true: primes are as well-behaved as they can possibly be.", 32, tone=""),
                       text(W("thousands of theorems"), "Thousands of theorems begin “assume RH”.", 32, tone=""),
                       text(W("thousands of theorems") + 1.2, "Nobody has ever proved it.", 32, tone="bad"), gap=40), gap=30),
      "Every blue tick is a zero", "30 seconds on why it matters", "|ζ(½ + it)| for 0 ≤ t ≤ 52, computed with mpmath")

# ---------------- who and what
t9 = W("here's where it gets weird")
scene(t8, t9, row(pic(t8 + .2, P + "alpoge_c.jpg", 300, 380, "Levent Alpöge", "Member of Technical Staff, Anthropic"),
                  col(stat(W("levent"), "Not a random account on X", "A serious mathematician", "number theorist; PhD Princeton, 2020", "", vs=56),
                      stat(W("and that the same method"), "The same method, he says, proves", "the Generalized Riemann Hypothesis", "a whole family of L-functions, not just ζ", "hero", vs=48), gap=20),
                  gap=56, flex=[0, 1]),
      "Who's claiming it", "The claim", "alpo.ge · Wikipedia")
t10 = W("instead he released")
scene(t9, t10, row(shot(t9 + .2, "remark_p2", NOTE + " · footnote 2", (.10, .80, .90, .87), 900),
                   col(big(W("the result ran past"), "250,000+", 130, "acc"), text(W("the result ran past"), "pages, when Claude wrote it out for humans", 36, tone=""),
                       text(W("nobody can read"), "So he didn't release it.", 40, tone="ink3"), gap=10), gap=56, flex=[0, 1]),
      "Here's where it gets weird", "The claim", "Levent Alpöge, note, footnote 2")
t11 = W("and the timeline")
LEANCODE = ["theorem riemannHypothesis : RiemannHypothesis", "theorem riemannZeta_eq_zero_re :",
            "    ∀ s : ℂ, riemannZeta s = 0 → (¬∃ n : ℕ, s = -2 * ((n : ℂ) + 1))", "      → s ≠ 1 → s.re = 1 / 2"]
scene(t10, t11, col(row(logo(t10 + .2, LEAN, 70), text(W("leen is a programming"), "A language where a computer checks every single logical step.", 36, tone=""), gap=32, flex=[0, 1]),
                    code(W("if the code compiles"), LEANCODE, "Main.lean · the proof's final theorems", {1: ("acc", W("if the code compiles") + .6), 4: ("acc", W("the machine has verified"))}, size=26),
                    hrow(verdict(W("no trust needed"), "NO TRUST NEEDED", "good", 30), text(W("17 million", W("no trust needed")), "17 million lines of it.", 36, tone=""), gap=28), gap=24),
      "The proof is in Lean", "The claim", "Theorem statements as listed by vincitamore/riemann-lean-account")
t12 = W("what did claude contribute")
scene(t11, t12, row(shot(t11 + .2, "remark_p4", NOTE + " · p.4", (.12, .35, .88, .82), 640, t12),
                    col(big(W("final entry"), "41 days", 130, "acc"), text(W("final entry"), "Oct 6 → Nov 16, 2026: entry 20 of the log reads “11/16/26: GRH.”", 34, tone=""),
                        text(W("for a problem open"), "For a problem open for 167 years.", 40, tone=""), gap=14), gap=56, flex=[0, 1]),
      "The timeline: a 20-step log Claude compiled", "The claim", "Levent Alpöge, note, p.3–4")
t13 = W("now look at this timing")
scene(t12, t13, row(shot(t12 + .2, "remark_p3", NOTE + " · p.3", (.10, .20, .90, .36), 620),
                    col(check_row(W("automorphic forms"), "Automorphic forms on higher-rank groups", "CLAUDE", "good", "“I personally have little mastery of…”"),
                        check_row(W("plus a key choice"), "The length of a chain of theta lifts: √X", "CLAUDE", "good", "“Claude's suggested length of chain of theta lifts…”"),
                        quote(W("and says near the end"), "Claude far outpaced me near the finish line.", "Levent Alpöge", "his exact words, p.1", CL, "sm"), gap=12),
                    gap=48, flex=[0, 1]),
      "What Claude contributed", "The claim", "Levent Alpöge, note, p.1–3")

# ---------------- what mathematicians say
t14 = W("five weeks later")
scene(t13, t14, clip80(t13, t14, "x/x_tao_clip.mp4", 3.6, "Numberphile, “No More Heroes”, Oct 15, 2026 (clip via @sinavaziri on X)", crop=(1600, 900, 160, 0),
                       caps=[(t13 + .3, "Oct 15 · Terence Tao on Numberphile", ""), (W("that ai couldn't"), "“couldn't touch it”", "acc"),
                             (W("maybe humans plus"), "“…some combination of humans and AIs in 2050 or something”", "")]))
t15 = W("he did not say")
scene(t14, t15, row(pic(t14 + .2, P + "tao_still.jpg", 300, 350, "Terence Tao", "Fields Medal, 2006"),
                    col(text(t14 + .4, "Five weeks later, on his blog:", 34, tone="ink3"),
                        quote(W("using an internal"), "Levent Alpöge, using an internal AI model, has generated an (enormous) Lean-only proof of the Generalized Riemann Hypothesis.", "Terence Tao", "terrytao.wordpress.com, Nov 20"), gap=18),
                    gap=56, flex=[0, 1]),
      None, None, "terrytao.wordpress.com, Nov 20, 2026 · still: Numberphile")
t16 = W("so is it real")
scene(t15, t16, col(text(t15 + .1, "He did not say it's correct.", 40, tone=""),
                    quote(W("but his first impression"), "…from very initial analysis, appears to use the full power of modern developments on the Langlands program and arithmetic geometry.", "Terence Tao", "Nov 20, 2026"),
                    fix(W("he said that for the middle"), "“For the middle I have only read statements” was a reader's comment on Tao's blog, not Tao himself."), gap=22),
      "Tao's first impression", "What mathematicians say", "terrytao.wordpress.com")
t17 = W("elliot")
scene(t16, t17, row(pic(t16 + .2, P + "sutherland.jpg", 280, 330, "Andrew Sutherland", "MIT"),
                    col(stat(W("compiled the code"), "Compiled: 175,187 modules", "0 errors", "Lean 4.33.1 + Mathlib", "hero", LEAN, vs=72),
                        code(W("rests on the three"), ["#print axioms riemannHypothesis", "  propext, Classical.choice, Quot.sound"], "the only axioms used", {2: ("acc", W("rests on the three") + .5)}, size=26),
                        text(W("a sneaky lean"), "A sneaky proof can hide an extra axiom that says “trust me”. This one doesn't.", 32, tone=""), gap=18),
                    gap=56, flex=[0, 1]),
      "So, is it real?", "What mathematicians say", "math.mit.edu/~drew/grh (Nov 21) · photo: Ken Richardson, CC BY-SA 4.0")
t18 = W("but checks are still")
scene(t17, t18, row(tw(t17, "glazer", 620, .55),
                    col(check_row(W("says the formal statement"), "The formal statement really is GRH", "CONFIRMED", "good"),
                        check_row(W("and puts the odds"), "Chance it's a Lean bug", "≪ 1%", "good"), gap=16), gap=56, flex=[0, 1]),
      None, None, "@ElliotGlazer on X, Nov 20, 2026")
t19 = W("thomas bloom")
scene(t18, t19, row(shot(t18 + .2, "b_sutherland", "math.mit.edu/~drew/grh", (.27, .22, .75, .62), 760, t19),
                    col(text(t18 + .4, "In Lean, the proof can be perfect and the statement still subtly off.", 34, tone=""),
                        fix(W("experts want an independent"), "Most independent replays have already passed: leanchecker, nanoda, lean4lean. Still running: kernel replays of the export and the comparator."), gap=20),
                    gap=48, flex=[0, 1]),
      "Checks still running", "What mathematicians say", "Andrew Sutherland's verification page, updated Nov 21")
t20 = W("now the twist")
scene(t19, t20, row(tw(t19, "bloom", 620),
                    col(item(W("right now no human"), "Right now, no human on Earth understands why it's true.", "hd", "font-size:52px"), gap=0), gap=56, flex=[0, 1]),
      None, None, "@thomasfbloom on X, Nov 20, 2026")

# ---------------- the twist
t21 = W("title")
scene(t20, t21, row(pic(t20 + .2, P + "vakil.jpg", 300, 360, "Ravi Vakil", "president, American Mathematical Society"),
                    col(text(t20 + .5, "The same day, on his Math 216 blog:", 34, tone="ink3"),
                        stat(W("posted a draft"), "“Hurried Announcement”", "Alessandro Masullo: GRH", "a graduate student of Brian Conrad at Stanford", "hero", vs=56), gap=18),
                    gap=56, flex=[0, 1]),
      "Now the twist", "A second proof", "math216.wordpress.com, Nov 20, 2026 · photo: Renate Schmid, CC BY-SA 2.0 de")
t22 = W("and here's the part")
scene(t21, t22, row(shot(t21 + .1, "masullo_p1", "The Music of the Primes · 940-page draft", (.15, .02, .85, .30), 640),
                    col(hrow(stat(W("fully human"), "Written by", "a human", "“It is all human, with no AI.”", "", vs=64), stat(W("around 12 years"), "Work", "~12 years", None, "", vs=64), gap=18),
                        quote(W("and says it's so far"), "so far looking good", "Brian Conrad, per Vakil", "after months of close reading"),
                        fix(W("title") + 1.4, "The draft's title is just “The Music of the Primes”. There's no “proposed proof of GRH” subtitle."), gap=16),
                    gap=48, flex=[0, 1]),
      None, None, "Alessandro Maria Masullo, draft · Vakil's Math 216 blog")
t23 = W("two claimed proofs")
scene(t22, t23, row(shot(t22 + .2, "masullo_p6", "The Music of the Primes · Acknowledgements", (.08, .07, .92, .40), 900, t23),
                    col(text(W("and the week you're"), "12 years of work. Then, the week it's almost ready, an AI shows up with 17 million lines of code.", 38, tone=""), gap=0),
                    gap=48, flex=[0, 1]),
      "The part that hurts", "A second proof", "Masullo, draft, p.6")
cmp = lambda t, head_, rows_, tone: item(t, f'<div class="slab">{head_}</div>' + "".join(f'<div class="hd" style="font-size:40px;margin-top:14px">{r}</div>' for r in rows_), f"stat {tone}", "flex:1")
scene(t23, W("you should hear"), col(hrow(cmp(W("one human"), "Human · Masullo", ["Readable", "940-page draft", "~12 years"], ""),
                                          cmp(W("one machine"), "Machine · Alpöge + Claude", ["Machine-checked", "17.4M lines of Lean", "41 days"], "hero"), gap=28),
                                     fix(t23 + 1.2, "They landed about 5 hours apart (Alpöge's note before 13:41 UTC, Vakil's post around 18:18 UTC), not 12."), gap=22),
      "Two claimed proofs, the same day", "A second proof", "Timestamps: replies on X · math216.wordpress.com")

# ---------------- skeptic + status
t24 = W("and officially")
scene(W("you should hear"), t24, row(shot(W("you should hear") + .2, "b_ipo", "aljazeera.com · Nov 19, 2026", (.0, .0, .55, .52), 640),
                                     col(timeline([(W("one day after"), "Nov 19", "Anthropic IPO, $81.3B", ""), (W("one day after") + .6, "Nov 20", "Alpöge's note", "on")]),
                                         quote(W("there's no evidence"), "There is an obvious cynical view, to do with the timing, but it is false", "Levent Alpöge", "his note, p.2"),
                                         text(W("he posted it"), "Posted on his personal site, not Anthropic's blog.", 32, tone=""), gap=18), gap=48, flex=[0, 1]),
      "The skeptical side", "Status", "Al Jazeera · Alpöge's note")
t25 = W("what happens next")
scene(t24, t25, row(shot(t24 + .2, "b_clay", "claymath.org/millennium/riemann-hypothesis", (.0, .0, .75, .48), 720, t25),
                    col(check_row(t24 + .6, "Clay Mathematics Institute", "UNSOLVED", "warn"),
                        text(W("the million dollars"), "The $1M needs publication plus at least two years of acceptance.", 32, tone=""),
                        item(W("so the honest phrase"), f"<b class='acc'>Claimed proof.</b> Not solved. Not yet.", "hd", "font-size:52px"), gap=18), gap=48, flex=[0, 1]),
      "Officially", "Status", "claymath.org")
t26 = W("here's my take")
scene(t25, t26, col(check_row(W("short term"), "Short term: the Lean community finishes independent checks", "WEEKS", "good", "if they pass, the formal proof is very likely valid"),
                    check_row(W("long term"), "Long term: turn 17 million lines into something people understand", "YEARS", "warn"),
                    check_row(W("meanwhile"), "Meanwhile: Masullo's proof gets checked in parallel", "IN PROGRESS", "warn"),
                    item(W("both could be right"), "Both could be right. Neither could be.", "hd", "font-size:44px"), gap=14),
      "What happens next", "Status", None)

# ---------------- my take
t27 = W("if this holds")
scene(t26, t27, row(shot(t26 + .2, "b_anthropic", "anthropic.com/research/riemann-zeta · Aug 10, 2026", (.25, .0, .75, .45), 640, t27),
                    col(text(W("in august"), "Share of zeta zeros proven to sit on the critical line:", 32, tone=""),
                        bars(W("from 41"), [(W("from 41"), "Before", 41.6, False, None, None), (W("67"), "Claude, Aug 2026", 67.2, True, CL, None)], 100, 1, "%", label_w=400, val_w=170),
                        text(W("three months later"), "Three months later: an argument about the whole thing.", 34, tone=""), gap=20), gap=48, flex=[0, 1]),
      "My take", "Verdict", "Anthropic, “Learning more about Claude's mathematical capabilities”, Aug 2026")
t28 = W("do you think")
scene(t27, t28, col(item(t27 + .2, '<span style="text-decoration:line-through;text-decoration-thickness:5px;color:var(--ink3)">Can AI do real math?</span>', "hd", "font-size:60px;text-align:center"),
                    item(W("it becomes"), "What happens when AI proves things <b class='acc'>no human can read</b>?", "hd", "font-size:64px;text-align:center"), gap=40),
      None, None, None)
t29 = W("this has been")
scene(t28, t29, row(strip(t28 + .1, 520, 520, 6, t28 + .3, .15),
                    col(item(W("do you think"), "Does it hold up?", "hd", "font-size:72px"), text(W("tell me in"), "Tell me in the comments. When the verification lands, you'll hear it here first.", 34, tone="ink3"), gap=20),
                    gap=56, flex=[0, 1]))
scene(t29, 389.70, col(item(t29, '<img src="assets/img/aiequator_k.png" alt="" style="width:300px;height:300px;display:block;margin:0 auto">', ""),
                       text(t29, "Subscribe for more AI news", 32, "center", "ink3"), gap=30), push=False, last=True)
