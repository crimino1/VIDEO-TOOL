"""Builder 04: combining functions, composition (assembly line), f(g(3)) vs g(f(3)), inverse functions,
the 3 steps, x^2 has no inverse, horizontal line test, e^x and ln x."""
from common import *

# f is BLUE, g is PURP in Part 5; the inverse is PURP in Part 6


def machine(lab, color, w=1.8, h=1.4, size=80):
    """A simple chalk machine: a box with its name inside."""
    b = RoundedRectangle(width=w, height=h, corner_radius=0.15, stroke_color=color, stroke_width=5)
    return VGroup(b, M(lab, size=size, color=color).move_to(b))


def arrow(p, q, color=CHALK, w=4):
    p, q = [np.append(np.array(v, float)[:3], [0] * (3 - len(v)))[:3] for v in (p, q)]
    return Arrow(p, q, buff=0, stroke_width=w, tip_length=0.22, color=color,
                 max_stroke_width_to_length_ratio=20, max_tip_length_to_length_ratio=0.4)


def fdef(size=60):
    f = M("f(x)", "=", "x+1", size=size).move_to([-3.3, 1.75, 0])
    g = M("g(x)", "=", "x^2", size=size).move_to([3.3, 1.75, 0])
    f[0].set_color(BLUE)
    g[0].set_color(PURP)
    return f, g


def fog(size=96, inner="x"):
    """f(g(x)) with f BLUE, g PURP, the input ORG."""
    m = M("f(", "g(", inner, ")", ")", size=size)
    m[0].set_color(BLUE); m[4].set_color(BLUE)
    m[1].set_color(PURP); m[3].set_color(PURP)
    m[2].set_color(ORG)
    return m


def fg3():
    """The result line f(g(3)) = 10, left of centre."""
    main = fog(96, "3").move_to([-0.9, 0.4, 0])
    res = M("=", "10", size=96).next_to(main, RIGHT, buff=0.3)
    res[1].set_color(ORG)
    return main, res


# ================================================================ Part 5

class K04_Combine(Shot):
    def body(self):
        self.title("Combining Functions", "11:17.96")
        f = M("f", size=120, color=BLUE).move_to([-1.6, 1.0, 0])
        g = M("g", size=120, color=PURP).move_to([1.6, 1.0, 0])
        self.go("11:18.82", FadeIn(f, shift=UP * 0.15), FadeIn(g, shift=UP * 0.15), run=0.6)
        ops = []
        for k, (op, t) in enumerate([("+", "11:21.36"), ("-", "11:22.16"), (r"\times", "11:23.26"), (r"\div", "11:24.50")]):
            m = M("f", op, "g", size=80).move_to([-4.8 + 3.2 * k, -1.0, 0])
            m[0].set_color(BLUE); m[1].set_color(YEL); m[2].set_color(PURP)
            ops.append(m)
            self.go(t, FadeIn(m, shift=UP * 0.15), run=0.45)
        self.wipe("11:25.60", run=0.35)
        fx, gx = M("f(x)", "=", "x+1", size=72).move_to([-3.3, 1.2, 0]), M("g(x)", "=", "x^2", size=72).move_to([3.3, 1.2, 0])
        fx[0].set_color(BLUE); gx[0].set_color(PURP)
        self.go("11:25.92", Write(fx), run=1.0)
        self.go("11:28.18", Write(gx), run=0.9)
        res = M("(f+g)(x)", "=", "x^2", "+", "x+1", size=80).move_to([0, -1.0, 0])
        res[2].set_color(PURP); res[4].set_color(BLUE)
        self.go("11:30.20", Write(res[0:2]), run=0.7)
        self.go("11:31.28", TransformFromCopy(gx[2], res[2]), run=0.6)
        self.go("11:31.88", Write(res[3]), run=0.25)
        self.go("11:32.12", TransformFromCopy(fx[2], res[4]), run=0.6)
        tk = tick_mark().next_to(res, RIGHT, buff=0.45)
        self.go("11:33.22", Create(tk), run=0.4)
        # composition
        self.wipe("11:34.26", run=0.35)
        f2 = M("f", size=120, color=BLUE).move_to([-1.6, 0.3, 0])
        g2 = M("g", size=120, color=PURP).move_to([1.6, 0.3, 0])
        self.go("11:34.70", FadeIn(f2, shift=UP * 0.15), FadeIn(g2, shift=UP * 0.15), run=0.6)
        self.title("Composition", "11:39.34")
        comp = M("f(", "g(x)", ")", size=120).move_to([0, 0.3, 0])
        comp[0].set_color(BLUE); comp[2].set_color(BLUE); comp[1].set_color(PURP)
        self.go("11:40.76", ReplacementTransform(f2, comp[0]), ReplacementTransform(g2, comp[1]), FadeIn(comp[2]), run=0.9)
        self.go("11:41.88", Create(box(comp[1], PURP, buff=0.15)), run=0.5)


