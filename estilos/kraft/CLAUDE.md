# Kraft

> Estilo aprovado pelo Macks em 06/11/2026 com o `001-mesa`: manter assim (layouts de câmera variando, o site mostrado com prints e o agente navegando, efeitos discretos, música quase inaudível).

Reels explicativo por analogia: a pessoa fala para a câmera, recortes e etiquetas pulam por cima dela, e na hora da analogia a tela vira papel kraft, onde personagens e objetos recortados montam a explicação. Vale a regra do estúdio: **a Higgsfield pinta, o código anima**. A Higgsfield só entrega imagem parada (cada recorte sem fundo); entrada, tremido, pulo, vapor, carimbo, escrita, legenda, câmera e som são todos daqui.

## Referência analisada (06/11/2026)

`~/Downloads/Novos estilos/Reels novo estilo.mp4` (720×1280, 24 fps, 58,7 s), só para estudo, fora do repo. Vista a 4 quadros/s inteira e a 24 quadros/s em cada entrada; áudio separado pelo Demucs (voz × resto) para medir trilha e efeitos. Cores, textos, desenhos e sons são nossos.

**Estrutura** (o que prende): pergunta em título grosso sobre a câmera + comentários do público empilhados (0-4 s); "?" e confissão; primeira dica com ícone e etiqueta "X = Y" sobre a câmera (10-17 s); **corte seco para o kraft** com a etiqueta laranja da analogia no topo ("pensa numa cozinha") e a cena se monta peça por peça, uma por frase (18-46 s); volta para a câmera com os ícones da dica, o personagem da analogia pula de um ícone para o outro (49-51 s); fecho com etiqueta laranja "próximo episódio".

**Movimento**:
- Entrada padrão = **pop**: a peça nasce a ~30% e passa um pouco do tamanho em 4 a 6 quadros (0,2 s), sem fade. Personagem grande entra **deslizando da borda** (0,2 s, passa e volta). Gente que surge atrás de algo **sobe** com pop.
- **Saída é corte seco**: tudo some junto na troca de tela. Não há fade em lugar nenhum.
- **Reorganização por corte**: quando entra peça nova, as velhas mudam de tamanho e lugar de um quadro para o outro (a nuvem encolhe quando o Mac chega; o chef vai para o canto quando o fogão entra).
- Tudo que está parado **respira em stop motion** (8 poses/s, poucos pixels). Vapor de panela ondula, avião de papel atravessa devagar.
- **Pulo em arco** para levar um personagem de um ícone a outro.
- A câmera tem **punch-in** (zoom ~1,12 alternado) a cada frase nova; a camada de recortes não pisca nos cortes.

**Visual**: kraft com fibras e manchas; só os cantos de cima cobertos (jornal, papel quadriculado, rasgo laranja, fita). Recortes em **foto P&B de retícula com um único acento laranja**, borda branca de adesivo e sombra curta; personagens **sem rosto** (oval de kraft). Etiquetas em tira de papel rasgado: branca com texto preto ("X = Y") ou laranja com texto branco (tema, destaque). Carimbo redondo creme com dois anéis laranja e tinta falhada. Bloco pautado com borda laranja, itens escritos à mão um por vez. Comanda de impressora com o número em laranja. Comentários em cartões brancos rasgados nas laterais, com avatar e nome cinza. Título: chip azul-claro + duas linhas pretas grossas com contorno, a segunda em laranja.

**Legenda**: uma frase curta por vez (3 a 5 palavras, quebra na pausa), amarelo-claro com contorno escuro, fonte arredondada grossa, a ~72% da altura; troca seca, sem animação. A mesma na câmera e no kraft.

**Som** (faixa sem voz, medida):
- Trilha: batida leve a ~80 bpm, ~15 dB abaixo da voz. **Some ~0,6 s antes de uma revelação e volta com ela** (antes do Mac, da cozinha cheia, do pulo do chef).
- Um efeito por entrada: clique curto em cada comentário e etiqueta (~2 kHz, 60-140 ms); "bloop" grave em cada personagem (~650 Hz, 0,2 s); mola de 0,75 s no "?"; dois riscos agudos (~8 kHz, 50 ms) por item escrito; batida grave com cauda no carimbo; zumbido de impressora (0,55 s) na comanda; sininho no fecho.

## Decisões

