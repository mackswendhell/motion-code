# Ficha Técnica

Produto no centro de um simulador técnico: painéis finos creme e grafite em volta, um só acento laranja, o modo de operação em letras grandes e uma linha do tempo de operação embaixo. Lançamento de produto com cara de engenharia.

## Referência analisada

`~/Downloads/elvar_official-2116618736371118544-video-1920x1080.mp4` (robô-aranha "Salticus JS-8"), só para estudo. O que fica: fundo creme claro; robô 3D no centro passando por modos (CROUCH, OPTICS OPEN, LEG R1 APART, TEARDOWN, REASSEMBLY, WALK, STANDING); colunas de painéis com número grande e unidade pequena, barras listradas, medidor, lista de subsistemas com status verde/laranja; cabeçalho com ícone laranja e barra de progresso; vista explodida com peças flutuando e linhas de cota. Produto, nome e números daqui são nossos.

## Decisões

- Formato: 16:9. Voz: `narrador`. Trilha `noite` (-7 dB).
- Cortes secos entre modos (`"entrada": "corte"`); o HUD fica igual e só os valores mudam, como num simulador.
- O produto vem da Higgsfield quando houver (imagem → vistas ou GLB, como na variação `motion-pro` do estilo Higgsfield), em `tela.imagem` com fundo transparente; sem imagem, o robô em código (`uiRobo`, de `nucleo/galeria/sementes/produto.js`, carregado pela página).

## Cenas e `tela`

| Cena | `tela` |
|---|---|
| `modo` | `produto`, `codigo`, `linha`, `modo`, `progresso` (0 a 1), `paineis` ([[rótulo, valor, unidade] × 4]), `subsistemas` ([[nome, ok]]), `destaqueCarga`, `linhaInicio`/`linhaFim`, `imagem` |
| `explodida` | os mesmos + `cotas` ([[texto, dx, dy]]), `volta` (remonta no fim) |

## Comandos

`./fazer.sh episodios/<slug> [--ate N]` (entrega em `prontos/ficha-tecnica/`).

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `000-amostra` | amostra de 12 s renderizada com voz (05/11/2026) | Macks ver e aprovar o estilo |
