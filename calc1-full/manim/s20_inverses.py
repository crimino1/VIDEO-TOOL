"""Builder 20: middle of Chapter 7. The folium x^3+y^3=6xy solved for y' and its slope -1 at (3,3); try one
x^2+xy+y^2=7 at (1,2) -> -4/5 on its ellipse; d/dx ln x = 1/x proved implicitly (live tangent on ln x);
arcsin as "the angle whose sine is x" (unit circle, pi/6, range); d/dx arcsin x with the right triangle;
arccos; d/dx arctan x with its triangle; arcsec and the family; chain rule examples; try arctan(x^2);
the slope of an inverse: f = e^x mirrored over y = x, rise and run swap, live slopes 2.00 / 0.50 and the formula.
Colours: curves BLUE (inverse PURP), y' / slopes PINK, points and example numbers ORG, answers boxed GRN.

END SEAM (K20_InvExample at 2:05:05.18), for builder 21:
  title "Using It"; f(x) = x^3 + x  M("f(x)","=","x^3+x", size=72) centred (0, 1.2);
  M(r"(f^{-1})'(2)", "=", "?", size=72) centred (0, -0.3), the 2 ORG and the ? YEL;
  M(r"(f^{-1})'(b)", "=", r"\\frac{1}{f'(a)}", size=62) centred (0, -2.5) with answer_box (GRN)."""
from common import *

D = r"\frac{d}{dx}"


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def pk(m, *idx, color=PINK):
    for i in idx:
        m[i].set_color(color)
    return m


def fparts(m, i, num):
    """num / bar / den glyphs of part i, which is \\frac{num}{...}."""
    fr = m[i]
    nn = len(M(num)[0])
    return fr[:nn], fr[nn], fr[nn + 1:]


def chk(*ms):
    """Print a '!!' line (caught by render_manim) if a board row leaves the safe area."""
    for m in ms:
        if m.get_left()[0] < -6.8 or m.get_right()[0] > 6.8 or m.get_bottom()[1] < -3.8 or m.get_top()[1] > 2.45:
            print(f"!! fit: row out of bounds {m.get_left()[0]:.2f}..{m.get_right()[0]:.2f}, {m.get_bottom()[1]:.2f}..{m.get_top()[1]:.2f}")


_DG = {}


