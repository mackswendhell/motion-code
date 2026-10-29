# Fantasia

Lenda de fantasia contada em ilustração vetorial chapada (contorno escuro nos personagens, cor lisa), com grão de papel, raios de luz, névoa e profundidade de campo de verdade: a câmera aproxima, as camadas andam em paralaxe e desfocam fora do foco. Uma narradora de voz antiga e serena, legenda serifada, trilha de lenda em código. Nome dado pelo Macks em 21/10/2026. **Estilo aprovado pelo Macks em 21/10/2026, nos três formatos** ("aprovado esse formato"): o 001 é a referência do padrão.

**Skill:** `contador-de-lendas` (`~/.agents/skills/contador-de-lendas/`) conduz um episódio novo: fonte, roteiro, ficha de cada cena, aprovação, amostra, render nos três formatos e entrega. O que se aprender num episódio entra nas referências dela.

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `001-o-anel` | **entregue e aprovado** (21/10/2026): 13 cenas, 65,8 s, em 9:16, 1:1 e 16:9, em `prontos/fantasia/001-o-anel/` | nenhum; próximo episódio quando o Macks trouxer a história |

## Referência analisada (`referencia/`, fora do git)

- `original.mp4`: "The Story of the One Ring" (1080x1080, 24 fps, 136 s, narração em inglês). `frames/` (os 3.264 quadros), `audio.wav`, `transcricao.json` (faster-whisper large-v3, tempo por palavra), `cortes.txt`, `folha0..3.jpg` (um quadro a cada 2 s).
- O visual: formas chapadas com grão fino por cima de tudo; luz em raios que somam (screen); névoa no horizonte; fundo desfocado nos closes; personagens de cabeça grande e olhos pretos com brilho, contorno marrom-escuro; luz de borda colorida do lado da fonte (fogo laranja). Legenda Lora seminegrito, branca com sombra, embaixo.
- A estrutura: floresta com o anel na pedra → close do anel → forja → guerra → rei → rio → fundo do rio → pescadores → Gollum → Bilbo → Condado → Frodo e a jornada (neve, Argonath, Mordor) → Monte da Perdição → Gollum cai → águias → "foi a piedade" → os hobbits em casa.

## Decisões

- **Três formatos sempre: 9:16, 1:1 e 16:9** (pedido do Macks). `./fazer.sh episodios/<slug> --formato 9:16` (e 1:1, 16:9); a narração vem do cache, só o desenho refaz.
- **Sotaque**: a voz Galadriel é de modelo em inglês e pode puxar para o português de Portugal (o Macks ouviu isso na abertura). A direção leva "sotaque brasileiro, pronúncia do Brasil, nunca de Portugal" e o texto usa a forma falada no Brasil ("Essa é", não "Esta é"). Aprovado: está na `direcao_base` da voz `elfa`. A abertura que o Macks ouviu e aprovou é a tomada 1 (`vozes-candidatas/abertura-take1.mp3`), copiada para o cache. Formas que soam de Portugal ficam fora do texto ("desfazê-lo", "soltá-lo", "nada acontecendo").
- **Até 1 minuto**: 13 frases curtas, ~100 palavras, e `"respiro": 0.35` no roteiro (o `narrar.py` usa 0,7 s nos outros estilos). Com a direção de sotaque brasileiro a voz ficou mais lenta: a primeira versão do roteiro (~120 palavras) deu 91 s e foi enxugada para 65,8 s. Cada palavra a mais custa ~0,6 s.
- **Voz** (`elfa` no `nucleo/vozes.json`): pedido do Macks, "a voz que lembra a Galadriel no começo do conto, ou a Athena no começo de God of War". No Fish há modelos com esses nomes (clones de fãs das atrizes, Cate Blanchett e Carole Ruggier); falam português com o texto certo (conferido no transcritor). Ficou a `galadriel3` (aprovada pelo Macks no vídeo); as outras seguem em `vozes-candidatas/` (galadriel1-3, athena1-2, deusa-atena, elegante, conto-fadas).

## Como foi feito o 001 (o caminho que deu certo)

