"""Chair workout exercises for the user's model rig (faces -Y, standing height 1.78 m).
Each pose function is pure in loop time t (seconds) and loops seamlessly at T."""
import math
from mathutils import Vector
from rigkit import track

SEAT_TOP = 0.42                 # chair scaled to 0.87 height
SEAT_PELVIS = (0.0, -0.03, SEAT_TOP + 0.075 + 0.07)
FOOT_W = 0.12

def osc(t, T):
    return 0.5 - 0.5 * math.cos(2 * math.pi * t / T)

def side(fn):
    for s, sx in (("l", 1), ("r", -1)):
        fn(s, sx)

def seat(b, lean=3.0):
    b.hips(SEAT_PELVIS, pitch=lean * 0.4)
    b.spine(pitch=lean * 0.6, neck=-lean * 0.3, head=-lean * 0.3)

def feet_flat(b, s, sx, y=-0.42):
    b.foot(s, (sx * FOOT_W, y, 0.085), knee=(sx * 0.15, y - 0.8, 0.6))

def hold_seat(b, s, sx):
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, (sx * 0.245, -0.10, SEAT_TOP + 0.13), elbow=sh + Vector((sx * 0.25, 0.30, -0.25)), up=(0, 0, -1))

def arms_out(b, s, sx, drop=0.0):
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, sh + Vector((sx * 0.53, -0.04, -drop)), elbow=sh + Vector((sx * 0.3, 0.25, -0.25)), up=(sx, -0.05, -0.05))

# 1 Seated march: right knee then left, 2.4 s
def seated_march(b, t):
    seat(b)
    def limb(s, sx):
        ph = t if s == "r" else (t + 1.2) % 2.4
        lift = track([(0, 0), (0.45, 1), (0.75, 1), (1.2, 0), (2.4, 0)], ph)
        b.foot(s, (sx * FOOT_W, -0.40 + 0.06 * lift, 0.085 + 0.17 * lift), pitch=-8 * lift, knee=(sx * 0.15, -1.2, 0.8))
        hold_seat(b, s, sx)
    side(limb)

# 2 Arm circles: arms out, small forward circles, 1.6 s
def arm_circles(b, t):
    seat(b)
    a = 2 * math.pi * t / 1.6
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, sh + Vector((sx * 0.52, -0.03 + 0.07 * math.cos(a), 0.07 * math.sin(a))), elbow=sh + Vector((sx * 0.3, 0.3, -0.2)), up=(sx, 0, 0))
    side(limb)

# 3 Sit to stand: up 1.2 s, short hold, down 1.3 s, 3.4 s loop
def sit_to_stand(b, t):
    p = track([(0, 0), (0.35, 0), (1.55, 1), (1.85, 1), (3.15, 0), (3.4, 0)], t)
    bend = math.sin(math.pi * p)
    sx0, sy0, sz0 = SEAT_PELVIS
    pel = (0.0, sy0 + (-0.385 - sy0) * p - 0.06 * bend, sz0 + (0.95 - sz0) * p)
    b.hips(pel, pitch=1.2 + 28 * bend * (1 - 0.3 * p))
    b.spine(pitch=2 + 18 * bend, neck=-6 * bend, head=-8 * bend)
    def limb(s, sx):
        b.foot(s, (sx * FOOT_W, -0.36, 0.085), knee=(sx * 0.16, -1.2, 0.6))
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, sh + Vector((sx * 0.10, -0.53, -0.08)), elbow=sh + Vector((sx * 0.35, -0.1, -0.35)), up=(0, -1, 0))
    side(limb)

# 4 Seated overhead press: goal-post to straight up, 2.4 s
def overhead_press(b, t):
    seat(b)
    p = osc(t, 2.4)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        low = sh + Vector((sx * 0.29, -0.02, 0.22)); high = sh + Vector((sx * 0.13, -0.03, 0.53))
        b.hand(s, low.lerp(high, p), elbow=sh + Vector((sx * 0.55, 0.05, -0.15)), up=(0, 0, 1))
    side(limb)

# 5 Seated knee raise with arms out: right then left, 3.2 s
def knee_raise(b, t):
    seat(b, lean=1)
    def limb(s, sx):
        ph = t if s == "r" else (t + 1.6) % 3.2
        lift = track([(0, 0), (0.6, 1), (1.0, 1), (1.6, 0), (3.2, 0)], ph)
        b.foot(s, (sx * FOOT_W, -0.40 + 0.08 * lift, 0.085 + 0.24 * lift), pitch=-10 * lift, knee=(sx * 0.15, -1.2, 1.0))
        arms_out(b, s, sx, 0.03)
    side(limb)

# 6 Seated chest press: fists from chest to straight forward, 2.4 s
def chest_press(b, t):
    seat(b)
    p = osc(t, 2.4)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        near = sh + Vector((-sx * 0.02, -0.23, -0.13)); far = sh + Vector((-sx * 0.08, -0.53, -0.08))
        b.hand(s, near.lerp(far, p), elbow=sh + Vector((sx * 0.45, 0.25, -0.15)), up=(0, -0.2, 1))
    side(limb)

# 7 Seated torso twist: hands together at the chest, turn right then left, 3.2 s
def torso_twist(b, t):
    b.hips(SEAT_PELVIS, pitch=1.2)
    yaw = 32 * math.sin(2 * math.pi * t / 3.2)
    b.spine(pitch=2, yaw=yaw, head_yaw=yaw * 0.3)
    shL, shR = b.pos("upperarm_l"), b.pos("upperarm_r")
    c = (shL + shR) / 2; back = (shR - shL).cross(Vector((0, 0, 1))).normalized(); fwd = -back
    right = (shL - shR).normalized()
    def limb(s, sx):
        feet_flat(b, s, sx)
        b.hand(s, c + fwd * 0.27 + Vector((0, 0, -0.14)) + right * (sx * 0.035), elbow=b.pos(f"upperarm_{s}") + right * (sx * 0.4) + back * 0.1 + Vector((0, 0, -0.1)), up=(0, 0, 1))
    side(limb)

# 8 Seated leg extension: straighten right knee then left, 3.2 s
def leg_extension(b, t):
    seat(b)
    def limb(s, sx):
        ph = t if s == "r" else (t + 1.6) % 3.2
        e = track([(0, 0), (0.6, 1), (1.0, 1), (1.6, 0), (3.2, 0)], ph)
        bent = Vector((sx * FOOT_W, -0.42, 0.085)); straight = Vector((sx * FOOT_W, -0.80, 0.42))
        b.foot(s, bent.lerp(straight, e), pitch=12 * e, knee=(sx * 0.15, -1.0, 1.2))
        hold_seat(b, s, sx)
    side(limb)

# 9 Standing calf raise in front of the chair, hands on hips, 2.0 s
def calf_raise(b, t):
    p = track([(0, 0), (0.7, 1), (1.1, 1), (1.8, 0), (2.0, 0)], t)
    b.hips((0.0, -0.30, 0.95 + 0.07 * p))
    b.spine(pitch=1)
    def limb(s, sx):
        b.foot(s, (sx * FOOT_W, -0.27, 0.085 + 0.07 * p), pitch=-28 * p, toe=28 * p, knee=(sx * 0.15, -1.0, 0.5))
        b.hand(s, (sx * 0.20, -0.31, 1.00 + 0.07 * p), elbow=(sx * 0.55, -0.15, 1.15), up=(0, 0, -1))
    side(limb)

# 10 Seated biceps curl, 2.4 s
def biceps_curl(b, t):
    seat(b)
    p = osc(t, 2.4)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        down = sh + Vector((sx * 0.07, -0.05, -0.52)); up = sh + Vector((sx * 0.05, -0.21, -0.13))
        b.hand(s, down.lerp(up, p), elbow=sh + Vector((sx * 0.08, 0.45, -0.35)), up=(0, -0.3 + 0.3 * p, -1 + 2 * p))
    side(limb)

def idle(b, t):
    seat(b)
    def limb(s, sx):
        feet_flat(b, s, sx)
        b.hand(s, (sx * 0.16, -0.30, SEAT_TOP + 0.17), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.3, 0.3, -0.3)), up=(0, -1, -0.3))
    side(limb)

# ---------- belly / core set ----------
def hands_behind_head(b, s, sx):
    hd = b.pos("head"); sh = b.pos(f"upperarm_{s}")
    b.hand(s, hd + Vector((sx * 0.08, 0.075, 0.07)), elbow=sh + Vector((sx * 0.55, -0.05, 0.2)), up=(-sx, 0.2, 0.3))

# Seated side bend: hands behind head, bend right then left, 3.2 s
def side_bend(b, t):
    b.hips(SEAT_PELVIS, pitch=1.2)
    roll = 20 * math.sin(2 * math.pi * t / 3.2)
    b.spine(pitch=2, roll=roll, head=-2)
    def limb(s, sx):
        feet_flat(b, s, sx); hands_behind_head(b, s, sx)
    side(limb)

# Seated cross crunch: elbow toward the opposite knee, right then left, 3.2 s
def cross_crunch(b, t):
    b.hips(SEAT_PELVIS, pitch=1.2)
    r = track([(0, 0), (0.6, 1), (0.95, 1), (1.6, 0), (3.2, 0)], t)          # right knee up
    l = track([(0, 0), (1.6, 0), (2.2, 1), (2.55, 1), (3.2, 0)], t)          # left knee up
    yaw = -26 * r + 26 * l
    b.spine(pitch=4 + 14 * max(r, l), yaw=yaw, head=-6 * max(r, l))
    def limb(s, sx):
        lift = r if s == "r" else l
        b.foot(s, (sx * FOOT_W * 0.8, -0.38 + 0.08 * lift, 0.085 + 0.26 * lift), pitch=-10 * lift, knee=(sx * 0.12, -1.2, 1.0))
        hands_behind_head(b, s, sx)
    side(limb)

# Seated knee tuck: lean back a little, both knees up to the chest, 2.6 s
def knee_tuck(b, t):
    p = track([(0, 0), (0.9, 1), (1.3, 1), (2.3, 0), (2.6, 0)], t)
    b.hips(SEAT_PELVIS, pitch=-4 - 6 * p)
    b.spine(pitch=-6 + 4 * p, neck=4, head=6)
    def limb(s, sx):
        b.foot(s, (sx * FOOT_W, -0.40 + 0.10 * p, 0.085 + 0.24 * p), pitch=-12 * p, knee=(sx * 0.15, -1.2, 1.1))
        hold_seat(b, s, sx)
    side(limb)

