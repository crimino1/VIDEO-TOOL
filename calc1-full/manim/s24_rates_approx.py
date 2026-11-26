"""Builder 24: end of Chapter 8. The cone answer (dh/dt = 1/(2 pi)), two cars moving apart (d' = 100 km/h), the ripple
(dA/dt = 60 pi), linear approximation (a zoom inset where the curve turns into its tangent, L(x) = f(a) + f'(a)(x - a)),
sqrt(4.1), 1.02^5, sin x ~ x with a live gap, two to try, differentials, the ball's volume error (3x relative error),
and the chapter recap. Shares the step strip / cone / eqrow / live helpers with builder 23 (imported, not edited).
Colours: rates and slopes PINK, example numbers ORG, answers GRN, key words YEL, functions BLUE."""
from common import *
from s23_related_rates import cone_state, step, r_box, VX, CX, AY, CS   # the cone shot continues builder 23's board

# ---------------------------------------------------------------- local helpers (same look as builder 23's)

_DG = {}


def digits(s, size=46, color=CHALK):
    """A number from cached glyphs (cheap per frame, no new LaTeX per value)."""
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


def live(label, fn, fmt, unit=None, color=CHALK, size=46):
    """Live number (+ unit) right of `label` (a MathTex ending in '=')."""
    u = M(unit, size=size - 6, color=color) if unit else None

    def mk():
        d = digits(fmt(fn()), size, color)
        g = VGroup(d, u.copy()) if u else VGroup(d)
        g.arrange(RIGHT, buff=0.14, aligned_edge=DOWN)
        g.next_to(label, RIGHT, buff=0.18)
        g.shift(UP * (label[-1].get_y() - d.get_y()))
        return g
    return always_redraw(mk)


def f2(v):
    return f"{(v if abs(v) >= 0.005 else 0.0):.2f}"


def f1(v):
    return f"{(v if abs(v) >= 0.05 else 0.0):.1f}"


def eqrow(*parts, y, x=2.0, eq=1, size=56):
    """MathTex row with part `eq` (the '=') at column x, row y."""
    m = M(*parts, size=size)
    m.shift(RIGHT * (x - m[eq].get_x()) + UP * (y - m[eq].get_y()))
    return m


def under(mob, color=YEL):
    return Line(mob.get_corner(DL) + DOWN * 0.1, mob.get_corner(DR) + DOWN * 0.1, color=color, stroke_width=5)


assert f2(0.004) == "0.00" and f1(2.0) == "2.0"

# ================================================================ 1. the cone, finished


class K24_ConeEnd(Shot):
    def body(self):
        # first frame = last frame of K23_ConeSolve
        self.title("The Cone", animate=False)
        st, g, L = cone_state(self, 4)
        hl = L["h"][1]
        h4 = M("h=4", size=46, color=ORG).move_to(hl.get_center() + LEFT * 1.05)
        L["h"].remove(hl)
        rb = r_box()
        r4b = eqrow(r"\frac{dV}{dt}", "=", r"\frac{\pi h^2}{4}", r"\frac{dh}{dt}", y=0.85, x=VX, size=58)
        r4b[0].set_color(PINK); r4b[3].set_color(PINK)
        r5 = eqrow("2", "=", r"\frac{\pi\cdot 16}{4}", r"\frac{dh}{dt}", y=-0.75, x=VX, size=58)
        r5[0].set_color(ORG); r5[2][2:4].set_color(ORG); r5[3].set_color(PINK)
        r6 = eqrow("2", "=", r"4\pi", r"\frac{dh}{dt}", y=-2.35, x=VX, size=58)
        r6[0].set_color(ORG); r6[3].set_color(PINK)
        self.add(h4, rb, r4b, r5, r6)

        self.go("2:23:55.33", FadeOut(VGroup(r4b, r5)), r6.animate.shift(UP * 3.2), run=0.6)
        r7 = eqrow(r"\frac{dh}{dt}", "=", r"\frac{2}{4\pi}", "=", r"\frac{1}{2\pi}", y=-0.75, x=VX, size=58)
        r7[0].set_color(PINK)
        self.go("2:23:55.95", Write(r7[:2]), run=0.6)
        self.go("2:23:57.27", Write(r7[2]), run=0.8)
        self.go("2:23:59.09", Write(r7[3:]), run=0.8)
        r8 = eqrow(r"\approx", r"0.16\ \text{m/min}", y=-2.35, x=VX, eq=0, size=58).set_color(GRN)
        bx = answer_box(r8)
        self.go("2:24:00.95", Write(r8), run=0.9)
        surf = AY + 4 * CS
        up = Arrow([CX, surf + 0.05, 0], [CX, surf + 0.75, 0], buff=0, color=PINK, stroke_width=5, tip_length=0.2)
        self.play(Create(bx), GrowArrow(up), run_time=0.5)
        step(self, st, 5, "2:24:02.75")


# ================================================================ 2-4. two cars

O = np.array([-5.2, -3.1, 0])
KS = 0.025   # screen units per km
LX = 2.4     # '=' column for the car algebra


def car(p, east=False):
    """Top-down chalk car whose rear sits at p, nose pointing north (or east)."""
    body = RoundedRectangle(width=0.3, height=0.6, corner_radius=0.09, stroke_color=CHALK, stroke_width=3,
                            fill_color=CHALK, fill_opacity=0.08)
    ws = Line([-0.1, 0.12, 0], [0.1, 0.12, 0], color=CHALK, stroke_width=3)
    rw = Line([-0.09, -0.18, 0], [0.09, -0.18, 0], color=DIM, stroke_width=2)
    wh = VGroup(*[Rectangle(width=0.05, height=0.13, stroke_width=0, fill_color=CHALK, fill_opacity=0.9)
                  .move_to([sx * 0.17, sy * 0.17, 0]) for sx in (-1, 1) for sy in (-1, 1)])
    c = VGroup(wh, body, ws, rw)
    c.scale(1.25)
    if east:
        c.rotate(-PI / 2)
    return c.move_to(np.array(p) + (RIGHT if east else UP) * 0.46)


def npos(t):
    return O + UP * 60 * t * KS


def epos(t):
    return O + RIGHT * 80 * t * KS


def roads():
    return VGroup(Line(O, O + UP * 3.85, color=FAINT, stroke_width=3), Line(O, O + RIGHT * 4.9, color=FAINT, stroke_width=3))


def car_rows():
    rn = eqrow("a'", "=", r"60\ \text{km/h}", y=1.5, x=LX, size=54).set_color(PINK)
    re = eqrow("b'", "=", r"80\ \text{km/h}", y=0.55, x=LX, size=54).set_color(PINK)
    return rn, re


def tri_parts():
    N, E = npos(2), epos(2)
    legs = VGroup(Line(O, N, color=CHALK, stroke_width=4), Line(O, E, color=CHALK, stroke_width=4))
    mark = right_angle_mark(O, N, E, size=0.28)
    la = M("a", size=48).next_to(Line(O, N), LEFT, buff=0.18)
    lb = M("b", size=48).next_to(Line(O, E), DOWN, buff=0.18)
    ld = M("d", size=48, color=YEL).move_to((N + E) / 2 + np.array([0.6, 0.8, 0]) * 0.45)
    dl = DashedLine(N, E, color=YEL, stroke_width=4, dash_length=0.12)
    return legs, mark, la, lb, ld, dl


def cars_state(sc):
    """End of K24_Cars: the triangle at t = 2 h and the rows on the right."""
    sc.title("Two Cars", animate=False)
    legs, mark, la, lb, ld, dl = tri_parts()
    start = Dot(O, radius=0.07, color=ORG)
    cn, ce = car(npos(2)), car(epos(2), east=True)
    rn, re = car_rows()
    tl = M("t", "=", size=54, color=ORG).move_to([LX - 0.4, -0.4, 0])
    tl.shift(RIGHT * (LX - tl[1].get_x()))
    tn = live(tl, lambda: 2.0, f1, r"\text{h}", ORG, 54)
    rw = eqrow("d'", "=", "?", y=-1.35, x=LX, size=54).set_color(PINK)
    rp = eqrow("a^2+b^2", "=", "d^2", y=-2.6, x=LX, size=54)
    ul = under(rp, YEL)
    sc.add(roads(), legs, dl, mark, start, cn, ce, la, lb, ld, rn, re, tl, tn, rw, rp, ul)
    return dict(legs=legs, dl=dl, la=la, lb=lb, ld=ld, rn=rn, re=re, tl=tl, tn=tn, rw=rw, rp=rp, ul=ul, cn=cn, ce=ce)


