"""Builder 29: middle of Chapter 10 "Optimization and L'Hopital's Rule".
The 1-litre can solved (substitute, cancel in RED, S' = 0, r = cube root of 500/pi = 5.42 cm, h = 10.84 cm); the can
redrawn in true proportion (h = 2r = the diameter) and ONE tracker r reshaping it with a live S readout and a dot on
S(r); the closest point on y = x^2 to (0, 3) (a live point, its distance segment and legs, d and d^2 readouts), the
d^2 algebra, then the parabola beside the W-shaped d^2 graph (two closest points, x = 0 is a local max); the profit
hill (dot + tangent climbing to x = 30, $800); "try this one" as a live x by (20 - x) rectangle (10 x 10 = 100);
L'Hopital's rule: the 0/0 callback (factor / combine / conjugate), the rule with a shrinking-window picture (both
curves through 0 at a straighten into lines, f/g -> f'/g'), NOT the quotient rule, e^x - 1 over x (with the hole at
(0, 1)), sin x / x in one line (and the circular-proof loop), x^2 - 9 over x - 3, 1 - cos x over x^2 (twice).
Colours: functions BLUE (second function g PURP), derivatives PINK, example numbers ORG, totals / answers GRN,
key words YEL, cancel / wrong RED.
START SEAM: rebuilds K28_CanArea's final board (can, net, S, pi r^2 h = 1000, h = 1000 / pi r^2) with s28's helpers.
END SEAM: K29_Twice ends with the heading "Infinity over Infinity" and M(r"\\lim_{x\\to\\infty}", r"\\frac{\\ln x}{x}",
size=64) centred at (0, 0.9) - see inf_setup(); nothing else on the board."""
from common import *
from s28_optimization import (can_setup, net_rect, NL, NW, CHT, ER, live, live_in, live_out, unclock, freeze_wipe,
                              at_eq, col, live_dot, live_tan, plot)


# ---------------------------------------------------------------- the maths of this section, checked once

def SA(r):                       # can surface area with h = 1000 / (pi r^2)
    return 2 * PI * r * r + 2000 / r


def HC(r):
    return 1000 / (PI * r * r)


RSTAR = (500 / PI) ** (1 / 3)


def D2(x):                       # distance squared from (x, x^2) to (0, 3)
    return x ** 2 + (x ** 2 - 3) ** 2


def PF(x):                       # profit
    return -2 * x * x + 120 * x - 1000


def PR(x):                       # product of x and 20 - x
    return x * (20 - x)


def EQ(x):                       # (e^x - 1) / x
    return (np.exp(x) - 1) / x


assert abs(RSTAR - 5.42) < 0.005 and abs(HC(RSTAR) - 10.84) < 0.005 and abs(HC(RSTAR) - 2 * RSTAR) < 1e-9
assert abs(1000 / (PI * 5.42 ** 2) - 10.84) < 0.005
for _r in (3.0, 4.4, 7.1):
    assert abs(slope(SA, _r) - (4 * PI * _r - 2000 / _r ** 2)) < 1e-5
    assert abs(2 * PI * _r * HC(_r) - 2000 / _r) < 1e-9
assert abs(4 * PI * RSTAR ** 3 - 2000) < 1e-9
for _x in (0.3, 1.7, -2.2):
    assert abs(D2(_x) - (_x ** 4 - 5 * _x ** 2 + 9)) < 1e-9
    assert abs(slope(D2, _x) - (4 * _x ** 3 - 10 * _x)) < 1e-5 and abs((4 * _x ** 3 - 10 * _x) - 2 * _x * (2 * _x ** 2 - 5)) < 1e-9
assert abs(D2(2.5 ** 0.5) - 2.75) < 1e-9 and D2(0) == 9 and abs(25 / 4 - 25 / 2 + 9 - 2.75) < 1e-12
assert abs(2.75 ** 0.5 - 1.66) < 0.005 and abs(2.5 ** 0.5 - 1.58) < 0.005
assert PF(30) == 800 and -2 * 900 + 3600 - 1000 == 800 and -1800 + 3600 - 1000 == 800 and PF(10) == 0 and PF(50) == 0
assert PR(10) == 100 and all(PR(_x) < 100 for _x in (3, 9.5, 14))
assert abs(EQ(1e-6) - 1) < 1e-5 and abs(np.sin(1e-4) / 1e-4 - 1) < 1e-6 and abs((1 - np.cos(1e-3)) / 1e-6 - 0.5) < 1e-4


# ---------------------------------------------------------------- local helpers

def strike_g(*glyphs, color=RED):
    return VGroup(*[strike(g, color, 5) for g in glyphs])


def put_left(m, x, y):
    return m.shift([x - m.get_left()[0], y - m.get_center()[1], 0])


def eq_left(m, x, y):
    """Row that starts with '=' (part 0): put that '=' at column x, row y."""
    return m.shift([x - m[0].get_x(), y - m[0].get_y(), 0])


# ================================================================ 1. the can, solved

EQC = -1.2
CROWS = [1.85, 0.45, -0.9, -1.65, -3.05]   # R3 first at -0.9; R5/R6 at RY6


def k28_end():
    """K28_CanArea's final board, piece by piece."""
    d = can_setup()
    d["fill"].set_z_index(-1)
    d["top"].set_stroke(ORG, 5)
    d["bf"].set_stroke(GRN, 5)
    rect = net_rect()
    te = Line(rect.get_corner(UL), rect.get_corner(UR), color=ORG, stroke_width=6)
    w = M(r"2\pi r", size=44, color=ORG).move_to([NL + NW * 0.8, CHT / 2 + 0.38, 0])
    hh = M("h", size=44, color=ORG).next_to(rect, RIGHT, buff=0.25)
    S = M("S", "=", r"2\pi r^2", "+", r"2\pi r", "h", size=56).move_to([0.9, -3.0, 0])
    S[0].set_color(YEL)
    S[5].set_color(YEL)
    con = M(r"\pi r^2 h", "=", "1000", size=54).move_to(d["vol"])
    hf = M("h", "=", r"\frac{1000}{\pi r^2}", size=54).move_to([5.0, 0.1, 0])
    hf[0].set_color(YEL)
    net = VGroup(d["c1"], d["c2"], d["pl1"], d["pl2"], rect, te, w, hh)
    return d, net, S, con, hf


RY6 = -0.7


def can_rows():
    r = {}
    r["S1"] = col(at_eq(M("S", "=", r"2\pi r^2", "+", r"2\pi r", "h", size=54), 1, EQC, CROWS[0]), {0: YEL, 5: YEL})
    r["R2"] = col(at_eq(M("S", "=", r"2\pi r^2", "+", r"2\pi r", r"\cdot", r"\frac{1000}{\pi r^2}", size=54), 1, EQC, CROWS[1]), {0: YEL})
    r["R3"] = col(at_eq(M("S", "=", r"2\pi r^2", "+", r"\frac{2000}{r}", size=54), 1, EQC, CROWS[2]), {0: YEL})
    r["R4"] = col(at_eq(M("S'", "=", r"4\pi r", "-", r"\frac{2000}{r^2}", "=", "0", size=54), 1, EQC, CROWS[1]), {0: PINK})
    r["R5"] = at_eq(M(r"4\pi r", "=", r"\frac{2000}{r^2}", size=54), 1, EQC, RY6)
    r["R6"] = at_eq(M(r"4\pi r^3", "=", "2000", size=54), 1, EQC, RY6)
    r["R7"] = at_eq(M("r^3", "=", r"\frac{500}{\pi}", size=54), 1, EQC, CROWS[3])
    r["R8"] = col(at_eq(M("r", "=", r"\sqrt[3]{\frac{500}{\pi}}", r"\approx\;", r"5.42\text{ cm}", size=54), 1, EQC, CROWS[4]), {4: GRN})
    return r


