"""EP4 final sound: voice at -14 LUFS + real recorded SFX (Openverse CC0/CC BY library) placed on the picture. NO music, NO beds.
Usage: mix4.py <picture.mp4> <out.mp4>.  Cue = (time, library file, dB under voice, source start, length, fade in, fade out)."""
import json, os, re, subprocess, sys
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LIB = os.path.abspath(os.path.join(H, "..", "..", "sfx-library", "openverse"))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
END, VOICE = 740.09, -14.0
TMP = os.path.join(H, ".mix"); os.makedirs(TMP, exist_ok=True)
sys.path.insert(0, H)
from lib import w   # word times for exact sync

RUMB = "rumble/low-rumbling_b279f6e1.mp3"
CUES = [
    (0.0, RUMB, 22, 0, 9.6, 1.5, 2.0),                                        # night pad, distant
    (9.86, "rocket/rocket-launch_febec6ba.mp3", 6, 0.3, 4.6, 0.05, 1.8),      # engines ignite
    (11.58, "rumble/monster-low-rumble-1-wav_8492dcb9.mp3", 14, 0, 3.0, 0.2, 1.5),
    (13.48, "spacewind/woosh-low-long01-wav_1fbe8f6e.mp3", 13, 0, 4.4, 0.3, 1.5),
    (18.6, "thruster/compressed-air-short-9_f7cc8512.mp3", 17, 0, 0.8, 0.0, 0.2),
    (w("black", 27.5) - 0.25, "deepimpact/deep-impact_53776ebf.mp3", 8, 0, 5.5, 0.0, 2.0),
    (37.2, "reverse/cymbal-reversed-glassy-resonance-wav_1349736d.mp3", 17, 0, 3.2, 0.3, 0.6),
    (41.0, "thruster/thruster_8fbca1c9.mp3", 9, 0, 3.6, 0.1, 1.2),
    (44.64, RUMB, 18, 1, 4.4, 0.8, 1.5),
    (49.6, "beep/radio-beep_70f7303c.mp3", 20, 0, 0.3, 0, 0.05),
    (51.0, "beep/tone-beep-wav_a771fa44.mp3", 23, 0, 0.3, 0, 0.05),
    (53.16, "clock/clock-ticking_d4ea3ac7.mp3", 13, 0, 3.2, 0.1, 0.5),
    (56.5, "thruster/engine-power-up-1-wav_06d66326.mp3", 14, 0, 2.7, 0.1, 0.8),
    (60.4, "water/splash_5b58e432.mp3", 12, 0, 1.3, 0, 0.3),
    (65.24, "crowd/small-crowd-walla_2c99b37f.mp3", 21, 3, 2.0, 0.3, 0.6),
    (87.7, "static/fm-radio-static_9882c390.mp3", 24, 0, 1.0, 0.1, 0.4),
    (95.5, "glitch/vhs-glitch_632037d6.mp3", 20, 0, 1.2, 0, 0.3),
    (115.5, "boom/low-pitched-boom-noise_25d495a6.mp3", 10, 0, 5.0, 0, 2.0),   # title
    (134.14, "clock/old-clock-tick-tock_ba74031e.mp3", 15, 0, 4.0, 0.2, 0.6),
    (153.9, "spacewind/woosh-low-02-wav_2c52e6df.mp3", 14, 0, 2.2, 0.1, 0.6),
    (155.9, "thud/thud-bassy-slam-aiff_b0268d44.mp3", 13, 0, 2.0, 0, 0.6),
    (162.1, "spacewind/woosh-low-05-wav_665a9616.mp3", 12, 0, 2.2, 0.1, 0.6),
    (168.06, "tick/clock-tick-tik-tak_815ccec4.mp3", 14, 0, 2.0, 0, 0.3),
    (170.1, "reverse/movie-short-swell_8fac9f7f.mp3", 15, 1, 5.6, 0.5, 0.8),
    (203.4, "beep/beep-short_7b6f9690.mp3", 20, 0, 1.0, 0, 0.2),
    (210.7, "clock/clock-ticking_7a1bb8c4.mp3", 16, 0, 3.0, 0.1, 0.5),
    (246.96, "rocket/jet-engine-wav_1e96cc0a.mp3", 12, 5, 8.0, 1.0, 2.5),
    (270.58, "clock/clock-ticking_890ef7f9.mp3", 15, 0, 2.0, 0.1, 0.4),
    (297.14, "whoosh/deep-whoosh-1_eab8a6e2.mp3", 16, 0, 3.0, 0, 0.8),
    (324.98, "spacewind/woosh-low-04-wav_89e35018.mp3", 13, 0, 3.8, 0.2, 1.0),
    (355.4, "radio/walkie-talkie-famous-beep_f8b095ec.mp3", 19, 0, 0.7, 0, 0.1),
    (356.0, "static/short-wave-radio-noise-1_524e7306.mp3", 25, 2, 2.0, 0.3, 0.8),
    (400.66, RUMB, 18, 2, 4.5, 0.6, 1.5),
    (407.62, "rumble/monster-low-rumble-2-wav_8c2ad577.mp3", 13, 0, 4.0, 0.2, 1.5),
    (428.9, "deepimpact/deep-impact_3f00d9ee.mp3", 8, 0, 4.2, 0, 1.5),
    (433.2, "impact/low-impact-wav_a48224d6.mp3", 11, 0, 4.5, 0, 1.5),
    (464.8, "reverse/reverse-bass-wav_2601f173.mp3", 14, 0, 1.7, 0, 0.1),
    (465.1, "deepimpact/bass-impact-ki-01-mp3_d946174b.mp3", 11, 0, 3.9, 0, 1.2),
    (469.62, "riser/riser-neutral_2e3b8ea3.mp3", 16, 4.6, 7.3, 0.6, 0.1),
    (476.96, "impact/big-cinematic-impact_4d74056e.mp3", 9, 0, 5.2, 0, 2.0),
    (484.68, "spacewind/woosh-low-long01-wav_1fbe8f6e.mp3", 14, 0, 5.0, 0.3, 1.2),
    (489.7, "riser/scary-hits-risers-002_a9b70839.mp3", 17, 0, 4.7, 0.5, 0.2),
    (494.42, "thud/thud-bassy-slam-aiff_b0268d44.mp3", 15, 0, 2.0, 0, 0.6),
    (497.86, "thud/thud-bassy-slam-aiff_b0268d44.mp3", 13, 0, 2.0, 0, 0.6),
    (500.48, "thud/thud-bassy-bump2-aiff_83d8d8a1.mp3", 11, 0, 1.3, 0, 0.4),
    (w("thousand", 501.5), "impact/low-impact-wav_a48224d6.mp3", 9, 0, 5.0, 0, 1.6),
    (503.78, "rumble/rumble-bass-wav_6da204f2.mp3", 14, 2, 6.0, 0.4, 2.0),
    (516.32, "boom/low-pitched-boom-noise_25d495a6.mp3", 12, 0, 5.0, 0, 2.0),
    (w("every", 521.0), "ocean/ocean-waves-close-up_e1c68afe.mp3", 14, 20, 2.9, 0.3, 0.8),
    (548.0, "reverse/reverse-splash-cymbal_a02d2e28.mp3", 17, 0, 6.0, 0.3, 0.5),
    (554.0, "reverse/cymbal-hits-reversed-wav_17ad3a8e.mp3", 18, 0, 5.0, 0.5, 0.8),
    (575.9, RUMB, 15, 0, 4.6, 0.8, 2.0),
    (w("Tick", 596.0), "tick/clock-tick-01-flac_14b2945e.mp3", 12, 0, 0.5, 0, 0.1),
    (w("tick", 597.0), "tick/clock-tick-01-flac_14b2945e.mp3", 12, 0, 0.5, 0, 0.1),
    (w("tick", 597.6), "tick/clock-tick-01-flac_14b2945e.mp3", 12, 0, 0.5, 0, 0.1),
    (598.74, "clock/old-clock-tick-tock_ba74031e.mp3", 15, 2, 1.5, 0.1, 0.4),
    (600.3, "ocean/the-ocean-waves_f2ca017b.mp3", 15, 5, 2.2, 0.3, 0.6),
    (604.42, "reverse/movie-short-swell_8fac9f7f.mp3", 16, 1, 3.7, 0.4, 0.8),
    (667.16, "riser/riser-neutral_2e3b8ea3.mp3", 15, 3.5, 8.1, 0.8, 0.6),
    (675.32, "clock/clock-ticking_cf7184b8.mp3", 16, 0, 2.6, 0.1, 0.5),
    (687.4, RUMB, 18, 0, 3.0, 0.4, 1.0),
    (713.24, "impact/soft-cinematic-impact_10342426.mp3", 14, 0, 5.0, 0, 2.0),
    (735.1, "boom/low-pitched-boom-noise_25d495a6.mp3", 12, 0, 5.0, 0, 2.5),   # end title
]
for t, name, vol in json.load(open(os.path.join(H, "sfx.json"))):   # chapter cards
    CUES.append((t, "impact/soft-cinematic-impact_10342426.mp3", 11, 0, 5.0, 0, 2.0))


