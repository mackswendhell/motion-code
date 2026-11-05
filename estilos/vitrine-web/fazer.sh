#!/bin/zsh
# Vitrine Web: ./fazer.sh episodios/<slug> [--ate N]
cd "${0:A:h}"; ESTILO=vitrine-web TRILHA=noite TRILHA_DB=-6 exec ../../nucleo/galeria/fazer.sh "$@"