# Seated flutter kicks: lean back, legs out low, small alternating kicks, 1.2 s
def flutter_kicks(b, t):
    b.hips(SEAT_PELVIS, pitch=-10)
    b.spine(pitch=-8, neck=6, head=8)
    a = math.sin(2 * math.pi * t / 1.2)
    def limb(s, sx):
        k = a if s == "r" else -a
        b.foot(s, (sx * FOOT_W * 0.9, -0.74, 0.27 + 0.07 * k), pitch=15, knee=(sx * 0.12, -1.0, 1.3))
        hold_seat(b, s, sx)
    side(limb)

# Seated twist punches: guard at the chin, punch across the body with a twist, 1.6 s
def twist_punch(b, t):
    b.hips(SEAT_PELVIS, pitch=1.2)
    r = track([(0, 0), (0.25, 1), (0.5, 1), (0.8, 0), (1.6, 0)], t)          # right arm punches
    l = track([(0, 0), (0.8, 0), (1.05, 1), (1.3, 1), (1.6, 0)], t)
    b.spine(pitch=3, yaw=22 * r - 22 * l, head_yaw=-8 * r + 8 * l)
    shL, shR = b.pos("upperarm_l"), b.pos("upperarm_r")
    c = (shL + shR) / 2; back = (shR - shL).cross(Vector((0, 0, 1))).normalized(); fwd = -back; right = (shL - shR).normalized()
    def limb(s, sx):
        feet_flat(b, s, sx)
        p = r if s == "r" else l
        sh = b.pos(f"upperarm_{s}")
        guard = c + fwd * 0.20 + right * (sx * 0.10) + Vector((0, 0, 0.10))
        punch = c + fwd * 0.55 + right * (-sx * 0.06) + Vector((0, 0, 0.02))
        b.hand(s, guard.lerp(punch, p), elbow=sh + right * (sx * 0.35) + Vector((0, 0, -0.35)), up=fwd)
    side(limb)

# Seated woodchopper: clasped hands from high left to low right, then high right to low left, 6.4 s
def woodchopper(b, t):
    b.hips(SEAT_PELVIS, pitch=1.2)
    half = t % 3.2; side_k = 1 if t < 3.2 else -1      # +1: high on his left, chop to his right knee
    p = track([(0, 0), (1.3, 1), (1.6, 1), (2.9, 0), (3.2, 0)], half)   # 0 high, 1 low
    yaw = side_k * (25 - 50 * p)
    b.spine(pitch=4 + 22 * p, yaw=yaw, roll=side_k * (6 - 12 * p))
    shL, shR = b.pos("upperarm_l"), b.pos("upperarm_r")
    c = (shL + shR) / 2
    high = Vector((side_k * 0.50, -0.22, c.z + 0.44)); low = Vector((-side_k * 0.24, -0.42, SEAT_TOP + 0.18))
    hc = high.lerp(low, p)
    def limb(s, sx):
        feet_flat(b, s, sx, y=-0.44)
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, hc + Vector((sx * 0.035, 0, 0)), elbow=sh + Vector((sx * 0.35, 0.1, -0.3)), up=(hc - c).normalized())
    side(limb)

# name -> (pose fn, loop seconds, muscles, standing camera?, display name)
EXERCISES = {
    "side_bend": (side_bend, 3.2, ["obliques", "abs"], False, "Seated Side Bend"),
    "cross_crunch": (cross_crunch, 3.2, ["abs", "obliques", "hipflexors"], False, "Seated Cross Crunch"),
    "knee_tuck": (knee_tuck, 2.6, ["abs", "hipflexors"], False, "Seated Knee Tuck"),
    "flutter_kicks": (flutter_kicks, 1.2, ["abs", "hipflexors", "quads"], False, "Seated Flutter Kicks"),
    "twist_punch": (twist_punch, 1.6, ["obliques", "abs", "shoulders"], False, "Seated Twist Punches"),
    "woodchopper": (woodchopper, 6.4, ["obliques", "abs", "shoulders"], False, "Seated Woodchopper"),
    "seated_march": (seated_march, 2.4, ["hipflexors", "quads", "abs"], False, "Seated March"),
    "arm_circles": (arm_circles, 1.6, ["shoulders", "traps"], False, "Arm Circles"),
    "sit_to_stand": (sit_to_stand, 3.4, ["quads", "glutes", "hamstrings"], True, "Sit to Stand"),
    "overhead_press": (overhead_press, 2.4, ["shoulders", "triceps", "traps"], False, "Seated Overhead Press"),
    "knee_raise": (knee_raise, 3.2, ["abs", "hipflexors", "quads", "shoulders"], False, "Knee Raise, Arms Out"),
    "chest_press": (chest_press, 2.4, ["chest", "triceps", "shoulders"], False, "Seated Chest Press"),
    "torso_twist": (torso_twist, 3.2, ["obliques", "abs"], False, "Seated Torso Twist"),
    "leg_extension": (leg_extension, 3.2, ["quads"], False, "Seated Leg Extension"),
    "calf_raise": (calf_raise, 2.0, ["calves"], True, "Standing Calf Raise"),
    "biceps_curl": (biceps_curl, 2.4, ["biceps", "forearms"], False, "Seated Biceps Curl"),
    "idle": (idle, 1.0, [], False, "Ready"),
}
ORDER = ["seated_march", "arm_circles", "sit_to_stand", "overhead_press", "knee_raise", "chest_press", "torso_twist", "leg_extension", "calf_raise", "biceps_curl"]

# ---------- Kegel / pelvic floor set ----------
def hands_thighs(b, s, sx):
    b.hand(s, (sx * 0.16, -0.30, SEAT_TOP + 0.17), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.3, 0.3, -0.3)), up=(0, -1, -0.3))

def hands_knees(b, s, sx):
    b.hand(s, (sx * 0.15, -0.43, SEAT_TOP + 0.15), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.3, 0.1, -0.35)), up=(0, -0.6, -1))

def tall(b, lift, pelvis_pitch=1.2):
    """Seated, growing a little taller as the pelvic floor lifts (lift 0..1)."""
    x, y, z = SEAT_PELVIS
    b.hips((x, y, z + 0.006 * lift), pitch=pelvis_pitch - 1.5 * lift)
    b.spine(pitch=2 - 2.5 * lift, neck=0.5 * lift, head=-1 + 1.5 * lift)

# Belly breathing + Kegel: breathe in 4 s (relax), breathe out 4 s (squeeze), hands on the belly
def breathing_kegel(b, t):
    breath = track([(0, 0), (3.6, 1), (4.0, 1), (7.6, 0), (8.0, 0)], t)   # 1 = lungs full
    x, y, z = SEAT_PELVIS
    b.hips((x, y, z), pitch=1.2)
    b.spine(pitch=2 - 3 * breath, neck=1.5 * breath, head=-1 - 1.5 * breath)
    for s, sx in (("l", 1), ("r", -1)):
        b.shoulder(s, up=6 * breath)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sp = b.pos("spine_01")
        b.hand(s, sp + Vector((sx * 0.10, -0.135 - 0.02 * breath, 0.02)), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.25, 0.12, -0.30)), up=(-sx, -0.6, 0.3))
    side(limb)

# Basic Kegel: squeeze 3 s, relax 3 s, hands on thighs
def basic_kegel(b, t):
    lift = track([(0, 0), (0.6, 1), (3.0, 1), (3.6, 0), (6.0, 0)], t)
    tall(b, lift)
    def limb(s, sx):
        feet_flat(b, s, sx); hands_thighs(b, s, sx)
    side(limb)

# Quick flicks: squeeze 1 s, relax 1 s, hands on knees
def quick_flicks(b, t):
    lift = track([(0, 0), (0.25, 1), (0.9, 1), (1.15, 0), (2.0, 0)], t)
    tall(b, lift * 0.7)
    def limb(s, sx):
        feet_flat(b, s, sx); hands_knees(b, s, sx)
    side(limb)

# Seated pelvic tilt: tuck the pelvis under as you squeeze, then return, 4 s
def pelvic_tilt(b, t):
    p = track([(0, 0), (1.3, 1), (2.0, 1), (3.3, 0), (4.0, 0)], t)
    x, y, z = SEAT_PELVIS
    b.hips((x, y + 0.02 * p, z), pitch=5 - 16 * p)
    b.spine(pitch=-2 + 12 * p, neck=-2 * p, head=2 * p)
    def limb(s, sx):
        feet_flat(b, s, sx); hands_thighs(b, s, sx)
    side(limb)

# Elevator Kegel: lift in three steps, hold, lower slowly, 8 s, hands on hips
def elevator(b, t):
    lift = track([(0, 0), (0.4, 0.33), (1.0, 0.33), (1.4, 0.66), (2.0, 0.66), (2.4, 1), (4.0, 1), (7.0, 0), (8.0, 0)], t)
    tall(b, lift)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sp = b.pos("pelvis")
        b.hand(s, sp + Vector((sx * 0.17, -0.09, 0.13)), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.32, 0.02, -0.18)), up=(sx * 0.2, -0.5, -1))
    side(limb)

# Inner thigh squeeze: press the knees together as you squeeze, 4 s
def knee_squeeze(b, t):
    p = track([(0, 0), (0.7, 1), (2.4, 1), (3.1, 0), (4.0, 0)], t)
    tall(b, p * 0.6)
    def limb(s, sx):
        kx = sx * (0.50 - 0.50 * p)
        b.foot(s, (sx * 0.15, -0.42, 0.085), knee=(kx, -1.0, 0.6))
        hold_seat(b, s, sx)
    side(limb)

# Seated knee opener (clamshell): open the knees out against the squeeze, close, 4 s
def knee_opener(b, t):
    p = track([(0, 0), (0.9, 1), (1.6, 1), (2.6, 0), (4.0, 0)], t)
    tall(b, p * 0.6)
    def limb(s, sx):
        kx = sx * (0.06 + 0.55 * p)
        b.foot(s, (sx * 0.07, -0.40, 0.085), roll=-sx * 14 * p, knee=(kx, -1.0, 0.6))
        hold_seat(b, s, sx)
    side(limb)

