"""One-off patch: replace the pose library + staging in world.js with aim-based posing."""
from pathlib import Path
p = Path(__file__).resolve().parents[1] / "hf/assets/js/world.js"
s = p.read_text(encoding="utf-8")
a = s.index("// pose library (procedural layers on top of a base clip)")
b = s.index("function stageDog(t) {")
new = (Path(__file__).parent / "poses.js.txt").read_text(encoding="utf-8")
s = s[:a] + new + s[b:]
s = s.replace('this.root.position.set(x, y, z); this.root.rotation.set(pitchDeg * Math.PI / 180, yawDeg * Math.PI / 180, rollDeg * Math.PI / 180, "YXZ");',
              'this.root.position.set(x, y, z); this.root.rotation.set(pitchDeg * Math.PI / 180, yawDeg * Math.PI / 180, rollDeg * Math.PI / 180, "YXZ"); this.root.updateMatrixWorld(true);')
p.write_text(s, encoding="utf-8")
print("patched")