class K04_Machines(Shot):
    def body(self):
        self.title("Composition", animate=False)
        comp = M("f(", "g(x)", ")", size=120).move_to([0, 0.3, 0])
        comp[0].set_color(BLUE); comp[2].set_color(BLUE); comp[1].set_color(PURP)
        self.add(comp, box(comp[1], PURP, buff=0.15))
        self.wipe("11:43.42", run=0.4)
        # the assembly line
        yb = 0.15
        belt = VGroup(Line([-6.6, yb, 0], [6.6, yb, 0], color=CHALK, stroke_width=4),
                      Line([-6.6, yb - 0.3, 0], [6.6, yb - 0.3, 0], color=CHALK, stroke_width=4))
        for x in np.arange(-6.2, 6.4, 0.8):
            belt.add(Circle(radius=0.11, color=DIM, stroke_width=3).move_to([x, yb - 0.15, 0]))
        self.go("11:44.28", Create(belt), run=0.9)
        gm = machine("g", PURP).move_to([-2.6, yb + 0.7, 0])
        fm = machine("f", BLUE).move_to([2.6, yb + 0.7, 0])
        ty = yb + 0.32
        self.go("11:46.46", Create(gm[0]), Write(gm[1]), run=0.7)
        tok = M("x", size=60, color=ORG).move_to([-5.9, ty, 0])
        self.go("11:47.60", FadeIn(tok, shift=RIGHT * 0.3), run=0.35)
        self.play(tok.animate.move_to([-3.85, ty, 0]), run_time=0.55)
        self.play(FadeOut(tok, shift=RIGHT * 0.4), run_time=0.3)
        gx = M("g(", "x", ")", size=56)
        gx[0].set_color(PURP); gx[2].set_color(PURP); gx[1].set_color(ORG)
        gx.move_to([-1.7 + 0.2 + gx.width / 2, ty + 0.05, 0])
        self.go("11:48.80", FadeIn(gx, shift=RIGHT * 0.3), run=0.4)
        self.go("11:49.38", Create(fm[0]), Write(fm[1]), run=0.6)
        self.go("11:50.10", gx.animate.move_to([1.7 - 0.2 - gx.width / 2, ty + 0.05, 0]), run=0.9)
        self.play(FadeOut(gx, shift=RIGHT * 0.4), run_time=0.3)
        out = fog(52).move_to([0, ty + 0.05, 0])
        out.set_x(3.5 + 0.3 + out.width / 2)
        self.go("11:51.70", FadeIn(out, shift=RIGHT * 0.3), run=0.45)
        # the notation
        n = fog(96).move_to([0, -2.0, 0])
        self.go("11:53.60", Write(n), run=1.0)
        first = H("1st", 44, YEL).next_to(gm, UP, buff=0.25)
        inner = box(VGroup(n[1], n[2], n[3]), PURP, buff=0.12)
        self.go("11:55.64", Create(inner), FadeIn(first, shift=DOWN * 0.1), run=0.5)
        second = H("2nd", 44, YEL).next_to(fm, UP, buff=0.25)
        outer = box(n, BLUE, buff=0.28)
        self.go("11:58.44", Create(outer), FadeIn(second, shift=DOWN * 0.1), run=0.5)
        io = H("inside out", 46, YEL).next_to(outer, DOWN, buff=0.2)
        self.go("12:01.58", Write(io), Indicate(inner, color=PURP, scale_factor=1.06), run=0.8)
        self.wipe("12:03.55", run=0.4)