class K24_Cars(Shot):
    def body(self):
        self.title("Two Cars", "2:24:03.85")
        rd = roads()
        start = Dot(O, radius=0.07, color=ORG)
        tt = ValueTracker(0)
        cn = always_redraw(lambda: car(npos(tt.get_value())))
        ce = always_redraw(lambda: car(epos(tt.get_value()), east=True))
        self.go("2:24:04.99", Create(rd), FadeIn(start, scale=0.5), run=0.6)
        self.go("2:24:05.80", FadeIn(cn), FadeIn(ce), run=0.5)
        nl = H("N", 34, DIM).next_to(O + UP * 3.85, UP, buff=0.08)
        el = H("E", 34, DIM).next_to(O + RIGHT * 4.9, RIGHT, buff=0.1)
        rn, re = car_rows()
        an = Arrow(ORIGIN, UP * 0.65, buff=0, color=PINK, stroke_width=5, tip_length=0.18).move_to(rn[0])
        ae = Arrow(ORIGIN, RIGHT * 0.65, buff=0, color=PINK, stroke_width=5, tip_length=0.18).move_to(re[0])
        self.go("2:24:08.01", FadeIn(nl), GrowArrow(an), run=0.4)
        self.go("2:24:08.63", Write(rn[2]), run=0.7)
        self.go("2:24:11.19", FadeIn(el), GrowArrow(ae), run=0.4)
        self.go("2:24:11.89", Write(re[2]), run=0.7)

        # drive for two hours: the gap d grows
        dl = always_redraw(lambda: DashedLine(npos(tt.get_value()), epos(tt.get_value()), color=YEL, stroke_width=4,
                                              dash_length=0.12) if tt.get_value() > 0.03 else VMobject())
        tl = M("t", "=", size=54, color=ORG).move_to([LX - 0.4, -0.4, 0])
        tl.shift(RIGHT * (LX - tl[1].get_x()))
        tn = live(tl, tt.get_value, f1, r"\text{h}", ORG, 54)
        self.add(dl)
        self.go("2:24:13.75", FadeIn(tl), FadeIn(tn), run=0.3)
        self.play(tt.animate.set_value(2), run_time=2.7, rate_func=linear)
        self.go("2:24:16.80", Circumscribe(VGroup(tl, tn), color=ORG, buff=0.12), run=0.8)

        legs, mark, la, lb, ld, dl2 = tri_parts()
        self.remove(dl)
        self.add(dl2)
        self.go("2:24:18.19", Create(legs[0]), run=0.4)
        self.go("2:24:18.79", Write(la), FadeOut(an), Write(rn[:2]), run=0.5)
        self.go("2:24:19.85", Create(legs[1]), run=0.4)
        self.go("2:24:20.47", Write(lb), FadeOut(ae), Write(re[:2]), run=0.5)
        self.go("2:24:21.65", Circumscribe(dl2, color=YEL, buff=0.1), run=0.7)
        self.go("2:24:22.59", Write(ld), run=0.4)
        rw = eqrow("d'", "=", "?", y=-1.35, x=LX, size=54).set_color(PINK)
        self.play(Write(rw), run_time=0.5)
        self.go("2:24:24.33", Create(mark), FadeOut(nl), FadeOut(el), run=0.5)
        rp = eqrow("a^2+b^2", "=", "d^2", y=-2.6, x=LX, size=54)
        self.go("2:24:25.57", Write(rp[0]), run=1.2)
        self.go("2:24:27.41", Write(rp[1:]), run=0.7)
        ul = under(rp, YEL)
        self.go("2:24:28.40", Create(ul), run=0.4)


def known_line():
    k = M("a'=60", r",\quad", "b'=80", r",\quad", "t=2", size=48).move_to([LX + 0.2, 1.7, 0])
    k[0].set_color(PINK); k[2].set_color(PINK); k[4].set_color(ORG); k[1].set_color(DIM); k[3].set_color(DIM)
    return k


def lab_at(m, txt, color=ORG, size=46):
    return M(txt, size=size, color=color).move_to(m, aligned_edge=LEFT)


def cars_solve_end(sc):
    """End of K24_CarsSolve."""
    s = cars_state(sc)
    sc.remove(s["rn"], s["re"], s["tl"], s["tn"], s["rw"], s["rp"], s["ul"], s["la"], s["lb"], s["ld"])
    kl = known_line()
    e2 = eqrow("a", "a'", "+", "b", "b'", "=", "d", "d'", y=0.6, x=LX, eq=5, size=56)
    for i in (1, 4, 7):
        e2[i].set_color(PINK)
    e2b = box(e2, YEL, buff=0.15)
    a120 = M("a=120", size=46, color=ORG).move_to(O + [0.25, 1.5, 0], aligned_edge=LEFT)
    b160 = M("b=160", size=46, color=ORG).next_to(Line(O, epos(2)), DOWN, buff=0.18)
    d200 = M("d=200", size=46, color=ORG).move_to((npos(2) + epos(2)) / 2 + [0.25, 0.42, 0], aligned_edge=LEFT)
    d1 = eqrow("d", "=", r"\sqrt{120^2+160^2}", y=-0.6, x=LX, size=50)
    d2 = eqrow("=", r"\sqrt{14\,400+25\,600}", y=-1.75, x=LX, eq=0, size=50)
    d3 = eqrow("=", r"\sqrt{40\,000}", "=", "200", y=-2.9, x=LX, eq=0, size=50)
    d3[3].set_color(ORG)
    sc.add(kl, e2, e2b, a120, b160, d200, d1, d2, d3)
    return dict(kl=kl, e2=e2, e2b=e2b, d1=d1, d2=d2, d3=d3, dl=s["dl"])


