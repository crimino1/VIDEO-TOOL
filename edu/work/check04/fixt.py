p = "manim/s04_unit_circle.py"
s = open(p, encoding="utf-8").read()
def rep(a, b):
    global s
    assert a in s, a
    s = s.replace(a, b)
rep('''            if ang:
                self.go(t0, th.animate.set_value(ang), run=0.9)
            for cell, t in zip(cells, ts):''', '''            for j, (cell, t) in enumerate(zip(cells, ts)):
                if j == 0 and ang:
                    self.go(t0, th.animate.set_value(ang), Write(cell), run=0.8)
                    continue''')
rep('''        self.title("Cosine of 210°", "18:10.2")
        self.play(Create(ra), run_time=0.4)''', '''        self.add(ra)
        self.title("Cosine of 210°", "18:09.9")''')
rep('self.go("18:29.5", th.animate.set_value(315), run=1.2)', 'self.go("18:29.3", th.animate.set_value(315), run=0.65)')
rep('self.go("18:47.56", th.animate.set_value(750), run=4.3, rate_func=smooth)', 'self.go("18:47.56", th.animate.set_value(750), run=2.8, rate_func=smooth)')
open(p, "w", encoding="utf-8").write(s)
print("ok")