class K29_CanSolve(Shot):
    def body(self):
        self.title("The Cheapest Can", animate=False)
        d, net, S, con, hf = k28_end()
        self.add(d["fill"], d["can"], d["rad"], d["rl"], d["hl"], net, S, con, hf)
        r = can_rows()
        S1, R2, R3 = r["S1"], r["R2"], r["R3"]
        self.go("2:58:20.6", FadeOut(net), FadeOut(con), d["top"].animate.set_stroke(CHALK, 4),
                d["bf"].animate.set_stroke(CHALK, 4), ReplacementTransform(S, S1),
                hf.animate.scale(0.92).move_to([5.3, CROWS[0], 0]), run=0.8)
        self.play(Circumscribe(S1[4:6], color=YEL, stroke_width=3), run_time=0.6)
        self.go("2:58:22.05", TransformFromCopy(S1[0:5], R2[0:5]), run=0.7)
        self.go("2:58:23.37", Write(R2[5]), run=0.3)
        self.play(TransformFromCopy(hf[2], R2[6]), run_time=0.9)
        f6, p4 = R2[6], R2[4]
        s_pi = strike_g(p4[1], f6[5])
        s_r = strike_g(p4[2], f6[7])
        self.go("2:58:26.33", Create(s_pi), run=0.5)
        self.go("2:58:27.67", Create(s_r), run=0.5)
        self.go("2:58:29.13", TransformFromCopy(VGroup(p4[0], f6[0:4]), R3[4][0:4]), FadeIn(R3[4][4]),
                TransformFromCopy(f6[6], R3[4][5]), run=0.9)
        self.go("2:58:31.3", TransformFromCopy(R2[0:4], R3[0:4]), run=0.8)
        self.play(Circumscribe(R3, color=YEL, stroke_width=3), run_time=0.8)

        # derivative, set to zero, solve
        R4, R5, R6, R7, R8 = r["R4"], r["R5"], r["R6"], r["R7"], r["R8"]
        self.go("2:58:36.17", FadeOut(VGroup(S1, R2, s_pi, s_r, hf)), R3.animate.shift(UP * (CROWS[0] - CROWS[2])), run=0.6)
        self.play(Write(R4[0:2]), run_time=0.4)
        self.go("2:58:37.33", Write(R4[2]), run=0.5)
        self.go("2:58:38.11", Write(R4[3:5]), run=0.9)
        self.go("2:58:40.71", Write(R4[5:7]), run=0.5)
        self.go("2:58:42.27", TransformFromCopy(R4[2], R5[0]), FadeIn(R5[1]), TransformFromCopy(R4[4], R5[2]), run=0.9)
        xr2 = M(r"\times\, r^2", size=46, color=YEL).next_to(R5, RIGHT, buff=0.7)
        self.go("2:58:45.79", FadeIn(xr2, shift=LEFT * 0.1), run=0.5)
        self.play(Circumscribe(R5[2][-2:], color=YEL, stroke_width=3), run_time=0.7)
        self.go("2:58:48.57", ReplacementTransform(R5, R6), FadeOut(xr2), run=0.8)
        self.go("2:58:51.79", TransformFromCopy(R6, R7), run=0.9)
        self.go("2:58:55.11", Write(R8[0:3]), run=1.0)
        self.go("2:58:58.41", Write(R8[3:]), run=0.7)
        self.play(Create(answer_box(R8[4])), run_time=0.4)


# ================================================================ 2. the can in true proportion, h = 2r, tracker r

CK = 0.2
CB = np.array([-4.8, -3.0, 0])


def ell_pts(c, R, ry, a0, a1, n=40):
    t = np.linspace(a0, a1, n)
    return np.column_stack([c[0] + R * np.cos(t), c[1] + ry * np.sin(t), 0 * t])


def can_at(r):
    """A 1-litre can of radius r cm drawn to scale (bottom centre CB)."""
    R, Hh = r * CK, HC(r) * CK
    ry = R * ER
    b, t = CB, CB + [0, Hh, 0]
    fill = VMobject(stroke_width=0, fill_color=GRN, fill_opacity=0.2).set_points_as_corners(
        np.vstack([ell_pts(b, R, ry, PI, 2 * PI), ell_pts(t, R, ry, 0, PI), ell_pts(b, R, ry, PI, PI, 1)]))
    top = VMobject(stroke_color=CHALK, stroke_width=4).set_points_smoothly(ell_pts(t, R, ry, 0, 2 * PI, 60))
    bf = VMobject(stroke_color=CHALK, stroke_width=4).set_points_smoothly(ell_pts(b, R, ry, PI, 2 * PI))
    bb = DashedVMobject(VMobject(stroke_color=DIM, stroke_width=2.5).set_points_smoothly(ell_pts(b, R, ry, 0, PI)), num_dashes=10)
    sl = Line(b + [-R, 0, 0], t + [-R, 0, 0], color=CHALK, stroke_width=4)
    sr = Line(b + [R, 0, 0], t + [R, 0, 0], color=CHALK, stroke_width=4)
    return VGroup(fill, bb, sl, sr, bf, top)


def can_top(r):
    return CB + [0, HC(r) * CK, 0]


def s_axes():
    ax = axes((0, 10.5, 2), (0, 1200, 500), 5.0, 2.8, (3.7, -1.35, 0), x_label="r", y_label="S", num_size=28)
    return ax, plot(ax, SA, 1.8, 10)


