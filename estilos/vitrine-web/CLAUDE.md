# Vitrine Web

Sites e landing pages apresentados como showreel: cada corte é uma tela de site em tela cheia, com objeto central vivo, título gigante, botão e cursor. Para portfólio de designer/dev, lançamento de site e agência.

## Referência analisada

`~/Downloads/Novos estilos/viktoroddy-2117585451502719144-video-1612x1374.mp4` (5,8 s), só para estudo. O que fica: cortes secos entre sites escuros (preto com cérebro de partículas coloridas) e claros (céu lavanda com medusa rosa atravessando palavras gigantes "SIGN", "DELIGHT"); barra de navegação fina; título grande e fino em 2 a 3 linhas; botão roxo em pílula; cursor que passeia e para no botão; mosaicos de outros trabalhos; robôs e produtos 3D em sites de dados. Todos os sites, marcas e textos daqui são inventados.

## Decisões

- Formato: 16:9. Voz opcional (`narrador`); funciona também só com trilha. Trilha `noite` (-6 dB).
- Cortes secos (`"entrada": "corte"`) entre sites; fusão curta (0,12 s) quando não há corte.
- Objeto central: `particulas`, `medusa`, `orbe` em código, ou `tela.imagem` (render/foto da Higgsfield em fundo neutro, custo dito antes).

## Cenas e `tela`

| Cena | `tela` |
|---|---|
| `hero` | `tema` (escuro/claro), `marca`, `menu`, `titulo` (linhas), `sub`, `botao`, `objeto`, `imagem`, `cor` |
| `palavra` | `palavras` (trocam ao longo do ato), `marca`, `menu`, `objeto`, `corA`/`corB` |
| `grade` | `titulo`, `itens` (nomes dos trabalhos) |

## Comandos

`./fazer.sh episodios/<slug> [--ate N]` (entrega em `prontos/vitrine-web/`).

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `000-amostra` | amostra de 12 s renderizada com voz (05/11/2026) | Macks ver e aprovar o estilo |