EXERCISES.update({
    "breathing_kegel": (breathing_kegel, 8.0, [], False, "Belly Breathing Kegel"),
    "basic_kegel": (basic_kegel, 6.0, [], False, "Basic Kegel Hold"),
    "pelvic_tilt": (pelvic_tilt, 4.0, ["abs"], False, "Seated Pelvic Tilt"),
    "quick_flicks": (quick_flicks, 2.0, [], False, "Quick Flicks"),
    "knee_squeeze": (knee_squeeze, 4.0, ["adductors"], False, "Inner Thigh Squeeze"),
    "elevator": (elevator, 8.0, [], False, "Elevator Kegel"),
    "knee_opener": (knee_opener, 4.0, ["glutes"], False, "Seated Knee Opener"),
})
KEGEL = ["breathing_kegel", "basic_kegel", "pelvic_tilt", "quick_flicks", "knee_squeeze", "elevator", "knee_opener"]

# ---------- chair abs set ----------
def arms_crossed(b, s, sx):
    o = b.pos(f"upperarm_{'r' if s == 'l' else 'l'}")
    b.hand(s, o + Vector((sx * 0.05, -0.10, -0.06)), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.04, -0.12, -0.40)), up=(0, -1, 0.4))

# Lean-back hold: arms crossed, lean back slowly, hold, sit tall again, 4.8 s
def lean_back(b, t):
    p = track([(0, 0), (1.4, 1), (2.8, 1), (4.2, 0), (4.8, 0)], t)
    b.hips(SEAT_PELVIS, pitch=1.2 - 19 * p)
    b.spine(pitch=2 - 9 * p, neck=8 * p, head=10 * p)
    def limb(s, sx):
        feet_flat(b, s, sx, y=-0.44); arms_crossed(b, s, sx)
    side(limb)

# Seated leg raise: lean back a little, both legs straighten out and up, then down, 3.6 s
def leg_raise(b, t):
    e = track([(0, 0), (0.9, 1), (1.5, 1), (2.7, 0), (3.6, 0)], t)
    b.hips(SEAT_PELVIS, pitch=-4 - 6 * e)
    b.spine(pitch=-5 + 2 * e, neck=4, head=6)
    def limb(s, sx):
        bent = Vector((sx * FOOT_W, -0.42, 0.085)); straight = Vector((sx * FOOT_W, -0.82, 0.40))
        b.foot(s, bent.lerp(straight, e), pitch=14 * e, knee=(sx * 0.15, -1.0, 1.2))
        hold_seat(b, s, sx)
    side(limb)

# Seated Russian twist: lean back, hands clasped, turn and tap beside each hip, 3.2 s
def russian_twist(b, t):
    b.hips(SEAT_PELVIS, pitch=-7)
    yaw = 40 * math.sin(2 * math.pi * t / 3.2)
    b.spine(pitch=-4, yaw=yaw, neck=3, head=4, head_yaw=yaw * 0.4)
    shL, shR = b.pos("upperarm_l"), b.pos("upperarm_r")
    c = (shL + shR) / 2; back = (shR - shL).cross(Vector((0, 0, 1))).normalized(); fwd = -back; right = (shL - shR).normalized()
    hc = c + fwd * 0.30 + Vector((0, 0, -0.30)) - right * (0.15 * yaw / 40)
    def limb(s, sx):
        feet_flat(b, s, sx, y=-0.45)
        b.hand(s, hc + right * (sx * 0.035), elbow=b.pos(f"upperarm_{s}") + right * (sx * 0.30) + back * 0.05 + Vector((0, 0, -0.2)), up=fwd)
    side(limb)

EXERCISES.update({
    "lean_back": (lean_back, 4.8, ["abs"], False, "Lean-Back Hold"),
    "leg_raise": (leg_raise, 3.6, ["abs", "hipflexors", "quads"], False, "Seated Leg Raise"),
    "russian_twist": (russian_twist, 3.2, ["obliques", "abs"], False, "Seated Russian Twist"),
})
ABS = ["seated_march", "lean_back", "knee_tuck", "side_bend", "leg_raise", "cross_crunch", "russian_twist", "flutter_kicks", "woodchopper"]

# ---------- senior leg strength set ----------
# Standing side leg raise in front of the chair, hands on hips: right leg out to the side, then left, 3.6 s
def side_leg_raise(b, t):
    r = track([(0, 0), (0.6, 1), (1.0, 1), (1.6, 0), (1.8, 0), (3.6, 0)], t)
    l = track([(0, 0), (1.8, 0), (2.4, 1), (2.8, 1), (3.4, 0), (3.6, 0)], t)
    shift = 0.035 * (r - l)                     # weight moves over the standing leg (+x = his left)
    b.hips((shift, -0.30, 0.95), roll=6 * (r - l))
    b.spine(pitch=1, roll=-4 * (r - l))
    def limb(s, sx):
        a = math.radians(30) * (r if s == "r" else l)
        hip = b.pos(f"thigh_{s}")
        L = hip.z - 0.085
        foot = Vector((hip.x + sx * L * math.sin(a), -0.27, hip.z - L * math.cos(a)))
        if a == 0: foot = Vector((sx * FOOT_W, -0.27, 0.085))
        b.foot(s, foot, roll=-sx * math.degrees(a) * 0.6, knee=(foot.x, -1.0, 0.5))
        b.hand(s, (sx * 0.20 + shift, -0.31, 1.00), elbow=(sx * 0.55 + shift, -0.15, 1.15), up=(0, 0, -1))
    side(limb)

EXERCISES.update({
    "side_leg_raise": (side_leg_raise, 3.6, ["glutes"], True, "Standing Side Leg Raise"),
})
# leg video: light only leg muscles (the abs/chair videos rendered these with abs/shoulders too)
for _k, _m in {"seated_march": ["hipflexors", "quads"], "knee_raise": ["hipflexors", "quads"],
               "leg_raise": ["quads", "hipflexors"], "flutter_kicks": ["quads", "hipflexors"]}.items():
    EXERCISES[_k] = (EXERCISES[_k][0], EXERCISES[_k][1], _m) + EXERCISES[_k][3:]
LEGS = ["seated_march", "leg_extension", "knee_raise", "knee_opener", "leg_raise", "calf_raise", "side_leg_raise", "flutter_kicks", "sit_to_stand"]

# ---------- balance set (standing in front of the chair) ----------
STAND = (0.0, -0.30, 0.95)

def stand(b, x=0.0, z=0.0, y=0.0, roll=0.0, pitch=1.0, spitch=1.0, sroll=0.0):
    b.hips((STAND[0] + x, STAND[1] + y, STAND[2] + z), pitch=pitch, roll=roll)
    b.spine(pitch=spitch, roll=sroll)

def hips_hands(b, s, sx, x=0.0, z=0.0):
    b.hand(s, (sx * 0.20 + x, -0.31, 1.00 + z), elbow=(sx * 0.55 + x, -0.15, 1.15 + z), up=(0, 0, -1))

def balance_arms(b, s, sx):
    """Arms out low to the sides for balance."""
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, sh + Vector((sx * 0.34, -0.10, -0.40)), elbow=sh + Vector((sx * 0.3, 0.25, -0.35)), up=(sx * 0.6, -0.1, -0.8))

def planted(b, s, sx, x=0.0, y=-0.27, wide=FOOT_W, **kw):
    b.foot(s, (sx * wide + x, y, 0.085), knee=(sx * 0.15 + x, -1.0, 0.5), **kw)

# Weight shift: feet apart, move the hips over the right foot, then the left, 4.0 s
def weight_shift(b, t):
    w = math.sin(2 * math.pi * t / 4.0)          # +1 over his left foot
    stand(b, x=0.075 * w, z=-0.012 * abs(w), roll=-5 * w, sroll=4 * w)
    def limb(s, sx):
        planted(b, s, sx, wide=0.18); hips_hands(b, s, sx, x=0.075 * w)
    side(limb)

# Standing march: slow, high knees, arms swing, 2.8 s
def standing_march(b, t):
    r = track([(0, 0), (0.5, 1), (0.9, 1), (1.4, 0), (2.8, 0)], t)
    l = track([(0, 0), (1.4, 0), (1.9, 1), (2.3, 1), (2.8, 0)], t)
    stand(b, x=0.03 * (r - l), roll=3 * (l - r))
    def limb(s, sx):
        lift = r if s == "r" else l; other = l if s == "r" else r
        b.foot(s, (sx * FOOT_W, -0.34 - 0.06 * lift, 0.085 + 0.30 * lift), pitch=-14 * lift, knee=(sx * 0.15, -1.2, 1.0))
        sh = b.pos(f"upperarm_{s}")
        sw = other - lift                                 # arm opposite the knee swings forward
        b.hand(s, sh + Vector((sx * 0.10, -0.12 - 0.22 * sw, -0.46 + 0.10 * max(sw, 0))), elbow=sh + Vector((sx * 0.15, 0.3, -0.3)), up=(0, -0.3, -1))
    side(limb)

# Heel-toe rock: rise onto the toes, lower, rock back onto the heels, 3.6 s
def heel_toe_rock(b, t):
    up = track([(0, 0), (0.6, 1), (1.1, 1), (1.7, 0), (3.6, 0)], t)
    hl = track([(0, 0), (1.8, 0), (2.4, 1), (2.9, 1), (3.5, 0), (3.6, 0)], t)
    stand(b, z=0.07 * up - 0.01 * hl, y=0.015 * hl, pitch=1 - 3 * hl)
    def limb(s, sx):
        b.foot(s, (sx * FOOT_W, -0.27, 0.085 + 0.07 * up + 0.012 * hl), pitch=-28 * up + 22 * hl, toe=28 * up, knee=(sx * 0.15, -1.0, 0.5))
        balance_arms(b, s, sx)
    side(limb)

