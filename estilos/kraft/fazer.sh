#!/bin/zsh
# Kraft: ./fazer.sh episodios/<slug> [--ate N] [--formato 9:16]
cd "${0:A:h}"; ESTILO=kraft TRILHA=contos TRILHA_DB=-12 exec ../../nucleo/galeria/fazer.sh "$@"
