"""Builder 03: end of Chapter 1. Log rules and facts, trig review (radians, unit circle, key values, identity,
reciprocals), composition, decomposition (inside / outside), inverse functions, practice, wrap-up.
Colours: f / outer = BLUE, g / inner / inverse = PURP, sin = BLUE, cos = PURP, numbers = ORG."""
from common import *


def on_eq(m, x, y, i=1):
    """Shift m so its part i (the '=') sits at (x, y)."""
    m.shift(np.array([x, y, 0]) - m[i].get_center())
    return m


def arrow(p, q, color=CHALK, w=4):
    p, q = [np.append(np.array(v, float)[:3], [0] * (3 - len(v)))[:3] for v in (p, q)]
    return Arrow(p, q, buff=0, stroke_width=w, tip_length=0.22, color=color,
                 max_stroke_width_to_length_ratio=20, max_tip_length_to_length_ratio=0.4)


def machine(lab, color, w=1.8, h=1.3, size=76):
    b = RoundedRectangle(width=w, height=h, corner_radius=0.15, stroke_color=color, stroke_width=5)
    return VGroup(b, M(lab, size=size, color=color).move_to(b))


def fog(inner="x", size=96, f="f", g="g", cf=BLUE, cg=PURP):
    """f(g(x)) with the outer function BLUE and the inner one PURP."""
    m = M(f + "(", g + "(", inner, ")", ")", size=size)
    m[0].set_color(cf); m[4].set_color(cf); m[1].set_color(cg); m[3].set_color(cg)
    if inner != "x":
        m[2].set_color(ORG)
    return m


def under(mob, color=YEL, buff=0.12):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


# ================================================================ log rules

EQX = 0.4
RY = [1.1, -0.35, -1.85]


def power_rule(size=66):
    m = M(r"\ln", "a", "^{n}", "=", "n", r"\ln a", size=size)
    m[2].set_color(YEL); m[4].set_color(YEL)
    return m


class K03_LogRules(Shot):
    def body(self):
        self.title("Log Rules", animate=False)
        labs = [H(s, 42, DIM) for s in ("product", "quotient", "power")]
        for lab, y in zip(labs, RY):
            lab.move_to([-5.9, y, 0], aligned_edge=LEFT)
        r1 = on_eq(M(r"\ln(", "a", r"\cdot", "b", ")", "=", r"\ln", "a", "+", r"\ln", "b", size=66), EQX, RY[0], 5)
        r1[2].set_color(YEL); r1[8].set_color(YEL)
        self.go("13:32.68", FadeIn(labs[0], shift=RIGHT * 0.15), Write(r1[0:5]), run=0.9)
        self.go("13:34.66", Write(r1[5]), run=0.3)
        self.go("13:35.20", Write(r1[6]), TransformFromCopy(r1[1], r1[7]), run=0.5)
        self.go("13:35.98", Write(r1[8]), run=0.3)
        self.go("13:36.36", Write(r1[9]), TransformFromCopy(r1[3], r1[10]), run=0.5)
        # quotient
        r2 = on_eq(M(r"\ln\frac{a}{b}", "=", r"\ln a", "-", r"\ln b", size=66), EQX, RY[1])
        r2[0][3].set_color(YEL); r2[3].set_color(YEL)
        self.go("13:38.34", FadeIn(labs[1], shift=RIGHT * 0.15), run=0.4)
        self.go("13:40.06", Write(r2[0]), run=0.8)
        self.go("13:41.46", Write(r2[1]), run=0.3)
        self.go("13:41.96", Write(r2[2]), run=0.4)
        self.go("13:42.74", Write(r2[3]), run=0.3)
        self.go("13:43.16", Write(r2[4]), run=0.4)
        # power: the exponent travels down to the front
        self.go("13:45.12", FadeIn(labs[2], shift=RIGHT * 0.15), run=0.4)
        r3 = on_eq(power_rule(), EQX, RY[2], 3)
        self.go("13:47.76", Write(r3[0:3]), run=0.8)
        self.go("13:49.26", Write(r3[3]), run=0.3)
        self.go("13:49.60", TransformFromCopy(r3[2], r3[4], path_arc=PI / 2), run=0.8)
        self.go("13:50.40", Write(r3[5]), run=0.5)
        self.wipe("13:50.92", run=0.35)


def folder():
    body = Polygon([-0.9, -0.6, 0], [0.9, -0.6, 0], [0.9, 0.45, 0], [-0.1, 0.45, 0], [-0.3, 0.65, 0], [-0.9, 0.65, 0],
                   color=ORG, stroke_width=4).round_corners(0.06)
    front = Line([-0.9, 0.25, 0], [0.9, 0.25, 0], color=ORG, stroke_width=4)
    return VGroup(body, front)


class K03_LogFacts(Shot):
    def body(self):
        self.title("Log Rules", animate=False)
        self.title("Handy Facts", "13:51.64")
        x0 = -1.0
        f1 = on_eq(M(r"\ln 1", "=", "0", size=72), x0, 1.3)
        f2 = on_eq(M(r"\ln e", "=", "1", size=72), x0, 0.0)
        f3 = on_eq(M("e^{", r"\ln x", "}", "=", "x", size=72), x0, -1.35, 3)
        for f in (f1, f2):
            f[2].set_color(ORG)
        why1 = M("e^{0}=1", size=50, color=DIM).move_to([2.6, 1.3, 0])
        why2 = M("e^{1}=e", size=50, color=DIM).move_to([2.6, 0.0, 0])
        self.go("13:53.56", Write(f1[0]), run=0.5)
        self.go("13:54.38", Write(f1[1:]), run=0.4)
        self.go("13:55.62", FadeIn(why1, shift=LEFT * 0.15), run=0.5)
        self.go("13:57.90", Write(f2[0]), run=0.5)
        self.go("13:58.56", Write(f2[1:]), FadeIn(why2, shift=LEFT * 0.15), run=0.5)
        self.go("13:59.84", Write(f3[0:3]), run=0.8)
        self.go("14:01.56", Write(f3[3:]), run=0.4)
        self.go("14:02.94", Circumscribe(f3[0][0], color=YEL, buff=0.08), Circumscribe(f3[1], color=YEL, buff=0.08), run=0.9)
        # the power rule again: file it away
        self.wipe("14:04.40", run=0.35)
        pr = power_rule(96).move_to([0, 0.7, 0])
        self.go("14:04.90", Write(pr[0:3]), Write(pr[3]), run=0.7)
        self.go("14:06.08", TransformFromCopy(pr[2], pr[4], path_arc=PI / 2), run=0.8)
        self.play(Write(pr[5]), run_time=0.5)
        bx = box(pr, YEL, buff=0.25)
        self.go("14:08.68", Create(bx), run=0.5)
        later = H("later: logarithmic differentiation", 40, DIM).move_to([0, -1.1, 0])
        self.go("14:09.36", FadeIn(later, shift=UP * 0.1), run=0.5)
        fd = folder().move_to([4.6, -2.6, 0])
        self.go("14:10.34", Create(fd), run=0.4)
        self.go("14:10.80", VGroup(pr, bx).animate.scale(0.22).move_to(fd[0].get_center() + DOWN * 0.08), FadeOut(later), run=0.7)
        self.wipe("14:11.62", run=0.35)


# ================================================================ trig review

def tan_pieces(ax, color=CHALK, cap=1.45):
    a = np.arctan(cap)
    out = VGroup()
    for k in range(0, 5):
        lo, hi = max(0.0, k * PI - a), min(4 * PI + 0.6, k * PI + a)
        if hi > lo:
            out.add(ax.plot(np.tan, x_range=[lo, hi], color=color, stroke_width=4))
    return out


def roadmap():
    items = [H("radians", 50), H("the unit circle", 50), H("key values", 50), M(r"\sin^2\theta+\cos^2\theta=1", size=54)]
    nums = [H(f"{k}", 50, YEL) for k in (1, 2, 3, 4)]
    g = VGroup()
    for k, (n, it) in enumerate(zip(nums, items)):
        y = 1.35 - 1.05 * k
        n.move_to([-3.4, y, 0])
        it.move_to([-2.7, y, 0], aligned_edge=LEFT)
        g.add(VGroup(n, it))
    return g


