# Excel Desenhado

Motion graphics que não parece motion graphics: uma planilha inteira desenhada à mão (papel com aguada, grade azul-clara levemente torta, letra de mão, cores de lápis, gráficos em aquarela, rabiscos de pincel) usada como palco. Um cursor comum clica, digita fórmula, arrasta, cria e redimensiona gráficos e rabisca, e a câmera acompanha como quem grava a tela com calma. Serve para qualquer situação: explicar um conceito, mostrar um número, montar um gráfico, inserto em vídeo gravado. Desenho 2D em código (Canvas JS) sobre o `nucleo/2d/`.

Criado em 21/10/2026 a partir da referência abaixo e aprovado pelo Macks no mesmo dia. Nome do Macks: excel-desenhado.

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `000-amostra` | **aprovada** (21/10/2026): 10 s, 16:9: soma na célula, preencher a coluna, gráfico de barras, redimensionar, círculo e seta | nenhum (é a amostra do estilo) |

## Referência

Vídeo "I built Excel except it looks like handwriting and watercolor" (`referencia/original.mp4`). 16:9 (1920×1080), 60 fps, 48 s. Guardados: `referencia/frames/` (1152 quadros a 24 fps), `referencia/audio.wav`, `referencia/folha.png` (1 quadro por segundo), `referencia/espectro.png`.

- **Visual:** papel creme `#EFEDE4` com aguada muito sutil; grade azul-clara fina e levemente torta; título, barra de ferramentas (lápis de cor no lugar dos ícones de cor) e barra de fórmula fazem parte da folha. Letra de mão em tudo (Patrick Hand é a mais próxima). Cabeçalhos com fundo de aguada bege (a coluna do resultado em verde-claro). Cada categoria numa cor (azul, ocre, verde, vermelho); números em azul; resultados em verde.
- **Ações:** clicar numa célula (retângulo azul torto com a alça no canto), digitar a fórmula (em vermelho dentro da célula, ao mesmo tempo na barra de fórmula, com o cursor de texto piscando), o resultado entra, arrastar a alça para preencher, painel "draw a chart", gráfico de barras e rosca em aquarela (borda mais escura, granulação), rabiscos (seta em pincel ocre, raminho).
- **Câmera:** parada durante cada ação; entre uma e outra, salta em ~0,7 s (medido: picos de mudança de 5 a 9 entre quadros, isolados, com longos trechos parados). Aproxima onde há detalhe (digitar), afasta para mostrar o conjunto (gráficos).
- **Áudio:** música lofi contínua (piano), nenhum clique. O Macks pediu o contrário: **sem trilha, só sons de clique, tecla, arrasto e lápis**.

## Motor (`motor/cena.js`)

- O roteiro é uma **lista de ações** com tempo (`acoes`); o motor recalcula o estado da planilha em cada quadro a partir delas (nada acumula entre quadros). Ações: `clicar` (`cel` ou `botao`), `digitar` (`texto`, `resultado`, `dura`), `preencher` (`de`, `ate`, `valores`), `selecionar`, `grafico` (`forma`: `barras` ou `rosca`, `rotulos`, `valores`, `cores`, `area`), `redimensionar` (`id`, nova `area`), `seta`/`circulo`/`sublinhar` (rabiscos), `geral` (plano de tudo o que existe até ali).
- **Direção automática** (`montarDirecao`):
  - Câmera: para cada ação, um enquadramento (`focoDe`: perto para clicar e digitar, a faixa para preencher, o gráfico inteiro, a união do antes e depois no redimensionar). Chega 0,1 s antes da ação, em 0,6 a 1,1 s conforme a distância, com começo e fim lentos. **Não se mexe** se o que importa já está em quadro com zoom parecido. Respira de leve (0,8%). `foco` na ação força um enquadramento (usado para o círculo e a seta ficarem no mesmo plano).
  - Cursor: viaja em arco leve até o alvo e chega um instante antes de clicar; nos arrastos segue o caminho; nos rabiscos segue a ponta do traço; enquanto digita, a mão sai do mouse (o cursor se afasta um pouco).
- **Mundo:** folha de 2500×1350; a grade (`G`) tem a coluna A de 250 px e as outras de 150, linhas de 58. Os gráficos e rabiscos são posicionados em pixels do mundo.
- **Formatos:** a câmera enquadra retângulos do mundo, então 9:16 e 1:1 funcionam pelo mesmo roteiro (ainda não testados).
- `som.py`: clique, tecla (com variação de altura), enter, arrasto, soltar, lápis e o sopro do gráfico entrando, todos sintetizados a partir de `eventos.json`; tom de sala a −62 dB por baixo (nunca zero). Amostra: −25 LUFS, pico 0,61.
- `fazer.sh episodios/<slug> [--teste] [--formato 9:16|1:1|16:9]`: monta o `tempo.json` a partir do roteiro (`duracao`, `fps` 30), desenha, faz o som, mixa e entrega em `prontos/excel-desenhado/`. Render ~2 s por segundo de vídeo.

## A fazer

- Painel lateral "desenhar um gráfico" (a referência abre um painel antes do gráfico aparecer).
- Rabisco de raminho e outros desenhos soltos; rosca ainda sem legenda.
- Testar 9:16 e 1:1.