class K04_FofG(Shot):
    def body(self):
        self.title("Composition", animate=False)
        self.title("Worked Example", "12:04.08")
        fx, gx = fdef()
        self.go("12:05.32", Write(fx), run=0.9)
        self.go("12:07.80", Write(gx), run=0.9)
        main, res = fg3()
        self.go("12:10.48", Write(main), run=0.8)
        ib = box(VGroup(main[1], main[2], main[3]), PURP, buff=0.12)
        self.go("12:12.48", Create(ib), run=0.5)
        l1 = M("g(3)", "=", "3^2", "=", "9", size=72).move_to([0, -1.0, 0])
        l1[0].set_color(PURP); l1[4].set_color(ORG)
        self.go("12:14.10", Write(l1[0]), run=0.5)
        self.go("12:15.12", Write(l1[1:3]), run=0.5)
        self.go("12:16.22", Write(l1[3:5]), run=0.4)
        l2 = M("f(", "9", ")", "=", "9+1", "=", "10", size=72).move_to([0, -2.3, 0])
        l2[0].set_color(BLUE); l2[2].set_color(BLUE); l2[1].set_color(ORG); l2[6].set_color(ORG)
        self.go("12:17.40", TransformFromCopy(l1[4], l2[1]), Write(l2[0]), Write(l2[2]), run=0.7)
        self.go("12:19.34", Write(l2[3:5]), run=0.6)
        self.go("12:20.20", Write(l2[5:7]), run=0.4)
        self.go("12:21.30", FadeOut(ib), Write(res), run=0.6)
        self.go("12:22.66", FadeOut(l1), FadeOut(l2), run=0.4)


class K04_GofF(Shot):
    def body(self):
        self.title("Worked Example", animate=False)
        fx, gx = fdef()
        main, res = fg3()
        self.add(fx, gx, main, res)
        rec = VGroup(main, res)
        self.go("12:23.78", rec.animate.scale(0.6).move_to([-4.2, -3.2, 0]), run=0.6)
        m2 = M("g(", "f(", "3", ")", ")", size=96).move_to([-0.9, 0.4, 0])
        m2[0].set_color(PURP); m2[4].set_color(PURP); m2[1].set_color(BLUE); m2[3].set_color(BLUE); m2[2].set_color(ORG)
        self.go("12:24.96", Write(m2), run=0.8)
        ib = box(VGroup(m2[1], m2[2], m2[3]), BLUE, buff=0.12)
        self.go("12:26.70", Create(ib), run=0.5)
        l1 = M("f(3)", "=", "3+1", "=", "4", size=72).move_to([0, -1.0, 0])
        l1[0].set_color(BLUE); l1[4].set_color(ORG)
        self.go("12:28.04", Write(l1[0]), run=0.4)
        self.go("12:29.00", Write(l1[1:3]), run=0.5)
        self.go("12:29.80", Write(l1[3:5]), run=0.4)
        l2 = M("g(", "4", ")", "=", "4^2", "=", "16", size=72).move_to([0, -2.1, 0])
        l2[0].set_color(PURP); l2[2].set_color(PURP); l2[1].set_color(ORG); l2[6].set_color(ORG)
        self.go("12:30.86", TransformFromCopy(l1[4], l2[1]), Write(l2[0]), Write(l2[2]), run=0.7)
        self.go("12:32.38", Write(l2[3:5]), run=0.6)
        self.go("12:33.10", Write(l2[5:7]), run=0.4)
        r2 = M("=", "16", size=96).next_to(m2, RIGHT, buff=0.3)
        r2[1].set_color(ORG)
        self.go("12:33.70", FadeOut(ib), Write(r2), run=0.5)
        # 10 and 16 side by side
        rec2 = VGroup(m2, r2)
        self.go("12:34.52", FadeOut(l1), FadeOut(l2),
                rec.animate.scale(1 / 0.6 * 0.8).move_to([-3.4, -0.2, 0]),
                rec2.animate.scale(0.8).move_to([3.4, -0.2, 0]), run=0.8)
        ne = M(r"\neq", size=110, color=RED).move_to([0, -0.2, 0])
        self.go("12:36.28", Write(ne), run=0.5)
        om = pill("Order matters!", YEL, size=48).move_to([0, -2.0, 0])
        self.go("12:37.74", FadeIn(om, shift=UP * 0.15), run=0.5)
        # socks and shoes
        self.wipe("12:38.95", run=0.3)
        self.title("Order Matters", "12:39.25")
        r1 = H("socks, then shoes", 60).move_to([-0.7, 0.8, 0])
        r2b = H("shoes, then socks", 60).move_to([-0.7, -1.0, 0])
        self.go("12:39.75", FadeIn(r1, shift=UP * 0.15), run=0.5)
        t1 = tick_mark(s=0.6).next_to(r1, RIGHT, buff=0.6)
        self.go("12:40.40", Create(t1), run=0.4)
        self.go("12:42.12", FadeIn(r2b, shift=UP * 0.15), run=0.5)
        c1 = cross_mark(s=0.3).next_to(r2b, RIGHT, buff=0.6).set_x(t1.get_x())
        self.go("12:43.74", Create(c1), run=0.4)
        # remember composition
        self.wipe("12:44.70", run=0.35)
        self.title("Composition", "12:45.05")
        comp = fog(120).move_to([0, 0.4, 0])
        self.go("12:45.60", Write(comp), run=0.9)
        ul = brush_line(comp.width + 0.6, center=comp.get_bottom() + DOWN * 0.3)
        self.go("12:48.46", Create(ul), run=0.7)
        ep = pill("Episode 6: Chain Rule", PINK, size=46).move_to([0, -1.9, 0])
        self.go("12:51.26", FadeIn(ep, shift=UP * 0.15), run=0.6)