class K03_TrigIntro(Shot):
    def body(self):
        self.title("Trig Functions", "14:12.32")
        ax = trig_axes(x_max=4 * PI + 0.6, y=1.5, width=12.4, height=3.4, center=(0.1, -0.85, 0), pi_step=PI)
        self.go("14:12.84", Create(ax), FadeIn(ax.labels), run=0.6)
        sl = M(r"\sin x", size=56, color=BLUE).move_to([-3.4, 1.55, 0])
        cl = M(r"\cos x", size=56, color=PURP).move_to([0, 1.55, 0])
        tl = M(r"\tan x", size=56, color=CHALK).move_to([3.4, 1.55, 0])
        s1 = ax.plot(np.sin, x_range=[0, 4 * PI + 0.6], color=BLUE, stroke_width=6)
        c1 = ax.plot(np.cos, x_range=[0, 4 * PI + 0.6], color=PURP, stroke_width=6)
        self.go("14:13.92", Write(sl), draw(s1, 0.8, BLUE), run=0.8)
        self.go("14:14.70", Write(cl), draw(c1, 0.8, PURP), run=0.8)
        tp = tan_pieces(ax)
        self.go("14:15.48", Write(tl), Create(tp), run=0.8)
        # the full course lives elsewhere
        self.wipe("14:16.25", run=0.35)
        self.title("Need a Refresher?")
        course = pill("Trigonometry Course", YEL, 56).move_to([0, 0.5, 0])
        self.go("14:17.24", FadeIn(course, shift=UP * 0.15), run=0.6)
        ch = H("full video on the channel", 44, DIM).next_to(course, DOWN, buff=0.4)
        self.go("14:18.62", FadeIn(ch, shift=UP * 0.1), run=0.4)
        # what calculus needs
        self.wipe("14:20.35", run=0.35)
        self.title("Trig for Calculus")
        rm = roadmap()
        self.go("14:21.30", LaggedStart(*[FadeIn(r, shift=RIGHT * 0.15) for r in rm], lag_ratio=0.25), run=1.1)


DEG = [(360, 2 * PI, r"2\pi", "14:29.16", "14:30.08", 0.9), (180, PI, r"\pi", "14:32.14", "14:34.00", 0.9),
       (90, PI / 2, r"\frac{\pi}{2}", "14:35.16", "14:35.92", 0.7), (60, PI / 3, r"\frac{\pi}{3}", "14:37.50", "14:38.34", 0.6),
       (45, PI / 4, r"\frac{\pi}{4}", "14:39.80", "14:40.76", 0.6), (30, PI / 6, r"\frac{\pi}{6}", "14:42.26", "14:42.88", 0.6)]


