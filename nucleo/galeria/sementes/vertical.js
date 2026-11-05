// Grupo Vertical e Reels: 9:16, gancho no primeiro segundo, texto grande, leitura no celular.

semente({
  id: "kraft-recortes", estilo: "kraft", nome: "Kraft com recortes", grupo: "vertical", formato: "9:16",
  resumo: "Papel kraft, cantos rasgados, etiqueta laranja no topo e recortes que caem com fita. Ideal para explicar com analogia.",
  receita: `Vídeo vertical 9:16 em papel kraft (#c9a97c com grão e fibras), cantos do quadro cobertos por pedaços de papel rasgado, jornal e fita.
Estrutura: etiqueta laranja no topo com o tema da analogia ("Pensa assim"), depois 2 a 4 recortes ilustrados que caem um por vez com sombra e balanço, cada um com uma etiqueta branca de papel ("X = Y").
Movimento: cada recorte entra com pop e leve rotação, assenta, e a fita aparece por cima. Nada desliza linear.
Texto: legenda amarela com contorno escuro, no terço inferior, frase curta por vez.
Voz: narrador em primeira pessoa, tom de conversa. Funciona por cima da gravação da pessoa (corte para o kraft só na analogia).
Use para: explicar um conceito técnico com uma comparação do dia a dia. É o estilo "Kraft" do estúdio (estilos/kraft/).`,
  higgsfield: "Os recortes ilustrados (objetos em preto e branco com detalhe laranja, fundo transparente) podem ser pintados na Higgsfield; o kraft, as etiquetas e o movimento ficam no código.",
  cena(c, t, W, H) {
    fundo(c, W, H, "#c9a97c", { grao: 0.3, vinheta: 0.2 });
    recorte(c, -60, -40, 420, 260, "#e8e1d0", { seed: 3, amp: 9, rot: -0.15 });
    recorte(c, W - 300, -30, 380, 300, "#d7cfbd", { seed: 5, amp: 9, rot: 0.2 });
    recorte(c, W - 160, 40, 200, 160, CLAUDE.terracota, { seed: 6, amp: 10, rot: 0.5 });
    fita(c, 330, 150, 160, -0.6);
    const k = entra(t, 0.1);
    c.save(); c.translate(W / 2, 260); c.rotate(-0.03); c.scale(k, k);
    recorte(c, -240, -60, 480, 120, CLAUDE.terracota, { seed: 9, amp: 2, sombra: 8 });
    texto(c, "Pensa assim", 0, 2, { tam: 64, cor: "#fff", peso: 800 });
    c.restore();
    const itens = [["CPU", "cozinheiro", 0.7], ["RAM", "bancada", 1.3], ["Disco", "despensa", 1.9]];
    itens.forEach(([a, b, t0], i) => {
      const v = vida(t, t0, 4.7), y = 640 + i * 330, x = i % 2 ? 610 : 470, s = entra(t, t0);
      if (v <= 0) return;
      c.save(); c.globalAlpha = v; c.translate(x, y); c.rotate((i % 2 ? 0.05 : -0.04) + 0.02 * ciclo(t, 1)); c.scale(s, s);
      recorte(c, -200, -120, 400, 240, "#f4efe4", { seed: 20 + i, amp: 4 });
      c.strokeStyle = CLAUDE.tinta; c.lineWidth = 6;
      c.beginPath(); c.arc(-100, 0, 60, 0, Math.PI * 2); c.stroke();
      c.fillStyle = CLAUDE.terracota; c.beginPath(); c.arc(-100, 0, 26, 0, Math.PI * 2); c.fill();
      texto(c, a, 60, -30, { tam: 52, peso: 800 });
      texto(c, "= " + b, 60, 34, { tam: 40, peso: 500 });
      if (fase(t, t0 + 0.3, t0 + 0.5) > 0) fita(c, 0, -120, 140, 0.08);
      c.restore();
    });
    const leg = t < 1.5 ? "o computador" : t < 3 ? "é uma cozinha" : "e cada peça tem um papel";
    c.save(); c.lineJoin = "round"; c.font = `800 62px ${SANS}`; c.textAlign = "center";
    c.strokeStyle = "#2a2116"; c.lineWidth = 12; c.strokeText(leg, W / 2, H - 260);
    c.fillStyle = "#ffe14d"; c.fillText(leg, W / 2, H - 260); c.restore();
  },
});

semente({
  id: "legenda-palavra", nome: "Legenda palavra a palavra", grupo: "vertical", formato: "9:16",
  resumo: "Uma palavra por vez no centro, a palavra-chave pula em cor. Fala rápida que prende até o fim.",
  receita: `Vídeo vertical 9:16, fundo quase preto (#141413) com uma luz quente desfocada que respira devagar.
Estrutura: a fala aparece em blocos de 1 a 3 palavras no centro da tela, sincronizadas com a voz (tempo de cada palavra vindo do transcritor).
Destaque: a palavra-chave de cada frase sai na cor de acento (#d97757), 20% maior, com um sublinhado à mão que se desenha.
Movimento: cada bloco entra com escala 0.8→1 e sobra (back-out, 150 ms), sai cortando seco. Um balanço sutil de câmera mantém vivo.
Texto: sem serifa pesada, caixa alta opcional, nunca mais de 3 palavras na tela.
Use para: cortes de podcast, opinião rápida, gancho de 3 segundos.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#141413", { grao: 0.25, vinheta: 0.5 });
    const g = c.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, 700 + 80 * ciclo(t));
    g.addColorStop(0, "rgba(217,119,87,.28)"); g.addColorStop(1, "rgba(217,119,87,0)");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const blocos = [["ninguém", 0], ["te conta", 0], ["ISSO", 1], ["sobre", 0], ["prompts", 1], ["longos", 0]];
    const i = Math.floor((t / DUR) * blocos.length), [p, chave] = blocos[i], t0 = (i * DUR) / blocos.length;
    const s = 0.8 + 0.2 * entra(t, t0, 0.18);
    c.save(); c.translate(W / 2 + 6 * ciclo(t, 3), H / 2); c.scale(s * (chave ? 1.25 : 1), s * (chave ? 1.25 : 1));
    texto(c, p.toUpperCase(), 0, 0, { tam: 150, peso: 900, cor: chave ? CLAUDE.terracota : "#faf9f5", larg: W * 0.8 });
    if (chave) {
      c.strokeStyle = CLAUDE.terracota; c.lineWidth = 12; c.lineCap = "round";
      tracar(c, borda([[-260, 95], [260, 85]], 4, i, 10).slice(0, 10), fase(t, t0 + 0.1, t0 + 0.5), false);
    }
    c.restore();
    c.fillStyle = "rgba(250,249,245,.35)";
    blocos.forEach((_, j) => { rr(c, W / 2 - 150 + j * 52, H - 220, 40, 8, 4); c.globalAlpha = j <= i ? 1 : 0.3; c.fill(); });
    c.globalAlpha = 1;
  },
});

semente({
  id: "comentario-respondido", nome: "Comentário respondido", grupo: "vertical", formato: "9:16",
  resumo: "O print do comentário cai na tela, a frase-chave ganha marca-texto e a resposta entra embaixo.",
  receita: `Vídeo vertical 9:16 que responde a um comentário do público.
Estrutura: (1) o card do comentário cai do topo com sombra e leve rotação, avatar redondo genérico e nome borrado; (2) a frase polêmica ganha marca-texto amarelo que se pinta da esquerda para a direita; (3) a resposta entra num balão na cor de acento, digitando.
Visual: fundo creme (#f0eee6) com grão, cards brancos de cantos arredondados, sem logo de rede social nenhuma (layout genérico próprio).
Movimento: queda com mola, marca-texto em 0,5 s, cursor piscando na resposta.
Voz: a pessoa lê o comentário em tom neutro e responde no seu tom.
Use para: série de "respondendo vocês", FAQ, quebrar objeção.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.15, vinheta: 0.15 });
    texto(c, "VOCÊS PERGUNTARAM", W / 2, 260, { tam: 54, peso: 800, cor: CLAUDE.argila, espaco: 6 });
    const q = sai(fase(t, 0.1, 0.8)), v = 1 - fase(t, 4.5, 4.95);
    c.save(); c.globalAlpha = v; c.translate(W / 2, lerp(-300, 640, q)); c.rotate(lerp(-0.2, -0.03, q));
    c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 40; c.shadowOffsetY = 14;
    rr(c, -440, -170, 880, 340, 36); c.fillStyle = "#fff"; c.fill(); c.shadowColor = "transparent";
    c.fillStyle = CLAUDE.cinza; c.beginPath(); c.arc(-360, -90, 40, 0, 7); c.fill();
    rr(c, -300, -112, 220, 22, 11); c.fillStyle = "#ddd"; c.fill();
    rr(c, -300, -72, 140, 16, 8); c.fillStyle = "#eee"; c.fill();
    const m = fase(t, 1.0, 1.6);
    c.fillStyle = "rgba(255,225,77,.85)"; c.fillRect(-392, 0, 700 * m, 60);
    texto(c, "Mas isso não funciona", -380, 30, { tam: 48, peso: 600, alinha: "left" });
    texto(c, "de verdade, né?", -380, 100, { tam: 48, peso: 600, alinha: "left" });
    c.restore();
    const r = fase(t, 1.9, 2.2);
    if (r > 0) {
      c.save(); c.globalAlpha = r * v; c.translate(W / 2 + 60, 1180 + 30 * (1 - r));
      rr(c, -400, -150, 800, 300, 40); c.fillStyle = CLAUDE.terracota; c.fill();
      c.beginPath(); c.moveTo(300, 150); c.lineTo(380, 220); c.lineTo(230, 150); c.fill();
      const s = digita("Funciona. Mas só se você fizer o passo 2.", fase(t, 2.2, 3.8));
      const linhas = [s.slice(0, 22), s.slice(22)];
      linhas.forEach((l, i) => texto(c, l, -350, -40 + i * 74, { tam: 50, peso: 700, cor: "#fff", alinha: "left" }));
      if (Math.floor(t * 3) % 2) { c.fillStyle = "#fff"; c.fillRect(-350 + c.measureText ? 0 : 0, 0, 0, 0); }
      c.restore();
    }
  },
});