# Single-leg stand: lift the right foot and hold, then the left, 8.0 s
def single_leg_stand(b, t):
    r = track([(0, 0), (0.6, 1), (3.0, 1), (3.6, 0), (4.0, 0), (8.0, 0)], t)
    l = track([(0, 0), (4.0, 0), (4.6, 1), (7.0, 1), (7.6, 0), (8.0, 0)], t)
    sway = 0.008 * math.sin(2 * math.pi * t / 1.6) * max(r, l)
    stand(b, x=0.045 * (r - l) + sway, roll=4 * (l - r))
    def limb(s, sx):
        lift = r if s == "r" else l
        b.foot(s, (sx * FOOT_W, -0.30 + 0.02 * lift, 0.085 + 0.20 * lift), pitch=-8 * lift, knee=(sx * 0.15, -1.2, 0.9))
        balance_arms(b, s, sx)
    side(limb)

# Back leg kick: lean a little, straight leg back, right then left, 3.6 s
def back_leg_kick(b, t):
    r = track([(0, 0), (0.6, 1), (1.0, 1), (1.6, 0), (1.8, 0), (3.6, 0)], t)
    l = track([(0, 0), (1.8, 0), (2.4, 1), (2.8, 1), (3.4, 0), (3.6, 0)], t)
    k = max(r, l)
    stand(b, x=0.035 * (r - l), pitch=1 + 9 * k, spitch=1 + 4 * k)
    def limb(s, sx):
        e = r if s == "r" else l
        b.foot(s, (sx * FOOT_W, -0.27 + 0.30 * e, 0.085 + 0.13 * e), pitch=18 * e, knee=(sx * 0.15, -1.0, 0.5))
        hips_hands(b, s, sx, x=0.035 * (r - l))
    side(limb)

# Front and side toe taps: right foot taps forward, out to the side, then the left, 3.2 s
def foot_taps(b, t):
    def tap(t0):
        return track([(0, 0), (t0, 0), (t0 + 0.4, 1), (t0 + 0.8, 0), (3.2, 0)], t) if t0 > 0 else track([(0, 0), (0.4, 1), (0.8, 0), (3.2, 0)], t)
    rf, rs, lf, ls = tap(0), tap(0.8), tap(1.6), tap(2.4)
    stand(b, x=0.03 * (rf + rs - lf - ls))
    def limb(s, sx):
        f, sd = (rf, rs) if s == "r" else (lf, ls)
        base = Vector((sx * FOOT_W, -0.27, 0.085))
        pos = base + Vector((0, -0.30, 0)) * f + Vector((sx * 0.28, -0.05, 0)) * sd
        pos.z += 0.05 * math.sin(math.pi * min(1, f + sd))
        b.foot(s, pos, pitch=-6 * (f + sd), knee=(pos.x + sx * 0.03, -1.0, 0.5))
        balance_arms(b, s, sx)
    side(limb)

# Heel-to-toe stand: right foot in front of the left, gentle sway, then swap, 10.0 s
def tandem_stance(b, t):
    sw = track([(0, 0), (4.4, 0), (5.0, 1), (9.4, 1), (10.0, 0)], t)    # 0: right foot in front
    sway = 0.012 * math.sin(2 * math.pi * t / 2.5)
    stand(b, x=sway, roll=-2 * sway / 0.012)
    def limb(s, sx):
        front = (1 - sw) if s == "r" else sw
        moving = 0.06 * math.sin(math.pi * sw)
        b.foot(s, (sx * 0.035, -0.17 - 0.24 * front, 0.085 + (moving if s == "l" else 0)), knee=(sx * 0.10, -1.0, 0.5))
        balance_arms(b, s, sx)
    side(limb)

EXERCISES.update({
    "weight_shift": (weight_shift, 4.0, ["glutes", "quads"], True, "Side-to-Side Weight Shift"),
    "standing_march": (standing_march, 2.8, ["hipflexors", "quads"], True, "Standing March"),
    "heel_toe_rock": (heel_toe_rock, 3.6, ["calves"], True, "Heel-Toe Rock"),
    "single_leg_stand": (single_leg_stand, 8.0, ["glutes", "quads"], True, "Single-Leg Stand"),
    "back_leg_kick": (back_leg_kick, 3.6, ["glutes", "hamstrings"], True, "Standing Back Kick"),
    "foot_taps": (foot_taps, 3.2, ["glutes", "quads"], True, "Front & Side Toe Taps"),
    "tandem_stance": (tandem_stance, 10.0, ["calves", "quads"], True, "Heel-to-Toe Stand"),
    "side_leg_raise_b": (side_leg_raise, 3.6, ["glutes"], True, "Standing Side Leg Raise"),
})
BALANCE = ["weight_shift", "standing_march", "heel_toe_rock", "single_leg_stand", "side_leg_raise_b", "back_leg_kick", "foot_taps", "tandem_stance", "sit_to_stand"]

# ---------- back pain relief set (seated stretches) ----------
def hand_thigh(b, s, sx):
    b.hand(s, (sx * 0.16, -0.32, SEAT_TOP + 0.17), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.3, 0.3, -0.3)), up=(0, -1, -0.3))

# Shoulder rolls: shrug up, roll back and down, 3.2 s
def shoulder_rolls(b, t):
    a = 2 * math.pi * t / 3.2
    seat(b)
    for s, sx in (("l", 1), ("r", -1)):
        b.shoulder(s, up=9 * (0.5 - 0.5 * math.cos(a)), back=7 * math.sin(a))
    def limb(s, sx):
        feet_flat(b, s, sx); hand_thigh(b, s, sx)
    side(limb)

# Seated cat-cow: hands on knees, round the back (chin down), then arch (chest up), 5.0 s
def cat_cow(b, t):
    c = track([(0, 0), (1.2, 1), (2.0, 1), (2.5, 0), (5.0, 0)], t)       # cat: round
    w = track([(0, 0), (2.5, 0), (3.7, 1), (4.5, 1), (5.0, 0)], t)       # cow: arch
    b.hips(SEAT_PELVIS, pitch=1.2 - 10 * c + 10 * w)
    b.spine(pitch=3 + 22 * c - 12 * w, neck=10 * c - 8 * w, head=12 * c - 14 * w)
    def limb(s, sx):
        feet_flat(b, s, sx); hands_knees(b, s, sx)
    side(limb)

# Seated side reach: right arm reaches up and over to the left, then the left arm to the right, 6.4 s
def side_reach(b, t):
    r = track([(0, 0), (1.0, 1), (2.0, 1), (3.0, 0), (3.2, 0), (6.4, 0)], t)
    l = track([(0, 0), (3.2, 0), (4.2, 1), (5.2, 1), (6.2, 0), (6.4, 0)], t)
    b.hips(SEAT_PELVIS, pitch=1.2)
    b.spine(pitch=2, roll=18 * (r - l), head=-2)
    def limb(s, sx):
        feet_flat(b, s, sx)
        reach = r if s == "r" else l
        sh = b.pos(f"upperarm_{s}")
        rest = Vector((sx * 0.16, -0.32, SEAT_TOP + 0.17))
        upv = sh + Vector((-sx * 0.12, -0.04, 0.55))
        b.hand(s, rest.lerp(upv, reach), elbow=sh + Vector((sx * 0.4, 0.25 - 0.2 * reach, -0.3 + 0.3 * reach)), up=(-sx * reach, -1 + reach, -0.3 + 1.3 * reach))
    side(limb)

# Knee hug: lift the right knee, hug it toward the chest and hold, then the left, 7.2 s
def knee_hug(b, t):
    r = track([(0, 0), (0.9, 1), (2.6, 1), (3.4, 0), (3.6, 0), (7.2, 0)], t)
    l = track([(0, 0), (3.6, 0), (4.5, 1), (6.2, 1), (7.0, 0), (7.2, 0)], t)
    k = max(r, l)
    b.hips(SEAT_PELVIS, pitch=1.2 - 6 * k)
    b.spine(pitch=2 + 6 * k, head=4 * k)
    lifted = "r" if r >= l else "l"
    for s, sx in (("l", 1), ("r", -1)):
        lift = r if s == "r" else l
        b.foot(s, (sx * FOOT_W, -0.42 + 0.14 * lift, 0.085 + 0.30 * lift), pitch=-12 * lift, knee=(sx * 0.15, -1.2, 1.1))
    kn = b.knee(lifted)
    for s, sx in (("l", 1), ("r", -1)):
        rest = Vector((sx * 0.16, -0.32, SEAT_TOP + 0.17))
        hold = kn + Vector((sx * 0.07, -0.04, -0.09))
        b.hand(s, rest.lerp(hold, min(1, k * 1.3)), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.35, 0.1, -0.3)), up=(-sx * 0.5, -0.6, -0.3))

# Seated forward fold: hinge forward, hands slide down the shins, roll back up, 6.0 s
def forward_fold(b, t):
    p = track([(0, 0), (1.8, 1), (3.4, 1), (5.2, 0), (6.0, 0)], t)
    b.hips(SEAT_PELVIS, pitch=1.2 + 22 * p)
    b.spine(pitch=3 + 30 * p, neck=8 * p, head=6 * p)
    def limb(s, sx):
        feet_flat(b, s, sx, y=-0.40)
        top = Vector((sx * 0.16, -0.32, SEAT_TOP + 0.17)); low = Vector((sx * 0.15, -0.46, 0.26))
        b.hand(s, top.lerp(low, p), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.25, 0.05, -0.35)), up=(0, -0.4, -1))
    side(limb)

# Seated hamstring stretch: right leg straight, heel down, lean forward over it; then the left, 7.2 s
def hamstring_stretch(b, t):
    r = track([(0, 0), (0.8, 1), (2.8, 1), (3.4, 0), (3.6, 0), (7.2, 0)], t)
    l = track([(0, 0), (3.6, 0), (4.4, 1), (6.4, 1), (7.0, 0), (7.2, 0)], t)
    k = max(r, l)
    b.hips(SEAT_PELVIS, pitch=1.2 + 16 * k)
    b.spine(pitch=3 + 16 * k, neck=4 * k, head=-4 * k)
    for s, sx in (("l", 1), ("r", -1)):
        e = r if s == "r" else l
        bent = Vector((sx * FOOT_W, -0.42, 0.085)); straight = Vector((sx * 0.14, -0.80, 0.11))
        b.foot(s, bent.lerp(straight, e), pitch=25 * e, knee=(sx * 0.15, -1.0, 1.0))
    sideoff = -0.14 if r >= l else 0.14
    for s, sx in (("l", 1), ("r", -1)):
        top = Vector((sx * 0.16, -0.32, SEAT_TOP + 0.17))
        reach = Vector((sideoff + sx * 0.05, -0.56, SEAT_TOP + 0.06))
        b.hand(s, top.lerp(reach, k), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.3, 0.05, -0.3)), up=(0, -0.6, -1))

