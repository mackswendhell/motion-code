#!/bin/zsh
# Episódio completo da Prancha Viva: narração -> trilha -> desenho quadro a quadro -> mixagem -> entrega.
# Uso: ./fazer.sh episodios/<slug>
set -e
cd "${0:A:h}"
EP="${1:?passe a pasta do episódio}"
SLUG="${EP:t}"
RAIZ="../.."
python3 ../../nucleo/2d/narrar.py "$EP"
TOTAL=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['total'])" "$EP/tempo.json")
[ -f "$EP/audio/trilha.wav" ] || python3 "$RAIZ/nucleo/trilha.py" "$EP/audio/trilha.wav" --minutos 1.2 --estilo contos --seed 3
node ../../nucleo/2d/capturar.mjs motor/pagina.html "$EP"
# trilha ~17 dB abaixo da narração, sumindo nos últimos 2 s
ffmpeg -loglevel error -y -i "$EP/$SLUG.mp4" -i "$EP/audio/trilha.wav" -filter_complex \
  "[1:a]volume=$(python3 ../../nucleo/2d/db.py "$EP" trilha -10)dB,atrim=0:$TOTAL,afade=t=out:st=$(( TOTAL - 2 )):d=2,aresample=24000[m];[0:a]volume=$(python3 ../../nucleo/2d/db.py "$EP" voz 0)dB[v];[v][m]amix=inputs=2:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$EP/$SLUG-final.mp4"

P="$RAIZ/prontos/prancha-viva/$SLUG"
mkdir -p "$P"
cp "$EP/$SLUG-final.mp4" "$P/$SLUG.mp4"
cp "$EP/audio/narracao.wav" "$P/narracao.wav"
cp "$EP/audio/trilha.wav" "$P/trilha.wav"
cp "$EP/roteiro.json" "$P/roteiro.json"
echo "pronto: ${P:A}"
