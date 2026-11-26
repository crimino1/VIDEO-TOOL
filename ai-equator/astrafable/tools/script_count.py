"""Split script.md into one text file per paragraph (assets/vo/pNN.txt) and report characters against the budget."""
import re, sys
from pathlib import Path
H = Path(__file__).resolve().parent.parent
s = (H / "script.md").read_text(encoding="utf-8")
ps = re.findall(r"^## (p\d+) \S+\n(.+?)(?=\n## |\Z)", s, re.S | re.M)
out = H / "assets" / "vo"; out.mkdir(parents=True, exist_ok=True)
tot = 0
for pid, t in ps:
    t = " ".join(t.split()); tot += len(t)
    (out / f"{pid}.txt").write_text(t, encoding="utf-8")
words = sum(len(t.split()) for _, t in ps)
print(f"{len(ps)} paragraphs, {tot} characters (budget 17000), {words} words, about {words / 150:.1f} min")
