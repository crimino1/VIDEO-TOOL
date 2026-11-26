"""Builder 17: middle of Chapter 6, the chain rule.
The x^3 tan x answer; functions inside functions; three meshing chalk gears turned by one ValueTracker
(A : B : C = 1 : 3 : 6 turns, as the voice says: B turns 3 times per A, C twice per B); the rule f'(g(x)) g'(x)
in words and in Leibniz notation; (3x+1)^5 slowly; the forgotten inside derivative (checked by expanding);
sqrt(x^2+4), sin(x^2), e^(5x), e^(x^2), cos 3x, ln(x^2+1), ln u shortcut, sin^2 x, 1/(2x+1)^3.
Colours: INSIDE = ORG, OUTSIDE (and its derivative) = BLUE, inside derivative / rates = PINK, answers boxed GRN.
(Chapter 1 drew the inside in PURP; this chapter uses ORG as the brief asks.)"""
from common import *

D = r"\frac{d}{dx}"
XL = -6.3                          # left edge of the algebra column
RY = [1.55, 0.1, -1.35, -2.8]      # algebra rows
CX = 1.2                           # left edge of the inside / outside chips (right column)
BG = config.background_color


# ---------------------------------------------------------------- local helpers

def col(m, cs):
    for k, c in cs.items():
        m[k].set_color(c)
    return m


def space_eq(m, parts, gap=0.1):
    """Open a little room after each '=' so a GRN answer box never touches it."""
    off = 0.0
    for i in range(1, len(parts)):
        if parts[i - 1] == "=":
            off += gap
        m[i].shift(RIGHT * off)
    return m


def row(parts, cs, r, size=62, indent=0.55):
    """An algebra row: M(*parts) coloured by {part: colour}, left-aligned in the left column at row r."""
    m = space_eq(col(M(*parts, size=size), cs), parts)
    m.shift(RIGHT * (XL + indent - m.get_left()[0]) + UP * (RY[r] - m.get_y()))
    return m


def prob(parts, cs, size=66):
    return row(parts, cs, 0, size, indent=0)


def chip(label, tex, color, y, size=58):
    """'inside' / 'outside' label over a coloured piece in the right column."""
    m = M(tex, size=size, color=color)
    m.move_to([CX + m.width / 2, y, 0])
    lab = H(label, 36, color).next_to(m, UP, buff=0.16).align_to(m, LEFT)
    return lab, m


def d_arrow(m, tex, color, size=58):
    """Little arrow with a PINK d on it, from a chip to its derivative."""
    y = m.get_y()
    x0 = max(m.get_right()[0] + 0.25, CX + 1.7)   # clear of the 'inside' / 'outside' label above
    ar = Arrow([x0, y, 0], [x0 + 0.95, y, 0], buff=0, color=DIM, stroke_width=4, tip_length=0.2,
               max_tip_length_to_length_ratio=0.3)
    d = M("d", size=34, color=PINK).next_to(ar, UP, buff=0.05)
    r = M(tex, size=size, color=color)
    r.move_to([x0 + 1.2 + r.width / 2, y, 0])
    return VGroup(ar, d), r


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


def frac_split(part):
    """(numerator, bar, denominator) glyphs of a \\frac part, found by position."""
    gs = list(part)
    bar = max(gs, key=lambda g: g.width - 5 * g.height)
    num = VGroup(*[g for g in gs if g is not bar and g.get_y() > bar.get_y()])
    den = VGroup(*[g for g in gs if g is not bar and g.get_y() < bar.get_y()])
    return num, bar, den


def done(self, run=0.4):
    """End-of-shot wipe that hands a clean board to the next shot."""
    self.wipe(self.END - run - 0.08, run=run)


def inside_outside(self, P, ins_parts, out_parts, ins_tex, out_tex, t_in, t_out, y_in=1.75, y_out=-0.2):
    """Colour the inside ORG / outside BLUE in the problem and copy each into a chip, on its word."""
    li, mi = chip("inside", ins_tex, ORG, y_in)
    lo, mo = chip("outside", out_tex, BLUE, y_out)
    self.go(t_in, *[P[k].animate.set_color(ORG) for k in ins_parts], FadeIn(li, shift=DOWN * 0.1), run=0.4)
    self.play(TransformFromCopy(VGroup(*[P[k] for k in ins_parts]), mi), run_time=0.6)
    self.go(t_out, *[P[k].animate.set_color(BLUE) for k in out_parts], FadeIn(lo, shift=DOWN * 0.1), run=0.4)
    self.play(TransformFromCopy(VGroup(*[P[k] for k in out_parts]), mo), run_time=0.6)
    return mi, mo


# ================================================================ the x^3 tan x answer

