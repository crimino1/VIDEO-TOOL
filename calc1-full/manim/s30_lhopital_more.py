"""Builder 30: end of Chapter 10. More L'Hopital: ln x / x and x^2 / e^x (infinity over infinity, used twice), the
exponential beats every power (a live L'H counter on x^100 / e^x), the ranking logs < powers < exponentials, the
mistake (x^2+1)/(x+1) at 1 crossed in RED, two practice limits, 0 * infinity (x ln x), infinity - infinity and the
exponent forms (log trick), (1 + 1/x)^x = e step by step, compound interest levelling off at e, Newton's method
(picture, formula, square root of 2 in three steps), the chapter recap and the turn to integrals.
Colours: in every L'Hopital fraction the top is BLUE and the bottom ORG, and they change separately (never the
quotient rule). Derivative tags PINK, answers GRN, key words YEL, wrong RED.
START SEAM: K29_Twice ends on the heading "Infinity over Infinity" and M(lim ln x / x, size=64) at (0, 0.9)."""
from common import *
import manim.animation.transform_matching_parts as _tmp


def TMT(a, b, **kw):
    """TransformMatchingTex whose key_map parts morph with a plain Transform. Manim 0.22's FadeTransformPieces
    crashes when the two parts have different glyph counts (sin 3x -> 3 cos 3x)."""
    old = _tmp.FadeTransformPieces
    _tmp.FadeTransformPieces = Transform
    try:
        return TransformMatchingTex(a, b, **kw)
    finally:
        _tmp.FadeTransformPieces = old

LIMI = r"\lim_{x\to\infty}"
LIM0 = r"\lim_{x\to 0}"
LIM0P = r"\lim_{x\to 0^+}"
LIM1 = r"\lim_{x\to 1}"
T1 = "Infinity over Infinity"


def fr(pre, top, bot, post=(), size=60):
    """M(*pre, top over bot, *post) with the top BLUE and the bottom ORG; tags .top .bar .bot."""
    m = M(*pre, r"\frac{", top, "}{", bot, "}", *post, size=size)
    k = len(pre)
    m.top, m.bar, m.bot = m[k + 1], m[k + 2], m[k + 3]
    m.ttex, m.btex = top, bot
    m.top.set_color(BLUE)
    m.bot.set_color(ORG)
    return m


def form(top=r"\infty", bot=r"\infty", size=50):
    """The little '-> top/bottom' tag beside a limit."""
    m = M(r"\to", r"\frac{", top, "}{", bot, "}", size=size)
    m[2].set_color(BLUE)
    m[4].set_color(ORG)
    return m


def put_row(m, x, y, ref=None):
    """Left edge at x, fraction bar (or centre) at height y."""
    yy = m.bar.get_y() if hasattr(m, "bar") else m.get_y()
    return m.shift([x - m.get_left()[0], y - yy, 0])


def under_row(m, ref, y):
    """A row that starts '= lim ...': its lim lines up under ref's lim (ref[0]); '=' sits in the margin."""
    yy = m.bar.get_y() if hasattr(m, "bar") else m[0].get_y()
    return m.shift([ref[0].get_left()[0] - m[1].get_left()[0], y - yy, 0])


def side(m, ref, buff=0.4):
    """Put m to the right of ref with its centre on ref's fraction bar."""
    m.next_to(ref, RIGHT, buff=buff)
    return m.shift(UP * ((ref.bar.get_y() if hasattr(ref, "bar") else ref.get_y()) - m.get_y()))


def lh_tag(row):
    return H("L'H", 34, PINK).next_to(row[0], LEFT, buff=0.25)


def lh_top(src, mid, copy=True):
    return TMT(src.copy() if copy else src, mid, key_map={src.ttex: mid.ttex})


def lh_bot(mid, dst):
    return TMT(mid, dst, key_map={mid.btex: dst.btex})


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


# ================================================================ 1. ln x over x

class K30_LnX(Shot):
    def body(self):
        self.title(T1, animate=False)
        L0 = fr([LIMI], r"\ln x", "x", size=64).move_to([0, 0.9, 0])
        L0.top.set_color(CHALK)
        L0.bot.set_color(CHALK)
        self.add(L0)
        tgt = fr([LIMI], r"\ln x", "x", size=64)
        put_row(tgt, -4.6, 1.5)
        self.go(11103.67, Transform(L0, tgt), run=0.6)
        f0 = side(form(), tgt)
        self.go(11104.31, Write(f0), run=0.6)
        mid = fr(["=", LIMI], r"\frac{1}{x}", "x", size=64)
        L1 = fr(["=", LIMI], r"\frac{1}{x}", "1", size=64)
        under_row(L1, tgt, -0.45)
        under_row(mid, tgt, -0.45)
        tag = lh_tag(L1)
        self.go(11105.71, FadeIn(tag, shift=RIGHT * 0.1), run=0.5)
        n1 = H("top on its own", 34, BLUE).next_to(L1.top, RIGHT, buff=0.6)
        n2 = H("bottom on its own", 34, ORG).next_to(L1.bot, RIGHT, buff=0.6).align_to(n1, LEFT)
        self.go(11106.75, lh_top(tgt, mid), FadeIn(n1, shift=LEFT * 0.1), run=0.8)
        self.go(11107.6, lh_bot(mid, L1), FadeIn(n2, shift=LEFT * 0.1), run=0.7)
        L2 = M("=", LIMI, r"\frac{1}{x}", "=", "0", size=64)
        under_row(L2, tgt, -2.35)
        L2[4].set_color(GRN)
        self.go(11108.79, Write(L2[0:3]), run=0.8)
        self.go(11110.4, Write(L2[3:]), run=0.4)
        self.play(Create(answer_box(L2[4])), run_time=0.4)

        # x races away from ln x
        ax = axes((0, 8, 2), (-2, 8, 2), x_length=4.8, y_length=4.4, center=(4.1, -0.6, 0), nums=False)
        gx = curve(ax, lambda x: x, (0, 7.6), color=ORG)
        gl = curve(ax, np.log, (0.14, 7.6), color=BLUE)
        lx = M("x", size=42, color=ORG).next_to(ax.c2p(7.6, 7.6), LEFT, buff=0.15)
        ll = M(r"\ln x", size=42, color=BLUE).next_to(ax.c2p(7.6, np.log(7.6)), UP, buff=0.18)
        self.go(11111.6, FadeOut(n1), FadeOut(n2), Create(ax), FadeIn(ax.labels), run=0.5)
        self.go(11112.4, draw(gx, 0.9, ORG), draw(gl, 0.9, BLUE), run=0.9)
        self.play(FadeIn(lx), FadeIn(ll), run_time=0.4)
        gap = DoubleArrow(ax.c2p(6.6, np.log(6.6)), ax.c2p(6.6, 6.6), buff=0.06, color=YEL, stroke_width=4,
                          tip_length=0.16, max_tip_length_to_length_ratio=0.2)
        wf = H("way faster", 36, YEL).move_to(ax.c2p(4.4, 7.3))
        self.go(11114.75, GrowFromCenter(gap), FadeIn(wf, shift=LEFT * 0.1), run=0.6)
        self.wipe(11116.15, run=0.4)


