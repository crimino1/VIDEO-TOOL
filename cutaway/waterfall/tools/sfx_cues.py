"""Write work/sfx_cues.json for real-sfx mix.py: real CC0 recordings on the film's own cue times.
Voice is the base audio; SFX duck under it (--voice-safe). Waterfall roar only in short windows (no beds rule)."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB = Path("C:/Users/daggu222105/VIDEO-TOOL/sfx-library/openverse")
src = (ROOT / "hf/assets/js/cues.js").read_text()
C = json.loads(re.search(r"window.CUE=(\{.*?\});", src).group(1))
f = lambda p: str(LIB / p).replace("\\", "/")

FALLS = f("waterfall/huge-waterfall_58018390.mp3")
cues = []
BOOST = 9.0   # SFX sat ~18 dB under the voice; target 6-10 dB under
add = lambda **k: cues.append({**k, "gain_db": round(k.get("gain_db", 0) + BOOST, 1)})

# waterfall roar: hook, camera through the curtain, the loudest-part beat
add(t=0.0, label="falls roar (hook)", file=FALLS, role="ambience", anchor="start", max_dur=3.4, fade_in=0.05, fade_out=1.2, gain_db=4)
add(t=C["door"] - 0.2, label="falls roar (through curtain)", file=FALLS, role="ambience", anchor="start", max_dur=2.6, fade_in=0.5, fade_out=0.9, gain_db=3, slice=[6.0, 2.6])
add(t=C["deeper"] + 1.0, label="falls roar (loudest part)", file=FALLS, role="ambience", anchor="start", max_dur=3.2, fade_in=0.6, fade_out=1.0, gain_db=2, slice=[12.0, 3.2])
add(t=C["louder"] - 0.1, label="falls roar (louder than a street)", file=FALLS, role="ambience", anchor="start", max_dur=3.6, fade_in=0.4, fade_out=1.4, gain_db=1, slice=[18.0, 3.6])
# wading in the pool
add(t=0.15, label="wading", file=f("wade/walk-wet_358539b0.mp3"), role="foley", anchor="start", max_dur=3.9, fade_out=0.6, gain_db=-4)
# pick strikes: the dig pose strikes at 0.675 + 0.9k
digs = [f("digging/dig-wet-sand-04-wav_67f0f283.mp3"), f("digging/digging-in-wet-course-sand-1_e20b0666.mp3"),
        f("digging/digging-in-wet-course-sand-2_c8e26951.mp3")]
def strikes(a, b):
    k = 0; out = []
    while True:
        t = 0.675 + 0.9 * k
        if t > b: return out
        if t >= a: out.append(round(t, 3))
        k += 1
for i, t in enumerate(strikes(C["dig"] + 0.3, C["brown"] - 0.2)):
    add(t=t, label="pick strike", file=digs[i % 3], role="foley", anchor="arrive", max_dur=0.7, gain_db=-3 - (i % 2), pitch=[0, -1, 1, -2][i % 4])
for i, t in enumerate(strikes(C["deeper"] + 0.3, C["louder"] - 0.3)):
    add(t=t, label="pick strike (lower room)", file=digs[(i + 1) % 3], role="foley", anchor="arrive", max_dur=0.7, gain_db=-4, pitch=[-1, 1, 0, -2][i % 4])
# dirt dumped into the falls
add(t=C["carry"] + 0.05, label="dirt into the falls", file=f("splash/rock-in-water-splash-plop-3-aif_195a9550.mp3"), role="water", anchor="arrive", max_dur=1.6, gain_db=-2)
# the dog sniffs
add(t=C["dogs"] + 0.1, label="dog sniff", file=f("dogsniff/dog-sniffing-wav_92895aca.mp3"), role="foley", anchor="start", max_dur=2.4, fade_out=0.5, gain_db=-1)
# hero through the curtain, out and back
add(t=C["dogs"] + 0.55, label="through the falls (out)", file=f("splash/tiny-splash_d34abd9e.mp3"), role="water", anchor="arrive", max_dur=1.2, gain_db=-4)
add(t=C["scent"] - 0.1, label="through the falls (back in)", file=f("splash/water-splash-5-wav_bce7f4bc.mp3"), role="water", anchor="arrive", max_dur=1.4, gain_db=-5)
# cough (female hero)
add(t=C["stale"] + 0.3, label="cough", file=f("cough/cough-female_7332514d.mp3"), role="foley", anchor="arrive", max_dur=1.1, gain_db=-1)
# chisel clinks on the 0.5 s reach-up rhythm
HAM = f("chisel/tiny-hammer-on-stone-wav_3782c8f8.mp3")
for k, sl in enumerate([[1.494, 0.12], [2.189, 0.10], [0.729, 0.12], [1.084, 0.12], None]):
    t = round(C["chip"] + 0.3 + 0.5 * k, 3)
    if sl: add(t=t, label="chisel clink", file=HAM, role="foley", anchor="arrive", slice=sl if sl[0] != 2.189 else [2.189, 0.045], gain_db=-3 - (k % 2) * 2)
    else:  add(t=t, label="chisel clink", file=f("chisel/stone-hit_9cee8fc7.mp3"), role="foley", anchor="arrive", pitch=4, gain_db=-4)
# campfire: two short windows only
add(t=C["camp"] - 0.2, label="campfire crackle", file=f("campfire/r09-73-campfire-crackle-wav_89acb452.mp3"), role="ambience", anchor="start", max_dur=3.6, fade_in=0.4, fade_out=1.0, gain_db=-2)
# snore
add(t=C["louder"] + 1.2, label="snore", file=f("snore/fast-snore-wav_0b72d643.mp3"), role="foley", anchor="start", max_dur=2.6, fade_out=0.6, gain_db=-6)
# otter pops up, grabs the fish
add(t=C["otter"] - 0.35, label="otter pops up", file=f("splash/water-splash_40fae45f.mp3"), role="water", anchor="arrive", max_dur=0.9, gain_db=-6)
add(t=C["fish"] + 0.05, label="fish grabbed", file=f("splash/tiny-splash_d34abd9e.mp3"), role="water", anchor="arrive", max_dur=0.9, gain_db=-5, pitch=2)

import sys
pic = sys.argv[1] if len(sys.argv) > 1 else "render/picture_v1.mp4"
sheet = {"video": str(ROOT / pic).replace("\\", "/"), "cues": cues}
(ROOT / "work").mkdir(exist_ok=True)
(ROOT / "work/sfx_cues.json").write_text(json.dumps(sheet, indent=1))
print(len(cues), "cues")
