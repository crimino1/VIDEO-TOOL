#!/bin/bash
# real footage from YouTube, 1080p video only; credits in description-and-credits.txt
cd "$(dirname "$0")/.."
Y=../.venv/Scripts/yt-dlp.exe
FFB="/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin"
while read -r key id; do
  [ -z "$key" ] && continue
  ls assets/raw/yt/$key.* >/dev/null 2>&1 && continue
  $Y --js-runtimes node --ffmpeg-location "$FFB" -f "bv*[height<=1080][ext=mp4]/bv*[height<=1080]" -o "assets/raw/yt/$key.%(ext)s" --no-playlist -q "https://www.youtube.com/watch?v=$id" || echo "FAIL $key"
done <<LIST
soi lzPoG9H8Hlo
tepapa_exam drwwoJ8TAJc
tepapa_myst T8GVdMJ0eds
tepapa_oil ZanG27yuxwg
noaa_giant Lqim34DvCrs
noaa_sq1 i00jvra5y7M
noaa_sq2 AsgSYo-xZQc
noaa_red lKgFurhTT0w
noaa_two JuayFkN4-Gs
noaa_eye xjaNzZt2olk
noaa_biolum kF8oEcH1_yo
noaa_jelly vn2d_JhN7Ko
noaa_wtd faeLyGD7A2M
nautilus_sperm SkBpummjR5I
austral_tooth zFC-TRTj8nE
LIST
# real sperm whale clicks (audio)
[ -f assets/raw/onc_clicks.m4a ] || $Y --js-runtimes node --ffmpeg-location "$FFB" -f ba -x --audio-format wav -o "assets/raw/onc_clicks.%(ext)s" -q "https://www.youtube.com/watch?v=VhQ3CGSZMqU"
echo done
