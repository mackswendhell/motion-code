#!/bin/zsh
# Atlas: ./fazer.sh episodios/<slug> [--ate N] [--formato 1:1|16:9|9:16]
cd "${0:A:h}"; ESTILO=atlas TRILHA=vila TRILHA_DB=-9 exec ../../nucleo/galeria/fazer.sh "$@"
