#!/bin/zsh
# Episódio de um estilo da galeria: narração -> trilha -> desenho quadro a quadro -> mixagem -> entrega.
# Chamado pelo fazer.sh de cada estilo (estilos/<estilo>/fazer.sh), que define ESTILO, TRILHA (contos|noite|vila|nenhuma) e TRILHA_DB.
# Uso: ./fazer.sh episodios/<slug> [--ate N] [--formato 9:16|1:1|16:9]
set -e
EP="${1:?passe a pasta do episódio}"
SLUG="${EP:t}"
NUCLEO="../../nucleo"
python3 $NUCLEO/2d/narrar.py "$EP" "${@:2}"
FORMATO=""; for ((k = 2; k < $#; k++)); do [[ "${@[k]}" == "--formato" ]] && FORMATO="${@[k+1]}"; done
[ -n "$FORMATO" ] && python3 -c "import json,sys; p=sys.argv[1]; t=json.load(open(p)); t['formato']=sys.argv[2]; json.dump(t, open(p, 'w'), ensure_ascii=False, indent=1)" "$EP/tempo.json" "$FORMATO"
SUF="${FORMATO:+-${FORMATO/:/x}}"
TOTAL=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['total'])" "$EP/tempo.json")
node $NUCLEO/2d/capturar.mjs motor/pagina.html "$EP"
if [[ "$TRILHA" == "nenhuma" ]]; then
  cp "$EP/$SLUG.mp4" "$EP/$SLUG-final.mp4"
else
  MIN=$(python3 -c "print(round($TOTAL / 60 + 0.1, 2))")
  [ -f "$EP/audio/trilha.wav" ] || python3 $NUCLEO/trilha.py "$EP/audio/trilha.wav" --minutos $MIN --estilo $TRILHA --seed 4
  ffmpeg -loglevel error -y -i "$EP/$SLUG.mp4" -i "$EP/audio/trilha.wav" -filter_complex \
    "[1:a]volume=$(python3 $NUCLEO/2d/db.py "$EP" trilha ${TRILHA_DB:--8})dB,atrim=0:$TOTAL,afade=t=out:st=$(python3 -c "print(max(0, $TOTAL - 2))"):d=2,aresample=24000[m];[0:a]volume=$(python3 $NUCLEO/2d/db.py "$EP" voz 0)dB[v];[v][m]amix=inputs=2:normalize=0[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$EP/$SLUG-final.mp4"
fi
[[ " $* " == *" --ate "* ]] && { echo "teste (não vai para prontos/): ${EP:A}/$SLUG-final.mp4"; exit 0; }
P="../../prontos/$ESTILO/$SLUG"
mkdir -p "$P"
cp "$EP/$SLUG-final.mp4" "$P/$SLUG$SUF.mp4"
cp "$EP/audio/narracao.wav" "$P/narracao.wav"
[ -f "$EP/audio/trilha.wav" ] && cp "$EP/audio/trilha.wav" "$P/trilha.wav"
cp "$EP/roteiro.json" "$P/roteiro.json"
echo "pronto: ${P:A}"
