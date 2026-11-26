# Writing 3D scenes for the Electricity film

Project: C:\Users\daggu222105\VIDEO-TOOL\electricity (Windows, Git Bash). Film is a calm, cinematic physics DOCUMENTARY rendered with HyperFrames (HTML -> video, frame-by-frame seeking) and Three.js r160 (global THREE, non-module build).

Read first:
- `assets/js/core3d.js` — shared toolkit `L3`: stage("studio"|"void"|"space", opts), cam(fov), orbit(C, tx,ty,tz, dist, azDeg, elDeg), M.copper/steel/brass/paint/matte/glass/light/line, P (quiet palette), tex(name) (assets/tex: 2k_earth_daymap.jpg, 2k_earth_clouds.jpg, 2k_moon.jpg, 2k_sun.jpg, 2k_stars.jpg), canvasTex(w,h,fn), glowSprite, liveTube(fn,segs,r,mat,closed) (auto-rebuilt every frame), seg(t,a,b) eased 0..1, smooth, lerp, clamp, rnd(seed), KF(keyframes,t). Do not edit core3d.js / boot3d.js; put helpers in your own file.
- `assets/js/boot3d.js` — how shots are drawn and pins placed.
- `shots.py` — the film list (S: shot start times, overlay text per shot). `kinds.py` — `KINDS` holds your briefs (times are FILM seconds; modes per kind). Read the matching voiceover lines in `transcript.txt` so visuals land on the words.
- Earlier kinds you may copy code from (do not edit them): C:/Users/daggu222105/VIDEO-TOOL/strings/assets/js/k_*.js (blackhole, trampoline, graviton ripple sheet, atom...).
- Style rules: C:\Users\daggu222105\.claude\skills\channel-style\channels\physics.md, sections "STYLE v2" and "STYLE v2.1".

A kind is:  LABK.name = (o) => { build scene once; return (t, d) => [scene, camera, pins]; }
- o.mode = the mode string, o.T0 = film time of the shot start, so film time is ft = o.T0 + t. One builder function can serve several shots (it is called once per shot).
- pins = [[text, x, y, z, opacity], ...] small caps labels on thin leader lines pinned to 3D points. Use them for object names; fade with opacity (0..1). Max ~2 visible at once. No other text in 3D.
- Pure function of t: no Date/performance/Math.random/requestAnimationFrame, no state carried between frames (frames are seeked in any order). Seeded randomness only (L3.rnd(seed)).
- Keep construction reasonably light (a part holds ~20 shots, all built at load). Reuse geometry/materials within a kind.

Look (the user called the earlier neon-glow look "AI slop"; this channel is now realistic and calm):
- Real objects, real materials (metal, wood, rubber, cloth, satin), soft studio light, shadows on "studio" stage. Abstract physics (strings, fields, clouds) is warm white / pale blue, thin and elegant; additive glow only as a very soft halo, never neon. No rainbow, no saturated gold/cyan/magenta, no bouncy motion.
- Cinematic camera: slow continuous dollies/orbits, eased; something always moves (no frozen frame > 3 s). The subject is on screen from the first frame (t=0) of every shot: no empty lead-ins.
- Realism matters more than ever in this film: physically plausible light, real materials, NO people or hands (real footage covers humans). Compose with the lower-left and lower third free when the shot has overlay text (see the ov entries in shots.py for that shot).
- 1920x1080. Keep subjects inside the 90% safe area.

Test loop (your own folder, e.g. try_a):
  cd /c/Users/daggu222105/VIDEO-TOOL/electricity && ../.venv/Scripts/python.exe -I tools/try.py try_a <kind> <mode> <filmStart> <dur> <t1,t2,...>
  then open try_a/sheet.jpg with the Read tool. Times are seconds into the shot. Sample 5-9 times per shot, look for: wrong framing, empty/black frames, objects clipping the camera, ugly materials, things not matching the brief at its time. Console errors are printed.
Iterate until every mode of every kind looks like a high-end documentary frame. Other people are writing other k_*.js files at the same time; touch only your own file and your own try folder.

## Hard rules for this film (from the user's last two reviews)
- THE THESIS: after 2:40 film time, electrons never travel along a wire. They jiggle in place (50 Hz, tiny amplitude). What travels is ENERGY, through the fields around the wire. Never show streaming dots racing down a conductor to "deliver" power.
- Banned looks: line-diagram/wireframe looks, bright tech grids, neon glow, any clipped pure-white blobs, flat lifeless discs. Real materials (copper, brass, plastic, glass, concrete) and soft studio or natural light.
- Motion: the camera is never static for more than 2 s; slow eased dollies/orbits. The subject is on screen from the first frame of every shot.
- try.py does NOT report JS or shader errors: run `node --check assets/js/<yourfile>.js` after every edit and look at every sheet.