# ================================================================ Part 6

class K04_Undo(Shot):
    def body(self):
        self.title("Inverse Functions", "12:57.00")
        fm = machine("f", BLUE, w=2.0, h=1.3).move_to([0, 1.0, 0])
        im = machine(r"f^{-1}", PURP, w=2.0, h=1.3, size=70).move_to([0, -1.4, 0])
        self.go("12:58.74", Create(fm[0]), Write(fm[1]), run=0.7)
        self.go("13:01.62", Create(im[0]), Write(im[1]), run=0.7)
        a1, a2 = arrow([-3.0, 1.0], [-1.05, 1.0]), arrow([1.05, 1.0], [3.0, 1.0])
        b1, b2 = arrow([3.0, -1.4], [1.05, -1.4], PURP), arrow([-1.05, -1.4], [-3.0, -1.4], PURP)
        n3 = M("3", size=80, color=ORG).move_to([-3.6, 1.0, 0])
        n11 = M("11", size=80, color=ORG).move_to([3.75, 1.0, 0])
        m11 = n11.copy().move_to([3.75, -1.4, 0])
        m3 = n3.copy().move_to([-3.6, -1.4, 0])
        self.go("13:05.66", FadeIn(n3, shift=RIGHT * 0.2), Create(a1), run=0.5)
        self.go("13:06.40", Create(a2), FadeIn(n11, shift=RIGHT * 0.2), run=0.5)
        self.go("13:08.40", TransformFromCopy(n11, m11), Create(b1), run=0.7)
        self.go("13:09.66", Create(b2), FadeIn(m3, shift=LEFT * 0.2), run=0.6)
        # the notation
        self.wipe("13:11.44", run=0.35)
        nt = M("f", "^{-1}", "(x)", size=130, color=PURP).move_to([0, 0.9, 0])
        self.go("13:12.14", Write(nt), run=0.8)
        ring = Circle(color=YEL, stroke_width=4).surround(nt[1], buffer_factor=1.25)
        self.go("13:13.86", Create(ring), run=0.5)
        wl = M(r"f^{-1}(x)", r"\neq", r"\frac{1}{f(x)}", size=80).move_to([0, -1.4, 0])
        wl[0].set_color(PURP); wl[1].set_color(RED)
        self.go("13:16.66", Write(wl[0]), run=0.5)
        self.go("13:17.46", Write(wl[1]), run=0.4)
        self.go("13:18.16", Write(wl[2]), run=0.6)
        un = pill("it means: undo f", GRN, size=44).move_to([0, -3.15, 0])
        self.go("13:19.74", FadeIn(un, shift=UP * 0.15), run=0.5)


EQX = 0.6


def on_eq(m, y, i=1):
    m.shift(np.array([EQX, y, 0]) - m[i].get_center())
    return m


