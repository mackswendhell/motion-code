#!/bin/zsh
# Episódio completo da Fantasia: narração -> desenho quadro a quadro (+ eventos) -> trilha -> mixagem -> entrega.
# Uso: ./fazer.sh episodios/<slug> [--ate N] [--formato 9:16|1:1|16:9]
#   --ate: só os N primeiros atos, para testar (não entrega)
#   --formato: outra proporção que não a do roteiro; o arquivo ganha o sufixo (ex.: -9x16)
set -e
cd "${0:A:h}"
EP="${1:?passe a pasta do episódio}"
SLUG="${EP:t}"
ATE=(); FORMATO=""
for ((k = 2; k <= $#; k++)); do
  [[ "${@[k]}" == "--ate" ]] && ATE=(--ate "${@[k+1]}")
  [[ "${@[k]}" == "--formato" ]] && FORMATO="${@[k+1]}"
done
python3 ../../nucleo/2d/narrar.py "$EP" "${ATE[@]}"
[ -n "$FORMATO" ] && python3 -c "import json,sys; p=sys.argv[1]; t=json.load(open(p)); t['formato']=sys.argv[2]; json.dump(t, open(p, 'w'), ensure_ascii=False, indent=1)" "$EP/tempo.json" "$FORMATO"
SUF="${FORMATO:+-${FORMATO/:/x}}"
node ../../nucleo/2d/capturar.mjs motor/pagina.html "$EP"
python3 som.py "$EP"
ffmpeg -loglevel error -y -i "$EP/$SLUG.mp4" -i "$EP/audio/narracao.wav" -i "$EP/audio/trilha.wav" -filter_complex \
  "[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=$(python3 ../../nucleo/2d/db.py "$EP" voz 0)dB[v];[2:a]volume=$(python3 ../../nucleo/2d/db.py "$EP" trilha 0)dB[m];[v][m]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.84:level=false[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$EP/$SLUG$SUF-final.mp4"

[[ " $* " == *" --ate "* ]] && { echo "teste (não vai para prontos/): ${EP:A}/$SLUG$SUF-final.mp4"; exit 0; }
P="../../prontos/fantasia/$SLUG"
mkdir -p "$P"
cp "$EP/$SLUG$SUF-final.mp4" "$P/$SLUG$SUF.mp4"
cp "$EP/audio/narracao.wav" "$EP/audio/trilha.wav" "$EP/roteiro.json" "$P/"
echo "pronto: ${P:A}"
