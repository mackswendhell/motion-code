#!/bin/zsh
# Kraft: ./fazer.sh episodios/<slug> [--ate N]
# tempo (voz e palavras) -> camada do motor -> efeitos e trilha -> montagem -> entrega em prontos/kraft/.
# As peças da Higgsfield não saem daqui (custam crédito): python3 ../../nucleo/ativos.py episodios/<slug>, antes.
set -e
cd "${0:A:h}"
EP="${1:?passe a pasta do episódio}"
SLUG="${EP:t}"
mkdir -p "$EP/audio"
python3 tempo.py "$EP" "${@:2}"
node ../../nucleo/2d/capturar.mjs motor/pagina.html "$EP"
python3 som.py "$EP"
python3 compor.py "$EP"
rm -f "$EP/$SLUG.mov"  # camada intermediária do modo gravação: já está dentro do -final
[[ " $* " == *" --ate "* ]] && { echo "teste (não vai para prontos/): ${EP:A}/$SLUG-final.mp4"; exit 0; }
P="../../prontos/kraft/$SLUG"
mkdir -p "$P"
cp "$EP/$SLUG-final.mp4" "$P/$SLUG.mp4"
cp "$EP/audio/trilha.wav" "$EP/audio/efeitos.wav" "$EP/roteiro.json" "$P/"
[ -f "$EP/audio/narracao.wav" ] && cp "$EP/audio/narracao.wav" "$P/"
echo "pronto: ${P:A}"
