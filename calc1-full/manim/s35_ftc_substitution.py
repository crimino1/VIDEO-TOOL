"""Builder 35: middle of Chapter 12 (3:39:15.84 - 3:45:26.72).
Part 2 evaluations: the sine hump finished (1 - (-1) = 2, the "?" in the hump becomes 2), 1/x from 1 to e = 1,
e^x from 0 to 1 = e - 1, root x from 1 to 4 = 14/3 (4^(3/2) = (sqrt 4)^3 = 8), 1/(1+x^2) from 0 to 1 = pi/4;
the bracket tip (1 - (-1) = 2 versus the rushed 1 - 1 = 0); three practice integrals and their answers (6, 1, 1/2).
Then u-substitution: the basic rules cannot do 2x cos(x^2); d/dx sin(x^2) = cos(x^2) 2x, so u-sub is the chain rule
run backwards (arrow diagram); the recipe on the generic integral f(g(x)) g'(x) dx -> f(u) du -> F(u) + C -> F(g(x)) + C;
2x cos(x^2) worked (2x slides beside dx, x^2 becomes u, du flies in and absorbs 2x dx); the check by differentiating;
a constant off (x cos x^2: x dx = 1/2 du); (3x+1)^5 (dx = 1/3 du, answer (3x+1)^6/18 + C); missing x's cannot be pulled
out; x sqrt(x^2+4) (x dx = 1/2 du, answer 1/3 (x^2+4)^(3/2) + C).
Colours: inside u ORG, du / derivative of the inside PINK, outer function BLUE, integrals and answers GRN, RED wrong.
Whisper fixes: "f of a" = F(a), "U" = lowercase u, "square root of 4. Cubed" = (sqrt 4)^3.
The brief mentioned net vs total area and FTC part 1 with g(x): neither is in this range (34 built part 1 at 3:38:04).
END SEAM: K35_RootSub ends on the x sqrt(x^2+4) board with the boxed GRN answer 1/3 (x^2+4)^(3/2) + C on the right.
Builder 36 starts fresh at "Exponentials work really nicely"; same u ORG / du PINK convention."""
from common import *


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    """Move a MathTex so its part i (usually '=') sits at (x, y)."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def left_at(line, i, x, y):
    """Move a MathTex so the left edge of part i sits at x, its centre at height y."""
    line.shift(RIGHT * (x - line[i].get_left()[0]) + UP * (y - line[i].get_y()))
    return line


def bval(part, tex, color=ORG, size=44):
    """Brace under a part with a short value below."""
    b = Brace(part, DOWN, buff=0.08, color=color)
    return VGroup(b, M(tex, size=size, color=color).next_to(b, DOWN, buff=0.06))


def settle(scene, group):
    """After part-by-part transforms, put the whole MathTex back on stage as one object."""
    scene.remove(*group.submobjects)
    scene.add(group)


def TMT(src, tgt, key_map=None):
    """TransformMatchingTex by parts. Manim 0.22's own key_map path crashes (FadeTransformPieces), so parts are matched
    here: same tex first, then key_map; matched parts move, the rest fade."""
    key_map = key_map or {}
    keys = [p.get_tex_string() for p in src]
    used, pairs, anims = set(), {}, []
    for rule in (lambda k, t: k == t, lambda k, t: key_map.get(k) == t):
        for j, tp in enumerate(tgt):
            if j in pairs:
                continue
            for i, k in enumerate(keys):
                if i not in used and rule(k, tp.get_tex_string()):
                    used.add(i); pairs[j] = i
                    break
    for j, tp in enumerate(tgt):
        anims.append(ReplacementTransform(src[pairs[j]], tp) if j in pairs else FadeIn(tp))
    anims += [FadeOut(sp) for i, sp in enumerate(src) if i not in used]
    return AnimationGroup(*anims)


def inset(xr, yr, center, xl, yl):
    return axes(xr, yr, x_length=xl, y_length=yl, center=center, nums=False, y_label=None)


def xlab(ax, x, tex):
    return M(tex, size=36, color=FAINT).next_to(ax.c2p(x, 0), DOWN, buff=0.12)


def absorb(scene, src, tgt, moves, shrink, flies, run=1.0):
    """src parts -> tgt parts: moves = [(i, j)] ReplacementTransform, shrink = src parts that fold into
    tgt part k (given as (list, k)), flies = [(mob, j)] copies of a panel part flying into tgt part j."""
    anims = [ReplacementTransform(src[i], tgt[j]) for i, j in moves]
    ids, k = shrink
    gone = VGroup(*[src[i] for i in ids])
    anims.append(gone.animate.scale(0.15).move_to(tgt[k]).set_opacity(0))
    fl = []
    for m, j in flies:
        c = m.copy()
        fl.append((c, j))
        anims.append(c.animate.move_to(tgt[j]).match_height(tgt[j]))
    scene.play(*anims, run_time=run)
    scene.remove(*gone, *[c for c, _ in fl])
    settle(scene, tgt)


# ---------------------------------------------------------------- Part 2 evaluations

class K35_SineDone(Shot):
    """Finish 34's sine example: 1 - (-1) = 2; the answer flies into the hump."""
    def body(self):
        self.title("Part 2 in Action", animate=False)
        # K34_Ex2's final board, rebuilt exactly
        rA = M(r"\int_0^{\pi}", r"\sin x", r"\,dx", "=", r"\Big[-\cos x\Big]_0^{\pi}", size=62)
        rA[0].set_color(GRN); rA[1].set_color(BLUE)
        rA.move_to([-2.7, 1.3, 0])
        ax = axes((0, 3.6, 1), (0, 1.5, 1), x_length=4.3, y_length=2.4, center=(4.3, -0.7, 0), nums=False, y_label=None)
        pl = M(r"\pi", size=36, color=FAINT).next_to(ax.c2p(PI, 0), DOWN, buff=0.12)
        cv = curve(ax, np.sin, [0, PI]).set_z_index(2)
        sh = area(ax, np.sin, 0, PI)
        qm = M("?", size=60).move_to(ax.c2p(PI / 2, 0.42))
        EX = -2.4  # was -3.6: the "top"/"bottom" labels ran off the left edge
        rB = at_eq(M(r"-\cos\pi", "=", "-(-1)", "=", "1", size=60), 1, EX, -0.15)
        rC = at_eq(M(r"-\cos 0", "=", "-1", size=60), 1, EX, -1.55)
        tB = H("top", 36, DIM).next_to(rB, LEFT, buff=0.45)
        tC = H("bottom", 36, DIM).next_to(rC, LEFT, buff=0.45)
        tC.align_to(tB, RIGHT)
        rB[4].set_color(ORG); rC[2].set_color(ORG)
        self.add(rA, ax, ax.labels, pl, sh, cv, qm, tB, tC, rB, rC)
        # 1 - (-1) = 2
        rD = at_eq(M("=", "1", "-", "(-1)", "=", "2", size=60), 0, EX, -2.85)
        rD[1].set_color(ORG); rD[3].set_color(ORG); rD[5].set_color(GRN)
        self.go("3:39:15.99", Write(rD[0]), TransformFromCopy(rB[4], rD[1]), run=0.3)
        self.go("3:39:16.33", Write(rD[2]), run=0.28)
        self.go("3:39:16.65", TransformFromCopy(rC[2], rD[3]), run=0.5)
        self.go("3:39:18.03", Write(rD[4:]), run=0.5)
        self.play(Create(answer_box(rD[5])), run_time=0.4)
        two = M("2", size=66, color=GRN).move_to(qm)
        self.go("3:39:19.67", sh.animate.set_fill(opacity=0.55), run=0.5)
        self.go("3:39:20.25", FadeOut(qm), TransformFromCopy(rD[5], two, path_arc=-0.8), run=0.9)
        self.go("3:39:21.61", Circumscribe(two, color=GRN, buff=0.12), run=0.9)
        self.go("3:39:23.61", Create(answer_box(two)), run=0.5)