semente({
  id: "top-cinco", nome: "Top 5 contagem", grupo: "vertical", formato: "9:16",
  resumo: "Número gigante que vira como página, item escrito embaixo. Lista que segura até o número 1.",
  receita: `Vídeo vertical 9:16 de lista em contagem regressiva (5 até 1).
Estrutura: número gigante (60% da largura) no centro, o nome do item embaixo, um selo "#1" especial no fim.
Visual: cada número tem um fundo de cor chapada diferente de uma paleta quente (terracota, areia, oliva, céu, tinta), com formas geométricas grandes atrás.
Transição: o número vira como página de calendário (escala vertical 1→0→1 com sombra na dobra) e o fundo troca junto.
Texto: título fixo pequeno no topo ("5 ferramentas que..."); nome do item em caixa alta.
Use para: rankings, listas de dicas, "5 erros que".`,
  cena(c, t, W, H) {
    const cores = [CLAUDE.oliva, CLAUDE.ceu, CLAUDE.argila, CLAUDE.tinta, CLAUDE.terracota];
    const nomes = ["ATALHOS", "MODELOS", "PROMPTS", "AGENTES", "CONTEXTO"];
    const passo = DUR / 5, i = Math.min(4, Math.floor(t / passo)), u = (t - i * passo) / passo;
    fundo(c, W, H, cores[i], { grao: 0.22, vinheta: 0.3 });
    c.save(); c.globalAlpha = 0.18; c.fillStyle = "#fff";
    c.beginPath(); c.arc(W * 0.85, H * 0.2, 380 + 20 * ciclo(t), 0, 7); c.fill();
    c.fillRect(-100, H * 0.7, W * 0.6, 900); c.restore();
    texto(c, "5 coisas que mudam tudo", W / 2, 200, { tam: 54, peso: 700, cor: "rgba(255,255,255,.85)" });
    const vira = u < 0.12 ? Math.abs(1 - 2 * (u / 0.12)) : 1;
    c.save(); c.translate(W / 2, H * 0.47); c.scale(1, Math.max(0.02, vira));
    texto(c, String(5 - i), 0, 0, { tam: 760, peso: 900, cor: "#fff", fonte: GROSSA });
    c.restore();
    c.fillStyle = "rgba(0,0,0,.15)"; c.fillRect(0, H * 0.47 - 3, W, 6);
    const k = sai(fase(u, 0.15, 0.4));
    texto(c, nomes[i], W / 2, H * 0.78 + 40 * (1 - k), { tam: 110, peso: 900, cor: "#fff", alpha: k, fonte: GROSSA, espaco: 4 });
  },
});

semente({
  id: "antes-depois", nome: "Antes e depois", grupo: "vertical", formato: "9:16",
  resumo: "Tela dividida com a barra que desliza e revela o depois. Transformação em um gesto.",
  receita: `Vídeo vertical 9:16 de comparação antes/depois.
Estrutura: as duas versões ocupam a tela inteira empilhadas; uma barra vertical com alça redonda desliza da direita para a esquerda revelando o "depois".
Visual: "antes" dessaturado e bagunçado (elementos tortos, cinza), "depois" limpo, alinhado e com cor. Etiquetas ANTES / DEPOIS em pílulas nos cantos.
Movimento: a barra vai e volta uma vez com ease-in-out e para no meio no final; leve zoom lento em tudo.
Use para: edição de vídeo, organização, design, rotina, resultados de cliente.`,
  cena(c, t, W, H) {
    const x = W * (0.5 + 0.42 * ciclo(t, 1));
    const lado = (depois) => {
      fundo(c, W, H, depois ? "#f6f1e7" : "#d8d6d0", { grao: 0.2, vinheta: 0.2 });
      for (let i = 0; i < 6; i++) {
        const r = rng(i + 3), y = 380 + i * 210;
        c.save(); c.translate(W / 2, y); c.rotate(depois ? 0 : (r() - 0.5) * 0.25);
        rr(c, -380 + (depois ? 0 : (r() - 0.5) * 120), -70, depois ? 760 : 500 + r() * 200, 140, 24);
        c.fillStyle = depois ? [CLAUDE.terracota, CLAUDE.oliva, CLAUDE.ceu][i % 3] : "#a9a7a1"; c.fill();
        c.restore();
      }
    };
    lado(false);
    c.save(); c.beginPath(); c.rect(x, 0, W - x, H); c.clip(); lado(true); c.restore();
    c.fillStyle = "#fff"; c.fillRect(x - 4, 0, 8, H);
    c.beginPath(); c.arc(x, H / 2, 54, 0, 7); c.fill();
    c.strokeStyle = CLAUDE.tinta; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 18, H / 2 - 16); c.lineTo(x - 32, H / 2); c.lineTo(x - 18, H / 2 + 16);
    c.moveTo(x + 18, H / 2 - 16); c.lineTo(x + 32, H / 2); c.lineTo(x + 18, H / 2 + 16); c.stroke();
    const pil = (s, px, cor) => { c.font = `800 44px ${SANS}`; const w = c.measureText(s).width + 60; rr(c, px - w / 2, 150, w, 80, 40); c.fillStyle = cor; c.fill(); texto(c, s, px, 192, { tam: 44, peso: 800, cor: "#fff" }); };
    pil("ANTES", 200, CLAUDE.tinta); pil("DEPOIS", W - 220, CLAUDE.terracota);
  },
});

