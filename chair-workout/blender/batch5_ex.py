"""Batch 5 (2026-11-18): standing, floor (mat) and Tai Chi moves. Mode field: False seated, True standing, "floor" lying on the mat.
Floor body: lying on the back along X, head toward -X (screen left), face up; his left side is +Y (far side).
Every pose is pure in t and loops at T. rigkit adds breathing on top (period T/n)."""
import math
from mathutils import Vector
from rigkit import track
from chair_ex import side, osc, STAND, FOOT_W, sit_to_stand, standing_march, calf_raise, ankle_circles, seat

MAT_Z = 0.008
SUP = (0.25, 0.0, MAT_Z + 0.105)
V = Vector

def sw(t, T, ph=0.0):
    return math.sin(2 * math.pi * (t / T + ph))

# ================= floor helpers =================
def supine(b, lift=0.0, curl=0.0, tilt=0.0, neck=0.0, roll=0.0):
    """lift raises the pelvis, tilt rocks it (bridge), curl lifts head and shoulders."""
    b.hips((SUP[0], SUP[1], SUP[2] + lift), pitch=-90 - tilt, yaw=90, roll=roll)
    b.spine(pitch=curl, neck=curl * 0.5 + neck, head=curl * 0.4 - 6 + neck * 0.4)

def hook_pt(b, s, sx):
    hip = b.pos(f"thigh_{s}")
    return V((hip.x + 0.46, hip.y + sx * 0.05, MAT_Z + 0.085))

def floor_leg(b, s, sx, ank, knee_up=0.6, pitch=0.0):
    hip = b.pos(f"thigh_{s}")
    knee = (hip + ank) / 2 + V((0, sx * 0.05, knee_up))
    b.foot(s, ank, yaw=90, pitch=pitch, knee=knee)

def straight_pt(b, s, sx, lift=0.0):
    hip = b.pos(f"thigh_{s}"); a = math.radians(lift)
    sag = 0.03 * max(0.0, 1 - lift / 15)
    return hip + V((0.86 * math.cos(a), sx * 0.06, 0.86 * math.sin(a) - sag))

def straight_leg(b, s, sx, lift=0.0, flex=0.0):
    """Straight leg; flex > 0 pulls the toes toward the shin, < 0 points them."""
    floor_leg(b, s, sx, straight_pt(b, s, sx, lift), knee_up=0.05, pitch=-(74 + flex))

def table_pt(b, s, sx):
    hip = b.pos(f"thigh_{s}")
    return hip + V((0.40, sx * 0.04, 0.40))

def arms_floor(b, s, sx, spread=0.2):
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, V((sh.x + 0.50, sh.y + sx * spread, MAT_Z + 0.035)), elbow=sh + V((0.2, sx * 0.4, 0.3)), up=(1, sx * 0.1, -0.25))
    b.curl(s, 10)

def arm_ceiling(b, s, sx, k=1.0, over=0.0):
    """k blends from the mat to straight up; over swings the straight arm back over the head."""
    sh = b.pos(f"upperarm_{s}")
    rest = V((sh.x + 0.50, sh.y + sx * 0.2, MAT_Z + 0.035))
    up = sh + V((0.04, sx * 0.03, 0.56))
    a = math.radians(over * 80)
    over_p = sh + V((-0.56 * math.sin(a) + 0.04 * math.cos(a), sx * 0.04, 0.56 * math.cos(a)))
    tgt = rest.lerp(over_p if over else up, k)
    b.hand(s, tgt, elbow=sh + V((0.1, sx * 0.45, 0.1)), up=(0.2 - over, sx * 0.1, 1))
    b.curl(s, 8)

def hands_head(b, s, sx):
    """Lying: fingertips behind the head, elbows open."""
    sh = b.pos(f"upperarm_{s}"); hd = b.pos("head")
    b.hand(s, hd + V((-0.03, sx * 0.07, -0.02)), elbow=sh + V((-0.15, sx * 0.5, 0.15)), up=(-1, -sx * 0.5, 0))
    b.curl(s, 25)

# ================= standing helpers =================
def st(b, x=0.0, y=0.0, z=0.0, roll=0.0, pitch=1.0, sp=1.0, sroll=0.0, syaw=0.0, yaw=0.0, head_yaw=0.0, neck=0.0):
    b.hips((STAND[0] + x, STAND[1] + y, STAND[2] + z), pitch=pitch, roll=roll, yaw=yaw)
    b.spine(pitch=sp, roll=sroll, yaw=syaw, head_yaw=head_yaw, neck=neck)

