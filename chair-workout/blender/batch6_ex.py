"""Batch 6 (2026-11-26): before-bed stretches (lying on a bed), getting up off the floor, Japanese five.
World floor frame as in batch5: lying along X, head toward -X. Moves written "facing -Y" (like the standing moves) can be
turned to a side view with Turned(b): the figure then faces -X. GETUP blends whole poses (every bone) between keys."""
import math
from mathutils import Vector, Quaternion
from rigkit import track
from chair_ex import side, osc, STAND, FOOT_W, sit_to_stand, calf_raise, stand, planted
from batch5_ex import (supine, hook_pt, floor_leg, straight_pt, straight_leg, arms_floor, arm_ceiling,
                       glute_bridge, ankle_pumps, heel_slides, knee_to_chest, st, foot_on, sw, MAT_Z, SUP)
V = Vector

# ================= helpers =================
def R(v):  return V((v[1], -v[0], v[2]))          # pose space (facing -Y) -> world (facing -X)
def Ri(w): return V((-w[1], w[0], w[2]))

class Turned:
    """Same pose calls as Body, written facing -Y, applied turned 90 degrees so the figure faces -X (side view)."""
    def __init__(self, b): self.b = b
    def pos(self, bone): return Ri(self.b.pos(bone))
    def knee(self, s): return Ri(self.b.knee(s))
    def hips(self, pos, pitch=0.0, roll=0.0, yaw=0.0): self.b.hips(R(pos), pitch, roll, yaw - 90)
    def foot(self, s, ankle, pitch=0.0, yaw=0.0, roll=0.0, knee=None, toe=0.0):
        self.b.foot(s, R(ankle), pitch, yaw - 90, roll, None if knee is None else R(knee), toe)
    def hand(self, s, wrist, elbow=None, q=None, up=None):
        self.b.hand(s, R(wrist), None if elbow is None else R(elbow), q, None if up is None else R(up))
    def __getattr__(self, n): return getattr(self.b, n)

def snap(b):
    return {p.name: (p.rotation_quaternion.copy(), p.location.copy()) for p in b.pb}

def apply_mix(b, A, B, k):
    k = k * k * (3 - 2 * k)
    for p in b.pb:
        qa, la = A[p.name]; qb, lb = B[p.name]
        if qa.dot(qb) < 0: qb = -qb
        p.rotation_quaternion = qa.slerp(qb, k); p.location = la.lerp(lb, k)

def lift_to(b, tb, bone_pairs, pelvis_guess, pitch, roll=0.0, yaw=0.0):
    """Place the pelvis so the hip joints end where they should (target = mean of wanted thigh positions)."""
    tb.hips(pelvis_guess, pitch, roll, yaw)
    have = (tb.pos("thigh_l") + tb.pos("thigh_r")) / 2
    want = sum(bone_pairs, V()) / len(bone_pairs)
    tb.hips(V(pelvis_guess) + (want - have), pitch, roll, yaw)

# ================= V1: BEFORE BED (lying on the bed, same floor frame) =================
def bed_feet(b, s, sx):
    return V((SUP[0] + 0.45, sx * 0.13, MAT_Z + 0.085))

# Deep belly breathing: knees bent, hands rest on the belly and rise with each slow breath, 5.2 s
def belly_breath(b, t):
    ph = math.sin(2 * math.pi * t / 5.2)
    supine(b, neck=1.5 * ph)
    for s, sx in (("l", 1), ("r", -1)):
        floor_leg(b, s, sx, bed_feet(b, s, sx), knee_up=0.6)
        sh = b.pos(f"upperarm_{s}")
        belly = V((SUP[0] - 0.14, sx * 0.07, SUP[2] + 0.115 + 0.012 * (ph + 1)))
        b.hand(s, belly, elbow=V((sh.x + 0.22, sh.y + sx * 0.32, MAT_Z)), up=(0.25, -sx, -0.25))
        b.curl(s, 14)

# Overhead reach: arms float up to the ceiling and back over the head, hold the stretch, return, 6.4 s
def overhead_reach(b, t):
    k = track([(0, 0), (1.4, 1), (6.4 - 1.4, 1), (6.4, 0)], t)
    o = track([(0, 0), (1.4, 0), (2.8, 1), (3.6, 1), (5.0, 0), (6.4, 0)], t)
    supine(b, neck=-3 * o)
    for s, sx in (("l", 1), ("r", -1)):
        floor_leg(b, s, sx, bed_feet(b, s, sx), knee_up=0.6)
        arm_ceiling(b, s, sx, k, over=0.5 * o)          # stops short of the headboard