class K24_CarsSolve(Shot):
    def body(self):
        s = cars_state(self)
        kl = known_line()
        # the knowns shrink to one line; the equation moves up
        self.go("2:24:29.25", FadeOut(s["rw"]), FadeOut(s["ul"]),
                ReplacementTransform(VGroup(s["rn"]), VGroup(kl[0])),
                ReplacementTransform(VGroup(s["re"]), VGroup(kl[2])),
                ReplacementTransform(VGroup(s["tl"]), VGroup(kl[4])), FadeOut(s["tn"]), FadeIn(kl[1]), FadeIn(kl[3]),
                s["rp"].animate.move_to([s["rp"].get_x(), 0.6, 0]), run=0.6)
        rp = s["rp"]
        ddt = M(r"\frac{d}{dt}", size=46, color=PINK).next_to(rp, LEFT, buff=0.5)
        self.go("2:24:29.95", FadeIn(ddt, shift=RIGHT * 0.1), run=0.4)
        e1 = eqrow("2", "a", "a'", "+", "2", "b", "b'", "=", "2", "d", "d'", y=-0.6, x=LX, eq=7, size=56)
        for i in (2, 6, 10):
            e1[i].set_color(PINK)
        self.go("2:24:30.69", Write(e1[:3]), run=0.8)
        self.go("2:24:31.93", Write(e1[3:7]), run=1.0)
        self.go("2:24:33.61", Write(e1[7:]), run=1.2)
        sk = VGroup(*[strike(e1[i], RED, 5) for i in (0, 4, 8)])
        self.go("2:24:36.63", LaggedStart(*[Create(x) for x in sk], lag_ratio=0.3), run=0.8)
        e2 = eqrow("a", "a'", "+", "b", "b'", "=", "d", "d'", y=-1.8, x=LX, eq=5, size=56)
        for i in (1, 4, 7):
            e2[i].set_color(PINK)
        self.go("2:24:38.11", Write(e2[:3]), run=0.9)
        self.go("2:24:39.37", Write(e2[3:5]), run=0.6)
        self.go("2:24:40.33", Write(e2[5:]), run=0.8)
        e2b = box(e2, YEL, buff=0.15)
        self.go("2:24:41.45", Create(e2b), run=0.5)

        # after two hours
        self.go("2:24:42.40", FadeOut(VGroup(rp, ddt, e1, sk)), VGroup(e2, e2b).animate.shift(UP * 2.4), run=0.6)
        self.go("2:24:42.90", Circumscribe(kl[4], color=ORG, buff=0.1), run=0.7)
        a120 = M("a=120", size=46, color=ORG).move_to(O + [0.25, 1.5, 0], aligned_edge=LEFT)
        b160 = M("b=160", size=46, color=ORG).next_to(Line(O, epos(2)), DOWN, buff=0.18)
        self.go("2:24:44.30", ReplacementTransform(s["la"], a120), run=0.6)
        self.go("2:24:46.10", ReplacementTransform(s["lb"], b160), run=0.6)
        d1 = eqrow("d", "=", r"\sqrt{120^2+160^2}", y=-0.6, x=LX, size=50)
        self.go("2:24:48.03", Write(d1[:2]), Circumscribe(s["dl"], color=YEL, buff=0.08), run=0.6)
        self.go("2:24:48.81", Write(d1[2]), run=1.6)
        d2 = eqrow("=", r"\sqrt{14\,400+25\,600}", y=-1.75, x=LX, eq=0, size=50)
        self.go("2:24:53.60", Write(d2), run=1.6)
        d3 = eqrow("=", r"\sqrt{40\,000}", "=", "200", y=-2.9, x=LX, eq=0, size=50)
        d3[3].set_color(ORG)
        self.go("2:24:57.35", Write(d3[:2]), run=0.9)
        self.go("2:24:59.45", Write(d3[2:]), run=0.6)
        d200 = M("d=200", size=46, color=ORG).move_to((npos(2) + epos(2)) / 2 + [0.25, 0.42, 0], aligned_edge=LEFT)
        self.go("2:25:00.25", ReplacementTransform(s["ld"], d200), run=0.6)


class K24_CarsPlug(Shot):
    def body(self):
        s = cars_solve_end(self)
        self.go("2:25:01.79", FadeOut(VGroup(s["d1"], s["d2"], s["d3"])), run=0.5)
        p1 = eqrow("120", r"\cdot", "60", "+", "160", r"\cdot", "80", "=", "200", "d'", y=-0.6, x=LX, eq=7, size=50)
        for i in (0, 4, 8):
            p1[i].set_color(ORG)
        for i in (2, 6, 9):
            p1[i].set_color(PINK)
        self.go("2:25:03.11", Write(p1[0]), run=0.4)
        self.go("2:25:03.70", Write(p1[1:3]), run=0.6)
        self.go("2:25:04.85", Write(p1[3:5]), run=0.6)
        self.go("2:25:06.23", Write(p1[5:7]), run=0.5)
        self.go("2:25:07.09", Write(p1[7:]), run=0.9)
        p2 = eqrow(r"7\,200", "+", r"12\,800", "=", "200", "d'", y=-1.75, x=LX, eq=3, size=50)
        p2[5].set_color(PINK)
        self.go("2:25:10.40", Write(p2[0]), run=0.6)
        self.go("2:25:11.47", Write(p2[1:3]), run=0.8)
        self.play(FadeIn(p2[3:]), run_time=0.4)
        p3 = eqrow(r"20\,000", "=", "200", "d'", y=-2.9, x=LX, size=50)
        p3[3].set_color(PINK)
        self.go("2:25:13.75", Write(p3[0]), run=0.7)
        self.go("2:25:16.59", Write(p3[1:]), run=0.7)
        p4 = eqrow("d'", "=", r"100\ \text{km/h}", y=-2.9, x=LX, size=58).set_color(GRN)
        self.go("2:25:18.90", TransformMatchingTex(p3, p4), run=0.8)
        bx = answer_box(p4)
        self.go("2:25:19.90", Create(bx), Circumscribe(s["dl"], color=GRN, buff=0.08), run=0.8)


# ================================================================ 5. the ripple

PC = np.array([-3.6, -0.5, 0])
RS = 0.23    # screen units per cm
RQ = 2.4     # '=' column


def ripple(r):
    if r < 0.05:
        return VGroup()
    R = r * RS
    g = VGroup(Circle(radius=R, stroke_width=0, fill_color=BLUE, fill_opacity=0.1).move_to(PC),
               Circle(radius=R, color=BLUE, stroke_width=4).move_to(PC))
    for f, op in ((0.62, 0.45), (0.3, 0.3)):
        g.add(Circle(radius=R * f, color=BLUE, stroke_width=2, stroke_opacity=op).move_to(PC))
    return g


class K24_Ripple(Shot):
    def body(self):
        self.title("The Ripple", "2:25:23.47")
        stone = Dot(PC, radius=0.09, color=ORG).set_z_index(5)
        self.go("2:25:24.05", FadeIn(stone, shift=DOWN * 0.3), run=0.4)
        rt = ValueTracker(0)
        rp = always_redraw(lambda: ripple(rt.get_value()))
        rl = M("r", "=", size=48).move_to([-4.3, -3.35, 0])
        rn = live(rl, rt.get_value, f1, r"\text{cm}", CHALK, 48)
        self.add(rp)
        self.go("2:25:25.40", FadeIn(rl), FadeIn(rn), run=0.25)
        k1 = eqrow(r"\frac{dr}{dt}", "=", r"3\ \text{cm/s}", y=1.75, x=RQ, size=50).set_color(PINK)
        self.play(rt.animate(rate_func=linear, run_time=10 / 3).set_value(10),   # 3 cm/s
                  Succession(Wait(2.15), Write(k1[0], run_time=0.5), Wait(0.4), Write(k1[1:], run_time=0.7)))
        ang = -0.5
        edge = PC + 10 * RS * np.array([np.cos(ang), np.sin(ang), 0])
        rad = DashedLine(PC, edge, color=YEL, stroke_width=3, dash_length=0.1)
        k2 = eqrow(r"\frac{dA}{dt}", "=", "?", r"\text{ when }", "r=10", y=0.4, x=RQ, size=50).set_color(PINK)
        k2[3].set_color(CHALK); k2[4].set_color(ORG)
        self.go("2:25:31.37", Write(k2[:3]), run=0.7)
        self.go("2:25:32.73", Write(k2[3:]), run=0.7)
        self.go("2:25:33.80", Create(rad), Circumscribe(VGroup(rl, rn), color=ORG, buff=0.1), run=0.8)

        a0 = eqrow("A", "=", r"\pi r^2", y=-0.95, x=RQ, size=56)
        self.go("2:25:35.27", Write(a0), run=0.9)
        d0 = eqrow(r"\frac{dA}{dt}", "=", r"2\pi r", r"\frac{dr}{dt}", y=-2.2, x=RQ, size=56)
        d0[0].set_color(PINK); d0[3].set_color(PINK)
        self.go("2:25:38.95", Write(d0[:2]), run=0.6)
        self.go("2:25:40.59", Write(d0[2]), run=0.6)
        ring = Annulus(inner_radius=10 * RS, outer_radius=10 * RS + 0.16, stroke_width=0, fill_color=PINK,
                       fill_opacity=0.65).move_to(PC)
        self.play(FadeIn(ring), run_time=0.4)
        self.go("2:25:41.63", Write(d0[3]), run=0.5)

        # plug in
        self.go("2:25:43.19", FadeOut(VGroup(k2, a0)), d0.animate.shift(UP * 2.4), run=0.6)
        p1 = eqrow("=", r"2\pi\cdot 10\cdot 3", y=-0.9, x=RQ, eq=0, size=56)
        self.go("2:25:44.15", Write(p1), run=1.3)
        p2 = eqrow("=", r"60\pi\ \text{cm}^2\text{/s}", y=-2.0, x=RQ, eq=0, size=56)
        self.go("2:25:46.53", Write(p2), run=1.2)
        p3 = eqrow(r"\approx", r"188\ \text{cm}^2\text{/s}", y=-3.1, x=RQ, eq=0, size=56).set_color(GRN)
        self.go("2:25:49.40", Write(p3), run=0.8)
        self.play(Create(answer_box(p3[1])), run_time=0.5)