def foot_on(b, s, sx, x=0.0, y=-0.27, wide=FOOT_W, z=0.085, kx=0.15, **kw):
    b.foot(s, (sx * wide + x, y, z), knee=(sx * kx + x, -1.0, 0.5 + z), **kw)

def knee_up(b, s, sx, lift, cross=0.0, out=0.0, wide=FOOT_W):
    ank = V((sx * wide - sx * cross * 0.10 + sx * out * 0.10, -0.30 - 0.12 * lift, 0.085 + 0.33 * lift))
    b.foot(s, ank, pitch=-12 * lift, knee=(sx * (0.15 + out * 0.4) - sx * cross * 0.2, -1.2, 1.0))

def arm(b, s, sx, x, y, z, ex=0.35, ey=0.25, ez=-0.3, up=None, curl=12):
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, sh + V((sx * x, y, z)), elbow=sh + V((sx * ex, ey, ez)), up=up)
    b.curl(s, curl)

def at(b, s, sx, p, elbow=(0.38, 0.22, -0.30), up=None, curl=10):
    """Wrist at an absolute point p (x already signed); elbow pole relative to the shoulder (x mirrored)."""
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, V(p), elbow=sh + V((sx * elbow[0], elbow[1], elbow[2])), up=up)
    b.curl(s, curl)

def head_hands(b, s, sx):
    """Standing: fingertips lightly behind the head, elbows wide."""
    hd = b.pos("head"); sh = b.pos(f"upperarm_{s}")
    b.hand(s, hd + V((sx * 0.075, 0.05, 0.03)), elbow=sh + V((sx * 0.55, -0.05, 0.12)), up=(-sx * 0.3, 0.2, 1))
    b.curl(s, 30)

# ================= BELLY FAT (standing + floor) =================
# Standing knee-to-elbow: right knee up to the left elbow, then the left, 3.2 s
def knee_elbow(b, t):
    r = track([(0, 0), (0.55, 1), (0.95, 1), (1.6, 0), (3.2, 0)], t)
    l = track([(0, 0), (1.6, 0), (2.15, 1), (2.55, 1), (3.2, 0)], t)
    c = r - l
    st(b, x=0.035 * c, z=-0.01 * (r + l), roll=-3 * c, sp=4 + 14 * (r + l), syaw=-24 * c, sroll=-8 * c)
    def limb(s, sx):
        lift = r if s == "r" else l
        knee_up(b, s, sx, lift, cross=lift)
        head_hands(b, s, sx)
    side(limb)

# Standing side crunch: knee up and out to the side, same elbow down, 2.8 s alternating
def side_crunch(b, t):
    r = track([(0, 0), (0.5, 1), (0.85, 1), (1.4, 0), (2.8, 0)], t)
    l = track([(0, 0), (1.4, 0), (1.9, 1), (2.25, 1), (2.8, 0)], t)
    c = r - l
    st(b, x=0.04 * c, roll=-4 * c, sroll=-20 * c, sp=3)
    def limb(s, sx):
        lift = r if s == "r" else l
        knee_up(b, s, sx, lift * 0.85, out=lift)
        head_hands(b, s, sx)
    side(limb)

# Standing twist: elbows up, turn the chest left and right with soft knees, 2.6 s
def standing_twist(b, t):
    y = sw(t, 2.6)
    st(b, z=-0.02, yaw=6 * y, syaw=34 * y, head_yaw=10 * y, sp=2)
    shl, shr = b.pos("upperarm_l"), b.pos("upperarm_r")
    c = (shl + shr) / 2; left = (shl - shr).normalized(); fwd = left.cross(V((0, 0, 1))).normalized() * -1
    if fwd.y > 0: fwd = -fwd
    def limb(s, sx):
        foot_on(b, s, sx, wide=0.15)
        p = c + fwd * 0.30 + left * (sx * 0.05) + V((0, 0, -0.16))
        b.hand(s, p, elbow=b.pos(f"upperarm_{s}") + left * (sx * 0.45) + V((0, 0, 0.02)) - fwd * 0.1, up=(0, 0, 1))
        b.curl(s, 70)
    side(limb)

