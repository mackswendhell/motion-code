# Kraft

Explicação por analogia em papel kraft, vertical. Os cortes em kraft entram por cima (ou no lugar) da gravação da pessoa: o vídeo daqui é a parte em código; a câmera e os cortes com ela ficam no Studio ou no projeto Shorts.

## Referência analisada

`~/Downloads/Novos estilos/Reels novo estilo.mp4` (720×1280, 58,7 s, 05/11/2026), só para estudo, fora do repo. O que fica: papel kraft com grão e fibras; cantos cobertos por papel rasgado, jornal e fita; etiqueta laranja no topo com o tema ("식당으로 치면" = "pensa numa cozinha"); recortes ilustrados em P&B com um só acento laranja que caem um por frase; etiquetas brancas "X = Y"; carimbo redondo como veredito; abertura com comentários do público empilhados sobre a câmera; legenda amarela com contorno escuro no terço inferior. Cores, textos e desenhos são nossos.

## Decisões

- Formato: só 9:16. Voz: `narrador` (ou a voz clonada do Macks, `macks`). Trilha `contos` bem baixa (-12 dB).
- Recortes entram com pop e sobra (0,25 s), já inclinados, com tremido de stop motion (8 poses/s). Nada desliza linear.
- Ilustrações dos recortes: círculo-ícone em código por padrão; com a Higgsfield, PNG sem fundo em P&B com um detalhe laranja (`tela.imagens`), custo dito antes.

## Cenas (`motor/cenas.js`) e campos de `tela`

| Cena | `tela` |
|---|---|
| `abertura` | `topo` (chip azul), `titulo` (2 linhas), `comentarios` (lista) |
| `analogia` | `etiqueta`, `itens` ([["CPU", "cozinheiro"], ...]), `imagens` (opcional, uma por item) |
| `veredito` | `texto` (etiqueta branca), `carimbo` (palavras do carimbo) |
| `lista` | `etiqueta`, `itens` (marcados com ✓ um por vez) |

Legenda: `legenda()` mostra o trecho da fala (4 palavras) em amarelo. Motor comum: `nucleo/galeria/atos.js`.

## Comandos

`./fazer.sh episodios/<slug> [--ate N]` (narração, captura, trilha, entrega em `prontos/kraft/`).

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `000-amostra` | amostra de 14 s renderizada com voz (05/11/2026) | Macks ver e aprovar o estilo |
