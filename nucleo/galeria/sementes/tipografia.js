// Grupo Tipografia e aberturas: títulos, vinhetas, cartelas e chamadas.

semente({
  id: "titulo-cinetico", nome: "Título cinético", grupo: "tipografia", formato: "16:9",
  resumo: "Palavras batem na tela uma a uma com peso, giro e blocos de cor por trás. Abertura que dá soco.",
  receita: `Abertura 16:9 de tipografia cinética (3 a 6 s).
Estrutura: a frase-título entra palavra por palavra, cada uma num tamanho e posição diferentes, compondo um bloco tipográfico; atrás de algumas palavras, retângulos de cor chapada entram como faixas.
Visual: fundo creme ou tinta, condensada pesada em caixa alta + uma palavra em serifa itálica para contraste, 2 cores no máximo.
Movimento: cada palavra entra com escala 1.6→1 e leve giro, 120 ms; tremor de 2 px na batida; ao final o bloco inteiro respira e sai num corte.
Use para: abertura de vídeo, chamada de lançamento, manifesto.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.tinta, { grao: 0.22, vinheta: 0.35 });
    const pals = [["PARE", 620, 400, 240, CLAUDE.papel, GROSSA, 0.2, ""], ["de", 1040, 370, 110, CLAUDE.terracota, SERIF, 0.5, "italic 400"], ["EDITAR", 880, 630, 300, CLAUDE.papel, GROSSA, 0.8, ""], ["no braço.", 1240, 870, 140, CLAUDE.terracota, SERIF, 1.2, "italic 500"]];
    const sai2 = fase(t, 4.5, 4.7);
    c.fillStyle = CLAUDE.terracota; c.fillRect(0, 540, W * sai(fase(t, 0.75, 1.0)) * (1 - sai2), 180);
    pals.forEach(([s, x, y, tam, cor, f, t0, peso]) => {
      if (t < t0) return; const k = fase(t, t0, t0 + 0.14), sc = lerp(1.6, 1, k) * (1 + 0.015 * ciclo(t, 2)), tr = t - t0 < 0.2 ? 3 * Math.sin(t * 80) : 0;
      c.save(); c.translate(x + tr, y); c.rotate(lerp(-0.15, 0, k)); c.scale(sc, sc);
      texto(c, s, 0, 0, { tam, fonte: f, peso: peso || 900, cor, alpha: k * (1 - sai2) }); c.restore();
    });
  },
});

semente({
  id: "cartela-documentario", nome: "Cartela de documentário", grupo: "tipografia", formato: "16:9",
  resumo: "Título em serifa fina, linhas que se desenham, sobretítulo espaçado e data. Elegante e silencioso.",
  receita: `Cartela 16:9 de abertura no tom de documentário.
Estrutura: sobretítulo pequeno em caixa alta muito espaçada; título em serifa clássica grande; duas linhas finas se desenham do centro para fora acima e abaixo; local e data embaixo.
Visual: fundo quase preto com grão de filme e vinheta, texto creme, linhas em dourado envelhecido.
Movimento: tudo lento: fade com desfoque (blur 8→0), letras com espaçamento que fecha devagar, linhas em 1,2 s.
Use para: documentário, história real, vídeo sério, capítulo.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#0f0e0c", { grao: 0.35, vinheta: 0.6 });
    const k = fase(t, 0.2, 1.8), sai2 = fase(t, 4.3, 4.95), v = 1 - sai2;
    c.save(); c.globalAlpha = v; c.filter = `blur(${(1 - k) * 8}px)`;
    texto(c, "UMA HISTÓRIA SOBRE", W / 2, 380, { tam: 28, peso: 500, cor: "#b9a88a", espaco: 18 - 8 * k, alpha: k });
    texto(c, "O Silêncio", W / 2, 520, { tam: 150, fonte: SERIF, peso: 400, cor: "#efe8da", espaco: 20 - 18 * k, alpha: k });
    texto(c, "entre as palavras", W / 2, 640, { tam: 60, fonte: SERIF, peso: "italic 400", cor: "#d6ccb8", alpha: fase(t, 1.0, 2.2) });
    c.filter = "none";
    const l = sai(fase(t, 1.2, 2.4)) * 400;
    c.strokeStyle = "#a88f5c"; c.lineWidth = 2; [300, 720].forEach((y) => { c.beginPath(); c.moveTo(W / 2 - l, y); c.lineTo(W / 2 + l, y); c.stroke(); });
    texto(c, "Goiânia · 2026", W / 2, 790, { tam: 28, peso: 400, cor: "#8d826c", espaco: 6, alpha: fase(t, 2.2, 2.9) });
    c.restore();
  },
});