- Formato: 9:16 (é Reels). O motor usa coordenadas em fração da tela, então 1:1 e 16:9 rodam, mas o layout de cada ato é pensado em pé.
- **Dois modos**, pelo roteiro: `gravacao` (por cima de um vídeo gravado, o modo da referência) ou narrado (sem gravação: voz do Fish, `voz` do roteiro, e todo ato em kraft).
- O vídeo gravado não é cortado, reordenado nem acelerado: só reenquadrado e com zoom por ato. Áudio original do começo ao fim. A limpeza de silêncios vem antes (RecMove).
- Gravação de qualquer proporção: o corte é o maior retângulo 9:16 dentro dela, centrado no rosto. O x do rosto é medido sozinho (`studio/tools/rosto.py`, OpenCV via `uv`); o y fica 0,35 (o detector erra com boné e óculos). Conferir um quadro; corrigir com `"enquadre": {"x": 0.6, "y": 0.3}`.
- Higgsfield: só imagem, uma por peça, sem fundo, sem texto. Todo texto é do motor. Custo dito antes de gerar.
- Som (06/11/2026, pedido do Macks): a trilha `kraft` feita para imitar a referência não agradou; padrão agora é o lofi `piano` do `nucleo/lofi.py`. Efeitos 7 dB mais baixos que os da referência (`DISCRETO` no `som.py`).

## Roteiro (`episodios/<slug>/roteiro.json`)

```json
{"formato": "9:16", "fps": 30, "idioma": "pt",
 "gravacao": "gravacao.mp4",            // tira isto para o modo narrado (aí cada ato leva "narracao" e "dura")
 "voz": "macks",                        // só no narrado
 "enquadre": {"x": 0.55, "y": 0.32},    // opcional
 "legenda": true,                       // false se a gravação já vier legendada
 "musica": "lofi:piano",                // padrão; ou lofi:estudo, lofi:madrugada, kraft, ou um arquivo (ex.: faixa gerada na Higgsfield)
 "musica_db": -15,                      // dB abaixo da voz (o 001 usa -26: quase não se ouve)
 "corrige": {"Cloud": "Claude"},        // grafia certa na legenda quando o transcritor erra
 "estilo_prompt": "...", "ativos": {"chef": {"prompt": "...", "proporcao": "1:1", "transparente": true}},
 "atos": [{"de": "pensa", "fundo": "kraft", "zoom": 1.12, "trilha": "pausa", "elementos": [ ... ]}]}
```

- **Câmera** (`camera` do ato, modo gravação): `cheia` (padrão), `baixo` (tela dividida: animação na metade de cima, você embaixo; numa gravação 16:9 mostra bem mais que o corte em pé), `cima`, `card` (cartão colado embaixo à direita), `card-esq`, ou `{x, y, w, h}` em fração da tela. Fora de `cheia` o resto da tela é papel kraft, com borda branca de foto e fita em volta da câmera. **Variar o layout ao longo do vídeo é o que dá dinâmica** (Macks, 06/11/2026): tela cheia, divide, reduz, volta. Na troca de layout a câmera encolhe ou cresce sozinha em 0,45 s (`camera_corte: true` para corte seco); sem câmera (`fundo: kraft` sem `camera`) é a analogia em tela cheia. A legenda desce para 92% quando a câmera ocupa a parte de baixo.
- **Ato** = uma tela. Na gravação começa em `de` (segundos do vídeo ou a palavra dita) e vai até o próximo. `fundo`: `gravacao` (padrão no modo gravação) ou `kraft`. `zoom`: padrão alterna 1 e 1,12. `trilha`: `pausa` (some 0,6 s antes do ato e volta nele) ou `fora` (sem música no ato).
- **Tempo de tudo** (`em`, `sai`, `vai[].em`, `itens[].em`): número = segundos desde o começo do ato; texto = a palavra dita (sem acento nem caixa; `"palavra#2"` = a segunda vez). Nada entra antes de ser dito. Palavra que não existe para o `tempo.py` e mostra o que foi dito ali.
- **Posição**: `x`, `y` = centro, em fração da tela (0 a 1). `larg` = largura em fração da tela. `rot` em radianos.
- Peça que continua de um ato para o outro é repetida no ato novo com `"entrada": "nenhuma"` (aparece sem pop nem som), já no lugar novo: é assim que a tela se reorganiza por corte.

