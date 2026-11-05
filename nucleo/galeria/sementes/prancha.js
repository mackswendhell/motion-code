// Grupo Prancha e explicador: processos, ciclos, mapas e anatomia em desenho.

const P_LINHA = (c, pts, k, cor, larg = 6) => { c.strokeStyle = cor; c.lineWidth = larg; c.lineCap = c.lineJoin = "round"; tracar(c, pts, k, false); };
function pEtiqueta(c, x, y, s, { tam = 34, cor = CLAUDE.tinta, fundo = "#fbf8f1", borda = "#9a937f", k = 1, rot = 0, fonte = MONO } = {}) {
  if (k <= 0) return;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(k, k);
  c.font = `500 ${tam}px ${fonte}`; const w = c.measureText(s).width + tam * 1.1, h = tam * 1.9;
  c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 10; c.shadowOffsetY = 3;
  c.fillStyle = fundo; c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = "transparent";
  c.strokeStyle = borda; c.lineWidth = 2; c.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);
  texto(c, s, 0, 2, { tam, fonte, peso: 500, cor });
  c.restore();
}

semente({
  id: "atlas-celular", estilo: "atlas", nome: "Atlas científico", grupo: "prancha", formato: "1:1",
  resumo: "Faixas de papel rasgado mudam de cor por fase, um fio trançado desce pelo fluxograma de etiquetas. Ciência com cara de livro.",
  receita: `Explicador 1:1 (ou 16:9) no estilo atlas científico ilustrado. É o estilo "Atlas" do estúdio (estilos/atlas/).
Estrutura: o processo é uma descida vertical; cada fase ocupa uma faixa horizontal de papel com borda rasgada e cor própria (sálvia, areia, ameixa, azul-noite); a câmera desce de faixa em faixa.
Fluxo: caixas-etiqueta de papel com borda dupla e fonte mono ("Crescendo (G1)") ligadas por um fio trançado amarelo que percorre o caminho certo; o caminho errado é um fio vermelho com rótulo entre colchetes ("[checagem quebrada]").
Desenho: ilustrações com contorno fino e aquarela (células, moléculas, objetos), pequenas notas manuscritas em fonte mono ao redor.
Movimento: fio se desenha à frente da câmera, etiquetas assentam com pop leve, ilustrações respiram.
Fecho: um painel escuro com o resumo em tópicos e um pequeno gráfico circular do ciclo.
Use para: biologia, processos de empresa, algoritmos, qualquer "o que acontece em cada etapa".`,
  higgsfield: "As ilustrações de cada faixa (célula, órgão, máquina) podem ser pintadas na Higgsfield em aquarela com contorno fino, peça por peça com fundo transparente; faixas, etiquetas e o fio ficam no código.",
  cena(c, t, W, H) {
    const faixas = [["#cfdcc6", "Crescendo (G1)"], ["#d8b98f", "Copiando o DNA"], ["#3c3150", "Dividindo"], ["#cfdcc6", "Crescendo (G1)"]];
    const cam = (t / DUR) * 3 * 900;
    c.save(); c.translate(0, -cam);
    faixas.forEach(([cor, nome], i) => {
      const y = i * 900, pts = retRasgado(-20, y - 30, W + 40, 960, 10, i + 3);
      caminho(c, pts); c.fillStyle = cor; c.fill();
      c.save(); c.globalAlpha = 0.15; c.globalCompositeOperation = "multiply"; c.fillStyle = padraoGrao(c); c.fill(); c.restore();
      const esc = i === 2;
      for (let k = 0; k < 3; k++) {
        const cx = [230, 860, 760][k], cy = y + [300, 250, 680][k], r = [110, 80, 60][k] * (1 + 0.04 * ciclo(t, 2 + k));
        c.fillStyle = esc ? "rgba(230,140,170,.75)" : "rgba(230,150,160,.55)"; c.beginPath(); c.ellipse(cx, cy, r * 1.3, r, k, 0, 7); c.fill();
        c.strokeStyle = esc ? "#f1d9e2" : "#7a4a52"; c.lineWidth = 3; c.stroke();
        c.fillStyle = "#8a6fb3"; c.beginPath(); c.arc(cx + 10, cy, r * 0.4, 0, 7); c.fill();
      }
      pEtiqueta(c, W / 2, y + 440, nome, { tam: 38, k: entra(t + 0.0001, (y - 200) / 2700 * DUR, 0.4) });
      texto(c, ["o açúcar entra e a célula cresce", "cada fio é copiado", "os fios se enrolam em cromossomos", "e tudo começa de novo"][i], 80, y + 820, { tam: 30, fonte: MONO, peso: 400, alinha: "left", cor: esc ? "#e8e0f0" : "#4b4636" });
    });
    const fio = [...Array(60)].map((_, j) => [W / 2 + 70 * Math.sin(j * 0.35), j * 50 - 40]);
    c.setLineDash([16, 10]); P_LINHA(c, fio, 1, "#e2b93b", 14); c.setLineDash([]);
    P_LINHA(c, fio, 1, "rgba(120,90,20,.5)", 3);
    c.restore();
  },
});

