# tile.sh NAME t1 t2 t3 t4 -> work/check/NAME.png (2x2)
n=$1; shift; i=0
for t in "$@"; do ffmpeg -v error -y -ss $t -i assets/manim_low/$n.mp4 -frames:v 1 work/check/_$i.png; i=$((i+1)); done
ffmpeg -v error -y -i work/check/_0.png -i work/check/_1.png -i work/check/_2.png -i work/check/_3.png -filter_complex "[0][1]hstack[a];[2][3]hstack[b];[a][b]vstack" work/check/$n.png