class K29_CanBest(Shot):
    def body(self):
        self.title("The Cheapest Can", animate=False)
        d = can_setup()
        d["fill"].set_z_index(-1)
        r = can_rows()
        r["R3"].shift(UP * (CROWS[0] - CROWS[2]))
        R8 = r["R8"]
        bx = answer_box(R8[4])
        rest = VGroup(r["R3"], r["R4"], r["R6"], r["R7"])
        self.add(d["fill"], d["can"], d["rad"], d["rl"], d["hl"], rest, R8, bx)
        ans = col(at_eq(M("r", r"\approx", r"5.42\text{ cm}", size=50), 1, 2.4, 1.75), {0: ORG, 2: GRN})
        self.go("2:59:01.4", FadeOut(rest), FadeOut(R8[1:3]), FadeOut(bx), ReplacementTransform(VGroup(R8[0], R8[3], R8[4]), ans), run=0.7)
        hrow = col(at_eq(M("h", "=", r"\frac{1000}{\pi\cdot 5.42^2}", size=50), 1, 2.4, 0.55), {0: ORG})
        hres = col(at_eq(M("h", r"\approx", r"10.84\text{ cm}", size=50), 1, 2.4, -0.65), {0: ORG, 2: GRN})
        self.go("2:59:02.65", Write(hrow), run=1.6)
        self.go("2:59:06.45", Write(hres), run=0.8)
        hbx = answer_box(hres[2])
        self.play(Create(hbx), run_time=0.4)

        # the can drawn to scale: as tall as it is wide
        rt = ValueTracker(RSTAR)
        R = rt.get_value
        can0 = can_at(RSTAR)
        self.go("2:59:10.07", ReplacementTransform(VGroup(d["fill"], d["can"]), can0), FadeOut(d["rad"]), FadeOut(d["rl"]),
                FadeOut(d["hl"]), run=1.0)
        lcan = always_redraw(lambda: can_at(R()))
        rad = always_redraw(lambda: Line(can_top(R()), can_top(R()) + [R() * CK, 0, 0], color=ORG, stroke_width=4))
        rl = M("r", size=40, color=ORG).add_updater(lambda m: m.move_to(can_top(R()) + [R() * CK / 2, 0.3, 0]))
        hl = M("h", size=40, color=ORG).add_updater(lambda m: m.move_to(CB + [R() * CK + 0.32, HC(R()) * CK / 2, 0]))
        self.remove(can0)
        self.add(lcan)
        self.play(Create(rad), FadeIn(rl), FadeIn(hl), run_time=0.4)
        eq2 = col(M("h", "=", "2r", size=60), {0: YEL, 1: YEL, 2: YEL}).move_to([2.6, -1.85, 0])
        self.go("2:59:12.11", Write(eq2), run=0.6)
        t0 = can_top(RSTAR)
        rr = RSTAR * CK
        diam = Line(t0 + [-rr, 0, 0], t0 + [rr, 0, 0], color=ORG, stroke_width=5)
        dl = M("2r", size=40, color=ORG).next_to(diam, UP, buff=0.55)
        self.go("2:59:13.75", FadeOut(rad), FadeOut(rl), Create(diam), FadeIn(dl), run=0.5)
        vl = Line(CB + [rr + 0.75, 0, 0], CB + [rr + 0.75, 2 * rr, 0], color=ORG, stroke_width=5)
        self.go("2:59:14.3", TransformFromCopy(diam, vl), FadeOut(hl), run=0.9)
        same = M("2r", size=40, color=ORG).next_to(vl, RIGHT, buff=0.2)
        self.play(FadeIn(same), run_time=0.3)

        # S(r): one tracker reshapes the can
        ax, cv = s_axes()
        dot = live_dot(ax, SA, rt)
        ro = live("S =", lambda: SA(R()), lambda: [-4.8, 1.95, 0], GRN, 44, fmt=lambda v: f"{v:.0f}", suf=r"\,\text{cm}^2")
        self.go("2:59:16.35", FadeOut(VGroup(ans, hrow, hres, hbx, diam, dl, vl, same)), eq2.animate.move_to([3.7, 1.35, 0]),
                Create(ax), FadeIn(ax.labels), run=0.5)
        self.play(draw(cv, 0.4), run_time=0.4)
        rl.clear_updaters()
        hl.clear_updaters()
        rl = M("r", size=40, color=ORG).add_updater(lambda m: m.move_to(can_top(R()) + [R() * CK / 2, 0.3, 0]))
        hl = M("h", size=40, color=ORG).add_updater(lambda m: m.move_to(CB + [R() * CK + 0.32, HC(R()) * CK / 2, 0]))
        live_in(self, dot, ro, rad, rl, hl, run=0.3)
        self.play(rt.animate.set_value(3.8), run_time=1.0)
        self.play(rt.animate.set_value(8.0), run_time=1.4)
        self.play(rt.animate.set_value(RSTAR), run_time=0.9)
        mn = H("least metal", 36, YEL).next_to(ax.c2p(RSTAR, SA(RSTAR)), DOWN, buff=0.3)
        self.play(FadeIn(mn, shift=DOWN * 0.1), run_time=0.4)

        # real cans: other costs
        self.go("2:59:21.3", rt.animate.set_value(4.3), FadeOut(mn), run=1.2)
        oc = H("other costs:", 38, DIM).move_to([-1.3, 1.2, 0])
        lids = H("lids", 38, DIM).next_to(oc, DOWN, buff=0.25)
        stack = H("stacking", 38, DIM).next_to(lids, DOWN, buff=0.2)
        self.go("2:59:24.03", FadeIn(oc, shift=UP * 0.1), run=0.4)
        self.go("2:59:26.03", FadeIn(lids, shift=UP * 0.1), run=0.4)
        self.go("2:59:27.59", FadeIn(stack, shift=UP * 0.1), run=0.4)
        self.go("2:59:28.95", rt.animate.set_value(RSTAR), FadeOut(VGroup(oc, lids, stack)), run=1.0)
        self.go("2:59:30.25", Circumscribe(eq2, color=YEL, stroke_width=3), run=0.8)
        freeze_wipe(self, "2:59:31.55", run=0.4)


# ================================================================ 3. closest point on y = x^2 to (0, 3)

def par_graph(center=(-3.6, -0.95, 0)):
    ax = axes((-3, 3, 1), (-1, 5, 1), 5.1, 5.1, center, num_size=28)
    cv = plot(ax, lambda x: x * x, -2.0, 2.0)
    P0 = pt(ax, 0, 3, ORG)
    P0l = M("(0,\,3)", size=36, color=ORG).next_to(P0, UL, buff=0.05)
    yl = M("y=x^2", size=40, color=BLUE).move_to(ax.c2p(2.0, 4.0) + RIGHT * 0.8)
    return ax, cv, P0, P0l, yl


def dist_live(ax, xt):
    X = xt.get_value
    o = {}
    o["Q"] = always_redraw(lambda: pt(ax, X(), X() ** 2, YEL, r=0.09))
    o["seg"] = always_redraw(lambda: Line(ax.c2p(0, 3), ax.c2p(X(), X() ** 2), color=YEL, stroke_width=4).set_z_index(3))
    o["Ql"] = M(r"(x,\,x^2)", size=34, color=YEL).add_updater(
        lambda m: m.next_to(ax.c2p(X(), X() ** 2), RIGHT if X() >= 0 else LEFT, buff=0.15))
    return o


class K29_Distance(Shot):
    def body(self):
        self.title("The Cheapest Can", animate=False)
        self.title("Closest Point", "2:59:33.4")
        ax, cv, P0, P0l, yl = par_graph()
        self.go("2:59:35.03", Create(ax), FadeIn(ax.labels), run=0.6)
        self.go("2:59:36.05", draw(cv, 0.9), run=0.9)
        self.play(FadeIn(yl), run_time=0.3)
        self.go("2:59:39.6", FadeIn(P0, scale=0.5), FadeIn(P0l), run=0.5)
        xt = ValueTracker(1.7)
        X = xt.get_value
        o = dist_live(ax, xt)
        self.go("2:59:41.45", FadeIn(o["Q"], scale=0.5), run=0.4)
        self.go("2:59:43.13", FadeIn(o["Ql"]), run=0.4)
        rd = live("d =", lambda: np.sqrt(D2(X())), lambda: [-5.3, 1.95, 0], YEL, 44, fmt=lambda v: f"{v:.2f}")
        self.go("2:59:45.2", Create(o["seg"]), run=0.4)
        live_in(self, rd, run=0.3)
        self.play(xt.animate.set_value(0.6), run_time=0.9)
        self.play(xt.animate.set_value(1.4), run_time=0.7)
        legs = always_redraw(lambda: VGroup(
            DashedLine(ax.c2p(0, 3), ax.c2p(X(), 3), color=DIM, stroke_width=3, dash_length=0.08),
            DashedLine(ax.c2p(X(), 3), ax.c2p(X(), X() ** 2), color=DIM, stroke_width=3, dash_length=0.08)))
        lx = M("x", size=32, color=DIM).add_updater(lambda m: m.next_to(ax.c2p(X() / 2, 3), UP, buff=0.08))
        self.go("2:59:47.65", FadeIn(legs), FadeIn(lx), run=0.4)
        F1 = M("d", "=", r"\sqrt{x^2+(x^2-3)^2}", size=54).move_to([3.0, 1.35, 0])
        F1[0].set_color(YEL)
        self.go("2:59:48.95", Write(F1), run=2.0)

        # the trick: d and d^2 are smallest together
        eqv = M(r"\min\ d", r"\iff", r"\min\ d^2", size=50).move_to([3.0, 0.0, 0])
        eqv[1].set_color(YEL)
        self.at("2:59:54.0")
        live_out(self, legs, lx, run=0.4)
        self.play(Circumscribe(F1[0], color=YEL, stroke_width=3), run_time=0.6)
        self.go("2:59:55.9", Write(eqv[0]), run=0.5)
        self.go("2:59:57.45", Write(eqv[1]), run=0.4)
        self.go("2:59:57.95", Write(eqv[2]), run=0.6)
        rd2 = live("d^2 =", lambda: D2(X()), lambda: [-5.3, 1.35, 0], BLUE, 44, fmt=lambda v: f"{v:.2f}")
        live_in(self, rd2, run=0.3)
        self.go("3:00:00.0", xt.animate.set_value(0.25), run=1.0)
        self.play(xt.animate.set_value(1.75), run_time=1.2)
        self.play(xt.animate.set_value(1.58), run_time=0.8)
        self.go("3:00:05.3", Circumscribe(F1[2][0:2], color=RED, stroke_width=4), run=0.8)
        F2 = col(M("d^2", "=", "x^2", "+", "(x^2-3)^2", size=54), {0: YEL}).move_to([3.0, -1.4, 0])
        self.go("3:00:09.0", TransformFromCopy(F1, F2), run=1.0)
        self.play(Circumscribe(F2, color=BLUE, stroke_width=3), run_time=0.8)
        freeze_wipe(self, "3:00:12.9", run=0.4, keep=(F2,))
        self.play(F2.animate.shift([EQD - F2[1].get_x(), DROWS[0] - F2[1].get_y(), 0]), run_time=0.5)