semente({
  id: "ciclo-circular", nome: "Ciclo em roda", grupo: "prancha", formato: "16:9",
  resumo: "Quatro etapas numa roda, uma seta grossa percorre e acende cada uma. O clássico ciclo, sem ficar escolar.",
  receita: `Explicador 16:9 de um ciclo que se repete (água, vendas, hábito, ciclo de vida).
Estrutura: 4 a 6 etapas em volta de um círculo, cada uma um ícone desenhado num disco de papel; uma seta curva grossa percorre o anel e, ao passar, a etapa acende (cor, escala 1.1) e o nome aparece ao lado.
Centro: o nome do ciclo em serifa, com um contador de voltas.
Visual: fundo creme, anel tracejado, discos com sombra de papel recortado.
Movimento: seta com velocidade constante (o loop fecha sozinho), etapa anterior apaga devagar.
Use para: qualquer processo circular, retenção, feedback loop.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.14, vinheta: 0.2 });
    const cx = W / 2, cy = H / 2 + 20, R = 340, et = [["evapora", "☀"], ["condensa", "☁"], ["chove", "☂"], ["escorre", "≈"]];
    c.setLineDash([14, 14]); c.strokeStyle = "rgba(61,57,41,.3)"; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke(); c.setLineDash([]);
    const a = -Math.PI / 2 + (t / DUR) * Math.PI * 2;
    c.strokeStyle = CLAUDE.terracota; c.lineWidth = 26; c.lineCap = "round"; c.beginPath(); c.arc(cx, cy, R, a - 0.9, a); c.stroke();
    c.fillStyle = CLAUDE.terracota; c.save(); c.translate(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.rotate(a + Math.PI / 2);
    c.beginPath(); c.moveTo(34, 0); c.lineTo(-24, -34); c.lineTo(-24, 34); c.fill(); c.restore();
    et.forEach(([nome, ic], i) => {
      const ai = -Math.PI / 2 + (i + 0.5) * (Math.PI / 2), d = ((a - ai) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const luz = d < 1.2 ? 1 - d / 1.2 : 0, x = cx + Math.cos(ai) * R, y = cy + Math.sin(ai) * R, s = 1 + 0.12 * luz;
      c.save(); c.translate(x, y); c.scale(s, s);
      c.shadowColor = "rgba(0,0,0,.2)"; c.shadowBlur = 16; c.shadowOffsetY = 5;
      c.fillStyle = mistura("#fbf8f1", "#f1c7b4", luz); c.beginPath(); c.arc(0, 0, 88, 0, 7); c.fill(); c.shadowColor = "transparent";
      texto(c, ic, 0, 4, { tam: 80, cor: mistura("#3d3929", "#c6613f", luz) }); c.restore();
      texto(c, nome, x + Math.cos(ai) * 190, y + Math.sin(ai) * 150, { tam: 44, fonte: SERIF, peso: 600, alpha: 0.35 + 0.65 * luz });
    });
    texto(c, "o ciclo", cx, cy - 20, { tam: 70, fonte: SERIF, peso: 500 });
    texto(c, "da água", cx, cy + 50, { tam: 44, fonte: SERIF, peso: 400, cor: CLAUDE.argila });
  },
});

semente({
  id: "fluxograma-bolinha", nome: "Fluxograma com bolinha", grupo: "prancha", formato: "16:9",
  resumo: "Caixas e losangos de decisão; uma bolinha de luz percorre o caminho e escolhe o lado. Lógica que se entende.",
  receita: `Explicador 16:9 de fluxo com decisões (algoritmo, atendimento, regra de negócio).
Estrutura: caixas retangulares para ações, losangos para perguntas, setas finas; uma bolinha brilhante (a "pessoa" ou o "dado") percorre o caminho; nos losangos ela hesita, o rótulo "sim"/"não" pisca e ela escolhe.
Visual: fundo azul-papel (#e9eef0) com grade fina de engenharia, formas brancas com contorno grafite, caminho percorrido fica pintado na cor de acento.
Movimento: bolinha com velocidade constante nos retos e pausa de 0,3 s nas decisões; câmera acompanha de leve.
Use para: explicar processo, automação, "o que acontece quando você clica".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#e9eef0", { grao: 0.08, vinheta: 0.15 });
    c.strokeStyle = "rgba(60,90,110,.12)"; c.lineWidth = 1.5;
    for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let y = 0; y < H; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    const nos = { a: [260, 540, "pedido chega"], b: [720, 540, "tem estoque?", 1], c: [1180, 340, "envia hoje"], d: [1180, 760, "avisa o cliente"], e: [1640, 540, "fim"] };
    const lig = [["a", "b"], ["b", "c"], ["b", "d"], ["c", "e"], ["d", "e"]];
    const rota = [nos.a, nos.b, nos.c, nos.e].map(([x, y]) => [x, y]);
    const u = t / DUR, seg = Math.min(2, Math.floor(u * 3)), k = clamp(u * 3 - seg);
    lig.forEach(([p, q]) => { const [x1, y1] = nos[p], [x2, y2] = nos[q]; const on = ["ab", "bc", "ce"].indexOf(p + q);
      c.strokeStyle = on >= 0 && (on < seg || (on === seg && k > 0)) ? CLAUDE.terracota : "#56626b"; c.lineWidth = on >= 0 && on <= seg ? 6 : 3;
      c.beginPath(); c.moveTo(x1, y1); c.lineTo((x1 + x2) / 2, y1); c.lineTo((x1 + x2) / 2, y2); c.lineTo(x2, y2); c.stroke(); });
    Object.values(nos).forEach(([x, y, s, losango]) => {
      c.save(); c.translate(x, y); c.fillStyle = "#fff"; c.strokeStyle = "#3b444b"; c.lineWidth = 4;
      if (losango) { c.beginPath(); c.moveTo(0, -120); c.lineTo(170, 0); c.lineTo(0, 120); c.lineTo(-170, 0); c.closePath(); }
      else rr(c, -160, -60, 320, 120, 14);
      c.fill(); c.stroke(); texto(c, s, 0, 2, { tam: 34, peso: 600, cor: "#2b3237" }); c.restore();
    });
    texto(c, "sim", 860, 410, { tam: 30, peso: 700, cor: CLAUDE.oliva, alpha: fase(t, 1.6, 1.8) });
    texto(c, "não", 860, 680, { tam: 30, peso: 700, cor: "#9a5b4b", alpha: 0.5 });
    const [x1, y1] = rota[seg], [x2, y2] = rota[seg + 1], pausa = seg === 1 ? sai(fase(k, 0.25, 1)) : k;
    const mx = (x1 + x2) / 2, pts = [[x1, y1], [mx, y1], [mx, y2], [x2, y2]];
    const L = [Math.abs(mx - x1), Math.abs(y2 - y1), Math.abs(x2 - mx)], tot = L[0] + L[1] + L[2]; let d = pausa * tot, i = 0;
    while (i < 2 && d > L[i]) { d -= L[i]; i++; }
    const f = L[i] ? d / L[i] : 0, bx = lerp(pts[i][0], pts[i + 1][0], f), by = lerp(pts[i][1], pts[i + 1][1], f);
    const g = c.createRadialGradient(bx, by, 0, bx, by, 60); g.addColorStop(0, "rgba(217,119,87,.9)"); g.addColorStop(1, "rgba(217,119,87,0)");
    c.fillStyle = g; c.beginPath(); c.arc(bx, by, 60, 0, 7); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(bx, by, 14, 0, 7); c.fill();
  },
});

