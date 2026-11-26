"""Each exercise: a pure function of loop time t (seconds) that poses the body in rig space.
In rig space she faces -Y. spec["rig"] places the rig in the room: (x, y, z-rotation in degrees)."""
import math
from mathutils import Vector, Quaternion
from rigkit import track, smooth, X, Y, Z

CHAIR_Y = 0.85                      # chair back touches the wall (wall surface at y=1.10)
SEAT_Y = CHAIR_Y - 0.14             # near the front of the seat
FEET_Y = CHAIR_Y - 0.58
SIT_H = 0.60                        # pelvis height when seated
STAND_H = 0.815
FOOT_W = 0.15
LEG = 0.74                          # hip to ankle, straight
BALL = Vector((0, 0.106, 0.064))    # ankle relative to the ball of the foot at rest

def side(fn):
    for s, sx in (("l", 1), ("r", -1)):
        fn(s, sx)

def seated(b, lean=4.0, shrug=None):
    b.hips((0, SEAT_Y, SIT_H), pitch=lean * 0.45)
    b.spine(pitch=lean * 0.55, neck=-lean * 0.25, head=-lean * 0.3)

def hold_seat(b, s, sx):
    b.hand(s, (sx * 0.285, SEAT_Y + 0.02, 0.51), elbow=(sx * 0.6, SEAT_Y + 0.35, 0.85))
    b.curl(s, 50)

def seated_foot(b, s, sx):
    b.foot(s, (sx * FOOT_W, FEET_Y, 0.074), knee=(sx * 0.13, FEET_Y - 0.6, 0.5))

# 1 ---- Seated marching: 2.4 s, right knee then left
def seated_march(b, t):
    seated(b)
    def limb(s, sx):
        phase = t if s == "r" else (t + 1.2) % 2.4
        lift = track([(0, 0), (0.45, 1), (0.75, 1), (1.2, 0), (2.4, 0)], phase)
        b.foot(s, (sx * FOOT_W * 0.9, FEET_Y + 0.05 * lift, 0.074 + 0.17 * lift), pitch=-6 * lift, knee=(sx * 0.13, FEET_Y - 0.6, 0.6))
        hold_seat(b, s, sx)
    side(limb)

# 2a --- Shoulder rolls: up, back, down in 2.4 s
def shoulder_rolls(b, t):
    seated(b, lean=2)
    a = 2 * math.pi * t / 2.4
    def limb(s, sx):
        seated_foot(b, s, sx)
        b.shoulder(s, up=9 * (0.5 + 0.5 * math.sin(a)), back=11 * math.cos(a))
        hip = b.pos(f"thigh_{s}"); knee = b.knee(s)
        b.hand(s, hip.lerp(knee, 0.62) + Vector((sx * 0.01, 0, 0.125)), elbow=(sx * 0.45, SEAT_Y + 0.3, 0.9))
        b.curl(s, 20)
    side(limb)

# 2b --- Arm circles: arms out to the sides, small circles, 1.2 s each
def arm_circles(b, t):
    seated(b, lean=2)
    a = 2 * math.pi * t / 1.2
    def limb(s, sx):
        seated_foot(b, s, sx)
        c = b.pos(f"upperarm_{s}")
        wrist = c + Vector((sx * 0.46, -0.03 + 0.055 * math.cos(a), -0.02 + 0.055 * math.sin(a)))
        b.hand(s, wrist, elbow=wrist + Vector((-sx * 0.2, 0.2, -0.5)))
        b.curl(s, 8)
    side(limb)

# 3 ---- Sit to stand: 5 s, lean, press up, stand tall, lower slowly
def sit_to_stand(b, t):
    hy = track([(0, SEAT_Y), (0.9, SEAT_Y), (1.9, FEET_Y), (2.5, FEET_Y), (3.2, FEET_Y), (4.3, SEAT_Y), (5, SEAT_Y)], t)
    hz = track([(0, SIT_H), (0.9, SIT_H), (1.9, STAND_H), (2.5, STAND_H), (3.2, STAND_H), (4.3, SIT_H), (5, SIT_H)], t)
    lean = track([(0, 4), (0.9, 30), (1.5, 26), (1.9, 1), (2.5, 1), (3.2, 1), (3.8, 28), (4.3, 16), (5, 4)], t)
    up = (hz - SIT_H) / (STAND_H - SIT_H)
    b.hips((0, hy, hz), pitch=lean * 0.45)
    b.spine(pitch=lean * 0.55, neck=-lean * 0.25, head=-lean * 0.3)
    def limb(s, sx):
        b.foot(s, (sx * FOOT_W, FEET_Y, 0.074), knee=(sx * 0.13, FEET_Y - 0.6, 0.45))
        hip, knee = b.pos(f"thigh_{s}"), b.knee(s)
        on_thigh = hip.lerp(knee, 0.72) + Vector((sx * 0.015, -0.015, 0.125))
        at_side = Vector((sx * 0.25, hy - 0.03, 0.83))
        b.hand(s, on_thigh.lerp(at_side, smooth(0.55, 1.0, up)), elbow=(sx * 0.45, hy + 0.3, hz + 0.25))
        b.curl(s, 22)
    side(limb)

