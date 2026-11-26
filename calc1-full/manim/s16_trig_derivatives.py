"""Builder 16: start of Chapter 6. The chapter's two parts, d/dx sin x = cos x from the graph (a tangent slides
along sin x while the lower graph traces its slope: it traces cos x) and from the definition (sum identity, the two
Chapter 3 limits), d/dx cos x = -sin x the same way, the four-step derivative cycle, tan x through the quotient rule,
the six-row table with the co- sign trick and the mirrored pairs, three worked combos, the x^3 tan x practice.
Colours: function = BLUE, derivative / slope = PINK, first factor / high = BLUE, second / low = ORG, answer = GRN."""
from common import *

D = r"\frac{d}{dx}"
LIM = r"\lim_{h\to 0}"


# ---------------------------------------------------------------- local helpers (patterns from s12 / s15)

_DG = {}


def glyphs(s, size=44, color=PINK):
    """A number built from cached glyphs: cheap to redraw every frame."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.04, aligned_edge=DOWN)
    ref = next((x for x, ch in zip(g, s) if ch.isdigit()), None)
    for x, ch in zip(g, s):
        if ch == "-" and ref is not None:
            x.set_y(ref.get_y())
    return g


def readout(fn, pos, size=44, color=PINK):
    """'slope = -1.0' following fn(); rounds first so a flat spot reads 0.0, never -0.0."""
    lab = M(r"\text{slope} =", size=size, color=color).move_to(pos)
    return VGroup(lab, always_redraw(lambda: glyphs(f"{round(fn(), 1) + 0:.1f}", size, color).next_to(lab, RIGHT, buff=0.15)))


def lower_trace(ax, ax2, f, fp, x0, xt, xm):
    """The slope graph drawn as the tangent moves: trace up to the furthest x reached, a bar, a dot, a guide."""
    xm.add_updater(lambda m: m.set_value(max(m.get_value(), xt.get_value())))
    tr = always_redraw(lambda: ax2.plot(fp, x_range=[x0, max(x0 + 0.01, xm.get_value()), 0.02], color=PINK, stroke_width=5))
    bar = always_redraw(lambda: Line(ax2.c2p(xt.get_value(), 0), ax2.c2p(xt.get_value(), fp(xt.get_value()) + 1e-4),
                                     color=PINK, stroke_width=7, stroke_opacity=0.5))
    dot = always_redraw(lambda: pt(ax2, xt.get_value(), fp(xt.get_value()), PINK))
    guide = always_redraw(lambda: DashedLine(ax.c2p(xt.get_value(), f(xt.get_value())), ax2.c2p(xt.get_value(), fp(xt.get_value())),
                                             color=FAINT, stroke_width=2, dash_length=0.08))
    return VGroup(tr, bar, dot, guide)


def ring(p, color=YEL, r=0.22):
    c = p.get_center() if isinstance(p, Mobject) else np.array(p, float)
    return Circle(radius=r, color=color, stroke_width=4).move_to(c)


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


_GL = {}


def gl(p):
    if p not in _GL:
        _GL[p] = len(M(p)[0])
    return _GL[p]


def qfrac(num, den, pre=(), size=60, ncol=None, dcol=None):
    """M(*pre, \\frac{num}{den}) with glyphs tagged: .pre, .n[i], .bar, .den, .num, .fr."""
    m = M(*pre, r"\frac{" + " ".join(num) + "}{" + " ".join(den) + "}", size=size)
    fr = m[len(pre)]
    i, n = 0, []
    for p in num:
        k = gl(p); n.append(fr[i:i + k]); i += k
    m.bar = fr[i]
    m.num, m.den, m.fr, m.n, m.pre = fr[:i], fr[i + 1:], fr, n, m[:len(pre)]
    for piece, c in zip(n, ncol or []):
        if c: piece.set_color(c)
    if dcol:
        m.den.set_color(dcol)
    return m


def on_bar(m, x, y):
    m.move_to([x, m.get_y(), 0])
    m.shift(UP * (y - m.bar.get_y()))
    return m


def eq_at(m, i, x, y=None):
    """Shift m so its part i (the '=') sits at column x (and row y if given)."""
    m.shift(RIGHT * (x - m[i].get_x()) + (UP * (y - m[i].get_y()) if y is not None else 0))
    return m


def badge(n):
    c = Circle(radius=0.32, color=YEL, stroke_width=4)
    return VGroup(c, H(str(n), 40).move_to(c))


def unclock(*ms):
    for m in ms:
        for x in m.get_family():
            x.clear_updaters()


# ---------------------------------------------------------------- the two-graph board: f on top, its slope below

TW, TH, TY = 8.2, 2.4, 1.5
TOP_C, LOW_C = (-2.1, 0.95, 0), (-2.1, -2.05, 0)
XE = 2 * PI
RULE_POS = (4.75, 1.85, 0)
RD_POS = (4.3, 0.75, 0)


def tax(center):
    ax = Axes(x_range=[0, XE + 0.35, PI / 2], y_range=[-TY, TY, 0.5], x_length=TW, y_length=TH,
              axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, tick_size=0.05)).move_to(center)
    ax.labels = VGroup(*[M(s, size=30, color=FAINT).next_to(ax.c2p(0, v), LEFT, buff=0.12) for s, v in (("1", 1), ("-1", -1))])
    return ax


def trig_board(f, fp, ftex, gtex, peak):
    ax, ax2 = tax(TOP_C), tax(LOW_C)
    c = curve(ax, f, (0, XE, 0.02))
    xl = VGroup(*[M(pi_label(k * PI / 2), size=32, color=FAINT).move_to([ax2.c2p(k * PI / 2, 0)[0], -3.5, 0]) for k in (1, 2, 3, 4)])
    gd = VGroup(*[DashedLine(ax.c2p(k * PI / 2, TY), ax2.c2p(k * PI / 2, -TY), color=FAINT, stroke_width=1.5,
                             dash_length=0.06).set_stroke(opacity=0.6) for k in (1, 2, 3, 4)])
    fl = M(ftex, size=44, color=BLUE).next_to(ax.c2p(peak, 1), UP, buff=0.3)
    gl_ = M(gtex, size=44, color=PINK).next_to(ax2.x_axis.get_end(), RIGHT, buff=0.2)
    return ax, ax2, c, xl, gd, fl, gl_


def rule(fn, d, size=48):
    m = M(D + fn, "=", d, size=size)
    m[2].set_color(PINK)
    return m


def sin_board(x):
    """Static sine board at tracker value x (trace drawn to x)."""
    ax, ax2, c, xl, gd, fl, gl_ = trig_board(np.sin, np.cos, r"\sin x", r"\cos x", PI / 2)
    xt, xm = ValueTracker(x), ValueTracker(x)
    tg = live_tangent(ax, np.sin, xt, length=1.8, readout=False)
    rd = readout(lambda: slope(np.sin, xt.get_value()), RD_POS)
    lt = lower_trace(ax, ax2, np.sin, np.cos, 0.0, xt, xm)
    return dict(ax=ax, ax2=ax2, c=c, xl=xl, gd=gd, fl=fl, gl=gl_, xt=xt, xm=xm, tg=tg, rd=rd, lt=lt)


# ================================================================ the two parts of the chapter

def parts_board():
    b1 = badge(1).move_to([-5.0, 1.25, 0])
    h1 = H("Trig derivatives", 52)
    h1.move_to([-4.4 + h1.width / 2, 1.25, 0])
    fs = VGroup(*[M(s, size=50, color=BLUE) for s in (r"\sin x", r"\cos x", r"\tan x", r"\sec x", r"\csc x", r"\cot x")])
    fs.arrange(RIGHT, buff=0.55)
    fs.move_to([-4.4 + fs.width / 2, 0.3, 0])
    b2 = badge(2).move_to([-5.0, -1.0, 0])
    h2 = H("The chain rule", 52)
    h2.move_to([-4.4 + h2.width / 2, -1.0, 0])
    bl = brush_line(h2.width + 0.3, center=h2.get_bottom() + DOWN * 0.12)
    ex = VGroup(*[M(s, size=50, color=BLUE) for s in (r"\sin(x^2)", r"(3x+1)^5", r"e^{5x}")]).arrange(RIGHT, buff=0.9)
    ex.move_to([-4.4 + ex.width / 2, -2.25, 0])
    return b1, h1, fs, b2, h2, bl, ex


class K16_TwoParts(Shot):
    def body(self):
        self.title("Two Parts", 5789.69)
        b1, h1, fs, b2, h2, bl, ex = parts_board()
        self.go(5791.67, FadeIn(b1, scale=0.8), run=0.4)
        self.go(5792.51, Write(h1), run=0.6)
        self.go(5793.85, FadeIn(fs[0], shift=UP * 0.1), run=0.3)
        self.go(5794.21, FadeIn(fs[1], shift=UP * 0.1), run=0.3)
        self.go(5795.55, LaggedStart(*[FadeIn(x, shift=UP * 0.1) for x in fs[2:]], lag_ratio=0.25), run=0.7)
        self.go(5797.21, FadeIn(b2, scale=0.8), Write(h2), run=0.6)
        self.go(5800.67, Create(bl), run=0.6)
        self.go(5803.23, FadeIn(ex[0], shift=UP * 0.1), run=0.4)
        self.go(5803.89, FadeIn(ex[1], shift=UP * 0.1), run=0.4)
        self.go(5804.67, FadeIn(ex[2], shift=UP * 0.1), run=0.4)


# ================================================================ d/dx sin x = cos x

class K16_SinRule(Shot):
    def body(self):
        self.title("Two Parts", animate=False)
        self.add(*parts_board())
        self.wipe(5806.05, run=0.35)
        self.title("Derivative of Sine", 5806.93)
        big = rule(r"\sin x", r"\cos x", size=88).move_to([0, 0.5, 0])
        self.go(5808.21, Write(big[0]), run=0.6)
        self.go(5809.55, Write(big[1]), run=0.3)
        self.go(5809.87, Write(big[2]), run=0.5)
        fr = panel(big, PURP, buff=0.35)
        self.go(5810.4, Create(fr), run=0.5)
        l1 = VGroup(badge(1), H("the graph", 44)).arrange(RIGHT, buff=0.3)
        l2 = VGroup(badge(2), H("the proof", 44, DIM)).arrange(RIGHT, buff=0.3)
        l2[0][0].set_color(DIM)
        VGroup(l1, l2).arrange(RIGHT, buff=1.4).move_to([0, -1.9, 0])
        self.go(5812.11, FadeIn(l2, shift=UP * 0.1), run=0.4)
        self.go(5813.67, FadeIn(l1, shift=UP * 0.1), run=0.4)
        self.go(5814.6, Circumscribe(l1, color=YEL, buff=0.12), run=0.6)
        small = rule(r"\sin x", r"\cos x").move_to(RULE_POS)
        self.go(5815.35, FadeOut(VGroup(l1, l2, fr)), ReplacementTransform(big, small), run=0.7)


class K16_SinSlope(Shot):
    def body(self):
        self.title("Derivative of Sine", animate=False)
        R = rule(r"\sin x", r"\cos x").move_to(RULE_POS)
        self.add(R)
        b = sin_board(0.0)
        ax, ax2, xt = b["ax"], b["ax2"], b["xt"]
        self.title("The Slope of Sine", 5816.29)
        self.go(5817.01, FadeIn(ax), FadeIn(ax.labels), run=0.3)
        self.go(5817.3, draw(b["c"], run=1.0), run=1.0)
        self.play(FadeIn(b["fl"]), run_time=0.3)
        self.add(b["xm"])
        self.go(5818.63, FadeIn(b["tg"]), FadeIn(b["rd"]), FadeIn(ax2), FadeIn(ax2.labels), FadeIn(b["xl"]), FadeIn(b["gd"]), run=0.6)
        self.go(5819.49, FadeIn(b["lt"]), run=0.4)
        self.go(5820.61, Circumscribe(b["rd"], color=YEL, buff=0.1), run=0.7)
        r0 = ring(ax2.c2p(0, 1))
        self.go(5822.93, Create(r0), run=0.4)
        self.go(5823.3, FadeOut(r0), xt.animate.set_value(PI / 2), run=1.5)
        r1 = ring(ax.c2p(PI / 2, 1))
        self.go(5825.87, Create(r1), run=0.4)
        self.go(5828.99, Circumscribe(b["rd"], color=YEL, buff=0.1), run=0.7)
        self.go(5830.87, FadeOut(r1), xt.animate.set_value(PI), run=1.8)
        self.go(5834.47, Circumscribe(b["rd"], color=YEL, buff=0.1), run=0.7)
        self.go(5835.99, xt.animate.set_value(1.5 * PI), run=1.6)
        r3 = ring(ax.c2p(1.5 * PI, -1))
        self.go(5837.93, Create(r3), run=0.4)
        self.go(5839.03, FadeOut(r3), run=0.3)
        self.play(xt.animate.set_value(XE), run_time=1.4)


def iscos_parts():
    R = rule(r"\sin x", r"\cos x").move_to(RULE_POS)
    b = sin_board(XE)
    ax2 = b["ax2"]
    dots = [pt(ax2, x, y) for x, y in ((0, 1), (PI / 2, 0), (PI, -1), (1.5 * PI, 0))]
    vals = [M(r"\cos 0", "=", "1", size=48), M(r"\cos\frac{\pi}{2}", "=", "0", size=48), M(r"\cos\pi", "=", "-1", size=48)]
    for k, v in enumerate(vals):
        v[0].set_color(BLUE); v[2].set_color(ORG)
        eq_at(v, 1, 4.75, -0.45 - 1.0 * k)
    cc = DashedVMobject(curve(ax2, np.cos, (0, XE, 0.02), color=BLUE, width=3), num_dashes=60)
    return R, b, dots, vals, cc


def sin_static(b):
    return [b[k] for k in ("ax", "c", "fl", "ax2", "xl", "gd", "xm", "tg", "rd", "lt")] + [b["ax"].labels, b["ax2"].labels]


class K16_IsCosine(Shot):
    def body(self):
        self.title("The Slope of Sine", animate=False)
        R, b, dots, vals, cc = iscos_parts()
        self.add(R, *sin_static(b))
        for t, d in zip((5841.05, 5842.51, 5844.37, 5846.01), dots):
            self.go(t, FadeIn(d, scale=0.5), run=0.4)
        self.go(5850.27, Write(b["gl"]), run=0.6)
        for t, v, d in zip((5851.91, 5853.49, 5856.01), vals, dots):
            self.go(t, Write(v), d.animate.set_color(YEL), run=0.8)
        self.go(5859.13, Create(cc), run=1.5)
        self.go(5860.93, Circumscribe(R, color=YEL, buff=0.12), run=0.7)


# ================================================================ the proof from the definition

def proof_rows():
    DEF = qfrac([r"\sin(x+h)", "-", r"\sin x"], ["h"], pre=[D + r"\sin x", "=", LIM], size=54)
    on_bar(DEF, 0, 1.45)
    ID = M(r"\sin(x+h)", "=", r"\sin x\cos h", "+", r"\cos x\sin h", size=50).move_to([0, -0.4, 0])
    fr = panel(ID, YEL, buff=0.25, width=3)
    lab = H("identity", 34, YEL).next_to(fr, UP, buff=0.08).align_to(fr, LEFT).shift(RIGHT * 0.2)
    R3 = qfrac([r"\sin x\cos h", "+", r"\cos x\sin h", "-", r"\sin x"], ["h"], pre=["=", LIM], size=54)
    on_bar(R3, 0, -2.15)
    R3b = qfrac([r"\sin x", r"(\cos h-1)", "+", r"\cos x\sin h"], ["h"], pre=["=", LIM], size=54)
    on_bar(R3b, 0, -2.15)
    eq_at(R3b, 0, R3[0].get_x())
    R4 = M("=", LIM, r"\Big[", r"\sin x", r"\cdot", r"\frac{\cos h-1}{h}", "+", r"\cos x", r"\cdot", r"\frac{\sin h}{h}", r"\Big]", size=54)
    R4.move_to([0, -0.6, 0])
    return DEF, ID, fr, lab, R3, R3b, R4


def r3b_up(R3b, R4):
    return R3b.copy().set_color(CHALK).shift(RIGHT * (R4[0].get_x() - R3b[0].get_x()) + UP * (1.45 - R3b.bar.get_y()))


class K16_Proof(Shot):
    def body(self):
        self.title("The Slope of Sine", animate=False)
        R, b, dots, vals, cc = iscos_parts()
        for d in dots[:3]:
            d.set_color(YEL)
        self.add(R, *sin_static(b), *dots, b["gl"], *vals, cc)
        unclock(b["tg"], b["rd"], b["lt"])
        self.wipe(5861.85, run=0.4)
        self.title("Proof from the Definition", 5862.73)
        DEF, ID, fr, lab, R3, R3b, R4 = proof_rows()
        self.go(5863.99, Write(DEF.pre[0:2]), run=0.6)
        self.go(5865.71, Write(DEF.pre[2]), run=0.3)
        self.go(5866.29, Write(DEF.n[0]), run=0.4)
        self.go(5867.63, Write(DEF.n[1]), run=0.25)
        self.go(5868.15, Write(DEF.n[2]), run=0.35)
        self.go(5868.91, Write(VGroup(DEF.bar, DEF.den)), run=0.4)
        # the sum identity
        self.go(5871.31, Create(fr), FadeIn(lab), run=0.5)
        self.go(5873.09, Write(ID[0]), Circumscribe(DEF.n[0], color=YEL, buff=0.08), run=0.5)
        self.go(5874.67, Write(ID[1]), run=0.3)
        self.go(5875.03, Write(ID[2]), run=0.6)
        self.go(5876.45, Write(ID[3]), run=0.2)
        self.go(5876.69, Write(ID[4]), run=0.6)
        # the top becomes
        self.go(5878.85, Write(R3.pre), run=0.4)
        self.go(5879.63, TransformFromCopy(ID[2], R3.n[0]), Create(R3.bar), Write(R3.den), run=0.6)
        self.go(5881.03, TransformFromCopy(ID[3], R3.n[1]), run=0.25)
        self.go(5881.29, TransformFromCopy(ID[4], R3.n[2]), run=0.6)
        self.go(5882.61, Write(R3.n[3]), run=0.3)
        self.go(5882.93, Write(R3.n[4]), run=0.35)
        # group the sin x terms
        self.go(5884.67, R3.n[0][:4].animate.set_color(YEL), R3.n[4].animate.set_color(YEL), run=0.4)
        R3b.n[0].set_color(YEL)
        self.go(5885.85, ReplacementTransform(R3, R3b), run=1.0)
        # divide everything by h
        up = r3b_up(R3b, R4)
        self.go(5890.25, FadeOut(VGroup(DEF, ID, fr, lab)), Transform(R3b, up), run=0.7)
        self.go(5893.11, Write(R4[0:3]), run=0.3)
        self.go(5893.43, Write(R4[3:5]), run=0.5)
        self.go(5894.65, Write(R4[5]), run=0.6)
        self.go(5897.31, Write(R4[6]), run=0.3)
        self.go(5898.29, Write(R4[7:9]), run=0.5)
        self.go(5899.57, Write(R4[9:]), run=0.6)


class K16_ProofLimits(Shot):
    def body(self):
        self.title("Proof from the Definition", animate=False)
        DEF, ID, fr, lab, R3, R3b, R4 = proof_rows()
        up = r3b_up(R3b, R4)
        self.add(up, R4)
        y4 = 0.95
        self.go(5901.99, FadeOut(up), R4.animate.shift(UP * (y4 - R4.get_y())), run=0.6)
        f1, f2 = R4[5], R4[9]
        u1, u2 = under(f1), under(f2)
        self.go(5902.67, Create(u1), Create(u2), run=0.5)
        ch = H("the two Chapter 3 limits", 36, YEL).move_to([(f1.get_x() + f2.get_x()) / 2, 2.05, 0])
        self.go(5903.63, FadeIn(ch, shift=DOWN * 0.1), run=0.5)
        self.go(5906.55, Circumscribe(f1, color=YEL, buff=0.08), run=0.6)
        L0 = M(r"\to 0", size=48, color=YEL).next_to(u1, DOWN, buff=0.2)
        self.go(5909.13, Write(L0), run=0.4)
        self.go(5910.71, Circumscribe(f2, color=YEL, buff=0.08), run=0.6)
        L1 = M(r"\to 1", size=48, color=YEL).next_to(u2, DOWN, buff=0.2)
        self.go(5911.79, Write(L1), run=0.4)
        R5 = eq_at(M("=", r"\sin x", r"\cdot", "0", "+", r"\cos x", r"\cdot", "1", size=54), 0, R4[0].get_x(), -1.45)
        R5[3].set_color(YEL); R5[7].set_color(YEL)
        self.go(5913.57, Write(R5[0]), run=0.3)
        self.go(5914.73, Write(R5[1:3]), run=0.4)
        self.go(5915.69, TransformFromCopy(L0[0][-1], R5[3]), run=0.5)
        self.go(5916.61, Write(R5[4]), run=0.25)
        self.go(5916.93, Write(R5[5:7]), run=0.5)
        self.go(5918.05, TransformFromCopy(L1[0][-1], R5[7]), run=0.35)
        R6 = eq_at(M("=", r"\;\cos x", size=62), 0, R4[0].get_x(), -2.65)
        R6[1].set_color(PINK)
        self.go(5918.43, Write(R6[0]), run=0.3)
        self.go(5919.27, Write(R6[1]), run=0.4)
        bx = answer_box(R6[1])
        self.go(5919.8, Create(bx), run=0.5)
        self.go(5922.27, Circumscribe(f1, color=YEL, buff=0.08), Circumscribe(f2, color=YEL, buff=0.08), run=0.8)
        self.go(5925.11, Circumscribe(bx, color=GRN, buff=0.08), run=0.8)


# ================================================================ d/dx cos x = -sin x

def nsin(x):
    return -np.sin(x)


def cos_board(x):
    ax, ax2, c, xl, gd, fl, gl_ = trig_board(np.cos, nsin, r"\cos x", r"-\sin x", XE)
    xt, xm = ValueTracker(x), ValueTracker(x)
    tg = live_tangent(ax, np.cos, xt, length=1.8, readout=False)
    rd = readout(lambda: slope(np.cos, xt.get_value()), RD_POS)
    lt = lower_trace(ax, ax2, np.cos, nsin, 0.0, xt, xm)
    return dict(ax=ax, ax2=ax2, c=c, xl=xl, gd=gd, fl=fl, gl=gl_, xt=xt, xm=xm, tg=tg, rd=rd, lt=lt)


ID2_ROW = -0.7


def cos_identity():
    ID = M(r"\cos(x+h)", "=", r"\cos x\cos h", "-", r"\sin x\sin h", size=54).move_to([0, ID2_ROW, 0])
    fr = panel(ID, YEL, buff=0.25, width=3)
    lab = H("identity", 34, YEL).next_to(fr, UP, buff=0.08).align_to(fr, LEFT).shift(RIGHT * 0.2)
    return ID, fr, lab


class K16_Cosine(Shot):
    def body(self):
        self.title("Proof from the Definition", animate=False)
        DEF, ID, fr, lab, R3, R3b, R4 = proof_rows()
        # end state of K16_ProofLimits, rebuilt
        R4.shift(UP * (0.95 - R4.get_y()))
        self.add(R4, under(R4[5]), under(R4[9]))
        self.add(H("the two Chapter 3 limits", 36, YEL).move_to([(R4[5].get_x() + R4[9].get_x()) / 2, 2.05, 0]))
        self.add(M(r"\to 0", size=48, color=YEL).next_to(under(R4[5]), DOWN, buff=0.2),
                 M(r"\to 1", size=48, color=YEL).next_to(under(R4[9]), DOWN, buff=0.2))
        R5 = eq_at(M("=", r"\sin x", r"\cdot", "0", "+", r"\cos x", r"\cdot", "1", size=54), 0, R4[0].get_x(), -1.45)
        R5[3].set_color(YEL); R5[7].set_color(YEL)
        R6 = eq_at(M("=", r"\;\cos x", size=62), 0, R4[0].get_x(), -2.65)
        R6[1].set_color(PINK)
        self.add(R5, R6, answer_box(R6[1]))

        self.wipe(5926.45, run=0.35)
        self.title("Derivative of Cosine", 5926.89)
        big = rule(r"\cos x", r"-\sin x", size=84).move_to([0, 0.4, 0])
        self.go(5927.4, Write(big[0]), run=0.6)
        self.go(5928.39, Write(big[1]), run=0.3)
        self.go(5928.75, Write(big[2]), run=0.6)
        b = cos_board(0.0)
        ax, ax2, xt = b["ax"], b["ax2"], b["xt"]
        small = rule(r"\cos x", r"-\sin x").move_to(RULE_POS)
        self.go(5930.51, ReplacementTransform(big, small), FadeIn(ax), FadeIn(ax.labels), run=0.7)
        self.go(5931.67, draw(b["c"], run=1.0), run=1.0)
        self.play(FadeIn(b["fl"]), run_time=0.3)
        self.add(b["xm"])
        rp = ring(ax.c2p(0, 1))
        self.go(5933.05, FadeIn(b["tg"]), FadeIn(b["rd"]), Create(rp), run=0.5)
        self.go(5935.13, FadeIn(ax2), FadeIn(ax2.labels), FadeIn(b["xl"]), FadeIn(b["gd"]), run=0.5)
        self.go(5935.73, Circumscribe(b["rd"], color=YEL, buff=0.1), FadeIn(b["lt"]), run=0.6)
        self.go(5936.49, FadeOut(rp), run=0.3)
        self.go(5937.15, xt.animate.set_value(PI), run=2.0)
        self.go(5939.57, Write(b["gl"]), run=0.6)
        r0 = ring(ax2.c2p(0, 0))
        self.go(5940.87, Create(r0), run=0.4)
        self.go(5941.69, FadeOut(r0), xt.animate.set_value(XE), run=1.4)
        tk = tick_mark(GRN, 0.5).next_to(b["gl"], RIGHT, buff=0.25)
        self.go(5943.23, Create(tk), run=0.4)
        # the proof works the same way
        mid = rule(r"\cos x", r"-\sin x", size=60).move_to([0, 1.25, 0])
        unclock(b["tg"], b["rd"], b["lt"])
        self.go(5944.31, *[FadeOut(m) for m in self.board() if m is not small], ReplacementTransform(small, mid), run=0.6)
        ID2, fr2, lab2 = cos_identity()
        self.go(5946.39, Create(fr2), FadeIn(lab2), Write(ID2), run=1.2)


# ================================================================ the sign, and the cycle

def drow(a, b, y, size=62):
    A = M(a, size=size, color=BLUE)
    ar = Arrow(LEFT * 0.75, RIGHT * 0.75, buff=0, color=PINK, stroke_width=5, tip_length=0.22, max_tip_length_to_length_ratio=0.3)
    dd = M(D, size=34, color=PINK).next_to(ar, UP, buff=0.08)
    B = M(b, size=size, color=PINK)
    g = VGroup(A, VGroup(ar, dd), B).arrange(RIGHT, buff=0.4)
    g[1].shift(UP * (A.get_y() - ar.get_y()))
    g.move_to([0, y, 0])
    return g


CC, CR = np.array([0, -0.6, 0]), 1.85


def cycle_parts():
    names = (r"\sin x", r"\cos x", r"-\sin x", r"-\cos x")
    angs = (PI / 2, 0, -PI / 2, PI)
    nodes = VGroup()
    for s, a in zip(names, angs):
        m = M(s, size=56, color=BLUE)
        if s[0] == "-":
            m[0][0].set_color(YEL)
        d = np.array([np.cos(a), np.sin(a), 0])
        off = m.width / 2 + 0.25 if abs(d[0]) > 0.5 else m.height / 2 + 0.2
        nodes.add(m.move_to(CC + d * (CR + off)))
    arcs = VGroup()
    for a in angs:
        arcs.add(Arc(radius=CR, start_angle=a - 0.28, angle=-(PI / 2 - 0.56), arc_center=CC, color=PINK, stroke_width=5)
                 .add_tip(tip_length=0.2))
    mid = M(D, size=52, color=PINK).move_to(CC)
    f4 = M(r"\frac{d^4}{dx^4}\sin x", "=", r"\sin x", size=48).move_to([4.6, -2.6, 0])
    f4[0].set_color(PINK); f4[2].set_color(BLUE)
    return nodes, arcs, mid, f4


class K16_Cycle(Shot):
    def body(self):
        self.title("Derivative of Cosine", animate=False)
        ID2, fr2, lab2 = cos_identity()
        self.add(rule(r"\cos x", r"-\sin x", size=60).move_to([0, 1.25, 0]), ID2, fr2, lab2)
        self.wipe(5948.1, run=0.4)
        self.title("Watch the Sign", 5948.99)
        r1 = drow(r"\sin x", r"\cos x", 0.8)
        self.go(5951.19, Write(r1[0]), run=0.4)
        self.go(5952.21, GrowArrow(r1[1][0]), FadeIn(r1[1][1]), run=0.4)
        self.go(5952.69, Write(r1[2]), run=0.4)
        tk = tick_mark(GRN, 0.5).next_to(r1, RIGHT, buff=0.5)
        self.go(5953.49, Create(tk), run=0.4)
        r2 = drow(r"\cos x", r"-\sin x", -0.9)
        r2.align_to(r1, LEFT)
        r2[2][0][0].set_color(YEL)
        self.go(5954.65, Write(r2[0]), run=0.4)
        self.go(5955.57, GrowArrow(r2[1][0]), FadeIn(r2[1][1]), run=0.4)
        self.go(5956.23, Write(r2[2]), run=0.4)
        self.go(5956.7, Circumscribe(r2[2][0][0], color=YEL, buff=0.1), run=0.6)
        # the four-step cycle
        self.wipe(5957.47, run=0.4)
        self.title("The Derivative Cycle", 5958.0)
        nodes, arcs, mid, f4 = cycle_parts()
        self.go(5959.69, FadeIn(nodes[0], shift=UP * 0.1), run=0.4)
        self.go(5960.59, Create(arcs[0]), FadeIn(mid), run=0.4)
        self.go(5961.13, FadeIn(nodes[1], shift=UP * 0.1), run=0.4)
        self.go(5961.59, Create(arcs[1]), run=0.4)
        self.go(5962.17, FadeIn(nodes[2], shift=UP * 0.1), run=0.4)
        self.go(5962.93, Create(arcs[2]), run=0.4)
        self.go(5963.39, FadeIn(nodes[3], shift=UP * 0.1), run=0.4)
        self.go(5964.29, Create(arcs[3]), run=0.4)
        self.go(5964.97, Circumscribe(nodes[0], color=YEL, buff=0.12), run=0.6)
        self.go(5966.37, Write(f4), run=0.8)


# ================================================================ tan x through the quotient rule

def tan_rows():
    R1 = qfrac([r"\sin x"], [r"\cos x"], pre=[r"\tan x", "="], ncol=[BLUE], dcol=ORG, size=62)
    on_bar(R1, 0, 1.45)
    hi = H("high", 36, BLUE).next_to(R1.num, RIGHT, buff=0.35)
    lo = H("low", 36, ORG).next_to(R1.den, RIGHT, buff=0.35)
    R2 = qfrac([r"\cos x", r"\cdot", r"\cos x", "-", r"\sin x", r"\cdot", r"(-\sin x)"], [r"\cos^2 x"],
               pre=[r"(\tan x)'", "="], ncol=[ORG, None, PINK, None, BLUE, None, PINK], dcol=ORG, size=58)
    on_bar(R2, 0, -0.4)
    x_eq = R2.pre[1].get_x()
    R3 = qfrac([r"\cos^2 x", "+", r"\sin^2 x"], [r"\cos^2 x"], pre=["="], size=58)
    on_bar(R3, 0, -2.35); eq_at(R3, 0, x_eq)
    R3b = qfrac(["1"], [r"\cos^2 x"], pre=["="], size=58)
    on_bar(R3b, 0, -2.35); eq_at(R3b, 0, x_eq)
    R3c = eq_at(M("=", r"\;\sec^2 x", size=62), 0, x_eq, -2.35)
    return R1, hi, lo, R2, R3, R3b, R3c


class K16_Tangent(Shot):
    def body(self):
        self.title("The Derivative Cycle", animate=False)
        nodes, arcs, mid, f4 = cycle_parts()
        self.add(nodes, arcs, mid, f4)
        self.wipe(5969.45, run=0.35)
        self.title("Derivative of Tangent", 5969.8)
        R1, hi, lo, R2, R3, R3b, R3c = tan_rows()
        self.go(5970.35, Write(R1.pre), run=0.5)
        self.go(5971.25, Write(R1.n[0]), Create(R1.bar), run=0.4)
        self.go(5971.87, Write(R1.den), run=0.4)
        self.go(5973.43, FadeIn(hi, shift=LEFT * 0.1), FadeIn(lo, shift=LEFT * 0.1), run=0.5)
        self.go(5974.31, Write(R2.pre), run=0.5)
        self.go(5975.83, Write(R2.n[0]), Create(R2.bar), run=0.4)
        self.go(5976.61, Write(R2.n[1]), run=0.2)
        self.go(5977.11, Write(R2.n[2]), run=0.3)
        self.go(5977.45, Write(R2.n[3]), run=0.25)
        self.go(5979.53, Write(R2.n[4]), run=0.3)
        self.go(5980.35, Write(R2.n[5]), run=0.2)
        self.go(5980.71, Write(R2.n[6]), run=0.5)
        self.go(5982.31, Write(R2.den), run=0.4)
        # the top is cos^2 + sin^2 = 1
        self.go(5984.15, Write(R3.pre), Create(R3.bar), Write(R3.den), run=0.4)
        self.go(5984.63, Write(R3.n[0]), run=0.3)
        self.go(5985.39, Write(R3.n[1]), run=0.2)
        self.go(5985.71, Write(R3.n[2]), run=0.3)
        one = M("=1", size=48, color=YEL).next_to(R3.num, RIGHT, buff=0.3)
        self.go(5986.37, Circumscribe(R3.num, color=YEL, buff=0.08), run=0.5)
        self.go(5986.93, Write(one), run=0.3)
        self.go(5988.13, ReplacementTransform(R3, R3b), FadeOut(one), run=0.6)
        sn = M(r"\frac{1}{\cos x}", "=", r"\sec x", size=50, color=YEL).move_to([4.5, -2.35, 0])
        self.go(5990.43, Write(sn), run=0.8)
        self.go(5993.15, Circumscribe(R2.pre[0], color=YEL, buff=0.1), run=0.6)
        self.go(5995.01, ReplacementTransform(R3b, R3c), run=0.6)
        self.play(Create(answer_box(R3c[1])), run_time=0.5)


# ================================================================ the six derivatives as a table

CX, RY = (-3.35, 3.35), (1.45, -0.35, -2.15)
CELLS = (((r"\sin x", r"\cos x"), (r"\cos x", r"-\sin x")),
         ((r"\tan x", r"\sec^2 x"), (r"\cot x", r"-\csc^2 x")),
         ((r"\sec x", r"\sec x\tan x"), (r"\csc x", r"-\csc x\cot x")))


def table():
    cells = []
    for r, row in enumerate(CELLS):
        out = []
        for c, (f, d) in enumerate(row):
            m = M(D, f, "=", d, size=52)
            m[1].set_color(BLUE); m[3].set_color(PINK)
            out.append(m.move_to([CX[c], RY[r], 0]))
        cells.append(out)
    frame = RoundedRectangle(width=13.4, height=5.4, corner_radius=0.25, stroke_color=PURP, stroke_width=3).move_to([0, -0.35, 0])
    grid = VGroup(Line([0, 2.35, 0], [0, -3.05, 0]), Line([-6.7, 0.55, 0], [6.7, 0.55, 0]),
                  Line([-6.7, -1.25, 0], [6.7, -1.25, 0])).set_stroke(FAINT, 2)
    return cells, frame, grid


class K16_Table(Shot):
    def body(self):
        self.title("Derivative of Tangent", animate=False)
        R1, hi, lo, R2, R3, R3b, R3c = tan_rows()
        sn = M(r"\frac{1}{\cos x}", "=", r"\sec x", size=50, color=YEL).move_to([4.5, -2.35, 0])
        self.add(R1, hi, lo, R2, R3c, answer_box(R3c[1]), sn)
        self.wipe(5996.95, run=0.35)
        self.title("Six Trig Derivatives", 5997.3)
        cells, frame, grid = table()
        self.go(5997.8, Create(frame), Create(grid), FadeIn(cells[0][0]), FadeIn(cells[0][1]), FadeIn(cells[1][0]), run=0.7)
        for c, ts in ((cells[1][1], (6004.0, 6005.39, 6005.71)), (cells[2][0], (6008.9, 6010.19, 6010.55)),
                      (cells[2][1], (6013.0, 6014.61, 6015.03))):
            self.go(ts[0], Write(c[0:2]), run=0.6)
            self.go(ts[1], Write(c[2]), run=0.2)
            self.go(ts[2], Write(c[3]), run=0.9)


class K16_CoTrick(Shot):
    def body(self):
        self.title("Six Trig Derivatives", animate=False)
        cells, frame, grid = table()
        self.add(frame, grid, *[c for row in cells for c in row])
        self.title("A Memory Trick", 6018.5)
        right = [cells[r][1] for r in range(3)]
        for t, c in zip((6022.99, 6024.47, 6025.17), right):
            self.go(t, c[1].animate.set_color(YEL), run=0.35)
        rings = VGroup(*[ring(c[3][0][0], r=0.24) for c in right])
        self.go(6026.83, Create(rings), run=0.5)
        self.go(6029.37, Circumscribe(VGroup(*[cells[r][0] for r in range(3)]), color=DIM, buff=0.12), run=0.8)
        # the pairs mirror each other
        self.go(6030.59, FadeOut(rings), *[c[1].animate.set_color(BLUE) for c in right], run=0.5)
        def rows(keep, t, run=0.4):
            self.go(t, *[c.animate.set_opacity(1 if keep is None or r == keep else 0.22)
                         for r, row in enumerate(cells) for c in row], run=run)

        rows(1, 6032.0)
        self.go(6033.15, Circumscribe(cells[1][0][3], color=PINK, buff=0.08), run=0.5)
        self.go(6035.47, Circumscribe(cells[1][1][3], color=PINK, buff=0.08), run=0.5)
        rows(2, 6036.5, run=0.5)
        self.go(6038.31, Circumscribe(cells[2][0][3], color=PINK, buff=0.08), run=0.5)
        self.go(6040.61, Circumscribe(cells[2][1][3], color=PINK, buff=0.08), run=0.5)
        rows(None, 6042.45)
        for t, c in zip((6043.43, 6044.33, 6045.35), (cells[0][0], cells[0][1], cells[1][0])):
            self.go(t, Create(under(c, YEL, 0.12)), run=0.4)
        self.go(6048.4, Circumscribe(frame, color=GRN, buff=0.06), run=1.0)


# ================================================================ combining with the rules

class K16_Combine(Shot):
    def body(self):
        cells, frame, grid = table()
        self.title("A Memory Trick", animate=False)
        self.add(frame, grid, *[c for row in cells for c in row])
        for c in (cells[0][0], cells[0][1], cells[1][0]):
            self.add(under(c, YEL, 0.12))
        self.wipe(6051.2, run=0.35)
        self.title("Combine the Rules", 6051.6)
        C1 = M(D + r"\Big(", r"3\sin x", r"-2\cos x", r"\Big)", size=62).move_to([0, 1.35, 0])
        C1[1].set_color(BLUE); C1[2].set_color(BLUE)
        xq = C1[1].get_left()[0] - 0.45
        C2 = eq_at(M("=", r"3\cos x", r"-2", r"\cdot(-\sin x)", size=62), 0, xq, -0.1)
        C2[1].set_color(PINK); C2[3].set_color(PINK)
        C3 = eq_at(M("=", r"\;3\cos x", r"+2\sin x", size=62), 0, xq, -1.55)
        self.go(6052.37, Write(C1[0]), run=0.4)
        self.go(6054.73, Write(C1[1]), run=0.5)
        self.go(6056.51, Write(C1[2:]), run=0.6)
        self.go(6058.31, Write(C2[0:2]), run=0.5)
        self.go(6059.99, Write(C2[2]), run=0.3)
        self.go(6060.85, Write(C2[3]), run=0.6)
        self.go(6063.13, Write(C3[0:2]), run=0.5)
        self.go(6064.33, Write(C3[2]), run=0.5)
        self.go(6065.4, Create(answer_box(C3[1:])), run=0.5)
        self.go(6066.65, Circumscribe(C2[2:], color=YEL, buff=0.08), run=0.7)
        self.go(6067.57, Circumscribe(C3[2][0], color=YEL, buff=0.08), run=0.6)


def prod_rows(f, g):
    P = M(D + r"\Big(", f, g, r"\Big)", size=62).move_to([0, 1.35, 0])
    P[1].set_color(BLUE); P[2].set_color(ORG)
    xq = P[1].get_left()[0] - 0.45
    return P, xq


class K16_ProductEx(Shot):
    def body(self):
        self.title("Combine the Rules", animate=False)
        C1 = M(D + r"\Big(", r"3\sin x", r"-2\cos x", r"\Big)", size=62).move_to([0, 1.35, 0])
        C1[1].set_color(BLUE); C1[2].set_color(BLUE)
        xq0 = C1[1].get_left()[0] - 0.45
        C2 = eq_at(M("=", r"3\cos x", r"-2", r"\cdot(-\sin x)", size=62), 0, xq0, -0.1)
        C2[1].set_color(PINK); C2[3].set_color(PINK)
        C3 = eq_at(M("=", r"\;3\cos x", r"+2\sin x", size=62), 0, xq0, -1.55)
        self.add(C1, C2, C3, answer_box(C3[1:]))
        self.wipe(6070.62, run=0.3)
        P, xq = prod_rows("x^2", r"\sin x")
        self.go(6070.92, Write(P), run=0.6)
        self.title("A Product", 6071.55)
        Q = eq_at(M("=", "2x", r"\cdot", r"\sin x", "+", "x^2", r"\cdot", r"\cos x", size=62), 0, xq, -0.2)
        for i, c in ((1, PINK), (3, ORG), (5, BLUE), (7, PINK)):
            Q[i].set_color(c)
        n1 = M(r"(x^2)'", size=36, color=DIM).next_to(Q[1], DOWN, buff=0.25)
        n2 = M(r"(\sin x)'", size=36, color=DIM).next_to(Q[7], DOWN, buff=0.25)
        self.go(6072.45, Write(Q[0]), run=0.25)
        self.go(6073.79, Write(Q[1]), FadeIn(n1, shift=UP * 0.1), run=0.4)
        self.go(6074.65, Write(Q[2:4]), run=0.5)
        self.go(6075.91, Write(Q[4]), run=0.25)
        self.go(6076.55, Write(Q[5]), run=0.35)
        self.go(6077.21, Write(Q[6]), run=0.2)
        self.go(6077.79, FadeIn(n2, shift=UP * 0.1), run=0.3)
        self.go(6079.19, Write(Q[7]), run=0.4)
        R = eq_at(M("=", r"\;2x\sin x+x^2\cos x", size=62), 0, xq, -1.95)
        self.go(6080.51, Write(R), run=0.9)
        self.go(6083.0, Create(answer_box(R[1])), run=0.5)


class K16_QuotientEx(Shot):
    def body(self):
        self.title("A Product", animate=False)
        P0, xq0 = prod_rows("x^2", r"\sin x")
        R0 = eq_at(M("=", r"\;2x\sin x+x^2\cos x", size=62), 0, xq0, -1.95)
        Q0 = eq_at(M("=", "2x", r"\cdot", r"\sin x", "+", "x^2", r"\cdot", r"\cos x", size=62), 0, xq0, -0.2)
        for i, c in ((1, PINK), (3, ORG), (5, BLUE), (7, PINK)):
            Q0[i].set_color(c)
        self.add(P0, Q0, R0, answer_box(R0[1]), M(r"(x^2)'", size=36, color=DIM).next_to(Q0[1], DOWN, buff=0.25),
                 M(r"(\sin x)'", size=36, color=DIM).next_to(Q0[7], DOWN, buff=0.25))
        self.wipe(6083.87, run=0.3)
        P = qfrac([r"\sin x"], ["x"], pre=[D], ncol=[BLUE], dcol=ORG, size=62)
        on_bar(P, 0, 1.45)
        self.go(6084.17, Write(P), run=0.6)
        self.title("A Quotient", 6085.0)
        xq = P.fr.get_left()[0] - 0.5
        Q = qfrac([r"x", r"\cdot", r"\cos x", "-", r"\sin x", r"\cdot", "1"], ["x^2"], pre=["="],
                  ncol=[ORG, None, PINK, None, BLUE, None, PINK], dcol=ORG, size=60)
        on_bar(Q, 0, -0.5); eq_at(Q, 0, xq)
        self.go(6085.61, Write(Q.pre), run=0.3)
        self.go(6087.97, Write(Q.n[0]), Create(Q.bar), run=0.3)
        self.go(6088.63, Write(VGroup(*Q.n[1], *Q.n[2])), run=0.4)
        self.go(6089.45, Write(Q.n[3]), run=0.25)
        self.go(6090.85, Write(Q.n[4]), run=0.35)
        self.go(6091.79, Write(Q.n[5]), run=0.15)
        self.go(6091.99, Write(Q.n[6]), run=0.3)
        self.go(6092.97, Write(Q.den), run=0.3)
        R = qfrac([r"x\cos x-\sin x"], ["x^2"], pre=["="], size=60)
        on_bar(R, 0, -2.4); eq_at(R, 0, xq)
        R.fr.shift(RIGHT * 0.15)
        self.go(6094.83, Write(R), run=0.9)
        self.go(6097.9, Create(answer_box(R.fr)), run=0.5)


class K16_ExpCos(Shot):
    def body(self):
        self.title("A Quotient", animate=False)
        P0 = qfrac([r"\sin x"], ["x"], pre=[D], ncol=[BLUE], dcol=ORG, size=62)
        on_bar(P0, 0, 1.45)
        xq0 = P0.fr.get_left()[0] - 0.5
        Q0 = qfrac([r"x", r"\cdot", r"\cos x", "-", r"\sin x", r"\cdot", "1"], ["x^2"], pre=["="],
                   ncol=[ORG, None, PINK, None, BLUE, None, PINK], dcol=ORG, size=60)
        on_bar(Q0, 0, -0.5); eq_at(Q0, 0, xq0)
        R0 = qfrac([r"x\cos x-\sin x"], ["x^2"], pre=["="], size=60)
        on_bar(R0, 0, -2.4); eq_at(R0, 0, xq0)
        R0.fr.shift(RIGHT * 0.15)
        self.add(P0, Q0, R0, answer_box(R0.fr))
        self.wipe(6098.52, run=0.3)
        P, xq = prod_rows("e^x", r"\cos x")
        self.go(6098.82, Write(P), run=0.6)
        self.title("Another Product", 6100.63)
        Q = eq_at(M("=", "e^x", r"\cos x", "+", "e^x", r"\cdot(-\sin x)", size=62), 0, xq, -0.2)
        for i, c in ((1, PINK), (2, ORG), (4, BLUE), (5, PINK)):
            Q[i].set_color(c)
        self.go(6101.39, Write(Q[0:2]), run=0.4)
        self.go(6102.73, Write(Q[2]), run=0.35)
        self.go(6103.53, Write(Q[3]), run=0.25)
        self.go(6104.17, Write(Q[4]), run=0.4)
        self.go(6105.05, Write(Q[5]), run=0.6)
        self.go(6106.61, Circumscribe(Q[1], color=YEL, buff=0.08), Circumscribe(Q[4], color=YEL, buff=0.08), run=0.6)
        R = eq_at(M("=", r"\;e^x", r"(\cos x-\sin x)", size=62), 0, xq, -1.65)
        R[1].set_color(YEL)
        self.go(6108.81, Write(R[0:2]), run=0.4)
        self.go(6109.65, Write(R[2]), run=0.7)
        self.go(6110.55, Create(answer_box(R[1:])), run=0.5)


# ================================================================ the practice (answer is builder 17's)

class K16_TryThis(Shot):
    def body(self):
        self.title("Your Turn", animate=False)
        P = M(D + r"\Big(", "x^3", r"\tan x", r"\Big)", size=84).move_to([0, 0.3, 0])
        P[1].set_color(BLUE); P[2].set_color(ORG)
        self.go(6113.79, Write(P[0]), run=0.4)
        self.go(6114.39, Write(P[1]), run=0.4)
        self.go(6115.27, Write(P[2:]), run=0.5)
        self.go(6115.85, FadeIn(pill("pause and try", YEL).move_to([0, -1.7, 0]), shift=UP * 0.1), run=0.4)