semente({
  id: "linha-do-tempo", nome: "Linha do tempo", grupo: "prancha", formato: "16:9",
  resumo: "Régua horizontal com anos; a câmera desliza e cada marco sobe como cartão com ilustração. História em 30 segundos.",
  receita: `Explicador 16:9 de história ou evolução (de uma tecnologia, empresa, pessoa).
Estrutura: uma régua horizontal longa com marcas de ano; a câmera desliza da esquerda para a direita; em cada marco um cartão de papel sobe da régua com ano grande, título curto e uma ilustração simples.
Visual: fundo papel envelhecido, régua em tinta escura, cartões alternando acima e abaixo da linha, ponto ativo em terracota.
Movimento: travelling contínuo com leve desaceleração em cada marco; cartão sobe com mola; ano anterior perde opacidade.
Use para: história, "como chegamos aqui", retrospectiva do ano.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#efe6d4", { grao: 0.2, vinheta: 0.3 });
    const marcos = [["1950", "a pergunta"], ["1997", "o xadrez"], ["2012", "as imagens"], ["2017", "a atenção"], ["2022", "a conversa"], ["2026", "os agentes"]];
    const passo = 520, u = t / DUR, pos = u * (marcos.length - 1) * passo, cam = pos - W / 2 + 200;
    const y0 = H / 2 + 60;
    c.save(); c.translate(-cam, 0);
    c.strokeStyle = CLAUDE.tinta; c.lineWidth = 6; c.beginPath(); c.moveTo(-400, y0); c.lineTo(marcos.length * passo + 400, y0); c.stroke();
    for (let x = -400; x < marcos.length * passo + 400; x += 52) { c.lineWidth = 3; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + (x % 260 === 0 ? 26 : 14)); c.stroke(); }
    marcos.forEach(([ano, s], i) => {
      const x = 200 + i * passo, perto = clamp(1 - Math.abs(pos - i * passo) / passo), cima = i % 2 === 0;
      c.fillStyle = perto > 0.6 ? CLAUDE.terracota : CLAUDE.tinta; c.beginPath(); c.arc(x, y0, 16 + 8 * perto, 0, 7); c.fill();
      const k = sai(perto * 1.4), y = cima ? y0 - 70 - 220 * k : y0 + 70 + 220 * k;
      if (perto < 0.05) return;
      c.save(); c.globalAlpha = perto; c.translate(x, y); c.rotate(cima ? -0.03 : 0.03);
      recorte(c, -170, -120, 340, 240, "#fbf8f1", { seed: i + 2, amp: 3, sombra: 10 });
      texto(c, ano, 0, -40, { tam: 80, fonte: SERIF, peso: 600, cor: perto > 0.6 ? CLAUDE.argila : CLAUDE.tinta });
      texto(c, s, 0, 50, { tam: 38, fonte: SERIF, peso: 400 });
      c.restore();
    });
    c.restore();
  },
});

semente({
  id: "mapa-rota", nome: "Mapa com rota", grupo: "prancha", formato: "16:9",
  resumo: "Mapa ilustrado em tons de papel, a rota tracejada se desenha entre cidades e o pino pula no destino.",
  receita: `Explicador 16:9 com mapa ilustrado (viagem, logística, expansão, história de um lugar).
Estrutura: mapa simplificado com massas de terra em aquarela, rios em azul claro, nomes em serifa itálica; a rota tracejada se desenha de um ponto ao outro, com um ícone (avião, barco, caminhão) na ponta; pinos caem nas paradas.
Visual: papel de mapa antigo, rosa-dos-ventos no canto, borda dupla.
Movimento: câmera acompanha a ponta da rota com zoom leve; pino cai com quique.
Use para: rotas, onde a empresa atua, "de onde vem o café".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#cfe0e3", { grao: 0.18, vinheta: 0.3 });
    const r = rng(4);
    [[560, 520, 420, 300], [1350, 420, 360, 260], [1150, 820, 300, 180]].forEach(([x, y, a, b], i) => {
      const pts = [...Array(28)].map((_, j) => { const an = (j / 28) * 7; return [x + Math.cos(an) * a * (0.8 + 0.25 * Math.sin(an * 3 + i)), y + Math.sin(an) * b * (0.8 + 0.2 * Math.cos(an * 2 + i))]; });
      caminho(c, tremido(pts, 8, rng(i + 1), 3)); c.fillStyle = ["#e8dcbc", "#e3d3ad", "#dfd6b4"][i]; c.fill(); c.strokeStyle = "#a08a63"; c.lineWidth = 3; c.stroke();
    });
    for (let i = 0; i < 40; i++) { c.fillStyle = "rgba(120,140,90,.35)"; c.beginPath(); c.arc(300 + r() * 600, 350 + r() * 300, 8 + r() * 14, 0, 7); c.fill(); }
    const paradas = [[380, 560, "Lisboa"], [760, 420, "Madri"], [1250, 380, "Roma"], [1200, 820, "Túnis"]];
    const rota = [];
    for (let i = 0; i < paradas.length - 1; i++) for (let k = 0; k <= 20; k++) { const [x1, y1] = paradas[i], [x2, y2] = paradas[i + 1], u = k / 20; rota.push([lerp(x1, x2, u), lerp(y1, y2, u) - Math.sin(u * Math.PI) * 90]); }
    const k = fase(t, 0.3, 4.0) * (1 - fase(t, 4.6, 4.95));
    c.setLineDash([18, 14]); P_LINHA(c, rota, k, CLAUDE.argila, 7); c.setLineDash([]);
    paradas.forEach(([x, y, n], i) => {
      const tp = 0.3 + (i / 3) * 3.7, s = entra(t, tp, 0.35) * (1 - fase(t, 4.6, 4.95));
      if (s <= 0) return;
      c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = CLAUDE.terracota;
      c.beginPath(); c.arc(0, -50, 26, Math.PI, 0); c.lineTo(0, 0); c.closePath(); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(0, -50, 10, 0, 7); c.fill(); c.restore();
      texto(c, n, x, y + 40, { tam: 36, fonte: SERIF, peso: "italic 400", alpha: s, cor: "#5a4a30" });
    });
    c.save(); c.translate(W - 160, 160); c.rotate(t * 0.1); c.fillStyle = CLAUDE.tinta;
    for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, -90); c.lineTo(14, 0); c.lineTo(-14, 0); c.fill(); } c.restore();
    c.strokeStyle = "#6d5a3c"; c.lineWidth = 4; c.strokeRect(24, 24, W - 48, H - 48); c.lineWidth = 1.5; c.strokeRect(36, 36, W - 72, H - 72);
  },
});