# ================================================================ 4. the d^2 algebra

EQD = -0.4
DROWS = [1.6, 0.5, -0.6, -1.75, -2.9]


def dist_rows():
    r = {}
    r["A0"] = col(at_eq(M("d^2", "=", "x^2", "+", "(x^2-3)^2", size=54), 1, EQD, DROWS[0]), {0: YEL})
    r["A1"] = at_eq(M("(x^2-3)^2", "=", "x^4-6x^2+9", size=54), 1, EQD, DROWS[1])
    r["A2"] = col(at_eq(M("d^2", "=", "x^4-5x^2+9", size=54), 1, EQD, DROWS[2]), {0: YEL})
    r["B1"] = col(at_eq(M("(d^2)'", "=", "4x^3-10x", size=54), 1, EQD, DROWS[1]), {0: PINK})
    r["B2"] = eq_left(M("=", "2x", "(2x^2-5)", size=54), EQD, DROWS[2])
    r["B3"] = col(at_eq(M("x", "=", "0", r"\quad\text{or}\quad", "x^2", "=", r"\frac{5}{2}", size=54), 1, EQD, DROWS[3]),
                  {2: ORG, 3: DIM, 6: ORG})
    r["C1"] = col(at_eq(M(r"x=0:", r"\quad d^2", "=", "9", size=54), 2, EQD, DROWS[2]), {1: YEL})
    r["C2"] = col(at_eq(M(r"x^2=\tfrac{5}{2}:", r"\quad d^2", "=", r"\frac{25}{4}", "-", r"\frac{25}{2}", "+", "9", size=54),
                        2, EQD, DROWS[3]), {1: YEL})
    r["C3"] = col(eq_left(M("=", "6.25", "-", "12.5", "+", "9", "=", "2.75", size=54), EQD, DROWS[4]), {7: GRN})
    return r


class K29_DistAlgebra(Shot):
    def body(self):
        self.title("Closest Point", animate=False)
        r = dist_rows()
        A0, A1, A2 = r["A0"], r["A1"], r["A2"]
        self.add(A0)
        self.go("3:00:14.1", Circumscribe(A0[4], color=YEL, stroke_width=3), run=0.8)
        self.go("3:00:15.6", TransformFromCopy(A0[4], A1[0]), FadeIn(A1[1]), run=0.8)
        self.go("3:00:18.13", Write(A1[2]), run=1.3)
        self.go("3:00:21.45", Circumscribe(A0[2], color=YEL, stroke_width=3), run=0.7)
        self.go("3:00:23.0", Write(A2[0:2]), run=0.4)
        self.go("3:00:23.65", Write(A2[2]), run=1.0)
        self.play(Circumscribe(A2, color=BLUE, stroke_width=3), run_time=0.8)

        B1, B2, B3 = r["B1"], r["B2"], r["B3"]
        self.go("3:00:27.31", FadeOut(A0), FadeOut(A1), A2.animate.shift(UP * (DROWS[0] - DROWS[2])), run=0.6)
        self.play(Write(B1[0:2]), run_time=0.4)
        self.go("3:00:28.45", Write(B1[2]), run=1.0)
        self.go("3:00:32.03", Write(B2), run=1.4)
        self.go("3:00:35.4", Write(B3[0:3]), run=0.6)
        self.go("3:00:36.65", Write(B3[3:]), run=1.0)

        C1, C2, C3 = r["C1"], r["C2"], r["C3"]
        self.go("3:00:39.95", FadeOut(B1), FadeOut(B2), B3.animate.shift(UP * (DROWS[1] - DROWS[3])), run=0.6)
        self.play(Write(C1[0]), run_time=0.5)
        self.go("3:00:41.41", Write(C1[1:]), run=0.6)
        self.go("3:00:42.9", Write(C2[0]), run=0.7)
        self.go("3:00:45.45", Write(C2[1:3]), run=0.4)
        self.go("3:00:45.8", Write(C2[3]), run=0.5)
        self.go("3:00:47.31", Write(C2[4:6]), run=0.7)
        self.go("3:00:48.69", Write(C2[6:]), run=0.4)
        self.go("3:00:50.2", Write(C3[0:2]), run=0.6)
        self.go("3:00:51.49", Write(C3[2:4]), run=0.6)
        self.go("3:00:53.27", Write(C3[4:6]), run=0.4)
        self.go("3:00:54.3", Write(C3[6:]), run=0.6)


# ================================================================ 5. the answer on the graphs: two closest points, x = 0 a local max

def d2_axes():
    ax = axes((-3, 3, 1), (0, 11, 2), 5.4, 2.8, (3.6, -1.95, 0), x_label="x", y_label="d^2", num_size=28)
    return ax, plot(ax, D2, -2.2, 2.2)


class K29_DistAnswer(Shot):
    def body(self):
        self.title("Closest Point", animate=False)
        r = dist_rows()
        A2, B3, C1, C2, C3 = r["A2"], r["B3"], r["C1"], r["C2"], r["C3"]
        A2.shift(UP * (DROWS[0] - DROWS[2]))
        B3.shift(UP * (DROWS[1] - DROWS[3]))
        self.add(A2, B3, C1, C2, C3)
        self.go("3:00:56.39", Circumscribe(C3[7], color=GRN, stroke_width=4), C1[3].animate.set_color(DIM), run=0.8)
        self.wipe("3:00:58.4", run=0.4)
        ax, cv, P0, P0l, yl = par_graph()
        axd, cvd = d2_axes()
        self.play(FadeIn(VGroup(ax, ax.labels, cv, yl, P0, P0l)), Create(axd), FadeIn(axd.labels), run_time=0.5)
        self.play(draw(cvd, 0.5), run_time=0.5)
        xt = ValueTracker(0.8)
        X = xt.get_value
        o = dist_live(ax, xt)
        rd = live("d =", lambda: np.sqrt(D2(X())), lambda: [-5.3, 1.95, 0], YEL, 44, fmt=lambda v: f"{v:.2f}")
        dd = live_dot(axd, D2, xt, YEL)
        ansx = col(M("x", "=", r"\pm\sqrt{\tfrac{5}{2}}", r"\approx\;", r"\pm 1.58", size=50), {4: GRN}).move_to([3.6, 1.75, 0])
        live_in(self, o["seg"], o["Q"], dd, rd, run=0.2)
        self.go("3:01:00.1", Write(ansx), xt.animate.set_value(1.58), run=1.6)
        self.go("3:01:06.5", xt.animate.set_value(-1.58), run=2.0)
        best = VGroup(*[pt(ax, s * 2.5 ** 0.5, 2.5, GRN, r=0.1) for s in (1, -1)],
                      *[pt(axd, s * 2.5 ** 0.5, 2.75, GRN, r=0.1) for s in (1, -1)])
        self.play(FadeIn(best, scale=0.5), run_time=0.5)
        dist = col(M("d", "=", r"\sqrt{2.75}", r"\approx\;", "1.66", size=50), {0: YEL, 4: GRN}).move_to([3.6, 0.6, 0])
        self.go("3:01:11.1", Write(dist[0:3]), run=1.0)
        self.go("3:01:15.4", Write(dist[3:]), run=0.6)
        self.play(Create(answer_box(dist[4])), run_time=0.4)
        self.go("3:01:18.4", xt.animate.set_value(0.0), run=1.4)
        bot = Circle(radius=0.22, color=YEL, stroke_width=3).move_to(ax.c2p(0, 0))
        self.go("3:01:19.95", Create(bot), run=0.5)
        nm = note("local max", axd.c2p(0, 9), direction=LEFT, color=YEL, size=36, dist=0.8, angle=0.5)
        self.go("3:01:26.05", FadeIn(nm[0]), Create(nm[1]), run=0.6)
        freeze_wipe(self, "3:01:27.45", run=0.4)