# ================================================================ 6. linear approximation: zoom in until the curve is its tangent

def g_f(x):
    return 0.5 + 0.9 * x - 0.09 * x * x


GA = 2.5
ZC, ZRAD = np.array([3.3, -0.4, 0]), 1.85


def unit(ax):
    o = np.array(ax.c2p(0, 0))
    return np.array(ax.c2p(1, 0))[0] - o[0], np.array(ax.c2p(0, 1))[1] - o[1]


def clip_mid(uu, vv, R):
    """Longest run of (u, v) around the middle sample that stays inside the circle."""
    inside = uu ** 2 + vv ** 2 <= (R * 0.98) ** 2
    m = len(uu) // 2
    i0 = i1 = m
    while i0 > 0 and inside[i0 - 1]:
        i0 -= 1
    while i1 < len(uu) - 1 and inside[i1 + 1]:
        i1 += 1
    return uu[i0:i1 + 1], vv[i0:i1 + 1]


def zoom_parts(ax, f, a, k, C=ZC, R=ZRAD):
    """Box on the graph at (a, f(a)) shrinking as k grows; round inset showing that box magnified k times."""
    P = np.array(ax.c2p(a, f(a)))
    sx, sy = unit(ax)
    m = slope(f, a) * sy / sx

    def boxm():
        return Square(2 * R / k.get_value(), color=YEL, stroke_width=3).move_to(P)

    def links():
        b = boxm()
        return VGroup(Line(b.get_corner(UR), C + R * np.array([np.cos(2.3), np.sin(2.3), 0]), color=YEL, stroke_width=2, stroke_opacity=0.6),
                      Line(b.get_corner(DR), C + R * np.array([np.cos(4.0), np.sin(4.0), 0]), color=YEL, stroke_width=2, stroke_opacity=0.6))

    uu = np.linspace(-R, R, 301)

    def inset():
        kk = k.get_value()
        vv = kk * sy * (f(a + uu / (kk * sx)) - f(a))
        cu, cv = clip_mid(uu, vv, R)
        return VMobject(stroke_color=BLUE, stroke_width=6).set_points_as_corners([C + [u, v, 0] for u, v in zip(cu, cv)])

    tu, tv = clip_mid(uu, m * uu, R)
    tl = Line(C + [tu[0], tv[0], 0], C + [tu[-1], tv[-1], 0], color=PINK, stroke_width=4)
    circ = Circle(radius=R, color=CHALK, stroke_width=3).move_to(C)
    dot = Dot(C, radius=0.08, color=ORG).set_z_index(6)
    return circ, always_redraw(boxm), always_redraw(links), always_redraw(inset), tl, dot


def lin_axes():
    return axes((0, 9, 1), (0, 3.5, 1), x_length=5.6, y_length=3.6, center=(-3.4, -0.9, 0), nums=False)


class K24_Linear(Shot):
    def body(self):
        self.title("Linear Approximation", "2:25:52.65")
        ax = lin_axes()
        cv = curve(ax, g_f, (0, 8.6))
        P = pt(ax, GA, g_f(GA))
        tg = tangent(ax, g_f, GA, length=4.2)
        self.go("2:25:56.30", Create(ax), FadeIn(ax.labels), run=0.6)
        self.go("2:25:57.40", draw(cv, run=1.0), run=1.0)
        self.go("2:25:58.55", FadeIn(P, scale=0.5), draw(tg, run=0.7, color=PINK), run=0.7)
        k = ValueTracker(1.3)
        circ, bx, ln, ins, tl, dot = zoom_parts(ax, g_f, GA, k)
        self.go("2:25:59.60", Create(circ), FadeIn(bx), FadeIn(ln), FadeIn(ins), Create(tl), FadeIn(dot), run=0.7)
        self.go("2:26:00.50", k.animate.set_value(45), run=3.5,
                rate_func=lambda t: (np.exp(t * np.log(45 / 1.3)) - 1) / (45 / 1.3 - 1))
        lab = TX(r"curve $\approx$ tangent", 46).next_to(circ, DOWN, buff=0.3)
        self.go("2:26:04.10", FadeIn(lab, shift=UP * 0.1), run=0.5)
        near = Ellipse(width=1.7, height=1.2, color=GRN, stroke_width=3).move_to(P)
        self.go("2:26:05.33", Create(near), run=0.5)
        self.go("2:26:07.23", Circumscribe(tl, color=PINK, buff=0.08), run=0.9)
        lab2 = M("y", "=", "mx+b", size=54, color=PINK).move_to(lab)
        self.go("2:26:11.17", FadeOut(lab, shift=UP * 0.1), FadeIn(lab2, shift=UP * 0.1), run=0.5)

        # estimate a value off the tangent
        self.go("2:26:13.55", FadeOut(VGroup(circ, bx, ln, ins, tl, dot, lab2)), run=0.5)
        xe = 3.5
        Le = g_f(GA) + slope(g_f, GA) * (xe - GA)
        vl = DashedLine(ax.c2p(xe, 0), ax.c2p(xe, Le), color=DIM, stroke_width=2, dash_length=0.08)
        de = pt(ax, xe, Le, PINK)
        dc = pt(ax, xe, g_f(xe), BLUE, r=0.06)
        self.go("2:26:14.53", Create(vl), FadeIn(de, scale=0.5), FadeIn(dc, scale=0.5), run=0.5)
        ne = note("estimate", de, UR, color=PINK, size=36, dist=0.7)
        self.go("2:26:15.39", FadeIn(ne[0]), Create(ne[1]), run=0.5)

        # L(x) = f(a) + f'(a)(x - a)
        self.go("2:26:18.89", FadeOut(VGroup(vl, de, dc, ne, near)), run=0.4)
        aa = M("a", size=44, color=ORG).next_to(ax.c2p(GA, 0), DOWN, buff=0.15)
        va = DashedLine(ax.c2p(GA, 0), ax.c2p(GA, g_f(GA)), color=DIM, stroke_width=2, dash_length=0.08)
        self.go("2:26:20.41", Write(aa), Create(va), run=0.5)
        F = M("L(x)", "=", "f(a)", "+", "f'(a)", "(x-a)", size=60).move_to([2.9, 0.9, 0])
        F[0].set_color(PINK); F[2].set_color(BLUE); F[4].set_color(PINK)
        self.go("2:26:23.51", Write(F[0]), run=0.5)
        self.go("2:26:24.19", Write(F[1:3]), run=0.6)
        fa = M("f(a)", size=42, color=BLUE).next_to(va, RIGHT, buff=0.12).shift(DOWN * 0.25)
        self.play(FadeIn(fa, shift=RIGHT * 0.1), run_time=0.4)
        self.go("2:26:25.40", Write(F[3:5]), run=0.6)
        rr = rise_run(ax, GA, g_f(GA), GA + 1.8, g_f(GA) + slope(g_f, GA) * 1.8, PINK)
        sl = M(r"\text{slope } f'(a)", size=40, color=PINK).next_to(rr, DOWN, buff=0.15).shift(RIGHT * 0.5)
        self.play(Create(rr), FadeIn(sl), run_time=0.6)
        self.go("2:26:26.53", Write(F[5]), run=0.8)
        pl = pill("the linearization of f at a", YEL, 38).move_to([3.3, -0.7, 0])
        self.go("2:26:29.15", FadeIn(pl, shift=UP * 0.1), run=0.6)
        self.go("2:26:30.20", Create(under(F, YEL)), run=0.5)