# Chest opener: hands behind the head, open the elbows wide and lift the chest, 4.0 s
def chest_opener(b, t):
    p = track([(0, 0), (1.2, 1), (2.2, 1), (3.4, 0), (4.0, 0)], t)
    b.hips(SEAT_PELVIS, pitch=1.2 + 4 * p)
    b.spine(pitch=4 - 12 * p, neck=-3 * p, head=-6 * p)
    def limb(s, sx):
        feet_flat(b, s, sx)
        hd = b.pos("head"); sh = b.pos(f"upperarm_{s}")
        b.hand(s, hd + Vector((sx * 0.08, 0.075, 0.07)), elbow=sh + Vector((sx * (0.25 + 0.35 * p), -0.30 + 0.38 * p, 0.2)), up=(-sx, 0.2, 0.3))
    side(limb)

EXERCISES.update({
    "shoulder_rolls": (shoulder_rolls, 3.2, ["traps", "shoulders"], False, "Seated Shoulder Rolls"),
    "cat_cow": (cat_cow, 5.0, ["abs", "back"], False, "Seated Cat-Cow"),
    "torso_twist_b": (torso_twist, 3.2, ["obliques", "back"], False, "Seated Torso Twist"),
    "side_reach": (side_reach, 6.4, ["obliques", "back"], False, "Seated Side Reach"),
    "pelvic_tilt_b": (pelvic_tilt, 4.0, ["abs", "back"], False, "Seated Pelvic Tilt"),
    "knee_hug": (knee_hug, 7.2, ["glutes", "back"], False, "Seated Knee Hug"),
    "forward_fold": (forward_fold, 6.0, ["back", "hamstrings"], False, "Seated Forward Fold"),
    "hamstring_stretch": (hamstring_stretch, 7.2, ["hamstrings", "back"], False, "Seated Hamstring Stretch"),
    "chest_opener": (chest_opener, 4.0, ["chest", "shoulders"], False, "Seated Chest Opener"),
})
BACK = ["shoulder_rolls", "cat_cow", "torso_twist_b", "side_reach", "pelvic_tilt_b", "knee_hug", "forward_fold", "hamstring_stretch", "chest_opener"]

# ---------- arm toning set (seated) ----------
# Lateral raise: straight arms from the sides up to shoulder height, 3.0 s
def lateral_raise(b, t):
    seat(b)
    p = track([(0, 0), (1.0, 1), (1.4, 1), (2.6, 0), (3.0, 0)], t)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        low = sh + Vector((sx * 0.14, -0.03, -0.50)); high = sh + Vector((sx * 0.52, -0.05, -0.02))
        b.hand(s, low.lerp(high, p), elbow=sh + Vector((sx * 0.2, 0.35, -0.25)), up=(sx * 0.3, -0.1, -1 + p))
    side(limb)

# Overhead triceps extension: hands together behind the head, press up overhead, 3.0 s
def triceps_ext(b, t):
    seat(b)
    p = track([(0, 0), (0.9, 1), (1.3, 1), (2.4, 0), (3.0, 0)], t)          # 1 = arms straight up
    hd = b.pos("head")
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        low = hd + Vector((sx * 0.04, 0.13, 0.02)); high = hd + Vector((sx * 0.04, -0.01, 0.42))
        b.hand(s, low.lerp(high, p), elbow=sh + Vector((sx * 0.10, -0.10, 0.50)), up=(0, 0, 1))
    side(limb)

# Front raise: straight arms from the thighs up to shoulder height in front, 3.0 s
def front_raise(b, t):
    seat(b)
    p = track([(0, 0), (1.0, 1), (1.4, 1), (2.6, 0), (3.0, 0)], t)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        low = sh + Vector((sx * 0.06, -0.24, -0.46)); high = sh + Vector((sx * 0.02, -0.55, -0.03))
        b.hand(s, low.lerp(high, p), elbow=sh + Vector((sx * 0.35, 0.1, -0.25)), up=(0, -0.2 - 0.8 * p, -1 + p))
    side(limb)

# Reverse fly: arms forward at chest height, open wide and squeeze the shoulder blades, 3.0 s
def reverse_fly(b, t):
    seat(b, lean=6)
    p = track([(0, 0), (1.0, 1), (1.4, 1), (2.6, 0), (3.0, 0)], t)
    for s, sx in (("l", 1), ("r", -1)):
        b.shoulder(s, back=-6 * p)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        near = sh + Vector((-sx * 0.10, -0.50, -0.08)); wide = sh + Vector((sx * 0.48, -0.16, -0.06))
        b.hand(s, near.lerp(wide, p), elbow=sh + Vector((sx * 0.3, 0.1, -0.35)), up=(0, -1 + 0.6 * p, -0.2))
    side(limb)

EXERCISES.update({
    "arm_circles_a": (arm_circles, 1.6, ["shoulders"], False, "Arm Circles"),
    "biceps_curl_a": (biceps_curl, 2.4, ["biceps", "forearms"], False, "Seated Biceps Curl"),
    "lateral_raise": (lateral_raise, 3.0, ["shoulders"], False, "Seated Lateral Raise"),
    "overhead_press_a": (overhead_press, 2.4, ["shoulders", "triceps"], False, "Seated Overhead Press"),
    "triceps_ext": (triceps_ext, 3.0, ["triceps"], False, "Overhead Triceps Extension"),
    "chest_press_a": (chest_press, 2.4, ["chest", "triceps"], False, "Seated Chest Press"),
    "front_raise": (front_raise, 3.0, ["shoulders"], False, "Seated Front Raise"),
    "reverse_fly": (reverse_fly, 3.0, ["shoulders", "traps"], False, "Seated Reverse Fly"),
    "twist_punch_a": (twist_punch, 1.6, ["shoulders", "triceps", "chest"], False, "Seated Punches"),
})
ARMS = ["arm_circles_a", "biceps_curl_a", "lateral_raise", "overhead_press_a", "triceps_ext", "chest_press_a", "front_raise", "reverse_fly", "twist_punch_a"]

# ---------- knee pain set ----------
from mathutils import Quaternion as _Q

# Ankle pumps: legs a little forward, heels down, toes up then point down, 3.0 s
def ankle_pumps(b, t):
    seat(b)
    w = math.sin(2 * math.pi * t / 3.0)
    def limb(s, sx):
        b.foot(s, (sx * FOOT_W, -0.58, 0.085 + 0.035 * max(0.0, -w)), pitch=24 * w if w > 0 else 32 * w, knee=(sx * 0.15, -1.0, 1.0))
        hand_thigh(b, s, sx)
    side(limb)

# Heel slides: slide the right foot forward until the leg is nearly straight, back; then the left, 4.4 s
def heel_slides(b, t):
    seat(b)
    r = track([(0, 0), (1.0, 1), (1.4, 1), (2.2, 0), (4.4, 0)], t)
    l = track([(0, 0), (2.2, 0), (3.2, 1), (3.6, 1), (4.4, 0)], t)
    def limb(s, sx):
        e = r if s == "r" else l
        b.foot(s, Vector((sx * FOOT_W, -0.42, 0.085)).lerp(Vector((sx * FOOT_W, -0.80, 0.095)), e), pitch=15 * e, knee=(sx * 0.15, -1.0, 1.0))
        hold_seat(b, s, sx)
    side(limb)

# Straight leg raise: straighten the right leg, lift it, hold, lower, bend; then the left, 4.4 s
def straight_leg_raise(b, t):
    def phases(t0):
        ext = track([(0, 0), (t0, 0), (t0 + 0.4, 1), (t0 + 1.9, 1), (t0 + 2.2, 0), (4.4, 0)], t) if t0 else track([(0, 0), (0.4, 1), (1.9, 1), (2.2, 0), (4.4, 0)], t)
        lift = track([(0, 0), (t0 + 0.4, 0), (t0 + 1.0, 1), (t0 + 1.4, 1), (t0 + 1.9, 0), (4.4, 0)], t)
        return ext, lift
    er, lr = phases(0); el, ll = phases(2.2)
    lean = max(lr, ll)
    b.hips(SEAT_PELVIS, pitch=1.2 - 5 * lean)
    b.spine(pitch=2 - 3 * lean)
    def limb(s, sx):
        e, lf = (er, lr) if s == "r" else (el, ll)
        foot = Vector((sx * FOOT_W, -0.42, 0.085)).lerp(Vector((sx * FOOT_W, -0.80, 0.095)), e) + Vector((0, 0.02, 0.24)) * lf
        b.foot(s, foot, pitch=15 * e, knee=(sx * 0.15, -1.0, 1.2))
        hold_seat(b, s, sx)
    side(limb)

# Mini squat in front of the chair: arms forward, small knee bend, stand tall, 3.2 s
def mini_squat(b, t):
    p = track([(0, 0), (1.2, 1), (1.6, 1), (2.8, 0), (3.2, 0)], t)
    stand(b, y=0.06 * p, z=-0.11 * p, pitch=1 + 18 * p, spitch=1 + 6 * p)
    def limb(s, sx):
        planted(b, s, sx, wide=0.14)
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, sh + Vector((sx * 0.06, -0.48, -0.10 + 0.06 * p)), elbow=sh + Vector((sx * 0.3, -0.1, -0.35)), up=(0, -1, 0))
    side(limb)

EXERCISES.update({
    "seated_march_k": (seated_march, 2.4, ["quads", "hipflexors"], False, "Gentle Seated March"),
    "ankle_pumps": (ankle_pumps, 3.0, ["calves", "shins"], False, "Ankle Pumps"),
    "heel_slides": (heel_slides, 4.4, ["quads", "hamstrings"], False, "Seated Heel Slides"),
    "leg_extension_k": (leg_extension, 3.2, ["quads"], False, "Seated Knee Extension"),
    "straight_leg_raise": (straight_leg_raise, 4.4, ["quads", "hipflexors"], False, "Straight Leg Raise"),
    "knee_squeeze_k": (knee_squeeze, 4.0, ["adductors", "quads"], False, "Pillow Squeeze"),
    "mini_squat": (mini_squat, 3.2, ["quads", "glutes"], True, "Mini Squat"),
    "calf_raise_k": (calf_raise, 2.0, ["calves"], True, "Standing Calf Raise"),
    "sit_to_stand_k": (sit_to_stand, 3.4, ["quads", "glutes"], True, "Sit to Stand"),
})
KNEE = ["seated_march_k", "ankle_pumps", "heel_slides", "leg_extension_k", "straight_leg_raise", "knee_squeeze_k", "mini_squat", "calf_raise_k", "sit_to_stand_k"]