# ================================================================ 6. the profit hill

EQP = -3.8


def p_axes():
    ax = axes((0, 60, 10), (-1000, 1000, 500), 4.6, 3.2, (4.1, -1.2, 0), x_label="x", y_label="P", nums=False)
    for v in (10, 30, 50):
        ax.labels.add(M(f"{v}", size=28, color=FAINT).next_to(ax.c2p(v, 0), DOWN, buff=0.12))
    return ax, plot(ax, PF, 0, 60)


class K29_Profit(Shot):
    def body(self):
        self.title("Closest Point", animate=False)
        self.title("Most Profit", "3:01:28.4")
        P0 = col(M("P(x)", "=", "-2x^2", "+", "120x", "-", "1000", size=52), {0: BLUE}).move_to([0, 1.65, 0])
        self.go("3:01:33.37", Write(P0[0:2]), run=0.5)
        self.go("3:01:34.63", Write(P0[2:]), run=2.0)
        ax, cv = p_axes()
        xt = ValueTracker(5.0)
        X = xt.get_value
        self.go("3:01:39.3", Create(ax), FadeIn(ax.labels), run=0.5)
        self.play(draw(cv, 0.8), run_time=0.8)
        dot = live_dot(ax, PF, xt, GRN)
        tan = live_tan(ax, PF, xt, 1.6)
        ro = live(r"P = \$", lambda: PF(X()), lambda: [4.1, 0.85, 0], GRN, 42)
        live_in(self, dot, tan, ro, run=0.3)
        D1 = col(at_eq(M("P'(x)", "=", "-4x+120", size=50), 1, EQP, 0.45), {0: PINK})
        self.go("3:01:42.4", Write(D1[0:2]), run=0.4)
        self.go("3:01:43.57", Write(D1[2]), xt.animate.set_value(18), run=1.4)
        D2r = col(at_eq(M("x", "=", "30", size=50), 1, EQP, -0.6), {2: ORG})
        self.go("3:01:46.41", Write(D2r), xt.animate.set_value(30), run=1.5)
        D3 = col(at_eq(M("P''", "=", "-4", "<", "0", size=50), 1, EQP, -1.65), {0: PURP})
        mx = H("max", 42, YEL).next_to(D3, RIGHT, buff=0.4)
        self.go("3:01:48.35", Write(D3[0:3]), run=0.7)
        self.go("3:01:49.75", Write(D3[3:]), run=0.4)
        self.go("3:01:50.8", FadeIn(mx, shift=LEFT * 0.1), run=0.4)

        E1 = at_eq(M("P(30)", "=", r"-2\cdot 900", "+", "3600", "-", "1000", size=46), 1, EQP, -0.6)
        E2 = eq_left(M("=", "-1800", "+", "3600", "-", "1000", size=46), E1[1].get_x(), -1.65)
        E3 = col(eq_left(M(r"=\;", r"\$800", size=50), E1[1].get_x(), -2.7), {1: GRN})
        self.go("3:01:51.6", FadeOut(VGroup(D1, D3, mx)), D2r.animate.shift(UP * 1.05), run=0.5)
        self.play(Write(E1[0:2]), run_time=0.5)
        self.go("3:01:53.1", Write(E1[2]), run=0.7)
        self.go("3:01:54.81", Write(E1[3:5]), run=0.6)
        self.go("3:01:56.67", Write(E1[5:]), run=0.5)
        self.go("3:01:58.33", Write(E2[0:2]), run=0.6)
        self.go("3:01:59.37", Write(E2[2:4]), run=0.5)
        self.go("3:02:00.81", Write(E2[4:]), run=0.5)
        unclock(ro)
        pk = ax.c2p(30, 800)
        dash = DashedLine(pk, ax.c2p(0, 800), color=DIM, stroke_width=2.5, dash_length=0.08)
        l8 = M("800", size=28, color=GRN).next_to(ax.c2p(0, 800), LEFT, buff=0.1)
        self.go("3:02:02.51", Write(E3), Create(dash), FadeIn(l8), run=0.6)
        self.play(Create(answer_box(E3[1])), run_time=0.4)


# ================================================================ 7. try this one: two numbers that add to 20

RK = 0.2
RB = np.array([-6.0, -3.1, 0])
EQT = 2.0


def prod_rect(x):
    return Polygon(RB, RB + [x * RK, 0, 0], RB + [x * RK, (20 - x) * RK, 0], RB + [0, (20 - x) * RK, 0],
                   stroke_color=CHALK, stroke_width=5, fill_color=GRN, fill_opacity=0.22)


class K29_TryProduct(Shot):
    def body(self):
        self.title("Biggest Product", "3:02:05.5")
        T1 = M(r"\text{sum}", "=", "20", size=50)
        at_eq(T1, 1, EQT, 1.7)
        T2 = M(r"\text{product}", "=", "?", size=50)
        at_eq(T2, 1, EQT, 0.7)
        T2[2].set_color(YEL)
        self.go("3:02:06.0", Write(T1), run=0.8)
        self.go("3:02:08.0", Write(T2), run=0.8)
        xt = ValueTracker(6.0)
        X = xt.get_value
        rect = always_redraw(lambda: prod_rect(X()))
        lx = M("x", size=42, color=ORG).add_updater(lambda m: m.move_to(RB + [X() * RK / 2, -0.32, 0]))
        ly = M("20-x", size=42, color=ORG).add_updater(lambda m: m.move_to(RB + [X() * RK + 0.75, (20 - X()) * RK / 2, 0]))
        r0 = prod_rect(6.0)
        self.go("3:02:10.1", Create(r0), run=0.5)
        self.remove(r0)
        self.add(rect)
        self.go("3:02:10.55", FadeIn(lx), run=0.3)
        self.go("3:02:11.05", FadeIn(ly), run=0.3)
        T3 = col(at_eq(M("P", "=", "x", "(20-x)", size=50), 1, EQT, 0.7), {0: GRN})
        ro = live("P =", lambda: PR(X()), lambda: [-4.3, 1.75, 0], GRN, 46, fmt=lambda v: f"{v:.0f}")
        self.go("3:02:12.5", ReplacementTransform(T2, T3), run=0.7)
        live_in(self, ro, run=0.3)
        ar = M(r"\text{area} = \text{product}", size=36, color=DIM).move_to([-4.3, 1.1, 0])
        self.play(xt.animate.set_value(15.0), FadeIn(ar), run_time=1.3)
        T4 = eq_left(M("=", "20x-x^2", size=50), EQT, -0.35)
        self.go("3:02:14.85", Write(T4), xt.animate.set_value(4.0), run=1.4)
        T5 = col(at_eq(M("P'", "=", "20-2x", size=50), 1, EQT, -1.4), {0: PINK})
        self.go("3:02:17.35", Write(T5), run=1.0)
        T6 = col(at_eq(M("x", "=", "10", size=50), 1, EQT, -2.45), {2: ORG})
        self.go("3:02:19.9", Write(T6), xt.animate.set_value(10.0), run=1.6)
        ten = M(r"10\times 10", r"=\;", "100", size=50).move_to([3.4, -3.3, 0])
        ten[2].set_color(GRN)
        self.go("3:02:22.1", FadeOut(VGroup(T1)), run=0.3)
        self.play(Write(ten), run_time=0.8)
        unclock(ro, lx, ly, rect)
        self.go("3:02:24.8", Create(answer_box(ten[2])), Create(answer_box(ro)), run=0.5)
        freeze_wipe(self, "3:02:25.3", run=0.35)