# Glute bridge: lift the hips, hold, lower, 4.0 s
def glute_bridge(b, t):
    k = track([(0, 0), (1.2, 1), (2.4, 1), (3.6, 0), (4.0, 0)], t)
    h = 0.15 * k; ang = math.degrees(math.asin(h / 0.52))
    supine(b, lift=h, tilt=ang, neck=ang * 0.7)
    def limb(s, sx):
        floor_leg(b, s, sx, V((SUP[0] + 0.45, sx * 0.13, MAT_Z + 0.085)), knee_up=0.6)
        arms_floor(b, s, sx, 0.22)
    side(limb)

# Dead bug: knees up at 90/90, arms to the ceiling; opposite arm and leg reach out slowly, 5.0 s
def dead_bug(b, t):
    a = track([(0, 0), (1.0, 1), (1.5, 1), (2.5, 0), (5.0, 0)], t)    # right arm + left leg
    c = track([(0, 0), (2.5, 0), (3.5, 1), (4.0, 1), (5.0, 0)], t)    # left arm + right leg
    supine(b, curl=2)
    def limb(s, sx):
        ext_leg = c if s == "r" else a; ext_arm = a if s == "r" else c
        tbl = table_pt(b, s, sx); far = straight_pt(b, s, sx, 18)
        floor_leg(b, s, sx, tbl.lerp(far, ext_leg), knee_up=0.5 * (1 - ext_leg) + 0.1, pitch=-(45 * (1 - ext_leg) + 72 * ext_leg))
        arm_ceiling(b, s, sx, 1.0, over=ext_arm)
    side(limb)

# Lying march: from hook lying, lift one knee to tabletop and lower, alternate, 3.2 s
def lying_march(b, t):
    r = track([(0, 0), (0.6, 1), (0.95, 1), (1.6, 0), (3.2, 0)], t)
    l = track([(0, 0), (1.6, 0), (2.2, 1), (2.55, 1), (3.2, 0)], t)
    supine(b)
    def limb(s, sx):
        k = r if s == "r" else l
        floor_leg(b, s, sx, hook_pt(b, s, sx).lerp(table_pt(b, s, sx), k), knee_up=0.6, pitch=-45 * k)
        arms_floor(b, s, sx)
    side(limb)

# Slow bicycle: head lifted a little, knee in while the other leg reaches long, 4.0 s
def slow_bicycle(b, t):
    r = 0.5 + 0.5 * sw(t, 4.0)                   # 1 = right knee in
    l = 1 - r
    supine(b, curl=12 + 3 * abs(r - l), roll=0)
    b.spine(pitch=12, yaw=-14 * (r - l) * 0, roll=10 * (r - l), neck=8, head=-1)
    def limb(s, sx):
        k = r if s == "r" else l
        hip = b.pos(f"thigh_{s}")
        tuck = hip + V((0.22, sx * 0.04, 0.42)); long = straight_pt(b, s, sx, 22)
        floor_leg(b, s, sx, long.lerp(tuck, k), knee_up=0.1 + 0.5 * k, pitch=-(72 - 30 * k))
        hands_head(b, s, sx)
    side(limb)

# Knee to chest stretch: hug one knee, then the other, 6.0 s
def knee_to_chest(b, t):
    supine(b)
    def limb(s, sx):
        ph = t if s == "r" else (t + 3.0) % 6.0
        k = track([(0, 0), (1.0, 1), (2.2, 1), (3.0, 0), (6.0, 0)], ph)
        hip = b.pos(f"thigh_{s}")
        chest = hip + V((0.06, sx * 0.03, 0.36))
        ank = hook_pt(b, s, sx).lerp(chest, k)
        b.foot(s, ank, yaw=90, pitch=-25 * k, knee=hip + V((0.05 - 0.28 * k, sx * 0.05, 0.6)))
        kn = b.knee(s); sh = b.pos(f"upperarm_{s}")
        rest_h = V((sh.x + 0.50, sh.y + sx * 0.2, MAT_Z + 0.035))
        hug = kn + V((0.07, sx * 0.07, -0.06))
        b.hand(s, rest_h.lerp(hug, k), elbow=sh + V((0.12, sx * 0.42, 0.18)), up=(1, -sx * 0.2, 0.2 * k - 0.2))
        b.curl(s, 10 + 40 * k)
    side(limb)

# ================= TAI CHI (standing, soft knees, slow) =================
TC_W = 0.17          # feet a little wider than the hips
TC_Z = -0.045        # knees softly bent

