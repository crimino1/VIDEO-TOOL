# Builder 32: middle of Chapter 11. Checking an antiderivative by differentiating, sin / e^x, splitting a fraction,
# no product rule (expand first), rewrite-first rules, three practice integrals, an initial value problem (the family
# 2x^3 - x^2 + C and the one curve through (1, 4)), physics backwards (a -> v -> s), the ball from chapter 8
# (a = -10, v = -10t + 20, s = -5t^2 + 20t), then the area problem: area under x^2 on [0, 2] by right / left / midpoint
# rectangles (3.75 / 1.75 / 2.625), Riemann, more rectangles (4 -> 8 -> 16 -> 64 -> 100 -> a million), the limit,
# and the setup with n rectangles (dx = 2/n, right ends 2/n, 4/n).
S = [
    ("3:18:47.24", "m", "K32_Check", {}),
    ("3:18:59.10", "m", "K32_TrigExp", {}),
    ("3:19:13.90", "m", "K32_SplitFrac", {}),
    ("3:19:36.10", "m", "K32_NoProduct", {}),
    ("3:20:13.85", "q", "K32_TryCard", dict(title="Try a Few", sub="Pause and try")),
    ("3:20:15.40", "m", "K32_Try", {}),
    ("3:20:37.20", "m", "K32_IVPSetup", {}),
    ("3:20:53.40", "m", "K32_IVP", {}),
    ("3:21:23.50", "m", "K32_Motion", {}),
    ("3:21:39.80", "m", "K32_Ball", {}),
    ("3:22:13.60", "m", "K32_BallPos", {}),
    ("3:22:33.60", "m", "K32_Shapes", {}),
    ("3:22:47.40", "m", "K32_UnderCurve", {}),
    ("3:23:03.30", "m", "K32_Right4", {}),
    ("3:23:33.00", "m", "K32_RightSum", {}),
    ("3:24:00.50", "m", "K32_Left", {}),
    ("3:24:27.70", "m", "K32_Mid", {}),
    ("3:24:58.20", "p", "K32_Riemann", dict(imgs=[("k32_riemann", "3:24:59.31")], title="Bernhard Riemann",
                                            caps=[("1826 - 1866", "3:25:01.49")])),
    ("3:25:03.20", "m", "K32_More", {}),
    ("3:25:31.40", "m", "K32_Limit", {}),
]