class K35_LnExp(Shot):
    """1/x from 1 to e = 1 (area exactly 1), then e^x from 0 to 1 = e - 1."""
    def body(self):
        self.title("More Definite Integrals", "3:39:25.79")
        rA = M(r"\int_1^e", r"\frac{1}{x}", r"\,dx", "=", r"\Big[\ln x\Big]_1^e", size=62).move_to([-2.7, 1.3, 0])
        rA[0].set_color(GRN); rA[1].set_color(BLUE)
        ax = inset((0, 3.4, 1), (0, 2.2, 1), (4.4, -0.85, 0), 4.0, 2.7)
        l1, le = xlab(ax, 1, "1"), xlab(ax, np.e, "e")
        cv = curve(ax, lambda x: 1 / x, [0.47, 3.2]).set_z_index(2)
        sh = area(ax, lambda x: 1 / x, 1, np.e)
        self.go("3:39:26.19", Write(rA[0]), run=0.6)
        self.go("3:39:27.61", Write(rA[1:3]), run=0.7)
        self.go("3:39:28.40", Create(ax), FadeIn(ax.labels), FadeIn(l1), FadeIn(le), run=0.5)
        self.play(draw(cv, run=0.7))
        self.play(FadeIn(sh), run_time=0.4)
        self.go("3:39:30.21", Write(rA[3:]), run=0.9)
        EX = rA[3].get_x()
        r2 = at_eq(M("=", r"\ln e", "-", r"\ln 1", size=62), 0, EX, -0.25)
        self.go("3:39:31.61", Write(r2[:2]), run=0.6)
        self.go("3:39:32.99", Write(r2[2:]), run=0.6)
        r3 = at_eq(M("=", "1", "-", "0", "=", "1", size=62), 0, EX, -1.65)
        r3[1].set_color(ORG); r3[3].set_color(ORG); r3[5].set_color(GRN)
        self.go("3:39:34.67", Write(r3[:4]), run=0.7)
        one = M("1", size=56, color=GRN).move_to(ax.c2p(1.75, 0.3))
        self.go("3:39:36.13", Write(r3[4:]), TransformFromCopy(r3[5], one), run=0.6)
        # e^x from 0 to 1
        self.wipe("3:39:36.90", run=0.35)
        rE = M(r"\int_0^1", "e^x", r"\,dx", "=", r"\Big[e^x\Big]_0^1", size=62).move_to([-2.7, 1.3, 0])
        rE[0].set_color(GRN); rE[1].set_color(BLUE)
        bx = inset((0, 1.6, 1), (0, 3.6, 1), (4.5, -0.85, 0), 3.4, 2.9)
        m1 = xlab(bx, 1, "1")
        ce = curve(bx, np.exp, [0, 1.27]).set_z_index(2)
        se = area(bx, np.exp, 0, 1)
        self.go("3:39:37.21", Write(rE[0]), run=0.6)
        self.go("3:39:38.83", Write(rE[1:3]), Create(bx), FadeIn(bx.labels), FadeIn(m1), run=0.5)
        self.play(draw(ce, run=0.5), FadeIn(se), Write(rE[3:]), run_time=0.55)
        EX = rE[3].get_x()
        r2 = at_eq(M("=", "e^1", "-", "e^0", size=62), 0, EX, -0.25)
        self.go("3:39:40.01", Write(r2[:2]), run=0.6)
        self.go("3:39:41.07", Write(r2[2:]), run=0.5)
        b0 = bval(r2[3], "1")
        self.play(GrowFromCenter(b0[0]), FadeIn(b0[1]), run_time=0.4)
        r3 = at_eq(M("=", r"\;e-1", size=62, color=GRN), 0, EX, -1.95)
        r3[0].set_color(CHALK)
        self.go("3:39:42.19", Write(r3), run=0.6)
        val = M(r"\approx 1.72", size=44, color=GRN).move_to(bx.c2p(0.5, 0.55))
        self.play(Create(answer_box(r3[1])), FadeIn(val), run_time=0.5)


