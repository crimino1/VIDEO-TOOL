#!/bin/bash
# Media for the GLM-5.4 video (posts verified via fxtwitter in the research brief).
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
CAP="node ../tools/capture.mjs"
vid() { $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o "assets/raw/x/$2.%(ext)s" "$1" && echo "ok $2" || echo "FAIL $2"; }
vid https://x.com/louszbd/status/2124763783805694457 x_lou_game
vid https://x.com/ItsmeAjayKV/status/2124763173526094324 x_ajay_vs
O=https://z-ai-bj.oss-cn-beijing.aliyuncs.com/prompts-rich-media-resources/5.4-blog
k=1; for f in 27570_1795400681.mp4 "1517_1795370530(原视频).mp4" a2b99f0a783fafdbfdd9b6b19d104595_raw.mp4 331_1795422567_raw.mp4; do
  curl -s -4 -L --max-time 240 -o assets/raw/x/zai_demo$k.mp4 "$O/$(python -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$f")" && echo "ok zai_demo$k $(stat -c%s assets/raw/x/zai_demo$k.mp4)" || echo "FAIL zai_demo$k"; k=$((k+1)); done
curl -s -4 -L --max-time 120 -o assets/raw/web/blog_cover.jpg "$O/20261123-173242.jpeg" && echo "ok cover"
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2124719275864670681 zixuan
tw 2124811995912286352 zai
tw 2124722646625726664 karan
tw 2124812596125823294 bash
tw 2124815680243724645 deshiou
tw 2124763173526094324 ajay
tw 2124758294388789312 mileson
s() { $CAP shot "$1" assets/raw/web/$2.png --mac --until=load --wait=5000 ${3:+"--highlight=$3"} >/dev/null 2>&1 && echo "ok $2" || echo "FAIL $2"; }
s "https://z.ai/blog/glm-5.4" blog
s "https://docs.z.ai/devpack/overview" docs "GLM-5.4"
s "https://artificialanalysis.ai/articles/glm-5-everything-you-need-to-know" aa_glm5
s "https://thenextweb.com/news/zai-glm-5-4-loop-transformer-coding-model" tnw
