# Nível 2: edição avançada com a Higgsfield

No Nível 2, além de montar a edição, o Claude **gera imagens e vídeos com IA** na [Higgsfield](https://higgsfield.ai): B-rolls cinematográficos, ilustrações animadas, metáforas visuais, transformações de cena. A montagem final roda no **Higgsedit**, o editor da própria Higgsfield, dentro de um ambiente na nuvem.

**Custo:** usa **créditos da Higgsfield** (plano pago). Nada é gerado sem você aprovar o plano e o custo estimado.
**Quando vale a pena:** vídeos em que imagens geradas (B-roll, metáforas, cenas realistas) fazem diferença. Se o vídeo é mais tutorial e print, o [Nível 1](2-nivel-1-remotion.md) resolve de graça.

---

## 1. Conectar a Higgsfield ao Claude

Existem dois caminhos. **Escolha o A se puder**: ele dá acesso a todas as ferramentas do Nível 2.

### Caminho A: entrar com a sua conta Higgsfield (recomendado)

É o conector oficial (MCP), em `https://mcp.higgsfield.ai/mcp`. A autenticação é feita com login na sua conta; não existe chave para copiar.

**No Claude Desktop (ou em claude.ai):**

1. Abra **Configurações → Conectores** (em algumas versões, **Personalizar → Conectores**).
2. Clique em **Adicionar conector personalizado**.
3. Nome: `Higgsfield`. URL: `https://mcp.higgsfield.ai/mcp`.
4. Clique em **Conectar** e faça login na sua conta Higgsfield na janela que abrir.

Atalho que já abre o formulário preenchido:
[claude.ai/customize/connectors?modal=add-custom-connector…](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Higgsfield&connectorUrl=https%3A%2F%2Fmcp.higgsfield.ai%2Fmcp)

Conectores adicionados na sua conta do Claude aparecem também nas sessões **Code** do Claude Desktop e no Claude Code do terminal, desde que você esteja logado na mesma conta.

**No Claude Code pelo terminal (alternativa):**

```bash
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```

Depois, dentro do Claude Code, digite `/mcp`, selecione `higgsfield` e autentique no navegador.

**Como saber se funcionou:** peça ao Claude "consulta meu saldo na Higgsfield". Ele deve responder com os seus créditos.

### Caminho B: API key da Higgsfield Cloud

> **Importante:** o conector oficial (Caminho A) **não aceita API key**. A própria Higgsfield informa que a API key pertence a outro produto, a **Higgsfield Cloud API**. Por isso, neste caminho o Claude não usa o conector: ele chama a API com o SDK oficial em Python, pelo script `tools/hf_api.py`.

O que muda:

- dá para **gerar imagens e vídeos** normalmente, com os modelos disponíveis na Cloud API;
- **não** há o sandbox nem o Higgsedit. A **montagem final é feita no Remotion**, como no Nível 1, usando os assets gerados. Na prática, é um "Nível 1 turbinado".

Passo a passo:

1. Crie a chave em [cloud.higgsfield.ai](https://cloud.higgsfield.ai). Você recebe um **API key** e um **API secret**.
2. Instale o SDK oficial:
   ```bash
   pip install higgsfield-client
   ```
3. Guarde a chave numa **variável de ambiente** do seu usuário (nunca num arquivo do repositório):
   - **Windows (PowerShell):**
     ```powershell
     [Environment]::SetEnvironmentVariable("HF_KEY", "SUA-API-KEY:SEU-API-SECRET", "User")
     ```
   - **macOS / Linux:** adicione ao `~/.zshrc` ou `~/.bashrc`:
     ```bash
     export HF_KEY="SUA-API-KEY:SEU-API-SECRET"
     ```
4. Feche e abra de novo o Claude (Desktop ou terminal) para ele enxergar a variável.
5. Teste pedindo: "gera uma imagem de teste na Higgsfield pelo caminho B".

O Claude usa:

```bash
python tools/hf_api.py <modelo> '<argumentos em JSON>' "projetos/<NNN. nome>/hf"
```

A lista de modelos e argumentos da Cloud API está na documentação em [cloud.higgsfield.ai](https://cloud.higgsfield.ai).

---

## 2. O que você entrega e recebe

Igual ao Nível 1: vídeo **já cortado** em `video/`, **prints** em `prints/` (fotos de pessoas citadas, notícias, logos, miniaturas) e suas **orientações**, incluindo um **orçamento de créditos** se quiser limitar o gasto.

Você recebe o MP4 final em `../../prontos/studio/<NNN. nome>/<nome>_final.mp4`.

---

## 3. O processo (Caminho A)

### 1. Organizar
Mesma organização do Nível 1: pasta `projetos/<NNN. nome>/`, `ffprobe` no vídeo e `../../prontos/studio/<NNN. nome>/`.

### 2. Assistir e transcrever
Mesmo processo do Nível 1: quadros com a skill `watch` em `frames/` e tempo por palavra com `tools/transcrever.py` em `transcricao/`.

### 3. Planejar (ponto de aprovação)
O `plano.md` segue a [direção editorial](5-direcao-editorial.md) e acrescenta:

- lista de assets a gerar, com modelo e **custo estimado em créditos**;
- margem de refação;
- custo total.

Veja um plano real completo em [projetos/000. exemplo/plano.md](../projetos/000.%20exemplo/plano.md).

**Nenhum crédito é gasto antes da sua aprovação.** Se o gasto passar ~20% do estimado, o Claude para e avisa.

### 4. Gerar os assets
- Consulta o saldo (`balance`) antes de começar.
- Primeiro as imagens, em lote (`generate_image_batch`). Monta uma prancha de conferência e refaz o que não se lê.
- Depois anima (`generate_video_batch`, `jobs_wait`, `show_generation_by_ids`) e aprova pelo quadro do meio e pelo do fim.
- Baixa os resultados para `hf/` com nomes descritivos (`03_broll_ampulheta.mp4`).
- **Imagens e vídeos gerados não levam texto.** Todo texto entra na montagem.

### 5. Montar no Higgsedit
A montagem roda no sandbox da Higgsfield (`sandbox_exec`) com o `higgsedit`.

1. Antes de escrever o roteiro de montagem, o Claude carrega `get_workflow_instructions {workflow: "video-editing"}` e as referências do workflow (`compose.md`, `clip-geometry.md`, `animation-contract.md`, `shot-blueprints.md`, `failure-modes.md`).
2. O vídeo e os prints sobem com `media_upload` → upload do arquivo → `media_confirm`. Os assets gerados já têm URL.
3. O roteiro fica salvo em `projetos/<NNN. nome>/edit.jsx`. Cada `sandbox_exec` baixa os arquivos, roda `higgsedit build` e gera a saída **na mesma chamada** (o sandbox é descartado segundos depois). Se o roteiro for grande demais para o comando, ele sobe com `media_upload` e é baixado no sandbox.
4. Estrutura: o vídeo gravado vai na base com `p.cut` (imagem e áudio contínuos). Enquadramento, B-roll, texto e cartelas entram por cima com `p.compose`. Os gatilhos são os segundos exatos do `palavras.json`.
5. Fontes do Google Fonts são baixadas no sandbox e registradas com `higgsedit fonts add`.
6. Conferência antes do render com `higgsedit sheet` no início, no meio e no fim de cada troca de layout: rosto coberto, legibilidade, borda preta no zoom, sincronia.
7. Render em segundo plano (`background: true`) com acompanhamento. Se passar do limite de 15 min do sandbox, renderiza por blocos (`--range`) e junta com ffmpeg.
8. Baixa o resultado para `../../prontos/studio/<NNN. nome>/<nome>_final.mp4`.

Se o Higgsedit não der conta de algo, o Claude diz isso e propõe alternativa (ffmpeg no sandbox, ou montar a parte no Remotion).

### 6. Validar e entregar
- `ffprobe`: resolução, fps, duração igual à do vídeo gravado, uma trilha de áudio.
- `ffmpeg -af volumedetect` no final e no original: volumes iguais.
- Caminho do arquivo, duração, resolução, codecs e **créditos gastos**.

## 4. O processo (Caminho B)

Fases 1 a 3 iguais. Na fase 4, os assets são gerados com `tools/hf_api.py` e salvos em `hf/`. As fases 5 e 6 seguem o [Nível 1](2-nivel-1-remotion.md#4-programar-as-cenas): o Claude programa a montagem no Remotion usando os arquivos de `hf/` como B-roll e ilustrações.

---

## 5. Modelos e custos de referência (Caminho A)

| Uso | Modelo | Custo aprox. | Observação |
|---|---|---|---|
| Ilustração 16:9 ou 9:16 | `nano_banana_pro`, 2k | 2 cr | lotes de até 12 com `generate_image_batch` |
| Objeto isolado | `nano_banana_pro`, 1:1 | 2 cr | depois remover o fundo |
| Variação da mesma cena | `nano_banana_pro` + `image_references` = id da geração | 2 cr | ex.: mesa cheia → mesa vazia |
| Remover fundo | `image_background_remover` | — | **exige `prompt`** ("remove background, keep only the X") |
| Imagem → vídeo padrão | `kling3_0`, mode `pro`, sound `off` | ~1,75 cr/s | `start_image`; aceita `end_image` para transformação |
| Imagem → vídeo "herói" | `seedance_2_0`, 1080p, `generate_audio: false` | ~9 cr/s | cenas principais |
| Cena realista | `veo3_1`, `veo-3-1-fast`, quality `high`, 8 s | 22 cr | texto → vídeo, sem pessoas identificáveis |

- Os custos mudam. O Claude confirma com `models_explore` quando o modelo ou o parâmetro mudar, e usa `models_explore(action: "recommend")` quando estiver em dúvida sobre qual modelo usar.
- Se um lote voltar com `submission_failed` sugerindo um preset, reenviar com `declined_preset_id` igual ao id sugerido.
- Diagramas, fluxos, chips e textos são construídos na montagem (0 crédito). A Higgsfield gera ilustrações, objetos e B-rolls.

## 6. Estilos e prompts base

Três estilos que funcionam bem no Nível 2: **papel recortado** (B-roll), **papel creme em aula** e **cinematográfico escuro**. São modelos, não obrigação: descreva o estilo que quiser ou traga imagens de referência em `prints/`.

### Papel recortado

Tokens de cor: papel `#F0EEE6`, papel claro `#FAF9F5`, tinta `#141413`, tinta suave `#3D3929`, cinza `#6B675C`, borda `#E3DED2`, terracota `#D97757`, terracota escuro `#B5532F`, sálvia `#788C5D`, vermelho `#C0453A`.
Tipografia (Google Fonts): **Newsreader** (títulos e números), **Inter** (interface, chips; mínimo 18 px), **JetBrains Mono** (terminal, contadores).

Sufixo de estilo:

```
Handcrafted layered paper-cut illustration, elegant and minimal, photographed cut paper diorama
with real paper grain and soft realistic shadows between layers, warm cream and ivory paper
(#F0EEE6, #E8E4D8), terracotta orange accents (#D97757), charcoal ink details (#2B2A27), small
touches of muted sage green and dusty blue paper, soft diffused top light, calm editorial didactic
mood, generous negative space. Absolutely no text, no letters, no numbers, no logos, no watermark.
```

Exemplos de cena (antes do sufixo):

- **Fundo:** `Seamless empty background made of layered warm cream paper sheets with subtle torn deckled edges peeking at the corners, very subtle paper fiber texture, soft vignette, mostly flat and clean in the center for text overlay.`
- **Conceito → objeto:** `A paper-cut conveyor belt running left to right: crumpled messy paper tasks enter a small elegant paper machine with gears and exit as neat stacked cards with terracotta check marks.`
- **Metáfora vista de cima:** `Top-down overhead view of a paper-cut light wooden desk with neatly arranged documents, note cards with abstract squiggle lines, a small round terracotta kitchen timer, a coffee cup.`
- **Objeto isolado:** `A single small round paper-cut kitchen timer, isolated and centered on a plain flat cream background, front view.`
- **Edição da mesma cena:** `Edit this exact paper-cut desk scene, same overhead camera, same lighting, same style: remove all documents. Keep only the timer and the coffee cup exactly where they are.`

Sufixo de animação (imagem → vídeo):

```
[ação específica e lenta]. Slow gentle camera push-in. Handmade paper stop-motion feel, keep the
exact paper-cut style, colors and soft lighting, no new objects, no text.
```

Transformação com `start_image` + `end_image`: `The documents lift off the desk one by one and fly away out of frame like paper leaves in a gentle breeze, leaving the desk clean; the timer and the cup stay in place. Static overhead camera.`

### Papel recortado leve

Variação mais limpa: a montagem no Remotion faz o papel (fundo creme com grão, folhas com borda de tesoura, texto 3D, câmera colada) e a Higgsfield entra só com 1–3 ilustrações-chave da metáfora, em papel recortado plano e sem diorama pesado. Prompt base: `Layered paper-cut craft illustration, [cena], handmade cut paper layers with soft drop shadows and visible paper fiber texture, warm muted palette: cream #F0EEE6, terracotta #D97757, sage green #788C5D, ivory. Calm editorial look, generous empty space on the left third. No text, no letters, no logos, no people.` Animação: Kling 3.0 pro, 5 s, `Stop-motion paper-cut animation. [ação]. Layered parallax, paper texture preserved, same colors, no new objects, no text.` O espaço vazio à esquerda recebe o texto da montagem.

### Cinematográfico escuro (B-roll realista)

```
Cinematic macro shot of [objeto] on a dark wooden desk, [ação lenta], very slow push-in dolly,
warm moody tungsten lamp light, dark bookshelf softly out of focus, shallow depth of field,
calm and premium, realistic, no people / no faces, no text.
```

Ajuste a luz e o cenário para combinar com o **seu** estúdio: o B-roll deve parecer parte do mesmo mundo da sua câmera.

### Formato vertical
Gere as imagens direto em 9:16 (não recorte de 16:9). Mantenha o assunto principal no terço central, longe do topo e da base, onde fica a interface dos apps.

## 7. Checklist

- [ ] quadros lidos, fundo mapeado e zona do rosto medida em 1 quadro por segundo (cards de câmera reduzem o vídeo para o rosto caber, nunca recortam)
- [ ] `palavras.json` gerado e conferido
- [ ] suas orientações refletidas no plano
- [ ] custo estimado aprovado antes de gerar
- [ ] ilustrações sem texto, aprovadas em prancha; animações aprovadas pelo quadro do meio e do fim
- [ ] conferência de todas as trocas de layout (rosto, legibilidade, borda, sincronia)
- [ ] render final validado (resolução, fps, duração, volume)
