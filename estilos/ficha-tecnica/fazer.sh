#!/bin/zsh
# Ficha Técnica: ./fazer.sh episodios/<slug> [--ate N]
cd "${0:A:h}"; ESTILO=ficha-tecnica TRILHA=noite TRILHA_DB=-7 exec ../../nucleo/galeria/fazer.sh "$@"
