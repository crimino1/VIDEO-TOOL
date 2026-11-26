#!/bin/bash
# Media for the Gemini Helium / AGI video (links verified by the research brief, 2026-11-26).
cd "$(dirname "$0")/.."
YT=/c/Users/daggu222105/VIDEO-TOOL/.venv/Scripts/yt-dlp.exe
FFD=/c/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links
CAP="node ../tools/capture.mjs"
vid() { timeout 600 $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o "assets/raw/x/$2.%(ext)s" "$1" && echo "ok $2" || echo "FAIL $2"; }
sec() { [ -f assets/raw/yt/$3.mp4 ] && return; timeout 420 $YT -4 -q --no-warnings --js-runtimes node --ffmpeg-location $FFD -f "bv*[height<=720][ext=mp4]" --download-sections "*$2" -o "assets/raw/yt/$3.%(ext)s" "https://www.youtube.com/watch?v=$1" && echo "ok $3" || echo "FAIL $3"; }
yfull() { [ -f assets/raw/yt/$2.mp4 ] && return; timeout 600 $YT -4 -q --no-warnings --js-runtimes node -f "bv*[height<=1080][ext=mp4]/bv*[height<=1080]" -o "assets/raw/yt/$2.%(ext)s" "https://www.youtube.com/watch?v=$1" && echo "ok $2" || echo "FAIL $2"; }
vid https://x.com/osanseviero/status/2123323209135308996 x_helium_tease
vid https://x.com/GoogleAI/status/2123168242797809944 x_neon_film
vid https://x.com/GoogleDeepMind/status/2124959312606818597 x_neon_turing
vid https://x.com/GoogleAI/status/2120940683233984862 x_hydrogen_film
vid https://x.com/GoogleDeepMind/status/2122767521925230896 x_hydrogen_robot
vid https://x.com/GoogleDeepMind/status/2120219371473617099 x_carbon_film
vid https://x.com/arena/status/2123192239761596566 x_arena_gap
vid https://x.com/ai_for_success/status/2123467103110078747 x_neon_world
vid https://x.com/Google/status/2123517320798801949 x_neon_earth
vid https://x.com/thtbee_/status/2120958666480513310 x_hydrogen_moth
yfull Cxf3AVX8_7I yt_carbon_atlantis
yfull xhG-jNObuz4 yt_neon_ski
yfull RxS0b_izj_4 yt_hydrogen_island
yfull FsxthdQ_sL4 yt_tpu_dc
yfull 3Qw_CZkiQQg yt_tpu8
sec wYSncx9zLIU 1:45:05-1:45:40 yt_demis_io
sec DsewHeVbL-0 26:40-27:30 yt_demis_stanford
sec x7Z_1miRWB8 9:30-10:15 yt_demis_mos
sec FORdPIWOH5k 16:00-16:40 yt_koray_pod
sec RgV57kDzcng 25:40-26:50 yt_pichai_hf
sec ANV3tE5ywv0 45:15-45:55 yt_pichai_decoder
sec fJBSNEFdm8c 0:40-1:20 yt_pichai_sources
sec Jh6mgf9M06M 29:38-30:06 yt_logan
sec l3u_FAv33G0 49:25-50:10 yt_legg
tw() { $CAP tweet $1 assets/raw/web/tw_$2.png --light >/dev/null 2>&1 && echo "ok tw_$2" || echo "FAIL tw_$2"; }
tw 2123323209135308996 sanseviero
tw 2123341568954486799 testingcatalog
tw 2124742605015535659 lyraxana
tw 2124778872520470822 agtp
tw 2124750198207611122 pankaj
tw 2125341185560719497 heriver
tw 2122443490340786338 lberondroth
tw 2124779028938916286 bedros
tw 2095599835932135919 chollet
tw 2122427521211785388 tc_neon
s() { $CAP shot "$1" assets/raw/web/$2.png --until=load --wait=6000 --full >/dev/null 2>&1 && echo "ok $2" || echo "FAIL $2"; }
s https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/ blog_neon
s https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/ blog_carbon
s https://ai.google.dev/gemini-api/docs/models gemini_docs
s https://artificialanalysis.ai/leaderboards/models aa_board
s https://aistudio.google.com/docs/pricing aistudio_price
s https://blog.google/company-news/inside-google/message-ceo/alphabet-earnings-q3-2026/ earnings
s https://arcprize.org/results/google-gemini-4-carbon arc_carbon