# Knee rocks (windshield wipers): knees together lower to one side, back up, the other side, 6.4 s
def windshield(b, t):
    y = sw(t, 6.4)
    supine(b, roll=-14 * y)
    b.spine(neck=0, head=-6, head_yaw=-14 * y)
    for s, sx in (("l", 1), ("r", -1)):
        ank = V((SUP[0] + 0.45, sx * 0.10 + 0.04 * y, MAT_Z + 0.085))
        hip = b.pos(f"thigh_{s}")
        pole = (hip + ank) / 2 + V((0.05, sx * 0.03 + 0.55 * y, 0.6 - 0.25 * abs(y)))
        b.foot(s, ank, yaw=90, roll=-18 * y, knee=pole)
        arms_floor(b, s, sx, 0.42)

# Knee fall-outs: one bent knee opens out to the side and comes back, then the other, 6.0 s
def knee_fallout(b, t):
    r = track([(0, 0), (1.2, 1), (1.8, 1), (3.0, 0), (6.0, 0)], t)
    l = track([(0, 0), (3.0, 0), (4.2, 1), (4.8, 1), (6.0, 0)], t)
    supine(b, roll=6 * (l - r))
    for s, sx in (("l", 1), ("r", -1)):
        k = l if s == "l" else r
        ank = bed_feet(b, s, sx)
        hip = b.pos(f"thigh_{s}")
        pole = (hip + ank) / 2 + V((0.05, sx * (0.05 + 0.6 * k), 0.6 - 0.35 * k))
        b.foot(s, ank, yaw=90, roll=sx * 22 * k, knee=pole)
        arms_floor(b, s, sx, 0.25)

# Double knee hug: both knees held to the chest, gentle rock, 5.0 s
def double_knee_hug(b, t):
    k = 0.82 + 0.18 * (0.5 - 0.5 * math.cos(2 * math.pi * t / 5.0))
    supine(b, tilt=-10 * k, neck=2 * k)
    for s, sx in (("l", 1), ("r", -1)):
        hip = b.pos(f"thigh_{s}")
        tuck = hip + V((0.22, sx * 0.07, 0.25))           # shins level, feet hanging near the seat, knees at the chest
        ank = hook_pt(b, s, sx).lerp(tuck, k)
        b.foot(s, ank, yaw=90, pitch=-10 * k, knee=hip + V((-0.30 * k, sx * 0.07, 0.6)))
        kn = b.knee(s); sh = b.pos(f"upperarm_{s}")
        b.hand(s, kn + V((0.07, sx * 0.07, -0.06)), elbow=sh + V((0.12, sx * 0.42, 0.18)), up=(1, -sx * 0.2, 0.0))
        b.curl(s, 50)

# Relaxing body breath: legs long, arms by the sides palms up, slow breathing only, 5.2 s
def relax_breath(b, t):
    ph = math.sin(2 * math.pi * t / 5.2)
    supine(b, neck=1.5 * ph)
    for s, sx in (("l", 1), ("r", -1)):
        straight_leg(b, s, sx, 0, flex=-12)
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, V((sh.x + 0.50, sh.y + sx * 0.26, MAT_Z + 0.03)), elbow=sh + V((0.2, sx * 0.4, 0.3)), up=(1, sx * 0.15, 0.1))
        b.curl(s, 22)

# ================= hands and knees (pose space, head toward -Y, face down) =================
Q_Y = 0.32            # pelvis along the mat (world x)