semente({
  id: "lower-third", nome: "Nome na tela", grupo: "tipografia", formato: "16:9",
  resumo: "Faixa de nome e cargo que desliza no canto inferior, com barra de cor e um ícone. Para entrevistas e podcasts.",
  receita: `Elemento 16:9 de identificação (lower third) para entrevista, podcast ou depoimento.
Estrutura: no terço inferior esquerdo, uma barra de cor entra primeiro, depois a caixa com o nome (grande) e o cargo/arroba (pequeno) revelados por máscara; fica 3 s; sai na ordem inversa.
Visual: caixa creme com sombra, barra terracota vertical, nome em sans pesada, cargo em sans regular; por trás, a gravação (aqui, uma cena desfocada).
Movimento: barra cresce na vertical em 150 ms, caixa abre da esquerda em 300 ms com ease-out, texto sobe 10 px.
Use para: qualquer vídeo com pessoa falando.`,
  cena(c, t, W, H) {
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#5d6b6e"); g.addColorStop(1, "#c9a882"); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); c.filter = "blur(30px)"; c.fillStyle = "rgba(255,230,200,.5)"; c.beginPath(); c.arc(1400, 300, 200, 0, 7); c.fill();
    c.fillStyle = "#4a3c30"; c.beginPath(); c.ellipse(960, 520, 170, 210, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(960, 1100, 440, 380, 0, 0, 7); c.fill(); c.restore();
    const ab = fase(t, 0.5, 0.65) * (1 - fase(t, 4.3, 4.45)), cx = sai(fase(t, 0.6, 0.95)) * (1 - fase(t, 4.0, 4.3)), x = 120, y = 790;
    c.fillStyle = CLAUDE.terracota; c.fillRect(x, y + 70 - 70 * ab, 14, 140 * ab);
    c.save(); c.beginPath(); c.rect(x + 14, y, 640 * cx, 140); c.clip();
    c.fillStyle = "rgba(250,249,245,.96)"; c.fillRect(x + 14, y, 640, 140);
    const sobe = 10 * (1 - fase(t, 0.8, 1.1));
    texto(c, "Mariana Costa", x + 50, y + 55 + sobe, { tam: 50, peso: 800, alinha: "left" });
    texto(c, "editora de vídeo · @mari.edita", x + 50, y + 105 + sobe, { tam: 28, peso: 400, alinha: "left", cor: "#6f6a5c" });
    c.restore();
  },
});

semente({
  id: "letreiro-neon", nome: "Letreiro neon", grupo: "tipografia", formato: "1:1",
  resumo: "Letreiro de neon numa parede de tijolo escura, acende piscando, uma letra falha. Noturno e charmoso.",
  receita: `Cartela 1:1 de letreiro neon.
Estrutura: uma palavra ou frase curta em tubo de neon (letra cursiva ou monoline) sobre parede escura de tijolos; acende com piscadas irregulares; uma letra fica falhando de vez em quando; um ícone neon simples ao lado.
Visual: brilho em camadas (núcleo branco, halo colorido, reflexo difuso na parede), cores rosa/âmbar, suportes metálicos pequenos.
Movimento: liga piscando nos primeiros 0,8 s, depois zumbido sutil (variação de 3% no brilho), falha rápida a cada ciclo.
Use para: abertura noturna, bar, música, lofi, eventos.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#1b1416", { grao: 0.25, vinheta: 0.55 });
    c.strokeStyle = "rgba(255,255,255,.04)"; c.lineWidth = 3;
    for (let y = 0; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); for (let x = (y / 60) % 2 ? 0 : 60; x < W; x += 120) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 60); c.stroke(); } }
    const liga = [0.1, 0.18, 0.3, 0.36, 0.6].filter((x) => t > x).length % 2 === 1 || t > 0.8, zum = 0.97 + 0.03 * Math.sin(t * 50);
    const falha = (Math.floor(t * 10) % 23 === 7) ? 0.15 : 1;
    const neon = (s, x, y, tam, cor, f = 1) => { const a = liga ? zum * f : 0.06;
      c.save(); c.font = `400 ${tam}px Snell Roundhand, Brush Script MT, ${MAO}`; c.textAlign = "center"; c.textBaseline = "middle";
      c.globalAlpha = a; c.shadowColor = cor; c.shadowBlur = 60; c.fillStyle = cor; c.fillText(s, x, y); c.shadowBlur = 20; c.fillText(s, x, y);
      c.shadowBlur = 0; c.globalAlpha = a * 0.9; c.fillStyle = "#fff4f6"; c.fillText(s, x, y); c.restore(); };
    if (liga) { const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 600); g.addColorStop(0, "rgba(255,90,150,.18)"); g.addColorStop(1, "rgba(255,90,150,0)"); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    neon("abert", W / 2 - 60, H / 2 - 40, 210, "#ff5f9e");
    neon("o", W / 2 + 230, H / 2 - 40, 210, "#ff5f9e", falha);
    neon("até tarde", W / 2, H / 2 + 150, 110, "#ffb347");
  },
});

semente({
  id: "maquina-escrever", nome: "Máquina de escrever", grupo: "tipografia", formato: "16:9",
  resumo: "Folha de papel com o texto batido letra a letra, a folha sobe a cada linha e o sino toca no fim.",
  receita: `Vídeo 16:9 de texto datilografado.
Estrutura: uma folha de papel ocupa o centro; o texto é batido letra a letra em fonte de máquina (com leve variação de tinta e alinhamento por letra); a cada linha a folha sobe; no fim, uma palavra é batida em vermelho.
Visual: papel creme com textura, sombra de mesa escura, letras com falhas de tinta.
Movimento: cada letra aparece seca (sem fade) com micro tremor da folha; o carro volta no fim da linha.
Som: clique por letra, sino no fim de linha (sintetizados no código).
Use para: cartas, histórias pessoais, citações, notícias antigas.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#2a241f", { grao: 0.3, vinheta: 0.6 });
    const linhas = ["Querido leitor,", "este vídeo foi escrito", "uma letra de cada vez."], vel = 14;
    let resto = Math.max(0, t - 0.2) * vel, lin = 0;
    const vis = linhas.map((l) => { const n = Math.min(l.length, Math.floor(resto)); resto -= l.length + 3; return n; });
    lin = vis.filter((n, i) => n > 0).length - 1;
    const sobe = lin * 90, tr = Math.floor(t * vel) % 2 ? 1 : 0;
    c.save(); c.translate(0, -sobe * 0.6 + tr);
    c.shadowColor = "rgba(0,0,0,.5)"; c.shadowBlur = 50; c.fillStyle = "#f3ead6"; c.fillRect(460, 140, 1000, 1200); c.shadowColor = "transparent";
    c.save(); c.globalAlpha = 0.12; c.globalCompositeOperation = "multiply"; c.fillStyle = padraoGrao(c); c.fillRect(460, 140, 1000, 1200); c.restore();
    linhas.forEach((l, i) => { for (let j = 0; j < vis[i]; j++) { const r = rng(i * 100 + j); c.globalAlpha = 0.75 + r() * 0.25;
      texto(c, l[j], 560 + j * 34, 340 + i * 90 + (r() - 0.5) * 3, { tam: 50, fonte: "American Typewriter, Courier New, monospace", peso: 400, alinha: "left", cor: i === 2 && j > 14 ? "#a8322a" : "#24211d" }); } });
    c.globalAlpha = 1; c.restore();
    c.fillStyle = "#171411"; c.fillRect(0, H - 180, W, 180); c.fillStyle = "#3a332c"; rr(c, 300, H - 200, W - 600, 60, 20); c.fill();
  },
});