semente({
  id: "anatomia-rotulos", nome: "Anatomia com rótulos", grupo: "prancha", formato: "16:9",
  resumo: "Um objeto no centro, linhas finas saem das partes e terminam em rótulos que se escrevem. Desmonta qualquer coisa.",
  receita: `Explicador 16:9 que nomeia as partes de algo (produto, corpo, interface, argumento).
Estrutura: o objeto ilustrado grande no centro, girando de leve; linhas finas com ponto na ponta saem de cada parte e terminam em rótulos à esquerda e à direita, que se escrevem letra a letra; a parte citada ganha um halo.
Visual: fundo creme liso, objeto em ilustração plana com sombra suave, linhas em grafite, rótulos em serifa com número.
Movimento: uma parte por vez; linha se estende em 0,4 s, rótulo digita, halo pulsa.
Use para: review de produto, "as partes de um bom anúncio", anatomia.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.12, vinheta: 0.2 });
    const cx = W / 2, cy = H / 2 + 20 + 8 * ciclo(t);
    c.save(); c.translate(cx, cy); c.rotate(0.03 * ciclo(t));
    c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 40; c.shadowOffsetY = 20;
    c.fillStyle = "#f5e3a1"; c.beginPath(); c.arc(0, -90, 190, Math.PI * 0.8, Math.PI * 2.2); c.lineTo(80, 130); c.lineTo(-80, 130); c.closePath(); c.fill(); c.shadowColor = "transparent";
    c.fillStyle = "#b8b3a6"; rr(c, -90, 130, 180, 110, 16); c.fill();
    c.strokeStyle = "#8d887c"; c.lineWidth = 6; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-90, 155 + i * 24); c.lineTo(90, 150 + i * 24); c.stroke(); }
    c.strokeStyle = CLAUDE.argila; c.lineWidth = 7; c.beginPath(); c.moveTo(-40, 120); c.lineTo(-40, -40); c.bezierCurveTo(-40, -110, 40, -110, 40, -40); c.lineTo(40, 120); c.stroke();
    c.restore();
    const partes = [[cx, cy - 250, 380, 240, "1  bulbo de vidro"], [cx + 20, cy - 110, 1500, 340, "2  filamento"], [cx - 90, cy + 190, 380, 760, "3  rosca"], [cx + 90, cy + 200, 1520, 780, "4  contato"]];
    partes.forEach(([px, py, lx, ly, s], i) => {
      const t0 = 0.3 + i * 0.9, k = fase(t, t0, t0 + 0.4), v = 1 - fase(t, 4.6, 4.95);
      if (k <= 0) return;
      c.save(); c.globalAlpha = v;
      c.strokeStyle = "rgba(217,119,87," + (0.5 * ciclo01(t * 2)) + ")"; c.lineWidth = 6; c.beginPath(); c.arc(px, py, 36, 0, 7); c.stroke();
      c.strokeStyle = CLAUDE.tinta; c.lineWidth = 2.5; c.beginPath(); c.moveTo(px, py); c.lineTo(lerp(px, lx, k), lerp(py, ly, k)); c.stroke();
      c.fillStyle = CLAUDE.tinta; c.beginPath(); c.arc(px, py, 7, 0, 7); c.fill();
      texto(c, digita(s, fase(t, t0 + 0.35, t0 + 0.8)), lx + (lx < cx ? -14 : 14), ly, { tam: 40, fonte: SERIF, peso: 500, alinha: lx < cx ? "right" : "left" });
      c.restore();
    });
  },
});

semente({
  id: "vista-explodida", nome: "Vista explodida", grupo: "prancha", formato: "16:9",
  resumo: "As camadas de algo se separam no ar, cada uma com seu nome, e voltam a se encaixar. Mostra o que tem dentro.",
  receita: `Explicador 16:9 em vista explodida isométrica (produto, app em camadas, solo, sanduíche, arquitetura de sistema).
Estrutura: as camadas empilhadas em perspectiva isométrica; elas se afastam verticalmente, cada uma ganha uma etiqueta lateral ligada por linha tracejada; depois voltam e se encaixam com um "clique".
Visual: placas isométricas com topo claro e lados mais escuros da mesma cor, sombra no chão que cresce quando abre.
Movimento: separação com ease-in-out, pausa aberta, fechamento com pequeno quique.
Use para: arquitetura de software, ingredientes, "o que tem dentro de".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#ece8df", { grao: 0.12, vinheta: 0.25 });
    const ab = fase(t, 0.4, 1.6) * (1 - fase(t, 3.6, 4.5)), cx = W / 2 - 120, base = H / 2 + 280;
    const cam = [["dados", "#7d8f5a"], ["lógica", "#6a9bcc"], ["interface", "#d97757"], ["usuário", "#e9b949"]];
    c.fillStyle = `rgba(0,0,0,${0.08 + 0.06 * ab})`; c.beginPath(); c.ellipse(cx, base + 60, 380 + 60 * ab, 120, 0, 0, 7); c.fill();
    cam.forEach(([s, cor], i) => {
      const y = base - i * (40 + 150 * ab), w = 300, h = 170, e = 40;
      const top = [[cx, y - h], [cx + w, y - h / 2], [cx, y], [cx - w, y - h / 2]];
      c.fillStyle = mistura(cor, "#000000", 0.25); c.beginPath(); c.moveTo(cx - w, y - h / 2); c.lineTo(cx, y); c.lineTo(cx, y + e); c.lineTo(cx - w, y - h / 2 + e); c.fill();
      c.fillStyle = mistura(cor, "#000000", 0.4); c.beginPath(); c.moveTo(cx + w, y - h / 2); c.lineTo(cx, y); c.lineTo(cx, y + e); c.lineTo(cx + w, y - h / 2 + e); c.fill();
      caminho(c, top); c.fillStyle = cor; c.fill();
      c.save(); c.globalAlpha = ab; c.setLineDash([10, 8]); c.strokeStyle = CLAUDE.tinta; c.lineWidth = 2.5;
      c.beginPath(); c.moveTo(cx + w, y - h / 2); c.lineTo(cx + w + 220, y - h / 2); c.stroke(); c.setLineDash([]);
      texto(c, s, cx + w + 240, y - h / 2, { tam: 44, fonte: SERIF, peso: 600, alinha: "left" }); c.restore();
    });
  },
});

