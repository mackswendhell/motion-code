# Rabisco

Caneta preta grossa e giz de cera sobre papel liso. Cada coisa se desenha na tela (linha-guia azul, contorno traçado, giz varrendo por dentro) e se apaga para dar lugar à próxima. Narrador em primeira pessoa (o Claude), frases curtíssimas, legenda escrita à mão letra por letra. Uma bolinha verde-menta, a faísca, é o Claude em todas as cenas. Desenho 2D em código (Canvas JS) sobre o `nucleo/2d/`.

Motor criado em 20/10/2026 a partir da referência abaixo; estilo aprovado pelo Macks no 001 (20/10/2026). Sem skill ainda.

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `000-teste` | teste do motor (20/10/2026): 4 atos, 20 s, 9:16 | nenhum (só teste) |
| `001-a-lista` | **entregue em 9:16 e 16:9** (20/10/2026, 9:16 aprovado): 12 atos, 52,4 s, com trilha e efeitos, em `prontos/rabisco/` (`-16x9`) | Macks ver o 16:9; 1:1 |

## Referência

Vídeo "claude-sonnet-5-5-drew-every-frame-of-this-animation-in-java" (`referencia/original.mp4`). 9:16 (1068×1900), 24 fps, 47,5 s. Guardados: `referencia/frames/` (os 1141 quadros em PNG, 1,3 GB), `referencia/audio.wav`, `referencia/folha.png` (1 quadro por segundo) e `referencia/espectro.png`.

**História.** Uma IA conta a moça que a treina: "Li todos os livros sobre manhãs. Nunca tive uma. Ela tem uma todo dia. Ela odeia." O dia dela (café, reunião em pé, treino), às 3 da manhã algo dá errado, ela fica, sussurra "vamos" para um gráfico ("acho que o gráfico sou eu"), a curva desce devagar e depois de uma vez, amanhece, a cidade inteira acende pedidos ("um milhão de pessoas vão me perguntar coisas; vou ser gentil, ela me ensinou"), ela dorme no teclado: "Pode deixar. A manhã é minha." Termina na pilha de livros do começo (fecha em loop).

**Visual.**
- Papel liso quase branco (`#F0F0E4`), sem mancha nem vinheta.
- Contorno de caneta preta (`#181818`), ~8 px a 1068 de largura, pontas redondas, borda levemente irregular.
- Preenchimento de giz de cera em diagonal, com o papel aparecendo nas falhas, vazando um pouco do contorno. Paleta: amarelo `#E4B43C`, vermelho `#CC4830`, rosa `#D88490`, azul `#3C549C`, verde `#54A860`, bege `#C09C78`, celeste `#C0D8E4`; mostradores e etiquetas em branco opaco.
- Noite: azul-marinho (`#0C1854`/`#000030`) em faixas horizontais de giz; o contorno vira giz claro.
- Faísca: bolinha verde-menta de borda áspera; quando "acende", ganha 8 raios.
- Linhas-guia azul-claras de esboço aparecem antes do desenho e somem.
- Composição: um objeto central sobre uma linha de chão com hachura curta embaixo; legenda abaixo, a ~78% da altura.

**Movimento.**
- Animado em dois: desenho novo a cada 2 quadros (12 por segundo), e o traço inteiro ferve a cada desenho (medido: diferença entre quadros alterna ~14,5 e ~0).
- Transição dentro do papel: o objeto se apaga (giz some, contorno se destraça) e o próximo se traça no mesmo lugar, às vezes transformando um no outro (o sol vira o sino do despertador).
- Troca de fundo (papel ↔ noite ↔ céu): faixas largas e onduladas de giz entram linha a linha, de cima para baixo.
- Câmera quase parada; a cidade do amanhecer é um painel largo que a câmera percorre.
- Legenda: letra de mão, minúscula, escrita letra por letra no ritmo da fala, apagada da esquerda para a direita antes da próxima.

**Áudio.**
- Voz única em primeira pessoa, suave, jovem, não binária puxando para o feminino (F0 mediana ~188 Hz, de 87 a 298), frases de 1 a 3 s, sempre uma ideia só.
- Trilha contínua por baixo (pad grave e acordes longos que crescem a partir do "so I try", ~30 s), pausa total curta em ~29,6 s antes da virada, acorde grave no final.
- Efeitos: despertador tocando (harmônicos de 2 a 8 kHz em 4,9 a 7 s), estalos e riscos de lápis nos desenhos. Mixagem forte (picos acima de 0 dBFS no original; nós não clipamos).

## Decisões

