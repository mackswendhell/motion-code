# Lofi

Estilo de música para trabalhar e estudar: uma cena 3D aconchegante em loop, sem fala, com trilha lofi feita em código. Poucos segundos de movimento que se repetem sem dar para perceber a emenda. Textura e luz do vídeo do piano (brinquedo fosco no Blender, luz quente de abajur contra janela fria, neblina com poeira, desfoque de lente). Do estúdio usa só o `nucleo/` (`lofi.py` para a música). Comandos rodam de dentro desta pasta.

Pedido do Macks em 20/10/2026. Nome: Lofi. Formato: só 16:9 (decidido em 20/10/2026).

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `001-estudo-na-chuva` | **entregue e aprovado** (20/10/2026): cena `estudo`, faixa `estudo`, loop de 13,3 s, 3 min | nenhum |
| `002-madrugada-no-teclado` | **entregue e aprovado** (20/10/2026): cena `teclado`, faixa `madrugada`, loop de 10,7 s, 3 min | nenhum |
| `003-claude-no-piano` | **entregue e aprovado** (20/10/2026): cena `piano`, faixa `piano`, loop de 12 s, 3 min | nenhum |
| `004-discos-na-neve` | **entregue e aprovado** (20/10/2026): cena `discos`, faixa `estudo`, loop de 13,3 s, 3 min | nenhum |

Entrega em `prontos/lofi/<slug>/`: o vídeo de 3 min (`minutos` do roteiro), o loop de vídeo sozinho, a trilha em loop (`trilha-loop.wav`) e o roteiro.

## Como funciona

- **Tudo é loop exato.** A música tem N compassos (`nucleo/lofi.py`, tudo circular: reverb, filtros, caudas). O vídeo dura metade da música e todo movimento é periódico nele (`onda(t, ciclos)` com número inteiro de ciclos por loop; quedas e subidas com `% 1`). O último quadro emenda no primeiro.
- **Andamento casa com o quadro**: o loop da música tem de dar quadros inteiros a 24 fps (72 bpm → 26,667 s = 640 quadros; 80 → 24 s; 90 → 21,333 s). O vídeo usa a metade (320, 288, 256 quadros).
- **Peso do arquivo**: o grão por quadro é caro para o codificador. Com `noise=alls=7` e crf 17 o loop dava 72 Mbps (3 min = 1,6 GB); com `alls=5`, crf 22 e `-tune grain` dá 7,5 Mbps (3 min = 176 MB) e a imagem fica igual a olho.
- **Render barato**: um loop só, em 960×540 (`--scale 50`, Eevee, ~4 s por quadro), ampliado para 1920×1080 no ffmpeg (lanczos) com grão de filme por quadro e vinheta. O grão e o desfoque escondem a ampliação. A entrega longa (`minutos` no roteiro) repete o loop de vídeo sem recodificar (`-c:v copy`) e a música amostra por amostra: 1 hora custa o mesmo render que 13 s.
- **Rodar**: `./fazer.sh episodios/<slug> [--teste]` (o `fazer.sh` já codifica com `alls=5`, crf 22, `-tune grain`). Com `--teste` para no `loop.mp4` (não entrega). Quadros soltos: `blender -b -P cena.py -- --cena estudo --saida pasta --list 0,100`.
- `roteiro.json`: `estilo`, `formato`, `cena` (função em `CENAS` no `cena.py`), `faixa` (em `FAIXAS` no `nucleo/lofi.py`), `minutos`.

## Motor (`cena.py`)

- Materiais `mat()`: fosco com grão fino de relevo (ruído no bump), brilho de tecido (sheen) nas roupas e pelos. Formas: `caixa` (chanfrada), `bolha` (cubo subdividido, massinha), `bola`, `cilindro`, `membro` (elipsoide esticado entre dois pontos, para braços e rabo).
- Peças que servem a qualquer cena: `claude_bonequinho` (caixa coral, olhos de ^, bracinhos, quatro perninhas; balança no tempo da música), `gato` (preto, enrodilhado, respira, a ponta do rabo bate uma vez por loop), `chuva`, `poeira` (pontinhos na luz), `vapor`.
- Luz: abajur (spot quente `#ffb066` + rebatida), janela (área azul `#6b84ff` por trás), preenchimento quente fraco pela frente. Neblina volumétrica do mundo (`--neblina`, 0,028) com `volumetric_tile_size = "2"` e 128 amostras: em 4 / 64 aparece um quadriculado na parede.
- Câmera com desfoque (f/1.2): as janelas da cidade lá fora viram bokeh.
- Cena nova = função em `CENAS` que monta e devolve `apply(t)`.

## Referências

**1. Textura e luz: o piano** (`~/Downloads/claude-opus-5-5-wrote-the-piano-music-in-python-created-the--1.mp4`). 1:1, 24 fps, 72 s, música de piano (−16 LUFS, 12,8 LU de variação). O Claude (caixa coral, olhos ^ ou quadrados) e um gato preto sobre as teclas de um piano azul-petróleo gasto. Materiais foscos de brinquedo, quinas chanfradas, tinta descascando nas bordas do piano. Luz: vela quente com halo + janela de entardecer, sombras de caixilho atravessando a cena, poeira flutuando, neblina leve, desfoque forte de lente. Câmera baixa, na altura das teclas, com travelling lento.

**2. Composição: a moça estudando** (print do Macks, 20/10/2026). De perfil, fone grande, blusa verde, cachecol vermelho, mão no queixo, escrevendo; janela de chuva à noite, abajur vermelho no alto, planta, livros, poltrona vermelha. A personagem do estilo é inspirada nela, não uma cópia: a "Lofi Girl" é personagem registrada de um canal, então traço, cores e cabelo devem ser nossos para não dar problema de direitos no YouTube.

## Decisões

- **Sem fala.** Só música e ambiente.
- **Música** (`nucleo/lofi.py`): Rhodes com acordes de sétima e nona, baixo redondo, bateria boom-bap abafada com swing e a caixa um pouco atrás do tempo, notas soltas na segunda metade, chiado e estalos de disco, oscilação de fita, chuva opcional. Teclas abaixam um pouco a cada bumbo. −16 LUFS (ganho fixo, sem loudnorm dinâmico, para não quebrar a emenda). Faixas: `estudo` (72 bpm, Fámaj9 / Mim7 / Rém9 / Dómaj9, com chuva), `piano` (80 bpm, Rém9 / Sol / Dómaj7 / Lám7), `madrugada` (90 bpm, Mi♭maj7 / Rém / Dóm9 / Si♭maj9).
- **Cenas**: estudo (a moça), teclado (o rapaz), piano e discos (o elemento musical, com o Claude e o gato). Peças comuns novas: `parede_com_janela`, `la_fora` (céu, prédios, bokeh, lua), `fone_de_ouvido`, `abajur_de_mesa`, `chuva(..., neve=True)`.
- **Luz de sol no piano**: janela na parede lateral, nunca na do fundo (a luz bateria nas costas do piano); o caixilho desenha as faixas.
