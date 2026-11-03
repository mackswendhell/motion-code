# Demo Tutorial: mostrar um app na tela

Para vídeos em que a pessoa, em câmera, conduz uma demonstração de um app. O vídeo parece tela gravada, mas é feito com prints e código: a interface é recriada em camadas, com cursor, cliques, digitação, menus e zoom no que está sendo falado, e a câmera fica num card ao lado.

Este guia complementa o [CLAUDE.md](../CLAUDE.md) (vídeo intocável, rosto livre, aprovações) e o guia do nível.

## Peças prontas (`src/estilos/demo-tutorial/`)

As peças recriam o Claude desktop como exemplo. Para outro app, use os prints dele e crie os componentes no projeto; o cursor, a câmera, o zoom e os vãos servem para qualquer app.

| arquivo | o que tem |
|---|---|
| `base.tsx` | cores (`COR` mesa creme, `APP` tema escuro do app), fontes, `Cena`, `useAgora` (segundos absolutos do vídeo gravado), `useEm`, `useMola`, `useDigitado`, `Mesa`, `Chip`, `Marca`, `Cartela` (01/07), `Broll`, `Asterisco` |
| `app.tsx` | `JanelaApp`, `Lateral`, `Conversa`, `Cabecalho`, `Caixa`, `MsgUsuario`, `MsgClaude`, `Ferramenta`, `Trabalhando`, `ListaTarefas`, cartões do painel, `Menu`, `Modal`, `Botao`, `Chave`, `Cursor`, `Enquadro` (zoom) |
| `camera.tsx` | `layoutsDemo(rosto)` → A, G, D, E, H, Q · `T` (B-roll) · `Crono` · `CameraDemo` · `AppDemo` |
| `diagrama.tsx` | `Folha`, `MiniChat`, `No`, `Linha` (que se desenha), `TituloDiagrama`, `BarraContexto`, `IconeGrande` |
| `vaos.tsx` | vídeo com vãos na fala: `Vao`, `offEm`, `trechos`, `duracaoFinal`, `CameraEFalaComVaos`, `ClipeNoVao`, `CartelaVao` (com o som `sons/cartela.m4a`) |

Exemplos que rodam sem vídeo: composições `DemoTutorial` e `CartelaVao`.

## Entradas

| o que chegou | caminho |
|---|---|
| gravação + roteiro | casar o roteiro com a fala real |
| só a gravação | transcrever e achar o que está sendo demonstrado |
| só o roteiro | prévia para validar o ritmo antes de gravar: mesma montagem, com uma câmera falsa e tempos a 150 palavras/min |

## Fluxo

1. **Organizar e transcrever** (guia do nível). Confira o `transcript.md` por buracos: o faster-whisper pode engolir trechos. Buraco de mais de 2 s entre frases → retranscreva o trecho e insira no `palavras.json`.
2. **Zona do rosto**: `python tools/rosto.py "<vídeo>"`. Use os percentis p2/p98 + ~40 px de cabelo e ~60 px de queixo. Passe para `layoutsDemo`; se `enquadrarRosto` reclamar, o card é pequeno demais para o rosto.
3. **Prints do app real.** A reconstrução copia o app **da pessoa**: tema, rótulos e idioma dela. Peça que ela tire os prints (barra lateral, telas, menus abertos, o que o vídeo cita) e salve em `prints/`. Só entre na tela dela com licença, e sem alterar nada: abrir, passar o mouse e fechar. Amostre as cores dos prints (PIL) e atualize `APP` em `base.tsx`. Oculte nome, e-mail e dados de terceiros.
4. **Casar roteiro e fala** no `plano.md` (ponto de aprovação): o que foi dito manda sobre o roteiro. Timeline por bloco com início, câmera, o que aparece e a palavra-gatilho. Pedido falado: a digitação começa na primeira palavra do pedido e termina com a fala. "Aqui" e "lá em cima" são gatilhos do cursor.
5. **Programar** em `src/videos/<slug>/`:
   - `base.tsx`: `export * from '../../estilos/demo-tutorial/base'` + `FPS`, `DURACAO`, `arq`;
   - `comum.tsx`: `L = layoutsDemo(ROSTO)`, o `CRONO` único (câmera e app mudam juntos) e os dados do exemplo, iguais do começo ao fim;
   - `blocoN.tsx`: uma cena por componente, tempos absolutos tirados do `palavras.json`;
   - `<Slug>.tsx`: lista `SOB` (app, diagramas, B-roll: embaixo da câmera) e `SOBRE` (elementos de tela cheia: em cima da câmera). Entre telas do app use entrada `corte`, para a janela não piscar.
