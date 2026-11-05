# Laboratório

Ciência e dados em tom sóbrio: fundo quase preto, objetos feitos de pontos (células, fitas, nuvens), títulos em serifa, uma legenda curta por vez. Credibilidade antes de tudo.

## Referência analisada

`~/Downloads/Novos estilos/terapia cancer.mp4` (1080×1080, 112 s, terapia CAR-T redesenhada com IA), só para estudo. O que fica: fundo #0e0e12 com manchas muito escuras de ameixa e petróleo; esferas de pontos que giram, com receptores em verde-água; fita da "instrução" em pontos âmbar e magenta que se enrola em espiral e perde um pedaço; comparação "padrão / novo" em colunas; ciclo desenho/medida com contador; abertura com sobretítulo pequeno, título em serifa + segunda linha em sans pesada e subtítulo; legenda centralizada embaixo, uma frase por vez, terminando em travessão quando continua.

## Decisões

- Formatos: 1:1 (padrão), 16:9 e 9:16 (tudo escala por `esc(W, H)`).
- Voz: `narrador`, calmo, frases curtas. Trilha `noite` (-9 dB). Fusão de 0,5 s entre atos.
- Sem travessão na fala (regra do estúdio); a legenda sai da fala.

## Cenas e `tela`

| Cena | `tela` |
|---|---|
| `titulo` | `sobre`, `titulo` (serifa), `titulo2` (sans), `sub` |
| `esfera` | `receptores` (n), `rotulo`, `subrotulo`, `alvo` (true = esfera vermelha, de tumor) |
| `fita` | `rotulo`, `corte` (fração que some, 0 a 1) |
| `comparacao` | `esq` e `dir`: `{rotulo, n}` |
| `ciclo` | `cima`, `baixo`, `subbaixo` |

## Comandos

`./fazer.sh episodios/<slug> [--ate N] [--formato 16:9]` (entrega em `prontos/laboratorio/`).

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `000-amostra` | amostra de 15 s renderizada com voz (05/11/2026) | Macks ver e aprovar o estilo |
