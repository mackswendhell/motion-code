# Vila Acesa

Estilo de livro ilustrado: uma cidade inteira em corte, como casa de boneca, com cômodos animados cheios de gente pequena. Um ajudante luminoso passa por cada cômodo e acende uma ideia com um desenho de luz. A câmera passeia de cômodo em cômodo e no fim abre na cidade inteira. Narração de contadora de histórias. Desenho 2D em código (Canvas JS); do estúdio usa só o `nucleo/` (voz, vozes, trilha e o motor 2D comum em `nucleo/2d/`).

Estilo aprovado pelo Macks em 20/10/2026. Motor em `motor/` (sobre o `nucleo/2d/`). Sem skill ainda: o fluxo de roteiro vive neste arquivo.

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `001-um-dia-na-vila` | **entregue** (20/10/2026): 9 atos, 67,7 s, em 16:9 e 9:16 (`-9x16`) em `prontos/vila-acesa/` | ajustar o 9:16 (ver Direção de cena); som ambiente; skill do estilo |

## Motor (`motor/`)

Composição pedida pelo Macks em 20/10/2026, a partir de três prints da referência: cômodos com perspectiva e densidade de objetos, a cidade disposta como quadros numa faixa, movimento constante.
- **A cidade** (`PREDIOS`): faixa de 5 prédios de 2 andares sobre a rua, céu do amanhecer (esquerda) à noite (direita), moldura de papel creme. Só o final mostra a cidade inteira.
- **Cômodo em perspectiva de um ponto** (`caixaQ`, `quarto`): teto com vigas, parede do fundo, paredes laterais, piso de tábuas fugindo; objetos se posicionam com `naParede(g, f, v)` e `noChao(g, f, k)` (k = profundidade, dá a escala). Pintura em guache manchado (`guache`) com contorno de nanquim tremido (`nanquim`).
- **Cômodos detalhados** em `MOBILIA` (pintados uma vez em 2x, tela própria): padaria e casa em `cena.js`; lanchonete, oficina, correio e rádio em `comodos.js`, com a vida (`VIDA`), a ação (`ACAO`) e o detalhe da câmera (`DETALHE`) de cada um. Os outros (escola, biblioteca, salão, pet shop) saem de `comodoGenerico`. Cômodo novo = função nova em `MOBILIA` + `VIDA` + `ACAO`. Quem fica atrás de balcão é desenhado com `atrasDe` (só da cintura para cima).
- **Movimento constante**: `vidaComodo` (fogo, vapor, lâmpadas balançando, ventilador, ponteiros, poeira na luz, gente indo e vindo, bichos), mais nuvens, pássaros, fumaça dos telhados, carros, pedestres e folhas na cidade inteira. `ACAO[cena]`: a pessoa da vez, a faísca com rastro e o desenho de luz (`neon`).
- **Passagens**: só por zoom (ver Direção de cena). `vistaDeFora` (a vista do quintal ao atravessar uma janela) ficou no código, sem uso.
- **Rodar**: `./fazer.sh episodios/<slug> [--ate N] [--formato 9:16|1:1|16:9]` (narração, trilha, desenho, mixagem, entrega). Com `--ate N` faz só os N primeiros atos e não entrega em `prontos/` (é teste). Com `--formato` renderiza noutra proporção que não a do roteiro, com a mesma narração e música; a entrega ganha o sufixo (`-9x16`, `-1x1`). Quadros soltos: `node ../../nucleo/2d/capturar.mjs motor/pagina.html episodios/<slug> --still t1,t2 pasta`. Render ~3,8 s por segundo de vídeo em 16:9.

## Direção de cena (pedida pelo Macks em 20/10/2026)

- **Começa dentro de um cômodo**, nunca no plano geral. A primeira imagem já é uma cena viva.
- **Passagem de um cômodo a outro: sempre por zoom** (`"entrada": "zoom"` no ato). Afasta até ver os dois cômodos juntos (o espectador vê de onde vem e para onde vai) e mergulha no novo. Testamos também atravessar a porta lateral e não ficou bom (20/10/2026): não usar. O caminho do roteiro segue a cidade em ordem, para ninguém ficar perdido entre os ambientes.
- **Dentro do cômodo a câmera nunca para**: aproxima de forma quase imperceptível (3,5% ao longo do trecho). Atos seguidos no mesmo cômodo emendam sem pulo.
- **Detalhe da narração**: quando a fala cita algo (o reloginho, a listinha, a baleia), a câmera chega mais perto dele, mais forte que o respiro normal (`DETALHE[cena]`: área, segundos depois do começo da fala e quanto aproxima). Usar em parte dos cômodos, não em todos.
- **Final**: zoom out até a cidade inteira, a composição toda na faixa de papel, e segura.
- Dentro da cidade a câmera nunca mostra o papel de fora; só o final abre tudo.
- **No vertical (9:16), a câmera fica mais próxima** (observação do Macks no 001, 20/10/2026): em cada parada só o cômodo da vez pode aparecer, nunca dois cômodos ao mesmo tempo. Na passagem por zoom os dois aparecem juntos de propósito; fora dela, não. Hoje o enquadramento em pé (`enquadrar`, `corte = 0.72`) ainda deixa ver o andar de cima ou de baixo: **a ajustar** antes do próximo vertical.