6. **Conferir** com `node tools/stills.mjs <Composicao> <pasta> <segundos…>`. Uma still a cada ~10 s na primeira passada; depois, só os pontos corrigidos.
7. **Render**: `npx remotion render src/index.ts <Composicao> <saida>.mp4 --muted --codec=h264 --crf=18 --concurrency=6`, depois `ffmpeg -i video.mp4 -i master -map 0:v -map 1:a -c copy -movflags +faststart <final>.mp4` (áudio do master bit a bit). Valide com ffprobe (duração ±1 quadro, fps, uma trilha).
8. **Folha de revisão do arquivo final**, extraída com ffmpeg do MP4: ponto de aprovação antes de chamar de final.

## Vãos na fala (clipes que tocam sozinhos e cartelas)

Quando o plano pede um clipe inteiro ou uma cartela sem fala, a edição abre um vão no vídeo gravado:

- **Ponto do vão só pelo `tools/vaos.py`** (`python tools/vaos.py "<vídeo>" "<palavras.json>" "<começo da frase depois do vão>" …`). Ele corta no meio do silêncio medido. Nunca use a borda de palavra do Whisper, que adianta o fim das palavras. `colado` no resultado = nenhum silêncio: ouça esse vão antes do render final.
- Monte com `CameraEFalaComVaos`: a fala para **exatamente** no ponto, sem cauda nem fade longo.
- **Clipe no vão sempre com o som dele** (`ClipeNoVao`).
- **Cartela com `CartelaVao`**: começa 0,45 s antes do vão, por cima do fim da fala, segura o vão e sai por cima do começo da fala seguinte. Nunca corte seco entre câmera e cartela.
- Com vãos, o áudio é montado no Remotion: render **sem** `--muted`, com `--audio-bitrate=320k --timeout=240000 --concurrency=4`. Confira as duas bordas de cada vão: a palavra de antes inteira e nada da frase seguinte dentro do vão.

## Linguagem do estilo

- **Abertura dinâmica.** Nos primeiros ~60 s, alterne conforme a fala: tela do app, tela dividida, câmera cheia com recortes. Nunca mais de ~10 s no mesmo arranjo. Citou o produto, a tela entra na hora. Câmera cheia sempre com movimento leve.
- **Miolo em tela dividida**, variando o card: G em cartelas e diagramas, D nas demos, E quando o foco é o painel direito, H (16:9) em telas largas, Q para objetos. Troca de layout em ~0,9 s, câmera e app na mesma curva.
- **Zoom segue a fala**: aproxima onde o cursor vai agir, segura para leitura (menu ≥ 0,8 s, tabela 2–3 s) e volta ao app inteiro. O `Enquadro` recorta na caixa do layout, para o app nunca passar por baixo da câmera.
- **Cursor real**: aproxima, pausa, clica, a interface responde.
- **Fechamento em tela cheia**, com movimento leve; elementos só do lado livre do rosto.
- **Visual**: mesa creme com quadriculado, terracota só no que é novo ou apontado, Inter na interface, JetBrains Mono em comandos. É o padrão, não obrigação: siga o pedido da pessoa.

## Armadilhas

- **Disco cheio**: cada bundle do Remotion copia `projetos/` inteira para o temporário, e render que falha deixa a cópia lá. Confira `df` antes do render final. `remotion still` faz isso a cada chamada: use `tools/stills.mjs`.
- **Faixa escura quando a câmera volta a cheia**: a cena de baixo precisa durar até a transição acabar.
- **Hook dentro de condicional** (`cond && useEm(...)`) quebra entre quadros. Calcule os hooks no topo do componente.
- **Foco do zoom** perto da borda corta o texto digitado: mire no começo da caixa, não no centro.
- **Render que estoura o tempo** com muitos clipes parados na tela: suba `--timeout` e baixe `--concurrency`.
