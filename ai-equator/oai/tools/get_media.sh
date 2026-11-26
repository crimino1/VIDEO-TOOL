#!/bin/bash
# Downloads every verified source for the GPT-6.2 Astra video into assets/raw.
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
CAP="node ../tools/capture.mjs"
pbs() { curl -4 -sL --max-time 60 -o "assets/raw/web/$2" "https://pbs.twimg.com/media/$1?format=${3:-png}&name=4096x4096" && echo "ok $2"; }
pbs HXWIHMvboAAIcQ8 c_ale.png
pbs HXWIIE-aQAAdcVB c_fcode.png
pbs HXWII8Wa0AAS0b0 c_tbsci.png
pbs HXWFd1_bIAAi6NF c_astra1.png
pbs HXWFfGPboAAcE96 c_astra2.png
pbs HXWFgH8aUAAzQ0x c_astra3.png
pbs HXWC7lJboAAhE-y c_sol.png
pbs HXWDnbCbUAA3RTB c_aa.jpg jpg
pbs HXWRIsDaoAAg0kb c_epoch.jpg jpg
vid() { $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o "assets/raw/x/$2.%(ext)s" "$1" && echo "ok $2"; }
vid https://x.com/OpenAI/status/2122750124543926515 x_launch
vid https://x.com/OpenAIDevs/status/2122752256923873753 x_sets
vid https://x.com/OpenAIDevs/status/2122752394002071717 x_flag
vid https://x.com/OpenAIDevs/status/2122752442240827467 x_rc
vid https://x.com/emollick/status/2122755693191287009 x_mollick
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2122750124543926515 launch
tw 2122750128176222464 sol
tw 2122750634210529569 aa
tw 2122762380463735010 epoch
tw 2122757647170703550 theo
tw 2122760447103484410 theo2
tw 2122754729012777052 shipper
tw 2122751346365591923 weinbach
tw 2122752192226406421 shumer
tw 2122755693191287009 mollick
tw 2122752500877144461 fast
tw 2122752442240827467 rc
