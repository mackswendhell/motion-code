# Editor 3D (nome provisório)

O Claude em 3D (caixa laranja, olhos de fenda, bracinhos, quatro perninhas) pulando por dentro de um editor de vídeo que vira objeto físico: cada painel do app é uma placa sobre uma mesa escura, e cada elemento da interface ganha vida quando ele pisa (lista, cartões, slider, clipes, forma de onda, playhead, Exportar). No lugar do Premiere da referência, o **RecMove** (o editor do Macks). Pedido do Macks em 21/10/2026; ambiente preparado, **ainda não começou** ("só prepare o ambiente para fazer depois").

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `001-pulo-no-recmove` | ambiente preparado (21/10/2026): referência analisada, print do RecMove medido | montar `roteiro.json` (pulos e eventos), motor no Blender e som; amostra curta para o Macks aprovar |

## Pedido do Macks (21/10/2026)

- Só **16:9**, **uns 20 s**, com música.
- "Veja toda profundidade de detalhe" da referência; **animar os elementos da sequência do RecMove**.
- **O áudio vibra** (a forma de onda e os medidores da timeline reagem à música).
- **Peso em cada pegada**, **leve movimento de câmera** (tremor no pouso).
- **Sonoplastia de tudo**: pulo, pouso, passo, clique, cartão, slider, corte, exportar.

## Referência (`referencia/`, fora do git)

- `original.mp4`: "holy f*ck Opus 5.5 replaced Adobe" (1922×1080, 30 fps, 20,3 s). `frames/` (610 quadros), `audio.wav`, `folha1.jpg` e `folha2.jpg` (2 quadros por segundo), `espectro.png`.
- **História:** câmera passa rente à mesa por painéis soltos do Adobe → o Claude cai no canvas branco, desenha um traço, faz uma estrela de pétalas laranja que gira → pula para o painel de camadas → pinceladas laranja e "MADE WITH CLAUDE" no monitor → anda na timeline (faixas amarela, vermelha, ciano, bege; playhead com feixe de luz azul e cubinhos brancos) → pula entre timeline e monitor → janela "Your plan renews tomorrow US$59.99/mo" que ele quebra em cacos → final "MADE WITH CLAUDE / OPUS 5.5" no monitor, ele parado embaixo.
- **Visual:** painéis como placas finas (borda escura com espessura) deitadas numa mesa marrom-escura brilhante; câmera baixa e em movimento constante, com desfoque de movimento e de profundidade forte; tela do monitor emite luz; o Claude é pequeno (~1/12 da largura de um painel), material fosco, laranja `#e07a50`.
- **Áudio:** música eletrônica alta (−10 LUFS), ~120 bpm (o volume cai a cada 0,5 s: o sidechain do bumbo), intro filtrada de 1 s, entra cheia em ~2 s. Ataques em 0,95 / 2,0 / 3,0 / 5,55 / 7,55 / 8,6 / 12,15 / 14,2 a 15,7 / 18,25 / 19,25 s.

## O print do RecMove (`referencia/recmove.png`, 2938×1748)

Medidas em pixels do print (para recortar a textura por UV e pôr as peças 3D exatamente em cima):