class K04_Steps(Shot):
    def body(self):
        self.title("Inverse Functions", animate=False)
        self.title("Finding the Inverse", "13:21.94")
        labs = VGroup(*[H(f"Step {k}", 52, DIM) for k in (1, 2, 3)])
        txts = [TX(r"Write $y$ instead of $f(x)$", 58), TX(r"Swap $x$ and $y$", 58), TX(r"Solve for $y$", 58)]
        for k, (lab, tx) in enumerate(zip(labs, txts)):
            y = 1.1 - 1.3 * k
            lab.move_to([-5.0, y, 0], aligned_edge=LEFT)
            tx.move_to([-2.4, y, 0], aligned_edge=LEFT)
        self.go("13:23.42", LaggedStart(*[FadeIn(l, shift=UP * 0.1) for l in labs], lag_ratio=0.25), run=0.8)
        for lab, tx, tl, tt, rt in zip(labs, txts, ("13:24.88", "13:28.62", "13:31.36"), ("13:26.08", "13:29.90", "13:32.64"), (0.9, 0.7, 0.6)):
            self.go(tl, lab.animate.set_color(YEL), run=0.3)
            self.go(tt, Write(tx), run=rt)
        # worked example
        self.wipe("13:34.02", run=0.35)
        f0 = M("f(x)", "=", "2x+3", size=64)
        f0[0].set_color(BLUE)
        on_eq(f0, 1.75)
        self.go("13:34.96", Write(f0), run=0.9)
        S = [H(f"Step {k}", 46, YEL) for k in (1, 2, 3)]
        L1 = on_eq(M("y", "=", "2", "x", "+3", size=64), 0.7)
        L2 = on_eq(M("x", "=", "2", "y", "+3", size=64), -0.35)
        L2[0].set_color(YEL); L2[3].set_color(YEL)
        L3 = on_eq(M("x-3", "=", "2y", size=64), -1.4)
        L4 = on_eq(M("y", "=", r"\frac{x-3}{2}", size=64), -2.75)
        for s, L in zip(S, (L1, L2, L3)):
            s.move_to([-5.3, L[1].get_y(), 0], aligned_edge=LEFT)
        self.go("13:37.82", FadeIn(S[0], shift=RIGHT * 0.15), run=0.4)
        self.go("13:39.28", Write(L1), run=0.9)
        self.go("13:41.84", FadeIn(S[1], shift=RIGHT * 0.15), run=0.4)
        self.go("13:43.30", TransformFromCopy(L1[0], L2[3], path_arc=-PI / 2), TransformFromCopy(L1[3], L2[0], path_arc=-PI / 2),
                TransformFromCopy(L1[1], L2[1]), TransformFromCopy(L1[2], L2[2]), TransformFromCopy(L1[4], L2[4]), run=1.1)
        self.go("13:46.80", FadeIn(S[2], shift=RIGHT * 0.15), run=0.4)
        n1 = M("-3", size=52, color=ORG).next_to(L2, RIGHT, buff=0.7)
        self.go("13:49.54", FadeIn(n1, shift=LEFT * 0.15), run=0.4)
        self.go("13:51.00", Write(L3), run=0.9)
        n2 = M(r"\div 2", size=52, color=ORG).next_to(L3, RIGHT, buff=0.7).set_x(n1.get_x())
        self.go("13:53.32", FadeIn(n2, shift=LEFT * 0.15), run=0.4)
        self.go("13:54.64", Write(L4), run=1.0)
        fi = M(r"f^{-1}(x)", size=64, color=PURP).next_to(L4[1], LEFT, buff=0.2)
        fin = VGroup(fi, L4[1], L4[2])
        self.go("13:57.06", ReplacementTransform(L4[0], fi), Create(box(fin, YEL, buff=0.18)), run=0.7)


class K04_Check(Shot):
    def body(self):
        self.title("Finding the Inverse", animate=False)
        self.wipe("13:58.02", run=0.35)
        self.title("Check It", "13:58.48")
        c1 = M("f(4)", "=", r"2\cdot 4+3", "=", "11", size=72).move_to([0, 1.0, 0])
        c1[0].set_color(BLUE); c1[4].set_color(ORG)
        self.go("13:59.30", Write(c1[0]), run=0.5)
        self.go("14:00.20", Write(c1[1:3]), run=0.9)
        self.go("14:01.95", Write(c1[3:5]), run=0.4)
        c2 = M(r"f^{-1}(11)", "=", r"\frac{11-3}{2}", "=", r"\frac{8}{2}", "=", "4", size=72).move_to([0, -0.9, 0])
        c2[0].set_color(PURP); c2[6].set_color(ORG)
        self.go("14:03.58", Write(c2[0]), run=0.6)
        self.go("14:05.32", Write(c2[1:3]), run=0.8)
        self.go("14:06.30", Write(c2[3:5]), run=0.5)
        self.go("14:08.20", Write(c2[5:7]), run=0.4)
        self.go("14:09.50", Create(box(c1[0][2], YEL, buff=0.1)), Create(box(c2[6], YEL, buff=0.12)), run=0.5)
        ok = VGroup(tick_mark(s=0.55), H("undo works", 52, GRN)).arrange(RIGHT, buff=0.35).move_to([0, -2.8, 0])
        self.go("14:11.00", Create(ok[0]), FadeIn(ok[1], shift=UP * 0.1), run=0.5)
        self.wipe("14:12.30", run=0.35)