semente({
  id: "conversa-bolhas", nome: "Conversa em bolhas", grupo: "vertical", formato: "9:16",
  resumo: "Mensagens sobem como num chat, com digitando... antes de cada uma. Diálogo que vira roteiro.",
  receita: `Vídeo vertical 9:16 contado como troca de mensagens.
Estrutura: bolhas alternam esquerda (cinza claro) e direita (cor de acento); antes de cada bolha, três pontinhos "digitando" por 0,4 s; a conversa sobe quando passa da metade da tela.
Visual: fundo creme liso, cabeçalho com avatar genérico e nome do personagem, sem marca de app nenhum.
Movimento: bolha nasce do canto com escala 0→1 e sobra; a lista sobe com mola.
Som: um "plim" curto em cada mensagem (sintetizado no código).
Use para: piada de diálogo, cliente x vendedor, você x a IA, roteiro de vendas.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.12, vinheta: 0.1 });
    const msgs = [[0, "me ajuda a escrever um roteiro?"], [1, "claro. sobre o quê?"], [0, "sobre como você me ajuda"], [1, "isso ficou meta 😅"], [0, "perfeito, é esse o gancho"]];
    const sobe = sai(fase(t, 2.6, 3.2)) * 300;
    msgs.forEach(([eu, s], i) => {
      const t0 = 0.2 + i * 0.85, k = entra(t, t0 + 0.35, 0.35), y = 360 + i * 230 - sobe;
      const dir = eu === 0, v = 1 - fase(t, 4.6, 4.95);
      if (t < t0) return;
      c.save(); c.globalAlpha = v;
      c.font = `500 44px ${SANS}`; const w = Math.min(760, c.measureText(s).width + 80);
      const x = dir ? W - 60 - w : 60;
      if (t < t0 + 0.35) {
        rr(c, x + (dir ? w - 180 : 0), y, 180, 100, 50); c.fillStyle = dir ? "#e8b9a6" : "#e3e1da"; c.fill();
        for (let p = 0; p < 3; p++) { c.fillStyle = "#777"; c.beginPath(); c.arc(x + (dir ? w - 180 : 0) + 55 + p * 35, y + 50 - 8 * Math.max(0, Math.sin(t * 12 - p)), 9, 0, 7); c.fill(); }
      } else {
        c.translate(dir ? x + w : x, y + 50); c.scale(k, k); c.translate(dir ? -w : 0, -50);
        rr(c, 0, 0, w, 100, 50); c.fillStyle = dir ? CLAUDE.terracota : "#fff"; c.fill();
        texto(c, s, 40, 52, { tam: 44, peso: 500, alinha: "left", cor: dir ? "#fff" : CLAUDE.tinta });
      }
      c.restore();
    });
    c.fillStyle = "#fff"; c.fillRect(0, 0, W, 230);
    c.fillStyle = CLAUDE.terracota; c.beginPath(); c.arc(130, 140, 50, 0, 7); c.fill();
    texto(c, "Claude", 210, 120, { tam: 46, peso: 700, alinha: "left" });
    texto(c, "online", 210, 170, { tam: 32, peso: 400, alinha: "left", cor: CLAUDE.oliva });
  },
});

semente({
  id: "pergunta-gancho", nome: "Pergunta gancho", grupo: "vertical", formato: "9:16",
  resumo: "Uma pergunta gigante em blocos de cor, o ponto de interrogação balança. Abre o vídeo sem rosto.",
  receita: `Abertura vertical 9:16 de 3 a 5 segundos para segurar o dedo.
Estrutura: a pergunta em 2 ou 3 linhas, cada linha num bloco de cor chapada que entra de um lado diferente; o "?" gigante balança como pêndulo no canto.
Visual: fundo de cor forte única (terracota), blocos em creme e tinta, tipografia condensada e pesada.
Movimento: blocos entram com chicote (rápido, freia no fim), o fundo dá um "soco" de escala 1.03 no último bloco.
Use para: primeiro segundo de qualquer vídeo curto, trocar o rosto por texto.`,
  cena(c, t, W, H) {
    const soco = 1 + 0.03 * (fase(t, 1.2, 1.3) - fase(t, 1.3, 1.6));
    c.save(); c.translate(W / 2, H / 2); c.scale(soco, soco); c.translate(-W / 2, -H / 2);
    fundo(c, W, H, CLAUDE.terracota, { grao: 0.25, vinheta: 0.3 });
    const linhas = [["VOCÊ USA", CLAUDE.papel, CLAUDE.tinta, -1, 0.1], ["IA DO JEITO", CLAUDE.tinta, CLAUDE.papel, 1, 0.5], ["ERRADO", CLAUDE.papel, CLAUDE.argila, -1, 0.9]];
    linhas.forEach(([s, fd, cor, lado, t0], i) => {
      const k = sai(fase(t, t0, t0 + 0.35)), out = fase(t, 4.5, 4.9), y = 560 + i * 260;
      c.save(); c.translate(lado * (1 - k) * W * 1.2 + lado * out * -W, y); c.rotate(-0.04 + i * 0.03);
      c.font = `900 150px ${GROSSA}`; const w = c.measureText(s).width + 80;
      c.fillStyle = fd; c.fillRect(W / 2 - w / 2, -100, w, 200);
      texto(c, s, W / 2, 8, { tam: 150, fonte: GROSSA, cor, peso: 900 });
      c.restore();
    });
    c.save(); c.translate(W * 0.78, 1380); c.rotate(0.35 * ciclo(t, 2) * fase(t, 1.3, 1.8));
    texto(c, "?", 0, 160, { tam: 420, fonte: GROSSA, cor: CLAUDE.papel, alpha: fase(t, 1.3, 1.5) });
    c.restore();
    c.restore();
  },
});

semente({
  id: "checklist-mao", nome: "Checklist à mão", grupo: "vertical", formato: "9:16",
  resumo: "Folha pautada, itens escritos e marcados com ✓ de caneta. Passo a passo que dá vontade de salvar.",
  receita: `Vídeo vertical 9:16 de lista de verificação em caderno.
Estrutura: folha pautada com margem vermelha ocupando a tela, título sublinhado, 4 a 6 itens; cada item entra escrito e logo depois ganha um ✓ desenhado (traço que se constrói) e, se for o caso, um risco por cima.
Visual: papel off-white com pauta azul clara, caneta azul-escura, ✓ em vermelho, um clipe no topo.
Movimento: traços com tremido de mão, câmera desce devagar acompanhando a lista.
Use para: checklist, rotina, "faça isso antes de postar", material salvável.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#fbf8f0", { grao: 0.12, vinheta: 0.2 });
    c.strokeStyle = "rgba(90,140,200,.35)"; c.lineWidth = 3;
    for (let y = 300; y < H; y += 110) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.strokeStyle = "rgba(210,80,80,.5)"; c.beginPath(); c.moveTo(150, 0); c.lineTo(150, H); c.stroke();
    texto(c, "Antes de postar", 190, 240, { tam: 80, fonte: MAO, cor: "#1f3b6e", alinha: "left" });
    c.strokeStyle = "#1f3b6e"; c.lineWidth = 6; c.lineCap = "round";
    tracar(c, borda([[190, 290], [760, 285]], 3, 2, 10).slice(0, 10), fase(t, 0.1, 0.5), false);
    const itens = ["gancho nos 2 primeiros segundos", "legenda grande", "corte os silêncios", "chamada no final"];
    itens.forEach((s, i) => {
      const t0 = 0.5 + i * 0.85, y = 520 + i * 220, v = 1 - fase(t, 4.6, 4.95);
      texto(c, digita(s, fase(t, t0, t0 + 0.5)), 300, y, { tam: 58, fonte: MAO, cor: "#1f3b6e", alinha: "left", alpha: v, larg: 740 });
      c.save(); c.globalAlpha = v; c.strokeStyle = "#c8432b"; c.lineWidth = 12;
      tracar(c, borda([[190, y - 5], [215, y + 30], [265, y - 50]], 2, i + 7, 6).slice(0, 13), fase(t, t0 + 0.5, t0 + 0.75), false);
      c.restore();
    });
    c.fillStyle = "#9aa"; rr(c, W / 2 - 40, -30, 80, 150, 30); c.lineWidth = 10; c.strokeStyle = "#8a9399"; c.stroke();
  },
});

