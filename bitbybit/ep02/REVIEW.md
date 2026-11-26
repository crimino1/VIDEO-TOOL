# EP2 review — How to Actually Get Good at Coding (9:06)

## What changed after the EP1 feedback
- Visuals: engine v2 (640x360 pixel grid, moving camera in every scene, parallax, glow/particles, whip-zoom transitions with no dark gaps). 46 full-environment pixel scenes built by 5 builders against a reference scene (`core.js` room). Cinematic opener (real 1080p clip) instead of text on black.
- Stock: Pixabay 1080p/4K real footage (6 clips) + 4 real screen recordings (GitHub requests repo and api.py, Wikipedia rubber duck, norvig.com) + Norvig photo (CC BY-SA 4.0, credited on screen). No Pexels.
- Sound: 20 soft Pixabay SFX (swooshes, UI clicks/pops, notifications, real mechanical keyboard, short glitches, soft impacts), 84 cues. Measured: SFX track -37.2 LUFS / peak -18.1 dBFS vs voice -14.1 LUFS / peak -0.8 → SFX 23 dB under in loudness, 17 dB under at peaks. No music. Final -14.0 LUFS, -1.3 dBTP.

## Measured vs looked at
- Measured: loudness above; part lengths 154.04 / 146.10 / 148.08 / 97.50 = 545.77 s (voice 545.72).
- Looked at: every scene kind with its real timing (contact sheets), full-part contact sheets of the render, dark-frame scan.
- Not heard: SFX picked by name and measured, not listened to.

## Fixed during review
- Zoom transitions dipped to black ~0.6 s at every cut → whip-zoom with ~0.07 s fade.
- White captions over bright footage/screens → dark caption backing.
- A stale render loop swapped part pages (part 1 rendered part 2) → part 1 re-rendered alone.

## Weakest spots
- Mascot shot at 0:24 sits on the starfield (channel identity) — the one sparse frame.
- Some characters are simple (blocky limbs); the keyboard hands are stylised.