def tc_feet(b, x=0.0, z=0.0, **kw):
    def limb(s, sx): foot_on(b, s, sx, wide=TC_W, kx=0.2, **kw)
    side(limb)

def tc_body(b, x=0.0, z=0.0, yaw=0.0, sp=1.0, y=0.0):
    st(b, x=x, y=y, z=TC_Z + z, roll=-x * 30, yaw=yaw * 0.25, syaw=yaw * 0.75, head_yaw=yaw * 0.3, sp=sp, sroll=x * 25)

def ch(b):
    """Chest centre and the body frame (left, forward) after the torso turn."""
    shl, shr = b.pos("upperarm_l"), b.pos("upperarm_r")
    c = (shl + shr) / 2; left = (shl - shr).normalized()
    fwd = V((0, 0, 1)).cross(left).normalized()
    if fwd.y > 0: fwd = -fwd
    return c, left, fwd

def bh(b, s, sx, lr, f, u, up=None, curl=12, elbow_out=0.40):
    """Hand in the body frame: lr along the body's left axis (+ = his left), f forward, u up from chest centre."""
    c, left, fwd = ch(b)
    p = c + left * lr + fwd * f + V((0, 0, u))
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, p, elbow=sh + left * (sx * elbow_out * 0.7) - fwd * 0.10 + V((0, 0, -0.55)), up=up)
    b.curl(s, curl)

# Opening: arms float up to shoulder height as the legs rise, then sink and press down, 6.4 s
def tc_opening(b, t):
    k = track([(0, 0), (2.8, 1), (3.4, 1), (6.0, 0), (6.4, 0)], t)
    tc_body(b, z=0.03 * k - 0.02 * (1 - k))
    tc_feet(b)
    def limb(s, sx):
        bh(b, s, sx, sx * 0.17, 0.18 + 0.32 * k, -0.42 + 0.40 * k, up=(0, -1, -0.9 + 0.6 * k), curl=14)
    side(limb)

# Wave hands like clouds: hands pass each other in front, body turns with them, 8.0 s
def tc_clouds(b, t):
    a = 2 * math.pi * t / 8.0
    tc_body(b, x=0.055 * math.cos(a), yaw=26 * math.cos(a))
    tc_feet(b)
    R = 0.17
    def limb(s, sx):
        zz = math.sin(a) * (1 if s == "r" else -1)          # right hand on top while sin > 0
        top = max(0.0, zz)
        bh(b, s, sx, R * math.cos(a) * 0.9, 0.30 + 0.04 * top, -0.08 + 0.13 * zz - 0.12 * (1 - top) * 0.3,
           up=(0, -0.2, 1) if zz > 0 else (0, -0.6, -0.2), curl=10, elbow_out=0.28)
    side(limb)

def _mane_keys(lead):
    """Hand targets (lr, f, u) for one half of 'part the horse's mane'. lead = +1 his left, -1 his right."""
    ball_top = (lead * -0.10, 0.26, 0.02); ball_low = (lead * -0.06, 0.24, -0.28)
    open_lead = (lead * 0.30, 0.38, 0.10); press = (-lead * 0.22, 0.12, -0.42)
    return ball_top, ball_low, open_lead, press

# Part the wild horse's mane (in place): gather a ball, then open, lead hand rising forward, 9.6 s
def tc_mane(b, t):
    half = 4.8; L = t < half; tt = t % half; lead = 1 if L else -1
    open_ = track([(0, 0), (1.4, 0), (3.8, 1), (4.8, 1)], tt)
    gather = track([(0, 1), (1.4, 0), (4.8, 0)], tt)                 # from the previous side's open pose
    tc_body(b, x=0.06 * lead * open_ - 0.06 * lead * gather, yaw=28 * lead * open_ - 28 * lead * gather)
    tc_feet(b)
    top, low, op, pr = _mane_keys(lead)
    ptop, plow, pop, ppr = _mane_keys(-lead)
    def mix(a, b_, k): return tuple(x + (y - x) * k for x, y in zip(a, b_))
    def limb(s, sx):
        is_lead = (sx == lead)
        # previous half: lead was -lead (its open hand = ppr side); hands travel to the ball, then open
        prev = pop if (sx == -lead) else ppr
        ball = low if is_lead else top
        dst = op if is_lead else pr
        p = mix(mix(ball, prev, gather), dst, open_)
        upv = (0, -0.3, 1) if (is_lead and open_ > 0.5) else (0, -0.4, -1) if not is_lead else (0, 0.2, 1)
        bh(b, s, sx, *p, up=upv, curl=10)
    side(limb)

