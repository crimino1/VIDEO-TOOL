p = "manim/s04_unit_circle.py"
s = open(p, encoding="utf-8").read()
def rep(a, b):
    global s
    assert a in s, a
    s = s.replace(a, b)
rep("\n\nclass K04_Practice(Shot):", '''

def practice_panel(qs):
    """Panel sized for the questions plus the answers written after them."""
    ans = VGroup(*[M(ANS[k], size=54).next_to(qs[k], RIGHT, buff=0.2) for k in range(4)])
    return panel(VGroup(qs, ans), PURP, buff=0.3)


class K04_Practice(Shot):''')
s = s.replace("pan = panel(qs, PURP, buff=0.35)", "pan = practice_panel(qs)")
rep("* 1.32) for k, (s, _) in enumerate(signs)])", "* 1.48) for k, (s, _) in enumerate(signs)])")
rep('done = VGroup(tick_mark(GRN, 0.9), H("unit circle: mastered!", 48, GRN)).arrange(RIGHT, buff=0.3).to_edge(DOWN, buff=0.35)',
    'done = VGroup(tick_mark(GRN, 0.8), H("unit circle: mastered!", 44, GRN)).arrange(RIGHT, buff=0.25).move_to([3.6, -3.3, 0])')
open(p, "w", encoding="utf-8").write(s)
print(s.count("practice_panel(qs)"))
