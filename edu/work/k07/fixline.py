p = r"C:\Users\daggu222105\VIDEO-TOOL\edu\manim\s07_formulas.py"
lines = open(p, encoding="utf-8", newline="").read().replace("\r\n", "\n").split("\n")
out, skip = [], False
for ln in lines:
    if skip:
        skip = False
        continue
    if ln.startswith('        tip = TX(r"power 2'):
        out.append('        tip = TX(r"power 2 $\\rightarrow$ power 1", 40, YEL).next_to(pn, RIGHT, buff=0.4)')
        skip = not ln.rstrip().endswith("buff=0.4)")
        continue
    out.append(ln)
open(p, "w", encoding="utf-8", newline="\n").write("\n".join(out))