class K17_TryAnswer(Shot):
    def body(self):
        # builder 16's last frame: the practice problem and its pill
        self.title("Your Turn", animate=False)
        q = M(D + r"\Big(", "x^3", r"\tan x", r"\Big)", size=84).move_to([0, 0.3, 0])
        q[1].set_color(BLUE); q[2].set_color(ORG)
        pl = pill("pause and try", YEL).move_to([0, -1.7, 0])
        self.add(q, pl)
        self.play(FadeOut(pl), q.animate.scale(72 / 84).move_to([0, 1.2, 0]), run_time=0.5)
        self.title("Product Rule")
        a = M("=", "3x^2", r"\tan x", "+", "x^3", r"\sec^2 x", size=72)
        col(a, {1: PINK, 2: ORG, 4: BLUE, 5: PINK})
        a[1:].shift(RIGHT * 0.1)
        a.next_to(q, DOWN, buff=0.5).align_to(q, LEFT).shift(LEFT * 0.6)
        self.go(6117.91, Write(a[0]), Write(a[1]), run=0.6)
        self.go(6119.29, Write(a[2]), run=0.5)
        self.go(6120.23, Write(a[3]), run=0.3)
        self.go(6120.75, Write(a[4]), run=0.4)
        self.go(6121.45, Write(a[5]), run=0.6)
        self.go(6122.1, Create(answer_box(a[1:])), run=0.5)
        done(self)


# ================================================================ functions inside functions

class K17_Inside(Shot):
    def body(self):
        self.title("Product Rule", animate=False)
        self.title("The Chain Rule", 6124.6)
        xs = [-4.2, 0, 4.2]
        easy = [M(s, size=72) for s in ("x^n", "e^x", r"\sin x")]
        for m, x in zip(easy, xs):
            m.move_to([x, 1.3, 0])
        tag = H("simple", 36, DIM).move_to([0, 2.15, 0])
        self.go(6129.6, Write(easy[0]), FadeIn(tag), run=0.6)
        self.go(6131.13, Write(easy[1]), run=0.5)
        self.go(6132.31, Write(easy[2]), run=0.5)

        hard = [M(r"\sin", "(", "x^2", ")", size=72), M("(", "3x+1", ")", "^5", size=72), M("e^{", "5x", "}", size=72)]
        for m, x in zip(hard, xs):
            m.move_to([x, -0.45, 0])
        ins = [hard[0][2], hard[1][1], hard[2][1]]
        outs = [VGroup(hard[0][0], hard[0][1], hard[0][3]), VGroup(hard[1][0], hard[1][2], hard[1][3]), hard[2][0]]
        self.go(6134.4, VGroup(*easy, tag).animate.set_opacity(0.35), run=0.5)
        self.go(6135.33, Write(hard[0]), run=0.7)
        self.go(6137.29, Write(hard[1]), run=0.8)
        self.go(6140.09, Write(hard[2]), run=0.7)
        self.go(6142.6, *[o.animate.set_color(BLUE) for o in outs], run=0.4)
        self.go(6142.97, *[i.animate.set_color(ORG) for i in ins], run=0.4)
        self.play(*[Create(under(i, ORG, 0.08)) for i in ins], run_time=0.5)

        comp = M("f", "(", "g(x)", ")", size=80)
        col(comp, {0: BLUE, 1: BLUE, 3: BLUE, 2: ORG}).move_to([-1.6, -2.45, 0])
        ch1 = H("from Chapter 1", 38, DIM).next_to(comp, RIGHT, buff=0.8)
        self.go(6144.47, FadeOut(VGroup(*easy, tag)), Write(comp), run=0.8)
        self.go(6147.25, FadeIn(ch1, shift=LEFT * 0.1), run=0.5)
        self.go(6149.35, Create(brush_line(comp.width + 0.4, PINK, comp.get_bottom() + DOWN * 0.15)), run=0.6)
        done(self)


# ================================================================ three gears

GA, GB, GC = np.array([-4.35, -0.05, 0]), None, None
RA, NA = 2.1, 48
MOD = 2 * RA / NA          # one tooth size for all three, so they mesh
RB, RC = RA / 3, RA / 6
GB = GA + RIGHT * (RA + RB)
GC = GB + RIGHT * (RB + RC)


def gear(r, n, off, center):
    """Chalk gear: n trapezoid teeth (widths in board units so small gears keep a sane tooth), hub, axle,
    and one YEL marker spoke so you can count turns."""
    ro, rr = r + MOD, r - 1.25 * MOD
    cp = PI * MOD
    pts = []
    for k in range(n):
        a = off + k * TAU / n
        for rad, w in ((rr, -0.30 * cp), (ro, -0.16 * cp), (ro, 0.16 * cp), (rr, 0.30 * cp)):
            b = a + w / rad
            pts.append([rad * np.cos(b), rad * np.sin(b), 0])
    body = Polygon(*pts, color=CHALK, stroke_width=4)
    hub = Circle(radius=max(0.09, r * 0.17), color=CHALK, stroke_width=4)
    axle = Dot(radius=0.045, color=DIM)
    spoke = Line(UP * hub.radius, UP * (rr - 0.06), color=YEL, stroke_width=6)
    g = VGroup(body, hub, axle, spoke).shift(center)
    if r > 1:
        g.add(Circle(radius=rr - 0.35, color=FAINT, stroke_width=3).move_to(center))
    return g


def spin(g, center, fn):
    g.ang = 0.0

    def upd(m):
        a = fn()
        m.rotate(a - m.ang, about_point=center)
        m.ang = a
    g.add_updater(upd)


