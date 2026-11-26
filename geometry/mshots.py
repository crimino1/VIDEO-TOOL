"""Manim shot windows (absolute film seconds), shared by manim/*.py and shots_geometry.py."""
from lib import W
END = 966.0   # voice ends 963.12; closing hold
MSHOTS = {
    "GeoName":    (W("The", 51.3) - 0.1, W("It", 60.3) - 0.1),
    "Roadmap":    (W("Let's", 82.8) - 0.1, W("Take", 92.6) - 0.1),
    "PointLine":  (W("Take", 92.6) - 0.1, W("Around", 134.1) - 0.1),
    "Postulates": (W("You", 148.6) - 0.1, W("Now", 184.6) - 0.1),
    "Angles":     (W("Now", 184.6) - 0.1, W("Look", 223.2) - 0.1),
    "Rigid":      (W("Now", 230.9) - 0.1, W("That's", 265.8) - 0.1),
    "AngleSum":   (W("Triangles", 278.6) - 0.1, W("Now", 306.6) - 0.1),
    "Pythag":     (W("Now", 306.6) - 0.1, W("After", 357.7) - 0.1),
    "TV":         (W("You", 387.2) - 0.1, W("Builders", 402.9) - 0.1),
    "CircleDef":  (W("Every", 423.7) - 0.1, W("Wheels", 428.0) - 0.1),
    "PiScene":    (W("and", 433.3) - 0.1, W("People", 455.9) - 0.1),
    "Archimedes": (W("People", 455.9) - 0.1, W("Now", 484.8) - 0.1),
    "Pizza":      (W("It", 503.3) - 0.1, W("Step", 524.4) - 0.1),
    "Cube":       (W("Step", 524.4) - 0.1, W("Almost", 536.9) - 0.1),
    "AntScale":   (W("An", 546.4) - 0.1, W("The", 562.6) - 0.1),
    "Hexagons":   (W("Why", 585.4) - 0.1, W("The", 604.8) - 0.1),
    "EraRays":    (W("How", 647.1) - 0.1, W("Think", 709.9) - 0.1),
    "Parallel":   (W("Now", 718.6) - 0.1, W("The", 750.0) - 0.1),
    "WhatIf":     (W("What", 775.9) - 0.1, W("In", 788.7) - 0.1),
    "GlobeTri":   (W("It", 798.2) - 0.1, W("That's", 844.7) - 0.1),
    "Flight":     (W("That's", 844.7) - 0.1, W("In", 856.0) - 0.1),
    "Spacetime":  (W("In", 856.0) - 0.1, W("And", 877.7) - 0.1),
    "GPS":        (W("Each", 887.6) - 0.1, W("So", 915.6) - 0.1),
    "Finale":     (W("So", 915.6) - 0.1, W("That's", 945.6) - 0.1),
}
if __name__ == "__main__":
    for k, (a, b) in MSHOTS.items(): print(f"{k:11s} {a:7.2f} {b:7.2f}  {b - a:5.2f}s")