semente({
  id: "mito-verdade", nome: "Mito ou verdade", grupo: "vertical", formato: "9:16",
  resumo: "A afirmação aparece num cartão e o carimbo MITO ou VERDADE bate com tremor. Formato de série.",
  receita: `Vídeo vertical 9:16 de série "mito ou verdade".
Estrutura: cartão de papel com a afirmação no meio da tela; suspense de 1 s com o cartão balançando; o carimbo bate (MITO em vermelho, VERDADE em verde-oliva) com tremor de câmera e respingo de tinta; a explicação curta entra embaixo.
Visual: fundo com listras diagonais suaves, carimbo com borda dupla e textura falhada.
Movimento: carimbo desce de escala 2.5 para 1 em 120 ms, tremor de 200 ms, partículas de tinta.
Use para: desmentir crença do nicho, série semanal.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#efe7da", { grao: 0.2, vinheta: 0.25 });
    c.save(); c.globalAlpha = 0.07; c.fillStyle = CLAUDE.tinta;
    for (let i = -20; i < 40; i++) { c.beginPath(); c.moveTo(i * 80, 0); c.lineTo(i * 80 + 40, 0); c.lineTo(i * 80 + 40 - H * 0.5, H); c.lineTo(i * 80 - H * 0.5, H); c.fill(); }
    c.restore();
    texto(c, "MITO OU VERDADE?", W / 2, 260, { tam: 70, peso: 900, fonte: GROSSA, cor: CLAUDE.tinta });
    const bate = 2.0, k = fase(t, bate, bate + 0.12), tr = t > bate && t < bate + 0.25 ? 12 * Math.sin(t * 90) : 0;
    c.save(); c.translate(W / 2 + tr, 860); c.rotate(0.03 * ciclo(t, 2) * (1 - fase(t, bate - 0.1, bate)));
    recorte(c, -420, -260, 840, 520, "#fffdf7", { seed: 4, amp: 3 });
    texto(c, "IA vai substituir", 0, -60, { tam: 70, peso: 700 });
    texto(c, "todo editor de vídeo", 0, 30, { tam: 70, peso: 700 });
    if (t > bate) {
      c.save(); c.rotate(-0.2); const s = lerp(2.5, 1, k); c.scale(s, s); c.globalAlpha = k * 0.9;
      c.strokeStyle = "#c0392b"; c.lineWidth = 14; rr(c, -260, 70, 520, 160, 20); c.stroke();
      c.lineWidth = 5; rr(c, -240, 88, 480, 124, 14); c.stroke();
      texto(c, "MITO", 0, 152, { tam: 120, peso: 900, fonte: GROSSA, cor: "#c0392b" });
      c.restore();
      const r = rng(9);
      for (let i = 0; i < 18; i++) { const a = r() * 7, d = 260 + r() * 200 * sai(fase(t, bate, bate + 0.3)); c.fillStyle = "rgba(192,57,43,.7)"; c.beginPath(); c.arc(Math.cos(a) * d, 150 + Math.sin(a) * d * 0.5, 4 + r() * 10, 0, 7); c.fill(); }
    }
    c.restore();
    const e = fase(t, 2.6, 3);
    texto(c, "ela substitui a parte chata.", W / 2, 1380, { tam: 54, peso: 600, alpha: e * (1 - fase(t, 4.6, 4.95)) });
    texto(c, "o olho ainda é seu.", W / 2, 1460, { tam: 54, peso: 800, cor: CLAUDE.argila, alpha: fase(t, 3, 3.4) * (1 - fase(t, 4.6, 4.95)) });
  },
});

semente({
  id: "notificacoes", nome: "Notificações empilhando", grupo: "vertical", formato: "9:16",
  resumo: "Notificações caem uma sobre a outra na tela bloqueada, cada vez mais rápido. Mostra resultado ou caos.",
  receita: `Vídeo vertical 9:16 em tela de bloqueio genérica (sem marca de sistema).
Estrutura: hora grande no topo, fundo em gradiente suave; notificações (ícone quadrado arredondado, título, texto) caem de cima e empilham, acelerando; no fim a pilha vira contador "+47".
Visual: cards translúcidos com desfoque de fundo, sombra macia, ícone na cor de acento.
Movimento: cada card entra com mola e empurra os de baixo; o ritmo dobra a cada duas notificações.
Use para: prova social (vendas, mensagens, inscrições), sobrecarga de informação, antes da solução.`,
  cena(c, t, W, H) {
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#d98f6f"); g.addColorStop(1, "#6a7f9c");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    texto(c, "9:41", W / 2, 330, { tam: 220, peso: 200, cor: "#fff" });
    texto(c, "quarta-feira, 5 de novembro", W / 2, 470, { tam: 44, peso: 500, cor: "rgba(255,255,255,.85)" });
    const tempos = [0.3, 1.0, 1.55, 2.0, 2.35, 2.6, 2.8, 2.95, 3.08, 3.2];
    const n = tempos.filter((x) => t > x).length, v = 1 - fase(t, 4.5, 4.9);
    for (let i = n - 1; i >= Math.max(0, n - 5); i--) {
      const prof = n - 1 - i, k = sai(fase(t, tempos[i], tempos[i] + 0.3));
      const y = 640 + prof * 30 + (1 - k) * -200, s = 1 - prof * 0.04;
      c.save(); c.globalAlpha = v * (1 - prof * 0.15); c.translate(W / 2, y); c.scale(s, s);
      c.shadowColor = "rgba(0,0,0,.2)"; c.shadowBlur = 30;
      rr(c, -470, -90, 940, 180, 40); c.fillStyle = "rgba(255,255,255,.88)"; c.fill(); c.shadowColor = "transparent";
      rr(c, -430, -50, 100, 100, 24); c.fillStyle = CLAUDE.terracota; c.fill();
      texto(c, "Nova venda", -300, -22, { tam: 40, peso: 700, alinha: "left" });
      texto(c, `R$ 97,00 · pedido #${1040 + i}`, -300, 30, { tam: 36, peso: 400, alinha: "left", cor: "#555" });
      c.restore();
    }
    const fim = fase(t, 3.4, 3.7);
    if (fim > 0) texto(c, "+47", W / 2, 1300, { tam: 260 * entra(t, 3.4), peso: 900, cor: "#fff", alpha: v });
  },
});

