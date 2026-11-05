---
description: Cria um vídeo a partir de um estilo da galeria. Uso: /estilo <id> "tema"
argument-hint: <id-do-estilo> "tema do vídeo"
---

Pedido: $ARGUMENTS

O primeiro termo é o `id` de uma semente da galeria (`nucleo/galeria/sementes/*.js`); o resto é o tema. Siga nesta ordem:

1. **Achar a semente.** `grep -n 'id: "<id>"' nucleo/galeria/sementes/*.js` e leia o bloco dela: `receita` (a direção), `higgsfield` (se houver), `formato` e a `cena` (o loop de referência, com paleta e movimento). Se o id não existir, liste os 5 mais parecidos e pare.
2. **Começo de sessão do estúdio.** Siga o `CLAUDE.md` da raiz: conferir a chave de voz no `.env` (sem imprimir). Se faltar o tema ou o formato, pergunte numa única AskUserQuestion (formato: o da semente primeiro, depois os outros dois).
3. **Para onde vai.**
   - Semente com `estilo:` (ex.: `atlas`, `kraft`, `laboratorio`, `vitrine-web`, `ficha-tecnica`, `lofi`): é um estilo completo. Entre em `estilos/<estilo>/`, leia o `CLAUDE.md` de lá e faça o próximo episódio pelo fluxo dele.
   - Sementes `shorts-*`: são os layouts do projeto Shorts (`~/dev/Shorts`, `referencias/estilos.md`). Diga isso e pergunte se a pessoa quer fazer lá (com a gravação dela) ou aqui, só com a parte em código.
   - Qualquer outra: **promova a semente a estilo** na primeira vez, seguindo "Estilo novo, passo a passo" do `CLAUDE.md` da raiz:
     - `estilos/<id>/motor/pagina.html` igual ao de `estilos/atlas/motor/pagina.html` (base.js + kit.js + atos.js + cenas.js);
     - `estilos/<id>/motor/cenas.js` com 2 a 4 cenas parametrizadas por `ato.tela`, partindo da `cena` da semente (mesma paleta, ritmo e peças; textos e números saem do roteiro, nunca fixos no código); contrato em `nucleo/galeria/atos.js`;
     - `estilos/<id>/fazer.sh` de uma linha, como o de `estilos/atlas/fazer.sh` (trilha `contos`, `noite`, `vila` ou `nenhuma`);
     - `estilos/<id>/CLAUDE.md` curto: o que é, a receita, decisões, cenas e o estado dos episódios;
     - uma linha na tabela "Estilos" do `CLAUDE.md` da raiz.
4. **Roteiro.** Escreva `episodios/NNN-<slug>/roteiro.json` (formato de `estilos/atlas/episodios/000-amostra/roteiro.json`): atos com `cena`, `dura`, `narracao` (`texto`, `em`, `direcao` opcional) e `tela` com os dados da cena. Frases faladas em português do Brasil, curtas, sem travessão. Passe pelo humanizer antes de gravar a voz.
5. **Higgsfield (opcional).** Se a semente tiver o bloco `higgsfield` e a pessoa quiser, as peças pintadas entram como `tela.imagem`/`tela.imagens` (caminhos relativos à pasta do estilo), seguindo as "Regras da soma" de `estilos/higgsfield/CLAUDE.md`: a IA pinta peças, nunca o quadro pronto; uma referência de estilo para todas; código por cima. Diga o custo em créditos e espere o ok antes de gerar.
6. **Amostra antes do vídeo inteiro.** `./fazer.sh episodios/<slug> --ate 2` (não entrega), confira quadros com `node ../../nucleo/2d/capturar.mjs motor/pagina.html episodios/<slug> --still t1,t2,... <pasta>` e mostre à pessoa. Só depois do ok, o vídeo inteiro (`./fazer.sh episodios/<slug>`), que entrega em `prontos/<estilo>/<slug>/`.
7. **Áudio**: as regras de áudio do `CLAUDE.md` da raiz valem (sem silêncio digital; conferir a forma de onda antes de entregar).

Responda curto: o que foi feito, onde está o vídeo e o que precisa de decisão.