class K35_RootX(Shot):
    """Root x from 1 to 4: [2/3 x^(3/2)], 4^(3/2) = (sqrt 4)^3 = 8, 2/3 (8 - 1) = 14/3."""
    def body(self):
        self.title("More Definite Integrals", animate=False)
        rA = M(r"\int_1^4", r"\sqrt{x}", r"\,dx", "=", r"\Big[\frac{2}{3}x^{3/2}\Big]_1^4", size=62).move_to([-1.2, 1.45, 0])
        rA[0].set_color(GRN); rA[1].set_color(BLUE)
        self.go("3:39:43.95", Write(rA[0]), run=0.6)
        self.go("3:39:45.45", Write(rA[1:3]), run=0.6)
        self.go("3:39:46.75", Write(rA[3]), run=0.3)
        self.go("3:39:47.33", Write(rA[4]), run=1.4)
        EX = rA[3].get_x()
        # side calculation: 4^(3/2)
        sc = M(r"4^{3/2}", "=", r"\big(\sqrt{4}\,\big)^3", "=", "2^3", "=", "8", size=54, color=ORG)
        at_eq(sc, 1, EX, 0.2)
        self.go("3:39:50.37", Indicate(rA[4][-1], color=ORG, scale_factor=1.6), run=0.6)
        self.go("3:39:51.07", Write(sc[0]), run=0.5)
        self.go("3:39:52.43", Write(sc[1:3]), run=0.8)
        self.go("3:39:54.03", Write(sc[3:5]), run=0.5)
        self.go("3:39:54.97", Write(sc[5:]), run=0.4)
        r2 = at_eq(M("=", r"\frac{2}{3}", r"\cdot", "8", "-", r"\frac{2}{3}\cdot 1", size=62), 0, EX, -1.05)
        r2[3].set_color(ORG)
        self.go("3:39:55.79", Write(r2[:3]), run=0.6)
        self.go("3:39:57.11", TransformFromCopy(sc[6], r2[3], path_arc=-0.6), run=0.6)
        self.go("3:39:58.27", Write(r2[4:]), run=0.8)
        r3 = at_eq(M("=", r"\frac{2}{3}(8-1)", "=", r"\frac{2}{3}\cdot 7", "=", r"\frac{14}{3}", size=62), 0, EX, -2.65)
        r3[5].set_color(GRN)
        self.go("3:40:00.31", Circumscribe(r2[1:], color=YEL, buff=0.08), run=0.8)
        self.go("3:40:01.77", Write(r3[:2]), run=0.9)
        self.go("3:40:04.33", Write(r3[2:4]), run=0.6)
        self.go("3:40:06.09", Write(r3[4:]), run=0.5)
        self.play(Create(answer_box(r3[5])), run_time=0.4)


class K35_Arctan(Shot):
    """1/(1+x^2) from 0 to 1 = arctan 1 - arctan 0 = pi/4: a rational function with pi in its area."""
    def body(self):
        self.title("More Definite Integrals", animate=False)
        f = lambda x: 1 / (1 + x * x)
        rA = M(r"\int_0^1", r"\frac{1}{1+x^2}", r"\,dx", "=", r"\Big[\arctan x\Big]_0^1", size=60).move_to([-2.75, 1.35, 0])
        rA[0].set_color(GRN); rA[1].set_color(BLUE)
        ax = inset((0, 2.6, 1), (0, 1.4, 1), (4.75, -1.05, 0), 3.6, 2.4)
        l1 = xlab(ax, 1, "1")
        o1 = M("1", size=36, color=FAINT).next_to(ax.c2p(0, 1), LEFT, buff=0.12)
        cv = curve(ax, f, [0, 2.45]).set_z_index(2)
        sh = area(ax, f, 0, 1)
        self.go("3:40:08.09", Write(rA[0]), run=0.6)
        self.go("3:40:10.23", Write(rA[1:3]), run=1.0)
        self.go("3:40:11.30", Create(ax), FadeIn(ax.labels), FadeIn(l1), FadeIn(o1), run=0.4)
        self.play(draw(cv, run=0.6))
        self.play(FadeIn(sh), run_time=0.3)
        self.go("3:40:12.77", Write(rA[3:]), run=1.2)
        EX = rA[3].get_x()
        r2 = at_eq(M("=", r"\arctan 1", "-", r"\arctan 0", size=56), 0, EX, -0.35)
        self.go("3:40:15.65", Write(r2[:2]), run=0.8)
        b1 = bval(r2[1], r"\frac{\pi}{4}")
        self.go("3:40:17.25", GrowFromCenter(b1[0]), FadeIn(b1[1]), run=0.5)
        self.go("3:40:18.85", Write(r2[2:]), run=0.7)
        b2 = bval(r2[3], "0")
        self.go("3:40:20.09", GrowFromCenter(b2[0]), FadeIn(b2[1]), run=0.4)
        r3 = at_eq(M("=", r"\frac{\pi}{4}", size=62), 0, EX, -2.55)
        r3[1].set_color(GRN)
        pa = M(r"\frac{\pi}{4}", size=44, color=GRN).move_to(ax.c2p(0.5, 0.42))
        self.go("3:40:21.25", Write(r3), run=0.6)
        self.play(Create(answer_box(r3[1])), TransformFromCopy(r3[1], pa), run_time=0.6)
        self.go("3:40:23.17", Circumscribe(rA[1], color=BLUE, buff=0.1), run=0.9)
        self.go("3:40:25.61", Circumscribe(pa, color=GRN, buff=0.1), run=0.9)


class K35_Tip(Shot):
    """Put F(a) in brackets: the sine example done right (2) and rushed (0)."""
    def body(self):
        self.title("A Practical Tip", "3:40:29.53")
        r1 = M("F(b)", "-", r"\Big[", "F(a)", r"\Big]", size=70).move_to([0, 1.35, 0])
        r1[2].set_color(YEL); r1[4].set_color(YEL)
        self.go("3:40:31.23", Write(r1[:2]), run=0.35)
        self.go("3:40:31.61", Write(r1[3]), run=0.5)
        self.go("3:40:32.67", Write(r1[2]), Write(r1[4]), run=0.6)
        self.go("3:40:34.53", Circumscribe(r1[1:], color=RED, buff=0.1), run=0.9)
        nt = note("careful here", r1[1].get_bottom() + DOWN * 0.08, DL, RED, 38, dist=0.35, angle=-0.5)
        self.go("3:40:36.57", FadeIn(nt), run=0.5)
        # the sine example
        s = M(r"\Big[-\cos x\Big]_0^{\pi}", "=", "1", "-", r"\Big(", "-1", r"\Big)", size=62).move_to([0, -0.15, 0])
        s[4].set_color(YEL); s[6].set_color(YEL); s[5].set_color(ORG); s[2].set_color(ORG)
        self.go("3:40:38.93", FadeOut(nt), r1.animate.set_opacity(0.4), Write(s[0]), run=0.8)
        self.play(Write(s[1:4]), run_time=0.5)
        self.go("3:40:40.93", Write(s[4:]), run=0.6)
        bv = bval(s[4:], r"-\cos 0", DIM, 40)
        self.go("3:40:41.67", GrowFromCenter(bv[0]), FadeIn(bv[1]), run=0.5)
        g = M("=", "1", "+", "1", "=", "2", size=62).move_to([-3.2, -2.6, 0])
        g[2].set_color(YEL); g[5].set_color(GRN)
        self.go("3:40:43.83", Write(g[:4]), run=0.8)
        tk = tick_mark(GRN, 0.55).next_to(g, RIGHT, buff=0.35)
        self.go("3:40:45.73", Write(g[4:]), run=0.5)
        self.play(Create(tk), run_time=0.4)
        bd = M("1", "-", "1", "=", "0", size=62, color=RED).move_to([3.4, -2.6, 0])
        rl = H("rushed", 36, DIM).next_to(bd, LEFT, buff=0.4)
        self.go("3:40:47.49", FadeIn(rl, shift=DOWN * 0.1), run=0.4)
        self.go("3:40:48.21", Write(bd), run=0.6)
        cx = cross_mark(RED, 0.25).next_to(bd, RIGHT, buff=0.35)
        self.go("3:40:48.89", Create(cx), run=0.4)
        self.go("3:40:49.53", Circumscribe(g[5], color=GRN, buff=0.1), run=0.7)


