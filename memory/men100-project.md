---
name: men100-project
description: "\"Could 100 Men Beat Every Prehistoric Predator?\" 13-min UK2 16:9 film: paleoart cut-outs puppeted on photo plates, 100 drawn men, counter, tier board (men100/)"
metadata:
  node_type: memory
  type: project
  originSessionId: fae1fb12-2f56-480d-a5aa-eea12b7ae6fd
  modified: 2026-11-22T13:48:47.832Z
---

Started 2026-11-22 in `VIDEO-TOOL\men100` from the user's voice "A hundred men stand .mp3" (12:14). It is the first long-form film in [[unseen-kingdom-2-style]]. The user asked for 16:9, "realistic images of mammals like on that 3 videos, same type animation" (the shorts' photo cut-out puppet look) and "use all stuff".

- **Voice and timing:**
  - `make_vo.py` inserts silent gaps (3.4 s card, 5.6–6.6 s board drop plus card) into `assets/audio/vo.wav`.
  - It writes `words2.json` and `cards.json`.
  - The film is 790 s.
- **Rig (`assets/js/pz.js`):**
  - `PZ.scene`: photo plate, cut-out beasts (walk bob, lunge, swap poses, fall, hit flash, strip-warp swim), crowd of 100 drawn men (side and front figures, ring/flee/cheer/throw acts, fling), a "MEN STANDING" counter, dust, speed lines.
  - `PZ.size` (size chart) and `PZ.board` (tier board with drops and moves).
  - Titanoboa is drawn in code.
- **Build:**
  - `build.py` with `shots.py` writes `parts/p1..p6`. Part boundaries snap to shot starts; a part that starts mid-shot leaves that shot black.
  - Then run `tools/render_parts.sh` and `tools/mix.py`.
- **Feedback (2026-11-22, after the first cut):**
  - The opening music was "very bad" ("Unseen Horrors"), the opening grass was too big, and the drawn humans looked very bad. The user said: "use real human visual like animals".
  - Fixes: the men are now Pexels full-body photo cut-outs (`assets/people`, PPL groups in `pz.js`), puppeted like the animals. Opening music is now "Lightless Dawn". The giant grass close-up and the grass strips were removed.
  - Pick music with `tools/music_test.py` (voice-clear and tension scores), never by name.
- **Then (same day): "remove background musics, add sfx ... good level".** Music is gone from the film.
  - 80 Mixkit free SFX are in `assets/sfx` (scraped with `tools/mixkit_list.py`; preview mp3 = full file). Their measurements are in `info.json`.
  - `sound.py` places a cue on every action: species voices, lunges, hits, flings, falls, T. rex steps, crowd shout/cheer, splashes, plate ambience, card/board hits.
  - `tools/mix_sfx.py` mixes in numpy. Effects are ducked so they stay 7+ dB under the voice while it speaks.
  - Commons audio search is rate-limited and thin; Mixkit is the source to use.
- Credits are in `description-and-credits.txt`.

**Why:** the user wants a high-quality UK2 long-form film.

**How to apply:** reuse `pz.js` and the build/shots pattern for the next UK2 ranking film; check facing (NAT dict) of every cut-out against the contact sheet. Related: [[video-toolchain]], [[predators-project]].