# ================================================================ 2. x^2 over e^x, twice

class K30_XSqExp(Shot):
    def body(self):
        self.title(T1, animate=False)
        R0 = fr([LIMI], "x^2", "e^x", size=60)
        put_row(R0, -3.4, 1.5)
        self.go(11116.95, Write(R0[0]), run=0.8)
        self.go(11119.35, Write(R0.top), run=0.5)
        self.go(11120.11, Create(R0.bar), Write(R0.bot), run=0.6)
        f0 = side(form(), R0)
        self.go(11122.09, Write(f0), run=0.6)

        m1 = fr(["=", LIMI], "2x", "e^x", size=60)
        under_row(m1, R0, -0.08)
        t1 = lh_tag(m1)
        self.go(11124.29, FadeIn(t1, shift=RIGHT * 0.1), run=0.5)
        self.go(11125.43, lh_top(R0, m1), run=0.9)
        f1 = side(form(), m1)
        st = H("still", 36, YEL).next_to(f1, RIGHT, buff=0.25)
        self.go(11127.55, Write(f1), FadeIn(st), run=0.6)

        m2 = fr(["=", LIMI], "2", "e^x", size=60)
        under_row(m2, R0, -1.7)
        t2 = lh_tag(m2)
        self.go(11129.53, FadeIn(t2, shift=RIGHT * 0.1), run=0.5)
        self.go(11130.73, lh_top(m1, m2), run=0.9)
        n1 = H("just 2", 38, BLUE).next_to(m2.top, RIGHT, buff=0.6)
        n2 = M(r"\to\infty", size=44, color=ORG).next_to(m2.bot, RIGHT, buff=0.6).align_to(n1, LEFT)
        self.go(11133.35, FadeIn(n1, shift=LEFT * 0.1), run=0.5)
        self.go(11135.05, FadeIn(n2, shift=LEFT * 0.1), run=0.5)
        z = side(M("=", "0", size=60), m2, buff=0.25)
        z[1].set_color(GRN)
        self.go(11136.5, FadeOut(n1), FadeOut(n2), run=0.3)
        self.play(Write(z), run_time=0.4)
        self.play(Create(answer_box(z[1])), run_time=0.3)
        self.wipe(11137.5, run=0.4)


# ================================================================ 3. the exponential always wins

def top_tex(k):
    if k == 0:
        return "x^{100}"
    if k == 100:
        return "100!"
    return r"c\,x^{" + str(100 - k) + "}"


KS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100]


class K30_Wins(Shot):
    def body(self):
        self.title(T1, animate=False)
        self.title("The Exponential Wins", 11138.09)
        W0 = fr([LIMI], "x^n", "e^x", post=["=", "0"], size=62).move_to([0, 1.25, 0])
        W0[-1].set_color(GRN)
        self.go(11140.49, Write(W0[:6]), run=1.0)
        self.go(11142.39, Write(W0[6:]), run=0.4)
        W1 = fr([LIMI], "x^{100}", "e^x", post=["=", "0"], size=62).move_to(W0)
        W1[-1].set_color(GRN)
        self.go(11144.69, TMT(W0, W1, key_map={"x^n": "x^{100}"}), run=0.6)

        # the live counter: L'Hopital again and again on x^100 / e^x
        cen = np.array([-0.6, -1.25, 0])
        tops = {k: M(top_tex(k), size=60, color=BLUE) for k in KS}
        bar = Line(LEFT * 1.0, RIGHT * 1.0, color=CHALK, stroke_width=4).move_to(cen)
        bot = M("e^x", size=60, color=ORG).next_to(bar, DOWN, buff=0.18)
        for k, m in tops.items():
            m.next_to(bar, UP, buff=0.18)
        hd = H("L'H used:", 36, PINK).move_to([3.6, -0.75, 0])
        cnt = {k: M(str(k), size=56, color=PINK).next_to(hd, DOWN, buff=0.2) for k in KS}
        cl = H("c: just a number", 34, DIM).move_to([-4.7, -1.25, 0])
        cur = VGroup(tops[0].copy(), cnt[0].copy())
        self.go(11146.05, TransformFromCopy(W1.top, cur[0]), TransformFromCopy(W1.bar, bar),
                TransformFromCopy(W1.bot, bot), FadeIn(hd), FadeIn(cur[1]), FadeIn(cl), run=0.8)
        self.add(cur)
        u = ValueTracker(0)

        def upd(g):
            k = KS[min(int(u.get_value()), len(KS) - 1)]
            g.become(VGroup(tops[k].copy(), cnt[k].copy()))
        cur.add_updater(upd)
        self.at(11147.05)
        self.play(u.animate.set_value(len(KS) - 0.01), run_time=3.2, rate_func=linear)
        cur.clear_updaters()
        n1 = note("a constant", cur[0], LEFT, BLUE, size=36, dist=0.4, angle=0.4)
        self.go(11150.4, FadeOut(cl), FadeIn(n1[0]), Create(n1[1]), run=0.5)
        n2 = note("still", bot, LEFT, ORG, size=36, dist=0.6, angle=-0.4)
        self.go(11151.43, FadeIn(n2[0]), Create(n2[1]), run=0.5)
        z = M(r"\to", "0", size=60, color=GRN).next_to(bar, RIGHT, buff=0.5)
        self.go(11153.6, Write(z), Circumscribe(bot, color=YEL, buff=0.1), run=0.8)
        self.wipe(11155.3, run=0.4)

        # the ranking
        self.title("Slowest to Fastest", 11155.89)
        ar = Arrow([-5.6, -1.4, 0], [5.6, -1.4, 0], buff=0, color=DIM, stroke_width=4, tip_length=0.25)
        sl = H("slowest", 38, DIM).next_to(ar.get_start(), DOWN, buff=0.25).shift(RIGHT * 0.5)
        fa = H("fastest", 38, DIM).next_to(ar.get_end(), DOWN, buff=0.25).shift(LEFT * 0.5)
        self.go(11157.17, Create(ar), FadeIn(sl), run=0.6)
        self.go(11157.85, FadeIn(fa), run=0.4)
        xs = [-4.2, 0, 4.2]
        ent = [M(r"\ln x", size=72), M("x^n", size=72), M("e^x", size=72, color=YEL)]
        nm = ["logs", "powers", "exponentials"]
        lt = [M("<", size=64, color=DIM).move_to([-2.1, 0.55, 0]), M("<", size=64, color=DIM).move_to([2.1, 0.55, 0])]
        for e, x in zip(ent, xs):
            e.move_to([x, 0.6, 0])
        labs = [H(s, 40, DIM).next_to(e, DOWN, buff=0.35).set_y(-0.45) for s, e in zip(nm, ent)]
        self.go(11160.51, Write(ent[0]), FadeIn(labs[0], shift=UP * 0.1), run=0.6)
        self.go(11161.3, FadeIn(lt[0]), Write(ent[1]), FadeIn(labs[1], shift=UP * 0.1), run=0.6)
        self.go(11162.2, FadeIn(lt[1]), Write(ent[2]), FadeIn(labs[2], shift=UP * 0.1), run=0.6)
        self.play(Circumscribe(ent[2], color=YEL, buff=0.15), run_time=0.5)
        self.wipe(11163.3, run=0.28)