# ---------------------------------------------------------------- practice

PROBS = [(r"\int_0^2", r"(x^3+1)", r"\,dx"), (r"\int_0^{\pi/2}", r"\cos x", r"\,dx"), (r"\int_1^2", r"\frac{1}{x^2}", r"\,dx")]


def prob(k, size=64):
    m = M(*PROBS[k], size=size)
    m[0].set_color(GRN); m[1].set_color(BLUE)
    return m


class K35_Three(Shot):
    """The three practice integrals, one per line."""
    def body(self):
        self.title("Try These Three", animate=False)
        ys = [1.4, -0.45, -2.3]
        for k, (t, y) in enumerate(zip(["3:40:52.45", "3:40:56.51", "3:41:00.43"], ys)):
            n = M(f"{k + 1}.", size=56, color=ORG).move_to([-3.0, y, 0])
            p = prob(k).next_to(n, RIGHT, buff=0.5)
            p.shift(UP * (y - p.get_y()))
            self.go(t, FadeIn(n), Write(p), run=1.1)


class K35_Sol1(Shot):
    """0 to 2 of x^3 + 1: [x^4/4 + x] = (16/4 + 2) - 0 = 6."""
    def body(self):
        self.title("Problem 1", "3:41:03.95")
        r0 = M(*PROBS[0], "=", r"\Big[\frac{x^4}{4}+x\Big]_0^2", size=62).move_to([-0.8, 1.3, 0])
        r0[0].set_color(GRN); r0[1].set_color(BLUE)
        self.play(FadeIn(r0[:3], shift=DOWN * 0.1), run_time=0.5)
        self.go("3:41:05.27", Write(r0[3]), run=0.3)
        self.go("3:41:06.27", Write(r0[4]), run=1.5)
        EX = r0[3].get_x()
        r2 = at_eq(M("=", r"\Big(\frac{16}{4}+2\Big)", "-", r"\Big(0\Big)", size=62), 0, EX, -0.3)
        self.go("3:41:09.05", Write(r2[0]), run=0.3)
        self.go("3:41:10.15", Write(r2[1]), run=1.1)
        b1 = bval(r2[1], "4+2=6")
        self.go("3:41:12.29", GrowFromCenter(b1[0]), FadeIn(b1[1]), run=0.6)
        self.go("3:41:14.41", Write(r2[2:]), run=0.6)
        r3 = at_eq(M("=", "6", "-", "0", "=", "6", size=62), 0, EX, -2.45)
        r3[5].set_color(GRN)
        self.go("3:41:16.23", Write(r3[:4]), run=0.5)
        self.go("3:41:16.89", Write(r3[4:]), run=0.3)
        self.play(Create(answer_box(r3[5])), run_time=0.3)


class K35_Sol2(Shot):
    """0 to pi/2 of cos x: [sin x] = 1 - 0 = 1."""
    def body(self):
        self.title("Problem 2", "3:41:17.89")
        r0 = M(*PROBS[1], "=", r"\Big[\sin x\Big]_0^{\pi/2}", size=62).move_to([-0.8, 1.3, 0])
        r0[0].set_color(GRN); r0[1].set_color(BLUE)
        self.play(FadeIn(r0[:3], shift=DOWN * 0.1), run_time=0.5)
        self.go("3:41:19.23", Write(r0[3]), run=0.3)
        self.go("3:41:20.23", Write(r0[4]), run=0.8)
        EX = r0[3].get_x()
        r2 = at_eq(M("=", r"\sin\frac{\pi}{2}", "-", r"\sin 0", size=62), 0, EX, -0.3)
        self.go("3:41:21.47", Write(r2[:2]), run=0.7)
        b1 = bval(r2[1], "1")
        self.go("3:41:22.65", GrowFromCenter(b1[0]), FadeIn(b1[1]), run=0.4)
        self.go("3:41:23.53", Write(r2[2:]), run=0.5)
        b2 = bval(r2[3], "0")
        self.go("3:41:24.13", GrowFromCenter(b2[0]), FadeIn(b2[1]), run=0.4)
        r3 = at_eq(M("=", "1", "-", "0", "=", "1", size=62), 0, EX, -2.45)
        r3[5].set_color(GRN)
        self.go("3:41:24.75", Write(r3[:4]), run=0.5)
        self.go("3:41:25.40", Write(r3[4:]), run=0.3)
        self.play(Create(answer_box(r3[5])), run_time=0.3)


