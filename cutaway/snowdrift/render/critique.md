# Critique, round 1

| axis | score | basis |
|---|---|---|
| hook | 10.0 | first sound at 0.00s |
| sync | 8.9 | 15/17 sounds on their frame (peaks, arrivals, or first onsets for clicks) |
| coverage | n/a | not measured (pass --moments) |
| pacing | 6.9 | 4.6 weighted events per 10 s, longest silence 9.4 s |
| variety | 4.5 | 20 source recordings, 14 families in 24 sounds (runs and interface sounds not counted) |
| hierarchy | 10.0 | 14.8 dB between the loud and the quiet sounds |
| headroom | 7.0 | true peak -3.3 dBTP; 3 cues peak above 0 dBFS before the limiter |
| loudness | 7.8 | final -14.5 LUFS is 2.8 dB UNDER the original (-11.7); where the original sounds the film is -2.8 dB: the ducking, the level match or the ceiling took it |
| balance | 10.0 | median event peak -11 dB vs the original around it, big sounds +0 dB (whole-track gap +10 LU) (14 event(s) on speech left to the speech axis) |
| audibility | 10.0 | 0 of 24 sounds sit more than 30 dB under the film's own sound in the mix (median -14 dB, after the ducking) |
| speech | 8.5 | 1 sound(s) in 1 moment(s) are within 3 dB of the voice or above it (0 above) even after ducking |
| low_end | 5.5 | 3 heavy sound(s) on top of existing bass |
| mono | 10.0 | the SFX track loses 0.1 dB when folded to mono (0 = the channels agree, 3 = unrelated, 6+ = parts cancel); 0 of 24 sounds lose more than 6 dB; the film loses 0.0 LU in mono against 0.0 LU for the original (+0.0 added) |

**FIX**: lowest axis 4.5 (every axis must reach 8; ok to show)

Three worst problems, fix only these, re-render, run again:
1. pacing: nothing happens between 38.62s and 48.00s (9.4 s)
2. low end: 'pole hits wood' at 29.65s piles onto the bass already there (-23 dB); lower it 2 dB, highpass >= 140 Hz (the check measures 30-140 Hz: 90 Hz is not enough), or drop its sub layer
3. low end: 'pole hits wood' at 30.20s piles onto the bass already there (-23 dB); lower it 20 dB, highpass >= 140 Hz (the check measures 30-140 Hz: 90 Hz is not enough), or drop its sub layer

Listen to these 5 moments, on headphones and then once on a phone speaker. This script cannot hear: they are the places where the numbers above are least certain, and none of them says that it sounds good:
  1.    0.00s  'snow steps (walk in)': the first sound of the film: the hook. Listen for: does it land with the picture at once, and is it clearly there under the music or the voice?
  2.    7.20s  'cold gust': a quiet recording lifted by 15 dB. Listen for: does its noise floor come up with it (hiss)?
  3.   27.95s  the busiest two seconds (4 sounds). Listen for: is every sound still distinct, or does it turn to mud?
  4.   29.65s  'pole hits wood': the highest peak of the film (+2 dBFS before the master). Listen for: is it big without hurting on headphones, and does the music under it pump?
  5.   31.32s  'storm gust': its peak sits +82 ms from the moment; also 'pole hits wood' at 30.75s: 1 sound(s) on top of the voice, -2.3 dB against it. Listen for: does it feel early or late against the picture? / is every word still understood?
  (--listen-out FILE.wav cuts them into one file of the film's own sound)

Still to judge by eye on review.png: character fit (each sound suits its picture), cleanliness (no mud in the low end under music/voice, nothing masks speech), taste (designed, not sprayed on).