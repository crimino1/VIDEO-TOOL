"""Cue sheet for the Black Holes film (film seconds). Beds: (t0, t1, file, gain). Hits: (t, file, gain). Files in assets/sfx (sd_* = tools/make_sfx2.py)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from shots import SHOTS

SPACE = {"escape", "shrink", "darkstar", "spacetime", "lightbend", "horizon", "starlife", "lightband", "infall", "xray", "flicker", "cygx1",
         "galcenter", "bhslow", "merger", "eht", "eyepiece", "trampoline"}
BEDS = []
# low space drone under every 3D space shot (merged into runs)
run = None
for s in SHOTS:
    sp = s["kind"] == "3d" and s["k"] in SPACE and not (s["k"] == "escape" and s["mode"] == "toss")
    if sp and run and abs(run[1] - s["start"]) < 0.05:
        run[1] = s["end"]
    elif sp:
        if run: BEDS.append((run[0], run[1], "sd_drone", 0.16))
        run = [s["start"], s["end"]]
    elif run:
        BEDS.append((run[0], run[1], "sd_drone", 0.16)); run = None
if run: BEDS.append((run[0], run[1], "sd_drone", 0.16))

BEDS += [
    (0.0, 6.5, "sd_wind", 0.10), (40.68, 50.70, "sd_wind", 0.10), (155.74, 162.30, "sd_wind", 0.08), (162.30, 172.98, "sd_wind", 0.06),
    (280.3, 292.0, "sd_coinroll", 0.05), (339.08, 352.0, "sd_wind", 0.07), (417.08, 427.0, "sd_water", 0.14), (427.0, 441.36, "sd_water", 0.20),
    (464.14, 474.70, "sd_sunroar", 0.16), (484.0, 497.56, "sd_sunroar", 0.16), (736.78, 742.02, "sd_sunroar", 0.14),
    (542.18, 554.84, "sd_sea", 0.12), (629.52, 640.02, "sd_pulsar", 0.30), (711.18, 719.72, "sd_crickets", 0.06), (733.36, 736.78, "sd_fire", 0.22),
    (770.58, 781.48, "sd_rocket", 0.24), (979.50, 990.20, "sd_coinroll", 0.26), (1044.18, 1051.28, "sd_crickets", 0.05),
    (1108.30, 1116.80, "sd_wind", 0.06), (1307.84, 1310.2, "sd_wind", 0.07), (1359.60, 1363.18, "sd_cabin", 0.16), (1363.18, 1371.20, "sd_wind", 0.12),
]

HITS = [
    (3.6, "sd_air", 0.12), (9.25, "sd_paper", 0.30), (9.8, "sd_pen", 0.16), (13.6, "sd_pen", 0.14), (23.42, "whoosh-short", 0.12), (29.54, "sd_shutter", 0.28),
    (36.5, "sd_air", 0.15), (41.0, "whoosh-short", 0.22), (49.55, "whoosh-short", 0.26), (59.5, "whoosh", 0.18), (69.3, "impact-bass-2", 0.18),
    (80.0, "whoosh-short", 0.16), (83.0, "whoosh", 0.18), (99.5, "sd_riser", 0.18), (118.6, "sd_riser", 0.22), (131.7, "sd_boom", 0.30),
    (139.9, "sd_air", 0.10), (163.0, "sd_bell", 0.16), (191.6, "sd_rumble", 0.20), (200.88, "shimmer", 0.14), (242.3, "sd_paper", 0.28),
    (267.26, "sd_air", 0.14), (277.0, "sd_boom", 0.22), (302.68, "shimmer", 0.12), (314.36, "sd_shutter", 0.24), (340.5, "sd_rumble", 0.14),
    (346.0, "sd_rumble", 0.12), (352.2, "sd_paper", 0.25), (353.0, "sd_pen", 0.15), (358.0, "sd_pen", 0.13), (382.3, "sd_riser", 0.18),
    (389.12, "impact-bass-2", 0.20), (410.0, "sd_beep", 0.10), (411.6, "sd_beep", 0.10), (413.2, "sd_beep", 0.08), (441.4, "sd_paper", 0.22),
    (508.0, "sd_riser", 0.18), (514.9, "sd_boom", 0.24), (532.44, "ding", 0.08), (543.0, "sd_horn", 0.14), (564.6, "sd_pen", 0.14),
    (605.5, "sd_boom", 0.24), (645.3, "sd_riser", 0.16), (650.28, "impact-bass-1", 0.26), (669.0, "sd_riser", 0.18), (673.0, "sd_boom", 0.26),
    (682.5, "sd_rumble", 0.12), (705.42, "impact-bass-2", 0.22), (742.02, "sd_air", 0.14), (755.0, "sd_sweep", 0.10), (761.3, "sd_air", 0.12),
    (786.0, "sd_beep", 0.10), (787.4, "sd_beep", 0.10), (788.8, "sd_beep", 0.10), (794.98, "sd_shutter", 0.18), (809.7, "glitch-1", 0.08),
    (814.9, "sd_sweep", 0.14), (845.0, "shimmer", 0.13), (859.5, "sd_motorbike", 0.40), (903.6, "sd_air", 0.12), (921.6, "sd_air", 0.10),
    (937.9, "impact-bass-2", 0.18), (944.1, "sd_air", 0.10), (952.0, "sd_air", 0.10), (955.5, "sd_air", 0.10), (959.8, "impact-bass-1", 0.24),
    (962.5, "sd_air", 0.12), (1003.0, "sd_sweep", 0.08), (1007.44, "sd_rumble", 0.16), (1059.64, "sd_shutter", 0.18), (1080.0, "whoosh-cinematic", 0.16),
    (1093.0, "shimmer", 0.12), (1131.9, "whoosh-short", 0.20), (1142.6, "impact-bass-2", 0.16), (1180.82, "sd_air", 0.12), (1197.4, "sd_riser", 0.14),
    (1204.3, "sd_chirp", 0.30), (1204.86, "impact-bass-2", 0.32), (1222.54, "sd_shutter", 0.16), (1239.06, "sd_hum", 0.10), (1252.0, "sd_chirp", 0.26),
    (1258.0, "sd_chirp", 0.22), (1281.6, "sd_chirp", 0.26), (1282.2, "impact-bass-1", 0.24), (1310.2, "whoosh-cinematic", 0.20), (1322.34, "sd_air", 0.10),
    (1345.8, "tick", 0.20), (1346.8, "tick", 0.20), (1347.8, "tick", 0.20), (1348.8, "tick", 0.18), (1349.8, "tick", 0.16), (1354.5, "sd_drive", 0.24),
    (1371.2, "whoosh-cinematic", 0.24), (1371.4, "impact-bass-1", 0.28), (1371.5, "sd_shutter", 0.20), (1394.5, "sd_air", 0.12), (1405.76, "shimmer", 0.16),
    (1416.3, "sd_air", 0.10), (1422.6, "sd_paper", 0.18), (1424.2, "whoosh-short", 0.10), (1426.44, "sd_horn", 0.08), (1429.02, "whoosh-short", 0.10),
    (1431.9, "sd_rumble", 0.12), (1434.88, "whoosh-short", 0.10), (1440.6, "whoosh-short", 0.10), (1442.3, "sd_chirp", 0.14), (1444.1, "sd_shutter", 0.14),
    (1459.9, "sd_paper", 0.18), (1477.0, "shimmer", 0.12),
]