1. Vídeo de referência em `referencia/`: todos os quadros, transcrição com tempo por palavra, cortes de cena e folhas de quadros (um a cada 2 s) para ler a história e o visual.
2. Roteiro resumido em português (frases curtas, uma por cena) e vozes candidatas lendo a mesma abertura, conferidas no transcritor.
3. **Trecho de amostra antes de tudo** (`--ate 3`, ~17 s): o Macks aprovou visual e ritmo, e foi aí que apontou o sotaque de Portugal. Só depois as outras cenas.
4. Quadros soltos (`capturar.mjs --still`) de cada cena nova, lidos numa folha, para corrigir antes do render completo (o que já saiu errado: fumaça em bolhas contornadas, asas em vareta, personagens embaixo da legenda, martelo atravessando a bigorna, lava escondida atrás do chão).
5. Render completo nos três formatos (~10 min cada), conferência de áudio (pico por canal, LUFS, nenhum buraco de 50 ms) e entrega.

## Motor

- `../../nucleo/2d/narrar.py` (atos + narração, `--ate N`), `../../nucleo/2d/capturar.mjs` (grava também `eventos.json`: as marteladas da forja).
- `motor/cena.js`:
  - O mundo é um quadrado de 1080 no centro da tela; no 16:9 a cena se estende para os lados, no 9:16 para cima e para baixo (`OX`/`OY`; bordas da tela no mundo em `EL ER ET EB`, com margem em `X0 X1 Y0 Y1`). Fundo, chão e parede vão até as bordas; árvores e rochas de canto ficam presas à borda da tela, não ao quadrado. No 9:16 o quadro aperta 1,22x e a legenda fica a 80% da altura (acima dos botões do app).
  - `poe(alvo, img, d, C, blur)`: põe uma camada em cache com profundidade `d` (0 parada, 1 anda com a câmera, >1 à frente) e desfoque em px. `vivo(...)`: o mesmo para o que mexe a cada quadro.
  - Camadas paradas são pintadas uma vez em `iniciar`, com margem `M` (o desfoque não escurece a borda); `borrado(nome, px)` guarda a versão desfocada.
  - `forma(...)`: cor lisa + luz de borda + contorno. `raios`, `brilho`, `estrela`, `particulas` (pó, vaga-lumes, brasas).
  - `textura(t)`: manchas de guache (soft-light), grão fino que ferve a 12 por segundo (overlay) e vinheta.
  - Cenas `floresta`, `anel`, `forja` em `cena.js`; as outras dez em `historia.js`. Cena nova = uma função em `CENAS` + o `fazer...()` das camadas em `PREPARA`. `naFala(ato, k)` dá o momento da fala na fração k, para casar a ação com a palavra (o golpe em "cortado", a queda em "caiu").
  - `motor/personagens.js`: `pessoa(g, x, y, s, nome, o)` (hobbits e o rei, do `ELENCO`: cabelo, colete, mochila, barba, elmo, capa; poses `passo`, `bracos`, `sentado`, `ajoelhado`; rosto `olhos`, `boca`, `sobrancelha`, `olhar`; `segura` desenha algo na mão), `gollum(...)` (`agachado` ou `danca`), `aguia(...)` (com passageiros). O Senhor do Escuro é `senhor()` no `cena.js` (`martelo: false` na guerra).
  - `translucido()` desenha um grupo inteiro com transparência; `fumaca()` preenche as bolas como um contorno só (transparência sem marcar sobreposição).
  - Dissolve de 0,35 s entre cenas; abre do preto.
- `som.py`: clima por cena (`CLIMA`): `luz` (cordas em Ré maior, coro alto, harpa em arpejo, sinos) e `sombra` (drone em Ré menor, coro baixo, tambor na entrada). Do `eventos.json`: bigorna em cada martelada, metal + tambor no golpe da espada, o maior tambor quando o anel cai no fogo. ~14 dB abaixo da voz, baixa mais 4 dB quando ela fala, fundo de sala a −60 dB.
- `fazer.sh episodios/<slug> [--ate N] [--formato 9:16|1:1|16:9]`: narração → desenho → trilha → mixagem (loudnorm −16 LUFS + limitador a 0,84) → `prontos/fantasia/<slug>/<slug>-<formato>.mp4`. Rodar uma vez por formato; a narração e as camadas não se repetem entre cenas, mas o desenho refaz por formato.
- Conferir o pico **por canal** (`-f f32le` estéreo, sem `-ac 1`): somar os canais em mono deu um falso 1,19.
