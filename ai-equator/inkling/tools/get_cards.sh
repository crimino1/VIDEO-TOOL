#!/bin/bash
cd "$(dirname "$0")/.."
CAP="node ../tools/capture.mjs"
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2123871643797995872 tm_launch
tw 2123871645039464643 tm_loop
tw 2123871647371501591 tm_mac
tw 2124066983276654994 lasse
tw 2124165894188511501 jackson
tw 2124072810431537504 dogukan
tw 2123872482663039189 dummer
tw 2123903224344166906 adrgrondin
tw 2123877871316087012 aa_chart
tw 2123953913342935486 exo
tw 2124809679117389930 po3rin
s() { $CAP shot "$1" assets/raw/web/$2.png --until=load --wait=5000 ${3:+--full} >/dev/null 2>&1 && echo "ok $2" || echo "FAIL $2"; }
r() { $CAP scroll "$1" assets/raw/rec/$2.mp4 --seconds=${3:-10} --px=${4:-2200} --wait=5000 >/dev/null 2>&1 && echo "ok rec $2" || echo "FAIL rec $2"; }
s https://huggingface.co/thinkingmachines/Inkling-2-Mini hf full
r https://huggingface.co/thinkingmachines/Inkling-2-Mini hf_scroll 12 3000
s https://ollama.com/library/inkling-2-mini ollama full
r https://ollama.com/library/inkling-2-mini ollama_scroll 8 1600
s https://artificialanalysis.ai/models/inkling-2-mini aa_model full
r https://artificialanalysis.ai/models/inkling-2-mini aa_model_scroll 14 5000
s https://artificialanalysis.ai/models/comparisons/inkling-2-mini-vs-qwen3-8-27b aa_vs_qwen full
s https://artificialanalysis.ai/models/open-source/small aa_small full
r https://artificialanalysis.ai/models/open-source/small aa_small_scroll 12 3500
s https://unsloth.ai/docs/models/inkling-2-mini unsloth full
s https://huggingface.co/datasets/pratikgx/inkling-2-mini-m5-pro-mac-mini-bench macmini_bench full
s https://www.vals.ai/models/thinkingmachines_inkling-2-mini vals full