# ================================================================ 4. the mistake

class K30_Mistake(Shot):
    def body(self):
        self.title("Slowest to Fastest", animate=False)
        self.title("A Common Mistake", 11163.75)
        P = fr([LIM1], "x^2+1", "x+1", size=62).move_to([0, 1.35, 0])
        self.go(11169.73, Write(P[0]), run=0.6)
        self.go(11171.51, Write(P.top), run=0.6)
        self.go(11172.83, Create(P.bar), Write(P.bot), run=0.6)
        dv = Line([0, 0.45, 0], [0, -2.0, 0], color=FAINT, stroke_width=3)

        # left: plug in
        pl = TX(r"plug in $x=1$", 40, DIM).move_to([-3.4, 0.05, 0])
        C1 = M(r"\frac{2}{2}", "=", "1", size=62).move_to([-3.4, -1.15, 0])
        C1[2].set_color(GRN)
        self.go(11174.65, FadeIn(pl, shift=UP * 0.1), Create(dv), run=0.5)
        self.go(11175.57, Write(C1[0]), run=0.6)
        self.go(11176.77, Write(C1[1:]), run=0.5)
        ok = tick_mark(GRN, 0.5).next_to(C1, RIGHT, buff=0.45)
        self.go(11177.93, Create(answer_box(C1[2])), Create(ok), run=0.5)

        # right: L'Hopital anyway
        la = H("L'H anyway", 40, PINK).move_to([3.4, 0.05, 0])
        self.go(11180.29, FadeIn(la, shift=UP * 0.1), run=0.5)
        Wr = fr([LIM1], "2x", "1", size=62)
        Wr.move_to([2.9, -1.15, 0]).shift(UP * (-1.15 - Wr.bar.get_y()))
        self.go(11182.03, TMT(P.copy(), Wr, key_map={"x^2+1": "2x", "x+1": "1"}), run=0.9)
        w2 = side(M("=", "2", size=62), Wr, buff=0.25)
        self.go(11183.69, Write(w2), run=0.4)
        bad = VGroup(Wr, w2)
        X = cross_mark(RED, 0.3).next_to(w2, RIGHT, buff=0.4)
        wr = H("wrong", 40, RED).next_to(bad, DOWN, buff=0.4)
        self.go(11184.15, Create(strike(w2[1])), Create(X), FadeIn(wr), run=0.6)

        # why: it was never 0/0
        why = M(r"\frac{2}{2}", r"\neq", r"\frac{0}{0}", size=56).move_to([-3.4, -2.85, 0])
        why[1].set_color(RED)
        why[2].set_color(YEL)
        self.go(11186.11, Write(why), run=0.8)
        self.wipe(11188.4, run=0.4)

        # the rule
        r1 = TX(r"1.\ \ plug in first", 54)
        r2 = Tex(r"2.\ \ L'H only if you get ", r"$\dfrac{0}{0}$", " or ", r"$\dfrac{\infty}{\infty}$", font_size=54, color=CHALK, tex_template=HANDTEX)
        VGroup(r1, r2).arrange(DOWN, buff=0.7, aligned_edge=LEFT).move_to([0, 0.0, 0])
        self.go(11188.91, Write(r1), run=0.8)
        self.go(11190.97, Write(r2), run=1.4)
        self.go(11193.01, Circumscribe(VGroup(r2[1], r2[3]), color=YEL, buff=0.08), run=0.8)
        self.go(11194.3, Create(panel(VGroup(r1, r2), YEL, buff=0.45)), run=0.7)


# ================================================================ 5. try these two

class K30_TryTwo(Shot):
    def body(self):
        self.title("Try These Two", 11197.7)
        A0 = fr([LIM0], r"\sin 3x", "x", size=54)
        put_row(A0, -5.0, 1.35)
        B0 = fr([LIMI], "x^3", "e^x", size=54)
        put_row(B0, 2.25, 1.35)
        dv = Line([0.45, 1.95, 0], [0.45, -3.4, 0], color=FAINT, stroke_width=3)
        self.go(11198.2, Write(A0[0]), run=0.6)
        self.go(11199.25, Write(A0.top), run=0.5)
        self.go(11200.15, Create(A0.bar), Write(A0.bot), run=0.5)
        self.go(11201.43, Create(dv), run=0.4)
        self.go(11201.85, Write(B0[0]), run=0.6)
        self.go(11204.21, Write(B0.top), run=0.5)
        self.go(11204.91, Create(B0.bar), Write(B0.bot), run=0.5)

        # first: 0/0, chain rule on the top
        fa = side(form("0", "0"), A0, buff=0.35)
        self.go(11207.13, Write(fa), run=0.6)
        am = fr(["=", LIM0], r"3\cos 3x", "x", size=54)
        A1 = fr(["=", LIM0], r"3\cos 3x", "1", size=54)
        under_row(A1, A0, 0.0)
        under_row(am, A0, 0.0)
        ta = lh_tag(A1)
        self.go(11208.99, FadeIn(ta, shift=RIGHT * 0.1), run=0.5)
        self.go(11212.71, lh_top(A0, am), run=0.9)
        cr = H("chain rule", 34, DIM).next_to(A1, RIGHT, buff=0.3).shift(UP * 0.35)
        self.go(11214.65, FadeIn(cr, shift=LEFT * 0.1), run=0.4)
        self.go(11215.85, lh_bot(am, A1), run=0.7)
        A2 = M("=", r"3\cos 0", "=", "3", size=54)
        under_row(A2, A0, -1.35)
        A2[3].set_color(GRN)
        self.go(11216.95, Write(A2[0:2]), run=0.6)
        self.go(11218.15, Write(A2[2:]), run=0.4)
        self.play(Create(answer_box(A2[3])), run_time=0.3)

        # second: infinity over infinity, three times
        fb = side(form(), B0, buff=0.35)
        self.go(11219.63, Write(fb), run=0.6)
        rows = [B0]
        for i, (top, t) in enumerate([("3x^2", 11221.97), ("6x", 11225.27), ("6", 11227.21)]):
            r = fr(["=", LIMI], top, "e^x", size=54)
            under_row(r, B0, 1.35 - 1.35 * (i + 1))
            tg = lh_tag(r)
            self.go(t, FadeIn(tg, shift=RIGHT * 0.1), lh_top(rows[-1], r), run=0.9)
            rows.append(r)
        z = side(M("=", "0", size=54), rows[-1], buff=0.25)
        z[1].set_color(GRN)
        self.go(11229.25, Write(z), run=0.4)
        self.play(Create(answer_box(z[1])), run_time=0.3)
        self.wipe(11230.45, run=0.4)


