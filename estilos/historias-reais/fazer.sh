#!/bin/zsh
# Episódio completo das Histórias Reais: corte das vozes originais + narração final -> desenho quadro a quadro -> trilha -> mixagem -> entrega.
# Uso: ./fazer.sh episodios/<slug> [--teste]
#   --teste: não entrega em prontos/
set -e
cd "${0:A:h}"
EP="${1:?passe a pasta do episódio}"
SLUG="${EP:t}"
python3 montar.py "$EP"
node ../../nucleo/2d/capturar.mjs motor/pagina.html "$EP"
python3 som.py "$EP"
ffmpeg -loglevel error -y -i "$EP/$SLUG.mp4" -i "$EP/audio/narracao.wav" -i "$EP/audio/trilha.wav" -filter_complex \
  "[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=$(python3 ../../nucleo/2d/db.py "$EP" voz 0)dB[v];[2:a]volume=$(python3 ../../nucleo/2d/db.py "$EP" trilha 0)dB[m];[v][m]amix=inputs=2:normalize=0:duration=first,volume=1.5dB,alimiter=limit=0.89[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$EP/$SLUG-final.mp4"

[[ " $* " == *" --teste "* ]] && { echo "teste (não vai para prontos/): ${EP:A}/$SLUG-final.mp4"; exit 0; }
P="../../prontos/historias-reais/$SLUG"
mkdir -p "$P"
cp "$EP/$SLUG-final.mp4" "$P/$SLUG.mp4"
cp "$EP/audio/narracao.wav" "$EP/audio/trilha.wav" "$EP/roteiro.json" "$P/"
echo "pronto: ${P:A}"
