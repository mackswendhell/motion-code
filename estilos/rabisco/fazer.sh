#!/bin/zsh
# Episódio completo do Rabisco: narração -> desenho quadro a quadro -> trilha e efeitos presos ao desenho -> mixagem -> entrega.
# Uso: ./fazer.sh episodios/<slug> [--ate N] [--formato 9:16|1:1|16:9]
#   --ate: só os N primeiros atos, para testar (não entrega)
#   --formato: outra proporção que não a do roteiro; a entrega ganha o sufixo (ex.: -9x16)
set -e
cd "${0:A:h}"
EP="${1:?passe a pasta do episódio}"
SLUG="${EP:t}"
RAIZ="../.."
python3 ../../nucleo/2d/narrar.py "$EP" "${@:2}"
FORMATO=""; for ((k = 2; k < $#; k++)); do [[ "${@[k]}" == "--formato" ]] && FORMATO="${@[k+1]}"; done
[ -n "$FORMATO" ] && python3 -c "import json,sys; p=sys.argv[1]; t=json.load(open(p)); t['formato']=sys.argv[2]; json.dump(t, open(p, 'w'), ensure_ascii=False, indent=1)" "$EP/tempo.json" "$FORMATO"
SUF="${FORMATO:+-${FORMATO/:/x}}"
node ../../nucleo/2d/capturar.mjs motor/pagina.html "$EP"
python3 som.py "$EP"
# os volumes já saem calibrados pela voz no som.py
ffmpeg -loglevel error -y -i "$EP/$SLUG.mp4" -i "$EP/audio/narracao.wav" -i "$EP/audio/trilha.wav" -i "$EP/audio/efeitos.wav" -filter_complex \
  "[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=$(python3 ../../nucleo/2d/db.py "$EP" voz 0)dB[v];[2:a]volume=$(python3 ../../nucleo/2d/db.py "$EP" trilha 0)dB[m];[3:a]volume=$(python3 ../../nucleo/2d/db.py "$EP" efeitos 0)dB[x];[v][m][x]amix=inputs=3:normalize=0:duration=first[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$EP/$SLUG-final.mp4"

[[ " $* " == *" --ate "* ]] && { echo "teste (não vai para prontos/): ${EP:A}/$SLUG-final.mp4"; exit 0; }
P="$RAIZ/prontos/rabisco/$SLUG"
mkdir -p "$P"
cp "$EP/$SLUG-final.mp4" "$P/$SLUG$SUF.mp4"
cp "$EP/audio/narracao.wav" "$EP/audio/trilha.wav" "$EP/audio/efeitos.wav" "$EP/roteiro.json" "$P/"
echo "pronto: ${P:A}"