# ================================================================ 8. L'Hopital: the 0/0 callback

class K29_LHIntro(Shot):
    def body(self):
        self.title("Biggest Product", animate=False)
        self.title("L'Hôpital's Rule", "3:02:27.0")
        zz = M(r"\frac{0}{0}", size=84, color=YEL).move_to([0, 1.1, 0])
        self.go("3:02:31.05", Write(zz), run=0.7)
        es = [M(r"\lim_{x\to 3}\frac{x^2-9}{x-3}", size=46), M(r"\lim_{x\to 0}\frac{\frac{1}{x+2}-\frac{1}{2}}{x}", size=46),
              M(r"\lim_{x\to 9}\frac{\sqrt{x}-3}{x-9}", size=46)]
        labs = ["factor", "combine fractions", "conjugate"]
        times = ["3:02:34.15", "3:02:35.05", "3:02:36.5"]
        grp = VGroup()
        for i, (e, s, t) in enumerate(zip(es, labs, times)):
            e.move_to([-4.4 + 4.4 * i, -0.75, 0])
            l = H(s, 36, DIM).move_to([-4.4 + 4.4 * i, -2.05, 0])
            self.go(t, FadeIn(e, shift=UP * 0.1), FadeIn(l, shift=UP * 0.1), run=0.5)
            grp.add(e, l)
        self.go("3:02:38.5", grp.animate.set_opacity(0.25), run=0.6)
        E = M(r"\lim_{x\to 0}", r"\frac{e^x-1}{x}", size=72).move_to([0, -0.9, 0])
        self.go("3:02:40.6", FadeOut(grp), run=0.4)
        self.play(Write(E), run_time=1.6)
        nf = VGroup(cross_mark(RED, 0.16), H("nothing to factor", 42, RED)).arrange(RIGHT, buff=0.25).move_to([0, -2.6, 0])
        self.go("3:02:45.85", FadeIn(nf, shift=UP * 0.1), run=0.5)
        self.wipe("3:02:46.95", run=0.4)


# ================================================================ 9. the rule, and why: heights become slopes

def lh_f(t):
    return 0.55 * t + 0.25 * t ** 2 - 0.12 * t ** 3


def lh_g(t):
    return 0.275 * t - 0.2 * t ** 2 + 0.1 * t ** 3


assert abs(slope(lh_f, 0) / slope(lh_g, 0) - 2) < 1e-6 and lh_f(0) == 0 and lh_g(0) == 0

WC = np.array([-2.6, -1.55, 0])
WS = 2.9
WH = 0.6
S0 = 0.6


def wpt(s, y):
    return WC + np.array([s * WS, y * WS, 0])


def wcurve(fn, w, color):
    """fn near a, seen through a window of half-width w (x and y scaled alike); cut where it leaves the window."""
    s = np.linspace(-1, 1, 161)
    y = fn(w * s) / w
    ok = np.abs(y) <= WH
    a = b = 80
    while a > 0 and ok[a - 1]:
        a -= 1
    while b < 160 and ok[b + 1]:
        b += 1
    return VMobject(stroke_color=color, stroke_width=5).set_points_smoothly([wpt(s[i], y[i]) for i in range(a, b + 1)])


def rule_formula():
    RF = M(r"\lim_{x\to a}", r"\frac{f(x)}{g(x)}", "=", r"\lim_{x\to a}", r"\frac{f'(x)}{g'(x)}", size=54).move_to([-2.6, 1.6, 0])
    RF[4].set_color(PINK)
    cond = M(r"\text{if}", r"\frac{0}{0}", r"\text{or}", r"\frac{\infty}{\infty}", size=50)
    cond[1].set_color(YEL)
    cond[3].set_color(YEL)
    cond.arrange(RIGHT, buff=0.3).move_to([3.9, 1.6, 0])
    return RF, cond


class K29_Rule(Shot):
    def body(self):
        self.title("L'Hôpital's Rule", animate=False)
        RF, cond = rule_formula()
        self.go("3:02:49.65", Write(RF[0:2]), run=1.0)
        self.go("3:02:52.7", Write(cond[0:2]), run=0.6)
        # the picture: both curves pass through 0 at a
        u = ValueTracker(0.0)
        W = lambda: 10 ** (-u.get_value())
        frame = RoundedRectangle(width=2 * WS + 0.4, height=2 * WH * WS + 0.4, corner_radius=0.2, stroke_color=DIM,
                                 stroke_width=3).move_to(WC)
        axl = Line(wpt(-1, 0), wpt(1, 0), color=DIM, stroke_width=3)
        A = Dot(WC, radius=0.08, color=ORG).set_z_index(6)
        al = M("a", size=38, color=ORG).next_to(A, DOWN, buff=0.15)
        xl = M("x", size=34, color=DIM).next_to(wpt(S0, 0), DOWN, buff=0.15)
        cf = always_redraw(lambda: wcurve(lh_f, W(), BLUE))
        cg = always_redraw(lambda: wcurve(lh_g, W(), PURP))
        leg = VGroup(VGroup(Line(ORIGIN, RIGHT * 0.45, color=BLUE, stroke_width=5), M("f", size=40, color=BLUE)).arrange(RIGHT, buff=0.15),
                     VGroup(Line(ORIGIN, RIGHT * 0.45, color=PURP, stroke_width=5), M("g", size=40, color=PURP)).arrange(RIGHT, buff=0.15)
                     ).arrange(DOWN, buff=0.18, aligned_edge=LEFT).move_to(wpt(-1, 0) + [0.55, 1.35, 0])
        f0, g0 = wcurve(lh_f, 1, BLUE), wcurve(lh_g, 1, PURP)
        self.go("3:02:53.35", Create(frame), Create(axl), FadeIn(A), FadeIn(al), run=0.4)
        self.play(Create(f0), Create(g0), FadeIn(leg), run_time=0.65)
        self.remove(f0, g0)
        self.add(cf, cg)
        self.go("3:02:54.4", Write(cond[2:]), run=0.6)
        bf = always_redraw(lambda: Line(wpt(S0, 0) + LEFT * 0.06, wpt(S0, lh_f(S0 * W()) / W()) + LEFT * 0.06, color=BLUE, stroke_width=8))
        bg = always_redraw(lambda: Line(wpt(S0, 0) + RIGHT * 0.06, wpt(S0, lh_g(S0 * W()) / W()) + RIGHT * 0.06, color=PURP, stroke_width=8))
        ratio = live(r"\frac{f(x)}{g(x)} =", lambda: lh_f(S0 * W()) / lh_g(S0 * W()), lambda: [4.0, -0.7, 0], CHALK, 50,
                     fmt=lambda v: f"{v:.2f}")
        live_in(self, bf, bg, run=0.3)
        self.play(FadeIn(xl), run_time=0.2)
        live_in(self, ratio, run=0.3)
        self.go("3:02:56.1", Write(RF[2]), run=0.4)
        self.go("3:02:57.3", Write(RF[3:]), run=1.1)
        zoom = live(r"\text{zoom}\ \times", lambda: 1 / W(), lambda: wpt(1, -WH) + [-1.05, 0.35, 0], DIM, 36,
                    fmt=lambda v: f"{v:,.0f}")
        live_in(self, zoom, run=0.3)
        self.play(u.animate.set_value(2.7), run_time=3.2)
        # now they are straight lines: the heights are slope times (x - a)
        sl = M(r"\frac{f'(a)}{g'(a)}", "=", "2", size=50, color=PINK).move_to([4.0, -2.3, 0])
        fl = M("f'(a)", size=38, color=PINK).move_to(wpt(0.4, 0.42))
        gl = M("g'(a)", size=38, color=PINK).move_to(wpt(0.86, 0.1))
        self.go("3:03:02.1", FadeIn(fl, shift=LEFT * 0.1), run=0.5)
        self.go("3:03:04.5", FadeIn(gl, shift=LEFT * 0.1), run=0.5)
        self.play(Write(sl), run_time=0.7)
        self.go("3:03:06.1", Circumscribe(RF[3:], color=PINK, stroke_width=3), run=0.8)
        freeze_wipe(self, "3:03:07.4", run=0.4, keep=(RF, cond))