# ================================================================ 7-8. sqrt(4.1)

QX = 2.5   # '=' column for the worked estimates


def est_axes(x_range, y_range):
    return axes(x_range, y_range, x_length=5.0, y_length=3.0, center=(-3.7, -1.5, 0))


def root_state(sc):
    ax = est_axes((0, 6, 1), (0, 3, 1))
    f = np.sqrt
    cv = curve(ax, f, (0.0, 5.8), use_smoothing=False)
    q = M(r"\sqrt{4.1}", r"\approx", "?", size=64).move_to([-3.7, 1.3, 0])
    q[0].set_color(YEL)
    P = pt(ax, 4, 2)
    pl = M(r"\sqrt{4}=2", size=44, color=ORG).next_to(P, UL, buff=0.12)
    at = M("a=4", size=42, color=ORG).next_to(ax.c2p(4, 0), DOWN, buff=0.55)
    tg = tangent(ax, f, 4, length=3.6)
    R = [eqrow("f(x)", "=", r"\sqrt{x}", y=1.75, x=QX, size=50),
         eqrow("f(4)", "=", "2", y=0.85, x=QX, size=50),
         eqrow("f'(x)", "=", r"\frac{1}{2\sqrt{x}}", y=-0.25, x=QX, size=50),
         eqrow("f'(4)", "=", r"\frac{1}{4}", y=-1.6, x=QX, size=50),
         eqrow("L(x)", "=", r"2+\frac{1}{4}(x-4)", y=-3.0, x=QX, size=50)]
    R[0][0].set_color(BLUE); R[2][0].set_color(PINK); R[3][0].set_color(PINK); R[4][0].set_color(PINK)
    R[1][2].set_color(ORG); R[3][2].set_color(PINK)
    bx = box(R[4], YEL, buff=0.15)
    return dict(ax=ax, cv=cv, q=q, P=P, pl=pl, at=at, tg=tg, R=R, bx=bx)


class K24_Root41(Shot):
    def body(self):
        self.title("Estimate a Square Root", "2:26:31.55")
        s = root_state(self)
        ax, R = s["ax"], s["R"]
        self.go("2:26:32.51", Write(s["q"]), run=0.9)
        self.go("2:26:34.20", Create(ax), FadeIn(ax.labels), run=0.6)
        self.go("2:26:35.00", draw(s["cv"], run=1.0), run=1.0)
        self.go("2:26:36.81", Circumscribe(VGroup(*[l for l in ax.labels if abs(l.get_x() - ax.c2p(4, 0)[0]) < 0.1]), color=ORG, buff=0.1), run=0.8)
        self.go("2:26:39.31", FadeIn(s["P"], scale=0.5), run=0.4)
        self.go("2:26:39.93", Write(s["pl"]), run=0.6)
        self.go("2:26:41.63", Write(s["at"]), run=0.6)
        self.go("2:26:43.29", Write(R[0]), run=0.8)
        self.go("2:26:45.01", Write(R[1]), run=0.8)
        self.go("2:26:46.99", Write(R[2]), run=1.0)
        self.go("2:26:49.59", Write(R[3]), run=0.8)
        self.go("2:26:51.87", Write(R[4][:2]), run=0.4)
        self.go("2:26:53.09", Write(R[4][2]), draw(s["tg"], run=1.0, color=PINK), run=1.2)
        self.go("2:26:55.90", Create(s["bx"]), run=0.4)


def root_add(sc, s):
    sc.title("Estimate a Square Root", animate=False)
    sc.add(s["ax"], s["ax"].labels, s["cv"], s["q"], s["P"], s["pl"], s["at"], s["tg"], *s["R"], s["bx"])


class K24_Root41b(Shot):
    def body(self):
        s = root_state(self)
        root_add(self, s)
        R = s["R"]
        Lb = VGroup(R[4], s["bx"])
        self.go("2:26:56.57", FadeOut(VGroup(*R[:4])), Lb.animate.shift(UP * 4.6), run=0.6)
        q1 = eqrow("L(4.1)", "=", r"2+\frac{1}{4}\cdot 0.1", y=0.35, x=QX, size=52)
        q1[0].set_color(PINK)
        self.go("2:26:57.35", Write(q1[0]), run=0.6)
        self.go("2:26:58.59", Write(q1[1:]), run=1.2)
        q2 = eqrow("=", r"2+0.025", y=-0.85, x=QX, eq=0, size=52)
        self.go("2:27:00.89", Write(q2), run=1.1)
        q3 = eqrow("=", "2.025", y=-1.95, x=QX, eq=0, size=52)
        q3[1].set_color(GRN)
        self.go("2:27:03.65", Write(q3), run=0.6)
        a1 = M("2.025", size=64, color=GRN).move_to(s["q"][2], aligned_edge=LEFT)
        self.play(ReplacementTransform(s["q"][2], a1), run_time=0.5)
        cm = eqrow(r"\sqrt{4.1}", "=", r"2.02485\ldots", y=-3.05, x=QX, size=52)
        cm[0].set_color(BLUE); cm[2].set_color(BLUE)
        self.go("2:27:05.81", Write(cm[0]), run=0.5)
        self.go("2:27:06.79", Write(cm[1:]), run=0.9)
        same = VGroup(under(q3[1][:4], GRN), under(cm[2][:4], GRN))
        self.go("2:27:09.70", Create(same), run=0.6)
        self.go("2:27:11.20", FadeOut(VGroup(q1, q2)), VGroup(q3, cm, same).animate.shift(UP * 1.9), run=0.5)
        off = TX(r"off by only $0.00015$", 44, YEL).move_to([QX + 0.6, -2.55, 0])
        self.go("2:27:11.85", FadeIn(off, shift=UP * 0.1), run=0.5)


# ================================================================ 9. 1.02^5

class K24_Power(Shot):
    def body(self):
        self.title("Another One", "2:27:13.90")
        q = M(r"(1.02)^5", r"\approx", "?", size=64).move_to([-3.7, 1.3, 0])
        q[0].set_color(YEL)
        self.go("2:27:15.37", Write(q), run=1.0)
        ax = est_axes((0, 1.5, 0.5), (0, 3, 1))
        f = lambda x: x ** 5
        cv = curve(ax, f, (0, 1.245))
        P = pt(ax, 1, 1)
        at = M("a=1", size=42, color=ORG).next_to(ax.c2p(1, 0), DOWN, buff=0.55)
        tg = Line(ax.c2p(0.84, 0.2), ax.c2p(1.36, 2.8), color=PINK, stroke_width=5).set_z_index(4)
        R = [eqrow("f(x)", "=", "x^5", y=1.75, x=QX, size=50),
             eqrow("f(1)", "=", "1", y=0.85, x=QX, size=50),
             eqrow("f'(x)", "=", "5x^4", y=-0.25, x=QX, size=50),
             eqrow("f'(1)", "=", "5", y=-1.6, x=QX, size=50),
             eqrow("L(x)", "=", "1+5(x-1)", y=-3.0, x=QX, size=50)]
        R[0][0].set_color(BLUE); R[2][0].set_color(PINK); R[3][0].set_color(PINK); R[3][2].set_color(PINK)
        R[4][0].set_color(PINK)
        self.go("2:27:18.57", Create(ax), FadeIn(ax.labels), Write(R[0]), run=0.8)
        self.go("2:27:19.60", draw(cv, run=0.8), run=0.8)
        self.go("2:27:20.67", Write(at), run=0.5)
        self.go("2:27:22.01", Write(R[1]), FadeIn(P, scale=0.5), run=0.8)
        self.go("2:27:23.61", Write(R[2]), run=1.0)
        self.go("2:27:25.89", Write(R[3]), run=0.8)
        self.go("2:27:27.99", Write(R[4]), run=1.2)
        self.play(draw(tg, run=0.8, color=PINK), run_time=0.8)
        bx = box(R[4], YEL, buff=0.15)
        self.go("2:27:30.70", Create(bx), run=0.4)
        Lb = VGroup(R[4], bx)
        self.go("2:27:31.65", FadeOut(VGroup(*R[:4])), Lb.animate.shift(UP * 4.6), run=0.6)
        q1 = eqrow("L(1.02)", "=", r"1+5\cdot 0.02", y=0.35, x=QX, size=52)
        q1[0].set_color(PINK)
        self.go("2:27:32.20", Write(q1[0]), run=0.6)
        self.go("2:27:33.35", Write(q1[1:]), run=1.2)
        q2 = eqrow("=", "1.1", y=-0.85, x=QX, eq=0, size=52)
        q2[1].set_color(GRN)
        self.go("2:27:36.01", Write(q2), run=0.6)
        a1 = M("1.1", size=64, color=GRN).move_to(q[2], aligned_edge=LEFT)
        self.play(ReplacementTransform(q[2], a1), run_time=0.5)
        cm = eqrow(r"(1.02)^5", "=", r"1.104\ldots", y=-2.1, x=QX, size=52)
        cm[0].set_color(BLUE); cm[2].set_color(BLUE)
        self.go("2:27:37.80", Write(cm[0]), run=0.6)
        self.go("2:27:38.89", Write(cm[1:]), run=0.9)
        tk = tick_mark(GRN, s=0.6).next_to(cm, RIGHT, buff=0.4)
        self.go("2:27:41.77", Create(tk), run=0.5)
        self.go("2:27:42.50", Circumscribe(VGroup(q2[1], cm[2]), color=GRN, buff=0.1), run=0.8)