class K03_Radians(Shot):
    def body(self):
        self.title("Trig for Calculus", animate=False)
        rm = roadmap()
        self.add(rm)
        self.go("14:23.38", rm[0][1].animate.set_color(YEL), run=0.4)
        self.wipe("14:24.20", run=0.35)
        self.title("Radians", "14:24.70")
        c, r = np.array([-3.5, -0.65, 0]), 2.1
        axl = VGroup(Line(c + LEFT * 2.6, c + RIGHT * 2.6, color=DIM, stroke_width=3),
                     Line(c + DOWN * 2.6, c + UP * 2.4, color=DIM, stroke_width=3))
        circ = Circle(radius=r, color=CHALK, stroke_width=4).move_to(c)
        self.go("14:25.52", Create(axl), draw(circ, 1.0), run=1.0)
        th = ValueTracker(0.001)
        arm = always_redraw(lambda: Line(c, on_circle(th.get_value(), r, c), color=CHALK, stroke_width=4))
        arc = always_redraw(lambda: Arc(radius=0.75, start_angle=0, angle=th.get_value(), arc_center=c, color=YEL, stroke_width=5))
        tipd = always_redraw(lambda: Dot(on_circle(th.get_value(), r, c), radius=0.08, color=ORG).set_z_index(6))
        self.go("14:26.84", FadeIn(arm), FadeIn(tipd), FadeIn(arc), run=0.5)
        rows = []
        for k, (d, v, tex, t_move, t_row, run) in enumerate(DEG):
            row = on_eq(M(f"{d}^\\circ", "=", tex, size=56), 1.5 + 3.6 * (k // 3), 1.2 - 1.45 * (k % 3))
            row[2].set_color(YEL)
            rows.append(row)
            self.go(t_move, th.animate.set_value(v), run=run)
            self.go(t_row, Write(row), run=0.5)
        rad = VGroup(*[rw[2] for rw in rows])
        self.go("14:44.42", Circumscribe(rad, color=YEL, buff=0.15), run=1.0)
        self.go("14:46.56", th.animate.set_value(2 * PI), run=1.6)
        self.go("14:48.52", Create(box(rad[:3], YEL, buff=0.15)), Create(box(rad[3:], YEL, buff=0.15)), run=0.5)
        for m in (arm, arc, tipd):
            m.clear_updaters()
        self.wipe("14:49.40", run=0.4)


# ================================================================ unit circle

UC, UR = np.array([-2.7, -0.75, 0]), 2.3


def uc_parts(th, labels=True):
    """Axes, circle and the live arm / legs / point that follow ValueTracker th (sin BLUE, cos PURP)."""
    c, r = UC, UR
    axl = VGroup(Arrow(c + LEFT * 2.95, c + RIGHT * 2.95, buff=0, color=DIM, stroke_width=3, tip_length=0.2),
                 Arrow(c + DOWN * 2.85, c + UP * 2.95, buff=0, color=DIM, stroke_width=3, tip_length=0.2))
    circ = Circle(radius=r, color=CHALK, stroke_width=4).move_to(c)
    P = lambda: on_circle(th.get_value(), r, c)
    foot = lambda: np.array([P()[0], c[1], 0])
    arm = always_redraw(lambda: Line(c, P(), color=CHALK, stroke_width=4))
    cosl = always_redraw(lambda: Line(c, foot(), color=PURP, stroke_width=7))
    sinl = always_redraw(lambda: Line(foot(), P(), color=BLUE, stroke_width=7))
    dot = always_redraw(lambda: Dot(P(), radius=0.09, color=ORG).set_z_index(6))
    return dict(axl=axl, circ=circ, arm=arm, cosl=cosl, sinl=sinl, dot=dot, P=P, foot=foot)


TH0 = 0.9

def uc_labels(u):
    """The labelled state of the unit circle at TH0 (shared by K03_UnitCircle and the start of K03_TrigValues)."""
    P = on_circle(TH0, UR, UC)
    foot = np.array([P[0], UC[1], 0])
    d = dict(
        org=VGroup(Dot(UC, radius=0.07, color=CHALK), M("(0,0)", size=36, color=DIM).next_to(UC, DL, buff=0.1)),
        tl=M(r"\theta", size=50, color=YEL).move_to(UC + 0.95 * np.array([np.cos(TH0 / 2), np.sin(TH0 / 2), 0])),
        pl=M("(x, y)", size=44, color=ORG).next_to(P, UR, buff=0.08),
        cl=M(r"\cos\theta", size=44, color=PURP).next_to(Line(UC, foot), DOWN, buff=0.15),
        sl=M(r"\sin\theta", size=44, color=BLUE).next_to(UC + np.array([np.sqrt(UR ** 2 - (UR * np.sin(TH0) / 2) ** 2) + 0.12, UR * np.sin(TH0) / 2, 0]), RIGHT, buff=0),
        e1=on_eq(M("x", "=", r"\cos\theta", size=60), 3.7, 1.2),
        e2=on_eq(M("y", "=", r"\sin\theta", size=60), 3.7, 0.1),
        e3=on_eq(M(r"\tan\theta", "=", r"\frac{\sin\theta}{\cos\theta}", size=60), 3.7, -1.6))
    d["e1"][2].set_color(PURP); d["e2"][2].set_color(BLUE)
    d["e3"][2][0:4].set_color(BLUE); d["e3"][2][5:].set_color(PURP)
    return d


def uc_arc(th):
    return always_redraw(lambda: Arc(radius=0.6, start_angle=0, angle=max(th.get_value(), 1e-3), arc_center=UC, color=YEL, stroke_width=5))


class K03_UnitCircle(Shot):
    def body(self):
        self.title("The Unit Circle", "14:50.06")
        th = ValueTracker(0.0)
        u = uc_parts(th)
        L = uc_labels(u)
        self.go("14:51.82", Create(u["axl"]), draw(u["circ"], 1.0), run=1.0)
        rad = Line(UC, UC + RIGHT * UR, color=YEL, stroke_width=5)
        one = M("1", size=48, color=YEL).next_to(rad, UP, buff=0.12)
        self.go("14:53.10", Create(rad), FadeIn(one), run=0.5)
        self.go("14:54.24", FadeIn(L["org"]), run=0.4)
        self.go("14:56.00", FadeOut(rad), FadeOut(one), FadeIn(u["arm"]), run=0.3)
        self.add(uc_arc(th))
        self.go("14:56.24", th.animate.set_value(TH0), run=1.0)
        self.go("14:57.32", FadeIn(L["tl"]), run=0.4)
        self.go("15:00.20", FadeIn(u["dot"]), run=0.4)
        self.play(FadeIn(L["pl"], shift=DL * 0.1), run_time=0.4)
        # the coordinates: x is cos, y is sin
        e1, e2, e3 = L["e1"], L["e2"], L["e3"]
        self.go("15:01.92", Create(u["cosl"]), Write(e1[0]), run=0.6)
        self.go("15:03.66", FadeIn(L["cl"], shift=UP * 0.1), Write(e1[1:]), run=0.5)
        self.go("15:05.32", Create(u["sinl"]), Write(e2[0]), run=0.6)
        self.go("15:06.38", FadeIn(L["sl"], shift=LEFT * 0.1), Write(e2[1:]), run=0.5)
        self.go("15:07.74", Write(e3[0:2]), run=0.5)
        self.go("15:08.60", TransformFromCopy(e2[2], e3[2][0:4]), Write(e3[2][4]), run=0.5)
        self.go("15:09.20", TransformFromCopy(e1[2], e3[2][5:]), run=0.5)


def sc(fn, arg, val, size=50):
    m = M("\\" + fn + arg, "=", val, size=size)
    m[0].set_color(BLUE if fn == "sin" else PURP)
    return m


class K03_TrigValues(Shot):
    def body(self):
        self.title("The Unit Circle", animate=False)
        th = ValueTracker(TH0)
        u = uc_parts(th)
        L = uc_labels(u)
        arc = uc_arc(th)
        self.add(u["axl"], u["circ"], L["org"], u["arm"], arc, L["tl"], u["dot"], L["pl"], u["cosl"], L["cl"], u["sinl"], L["sl"],
                 L["e1"], L["e2"], L["e3"])
        arc.clear_updaters()
        self.go("15:10.50", *[FadeOut(L[k]) for k in ("e1", "e2", "e3", "cl", "sl", "tl", "pl", "org")], FadeOut(arc), run=0.4)
        self.title("Key Values")
        r1 = [sc("sin", " 0", "0").move_to([2.2, 1.55, 0]), sc("cos", " 0", "1").move_to([5.2, 1.55, 0])]
        r2 = [sc("sin", r"\frac{\pi}{2}", "1").move_to([2.2, 0.3, 0]), sc("cos", r"\frac{\pi}{2}", "0").move_to([5.2, 0.3, 0])]
        r3 = [sc("sin", r"\frac{\pi}{6}", r"\frac{1}{2}").move_to([2.2, -1.05, 0]), sc("cos", r"\frac{\pi}{3}", r"\frac{1}{2}").move_to([5.2, -1.05, 0])]
        r4 = M(r"\sin\frac{\pi}{4}", "=", r"\cos\frac{\pi}{4}", "=", r"\frac{\sqrt{2}}{2}", size=50).move_to([3.7, -2.55, 0])
        r4[0].set_color(BLUE); r4[2].set_color(PURP)
        self.go("15:13.40", th.animate.set_value(0.0), run=0.7)
        self.go("15:14.24", Write(r1[0]), run=0.5)
        self.go("15:15.78", Write(r1[1]), run=0.5)
        self.go("15:17.50", th.animate.set_value(PI / 2), run=0.7)
        self.go("15:18.28", Write(r2[0]), run=0.5)
        self.go("15:19.46", Write(r2[1]), run=0.5)
        self.go("15:22.12", th.animate.set_value(PI / 6), run=0.7)
        half = DashedLine(UC + UP * UR / 2 + LEFT * 0.2, UC + UP * UR / 2 + RIGHT * UR * 0.95, color=DIM, stroke_width=3, dash_length=0.1)
        self.go("15:22.84", Write(r3[0]), Create(half), run=0.5)
        self.go("15:24.52", th.animate.set_value(PI / 3), FadeOut(half), run=0.5)
        self.go("15:25.08", Write(r3[1]), run=0.5)
        self.go("15:27.18", th.animate.set_value(PI / 4), run=0.6)
        self.go("15:28.24", Write(r4[0:4]), run=0.8)
        self.go("15:29.62", Write(r4[4]), run=0.5)
        for k in ("arm", "cosl", "sinl", "dot"):
            u[k].clear_updaters()
        self.wipe("15:30.65", run=0.4)


class K03_Identity(Shot):
    def body(self):
        self.title("Key Values", animate=False)
        self.title("The Big Identity", "15:31.15")
        O, r, a = np.array([-5.4, -2.3, 0]), 3.7, 0.72
        P = O + r * np.array([np.cos(a), np.sin(a), 0])
        F = np.array([P[0], O[1], 0])
        qarc = Arc(radius=r, start_angle=0, angle=PI / 2, arc_center=O, color=FAINT, stroke_width=3)
        hyp, base, vert = seg(O, P, CHALK, 5), seg(O, F, PURP, 7), seg(F, P, BLUE, 7)
        self.go("15:31.65", Create(qarc), Create(hyp), Create(base), Create(vert), run=0.8)
        one = side_label(O, P, "1", CHALK, 52, side=1)
        cl = M(r"\cos\theta", size=46, color=PURP).next_to(base, DOWN, buff=0.15)
        sl = M(r"\sin\theta", size=46, color=BLUE).next_to(vert, RIGHT, buff=0.15)
        ang = angle_arc(O, F, P, r=0.7, label=r"\theta", label_size=42)
        rm = right_angle_mark(F, O, P)
        self.play(FadeIn(one), FadeIn(cl), FadeIn(sl), Create(ang), Create(rm), run_time=0.5)
        pyth = M("a^2+b^2=c^2", size=44, color=DIM).move_to([2.7, 1.35, 0])
        self.play(FadeIn(pyth, shift=DOWN * 0.1), run_time=0.4)
        idn = M(r"\sin^2\theta", "+", r"\cos^2\theta", "=", "1", size=72).move_to([2.7, -0.1, 0])
        idn[0].set_color(BLUE); idn[2].set_color(PURP)
        self.go("15:33.62", TransformFromCopy(sl, idn[0]), run=0.6)
        self.go("15:34.28", Write(idn[1]), run=0.3)
        self.go("15:34.68", TransformFromCopy(cl, idn[2]), run=0.6)
        self.go("15:35.62", Write(idn[3]), TransformFromCopy(one, idn[4]), run=0.6)
        self.go("15:37.18", Create(box(idn, YEL, buff=0.25)), run=0.5)
        # the reciprocals
        self.wipe("15:38.60", run=0.35)
        names = VGroup(*[M(s, size=84) for s in (r"\sec", r"\csc", r"\cot")]).arrange(RIGHT, buff=1.6).move_to([0, 0.3, 0])
        self.go("15:39.50", LaggedStart(*[Write(n) for n in names], lag_ratio=0.3), run=0.9)
        self.title("Reciprocals", "15:41.64")
        rows = [M(r"\sec x", "=", r"\frac{1}{\cos x}", size=66), M(r"\csc x", "=", r"\frac{1}{\sin x}", size=66),
                M(r"\cot x", "=", r"\frac{1}{\tan x}", size=66)]
        for k, rw in enumerate(rows):
            on_eq(rw, -0.6, 1.25 - 1.65 * k)
        rows[0][2][2:].set_color(PURP); rows[1][2][2:].set_color(BLUE)
        for k, (t1, t2) in enumerate((("15:42.98", "15:43.68"), ("15:45.28", "15:46.12"), ("15:47.74", "15:48.52"))):
            self.go(t1, ReplacementTransform(names[k], rows[k][0]), run=0.6)
            self.go(t2, Write(rows[k][1:]), run=0.6)
        dr = pill("derivative rules", PINK, size=42).move_to([4.2, -0.4, 0])
        self.go("15:51.10", FadeIn(dr, shift=LEFT * 0.15), run=0.5)
        self.go("15:52.32", Circumscribe(VGroup(*rows), color=YEL, buff=0.2), run=0.8)
        self.wipe("15:53.10", run=0.35)


# ================================================================ composition

class K03_Combine(Shot):
    def body(self):
        self.title("Combining Functions", "15:54.76")
        f = M("f", size=120, color=BLUE).move_to([-1.6, 0.9, 0])
        g = M("g", size=120, color=PURP).move_to([1.6, 0.9, 0])
        self.go("15:55.30", FadeIn(f, shift=UP * 0.15), FadeIn(g, shift=UP * 0.15), run=0.6)
        ops = VGroup()
        for k, (op, t) in enumerate([("+", "15:56.38"), ("-", "15:57.08"), (r"\times", "15:57.90"), (r"\div", "15:58.76")]):
            m = M("f", op, "g", size=80).move_to([-4.8 + 3.2 * k, -1.3, 0])
            m[0].set_color(BLUE); m[1].set_color(YEL); m[2].set_color(PURP)
            ops.add(m)
            self.go(t, FadeIn(m, shift=UP * 0.15), run=0.45)
        self.go("16:00.06", Circumscribe(ops, color=DIM, buff=0.2), run=0.8)
        self.go("16:01.60", FadeOut(ops, shift=DOWN * 0.15), run=0.5)
        self.title("Composition", "16:05.46")
        comp = fog("x", 120).move_to([0, 0.5, 0])
        self.go("16:07.62", ReplacementTransform(f, comp[0]), ReplacementTransform(g, comp[1]), FadeIn(comp[2:]), run=0.9)
        self.go("16:10.80", Circumscribe(comp, color=YEL, buff=0.2), run=0.9)
        # read it from the inside out
        self.go("16:12.86", comp.animate.scale(0.7).move_to([0, 1.3, 0]), run=0.6)
        ib = under(comp[1:4], PURP, 0.1)
        ob = box(comp, BLUE, buff=0.28)
        n1 = H("1st", 38, PURP).next_to(ob, DOWN, buff=0.1).set_x(ib.get_x())
        n2 = H("2nd", 38, BLUE).next_to(ob, RIGHT, buff=0.25)
        self.go("16:14.38", Create(ib), FadeIn(n1), run=0.4)
        self.go("16:14.80", Create(ob), FadeIn(n2), run=0.4)
        # the two machines in a row
        y = -1.6
        gm, fm = machine("g", PURP).move_to([-2.5, y, 0]), machine("f", BLUE).move_to([1.5, y, 0])
        a1, a2, a3 = arrow([-5.6, y], [-3.45, y], DIM), arrow([-1.55, y], [0.55, y], DIM), arrow([2.45, y], [3.6, y], DIM)
        self.go("16:15.20", Create(gm[0]), Write(gm[1]), Create(fm[0]), Write(fm[1]), Create(a1), Create(a2), Create(a3), run=0.8)
        tok = M("x", size=60, color=ORG).move_to([-6.0, y + 0.45, 0])
        self.go("16:16.48", FadeIn(tok, shift=RIGHT * 0.2), run=0.3)
        self.play(tok.animate.move_to([-3.6, y + 0.45, 0]), run_time=0.45)
        self.play(FadeOut(tok, shift=RIGHT * 0.3), run_time=0.2)
        gx = M("g(", "x", ")", size=52)
        gx[0].set_color(PURP); gx[2].set_color(PURP); gx[1].set_color(ORG)
        gx.move_to([-0.5, y + 0.45, 0])
        self.go("16:17.86", FadeIn(gx, shift=RIGHT * 0.2), run=0.4)
        self.go("16:19.02", gx.animate.move_to([0.4, y + 0.45, 0]), run=0.4)
        self.play(FadeOut(gx, shift=RIGHT * 0.3), run_time=0.2)
        out = fog("x", 52)
        out.move_to([3.65 + out.width / 2 + 0.1, y, 0])
        self.play(FadeIn(out, shift=RIGHT * 0.2), run_time=0.4)


def defs(size=62):
    fx = M("f(x)", "=", "x+1", size=size).move_to([-3.4, 1.75, 0])
    gx = M("g(x)", "=", "x^2", size=size).move_to([3.4, 1.75, 0])
    fx[0].set_color(BLUE); gx[0].set_color(PURP)
    return fx, gx


class K03_FofG(Shot):
    def body(self):
        self.title("Composition", animate=False)
        self.title("Worked Example", "16:20.68")
        fx, gx = defs()
        self.go("16:21.20", Write(fx), run=0.8)
        self.go("16:23.52", Write(gx), run=0.8)
        # left: f(g(3))
        m1 = fog("3", 80)
        r1 = M("=", "10", size=80); r1[1].set_color(ORG)
        VGroup(m1, r1).arrange(RIGHT, buff=0.25).move_to([-3.4, 0.5, 0])
        self.go("16:25.86", Write(m1), run=0.7)
        ib = under(m1[1:4], PURP, 0.1)
        self.go("16:27.36", Create(ib), run=0.4)
        l1 = M("g(3)", "=", "3^2", "=", "9", size=58).move_to([-3.4, -0.75, 0])
        l1[0].set_color(PURP); l1[4].set_color(ORG)
        self.go("16:28.66", Write(l1[0:3]), run=0.5)
        self.go("16:29.30", Write(l1[3:]), run=0.3)
        l2 = M("f(", "9", ")", "=", "9+1", "=", "10", size=58).move_to([-3.4, -1.95, 0])
        l2[0].set_color(BLUE); l2[2].set_color(BLUE); l2[1].set_color(ORG); l2[6].set_color(ORG)
        self.go("16:30.40", TransformFromCopy(l1[4], l2[1]), Write(l2[0]), Write(l2[2]), run=0.5)
        self.go("16:31.00", Write(l2[3:]), run=0.5)
        self.go("16:31.60", FadeOut(ib), TransformFromCopy(l2[6], r1[1]), Write(r1[0]), run=0.5)
        # right: g(f(3))
        m2 = fog("3", 80, f="g", g="f", cf=PURP, cg=BLUE)
        r2 = M("=", "16", size=80); r2[1].set_color(ORG)
        VGroup(m2, r2).arrange(RIGHT, buff=0.25).move_to([3.4, 0.5, 0])
        self.go("16:32.72", Write(m2), run=0.6)
        ib2 = under(m2[1:4], BLUE, 0.1)
        self.go("16:33.40", Create(ib2), run=0.4)
        l3 = M("f(3)", "=", "3+1", "=", "4", size=58).move_to([3.4, -0.75, 0])
        l3[0].set_color(BLUE); l3[4].set_color(ORG)
        self.go("16:34.20", Write(l3[0:3]), run=0.5)
        self.go("16:34.82", Write(l3[3:]), run=0.3)
        l4 = M("g(", "4", ")", "=", "4^2", "=", "16", size=58).move_to([3.4, -1.95, 0])
        l4[0].set_color(PURP); l4[2].set_color(PURP); l4[1].set_color(ORG); l4[6].set_color(ORG)
        self.go("16:35.78", TransformFromCopy(l3[4], l4[1]), Write(l4[0]), Write(l4[2]), run=0.5)
        self.go("16:36.40", Write(l4[3:]), run=0.4)
        self.go("16:36.90", FadeOut(ib2), TransformFromCopy(l4[6], r2[1]), Write(r2[0]), run=0.5)
        # 10 versus 16
        self.go("16:37.72", FadeOut(VGroup(l1, l2, l3, l4)), VGroup(m1, r1).animate.move_to([-3.4, -0.3, 0]),
                VGroup(m2, r2).animate.move_to([3.4, -0.3, 0]), run=0.6)
        ne = M(r"\neq", size=110, color=RED).move_to([0, -0.3, 0])
        self.go("16:38.36", Write(ne), Create(box(r1[1], ORG, buff=0.12)), Create(box(r2[1], ORG, buff=0.12)), run=0.5)
        om = pill("order matters", YEL, size=48).move_to([0, -2.2, 0])
        self.go("16:39.96", FadeIn(om, shift=UP * 0.15), run=0.5)


def sock():
    pts = [(0, 0.8), (0.55, 0.8), (0.55, -0.02), (1.15, -0.22), (1.3, -0.48), (1.12, -0.72), (0.2, -0.72), (-0.02, -0.48)]
    body = Polygon(*[np.array([x, y, 0]) for x, y in pts], color=CHALK, stroke_width=5).round_corners(0.16)
    cuff = Line([0.0, 0.55, 0], [0.55, 0.55, 0], color=CHALK, stroke_width=4)
    toe = ArcBetweenPoints(np.array([0.95, -0.2, 0]), np.array([0.95, -0.72, 0]), angle=-0.8, color=CHALK, stroke_width=3)
    return VGroup(body, cuff, toe).move_to(ORIGIN)


def shoe():
    pts = [(0, 0.45), (0.5, 0.45), (0.72, 0.12), (1.45, -0.05), (1.75, -0.3), (1.75, -0.55), (-0.05, -0.55), (-0.08, -0.1)]
    body = Polygon(*[np.array([x, y, 0]) for x, y in pts], color=CHALK, stroke_width=5).round_corners(0.12)
    sole = Line([-0.05, -0.38, 0], [1.75, -0.38, 0], color=CHALK, stroke_width=4)
    laces = VGroup(*[Line([0.75 + 0.18 * k, 0.02 - 0.03 * k, 0], [0.87 + 0.18 * k, 0.2 - 0.03 * k, 0], color=CHALK, stroke_width=3)
                     for k in range(3)])
    return VGroup(body, sole, laces).move_to(ORIGIN)


class K03_Socks(Shot):
    def body(self):
        self.title("Worked Example", animate=False)
        self.wipe("16:41.15", run=0.35)
        self.title("Socks and Shoes", "16:41.55")
        rows = []
        for y, first, second in ((0.75, sock(), shoe()), (-1.65, shoe(), sock())):
            first.scale(1.15).move_to([-3.3, y, 0])
            second.scale(1.15).move_to([1.4, y, 0])
            rows.append((first, arrow([-1.9, y], [-0.2, y], DIM), second))
        mk = [tick_mark(s=0.6).move_to([4.5, 0.75, 0]), cross_mark(s=0.32).move_to([4.5, -1.65, 0])]
        (s1, a1, h1), (h2, a2, s2) = rows
        self.go("16:42.66", draw(s1[0], 0.7), Create(s1[1:]), run=0.7)
        self.go("16:44.46", Create(a1), draw(h1[0], 0.7), Create(h1[1:]), run=0.7)
        self.go("16:45.36", Create(mk[0]), run=0.4)
        self.go("16:46.42", draw(h2[0], 0.7), Create(h2[1:]), run=0.7)
        self.go("16:47.58", Create(a2), draw(s2[0], 0.7), Create(s2[1:]), run=0.7)
        self.go("16:48.68", Create(mk[1]), run=0.4)
        self.wipe("16:49.95", run=0.35)


# ================================================================ decomposition (inside / outside)

def decomp_parts():
    """The (3x+1)^5 board: expression, outside (BLUE, with an empty slot) and inside (PURP)."""
    ex = M("(", "3x+1", ")", "^5", size=100).move_to([0, 0.9, 0])
    out = M("(", r"\square", ")", "^5", size=80, color=BLUE).move_to([-3.2, -1.6, 0])
    ins = M("3x+1", size=80, color=PURP).move_to([3.2, -1.6, 0])
    lo = H("outside", 40, DIM).next_to(out, DOWN, buff=0.3)
    li = H("inside", 40, DIM).next_to(ins, DOWN, buff=0.3)
    return ex, out, ins, lo, li


class K03_Decomp(Shot):
    def body(self):
        self.title("Socks and Shoes", animate=False)
        self.title("The Reverse Skill", "16:51.10")
        comp = fog("x", 120).move_to([0, 0.4, 0])
        self.go("16:54.76", Write(comp), run=0.9)
        ib = under(comp[1:4], PURP, 0.1)
        self.go("16:58.04", Create(ib), run=0.5)
        # decomposition: pull the two layers apart
        self.title("Decomposition", "16:59.88")
        outer = VGroup(comp[0], comp[4])
        inner = VGroup(comp[1:4], ib)
        slot = Square(0.55, color=BLUE, stroke_width=4)
        self.go("17:00.60", outer.animate.shift(LEFT * 2.6), inner.animate.shift(RIGHT * 2.6), run=0.8)
        slot.move_to((comp[0].get_right() + comp[4].get_left()) / 2)
        self.play(Create(slot), run_time=0.4)
        chain = pill("chain rule", PINK, size=50).move_to([0, -2.1, 0])
        self.go("17:02.84", FadeIn(chain, shift=UP * 0.15), run=0.5)
        self.go("17:04.54", Circumscribe(chain, color=PINK, buff=0.12), run=0.9)
        # (3x+1)^5
        self.wipe("17:06.50", run=0.4)
        ex, out, ins, lo, li = decomp_parts()
        ex[1].set_color(PURP)
        self.go("17:07.70", Write(ex), run=1.0)
        ib = under(ex[1], PURP, 0.1)
        self.go("17:12.12", Create(ib), run=0.5)
        self.go("17:15.60", Circumscribe(ex[3], color=BLUE, buff=0.1), run=0.8)
        self.go("17:17.80", TransformFromCopy(VGroup(ex[0], ex[2], ex[3]), VGroup(out[0], out[2], out[3])),
                FadeIn(out[1], shift=DOWN * 0.1), FadeIn(lo), run=0.8)
        self.go("17:20.88", TransformFromCopy(ex[1], ins[0]), FadeIn(li), run=0.8)


ROWS_Y = [0.85, -0.5, -1.85]
COLS_X = [-3.9, 0.4, 4.2]


class K03_Decomp2(Shot):
    def body(self):
        self.title("Decomposition", animate=False)
        ex, out, ins, lo, li = decomp_parts()
        ex[1].set_color(PURP)
        ib = under(ex[1], PURP, 0.1)
        self.add(ex, ib, out, ins, lo, li)
        # becomes row 1 of a table
        heads = VGroup(*[H(s, 42, c) for s, c in (("function", DIM), ("outside", BLUE), ("inside", PURP))])
        for h, x in zip(heads, COLS_X):
            h.move_to([x, 1.95, 0])
        line = Line([-6.2, 1.55, 0], [6.2, 1.55, 0], color=FAINT, stroke_width=3)
        self.go("17:23.68", FadeOut(ib), FadeOut(lo), FadeOut(li),
                ex.animate.scale(0.6).move_to([COLS_X[0], ROWS_Y[0], 0]),
                out.animate.scale(0.75).move_to([COLS_X[1], ROWS_Y[0], 0]),
                ins.animate.scale(0.75).move_to([COLS_X[2], ROWS_Y[0], 0]),
                FadeIn(heads), Create(line), run=0.8)
        # square root of x^2 + 4
        e2 = M(r"\sqrt{", "x^2+4", "}", size=60).move_to([COLS_X[0], ROWS_Y[1], 0])
        e2[1].set_color(PURP)
        self.go("17:25.08", Write(e2), run=0.9)
        i2 = M("x^2+4", size=60, color=PURP).move_to([COLS_X[2], ROWS_Y[1], 0])
        self.go("17:27.82", TransformFromCopy(e2[1], i2), run=0.7)
        o2 = M(r"\sqrt{\square}", size=60, color=BLUE).move_to([COLS_X[1], ROWS_Y[1], 0])
        self.go("17:30.92", TransformFromCopy(VGroup(e2[0], e2[2]), o2), run=0.7)
        # sin of x^2
        e3 = M(r"\sin", "(", "x^2", ")", size=60).move_to([COLS_X[0], ROWS_Y[2], 0])
        e3[2].set_color(PURP)
        self.go("17:34.80", Write(e3), run=0.8)
        i3 = M("x^2", size=60, color=PURP).move_to([COLS_X[2], ROWS_Y[2], 0])
        self.go("17:37.18", TransformFromCopy(e3[2], i3), run=0.6)
        o3 = M(r"\sin(\square)", size=60, color=BLUE).move_to([COLS_X[1], ROWS_Y[2], 0])
        self.go("17:38.16", TransformFromCopy(VGroup(e3[0], e3[1], e3[3]), o3), run=0.6)
        # the two questions of the chain rule
        ch = pill("chain rule", PINK, size=44).move_to([-3.6, -3.15, 0])
        qi = H("inside?", 46, PURP).move_to([0.6, -3.15, 0])
        qo = H("outside?", 46, BLUE).move_to([3.6, -3.15, 0])
        self.go("17:40.54", FadeIn(ch, shift=UP * 0.1), run=0.5)
        self.go("17:43.32", FadeIn(qi, shift=UP * 0.1), run=0.4)
        self.go("17:44.46", FadeIn(qo, shift=UP * 0.1), run=0.4)
        self.go("17:45.26", Circumscribe(VGroup(ins, i2, i3), color=PURP, buff=0.15), run=0.8)
        self.play(Circumscribe(VGroup(out, o2, o3), color=BLUE, buff=0.15), run_time=0.8)
        self.go("17:48.26", Create(under(ch, PINK, 0.08)), run=0.5)
        self.wipe("17:49.45", run=0.4)


# ================================================================ inverse functions

def fi(size=64, color=PURP):
    return M(r"f^{-1}", size=size, color=color)


class K03_Inverse(Shot):
    def body(self):
        self.title("Inverse Functions", "17:51.86")
        fm = machine("f", BLUE, w=2.0, h=1.3).move_to([0, 1.0, 0])
        im = machine(r"f^{-1}", PURP, w=2.0, h=1.3, size=66).move_to([0, -1.4, 0])
        self.go("17:53.86", Create(fm[0]), Write(fm[1]), run=0.6)
        self.go("17:55.10", Create(im[0]), Write(im[1]), run=0.6)
        a1, a2 = arrow([-3.0, 1.0], [-1.05, 1.0], BLUE), arrow([1.05, 1.0], [3.0, 1.0], BLUE)
        b1, b2 = arrow([3.0, -1.4], [1.05, -1.4], PURP), arrow([-1.05, -1.4], [-3.0, -1.4], PURP)
        n3 = M("3", size=80, color=ORG).move_to([-3.6, 1.0, 0])
        n11 = M("11", size=80, color=ORG).move_to([3.75, 1.0, 0])
        m11 = n11.copy().move_to([3.75, -1.4, 0])
        m3 = n3.copy().move_to([-3.6, -1.4, 0])
        self.go("17:57.18", FadeIn(n3, shift=RIGHT * 0.2), Create(a1), run=0.5)
        self.go("17:58.16", Create(a2), FadeIn(n11, shift=RIGHT * 0.2), run=0.5)
        self.go("18:00.18", TransformFromCopy(n11, m11, path_arc=-PI / 2), Create(b1), run=0.7)
        self.go("18:01.34", Create(b2), FadeIn(m3, shift=LEFT * 0.2), run=0.5)
        # the notation, and what it does NOT mean
        self.wipe("18:02.30", run=0.35)
        nt = M("f", "^{-1}", "(x)", size=130, color=PURP).move_to([0, 0.9, 0])
        self.go("18:03.40", Write(nt), run=0.8)
        ring = Circle(color=YEL, stroke_width=4).surround(nt[1], buffer_factor=1.25)
        self.go("18:04.52", Create(ring), run=0.5)
        wl = M(r"f^{-1}(x)", r"\neq", r"\frac{1}{f(x)}", size=80).move_to([0, -1.4, 0])
        wl[0].set_color(PURP); wl[1].set_color(RED)
        self.go("18:07.52", Write(wl[0]), run=0.4)
        self.go("18:08.04", Write(wl[1]), run=0.3)
        self.go("18:08.26", Write(wl[2]), run=0.5)
        self.go("18:08.82", Create(strike(wl[2])), run=0.4)
        un = pill("the undo of f", GRN, size=44).move_to([0, -3.1, 0])
        self.go("18:10.22", FadeIn(un, shift=UP * 0.15), run=0.5)
        self.wipe("18:11.90", run=0.4)


EQ = 0.6


def inv_lines(a, b, sign, y0=1.75):
    """f(x) = a x + b worked to its inverse; sign is '+' or '-' (b > 0)."""
    f0 = on_eq(M("f(x)", "=", f"{a}x{sign}{b}", size=64), EQ, y0)
    f0[0].set_color(BLUE)
    L1 = on_eq(M("y", "=", f"{a}", "x", f"{sign}{b}", size=64), EQ, y0 - 1.05)
    L2 = on_eq(M("x", "=", f"{a}", "y", f"{sign}{b}", size=64), EQ, y0 - 2.1)
    L2[0].set_color(YEL); L2[3].set_color(YEL)
    other = "+" if sign == "-" else "-"
    L3 = on_eq(M(f"x{other}{b}", "=", f"{a}y", size=64), EQ, y0 - 3.15)
    L4 = on_eq(M("y", "=", rf"\frac{{x{other}{b}}}{{{a}}}", size=64), EQ, y0 - 4.5)
    n1 = M(f"{other}{b}", size=52, color=ORG).next_to(L2, RIGHT, buff=0.9)
    n2 = M(rf"\div {a}", size=52, color=ORG).next_to(L3, RIGHT, buff=0.9).set_x(n1.get_x())
    return f0, L1, L2, L3, L4, n1, n2


def swap(L1, L2):
    return [TransformFromCopy(L1[0], L2[3], path_arc=-PI / 2), TransformFromCopy(L1[3], L2[0], path_arc=-PI / 2),
            TransformFromCopy(L1[1], L2[1]), TransformFromCopy(L1[2], L2[2]), TransformFromCopy(L1[4], L2[4])]


def finish(L4):
    fx = M(r"f^{-1}(x)", size=64, color=PURP).next_to(L4[1], LEFT, buff=0.2)
    return fx, answer_box(VGroup(fx, L4[1], L4[2]))


class K03_Steps(Shot):
    def body(self):
        self.title("Finding the Inverse", "18:12.94")
        labs = VGroup(*[H(f"Step {k}", 50, DIM) for k in (1, 2, 3)])
        txts = [TX(r"write $y$ instead of $f(x)$", 58), TX(r"swap $x$ and $y$", 58), TX(r"solve for $y$", 58)]
        for k, (lab, tx) in enumerate(zip(labs, txts)):
            y = 1.1 - 1.3 * k
            lab.move_to([-5.0, y, 0], aligned_edge=LEFT)
            tx.move_to([-2.5, y, 0], aligned_edge=LEFT)
        for lab, tx, t in zip(labs, txts, ("18:14.06", "18:16.26", "18:17.84")):
            self.go(t, FadeIn(lab, shift=RIGHT * 0.1), Write(tx), run=0.6)
        # worked example
        self.wipe("18:19.00", run=0.35)
        f0, L1, L2, L3, L4, n1, n2 = inv_lines(2, 3, "+")
        S = [H(f"Step {k}", 44, YEL).move_to([-5.3, L[1].get_y(), 0], aligned_edge=LEFT) for k, L in zip((1, 2, 3), (L1, L2, L3))]
        self.go("18:19.64", Write(f0), run=0.9)
        self.go("18:22.22", FadeIn(S[0], shift=RIGHT * 0.15), Write(L1), run=0.8)
        self.go("18:24.78", FadeIn(S[1], shift=RIGHT * 0.15), *swap(L1, L2), run=1.0)
        self.go("18:28.20", FadeIn(S[2], shift=RIGHT * 0.15), run=0.4)
        self.go("18:29.40", FadeIn(n1, shift=LEFT * 0.15), run=0.4)
        self.go("18:31.20", Write(L3), run=0.8)
        self.go("18:33.54", FadeIn(n2, shift=LEFT * 0.15), run=0.4)
        self.go("18:34.96", Write(L4), run=1.0)
        fx, ab = finish(L4)
        self.go("18:37.94", ReplacementTransform(L4[0], fx), Create(ab), run=0.7)


class K03_Check(Shot):
    def body(self):
        self.title("Finding the Inverse", animate=False)
        f0, L1, L2, L3, L4, n1, n2 = inv_lines(2, 3, "+")
        fx, ab = finish(L4)
        S = [H(f"Step {k}", 44, YEL).move_to([-5.3, L[1].get_y(), 0], aligned_edge=LEFT) for k, L in zip((1, 2, 3), (L1, L2, L3))]
        self.add(f0, L1, L2, L3, fx, L4[1:], ab, n1, n2, *S)
        self.wipe("18:39.40", run=0.35)
        self.title("Check It")
        c1 = M("f(4)", "=", r"2\cdot 4+3", "=", "11", size=70).move_to([0, 1.3, 0])
        c1[0].set_color(BLUE); c1[4].set_color(ORG)
        self.go("18:40.44", Write(c1[0:3]), run=0.6)
        self.go("18:41.08", Write(c1[3:]), run=0.4)
        c2 = M(r"f^{-1}(11)", "=", r"\frac{11-3}{2}", "=", r"\frac{8}{2}", "=", "4", size=70).move_to([0, -0.5, 0])
        c2[0].set_color(PURP); c2[6].set_color(ORG)
        self.go("18:42.10", TransformFromCopy(c1[4], c2[0][4:6]), Write(c2[0][:4]), Write(c2[0][6:]), run=0.6)
        self.go("18:44.14", Write(c2[1:3]), run=0.7)
        self.go("18:45.16", Write(c2[3:5]), run=0.5)
        self.go("18:46.62", Write(c2[5:]), run=0.4)
        # the round trip
        y = -2.6
        t1 = M("4", size=64, color=ORG).move_to([-4.2, y, 0])
        t2 = M("11", size=64, color=ORG).move_to([0, y, 0])
        t3 = M("4", size=64, color=ORG).move_to([4.2, y, 0])
        r1, r2 = arrow([-3.7, y], [-0.6, y], BLUE), arrow([0.6, y], [3.7, y], PURP)
        l1 = M("f", size=46, color=BLUE).next_to(r1, UP, buff=0.1)
        l2 = fi(46).next_to(r2, UP, buff=0.1)
        self.go("18:48.12", FadeIn(t1), Create(r1), FadeIn(l1), FadeIn(t2), run=0.5)
        self.play(Create(r2), FadeIn(l2), FadeIn(t3), run_time=0.5)
        tk = tick_mark(s=0.5).next_to(t3, RIGHT, buff=0.5)
        self.go("18:49.54", Create(tk), run=0.4)
        self.wipe("18:50.05", run=0.35)


def sq_axes():
    ax = axes(x_range=(-3, 3, 1), y_range=(-1, 5, 1), x_length=6.0, y_length=4.9, center=(-2.0, -0.75, 0))
    par = curve(ax, lambda x: x * x, x_range=[-2.2, 2.2])
    lab = M("y=x^2", size=46, color=BLUE).next_to(ax.c2p(2.2, 4.84), RIGHT, buff=0.15)
    return ax, par, lab


class K03_NoInverse(Shot):
    def body(self):
        self.title("No Inverse?", "18:50.80")
        sq = M("f(x)", "=", "x^2", size=72).move_to([0, 1.7, 0])
        sq[0].set_color(BLUE)
        self.go("18:53.24", Write(sq), run=0.6)
        a2 = M("2", size=80, color=ORG).move_to([-3.4, 0.2, 0])
        m2 = M("-2", size=80, color=ORG).move_to([-3.4, -2.0, 0])
        o4 = M("4", size=80, color=ORG).move_to([1.6, -0.9, 0])
        self.go("18:56.42", FadeIn(a2, shift=RIGHT * 0.15), run=0.35)
        self.go("18:57.08", FadeIn(m2, shift=RIGHT * 0.15), run=0.35)
        f1 = arrow(a2.get_right() + [0.3, -0.1, 0], o4.get_left() + [-0.3, 0.12, 0], BLUE)
        f2 = arrow(m2.get_right() + [0.3, 0.1, 0], o4.get_left() + [-0.3, -0.12, 0], BLUE)
        self.go("18:57.68", Create(f1), Create(f2), FadeIn(o4, shift=RIGHT * 0.15), run=0.6)
        self.go("18:59.82", Create(box(o4, YEL, buff=0.18)), run=0.4)
        inv = fi(64).next_to(o4, RIGHT, buff=0.6)
        self.go("19:01.20", FadeIn(inv, shift=LEFT * 0.15), run=0.4)
        b1 = CurvedArrow(o4.get_top() + UP * 0.3, a2.get_top() + UP * 0.2, angle=PI / 5, color=PURP, stroke_width=4, tip_length=0.22)
        b2 = CurvedArrow(o4.get_bottom() + DOWN * 0.3, m2.get_bottom() + DOWN * 0.2, angle=-PI / 5, color=PURP, stroke_width=4, tip_length=0.22)
        self.go("19:03.24", Create(b1), run=0.4)
        self.go("19:03.96", Create(b2), run=0.4)
        q = M("?", size=110, color=RED).next_to(inv, RIGHT, buff=0.3)
        self.go("19:04.50", Write(q), run=0.4)
        # the horizontal line test
        self.wipe("19:05.30", run=0.3)
        self.title("Horizontal Line Test")
        ax, par, lab = sq_axes()
        self.play(Create(ax), FadeIn(ax.labels), Create(par), FadeIn(lab), run_time=0.8)
        yv = ValueTracker(-0.6)

        def moving():
            y = yv.get_value()
            g = VGroup(Line(ax.c2p(-3, y), ax.c2p(3, y), color=CHALK, stroke_width=5))
            if y > 0.05:
                g.add(*[Dot(ax.c2p(s * np.sqrt(y), y), radius=0.09, color=YEL) for s in (-1, 1)])
            return g
        mv = always_redraw(moving)
        self.go("19:07.15", FadeIn(mv), run=0.3)
        self.play(yv.animate.set_value(4), run_time=1.7)
        mv.clear_updaters()
        red = Line(ax.c2p(-3, 4), ax.c2p(3, 4), color=RED, stroke_width=5)
        dots = VGroup(*[Dot(ax.c2p(s, 4), radius=0.1, color=RED) for s in (-2, 2)])
        self.go("19:09.30", FadeOut(mv), FadeIn(red), FadeIn(dots), run=0.4)
        no = VGroup(cross_mark(s=0.3), H("no inverse", 50, RED)).arrange(DOWN, buff=0.35).move_to([4.6, 0.0, 0])
        self.go("19:10.66", Create(no[0]), Write(no[1]), run=0.6)


class K03_ExpLn(Shot):
    def body(self):
        self.title("Horizontal Line Test", animate=False)
        self.wipe("19:12.15", run=0.3)
        self.title("Exp and Log", "19:12.54")
        ax = axes(x_range=(-2, 5, 1), y_range=(-2, 5, 1), x_length=5.6, y_length=5.6, center=(-3.0, -0.75, 0), nums=False)
        self.go("19:14.06", Create(ax), FadeIn(ax.labels), run=0.6)
        yx = DashedLine(ax.c2p(-1.9, -1.9), ax.c2p(4.8, 4.8), color=DIM, stroke_width=3, dash_length=0.12)
        self.go("19:15.32", Create(yx), run=0.5)
        ex = curve(ax, np.exp, x_range=[-2, np.log(4.8)])
        exl = M("e^x", size=56, color=BLUE).next_to(ax.c2p(1.4, 4.2), LEFT, buff=0.25)
        self.go("19:16.88", Create(ex), FadeIn(exl), run=0.7)
        ln = curve(ax, np.log, x_range=[np.exp(-2), 4.8], color=PURP)
        lnl = M(r"\ln x", size=56, color=PURP).next_to(ax.c2p(4.4, 1.5), DOWN, buff=0.35)
        self.go("19:17.88", Create(ln), FadeIn(lnl), run=0.7)
        a = ValueTracker(-1.5)
        pair = always_redraw(lambda: VGroup(
            DashedLine(ax.c2p(a.get_value(), np.exp(a.get_value())), ax.c2p(np.exp(a.get_value()), a.get_value()),
                       color=ORG, stroke_width=3, dash_length=0.08),
            pt(ax, a.get_value(), np.exp(a.get_value())), pt(ax, np.exp(a.get_value()), a.get_value())))
        self.go("19:18.60", FadeIn(pair), run=0.2)
        self.play(a.animate.set_value(1.2), run_time=1.2)
        pair.clear_updaters()
        e1 = M(r"\ln", "(", "e^5", ")", "=", "5", size=80)
        e2 = M("e^{", r"\ln 7", "}", "=", "7", size=80)
        on_eq(e1, 3.4, 0.7, 4); on_eq(e2, 3.4, -1.0, 3)
        e1[0].set_color(PURP); e1[2][0].set_color(BLUE); e1[5].set_color(ORG)
        e2[0].set_color(BLUE); e2[1].set_color(PURP); e2[4].set_color(ORG)
        self.go("19:20.50", Write(e1[0:4]), run=0.8)
        self.go("19:21.84", Write(e1[4:]), run=0.4)
        self.go("19:23.36", Write(e2[0:3]), run=0.7)
        self.go("19:24.46", Write(e2[3:]), run=0.4)


# ================================================================ practice

class K03_TryThese(Shot):
    def body(self):
        self.title("Try These")
        n1 = H("1", 50, YEL).move_to([-5.9, 1.45, 0])
        d1 = M("f(x)", "=", "x-4", size=60).move_to([-3.4, 1.45, 0])
        d2 = M("g(x)", "=", "3x", size=60).move_to([0.6, 1.45, 0])
        d1[0].set_color(BLUE); d2[0].set_color(PURP)
        q1 = M("f(", "g(", "2", ")", ")", "=", r"\,\text{?}", size=64).move_to([4.4, 1.45, 0])
        q1[0].set_color(BLUE); q1[4].set_color(BLUE); q1[1].set_color(PURP); q1[3].set_color(PURP); q1[2].set_color(ORG)
        self.go("19:28.62", FadeIn(n1), Write(d1), run=0.8)
        self.go("19:30.72", Write(d2), run=0.6)
        self.go("19:32.86", Write(q1), run=0.7)
        n2 = H("2", 50, YEL).move_to([-5.9, 0.0, 0])
        d3 = M("f(x)", "=", "5x-1", size=60).move_to([-3.2, 0.0, 0])
        d3[0].set_color(BLUE)
        q2 = M(r"f^{-1}(x)", "=", r"\,\text{?}", size=64).move_to([1.4, 0.0, 0])
        q2[0].set_color(PURP)
        self.go("19:34.64", FadeIn(n2), Write(d3), run=0.45)
        self.go("19:35.10", Write(q2), run=0.7)
        # answer 1: inside first
        self.go("19:38.64", FadeOut(VGroup(n2, d3, q2)), run=0.4)
        ib = under(q1[1:4], PURP, 0.1)
        self.go("19:39.82", Create(ib), run=0.4)
        a1 = M("g(2)", "=", r"3\cdot 2", "=", "6", size=64).move_to([0, -0.2, 0])
        a1[0].set_color(PURP); a1[4].set_color(ORG)
        self.go("19:41.10", Write(a1[0:3]), run=0.5)
        self.go("19:41.78", Write(a1[3:]), run=0.3)
        a2 = M("f(", "6", ")", "=", "6-4", "=", "2", size=64)
        a2.shift(np.array([a1[1].get_x(), -1.6, 0]) - a2[3].get_center())
        a2[0].set_color(BLUE); a2[2].set_color(BLUE); a2[1].set_color(ORG); a2[6].set_color(ORG)
        self.go("19:42.86", TransformFromCopy(a1[4], a2[1]), Write(a2[0]), Write(a2[2]), run=0.5)
        self.go("19:44.02", Write(a2[3:5]), run=0.5)
        self.go("19:45.26", Write(a2[5:]), run=0.3)
        ans = M("2", size=64, color=ORG).next_to(q1[5], RIGHT, buff=0.2)
        self.go("19:45.68", FadeOut(ib), ReplacementTransform(q1[6], ans), Create(answer_box(VGroup(q1[:6], ans))), run=0.5)


class K03_Answer2(Shot):
    def body(self):
        self.title("Try These", animate=False)
        f0, L1, L2, L3, L4, n1, n2 = inv_lines(5, 1, "-")
        self.go("19:46.86", Write(f0), run=0.7)
        self.go("19:47.60", Write(L1), run=0.8)
        self.go("19:49.86", *swap(L1, L2), run=1.0)
        self.go("19:53.36", FadeIn(n1, shift=LEFT * 0.15), run=0.4)
        self.go("19:54.48", Write(L3), run=0.8)
        self.go("19:56.52", FadeIn(n2, shift=LEFT * 0.15), run=0.4)
        self.go("19:57.94", Write(L4), run=0.9)
        fx, ab = finish(L4)
        self.go("19:59.40", ReplacementTransform(L4[0], fx), Create(ab), run=0.6)
        self.wipe("20:00.75", run=0.35)


# ================================================================ wrap-up

class K03_Wrap(Shot):
    def body(self):
        self.title("Try These", animate=False)
        self.title("Warm-up Done", "20:02.62")
        fa = M("f(", "a+h", ")", size=96).move_to([-3.4, 0.5, 0])
        fa[0].set_color(BLUE); fa[2].set_color(BLUE); fa[1].set_color(ORG)
        self.go("20:06.08", Write(fa), run=0.8)
        comp = fog("x", 96).move_to([3.4, 0.5, 0])
        ib, ob = under(comp[1:4], PURP, 0.1), box(comp, BLUE, buff=0.22)
        self.go("20:07.90", Write(comp), Create(ib), run=0.7)
        self.go("20:08.64", Create(ob), run=0.4)
        self.go("20:10.36", Create(under(fa, YEL, 0.35)), Create(under(ob, YEL, 0.2)), run=0.6)
        u1 = H("derivatives", 44, PINK).move_to([-3.4, -1.6, 0])
        u2 = H("chain rule", 44, PINK).move_to([3.4, -1.6, 0])
        self.go("20:12.90", FadeIn(u1, shift=UP * 0.1), FadeIn(u2, shift=UP * 0.1), run=0.5)
        # actual calculus: a tangent sliding along a curve
        self.at("20:14.60")
        self.clear_all(run=0.4)
        ax = axes(x_range=(0, 6, 1), y_range=(0, 5, 1), x_length=8.0, y_length=4.8, center=(0, -0.3, 0), nums=False, x_label=None, y_label=None)
        f = lambda x: 0.5 + 0.9 * x - 0.11 * x ** 2 + 0.25 * np.sin(1.6 * x)
        c = curve(ax, f, x_range=[0.2, 5.8])
        self.go("20:15.10", Create(ax), draw(c, 0.8, BLUE), run=0.8)
        xt = ValueTracker(0.8)
        lt = live_tangent(ax, f, xt, length=2.6, readout=False)
        self.go("20:16.00", FadeIn(lt), run=0.3)
        self.play(xt.animate.set_value(4.6), run_time=1.7)