# ================================================================ 6. zero times infinity

class K30_ZeroInf(Shot):
    def body(self):
        self.title("Try These Two", animate=False)
        self.title("Other Indeterminate Forms", 11231.0)
        tg = M(r"\frac{0}{0}", r"\ \text{or}\ ", r"\frac{\infty}{\infty}", size=54, color=YEL).move_to([3.6, 1.6, 0])
        tg[1].set_color(DIM)
        self.go(11233.59, Write(tg), run=0.8)
        ch = M(r"0\cdot\infty", size=62).move_to([-3.6, 1.6, 0])
        a = Arrow(ch.get_right() + RIGHT * 0.2, tg.get_left() + LEFT * 0.2, buff=0, color=DIM, stroke_width=4, tip_length=0.2)
        ti = H("turn into", 34, DIM).next_to(a, UP, buff=0.12)
        self.go(11237.47, Write(ch), run=0.5)
        self.play(Create(a), FadeIn(ti), run_time=0.5)

        E0 = M(LIM0P, "x", r"\ln x", size=60)
        E0[1].set_color(ORG)
        E0[2].set_color(BLUE)
        E0.shift([-5.0 - E0.get_left()[0], 0.35 - E0[1].get_y(), 0])
        self.go(11239.91, Write(E0[0]), run=0.8)
        self.go(11242.19, Write(E0[1]), run=0.4)
        self.go(11242.79, Write(E0[2]), run=0.5)
        g1 = M("x", r"\to 0", size=48, color=ORG)
        g2 = M(r"\ln x", r"\to -\infty", size=48, color=BLUE)
        VGroup(g1, g2).arrange(DOWN, buff=0.3, aligned_edge=LEFT).move_to([1.6, 0.35, 0])
        self.go(11243.93, FadeIn(g1, shift=UP * 0.1), run=0.4)
        self.go(11245.33, FadeIn(g2, shift=UP * 0.1), run=0.4)

        E1 = fr(["=", LIM0P], r"\ln x", r"\frac{1}{x}", size=60)
        under_row(E1, E0, -1.05)
        self.go(11248.3, FadeOut(g1), FadeOut(g2), run=0.4)
        self.go(11250.99, TMT(E0.copy(), E1, key_map={"x": r"\frac{1}{x}"}), run=1.0)
        f1 = side(form(r"-\infty", r"\infty"), E1, buff=0.35)
        self.go(11255.81, Write(f1), run=0.6)

        em = fr(["=", LIM0P], r"{\frac{1}{x}}", r"\frac{1}{x}", size=60)
        E2 = fr(["=", LIM0P], r"{\frac{1}{x}}", r"-\frac{1}{x^2}", size=60)
        under_row(E2, E0, -1.45)
        under_row(em, E0, -1.45)
        t2 = lh_tag(E2)
        self.go(11257.3, FadeOut(E0), VGroup(E1, f1).animate.shift(UP * (0.45 - E1.bar.get_y())), run=0.6)
        self.go(11258.07, FadeIn(t2, shift=RIGHT * 0.1), run=0.4)
        self.go(11258.65, lh_top(E1, em), run=0.9)
        self.go(11261.33, lh_bot(em, E2), run=0.9)
        E3 = M("=", LIM0P, "(-x)", "=", "0", size=60)
        side(E3, E2, buff=0.3)
        E3[4].set_color(GRN)
        self.go(11264.07, Write(E3[0:3]), run=0.8)
        self.go(11266.53, Write(E3[3:]), run=0.4)
        self.play(Create(answer_box(E3[4])), run_time=0.3)
        self.wipe(11267.6, run=0.35)


# ================================================================ 7. the other forms, one move each

class K30_Forms(Shot):
    def body(self):
        self.title("Other Indeterminate Forms", animate=False)
        cx, ys = -4.9, [1.5, -0.15, -2.0]

        def arrow(y):
            return Arrow([-3.25, y, 0], [-2.55, y, 0], buff=0, color=DIM, stroke_width=4, tip_length=0.18)
        c1 = M(r"0\cdot\infty", size=58).move_to([cx, ys[0], 0])
        a1 = arrow(ys[0])
        m1 = H("rewrite as a fraction", 40).next_to(a1, RIGHT, buff=0.3)
        self.go(11268.0, FadeIn(VGroup(c1, a1, m1), shift=UP * 0.1), run=0.4)

        c2 = M(r"\infty-\infty", size=58).move_to([cx, ys[1], 0])
        a2 = arrow(ys[1])
        self.go(11268.45, Write(c2), run=0.7)
        ex = M(LIM0, r"\Big(\frac{1}{x}-\frac{1}{\sin x}\Big)", size=50)
        ex.next_to(a2, RIGHT, buff=0.3)
        ex2 = M(LIM0, r"\frac{\sin x-x}{x\sin x}", size=50)
        ex2.move_to(ex, aligned_edge=LEFT)
        self.go(11270.81, Create(a2), Write(ex), run=0.8)
        self.go(11272.75, TMT(ex, ex2), run=0.8)
        on = H("one fraction", 34, DIM).next_to(ex2, UP, buff=0.12).shift(RIGHT * 0.6)
        self.play(FadeIn(on), run_time=0.3)
        z = M(r"\to", r"\frac{0}{0}", size=50, color=YEL).next_to(ex2, RIGHT, buff=0.3)
        self.go(11274.11, Write(z), run=0.5)

        c3 = [M(r"1^{\infty}", size=58), M(r"0^{0}", size=58), M(r"\infty^{0}", size=58)]
        VGroup(*c3).arrange(RIGHT, buff=0.4).move_to([cx, ys[2], 0])
        self.go(11277.85, Write(c3[0]), run=0.5)
        self.go(11279.1, Write(c3[1]), run=0.5)
        self.go(11280.99, Write(c3[2]), run=0.5)
        a3 = arrow(ys[2])
        lg = M("y", "=", "u", "^{v}", r"\ \Rightarrow\ ", r"\ln y", "=", "v", r"\,\ln u", size=54)
        lg[3].set_color(YEL)
        lg[7].set_color(YEL)
        lg.next_to(a3, RIGHT, buff=0.3)
        self.go(11282.9, Create(a3), Write(lg[0:4]), run=0.6)
        self.go(11284.11, Write(lg[4:7]), run=0.5)
        self.play(TransformFromCopy(lg[3], lg[7], path_arc=-1.2), Write(lg[8]), run_time=0.7)
        c7 = H("log trick, Chapter 7", 34, DIM).next_to(lg, DOWN, buff=0.25)
        self.play(FadeIn(c7, shift=UP * 0.1), run_time=0.4)
        self.wipe(11286.0, run=0.35)


