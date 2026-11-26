p = "manim/s04_unit_circle.py"
s = open(p, encoding="utf-8").read()
s = s.replace('r"\text{?}"', 'r"' + chr(92) + 'text{?}"')
open(p, "w", encoding="utf-8").write(s)
