# Critique, round 1

| axis | score | basis |
|---|---|---|
| hook | 10.0 | first sound at 0.00s |
| sync | 9.0 | 16/18 sounds on their frame (peaks, arrivals, or first onsets for clicks) |
| coverage | n/a | not measured (pass --moments) |
| pacing | 9.6 | 5.4 weighted events per 10 s, longest silence 5.6 s |
| variety | 1.0 | 21 source recordings, 15 families in 31 sounds (runs and interface sounds not counted) |
| hierarchy | 10.0 | 16.2 dB between the loud and the quiet sounds |
| headroom | 10.0 | true peak -4.1 dBTP |
| loudness | 7.8 | final -14.5 LUFS is 2.8 dB UNDER the original (-11.7); where the original sounds the film is -2.8 dB: the ducking, the level match or the ceiling took it |
| balance | 3.0 | median event peak -18 dB vs the original around it (whole-track gap +20 LU) (20 event(s) on speech left to the speech axis) |
| audibility | 6.7 | 7 of 30 sounds sit more than 30 dB under the film's own sound in the mix (median -24 dB, after the ducking) |
| speech | 10.0 | 0 sound(s) in 0 moment(s) are within 3 dB of the voice or above it (0 above) even after ducking |
| low_end | 10.0 | 0 heavy sound(s) on top of existing bass |
| mono | 10.0 | the SFX track loses 0.1 dB when folded to mono (0 = the channels agree, 3 = unrelated, 6+ = parts cancel); 0 of 31 sounds lose more than 6 dB; the film loses 0.0 LU in mono against 0.0 LU for the original (+0.0 added) |

**FIX**: lowest axis 1.0 (every axis must reach 8; ok to show)

Three worst problems, fix only these, re-render, run again:
1. sync: 'falls roar (loudest part)' at 35.42s peaks +143 ms from the moment
2. variety: huge-waterfall_58018390.mp3 is the source of 4 sounds (0.00s, 8.82s, 35.42s, 38.82s); a slice or a pitch step does not make it another sound
3. variety: tiny-hammer-on-stone-wav_3782c8f8.mp3 is the source of 4 sounds (26.46s, 26.96s, 27.46s, 27.96s); a slice or a pitch step does not make it another sound

