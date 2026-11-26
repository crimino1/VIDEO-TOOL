"""Manim shot windows (absolute film seconds), shared by manim/*.py and shots_euler.py."""
from lib import W
END = 662.0   # voice ends 659.50; closing hold
MSHOTS = {
    "Equations":    (W("Most", 16.1) - 0.1, W("When", 26.0) - 0.1),
    "Ramanujan":    (W("The", 35.3) - 0.1, W("The", 42.4) - 0.1),
    "Winner":       (W("The", 42.4) - 0.1, W("When", 49.9) - 0.1),
    "Puzzle":       (W("So", 59.6) - 0.1, W("Start", 70.4) - 0.1),
    "Cast":         (W("Start", 70.4) - 0.1, W("In", 84.7) - 0.1),
    "One":          (W("The", 96.3) - 0.1, W("The", 103.9) - 0.1),
    "Pi":           (W("The", 103.9) - 0.1, W("The", 125.6) - 0.1),
    "MeetE":        (W("The", 125.6) - 0.1, W("Let's", 130.4) - 0.1),
    "Interest":     (W("You", 137.1) - 0.1, W("The", 181.9) - 0.1),
    "Squares":      (W("And", 190.3) - 0.1, W("For", 218.3) - 0.1),
    "Recap":        (W("So", 238.5) - 0.1, W("So", 252.4) - 0.1),
    "Road":         (W("So", 252.4) - 0.1, W("So", 274.9) - 0.1),
    "Quarter":      (W("So", 274.9) - 0.1, W("You", 308.6) - 0.1),
    "Sideways":     (W("The", 323.3) - 0.1, W("Now", 327.7) - 0.1),
    "Growth":       (W("Now", 327.7) - 0.1, W("Tie", 348.2) - 0.1),
    "Sideways2":    (W("It", 357.8) - 0.1, W("Let's", 379.0) - 0.1),
    "Walk":         (W("Let's", 379.0) - 0.1, W("Now", 419.9) - 0.1),
    "Quiz":         (W("Now", 419.9) - 0.1, W("If", 444.1) - 0.1),
    "Steps":        (W("If", 444.1) - 0.1, W("All", 479.3) - 0.1),
    "EulerFormula": (W("It", 490.8) - 0.1, W("The", 510.0) - 0.1),
    "Spin":         (W("The", 537.8) - 0.1, W("The", 551.7) - 0.1),
    "Phasor":       (W("Engineers", 556.4) - 0.1, W("Sound", 563.7) - 0.1),
    "Fourier":      (W("The", 568.8) - 0.1, W("So", 573.3) - 0.1),
    "Schrodinger":  (W("And", 578.8) - 0.1, W("So", 589.1) - 0.1),
    "Finale":       (W("What", 600.5) - 0.1, W("Go", 633.3) - 0.1),
    "Final":        (W("So", 648.3) - 0.1, END - 1.5),
}
if __name__ == "__main__":
    for k, (a, b) in MSHOTS.items(): print(f"{k:13s} {a:7.2f} {b:7.2f}  {b - a:5.2f}s")