# Brush knee and push: one hand sweeps down past the knee, the other pushes forward from the ear, 9.6 s
def tc_brush(b, t):
    half = 4.8; lead = 1 if t < half else -1; tt = t % half
    k = track([(0, 0), (1.2, 0), (3.6, 1), (4.8, 1)], tt)
    g = track([(0, 1), (1.2, 0), (4.8, 0)], tt)
    tc_body(b, x=0.05 * lead * (k - g), yaw=22 * lead * (k - g), sp=2 + 4 * k)
    tc_feet(b)
    def limb(s, sx):
        brush_hand = (sx == lead)
        ready = (sx * 0.18, -0.02, 0.10) if not brush_hand else (-sx * 0.05, 0.22, -0.05)
        end = (sx * 0.24, 0.10, -0.45) if brush_hand else (sx * 0.06, 0.48, 0.0)
        prev_end = (sx * 0.06, 0.48, 0.0) if brush_hand else (sx * 0.24, 0.10, -0.45)
        p = tuple(a + (bb - a) * g for a, bb in zip(ready, prev_end))
        p = tuple(a + (bb - a) * k for a, bb in zip(p, end))
        bh(b, s, sx, *p, up=(0, -0.3, 1) if not brush_hand else (0, -0.5, -1), curl=8)
    side(limb)

# Repulse monkey: one palm pushes forward while the other draws back to the hip, alternating, 6.4 s
def tc_monkey(b, t):
    p = osc(t, 6.4)                               # 1 = right hand forward
    tc_body(b, y=0.02, yaw=-14 * (p - 0.5) * 2, z=-0.01)
    tc_feet(b)
    def limb(s, sx):
        fw = p if s == "r" else 1 - p
        back = (sx * 0.20, 0.02, -0.32); front = (sx * 0.08, 0.50, -0.02)
        q = tuple(a + (bb - a) * fw for a, bb in zip(back, front))
        bh(b, s, sx, *q, up=(0, -0.2, 1) if fw > 0.5 else (0, 0.3, 1), curl=8)
    side(limb)

# Golden rooster: stand on one leg, knee and same-side hand rise, then the other side, 9.6 s
def tc_rooster(b, t):
    half = 4.8; lead = -1 if t < half else 1; tt = t % half          # right leg lifts first
    k = track([(0, 0), (1.5, 1), (3.3, 1), (4.5, 0), (4.8, 0)], tt)
    tc_body(b, x=-0.07 * lead * min(1, k * 1.6), z=0.03 * k, sp=1)
    def limb(s, sx):
        if sx == lead:
            knee_up(b, s, sx, 0.85 * k, wide=TC_W - 0.03)
            bh(b, s, sx, sx * 0.14, 0.26, -0.40 + 0.55 * k, up=(0, -0.3, 1), curl=6)
        else:
            foot_on(b, s, sx, wide=TC_W - 0.03 * k, kx=0.2)
            bh(b, s, sx, sx * 0.20, 0.14, -0.42, up=(0, -0.4, -1), curl=8)
    side(limb)

# Push the mountain: draw the hands to the chest as the weight sinks back, push forward as it moves forward, 6.4 s
def tc_push(b, t):
    k = track([(0, 0), (2.6, 1), (3.4, 1), (6.0, 0), (6.4, 0)], t)    # 1 = pushed forward
    tc_body(b, y=0.03 - 0.07 * k, z=-0.015 * (1 - k), sp=1 + 5 * k)
    tc_feet(b)
    def limb(s, sx):
        bh(b, s, sx, sx * 0.13, 0.14 + 0.36 * k, -0.06, up=(0, -0.3, 1), curl=6, elbow_out=0.45)
    side(limb)

# Holding the ball, turning: hands hold a ball at the belly, body turns left and right, 8.0 s
def tc_ball_turn(b, t):
    y = sw(t, 8.0)
    tc_body(b, x=0.045 * y, yaw=30 * y)
    tc_feet(b)
    def limb(s, sx):
        bh(b, s, sx, sx * 0.05, 0.28, -0.26 + sx * 0.12, up=(0, -0.3, -sx), curl=14)
    side(limb)