semente({
  id: "serie-parte", nome: "Série em partes", grupo: "vertical", formato: "9:16",
  resumo: "Selo PARTE 2 DE 5 com barra de progresso segmentada e o título do episódio. Vira hábito de seguir.",
  receita: `Vinheta vertical 9:16 de série (2 a 3 s no início de cada parte).
Estrutura: selo "PARTE N DE M" num retângulo de papel, barra segmentada com os episódios já vistos preenchidos e o atual pulsando, título do episódio em serifa grande.
Visual: fundo escuro quente (#1f1e1b), segmentos em creme, atual em terracota, linhas finas de grade.
Movimento: segmentos acendem em sequência rápida até o atual; o título sobe por máscara linha a linha.
Use para: séries, cursos em pílulas, histórias longas cortadas em partes.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#1f1e1b", { grao: 0.25, vinheta: 0.4 });
    c.strokeStyle = "rgba(255,255,255,.05)"; c.lineWidth = 2;
    for (let x = 0; x < W; x += 90) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    const v = 1 - fase(t, 4.5, 4.95), atual = 1;
    c.save(); c.globalAlpha = v;
    c.save(); c.translate(W / 2, 640); c.scale(entra(t, 0.1), entra(t, 0.1));
    recorte(c, -250, -60, 500, 120, CLAUDE.papel, { seed: 2, amp: 2, sombra: 0 });
    texto(c, "PARTE 2 DE 5", 0, 4, { tam: 58, peso: 900, espaco: 4 }); c.restore();
    for (let i = 0; i < 5; i++) {
      const on = fase(t, 0.4 + i * 0.12, 0.5 + i * 0.12) * (i <= atual ? 1 : 0.25);
      rr(c, 140 + i * 166, 800, 140, 18, 9); c.fillStyle = i === atual ? CLAUDE.terracota : "#faf9f5";
      c.globalAlpha = v * Math.max(0.15, on) * (i === atual ? 0.6 + 0.4 * ciclo01(t, 4) : 1); c.fill();
    }
    c.globalAlpha = v;
    ["O dia em que", "o prompt", "deu errado"].forEach((s, i) => {
      const k = sai(fase(t, 1.0 + i * 0.2, 1.5 + i * 0.2));
      c.save(); c.beginPath(); c.rect(0, 1000 + i * 150 - 80, W, 160); c.clip();
      texto(c, s, W / 2, 1000 + i * 150 + 160 * (1 - k), { tam: 120, fonte: SERIF, peso: 500, cor: i === 2 ? CLAUDE.terracota : "#faf9f5" });
      c.restore();
    });
    c.restore();
  },
});

semente({
  id: "polaroid-frase", nome: "Frase em polaroid", grupo: "vertical", formato: "9:16",
  resumo: "Polaroid cai na mesa, a foto revela devagar e a frase aparece escrita na borda. Emotivo e pessoal.",
  receita: `Vídeo vertical 9:16 de citação ou lembrança.
Estrutura: polaroid cai girando sobre uma mesa de madeira clara, assenta com fita; a "foto" (desenho em código: céu, sol, colinas) revela do branco à cor; a frase aparece escrita à mão na borda inferior.
Visual: luz quente lateral, sombra longa, grão de filme, leve vazamento de luz laranja no canto.
Movimento: queda com rotação que freia, revelação em 1,5 s, letras escritas uma a uma.
Use para: frases, depoimentos, histórias pessoais, aniversário de marca.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#d9c3a3", { grao: 0.25, vinheta: 0.45 });
    c.strokeStyle = "rgba(120,80,40,.12)"; c.lineWidth = 3;
    for (let y = 0; y < H; y += 26) { c.beginPath(); c.moveTo(0, y + 6 * Math.sin(y)); c.bezierCurveTo(W / 3, y + 10, W * 0.6, y - 10, W, y + 4); c.stroke(); }
    const k = sai(fase(t, 0.1, 0.9)), v = 1 - fase(t, 4.55, 4.95);
    c.save(); c.globalAlpha = v; c.translate(W / 2, lerp(-500, 880, k)); c.rotate(lerp(0.9, -0.06, k)); c.scale(lerp(1.3, 1, k), lerp(1.3, 1, k));
    c.shadowColor = "rgba(50,30,10,.35)"; c.shadowBlur = 40; c.shadowOffsetX = 25; c.shadowOffsetY = 30;
    c.fillStyle = "#fbfaf6"; c.fillRect(-380, -440, 760, 900); c.shadowColor = "transparent";
    const r = fase(t, 1.0, 2.6);
    const g = c.createLinearGradient(0, -400, 0, 260); g.addColorStop(0, mistura("#ffffff", "#f2a07b", r)); g.addColorStop(1, mistura("#ffffff", "#f6d6a8", r));
    c.fillStyle = g; c.fillRect(-340, -400, 680, 660);
    c.fillStyle = mistura("#ffffff", "#fff3c4", r); c.beginPath(); c.arc(100, -60, 90, 0, 7); c.fill();
    c.fillStyle = mistura("#ffffff", "#7d8f5a", r); c.beginPath(); c.moveTo(-340, 260); c.bezierCurveTo(-200, 40, 0, 120, 340, 60); c.lineTo(340, 260); c.fill();
    c.fillStyle = mistura("#ffffff", "#5d6e43", r); c.beginPath(); c.moveTo(-340, 260); c.bezierCurveTo(0, 120, 200, 220, 340, 200); c.lineTo(340, 260); c.fill();
    texto(c, digita("o começo de tudo", fase(t, 2.4, 3.6)), 0, 360, { tam: 72, fonte: MAO, cor: "#2b2a5a" });
    fita(c, 0, -450, 200, 0.05);
    c.restore();
  },
});

semente({
  id: "mapa-mental", nome: "Mapa mental vertical", grupo: "vertical", formato: "9:16",
  resumo: "Ideia central num círculo, ramos que crescem como galhos e terminam em etiquetas. Resume um assunto.",
  receita: `Vídeo vertical 9:16 que resume um tema em mapa mental.
Estrutura: a ideia central num círculo de cor no meio; 5 a 7 ramos crescem em curvas (traço que se desenha), cada um termina numa etiqueta de papel com uma palavra; sub-ramos menores em seguida.
Visual: fundo creme pontilhado, ramos com espessura que afina, uma cor por ramo da paleta suave.
Movimento: crescimento do centro para fora, etiquetas com pop; no fim, câmera aproxima levemente.
Use para: resumo de livro, estrutura de curso, "tudo que você precisa saber de X".`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.12, vinheta: 0.15 });
    c.fillStyle = "rgba(61,57,41,.12)";
    for (let x = 30; x < W; x += 60) for (let y = 30; y < H; y += 60) { c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); }
    const z = 1 + 0.05 * fase(t, 3, 4.5), v = 1 - fase(t, 4.55, 4.95);
    c.save(); c.globalAlpha = v; c.translate(W / 2, H / 2); c.scale(z, z);
    const ramos = [["voz", -2.4, CLAUDE.terracota], ["roteiro", -1.4, CLAUDE.oliva], ["edição", -0.3, CLAUDE.ceu], ["música", 0.8, CLAUDE.argila], ["ritmo", 1.9, "#8e7cc3"], ["gancho", 2.9, CLAUDE.oliva]];
    ramos.forEach(([s, a, cor], i) => {
      const t0 = 0.4 + i * 0.25, k = fase(t, t0, t0 + 0.6), L = 400;
      const ex = Math.cos(a) * L, ey = Math.sin(a) * L * 1.5;
      c.strokeStyle = cor; c.lineCap = "round";
      const pts = [...Array(20)].map((_, j) => { const u = j / 19; return [lerp(0, ex, u) + Math.sin(u * 3) * 40, lerp(0, ey, u)]; });
      c.lineWidth = 16; tracar(c, pts, k, false);
      if (k > 0.95) { const s2 = entra(t, t0 + 0.55, 0.3); c.save(); c.translate(ex, ey); c.scale(s2, s2); recorte(c, -130, -45, 260, 90, "#fff", { seed: i, amp: 2, sombra: 8 }); texto(c, s, 0, 2, { tam: 46, peso: 700, cor }); c.restore(); }
    });
    const s = entra(t, 0.1);
    c.scale(s, s); c.fillStyle = CLAUDE.tinta; c.beginPath(); c.arc(0, 0, 170, 0, 7); c.fill();
    texto(c, "VÍDEO", 0, -20, { tam: 64, peso: 900, cor: CLAUDE.papel }); texto(c, "curto", 0, 50, { tam: 48, fonte: SERIF, peso: 400, cor: CLAUDE.terracota });
    c.restore();
  },
});