semente({
  id: "palavra-roleta", nome: "Palavra que gira", grupo: "tipografia", formato: "16:9",
  resumo: "Frase fixa e uma palavra que troca como roleta: vídeos, cursos, anúncios... Mostra a amplitude de algo.",
  receita: `Cartela 16:9 com palavra rotativa ("Faça [vídeos/cursos/anúncios] com IA").
Estrutura: frase fixa à esquerda; a palavra variável fica numa janela que gira verticalmente como roleta, cada palavra em uma cor; a largura da janela se ajusta à palavra.
Visual: fundo claro, frase em tinta, palavras variáveis em cores da paleta, sublinhado que estica junto.
Movimento: troca a cada 0,8 s com rolagem e quique; a última palavra fica e ganha destaque.
Use para: abertura, proposta de valor, "isso serve para...".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f5f2ea", { grao: 0.1, vinheta: 0.15 });
    const pal = [["vídeos", CLAUDE.terracota], ["cursos", CLAUDE.oliva], ["anúncios", CLAUDE.ceu], ["podcasts", "#8e7cc3"], ["vídeos", CLAUDE.terracota]];
    const passo = 1.0, u = t / passo, i = Math.min(4, Math.floor(u)), f = i < 4 ? volta(clamp((u - i - 0.7) / 0.3)) : 0;
    texto(c, "Faça", 380, H / 2, { tam: 130, fonte: SERIF, peso: 500, alinha: "left" });
    texto(c, "com IA.", 1250, H / 2, { tam: 130, fonte: SERIF, peso: 500, alinha: "left" });
    c.save(); c.beginPath(); c.rect(680, H / 2 - 100, 560, 200); c.clip();
    [i, i + 1].forEach((j, k) => { if (j > 4) return; const [s, cor] = pal[j]; texto(c, s, 700, H / 2 + (k - f) * 200, { tam: 130, fonte: SERIF, peso: "italic 600", alinha: "left", cor }); });
    c.restore();
    c.font = `italic 600 130px ${SERIF}`; const w = lerp(c.measureText(pal[i][0]).width, c.measureText(pal[Math.min(4, i + 1)][0]).width, f);
    c.fillStyle = mistura(pal[i][1], pal[Math.min(4, i + 1)][1], f); c.fillRect(700, H / 2 + 90, w, 10);
  },
});

semente({
  id: "chamada-final", nome: "Chamada final", grupo: "tipografia", formato: "9:16",
  resumo: "Encerramento com seta desenhada, botão de seguir que pulsa e frase do próximo vídeo. Fecha pedindo ação.",
  receita: `Encerramento 9:16 (ou 16:9) com chamada para ação.
Estrutura: frase curta do próximo passo ("no próximo vídeo: ..."), um botão grande "seguir" genérico que pulsa, e uma seta desenhada à mão apontando para ele; um selo pequeno com o @.
Visual: fundo terracota, botão creme com texto tinta, seta em creme com traço irregular.
Movimento: frase sobe por máscara, seta se desenha em 0,5 s, botão pulsa no ritmo (1,0→1,06), e no clique simulado vira "seguindo ✓".
Use para: final de todo vídeo curto, cartão de fim do YouTube.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.terracota, { grao: 0.25, vinheta: 0.3 });
    const k = sai(fase(t, 0.1, 0.6));
    ["no próximo vídeo:", "como fazer isso", "em 10 minutos"].forEach((s, i) => { c.save(); c.beginPath(); c.rect(0, 420 + i * 130 - 70, W, 140); c.clip();
      texto(c, s, W / 2, 420 + i * 130 + 140 * (1 - sai(fase(t, 0.1 + i * 0.12, 0.6 + i * 0.12))), { tam: i ? 96 : 54, fonte: i ? SERIF : SANS, peso: i ? 600 : 500, cor: CLAUDE.papel }); c.restore(); });
    const seguiu = t > 3.2, p = seguiu ? 1 : 1 + 0.06 * ciclo01(t, 3);
    c.save(); c.translate(W / 2, 1300); c.scale(p, p); c.fillStyle = seguiu ? CLAUDE.oliva : CLAUDE.papel; rr(c, -280, -80, 560, 160, 80); c.fill();
    texto(c, seguiu ? "seguindo ✓" : "seguir", 0, 4, { tam: 70, peso: 800, cor: seguiu ? "#fff" : CLAUDE.tinta }); c.restore();
    c.strokeStyle = CLAUDE.papel; c.lineWidth = 12; c.lineCap = "round";
    tracar(c, borda([[860, 900], [900, 1050], [760, 1180], [600, 1220]], 6, 3, 8).slice(0, 25), fase(t, 0.9, 1.5), false);
    tracar(c, borda([[640, 1170], [590, 1222], [660, 1260]], 3, 4, 4).slice(0, 9), fase(t, 1.45, 1.65), false);
    if (t > 3.0 && t < 3.6) { const o = fase(t, 3.0, 3.6); c.strokeStyle = `rgba(250,249,245,${1 - o})`; c.lineWidth = 8; c.beginPath(); c.arc(W / 2, 1300, 120 + 200 * o, 0, 7); c.stroke(); }
    texto(c, "@motioncode", W / 2, 1520, { tam: 44, peso: 600, cor: "rgba(250,249,245,.8)", alpha: k });
  },
});