# ---------- neck and shoulder set (seated) ----------
_X, _Y, _Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
def neck(b, pitch=0.0, roll=0.0, yaw=0.0, hpitch=0.0):
    """Neck and head pose (degrees): roll > 0 tilts toward his left shoulder, pitch > 0 chin down."""
    r = math.radians
    b._local("neck_01", _Q(_Z, r(yaw * 0.5)) @ _Q(_Y, r(roll * 0.55)) @ _Q(_X, r(pitch)))
    b._local("head", _Q(_Z, r(yaw * 0.5)) @ _Q(_Y, r(roll * 0.45)) @ _Q(_X, r(hpitch)))

def sitting_still(b, s, sx):
    feet_flat(b, s, sx); hand_thigh(b, s, sx)

# Chin tucks: glide the head straight back (double chin), hold, release, 4.0 s
def chin_tucks(b, t):
    p = track([(0, 0), (1.0, 1), (2.2, 1), (3.2, 0), (4.0, 0)], t)
    seat(b, lean=1)
    neck(b, pitch=-12 * p, hpitch=14 * p)
    side(lambda s, sx: sitting_still(b, s, sx))

# Neck side tilt: ear toward the right shoulder, hold, then the left, 8.0 s
def neck_tilt(b, t):
    r = track([(0, 0), (1.2, 1), (3.0, 1), (4.0, 0), (8.0, 0)], t)
    l = track([(0, 0), (4.0, 0), (5.2, 1), (7.0, 1), (8.0, 0)], t)
    seat(b, lean=1)
    neck(b, roll=30 * (l - r))
    side(lambda s, sx: sitting_still(b, s, sx))

# Neck turns: look over the right shoulder, hold, back, then the left, 6.4 s
def neck_turn(b, t):
    r = track([(0, 0), (1.0, 1), (2.2, 1), (3.2, 0), (6.4, 0)], t)
    l = track([(0, 0), (3.2, 0), (4.2, 1), (5.4, 1), (6.4, 0)], t)
    seat(b, lean=1)
    neck(b, yaw=60 * (l - r))
    side(lambda s, sx: sitting_still(b, s, sx))

# Shoulder shrugs: arms hang, lift the shoulders to the ears, hold, drop, 2.4 s
def shoulder_shrugs(b, t):
    up = track([(0, 0), (0.7, 1), (1.2, 1), (1.9, 0), (2.4, 0)], t)
    seat(b, lean=1)
    for s, sx in (("l", 1), ("r", -1)):
        b.shoulder(s, up=15 * up)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, sh + Vector((sx * 0.07, -0.02, -0.55)), elbow=sh + Vector((sx * 0.2, 0.3, -0.3)), up=(0, 0, -1))
    side(limb)

# Shoulder blade squeeze: elbows bent at the sides, pull them back and squeeze, 3.0 s
def blade_squeeze(b, t):
    p = track([(0, 0), (1.0, 1), (1.6, 1), (2.6, 0), (3.0, 0)], t)
    b.hips(SEAT_PELVIS, pitch=1.2)
    b.spine(pitch=2 - 5 * p, head=-2 * p)
    for s, sx in (("l", 1), ("r", -1)):
        b.shoulder(s, back=-9 * p)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, sh + Vector((sx * 0.14, -0.30 + 0.10 * p, -0.27)), elbow=sh + Vector((sx * 0.12, 0.30 + 0.1 * p, -0.35)), up=(0, -0.3, 1))
    side(limb)

# Cross-body shoulder stretch: right arm across the chest, left hand holds it; then swap, 7.2 s
def cross_body(b, t):
    r = track([(0, 0), (0.9, 1), (2.8, 1), (3.5, 0), (3.6, 0), (7.2, 0)], t)
    l = track([(0, 0), (3.6, 0), (4.5, 1), (6.4, 1), (7.1, 0), (7.2, 0)], t)
    seat(b, lean=1)
    shL, shR = b.pos("upperarm_l"), b.pos("upperarm_r")
    c = (shL + shR) / 2
    def limb(s, sx):
        feet_flat(b, s, sx)
        me_ = r if s == "r" else l              # this arm stretches across
        other = l if s == "r" else r            # this hand holds the other arm
        sh = b.pos(f"upperarm_{s}")
        rest = Vector((sx * 0.16, -0.32, SEAT_TOP + 0.17))
        across = c + Vector((-sx * 0.30, -0.16, -0.06))
        hold = c + Vector((sx * 0.03, -0.27, -0.08))
        if me_ >= other:
            b.hand(s, rest.lerp(across, me_), elbow=c + Vector((sx * 0.05, -0.50, -0.05)).lerp(sh + Vector((sx * 0.3, 0.3, -0.3)), 1 - me_), up=(-sx, -0.2, 0))
        else:
            b.hand(s, rest.lerp(hold, other), elbow=sh + Vector((sx * 0.30, 0.05, -0.35)), up=(-sx * 0.3, -0.5, 0.6))
    side(limb)

EXERCISES.update({
    "chin_tucks": (chin_tucks, 4.0, ["neck"], False, "Chin Tucks"),
    "neck_tilt": (neck_tilt, 8.0, ["neck", "traps"], False, "Neck Side Tilt"),
    "neck_turn": (neck_turn, 6.4, ["neck"], False, "Neck Turns"),
    "shoulder_shrugs": (shoulder_shrugs, 2.4, ["traps", "neck"], False, "Shoulder Shrugs"),
    "shoulder_rolls_n": (shoulder_rolls, 3.2, ["traps", "shoulders"], False, "Shoulder Rolls"),
    "blade_squeeze": (blade_squeeze, 3.0, ["traps", "back"], False, "Shoulder Blade Squeeze"),
    "cross_body": (cross_body, 7.2, ["shoulders"], False, "Cross-Body Shoulder Stretch"),
    "chest_opener_n": (chest_opener, 4.0, ["chest", "shoulders"], False, "Seated Chest Opener"),
    "side_reach_n": (side_reach, 6.4, ["back", "shoulders"], False, "Overhead Side Reach"),
})
NECK = ["chin_tucks", "neck_tilt", "neck_turn", "shoulder_shrugs", "shoulder_rolls_n", "blade_squeeze", "cross_body", "chest_opener_n", "side_reach_n"]

# ---------- indoor walking set (standing, low impact) ----------
def swing_arms(b, s, sx, sw, lift=0.0):
    """Bent-elbow walking arm swing: sw > 0 swings this hand forward."""
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, sh + Vector((sx * 0.10, -0.12 - 0.20 * sw, -0.40 + 0.10 * max(sw, 0) + lift)), elbow=sh + Vector((sx * 0.15, 0.35, -0.30)), up=(0, -0.4, 0.6))

# Walk in place: heels lift, arms swing, 1.2 s per step pair
def walk_in_place(b, t):
    w = math.sin(2 * math.pi * t / 1.2)
    r, l = max(0.0, w), max(0.0, -w)
    stand(b, x=0.02 * (l - r), z=0.008 * (r + l))
    def limb(s, sx):
        lift = r if s == "r" else l
        b.foot(s, (sx * FOOT_W, -0.30 - 0.02 * lift, 0.085 + 0.09 * lift), pitch=-22 * lift, toe=22 * lift, knee=(sx * 0.15, -1.2, 0.8))
        swing_arms(b, s, sx, (l - r) if s == "r" else (r - l))
    side(limb)

# Step touch: step to the right, bring the left foot in, step to the left, 2.4 s
def step_touch(b, t):
    L = track([(0, 0.23), (0.6, 0.23), (1.2, 0.05), (1.8, 0.23), (2.4, 0.23)], t)
    R = track([(0, -0.05), (0.6, -0.23), (1.2, -0.23), (1.8, -0.23), (2.4, -0.05)], t)
    lift_r = math.sin(math.pi * min(1, t / 0.6)) if t < 0.6 else (math.sin(math.pi * (t - 1.8) / 0.6) if t > 1.8 else 0)
    lift_l = math.sin(math.pi * (t - 0.6) / 0.6) if 0.6 < t < 1.2 else (math.sin(math.pi * (t - 1.2) / 0.6) if 1.2 <= t < 1.8 else 0)
    hx = (L + R) / 2
    stand(b, x=hx, z=-0.02, roll=-20 * hx)
    sw = math.sin(2 * math.pi * t / 1.2)
    def limb(s, sx):
        x = L if s == "l" else R; lf = lift_l if s == "l" else lift_r
        b.foot(s, (x, -0.28, 0.085 + 0.05 * lf), pitch=-8 * lf, knee=(x + sx * 0.05, -1.0, 0.5))
        swing_arms(b, s, sx, sw if s == "r" else -sw)
    side(limb)

# Heel taps: tap the right heel forward, then the left, arms push forward, 1.6 s
def heel_taps(b, t):
    r = track([(0, 0), (0.4, 1), (0.8, 0), (1.6, 0)], t)
    l = track([(0, 0), (0.8, 0), (1.2, 1), (1.6, 0)], t)
    stand(b, x=0.03 * (l - r), z=-0.03 * (r + l))
    pf = r + l
    def limb(s, sx):
        e = r if s == "r" else l
        b.foot(s, (sx * FOOT_W, -0.27 - 0.28 * e, 0.085 + 0.015 * e), pitch=25 * e, knee=(sx * 0.15, -1.0, 0.5))
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, sh + Vector((sx * 0.06, -0.18 - 0.30 * pf, -0.22)), elbow=sh + Vector((sx * 0.3, 0.1, -0.3)), up=(0, -0.2, 1))
    side(limb)