# ================================================================ 10. separately: not the quotient rule

class K29_Separately(Shot):
    def body(self):
        self.title("L'Hôpital's Rule", animate=False)
        RF, cond = rule_formula()
        self.add(RF, cond)
        fr = RF[4]
        nb = SurroundingRectangle(fr[0:5], color=YEL, buff=0.06, stroke_width=3)
        db = SurroundingRectangle(fr[6:], color=YEL, buff=0.06, stroke_width=3)
        self.go("3:03:09.5", Create(nb), run=0.4)
        self.play(Create(db), run_time=0.4)
        QR = M(r"\left(\frac{f}{g}\right)'", "=", r"\frac{g\,f'-f\,g'}{g^2}", size=52).move_to([-3.4, -1.0, 0])
        ql = H("quotient rule", 36, DIM).next_to(QR, UP, buff=0.35)
        self.go("3:03:11.6", Write(QR), FadeIn(ql), run=1.0)
        X = cross_mark(RED, 0.75).move_to(QR).set_stroke(width=7)
        nt = H("not this", 38, RED).next_to(QR, DOWN, buff=0.35)
        self.go("3:03:15.15", Create(X), FadeIn(nt), run=0.5)
        sep = VGroup(M("f", r"\to", "f'", size=56), M("g", r"\to", "g'", size=56)).arrange(DOWN, buff=0.5).move_to([3.4, -1.0, 0])
        for m in sep:
            m[2].set_color(PINK)
        tl = H("top on its own", 34, DIM).next_to(sep[0], RIGHT, buff=0.35)
        bl = H("bottom on its own", 34, DIM).next_to(sep[1], RIGHT, buff=0.35)
        VGroup(sep, tl, bl).move_to([3.3, -1.0, 0])
        self.go("3:03:17.17", Write(sep[0]), FadeIn(tl), run=0.6)
        self.go("3:03:18.61", Write(sep[1]), FadeIn(bl), run=0.6)
        ok = tick_mark(GRN, 0.5).next_to(sep, UP, buff=0.3)
        self.play(Create(ok), run_time=0.4)
        self.go("3:03:20.6", Circumscribe(VGroup(QR, X), color=RED, stroke_width=3), run=0.8)

        self.go("3:03:22.2", FadeOut(VGroup(QR, ql, X, nt, sep, tl, bl, ok, nb, db)), run=0.4)
        ck = H("check first:", 46, YEL).move_to([-3.6, -1.1, 0])
        c1 = M(r"\frac{0}{0}", r"\,\text{?}", size=60).move_to([0.4, -1.1, 0])
        c2 = M(r"\frac{\infty}{\infty}", r"\,\text{?}", size=60).move_to([3.4, -1.1, 0])
        self.go("3:03:22.7", FadeIn(ck, shift=UP * 0.1), run=0.5)
        self.go("3:03:24.17", Write(c1), run=0.6)
        self.go("3:03:25.8", Write(c2), run=0.6)
        self.go("3:03:27.75", Circumscribe(cond, color=YEL, stroke_width=3), run=0.8)
        ul = Underline(ck, color=YEL, stroke_width=4)
        self.go("3:03:29.0", Create(ul), run=0.4)
        self.wipe("3:03:29.75", run=0.4)


# ================================================================ 11. e^x - 1 over x

class K29_ExpEx(Shot):
    def body(self):
        self.title("L'Hôpital's Rule", animate=False)
        self.title("Seeing It Work", "3:03:30.5")
        X1 = M(r"\lim_{x\to 0}", r"\frac{e^x-1}{x}", size=56)
        put_left(X1, -6.2, 1.45)
        self.go("3:03:32.3", Write(X1), run=2.0)
        tag = M(r"\to", r"\frac{e^0-1}{0}", "=", r"\frac{0}{0}", size=46).next_to(X1, RIGHT, buff=0.45)
        tag[3].set_color(YEL)
        self.go("3:03:37.3", Write(tag[0:2]), run=0.6)
        self.go("3:03:38.0", Write(tag[2:]), run=0.5)
        X2 = M("=", r"\lim_{x\to 0}", r"\frac{e^x}{1}", size=56)
        eq_left(X2, -5.8, -0.35)
        X2[2][0:2].set_color(PINK)
        X2[2][3].set_color(PINK)
        lh = H("L'Hôpital", 28, PINK).next_to(X2[0], UP, buff=0.3)
        lh.shift(RIGHT * (-6.3 - lh.get_left()[0]))
        self.go("3:03:39.6", FadeIn(lh, shift=DOWN * 0.1), Write(X2[0:2]), run=0.6)
        self.go("3:03:41.0", TransformFromCopy(X1[1][0:4], X2[2][0:2]), Create(X2[2][2]), run=0.9)
        self.go("3:03:43.4", TransformFromCopy(X1[1][5], X2[2][3]), run=0.7)
        self.go("3:03:45.45", Circumscribe(X2[1:], color=PINK, stroke_width=3), run=0.8)
        # the graph: a hole at (0, 1)
        ax = axes((-2, 2, 1), (0, 3, 1), 4.2, 3.0, (4.1, -1.3, 0), y_label="", num_size=28)
        cv = VGroup(plot(ax, EQ, -2, -0.03), plot(ax, EQ, 0.03, 1.8))
        hl = hole(ax, 0, 1)
        self.go("3:03:46.3", Create(ax), FadeIn(ax.labels), run=0.5)
        self.play(Create(cv), FadeIn(hl), run_time=0.8)
        xa, xb = ValueTracker(-1.8), ValueTracker(1.5)
        da = always_redraw(lambda: pt(ax, xa.get_value(), EQ(xa.get_value()), ORG))
        db = always_redraw(lambda: pt(ax, xb.get_value(), EQ(xb.get_value()), ORG))
        self.add(da, db)
        self.play(xa.animate.set_value(-0.12), xb.animate.set_value(0.12), run_time=2.0)
        X3 = M("=", "e^0", "=", "1", size=56)
        eq_left(X3, -5.8, -1.95)
        X3[3].set_color(GRN)
        self.go("3:03:49.8", Write(X3[0:2]), run=0.6)
        one = M("1", size=34, color=GRN).next_to(ax.c2p(0, 1), UL, buff=0.12)
        self.go("3:03:51.0", Write(X3[2:]), FadeIn(one), run=0.4)
        self.play(Create(answer_box(X3[3])), run_time=0.3)
        unclock(da, db)
        self.wipe("3:03:51.65", run=0.25)


# ================================================================ 12. sin x / x in one line; x^2 - 9 over x - 3

def squeeze_sketch(c):
    c = np.array(c, float)
    r, a = 1.3, 0.75
    arc = Arc(radius=r, start_angle=0, angle=PI / 2, arc_center=c, color=DIM, stroke_width=3)
    axs = VGroup(Line(c, c + [r + 0.3, 0, 0], color=DIM, stroke_width=2.5), Line(c, c + [0, r + 0.3, 0], color=DIM, stroke_width=2.5))
    p = c + r * np.array([np.cos(a), np.sin(a), 0])
    inner = Polygon(c, c + [r, 0, 0], p, color=DIM, stroke_width=3)
    outer = Polygon(c, c + [r, 0, 0], c + [r, r * np.tan(a), 0], color=DIM, stroke_width=3)
    return VGroup(axs, arc, outer, inner)