semente({
  id: "receita-passos", nome: "Receita em passos", grupo: "vertical", formato: "9:16",
  resumo: "Ingredientes que caem no pote com medida escrita ao lado, o pote enche. Explica qualquer fórmula.",
  receita: `Vídeo vertical 9:16 que monta uma "receita" (de comida ou metafórica: receita de um bom vídeo, de um lançamento).
Estrutura: um pote/copo grande no centro inferior; cada ingrediente cai do topo, mergulha e sobe o nível do líquido com uma camada de cor nova; a medida aparece ao lado numa etiqueta ("2 colheres de contexto").
Visual: ilustração plana com contorno grosso, fundo creme, camadas com borda ondulada.
Movimento: queda com gravidade, respingo, nível sobe com mola. No fim, um canudo e um brilho.
Use para: fórmulas, frameworks, "o que entra num bom X".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f6efe2", { grao: 0.14, vinheta: 0.2 });
    texto(c, "Receita de um bom vídeo", W / 2, 220, { tam: 66, fonte: SERIF, peso: 600 });
    const ings = [["gancho", CLAUDE.terracota, "1 pergunta"], ["história", CLAUDE.oliva, "2 viradas"], ["ritmo", CLAUDE.ceu, "cortes secos"], ["final", "#e9b949", "1 chamada"]];
    const cx = W / 2, base = 1650, larg = 520, alt = 760, v = 1 - fase(t, 4.55, 4.95);
    c.save(); c.globalAlpha = v;
    let nivel = 0;
    ings.forEach(([s, cor, med], i) => {
      const t0 = 0.4 + i * 0.85, q = clamp((t - t0) / 0.45), h = 150 * sai(fase(t, t0 + 0.4, t0 + 0.8));
      if (h > 0) { c.fillStyle = cor; c.beginPath(); c.moveTo(cx - larg / 2 + 10, base - nivel);
        for (let x = 0; x <= larg - 20; x += 20) c.lineTo(cx - larg / 2 + 10 + x, base - nivel - h + 8 * Math.sin(x / 40 + t * 4 + i));
        c.lineTo(cx + larg / 2 - 10, base - nivel); c.fill(); }
      if (q > 0 && q < 1) { c.fillStyle = cor; c.beginPath(); c.arc(cx + (i % 2 ? 60 : -60), lerp(300, base - nivel - 60, q * q), 50, 0, 7); c.fill(); }
      if (t > t0 + 0.4) { const k = entra(t, t0 + 0.4, 0.3); c.save(); c.translate(i % 2 ? cx + 420 : cx - 420, base - nivel - h / 2); c.scale(k, k); c.rotate(i % 2 ? 0.06 : -0.06);
        recorte(c, -150, -55, 300, 110, "#fff", { seed: i + 4, amp: 2, sombra: 6 }); texto(c, med, 0, -12, { tam: 34, peso: 700 }); texto(c, s, 0, 26, { tam: 30, peso: 400, cor }); c.restore(); }
      nivel += h;
    });
    c.strokeStyle = CLAUDE.tinta; c.lineWidth = 12; c.lineJoin = "round";
    c.beginPath(); c.moveTo(cx - larg / 2 - 20, base - alt); c.lineTo(cx - larg / 2, base + 20); c.lineTo(cx + larg / 2, base + 20); c.lineTo(cx + larg / 2 + 20, base - alt); c.stroke();
    c.restore();
  },
});

semente({
  id: "print-lupa", nome: "Print com lupa", grupo: "vertical", formato: "9:16",
  resumo: "Um print de tela pequeno, a lupa passa e amplia o trecho que importa, marca-texto e seta à mão.",
  receita: `Vídeo vertical 9:16 que destaca um detalhe dentro de um print (site, planilha, documento).
Estrutura: o print inteiro aparece colado com fita sobre fundo neutro; uma lupa circular passeia e para no trecho importante; dentro dela o conteúdo aparece ampliado 2,5x; uma seta desenhada à mão aponta e um rótulo escreve o porquê.
Visual: print em card branco com sombra, lupa com aro grosso e reflexo, seta em caneta vermelha.
Movimento: lupa em curva suave, parada com pequeno quique, seta traçada.
Use para: notícia, termo de uso, dado escondido, "olha o que tem aqui".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#e7e3da", { grao: 0.15, vinheta: 0.25 });
    const doc = (cc) => {
      cc.fillStyle = "#fff"; cc.fillRect(140, 420, 800, 1080);
      for (let i = 0; i < 16; i++) { const r = rng(i); cc.fillStyle = i === 9 ? CLAUDE.terracota : "#cfccc4"; rr(cc, 190, 500 + i * 60, i === 9 ? 520 : 300 + r() * 400, 22, 11); cc.fill(); }
      cc.fillStyle = CLAUDE.tinta; rr(cc, 190, 450, 400, 30, 8); cc.fill();
    };
    c.save(); c.shadowColor = "rgba(0,0,0,.2)"; c.shadowBlur = 30; c.fillStyle = "#fff"; c.fillRect(140, 420, 800, 1080); c.restore();
    doc(c); fita(c, 540, 420, 220, -0.04);
    const u = sai(fase(t, 0.3, 1.6)), lx = lerp(300, 450, u) + 40 * Math.sin(u * 3), ly = lerp(1300, 1040, u), v = 1 - fase(t, 4.5, 4.9);
    c.save(); c.globalAlpha = v; c.beginPath(); c.arc(lx, ly, 190, 0, 7); c.clip();
    c.translate(lx, ly); c.scale(2.5, 2.5); c.translate(-lx, -ly); c.fillStyle = "#fff"; c.fillRect(0, 0, W, H); doc(c); c.restore();
    c.save(); c.globalAlpha = v; c.strokeStyle = "#333"; c.lineWidth = 22; c.beginPath(); c.arc(lx, ly, 190, 0, 7); c.stroke();
    c.lineWidth = 40; c.lineCap = "round"; c.beginPath(); c.moveTo(lx + 140, ly + 140); c.lineTo(lx + 280, ly + 280); c.stroke();
    c.strokeStyle = "rgba(255,255,255,.6)"; c.lineWidth = 10; c.beginPath(); c.arc(lx, ly, 150, 3.6, 4.4); c.stroke();
    c.strokeStyle = "#c8432b"; c.lineWidth = 10;
    tracar(c, borda([[860, 330], [760, 520], [lx + 120, ly - 170]], 4, 3, 8).slice(0, 17), fase(t, 1.7, 2.2), false);
    texto(c, "a letra miúda", 780, 270, { tam: 64, fonte: MAO, cor: "#c8432b", alpha: fase(t, 2.1, 2.4) });
    c.restore();
  },
});

// ---------- os 5 estilos do projeto Shorts (~/dev/Shorts, referencias/estilos.md): a pessoa gravada vira silhueta aqui ----------
// sem legenda e sem música (marca dos Shorts); a silhueta só marca onde fica a câmera
function vPessoa(c, x, y, s, t) {
  c.save(); c.translate(x, y + 4 * ciclo(t, 2)); c.scale(s, s);
  const g = c.createLinearGradient(0, -420, 0, 400); g.addColorStop(0, "#8d7a68"); g.addColorStop(1, "#5c4d40");
  c.fillStyle = g;
  c.beginPath(); c.ellipse(0, -250, 120, 150, 0, 0, 7); c.fill();
  c.beginPath(); c.moveTo(-330, 420); c.bezierCurveTo(-320, 40, -180, -60, 0, -70); c.bezierCurveTo(180, -60, 320, 40, 330, 420); c.fill();
  c.restore();
}
function vCamera(c, W, H, t, topo = 0, base = H) { // a "câmera": sala quente desfocada + a pessoa
  c.save(); c.beginPath(); c.rect(0, topo, W, base - topo); c.clip();
  const g = c.createLinearGradient(0, topo, 0, base); g.addColorStop(0, "#e8d6bf"); g.addColorStop(1, "#c9ad8c");
  c.fillStyle = g; c.fillRect(0, topo, W, base - topo);
  c.fillStyle = "rgba(255,240,210,.5)"; c.beginPath(); c.arc(W * 0.2, topo + (base - topo) * 0.3, 160, 0, 7); c.fill();
  c.fillStyle = "rgba(217,119,87,.35)"; c.fillRect(W * 0.72, topo + (base - topo) * 0.2, 180, 260);
  vPessoa(c, W / 2, topo + (base - topo) * 0.62, Math.min(1.1, (base - topo) / 1100), t);
  c.restore();
}
function vDivisao(c, W, y) { // blur suave entre painel e câmera, nunca linha seca
  const g = c.createLinearGradient(0, y - 70, 0, y + 70);
  g.addColorStop(0, "rgba(240,238,230,0)"); g.addColorStop(0.5, "rgba(240,238,230,.9)"); g.addColorStop(1, "rgba(240,238,230,0)");
  c.fillStyle = g; c.fillRect(0, y - 70, W, 140);
}
const SHORTS = `Base: projeto Shorts (~/dev/Shorts), peças em src/estilos/shorts/ (vertical.tsx: layouts cheia, baixo, card, some; colagem.tsx). Marca: sem legenda, sem música de fundo, cores claras do Claude (creme, terracota, sálvia), câmera estável, gancho nos 2 a 3 primeiros segundos, divisão entre painel e câmera com blur suave.`;

