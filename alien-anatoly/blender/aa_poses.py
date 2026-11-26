"""Alien Anatoly still poses: name -> (fn(body), camera (loc, target, lens)). Rig faces -Y, height 1.78 m."""
from mathutils import Vector
import chair_ex as cx

FRONT = ((0.0, -3.9, 0.95), (0.0, -0.3, 0.90), 50)
BACK = ((0.0, 3.3, 0.95), (0.0, -0.3, 0.90), 50)
THREEQ = ((1.4, -3.6, 0.95), (0.0, -0.3, 0.90), 50)

def feet(b, s, sx):
    cx.planted(b, s, sx, wide=0.14, y=-0.30)

def arm_down(b, s, sx):
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, sh + Vector((sx * 0.16, -0.02, -0.56)), elbow=sh + Vector((sx * 0.2, 0.25, -0.25)), up=(sx * 0.2, 0, -1))

def hero(b):
    cx.stand(b)
    cx.side(lambda s, sx: (feet(b, s, sx), arm_down(b, s, sx)))

def lateral_raise(b):
    cx.stand(b)
    def limb(s, sx):
        feet(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        b.hand(s, sh + Vector((sx * 0.56, -0.08, -0.10)), elbow=sh + Vector((sx * 0.3, 0.3, -0.05)), up=(sx, -0.1, -0.15))
        b.curl(s, 80)
    cx.side(limb)

def pointing(b):
    cx.stand(b)
    def limb(s, sx):
        feet(b, s, sx)
        if s == "r":
            sh = b.pos(f"upperarm_{s}")
            b.hand(s, sh + Vector((0.02, -0.56, -0.06)), elbow=sh + Vector((-0.3, 0.1, -0.4)), up=(0, -1, 0))
            b.curl(s, 60)
        else:
            arm_down(b, s, sx)
    cx.side(limb)

POSES = {
    "hero": (hero, FRONT),
    "back_view": (hero, BACK),
    "lateral_raise": (lateral_raise, FRONT),
    "pointing": (pointing, THREEQ),
}

# ---------- animated: fn(body, t) looping at T seconds ----------
import math
def raise_rep(b, t, T=3.0):
    u = 0.5 - 0.5 * math.cos(2 * math.pi * t / T)        # 0 down -> 1 up -> 0
    cx.stand(b, z=-0.005 * u)
    def limb(s, sx):
        feet(b, s, sx)
        sh = b.pos(f"upperarm_{s}")
        lo = Vector((sx * 0.16, -0.02, -0.56)); hi = Vector((sx * 0.56, -0.08, -0.10))
        b.hand(s, sh + lo.lerp(hi, u), elbow=sh + Vector((sx * 0.3, 0.3, -0.2 + 0.15 * u)), up=Vector((sx * 0.2, 0, -1)).lerp(Vector((sx, -0.1, -0.15)), u))
        b.curl(s, 80)
    cx.side(limb)

def breathe(b, t, T=4.0):
    u = 0.5 - 0.5 * math.cos(2 * math.pi * t / T)
    cx.stand(b, z=0.004 * u, spitch=1.0 - 1.5 * u)
    cx.side(lambda s, sx: (feet(b, s, sx), arm_down(b, s, sx)))

ANIMS = {"raise_rep": (raise_rep, 3.0, FRONT), "breathe": (breathe, 4.0, THREEQ)}
