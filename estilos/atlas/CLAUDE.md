# Atlas

Atlas científico ilustrado: um processo contado como descida por faixas de papel rasgado, cada fase com uma cor, um fluxograma de etiquetas de papel e um fio trançado amarelo que percorre o caminho certo (o errado é vermelho). Fecha num painel escuro com o resumo.

## Referência analisada

`~/Downloads/Novos estilos/atlas biologia.mp4` (1080×1080, 44,5 s, ciclo celular verificado pelo TLC), só para estudo. O que fica: abertura em papel claro com texto em fonte mono e legenda dos fios; tecido de células em mosaico; faixas horizontais com borda rasgada e cor por fase (sálvia, areia, ameixa, azul-noite, rosa, cobre); etiquetas de papel com borda dupla e fonte mono ("Growing (G1)"); fio trançado amarelo tracejado; caminho de erro em vermelho com rótulo entre colchetes; notas pequenas manuscritas em mono; ilustrações em contorno fino e aquarela (células, DNA, cromossomos, fuso); fecho em painel azul-noite com tópicos e gráfico circular do ciclo.

## Decisões

- Formatos: 1:1 (padrão, como a referência), 16:9 e 9:16 (o layout usa frações de W e H).
- Voz: `narradora`, calma, de documentário. Trilha `vila` (-9 dB).
- Fusão de 0,45 s entre faixas; dentro de cada ato a câmera desce 60 px.
- Ilustrações em código por padrão; com a Higgsfield, cada ilustração da faixa pode ser pintada em aquarela com contorno fino, peça por peça (custo dito antes).

## Cenas e `tela`

| Cena | `tela` |
|---|---|
| `abertura` | `linhas` (texto mono), `legenda` ([["fio" ou "erro", texto], ...]) |
| `faixa` | `cor` (salvia, areia, ameixa, noite, rosa, cobre, creme ou hex), `titulo` (etiqueta, `\n` quebra), `certo` (etiquetas no fio), `errado` (etiquetas vermelhas), `notas`, `desenho` (celulas, dna, divisao), `fase` (palavra grande), `grade` (true) |
| `resumo` | `titulo`, `itens`, `destaque` (índice do item em vermelho) |

## Comandos

`./fazer.sh episodios/<slug> [--ate N] [--formato 16:9]` (entrega em `prontos/atlas/`).

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `000-amostra` | amostra de 23 s renderizada com voz (05/11/2026) | Macks ver e aprovar o estilo |