def quad(b, back=0.0, arm=(0.0, 0.0), leg=(0.0, 0.0), shift=0.0):
    """Hands and knees. back: 0..1 rocks the hips back toward the heels. arm/leg = (left, right) reach 0..1 (bird dog)."""
    tb = Turned(b)
    lt, lc = b.len["thigh_l"], b.len["calf_l"]
    knees = {s: V((sx * 0.11, Q_Y + 0.07, MAT_Z + 0.05)) for s, sx in (("l", 1), ("r", -1))}
    phi = math.radians(52 * back)
    hipw = [knees[s] + V((0, lt * math.sin(phi), lt * math.cos(phi))) for s in "lr"]
    lift_to(b, tb, hipw, (0, Q_Y + shift, 0.52), pitch=90 + 18 * back)
    # chest height: tilt the spine so the shoulders sit an arm's length above the hands
    arm_len = b.len["upperarm_l"] + b.len["lowerarm_l"]
    sp = 0.0
    for _ in range(3):
        tb.spine(pitch=sp, neck=-4, head=-8 + 10 * back)
        sh = (tb.pos("upperarm_l") + tb.pos("upperarm_r")) / 2
        sp -= math.degrees(math.asin(max(-0.9, min(0.9, ((MAT_Z + 0.06 + arm_len * 0.96) - sh.z) / 0.45))))
    for s, sx in (("l", 1), ("r", -1)):
        i = 0 if s == "l" else 1
        kn = knees[s]
        # leg: knee on the mat, shin back along the mat; reach straightens it back at hip height
        rest_a = kn + V((0, lc * 0.99, 0.035)); h = tb.pos(f"thigh_{s}")
        reach_a = h + V((sx * 0.02, lt + lc - 0.02, 0.0))
        e = leg[i]
        ank = rest_a.lerp(reach_a, e) + V((0, 0, 0.10 * math.sin(math.pi * e)))
        pole = kn.lerp(h + V((0, 0.45, -0.4)), e) + V((0, -0.05, -0.25))
        tb.foot(s, ank, pitch=150 - 60 * e, knee=pole, toe=0)
        # arm: hand under the shoulder; reach takes it straight forward at shoulder height
        sh = tb.pos(f"upperarm_{s}")
        floor_h = V((sh.x + sx * 0.01, sh.y - 0.04, MAT_Z + 0.04))
        fwd_h = sh + V((sx * 0.06, -arm_len * 0.97, 0.02))
        a = arm[i]
        w = floor_h.lerp(fwd_h, a) + V((0, 0, 0.12 * math.sin(math.pi * a)))
        tb.hand(s, w, elbow=sh + V((sx * 0.25, 0.25 - 0.35 * a, -0.10 + 0.4 * a)),
                up=V((0, -1, 0)).lerp(V((0, -1, 0.15)), a))
        tb.curl(s, 8 + 10 * a)

# Bird dog: from hands and knees, reach one arm forward and the opposite leg back, then switch, 6.4 s
def bird_dog(b, t):
    a = track([(0, 0), (1.2, 1), (2.0, 1), (3.2, 0), (6.4, 0)], t)      # right arm + left leg
    c = track([(0, 0), (3.2, 0), (4.4, 1), (5.2, 1), (6.4, 0)], t)      # left arm + right leg
    quad(b, arm=(c, a), leg=(a, c))

# Rock back: hands and knees, sit the hips back toward the heels and forward again, 5.0 s
def rock_back(b, t):
    k = track([(0, 0), (1.9, 1), (2.6, 1), (4.5, 0), (5.0, 0)], t)
    quad(b, back=0.75 * k)

# Side-lying leg lift (world frame): lying on the right side facing you, the top leg lifts and lowers, 4.0 s
def side_leg_lift(b, t):
    k = track([(0, 0), (1.3, 1), (2.0, 1), (3.4, 0), (4.0, 0)], t)
    b.hips((SUP[0], 0.0, MAT_Z + 0.165), roll=-90)
    b.spine(roll=-8, neck=0, head=0)
    hr = b.pos("thigh_r"); hl = b.pos("thigh_l")
    b.foot("r", V((hr.x + 0.78, hr.y - 0.10, MAT_Z + 0.055)), yaw=0, roll=-90, knee=hr + V((0.4, -0.35, 0)))
    a = math.radians(-6 + 34 * k)
    b.foot("l", hl + V((0.86 * math.cos(a), -0.02, 0.86 * math.sin(a))), yaw=0, roll=-90, pitch=-8, knee=hl + V((0.4, -0.3, 0.0)))
    hd = b.pos("head"); shr = b.pos("upperarm_r"); shl = b.pos("upperarm_l")
    b.hand("r", V((hd.x - 0.02, hd.y + 0.02, MAT_Z + 0.04)), elbow=shr + V((-0.25, 0.05, -0.1)), up=(-1, 0, 0)); b.curl("r", 20)
    b.hand("l", V((shl.x + 0.12, shl.y - 0.30, MAT_Z + 0.03)), elbow=shl + V((0.05, -0.1, 0.4)), up=(0, -0.3, -1)); b.curl("l", 10)

# ================= kneeling and standing (pose space, facing -Y, turned to a side view) =================
K_Y = Q_Y + 0.07     # knees on the mat