semente({
  id: "shorts-noticia", nome: "Notícia / curiosidade", grupo: "vertical", formato: "9:16",
  resumo: "Painel em cima com uma imagem por frase forte, a pessoa embaixo. Para novidade e curiosidade.",
  receita: `Short 9:16 de notícia ou curiosidade, com a pessoa gravada.
Estrutura: painel de cima até y≈900 com uma imagem por frase forte (print da notícia, recorte de papel ou imagem gerada), trocando a cada 3 a 6 s; câmera no layout "baixo", rosto inteiro.
Movimento: leve aproximação contínua na imagem do painel; a câmera não mexe. Número ou nome-chave entra num chip de papel dentro do painel, nunca sobre o rosto.
Use para: atualização, lançamento, tema recente, curiosidade.
${SHORTS}`,
  higgsfield: "Imagens do painel podem vir da Higgsfield, só com autorização e com o custo em créditos dito antes.",
  cena(c, t, W, H) {
    vCamera(c, W, H, t, 860, H);
    const i = t < 2.5 ? 0 : 1, z = 1 + 0.06 * ((t % 2.5) / 2.5);
    c.save(); c.beginPath(); c.rect(0, 0, W, 900); c.clip();
    fundo(c, W, 900, i ? "#dfe6ec" : "#f3ece0", { grao: 0.15, vinheta: 0.15 });
    c.translate(W / 2, 450); c.scale(z, z);
    c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 30; c.fillStyle = "#fff"; rr(c, -420, -300, 840, 560, 24); c.fill(); c.shadowColor = "transparent";
    if (!i) { texto(c, "NOVIDADE", -360, -230, { tam: 30, peso: 800, cor: CLAUDE.terracota, alinha: "left", espaco: 4 });
      texto(c, "O modelo agora", -360, -150, { tam: 60, fonte: SERIF, alinha: "left" }); texto(c, "lê vídeo inteiro", -360, -80, { tam: 60, fonte: SERIF, alinha: "left" });
      for (let k = 0; k < 4; k++) { c.fillStyle = "#e3e0d8"; rr(c, -360, 10 + k * 50, 500 + (k % 2) * 160, 20, 10); c.fill(); } }
    else { c.fillStyle = CLAUDE.oliva; for (let k = 0; k < 6; k++) { const h = 60 + k * 50 * sai(fase(t, 2.6, 3.4)); rr(c, -330 + k * 115, 220 - h, 80, h, 10); c.fill(); }
      texto(c, "3x mais rápido", 0, -220, { tam: 64, peso: 800 }); }
    c.restore();
    const k = entra(t, i ? 3.0 : 0.6, 0.3);
    c.save(); c.translate(W - 230, 780); c.rotate(0.05); c.scale(k, k);
    recorte(c, -150, -45, 300, 90, CLAUDE.terracota, { seed: i + 1, amp: 2, sombra: 8 }); texto(c, i ? "3x" : "hoje", 0, 3, { tam: 48, peso: 900, cor: "#fff" }); c.restore();
    vDivisao(c, W, 900);
  },
});

semente({
  id: "shorts-dinamico", nome: "Dinâmico", grupo: "vertical", formato: "9:16",
  resumo: "Alterna câmera cheia, card de papel em tela cheia e tela dividida a cada 2 a 4 s. Muita coisa acontecendo.",
  receita: `Short 9:16 dinâmico, com a pessoa gravada.
Estrutura: alterna a cada 2 a 4 s entre câmera "cheia", card de papel em tela cheia ("some") e tela dividida ("baixo"). A câmera é sempre a mesma; só o layout troca.
Cards: lista que se marca, antes/depois, trecho de código, print com marca-texto.
Transição: corte seco ou 0,2 a 0,3 s.
Use para: prender atenção do começo ao fim, conteúdo com muitos pontos curtos.
${SHORTS}`,
  cena(c, t, W, H) {
    const cena = Math.floor(t / (DUR / 3));
    if (cena === 0) vCamera(c, W, H, t);
    if (cena === 1) {
      fundo(c, W, H, CLAUDE.creme, { grao: 0.15, vinheta: 0.1 });
      const t0 = DUR / 3;
      c.save(); c.translate(W / 2, H / 2); c.rotate(-0.03); c.scale(entra(t, t0, 0.25), entra(t, t0, 0.25));
      recorte(c, -420, -420, 840, 840, "#fff", { seed: 3, amp: 3 });
      ["abrir o terminal", "rodar o comando", "conferir o resultado"].forEach((s, i) => {
        const on = fase(t, t0 + 0.3 + i * 0.3, t0 + 0.45 + i * 0.3);
        c.fillStyle = on > 0.5 ? CLAUDE.oliva : "#ddd"; rr(c, -340, -250 + i * 200, 80, 80, 16); c.fill();
        if (on > 0.5) texto(c, "✓", -300, -208 + i * 200, { tam: 60, cor: "#fff" });
        texto(c, s, -220, -210 + i * 200, { tam: 54, peso: 600, alinha: "left" });
      });
      c.restore();
    }
    if (cena === 2) {
      vCamera(c, W, H, t, 860, H);
      c.save(); c.beginPath(); c.rect(0, 0, W, 900); c.clip(); fundo(c, W, 900, "#1f1e1b", { grao: 0.2, vinheta: 0.2 });
      ["$ claude", "> faz o resumo do vídeo", "✓ pronto em 12 s"].forEach((s, i) => texto(c, digita(s, fase(t, 3.4 + i * 0.3, 3.7 + i * 0.3)), 120, 300 + i * 110, { tam: 54, fonte: MONO, peso: 500, alinha: "left", cor: i === 2 ? CLAUDE.oliva : "#f0eee6" }));
      c.restore(); vDivisao(c, W, 900);
    }
  },
});

semente({
  id: "shorts-dividida", nome: "Dividida equilibrada", grupo: "vertical", formato: "9:16",
  resumo: "App reconstruído em cima com cursor e clique, a pessoa embaixo. Explica uma ferramenta com calma.",
  receita: `Short 9:16 que explica uma ferramenta com calma, com a pessoa gravada.
Estrutura: app ou site no painel de cima (até y≈900), câmera no layout "baixo". Uma tela por ideia.
App: reconstruído em camadas (cursor, clique, digitação; peças de src/estilos/demo-tutorial/) ou print com zoom no que está sendo dito.
De vez em quando uma ilustração em tela cheia ou a câmera cheia para a frase de impacto.
Use para: tutorial curto, "como eu uso X", mostrar um recurso.
${SHORTS}`,
  cena(c, t, W, H) {
    vCamera(c, W, H, t, 860, H);
    c.save(); c.beginPath(); c.rect(0, 0, W, 900); c.clip(); fundo(c, W, 900, "#ebe7de", { grao: 0.1, vinheta: 0.1 });
    c.shadowColor = "rgba(0,0,0,.15)"; c.shadowBlur = 30; c.fillStyle = CLAUDE.papel; rr(c, 80, 120, 920, 700, 28); c.fill(); c.shadowColor = "transparent";
    c.fillStyle = "#e6e2d8"; rr(c, 80, 120, 920, 70, 28); c.fill(); ["#e0796a", "#e9b949", "#8fb07a"].forEach((cor, i) => { c.fillStyle = cor; c.beginPath(); c.arc(130 + i * 40, 155, 12, 0, 7); c.fill(); });
    c.fillStyle = "#fff"; rr(c, 140, 640, 800, 110, 24); c.fill(); c.strokeStyle = "#ddd"; c.lineWidth = 3; c.stroke();
    texto(c, digita("Resume esse PDF em 5 tópicos", fase(t, 0.8, 2.2)), 180, 695, { tam: 40, alinha: "left", peso: 500 });
    const env = fase(t, 2.6, 2.8);
    if (env > 0) { c.fillStyle = CLAUDE.areia; rr(c, 440, 240, 500, 90, 24); c.fill(); texto(c, "Resume esse PDF...", 470, 287, { tam: 34, alinha: "left" });
      for (let k = 0; k < 5; k++) { const a = fase(t, 3 + k * 0.2, 3.2 + k * 0.2); c.fillStyle = `rgba(61,57,41,${0.25 * a})`; rr(c, 160, 380 + k * 45, 300 + (k * 97) % 300, 18, 9); c.fill(); } }
    const cx = t < 2.3 ? lerp(700, 880, fase(t, 1.9, 2.3)) : 880, cy = t < 2.3 ? lerp(500, 695, fase(t, 1.9, 2.3)) : 695;
    const clique = 1 - 0.2 * (fase(t, 2.35, 2.45) - fase(t, 2.45, 2.6));
    c.save(); c.translate(cx, cy); c.scale(clique, clique); c.fillStyle = "#111"; c.strokeStyle = "#fff"; c.lineWidth = 4;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 52); c.lineTo(14, 40); c.lineTo(26, 64); c.lineTo(36, 58); c.lineTo(24, 36); c.lineTo(42, 36); c.closePath(); c.fill(); c.stroke(); c.restore();
    c.restore(); vDivisao(c, W, 900);
  },
});