# March with overhead press: knee up as both arms press up, 1.6 s
def march_arms_up(b, t):
    r = track([(0, 0), (0.35, 1), (0.55, 1), (0.8, 0), (1.6, 0)], t)
    l = track([(0, 0), (0.8, 0), (1.15, 1), (1.35, 1), (1.6, 0)], t)
    stand(b, x=0.03 * (r - l))
    pf = max(r, l)
    def limb(s, sx):
        lift = r if s == "r" else l
        b.foot(s, (sx * FOOT_W, -0.34 - 0.05 * lift, 0.085 + 0.24 * lift), pitch=-12 * lift, knee=(sx * 0.15, -1.2, 1.0))
        sh = b.pos(f"upperarm_{s}")
        low = sh + Vector((sx * 0.28, -0.03, 0.10)); high = sh + Vector((sx * 0.12, -0.04, 0.50))
        b.hand(s, low.lerp(high, pf), elbow=sh + Vector((sx * 0.55, 0.05, -0.15)), up=(0, 0, 1))
    side(limb)

# Walk with punches: walk in place, punch forward with each step, 1.2 s
def walk_punches(b, t):
    w = math.sin(2 * math.pi * t / 1.2)
    r, l = max(0.0, w), max(0.0, -w)
    stand(b, x=0.02 * (l - r), z=0.008 * (r + l))
    b.spine(pitch=1, yaw=10 * (r - l))
    shL, shR = b.pos("upperarm_l"), b.pos("upperarm_r")
    c = (shL + shR) / 2
    def limb(s, sx):
        lift = r if s == "r" else l
        b.foot(s, (sx * FOOT_W, -0.30 - 0.02 * lift, 0.085 + 0.09 * lift), pitch=-22 * lift, toe=22 * lift, knee=(sx * 0.15, -1.2, 0.8))
        punch = l if s == "r" else r            # punch with the arm opposite the lifted foot
        sh = b.pos(f"upperarm_{s}")
        guard = c + Vector((sx * 0.10, -0.22, -0.06)); out = c + Vector((sx * 0.02, -0.55, -0.02))
        b.hand(s, guard.lerp(out, punch), elbow=sh + Vector((sx * 0.35, 0.1, -0.35)), up=(0, -1, 0))
    side(limb)

# Standing hamstring curls: kick the right heel back toward the seat, then the left, 1.6 s
def hamstring_curls(b, t):
    r = track([(0, 0), (0.4, 1), (0.8, 0), (1.6, 0)], t)
    l = track([(0, 0), (0.8, 0), (1.2, 1), (1.6, 0)], t)
    stand(b, x=0.04 * (r - l), pitch=1 + 6 * max(r, l))
    pf = max(r, l)
    def limb(s, sx):
        e = r if s == "r" else l
        b.foot(s, (sx * FOOT_W, -0.27 + 0.22 * e, 0.085 + 0.28 * e), pitch=30 * e, knee=(sx * 0.15, -1.0, 0.25))
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, sh + Vector((sx * 0.22, -0.18, 0.30 - 0.45 * pf)), elbow=sh + Vector((sx * 0.5, 0.1, -0.2)), up=(0, -0.3, 1))
    side(limb)

EXERCISES.update({
    "walk_in_place": (walk_in_place, 1.2, ["quads", "calves", "hipflexors"], True, "Walk in Place"),
    "step_touch": (step_touch, 2.4, ["glutes", "quads", "adductors"], True, "Step Touch"),
    "heel_taps": (heel_taps, 1.6, ["quads", "shins"], True, "Heel Taps"),
    "march_arms_up": (march_arms_up, 1.6, ["hipflexors", "quads", "shoulders"], True, "March with Arms Up"),
    "foot_taps_w": (foot_taps, 3.2, ["glutes", "quads"], True, "Front & Side Toe Taps"),
    "walk_punches": (walk_punches, 1.2, ["quads", "shoulders", "chest"], True, "Walk with Punches"),
    "hamstring_curls": (hamstring_curls, 1.6, ["hamstrings", "glutes"], True, "Standing Hamstring Curls"),
    "standing_march_w": (standing_march, 2.8, ["hipflexors", "quads"], True, "Slow High March"),
    "weight_shift_w": (weight_shift, 4.0, ["glutes", "quads"], True, "Cool-Down Sway"),
})
WALK = ["walk_in_place", "step_touch", "heel_taps", "march_arms_up", "foot_taps_w", "walk_punches", "hamstring_curls", "standing_march_w", "weight_shift_w"]

# ---------- morning stretch set ----------
# Seated overhead reach: arms float up overhead, long stretch, lower, 4.4 s
def overhead_reach(b, t):
    p = track([(0, 0), (1.4, 1), (2.4, 1), (3.8, 0), (4.4, 0)], t)
    b.hips(SEAT_PELVIS, pitch=1.2)
    b.spine(pitch=2 - 6 * p, head=-4 * p)
    for s, sx in (("l", 1), ("r", -1)):
        b.shoulder(s, up=6 * p)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        rest = Vector((sx * 0.16, -0.32, SEAT_TOP + 0.17))
        up = sh + Vector((sx * 0.10, -0.04, 0.56))
        b.hand(s, rest.lerp(up, p), elbow=sh + Vector((sx * 0.45, 0.10 - 0.1 * p, -0.30 + 0.5 * p)), up=(sx * 0.2 * p, -1 + p, -0.3 + 1.3 * p))
    side(limb)

# Ankle circles: heels down, both feet draw slow circles, 3.2 s
def ankle_circles(b, t):
    seat(b)
    a = 2 * math.pi * t / 3.2
    def limb(s, sx):
        b.foot(s, (sx * FOOT_W, -0.58, 0.09 + 0.015 * max(0.0, -math.sin(a))), pitch=20 * math.sin(a), yaw=sx * 16 * math.cos(a), knee=(sx * 0.15, -1.0, 1.0))
        hand_thigh(b, s, sx)
    side(limb)

# Standing side bend: right arm overhead, lean to the left, then the other side, 6.4 s
def standing_side_bend(b, t):
    r = track([(0, 0), (1.1, 1), (2.2, 1), (3.0, 0), (3.2, 0), (6.4, 0)], t)
    l = track([(0, 0), (3.2, 0), (4.3, 1), (5.4, 1), (6.2, 0), (6.4, 0)], t)
    stand(b, x=-0.02 * (r - l), roll=-3 * (r - l), sroll=20 * (r - l))
    def limb(s, sx):
        planted(b, s, sx, wide=0.15)
        reach = r if s == "r" else l
        sh = b.pos(f"upperarm_{s}")
        hip = Vector((sx * 0.20, -0.31, 1.00))
        up = sh + Vector((-sx * 0.14, -0.03, 0.54))
        if reach > 0.01:
            b.hand(s, hip.lerp(up, reach), elbow=sh + Vector((sx * 0.45, 0.10, -0.2 + 0.5 * reach)), up=(-sx * reach, -1 + reach, 1))
        else:
            b.hand(s, hip, elbow=(sx * 0.55, -0.15, 1.15), up=(0, 0, -1))
    side(limb)

EXERCISES.update({
    "overhead_reach": (overhead_reach, 4.4, ["shoulders", "back"], False, "Seated Overhead Reach"),
    "torso_twist_m": (torso_twist, 3.2, ["obliques", "back"], False, "Gentle Torso Twist"),
    "ankle_circles": (ankle_circles, 3.2, ["calves", "shins"], False, "Ankle Circles"),
    "cat_cow_m": (cat_cow, 5.0, ["back", "abs"], False, "Seated Cat-Cow"),
    "shoulder_rolls_m": (shoulder_rolls, 3.2, ["traps", "shoulders"], False, "Shoulder Rolls"),
    "sit_to_stand_m": (sit_to_stand, 3.4, ["quads", "glutes"], True, "Sit to Stand"),
    "standing_side_bend": (standing_side_bend, 6.4, ["obliques", "back"], True, "Standing Side Bend"),
    "standing_march_m": (standing_march, 2.8, ["hipflexors", "quads"], True, "Easy Standing March"),
})
MORNING = ["overhead_reach", "torso_twist_m", "ankle_circles", "cat_cow_m", "shoulder_rolls_m", "sit_to_stand_m", "standing_side_bend", "standing_march_m"]

# ---------- sciatica and hip set (seated) ----------
# Seated hip circles: slow circles with the pelvis, upper body stays tall, 4.0 s
def hip_circles(b, t):
    a = 2 * math.pi * t / 4.0
    x, y, z = SEAT_PELVIS
    b.hips((x + 0.012 * math.cos(a), y, z), pitch=1.2 + 9 * math.sin(a), roll=7 * math.cos(a))
    b.spine(pitch=2 - 8 * math.sin(a), roll=-6 * math.cos(a))
    side(lambda s, sx: (feet_flat(b, s, sx, y=-0.44), hands_knees(b, s, sx)))

# Knee to opposite shoulder: hug the right knee toward the left shoulder, hold, then the left, 7.2 s
def knee_to_shoulder(b, t):
    r = track([(0, 0), (0.9, 1), (2.6, 1), (3.4, 0), (3.6, 0), (7.2, 0)], t)
    l = track([(0, 0), (3.6, 0), (4.5, 1), (6.2, 1), (7.0, 0), (7.2, 0)], t)
    k = max(r, l); lifted = "r" if r >= l else "l"; lsx = -1 if lifted == "r" else 1
    b.hips(SEAT_PELVIS, pitch=1.2 - 6 * k)
    b.spine(pitch=2 + 6 * k, yaw=8 * k * lsx, head=4 * k)
    for s, sx in (("l", 1), ("r", -1)):
        lift = r if s == "r" else l
        foot = Vector((sx * FOOT_W, -0.42, 0.085)).lerp(Vector((-sx * 0.02, -0.30, 0.40)), lift)
        b.foot(s, foot, pitch=-12 * lift, roll=-sx * 20 * lift, knee=(sx * 0.15 - sx * 0.25 * lift, -1.2, 1.1))
    kn = b.knee(lifted)
    for s, sx in (("l", 1), ("r", -1)):
        rest = Vector((sx * 0.16, -0.32, SEAT_TOP + 0.17))
        hold = kn + Vector((sx * 0.07, -0.05, -0.08))
        b.hand(s, rest.lerp(hold, min(1, k * 1.3)), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.35, 0.1, -0.3)), up=(-sx * 0.5, -0.6, -0.3))