class K35_Sol3(Shot):
    """1 to 2 of 1/x^2 = x^-2: [-1/x] = (-1/2) - (-1) = -1/2 + 1 = 1/2."""
    def body(self):
        self.title("Problem 3", "3:41:26.67")
        r0 = M(*PROBS[2], "=", r"\int_1^2", "x^{-2}", r"\,dx", size=62).move_to([-1.0, 1.45, 0])
        r0[0].set_color(GRN); r0[1].set_color(BLUE); r0[4].set_color(GRN); r0[5].set_color(BLUE)
        self.play(FadeIn(r0[:3], shift=DOWN * 0.1), run_time=0.5)
        self.go("3:41:27.71", Circumscribe(r0[1], color=YEL, buff=0.08), run=0.8)
        self.go("3:41:28.65", Write(r0[3:5]), TransformFromCopy(r0[1], r0[5]), Write(r0[6]), run=0.9)
        EX = r0[3].get_x()
        r2 = at_eq(M("=", r"\Big[-x^{-1}\Big]_1^2", "=", r"\Big[-\frac{1}{x}\Big]_1^2", size=62), 0, EX, 0.0)
        self.go("3:41:31.93", Write(r2[:2]), run=1.0)
        self.go("3:41:33.97", Write(r2[2:]), run=0.9)
        r3 = at_eq(M("=", r"\Big(-\frac{1}{2}\Big)", "-", r"\Big(-1\Big)", size=62), 0, EX, -1.35)
        self.go("3:41:36.03", Write(r3[:2]), run=0.9)
        self.go("3:41:38.19", Write(r3[2:]), run=0.8)
        self.go("3:41:40.73", Circumscribe(r3[2:], color=YEL, buff=0.08), run=0.8)
        r4 = at_eq(M("=", r"-\frac{1}{2}", "+", "1", "=", r"\frac{1}{2}", size=62), 0, EX, -2.75)
        r4[2].set_color(YEL); r4[5].set_color(GRN)
        self.go("3:41:42.31", Write(r4[:2]), run=0.6)
        self.go("3:41:43.39", TransformFromCopy(r3[2:], r4[2:4]), run=0.6)
        self.go("3:41:44.63", Write(r4[4:]), run=0.4)
        self.play(Create(answer_box(r4[5])), run_time=0.3)


# ---------------------------------------------------------------- u-substitution

class K35_SubIntro(Shot):
    """The basic rules cannot do 2x cos(x^2). Its source: d/dx sin(x^2). u-sub = the chain rule run backwards."""
    def body(self):
        self.title("u-Substitution", "3:41:47.05")
        lab = H("our basic rules", 38, DIM).move_to([0, 1.85, 0])
        basics = VGroup(M(r"\int x^n\,dx"), M(r"\int e^x\,dx"), M(r"\int \sin x\,dx"), M(r"\int \cos x\,dx"))
        for b in basics:
            b.scale(52 / 60)
        basics.arrange(RIGHT, buff=0.75).move_to([0, 0.85, 0])
        self.go("3:41:51.99", FadeIn(lab, shift=DOWN * 0.1), run=0.5)
        for b, t in zip(basics, ["3:41:53.65", "3:41:54.85", "3:41:55.85", "3:41:56.59"]):
            self.go(t, Write(b), run=0.6)
        hard = M(r"\int", "2x", r"\cos(", "x^2", r")\,dx", size=74).move_to([0, -1.2, 0])
        self.go("3:41:58.59", Write(hard), run=1.6)
        qm = M("?", size=84, color=RED).next_to(hard, RIGHT, buff=0.4)
        self.go("3:42:01.51", FadeIn(qm, scale=0.8), basics.animate.set_opacity(0.3), lab.animate.set_opacity(0.3), run=0.6)
        # where did it come from?
        self.go("3:42:04.37", FadeOut(basics), FadeOut(lab), FadeOut(qm), hard.animate.scale(0.72).move_to([0, 1.9, 0]), run=0.7)
        L = M(r"\sin(x^2)", size=64, color=BLUE).move_to([-3.9, -0.9, 0])
        Lq = M("?", size=72, color=YEL).move_to(L)
        R = M(r"\cos(x^2)", r"\cdot", "2x", size=64).move_to([3.7, -0.9, 0])
        top = CurvedArrow(np.array([-2.55, -0.5, 0]), np.array([1.95, -0.5, 0]), angle=-0.8, color=PINK, stroke_width=4, tip_length=0.2)
        dl = M(r"\frac{d}{dx}", size=48, color=PINK)
        cr = pill("chain rule", PINK, 34)
        VGroup(dl, cr).arrange(RIGHT, buff=0.3).move_to([-0.3, 0.5, 0])
        self.go("3:42:06.15", Write(Lq), run=0.5)
        self.go("3:42:08.51", Create(top), FadeIn(dl), run=0.8)
        self.go("3:42:09.55", ReplacementTransform(Lq, L), run=0.6)
        self.go("3:42:10.87", FadeIn(cr, scale=0.9), run=0.5)
        self.go("3:42:11.93", Write(R), run=1.5)
        self.go("3:42:15.33", Circumscribe(R, color=YEL, buff=0.12), Circumscribe(hard[1:], color=YEL, buff=0.1), run=1.0)
        bot = CurvedArrow(np.array([1.95, -1.3, 0]), np.array([-2.55, -1.3, 0]), angle=-0.8, color=GRN, stroke_width=4, tip_length=0.2)
        il = M(r"\int", size=52, color=GRN)
        us = pill("u-substitution", GRN, 34)
        VGroup(il, us).arrange(RIGHT, buff=0.3).move_to([-0.3, -2.4, 0])
        self.go("3:42:17.11", Create(bot), FadeIn(il), FadeIn(us, scale=0.9), run=0.8)
        dot = Dot(radius=0.09, color=GRN).set_z_index(8).move_to(bot.get_start())
        self.go("3:42:19.67", FadeIn(dot, run_time=0.1), run=0.1)
        self.play(MoveAlongPath(dot, bot), run_time=0.85)
        self.play(FadeOut(dot), run_time=0.2)


