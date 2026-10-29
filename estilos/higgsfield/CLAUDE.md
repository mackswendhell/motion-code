# Higgsfield

Estilo-mãe da soma **pintura da Higgsfield + animação em código**. A Higgsfield pinta as peças paradas (fundo, personagem em partes, texturas) e o código faz tudo o que acontece no tempo (câmera, movimento, brilho, profundidade, diagrama, sincronia com a fala). Uma não substitui a outra: a IA entra onde o código puro fica pobre (textura, material, luz, forma orgânica) e o código entra onde a IA não tem controle (tempo, geometria exata, consistência entre quadros).

Nome dado pelo Macks em 21/10/2026. O roteiro escolhe a **variação** (`"variacao"`). `prancha` mantém o motor Canvas existente, em `motor/`. `motion-pro` é a variação de produto 3D em bancada, com motor Blender separado em `motor-motion-pro/`; usa modelos e vistas da Higgsfield, com animação e interface em código.

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `000-prova-abelha` | **prova aprovada** (21/10/2026), variação `prancha`: a abertura da Prancha Viva 001, 6 s, 16:9 | nenhum (continua rodando no motor de atos: só usa a cena `favo`) |
| `001-ciclo-da-abelha` | **aprovado** (21/10/2026): os 13 atos da Prancha Viva 001 com a mesma narração, 62,8 s, 16:9; 17 peças pintadas; renderizado como teste, ainda não entregue | 9:16 e 1:1 e entregar em `prontos/higgsfield/` |
| `002-motion-pro-picape` | **prova renderizada e verificada** (22/10/2026), variação `motion-pro`: Toyota 4×4 original da Higgsfield; 12 s, Full HD, 24 fps, montagem em bancada, interface, trilha e efeitos | avaliação do Macks; MP4 na pasta do episódio |

## Variação Motion Pro

- Referência: `~/Downloads/Motion pro.mp4`. Análise de todos os 288 frames e pranchas em `referencia/motion-pro/analise.md`.
- Linguagem: bancada 3D bege, luz quente, materiais físicos, movimentos rápidos de câmera com desaceleração, cartões que saem da tela, componentes que se encaixam e encerramento em pedestal. Grafismos marfim, coral, grafite e verde-lima. O material de risografia da `prancha` não se aplica automaticamente a esta variação.
- Identidade do produto vem do ativo existente. No 002, conservar pintura creme, faixas marrom/laranja/dourado, cromados, proporções e pneus da Toyota; não transformá-la em monster truck.
- O GLB original é preservado. O motor cria malhas de trabalho para rodas, carroceria e faróis, mantendo as UVs, e uma estrutura interna demonstrativa para a montagem. Não se trata de um modelo CAD mecânico.
- `motor-motion-pro/cena.py`: cenário, câmera, interface, separação de componentes e linha do tempo. Cada frame é função do tempo; pode renderizar quadros isolados com `--frames` ou os 288 com `--render all`.
- `motor-motion-pro/som.py`: efeitos sincronizados. A trilha do 002 foi recuperada de uma geração Sonilo existente na Higgsfield.
- `bash fazer-motion-pro.sh episodios/002-motion-pro-picape`: render e composição; `--montar` reaproveita os PNGs. A prova permanece na oficina do episódio até avaliação; só entrega aprovada vai para `prontos/`.

## Regras da soma

1. **A geometria vem do código antes da pintura.** `guias.py` desenha a planta (ex.: o favo, célula por célula, com o tipo de cada uma) e grava as coordenadas (`favo.json`). A planta vai como imagem de referência para a Higgsfield, que pinta por cima dela. Resultado da prova: as células pintadas caem exatamente nas da planta, e o motor anima em cima de cada uma (o brilho do mel, o hexágono do "aqui").
2. **A IA entrega peças, nunca o quadro pronto.** Fundo em 4k (maior que o quadro, para a câmera andar), personagem recortado e **em partes** (a abelha sem asas e as asas soltas, com o ponto de giro na raiz). `background: transparent` do GPT Image 2.5 já entrega o recorte.
3. **Uma referência de estilo para tudo.** A primeira pintura aprovada (o favo) é a referência de todas as outras peças (`--image favo.png`). Prompt de estilo comum: ilustração científica de naturalista, prancha editorial à mão, textura de risografia, hachura fina, paleta de mel e âmbar, luz suave do alto à esquerda.
4. **Uma passada final de código por cima de tudo**: o grão de risografia do `nucleo/2d/base.js` e a vinheta quente, sobre a pintura e o desenho de código juntos, para virar um material só.
5. **Profundidade**: lente macro (centro nítido, bordas do quadro desfocadas por máscara radial), sombra das peças no fundo, coisas perto da lente grandes e desfocadas, partículas em várias distâncias.

## Motor e peças

- `guias.py`: plantas geradas por código antes da pintura (`favo`). `python3 guias.py favo episodios/<slug>/ativos`.
- `ativos.py episodios/<slug> [nome ...]`: pinta as peças da lista `ativos` do roteiro (prompt, `refs` para outras peças, `proporcao`, `res`, `transparente`), com o `estilo_prompt` do roteiro no fim de cada prompt. Peças sem dependência pendente saem em paralelo; peça que já existe não é pintada de novo (para refazer, apagar o png). Uma peça pode partir de outra por edição (`celula-fechada` é a `celula` com a tampa; `pupa-olhos` é a `pupa` dias depois): sai alinhada com a original.
- `episodios/<slug>/ativos/`: as peças pintadas, a planta (`favo-guia.png`, `favo.json`) e a resposta de cada geração (`*.resposta.json`, com o prompt e a URL).
- `motor/cena.js` (o motor): carrega as peças (o `fazer.sh` grava em `tempo.json` o caminho, `ativos`, e a lista, `pecas`), desenha o ato da vez e as passagens da Prancha Viva (`iris`, `funde`/`forma`, `afasta`), depois a lente macro, a poeira, o grão e a vinheta. Peças de apoio: `vista` (câmera sobre uma pintura), `abelha` (`ABELHA` guarda onde ficam tórax, ombros e raiz da asa no recorte), `sprite`, `brilhoMel`, `hexLuz`, `linhaGiz`.
- `motor/cenas.js`: uma função por cena, `CENAS[nome](c, u, d)`. `PECA` guarda onde as coisas ficam em cada pintura (centro e raio da célula, a colmeia e as macieiras no mapa, as flores do galho), medido com uma grade sobre a pintura depois de pintar.
- `fazer.sh episodios/<slug> [--ate N]`: narração (`nucleo/2d/narrar.py`), desenho, trilha `contos` como na Prancha Viva, mixagem e entrega em `prontos/higgsfield/`. Com `--ate` é teste.
- Render: ~20 s por segundo de vídeo em 16:9 (fundo em 4k e desfoque em tela cheia a cada quadro). Ainda não otimizado.

## Custos (21/10/2026)

GPT Image 2.5: qualidade alta em 2k = 2,75 créditos; em 4k = 4,25. A prova gastou 3 imagens (~10 créditos: o favo em 4k, a abelha e as asas em 2k). O 001 pintou mais 14 (46,5 créditos).

## A fazer

- Abelha andando: as patas são fixas (o passo é só a velocidade pulsando). Se incomodar, gerar as patas em partes também.
