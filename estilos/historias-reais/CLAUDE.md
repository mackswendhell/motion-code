# Histórias Reais

Um vídeo real (depoimentos de gente de verdade) recontado em desenho feito em código. Mesma cadeira, mesmo muro, mesmas pessoas, **a mesma voz delas**; o desenho é de livro infantil (lápis de cor, cabeça grande), como se a história fosse contada para uma criança de 5 anos entender, sem ficar engraçado: a emoção do original é o que se preserva. Nome dado pelo Macks em 21/10/2026.

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `001-nordeste` | teste renderizado (21/10/2026): 59,9 s, 9:16, a partir de "O Nordeste que foi esquecido" (Nikolas Ferreira, 179 s) | Macks ver o vídeo e ouvir as vozes candidatas do final (`vozes-candidatas/`); depois entregar em `prontos/historias-reais/` |

## Referência analisada (`referencia/`, fora do git)

- `original.mp4` (1920x1080, 60 fps; o vídeo é 9:16 com faixas pretas, área útil 608x1080 a partir de x=656), `frames/` (os 10.766 quadros, jpg), `audio.wav`.
- `transcricao.json`: faster-whisper large-v3, tempo por palavra (a linha "Legenda Adriana Zanotto" no fim é alucinação).
- `vozes.wav` e `trilha-original.wav`: o áudio separado pelo Demucs (`htdemucs_ft`, duas faixas). Música vazada nas vozes: −62 dB no trecho sem fala. Rodar de novo: `uvx --python 3.12 --from demucs --with soundfile --with "torchaudio<2.9" --with "torch<2.9" demucs --two-stems=vocals -n htdemucs_ft -o separado audio.wav`.
- `cortes.txt` (cortes de cena dentro da área 9:16), `folha.png`, `espectro.png`.
- Estrutura do original: Nikolas no pano preto ("vou falar sobre o Nordeste, mas...") → ele tira o pano, fica a cadeira vazia no muro de tijolo ("sem roteiro / sem filtro / sem fundo preto") → 7 pessoas revezando na mesma cadeira, cortes secos, legenda palavra a palavra → close dos rostos com anos (2026 a 2002) sobre o áudio do Lula em 2002 → cadeira vazia com dados escritos → "Na hora de votar, não se esqueça / De quem esqueceu de você". Trilha contínua por baixo de tudo, já mixada.

## Decisões

- **Áudio das falas: o original**, com a voz separada da trilha pelo Demucs. Corta-se só a voz, onde quiser; a trilha é nossa, em código, por baixo. Motivo: sotaque, pausa e voz embargada de gente de verdade nenhuma voz sintética entrega; e a trilha original mixada pulava a cada corte.
- **Nunca refazer a fala de uma pessoa real com voz de IA.** Em peça eleitoral isso é o que a Res. TSE 23.732/2024 (art. 9-C) proíbe: voz sintética de pessoa viva, falecida ou fictícia para favorecer ou prejudicar candidatura.
- **Narração do final com voz do Fish** (senhora nordestina, `senhora-nordestina` no `nucleo/vozes.json`): escolha do Macks, avisado do mesmo art. 9-C (pessoa fictícia). A última tela leva o aviso "narração final com voz gerada por IA" (`aviso_ia` no roteiro), que o art. 9-B exige.
- **Até 1 minuto.** A narração fiel do texto final leva ~23 s, então os depoimentos ficam com ~30 s. No 001 saiu o áudio do Lula de 2002; os anos passando (2002 a 2026) viraram giz no muro durante "depois de vinte anos no poder".
- Formato: o do vídeo de origem (o 001 é 9:16).

## Direção de cena

- **Uma pessoa por vez na mesma cadeira, mesmo enquadramento**, corte seco 2 quadros antes da fala (como a edição original). Planos: `geral` (corpo inteiro), `medio` (da cintura para cima), `close` (rosto); a câmera aproxima 3,5% devagar durante a fala; no "chega" entra num tranco.
- **Profundidade**: quanto mais perto, mais o muro desfoca (o cenário é pintado uma vez nítido e uma vez borrado, em 2x).
- **Rosto**: a boca abre com a energia da própria voz (quadro a quadro, do `montar.py`), pisca a cada ~3,7 s, a cabeça acompanha a fala; sobrancelhas tristes nos trechos `doi`, firmes no `ergue`/`chega`; `lagrima` faz a lágrima escorrer.
- **Insertos** (o que uma criança precisa ver para entender): `calendario` (a folhinha do ano cai a cada "envelheci"), `remedio` (balão com o vidro de remédio e as moedas que acabam), `estrada` (o filho indo embora na estrada, a mãe de costas acenando; entra na palavra marcada por `em`).
- **Final**: a cadeira vazia; as frases escritas no alto, os dados viram desenhos de giz no muro (balde, torneira seca com uma gota, as dez casinhas); as duas últimas frases no escuro.
- **Legenda**: manuscrita (Patrick Hand), branca com contorno marrom, palavra por palavra em blocos curtos, no terço de baixo.
- **Música** (`som.py`, campo `musica` de cada item): `abre`, `conta` (piano em arpejo), `doi` (o piano para e as cordas crescem), `ergue`, `chega` (tambor grave + acorde em cada "chega"), `fim` (piano lento; no escuro, uma nota longa). Fica 17 dB abaixo da fala e baixa mais 4 dB enquanto alguém fala.

## Roteiro (`episodios/<slug>/roteiro.json`)

`sequencia`: na ordem do vídeo.
- fala: `quem` (id em `PESSOAS`), `de`/`ate` (segundos no vídeo original), `texto` (a legenda), `plano`, `fundo` (`muro` ou `pano`), `inserto`, `em` (segundo no original em que o inserto entra), `lagrima`, `pausa` (antes da fala), `musica`.
- cena sem fala: `cena: "cortina"`, `dura`, `textos`.
- `cena: "final"`, `frases` (`texto` na tela, `voz_texto` como se fala, `ilustra`: `anos`/`esgoto`/`torneira`/`cidades`, `escuro`, `direcao`).

## Motor

- `montar.py`: corta as falas de `referencia/vozes.wav` (o corte cai no ponto mais quieto perto da palavra), narra o final no Fish (cache por hash em `audio/final*.mp3`), põe o fundo da própria fonte entre as falas (nunca zero digital) e grava `audio/narracao.wav` + `tempo.json` (segmentos, palavras e a boca quadro a quadro).
- `motor/pessoas.js`: o traço (cor chapada + padrão de lápis + contorno que ferve a 12 por segundo) e o elenco `PESSOAS` (pele, cabelo, roupa, óculos, bigode, barba, idade, tirados dos quadros). Pessoa nova = uma entrada ali.
- `motor/cena.js`: cenários (`muro`, `pano`), câmera, pessoa na cadeira, legenda, insertos, cortina e final.
- `som.py`: a trilha. `fazer.sh episodios/<slug> [--teste]`: montar → desenhar → trilha → mixagem (−16 LUFS) → `prontos/historias-reais/<slug>/`.
- Vídeo fonte novo: copiar para `referencia/` (ou uma subpasta por história, quando houver a segunda), extrair quadros, transcrever com palavras, separar com o Demucs, mapear quem fala em cada corte (folha de quadros com o tempo) e desenhar o elenco.

## A fazer

- Um vídeo fonte por episódio: hoje `montar.py` lê `referencia/vozes.wav` fixo; na segunda história, o roteiro passa a dizer a fonte.
- 16:9 e 1:1 não testados.