semente({
  id: "versus-colunas", nome: "Versus em colunas", grupo: "prancha", formato: "16:9",
  resumo: "Duas colunas, VS no meio, itens que entram em pares e uma balança que pende para um lado.",
  receita: `Explicador 16:9 de comparação (X vs Y: ferramentas, escolhas, antes e agora).
Estrutura: duas colunas com cabeçalho em cor própria e ícone; um selo "VS" redondo no meio; os critérios entram em pares (um de cada lado) com ✓ ou ✗; no rodapé, uma balança desenhada pende para o vencedor.
Visual: metade esquerda em tom frio, metade direita em tom quente, divisória rasgada no centro.
Movimento: pares entram alternando os lados, a balança oscila e assenta.
Use para: comparativos, "qual escolher", review lado a lado.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#e4e9ec", { grao: 0.14, vinheta: 0.15 });
    c.save(); c.fillStyle = "#f5e6dc"; caminho(c, borda([[W / 2, -10], [W + 10, -10], [W + 10, H + 10], [W / 2, H + 10]], 8, 3, 30)); c.fill(); c.restore();
    texto(c, "Planilha", W / 4, 130, { tam: 70, fonte: SERIF, peso: 600, cor: "#3a5a73" });
    texto(c, "Agente", (3 * W) / 4, 130, { tam: 70, fonte: SERIF, peso: 600, cor: CLAUDE.argila });
    const itens = [["você atualiza", "atualiza sozinho", 0, 1], ["fórmula quebra", "avisa o erro", 0, 1], ["grátis", "custa tokens", 1, 0]];
    itens.forEach(([a, b, ka, kb], i) => {
      const y = 300 + i * 130, v = 1 - fase(t, 4.6, 4.95);
      [[a, ka, W / 4, 0.4 + i * 0.6], [b, kb, (3 * W) / 4, 0.7 + i * 0.6]].forEach(([s, ok, x, t0]) => {
        const k = entra(t, t0, 0.3); if (k <= 0) return;
        c.save(); c.globalAlpha = v; c.translate(x, y); c.scale(k, k);
        texto(c, ok ? "✓" : "✗", -240, 2, { tam: 54, peso: 900, cor: ok ? CLAUDE.oliva : "#b5503c" });
        texto(c, s, -190, 2, { tam: 44, peso: 500, alinha: "left" }); c.restore();
      });
    });
    c.save(); c.translate(W / 2, 170); c.rotate(0.1 * ciclo(t)); c.fillStyle = CLAUDE.tinta; c.beginPath(); c.arc(0, 0, 70, 0, 7); c.fill();
    texto(c, "VS", 0, 4, { tam: 56, peso: 900, cor: CLAUDE.papel, fonte: GROSSA }); c.restore();
    const inc = 0.14 * fase(t, 2.4, 3.2) + 0.03 * Math.sin(t * 6) * (1 - fase(t, 3, 4)) * fase(t, 2.4, 2.6);
    c.save(); c.translate(W / 2, 830); c.strokeStyle = CLAUDE.tinta; c.lineWidth = 8; c.lineCap = "round";
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 200); c.moveTo(-80, 200); c.lineTo(80, 200); c.stroke();
    c.rotate(inc); c.beginPath(); c.moveTo(-300, 0); c.lineTo(300, 0); c.stroke();
    [-300, 300].forEach((x, i) => { c.save(); c.translate(x, 0); c.rotate(-inc); c.beginPath(); c.moveTo(0, 0); c.lineTo(-60, 80); c.moveTo(0, 0); c.lineTo(60, 80); c.stroke();
      c.fillStyle = i ? CLAUDE.terracota : "#6f8ea6"; c.beginPath(); c.ellipse(0, 85, 80, 18, 0, 0, 7); c.fill(); c.restore(); });
    c.restore();
  },
});

semente({
  id: "esteira-processo", nome: "Esteira de processo", grupo: "prancha", formato: "16:9",
  resumo: "Uma esteira leva a matéria-prima por estações; cada máquina transforma a peça. Pipeline visual.",
  receita: `Explicador 16:9 de pipeline (dado → resultado, ideia → vídeo, pedido → entrega).
Estrutura: esteira horizontal com roletes girando; a peça entra pela esquerda como forma bruta e passa por 3 ou 4 estações (máquinas com nome em placa); em cada uma muda de forma ou cor; sai pela direita pronta e cai numa caixa.
Visual: ilustração plana industrial com cores suaves, máquinas com luzes que piscam quando a peça passa.
Movimento: esteira constante (loop perfeito: peças em fila contínua), pistões descem nas estações.
Use para: automação, workflow, "como seu pedido vira entrega".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#e9e4da", { grao: 0.12, vinheta: 0.2 });
    const y = 700, vel = 1920 / DUR * 0.6, desl = (t * vel) % 120;
    c.fillStyle = "#4b4740"; rr(c, 60, y, W - 120, 60, 30); c.fill();
    c.fillStyle = "#6b665c"; for (let x = 90 - desl; x < W - 60; x += 120) if (x > 70) { c.beginPath(); c.arc(x, y + 30, 22, 0, 7); c.fill(); }
    const est = [[560, "limpa", CLAUDE.ceu], [1000, "monta", CLAUDE.oliva], [1440, "embala", CLAUDE.terracota]];
    est.forEach(([x, nome, cor]) => {
      c.fillStyle = "#cfc8ba"; rr(c, x - 120, y - 420, 240, 220, 20); c.fill();
      c.fillStyle = cor; rr(c, x - 90, y - 400, 180, 60, 12); c.fill(); texto(c, nome, x, y - 368, { tam: 36, peso: 800, cor: "#fff" });
    });
    const esp = (DUR * vel) / 4;
    for (let i = 0; i < 5; i++) {
      const x = ((t * vel + i * esp) % (DUR * vel)) - 200 + 100;
      const etapa = est.filter(([ex]) => x > ex).length, cor = ["#a19b8d", CLAUDE.ceu, CLAUDE.oliva, CLAUDE.terracota][etapa];
      c.save(); c.translate(x, y - 50);
      if (etapa < 2) { c.fillStyle = cor; c.beginPath(); c.moveTo(-50, 50); c.lineTo(-30, -40); c.lineTo(40, -50); c.lineTo(55, 50); c.fill(); }
      else { c.fillStyle = cor; rr(c, -55, -50, 110, 100, etapa === 3 ? 4 : 30); c.fill(); if (etapa === 3) { c.fillStyle = "rgba(255,255,255,.6)"; c.fillRect(-55, -8, 110, 16); } }
      c.restore();
    }
    est.forEach(([x]) => {
      const pert = [...Array(5)].some((_, i) => Math.abs(((t * vel + i * esp) % (DUR * vel)) - 100 - x) < 60);
      const desce = pert ? 70 : 0;
      c.fillStyle = "#8e877a"; c.fillRect(x - 14, y - 200, 28, 60 + desce); rr(c, x - 60, y - 140 + desce, 120, 30, 6); c.fill();
      c.fillStyle = pert ? "#ffd166" : "#776f62"; c.beginPath(); c.arc(x + 90, y - 380, 14, 0, 7); c.fill();
    });
  },
});