# ================================================================ 8. (1 + 1/x)^x: set up

EQX = -3.4


def euler_lim(pre=(), size=60, post=()):
    m = M(*pre, LIMI, r"\left(", r"1+\frac{1}{x}", r"\right)^{", "x", "}", *post, size=size)
    k = len(pre)
    m[k + 2].set_color(BLUE)
    m[k + 4].set_color(ORG)
    return m


def euler_rows():
    D0 = euler_lim(["y", "="])
    D0.shift([EQX - D0[1].get_x(), 1.55 - D0[1].get_y(), 0])
    D1 = M(r"\ln y", "=", LIMI, "x", r"\ln\left(1+\frac{1}{x}\right)", size=60)
    D1[3].set_color(ORG)
    D1[4].set_color(BLUE)
    D1.shift([EQX - D1[1].get_x(), 0.05 - D1[1].get_y(), 0])
    return D0, D1


class K30_EulerSet(Shot):
    def body(self):
        self.title("Other Indeterminate Forms", animate=False)
        self.title("The Most Famous One", 11286.59)
        E = euler_lim(size=68).move_to([0, 1.2, 0])
        self.go(11288.59, Write(E[0]), run=0.8)
        self.go(11290.79, Write(E[1:4]), run=0.9)
        self.go(11292.75, Write(E[4:]), run=0.4)
        br = Brace(E[2], DOWN, buff=0.12, color=BLUE)
        b1 = M(r"\to 1", size=44, color=BLUE).next_to(br, DOWN, buff=0.12)
        self.go(11294.23, GrowFromCenter(br), run=0.5)
        self.go(11295.0, FadeIn(b1, shift=UP * 0.1), run=0.4)
        n2 = M(r"\to\infty", size=44, color=ORG).next_to(E[4], RIGHT, buff=0.15)
        self.go(11296.49, FadeIn(n2, shift=LEFT * 0.1), run=0.5)

        fm = M(r"1^{\infty}", size=64, color=YEL).move_to([-3.4, -1.6, 0])
        self.go(11298.29, Write(fm), run=0.5)
        P1 = M("1", "^{1000}", "=", "{1}", size=64).move_to([1.0, -1.6, 0])
        self.go(11300.57, Write(P1), run=0.8)
        q = M("?", size=64, color=YEL).next_to(P1, RIGHT, buff=0.3)
        self.go(11302.41, FadeIn(q, shift=UP * 0.1), run=0.4)
        P2 = M("1.001", "^{1000}", r"\approx", "2.717", size=64)
        P2.move_to(P1, aligned_edge=LEFT)
        P2[0].set_color(ORG)
        P2[3].set_color(GRN)
        Pm = M("1.001", "^{1000}", "=", "{1}", size=64).move_to(P1, aligned_edge=LEFT)
        Pm[0].set_color(ORG)
        self.go(11305.31, FadeOut(q), TMT(P1, Pm, key_map={"1": "1.001"}), run=0.8)
        self.go(11309.99, TMT(Pm, P2, key_map={"=": r"\approx", "{1}": "2.717"}), run=0.7)
        self.play(Circumscribe(P2[3], color=GRN, buff=0.1), run_time=0.6)

        # call it y, take ln
        D0, D1 = euler_rows()
        self.go(11311.3, FadeOut(VGroup(br, b1, n2, fm, P2)), run=0.3)
        self.play(TMT(E, D0), run_time=0.7)
        self.go(11314.11, Write(D1[0:3]), run=0.8)
        self.go(11315.55, TransformFromCopy(D0[6], D1[3], path_arc=1.0), run=0.7)
        self.go(11316.3, Write(D1[4]), run=0.9)
        cd = note("came down", D1[3], DOWN, ORG, size=34, dist=0.45, angle=-0.5)
        self.play(FadeIn(cd[0]), Create(cd[1]), run_time=0.4)
        self.go(11318.4, FadeOut(cd), run=0.35)


# ================================================================ 9. (1 + 1/x)^x: L'Hopital

TOP1 = r"\ln\left(1+\frac{1}{x}\right)"


def euler_frac():
    D2 = fr(["=", LIMI], TOP1, r"\frac{1}{x}", size=60)
    D2.shift([EQX - D2[0].get_x(), -1.5 - D2[0].get_y(), 0])
    return D2


def euler_parts():
    TP = M(r"\text{top}'", "=", r"\frac{1}{1+\frac{1}{x}}", r"\cdot", r"\left(-\frac{1}{x^2}\right)", size=54)
    TP[0].set_color(BLUE)
    TP.shift([-2.6 - TP[1].get_x(), -0.6 - TP[1].get_y(), 0])
    BT = M(r"\text{bottom}'", "=", r"-\frac{1}{x^2}", size=54)
    BT[0].set_color(ORG)
    BT.shift([-2.6 - BT[1].get_x(), -2.4 - BT[1].get_y(), 0])
    cr = H("chain rule", 34, DIM).next_to(TP, RIGHT, buff=0.4)
    return TP, BT, cr


def top_row(D2):
    """Where the 0/0 fraction sits once the derivatives come in."""
    return D2.copy().shift(UP * (1.3 - D2[0].get_y()))


class K30_EulerLog(Shot):
    def body(self):
        self.title("The Most Famous One", animate=False)
        D0, D1 = euler_rows()
        self.add(D0, D1)
        D2 = euler_frac()
        self.go(11320.47, TMT(D1.copy(), D2, key_map={"x": r"\frac{1}{x}"}), run=1.0)
        f2 = side(form("0", "0"), D2, buff=0.35)
        self.go(11326.6, Write(f2), run=0.6)

        up = VGroup(D2, f2)
        self.go(11328.6, FadeOut(D0), FadeOut(D1), up.animate.shift(UP * (1.3 - D2[0].get_y())), run=0.6)
        TP, BT, cr = euler_parts()
        self.go(11329.8, Write(TP[0:2]), run=0.5)
        self.go(11330.83, FadeIn(cr, shift=LEFT * 0.1), run=0.4)
        self.go(11332.01, Write(TP[2]), run=0.9)
        self.go(11334.03, Write(TP[3:]), run=0.9)
        self.go(11336.83, Write(BT[0:2]), run=0.5)
        self.go(11337.75, Write(BT[2]), run=0.7)
        u1, u2 = under(TP[4], RED), under(BT[2], RED)
        self.go(11340.19, Create(u1), Create(u2), run=0.5)
        s1, s2 = strike(TP[4]), strike(BT[2])
        self.go(11342.0, FadeOut(u1), FadeOut(u2), Create(s1), Create(s2), run=0.5)


