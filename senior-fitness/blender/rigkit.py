"""Analytic posing on the MakeHuman game_engine skeleton, in world metres (rig at origin).
No constraints: limbs are solved here and rotated by the smallest turn from rest, so thighs and arms never twist.
Call order each frame: hips, spine, then feet and hands (they read the chain above them)."""
import math
from mathutils import Vector, Quaternion

X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
FINGERS = ("thumb", "index", "middle", "ring", "pinky")
I = Quaternion()

def smooth(a, b, t):
    t = max(0.0, min(1.0, (t - a) / (b - a))) if b != a else float(t >= a)
    return t * t * (3 - 2 * t)

def track(keys, t):
    """keys: [(time, value)]; smooth between neighbours. Values can be numbers or tuples."""
    if t <= keys[0][0]: return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            k = smooth(t0, t1, t)
            if isinstance(v0, (tuple, list)): return tuple(a + (b - a) * k for a, b in zip(v0, v1))
            return v0 + (v1 - v0) * k
    return keys[-1][1]

def two_bone(a, target, l1, l2, pole):
    """Middle joint of a two-bone limb from a to target, bending toward the pole point."""
    a, target, pole = Vector(a), Vector(target), Vector(pole)
    d = target - a; dist = min(max(d.length, 1e-4), l1 + l2 - 1e-4); u = d.normalized()
    along = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    h = math.sqrt(max(l1 * l1 - along * along, 0.0))
    n = (pole - a) - u * (pole - a).dot(u)
    n = n.normalized() if n.length > 1e-5 else Vector((0, -1, 0))
    return a + u * along + n * h, a + u * dist

class Body:
    def __init__(self, rig):
        self.pb = rig.pose.bones
        bones = rig.data.bones
        self.rest = {b.name: b.matrix_local.to_quaternion() for b in bones}
        self.head = {b.name: b.head_local.copy() for b in bones}
        self.tail = {b.name: b.tail_local.copy() for b in bones}
        self.parent = {b.name: (b.parent.name if b.parent else None) for b in bones}
        self.dir = {n: (self.tail[n] - self.head[n]) for n in self.head}
        self.D = {n: I.copy() for n in self.head}
        self.hip_pos = self.head["pelvis"].copy()
        self.joint = {}
        for b in self.pb:
            b.rotation_mode = "QUATERNION"; b.location = (0, 0, 0)
        self.len = {n: self.dir[n].length for n in self.head}
        self.neutral()

    # ---- chain bookkeeping ----
    def _D_parent(self, bone):
        p = self.parent[bone]
        return self.D[p] if p else I

    def _local(self, bone, d_local):
        """d_local: rotation in the armature frame, on top of the parent's motion."""
        self.D[bone] = self._D_parent(bone) @ d_local
        r = self.rest[bone]
        self.pb[bone].rotation_quaternion = r.inverted() @ d_local @ r

    def _world(self, bone, d_world):
        self._local(bone, self._D_parent(bone).inverted() @ d_world)

    def pos(self, bone):
        if bone == "pelvis": return self.hip_pos.copy()
        p = self.parent[bone]
        if p is None or p == "Root": return self.head[bone].copy()
        return self.pos(p) + self.D[p] @ (self.head[bone] - self.head[p])

    def rot(self, bone, axis, deg):
        self._local(bone, Quaternion(Vector(axis), math.radians(deg)))

    # ---- body ----
    def hips(self, pos, pitch=0.0, roll=0.0, yaw=0.0):
        self.hip_pos = Vector(pos)
        p = self.pb["pelvis"]
        p.location = self.rest["pelvis"].to_matrix().inverted() @ (self.hip_pos - self.head["pelvis"])
        q = Quaternion(Z, math.radians(yaw)) @ Quaternion(Y, math.radians(roll)) @ Quaternion(X, math.radians(pitch))
        self._local("pelvis", q)

    def spine(self, pitch=0.0, roll=0.0, yaw=0.0, neck=0.0, head=0.0, head_yaw=0.0):
        for b in ("spine_01", "spine_02", "spine_03"):
            self._local(b, Quaternion(Z, math.radians(yaw / 3)) @ Quaternion(Y, math.radians(roll / 3)) @ Quaternion(X, math.radians(pitch / 3)))
        self.rot("neck_01", X, neck)
        self._local("head", Quaternion(Z, math.radians(head_yaw)) @ Quaternion(X, math.radians(head)))
        for s in "lr": self._local(f"clavicle_{s}", I)

    def shoulder(self, s, up=0.0, back=0.0):
        """Shrug (up) and roll (back) the shoulder blade, in degrees."""
        sx = 1 if s == "l" else -1
        self._local(f"clavicle_{s}", Quaternion(Y, math.radians(-sx * up)) @ Quaternion(Z, math.radians(-sx * back)))

    # ---- limbs ----
    def _limb(self, upper, lower, target, pole):
        a = self.pos(upper)
        j, end = two_bone(a, target, self.len[upper], self.len[lower], pole)
        dp = self._D_parent(upper)
        d_up = (dp @ self.dir[upper]).rotation_difference(j - a) @ dp
        self._world(upper, d_up)
        d_lo = (d_up @ self.dir[lower]).rotation_difference(end - j) @ d_up
        self._world(lower, d_lo)
        self.joint[lower] = j
        return j

    def foot(self, s, ankle, pitch=0.0, yaw=0.0, roll=0.0, knee=None, toe=0.0):
        """pitch > 0 lifts the toes; toe bends the ball of the foot back so it stays flat."""
        ankle = Vector(ankle); sx = 1 if s == "l" else -1
        hip = self.pos(f"thigh_{s}")
        pole = Vector(knee) if knee is not None else Vector((hip.x, hip.y - 0.5, (hip.z + ankle.z) / 2))
        self._limb(f"thigh_{s}", f"calf_{s}", ankle, pole)
        q = Quaternion(Z, math.radians(yaw)) @ Quaternion(Y, math.radians(roll)) @ Quaternion(X, math.radians(pitch))
        self._world(f"foot_{s}", q)
        self._local(f"ball_{s}", Quaternion(X, math.radians(toe)))

    def knee(self, s):
        return self.joint[f"calf_{s}"]

    def hand(self, s, wrist, elbow=None, q=None, up=None):
        """elbow is a pole point; q turns the hand relative to the forearm; up aims the fingers."""
        sx = 1 if s == "l" else -1
        a = self.pos(f"upperarm_{s}")
        pole = Vector(elbow) if elbow is not None else a + Vector((sx * 0.4, 0.4, -0.3))
        self._limb(f"upperarm_{s}", f"lowerarm_{s}", wrist, pole)
        d_f = self.D[f"lowerarm_{s}"]
        if up is not None:
            self._world(f"hand_{s}", (d_f @ self.dir[f"hand_{s}"]).rotation_difference(Vector(up)) @ d_f)
        else:
            self._world(f"hand_{s}", d_f @ (q if q is not None else I))

    def curl(self, s, deg):
        for b in self.pb:
            n = b.name
            if n.endswith(f"_{s}") and n.split("_")[0] in FINGERS:
                axis = self.rest[n].to_matrix() @ X
                self._local(n, Quaternion(axis, math.radians(deg * (0.4 if n.startswith("thumb") else 1.0))))

    def neutral(self):
        self.hips(self.head["pelvis"]); self.spine()
        for s, sx in (("l", 1), ("r", -1)):
            self.foot(s, (sx * 0.15, 0, 0.074))
            self.hand(s, (sx * 0.27, -0.05, 0.82)); self.curl(s, 18)