class K04_Square(Shot):
    def body(self):
        self.title("Check It", animate=False)
        self.title("No Undo Button?", "14:13.06")
        sq = M("f(x)", "=", "x^2", size=72).move_to([0, 1.9, 0])
        sq[0].set_color(BLUE)
        self.go("14:15.46", Write(sq), run=0.7)
        a2 = M("2", size=80, color=ORG).move_to([-3.4, 0.4, 0])
        m2 = M("-2", size=80, color=ORG).move_to([-3.4, -1.8, 0])
        o4 = M("4", size=80, color=ORG).move_to([3.0, -0.7, 0])
        self.go("14:17.08", FadeIn(a2, shift=RIGHT * 0.15), run=0.4)
        self.go("14:18.18", FadeIn(m2, shift=RIGHT * 0.15), run=0.4)
        f1 = arrow(a2.get_right() + [0.3, -0.1, 0], o4.get_left() + [-0.3, 0.12, 0], BLUE)
        f2 = arrow(m2.get_right() + [0.3, 0.1, 0], o4.get_left() + [-0.3, -0.12, 0], BLUE)
        self.go("14:18.70", Create(f1), Create(f2), FadeIn(o4, shift=RIGHT * 0.15), run=0.7)
        self.go("14:20.48", Create(box(o4, YEL, buff=0.18)), run=0.4)
        inv = M(r"f^{-1}", size=64, color=PURP).next_to(o4, RIGHT, buff=0.55)
        self.go("14:22.32", FadeIn(inv, shift=LEFT * 0.15), run=0.4)
        b1 = CurvedArrow(o4.get_top() + UP * 0.25, a2.get_top() + UP * 0.2, angle=PI / 5, color=PURP, stroke_width=4, tip_length=0.22)
        b2 = CurvedArrow(o4.get_bottom() + DOWN * 0.25, m2.get_bottom() + DOWN * 0.2, angle=-PI / 5, color=PURP, stroke_width=4, tip_length=0.22)
        self.go("14:24.10", Create(b1), run=0.5)
        self.go("14:24.70", Create(b2), run=0.5)
        q = M("?", size=110, color=RED).next_to(inv, RIGHT, buff=0.3)
        self.go("14:25.40", Write(q), run=0.5)
        self.go("14:27.40", Indicate(q, color=RED, scale_factor=1.15), run=0.8)
        self.wipe("14:28.90", run=0.35)


def lt_board():
    ax = Axes(x_range=[-3, 3, 1], y_range=[-1, 5, 1], x_length=6.6, y_length=5.4,
              axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, include_numbers=False))
    ax.shift(np.array([-1.4, -2.5, 0]) - ax.c2p(0, 0))
    labs = VGroup()
    for k in (-2, -1, 1, 2):
        labs.add(M(str(k), size=32, color=DIM).next_to(ax.c2p(k, 0), DOWN, buff=0.15))
    for k in (1, 2, 3):
        labs.add(M(str(k), size=32, color=DIM).next_to(ax.c2p(0, k), LEFT, buff=0.15))
    labs.add(M("x", size=40, color=DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15))
    labs.add(M("y", size=40, color=DIM).next_to(ax.y_axis.get_end(), RIGHT, buff=0.15))
    curve = ax.plot(lambda x: x * x, x_range=[-2.2, 2.2], color=BLUE, stroke_width=6)
    clab = M("y=x^2", size=48, color=BLUE).next_to(ax.c2p(2.2, 4.84), RIGHT, buff=0.15)
    return ax, labs, curve, clab


def hline(ax, y, color=CHALK):
    return Line(ax.c2p(-3.1, y), ax.c2p(3.1, y), color=color, stroke_width=5)


