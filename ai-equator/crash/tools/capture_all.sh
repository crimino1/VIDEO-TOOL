#!/bin/sh
# Mac-window screenshots at double density, tweets from the official embed. Output in assets/raw/web.
cd "$(dirname "$0")/.." || exit 1
mkdir -p assets/raw/web
C="node ../tools/capture.mjs"
O=assets/raw/web
shot() { $C shot "$2" "$O/$1.png" --wait=3000 --mac ${3:+--highlight="$3"} 2>&1 | tail -1 | cut -c1-90; }
tw() { $C tweet "$2" "$O/tw_$1.png" 2>&1 | tail -1 | cut -c1-90; }
tw sama_ram 2117795243068133756 &
tw elon 2116985908268572975 &
tw morqon 2115838856524120128 &
tw pcmr 2117904303461380185 &
tw space 2117860668523327562 &
tw hedgie 2116233519240245511 &
wait
shot cnn "https://www.cnn.com/2026/11/05/investing/tech-heavy-nasdaq-plunges" "wiped out roughly \$2.5 trillion" &
shot cnn_nv "https://www.cnn.com/2026/11/05/investing/tech-heavy-nasdaq-plunges" "Nvidia shares (NVDA) sank 9.3%" &
shot cnn_core "https://www.cnn.com/2026/11/05/investing/tech-heavy-nasdaq-plunges" "CoreWeave shares are down 76%" &
shot cnn_vix "https://www.cnn.com/2026/11/05/investing/tech-heavy-nasdaq-plunges" "surged roughly 70%" &
wait
shot cnn2_kospi "https://www.cnn.com/2026/11/05/markets/asian-markets-us-rout-ai-investment-intl-hnk" "both closed down 6%" &
shot cnn2_week "https://www.cnn.com/2026/11/05/markets/asian-markets-us-rout-ai-investment-intl-hnk" "its worst week since April 2025" &
shot cnbc_mag "https://www.cnbc.com/2026/11/05/stock-market-selloff-ai-fears.html" &
shot cnbc_qc "https://www.cnbc.com/2026/11/05/qualcomm-earnings-chip-stocks-election.html" &
wait
shot heise "https://www.heise.de/en/news/Sam-Altman-backtracks-on-RAM-comments-11513200.html" "SK Hynix predicts it could stretch through 2030" &
shot ah_ram "https://www.androidheadlines.com/2026/11/sam-altman-rebrands-ram-altman-ram-quote.html" &
shot wc_mem "https://www.windowscentral.com/hardware/memory-shortage-2026-tech-ai-datacenters" &
shot evertiq "https://evertiq.com/news/2026-02-02-drampocalypse-memory-price-projections-skyrocket-for-1q26" &
wait
shot aiera "https://aiera.blog/did-ai-bubble-just-pop-november-2026/" "Yardeni" &
shot ram_trend "https://pcpartpicker.com/trends/price/memory/" &
shot gf_nvda "https://www.google.com/finance/quote/NVDA:NASDAQ?window=1M" &
shot gf_qqq "https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ?window=1M" &
wait
shot gf_crwv "https://www.google.com/finance/quote/CRWV:NASDAQ?window=6M" &
shot gf_qcom "https://www.google.com/finance/quote/QCOM:NASDAQ?window=1M" &
shot gf_kospi "https://www.google.com/finance/quote/KOSPI:KRX?window=1M" &
shot gf_vix "https://www.google.com/finance/quote/VIX:INDEXCBOE?window=1M" &
wait
shot gf_sox "https://www.google.com/finance/quote/SOX:INDEXNASDAQ?window=1M" &
shot gf_tsla "https://www.google.com/finance/quote/TSLA:NASDAQ?window=1M" &
shot gf_spx "https://www.google.com/finance/quote/.INX:INDEXSP?window=1M" &
shot cheeky "https://cheekypint.substack.com/" &
wait
echo captured