| Peça | Caixa (x0, y0, x1, y1) | Vida |
|---|---|---|
| Painel Projeto | 30, 136, 743, 793 | placa própria |
| Linha "Harne — YouTub…" | 46, 387, 728, 433 | acende ao pisar |
| Linha "Harne —…be 4K.mp4" (selecionada) | 46, 433, 728, 481 | acende ao pisar |
| Painel Legendas (Controle…Legendas) | 772, 136, 1690, 793 | placa própria |
| Cartão Arco / Etiqueta / Neon / Karaoke | 803 / 1021 / 1239 / 1459, 348 → +202, 448 | pula e acende ao pisar; "OLÁ MUNDO" salta em 3D |
| Slider Tamanho | trilho x 936 a 1570, y 630; botão em (1153, 630), r ~16; valor "65" em (1646, 630) | ele monta no botão e arrasta |
| Prévia (vídeo do Macks) | ~1720, 135, 2910, 794 (a medir com precisão) | tela que emite luz; legenda karaokê aparece nela |
| Timeline (área) | 29, 940, 2910, 1640 | placa própria |
| Faixa L1 (roxa) | 216, 1167, 2810, 1195 | barras que vibram com a música |
| Clipe V1 | 216, 1285, 2810, 1352 | corte "C" com faísca |
| Clipe A1 (forma de onda azul-clara) | 216, 1380, 2810, 1527 | forma de onda 3D que vibra; afunda sob os passos |
| Playhead | x 214, y 990 a 1640 | feixe de luz azul que acompanha o Claude |
| Medidores (2 canais) | x 2870 a 2903, y 990 a 1640 | sobem e descem com a música |
| Barra de ferramentas | 0, 1640, 2938, 1748 | botões afundam ao pisar |
| Botão Exportar | 2703, 1670, 2905, 1710 | o pouso final; barra de progresso |

Cores do fundo: base `(22,21,21)`, faixas `(32,31,31)`, cabeçalho `(43,43,43)`. Para as peças vivas, apagar no print a área delas (preencher com a cor do fundo vizinho) e pôr a versão 3D por cima.

## Plano do 001 (rascunho, a aprovar)

120 bpm, um pouso por tempo (0,5 s):
1. **0 a 2 s:** câmera rente à mesa; os painéis do RecMove caem no lugar um a um, cada um com um baque.
2. **2 s:** o Claude cai do alto no painel Projeto (pouso pesado, poeira, tremor); saltinhos nas linhas, que acendem (cliques).
3. **3,5 a 7 s:** pula para Legendas: Arco, Etiqueta, Neon, Karaoke (cada cartão salta e o "OLÁ MUNDO" ganha vida); monta no slider e arrasta de 65 para 90 (tiques).
4. **7 a 8 s:** pulo grande até a timeline (subida da música); pouso pesado no V1.
5. **8 a 12 s:** anda sobre a forma de onda do A1 empurrando o playhead; a forma de onda e o L1 vibram com a música e afundam sob cada passo; em 11,5 s pisa forte e corta o clipe (faísca, as metades se afastam).
6. **12 a 15,5 s:** pula até a Prévia; a legenda karaokê "FEITO NO RECMOVE" acende palavra por palavra no vídeo.
7. **15,5 a 20 s:** desce saltando pelos botões da barra (cada um afunda) até o **Exportar**: pouso final, barra de progresso, a câmera abre no plano geral e segura.

## Motor (a fazer, no padrão do Lofi e dos Contos)

- `cena.py` no Blender (Eevee, 1920×1080, 30 fps, desfoque de movimento e de profundidade): cada quadro é função pura do tempo (`apply(t)`), como no `estilos/lofi/cena.py` (aproveitar `mat`, `caixa`, `luz`, `camera`, e o bonequinho como base do Claude, trocando os olhos de ^ pelos de fenda da referência).
- Painéis: um plano por painel com a textura do print recortada por UV (sem cortar arquivos) + caixa escura embaixo para a espessura; mesa marrom brilhante; tela da Prévia com emissão.
- Pulos: arco parabólico entre pousos, com compressão antes, estiramento no ar e assentamento no pouso; o painel afunda de leve e volta como mola.
- Câmera: segue o Claude com antecipação, tremor que decai em cada pouso, foco nele.
- `roteiro.json` com os pousos e eventos; um `linha.py` gera `tempo.json`, que alimenta o Blender (posições) e o `som.py` (música 120 bpm e efeitos), e a música gera o envelope que faz a forma de onda e os medidores vibrarem.
- `fazer.sh`: linha → som → render → mixagem → `prontos/editor-3d/<slug>/`.