class K35_Recipe(Shot):
    """The five steps beside the generic integral f(g(x)) g'(x) dx -> f(u) du -> F(u) + C -> F(g(x)) + C."""
    def body(self):
        self.title("How It Works", "3:42:21.15")

        def step(n, words, tex=None, col=CHALK):
            g = VGroup(M(n, size=48, color=ORG), H(words, 40))
            if tex:
                g.add(M(tex, size=50, color=col))
            g.arrange(RIGHT, buff=0.25)
            return g
        rows = [step("1", "pick the inside", r"u = g(x)", ORG), step("2", "find", r"du = g'(x)\,dx", PINK),
                step("3", "rewrite: no x left"), step("4", "integrate in u"), step("5", "put x back")]
        for i, r in enumerate(rows):
            r.move_to([0, 1.35 - 0.98 * i, 0]).align_to(np.array([-6.3, 0, 0]), LEFT)
        X0 = [3.6, -0.3, 0]
        F0 = M(r"\int", "f(", "g(x)", ")", r"g'(x)\,dx", size=66).move_to(X0)
        self.go("3:42:23.87", Write(F0), run=1.0)
        self.go("3:42:25.49", Write(rows[0]), run=0.9)
        self.go("3:42:28.31", F0[2].animate.set_color(ORG), Circumscribe(F0[2], color=ORG, buff=0.08), run=0.9)
        self.go("3:42:30.67", F0[1].animate.set_color(BLUE), F0[3].animate.set_color(BLUE), run=0.5)
        nt = note("its derivative", F0[4], DOWN, PINK, 36, dist=0.7, angle=0.5)
        self.go("3:42:33.79", F0[4].animate.set_color(PINK), Circumscribe(F0[4], color=PINK, buff=0.08), run=0.9)
        self.play(FadeIn(nt), run_time=0.4)
        self.go("3:42:36.99", rows[0].animate.set_opacity(0.4), Write(rows[1]), run=1.0)
        F1 = M(r"\int", "f(", "u", ")", r"\,du", size=66).move_to(X0)
        F1[1].set_color(BLUE); F1[3].set_color(BLUE); F1[2].set_color(ORG); F1[4].set_color(PINK)
        self.go("3:42:42.59", rows[1].animate.set_opacity(0.4), Write(rows[2]), FadeOut(nt), run=0.7)
        self.go("3:42:43.35", TMT(F0, F1, key_map={"g(x)": "u", r"g'(x)\,dx": r"\,du"}), run=1.2)
        self.go("3:42:45.95", Circumscribe(F1, color=YEL, buff=0.15), run=0.9)
        F2 = M("F(", "u", ")", "+C", size=66).move_to(X0)
        F2[0].set_color(GRN); F2[2].set_color(GRN); F2[1].set_color(ORG)
        self.go("3:42:47.87", rows[2].animate.set_opacity(0.4), Write(rows[3]), run=0.6)
        self.go("3:42:48.71", TMT(F1, F2), run=1.0)
        F3 = M("F(", "g(x)", ")", "+C", size=66).move_to(X0)
        F3[0].set_color(GRN); F3[2].set_color(GRN); F3[1].set_color(ORG)
        self.go("3:42:50.19", rows[3].animate.set_opacity(0.4), Write(rows[4]), run=0.6)
        self.go("3:42:51.11", TMT(F2, F3, key_map={"u": "g(x)"}), run=0.9)


class K35_Sub1(Shot):
    """2x cos(x^2): u = x^2, du = 2x dx; 2x slides beside dx, x^2 -> u, du absorbs 2x dx; sin u + C -> sin(x^2) + C."""
    def body(self):
        self.title("A First Substitution")
        S0 = M(r"\int", "2x", r"\cos(", "x^2", ")", r"\,dx", size=68).move_to([-3.2, 1.7, 0])
        self.go("3:42:53.07", Write(S0), run=1.6)
        self.go("3:42:57.41", S0[3].animate.set_color(ORG), run=0.4)
        self.go("3:42:58.67", Circumscribe(S0[3], color=ORG, buff=0.08), run=0.8)
        nt = note(r"(x^2)' = 2x", S0[1], DOWN, PINK, 36, math=True, dist=0.6, angle=0.5)
        self.go("3:43:00.23", S0[1].animate.set_color(PINK), run=0.4)
        self.go("3:43:01.19", Circumscribe(S0[1], color=PINK, buff=0.08), FadeIn(nt), run=0.8)
        PX = 3.9
        P1 = at_eq(M("u", "=", "x^2", size=60, color=ORG), 1, PX, 1.5)
        P2 = at_eq(M(r"\frac{du}{dx}", "=", "2x", size=60, color=PINK), 1, PX, 0.3)
        P3 = at_eq(M("du", "=", r"2x\,dx", size=60, color=PINK), 1, PX, -0.95)
        self.go("3:43:03.79", Write(P1[:2]), TransformFromCopy(S0[3], P1[2]), run=0.8)
        self.go("3:43:06.37", Write(P2), run=1.0)
        self.go("3:43:09.57", Write(P3), run=0.9)
        self.play(Create(box(P3, PINK, 0.15)), run_time=0.4)
        # rewrite the integral
        J0 = M(r"\int", r"\cos(", "x^2", ")", "2x", r"\,dx", size=68)
        left_at(J0, 0, S0[0].get_left()[0], -0.1)
        J0[2].set_color(ORG); J0[4].set_color(PINK); J0[5].set_color(PINK)
        eq = M("=", size=68).next_to(J0, LEFT, buff=0.25)
        self.go("3:43:12.73", FadeOut(nt), Write(eq), TMT(S0.copy(), J0), run=1.0)
        J1 = M(r"\int", r"\cos(", "u", ")", "2x", r"\,dx", size=68)
        left_at(J1, 0, J0[0].get_left()[0], -0.1)
        J1[2].set_color(ORG); J1[4].set_color(PINK); J1[5].set_color(PINK)
        self.go("3:43:14.79", Circumscribe(J0[1:4], color=ORG, buff=0.08), run=0.8)
        self.go("3:43:16.09", TMT(J0, J1, key_map={"x^2": "u"}), run=0.8)
        ul = Line(J1[4].get_corner(DL) + DOWN * 0.12, J1[5].get_corner(DR) + DOWN * 0.12, color=PINK, stroke_width=5)
        self.go("3:43:17.99", Create(ul), run=0.5)
        J2 = M(r"\int", r"\cos(", "u", ")", r"\,du", size=68)
        left_at(J2, 0, J1[0].get_left()[0], -0.1)
        J2[2].set_color(ORG); J2[4].set_color(PINK)
        self.at("3:43:19.75")
        self.remove(ul)
        absorb(self, J1, J2, [(0, 0), (1, 1), (2, 2), (3, 3)], ([4, 5], 4), [(P3[0], 4)], run=1.0)
        self.go("3:43:22.23", Circumscribe(VGroup(eq, J2), color=GRN, buff=0.12), run=1.0)
        K = M("=", r"\sin", "u", "+C", size=68)
        at_eq(K, 0, eq.get_x(), -1.45)
        K[1].set_color(GRN); K[2].set_color(ORG); K[3].set_color(GRN)
        self.go("3:43:27.27", Write(K), run=0.9)
        Fin = M("=", r"\sin(", "x^2", ")+C", size=68, color=GRN)
        at_eq(Fin, 0, eq.get_x(), -2.75)
        Fin[0].set_color(CHALK)
        self.go("3:43:30.35", TMT(K.copy(), Fin, key_map={"u": "x^2", r"\sin": r"\sin(", "+C": ")+C"}), run=0.9)
        self.play(Create(answer_box(Fin[1:])), run_time=0.4)