# ================================================================ 10. (1 + 1/x)^x = e

class K30_EulerE(Shot):
    def body(self):
        self.title("The Most Famous One", animate=False)
        D2 = top_row(euler_frac())
        f2 = side(form("0", "0"), D2, buff=0.35)
        TP, BT, cr = euler_parts()
        s1, s2 = strike(TP[4]), strike(BT[2])
        self.add(D2, f2, TP, BT, cr, s1, s2)

        D4 = M("=", LIMI, r"\frac{1}{1+\frac{1}{x}}", "=", "1", size=60)
        D4.shift([EQX - D4[0].get_x(), -0.6 - D4[0].get_y(), 0])
        D4[4].set_color(YEL)
        tag = lh_tag(D4)
        self.go(11343.43, FadeOut(VGroup(TP, BT, cr, s1, s2)), TransformFromCopy(TP[2], D4[2]),
                Write(D4[0:2]), FadeIn(tag), run=0.8)
        self.go(11348.97, Write(D4[3:]), run=0.5)
        R1 = M(r"\ln y", r"\to", "1", size=64).move_to([-3.4, -2.35, 0])
        R2 = M("y", r"\to", "e^1", "=", "e", size=64).move_to([2.6, -2.35, 0])
        R2[4].set_color(GRN)
        self.go(11350.65, Write(R1), run=0.6)
        self.go(11353.27, Write(R2[0:2]), run=0.4)
        self.go(11354.17, Write(R2[2]), run=0.4)
        self.go(11355.49, Write(R2[3:]), run=0.4)

        F = euler_lim(post=["=", "e"], size=76).move_to([0, 0.2, 0])
        F[-1].set_color(GRN)
        self.go(11356.37, FadeOut(VGroup(D2, f2, tag, D4, R1, R2)), run=0.4)
        self.play(Write(F[:-2]), run_time=1.1)
        self.go(11359.29, Write(F[-2:]), run=0.4)
        ap = M(r"e\approx 2.718", size=50, color=DIM).next_to(F, DOWN, buff=0.7)
        self.play(Create(answer_box(F[-1])), FadeIn(ap, shift=UP * 0.1), run_time=0.4)
        self.wipe(11360.9, run=0.35)


# ================================================================ 11. compound interest

class K30_Interest(Shot):
    def body(self):
        self.title("The Most Famous One", animate=False)
        self.title("Compound Interest", 11361.35)
        hd = H("$1 at 100% a year", 46).move_to([-3.3, 1.65, 0])
        self.go(11365.33, FadeIn(hd, shift=UP * 0.1), run=0.6)
        fm = M(r"\left(1+\frac{1}{n}\right)^{n}", size=56).move_to([3.4, 1.65, 0])
        self.go(11369.27, Write(fm), run=0.8)
        rows = [("yearly", "1", 2.0), ("monthly", "12", 2.613035), ("daily", "365", 2.714567),
                ("every second", "31{,}536{,}000", 2.718282)]
        X0, SC = 1.35, 1.9
        ys = [0.45, -0.55, -1.55, -2.55]
        times = [11370.03, 11371.61, 11372.63, 11373.45]
        vals = []
        for (nm, n, v), y, t in zip(rows, ys, times):
            a = H(nm, 38, DIM).move_to([-5.5, y, 0])
            b = M("n=" + n, size=40, color=ORG).move_to([-2.3, y, 0])
            c = M(r"\$" + f"{v:.3f}", size=48).move_to([0.25, y, 0])
            bar = Rectangle(width=v * SC, height=0.42, stroke_color=GRN, stroke_width=2, fill_color=GRN,
                            fill_opacity=0.45).move_to([X0 + v * SC / 2, y, 0])
            self.go(t, FadeIn(VGroup(a, b, c), shift=UP * 0.1), GrowFromEdge(bar, LEFT), run=0.55)
            vals.append(c)
        ex = X0 + np.e * SC
        el = DashedLine([ex, 0.95, 0], [ex, -2.95, 0], color=YEL, stroke_width=4, dash_length=0.12)
        self.go(11375.23, Create(el), run=0.6)
        eg = M("e", size=56, color=YEL).next_to(el, UP, buff=0.12)
        self.go(11377.5, Write(eg), run=0.4)
        self.go(11380.21, Circumscribe(vals[-1], color=GRN, buff=0.1), run=0.9)
        self.wipe(11382.55, run=0.4)


# ================================================================ 12. Newton's method: the picture

def nf(x):
    return x * x - 2


