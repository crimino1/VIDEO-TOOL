"""work/sfx_cues.json for real-sfx mix.py: real CC0 recordings on the snowdrift film's cue times.
Voice = base audio (--base-audio), SFX duck under it. No beds: wind only as short gusts on story beats."""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB = Path("C:/Users/daggu222105/VIDEO-TOOL/sfx-library/openverse")
src = (ROOT / "hf/assets/js/cues.js").read_text()
C = json.loads(re.search(r"window.CUE=(\{.*?\});", src).group(1))
f = lambda p: str(LIB / p).replace("\\", "/")
BOOST = 9.0
cues = []
add = lambda **k: cues.append({**k, "gain_db": round(k.get("gain_db", 0) + BOOST, 1)})

def strikes(a, b, per=0.9, off=0.675):
    out, k = [], 0
    while True:
        t = off + per * k
        if t > b: return out
        if t >= a: out.append(round(t, 3))
        k += 1

# walking in, leaving tracks
add(t=0.0, label="snow steps (walk in)", file=f("snowsteps/walking-on-snow_b5ffb096.mp3"), role="foley", anchor="start", max_dur=4.5, fade_out=0.5, gain_db=-5)
# walking backwards, brushing the tracks
add(t=C["tracks"] - 0.1, label="steps backwards + brush", file=f("snowsteps/snow-walk_8b7644c8.mp3"), role="foley", anchor="start", max_dur=2.8, fade_out=0.6, gain_db=-8)
add(t=C["tracks"] + 0.2, label="branch sweep", file=f("snowdig/snow-shovel-driveway-wav_e6b65b6a.mp3"), role="foley", anchor="start", slice=[1.0, 2.4], fade_out=0.5, gain_db=-10)
# cold wind on "freeze by morning"
add(t=C["freeze"] - 0.3, label="cold gust", file=f("windgust/wind-gust_72f441df.mp3"), role="ambience", anchor="start", max_dur=2.4, fade_in=0.3, fade_out=0.9, gain_db=-2)
# digging the cave
digs = [f("snowcrunch/snow-block-of-snow-igloo-brick-put-down-_15848b7b.mp3"), f("snowdig/shovel-sand-gravel-snow_3f4501af.mp3"),
        f("snowcrunch/snow-block-of-snow-igloo-brick-put-down-_a1d49325.mp3")]
for i, t in enumerate(strikes(C["dig"] + 0.3, C["cave"] + 0.1)):
    add(t=t, label="dig snow", file=digs[i % 3], role="foley", anchor="arrive", max_dur=0.9, pitch=[0, -1, 1, -2][i % 4], gain_db=-4)
# the stick pushed up through the roof
add(t=C["stick"] + 0.5, label="stick through snow", file=f("snowcrunch/footstep-in-the-snow-04-raw_4a429fd8.mp3"), role="foley", anchor="arrive", max_dur=0.9, pitch=3, gain_db=-5)
# soldiers climbing the drift
add(t=C["soldiers"] - 0.2, label="soldiers' steps", file=f("snowsteps/footsteps-mountain-boots-snow-walk-mono-_dbd596fc.mp3"), role="foley", anchor="start", max_dur=2.6, fade_out=0.6, gain_db=-7)
# pole stabs: snow crunch, then wood once the logs are in
for i in range(2):
    k = 0
    while True:
        t = C["stab"] + 1.1 * (k + (0.5 if i == 0 else 0.0))
        if t > C["storm"] - 0.2: break
        if t >= C["stab"] + 0.15:
            if t > C["logs"] + 0.8:
                add(t=round(t, 3), label="pole hits wood", file=f("woodknock/wood-knock_4f353076.mp3" if k % 2 else "woodknock/wood-knock-clean-close-wav_47aa1d50.mp3"),
                    role="hit", anchor="arrive", pitch=-2 - i, gain_db=-3)
            else:
                add(t=round(t, 3), label="pole stabs snow", file=f("snowcrunch/footstep-in-the-snow-03-raw_7ab11a2f.mp3"), role="foley", anchor="arrive", max_dur=0.7, pitch=i, gain_db=-6)
        k += 1
# the storm
add(t=C["storm"] - 0.1, label="storm gust", file=f("windgust/blizzard-looped-aif_3e186348.mp3"), role="ambience", anchor="start", max_dur=3.4, fade_in=0.4, fade_out=1.4, gain_db=0)
# digging the new room
for i, t in enumerate(strikes(C["newroom"] + 0.3, C["mistake"] - 0.2)):
    add(t=t, label="dig new room", file=digs[(i + 1) % 3], role="foley", anchor="arrive", max_dur=0.9, pitch=[-1, 0, -2, 1][i % 4], gain_db=-5)
# soldiers walking the packed path overhead
add(t=C["packed"] - 0.4, label="steps on the packed path", file=f("snowsteps/footsteps-snow-20-degrees-c-aif_7879b7ad.mp3"), role="foley", anchor="start", max_dur=4.2, fade_in=0.3, fade_out=0.8, gain_db=-8)

pic = sys.argv[1] if len(sys.argv) > 1 else "render/draft_15fps.mp4"
sheet = {"video": str(ROOT / pic).replace("\\", "/"), "cues": cues}
(ROOT / "work").mkdir(exist_ok=True)
(ROOT / "work/sfx_cues.json").write_text(json.dumps(sheet, indent=1))
print(len(cues), "cues")
