#!/bin/zsh
# Uso: ./fazer.sh episodios/<slug> [--teste]
# Trilha em loop exato -> render de UM loop de vídeo (metade da música) em 960x540 -> 1080p com grão
# -> repete vídeo e música até "minutos" sem renderizar de novo. --teste para no loop (não entrega).
set -e
EP=${1%/}; SLUG=${EP:t}
R=$EP/roteiro.json
j() { python3 -c "import json;print(json.load(open('$R'))['$1'])"; }
CENA=$(j cena); FAIXA=$(j faixa); MIN=$(j minutos); ESTILO=$(j estilo)

python3 ../../nucleo/lofi.py $EP/trilha.wav --faixa $FAIXA | tee $EP/trilha.log
MUS=$(grep -o 'loop de [0-9.]*' $EP/trilha.log | grep -o '[0-9.]*')
BPM=$(grep -o '[0-9]* bpm' $EP/trilha.log | grep -o '[0-9]*')
LOOP=$(python3 -c "print($MUS/2)")

rm -rf $EP/frames
blender -b -P cena.py -- --cena $CENA --loop $LOOP --bpm $BPM --saida $EP/frames --scale 50 > $EP/render.log 2>&1
N=$(ls $EP/frames | wc -l | tr -d ' ')
# loop de vídeo: 1080p (lanczos), grão de filme por quadro e vinheta leve; um GOP fechado para emendar limpo
ffmpeg -v error -y -framerate 24 -i $EP/frames/%05d.png \
  -vf "scale=1920:1080:flags=lanczos,noise=alls=5:allf=t,vignette=PI/5" \
  -c:v libx264 -preset slow -crf 22 -tune grain -pix_fmt yuv420p -g $N -keyint_min $N $EP/loop.mp4
echo "loop: $N quadros, $LOOP s; música: $MUS s"
[[ "$2" == "--teste" ]] && exit 0

P=../../prontos/$ESTILO/$SLUG; mkdir -p $P
ffmpeg -v error -y -stream_loop -1 -i $EP/loop.mp4 -stream_loop -1 -i $EP/trilha.wav -t $((MIN*60)) \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -af "afade=out:st=$((MIN*60-4)):d=4" $P/$SLUG.mp4
cp $EP/loop.mp4 $P/$SLUG-loop.mp4; cp $EP/trilha.wav $P/trilha-loop.wav; cp $R $P/
echo "entregue: $P"