Listen to these 5 moments, on headphones and then once on a phone speaker. This script cannot hear: they are the places where the numbers above are least certain, and none of them says that it sounds good:
  1.    0.15s  'wading': brought 6 dB up to the perceived level of its role; also 'falls roar (hook)' at 0.00s: the first sound of the film: the hook. Listen for: a thin recording lifted that far can turn harsh: is it clean? / does it land with the picture at once, and is it clearly there under the music or the voice?
  2.   26.46s  'chisel clink': the highest peak of the film (-9 dBFS before the master); also 'chisel clink' at 27.46s: a quiet recording lifted by 15 dB. Listen for: is it big without hurting on headphones, and does the music under it pump? / does its noise floor come up with it (hiss)?
  3.   28.46s  'chisel clink': pitched +4 st (its character changes). Listen for: is it still the same kind of sound?
  4.   35.42s  'falls roar (loudest part': its peak sits +143 ms from the moment. Listen for: does it feel early or late against the picture?
  5.   40.12s  'snore': its attack was moved 350 ms so that it lands on the moment. Listen for: does the lead-in still read as part of the sound?
  (--listen-out FILE.wav cuts them into one file of the film's own sound)

Still to judge by eye on review.png: character fit (each sound suits its picture), cleanliness (no mud in the low end under music/voice, nothing masks speech), taste (designed, not sprayed on).

---

# Critique, round 2

| axis | score | basis |
|---|---|---|
| hook | 10.0 | first sound at 0.00s |
| sync | 8.9 | 15/17 sounds on their frame (peaks, arrivals, or first onsets for clicks) |
| coverage | n/a | not measured (pass --moments) |
| pacing | 9.6 | 5.4 weighted events per 10 s, longest silence 5.6 s |
| variety | 1.0 | 21 source recordings, 15 families in 31 sounds (runs and interface sounds not counted) |
| hierarchy | 10.0 | 18.3 dB between the loud and the quiet sounds |
| headroom | 10.0 | true peak -3.8 dBTP |
| loudness | 7.8 | final -14.5 LUFS is 2.8 dB UNDER the original (-11.7); where the original sounds the film is -2.8 dB: the ducking, the level match or the ceiling took it |
| balance | 7.0 | median event peak -14 dB vs the original around it (whole-track gap +14 LU) (20 event(s) on speech left to the speech axis) |
| audibility | 7.7 | 5 of 30 sounds sit more than 30 dB under the film's own sound in the mix (median -18 dB, after the ducking) |
| speech | 10.0 | 0 sound(s) in 0 moment(s) are within 3 dB of the voice or above it (0 above) even after ducking |
| low_end | 10.0 | 0 heavy sound(s) on top of existing bass |
| mono | 10.0 | the SFX track loses 0.1 dB when folded to mono (0 = the channels agree, 3 = unrelated, 6+ = parts cancel); 0 of 31 sounds lose more than 6 dB; the film loses 0.0 LU in mono against 0.0 LU for the original (+0.0 added) |

**FIX**: lowest axis 1.0 (every axis must reach 8; ok to show)

Three worst problems, fix only these, re-render, run again:
1. sync: 'falls roar (loudest part)' at 35.42s peaks +143 ms from the moment
2. variety: huge-waterfall_58018390.mp3 is the source of 4 sounds (0.00s, 8.82s, 35.42s, 38.82s); a slice or a pitch step does not make it another sound
3. variety: tiny-hammer-on-stone-wav_3782c8f8.mp3 is the source of 4 sounds (26.46s, 26.96s, 27.46s, 27.96s); a slice or a pitch step does not make it another sound

Listen to these 5 moments, on headphones and then once on a phone speaker. This script cannot hear: they are the places where the numbers above are least certain, and none of them says that it sounds good:
  1.    0.00s  'falls roar (hook)': the first sound of the film: the hook; its peak sits +39 ms from the moment. Listen for: does it land with the picture at once, and is it clearly there under the music or the voice? / does it feel early or late against the picture?
  2.   18.86s  'dog sniff': the highest peak of the film (-7 dBFS before the master). Listen for: is it big without hurting on headphones, and does the music under it pump?
  3.   27.46s  'chisel clink': a quiet recording lifted by 15 dB; also 'chisel clink' at 28.46s: pitched +4 st (its character changes). Listen for: does its noise floor come up with it (hiss)? / is it still the same kind of sound?
  4.   35.42s  'falls roar (loudest part': its peak sits +143 ms from the moment. Listen for: does it feel early or late against the picture?
  5.   40.12s  'snore': its attack was moved 350 ms so that it lands on the moment. Listen for: does the lead-in still read as part of the sound?
  (--listen-out FILE.wav cuts them into one file of the film's own sound)

Still to judge by eye on review.png: character fit (each sound suits its picture), cleanliness (no mud in the low end under music/voice, nothing masks speech), taste (designed, not sprayed on).

---

# Critique, round 3

| axis | score | basis |
|---|---|---|
| hook | 10.0 | first sound at 0.00s |
| sync | 8.9 | 15/17 sounds on their frame (peaks, arrivals, or first onsets for clicks) |
| coverage | n/a | not measured (pass --moments) |
| pacing | 9.6 | 5.4 weighted events per 10 s, longest silence 5.6 s |
| variety | 1.0 | 21 source recordings, 15 families in 31 sounds (runs and interface sounds not counted) |
| hierarchy | 10.0 | 18.3 dB between the loud and the quiet sounds |
| headroom | 10.0 | true peak -3.6 dBTP |
| loudness | 7.8 | final -14.5 LUFS is 2.8 dB UNDER the original (-11.7); where the original sounds the film is -2.8 dB: the ducking, the level match or the ceiling took it |
| balance | 10.0 | median event peak -11 dB vs the original around it (whole-track gap +11 LU) (20 event(s) on speech left to the speech axis) |
| audibility | 7.3 | 6 of 31 sounds sit more than 30 dB under the film's own sound in the mix (median -15 dB, after the ducking) |
| speech | 10.0 | 0 sound(s) in 0 moment(s) are within 3 dB of the voice or above it (0 above) even after ducking |
| low_end | 10.0 | 0 heavy sound(s) on top of existing bass |
| mono | 10.0 | the SFX track loses 0.1 dB when folded to mono (0 = the channels agree, 3 = unrelated, 6+ = parts cancel); 0 of 31 sounds lose more than 6 dB; the film loses 0.0 LU in mono against 0.0 LU for the original (+0.0 added) |

**FIX**: lowest axis 1.0 (every axis must reach 8; ok to show)

Three worst problems, fix only these, re-render, run again:
1. sync: 'falls roar (loudest part)' at 35.42s peaks +143 ms from the moment
2. variety: tiny-hammer-on-stone-wav_3782c8f8.mp3 is the source of 4 sounds (26.46s, 26.96s, 27.46s, 27.96s); a slice or a pitch step does not make it another sound
3. variety: huge-waterfall_58018390.mp3 is the source of 4 sounds (0.00s, 8.82s, 35.42s, 38.82s); a slice or a pitch step does not make it another sound

Listen to these 5 moments, on headphones and then once on a phone speaker. This script cannot hear: they are the places where the numbers above are least certain, and none of them says that it sounds good:
  1.    0.00s  'falls roar (hook)': the first sound of the film: the hook; its peak sits +39 ms from the moment. Listen for: does it land with the picture at once, and is it clearly there under the music or the voice? / does it feel early or late against the picture?
  2.   18.86s  'dog sniff': the highest peak of the film (-4 dBFS before the master). Listen for: is it big without hurting on headphones, and does the music under it pump?
  3.   27.46s  'chisel clink': a quiet recording lifted by 18 dB; also 'chisel clink' at 28.46s: pitched +4 st (its character changes). Listen for: does its noise floor come up with it (hiss)? / is it still the same kind of sound?
  4.   35.42s  'falls roar (loudest part': its peak sits +143 ms from the moment. Listen for: does it feel early or late against the picture?
  5.   40.12s  'snore': its attack was moved 350 ms so that it lands on the moment. Listen for: does the lead-in still read as part of the sound?
  (--listen-out FILE.wav cuts them into one file of the film's own sound)

Still to judge by eye on review.png: character fit (each sound suits its picture), cleanliness (no mud in the low end under music/voice, nothing masks speech), taste (designed, not sprayed on).