**Elementos** (`tipo`):

| tipo | campos | som padrão |
|---|---|---|
| `imagem` | `ativo` (nome em `ativos/`), `larg`, `entrada`, `espelho`, `contorno` (borda branca, padrão sim), `vivo` (stop motion, padrão sim), `vai` | `bloop`; `whoosh` se desliza |
| `etiqueta` | `texto`, `cor` (`laranja` ou branca), `tam` (px a 1080) | `pop` |
| `titulo` | `chip`, `linhas` (2), `tam` | `plim` |
| `comentarios` | `itens` (texto ou `{texto, em}`), `passo` (s entre um e outro), `larg` | `pop` em cada |
| `carimbo` | `texto`, `raio`, `inclina` | `carimbo` |
| `interrogacao` | `tam` (balança depois do pop) | `boing` |
| `lista` | `itens: [{texto, em}]`, `larg`, `alt` (bloco pautado; cada item se escreve) | `escrita` em cada |
| `recibo` | `topo`, `valor`, `rodape`, `larg` (sai de cima para baixo) | `impressora` |
| `vapor` | `larg` (fumaça em stop motion; põe em cima de panela) | nenhum |
| `navegador` | janela de navegador de papel com o cursor laranja "Claude" (`agente` troca o nome): `url` + `url_em` (digitada; `url_em` negativo = já digitada), `alt`, `paginas: [{em, print, foco}]`, `focos: [{em, x, y, zoom}]` (passeia e aproxima no print, 0,6 s), `acoes: [{em, tipo: move \| clica \| digita \| print, x, y, w, h, texto}]` (o cursor chega em 0,45 s; `digita` preenche o campo `x,y,w,h` letra a letra; `print` = flash), `marcas: [{em, x, y, w, h}]` (marca-texto). x/y em fração do print | `clique`, `tecla` por letra, `obturador`, `whoosh` na troca de página |
| `print` | print colado com borda branca e duas fitas: `arquivo` (`prints/x.png`), `larg`, `alt` (corta uma janela), `foco`/`focos`, `marcas`, `vai` (voar para a pasta) | `papel` |

- `entrada`: `pop` (padrão), `esquerda`, `direita`, `cima`, `baixo`, `cai`, `sobe`, `nenhuma`.
- `vai`: mudanças de lugar no meio do ato, `[{em, x, y, larg, modo: "corte" | "pulo" | "desliza", dura, altura}]`. Pulo e deslize levam `whoosh`.
- `som`: troca o som padrão (`pop`, `bloop`, `whoosh`, `carimbo`, `boing`, `escrita`, `impressora`, `plim`, `papel`) ou `"nenhum"`. O corte câmera ↔ kraft leva `papel` sozinho. O som vem do lado da tela onde a peça aparece.

## Prints e o agente navegando (o que a fala mostra na tela)

- Quando a fala cita um site, painel, app ou ação na tela ("abre o painel, preenche, clica, tira o print"), **mostrar**: tirar os prints reais e recriar a navegação com o `navegador` (cursor clicando e digitando sobre os prints), não só etiquetas.
- Prints: perguntar antes de abrir o navegador (regra global). O caminho que funcionou (06/11/2026): o `chrome-agent` do Macks já aberto com CDP na 9222; `puppeteer.connect({browserURL: "http://127.0.0.1:9222"})` com o `puppeteer-core` de `nucleo/2d/node_modules`, aba nova, viewport 1920×1080, `goto`, esperar, `screenshot` em `episodios/<slug>/prints/`, fechar a aba. Só abrir e fotografar: nunca clicar em salvar, publicar ou mudar nada na conta. O `agent-browser` não funcionou no sandbox (não cria o socket).
- Antes de usar: **recortar** o print para tirar receita, saldo, e-mail, menu de conta e comentários de outras pessoas (no YouTube Studio: "Receita estimada" no painel e a coluna "Receita est." no conteúdo). Prints ficam fora do git (`*.png`).
- As coordenadas dos cliques e campos (x, y, w, h) são medidas no próprio print, em fração dele.

## Higgsfield (peças)