- **Nome:** Rabisco (confirmado pelo Macks em 20/10/2026).
- **Formatos:** 9:16 (o da referência), 1:1 e 16:9. Palco de 1000×1000 unidades = `min(W, 0,72·H)`, centrado a 42% da altura; a legenda fica embaixo do palco. **No largo (`LARGO`, 16:9)** o palco cresce para 0,86·H e a legenda vai para a faixa de baixo (87% da altura), porque com o palco do vertical o desenho ocupava só 40% da largura (20/10/2026). As cenas usam a largura quando `LARGO`: chão atravessando (`CH()`), três pilhas em vez de uma, balões abertos para os lados, caneca ao lado da lista; o zoom da lista desce menos (`ZOOM_Y()`) para a mesa não chegar na legenda. `VIS` diz quanto mais aparece em cada formato (o chão e o fundo se estendem até lá). Testado nos três.
- **Voz:** `claude` do `nucleo/vozes.json` (River clonada), a mesma família da voz da referência. Provisória até ouvir o teste.
- **Som (`som.py`, só deste estilo):** trilha que segue o roteiro, e não um loop. Cada ato diz `"musica"`: `leve`, `noite`, `silencio` (só o tom de sala, nunca zero), `cresce` ou `fim`. Os efeitos saem do próprio desenho: o `cena.js` exporta `eventos()` (cada traço, cada borracha, cada troca de fundo, cada faísca que acende, e `som` por objeto, como `telefone`), o `capturar.mjs` grava `eventos.json`, e o `som.py` sintetiza risco de caneta, giz, borracha, pincelada, plim e telefone. Os volumes se calibram pela voz: trilha ~15 dB e efeitos ~14 dB abaixo da fala (no 001: voz −19, trilha −29, efeitos −26 LUFS). Entrega também `trilha.wav` e `efeitos.wav` separados.
- **Voz:** qualquer uma por enquanto (Macks, 20/10/2026).
- **Fonte da legenda:** Patrick Hand (Google Fonts, OFL), em `motor/fontes/`. A mais parecida com a letra da referência entre as testadas (Gochi Hand, Itim, Short Stack, Noteworthy).

## Motor (`motor/`)

- `cena.js` (o motor): giz (`giz`, ladrilho por cor), noite (`fazerNoite`), amanhecer (`fazerCeu`, fundo `ceu`), troca de fundo (`pinceladas`), objeto que se desenha e se apaga (`desenhar`), faísca, legenda, câmera e planos.
- `cenas.js`: peças (`rr`, `arco`, `chao`, `livro`, `caneca`, `relogio`...) e as cenas (`CENAS[nome](rnd, ato)`). Cena nova = função nova aqui.
- **Profundidade de campo:** cada objeto tem `z` (1 = assunto, menor = perto, maior = longe). Cada plano é desenhado numa tela própria e desfocado por `dof · |1/z − 1/foco|`; a câmera (`cam`: quadros-chave `[t, x, y, zoom]`) move os planos com paralaxe (o perto anda mais). `foco: [[t, z], ...]` corre o foco (o despertador do teste começa na caneca de perto e passa para o relógio).
- **Tempo do objeto:** `em` (começa a traçar), `dura`, `ate` (começa a apagar; padrão: 0,5 s antes do fim do ato). Contorno nos primeiros 60%, giz a partir de 40%. `guia`, `vibra` (tremor em dois) e `move` (quadros-chave `[t, dx, dy]`).
- **Rodar:** `./fazer.sh episodios/<slug> [--ate N] [--formato 9:16|1:1|16:9]` (narração, desenho, som, mixagem, entrega). Com `--ate N` é teste e não entrega; `--ate` com o total de atos roda o episódio inteiro sem entregar. ~1,1 s de render por segundo de vídeo em 9:16. Quadros soltos: `node ../../nucleo/2d/capturar.mjs motor/pagina.html episodios/<slug> --still t1,t2 pasta`.

## Estrutura do roteiro (a do 001)

- **Frases curtíssimas, uma por ato**, de 2 a 9 palavras, em primeira pessoa (o Claude). Pares que se viram do avesso ("Ela tem uma lista. / A lista tem ela.").
- **Arco:** dia em papel → noite (pinceladas) → um ato de quase silêncio → amanhecer (pinceladas) com a música crescendo → fecha em loop na primeira imagem.
- **A faísca** só aparece quando o Claude entra na história (no 001, no notebook) e acende nas frases dele.
- **Gente quase não aparece:** os objetos dela contam a história (lista, caneca, telefone, notebook).
- **Continuidade:** atos seguidos na mesma cena repetem o objeto com `em: -10` (já desenhado) e `ate: 99` (não apaga), e a câmera emenda de onde parou.
- **Legenda:** nada desenhado pode passar por baixo dela (nem com zoom). Coisas perto desfocadas ficam na lateral, metade fora do quadro.
- `roteiro.json`: `estilo`, `formato`, `fps: 24`, `voz`, `atos` com `cena`, `dura`, `musica`, `direcao_cena` (o storyboard em palavras) e `narracao` (`texto`, `direcao`, `em`; nas trocas de fundo, `em` ≥ 1,3 para a fala entrar depois das pinceladas).

## A fazer

- Morfose de um objeto no outro (sol → sino); hoje é apaga-e-desenha.
- Painel largo com a câmera percorrendo (a cidade do amanhecer).
- Skill de roteiro.