def run(a): subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y"] + a, check=True)


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


if __name__ == "__main__":
    pic, out = sys.argv[1:3]
    src_vo = os.path.join(H, "public", "voice.mp3")
    v_i, _ = lufs(src_vo)
    vo = os.path.join(TMP, "voice.wav")
    run(["-i", src_vo, "-af", f"aresample=48000,volume={VOICE - v_i + 1:.2f}dB,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120:makeup=1,alimiter=limit=0.89:attack=4:release=60:level=disabled",
         "-ac", "2", "-c:a", "pcm_s24le", vo])
    v_i, _ = lufs(vo)
    vo2 = os.path.join(TMP, "voice2.wav")
    run(["-i", vo, "-af", f"volume={VOICE - v_i:.2f}dB,alimiter=limit=0.89:attack=3:release=60:level=disabled", "-c:a", "pcm_s24le", vo2])
    vo = vo2; v_i, v_p = lufs(vo); print("voice", v_i, v_p)
    # each cue: cut, fade, level it to (voice - under) by its own loudness, place it
    parts = []
    for i, (t, f, under, ss, d, fi, fo) in enumerate(sorted(CUES)):
        src = os.path.join(LIB, f); assert os.path.exists(src), f
        cut = os.path.join(TMP, f"c{i}.wav")
        run(["-ss", f"{ss}", "-t", f"{d}", "-i", src, "-af", f"aresample=48000,afade=t=in:d={max(fi, 0.005)},afade=t=out:st={max(0, d - fo - 0.005)}:d={max(fo, 0.005)}", "-ac", "2", "-c:a", "pcm_s24le", cut])
        try: c_i, _ = lufs(cut)
        except Exception: c_i = -30.0
        if c_i < -70: c_i = -30.0
        p = os.path.join(TMP, f"p{i}.wav")
        run(["-i", cut, "-af", f"volume={(v_i - under) - c_i:.2f}dB,alimiter=limit=0.7:level=disabled,adelay={int(t * 1000)}:all=1", "-c:a", "pcm_s24le", p])
        parts.append(p)
    # sum in batches (ffmpeg input limits)
    def mixdown(files, outp):
        run(sum([["-i", p] for p in files], []) + ["-filter_complex", "".join(f"[{k}:a]" for k in range(len(files))) + f"amix=inputs={len(files)}:normalize=0:duration=longest[m]", "-map", "[m]", "-c:a", "pcm_s24le", outp])
    stems, B = [], 24
    for j in range(0, len(parts), B):
        sp = os.path.join(TMP, f"stem{j}.wav"); mixdown(parts[j:j + B], sp); stems.append(sp)
    sfx_all = os.path.join(TMP, "sfx.wav"); mixdown(stems, sfx_all) if len(stems) > 1 else os.replace(stems[0], sfx_all)
    final = os.path.join(TMP, "final.wav")
    run(["-i", vo, "-i", sfx_all, "-filter_complex", f"[0:a][1:a]amix=inputs=2:normalize=0:duration=first,apad=whole_dur={END},atrim=0:{END},alimiter=limit=0.89:attack=3:release=80:level=disabled[a]",
         "-map", "[a]", "-c:a", "pcm_s24le", final])
    f_i, f_p = lufs(final); print("final", f_i, f_p)
    run(["-i", final, "-af", f"volume={VOICE - f_i:.2f}dB,alimiter=limit=0.89:level=disabled", "-c:a", "pcm_s24le", final + ".n.wav"])
    print("final norm", lufs(final + ".n.wav"))
    run(["-i", pic, "-i", final + ".n.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", out])
    print("wrote", out)