class K35_Check(Shot):
    """d/dx sin(x^2) = cos(x^2) 2x: the integrand again. Then a constant off: x cos(x^2) needs 2x, fixed by x dx = du/2."""
    def body(self):
        self.title("Check It", "3:43:32.43")
        D = M(r"\frac{d}{dx}", r"\sin(x^2)", "=", r"\cos(x^2)", r"\cdot", "2x", size=68).move_to([0, 0.9, 0])
        D[0].set_color(PINK); D[1].set_color(GRN); D[5].set_color(PINK)
        self.go("3:43:34.35", Write(D[:2]), run=1.0)
        self.go("3:43:36.23", Write(D[2:4]), run=0.9)
        self.go("3:43:37.43", Write(D[4:]), run=0.5)
        O = M(r"\int", r"2x\cos(x^2)", r"\,dx", size=56, color=DIM).move_to([0, -1.2, 0])
        sl = H("started with", 36, DIM).next_to(O, LEFT, buff=0.4)
        tk = tick_mark(GRN, 0.55).next_to(O, RIGHT, buff=0.4)
        self.go("3:43:39.19", FadeIn(O, shift=UP * 0.1), FadeIn(sl), run=0.5)
        self.play(Circumscribe(D[3:], color=GRN, buff=0.1), Circumscribe(O[1], color=GRN, buff=0.08), Create(tk), run_time=0.9)
        # the number in front can be off
        self.title("Off by a Number?", "3:43:41.65")
        self.wipe(run=0.35)
        I = M(r"\int", "x", r"\cos(", "x^2", r")\,dx", size=70).move_to([0, 1.1, 0])
        I[1].set_color(PINK); I[3].set_color(ORG)
        self.go("3:43:42.55", Write(I), run=0.9)
        nt = note("need 2x", I[1], DL, YEL, 38, dist=0.7, angle=0.5)
        self.go("3:43:44.37", Circumscribe(I[1], color=PINK, buff=0.08), run=0.7)
        self.play(FadeIn(nt), run_time=0.4)
        fx = M(r"x\,dx", "=", r"\frac{1}{2}\,du", size=62, color=PINK).move_to([1.2, -1.3, 0])
        fp = pill("constants are fine", GRN, 36).move_to([0, -2.8, 0])
        self.go("3:43:46.55", Write(fx), run=0.8)
        self.go("3:43:47.45", FadeIn(fp, scale=0.9), run=0.5)


class K35_Const(Shot):
    """(3x+1)^5: u = 3x+1, du = 3 dx, only dx there -> dx = du/3; 1/3 integral u^5 du = u^6/18 + C."""
    def body(self):
        self.title("Fixing a Constant")
        I = M(r"\int", "(", "3x+1", ")^5", r"\,dx", size=68).move_to([-3.4, 1.5, 0])
        I[2].set_color(ORG)
        self.go("3:43:49.15", Write(I), run=1.4)
        PX = 3.9
        P1 = at_eq(M("u", "=", "3x+1", size=60, color=ORG), 1, PX, 1.5)
        P2 = at_eq(M("du", "=", "3", r"\,dx", size=60, color=PINK), 1, PX, 0.35)
        P3 = at_eq(M("dx", "=", r"\frac{1}{3}", r"\,du", size=60, color=PINK), 1, PX, -0.95)
        P3[2].set_color(ORG)
        self.go("3:43:53.59", Write(P1[:2]), TransformFromCopy(I[2], P1[2]), run=0.8)
        self.go("3:43:56.39", Write(P2), run=1.0)
        self.go("3:43:59.69", Circumscribe(I[4], color=YEL, buff=0.08), run=0.8)
        self.go("3:44:01.27", Circumscribe(P2[2], color=RED, buff=0.08), run=0.7)
        self.go("3:44:03.25", Circumscribe(P2[2:], color=PINK, buff=0.08), run=0.6)
        self.go("3:44:04.35", Write(P3), run=1.0)
        # substitute
        K = M("=", r"\int", "u^5", r"\cdot", r"\frac{1}{3}", r"\,du", size=68)
        left_at(K, 1, I[0].get_left()[0], -0.05)
        K[2][0].set_color(ORG); K[4].set_color(ORG); K[5].set_color(PINK)
        Ic = I.copy()
        self.go("3:44:06.77", Ic.animate.move_to(K[1:].get_center()).align_to(K[1], LEFT), Write(K[0]), run=0.6)
        self.at("3:44:07.81")
        self.play(ReplacementTransform(Ic[0], K[1]), ReplacementTransform(VGroup(Ic[1], Ic[2], Ic[3]), K[2]),
                  Ic[4].animate.scale(0.15).move_to(K[5]).set_opacity(0), run_time=0.8)
        self.remove(Ic[4])
        self.go("3:44:09.29", Write(K[3]), TransformFromCopy(P3[2], K[4]), TransformFromCopy(P3[3], K[5]), run=0.8)
        settle(self, K)
        L = M("=", r"\frac{1}{3}", r"\int", "u^5", r"\,du", size=68)
        at_eq(L, 0, K[0].get_x(), K[0].get_y())
        L[1].set_color(ORG); L[3][0].set_color(ORG); L[4].set_color(PINK)
        self.go("3:44:11.65", TMT(K, L), run=1.0)
        self.go("3:44:13.79", Circumscribe(L[2:], color=YEL, buff=0.08), run=0.8)
        R4 = M("=", r"\frac{1}{3}", r"\cdot", r"\frac{u^6}{6}", "=", r"\frac{u^6}{18}+C", size=68)
        at_eq(R4, 0, K[0].get_x(), -1.95)
        R4[1].set_color(ORG); R4[5].set_color(GRN)
        self.go("3:44:16.07", Write(R4[:4]), run=1.2)
        self.go("3:44:19.73", Write(R4[4:]), run=1.0)
        # put x back
        self.go("3:44:23.27", FadeOut(VGroup(P2, P3)), run=0.4)
        Fin = M(r"\frac{(3x+1)^6}{18}+C", size=68, color=GRN).move_to([3.9, -0.3, 0])
        ar = CurvedArrow(R4[5].get_right() + RIGHT * 0.15, Fin.get_bottom() + DOWN * 0.15, angle=0.8, color=ORG, stroke_width=3, tip_length=0.16)
        self.go("3:44:24.51", Create(ar), Write(Fin), run=1.2)
        self.play(Create(answer_box(Fin)), run_time=0.4)


