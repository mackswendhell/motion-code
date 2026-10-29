#!/bin/zsh
# 003 completo: vozes (elenco) -> trilha -> desenho quadro a quadro -> mixagem -> entrega.
# Fica no episódio porque o motor é do episódio (o fazer.sh do estilo desenha o motor do 001).
# Uso (de dentro da pasta do estilo): ./episodios/003-o-que-maria-guardava/fazer.sh
set -e
EP="${0:A:h}"
SLUG="${EP:t}"
cd "$EP/../.."
python3 "$EP/falas.py"
TOTAL=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['total'])" "$EP/tempo.json")
[ -f "$EP/audio/trilha.wav" ] || python3 ../../nucleo/trilha.py "$EP/audio/trilha.wav" --minutos $(python3 -c "print(round($TOTAL / 60 + 0.1, 2))") --estilo noite --seed 5
node ../../nucleo/2d/capturar.mjs "$EP/pagina.html" "$EP"
# a trilha respira: abaixa sob as vozes e sobe nas pausas; some nos últimos 4 s
ffmpeg -loglevel error -y -i "$EP/$SLUG.mp4" -i "$EP/audio/narracao.wav" -i "$EP/audio/trilha.wav" -filter_complex \
  "[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=$(python3 ../../nucleo/2d/db.py "$EP" voz 0)dB,asplit[v][sc];[2:a]atrim=0:$TOTAL,afade=t=in:d=2,afade=t=out:st=$(( TOTAL - 4 )):d=4,volume=$(python3 ../../nucleo/2d/db.py "$EP" trilha -9)dB[m0];[m0][sc]sidechaincompress=threshold=0.02:ratio=3:attack=250:release=1400[m];[v][m]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.84:level=false[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$EP/$SLUG-final.mp4"

P="../../prontos/prancha-viva/$SLUG"
mkdir -p "$P"
cp "$EP/$SLUG-final.mp4" "$P/$SLUG.mp4"
cp "$EP/audio/narracao.wav" "$EP/audio/trilha.wav" "$EP/roteiro.json" "$P/"
echo "pronto: ${P:A}"