# 4 ---- Wall push-ups: 4 s. Body stays a straight plank pivoting at the ankles
WALL = -0.80                        # wall surface in rig space
def wall_pushup(b, t):
    th = track([(0, 13), (0.3, 13), (1.9, 27), (2.3, 27), (3.8, 13), (4, 13)], t)
    r = math.radians(th)
    hip_y, hip_z = -LEG * math.sin(r), 0.074 + LEG * math.cos(r) + 0.012
    b.hips((0, hip_y, hip_z), pitch=th)
    b.spine(neck=-th * 0.3, head=-th * 0.35)
    def limb(s, sx):
        b.foot(s, (sx * 0.13, 0, 0.074), knee=(sx * 0.13, -0.6, 0.4))
        wrist = Vector((sx * 0.25, WALL + 0.035, 1.21))
        b.hand(s, wrist, elbow=(sx * 0.75, hip_y - 0.05, 0.75), up=Vector((sx * 0.05, -0.03, 1)))
        b.curl(s, 4)
    side(limb)

# Standing behind the chair, facing the wall, both hands on the top rail
RAIL_Y = -0.34
def on_rail(b, s, sx, hip_y=0.0):
    b.hand(s, (sx * 0.17, RAIL_Y + 0.045, 0.985), elbow=(sx * 0.5, 0.15, 0.8))
    b.curl(s, 45)

def heel(b, s, sx, base_y, deg):
    ball = Vector((sx * FOOT_W * 0.8, base_y, 0.074)) - BALL
    rel = Quaternion(X, math.radians(deg)) @ BALL
    b.foot(s, ball + rel, pitch=deg, toe=-deg, knee=(sx * 0.13, base_y - 0.6, 0.4))

# 5 ---- Heel raises: 4 s, up, hold one second, down
def heel_raises(b, t):
    k = track([(0, 0), (0.2, 0), (1.5, 1), (2.5, 1), (3.8, 0), (4, 0)], t)
    deg = 34 * k
    lift = BALL.length * (math.sin(math.radians(deg) + math.atan2(BALL.z, BALL.y)) - math.sin(math.atan2(BALL.z, BALL.y)))
    b.hips((0, 0.0 - 0.02 * k, STAND_H + lift), pitch=1)
    b.spine(pitch=1, head=-1)
    def limb(s, sx):
        heel(b, s, sx, 0.0, deg)
        on_rail(b, s, sx)
    side(limb)

# 6 ---- Side leg raise, right leg: 4 s
def side_leg_raise(b, t):
    k = track([(0, 0), (0.3, 0), (1.7, 1), (2.3, 1), (3.7, 0), (4, 0)], t)
    ang = math.radians(28 * k)
    b.hips((0.035 * k, 0, STAND_H - 0.004 * k), roll=-2.5 * k)
    b.spine(roll=2.5 * k)
    b.foot("l", (FOOT_W * 0.8, 0, 0.074), knee=(0.13, -0.6, 0.4))
    hip = b.pos("thigh_r")
    ankle = hip + Vector((-math.sin(ang) * LEG * 0.995, 0.0, -math.cos(ang) * LEG * 0.995))
    if k < 1e-3: ankle = Vector((-FOOT_W * 0.8, 0, 0.074))
    else: ankle = Vector((-FOOT_W * 0.8, 0, 0.074)).lerp(ankle, smooth(0, 0.2, k))
    b.foot("r", ankle, roll=-22 * k, knee=(ankle.x * 0.6, -0.6, 0.45))
    side(lambda s, sx: on_rail(b, s, sx))

# 7 ---- Seated knee extension, right leg: 5 s, hold two seconds at the top
def knee_extension(b, t):
    a = track([(0, 0), (0.3, 0), (1.5, 1), (3.5, 1), (4.7, 0), (5, 0)], t)
    seated(b, lean=-3 * a)
    seated_foot(b, "l", 1)
    knee = Vector((-0.125, SEAT_Y - 0.36, 0.5))
    ang = math.radians(4 + 80 * a)
    ankle = knee + Vector((0, -math.sin(ang) * 0.375, -math.cos(ang) * 0.375))
    b.foot("r", ankle, pitch=-ang * 57.3 * 0.9, knee=(-0.125, SEAT_Y - 0.6, 0.95))
    side(lambda s, sx: hold_seat(b, s, sx))