semente({
  id: "citacao-marcatexto", nome: "Citação com marca-texto", grupo: "tipografia", formato: "1:1",
  resumo: "Uma frase grande em serifa e o marca-texto amarelo que passa só nas palavras que importam. Post de citação animado.",
  receita: `Cartela 1:1 de citação.
Estrutura: a citação em 3 ou 4 linhas em serifa grande, alinhada à esquerda; o marca-texto passa em uma ou duas expressões-chave (pinta da esquerda para a direita com bordas irregulares); autor embaixo com traço.
Visual: papel creme, texto tinta, marca-texto amarelo translúcido com multiply, aspas grandes discretas no fundo.
Movimento: texto aparece por linha com fade e subida de 8 px; marca-texto em 0,6 s cada; leve zoom contínuo.
Use para: frases, aprendizados, carrossel animado.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f6f0e2", { grao: 0.14, vinheta: 0.2 });
    texto(c, "“", 140, 260, { tam: 500, fonte: SERIF, cor: "rgba(217,119,87,.12)" });
    const z = 1 + 0.03 * (t / DUR); c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
    const lins = ["Você não precisa", "de mais ideias.", "Precisa terminar", "as que já tem."], v = 1 - fase(t, 4.6, 4.95);
    const marca = (x, y, w, k) => { if (k <= 0) return; c.save(); c.globalCompositeOperation = "multiply"; c.fillStyle = "rgba(255,214,60,.75)";
      caminho(c, borda([[x, y - 40], [x + w * k, y - 44], [x + w * k, y + 34], [x, y + 38]], 4, Math.round(x + y), 6)); c.fill(); c.restore(); };
    marca(140, 640, 520, fase(t, 2.0, 2.6));
    lins.forEach((s, i) => { const k = fase(t, 0.2 + i * 0.25, 0.6 + i * 0.25); texto(c, s, 140, 360 + i * 100 + 8 * (1 - k), { tam: 80, fonte: SERIF, peso: 500, alinha: "left", alpha: k * v }); });
    texto(c, "— caderno do estúdio", 140, 860, { tam: 36, peso: 500, alinha: "left", cor: "#8a8577", alpha: fase(t, 1.4, 1.8) * v });
    c.restore();
  },
});

semente({
  id: "letras-recortadas", nome: "Letras recortadas", grupo: "tipografia", formato: "16:9",
  resumo: "Cada letra é um recorte de papel diferente (cor, fonte, inclinação), entram pulando e formam a palavra.",
  receita: `Cartela 16:9 com letras recortadas de revistas (colagem).
Estrutura: a palavra-título montada com cada letra num pedaço de papel diferente: cor de fundo, fonte, tamanho e rotação variados; as letras entram uma a uma com pop e assentam tortas; pedaços de fita em algumas.
Visual: fundo de papel com textura, letras com sombra de recorte, paleta quente com uma letra em preto e branco.
Movimento: pop com sobra e tremido de stop motion (8 poses/s); no fim, o conjunto inteiro dá um pequeno salto.
Use para: abertura divertida, colagem, vídeos de humor, DIY.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#ece2cf", { grao: 0.28, vinheta: 0.3 });
    const pal = "CRIATIVO", pose = Math.floor(t * 8), salto = 30 * (fase(t, 3.2, 3.35) - fase(t, 3.35, 3.6));
    const fontes = [GROSSA, SERIF, FUTURA, MAO, "Didot, serif", MONO], cores = [CLAUDE.terracota, "#fff", CLAUDE.tinta, "#e9b949", CLAUDE.oliva, CLAUDE.ceu];
    [...pal].forEach((L, i) => {
      const r = rng(i + 9), t0 = 0.15 + i * 0.2, k = entra(t, t0, 0.25) * (1 - fase(t, 4.6, 4.95)); if (k <= 0) return;
      const fc = cores[i % cores.length], x = 300 + i * 190, y = H / 2 + (r() - 0.5) * 80 - salto, rot = (r() - 0.5) * 0.35 + (rng(pose + i)() - 0.5) * 0.02;
      c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k);
      recorte(c, -80, -110, 160 + r() * 20, 220, fc, { seed: i + 3, amp: 4, sombra: 10 });
      texto(c, L, 0, 6, { tam: 150 + r() * 40, fonte: fontes[i % fontes.length], peso: 900, cor: fc === CLAUDE.tinta || fc === CLAUDE.terracota || fc === CLAUDE.oliva ? "#fff" : CLAUDE.tinta });
      if (i % 3 === 0) fita(c, 0, -110, 110, 0.1);
      c.restore();
    });
  },
});