# Seated figure-4: right ankle on the left knee, lean forward gently, hold; then switch, 9.0 s
def figure4(b, t):
    r = track([(0, 0), (1.0, 1), (3.6, 1), (4.3, 0), (4.5, 0), (9.0, 0)], t)
    l = track([(0, 0), (4.5, 0), (5.5, 1), (8.1, 1), (8.8, 0), (9.0, 0)], t)
    lean = smooth_lean = max(r, l) * max(0.0, min(1.0, (max(r, l) - 0.6) / 0.4))
    b.hips(SEAT_PELVIS, pitch=1.2 + 12 * lean)
    b.spine(pitch=3 + 12 * lean, head=-4 * lean)
    up_side = "r" if r >= l else "l"; k = max(r, l)
    stay = "l" if up_side == "r" else "r"; ssx = 1 if stay == "l" else -1
    b.foot(stay, (ssx * FOOT_W, -0.44, 0.085), knee=(ssx * 0.15, -1.0, 1.0))
    sk = b.knee(stay)
    usx = -ssx
    rest = Vector((usx * FOOT_W, -0.42, 0.085))
    on_knee = sk + Vector((-usx * 0.0, -0.03, 0.07))
    b.foot(up_side, rest.lerp(on_knee, k), roll=usx * 40 * k, yaw=-usx * 20 * k, knee=(usx * (0.15 + 0.55 * k), -1.0 + 0.4 * k, 1.0 - 0.3 * k))
    uk = b.knee(up_side)
    for s, sx in (("l", 1), ("r", -1)):
        restp = Vector((sx * 0.16, -0.32, SEAT_TOP + 0.17))
        tgt = (uk + Vector((0, -0.02, 0.03))) if s == up_side else (on_knee + Vector((usx * 0.10, -0.02, 0.04)))
        b.hand(s, restp.lerp(tgt, k), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.3, 0.1, -0.35)), up=(0, -0.5, -1))

# Nerve glide: straighten the right leg, toes up, look up; bend and look down; then the left, 4.8 s
def nerve_glide(b, t):
    r = track([(0, 0), (1.0, 1), (1.6, 1), (2.4, 0), (4.8, 0)], t)
    l = track([(0, 0), (2.4, 0), (3.4, 1), (4.0, 1), (4.8, 0)], t)
    k = max(r, l)
    b.hips(SEAT_PELVIS, pitch=1.2)
    b.spine(pitch=4 - 2 * k, neck=-6 * k + 6 * (1 - k), head=-8 * k + 6 * (1 - k))
    def limb(s, sx):
        e = r if s == "r" else l
        b.foot(s, Vector((sx * FOOT_W, -0.42, 0.085)).lerp(Vector((sx * FOOT_W, -0.80, 0.40)), e), pitch=22 * e, knee=(sx * 0.15, -1.0, 1.2))
        hold_seat(b, s, sx)
    side(limb)

# Seated glute squeeze: squeeze the seat muscles, rise a little taller, hold, release, 4.0 s
def glute_squeeze(b, t):
    p = track([(0, 0), (0.8, 1), (2.6, 1), (3.3, 0), (4.0, 0)], t)
    tall(b, p * 1.4, pelvis_pitch=1.2 - 3 * p)
    side(lambda s, sx: (feet_flat(b, s, sx), hands_thighs(b, s, sx)))

EXERCISES.update({
    "seated_march_h": (seated_march, 2.4, ["hipflexors", "quads"], False, "Gentle Seated March"),
    "hip_circles": (hip_circles, 4.0, ["glutes", "back"], False, "Seated Hip Circles"),
    "knee_hug_h": (knee_hug, 7.2, ["glutes", "back"], False, "Seated Knee Hug"),
    "knee_to_shoulder": (knee_to_shoulder, 7.2, ["glutes"], False, "Knee to Opposite Shoulder"),
    "figure4": (figure4, 9.0, ["glutes"], False, "Seated Figure-4 Stretch"),
    "hamstring_stretch_h": (hamstring_stretch, 7.2, ["hamstrings", "back"], False, "Seated Hamstring Stretch"),
    "nerve_glide": (nerve_glide, 4.8, ["hamstrings", "calves"], False, "Sciatic Nerve Glide"),
    "glute_squeeze": (glute_squeeze, 4.0, ["glutes"], False, "Seated Glute Squeeze"),
    "forward_fold_h": (forward_fold, 6.0, ["back", "hamstrings"], False, "Seated Forward Fold"),
    "side_reach_h": (side_reach, 6.4, ["obliques", "back"], False, "Seated Side Reach"),
})
HIP = ["seated_march_h", "hip_circles", "knee_hug_h", "knee_to_shoulder", "figure4", "hamstring_stretch_h", "nerve_glide", "glute_squeeze", "forward_fold_h", "side_reach_h"]

# ---------- posture set ----------
# Seated wall slides: arms in a W at shoulder height, slide up into a Y, back down, 3.6 s
def wall_slides(b, t):
    p = track([(0, 0), (1.3, 1), (1.8, 1), (3.2, 0), (3.6, 0)], t)
    b.hips(SEAT_PELVIS, pitch=1.2)
    b.spine(pitch=0, head=-2)
    for s, sx in (("l", 1), ("r", -1)):
        b.shoulder(s, back=-6 * (1 - p))
    def limb(s, sx):
        feet_flat(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        w_ = sh + Vector((sx * 0.30, 0.02, 0.14)); y_ = sh + Vector((sx * 0.24, -0.02, 0.50))
        b.hand(s, w_.lerp(y_, p), elbow=sh + Vector((sx * 0.40, 0.12, -0.22 + 0.3 * p)), up=(0, 0, 1))
    side(limb)

# Seated back extension: hands on the lower back, lift the chest and gently arch the upper back, 4.4 s
def back_extension(b, t):
    p = track([(0, 0), (1.3, 1), (2.5, 1), (3.7, 0), (4.4, 0)], t)
    b.hips(SEAT_PELVIS, pitch=1.2 + 4 * p)
    b.spine(pitch=2 - 14 * p, neck=-2 * p, head=-6 * p)
    for s, sx in (("l", 1), ("r", -1)):
        b.shoulder(s, back=-6 * p)
    def limb(s, sx):
        feet_flat(b, s, sx)
        sp = b.pos("spine_01")
        b.hand(s, sp + Vector((sx * 0.11, 0.10, -0.02)), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.28, 0.25, -0.22)), up=(-sx * 0.3, -0.4, 1))
    side(limb)

# Hands clasped behind the back: clasp low behind you, lift the chest, draw shoulders back, 4.4 s
def clasp_back(b, t):
    p = track([(0, 0), (1.2, 1), (2.6, 1), (3.8, 0), (4.4, 0)], t)
    b.hips(SEAT_PELVIS, pitch=1.2 + 6 * p)
    b.spine(pitch=6 - 10 * p, head=-4 * p)
    for s, sx in (("l", 1), ("r", -1)):
        b.shoulder(s, back=-9 * p)
    def limb(s, sx):
        feet_flat(b, s, sx)
        pel = b.pos("pelvis")
        b.hand(s, pel + Vector((sx * 0.03, 0.17 + 0.05 * p, 0.04 + 0.04 * p)), elbow=b.pos(f"upperarm_{s}") + Vector((sx * 0.25, 0.35, -0.2)), up=(-sx, 0.2, -0.5))
    side(limb)

# Standing W hold: stand tall, arms in a W, squeeze the shoulder blades and grow taller, 4.0 s
def standing_w_hold(b, t):
    p = track([(0, 0), (1.0, 1), (2.8, 1), (3.6, 0), (4.0, 0)], t)
    stand(b, z=0.012 * p, spitch=1 - 4 * p)
    for s, sx in (("l", 1), ("r", -1)):
        b.shoulder(s, back=-10 * p)
    def limb(s, sx):
        planted(b, s, sx, wide=0.13)
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, sh + Vector((sx * 0.30, 0.02 + 0.04 * p, 0.12)), elbow=sh + Vector((sx * 0.40, 0.14 + 0.06 * p, -0.22)), up=(0, 0, 1))
    side(limb)

EXERCISES.update({
    "shoulder_rolls_p": (shoulder_rolls, 3.2, ["traps", "shoulders"], False, "Shoulder Rolls"),
    "chin_tucks_p": (chin_tucks, 4.0, ["neck"], False, "Chin Tucks"),
    "neck_tilt_p": (neck_tilt, 8.0, ["neck", "traps"], False, "Neck Side Tilt"),
    "cat_cow_p": (cat_cow, 5.0, ["back", "abs"], False, "Seated Cat-Cow"),
    "blade_squeeze_p": (blade_squeeze, 3.0, ["traps", "back"], False, "Shoulder Blade Squeeze"),
    "wall_slides": (wall_slides, 3.6, ["shoulders", "traps"], False, "Seated Wall Slides"),
    "chest_opener_p": (chest_opener, 4.0, ["chest", "shoulders"], False, "Seated Chest Opener"),
    "back_extension": (back_extension, 4.4, ["back"], False, "Seated Back Extension"),
    "reverse_fly_p": (reverse_fly, 3.0, ["shoulders", "traps"], False, "Seated Reverse Fly"),
    "clasp_back": (clasp_back, 4.4, ["chest", "shoulders"], False, "Hands Clasped Behind"),
    "overhead_reach_p": (overhead_reach, 4.4, ["shoulders", "back"], False, "Overhead Reach"),
    "standing_w_hold": (standing_w_hold, 4.0, ["traps", "back"], True, "Standing W Hold"),
})
POSTURE = ["shoulder_rolls_p", "chin_tucks_p", "neck_tilt_p", "cat_cow_p", "blade_squeeze_p", "wall_slides", "chest_opener_p", "back_extension", "reverse_fly_p", "clasp_back", "overhead_reach_p", "standing_w_hold"]

# ---------- batch 5: standing, floor and Tai Chi (batch5_ex.py) ----------
from batch5_ex import register as _reg5
_reg5(EXERCISES)

# ---------- batch 6: bed, get up off the floor, Japanese five (batch6_ex.py) ----------
from batch6_ex import register as _reg6
_reg6(EXERCISES)