class K30_Newton(Shot):
    def body(self):
        self.title("Compound Interest", animate=False)
        self.title("Newton's Method", 11383.37)
        ax = axes((0, 3.5, 1), (-2, 8, 2), x_length=7.2, y_length=5.0, center=(-2.7, -0.75, 0))
        cv = curve(ax, nf, (0, 3.08))
        fl = M("f", size=44, color=BLUE).next_to(ax.c2p(3.08, nf(3.08)), RIGHT, buff=0.15)
        self.go(11385.6, Create(ax), FadeIn(ax.labels), run=0.6)
        self.go(11386.37, draw(cv, 1.0, BLUE), run=1.0)
        self.play(FadeIn(fl), run_time=0.3)
        r = np.sqrt(2)
        rd = pt(ax, r, 0, YEL, 0.09)
        rl = H("root", 36, YEL).next_to(rd, UL, buff=0.15).shift(LEFT * 0.1)
        self.go(11391.53, FadeIn(rd, scale=0.5), FadeIn(rl), run=0.5)
        goal = M("f(x)", "=", "0", size=56).move_to([4.3, 1.55, 0])
        goal[0].set_color(BLUE)
        self.go(11394.45, Write(goal), run=0.8)

        def step(x, lab, t_dot, t_tan, t_hit, ext=(0.3, 0.2)):
            y = nf(x)
            s = 2 * x
            xn = x - y / s
            d = pt(ax, x, 0, ORG)
            dl = M(lab[0], size=38, color=ORG).next_to(d, DOWN, buff=0.15)
            self.go(t_dot, FadeIn(d, scale=0.5), FadeIn(dl), run=0.4)
            vl = DashedLine(ax.c2p(x, 0), ax.c2p(x, y), color=DIM, stroke_width=3, dash_length=0.08)
            a, b = x + ext[0], xn - ext[1]
            tl = Line(ax.c2p(a, y + s * (a - x)), ax.c2p(b, y + s * (b - x)), color=PINK, stroke_width=5).set_z_index(4)
            tp = pt(ax, x, y, PINK)
            self.go(t_tan, Create(vl), FadeIn(tp), run=0.4)
            self.play(draw(tl, 0.8, PINK), run_time=0.8)
            nd = pt(ax, xn, 0, ORG)
            nl = M(lab[1], size=38, color=ORG).next_to(nd, DOWN, buff=0.15)
            self.go(t_hit, FadeIn(nd, scale=0.5), FadeIn(nl), run=0.4)
            return xn, VGroup(vl, tl, tp)

        x1, g0 = step(2.7, ("x_0", "x_1"), 11398.39, 11399.97, 11403.67, ext=(0.3, 0.17))
        cl = H("closer", 36, YEL).move_to(ax.c2p(x1 + 0.15, -1.35))
        self.go(11406.73, FadeIn(cl, shift=DOWN * 0.1), run=0.4)
        self.go(11408.4, FadeOut(cl), g0.animate.set_opacity(0.3), run=0.4)
        vl = DashedLine(ax.c2p(x1, 0), ax.c2p(x1, nf(x1)), color=DIM, stroke_width=3, dash_length=0.08)
        y1, s1 = nf(x1), 2 * x1
        x2 = x1 - y1 / s1
        a, b = x1 + 0.35, x2 - 0.15
        tl = Line(ax.c2p(a, y1 + s1 * (a - x1)), ax.c2p(b, y1 + s1 * (b - x1)), color=PINK, stroke_width=5).set_z_index(4)
        tp = pt(ax, x1, y1, PINK)
        self.play(Create(vl), FadeIn(tp), run_time=0.3)
        self.play(draw(tl, 0.6, PINK), run_time=0.6)
        nd2 = pt(ax, x2, 0, ORG)
        nl2 = M("x_2", size=38, color=ORG).next_to(nd2, DOWN, buff=0.15)
        self.play(FadeIn(nd2, scale=0.5), FadeIn(nl2), run_time=0.3)

        F = M(r"x_{\text{new}}", "=", "x", "-", r"\frac{f(x)}{f'(x)}", size=58).move_to([4.3, -0.4, 0])
        F[4][0:4].set_color(BLUE)
        F[4][5:].set_color(PINK)
        self.go(11410.31, Write(F[0:2]), run=0.5)
        self.go(11411.33, Write(F[2]), run=0.4)
        self.go(11412.01, Write(F[3]), run=0.3)
        self.go(11412.53, Write(F[4][0:5]), run=0.6)
        self.go(11414.45, Write(F[4][5:]), run=0.6)
        self.play(Create(panel(F, YEL, buff=0.3)), run_time=0.5)
        self.wipe(11415.6, run=0.35)


# ================================================================ 13. square root of 2

RY = [0.3, -1.15, -2.6]
AX, BX = -6.3, -0.5


def sq_board():
    hf = M("f(x)", "=", "x^2-2", size=56, color=BLUE).move_to([-3.4, 1.6, 0])
    hd = M("f'(x)", "=", "2x", size=56, color=PINK).move_to([3.4, 1.6, 0])
    r0A = M("x_0", "=", "1", size=54, color=ORG)
    r0B = M("f(1)", "=", "-1", r",\quad", "f'(1)", "=", "2", size=54)
    r1A = M("x_1", "=", "1", "-", r"\frac{-1}{2}", "=", "1.5", size=54)
    r1B = M("f(1.5)", "=", "2.25-2", "=", "0.25", size=54)
    for m in (r0B, r1B):
        m[0].set_color(BLUE)
    r0B[4].set_color(PINK)
    r1A[0].set_color(ORG)
    r1A[6].set_color(ORG)
    for m, y in ((r0A, RY[0]), (r1A, RY[1])):
        m.shift([AX - m.get_left()[0], y - m[1].get_y(), 0])
    for m, y in ((r0B, RY[0]), (r1B, RY[1])):
        m.shift([BX - m.get_left()[0], y - m[1].get_y(), 0])
    return hf, hd, r0A, r0B, r1A, r1B


class K30_Sqrt2(Shot):
    def body(self):
        self.title("Newton's Method", animate=False)
        self.title("The Square Root of 2", 11416.15)
        h0 = M("x^2-2=0", size=64).move_to([0, 1.6, 0])
        self.go(11420.53, Write(h0), run=0.9)
        hf, hd, r0A, r0B, r1A, r1B = sq_board()
        self.go(11423.23, ReplacementTransform(h0, hf), run=0.8)
        self.go(11426.03, Write(hd), run=0.7)
        self.go(11428.01, Write(r0A), run=0.6)
        self.go(11429.69, Write(r0B[0:3]), run=0.6)
        self.go(11431.77, Write(r0B[3:]), run=0.6)
        self.go(11433.4, Write(r1A[0:2]), run=0.4)
        self.go(11434.6, Write(r1A[2:5]), run=1.0)
        self.go(11436.82, Write(r1A[5:]), run=0.4)
        self.go(11438.18, Write(r1B[0:2]), run=0.5)
        self.go(11439.62, Write(r1B[2]), run=0.6)
        self.go(11441.5, Write(r1B[3:]), run=0.5)


