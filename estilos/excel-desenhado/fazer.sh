#!/bin/zsh
# Vídeo do Excel Desenhado: roteiro de ações -> desenho quadro a quadro -> sons de clique, tecla e arrasto -> mixagem -> entrega.
# Sem narração e sem trilha. Uso: ./fazer.sh episodios/<slug> [--teste] [--formato 9:16|1:1|16:9]
#   --teste: não entrega em prontos/; --formato: outra proporção que não a do roteiro (a entrega ganha o sufixo, ex.: -9x16)
set -e
cd "${0:A:h}"
EP="${1:?passe a pasta do episódio}"
SLUG="${EP:t}"
FORMATO=""; for ((k = 2; k < $#; k++)); do [[ "${@[k]}" == "--formato" ]] && FORMATO="${@[k+1]}"; done
# o tempo.json do motor é o próprio roteiro (ações com tempo), mais formato e duração
python3 -c "import json,sys; r=json.load(open(sys.argv[1]+'/roteiro.json')); f=sys.argv[2] or r.get('formato','16:9'); json.dump({'fps':r.get('fps',30),'formato':f,'total':r['duracao'],'roteiro':r}, open(sys.argv[1]+'/tempo.json','w'), ensure_ascii=False)" "$EP" "$FORMATO"
node ../../nucleo/2d/capturar.mjs motor/pagina.html "$EP"
python3 som.py "$EP"
ffmpeg -loglevel error -y -i "$EP/$SLUG.mp4" -i "$EP/audio/efeitos.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$EP/$SLUG-final.mp4"
SUF="${FORMATO:+-${FORMATO/:/x}}"
[[ " $* " == *" --teste "* ]] && { echo "teste (não vai para prontos/): ${EP:A}/$SLUG-final.mp4"; exit 0; }
P="../../prontos/excel-desenhado/$SLUG"
mkdir -p "$P"
cp "$EP/$SLUG-final.mp4" "$P/$SLUG$SUF.mp4"
cp "$EP/audio/efeitos.wav" "$EP/roteiro.json" "$P/"
echo "pronto: ${P:A}"
