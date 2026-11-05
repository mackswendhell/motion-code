---
description: Abre a galeria de estilos do Motion Code (100 loops de 5 s, com o comando de cada um para copiar)
---

Abra a galeria de estilos do estúdio.

1. Veja se o servidor do painel Motion já responde: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4317/estilos`.
2. Se não responder, suba o servidor. No Claude Desktop, `preview_start` com o nome `motion` (`.claude/launch.json`). Fora dele, em segundo plano, da raiz do projeto: `node nucleo/2d/estudio/servidor.mjs`.
3. Abra `http://localhost:4317/estilos`: no Claude Desktop, no browser pane; no terminal ou no VS Code, com `open http://localhost:4317/estilos` (se o sandbox bloquear o `open`, mostre o link para a pessoa clicar).
4. Responda em uma linha com o link e diga que basta clicar em **Copiar** no cartão e colar o comando aqui, trocando "seu tema aqui" pelo tema do vídeo.

A galeria vive em `nucleo/galeria/` (cada grupo é um arquivo em `sementes/`). Não precisa ler nada além disso para abrir.