def kneel(b, lead=None, hands="thigh", lean=0.0):
    """Tall kneel (lead None) or half kneel with the lead leg's foot planted in front ('l' or 'r')."""
    tb = Turned(b)
    lt, lc = b.len["thigh_l"], b.len["calf_l"]
    want = []
    for s, sx in (("l", 1), ("r", -1)):
        if s == lead: want.append(V((sx * 0.11, K_Y - 0.06, MAT_Z + 0.05 + lt * 0.98)))
        else: want.append(V((sx * 0.11, K_Y, MAT_Z + 0.05 + lt * 0.98)))
    lift_to(b, tb, want, (0, K_Y - 0.03, 0.62), pitch=2 + lean)
    tb.spine(pitch=4 + lean * 0.8, neck=2, head=-2)
    for s, sx in (("l", 1), ("r", -1)):
        h = tb.pos(f"thigh_{s}")
        if s == lead:
            ank = V((sx * 0.13, h.y - lt * 0.98, MAT_Z + 0.085))
            tb.foot(s, ank, knee=V((sx * 0.15, h.y - 1.0, h.z)))
        else:
            kn = V((sx * 0.11, h.y + 0.02, MAT_Z + 0.05))
            tb.foot(s, kn + V((0, lc * 0.99, 0.035)), pitch=150, knee=kn + V((0, -0.05, -0.25)))
    for s, sx in (("l", 1), ("r", -1)):
        sh = tb.pos(f"upperarm_{s}")
        if hands == "knee" and lead:
            kn = tb.knee(lead); lx = 1 if lead == "l" else -1
            w = kn + V((sx * 0.06 - lx * 0.02, 0.02, 0.07))
            tb.hand(s, w, elbow=sh + V((sx * 0.35, -0.05, -0.2)), up=(0, -0.4, -1)); tb.curl(s, 30)
        else:
            th = tb.pos(f"thigh_{s}")
            tb.hand(s, th + V((sx * 0.03, -0.12, -0.10)), elbow=sh + V((sx * 0.35, 0.15, -0.3)), up=(0, -0.6, -1)); tb.curl(s, 18)

def stand_side(b, lean=0.0, hands="side"):
    tb = Turned(b)
    st(tb, y=K_Y + 0.30, z=-0.01 * lean / 10, pitch=1 + lean, sp=1 + lean * 0.4)
    for s, sx in (("l", 1), ("r", -1)):
        foot_on(tb, s, sx, y=K_Y + 0.02 - 0.04, wide=0.11)
        sh = tb.pos(f"upperarm_{s}")
        if hands == "thigh":
            th = tb.pos(f"thigh_{s}")
            tb.hand(s, th + V((sx * 0.05, -0.20, -0.20)), elbow=sh + V((sx * 0.35, 0.1, -0.25)), up=(0, -0.3, -1)); tb.curl(s, 18)
        else:
            tb.hand(s, sh + V((sx * 0.05, -0.02, -0.56)), elbow=sh + V((sx * 0.3, 0.2, -0.3)), up=(0, -0.1, -1)); tb.curl(s, 18)

def lying_hook(b):
    supine(b)
    for s, sx in (("l", 1), ("r", -1)):
        floor_leg(b, s, sx, bed_feet(b, s, sx), knee_up=0.6)
        arms_floor(b, s, sx)

def side_lying_bent(b):
    b.hips((SUP[0] + 0.02, 0.0, MAT_Z + 0.165), roll=-90)
    b.spine(roll=-8)
    for s in "lr":
        h = b.pos(f"thigh_{s}")
        b.foot(s, V((h.x + 0.42, h.y - 0.25, MAT_Z + 0.06 + (0.11 if s == "l" else 0))), roll=-90, knee=h + V((0.1, -0.6, 0)))
    hd = b.pos("head"); shr = b.pos("upperarm_r"); shl = b.pos("upperarm_l")
    b.hand("r", V((hd.x - 0.02, hd.y + 0.02, MAT_Z + 0.04)), elbow=shr + V((-0.25, 0.05, -0.1)), up=(-1, 0, 0)); b.curl("r", 20)
    b.hand("l", V((shl.x + 0.02, shl.y - 0.28, MAT_Z + 0.03)), elbow=shl + V((0.05, -0.1, 0.4)), up=(-0.3, -0.3, -1)); b.curl("l", 10)

