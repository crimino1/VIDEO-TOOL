from sc_lib import *

RADIO, MICRO, IR, UVC = "#9fc4ff", "#5fe3c0", "#ff7a45", "#a77bff"


def cols(c):
    return [ManimColor(x) for x in (c if isinstance(c, (list, tuple)) else [c] * len(RAINBOW))]


class SpecWave(VGroup):
    """Glowing travelling sine; k, amp and colour are trackers so it never stops moving.
    Phase advances by k*v*dt, so every size travels at the same speed (like light)."""

    def __init__(self, k, y=0.0, A=1.0, x0=-6.6, x1=6.6, color=GOLD, v=1.6, width=4, n=900):
        super().__init__()
        self.k, self.amp, self.blend, self.op = ValueTracker(k), ValueTracker(0), ValueTracker(1), ValueTracker(1)
        self.y, self.A, self.v, self.phi = y, A, v, 0.0
        self.xs = np.linspace(x0, x1, n)
        self.c0 = self.c1 = cols(color)
        for w, o in ((width + 14, 0.08), (width + 6, 0.16), (width, 1)):
            self.add(VMobject(stroke_width=w, stroke_opacity=o).set_sheen_direction(RIGHT))
        self.add_updater(lambda m, dt: m.step(dt))
        self.step(0)

    def to(self, color):
        """Start a colour change; animate self.blend 0 -> 1."""
        b = self.blend.get_value()
        self.c0 = [interpolate_color(a, c, b) for a, c in zip(self.c0, self.c1)]
        self.c1 = cols(color)
        self.blend.set_value(0)
        return self.blend.animate.set_value(1)

    def step(self, dt):
        k = self.k.get_value()
        self.phi += k * self.v * dt
        ys = self.y + self.A * self.amp.get_value() * np.sin(k * self.xs - self.phi)
        pts = np.column_stack([self.xs, ys, 0 * ys])
        b = self.blend.get_value()
        cs = [interpolate_color(a, c, b) for a, c in zip(self.c0, self.c1)]
        for (m, o) in zip(self, (0.08, 0.16, 1)):
            m.set_points_as_corners(pts)
            m.set_stroke(color=cs, opacity=o * self.op.get_value())


class Spectrum(Shot):
    def body(self):
        lab = label("Any size", INK)
        ws = [SpecWave(0.9, 1.95, 0.42, color=RADIO), SpecWave(2.2, 0.75, 0.42, color=GOLD), SpecWave(5.5, -0.45, 0.42, color=UVC)]
        self.add(*ws)
        self.play(FadeIn(lab), *[w.amp.animate.set_value(1) for w in ws], run_time=0.9)
        # any size: the wavelengths stretch and squeeze
        self.go("6:20.20", ws[0].k.animate.set_value(0.6), ws[1].k.animate.set_value(3.2), ws[2].k.animate.set_value(8.0), run=0.6)
        self.play(ws[0].k.animate.set_value(1.1), ws[1].k.animate.set_value(1.7), ws[2].k.animate.set_value(4.5), run_time=0.6)
        # what our eyes see: a small slice
        eye = emoji("1f440", 0.95).move_to([-2.3, -2.45, 0])
        strip = rainbow_strip(-1.2, 1.6, -2.45, 0.42)
        note = H("our eyes: only this bit", 36).next_to(strip, RIGHT, buff=0.35)
        self.go("6:21.52", FadeIn(eye, scale=0.6), FadeIn(strip), run=0.4)
        self.play(Write(note), run_time=0.6)
        # one long wave: radio
        self.go("6:23.80", *[w.op.animate.set_value(0) for w in ws], FadeOut(VGroup(strip, note)), FadeOut(eye), run=0.4)
        self.remove(*ws)
        w = SpecWave(TAU / 11, -0.2, 1.3, color=RADIO, n=1000)
        self.add(w)
        self.play(w.amp.animate.set_value(1), run_time=0.8)
        # one-wavelength ruler that follows k
        ruler = VMobject(stroke_color=INK, stroke_width=3)

        def up_r(m):
            L = TAU / w.k.get_value() / 2
            m.set_points_as_corners([[-L, -1.85, 0], [-L, -2.15, 0], [-L, -2.0, 0], [L, -2.0, 0], [L, -1.85, 0], [L, -2.15, 0]])

        up_r(ruler)
        ruler.add_updater(up_r)
        rl = H("one wavelength", 34).move_to([0, -2.45, 0])
        self.play(Create(ruler), FadeIn(rl), run_time=0.5)

        cur = {"name": None, "sub": None}

        def name(txt, code, color):
            g = Group(T(txt, 66, color, weight=BOLD), emoji(code, 1.05)).arrange(RIGHT, buff=0.35).move_to([0, 2.35, 0])
            return g

        def sub(txt):
            return T(txt, 40).move_to([0, -3.2, 0])

        def show_name(t, g):
            out = [FadeOut(cur[k]) for k in ("name", "sub") if cur[k] is not None]
            cur["name"], cur["sub"] = g, None
            self.go(t, *out, FadeIn(g, scale=0.85), run=0.4)

        def show_sub(t, s):
            out = [FadeOut(cur["sub"])] if cur["sub"] is not None else []
            cur["sub"] = s
            self.go(t, *out, FadeIn(s, shift=UP * 0.15), run=0.35)

        def shorten(t, lam, color, *extra, run=0.9):
            out = [FadeOut(cur[k]) for k in ("name", "sub") if cur[k] is not None]
            cur["name"] = cur["sub"] = None
            self.go(t, w.k.animate.set_value(TAU / lam), w.to(color), *out, *extra, run=run, rate_func=rate_functions.ease_in_out_sine)

        show_name("6:25.84", name("RADIO", "1f4fb", RADIO))
        shorten("6:27.36", 4.4, MICRO)
        show_name("6:28.60", name("MICROWAVES", "1f372", MICRO))
        show_sub("6:29.86", sub("heating up your leftovers"))
        shorten("6:31.86", 2.0, IR)
        show_name("6:32.95", name("INFRARED", "1f525", IR))
        show_sub("6:33.92", sub("the warmth from a campfire"))
        shorten("6:35.30", 1.0, GOLD, run=0.75)
        show_name("6:36.15", name("VISIBLE LIGHT", "1f308", INK))
        band = rainbow_strip(-7.2, 7.2, -0.2, 2.9).set_opacity(0.22)
        self.add(band)
        self.bring_to_front(w)
        band.set_opacity(0)
        self.go("6:37.40", w.to(RAINBOW), band.animate.set_opacity(0.22), run=0.35)
        show_sub("6:37.75", sub("all the colours of the rainbow"))
        shorten("6:38.90", 0.55, UVC, FadeOut(band), run=0.45)
        show_name("6:39.36", name("ULTRAVIOLET", "1f3d6", UVC))
        show_sub("6:40.44", sub("the stuff that gives you sunburn"))


