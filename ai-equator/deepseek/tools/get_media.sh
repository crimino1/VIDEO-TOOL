#!/bin/bash
# Downloads every verified source for the DeepSeek V5 video into assets/raw.
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
CAP="node ../tools/capture.mjs"
C=074889ed60ac1f1ca73dd7700f078cb33485577e
mkdir -p assets/raw/code
g() { curl -4 -sL --max-time 60 -o "assets/raw/code/$2" "$1" && echo "ok $2 $(wc -l < assets/raw/code/$2) lines"; }
g https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/$C/packages/llm/llm-deepseek-account/tests/provider.spec.ts provider.spec.ts
g https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/$C/packages/llm/llm-deepseek/tests/listed-catalog.spec.ts listed-catalog.spec.ts
g https://raw.githubusercontent.com/deepseek-ai/FlashMLA/main/README.md flashmla_README.md
pbs() { curl -4 -sL --max-time 60 -o "assets/raw/web/$2" "https://pbs.twimg.com/media/$1?name=orig" && echo "ok $2"; }
pbs HGo9ronbUAAKlRk.jpg p_v4.jpg
pbs HR1UyHiaAAAtpqw.jpg p_v41flash.jpg
pbs HVv7w8xaQAAzVe7.jpg p_viral.jpg
pbs HVsqoRqboAAGKxj.jpg p_nftchen.jpg
pbs HTHW26jaMAAobDV.jpg p_glitch.jpg
for id in HU0b9EFawAA1w0R HU0b9qGaUAE7J3j HU0b-TxboAA9W_E HU0b-84bAAAloEF; do curl -4 -sL --max-time 60 -o "assets/raw/x/gif_$id.mp4" "https://video.twimg.com/tweet_video/$id.mp4" && echo "ok gif_$id"; done
vid() { $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 $3 -o "assets/raw/x/$2.%(ext)s" "$1" && echo "ok $2"; }
vid https://www.youtube.com/watch?v=6Gn0u7GozJw yt_bbg_huawei
vid https://www.youtube.com/watch?v=yBunUrT81Zc yt_ascend950 "--download-sections *0-420"
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2047516922263285776 v4
tw 2097930608790167907 v41flash
tw 2111375646223933650 v41_1017
tw 2115561842588471541 viral
tw 2115331333258166313 nftchen
tw 2103699253273247809 glitch
tw 2102057805582676366 theinfo
s() { $CAP shot "$1" assets/raw/web/$2.png --mac --until=load --wait=3500 ${3:+"--highlight=$3"} >/dev/null 2>&1 && echo "ok $2" || echo "FAIL $2"; }
s "https://github.com/deepseek-ai/deepseek-harness" gh_repo
s "https://github.com/deepseek-ai/deepseek-harness/blob/$C/packages/llm/llm-deepseek-account/tests/provider.spec.ts#L154-L196" gh_spec
s "https://github.com/deepseek-ai/FlashMLA" gh_flashmla "410"
s "https://api-docs.deepseek.com/news/news260910" ds_news0910 "V4.1-Pro"
s "https://api-docs.deepseek.com/quick_start/pricing" ds_pricing
s "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash" hf_v41flash
s "https://news.mydrivers.com/1/1161/1161225.htm" n_kuaikeji
s "https://technode.com/2026/10/29/deepseek-v5-identifiers-surface-in-official-harness-code-repository/" n_technode1
s "https://technode.com/2026/11/04/deepseek-reportedly-plans-to-train-v5-model-on-huawei-ascend-chips/" n_technode2
s "https://tech.ifeng.com/c/8xj7jf0n9fW" n_caiwen "昇腾950"
s "https://www.thestandard.com.hk/innovation/article/343489/" n_standard
s "https://eu.36kr.com/en/p/3995936178229120" n_36kr8t "8 trillion"
s "https://eu.36kr.com/en/p/3965947797954056" n_36kr_bofa "second half of 2026"
s "https://www.statista.com/chart/26779/biggest-single-day-market-cap-losses" n_statista
s "https://www.bloomberg.com/news/articles/2026-09-04/deepseek-plans-big-huawei-ai-chip-order-to-power-new-data-center" n_bbg_chips
s "https://www.cnbc.com/2026/11/18/nvidia-interim-ceo-colette-kress-talks-earnings-china-transcript.html" n_cnbc
s "https://www.bostonglobe.com/2026/11/16/nation/trump-administration-moves-close-ai-chip-loophole-before-china-trip/" n_globe
s "https://www.sec.gov/Archives/edgar/data/0001045810/000104581026000082/nvda-20261111.htm" n_sec
s "https://www.tomshardware.com/tech-industry/artificial-intelligence/huawei-led-team-claims-it-post-trained-deepseeks-1-6-trillion-parameter-models-on-ascend-910c-chips" n_toms