semente({
  id: "glitch-titulo", nome: "Título com glitch", grupo: "tipografia", formato: "16:9",
  resumo: "Título com canais de cor separados, fatias deslocadas e chuvisco por um instante. Tecnologia, tensão, erro.",
  receita: `Cartela 16:9 com efeito de falha digital (glitch).
Estrutura: título em sans pesada; em rajadas curtas, o texto se separa em canais de cor (vermelho/ciano deslocados), fatias horizontais escorregam, aparecem barras de ruído; entre as rajadas, o título fica limpo.
Visual: fundo escuro, texto claro, scanlines finas, um pouco de aberração cromática constante.
Movimento: rajadas de 100 a 250 ms em tempos irregulares, nunca contínuas.
Use para: tecnologia, IA, "algo deu errado", suspense.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#0d0e10", { grao: 0.3, vinheta: 0.5 });
    const rajada = [[0.4, 0.6], [1.5, 1.62], [2.7, 2.95], [4.1, 4.2]].some(([a, b]) => t > a && t < b), r = rng(Math.floor(t * 30));
    const d = rajada ? 14 + r() * 20 : 3;
    const tit = (cor, dx, dy) => texto(c, "SISTEMA FORA", W / 2 + dx, H / 2 + dy, { tam: 180, peso: 900, fonte: GROSSA, cor });
    c.globalCompositeOperation = "lighter"; tit("rgba(255,40,60,.85)", -d, 0); tit("rgba(40,220,255,.85)", d, 0); tit("rgba(240,240,240,.7)", 0, 0); c.globalCompositeOperation = "source-over";
    if (rajada) for (let i = 0; i < 8; i++) { const y = r() * H, h = 10 + r() * 40, dx = (r() - 0.5) * 120; c.drawImage(c.canvas, 0, y * (c.canvas.height / H), c.canvas.width, h * (c.canvas.height / H), dx, y, W, h);
      c.fillStyle = `rgba(255,255,255,${r() * 0.1})`; c.fillRect(0, r() * H, W, 4); }
    c.fillStyle = "rgba(0,0,0,.25)"; for (let y = 0; y < H; y += 6) c.fillRect(0, y, W, 2);
    texto(c, "erro 503 · tentando de novo", W / 2, H / 2 + 160, { tam: 32, fonte: MONO, cor: "#7d8790" });
  },
});

semente({
  id: "letras-caindo", nome: "Letras que caem", grupo: "tipografia", formato: "1:1",
  resumo: "As letras despencam do topo, quicam no chão e se arrumam na palavra. Leve e divertido.",
  receita: `Cartela 1:1 com letras em física.
Estrutura: as letras da palavra caem do topo em tempos diferentes, quicam no "chão" (linha de base) com amortecimento e giram até ficarem retas; a última cai com mais força e empurra as outras de leve.
Visual: letras grossas arredondadas em cores alegres, fundo claro, sombra no chão que cresce quando a letra se aproxima.
Movimento: gravidade + quique (2 a 3 saltos), rotação que amortece.
Use para: abertura leve, conteúdo infantil, educação, marca simpática.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#fbf3e4", { grao: 0.1, vinheta: 0.15 });
    const pal = "OLÁ!", base = 700, cores = [CLAUDE.terracota, CLAUDE.oliva, CLAUDE.ceu, "#e9b949"], v = 1 - fase(t, 4.5, 4.95);
    [...pal].forEach((L, i) => {
      const t0 = 0.2 + i * 0.3, u = Math.max(0, t - t0), x = 260 + i * 200;
      const quique = u < 0.5 ? -(1 - Math.pow(u / 0.5, 2)) * 700 : -Math.abs(Math.sin((u - 0.5) * 9)) * 160 * Math.exp(-(u - 0.5) * 4);
      const y = base + (t < t0 ? -900 : quique), rot = (t < t0 ? 1 : Math.exp(-u * 3) * Math.sin(u * 10)) * 0.6 * (i % 2 ? 1 : -1);
      const sh = clamp(1 - (base - y) / 800);
      c.fillStyle = `rgba(61,57,41,${0.15 * sh * v})`; c.beginPath(); c.ellipse(x, base + 120, 80 * sh, 14 * sh, 0, 0, 7); c.fill();
      c.save(); c.globalAlpha = v; c.translate(x, y); c.rotate(rot); texto(c, L, 0, 0, { tam: 260, peso: 900, fonte: "Arial Rounded MT Bold, " + SANS, cor: cores[i] }); c.restore();
    });
  },
});