# Separate heaven and earth: one hand rises overhead palm up, the other presses down, switch, 8.0 s
def tc_heaven(b, t):
    half = 4.0; lead = -1 if t < half else 1; tt = t % half
    k = track([(0, 0), (1.6, 1), (2.4, 1), (4.0, 0)], tt)
    tc_body(b, z=0.035 * k, sp=1 - 3 * k)
    tc_feet(b)
    def limb(s, sx):
        if sx == lead:
            bh(b, s, sx, sx * 0.12, 0.16 - 0.05 * k, -0.28 + 0.78 * k, up=(-sx * 0.8, 0, 0.5) if k > 0.5 else (0, -0.3, 1), curl=6, elbow_out=0.3)
        else:
            bh(b, s, sx, sx * 0.18, 0.18, -0.30 - 0.14 * k, up=(0, -0.6, -1), curl=6)
    side(limb)

# Closing: arms rise out to the sides palms up (breathe in), then float down in front (breathe out), 6.4 s
def tc_closing(b, t):
    k = track([(0, 0), (2.8, 1), (3.4, 1), (6.0, 0), (6.4, 0)], t)
    tc_body(b, z=0.03 * k)
    tc_feet(b)
    def limb(s, sx):
        a = k
        lr = sx * (0.12 + 0.40 * math.sin(math.pi * a * 0.5)); f = 0.24 - 0.14 * a; u = -0.40 + 0.38 * a
        bh(b, s, sx, lr, f, u, up=(sx * 0.3, -0.2, 1) if a > 0.3 else (0, -0.4, -1), curl=8, elbow_out=0.45)
    side(limb)

# ================= FEET / NEUROPATHY (seated, standing, floor) =================
# Seated heel and toe raises: heels up, down, toes up, down, 3.2 s
def seated_heel_toe(b, t):
    seat(b)
    h = track([(0, 0), (0.5, 1), (0.9, 1), (1.4, 0), (3.2, 0)], t)
    to = track([(0, 0), (1.6, 0), (2.1, 1), (2.5, 1), (3.0, 0), (3.2, 0)], t)
    def limb(s, sx):
        b.foot(s, (sx * FOOT_W, -0.44, 0.085 + 0.055 * h), pitch=-26 * h + 22 * to, toe=26 * h, knee=(sx * 0.15, -1.2, 0.8))
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, (sx * 0.16, -0.32, 0.59), elbow=sh + V((sx * 0.3, 0.3, -0.3)), up=(0, -1, -0.3)); b.curl(s, 18)
    side(limb)

# Standing toe raises: heels down, lift the toes, lower, 2.4 s
def toe_raise(b, t):
    p = track([(0, 0), (0.7, 1), (1.2, 1), (1.9, 0), (2.4, 0)], t)
    st(b, y=0.015 * p, sp=1 - 2 * p)
    def limb(s, sx):
        foot_on(b, s, sx, pitch=22 * p)
        b.hand(s, (sx * 0.20, -0.31, 1.00), elbow=(sx * 0.55, -0.15, 1.15), up=(0, 0, -1)); b.curl(s, 20)
    side(limb)

# Lying ankle pumps: both feet pull the toes up, then point them, 2.0 s
def ankle_pumps(b, t):
    p = sw(t, 2.0)
    supine(b)
    def limb(s, sx):
        straight_leg(b, s, sx, 0, flex=22 * p)
        arms_floor(b, s, sx)
    side(limb)

# Lying heel slides: slide one heel toward you and back, then the other, 4.0 s
def heel_slides(b, t):
    r = track([(0, 0), (0.9, 1), (1.2, 1), (2.0, 0), (4.0, 0)], t)
    l = track([(0, 0), (2.0, 0), (2.9, 1), (3.2, 1), (4.0, 0)], t)
    supine(b)
    def limb(s, sx):
        k = r if s == "r" else l
        ank = straight_pt(b, s, sx, 0).lerp(hook_pt(b, s, sx) + V((0, 0, -0.005)), k)
        floor_leg(b, s, sx, ank, knee_up=0.05 + 0.55 * k, pitch=-72 * (1 - k))
        arms_floor(b, s, sx)
    side(limb)

# Straight leg raise, toes pulled up: one knee bent, the straight leg lifts and lowers, 6.0 s
def leg_raise_flex(b, t):
    half = 3.0; lead = "r" if t < half else "l"; tt = t % half
    k = track([(0, 0), (1.1, 1), (1.6, 1), (2.7, 0), (3.0, 0)], tt)
    supine(b)
    def limb(s, sx):
        if s == lead:
            straight_leg(b, s, sx, 38 * k, flex=18)
        else:
            floor_leg(b, s, sx, hook_pt(b, s, sx))
        arms_floor(b, s, sx)
    side(limb)