## Decisões

- **Nome:** Vila Acesa (20/10/2026).
- **Formatos:** 9:16, 1:1 e 16:9 desde o primeiro episódio. A cidade é uma faixa horizontal: em 16:9 cada parada mostra mais cidade; em 9:16 a câmera fecha mais em cada cômodo. Mesma regra da Prancha Viva: compor em frações de `W` e `H`.
- **Narração:** sempre, voz `narradora` no `nucleo/vozes.json` (Fish "Jovem Contadora de Histórias", `1276aa9c182944998ed8a6cd70a51fa3`), escolhida de ouvido entre 5 em 20/10/2026. Direção base: "contadora de história de livro ilustrado, voz quente e acolhedora, sorrindo, ritmo calmo, encantada com os detalhes". Uma frase por cômodo; o tom esquenta e desacelera conforme a noite chega. O oposto do documentário da Prancha Viva.
- **Música:** trilha `vila` do `nucleo/trilha.py` (violão dedilhado em Dó / Sol / Lá menor / Fá a 80 bpm, caixinha de música esparsa e pad leve), contínua do começo ao fim, a −5 dB na mixagem (~12 dB abaixo da narração), sumindo nos últimos 2 s. Vai no MP4 e também separada (`trilha.wav`).
- **Som ambiente (a fazer):** ambiente de cada cômodo bem baixo (forno crepitando, xícaras, relógio, chiado de rádio) e um "plim" quando a faísca desenha. Ainda não existe.

## Estrutura do roteiro (a do 001)

- **Um dia inteiro na vila**, do amanhecer à noite, seguindo a cidade em ordem (o céu do mundo já vai do amanhecer à noite da esquerda para a direita).
- **Um cômodo por ato, uma pessoa com um probleminha, a faísca resolve com um desenho de luz.** Uma frase de narração por cômodo, de 10 a 16 palavras. O desenho de luz é a prova da frase (reloginho, listinha, baleia, balões de pedido, planta da invenção, caminho da carta, bolo de velinhas).
- **A faísca** é coral, de 4 raios longos e 4 curtos, com rastro de pinceladas; é o Claude da vila. Entra pela janela no começo e no final sobe e vira estrela.
- **Final:** frase curta e baixa ("E quando a vila dorme... a faísca vira estrela. Até amanhã.") sobre o zoom out da cidade inteira.
- **Tempo:** a fala de cada ato começa depois que a câmera chega (`narracao.em` de ~1,7 s nos atos com zoom), para o desenho de luz não aparecer no meio da passagem.
- `roteiro.json`: `estilo`, `formato`, `voz: "narradora"`, `atos` com `cena`, `dura`, `entrada` (`zoom`) e `narracao` (`texto`, `direcao`, `em`).

## Referência 1: a cidade de 10 cômodos

Vídeo "I made a website that's a town with 10 animated rooms in each..." (`~/Downloads/i-made-a-website-that-s-a-town-with-10-animated-rooms-in-eac-1.mp4`). 4:5 vertical (2160×2700), 30 fps, 62,5 s, sem narração. Música contínua (−14,5 LUFS, só 3,7 LU de variação), segunda metade ~3 dB mais cheia, some nos últimos 3 s.

**História.** Um site que é uma cidade em corte. Em cada cômodo, uma estrela laranja de oito pontas, brilhante, desenha em traço de neon coral algo que a pessoa precisa: a lista da mochila com os tiques, os pedidos da lanchonete em balões, o bolo de aniversário, a casinha. Um dia na cidade em que o ajudante resolve uma coisa pequena para cada um.

**Visual.** Livro ilustrado infantil, textura de lápis de cor e guache sobre papel. Paleta de outono quente: tijolo, verde-garrafa, mostarda, coral, folhas laranja caindo, abóboras, varal de bandeirinhas. Densidade enorme de detalhe (quadro para procurar coisas). Cômodos: padaria com forno a lenha, casa de família, lanchonete com piso xadrez, correio, oficina de invenções, prefeitura com relógio, escola com roda de leitura, pet shop, rádio à noite. Rua com carros, ônibus escolar e pedestres embaixo; céu do amanhecer à noite.

**Montagem.**
- Nenhum corte seco. A câmera para ~4 a 5 s em cada cômodo (a cena se anima: gente se mexe, o ajudante desenha), desliza até o vizinho, às vezes abre até a fachada e mergulha de novo. ~10 paradas.
- Final: zoom out até a cidade inteira como uma faixa de papel com borda rasgada sobre fundo creme, amanhecer à esquerda e noite com lua à direita, parada ~6 s.
- Movimento medido: picos de câmera em ~4,5 s, 7–15 s (abre a casa e passa para a lanchonete), 17–19 s, 24 s, 29–34 s, 39 s, 44 s, 53–56 s (zoom out final); quase imóvel de 57 s ao fim.