semente({
  id: "quadro-branco", nome: "Quadro branco", grupo: "prancha", formato: "16:9",
  resumo: "Marcador desenhando o diagrama no quadro branco, com cores de pincel e reflexo de luz. Aula rápida.",
  receita: `Explicador 16:9 de quadro branco (whiteboard).
Estrutura: um diagrama simples é desenhado ao vivo com marcador: caixas, setas, palavras e um círculo de destaque; o texto aparece no ritmo da fala.
Visual: quadro branco com reflexo diagonal suave e restos de apagador, moldura de alumínio; traço de marcador com pontas arredondadas e leve transparência nas sobreposições; 3 cores (preto, azul, vermelho).
Movimento: traço sempre em construção (nada aparece pronto), a ponta do marcador é visível como um pequeno círculo.
Use para: aula, explicação de conceito, "deixa eu desenhar pra você".`,
  cena(c, t, W, H) {
    c.fillStyle = "#b9bcbf"; c.fillRect(0, 0, W, H); c.fillStyle = "#fbfcfc"; c.fillRect(40, 40, W - 80, H - 80);
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0.3, "rgba(255,255,255,0)"); g.addColorStop(0.45, "rgba(220,230,240,.35)"); g.addColorStop(0.6, "rgba(255,255,255,0)");
    c.fillStyle = g; c.fillRect(40, 40, W - 80, H - 80);
    c.fillStyle = "rgba(120,130,150,.06)"; c.beginPath(); c.ellipse(1500, 260, 260, 70, -0.2, 0, 7); c.fill();
    const v = 1 - fase(t, 4.6, 4.95), mk = (pts, k, cor, larg = 9) => { c.globalAlpha = v; c.strokeStyle = cor; c.lineWidth = larg; c.lineCap = c.lineJoin = "round"; tracar(c, pts, k, false); c.globalAlpha = 1; };
    const caixa = (x, y, w, h, s) => borda([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y + 2]], 3, Math.round(x), 8);
    mk(caixa(220, 380, 360, 200), fase(t, 0.1, 0.8), "#222");
    texto(c, digita("ideia", fase(t, 0.6, 1.0)), 400, 482, { tam: 64, fonte: MAO, cor: "#222", alpha: v });
    mk(borda([[600, 480], [880, 480]], 2, 4, 8), fase(t, 1.0, 1.4), "#1d4fa8");
    mk(borda([[850, 455], [885, 480], [850, 505]], 1, 5, 3), fase(t, 1.35, 1.5), "#1d4fa8");
    mk(caixa(920, 380, 360, 200), fase(t, 1.5, 2.2), "#222");
    texto(c, digita("roteiro", fase(t, 2.0, 2.4)), 1100, 482, { tam: 64, fonte: MAO, cor: "#222", alpha: v });
    mk(borda([[1300, 480], [1560, 480]], 2, 6, 8), fase(t, 2.4, 2.8), "#1d4fa8");
    mk(borda([[1530, 455], [1565, 480], [1530, 505]], 1, 7, 3), fase(t, 2.75, 2.9), "#1d4fa8");
    texto(c, digita("vídeo!", fase(t, 2.9, 3.3)), 1690, 482, { tam: 72, fonte: MAO, cor: "#c0282d", alpha: v });
    const circ = [...Array(30)].map((_, i) => [1690 + Math.cos(i * 0.24) * 150, 482 + Math.sin(i * 0.24) * 85]);
    mk(tremido(circ, 4, rng(2), 1), fase(t, 3.3, 3.9), "#c0282d", 7);
    texto(c, digita("sem pular etapa", fase(t, 3.8, 4.3)), 760, 760, { tam: 56, fonte: MAO, cor: "#1d4fa8", alpha: v });
  },
});