class K30_Sqrt2b(Shot):
    def body(self):
        self.title("The Square Root of 2", animate=False)
        hf, hd, r0A, r0B, r1A, r1B = sq_board()
        self.add(hf, hd, r0A, r0B, r1A, r1B)
        r1C = M("f(1.5)", "=", "0.25", r",\quad", "f'(1.5)", "=", "3", size=54)
        r1C[0].set_color(BLUE)
        r1C[4].set_color(PINK)
        r1C.shift([BX - r1C.get_left()[0], RY[1] - r1C[1].get_y(), 0])
        self.go(11443.64, TMT(r1B, r1C), run=0.8)
        r2A = M("x_2", "=", "1.5", "-", r"\frac{0.25}{3}", r"\approx", "1.4167", size=54)
        r2A[0].set_color(ORG)
        r2A[6].set_color(ORG)
        r2A.shift([AX - r2A.get_left()[0], RY[2] - r2A[1].get_y(), 0])
        self.go(11444.6, Write(r2A[0:2]), run=0.4)
        self.go(11445.78, Write(r2A[2:5]), run=1.2)
        self.go(11450.25, Write(r2A[5:]), run=0.5)
        self.wipe(11452.9, run=0.4)

        # one more step, against the true value
        c1 = M("x_3", r"\approx", "1.414216", size=64)
        c2 = M(r"\sqrt{2}", "=", r"1.41421356\ldots", size=64)
        c1[0].set_color(ORG)
        c2[0].set_color(YEL)
        c1.shift([-1.0 - c1[2].get_left()[0], 1.2 - c1[1].get_y(), 0])
        c2.shift([-1.0 - c2[2].get_left()[0], 0.0 - c2[1].get_y(), 0])
        self.go(11454.6, Write(c1[0:2]), run=0.4)
        self.go(11454.97, Write(c1[2]), run=0.8)
        self.go(11458.93, Write(c2[0:2]), run=0.6)
        self.go(11460.59, Write(c2[2]), run=1.0)

        # the guesses closing in on a number line
        nl = number_line((0.9, 1.6, 0.1), length=11, center=(0, -2.3, 0), size=34)
        rm = Line(nl.n2p(np.sqrt(2)) + UP * 0.28, nl.n2p(np.sqrt(2)) + DOWN * 0.28, color=YEL, stroke_width=5)
        rl = M(r"\sqrt{2}", size=38, color=YEL).next_to(rm, UP, buff=0.45)
        self.go(11463.2, Create(nl), FadeIn(nl.labels), Create(rm), FadeIn(rl), run=0.6)
        gs = [1.0, 1.5, 17 / 12, 1.4142156862745]
        d = Dot(nl.n2p(gs[0]), radius=0.1, color=ORG).set_z_index(6)
        self.go(11464.95, FadeIn(d, scale=0.5), run=0.3)
        trail = VGroup()
        for i, t in enumerate([11465.4, 11465.95, 11466.5]):
            a, b = nl.n2p(gs[i]), nl.n2p(gs[i + 1])
            arc = ArcBetweenPoints(a, b, angle=-0.5 if b[0] > a[0] else 0.5)
            ghost = Dot(a, radius=0.07, color=ORG).set_opacity(0.4)
            hop = DashedVMobject(arc.copy().set_stroke(ORG, 3), num_dashes=12)
            trail.add(ghost, hop)
            self.go(t, FadeIn(ghost), MoveAlongPath(d, arc), Create(hop), run=0.5)
        g1, g2 = c1[2][0:7], c2[2][0:7]
        ok = H("5 decimal places", 38, GRN).move_to([4.6, 0.6, 0])
        self.go(11467.71, g1.animate.set_color(GRN), g2.animate.set_color(GRN), run=0.5)
        self.play(Create(under(g1, GRN)), Create(under(g2, GRN)), FadeIn(ok, shift=LEFT * 0.1), run_time=0.5)
        self.go(11469.8, Circumscribe(VGroup(d, rm), color=YEL, buff=0.15), run=0.9)
        self.wipe(11471.2, run=0.35)


# ================================================================ 14. recap and the turn to integrals

class K30_Recap(Shot):
    def body(self):
        self.title("The Square Root of 2", animate=False)
        self.title("Chapter 10 Recap", 11471.85)
        po = pill("Optimization", YEL, size=40).move_to([-3.5, 1.6, 0])
        self.go(11472.95, FadeIn(po, shift=DOWN * 0.1), run=0.5)
        steps_ = [("1. set it up", 11474.53), ("2. constraint: one variable", 11477.83),
                  ("3. critical points, check", 11480.87)]
        ss = []
        for i, (s, t) in enumerate(steps_):
            m = H(s, 40).move_to([0, 0.5 - 1.05 * i, 0])
            m.shift([-6.2 - m.get_left()[0], 0, 0])
            self.go(t, FadeIn(m, shift=RIGHT * 0.1), run=0.5)
            ss.append(m)
        dv = Line([0.1, 2.0, 0], [0.1, -3.3, 0], color=FAINT, stroke_width=3)
        pr = pill("L'Hôpital", PINK, size=40).move_to([3.5, 1.6, 0])
        self.go(11483.7, Create(dv), FadeIn(pr, shift=DOWN * 0.1), run=0.5)
        cond = M(r"\frac{0}{0}", r"\ \text{or}\ ", r"\frac{\infty}{\infty}", size=50, color=YEL).move_to([3.5, 0.55, 0])
        cond[1].set_color(DIM)
        self.go(11484.99, Write(cond[0]), run=0.5)
        self.go(11486.03, Write(cond[1:]), run=0.6)
        rule = M(r"\frac{", "f", "}{", "g", "}", r"\ \to\ ", r"\frac{", "f'", "}{", "g'", "}", size=62).move_to([3.5, -1.2, 0])
        for i in (1, 7):
            rule[i].set_color(BLUE)
        for i in (3, 9):
            rule[i].set_color(ORG)
        self.go(11488.45, Write(rule[0:6]), run=0.6)
        self.go(11489.77, Write(rule[6:]), run=0.6)
        qr = M(r"\frac{gf'-fg'}{g^2}", size=48, color=DIM).move_to([3.5, -2.65, 0])
        nq = H("not the quotient rule", 34, RED)
        VGroup(nq, qr).arrange(RIGHT, buff=0.35)
        VGroup(nq, qr).shift([0.55 - nq.get_left()[0], -2.65 - qr.get_y(), 0])
        X = cross_mark(RED, 0.4).move_to(qr).stretch_to_fit_width(qr.width + 0.3)
        self.go(11490.69, FadeIn(qr), FadeIn(nq), run=0.4)
        self.play(Create(X), run_time=0.4)

        # the end of the derivative half
        self.wipe(11492.3, run=0.35)
        self.title("Halfway There", 11492.7)
        dd = M(r"\frac{d}{dx}", size=96, color=PINK).move_to([-3.2, 0.5, 0])
        dw = H("Derivatives", 50).next_to(dd, DOWN, buff=0.4)
        self.go(11493.55, Write(dd), FadeIn(dw, shift=UP * 0.1), run=0.7)
        ok = tick_mark(GRN, 0.6).next_to(dw, RIGHT, buff=0.35)
        self.go(11494.37, Create(ok), run=0.4)
        cov = H("limits, rules, rates, max and min", 34, DIM).next_to(dw, DOWN, buff=0.35)
        self.go(11495.79, FadeIn(cov, shift=UP * 0.1), run=0.5)
        it = M(r"\int", size=110, color=GRN).move_to([3.6, 0.5, 0])
        fl = CurvedArrow(dd.get_right() + RIGHT * 0.4 + UP * 0.3, it.get_left() + LEFT * 0.4 + UP * 0.3, angle=-0.9,
                         color=YEL, stroke_width=4, tip_length=0.2)
        self.go(11498.19, Create(fl), run=0.7)
        self.play(Write(it), run_time=0.6)
        sh = H("second half", 44, GRN).next_to(it, DOWN, buff=0.4).set_y(dw.get_y())
        self.go(11500.11, FadeIn(sh, shift=UP * 0.1), run=0.5)