semente({
  id: "logo-montagem", nome: "Logo que se monta", grupo: "tipografia", formato: "16:9",
  resumo: "Formas soltas voam e se encaixam no símbolo, o nome escreve ao lado e um brilho passa. Vinheta de marca.",
  receita: `Vinheta 16:9 de marca (2 a 4 s).
Estrutura: formas geométricas (círculos, quartos de círculo, barras) entram de fora do quadro em arcos e se encaixam formando o símbolo; o nome da marca aparece ao lado por máscara; um brilho diagonal passa por tudo; slogan pequeno embaixo.
Visual: fundo da cor principal da marca ou creme, símbolo em 2 cores, nome em sans geométrica.
Movimento: trajetórias curvas com ease-out e encaixe com quique de 4%; tudo coreografado em 1,5 s.
Use para: abertura e fechamento de canal, assinatura de cliente.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.1, vinheta: 0.15 });
    const cx = 700, cy = H / 2, v = 1 - fase(t, 4.5, 4.95);
    const pecas = [[0, CLAUDE.terracota, -900, -500], [1, CLAUDE.tinta, 900, -400], [2, CLAUDE.oliva, -700, 600], [3, CLAUDE.terracota, 600, 700]];
    c.save(); c.globalAlpha = v;
    pecas.forEach(([q, cor, ox, oy], i) => {
      const k = volta(clamp((t - 0.2 - i * 0.12) / 0.6)), x = cx + ox * (1 - k), y = cy + oy * (1 - k);
      c.save(); c.translate(x, y); c.rotate((1 - k) * 3); c.fillStyle = cor; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 150, (q * Math.PI) / 2, ((q + 1) * Math.PI) / 2); c.closePath(); c.fill(); c.restore();
    });
    const m = sai(fase(t, 1.2, 1.8));
    c.save(); c.beginPath(); c.rect(900, cy - 120, 900 * m, 240); c.clip();
    texto(c, "quadrante", 920, cy - 20, { tam: 130, fonte: FUTURA, peso: 600, alinha: "left" });
    texto(c, "estúdio de ideias", 925, cy + 80, { tam: 40, peso: 400, alinha: "left", cor: "#8a8577" }); c.restore();
    const b = fase(t, 2.0, 2.7);
    if (b > 0 && b < 1) { const g = c.createLinearGradient(400 + b * 1400 - 200, 0, 400 + b * 1400 + 200, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
      c.globalCompositeOperation = "soft-light"; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalCompositeOperation = "source-over"; }
    c.restore();
  },
});

semente({
  id: "texto-com-imagem", nome: "Texto vazado", grupo: "tipografia", formato: "9:16",
  resumo: "Letras gigantes funcionam como janela: dentro delas, uma paisagem se move. Capa de impacto.",
  receita: `Cartela 9:16 (ou 16:9) com texto vazado (a imagem aparece só dentro das letras).
Estrutura: uma palavra em caixa alta ocupa quase toda a tela, empilhada letra sobre letra ou em 2 linhas; dentro das letras, uma imagem/cena em movimento (paisagem, vídeo, gradiente); no fim, a máscara abre e a cena toma a tela inteira.
Visual: fundo de cor sólida escura, letras muito pesadas e condensadas, cena interna colorida.
Movimento: cena interna com parallax lento, letras com leve zoom; abertura final com escala 1→8 da máscara.
Use para: capa de vídeo, abertura de viagem, título de capítulo.`,
  preparar: (W, H) => tela(W, H),
  cena(c, t, W, H, tmp) {
    c.fillStyle = "#1a1917"; c.fillRect(0, 0, W, H);
    const abre = Math.pow(fase(t, 3.6, 4.6), 2), s = 1 + abre * 9 + 0.03 * (t / DUR), tc = tmp.getContext("2d");
    tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = "source-over"; tc.globalAlpha = 1; tc.clearRect(0, 0, W, H);
    tc.translate(W / 2, H / 2); tc.scale(s, s); tc.translate(-W / 2, -H / 2);
    tc.font = `900 560px ${GROSSA}`; tc.textAlign = "center"; tc.textBaseline = "middle"; tc.fillStyle = "#000";
    tc.fillText("MAR", W / 2, H * 0.33); tc.fillText("SUL", W / 2, H * 0.68);
    tc.setTransform(1, 0, 0, 1, 0, 0);
    if (abre > 0.5) { tc.globalAlpha = (abre - 0.5) * 2; tc.fillRect(0, 0, W, H); tc.globalAlpha = 1; }
    tc.globalCompositeOperation = "source-atop"; // a cena só aparece dentro das letras
    const g = tc.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#f6b48f"); g.addColorStop(0.5, "#f7d9a8"); g.addColorStop(0.55, "#3f8fa0"); g.addColorStop(1, "#1d4e68"); tc.fillStyle = g; tc.fillRect(0, 0, W, H);
    tc.fillStyle = "#fff4cf"; tc.beginPath(); tc.arc(W / 2 + 60 * ciclo(t), H * 0.42, 140, 0, 7); tc.fill();
    for (let i = 0; i < 10; i++) { tc.strokeStyle = "rgba(255,255,255,.35)"; tc.lineWidth = 6; tc.beginPath(); for (let x = 0; x <= W; x += 30) tc.lineTo(x, H * 0.6 + i * 70 + 10 * Math.sin(x / 80 + t * 3 + i)); tc.stroke(); }
    c.drawImage(tmp, 0, 0, W, H);
  },
});