# Kneel to half kneel: from a tall kneel, step one foot forward, back, then the other, 8.0 s
def half_kneel(b, t):
    tall = lambda: kneel(b)
    A = None
    kr = track([(0, 0), (1.3, 1), (2.6, 1), (3.9, 0), (8.0, 0)], t)
    kl = track([(0, 0), (4.0, 0), (5.3, 1), (6.6, 1), (7.9, 0), (8.0, 0)], t)
    tall(); A = snap(b)
    lead = "r" if t < 4.0 else "l"; k = kr if lead == "r" else kl
    kneel(b, lead=lead); B = snap(b)
    apply_mix(b, A, B, k)

# Full get-up practice: back -> side -> hands and knees -> kneel -> half kneel -> stand, then back down, 20 s
GETUP_KEYS = [lying_hook, side_lying_bent, lambda b: quad(b), lambda b: kneel(b),
              lambda b: kneel(b, lead="l", hands="knee"), lambda b: stand_side(b, lean=26, hands="thigh"), lambda b: stand_side(b)]
GETUP_T = 20.0
def getup(b, t):
    n = len(GETUP_KEYS); half = GETUP_T / 2
    u = t if t < half else GETUP_T - t                 # up, then the same path back down
    seg = (half - 1.0) / (n - 1)                       # 0.5 s rest at the bottom and at the top
    x = max(0.0, min(n - 1.0, (u - 0.5) / seg))
    i = min(int(x), n - 2); f = x - i
    f = max(0.0, min(1.0, (f - 0.08) / 0.84))          # short hold at every key
    GETUP_KEYS[i](b); A = snap(b)
    GETUP_KEYS[i + 1](b); B = snap(b)
    apply_mix(b, A, B, f)

# ================= standing strength =================
# Chair push-up (incline on the chair back): lean in, bend the elbows, push away, 3.6 s. Chair: CHAIR_AT
CH_Y = -0.80          # chair centre in pose space (backrest toward him)
def chair_pushup(b, t):
    tb = Turned(b)
    k = track([(0, 0), (1.4, 1), (1.9, 1), (3.3, 0), (3.6, 0)], t)
    ang = math.radians(24 + 10 * k)
    fy = 0.32
    ank = V((0, fy, 0.085)); hip = ank + V((0, -0.88 * math.sin(ang), 0.88 * math.cos(ang)))
    tb.hips(hip + V((0, 0, 0.0)), pitch=math.degrees(ang) + 1)
    tb.spine(pitch=0, neck=-6, head=-4)
    for s, sx in (("l", 1), ("r", -1)):
        tb.foot(s, V((sx * 0.12, fy, 0.085)), pitch=-math.degrees(ang) * 0.35, toe=math.degrees(ang) * 0.35, knee=(sx * 0.14, -1.0, 0.6))
        sh = tb.pos(f"upperarm_{s}")
        tb.hand(s, V((sx * 0.20, CH_Y + 0.22, 0.85)), elbow=sh + V((sx * 0.55, 0.15, -0.25)), up=(0, -0.5, 0.2)); tb.curl(s, 60)

# Supported split squat (side view): feet staggered, both knees bend, hands on the hips, 4.0 s
def split_squat(b, t):
    tb = Turned(b)
    k = track([(0, 0), (1.5, 1), (2.1, 1), (3.6, 0), (4.0, 0)], t)
    st(tb, y=0.03, z=-0.03 - 0.17 * k, pitch=2 + 2 * k, sp=1)
    for s, sx in (("l", 1), ("r", -1)):
        if s == "l":
            tb.foot(s, V((sx * 0.12, -0.55, 0.085)), knee=(sx * 0.14, -1.2, 0.5))
        else:
            tb.foot(s, V((sx * 0.12, 0.30, 0.10)), pitch=-30, toe=30, knee=(sx * 0.12, -0.3, -0.5))
        sh = tb.pos(f"upperarm_{s}"); th = tb.pos(f"thigh_{s}")
        tb.hand(s, th + V((sx * 0.07, -0.02, 0.12)), elbow=sh + V((sx * 0.45, 0.1, -0.25)), up=(0, 0.3, -1)); tb.curl(s, 20)

# Slow squat (Japanese style): 4 s down, short hold, 4 s up, arms reaching forward, 9.0 s
def slow_squat(b, t):
    p = track([(0, 0), (4.0, 1), (4.8, 1), (8.8, 0), (9.0, 0)], t)
    stand(b, y=0.10 * p, z=-0.21 * p, pitch=1 + 28 * p, spitch=1 + 6 * p)
    def limb(s, sx):
        planted(b, s, sx, wide=0.15)
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, sh + Vector((sx * 0.05, -0.62, -0.05 + 0.08 * p)), elbow=sh + Vector((sx * 0.3, -0.1, -0.35)), up=(0, -1, 0))
        b.curl(s, 6)
    side(limb)