class K35_MissingX(Shot):
    """A number in front can be fixed; a missing x cannot be pulled outside the integral."""
    def body(self):
        self.title("Numbers, Yes. Extra x, No.")
        A = VGroup(H("a number", 40, GRN), M(r"3\,dx", r"\;\Rightarrow\;", r"dx = \frac{1}{3}\,du", size=56))
        A.arrange(RIGHT, buff=0.45).move_to([-0.4, 1.35, 0])
        tk = tick_mark(GRN, 0.5).next_to(A, RIGHT, buff=0.4)
        self.go("3:44:29.65", FadeIn(A, shift=DOWN * 0.1), run=0.7)
        self.play(Create(tk), run_time=0.4)
        B = M(r"\int", "x^2", r"(3x+1)^5\,dx", size=70).move_to([1.0, -0.65, 0])
        B[1].set_color(RED)
        self.go("3:44:31.65", A.animate.set_opacity(0.45), tk.animate.set_opacity(0.45), run=0.5)
        self.go("3:44:34.69", Write(B[0]), Write(B[2]), run=1.4)
        self.go("3:44:38.09", Write(B[1]), run=0.6)
        self.go("3:44:39.79", Circumscribe(B[1], color=RED, buff=0.08), run=0.8)
        out = B[1].copy()
        self.go("3:44:42.79", out.animate.next_to(B[0], LEFT, buff=0.3), run=0.8)
        sk = strike(out)
        self.play(Create(sk), run_time=0.4)
        dm = pill("different method", YEL, 38).move_to([0, -2.6, 0])
        self.go("3:44:45.43", FadeIn(dm, scale=0.9), run=0.5)


class K35_RootSub(Shot):
    """x sqrt(x^2+4): u = x^2+4, du = 2x dx, x dx = du/2; 1/2 integral u^(1/2) du = 1/3 u^(3/2) -> 1/3 (x^2+4)^(3/2) + C."""
    def body(self):
        self.title("A Root Example")
        I = M(r"\int", "x", r"\sqrt{x^2+4}", r"\,dx", size=68).move_to([-3.4, 1.5, 0])
        I[2][-4:].set_color(ORG)
        self.go("3:44:47.33", Write(I), run=1.6)
        PX = 3.9
        P1 = at_eq(M("u", "=", "x^2+4", size=60, color=ORG), 1, PX, 1.5)
        P2 = at_eq(M("du", "=", r"2x\,dx", size=60, color=PINK), 1, PX, 0.35)
        P3 = at_eq(M(r"x\,dx", "=", r"\frac{1}{2}", r"\,du", size=60, color=PINK), 1, PX, -0.95)
        P3[2].set_color(ORG)
        self.go("3:44:52.61", Write(P1[:2]), TransformFromCopy(I[2][-4:], P1[2]), run=0.8)
        self.go("3:44:55.23", Write(P2), run=1.0)
        self.go("3:44:58.19", Circumscribe(I[1], color=YEL, buff=0.08), Circumscribe(I[3], color=YEL, buff=0.08), run=0.9)
        self.go("3:44:59.55", Write(P3), run=1.2)
        # the integral in u
        J = M("=", r"\frac{1}{2}", r"\int", r"\sqrt{u}", r"\,du", size=68)
        left_at(J, 2, I[0].get_left()[0] + 0.9, -0.05)
        J[1].set_color(ORG); J[3][-1].set_color(ORG); J[4].set_color(PINK)
        Ic = I.copy()
        self.go("3:45:02.67", Write(J[0]), Ic.animate.move_to(J[2:].get_center()).align_to(J[2], LEFT), run=0.6)
        self.play(ReplacementTransform(Ic[0], J[2]), ReplacementTransform(Ic[2], J[3]),
                  VGroup(Ic[1], Ic[3]).animate.scale(0.15).move_to(J[4]).set_opacity(0),
                  TransformFromCopy(P3[2], J[1], path_arc=0.6), TransformFromCopy(P3[3], J[4]), run_time=1.0)
        self.remove(Ic[1], Ic[3])
        settle(self, J)
        J2 = M("=", r"\frac{1}{2}", r"\int", "u^{1/2}", r"\,du", size=68)
        at_eq(J2, 0, J[0].get_x(), J[0].get_y())
        J2[1].set_color(ORG); J2[3][0].set_color(ORG); J2[4].set_color(PINK)
        self.go("3:45:07.75", TMT(J, J2, key_map={r"\sqrt{u}": "u^{1/2}"}), run=1.0)
        RA = M("=", r"\frac{1}{2}", r"\cdot", r"\frac{u^{3/2}}{3/2}", size=68)
        at_eq(RA, 0, J[0].get_x(), -1.95)
        RB = M("=", r"\frac{1}{2}", r"\cdot", r"\frac{2}{3}u^{3/2}", "=", r"\frac{1}{3}u^{3/2}", size=68)
        at_eq(RB, 0, J[0].get_x(), -1.95)
        RA[1].set_color(ORG); RB[1].set_color(ORG); RB[5].set_color(GRN)
        self.go("3:45:10.19", Circumscribe(J2[3], color=GRN, buff=0.08), run=0.8)
        self.go("3:45:11.19", Write(RA), run=1.5)
        self.at("3:45:14.37")
        self.play(*[ReplacementTransform(RA[i], RB[i]) for i in range(4)], run_time=0.9)
        self.go("3:45:16.95", Circumscribe(RB[1:4], color=ORG, buff=0.08), run=0.8)
        self.go("3:45:18.57", Write(RB[4:]), run=0.9)
        settle(self, RB)
        # put x back
        self.go("3:45:21.21", FadeOut(VGroup(P2, P3)), run=0.4)
        Fin = M(r"\frac{1}{3}", r"(x^2+4)^{3/2}", "+C", size=64, color=GRN).move_to([3.9, -0.3, 0])
        ar = CurvedArrow(RB[5].get_right() + RIGHT * 0.15, Fin.get_bottom() + DOWN * 0.15, angle=0.8, color=ORG, stroke_width=3, tip_length=0.16)
        self.go("3:45:21.63", Create(ar), Write(Fin), run=1.3)
        self.play(Create(answer_box(Fin)), run_time=0.4)