# ================================================================ 10. sin x ~ x, and why far away is worse

class K24_SmallAngle(Shot):
    def body(self):
        self.title("Sine of a Small Angle", "2:27:43.55")
        lim = M(r"\lim_{x\to 0}\frac{\sin x}{x}=1", size=46, color=DIM).move_to([3.5, 1.55, 0])
        self.go("2:27:45.71", FadeIn(lim, shift=UP * 0.1), run=0.6)
        ax = axes((-3, 3, 1), (-2, 2, 1), x_length=6.4, y_length=3.9, center=(-3.2, -1.0, 0), nums=False)
        sn = curve(ax, np.sin, (-3, 3))
        ln = curve(ax, lambda x: x, (-1.95, 1.95), color=PINK, width=4)
        P = pt(ax, 0, 0)
        self.go("2:27:47.20", Create(ax), FadeIn(ax.labels), run=0.6)
        self.go("2:27:48.09", draw(sn, run=1.0), run=1.0)
        self.go("2:27:49.83", FadeIn(P, scale=0.5), run=0.3)
        self.go("2:27:50.57", draw(ln, run=0.8, color=PINK), run=0.8)
        sl = M(r"\sin x", size=44, color=BLUE).next_to(ax.c2p(2.45, np.sin(2.45)), UR, buff=0.1)
        yl = M("y=x", size=44, color=PINK).next_to(ax.c2p(1.95, 1.95), RIGHT, buff=0.15)
        self.play(FadeIn(sl), FadeIn(yl), run_time=0.4)
        R0 = eqrow(r"\sin 0", "=", "0", y=0.45, x=3.4, size=54)
        R1 = eqrow(r"\cos 0", "=", "1", y=-0.6, x=3.4, size=54)
        R1[2].set_color(PINK)
        R2 = eqrow("L(x)", "=", "x", y=-1.7, x=3.4, size=54)
        R2[0].set_color(PINK)
        self.go("2:27:51.85", Write(R0), run=0.8)
        self.go("2:27:53.73", Write(R1), run=0.8)
        self.go("2:27:55.51", Write(R2), run=0.7)
        b2 = box(R2, YEL, buff=0.15)
        self.play(Create(b2), run_time=0.4)
        R3 = M(r"\sin x", r"\approx", "x", size=58, color=YEL)
        R3.shift(RIGHT * (3.4 - R3[1].get_x()) + UP * (-2.95 - R3[1].get_y()))
        self.go("2:27:57.99", Write(R3), run=0.8)
        near = Ellipse(width=1.6, height=1.3, color=GRN, stroke_width=3).move_to(ax.c2p(0, 0))
        self.go("2:27:59.30", Create(near), run=0.5)
        R4 = M(r"\sin 0.1", r"\approx", "0.1", size=58, color=YEL)
        R4.shift(RIGHT * (3.4 - R4[1].get_x()) + UP * (-2.95 - R4[1].get_y()))
        R4[0][3:].set_color(ORG); R4[2].set_color(ORG)
        self.go("2:28:01.70", TransformMatchingShapes(R3, R4), run=0.9)

        # slide away from a = 0: the gap opens
        self.go("2:28:04.41", FadeOut(VGroup(lim, R0, R1)), Circumscribe(near, Circle, color=GRN, buff=0.05), run=0.7)
        xt = ValueTracker(0.25)
        gap = always_redraw(lambda: VGroup(
            Line(ax.c2p(xt.get_value(), np.sin(xt.get_value())), ax.c2p(xt.get_value(), xt.get_value()), color=RED, stroke_width=5),
            pt(ax, xt.get_value(), np.sin(xt.get_value()), BLUE, r=0.07),
            pt(ax, xt.get_value(), xt.get_value(), PINK, r=0.07)))
        xl = M("x", "=", size=52).move_to([2.9, 1.45, 0])
        xn = live(xl, xt.get_value, f2, None, CHALK, 52)
        gl = M(r"\text{gap}", "=", size=52, color=RED).move_to([2.6, 0.4, 0])
        gl.shift(RIGHT * (xl[1].get_x() - gl[1].get_x()))
        gn = live(gl, lambda: xt.get_value() - np.sin(xt.get_value()), f2, None, RED, 52)
        self.go("2:28:06.60", FadeIn(gap), FadeIn(xl), FadeIn(xn), FadeIn(gl), FadeIn(gn), run=0.5)
        self.go("2:28:07.57", xt.animate.set_value(1.9), run=4.2)
        self.go("2:28:11.81", Circumscribe(VGroup(gl, gn), color=RED, buff=0.1), run=0.6)


# ================================================================ 11-12. two to try

class K24_TryA(Shot):
    def body(self):
        self.title("Try These Two", "2:28:14.70")
        dv = Line([0, 1.95, 0], [0, -3.5, 0], color=FAINT, stroke_width=2)
        ql = M(r"\sqrt{25.3}", size=62, color=YEL).move_to([-3.4, 1.4, 0])
        qr = M(r"\sqrt[3]{8.12}", size=62, color=YEL).move_to([3.4, 1.4, 0])
        self.go("2:28:15.33", Create(dv), Write(ql), run=0.8)
        self.go("2:28:18.59", Write(qr), run=0.8)
        c = -4.0
        L0 = eqrow("a", "=", "25", y=0.35, x=c, size=50)
        L0[2].set_color(ORG)
        L1 = eqrow("f(25)", "=", "5", y=-0.65, x=c, size=50)
        L2 = eqrow("f'(25)", "=", r"\frac{1}{2\sqrt{25}}", "=", r"\frac{1}{10}", y=-1.75, x=c, size=50)
        L2[0].set_color(PINK); L2[4].set_color(PINK)
        L3 = eqrow(r"\approx", r"5+\frac{1}{10}\cdot 0.3", y=-3.0, x=c, eq=0, size=50)
        self.go("2:28:21.87", Write(L0), run=0.7)
        self.go("2:28:23.89", Write(L1), run=0.8)
        self.go("2:28:25.81", Write(L2[:3]), run=1.0)
        self.go("2:28:28.23", Write(L2[3:]), run=0.6)
        self.go("2:28:30.49", Write(L3), run=1.3)
        a = M(r"\sqrt{25.3}", r"\approx", "5.03", size=62).move_to([-3.4, 1.4, 0])
        a[0].set_color(YEL); a[2].set_color(GRN)
        self.go("2:28:33.03", ReplacementTransform(ql, a[0]), FadeIn(a[1:]), run=0.6)
        self.play(Create(answer_box(a[2])), run_time=0.4)