def register(EX):
    EX.update({
        # belly fat
        "standing_march_b": (standing_march, 2.8, ["hipflexors", "quads", "abs"], True, "Standing March"),
        "knee_elbow": (knee_elbow, 3.2, ["abs", "obliques", "hipflexors"], True, "Standing Knee to Elbow"),
        "side_crunch": (side_crunch, 2.8, ["obliques", "abs"], True, "Standing Side Crunch"),
        "standing_twist": (standing_twist, 2.6, ["obliques", "abs"], True, "Standing Twist"),
        "sit_to_stand_b": (sit_to_stand, 3.4, ["quads", "glutes", "abs"], True, "Chair Squat"),
        "glute_bridge": (glute_bridge, 4.0, ["glutes", "hamstrings", "abs"], "floor", "Glute Bridge"),
        "dead_bug": (dead_bug, 5.0, ["abs", "hipflexors"], "floor", "Dead Bug"),
        "lying_march": (lying_march, 3.2, ["abs", "hipflexors"], "floor", "Lying March"),
        "slow_bicycle": (slow_bicycle, 4.0, ["abs", "obliques"], "floor", "Slow Bicycle"),
        "knee_to_chest": (knee_to_chest, 6.0, ["glutes", "back"], "floor", "Knee to Chest Stretch"),
        # tai chi
        "tc_opening": (tc_opening, 6.4, ["shoulders", "quads"], True, "Opening"),
        "tc_clouds": (tc_clouds, 8.0, ["obliques", "shoulders", "quads"], True, "Wave Hands Like Clouds"),
        "tc_mane": (tc_mane, 9.6, ["obliques", "shoulders", "glutes"], True, "Part the Horse's Mane"),
        "tc_brush": (tc_brush, 9.6, ["shoulders", "obliques", "quads"], True, "Brush Knee and Push"),
        "tc_monkey": (tc_monkey, 6.4, ["shoulders", "triceps", "back"], True, "Repulse the Monkey"),
        "tc_rooster": (tc_rooster, 9.6, ["glutes", "quads", "calves", "abs"], True, "Golden Rooster"),
        "tc_push": (tc_push, 6.4, ["chest", "triceps", "quads"], True, "Push the Mountain"),
        "tc_ball_turn": (tc_ball_turn, 8.0, ["obliques", "abs"], True, "Holding the Ball, Turning"),
        "tc_heaven": (tc_heaven, 8.0, ["shoulders", "obliques"], True, "Separate Heaven and Earth"),
        "tc_closing": (tc_closing, 6.4, ["shoulders", "chest"], True, "Closing Breath"),
        # feet / neuropathy
        "seated_heel_toe": (seated_heel_toe, 3.2, ["calves", "shins"], False, "Seated Heel and Toe Raises"),
        "ankle_circles_n": (ankle_circles, 3.2, ["calves", "shins"], False, "Ankle Circles"),
        "calf_raise_n": (calf_raise, 2.0, ["calves"], True, "Standing Heel Raises"),
        "toe_raise": (toe_raise, 2.4, ["shins"], True, "Standing Toe Raises"),
        "standing_march_n": (standing_march, 2.8, ["hipflexors", "calves", "quads"], True, "March in Place"),
        "ankle_pumps": (ankle_pumps, 2.0, ["calves", "shins"], "floor", "Lying Ankle Pumps"),
        "heel_slides": (heel_slides, 4.0, ["hamstrings", "quads"], "floor", "Heel Slides"),
        "leg_raise_flex": (leg_raise_flex, 6.0, ["quads", "hipflexors", "shins"], "floor", "Straight Leg Raise"),
    })

BELLY = ["standing_march_b", "knee_elbow", "side_crunch", "standing_twist", "sit_to_stand_b", "glute_bridge", "dead_bug", "lying_march", "slow_bicycle", "knee_to_chest"]
TAICHI = ["tc_opening", "tc_clouds", "tc_mane", "tc_brush", "tc_monkey", "tc_rooster", "tc_push", "tc_ball_turn", "tc_heaven", "tc_closing"]
FEET = ["seated_heel_toe", "ankle_circles_n", "calf_raise_n", "toe_raise", "standing_march_n", "ankle_pumps", "heel_slides", "leg_raise_flex"]