class K29_SinX(Shot):
    def body(self):
        self.title("Seeing It Work", animate=False)
        self.title("The Famous Limit", "3:03:51.95")
        Y = M(r"\lim_{x\to 0}", r"\frac{\sin x}{x}", "=", r"\lim_{x\to 0}", r"\frac{\cos x}{1}", "=", r"\cos 0", r"=\;", "1",
              size=56).move_to([0, 1.2, 0])
        Y[4][0:4].set_color(PINK)
        Y[4][5].set_color(PINK)
        Y[8].set_color(GRN)
        self.go("3:03:52.45", Write(Y[0:2]), run=1.1)
        sk = squeeze_sketch([2.6, -2.6, 0])
        skl = H("Chapter 3: a whole proof", 34, DIM).next_to(sk, LEFT, buff=0.5)
        self.go("3:03:54.5", Create(sk), run=1.0)
        self.go("3:03:55.6", FadeIn(skl, shift=LEFT * 0.1), run=0.5)
        self.go("3:03:57.45", FadeOut(sk), FadeOut(skl), run=0.5)
        self.go("3:03:58.6", Write(Y[2:4]), run=0.5)
        self.play(TransformFromCopy(Y[1][0:3], Y[4][0:3]), TransformFromCopy(Y[1][3], Y[4][3]), Create(Y[4][4]), run_time=0.7)
        self.go("3:04:01.1", TransformFromCopy(Y[1][5], Y[4][5]), run=0.6)
        self.go("3:04:02.45", Write(Y[5:7]), run=0.6)
        self.go("3:04:03.35", Write(Y[7:]), run=0.4)
        self.play(Create(answer_box(Y[8])), run_time=0.3)
        ul = brush_line(Y.width + 0.4, center=Y.get_bottom() + DOWN * 0.22)
        self.go("3:04:04.65", Create(ul), run=0.6)

        # but that limit was used to prove (sin x)' = cos x: a circle
        A = M(r"\lim_{x\to 0}\frac{\sin x}{x}=1", size=44).move_to([-3.6, -1.75, 0])
        B = M(r"(\sin x)'=\cos x", size=44, color=PINK).move_to([3.6, -1.75, 0])
        top = CurvedArrow(A.get_top() + UP * 0.1, B.get_top() + UP * 0.1, angle=-0.7, color=DIM, stroke_width=3, tip_length=0.16)
        tl = H("used to prove", 32, DIM).next_to(top, UP, buff=0.05)
        bot = CurvedArrow(B.get_bottom() + DOWN * 0.1, A.get_bottom() + DOWN * 0.1, angle=-0.7, color=RED, stroke_width=3, tip_length=0.16)
        bl = H("L'Hôpital", 32, RED).next_to(bot, DOWN, buff=0.02)
        self.go("3:04:07.6", FadeIn(A, shift=UP * 0.1), run=0.5)
        self.go("3:04:08.65", Create(top), FadeIn(tl), run=0.7)
        self.go("3:04:09.85", FadeIn(B, shift=UP * 0.1), run=0.5)
        self.go("3:04:12.5", Create(bot), FadeIn(bl), run=0.8)
        circ = H("a circle", 36, RED).move_to([0, -1.75, 0])
        self.go("3:04:14.5", FadeIn(circ), run=0.4)
        chk = VGroup(tick_mark(GRN, 0.45), H("great as a check", 36, GRN)).arrange(RIGHT, buff=0.2).move_to([3.9, 0.05, 0])
        self.go("3:04:16.6", FadeIn(chk, shift=UP * 0.1), run=0.5)

        # x^2 - 9 over x - 3: same answer as factoring
        self.wipe("3:04:17.75", run=0.3)
        self.title("Same as Factoring")
        Z = M(r"\lim_{x\to 3}", r"\frac{x^2-9}{x-3}", "=", r"\lim_{x\to 3}", r"\frac{2x}{1}", r"=\;", "6", size=56).move_to([0, 0.9, 0])
        Z[4][0:2].set_color(PINK)
        Z[4][3].set_color(PINK)
        Z[6].set_color(GRN)
        self.go("3:04:18.65", Write(Z[0:2]), run=1.4)
        self.go("3:04:23.65", Write(Z[2:5]), run=0.9)
        self.go("3:04:25.4", Write(Z[5:]), run=0.4)
        self.play(Create(answer_box(Z[6])), run_time=0.3)
        F = M(r"\frac{(x-3)(x+3)}{x-3}", "=", "x+3", r"\to", "6", size=48, color=DIM).move_to([0.9, -1.5, 0])
        F[4].set_color(GRN)
        fl = H("factoring:", 36, DIM).next_to(F, LEFT, buff=0.4)
        self.go("3:04:26.45", FadeIn(fl), Write(F), run=0.8)
        self.play(Create(strike_g(F[0][0:5], F[0][11:14])), run_time=0.4)
        self.wipe("3:04:27.6", run=0.3)


# ================================================================ 13. using it twice; infinity over infinity begins

def inf_setup():
    return M(r"\lim_{x\to\infty}", r"\frac{\ln x}{x}", size=64).move_to([0, 0.9, 0])


class K29_Twice(Shot):
    def body(self):
        self.title("Same as Factoring", animate=False)
        self.title("Use It Twice", "3:04:28.3")
        W1 = M(r"\lim_{x\to 0}", r"\frac{1-\cos x}{x^2}", size=54)
        put_left(W1, -3.3, 1.55)
        self.go("3:04:30.9", Write(W1), run=1.8)
        t1 = M(r"\to", r"\frac{0}{0}", size=48).next_to(W1, RIGHT, buff=0.5)
        t1[1].set_color(YEL)
        self.go("3:04:36.35", Write(t1), run=0.5)
        W2 = M("=", r"\lim_{x\to 0}", r"\frac{\sin x}{2x}", size=54)
        eq_left(W2, -3.0, 0.25)
        W2[2][0:4].set_color(PINK)
        W2[2][5:].set_color(PINK)
        lh1 = H("L'H", 30, PINK).next_to(W2[0], LEFT, buff=0.3)
        self.go("3:04:37.5", Write(W2[0:2]), FadeIn(lh1), run=0.5)
        self.go("3:04:39.3", TransformFromCopy(W1[1][0:6], W2[2][0:4]), Create(W2[2][4]), run=0.7)
        self.go("3:04:41.5", TransformFromCopy(W1[1][7:9], W2[2][5:7]), run=0.7)
        self.go("3:04:43.3", Circumscribe(W2[1:], color=PINK, stroke_width=3), run=0.8)
        t2 = M(r"\to", r"\frac{0}{0}", size=48).next_to(W2, RIGHT, buff=0.5)
        t2[1].set_color(YEL)
        still = H("still", 36, YEL).next_to(t2, RIGHT, buff=0.25)
        self.go("3:04:47.05", Write(t2), FadeIn(still), run=0.6)
        W3 = M("=", r"\lim_{x\to 0}", r"\frac{\cos x}{2}", size=54)
        eq_left(W3, -3.0, -1.05)
        W3[2][0:4].set_color(PINK)
        W3[2][5].set_color(PINK)
        lh2 = H("L'H", 30, PINK).next_to(W3[0], LEFT, buff=0.3)
        self.go("3:04:49.3", Write(W3[0:2]), FadeIn(lh2), run=0.5)
        self.go("3:04:51.25", TransformFromCopy(W2[2][0:4], W3[2][0:4]), TransformFromCopy(W2[2][4:], W3[2][4:]), run=0.8)
        W4 = M("=", r"\frac{\cos 0}{2}", r"=\;", r"\frac{1}{2}", size=54)
        eq_left(W4, -3.0, -2.4)
        W4[3].set_color(GRN)
        self.go("3:04:53.6", Write(W4[0:2]), run=0.6)
        self.go("3:04:54.75", Write(W4[2:]), run=0.5)
        self.play(Create(answer_box(W4[3])), run_time=0.3)

        # infinity over infinity: the next example starts
        self.wipe("3:04:56.2", run=0.35)
        self.title("Infinity over Infinity")
        INF = inf_setup()
        self.go("3:04:59.7", Write(INF), run=2.0)
