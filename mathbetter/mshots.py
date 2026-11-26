"""Manim shot windows (absolute film seconds), shared by manim/*.py and shots_math.py."""
from lib import W
MSHOTS = {
    "Anticipation": (W("strange", 199) - 0.1, W("That", 212) - 0.1),
    "Question":     (W("Try", 278.5) - 0.1, W("If", 287) - 0.1),
    "SlowAdd":      (W("If", 287) - 0.1, W("Gauss", 295) - 0.1),
    "Pairs":        (W("Gauss", 295) - 0.1, W("Now", 324) - 0.1),
    "Thousand":     (W("Now", 324) - 0.1, W("Notice", 347.5) - 0.1),
    "Formula":      (W("trick", 352.5) - 0.8, W("That's", 368.8) - 0.1),
    "Forgetting":   (W("found", 440.5) - 0.2, W("second", 458) - 0.1),
    "Interleave":   (W("Some", 467) - 0.1, W("Why", 486.8) - 0.1),
    "NegQ":         (W("Here's", 508) - 0.1, W("Picture", 518.5) - 0.1),
    "Signs":        (W("Negative", 541.5) - 0.1, W("That's", 548) - 0.1),
    "Fermat":       (W("Fermat's", 568) - 0.3, W("He'd", 574) - 0.1),
    "Simplex":      (W("later", 687.5) - 0.1, W("Back", 693) - 0.1),
}
if __name__ == "__main__":
    for k, (a, b) in MSHOTS.items(): print(f"{k:13s} {a:7.2f} {b:7.2f}  {b - a:5.2f}s")