semente({
  id: "orbita-ecossistema", nome: "Órbita de ecossistema", grupo: "prancha", formato: "1:1",
  resumo: "Um centro e vários satélites em órbitas inclinadas, ligados por linhas que acendem. Mostra como tudo se conecta.",
  receita: `Explicador 1:1 de ecossistema (produto e integrações, pessoa e hábitos, empresa e parceiros).
Estrutura: núcleo no centro com nome; 2 ou 3 órbitas elípticas inclinadas com satélites (círculos com ícone e nome) girando em velocidades diferentes; linhas de conexão acendem quando um satélite passa na frente.
Visual: fundo escuro azul-noite com estrelas finas, órbitas em linha pontilhada clara, satélites em cores suaves; profundidade: o que está atrás fica menor e mais escuro.
Movimento: rotação contínua com períodos que fecham o loop de 5 s.
Use para: integrações, mapa de ferramentas, "tudo gira em torno de".`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#141a2b", { grao: 0.2, vinheta: 0.5 });
    const r = rng(3); for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + 0.5 * r()})`; c.fillRect(r() * W, r() * H, 2, 2); }
    const cx = W / 2, cy = H / 2, orb = [[300, 0.35, 1, ["voz", "roteiro", "trilha"]], [450, 0.42, -1, ["edição", "legenda", "capa", "post"]]];
    const sats = [];
    orb.forEach(([R, ach, dir, nomes], o) => {
      c.strokeStyle = "rgba(255,255,255,.18)"; c.setLineDash([4, 10]); c.lineWidth = 2; c.beginPath(); c.ellipse(cx, cy, R, R * ach, -0.2, 0, 7); c.stroke(); c.setLineDash([]);
      nomes.forEach((n, i) => { const a = dir * (t / DUR) * Math.PI * 2 + (i / nomes.length) * Math.PI * 2;
        const x = Math.cos(a) * R, y = Math.sin(a) * R * ach, rx = x * Math.cos(-0.2) - y * Math.sin(-0.2), ry = x * Math.sin(-0.2) + y * Math.cos(-0.2);
        sats.push([cx + rx, cy + ry, Math.sin(a), n, [CLAUDE.terracota, CLAUDE.oliva, CLAUDE.ceu, "#e9b949"][(i + o) % 4]]); });
    });
    const desenha = (s) => { const [x, y, z, n, cor] = s, k = 0.75 + 0.25 * z;
      c.strokeStyle = `rgba(255,220,190,${Math.max(0, z) * 0.6})`; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke();
      c.globalAlpha = 0.5 + 0.5 * k; c.fillStyle = cor; c.beginPath(); c.arc(x, y, 46 * k, 0, 7); c.fill();
      texto(c, n, x, y + 78 * k, { tam: 30 * k, peso: 600, cor: "#f0eee6" }); c.globalAlpha = 1; };
    sats.filter((s) => s[2] < 0).forEach(desenha);
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, 170); g.addColorStop(0, "rgba(217,119,87,.9)"); g.addColorStop(0.6, "rgba(217,119,87,.4)"); g.addColorStop(1, "rgba(217,119,87,0)");
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 170 + 8 * ciclo(t, 2), 0, 7); c.fill();
    c.fillStyle = CLAUDE.papel; c.beginPath(); c.arc(cx, cy, 90, 0, 7); c.fill(); texto(c, "você", cx, cy + 3, { tam: 44, fonte: SERIF, peso: 600 });
    sats.filter((s) => s[2] >= 0).forEach(desenha);
  },
});

semente({
  id: "iceberg", nome: "Iceberg", grupo: "prancha", formato: "9:16",
  resumo: "O que aparece em cima da água e tudo que fica escondido embaixo; a câmera mergulha camada por camada.",
  receita: `Explicador vertical 9:16 (ou 16:9) no formato iceberg: o visível e o escondido.
Estrutura: ponta pequena acima da linha d'água com o que todo mundo vê; a câmera mergulha e revela camadas mais fundas, cada uma com rótulos que aparecem; a água escurece com a profundidade.
Visual: céu claro, água em gradiente do turquesa ao azul quase preto, gelo em facetas planas com luz de cima, bolhas subindo.
Movimento: mergulho contínuo da câmera, rótulos ancorados no gelo, leve ondulação na linha d'água.
Use para: "o que ninguém vê do meu trabalho", camadas de um assunto, curiosidades em profundidade.`,
  cena(c, t, W, H) {
    const cam = sai(fase(t, 0.6, 4.2)) * 1500 * (1 - fase(t, 4.6, 5)), agua = 520;
    const g = c.createLinearGradient(0, -cam, 0, 3600 - cam); g.addColorStop(0, "#dbeef2"); g.addColorStop(0.16, "#bfe2ea"); g.addColorStop(0.17, "#4fa3b4"); g.addColorStop(0.55, "#164b68"); g.addColorStop(1, "#06121f");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); c.translate(0, -cam);
    c.fillStyle = "#e8f6f8"; c.beginPath(); c.moveTo(380, agua); c.lineTo(520, 260); c.lineTo(620, 330); c.lineTo(720, agua); c.fill();
    c.fillStyle = "rgba(200,235,245,.55)"; c.beginPath(); c.moveTo(380, agua); c.lineTo(720, agua); c.lineTo(960, 1300); c.lineTo(820, 2100); c.lineTo(420, 2400); c.lineTo(150, 1700); c.lineTo(120, 1000); c.fill();
    c.fillStyle = "rgba(150,210,230,.35)"; c.beginPath(); c.moveTo(540, agua); c.lineTo(960, 1300); c.lineTo(820, 2100); c.lineTo(560, 1500); c.fill();
    c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 4; c.beginPath(); for (let x = 0; x <= W; x += 20) c.lineTo(x, agua + 6 * Math.sin(x / 50 + t * 4)); c.stroke();
    [["o vídeo postado", 400, CLAUDE.tinta], ["o roteiro", 900, "#fff"], ["as 12 versões", 1300, "#fff"], ["o que deu errado", 1750, "#fff"], ["os anos de prática", 2200, "#fff"]].forEach(([s, y, cor], i) => {
      const vis = clamp(1 - Math.abs(y - cam - H / 2) / 700);
      texto(c, s, W / 2, y, { tam: i ? 64 : 58, fonte: SERIF, peso: 600, cor, alpha: 0.3 + 0.7 * vis });
    });
    const r = rng(5); for (let i = 0; i < 40; i++) { const x = r() * W, y0 = 700 + r() * 2400, y = y0 - ((t * 120 + r() * 400) % 400); c.strokeStyle = "rgba(255,255,255,.4)"; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 4 + r() * 8, 0, 7); c.stroke(); }
    c.restore();
  },
});

semente({
  id: "funil-filtro", nome: "Funil que filtra", grupo: "prancha", formato: "16:9",
  resumo: "Bolinhas caem num funil de três níveis; a cada nível sobram menos, e o número embaixo conta. Funil de vendas vivo.",
  receita: `Explicador 16:9 de funil (vendas, seleção, atenção).