def digits(s, size=48, color=CHALK):
    """A number from cached glyphs (no new LaTeX per frame); the minus sits at mid-height."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.035, aligned_edge=DOWN)
    ref = next((x for x, ch in zip(g, s) if ch.isdigit()), None)
    for x, ch in zip(g, s):
        if ch == "-" and ref is not None:
            x.set_y(ref.get_y())
    return g


def fmt(v):
    return f"{(v if abs(v) >= 0.005 else 0.0):.2f}"


assert fmt(np.exp(np.log(2))) == "2.00" and fmt(np.exp(-np.log(2))) == "0.50" and fmt(1 / 4) == "0.25"


def readout(lab, val, size, color):
    """Live digits to the right of label `lab`, sitting on its baseline."""
    g = digits(val(), size, color).next_to(lab, RIGHT, buff=0.2)
    return g.shift(UP * (lab[0][-1].get_bottom()[1] - g.get_bottom()[1]))


def unclock(*ms):
    for m in ms:
        for x in m.get_family():
            x.clear_updaters()


def folium(ax):
    """x^3 + y^3 = 6xy as one stroke (same as K19)."""
    def P(t):
        d = 1 + t ** 3
        return 6 * t / d, 6 * t * t / d

    def f(u):
        x, y = P(u) if u <= 1 else P(2 - u)[::-1]
        return ax.c2p(x, y)
    return ParametricFunction(f, t_range=[-0.55, 2.55, 0.004], color=BLUE, stroke_width=5)


def ellipse(ax):
    """x^2 + xy + y^2 = 7: in u=(x+y)/sqrt2, v=(y-x)/sqrt2 it is 1.5u^2 + 0.5v^2 = 7."""
    a, b, r2 = np.sqrt(14 / 3), np.sqrt(14), np.sqrt(2)

    def f(t):
        u, v = a * np.cos(t), b * np.sin(t)
        return ax.c2p((u - v) / r2, (u + v) / r2)
    return ParametricFunction(f, t_range=[0, TAU, 0.01], color=BLUE, stroke_width=5)


def seg_line(p, d, length, color=PINK, width=5):
    d = np.array(d, float) / np.linalg.norm(d)
    return Line(p - d * length / 2, p + d * length / 2, color=color, stroke_width=width).set_z_index(4)


def arcsin_final():
    F = M(D + r"\arcsin x", "=", r"\frac{1}{\sqrt{1-x^2}}", size=76).move_to([0, -0.4, 0])
    return F, answer_box(F)


def try_rows():
    T1 = M(D, r"\arctan", "(x^2)", size=66).move_to([0, 1.3, 0])
    T1[2].set_color(ORG)
    T2 = pk(M("=", r"\frac{1}{1+x^4}", r"\cdot", "2x", size=66), 2, 3)
    at_eq(T2, 0, -2.2, -0.4)
    T3 = M("=", r"\frac{2x}{1+x^4}", size=66)
    at_eq(T3, 0, -2.2, -2.35)
    return T1, T2, T3, answer_box(T3[1])


def inv_formula():
    F = M(r"(f^{-1})'(b)", "=", r"\frac{1}{f'(a)}", size=62).move_to([-3.4, -1.15, 0])
    return F, answer_box(F)


# ================================================================ the folium, finished

class K20_FoliumSolve(Shot):
    def body(self):
        # K19_Folium's last frame
        self.title("Folium of Descartes", animate=False)
        eq = M("x^3", "+", "y^3", "=", "6xy", size=74).move_to([-3.3, 1.55, 0])
        fax = axes((-4, 4, 1), (-4, 4, 1), x_length=4.4, y_length=4.4, center=(3.5, -0.65, 0), nums=False)
        fol = folium(fax)
        P = Dot(fax.c2p(3, 3), radius=0.09, color=ORG).set_z_index(7)
        L = M("(3,3)", size=42, color=ORG).next_to(P, UR, buff=0.1)
        ex = -3.8
        d1 = at_eq(M(D + "(x^3)", "=", "3x^2", size=56), 1, ex, 0.45)
        d2 = at_eq(pk(M(D + "(y^3)", "=", "3y^2", "y'", size=56), 3), 1, ex, -0.9)
        d3 = at_eq(pk(M(D + "(6xy)", "=", "6y", "+", "6x", "y'", size=56), 5), 1, ex, -2.25)
        pn = H("product rule", 36, YEL).move_to([d3[0].get_x() + 0.3, -3.25, 0])
        self.add(eq, fax, fax.labels, fol, P, L, d1, d2, d3, pn)

        cx = -2.3
        R1 = at_eq(pk(M("3x^2", "+", "3y^2", "y'", "=", "6y", "+", "6x", "y'", size=58), 3, 8), 4, cx, 0.35)
        R2 = at_eq(pk(M("3y^2", "y'", "-", "6x", "y'", "=", "6y", "-", "3x^2", size=58), 1, 4), 5, cx, -0.75)
        R3 = at_eq(pk(M("y'", "(3y^2-6x)", "=", "6y-3x^2", size=58), 0), 2, cx, -1.85)
        R4 = at_eq(pk(M("y'", "=", r"\frac{6y-3x^2}{3y^2-6x}", size=58), 0), 1, cx, -3.05)
        R4b = at_eq(pk(M("y'", "=", r"\frac{3(2y-x^2)}{3(y^2-2x)}", size=58), 0), 1, cx, -3.05)
        R5 = at_eq(pk(M("y'", "=", r"\frac{2y-x^2}{y^2-2x}", size=58), 0), 1, cx, -3.05)
        chk(R1, R2, R3, R4, R4b, R5)

        # the three pieces join into one equation
        self.go(7165.3, FadeOut(VGroup(d1[0:2], d2[0:2], d3[0:2], pn)),
                ReplacementTransform(d1[2], R1[0]), ReplacementTransform(d2[2], R1[2]), ReplacementTransform(d2[3], R1[3]),
                ReplacementTransform(d3[2], R1[5]), ReplacementTransform(d3[3], R1[6]), ReplacementTransform(d3[4], R1[7]),
                ReplacementTransform(d3[5], R1[8]), FadeIn(R1[1]), FadeIn(R1[4]), run=1.2)
        # y' terms to the left
        u1, u2 = [Line(m.get_corner(DL) + DOWN * 0.08, m.get_corner(DR) + DOWN * 0.08, color=YEL, stroke_width=5) for m in (R1[3], R1[8])]
        self.go(7171.83, Create(u1), Create(u2), run=0.5)
        self.go(7173.4, FadeOut(u1), FadeOut(u2), run=0.3)
        self.go(7174.11, TransformFromCopy(R1[2:4], R2[0:2]), run=0.7)
        self.go(7175.65, Write(R2[2]), TransformFromCopy(R1[7:9], R2[3:5]), run=0.8)
        self.go(7177.35, Write(R2[5]), TransformFromCopy(R1[5], R2[6]), run=0.6)
        self.go(7178.37, Write(R2[7]), TransformFromCopy(R1[0], R2[8]), run=0.6)
        # factor
        self.go(7180.95, TransformFromCopy(VGroup(R2[1], R2[4]), R3[0]), run=0.6)
        self.go(7182.29, Write(R3[1]), run=0.9)
        self.go(7184.57, Write(R3[2]), TransformFromCopy(R2[6:9], R3[3]), run=0.7)
        # divide
        n4, b4, d4 = fparts(R4, 2, "6y-3x^2")
        self.go(7187.43, Write(R4[0:2]), TransformFromCopy(R3[3], n4), Create(b4), TransformFromCopy(R3[1], d4), run=0.8)
        self.go(7188.61, ReplacementTransform(R4, R4b), run=0.8)
        fr = R4b[2]
        k = len(M("3(2y-x^2)")[0])
        s1, s2 = strike(fr[0], width=5), strike(fr[k + 1], width=5)
        self.go(7190.17, Create(s1), Create(s2), run=0.5)
        self.go(7191.57, ReplacementTransform(R4b, R5), FadeOut(s1), FadeOut(s2), run=0.7)

        # at (3,3)
        self.go(7197.33, FadeOut(VGroup(R1, R2, R3)), R5.animate.shift(UP * 3.2), run=0.6)
        self.go(7198.0, Circumscribe(L, color=ORG, buff=0.08), run=0.6)
        S = at_eq(pk(M("y'", "=", r"\frac{6-9}{9-6}", "=", r"\frac{-3}{3}", "=", "-1", size=58), 0, 6), 1, cx, -1.75)
        chk(S)
        sn, sb, sd = fparts(S, 2, "6-9")
        tn, tb, td = fparts(S, 4, "-3")
        self.go(7199.1, Write(S[0:2]), Write(sn), run=0.6)
        self.go(7200.63, Write(S[3]), Write(tn), run=0.5)
        self.go(7202.35, Create(sb), Write(sd), run=0.6)
        self.go(7203.89, Create(tb), Write(td), run=0.5)
        self.go(7204.83, Circumscribe(S[4], color=YEL, buff=0.08), run=0.8)
        self.go(7206.79, Write(S[5:7]), run=0.5)
        tg = seg_line(np.array(fax.c2p(3, 3)), [1, -1, 0], 2.4)
        tl = M("y'=-1", size=40, color=PINK).move_to([5.9, -0.12, 0])
        chk(tl)
        self.go(7207.35, Create(answer_box(S[6])), Create(tg), FadeIn(tl), run=0.7)
        self.go(7208.25, Circumscribe(eq, color=YEL, buff=0.12), run=1.0)
        self.go(7210.59, Circumscribe(VGroup(tg, tl), color=PINK, buff=0.1), run=0.8)
        self.wipe(7211.9, run=0.3)


# ================================================================ try one: x^2 + xy + y^2 = 7

class K20_TryOne(Shot):
    def body(self):
        self.title("Try One", animate=False)
        eq = M("x^2", "+", "xy", "+", "y^2", "=", "7", size=70).move_to([-3.3, 1.55, 0])
        eax = axes((-4, 4, 1), (-4, 4, 1), x_length=4.4, y_length=4.4, center=(3.6, -0.65, 0), nums=False)
        ell = ellipse(eax)
        P = Dot(eax.c2p(1, 2), radius=0.09, color=ORG).set_z_index(7)
        L = M("(1,2)", size=42, color=ORG).next_to(P, UR, buff=0.1)
        self.go(7216.29, Write(eq), run=1.3)
        self.go(7217.8, Create(eax), FadeIn(eax.labels), run=0.5)
        self.go(7218.4, draw(ell, 1.2))
        self.go(7221.09, FadeIn(P), FadeIn(L), run=0.5)

        ex = -3.6
        d = r"\tfrac{d}{dx}"
        t1 = at_eq(M(d + "(x^2)", "=", "2x", size=58), 1, ex, 0.45)
        t2 = at_eq(pk(M(d + "(xy)", "=", "y", "+", "x", "y'", size=58), 5), 1, ex, -0.65)
        t3 = at_eq(pk(M(d + "(y^2)", "=", "2y", "y'", size=58), 3), 1, ex, -1.75)
        t4 = at_eq(M(d + "(7)", "=", "0", size=58), 1, ex, -2.85)
        chk(t1, t2, t3, t4)
        self.go(7222.71, Write(t1[0:2]), run=0.6)
        self.go(7224.29, Write(t1[2]), run=0.4)
        self.go(7225.67, Write(t2[0:2]), run=0.6)
        self.go(7227.19, Write(t2[2]), run=0.3)
        self.go(7227.55, Write(t2[3:]), run=0.6)
        self.go(7229.49, Write(t3[0:2]), run=0.6)
        self.go(7231.09, Write(t3[2:]), run=0.6)
        self.go(7233.07, Write(t4[0:2]), run=0.4)
        self.go(7233.65, Write(t4[2]), run=0.3)

        C = pk(M("2x", "+", "y", "+", "x", "y'", "+", "2y", "y'", "=", "0", size=58), 5, 8).move_to([-3.2, 0.45, 0])
        self.go(7235.3, FadeOut(VGroup(t1[0:2], t2[0:2], t3[0:2], t4[0:2])),
                ReplacementTransform(t1[2], C[0]), ReplacementTransform(t2[2], C[2]), ReplacementTransform(t2[3], C[3]),
                ReplacementTransform(t2[4], C[4]), ReplacementTransform(t2[5], C[5]), ReplacementTransform(t3[2], C[7]),
                ReplacementTransform(t3[3], C[8]), ReplacementTransform(t4[2], C[10]),
                FadeIn(C[1]), FadeIn(C[6]), FadeIn(C[9]), run=1.2)
        cx = -3.0
        R2 = at_eq(pk(M("y'", "(x+2y)", "=", "-2x-y", size=58), 0), 2, cx, -0.65)
        R3 = at_eq(pk(M("y'", "=", "-", r"\frac{2x+y}{x+2y}", size=58), 0), 1, cx, -1.9)
        R4 = at_eq(M("=", "-", r"\frac{2+2}{1+4}", "=", "-", r"\frac{4}{5}", size=58), 0, cx, -1.75)
        R4[2].set_color(ORG)
        pk(R4, 4, 5)
        chk(C, R2, R3, R4)
        ul = Line(C[0:3].get_corner(DL) + DOWN * 0.12, C[0:3].get_corner(DR) + DOWN * 0.12, color=YEL, stroke_width=5)
        self.go(7241.2, Create(ul), run=0.5)
        self.go(7243.63, FadeOut(ul), TransformFromCopy(VGroup(C[5], C[8]), R2[0]), run=0.6)
        self.go(7244.39, Write(R2[1]), run=0.6)
        self.go(7245.67, Write(R2[2]), TransformFromCopy(C[0:3], R2[3]), run=0.8)
        self.go(7248.75, Write(R3[0:3]), run=0.6)
        self.go(7250.01, Write(R3[3]), run=1.0)
        self.go(7253.4, FadeOut(VGroup(C, R2)), R3.animate.shift(UP * 2.15), run=0.6)
        self.go(7254.0, Circumscribe(L, color=ORG, buff=0.08), run=0.6)
        self.go(7255.31, Write(R4[0:3]), run=1.2)
        self.go(7258.71, Write(R4[3:]), run=0.5)
        p = np.array(eax.c2p(1, 2))
        tg = seg_line(p, [1, -0.8, 0], 2.6)
        tl = M(r"-\frac{4}{5}", size=44, color=PINK).next_to(tg.get_end(), UR, buff=0.05)
        self.go(7259.3, Create(answer_box(R4[4:6])), Create(tg), FadeIn(tl), run=0.7)
        self.wipe(7261.85, run=0.35)


# ================================================================ d/dx ln x = 1/x

class K20_LnProof(Shot):
    def body(self):
        self.title("Try One", animate=False)
        self.title("Derivative of ln x", 7262.4)
        goal = M(D + r"\ln x", "=", r"\frac{1}{x}", size=80).move_to([0, 0.2, 0])
        self.go(7264.31, Write(goal[0]), run=0.7)
        self.go(7266.23, Write(goal[1:]), run=0.5)

        lax = axes((0, 5, 1), (-2, 2, 1), x_length=4.6, y_length=3.8, center=(4.1, -1.0, 0))
        lnc = curve(lax, np.log, [0.14, 4.9])
        lnl = M(r"y=\ln x", size=44, color=BLUE).move_to(lax.c2p(2.0, 1.75))
        self.go(7267.3, FadeOut(goal), Create(lax), FadeIn(lax.labels), run=0.5)

        cx = -3.6
        l1 = at_eq(M("y", "=", r"\ln x", size=64), 1, cx, 1.45)
        l2 = at_eq(M("e^y", "=", "x", size=64), 1, cx, 0.35)
        l3 = at_eq(pk(M("e^y", "y'", "=", "1", size=64), 1), 2, cx, -0.75)
        l4 = at_eq(pk(M("y'", "=", r"\frac{1}{e^y}", "=", r"\frac{1}{x}", size=64), 0), 1, cx, -2.05)
        chk(l1, l2, l3, l4)
        self.go(7268.35, Write(l1[0:2]), run=0.4)
        self.go(7269.09, Write(l1[2]), draw(lnc, 1.0), FadeIn(lnl), run=1.0)
        ef = H("exponential form", 34, DIM).next_to(l2, RIGHT, buff=0.5).shift(RIGHT * 0.3)
        self.go(7270.5, FadeIn(ef, shift=LEFT * 0.1), run=0.4)
        self.go(7272.49, Write(l2), run=0.7)
        self.go(7274.73, FadeOut(ef), run=0.3)
        self.go(7275.07, Circumscribe(l2, color=YEL, buff=0.12), run=0.8)
        self.go(7280.11, Write(l3[0]), run=0.4)
        self.go(7281.39, Write(l3[1]), run=0.3)
        cr = H("chain rule", 34, YEL).next_to(l3, RIGHT, buff=0.5)
        self.go(7282.75, FadeIn(cr, shift=LEFT * 0.1), run=0.4)
        self.go(7285.23, Write(l3[2:]), run=0.4)
        self.go(7286.2, FadeOut(cr), run=0.3)
        self.go(7290.09, Write(l4[0:2]), run=0.4)
        self.go(7291.23, Write(l4[2]), run=0.6)
        den = l4[2][2:]
        self.go(7293.63, Circumscribe(l2[0], color=YEL, buff=0.08), Circumscribe(den, color=YEL, buff=0.08), run=0.8)
        self.go(7294.53, Circumscribe(l2[2], color=ORG, buff=0.08), run=0.5)
        self.go(7297.21, Write(l4[3]), run=0.4)
        self.go(7298.33, Write(l4[4]), run=0.5)
        self.go(7299.07, Create(answer_box(l4)), run=0.4)

        xt = ValueTracker(1.0)
        tan = live_tangent(lax, np.log, xt, length=2.2, readout=False)
        lx = M("x =", size=44, color=ORG)
        ls = M(r"\text{slope} =", size=44, color=PINK)
        lx.move_to([1.6 + lx.width / 2, 1.65, 0])
        ls.move_to([4.0 + ls.width / 2, 1.65, 0])
        vx = always_redraw(lambda: readout(lx, lambda: fmt(xt.get_value()), 44, ORG))
        vs = always_redraw(lambda: readout(ls, lambda: fmt(1 / xt.get_value()), 44, PINK))
        self.go(7299.6, FadeIn(tan), FadeIn(lx), FadeIn(ls), FadeIn(vx), FadeIn(vs), run=0.4)
        self.go(7300.05, xt.animate.set_value(4.0), run=2.0)
        self.go(7302.3, xt.animate.set_value(0.5), run=2.0)
        unclock(tan, vx, vs)
        self.wipe(7304.7, run=0.35)


# ================================================================ arcsin: what angle has this sine?

class K20_Arcsin(Shot):
    def body(self):
        self.title("Derivative of ln x", animate=False)
        self.title("Inverse Trig", 7305.31)
        r1 = M(r"\sin^{-1}x", "=", r"\arcsin x", size=64).move_to([-3.3, 1.4, 0])
        r2 = VGroup(H("the angle whose sine is", 40, YEL), M("x", size=50, color=YEL)).arrange(RIGHT, buff=0.15).move_to([-3.3, 0.3, 0])
        r3 = M(r"\arcsin\frac{1}{2}", "=", r"\frac{\pi}{6}", size=64).move_to([-3.3, -1.0, 0])
        r4 = M(r"-\frac{\pi}{2}", r"\le", r"\arcsin x", r"\le", r"\frac{\pi}{2}", size=56).move_to([-3.3, -2.6, 0])
        r4[0].set_color(YEL); r4[4].set_color(YEL)
        chk(r1, r2, r3, r4)
        self.go(7311.57, Write(r1[0]), run=0.6)
        self.go(7313.39, Write(r1[1:]), run=0.7)
        c = np.array([3.8, -0.65, 0])
        R = 2.2
        uc = unit_circle(r=R, center=c, axis_len=2.85)
        self.go(7314.41, Create(uc[0]), Create(uc[1]), FadeIn(uc[2:]), run=0.8)
        self.go(7315.83, FadeIn(r2, shift=UP * 0.1), run=0.5)
        self.go(7317.75, FadeOut(r2), run=0.3)
        self.go(7318.13, Write(r3[0]), run=0.6)
        self.go(7319.53, Write(r3[1:]), run=0.5)
        q = on_circle(PI / 6, R, c)
        ray = seg(c, q, CHALK, 4)
        dot = Dot(q, radius=0.08, color=ORG).set_z_index(6)
        ang = VGroup(angle_arc(c, c + RIGHT, q, r=0.6),
                     M(r"\pi/6", size=36, color=YEL).move_to(c + 1.35 * np.array([np.cos(PI / 12), np.sin(PI / 12), 0])))
        hgt = seg(q, [q[0], c[1], 0], ORG, 5)
        hl = M(r"\frac{1}{2}", size=36, color=ORG).move_to([q[0] + 0.55, c[1] + 0.5, 0])
        self.go(7320.95, Create(ray), FadeIn(dot), FadeIn(ang), run=0.7)
        self.go(7322.27, Create(hgt), FadeIn(hl), run=0.5)
        half = Arc(radius=R, start_angle=-PI / 2, angle=PI, arc_center=c, color=YEL, stroke_width=8).set_z_index(3)
        top = M(r"\frac{\pi}{2}", size=40, color=YEL).move_to(c + UP * (R + 0.4) + RIGHT * 0.6)
        bot = M(r"-\frac{\pi}{2}", size=40, color=YEL).move_to(c + DOWN * (R + 0.4) + RIGHT * 0.75)
        chk(top, bot)
        self.go(7325.33, Create(half), FadeIn(top), FadeIn(bot), run=0.9)
        self.go(7326.25, Write(r4), run=1.0)
        self.wipe(7327.9, run=0.35)


# ================================================================ d/dx arcsin x

class K20_ArcsinDeriv(Shot):
    def body(self):
        self.title("Inverse Trig", animate=False)
        self.title("Derivative of arcsin x", 7328.53)
        cx = -3.4
        a1 = at_eq(M("y", "=", r"\arcsin x", size=62), 1, cx, 1.45)
        a2 = at_eq(M(r"\sin y", "=", "x", size=62), 1, cx, 0.4)
        a3 = at_eq(pk(M(r"\cos y", r"\cdot", "y'", "=", "1", size=62), 2), 3, cx, -0.65)
        a4 = at_eq(pk(M("y'", "=", r"\frac{1}{\cos y}", size=62), 0), 1, cx, -1.85)
        a5 = M(r"\cos y", "=", r"\sqrt{1-\sin^2 y}", "=", r"\sqrt{1-x^2}", size=58).move_to([0, -3.2, 0])
        chk(a1, a2, a3, a4, a5)
        self.go(7330.35, Write(a1), run=0.7)
        self.go(7332.69, Write(a2), run=0.7)
        self.go(7337.29, Write(a3[0:2]), run=0.5)
        self.go(7338.47, Write(a3[2]), run=0.3)
        self.go(7339.11, Write(a3[3:]), run=0.4)
        self.go(7340.51, Write(a4[0:2]), run=0.4)
        self.go(7341.83, Write(a4[2]), run=0.6)
        den = a4[2][2:]
        ul = Line(den.get_corner(DL) + DOWN * 0.1, den.get_corner(DR) + DOWN * 0.1, color=YEL, stroke_width=5)
        wx = H("want x, not y", 36, YEL).next_to(a4, RIGHT, buff=0.5)
        self.go(7344.45, Create(ul), FadeIn(wx, shift=LEFT * 0.1), run=0.5)
        self.go(7346.6, FadeOut(ul), FadeOut(wx), run=0.3)
        focus(self, a2, a4, run=0.4)

        T = right_triangle(b=3.2, h=2.1, origin=(1.7, -0.25, 0))
        A, B, C = T["A"], T["B"], T["C"]
        ang = angle_arc(A, B, C, r=0.75, label="y", label_size=46)
        opp = side_label(B, C, "x", color=ORG, size=48, side=-1)
        hyp = side_label(A, C, "1", size=48, side=1)
        adj = side_label(A, B, r"\sqrt{1-x^2}", size=44, side=-1)
        self.go(7347.45, Create(T["tri"]), Create(T["mark"]), FadeIn(ang), run=0.8)
        self.go(7348.39, FadeIn(opp), FadeIn(hyp), run=0.4)
        ident = M(r"\sin^2 y+\cos^2 y", "=", "1", size=50).move_to([3.3, -1.6, 0])
        chk(ident, adj)
        self.go(7349.45, Write(ident), run=0.9)
        self.go(7351.8, FadeOut(a1), FadeOut(a3), run=0.4)
        self._dimmed = []
        self.go(7352.67, Write(a5[0:3]), run=1.2)
        self.go(7356.53, Write(a5[3:]), run=0.8)
        self.go(7357.4, TransformFromCopy(a5[4], adj[0]), run=0.7)
        pos = VGroup(M(r"\cos y>0", size=46, color=YEL), H("for", 36, YEL),
                     M(r"-\frac{\pi}{2}<y<\frac{\pi}{2}", size=46, color=YEL)).arrange(RIGHT, buff=0.18).move_to([3.4, -1.6, 0])
        chk(pos)
        self.go(7360.05, FadeOut(ident, shift=UP * 0.1), FadeIn(pos, shift=UP * 0.1), run=0.6)
        self.go(7361.3, Circumscribe(a5[4], color=YEL, buff=0.08), run=0.9)
        self.go(7365.01, Circumscribe(pos[0], color=YEL, buff=0.08), run=0.8)
        self.wipe(7367.0, run=0.35)
        F, Fb = arcsin_final()
        chk(F)
        self.go(7367.35, Write(F[0]), run=0.8)
        self.go(7369.59, Write(F[1:]), run=1.0)
        self.go(7371.2, Create(Fb), run=0.5)


# ================================================================ arccos, then d/dx arctan x

class K20_Arctan(Shot):
    def body(self):
        self.title("Derivative of arcsin x", animate=False)
        F, Fb = arcsin_final()
        self.add(F, Fb)
        self.title("And arccos x", 7372.77)
        top = VGroup(F, Fb)
        self.go(7373.3, top.animate.scale(0.8).move_to([0, 1.1, 0]), run=0.7)
        G = M(D + r"\arccos x", "=", "-", r"\frac{1}{\sqrt{1-x^2}}", size=61)
        G[2].set_color(YEL)
        at_eq(G, 1, F[1].get_x(), -1.3)
        chk(G)
        self.go(7374.05, Write(G[0:2]), run=0.7)
        self.go(7376.55, Write(G[2]), run=0.3)
        self.go(7377.79, Write(G[3]), run=0.8)
        ng = note("minus sign", G[2], DL, dist=0.6, angle=0.5)
        chk(ng)
        self.go(7379.0, FadeIn(ng[0]), Create(ng[1]), run=0.5)
        self.wipe(7381.3, run=0.35)

        self.title("Derivative of arctan x", 7381.71)
        cx = -3.4
        b1 = at_eq(M("y", "=", r"\arctan x", size=62), 1, cx, 1.45)
        b2 = at_eq(M(r"\tan y", "=", "x", size=62), 1, cx, 0.4)
        b3 = at_eq(pk(M(r"\sec^2 y", r"\cdot", "y'", "=", "1", size=62), 2), 3, cx, -0.65)
        b4 = at_eq(pk(M("y'", "=", r"\frac{1}{\sec^2 y}", size=62), 0), 1, cx, -1.85)
        chk(b1, b2, b3, b4)
        self.go(7383.49, Write(b1), run=0.7)
        self.go(7386.17, Write(b2), run=0.7)
        self.go(7389.25, Write(b3[0:2]), run=0.6)
        self.go(7391.41, Write(b3[2]), run=0.3)
        self.go(7392.03, Write(b3[3:]), run=0.4)
        self.go(7393.41, Write(b4[0:2]), run=0.4)
        self.go(7394.37, Write(b4[2]), run=0.7)
        den = b4[2][2:]
        ul = Line(den.get_corner(DL) + DOWN * 0.1, den.get_corner(DR) + DOWN * 0.1, color=YEL, stroke_width=5)
        self.go(7396.71, Create(ul), run=0.5)
        I = M(r"\sec^2 y", "=", "1+", r"\tan^2 y", size=58).move_to([3.6, 1.45, 0])
        I2 = M(r"\sec^2 y", "=", "1+", "x^2", size=58)
        I2.shift(I[2].get_right() - I2[2].get_right())
        I2[3].set_color(ORG)
        chk(I, I2)
        self.go(7398.19, Write(I[0:2]), run=0.6)
        self.go(7399.59, Write(I[2:]), run=0.8)

        T = right_triangle(b=2.6, h=2.0, origin=(2.4, -2.55, 0))
        A, B, C = T["A"], T["B"], T["C"]
        ang = angle_arc(A, B, C, r=0.7, label="y", label_size=46)
        opp = side_label(B, C, "x", color=ORG, size=48, side=-1)
        adj = side_label(A, B, "1", size=48, side=-1)
        hyp = side_label(A, C, r"\sqrt{1+x^2}", size=44, side=1)
        chk(adj, hyp)
        self.go(7401.71, Create(T["tri"]), Create(T["mark"]), FadeIn(ang), run=0.8)
        self.go(7402.61, FadeIn(opp), FadeIn(adj), run=0.4)
        self.go(7403.47, ReplacementTransform(I, I2), run=0.7)
        self.go(7405.13, FadeIn(hyp), run=0.6)
        self.wipe(7406.93, run=0.35)
        F2 = M(D + r"\arctan x", "=", r"\frac{1}{1+x^2}", size=80).move_to([0, 0.3, 0])
        F2b = answer_box(F2)
        chk(F2)
        self.go(7407.31, Write(F2[0]), run=0.8)
        self.go(7409.53, Write(F2[1:]), run=0.8)
        self.go(7410.91, Create(F2b), run=0.4)
        self.go(7412.53, Circumscribe(VGroup(F2, F2b), color=YEL, buff=0.12), run=1.0)
        n1 = H("shows up in integrals", 44, YEL).move_to([0, -1.75, 0])
        n2 = H("Calculus 2", 38, DIM).next_to(n1, DOWN, buff=0.3)
        self.go(7414.41, FadeIn(n1, shift=UP * 0.1), run=0.5)
        self.go(7417.05, FadeIn(n2, shift=UP * 0.1), run=0.4)
        self.wipe(7418.1, run=0.35)


# ================================================================ the family

class K20_Family(Shot):
    def body(self):
        self.title("Derivative of arctan x", animate=False)
        self.title("The Inverse Trig Family", 7418.55)
        ex = -0.2
        f1 = at_eq(M(D + r"\arcsin x", "=", r"\frac{1}{\sqrt{1-x^2}}", size=54), 1, ex, 1.6)
        f2 = at_eq(M(D + r"\arccos x", "=", r"-\frac{1}{\sqrt{1-x^2}}", size=54), 1, ex, 0.12)
        f3 = at_eq(M(D + r"\arctan x", "=", r"\frac{1}{1+x^2}", size=54), 1, ex, -1.36)
        f4 = at_eq(M(D + r"\text{arcsec}\,x", "=", r"\frac{1}{|x|\sqrt{x^2-1}}", size=54), 1, ex, -2.85)
        chk(f1, f2, f3, f4)
        self.go(7419.05, LaggedStart(*[FadeIn(f, shift=UP * 0.1) for f in (f1, f2, f3)], lag_ratio=0.25), run=0.6)
        self.go(7419.67, Write(f4[0:2]), run=0.7)
        self.go(7421.95, Write(f4[2]), run=1.0)
        self.go(7428.27, Create(box(f1, YEL, buff=0.08)), run=0.4)
        self.go(7429.05, Create(box(f3, YEL, buff=0.08)), run=0.4)
        self.go(7430.17, f2.animate.set_opacity(0.3), f4.animate.set_opacity(0.3), run=0.5)
        self.wipe(7431.85, run=0.35)


# ================================================================ with the chain rule

class K20_ChainInv(Shot):
    def body(self):
        self.title("The Inverse Trig Family", animate=False)
        self.title("With the Chain Rule", 7432.35)
        L1 = M(D, r"\arctan", "(3x)", size=56).move_to([-3.4, 1.3, 0])
        L1[2].set_color(ORG)
        ex = L1.get_left()[0] + 0.3
        L2 = at_eq(pk(M("=", r"\frac{1}{1+(3x)^2}", r"\cdot", "3", size=56), 2, 3), 0, ex, -0.2)
        L3 = at_eq(M("=", r"\frac{3}{1+9x^2}", size=56), 0, ex, -1.95)
        R1 = M(D, r"\arcsin", "(x^2)", size=56).move_to([3.4, 1.3, 0])
        R1[2].set_color(ORG)
        rx = R1.get_left()[0] + 0.3
        R2 = at_eq(pk(M("=", r"\frac{1}{\sqrt{1-(x^2)^2}}", r"\cdot", "2x", size=56), 2, 3), 0, rx, -0.2)
        R3 = at_eq(M("=", r"\frac{2x}{\sqrt{1-x^4}}", size=56), 0, rx, -1.95)
        chk(L1, L2, L3, R1, R2, R3)
        self.go(7435.75, Write(L1), run=0.9)
        self.go(7438.01, Write(L2[0:2]), run=1.2)
        self.go(7440.39, Write(L2[2:]), run=0.4)
        self.go(7441.79, Write(L3), run=0.8)
        lb = answer_box(L3[1])
        self.go(7443.85, Create(lb), run=0.4)
        div = DashedLine([0, 1.9, 0], [0, -2.9, 0], color=FAINT, stroke_width=3, dash_length=0.12)
        self.go(7444.81, VGroup(L1, L2, L3).animate.set_opacity(0.35), lb.animate.set_stroke(opacity=0.35), Create(div), Write(R1), run=0.9)
        self.go(7446.71, Write(R2[0:2]), run=1.2)
        self.go(7450.03, Write(R2[2:]), run=0.5)
        self.go(7451.87, Write(R3), run=0.8)
        self.go(7454.59, Create(answer_box(R3[1])), run=0.4)
        self.wipe(7455.45, run=0.35)


# ================================================================ try arctan(x^2)

class K20_TryArctan(Shot):
    def body(self):
        self.title("Your Turn", animate=False)
        T1, T2, T3, Tb = try_rows()
        note_ = M(r"(x^2)^2=x^4", size=42, color=DIM).next_to(T2, RIGHT, buff=0.6)
        chk(T1, T2, T3, note_)
        self.go(7457.6, Write(T1), run=0.8)
        self.go(7459.81, Write(T2[0:2]), run=0.8)
        self.go(7460.7, FadeIn(note_, shift=LEFT * 0.1), run=0.4)
        self.go(7461.95, Write(T2[2:]), run=0.4)
        self.go(7463.81, Write(T3), run=0.8)
        self.go(7465.6, Create(Tb), run=0.4)


# ================================================================ slope of an inverse: the mirror picture

class K20_InvSlope(Shot):
    def body(self):
        self.title("Your Turn", animate=False)
        T1, T2, T3, Tb = try_rows()
        note_ = M(r"(x^2)^2=x^4", size=42, color=DIM).next_to(T2, RIGHT, buff=0.6)
        self.add(T1, T2, T3, Tb, note_)
        self.wipe(7466.65, run=0.35)
        self.title("Slope of an Inverse", 7467.0)

        # f takes a to b, the inverse takes b back to a
        a_ = M("a", size=70, color=ORG).move_to([-5.0, 1.0, 0])
        b_ = M("b", size=70, color=ORG).move_to([-1.8, 1.0, 0])
        up = CurvedArrow(a_.get_top() + UP * 0.12 + RIGHT * 0.1, b_.get_top() + UP * 0.12 + LEFT * 0.1, angle=-PI / 3,
                         color=BLUE, stroke_width=4, tip_length=0.18)
        dn = CurvedArrow(b_.get_bottom() + DOWN * 0.12 + LEFT * 0.1, a_.get_bottom() + DOWN * 0.12 + RIGHT * 0.1, angle=-PI / 3,
                         color=PURP, stroke_width=4, tip_length=0.18)
        fl = M("f", size=48, color=BLUE).next_to(up, UP, buff=0.08)
        il = M("f^{-1}", size=48, color=PURP).next_to(dn, DOWN, buff=0.08)
        chk(VGroup(a_, b_, up, dn, fl, il))
        self.go(7472.75, FadeIn(a_), run=0.35)
        self.go(7473.13, Create(up), FadeIn(fl), run=0.6)
        self.go(7473.89, FadeIn(b_), run=0.35)
        self.go(7474.89, Create(dn), FadeIn(il), run=0.7)

        # the graph and its mirror image over y = x
        ax = axes((-2, 4, 1), (-2, 4, 1), x_length=5.6, y_length=5.6, center=(3.6, -0.75, 0), nums=False)
        fc = curve(ax, np.exp, [-2, np.log(3.9)])
        fcl = M("f", size=46, color=BLUE).next_to(ax.c2p(1.25, np.exp(1.25)), RIGHT, buff=0.2)
        diag = DashedLine(ax.c2p(-1.9, -1.9), ax.c2p(3.9, 3.9), color=DIM, stroke_width=3, dash_length=0.12)
        dl = M("y=x", size=40, color=DIM).move_to(ax.c2p(3.0, 3.6))
        self.go(7477.13, Create(ax), FadeIn(ax.labels), run=0.6)
        self.go(7477.8, draw(fc, 0.9), FadeIn(fcl), run=0.9)
        self.go(7479.89, Create(diag), FadeIn(dl), run=0.5)
        axis = np.array([1.0, 1.0, 0]) / np.sqrt(2)
        O = ax.c2p(0, 0)
        ic = fc.copy().set_color(PURP)
        icl = M("f^{-1}", size=46, color=PURP).next_to(ax.c2p(np.exp(-1.4), -1.4), RIGHT, buff=0.2)
        self.go(7480.79, Rotate(ic, PI, axis=axis, about_point=O), run=1.3)
        self.go(7482.1, FadeIn(icl), run=0.3)

        # a tangent of slope 2 and its rise/run, flipped: rise and run swap
        a0 = np.log(2)
        tf0 = tangent(ax, np.exp, a0, 2.4)
        dot0 = pt(ax, a0, 2.0, PINK)
        run_ = seg(ax.c2p(a0 - 0.6, 0.8), ax.c2p(a0, 0.8), ORG, 4)
        rise = seg(ax.c2p(a0, 0.8), ax.c2p(a0, 2.0), YEL, 4)
        n1 = M("1", size=38, color=ORG).move_to(ax.c2p(a0 - 0.25, 1.0))
        n2 = M("2", size=38, color=YEL).next_to(rise, RIGHT, buff=0.1)
        self.go(7482.77, Create(tf0), FadeIn(dot0), run=0.5)
        self.go(7483.3, Create(run_), Create(rise), FadeIn(n1), FadeIn(n2), run=0.5)
        mir = VGroup(tf0, dot0, run_, rise).copy()
        self.go(7484.27, Rotate(mir, PI, axis=axis, about_point=O), run=1.0)
        m1 = M("1", size=38, color=ORG).move_to(ax.c2p(1.08, a0 - 0.25))
        m2 = M("2", size=38, color=YEL).next_to(mir[3], UP, buff=0.1)
        self.go(7485.3, TransformFromCopy(n1, m1), TransformFromCopy(n2, m2), run=0.6)

        # live slopes: 2 and one half, always reciprocal
        A = ValueTracker(a0)
        tf = always_redraw(lambda: tangent(ax, np.exp, A.get_value(), 2.4))
        df = always_redraw(lambda: pt(ax, A.get_value(), np.exp(A.get_value()), PINK))
        ti = always_redraw(lambda: tangent(ax, np.log, np.exp(A.get_value()), 2.4))
        di = always_redraw(lambda: pt(ax, np.exp(A.get_value()), A.get_value(), PINK))
        s1 = M(r"\text{slope of }f\,=", size=46, color=PINK)
        s2 = M(r"\text{slope of }f^{-1}=", size=46, color=PINK)
        s1.move_to([-6.3 + s1.width / 2, -2.45, 0])
        s2.move_to([-6.3 + s2.width / 2, -3.25, 0])
        v1 = always_redraw(lambda: readout(s1, lambda: fmt(np.exp(A.get_value())), 46, PINK))
        v2 = always_redraw(lambda: readout(s2, lambda: fmt(np.exp(-A.get_value())), 46, PINK))
        chk(VGroup(s1, s2), v1, v2)
        self.go(7488.6, FadeIn(s1), FadeIn(v1), run=0.4)
        self.go(7489.6, FadeIn(s2), FadeIn(v2), run=0.4)
        self.remove(tf0, dot0, mir[0], mir[1])
        self.add(tf, df, ti, di)
        lab_ab = M("(a,b)", size=40, color=ORG).add_updater(lambda m: m.next_to(df, np.array([-1.0, np.clip(1.5 - np.exp(A.get_value()), 0, 1), 0]), buff=0.25))
        lab_ba = M("(b,a)", size=40, color=ORG).add_updater(lambda m: m.next_to(di, DR, buff=0.08))
        self.go(7490.3, FadeOut(VGroup(run_, rise, n1, n2, mir[2], mir[3], m1, m2)), FadeIn(lab_ab), FadeIn(lab_ba), run=0.4)

        # slide the point while the formula is written; land back on 2 and one half
        clk = [0.0]
        legs = [(1.5, a0, 1.0), (2.0, 1.0, -0.2), (1.1, -0.2, a0)]

        def slide(m, dt):
            clk[0] += dt
            t = clk[0]
            for d, x0, x1 in legs:
                if t <= d:
                    m.set_value(x0 + (x1 - x0) * smooth(t / d))
                    return
                t -= d
            m.set_value(a0)
        A.add_updater(slide)
        self.add(A)
        F, Fb = inv_formula()
        chk(F)
        self.go(7491.87, Write(F[0]), run=0.7)
        self.go(7493.69, Write(F[1:]), run=0.6)
        self.go(7495.29, Create(Fb), run=0.4)
        self.at(7495.85)
        unclock(A, tf, df, ti, di, v1, v2, lab_ab, lab_ba)
        self.wipe(7496.1, run=0.4, keep=(F, Fb))


# ================================================================ using it: f(x) = x^3 + x

class K20_InvExample(Shot):
    def body(self):
        self.title("Slope of an Inverse", animate=False)
        F, Fb = inv_formula()
        self.add(F, Fb)
        self.title("Using It", 7496.65)
        self.go(7497.2, VGroup(F, Fb).animate.move_to([0, -2.5, 0]), run=0.7)
        fx = M("f(x)", "=", "x^3+x", size=72).move_to([0, 1.2, 0])
        q = M(r"(f^{-1})'(2)", "=", "?", size=72).move_to([0, -0.3, 0])
        q[0][-2].set_color(ORG)
        q[2].set_color(YEL)
        chk(fx, q)
        self.go(7498.83, Write(fx[0:2]), run=0.5)
        self.go(7499.93, Write(fx[2]), run=0.7)
        self.go(7501.81, Write(q[0]), run=0.8)
        self.go(7504.49, Write(q[1:]), run=0.4)