class K24_TryB(Shot):
    def body(self):
        self.title("Try These Two", animate=False)
        dv = Line([0, 1.95, 0], [0, -3.5, 0], color=FAINT, stroke_width=2)
        qr = M(r"\sqrt[3]{8.12}", size=62, color=YEL).move_to([3.4, 1.4, 0])
        c = -4.0
        L0 = eqrow("a", "=", "25", y=0.35, x=c, size=50)
        L0[2].set_color(ORG)
        L1 = eqrow("f(25)", "=", "5", y=-0.65, x=c, size=50)
        L2 = eqrow("f'(25)", "=", r"\frac{1}{2\sqrt{25}}", "=", r"\frac{1}{10}", y=-1.75, x=c, size=50)
        L2[0].set_color(PINK); L2[4].set_color(PINK)
        L3 = eqrow(r"\approx", r"5+\frac{1}{10}\cdot 0.3", y=-3.0, x=c, eq=0, size=50)
        a = M(r"\sqrt{25.3}", r"\approx", "5.03", size=62).move_to([-3.4, 1.4, 0])
        a[0].set_color(YEL); a[2].set_color(GRN)
        self.add(dv, qr, L0, L1, L2, L3, a, answer_box(a[2]))

        c = 2.3
        self.go("2:28:35.30", VGroup(L0, L1, L2, L3).animate.set_opacity(0.3), run=0.5)
        R0 = eqrow("a", "=", "8", y=0.35, x=c, size=50)
        R0[2].set_color(ORG)
        R1 = eqrow(r"\sqrt[3]{8}", "=", "2", y=-0.65, x=c, size=50)
        R2 = eqrow("f'(x)", "=", r"\tfrac{1}{3}x^{-2/3}", y=-1.75, x=c, size=50)
        R2[0].set_color(PINK)
        R2b = eqrow("f'(8)", "=", r"\frac{1}{3\cdot 4}", "=", r"\frac{1}{12}", y=-1.75, x=c, size=50)
        R2b[0].set_color(PINK); R2b[4].set_color(PINK)
        nt = M("8^{2/3}=4", size=42, color=DIM).move_to([5.4, -0.65, 0])
        R3 = eqrow(r"\approx", r"2+\frac{1}{12}\cdot 0.12", y=-3.0, x=c, eq=0, size=50)
        R3b = eqrow(r"\approx", r"2+0.01", y=-3.0, x=c, eq=0, size=50)
        self.go("2:28:36.61", Write(R0), run=0.7)
        self.go("2:28:38.09", Write(R1), run=0.8)
        self.go("2:28:40.09", Write(R2), run=1.4)
        self.go("2:28:45.75", FadeIn(nt, shift=LEFT * 0.1), run=0.5)
        self.go("2:28:47.57", ReplacementTransform(R2, R2b), run=0.9)
        self.go("2:28:49.47", Write(R3), run=1.4)
        self.go("2:28:53.20", TransformMatchingShapes(R3, R3b), run=0.9)
        b = M(r"\sqrt[3]{8.12}", r"\approx", "2.01", size=62).move_to([3.4, 1.4, 0])
        b[0].set_color(YEL); b[2].set_color(GRN)
        self.go("2:28:56.85", ReplacementTransform(qr, b[0]), FadeIn(b[1:]), run=0.6)
        self.play(Create(answer_box(b[2])), run_time=0.4)


# ================================================================ 13. differentials

def d_f(x):
    return 0.4 + 0.1 * x * x


class K24_Differentials(Shot):
    def body(self):
        self.title("Differentials", "2:29:00.41")
        ax = axes((0, 6, 1), (0, 4, 1), x_length=6.0, y_length=4.0, center=(-3.0, -1.1, 0), nums=False)
        x0, m = 2.0, slope(d_f, 2.0)
        cv = curve(ax, d_f, (0, 5.9))
        P = pt(ax, x0, d_f(x0))
        tg = Line(ax.c2p(0.4, d_f(x0) + m * (0.4 - x0)), ax.c2p(5.4, d_f(x0) + m * (5.4 - x0)), color=PINK, stroke_width=4)
        cb = M("L(x)=f(a)+f'(a)(x-a)", size=42, color=DIM).move_to([3.5, 1.55, 0])
        self.go("2:29:00.90", Create(ax), FadeIn(ax.labels), run=0.6)
        self.play(draw(cv, run=0.8), run_time=0.8)
        self.go("2:29:02.35", FadeIn(cb, shift=UP * 0.1), run=0.4)
        self.go("2:29:03.00", FadeIn(P, scale=0.5), draw(tg, run=0.7, color=PINK), run=0.7)

        dx = ValueTracker(1.8)

        def tri():
            d = dx.get_value()
            a, b = ax.c2p(x0, d_f(x0)), ax.c2p(x0 + d, d_f(x0))
            c, e = ax.c2p(x0 + d, d_f(x0) + m * d), ax.c2p(x0 + d, d_f(x0 + d))
            g = VGroup(DashedLine(a, b, color=ORG, stroke_width=4, dash_length=0.08),
                       Line(b, c, color=PINK, stroke_width=5),
                       DashedLine(c, e, color=BLUE, stroke_width=3, dash_length=0.05) if d > 0.4 else VMobject(),
                       M("dx", size=42, color=ORG).next_to(Line(a, b), DOWN, buff=0.12),
                       M("dy", size=42, color=PINK).next_to(Line(b, c), RIGHT, buff=0.12))
            return g
        tr = always_redraw(tri)
        t0 = tri()
        self.add(t0[2])
        self.go("2:29:05.10", Create(t0[0]), run=0.7)
        self.go("2:29:06.77", Write(t0[3]), run=0.4)
        self.go("2:29:08.01", Create(t0[1]), run=0.6)
        F = M("dy", "=", "f'(x)", r"\,dx", size=66).move_to([3.5, 0.3, 0])
        F[0].set_color(PINK); F[2].set_color(PINK); F[3].set_color(ORG)
        self.go("2:29:09.51", Write(t0[4]), Write(F[0]), run=0.5)
        self.go("2:29:10.11", Write(F[1:3]), run=0.9)
        self.go("2:29:12.30", Write(F[3]), run=0.4)
        self.remove(*t0)
        self.add(tr)
        self.go("2:29:12.90", dx.animate.set_value(0.7), run=1.6)
        pl = pill("measurement errors", YEL, 42).move_to([3.5, -1.4, 0])
        self.go("2:29:15.55", FadeOut(cb), FadeIn(pl, shift=UP * 0.1), run=0.6)


# ================================================================ 14. the ball

BCn, BR = np.array([-4.2, -0.8, 0]), 2.0
BX = 1.7