class K17_Gears(Shot):
    def body(self):
        self.title("The Chain Rule", animate=False)
        self.title("Three Gears", 6152.6)
        A = gear(RA, NA, 0.0, GA)
        B = gear(RB, NA // 3, PI / (NA // 3), GB)      # half a tooth turned: gap meets A's tooth
        C = gear(RC, NA // 6, 0.0, GC)
        th = ValueTracker(0)
        self.go(6153.5, draw(A[0], run=1.2), FadeIn(A[1:]), run=1.2)
        self.play(Create(B), Create(C), run_time=0.7)
        for g, c, k in ((A, GA, -1), (B, GB, 3), (C, GC, -6)):
            spin(g, c, lambda k=k: k * th.get_value())
        self.add(th)

        la = H("A", 48).move_to(GA + DOWN * (RA + 0.55))
        lb = H("B", 48).move_to(GB + DOWN * (RB + 0.5))
        lc = H("C", 48).move_to(GC + DOWN * (RC + 0.5) + RIGHT * 0.15)
        self.go(6156.23, FadeIn(la, shift=UP * 0.1), run=0.4)
        self.go(6157.41, FadeIn(lb, shift=UP * 0.1), run=0.4)
        self.go(6159.43, FadeIn(lc, shift=UP * 0.1), run=0.4)

        # live turn counters on the right
        base = [0.0]
        rates = (1, 3, 6)
        names = VGroup(*[H(f"{n} turns", 42) for n in "ABC"])
        for i, n in enumerate(names):
            n.move_to([2.6, 1.55 - i * 1.0, 0], aligned_edge=RIGHT)
            n.shift(RIGHT * (3.3 - n.get_right()[0]))
        nums = [always_redraw(lambda i=i: M(f"{rates[i] * (th.get_value() - base[0]) / TAU + 0:.1f}", size=54, color=PINK)
                              .move_to([4.15, names[i].get_y(), 0], aligned_edge=LEFT)) for i in range(3)]
        self.go(6160.4, FadeIn(names[:2], shift=LEFT * 0.1), run=0.3)
        self.add(nums[0], nums[1])
        self.go(6160.8, th.animate(rate_func=linear).set_value(TAU), run=3.6)   # 13 teeth/s: no strobing at 30 fps

        def rate_arrow(i, tex, t):
            p, q = nums[i].get_right() + RIGHT * 0.25, nums[i + 1].get_right() + RIGHT * 0.25
            p[0] = q[0] = 5.3
            ar = CurvedArrow(p, q, angle=-PI / 1.6, color=PINK, stroke_width=4, tip_length=0.16)
            lab = M(tex, size=48, color=PINK).next_to(ar, RIGHT, buff=0.12)
            self.go(t, Create(ar), Write(lab), run=0.5)
            return VGroup(ar, lab)
        x3 = rate_arrow(0, r"\times 3", 6164.4)
        # B turns once: one third of a turn of A
        self.at(6164.95)
        base[0] = th.get_value()
        self.add(nums[2])
        self.play(FadeIn(names[2], shift=LEFT * 0.1), run_time=0.3)
        self.go(6165.4, th.animate.set_value(th.get_value() + TAU / 3), run=1.6)
        x2 = rate_arrow(1, r"\times 2", 6167.21)

        # if A turns once, how many times does C turn?
        self.at(6168.4)
        base[0] = th.get_value()
        q = M("?", size=54, color=YEL).move_to([5.02, names[2].get_y(), 0])
        self.go(6170.93, FadeIn(q, scale=0.8), run=0.4)
        self.go(6172.1, FadeOut(q), run=0.25)
        self.go(6172.39, th.animate(rate_func=linear).set_value(th.get_value() + TAU), run=4.6)
        for n in nums:
            n.clear_updaters()
        eq = M("3", r"\times", "2", "=", "6", size=84, color=PINK).move_to([3.6, -2.25, 0])
        self.go(6179.77, Write(eq[0]), run=0.3)
        self.go(6180.15, Write(eq[1:3]), run=0.4)
        self.go(6180.87, Write(eq[3:]), run=0.4)
        self.go(6182.85, Create(under(eq, YEL, 0.15)), run=0.5)
        self.go(6184.5, Circumscribe(VGroup(x3, x2), color=PINK, buff=0.12), run=0.9)

        # one thing depends on another which depends on another: gears keep turning slowly
        th.add_updater(lambda m, dt: m.increment_value(dt * 0.22))
        self.go(6185.83, Circumscribe(C, Circle, color=YEL, buff=0.1), run=0.8)
        self.go(6186.89, Circumscribe(B, Circle, color=YEL, buff=0.1), run=0.8)
        self.go(6188.0, Circumscribe(A, Circle, color=YEL, buff=0.05), run=0.8)
        self.go(6188.85, FadeIn(H("rates multiply", 44, YEL).move_to([3.6, -3.35, 0]), shift=UP * 0.1), run=0.4)
        self.wipe(self.END - 0.45, run=0.37)
        th.clear_updaters()


# ================================================================ the rule

def rule_line(size=82):
    m = M(D, "f", "(", "g(x)", ")", "=", "f'", "(", "g(x)", ")", r"\cdot", "g'(x)", size=size)
    col(m, {1: BLUE, 2: BLUE, 4: BLUE, 3: ORG, 6: BLUE, 7: BLUE, 9: BLUE, 8: ORG, 11: PINK})
    return m.move_to([0, 1.3, 0])


class K17_Rule(Shot):
    def body(self):
        self.title("Three Gears", animate=False)
        self.title("The Chain Rule", 6191.0)
        m = rule_line()
        self.go(6192.79, Write(m[1:5]), run=0.8)
        self.go(6194.31, Write(m[0]), run=0.4)
        self.go(6194.67, Write(m[5]), run=0.3)
        self.go(6195.07, Write(m[6]), run=0.4)
        self.go(6195.65, Write(m[7]), Write(m[9]), TransformFromCopy(m[3], m[8]), run=0.6)
        self.go(6196.55, Write(m[10]), run=0.3)
        self.go(6197.09, Write(m[11]), run=0.6)
        fr = panel(m, PURP, buff=0.3)
        self.go(6198.2, Create(fr), run=0.6)

        def lab(text, color, target, y):
            h = H(text, 40, color).move_to([target.get_x(), y, 0])
            ar = Arrow(h.get_top() + UP * 0.05, target.get_bottom() + DOWN * 0.08, buff=0.05, color=color,
                       stroke_width=4, tip_length=0.18, max_tip_length_to_length_ratio=0.25)
            return VGroup(h, ar)
        lo = lab("outside derivative", BLUE, m[6], -0.55)
        lo[0].shift(LEFT * 1.0)
        lo[1].become(Arrow(lo[0].get_top() + UP * 0.05, m[6].get_bottom() + DOWN * 0.08, buff=0.05, color=BLUE,
                           stroke_width=4, tip_length=0.18, max_tip_length_to_length_ratio=0.25))
        li = lab("inside stays", ORG, m[8], -1.75)
        ld = lab("inside derivative", PINK, m[11], -0.55)
        self.go(6204.19, FadeIn(lo, shift=UP * 0.1), run=0.5)
        self.go(6206.73, FadeIn(li, shift=UP * 0.1), run=0.5)
        self.go(6209.59, FadeIn(ld, shift=UP * 0.1), run=0.5)
        self.go(6211.63, Circumscribe(m[6], color=BLUE, buff=0.1), run=0.8)
        self.go(6212.63, Circumscribe(m[8], color=ORG, buff=0.1), run=0.8)
        self.go(6214.43, Circumscribe(m[11], color=PINK, buff=0.1), run=0.8)
        done(self)


# ================================================================ Leibniz notation

class K17_Leibniz(Shot):
    def body(self):
        self.title("The Chain Rule", animate=False)
        self.title("Leibniz Notation", 6217.3)
        yu = M("y", "=", "f", "(", "u", ")", size=64)
        col(yu, {2: BLUE, 3: BLUE, 5: BLUE, 4: ORG}).move_to([-2.8, 1.45, 0])
        ux = M("u", "=", "g(x)", size=64)
        col(ux, {0: ORG, 2: ORG}).move_to([2.8, 1.45, 0])
        self.go(6220.29, Write(yu), run=0.7)
        self.go(6221.91, Write(ux), run=0.6)
        m = M(r"\frac{dy}{dx}", "=", r"\frac{dy}{du}", r"\cdot", r"\frac{du}{dx}", size=100).move_to([0, -0.75, 0])
        m[2].set_color(BLUE)
        m[4].set_color(PINK)
        self.go(6223.53, Write(m[0]), run=0.7)
        self.go(6224.77, Write(m[1]), run=0.3)
        self.go(6225.51, Write(m[2]), run=0.7)
        self.go(6226.81, Write(m[3]), run=0.2)
        self.go(6227.49, Write(m[4]), run=0.7)
        d1, d2 = frac_split(m[2])[2], frac_split(m[4])[0]
        s1, s2 = strike(d1), strike(d2)
        self.go(6230.5, Create(s1), Create(s2), run=0.5)
        self.go(6232.7, s1.animate.set_stroke(opacity=0.25), s2.animate.set_stroke(opacity=0.25), run=0.5)
        tr = H("a memory trick", 42, YEL).move_to([0, -2.85, 0])
        self.go(6234.6, FadeIn(tr, shift=UP * 0.1), run=0.5)
        done(self)


# ================================================================ (3x+1)^5, slowly

class K17_FirstEx(Shot):
    def body(self):
        self.title("Leibniz Notation", animate=False)
        self.title("First Example", 6237.0)
        P = prob([D, "(", "3x+1", ")", "^5"], {})
        self.go(6238.53, Write(P), run=1.0)
        mi, mo = inside_outside(self, P, [2], [1, 3, 4], "3x+1", r"(\square)^5", 6242.3, 6245.2)
        ao, ro = d_arrow(mo, r"5(\square)^4", BLUE)
        self.go(6247.37, GrowArrow(ao[0]), FadeIn(ao[1]), run=0.5)
        self.go(6250.79, Write(ro), run=0.7)
        L1 = row(["=", "5", "(", "3x+1", ")", "^4", r"\cdot", "3"], {1: BLUE, 2: BLUE, 4: BLUE, 5: BLUE, 3: ORG, 7: PINK}, 1)
        self.go(6256.37, Write(L1[0]), TransformFromCopy(ro, VGroup(L1[1], L1[2], L1[4], L1[5])), run=0.7)
        self.go(6257.27, TransformFromCopy(P[2], L1[3]), run=0.7)
        ai, ri = d_arrow(mi, "3", PINK)
        self.go(6260.51, GrowArrow(ai[0]), FadeIn(ai[1]), run=0.5)
        self.go(6265.6, Write(ri), run=0.4)
        self.go(6269.21, Write(L1[6]), TransformFromCopy(ri, L1[7]), run=0.6)
        L2 = row(["=", "15", "(", "3x+1", ")", "^4"], {1: GRN, 3: ORG}, 2)
        self.go(6271.0, Write(L2), run=0.8)
        self.play(Create(answer_box(L2[1:])), run_time=0.5)
        done(self)


# ================================================================ the classic mistake, checked by expanding

class K17_Mistake(Shot):
    def body(self):
        self.title("First Example", animate=False)
        self.title("The Classic Mistake", 6275.0)
        w = M(D, "(", "3x+1", ")", "^5", "=", "5", "(", "3x+1", ")", "^4", size=62)
        col(w, {2: ORG, 8: ORG})
        w.shift(RIGHT * (XL - w.get_left()[0]) + UP * (1.5 - w.get_y()))
        self.play(FadeIn(w), run_time=0.4)
        cm = cross_mark(s=0.25).next_to(w, RIGHT, buff=1.3)
        self.go(6277.51, Create(cm), run=0.4)
        miss = M(r"\cdot", "3", size=62, color=PINK).next_to(w, RIGHT, buff=0.15)
        self.go(6280.5, FadeIn(miss, shift=LEFT * 0.15), run=0.5)
        r2 = M("(3x+1)^5", "=", "243x^5", r"+\cdots", size=54)
        r2.shift(RIGHT * (XL - r2.get_left()[0]) + UP * (0.0 - r2.get_y()))
        r3 = M(D, "(3x+1)^5", "=", "1215x^4", r"+\cdots", size=54)
        r3.shift(RIGHT * (r2[1].get_x() - r3[2].get_x()) + UP * (-1.35 - r3.get_y()))
        r4 = M("15", "(3x+1)^4", "=", r"15\cdot 81x^4", r"+\cdots", "=", "1215x^4", r"+\cdots", size=54)
        r4.shift(RIGHT * (r2[1].get_x() - r4[2].get_x()) + UP * (-2.7 - r4.get_y()))
        col(r4, {6: GRN})
        r3[3].set_color(GRN)
        self.go(6282.6, Write(r2), run=0.9)
        self.go(6285.2, Write(r3), run=0.9)
        self.go(6287.6, Write(r4[:5]), run=0.9)
        self.play(Write(r4[5:]), run_time=0.6)
        self.go(6290.25, Circumscribe(miss, color=PINK, buff=0.1), run=0.8)
        tk = tick_mark(s=0.55).move_to(cm)
        self.play(ReplacementTransform(cm, tk), run_time=0.5)
        done(self)


# ================================================================ sqrt(x^2 + 4)

class K17_Root(Shot):
    def body(self):
        self.title("The Classic Mistake", animate=False)
        self.title("More Examples", 6293.2)
        P = prob([D, r"\sqrt{", "x^2+4", "}"], {})
        self.go(6298.43, Write(P), run=0.9)
        mi, mo = inside_outside(self, P, [2], [1, 3], "x^2+4", r"\sqrt{\square}", 6300.47, 6302.91)
        half = M(r"(\square)^{1/2}", size=58, color=BLUE).move_to(mo, aligned_edge=LEFT)
        self.go(6305.5, ReplacementTransform(mo, half), run=0.6)
        ao, ro = d_arrow(half, r"\tfrac{1}{2}(\square)^{-1/2}", BLUE)
        self.go(6306.43, GrowArrow(ao[0]), FadeIn(ao[1]), run=0.5)
        self.go(6307.9, Write(ro), run=0.6)
        L1 = row(["=", r"\tfrac{1}{2}", "(", "x^2+4", ")", "^{-1/2}", r"\cdot", "2x"],
                 {1: BLUE, 2: BLUE, 4: BLUE, 5: BLUE, 3: ORG, 7: PINK}, 1)
        self.go(6308.6, Write(L1[0]), TransformFromCopy(ro, VGroup(L1[1], L1[2], L1[4], L1[5])), run=0.6)
        self.go(6309.81, TransformFromCopy(P[2], L1[3]), run=0.6)
        ai, ri = d_arrow(mi, "2x", PINK)
        self.go(6312.43, GrowArrow(ai[0]), FadeIn(ai[1]), Write(ri), run=0.6)
        self.go(6313.59, Write(L1[6]), TransformFromCopy(ri, L1[7]), run=0.6)
        self.go(6314.53, Circumscribe(L1[1], color=YEL, buff=0.08), Circumscribe(L1[7], color=YEL, buff=0.08), run=0.8)
        L2 = row(["=", r"\frac{x}{\sqrt{", "x^2+4", "}}"], {2: ORG}, 2)
        self.go(6318.67, Write(L2), run=1.0)
        self.play(Create(answer_box(L2[1:])), run_time=0.5)
        done(self)


# ================================================================ sin(x^2)

class K17_SinX2(Shot):
    def body(self):
        self.title("More Examples", animate=False)
        P = prob([D, r"\sin", "(", "x^2", ")"], {})
        self.go(6322.35, Write(P), run=0.8)
        mi, mo = inside_outside(self, P, [3], [1, 2, 4], "x^2", r"\sin(\square)", 6323.45, 6325.39)
        ao, ro = d_arrow(mo, r"\cos(\square)", BLUE)
        self.go(6326.77, GrowArrow(ao[0]), FadeIn(ao[1]), run=0.5)
        self.go(6328.61, Write(ro), run=0.6)
        L1 = row(["=", r"\cos", "(", "x^2", ")", r"\cdot", "2x"], {1: BLUE, 2: BLUE, 4: BLUE, 3: ORG, 6: PINK}, 1)
        self.go(6330.35, Write(L1[0]), TransformFromCopy(ro, VGroup(L1[1], L1[2], L1[4])), run=0.6)
        self.go(6331.15, TransformFromCopy(P[3], L1[3]), run=0.6)
        ai, ri = d_arrow(mi, "2x", PINK)
        self.go(6332.7, GrowArrow(ai[0]), FadeIn(ai[1]), Write(ri), run=0.6)
        self.go(6333.81, Write(L1[5]), TransformFromCopy(ri, L1[6]), run=0.5)
        L2 = row(["=", "2x", r"\cos", "(", "x^2", ")"], {1: PINK, 2: BLUE, 3: BLUE, 5: BLUE, 4: ORG}, 2)
        self.go(6335.29, Write(L2), run=0.8)
        self.go(6336.5, Create(answer_box(L2[1:])), run=0.5)
        self.go(6338.9, Circumscribe(L2[4], color=ORG, buff=0.08), run=0.8)
        wr = M(r"\cos", "(", "2x", ")", size=58, color=RED)
        wr.move_to([CX + wr.width / 2, -2.55, 0])
        self.go(6342.6, Write(wr), run=0.6)
        cm = cross_mark(s=0.22).next_to(wr, RIGHT, buff=0.45)
        self.go(6344.51, Create(cm), run=0.4)
        self.go(6345.4, Create(under(L1[3], ORG, 0.08)), run=0.5)
        done(self)


# ================================================================ e^(5x) and e^(x^2)

class K17_Exp(Shot):
    def body(self):
        self.title("More Examples", animate=False)
        P = prob([D, "e^{", "5x", "}"], {})
        self.go(6347.87, Write(P), run=0.7)
        mi, mo = inside_outside(self, P, [2], [1, 3], "5x", r"e^{\square}", 6349.47, 6351.61)
        ao, ro = d_arrow(mo, r"e^{\square}", BLUE)
        self.go(6353.77, GrowArrow(ao[0]), FadeIn(ao[1]), run=0.5)
        self.go(6355.85, Write(ro), run=0.5)
        L1 = row(["=", "e^{", "5x", "}", r"\cdot", "5"], {1: BLUE, 3: BLUE, 2: ORG, 5: PINK}, 1)
        self.go(6357.27, Write(L1[0]), TransformFromCopy(ro, VGroup(L1[1], L1[3])), TransformFromCopy(P[2], L1[2]), run=0.7)
        ai, ri = d_arrow(mi, "5", PINK)
        self.go(6359.6, GrowArrow(ai[0]), FadeIn(ai[1]), Write(ri), run=0.5)
        self.go(6360.4, Write(L1[4]), TransformFromCopy(ri, L1[5]), run=0.5)
        L2 = row(["=", "5", "e^{", "5x", "}"], {1: PINK, 2: BLUE, 4: BLUE, 3: ORG}, 2)
        self.go(6361.87, Write(L2), run=0.6)
        bx = answer_box(L2[1:])
        self.play(Create(bx), run_time=0.4)

        # e^(x^2): same move, faster; 5e^(5x) moves up to the corner
        self.at(6362.8)
        self.play(*[FadeOut(m) for m in self.board() if m not in (L2, bx)], FadeOut(L2[0]),
                  VGroup(L2[1:], bx).animate.scale(0.8).move_to([4.6, 1.6, 0]), run_time=0.4)
        Q = prob([D, "e^{", "x^2", "}"], {})
        self.go(6363.25, Write(Q), run=0.6)
        self.go(6364.63, Q[2].animate.set_color(ORG), Q[1].animate.set_color(BLUE), Q[3].animate.set_color(BLUE), run=0.4)
        K = row(["=", "e^{", "x^2", "}", r"\cdot", "2x", "=", "2x", "e^{", "x^2", "}"],
                {1: BLUE, 3: BLUE, 2: ORG, 5: PINK, 7: PINK, 8: BLUE, 10: BLUE, 9: ORG}, 1)
        self.go(6366.41, Write(K[0]), TransformFromCopy(Q[1:], K[1:4]), run=0.7)
        self.go(6368.21, Write(K[4:6]), run=0.6)
        self.go(6369.55, Write(K[6:]), run=0.7)
        self.play(Create(answer_box(K[7:])), run_time=0.4)
        # the rule for exponentials
        R = M(D, "e^{", "u", "}", "=", "e^{", "u", "}", r"\cdot", "u'", size=76)
        col(R, {1: BLUE, 3: BLUE, 5: BLUE, 7: BLUE, 2: ORG, 6: ORG, 9: PINK}).move_to([0, -2.1, 0])
        self.go(6373.09, Write(R[:5]), run=0.8)
        self.go(6376.07, TransformFromCopy(R[1:4], R[5:8]), run=0.7)
        self.go(6378.37, Write(R[8:]), run=0.6)
        self.play(Create(panel(R, PURP, buff=0.28)), run_time=0.6)
        done(self)


# ================================================================ cos 3x

class K17_Cos(Shot):
    def body(self):
        self.title("More Examples", animate=False)
        P = prob([D, r"\cos", "(", "3x", ")"], {1: BLUE, 2: BLUE, 4: BLUE, 3: ORG})
        self.go(6380.61, Write(P), run=0.7)
        L1 = row(["=", "-", r"\sin", "(", "3x", ")", r"\cdot", "3"], {1: BLUE, 2: BLUE, 3: BLUE, 5: BLUE, 4: ORG, 7: PINK}, 1)
        self.go(6384.55, Write(L1[:3]), run=0.6)
        self.go(6386.25, Write(L1[3]), Write(L1[5]), TransformFromCopy(P[3], L1[4]), run=0.6)
        self.go(6388.11, Write(L1[6:]), run=0.4)
        L2 = row(["=", "-3", r"\sin", "3x"], {1: PINK, 2: BLUE, 3: ORG}, 2)
        self.go(6388.9, Write(L2), run=0.7)
        self.play(Create(answer_box(L2[1:])), run_time=0.4)
        done(self, run=0.3)


# ================================================================ ln(x^2+1) and the log shortcut

class K17_Log(Shot):
    def body(self):
        self.title("More Examples", animate=False)
        P = prob([D, r"\ln", "(", "x^2+1", ")"], {1: BLUE, 2: BLUE, 4: BLUE, 3: ORG})
        self.go(6391.55, Write(P), run=0.8)
        L1 = row(["=", r"\frac{1}{", "x^2+1", "}", r"\cdot", "2x"], {1: BLUE, 2: ORG, 5: PINK}, 1)
        self.go(6395.47, Write(L1[:2]), run=0.5)
        self.go(6396.39, TransformFromCopy(P[3], L1[2]), run=0.6)
        self.go(6401.2, Write(L1[4:]), run=0.5)
        L2 = row(["=", r"\frac{2x}{", "x^2+1", "}"], {1: PINK, 2: ORG}, 3)
        self.go(6402.63, Write(L2), run=0.7)
        self.go(6404.3, Create(answer_box(L2[1:])), run=0.4)

        # shortcut: (ln u)' = u'/u
        tag = H("shortcut for logs", 40, YEL)
        R = M(D, r"\ln", "u", "=", r"\frac{u'}{u}", size=70)
        col(R, {1: BLUE, 2: ORG})
        num, bar, den = frac_split(R[4])
        num.set_color(PINK); den.set_color(ORG)
        R.move_to([CX + R.width / 2 + 0.6, 0.5, 0])
        tag.next_to(R, UP, buff=0.25)
        self.go(6406.0, FadeIn(tag, shift=DOWN * 0.1), run=0.5)
        self.go(6407.99, Write(R[:3]), run=0.7)
        self.go(6409.67, Write(R[3]), Write(num), run=0.5)
        self.go(6411.41, Write(bar), Write(den), run=0.5)
        self.play(Create(panel(VGroup(R, tag), PURP, buff=0.22)), run_time=0.5)
        E = M(D, r"\ln", "(", r"\sin x", ")", size=58)
        col(E, {1: BLUE, 2: BLUE, 4: BLUE, 3: ORG})
        E.move_to([CX + E.width / 2, -1.35, 0])
        E2 = M("=", r"\frac{\cos x}{\sin x}", "=", r"\cot x", size=58)
        n2, b2, d2 = frac_split(E2[1])
        n2.set_color(PINK); d2.set_color(ORG)
        space_eq(E2, ["=", "f", "=", "c"])
        E2.move_to([CX + 0.4 + E2.width / 2, -2.8, 0])
        self.go(6413.55, Write(E), run=0.7)
        self.go(6415.45, Write(E2[:2]), run=0.8)
        self.go(6417.4, Write(E2[2:]), run=0.5)
        self.play(Create(answer_box(E2[3])), run_time=0.4)
        done(self)


# ================================================================ sin^2 x

class K17_SinSq(Shot):
    def body(self):
        self.title("More Examples", animate=False)
        self.title("Sine Squared", 6419.8)
        P0 = prob([D, r"\sin^2 x"], {})
        self.go(6420.87, Write(P0), run=0.8)
        P = prob([D, "(", r"\sin x", ")", "^2"], {})
        self.go(6424.87, ReplacementTransform(P0, P), run=0.9)
        lo, mo = chip("outside", r"(\square)^2", BLUE, -0.2)
        li, mi = chip("inside", r"\sin x", ORG, 1.75)
        self.go(6427.57, *[P[k].animate.set_color(BLUE) for k in (1, 3, 4)], FadeIn(lo, shift=DOWN * 0.1), run=0.4)
        self.play(TransformFromCopy(VGroup(P[1], P[3], P[4]), mo), run_time=0.6)
        self.go(6430.15, P[2].animate.set_color(ORG), FadeIn(li, shift=DOWN * 0.1), run=0.4)
        self.play(TransformFromCopy(P[2], mi), run_time=0.6)
        ao, ro = d_arrow(mo, r"2(\square)", BLUE)
        self.go(6431.67, GrowArrow(ao[0]), FadeIn(ao[1]), run=0.5)
        self.go(6433.3, Write(ro), run=0.5)
        L1 = row(["=", "2", "(", r"\sin x", ")", r"\cdot", r"\cos x"], {1: BLUE, 2: BLUE, 4: BLUE, 3: ORG, 6: PINK}, 1)
        self.go(6434.17, Write(L1[0]), TransformFromCopy(ro, VGroup(L1[1], L1[2], L1[4])), run=0.6)
        self.go(6435.23, TransformFromCopy(P[2], L1[3]), run=0.6)
        ai, ri = d_arrow(mi, r"\cos x", PINK)
        self.go(6437.35, GrowArrow(ai[0]), FadeIn(ai[1]), run=0.4)
        self.go(6438.5, Write(ri), Write(L1[5]), TransformFromCopy(ri, L1[6]), run=0.6)
        L2 = row(["=", "2", r"\sin x", r"\cos x"], {1: BLUE, 2: ORG, 3: PINK}, 2)
        self.go(6440.35, Write(L2), run=0.8)
        self.go(6441.4, Create(answer_box(L2[1:])), run=0.4)
        done(self, run=0.3)


# ================================================================ 1/(2x+1)^3

class K17_NegPow(Shot):
    def body(self):
        self.title("Sine Squared", animate=False)
        self.title("A Negative Power", 6443.7)
        P = prob([D, r"\frac{1}{(2x+1)^3}"], {}).shift(UP * 0.22)
        self.go(6444.87, Write(P), run=0.9)
        L1 = row(["=", D, "(", "2x+1", ")", "^{-3}"], {2: BLUE, 4: BLUE, 5: BLUE, 3: ORG}, 1, size=60)
        self.go(6448.63, Write(L1), run=1.0)
        lo, mo = chip("outside", r"(\square)^{-3}", BLUE, -0.2)
        li, mi = chip("inside", "2x+1", ORG, 1.75)
        self.go(6451.91, FadeIn(lo, shift=DOWN * 0.1), TransformFromCopy(VGroup(L1[2], L1[4], L1[5]), mo), run=0.6)
        ao, ro = d_arrow(mo, r"-3(\square)^{-4}", BLUE)
        self.go(6452.79, GrowArrow(ao[0]), FadeIn(ao[1]), run=0.5)
        self.go(6453.6, Write(ro), run=0.9)
        L2 = row(["=", "-3", "(", "2x+1", ")", "^{-4}", r"\cdot", "2"],
                 {1: BLUE, 2: BLUE, 4: BLUE, 5: BLUE, 3: ORG, 7: PINK}, 2, size=60)
        self.go(6456.73, Write(L2[0]), TransformFromCopy(ro, VGroup(L2[1], L2[2], L2[4], L2[5])), run=0.7)
        self.go(6458.4, TransformFromCopy(L1[3], L2[3]), run=0.6)
        self.go(6459.2, FadeIn(li, shift=DOWN * 0.1), TransformFromCopy(L1[3], mi), run=0.6)
        ai, ri = d_arrow(mi, "2", PINK)
        self.go(6461.69, GrowArrow(ai[0]), FadeIn(ai[1]), Write(ri), run=0.5)
        self.go(6462.6, Write(L2[6]), TransformFromCopy(ri, L2[7]), run=0.5)
        L3 = row(["=", "-6", "(", "2x+1", ")", "^{-4}", "=", r"\frac{-6}{(2x+1)^4}"], {3: ORG}, 3, size=60)
        self.go(6463.53, Write(L3[:6]), run=0.9)
        self.go(6468.61, Write(L3[6]), run=0.3)
        self.go(6469.43, Write(L3[7]), run=0.9)
        self.go(6471.6, Create(answer_box(L3[7])), run=0.5)
