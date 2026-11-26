"""Voice polish, timing untouched: public/vo.mp3 -> public/vo_enh.wav (mix.py prefers it).
Measured on the source: rumble below 80 Hz, boomy 200-300 Hz, MP3 cutoff at ~11 kHz (dull), clean pauses."""
import os, subprocess
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
CHAIN = ",".join([
    "aresample=48000:resampler=soxr",
    "highpass=f=70:poles=2,highpass=f=70:poles=2",            # rumble below the voice (24 dB/oct)
    "equalizer=f=230:t=q:w=1.1:g=-3",                          # mud
    "equalizer=f=500:t=q:w=1.4:g=-1",                          # boxiness
    "equalizer=f=3200:t=q:w=0.9:g=2",                          # presence / clarity
    "highshelf=f=8000:g=1.5",                                  # air up to the MP3 cutoff
    "aexciter=amount=1.2:drive=6:blend=0:freq=7500:ceil=16000",  # light harmonics above the 11 kHz cutoff
    "deesser=i=0.35:m=0.5:f=0.5",                              # tame the brighter S sounds
    "acompressor=threshold=-22dB:ratio=2:attack=12:release=180:knee=4:makeup=2",  # smooth level
])
src, out = os.path.join(H, "public", "vo.mp3"), os.path.join(H, "public", "vo_enh.wav")
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-af", CHAIN, "-c:a", "pcm_s24le", out], check=True)
print("wrote", out)