# extra per-move scene setup read by render_ex: chair (world loc, z rotation deg) and camera (loc, target, lens)
EXTRA = {
    "chair_pushup": {"chair": ((CH_Y, 0.0, 0.0), -90)},
    "getup": {"cam": ((0.05, -4.9, 1.05), (0.28, 0.0, 0.70), 36)},
    "half_kneel": {"cam": ((-0.20, -3.9, 1.05), (0.30, 0.0, 0.48), 36)},
}

def register(EX):
    EX.update({
        # V1 before bed
        "belly_breath": (belly_breath, 5.2, ["abs"], "floor", "Deep Belly Breathing"),
        "ankle_pumps_bed": (ankle_pumps, 2.0, ["calves", "shins"], "floor", "Ankle Pumps"),
        "heel_slides_bed": (heel_slides, 4.0, ["hamstrings", "quads"], "floor", "Heel Slides"),
        "overhead_reach": (overhead_reach, 6.4, ["shoulders", "back", "chest"], "floor", "Overhead Reach"),
        "knee_hug_bed": (knee_to_chest, 6.0, ["glutes", "back"], "floor", "Single Knee Hug"),
        "windshield": (windshield, 6.4, ["obliques", "back"], "floor", "Knee Rocks Side to Side"),
        "knee_fallout": (knee_fallout, 6.0, ["adductors", "glutes"], "floor", "Knee Fall-Outs"),
        "bridge_bed": (glute_bridge, 4.0, ["glutes", "hamstrings"], "floor", "Gentle Bridge"),
        "double_knee_hug": (double_knee_hug, 5.0, ["back", "glutes"], "floor", "Double Knee Hug"),
        "relax_breath": (relax_breath, 5.2, [], "floor", "Relaxing Body Breath"),
        # V2 get up off the floor
        "bridge_g": (glute_bridge, 4.0, ["glutes", "hamstrings", "abs"], "floor", "Glute Bridge"),
        "side_leg_lift": (side_leg_lift, 4.0, ["glutes", "obliques"], "floor", "Side-Lying Leg Lift"),
        "rock_back": (rock_back, 5.0, ["back", "glutes", "shoulders"], "floor", "Hands and Knees Rock Back"),
        "bird_dog": (bird_dog, 6.4, ["back", "glutes", "abs", "shoulders"], "floor", "Bird Dog"),
        "half_kneel": (half_kneel, 8.0, ["quads", "glutes"], "floor", "Kneel to Half-Kneel"),
        "sit_to_stand_g": (sit_to_stand, 3.4, ["quads", "glutes", "hamstrings"], True, "Sit to Stand"),
        "split_squat": (split_squat, 4.0, ["quads", "glutes"], True, "Split Squat"),
        "chair_pushup": (chair_pushup, 3.6, ["chest", "triceps", "shoulders"], True, "Chair Push-Up"),
        "calf_raise_g": (calf_raise, 2.0, ["calves"], True, "Heel Raises"),
        "getup": (getup, GETUP_T, ["quads", "glutes", "shoulders", "abs"], "floor", "Full Get-Up Practice"),
        # V3 Japanese five
        "slow_squat": (slow_squat, 9.0, ["quads", "glutes", "hamstrings"], True, "Slow Squat"),
        "bird_dog_j": (bird_dog, 6.4, ["back", "glutes", "abs", "shoulders"], "floor", "Bird Dog"),
        "bridge_j": (glute_bridge, 4.0, ["glutes", "hamstrings", "abs"], "floor", "Glute Bridge"),
        "calf_raise_j": (calf_raise, 2.0, ["calves"], True, "Heel Raises"),
        "chair_pushup_j": (chair_pushup, 3.6, ["chest", "triceps", "shoulders"], True, "Chair Push-Up"),
    })
    EXTRA["chair_pushup_j"] = EXTRA["chair_pushup"]

BEDTIME = ["belly_breath", "ankle_pumps_bed", "heel_slides_bed", "overhead_reach", "knee_hug_bed", "windshield", "knee_fallout", "bridge_bed", "double_knee_hug", "relax_breath"]
GETUP = ["bridge_g", "side_leg_lift", "rock_back", "bird_dog", "half_kneel", "sit_to_stand_g", "split_squat", "chair_pushup", "calf_raise_g", "getup"]
JAPAN = ["slow_squat", "chair_pushup_j", "bridge_j", "bird_dog_j", "calf_raise_j"]