Estrutura: funil de 3 a 4 níveis com nome e porcentagem ao lado; dezenas de bolinhas caem pelo topo; em cada nível parte delas escapa pela lateral e some; no bico, as que passam viram o número final.
Visual: funil em faixas de cor da mais clara à mais forte, bolinhas pequenas em creme, contador grande à direita.
Movimento: queda com física simples, as que saem quicam para fora; contador sobe junto.
Use para: funil de vendas, "de 1000 visitas, 3 compram", processo seletivo.`,
  cena(c, t, W, H) {
    fundo(c, W, H, "#f3efe7", { grao: 0.12, vinheta: 0.15 });
    const cx = 760, niveis = [["visitas", "100%", 520], ["cliques", "30%", 380], ["carrinho", "8%", 240], ["compra", "2%", 110]];
    niveis.forEach(([n, p, w], i) => {
      const y = 260 + i * 170, w2 = niveis[i + 1] ? niveis[i + 1][2] : 70;
      c.fillStyle = mistura("#f0d5c6", "#c6613f", i / 3); c.beginPath(); c.moveTo(cx - w, y); c.lineTo(cx + w, y); c.lineTo(cx + w2, y + 160); c.lineTo(cx - w2, y + 160); c.fill();
      texto(c, n, cx + w + 40, y + 60, { tam: 40, fonte: SERIF, peso: 600, alinha: "left" }); texto(c, p, cx + w + 40, y + 110, { tam: 34, peso: 700, cor: CLAUDE.argila, alinha: "left" });
    });
    const r = rng(8);
    for (let i = 0; i < 70; i++) {
      const fura = r() < 0.7 ? 0 : r() < 0.7 ? 1 : r() < 0.7 ? 2 : 3, t0 = r() * DUR, u = ((t - t0 + DUR) % DUR) / 2.2;
      if (u > 1) continue;
      const nivelSai = fura, yMax = 260 + (nivelSai + 0.5) * 170, y = 150 + u * u * 900;
      let x = cx + (r() - 0.5) * 300 * (1 - u);
      if (y > yMax && nivelSai < 3) { const d = y - yMax; x += (i % 2 ? 1 : -1) * d * 1.4; c.globalAlpha = clamp(1 - d / 300); }
      if (y > 1000) continue;
      c.fillStyle = CLAUDE.tinta; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.globalAlpha = 1;
    }
    texto(c, String(Math.round(2 + 18 * ciclo01(t))), 1600, 940, { tam: 140, fonte: SERIF, peso: 600, cor: CLAUDE.argila });
    texto(c, "vendas hoje", 1600, 1030, { tam: 36, peso: 500 });
  },
});

semente({
  id: "piramide-niveis", nome: "Pirâmide de níveis", grupo: "prancha", formato: "1:1",
  resumo: "Blocos empilham de baixo para cima formando a pirâmide, cada nível com nome; o topo brilha.",
  receita: `Explicador 1:1 de hierarquia (necessidades, prioridades, níveis de domínio, base → topo).
Estrutura: blocos caem e empilham de baixo para cima; cada nível tem nome e uma frase curta ao lado; o topo, menor, ganha brilho e uma estrela.
Visual: blocos em pedra de papel com cores em degradê (escuro na base, claro no topo), sombra projetada, fundo creme.
Movimento: queda com quique pequeno e poeira na base; a pirâmide toda dá um leve pulso quando o topo encaixa.
Use para: hierarquias, "o básico antes do avançado", modelos mentais.`,
  cena(c, t, W, H) {
    fundo(c, W, H, CLAUDE.creme, { grao: 0.14, vinheta: 0.2 });
    const niv = [["base: constância", 820], ["técnica", 640], ["estilo", 460], ["voz própria", 280]];
    const pulso = 1 + 0.02 * (fase(t, 2.7, 2.8) - fase(t, 2.8, 3.1)), v = 1 - fase(t, 4.6, 4.95);
    c.save(); c.globalAlpha = v; c.translate(W / 2, H); c.scale(pulso, pulso); c.translate(-W / 2, -H);
    niv.forEach(([s, w], i) => {
      const t0 = 0.3 + i * 0.6, q = sai(fase(t, t0, t0 + 0.35)), yAlvo = 900 - i * 170, y = lerp(-200, yAlvo, q) - (q >= 1 ? 0 : 0);
      if (t < t0) return;
      c.fillStyle = "rgba(0,0,0,.1)"; c.fillRect(W / 2 - w / 2 + 16, y + 16, w, 150);
      c.fillStyle = mistura("#5c4f3c", "#e9c46a", i / 3); c.fillRect(W / 2 - w / 2, y, w, 150);
      c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(W / 2 - w / 2, y, w, 20);
      texto(c, s, W / 2, y + 78, { tam: i ? 48 : 44, fonte: SERIF, peso: 600, cor: i < 2 ? "#fff" : CLAUDE.tinta });
    });
    if (t > 2.7) { c.save(); c.translate(W / 2, 220); c.rotate(t); c.scale(entra(t, 2.7), entra(t, 2.7)); c.fillStyle = CLAUDE.terracota;
      c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 26 : 60, a = (i / 10) * Math.PI * 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); c.restore(); }
    c.restore();
  },
});