- Uma peça por coisa que se mexe, **em partes** se a parte se mexe sozinha. Sem fundo (`"transparente": true`), sem texto, sem borda (a borda branca de adesivo é do motor).
- `estilo_prompt` padrão (copiar no roteiro): *Isolated cut-out collage element on a fully transparent background. Vintage black-and-white halftone photograph with visible newspaper print dots, high-contrast grayscale, with exactly one flat bright orange (#F26A1F) accent. Any person has no face: the face is a plain flat tan kraft-paper oval. No border, no outline, no shadow, no text, no letters, no background.*
- Cada prompt diz o objeto e **qual parte é o acento laranja** (o lenço do chef, o avental, a chama, a luz do Mac).
- Fundo kraft pintado (opcional): peça `kraft-fundo` (9:16, 4k, sem transparência: papel kraft com os cantos de cima cobertos). Se existir em `ativos/`, o motor usa no lugar do papel feito em código.
- Música de arquivo maior que o vídeo: toca o começo dela e o final de verdade dela se funde (1,5 s) para terminar junto com o vídeo. Não acelera nem estica (`som.py`).
- Gerar pelo conector da Higgsfield (`generate_image_batch` com `gpt_image_2_5`, `background: transparent`, 2k, alta) quando a CLI não alcança a rede, como no sandbox de 06/11/2026; baixar para `ativos/<nome>.png` e **recortar a margem transparente** (senão `larg` mede o quadrado, não o objeto). Ou: `python3 ../../nucleo/ativos.py episodios/<slug>` (só as que faltam; para refazer, apagar o png). GPT Image 2.5 alta: 2,75 créditos em 2k, 4,25 em 4k. Peça faltando aparece como rascunho com o nome dela.

## Motor

- `tempo.py`: modo gravação → transcreve a gravação (faster-whisper `large-v3-turbo`, `palavras.json` em cache) e mede o rosto; modo narrado → `nucleo/2d/narrar.py` e transcreve a narração (a grafia do roteiro substitui a do transcritor quando o número de palavras bate). Resolve todos os gatilhos, monta as frases da legenda e grava `tempo.json`.
- `motor/cenas.js` + `motor/pagina.html`: o desenho (`iniciar`/`quadro`, aparece no painel Motion). No modo gravação a tela é transparente onde não é kraft; o `capturar.mjs` grava `<slug>.mov` com transparência (`tempo.alfa`).
- `som.py`: efeitos por evento e trilha `kraft` do `nucleo/trilha.py` com as pausas; volumes calibrados pela voz.
- `compor.py`: gravação reenquadrada e com zoom por ato + camada + voz + trilha + efeitos (`tweaks.json`: `voz`, `trilha`, `efeitos` em dB).
- Render quando o sandbox não deixa abrir o Chrome headless: `CHROME_CDP=http://127.0.0.1:9222 ./fazer.sh ...` usa o Chrome do `chrome-agent` já aberto (abre uma aba durante a captura); o `capturar.mjs` monta a página e injeta scripts, fonte e as imagens de `ativos/` e `prints/`.
- A camada transparente sai em ProRes 4444 e é apagada depois da montagem. A câmera é montada quadro a quadro pelo `compor.py` (recorte em volta do rosto na proporção do layout, mesma curva do buraco no papel).
- Testar o motor sem Chrome: um canvas falso no Node pega erro de código em todos os quadros (usado em 06/11/2026, quando o sandbox não deixava abrir o Chrome).

## Comandos

```
cd estilos/kraft
python3 ../../nucleo/ativos.py episodios/<slug>     # peças da Higgsfield (custa crédito)
./fazer.sh episodios/<slug> [--ate N]              # tempo, camada, som, montagem; sem --ate entrega em prontos/kraft/
```

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `000-amostra` | refeita no motor novo (06/11/2026), modo narrado, 22,7 s: título, comentários, "?", chef, lista, fogão com 3 cozinheiros, vapor, carimbo, comanda, pulo do chef no Mac, fecho; tempo, som e montagem testados; **quadros ainda não renderizados** (o Chrome não abriu no sandbox da sessão) | rodar `./fazer.sh episodios/000-amostra --ate 5`; 4 peças pintadas (06/11/2026); refazer o render para ver com elas |
| `001-mesa` | **aprovado e entregue** (06/11/2026) em `prontos/kraft/001-mesa/`: 52 s, câmera cheia / dividida / card variando, navegador animado sobre prints reais do YouTube Studio, prints voando para a pasta, Ocean View a -29 dB. **É o padrão do estilo**: próximos episódios seguem este | nenhum |