semente({
  id: "shorts-tela-gravada", nome: "Tela gravada", grupo: "vertical", formato: "9:16",
  resumo: "Tela grande no topo com zoom no que é falado, a câmera num card menor embaixo com borda creme.",
  receita: `Short 9:16 em que a tela manda, com a pessoa gravada.
Estrutura: tela grande no topo (até y≈1160): gravação do RecMove, execução real ou print do post/página; câmera em "card" retangular menor embaixo, com borda creme.
Movimento: zoom suave na área da tela que está sendo falada, uma área por frase; a câmera acompanha sem mexer.
Use para: mostrar algo executando de verdade, resultado na tela, passo a passo rápido.
${SHORTS}`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.12, vinheta: 0.1 });
    const z = 1 + 0.35 * (fase(t, 1, 1.8) - fase(t, 3.6, 4.4)), fx = 700, fy = 760;
    c.save(); rr(c, 40, 80, W - 80, 1080, 30); c.clip();
    c.translate(fx, fy); c.scale(z, z); c.translate(-fx, -fy);
    c.fillStyle = "#1e1d1a"; c.fillRect(40, 80, W - 80, 1080);
    for (let i = 0; i < 14; i++) { c.fillStyle = i === 9 ? CLAUDE.terracota : "rgba(240,238,230," + (0.15 + (i % 3) * 0.1) + ")"; rr(c, 100, 160 + i * 66, 240 + ((i * 131) % 600), 26, 8); c.fill(); }
    texto(c, "✓ 128 arquivos organizados", 100, 790, { tam: 34, fonte: MONO, alinha: "left", cor: "#9fd18b", alpha: fase(t, 1.2, 1.5) });
    c.restore();
    c.save(); c.translate(W / 2, 1520); c.fillStyle = CLAUDE.papel; rr(c, -330, -300, 660, 600, 40); c.fill();
    rr(c, -310, -280, 620, 560, 30); c.clip(); c.translate(-310, -280); vCamera(c, 620, 560, t, 0, 560); c.restore();
  },
});

semente({
  id: "shorts-colagem", nome: "Colagem sobre a câmera", grupo: "vertical", formato: "9:16",
  resumo: "Recortes P&B com um acento terracota surgem acima da cabeça, corte seco para a mesa da analogia, carimbo de veredito.",
  receita: `Short 9:16 que explica por analogia, com humor, com a pessoa gravada.
Estrutura: duas cenas que se alternam com corte seco: câmera "cheia" com recortes flutuando acima da cabeça (fora da zona do rosto), e a "mesa" em tela cheia para a analogia.
Entrada: pop com sobra em 0,2 s (60% → 110% → 100%), já inclinado 2 a 4°; um recorte por frase, no gatilho da palavra. O carimbo entra com mais força.
Parado: quase imóvel, tremido de stop motion (8 poses por segundo, ±1,5 px). Os recortes acumulam até a cena trocar.
Vocabulário: foto recortada em P&B com um só acento terracota e borda branca de adesivo, etiqueta "X = Y", carimbo redondo como veredito, tíquete com "??".
Retorno: o objeto da analogia volta sobre a câmera no fecho.
${SHORTS}`,
  higgsfield: "Recortes P&B podem ser gerados na Higgsfield (PNG sem fundo), só com autorização e custo dito antes.",
  cena(c, t, W, H) {
    const pose = Math.floor(t * 8), tr = () => (rng(pose)() - 0.5) * 3;
    const adesivo = (x, y, w, h, rot, t0, desenho) => {
      if (t < t0) return; const k = entra(t, t0, 0.22);
      c.save(); c.translate(x + tr(), y + tr()); c.rotate(rot); c.scale(k, k);
      c.shadowColor = "rgba(0,0,0,.25)"; c.shadowBlur = 16; c.fillStyle = "#fff"; rr(c, -w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 26); c.fill(); c.shadowColor = "transparent";
      desenho(w, h); c.restore();
    };
    if (t < 2.5) {
      vCamera(c, W, H, t);
      adesivo(300, 330, 300, 220, -0.06, 0.3, (w, h) => { c.fillStyle = "#6d6d6d"; rr(c, -w / 2, -h / 2, w, h, 16); c.fill(); c.fillStyle = "#bbb"; for (let i = 0; i < 4; i++) c.fillRect(-w / 2 + 30, -h / 2 + 30 + i * 45, w - 60, 20); c.fillStyle = CLAUDE.terracota; c.fillRect(-w / 2 + 30, -h / 2 + 165, 60, 20); });
      adesivo(760, 300, 320, 110, 0.05, 1.0, () => { texto(c, "servidor = cozinha", 0, 2, { tam: 40, peso: 800 }); });
      adesivo(560, 560, 140, 140, 0.1, 1.6, () => { texto(c, "??", 0, 4, { tam: 80, peso: 900, cor: CLAUDE.terracota }); });
    } else {
      fundo(c, W, H, "#d7c3a3", { grao: 0.3, vinheta: 0.25 });
      adesivo(W / 2, 900, 760, 360, -0.03, 2.5, (w, h) => { c.fillStyle = "#8a8a8a"; rr(c, -w / 2, -h / 2 + 120, w, h - 120, 20); c.fill();
        for (let i = 0; i < 4; i++) { c.fillStyle = "#555"; c.beginPath(); c.ellipse(-270 + i * 180, -40, 70, 26, 0, 0, 7); c.fill(); c.fillStyle = CLAUDE.terracota; c.beginPath(); c.moveTo(-290 + i * 180, -50); c.lineTo(-270 + i * 180, -110 - 15 * Math.sin(pose + i)); c.lineTo(-250 + i * 180, -50); c.fill(); } });
      adesivo(W / 2 - 180, 1300, 360, 110, 0.04, 3.0, () => { texto(c, "seu Mac = fogão", 0, 2, { tam: 40, peso: 800 }); });
      if (t > 3.6) { const k = lerp(2.2, 1, fase(t, 3.6, 3.75)); c.save(); c.translate(W / 2 + 220, 1520); c.rotate(-0.25); c.scale(k, k); c.globalAlpha = 0.9;
        c.strokeStyle = CLAUDE.argila; c.lineWidth = 12; c.beginPath(); c.arc(0, 0, 150, 0, 7); c.stroke(); c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 125, 0, 7); c.stroke();
        texto(c, "MESMO", 0, -20, { tam: 54, peso: 900, cor: CLAUDE.argila }); texto(c, "SABOR", 0, 40, { tam: 54, peso: 900, cor: CLAUDE.argila }); c.restore(); }
    }
  },
});