def regions():
    """(name, x0, x1) of the band, long waves left."""
    return [("radio", -22, -2.4), ("micro", -2.4, -0.5), ("infrared", -0.5, 1.15), ("visible", 1.15, 1.55), ("UV", 1.55, 3.2), ("X-ray", 3.2, 5.4), ("", 5.4, 22)]


class Spectrum2(Shot):
    def body(self):
        clock = tracker_time(self)
        fr = self.camera.frame
        follow_bg(self)
        H0 = 1.5
        band = Rectangle(width=44, height=H0, fill_color="#14223a", fill_opacity=1, stroke_color=DIM, stroke_width=2)
        seps = VGroup(*[Line([x, -H0 / 2, 0], [x, H0 / 2, 0], stroke_color=DIM, stroke_width=1.5, stroke_opacity=0.6) for _, x, _ in regions()[1:]])
        VX0, VX1 = 1.15, 1.55
        VC = np.array([(VX0 + VX1) / 2, 0, 0])
        vis = rainbow_strip(VX0, VX1, 0, H0, step=1.0)
        # one wave whose size shrinks from left to right: phase = (k0/a) e^{a(x+6.4)}
        k0, a, A = 0.9, 0.33, 0.52
        xs = np.unique(np.concatenate([np.linspace(-22, -6.4, 300), np.linspace(-6.4, 6.4, 2600), np.linspace(VX0, VX1, 400)]))
        ph = (k0 / a) * np.exp(a * (xs + 6.4))
        taper = np.clip((6.4 - xs) / 0.9, 0, 1)
        ys = A * taper * np.sin(ph - ph[0])
        pts = np.column_stack([xs, ys, 0 * xs])
        wave = VGroup(*[VMobject(stroke_color=GOLD, stroke_width=w, stroke_opacity=o).set_points_as_corners(pts) for w, o in ((12, 0.1), (3, 1))])
        names = VGroup()
        for nm, x0, x1 in regions():
            if nm in ("", "visible"):
                continue
            x = {"radio": -4.4}.get(nm, (x0 + x1) / 2)
            names.add(T(nm, 34).move_to([x, -1.25, 0]))
        vname = T("visible", 34, weight=BOLD).move_to([VC[0], 1.22, 0])
        vname.set_color_by_gradient(wl_rgb(650), wl_rgb(580), wl_rgb(520), wl_rgb(450))
        lines = [T(s, 52) for s in ("all the same thing", "every one of them", "just different sizes of the same wave")]
        for l in lines:
            l.move_to([0, 2.65, 0])
        fr.add_updater(lambda m, dt: m.scale(np.exp(-0.006 * dt)))
        self.play(FadeIn(band), FadeIn(seps), FadeIn(vis), Create(wave, run_time=1.0), FadeIn(lines[0], shift=UP * 0.15), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(n, shift=UP * 0.15) for n in [*names[:3], vname, *names[3:]]], lag_ratio=0.25), run_time=0.65)
        # a little pulse of light runs along the wave
        px = ValueTracker(-7)
        pulse = glow_dot(WHITE, 0.07)
        pulse.add_updater(lambda m: m.move_to([px.get_value(), np.interp(px.get_value(), xs, ys), 0]))
        px.add_updater(lambda m, dt: m.set_value(-7 + ((m.get_value() + 7 + 3.0 * dt) % 14)))
        self.add(px, pulse)
        self.go("6:48.75", FadeOut(lines[0]), run=0.15)
        self.play(FadeIn(lines[1]), run_time=0.25)
        self.go("6:49.88", FadeOut(lines[1]), run=0.15)
        self.play(FadeIn(lines[2]), run_time=0.25)
        # zoom into the rainbow: exponential zoom on a log-width tracker
        fr.clear_updaters()
        W0 = fr.width
        C0 = fr.get_center().copy()
        W1, W2 = VX1 - VX0, config.frame_width * 3.1
        C2 = np.array([0.3, 3.1, 0])
        L = ValueTracker(np.log(W0))
        state = {"from": (W0, C0), "to": (W1, VC)}

        def up_fr(m):
            (wa, ca), (wb, cb) = state["from"], state["to"]
            u = (L.get_value() - np.log(wa)) / (np.log(wb) - np.log(wa))
            m.set_width(np.exp(L.get_value()))
            m.move_to(ca + (cb - ca) * u)

        fr.add_updater(up_fr)
        self.add(L)
        reg = [(m, m.get_stroke_width()) for m in [*wave, band, *seps]]
        keeper = Mobject()
        keeper.add_updater(lambda m: [x.set_stroke(width=w0 * min(fr.width / W0, (fr.width / W0) ** 0.4)) for x, w0 in reg])
        self.add(keeper)
        # the overlay wave seen inside the slice when zoomed in
        sw = SpecWave(TAU / (W1 / 2.2), 0, 0.045, VX0, VX1, WHITE, v=0.05, width=6, n=400)
        self.go("6:52.65", FadeOut(lines[2]), FadeOut(pulse), FadeOut(vname), run=0.3)
        self.play(L.animate.set_value(np.log(W1)), wave.animate.set_stroke(opacity=0), run_time=1.6, rate_func=rate_functions.ease_in_out_sine)
        reg.extend((m, m.get_stroke_width()) for m in sw)
        self.add(sw)
        self.play(sw.amp.animate.set_value(1), run_time=0.4)
        # zoom far out: the rainbow is a sliver of a huge dim band
        self.at("6:55.20")
        state["from"], state["to"] = (W1, VC), (W2, C2)
        L.set_value(np.log(W1))
        self.bring_to_front(vis)
        self.play(L.animate.set_value(np.log(W2)), sw.op.animate(run_time=0.5).set_value(0), wave.animate.set_stroke(opacity=0.6), FadeOut(names), FadeOut(seps),
                  run_time=2.2, rate_func=rate_functions.ease_in_out_sine)
        self.remove(sw)
        s = 3.1
        d = doodle("you are here", VC + np.array([-6.5, 5.4, 0]), VC + UP * 1.0, INK, size=int(44 * s), angle=-0.5)
        eyes = emoji("1f440", 0.9 * s).next_to(d[0], RIGHT, buff=0.25 * s)
        ring = Circle(radius=1.1, stroke_color=INK, stroke_width=4).move_to(VC)
        reg.extend([(d[1], 4), (ring, 4)])
        # keep drifting out slowly
        state["from"], state["to"] = (W2, C2), (W2 * 1.06, C2 + UP * 0.2)
        L.set_value(np.log(W2))
        self.go("6:57.60", Write(d[0]), Create(d[1]), FadeIn(eyes, scale=0.6), Create(ring), run=0.6)
        at = H("all the time", int(42 * s), INK).move_to(VC + DOWN * 3.2)
        self.go("6:59.50", Write(at), run=0.6)
        self.play(L.animate.set_value(np.log(W2 * 1.06)), run_time=self.END - self.now() - 0.05, rate_func=linear)