# 8 ---- Heel-to-toe walk: 4 steps in 6.4 s along the wall, one hand on it
STEP = 0.27
def heel_to_toe(b, t):
    T = 1.6
    n = int(t // T); u = (t % T) / T
    swing = "r" if n % 2 == 0 else "l"; stance = "l" if swing == "r" else "r"
    base = -STEP * n
    start_y, end_y, stance_y = base + STEP, base - STEP, base
    m = smooth(0.15, 0.85, u)
    a_y = start_y + (end_y - start_y) * m
    arc = math.sin(math.pi * m)
    sw_x = {"l": 0.015, "r": -0.015}
    def place(s, y, z=0.074, pitch=0.0):
        b.foot(s, (sw_x[s], y, z), pitch=pitch, knee=(sw_x[s] * 3, y - 0.6, 0.45))
    hip_y = stance_y + 0.5 * STEP * (2 * smooth(0.25, 1.0, u) - 1) * 0.8
    sway = 0.03 * (1 if stance == "l" else -1) * math.sin(math.pi * u)
    b.hips((sway, hip_y, 0.80 + 0.006 * math.sin(math.pi * u)), roll=-sway * 25)
    b.spine(roll=sway * 25, head=-2)
    place(stance, stance_y)
    place(swing, a_y, 0.074 + 0.055 * arc, pitch=8 * math.sin(2 * math.pi * m) * 1.0)
    # left hand slides along the wall; right arm held a little out for balance
    b.hand("l", (0.53, hip_y - 0.12, 1.03), elbow=(0.6, hip_y + 0.35, 0.8), up=Vector((0.1, -0.5, 0.9)))
    b.curl("l", 8)
    b.hand("r", (-0.34, hip_y - 0.08, 0.8), elbow=(-0.55, hip_y + 0.25, 0.85))
    b.curl("r", 18)

ROOM_CAM = ((1.75, -2.95, 1.0), (0.0, 0.3, 0.8), 36)
EXERCISES = {
    "seated_march":   (seated_march, 2.4, {"cam": ((1.5, -2.75, 0.95), (0.0, 0.35, 0.68), 40)}),
    "shoulder_rolls": (shoulder_rolls, 2.4, {"cam": ((0.75, -2.0, 1.1), (0.0, 0.6, 0.9), 45)}),
    "arm_circles":    (arm_circles, 1.2, {"cam": ((0.5, -2.75, 1.05), (0.0, 0.6, 0.88), 36)}),
    "sit_to_stand":   (sit_to_stand, 5.0, {"cam": ROOM_CAM}),
    "wall_pushup":    (wall_pushup, 4.0, {"rig": (0.0, 0.30, 180), "chair": (-2.3, CHAIR_Y, 0), "cam": ((3.0, -1.3, 1.0), (0.0, 0.5, 0.82), 34)}),
    "heel_raises":    (heel_raises, 4.0, {"rig": (0.0, 0.30, 180), "chair": (0, CHAIR_Y, 180), "cam": ((2.0, -2.35, 0.85), (0.0, 0.35, 0.8), 34)}),
    "side_leg_raise": (side_leg_raise, 4.0, {"rig": (0.0, 0.30, 180), "chair": (0, CHAIR_Y, 180), "cam": ((-0.55, -2.85, 1.05), (0.0, 0.4, 0.8), 38)}),
    "knee_extension": (knee_extension, 5.0, {"cam": ((2.2, -1.95, 0.95), (0.0, 0.3, 0.62), 40)}),
    "heel_to_toe":    (heel_to_toe, 6.4, {"rig": (-1.0, 0.57, 90), "chair": (-2.6, CHAIR_Y, 0), "cam": ((-0.4, -3.1, 0.95), (-0.4, 0.6, 0.82), 32)}),
    "heel_toe_feet":  (lambda b, t: heel_to_toe(b, t), 3.2, {"rig": (-0.75, 0.57, 90), "chair": (-2.6, CHAIR_Y, 0), "cam": ((0.65, -0.55, 0.42), (-0.85, 0.57, 0.1), 42)}),
    "chair_still":    (lambda b, t: None, 0.04, {"chair": (0, CHAIR_Y, 0), "hide": True, "cam": ((1.3, -1.9, 0.95), (0.0, 0.75, 0.55), 40)}),
}

def get(name):
    return EXERCISES[name]
