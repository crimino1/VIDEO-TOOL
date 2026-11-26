p = "manim/s04_unit_circle.py"
s = open(p, encoding="utf-8").read()
def rep(a, b):
    global s
    assert a in s, a
    s = s.replace(a, b)
rep("new.move_to(P + v * (0.55 + 0.35 * abs(v[0])))", "new.move_to(P + v * (0.55 + 0.35 * abs(v[0])) + (RIGHT * 0.6 if abs(v[0]) < 0.3 else ORIGIN))")
rep("th.animate.set_value(450), FadeOut(coord)", "th.animate.set_value(90), FadeOut(coord)")
rep('''        num = DecimalNumber(0, num_decimal_places=0, font_size=64, color=YEL)
        num.add_updater(lambda m: m.set_value(th.get_value()))
        deg = M(r"^\circ", size=64, color=YEL)
        lab = VGroup(M(r"\theta=", size=64, color=YEL), num, deg)
        lab.add_updater(lambda m: m.arrange(RIGHT, buff=0.08).move_to([3.4, 1.6, 0]))''',
'''        num = always_redraw(lambda: H(f"angle = {int(round(th.get_value()))}°", 60, YEL).move_to([3.4, 1.6, 0]))
        lab = VGroup(num)''')
rep("lab.clear_updaters(); num.clear_updaters()", "num.clear_updaters()")
rep("m45 = M(r\"-45^\circ\", size=44, color=ORG).move_to(C0 + np.array([1.05, -0.45, 0]))", "m45 = M(r\"-45^\circ\", size=44, color=ORG).move_to(C0 + np.array([1.6, -0.45, 0]))")
open(p, "w", encoding="utf-8").write(s)
print("ok")
