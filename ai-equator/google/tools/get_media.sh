#!/bin/bash
# Downloads every verified source for the Google comeback video into assets/raw.
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
CAP="node ../tools/capture.mjs"
pbs() { curl -4 -sL --max-time 60 -o "assets/raw/web/$2" "https://pbs.twimg.com/media/$1?name=orig" && echo "ok $2"; }
pbs HTfV2KTa0AAVcsh.png p_argon_pichai.png
pbs HTfV52SWgAIlX3W.png p_argon_gdm.png
pbs HVu5GHmbUAAppsK.jpg p_carbon_pichai.jpg
pbs HVu4Jx_bQAA3BbT.jpg p_carbon_logan.jpg
pbs HWx77X5bMAAjBvx.jpg p_carbon_signal.jpg
pbs HW8XRYOXsAASGNl.png p_hyd_gdm.png
pbs HW8YApaaEAAOX6g.jpg p_hyd_logan.jpg
pbs HXb9c3sbEAA9-y7.png p_neon_logan.png
pbs HXb9cQabgAAOkkn.png p_neon_pichai.png
pbs HXb_xtqWIAAVtPL.png p_neon_gdm.png
pbs HXb-RIsbgAAkCbo.png p_neon_koray.png
pbs HXcD2U1W0AAPiPD.jpg p_neon_google.jpg
pbs HXcFngzWQAAh2Pr.jpg p_neon_news.jpg
pbs HXb9V1dbAAAwVVA.jpg p_neon_aa.jpg
pbs HXb6_U6bIAAclgo.jpg p_neon_vals.jpg
pbs HXcCe8KagAAiAC3.png p_neon_arena.png
gs() { curl -4 -sL --max-time 60 -o "assets/raw/web/$2" "https://storage.googleapis.com/gweb-uniblog-publish-prod/$1" && echo "ok $2"; }
gs original_images/gemini-4-argon_table_blog.gif c_argon_table.gif
gs original_images/gemini_4_cyber_evals_deepswe.gif c_argon_deepswe.gif
gs images/gemini_4_carbon__evals-table.width-1200.format-webp.webp c_carbon_table.webp
gs original_images/gemini-4-hydrogen_benchmarks_table.gif c_hyd_table.gif
gs original_images/gemini-4-hydrogen_t-bench_graph.gif c_hyd_tbench.gif
gs images/gemini_4_neon_table.width-1200.format-webp.webp c_neon_table.webp
gs images/gemini-4-neon__comparison-graphi.width-1200.format-webp.webp c_neon_family.webp
curl -4 -sL --max-time 90 -o assets/raw/web/neon_card.pdf https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-4-Neon-Model-Card.pdf && echo ok neon_card.pdf
vid() { $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o "assets/raw/x/$2.%(ext)s" "$1" && echo "ok $2"; }
vid https://x.com/sundarpichai/status/2110038898009407584 x_argon_pichai
vid https://x.com/GoogleDeepMind/status/2110039274922131792 x_argon_promo
vid https://x.com/sundarpichai/status/2110059844187406428 x_argon_mars
vid https://x.com/GoogleDeepMind/status/2120219371473617099 x_carbon_promo
vid https://www.youtube.com/watch?v=9PICEmtfpWU yt_cornhole
vid https://www.youtube.com/watch?v=ftkic7Tdpcg yt_cyber
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2105387952478277979 argon_pichai
tw 2105387954474746264 argon_gov
tw 2105388084154056939 argon_gdm
tw 2115489219804352921 carbon_pichai
tw 2115489284404940898 carbon_logan
tw 2120940236805169182 hyd_pichai
tw 2120940338869055788 hyd_gdm
tw 2120940951292268640 hyd_logan
tw 2123167791922741362 neon_logan
tw 2123167780988125621 neon_pichai
tw 2123167638050541626 neon_koray
tw 2123170645777526962 neon_aa
tw 2123168167879147542 neon_vals
tw 2123169189397709174 neon_arena
