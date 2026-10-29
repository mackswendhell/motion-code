# O que Maria guardava no coração — Lucas 1–2

**Filme completo:** `filme/lucas-1-2-16x9.mp4`.

19min42s · 16:9 · 1920×1080 · 24 fps · áudio estéreo · 40 capítulos.

O conto contempla Lucas 1–2, do prólogo a Teófilo até o crescimento de Jesus após o encontro no Templo aos doze anos. As falas bíblicas e os três cânticos preservam o texto enviado; a narração foi adaptada conforme a escolha do Macks. A animação, as vozes e a música foram produzidas a partir da linguagem da Prancha Viva, com adaptações exclusivas deste episódio.

## Arquivos de uso

- `filme/lucas-1-2-16x9.mp4`: vídeo completo, com capítulos para navegar pelas 40 pranchas.
- `filme/pranchas-do-filme.jpg`: visão geral das 40 composições finais.
- `storyboard.md`: texto e direção completos.
- `passagem-fonte.txt`: anexo enviado, preservado.
- `filme/audio/vozes.wav`: narração e diálogos, incluindo o coro.
- `filme/audio/musica.wav`: trilha instrumental.
- `filme/audio/ambiente.wav`: ambiente e efeitos discretos.
- `filme/audio/mixagem.wav`: master de áudio usado no vídeo.

As faixas começam no mesmo ponto e têm a mesma duração. O master inclui ajuste de loudness; uma nova montagem das faixas pode precisar de novo ajuste de volume. A amostra de 2min09s continua preservada em `amostra/`.

## Conferência

O MP4 inteiro foi decodificado sem erros. Os 40 capítulos e a resolução foram conferidos. Áudio final: −15,79 LUFS e pico real de −1,52 dBTP. A mixagem WAV não tem buracos de silêncio digital de 50 ms. Foram revisados 120 quadros das cenas; 52 quadros adicionais foram extraídos do próprio MP4, cobrindo capítulos, emendas e encerramento. Relatórios em `filme/verificacao-final.json`, `filme/revisao/` e `filme/evidencias/`.

A transcrição automática foi usada como conferência auxiliar, com novas tomadas para dicções sinalizadas. Os relatórios preservam as leituras do transcritor, inclusive ambiguidades de palavras ligadas e formas bíblicas pouco usuais; não são uma transcrição editorial do filme. O texto enviado às vozes está registrado na linha do tempo, com ajustes de pronúncia separados em `pronuncia.json`.

## Preservação do projeto

Os motores das raízes dos estilos, o núcleo, os registros comuns de vozes e os episódios anteriores permanecem intactos. O manifesto `base-compartilhada.sha256.json` foi conferido antes e depois da produção. Tudo novo está nesta pasta de episódio.

## Reproduzir, caso necessário

Rodar da pasta deste episódio:

```sh
python3 produzir.py verificar
python3 produzir.py vozes --completo
python3 coro.py
python3 produzir.py som --completo
node renderizar.mjs --completo
python3 finalizar.py verificar
```

O cache reaproveita as tomadas e o render reaproveita as partes compatíveis. Alterar voz ou direção pode gerar novas chamadas ao Fish/OpenRouter já configurado no estúdio. O Chrome headless renderiza os arquivos locais sem abrir painel ou URL. Não usar o fazer.sh compartilhado para este filme.