def lt_end(ax):
    red = hline(ax, 4, RED)
    dots = VGroup(*[Dot(ax.c2p(s, 4), radius=0.1, color=RED) for s in (-2, 2)])
    no = VGroup(cross_mark(s=0.32), H("no inverse", 52, RED)).arrange(DOWN, buff=0.35).move_to([4.6, 0.3, 0])
    return red, dots, no


class K04_LineTest(Shot):
    def body(self):
        self.title("No Undo Button?", animate=False)
        ax, labs, curve, clab = lt_board()
        self.go("14:29.40", Create(ax), FadeIn(labs), run=0.7)
        self.title("Horizontal Line Test", "14:30.14")
        self.go("14:30.70", Create(curve), FadeIn(clab), run=0.9)
        yv = ValueTracker(-0.6)

        def moving():
            y = yv.get_value()
            g = VGroup(hline(ax, y))
            if y > 0.05:
                g.add(*[Dot(ax.c2p(s * np.sqrt(y), y), radius=0.09, color=YEL) for s in (-1, 1)])
            return g
        mv = always_redraw(moving)
        self.go("14:32.02", FadeIn(mv), run=0.35)
        self.play(yv.animate.set_value(4), run_time=2.5)
        mv.clear_updaters()
        red, dots, no = lt_end(ax)
        self.go("14:36.34", FadeOut(mv), FadeIn(red), FadeIn(dots, scale=1.5), run=0.5)
        self.go("14:38.78", Create(no[0]), Write(no[1]), run=0.6)


class K04_ExpLn(Shot):
    def body(self):
        self.title("Horizontal Line Test", animate=False)
        ax, labs, curve, clab = lt_board()
        self.add(ax, labs, curve, clab, *lt_end(ax))
        self.wipe("14:40.22", run=0.35)
        self.title("A Beautiful Connection", "14:40.62")
        ax = Axes(x_range=[-3, 5, 1], y_range=[-3, 5, 1], x_length=5.6, y_length=5.6,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, include_numbers=False))
        ax.shift(np.array([-3.6, -1.6, 0]) - ax.c2p(0, 0))
        al = VGroup(M("x", size=40, color=DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15),
                    M("y", size=40, color=DIM).next_to(ax.y_axis.get_end(), RIGHT, buff=0.15))
        self.go("14:42.28", Create(ax), FadeIn(al), run=0.7)
        ex = ax.plot(np.exp, x_range=[-3, np.log(4.9)], color=BLUE, stroke_width=6)
        exl = M("e^x", size=56, color=BLUE).next_to(ax.c2p(-0.3, 3.6), LEFT, buff=0.2)
        self.go("14:45.40", Create(ex), FadeIn(exl), run=0.8)
        ln = ax.plot(np.log, x_range=[np.exp(-3), 4.9], color=PURP, stroke_width=6)
        lnl = M(r"\ln x", size=56, color=PURP).next_to(ax.c2p(4.5, 1.5), DOWN, buff=0.3)
        self.go("14:46.34", Create(ln), FadeIn(lnl), run=0.8)
        yx = DashedLine(ax.c2p(-2.8, -2.8), ax.c2p(4.8, 4.8), color=DIM, stroke_width=3, dash_length=0.12)
        yxl = M("y=x", size=40, color=DIM).next_to(ax.c2p(4.8, 4.8), RIGHT, buff=0.1)
        self.go("14:47.32", Create(yx), FadeIn(yxl), run=0.6)
        p, q = ax.c2p(1, np.e), ax.c2p(np.e, 1)
        mir = VGroup(DashedLine(p, q, color=ORG, stroke_width=3, dash_length=0.08), Dot(p, radius=0.08, color=ORG), Dot(q, radius=0.08, color=ORG))
        self.go("14:48.00", FadeIn(mir), run=0.5)
        eq = M(r"\ln", "(", "e^5", ")", "=", "5", size=84).move_to([3.9, 0.3, 0])
        eq[0].set_color(PURP); eq[2].set_color(BLUE); eq[5].set_color(ORG)
        self.go("14:49.30", Write(eq[0:4]), run=0.9)
        self.go("14:50.74", Write(eq[4:6]), run=0.5)
        self.go("14:51.30", Create(box(eq, YEL, buff=0.22)), run=0.5)
