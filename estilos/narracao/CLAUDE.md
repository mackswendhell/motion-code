# Narração

Narração dos vídeos do canal do Macks (tutoriais de Claude Code) na voz dele, clonada no Fish. Entra um roteiro em Markdown, sai a narração inteira e uma faixa por parágrafo para montar no Premiere. Sem imagem: o vídeo é gravado e editado por ele. Do estúdio usa só o `nucleo/` (`voz.py`, voz `macks` no `vozes.json`). Comandos rodam de dentro desta pasta.

Pedido do Macks em 20/10/2026 ("formato de teste").

## Estado dos episódios

| Episódio | Etapa | Próximo passo |
|---|---|---|
| `001-ponytail-5` | narração inteira entregue (20/10/2026): 33 parágrafos, 11,9 min, em `prontos/narracao/`; pausas e pronúncia de token/cache corrigidas e aprovadas | Macks ouvir tutorial e conclusão |

## Rodar

`python3 narrar.py episodios/<slug> [--ate N]`. O `roteiro.md` do episódio tem seções `## ...` e parágrafos separados por linha em branco. Cache por parágrafo (`audio/NN_<hash>.wav`): mexer num parágrafo só regera ele; para trocar uma tomada, apagar o arquivo dela. Saída: `narracao.wav` e `faixas/NN-secao.wav`.

**Pausas** (pedido do Macks, 20/10/2026: estavam grandes): `enxugar()` corta o silêncio das pontas de cada parágrafo e encurta para 0,28 s toda pausa interna acima de 0,35 s, como os cortes da edição dele (no vídeo, nenhuma pausa passa de 0,6 s; mediana 0,24). Entre parágrafos 0,25 s, entre seções 0,35 s. Só mexe no silêncio, nunca na voz.

**Nada de silêncio digital** (pedido do Macks, 20/10/2026: no editor apareciam buracos, linha reta, em toda emenda de parágrafo). O espaço entre parágrafos e seções e qualquer trecho de zero que o Fish deixe são preenchidos com o fundo baixo das pausas do próprio Fish (`tom_de_sala`: janela típica entre −62 e −38 dB do pico; sem pausa aproveitável, chiado rosado a −52 dB). Para conferir, desenhar a forma de onda com os sons baixos realçados: `ffmpeg -ss 62 -t 10 -i narracao.wav -filter_complex "compand=attacks=0:points=-90/-90|-60/-30|-30/-12|0/0,showwavespic=s=1400x300" -frames:v 1 onda.png`.

**Conferir antes de entregar** (sempre, depois de gerar): `python3 conferir.py episodios/<slug>` passa o transcritor em cada parágrafo com termo difícil (`TERMOS`: cache, token), refaz a tomada de quem errou e repete até 3 rodadas. Depois, conferir os buracos na forma de onda (ver "Regras de áudio" no `CLAUDE.md` da raiz). Ouvir só um exemplo não basta: foi assim que o "ket" passou.

## Voz (aprovada em 20/10/2026)

- **Amostra do clone**: os primeiros 47 s do vídeo do OpenClaw (`nucleo/referencias/macks-abertura.wav`, 24 kHz mono, com o texto em `macks-abertura.txt`). A amostra curta (22 s, 44,1 kHz) dá a mesma voz sem direção (versão B); a longa com direção ganhou.
- **Direção**: abertura "voz grave e assentada, convicto" (a aprovada). Tutorial e conclusão usam a mesma base, ajustada ao que foi medido (`DIRECAO` no `narrar.py`): tutorial "explicando solto, como numa demonstração", conclusão "calmo, fechando as frases para baixo". Essas duas ainda não foram aprovadas de ouvido.
- **Saída em PCM** (`response_format: "pcm"`, 16 bits, 44,1 kHz mono). O OpenRouter só aceita `mp3` ou `pcm`; o mp3 de 128 kbps piora a voz clonada.
- **Pronúncia**: o TTS lê a grafia falada (`FALA` no `narrar.py`: `/usage` → "barra iúsage", `CLAUDE.md` → "Claude ponto M D", `Opus 5.5` → "Opus cinco ponto cinco"...). "Claude Code" escrito normal saiu certo. Aprovados de ouvido (20/10/2026): token → "touken", tokens → "toukens", cache → "cash" (é como se fala em inglês; "quéche", "quéxi", "quéchi" e "kéchi" saíam "cat", "ket" ou "quete"). Palavra em inglês: mandar a grafia inglesa que soa igual, não inventar grafia aportuguesada. Depois de gerar, conferir cada ocorrência com o transcritor e refazer a tomada que errar.

## O que não fazer (testado em 20/10/2026)

- **Emendar frases com vírgula onde a ideia fecha.** "os números se sustentam, só que..." fez a voz subir no fim ("sustentão"). Manter o ponto final do roteiro.
- **Mexer em altura ou velocidade depois** (`atempo`, `asetrate`): distorce a voz clonada (versões B3 e B6). Mudar só volume é seguro.
- **Converter a amostra do clone para 24 kHz sem precisar**: suspeita na distorção da B2/B3; a aprovada é 24 kHz, então não trocar sem testar de ouvido.
- **Direção longa**: "fala natural de conversa, começa firme e termina suave" piorou a queda no fim (−6,4 st). Direção curta funciona melhor.

## A fala do Macks (medida no vídeo do OpenClaw, 18 min, SRT dele + análise acústica)

| | Abertura | Tutorial | Conclusão |
|---|---|---|---|
| Velocidade | 192 pal/min (o gancho dos primeiros 20 s, 177) | 192 (165 a 179 nas demonstrações) | 184 |
| Altura | 137 a 144 Hz, faixa 9,7 st | 134 Hz, 9,1 st | 121 a 124 Hz, 5 a 7,6 st |
| Energia | −21,8 dB | −22,9 dB | −24,3 dB |
| Frase | 2,6 s, 10 palavras | 2,5 s, 10 palavras | 1,7 s, 8 palavras |
| Fim de frase | 53% sobe (emenda na próxima) | 42% sobe, 22% reto | 45% desce (veredito) |
| Respira | a cada 22 palavras | a cada 21 | a cada 32 |

- **Dentro da frase**: começa forte (+1,3 a +2,0 dB e +1,7 st acima da média da frase), o meio fica estável e o fim cai de leve (−0,9 dB, −2,2 st). Depois de respirar, o ataque é mais forte (+2,3 a +2,7 dB). Fala mais rápido no começo da frase (240 pal/min) e alonga o fim (222).
- **Pausas** de ~0,24 s (o vídeo editado corta os silêncios; nenhuma passa de 0,6 s).
- **Ênfase** na promessa e no número: "deixar um agente", "a maneira mais simples", "50 minutos", "eu vou mostrar tudo".
- **Bordões** (por 1000 palavras): "aqui" 31, "esse" 9, "muito" 7, "também" 6, "agora" 6, "você vai" 4, "a gente" 3, "tá" 3, "então" 3, "inclusive" 3, "ou seja" 2.
- **O clone contra ele**: o Fish sai 2 a 3 st mais agudo (150 a 160 Hz) e derruba mais o fim da frase (−4 a −6 st) em todas as tomadas. A direção "voz grave" puxa a altura para baixo sem distorcer.
- Ferramentas da análise (no scratchpad da sessão de 20/10/2026, refazer se precisar): pausas, respirações, f0 e energia em quadros de 20 ms; frases como fala entre silêncios de 0,16 s; a forma da frase em 5 partes.