class K24_Ball(Shot):
    def body(self):
        self.title("Measuring a Ball", "2:29:17.63")
        ball = Circle(radius=BR, color=CHALK, stroke_width=5, fill_color=BLUE, fill_opacity=0).move_to(BCn)
        eq = Ellipse(width=2 * BR, height=0.7, color=DIM, stroke_width=3).move_to(BCn)
        eqv = VGroup(DashedVMobject(eq.get_subcurve(0, 0.5), num_dashes=16), eq.get_subcurve(0.5, 1))
        self.go("2:29:18.20", draw(ball, run=0.8), run=0.8)
        self.play(Create(eqv), run_time=0.5)
        ang = 0.45
        e = BCn + BR * np.array([np.cos(ang), np.sin(ang), 0])
        rl = DashedLine(BCn, e, color=YEL, stroke_width=3, dash_length=0.1)
        rlab = M(r"r=10\ \text{cm}", size=44, color=YEL).move_to((BCn + e) / 2 + np.array([-np.sin(ang), np.cos(ang), 0]) * 0.35 + LEFT * 0.35)
        self.go("2:29:19.81", Create(rl), FadeIn(Dot(BCn, radius=0.05, color=YEL)), run=0.4)
        self.play(Write(rlab), run_time=0.5)
        shell = Annulus(inner_radius=BR, outer_radius=BR + 0.13, stroke_width=0, fill_color=PINK, fill_opacity=0.55).move_to(BCn)
        nt = note(r"\pm 0.1\ \text{cm}", BCn + (BR + 0.08) * np.array([np.cos(-0.75), np.sin(-0.75), 0]), DR,
                  color=PINK, size=38, math=True, dist=0.55)
        self.go("2:29:22.37", FadeIn(shell), run=0.5)
        self.go("2:29:22.79", FadeIn(nt[0]), Create(nt[1]), run=0.6)
        self.go("2:29:26.81", ball.animate.set_fill(BLUE, 0.15), run=0.6)

        R0 = eqrow("V", "=", r"\frac{4}{3}\pi r^3", y=1.35, x=BX, size=56)
        R1 = eqrow("dV", "=", r"4\pi r^2", r"\,dr", y=0.1, x=BX, size=56)
        R1[0].set_color(PINK); R1[3].set_color(PINK)
        R2 = eqrow("=", r"4\pi\cdot 100\cdot 0.1", y=-1.1, x=BX, eq=0, size=56)
        R3 = eqrow("=", r"40\pi", r"\approx", r"126\ \text{cm}^3", y=-2.3, x=BX, eq=0, size=56)
        R3[3].set_color(GRN)
        self.go("2:29:27.83", Write(R0), run=1.2)
        self.go("2:29:31.05", Write(R1[:2]), run=0.5)
        self.go("2:29:32.17", Write(R1[2]), run=0.9)
        self.go("2:29:33.55", Write(R1[3]), Circumscribe(shell, Circle, color=PINK, buff=0.05), run=0.7)
        self.go("2:29:36.15", Write(R2), run=1.6)
        self.go("2:29:39.09", Write(R3[:2]), run=0.6)
        self.go("2:29:40.43", Write(R3[2:]), run=0.9)
        self.go("2:29:42.10", Create(answer_box(R3[3])), run=0.5)


# ================================================================ 15. relative error

class K24_Relative(Shot):
    def body(self):
        self.title("Relative Error", "2:29:45.27")
        E0 = M(r"\frac{dV}{V}", "=", r"\frac{4\pi r^2\,dr}{\frac{4}{3}\pi r^3}", "=", r"3\,\frac{dr}{r}", size=62).move_to([0, 1.2, 0])
        E0[0].set_color(PINK); E0[4].set_color(YEL)
        self.go("2:29:46.53", Write(E0[0]), run=0.8)
        self.go("2:29:48.95", Write(E0[1:3]), run=1.0)
        self.go("2:29:50.15", Write(E0[3:]), run=0.8)
        self.go("2:29:51.10", Circumscribe(E0[4], color=YEL, buff=0.08), run=0.8)
        c = -1.2
        E1 = eqrow(r"\frac{dr}{r}", "=", r"\frac{0.1}{10}", "=", r"1\%", y=-0.7, x=c, size=58)
        E1[4].set_color(ORG)
        E2 = eqrow(r"\frac{dV}{V}", "=", r"3\times 1\%", "=", r"3\%", y=-2.45, x=c, size=58)
        E2[0].set_color(PINK); E2[4].set_color(GRN)
        self.go("2:29:52.87", Write(E1[:3]), run=0.8)
        self.go("2:29:53.89", Write(E1[3:]), run=0.5)
        self.go("2:29:55.13", Write(E2[:3]), run=0.8)
        self.go("2:29:56.19", Write(E2[3:]), run=0.5)
        self.play(Create(answer_box(E2[4])), run_time=0.4)
        nt = M(r"r^3", r"\ \Rightarrow\ ", r"\times 3", size=56, color=YEL).move_to([4.9, -1.6, 0])
        self.go("2:29:58.63", Write(nt), run=0.8)
        self.go("2:30:01.23", Circumscribe(nt[2], color=YEL, buff=0.1), run=0.8)
        self.go("2:30:03.61", Circumscribe(E2[4], color=GRN, buff=0.12), run=0.8)


# ================================================================ 16. chapter recap

class K24_Recap(Shot):
    def body(self):
        self.title("Chapter 8 Recap", "2:30:06.55")
        r1 = M("s(t)", r"\xrightarrow{\ d/dt\ }", "v(t)", r"\xrightarrow{\ d/dt\ }", "a(t)", size=62).move_to([0, 1.35, 0])
        r1[0].set_color(BLUE); r1[2].set_color(PINK); r1[4].set_color(PINK); r1[1].set_color(DIM); r1[3].set_color(DIM)
        labs = VGroup(*[H(w, 34, DIM).next_to(r1[i], DOWN, buff=0.18) for w, i in (("position", 0), ("velocity", 2), ("acceleration", 4))])
        self.go("2:30:07.85", Write(r1[2]), FadeIn(labs[1]), run=0.5)
        self.go("2:30:08.85", Write(r1[1]), run=0.4)
        self.go("2:30:09.55", Write(r1[0]), FadeIn(labs[0]), run=0.5)
        self.go("2:30:10.73", Write(r1[3]), run=0.4)
        self.play(Write(r1[4]), FadeIn(labs[2]), run_time=0.5)

        p1 = pill("equation", CHALK, 40)
        a1 = M(r"\to", size=56, color=DIM)
        dd = M(r"\frac{d}{dt}", size=50, color=PINK)
        dd = VGroup(dd, panel(dd, PINK, buff=0.12, width=3))
        a2 = M(r"\to", size=56, color=DIM)
        p2 = pill("plug in", GRN, 40)
        r2 = VGroup(p1, a1, dd, a2, p2).arrange(RIGHT, buff=0.35).move_to([0, -0.75, 0])
        self.go("2:30:14.19", FadeIn(p1, shift=UP * 0.1), run=0.5)
        self.go("2:30:17.35", FadeIn(a1), FadeIn(dd, shift=UP * 0.1), run=0.5)
        self.go("2:30:20.03", FadeIn(a2), FadeIn(p2, shift=UP * 0.1), run=0.5)
        self.play(Create(under(p2, YEL)), run_time=0.4)

        ax = axes((0, 4, 1), (0, 3, 1), x_length=2.6, y_length=1.5, center=(-2.0, -2.75, 0), nums=False, x_label=None, y_label=None)
        mf = lambda x: 0.4 + 1.2 * x - 0.22 * x * x
        mc = curve(ax, mf, (0.1, 3.9), width=4)
        mt = tangent(ax, mf, 1.6, length=1.8)
        mp = pt(ax, 1.6, mf(1.6), r=0.06)
        r3 = M(r"L(x)\approx f(x)", size=52).next_to(ax, RIGHT, buff=0.7)
        r3[0][:4].set_color(PINK)
        self.go("2:30:21.89", Create(ax), draw(mc, run=0.7), run=0.7)
        self.go("2:30:22.85", FadeIn(mp), Create(mt), run=0.5)
        self.go("2:30:23.81", Write(r3), run=0.8)

        # next chapter
        self.wipe("2:30:25.85", run=0.5)
        nx = pill("Next: the shape of a graph", YEL, 50).move_to([0, 0.9, 0])
        self.go("2:30:26.39", FadeIn(nx, shift=UP * 0.1), run=0.6)
        ax2 = Axes(x_range=[0, 6, 1], y_range=[-2, 2, 1], x_length=8, y_length=2.6,
                   axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, include_ticks=False)).move_to([0, -1.75, 0])
        wf = lambda x: 1.3 * np.sin(1.15 * (x - 0.6)) * np.exp(-0.05 * x)
        wv = curve(ax2, wf, (0.1, 5.8))
        self.go("2:30:27.63", Create(ax2), run=0.5)
        self.play(draw(wv, run=1.4), run_time=1.4)
        xs = [0.6 + PI / 2 / 1.15, 0.6 + 3 * PI / 2 / 1.15]
        self.go("2:30:29.60", *[FadeIn(pt(ax2, x, wf(x)), scale=0.5) for x in xs], run=0.5)
