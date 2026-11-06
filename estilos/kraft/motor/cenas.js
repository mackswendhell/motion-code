// Kraft: motor próprio (iniciar/quadro) sobre base.js e kit.js.
// O tempo.json (feito pelo tempo.py) traz os atos com os elementos já em segundos absolutos e as frases da legenda.
// Ato "gravacao": a tela é transparente e vai por cima da câmera (o compor.py junta). Ato "kraft": papel cobre tudo.
// A Higgsfield só entrega imagem parada (ativos/<nome>.png, sem fundo); todo movimento é daqui.

const K = { kraft: "#c4a47a", laranja: "#f26a1f", branco: "#fbfaf5", tinta: "#1d1914", azul: "#93d4f2", marinho: "#10233a",
  amarelo: "#fbe77c", contorno: "#2b2210", creme: "#f1e8d6", cinza: "#cfcac1" };
const ROUND = 'KraftRound, "Helvetica Neue", Arial, sans-serif', MAO2 = 'Noteworthy, "Marker Felt", cursive';
let T, S, CX; // W e H são os do base.js
const IMG = {}, CACHE = {};

async function iniciar(tempo) {
  T = tempo;
  [W, H] = TAMS[T.formato || "9:16"];
  S = Math.min(W, H) / 1080;
  const cv = document.getElementById("c");
  cv.width = W; cv.height = H; CX = cv.getContext("2d");
  // peças da Higgsfield (ativos/<nome>.png, chave = nome) e prints (caminho no episódio, chave = caminho)
  const arqs = new Map();
  for (const a of T.atos) for (const e of a.elementos || []) {
    if (e.ativo) arqs.set(e.ativo, `ativos/${e.ativo}.png`);
    if (e.arquivo) arqs.set(e.arquivo, e.arquivo);
    for (const pg of e.paginas || []) arqs.set(pg.print, pg.print);
  }
  if (T.fundo_kraft) arqs.set(T.fundo_kraft, `ativos/${T.fundo_kraft}.png`);
  await Promise.all([...arqs].map(([k, rel]) => new Promise((ok) => {
    const im = new Image(); im.onload = () => { IMG[k] = im; ok(); }; im.onerror = ok;
    im.src = (self.DADOS && self.DADOS[rel]) || T.pasta + rel; // DADOS: imagens injetadas quando o Chrome não lê arquivo local
  })));
  await document.fonts.load(`800 40px KraftRound`);
  await document.fonts.ready;
}

function quadro(t) {
  const c = CX, a = T.atos.find((x) => t < x.t1) || T.atos[T.atos.length - 1];
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  const cam = camAgora(a, t);
  if (!cam || !cheia(cam)) { c.drawImage(papelKraft(), 0, 0); if (cam) janelaCamera(c, cam, a, t); }
  for (const e of a.elementos || []) if (t >= e.em && (e.sai == null || t < e.sai)) { c.save(); desenha(c, e, t); c.restore(); }
  if (T.legenda !== false) legenda(c, t, a);
}

// ---------- câmera: onde a gravação aparece (o compor.py põe o vídeo exatamente neste retângulo, com a mesma curva) ----------
const cheia = (r) => r.x <= 0.001 && r.y <= 0.001 && r.w >= 0.999 && r.h >= 0.999;
function camAgora(a, t) {
  if (!a.camera) return null;
  if (!a.cam_de) return a.camera;
  const k = sai(clamp((t - a.t0) / (a.cam_dura || 0.45)));
  return { x: lerp(a.cam_de.x, a.camera.x, k), y: lerp(a.cam_de.y, a.camera.y, k), w: lerp(a.cam_de.w, a.camera.w, k), h: lerp(a.cam_de.h, a.camera.h, k) };
}
function janelaCamera(c, r, a, t) { // buraco no papel com borda branca de foto colada e fita
  const x = r.x * W, y = r.y * H, w = r.w * W, h = r.h * H, cartao = r.w < 0.999, raio = cartao ? 18 * S : 0, b = 10 * S;
  c.save(); sombra(c, 20, 8); rr(c, x - b, y - b, w + 2 * b, h + 2 * b, raio + b); c.fillStyle = "#fbfaf6"; c.fill(); c.restore();
  c.save(); c.globalCompositeOperation = "destination-out"; rr(c, x, y, w, h, raio); c.fill(); c.restore();
  if (cartao) { fita(c, x + w * 0.5, y - b, Math.min(160 * S, w * 0.4), -0.04); }
}

// ---------- movimento ----------
const hashS = (s) => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 100003; return h; };
const pop = (u, d = 0.22, de = 0.3) => de + (1 - de) * volta(u / d);

function lugar(e, t) { // posição base + mudanças de lugar (vai): corte seco, pulo em arco ou deslize
  let p = { x: e.x, y: e.y, larg: e.larg, rot: e.rot || 0 };
  for (const v of e.vai || []) {
    if (t < v.em) break;
    const alvo = { x: v.x ?? p.x, y: v.y ?? p.y, larg: v.larg ?? p.larg, rot: v.rot ?? p.rot };
    const k = v.modo === "corte" ? 1 : sai(clamp((t - v.em) / (v.dura || (v.modo === "pulo" ? 0.45 : 0.4))));
    const arco = v.modo === "pulo" ? -Math.sin(Math.PI * k) * (v.altura ?? 0.07) : 0;
    p = { x: lerp(p.x, alvo.x, k), y: lerp(p.y, alvo.y, k) + arco, larg: lerp(p.larg ?? 0, alvo.larg ?? 0, k), rot: lerp(p.rot, alvo.rot, k) };
  }
  return p;
}

function entrada(e, u) { // a referência: tudo entra rápido (4 a 6 quadros) e passa um pouco do ponto
  const m = { dx: 0, dy: 0, sc: 1, rot: 0 }, k = volta(u / 0.24);
  switch (e.entrada || "pop") {
    case "nenhuma": break;
    case "esquerda": m.dx = -(1 - k) * W * 0.75; break;
    case "direita": m.dx = (1 - k) * W * 0.75; break;
    case "cima": m.dy = -(1 - k) * H * 0.4; break;
    case "baixo": m.dy = (1 - k) * H * 0.4; break;
    case "cai": m.dy = -(1 - volta(u / 0.3)) * H * 0.35; m.rot = (1 - k) * 0.35; break;
    case "sobe": m.dy = (1 - volta(u / 0.3)) * H * 0.06; m.sc = pop(u, 0.3, 0.55); break;
    default: m.sc = pop(u);
  }
  return m;
}

function desenha(c, e, t) {
  const u = t - e.em, p = lugar(e, t), m = entrada(e, u);
  let dx = m.dx, dy = m.dy, rot = p.rot + m.rot;
  if (e.vivo ?? e.tipo === "imagem") { // stop motion: 8 poses por segundo, como recorte mexido à mão
    const r = rng(Math.floor(t * 8) * 13 + hashS(e.ativo || e.tipo));
    dx += (r() - 0.5) * 4 * S; dy += (r() - 0.5) * 4 * S; rot += (r() - 0.5) * 0.014;
  }
  c.translate(p.x * W + dx, p.y * H + dy);
  c.rotate(rot);
  c.scale(m.sc, m.sc);
  (TIPOS[e.tipo] || TIPOS.etiqueta)(c, e, u, p, t);
}

const sombra = (c, b = 16, y = 7) => { c.shadowColor = "rgba(35,22,8,.34)"; c.shadowBlur = b * S; c.shadowOffsetY = y * S; };

// ---------- elementos ----------
const TIPOS = {
  imagem(c, e, u, p) {
    const w = (p.larg || 0.4) * W, im = IMG[e.ativo];
    if (!im) { // rascunho enquanto a peça não foi pintada
      recorte(c, -w / 2, -w * 0.35, w, w * 0.7, K.creme, { seed: hashS(e.ativo), sombra: 12 });
      texto(c, e.ativo || "?", 0, 0, { tam: 34 * S, peso: 800, fonte: ROUND, cor: "#8a7d68", larg: w * 0.85 }); return;
    }
    const st = adesivo(e.ativo, e.contorno !== false), h = w * st.height / st.width;
    if (e.espelho) c.scale(-1, 1);
    sombra(c); c.drawImage(st, -w / 2, -h / 2, w, h);
  },

  etiqueta(c, e) {
    const tam = (e.tam || 34) * S, laranja = e.cor === "laranja";
    c.font = `800 ${tam}px ${ROUND}`;
    const w = c.measureText(e.texto).width + tam * 0.95, h = tam * 1.6;
    recorte(c, -w / 2, -h / 2, w, h, laranja ? K.laranja : K.branco, { seed: hashS(e.texto), amp: 1.6, sombra: 9 * S });
    texto(c, e.texto, 0, tam * 0.04, { tam, peso: 800, fonte: ROUND, cor: laranja ? "#fff" : K.tinta });
  },

  titulo(c, e, u) { // chip azul + duas linhas grossas com contorno escuro (a segunda em laranja)
    if (e.chip) {
      const k = pop(u, 0.2), tam = 30 * S; c.save(); c.scale(k, k);
      c.font = `800 ${tam}px ${ROUND}`; const w = c.measureText(e.chip).width + tam * 1.1;
      sombra(c, 8, 3); rr(c, -w / 2, -tam * 0.85, w, tam * 1.7, 8 * S); c.fillStyle = K.azul; c.fill(); c.shadowColor = "transparent";
      texto(c, e.chip, 0, tam * 0.05, { tam, peso: 800, fonte: ROUND, cor: K.marinho }); c.restore();
    }
    (e.linhas || []).forEach((s, i) => {
      const k = pop(u - 0.07 * (i + 1), 0.22), tam = (e.tam || 88) * S, y = (i + 0.95) * tam * 1.12;
      if (k <= 0.3 && u < 0.07 * (i + 1)) return;
      c.save(); c.translate(0, y); c.scale(k, k); textoGrosso(c, s, 0, 0, tam, i ? K.laranja : "#fff"); c.restore();
    });
  },

  comentarios(c, e, u, p, t) { // cartões brancos de comentário empilhados, um por vez
    const larg = (e.larg || 0.66) * W, tam = 27 * S;
    let y = 0;
    e.itens.forEach((it, i) => {
      const s = typeof it === "string" ? it : it.texto, t0 = it.em ?? e.em + i * (e.passo || 0.4);
      c.font = `600 ${tam}px ${ROUND}`;
      const linhas = quebra(c, s, larg - 110 * S), h = 62 * S + linhas.length * tam * 1.3;
      if (t >= t0) {
        const k = pop(t - t0, 0.18), lado = i % 2 ? 1 : -1;
        c.save(); c.translate(lado * 14 * S, y + h / 2); c.rotate(lado * 0.018 + (hashS(s) % 10 - 5) * 0.002); c.scale(k, k);
        recorte(c, -larg / 2, -h / 2, larg, h, "#fdfdfb", { seed: hashS(s), amp: 3.2, sombra: 10 * S });
        c.fillStyle = K.cinza; c.beginPath(); c.arc(-larg / 2 + 40 * S, -h / 2 + 30 * S, 15 * S, 0, 7); c.fill();
        rr(c, -larg / 2 + 66 * S, -h / 2 + 24 * S, 120 * S, 12 * S, 6 * S); c.fillStyle = "#e1ddd5"; c.fill();
        linhas.forEach((l, j) => texto(c, l, -larg / 2 + 66 * S, -h / 2 + 62 * S + j * tam * 1.3, { tam, peso: 600, fonte: ROUND, cor: "#26221d", alinha: "left" }));
        c.restore();
      }
      y += h + 12 * S;
    });
  },

  carimbo(c, e) {
    const r = (e.raio || 120) * S, ch = "carimbo:" + e.texto + r;
    if (!CACHE[ch]) CACHE[ch] = carimboArte(e.texto, r);
    c.rotate(e.inclina ?? -0.22); sombra(c, 10, 4);
    c.drawImage(CACHE[ch], -CACHE[ch].width / 2, -CACHE[ch].height / 2);
  },

  interrogacao(c, e, u) { // "?" de papel laranja com borda branca; balança depois do pop
    const tam = (e.tam || 300) * S;
    c.rotate(0.28 * Math.exp(-3 * u) * Math.sin(13 * u) + 0.12);
    c.font = `900 ${tam}px ${ROUND}`; c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round";
    sombra(c, 14, 6); c.strokeStyle = "#fff"; c.lineWidth = 22 * S; c.strokeText("?", 0, 0); c.shadowColor = "transparent";
    c.fillStyle = K.laranja; c.fillText("?", 0, 0);
  },

  lista(c, e, u, p, t) { // bloco de papel pautado; cada item se escreve à mão quando é dito
    const w = (p.larg || 0.3) * W, h = (e.alt || 0.3) * H, passo = 46 * S;
    recorte(c, -w / 2, -h / 2, w, h, "#efe5d3", { seed: 41, amp: 2.5, sombra: 14 * S });
    c.strokeStyle = K.laranja; c.lineWidth = 3.5 * S; c.strokeRect(-w / 2 + 12 * S, -h / 2 + 16 * S, w - 24 * S, h - 28 * S);
    c.strokeStyle = "rgba(90,78,62,.32)"; c.lineWidth = 1.5 * S;
    for (let y = -h / 2 + 70 * S; y < h / 2 - 20 * S; y += passo) { c.beginPath(); c.moveTo(-w / 2 + 22 * S, y); c.lineTo(w / 2 - 22 * S, y); c.stroke(); }
    (e.itens || []).forEach((it, i) => {
      if (t < it.em) return;
      const k = clamp((t - it.em) / 0.35), y = -h / 2 + 70 * S + i * passo - 9 * S, x0 = -w / 2 + 30 * S;
      c.save(); c.beginPath(); c.rect(x0 - 4 * S, y - passo, (w - 50 * S) * k + 4 * S, passo + 12 * S); c.clip();
      texto(c, it.texto, x0, y, { tam: 27 * S, peso: 700, fonte: MAO2, cor: K.tinta, alinha: "left", larg: w - 60 * S });
      c.font = `700 ${27 * S}px ${MAO2}`; const lw = Math.min(w - 60 * S, c.measureText(it.texto).width);
      c.strokeStyle = K.laranja; c.lineWidth = 3 * S; c.beginPath(); c.moveTo(x0, y + 17 * S); c.lineTo(x0 + lw, y + 15 * S); c.stroke();
      c.restore();
    });
  },

  recibo(c, e, u, p) { // comanda que sai da impressora: aparece de cima para baixo
    const w = (p.larg || 0.15) * W, h = w * 1.85, k = sai(clamp(u / 0.5));
    c.save(); c.beginPath(); c.rect(-w, -h / 2 - 4 * S, w * 2, (h + 30 * S) * k); c.clip();
    const pts = [[-w / 2, -h / 2], [w / 2, -h / 2]];
    for (let i = 0; i <= 10; i++) pts.push([w / 2 - (w * i) / 10, h / 2 + (i % 2 ? 9 : 0) * S]);
    sombra(c, 10, 4); caminho(c, pts); c.fillStyle = "#fbfaf6"; c.fill(); c.shadowColor = "transparent";
    texto(c, e.topo || "", 0, -h / 2 + 30 * S, { tam: 17 * S, peso: 700, fonte: ROUND, cor: "#5a554d", larg: w * 0.85 });
    c.strokeStyle = "rgba(0,0,0,.25)"; c.setLineDash([4 * S, 4 * S]); c.beginPath(); c.moveTo(-w / 2 + 10 * S, -h / 2 + 52 * S); c.lineTo(w / 2 - 10 * S, -h / 2 + 52 * S); c.stroke(); c.setLineDash([]);
    texto(c, e.valor || "", 0, -h / 2 + h * 0.42, { tam: 40 * S, peso: 800, fonte: MONO, cor: K.laranja, larg: w * 0.85 });
    texto(c, e.rodape || "", 0, h / 2 - 34 * S, { tam: 14 * S, peso: 600, fonte: ROUND, cor: "#8b857a", larg: w * 0.85 });
    c.restore();
  },

  navegador(c, e, u, p, t) { // janela de navegador de papel: URL digitada, prints por dentro, cursor do agente que clica e digita
    const w = (p.larg || 0.9) * W, h = (e.alt || 0.4) * H, barra = 58 * S, caixa = { x: -w / 2 + 10 * S, y: -h / 2 + barra, w: w - 20 * S, h: h - barra - 10 * S };
    sombra(c, 22, 10); rr(c, -w / 2, -h / 2, w, h, 20 * S); c.fillStyle = "#f6f1e7"; c.fill(); c.shadowColor = "transparent";
    ["#f26a1f", "#d9cfbf", "#d9cfbf"].forEach((cor, i) => { c.fillStyle = cor; c.beginPath(); c.arc(-w / 2 + (30 + i * 26) * S, -h / 2 + barra / 2, 8 * S, 0, 7); c.fill(); });
    rr(c, -w / 2 + 120 * S, -h / 2 + 12 * S, w - 150 * S, barra - 24 * S, 17 * S); c.fillStyle = "#fff"; c.fill();
    const url = digita(e.url || "", (t - (e.url_em ?? e.em)) * 20 / Math.max(1, (e.url || "").length));
    texto(c, url, -w / 2 + 140 * S, -h / 2 + barra / 2 + 1, { tam: 22 * S, peso: 600, fonte: MONO, cor: "#4a4339", alinha: "left" });
    const pg = [...(e.paginas || [])].reverse().find((x) => t >= x.em);
    c.save(); rr(c, caixa.x, caixa.y, caixa.w, caixa.h, 10 * S); c.clip(); c.fillStyle = "#151515"; c.fillRect(caixa.x, caixa.y, caixa.w, caixa.h);
    const v = pg && IMG[pg.print] ? pagina(c, IMG[pg.print], caixa, focoAgora(e, pg, t)) : null;
    if (v) for (const ac of e.acoes || []) if (ac.tipo === "digita" && t >= ac.em + 0.45 && ac.em >= pg.em) campoDigitado(c, v, ac, t);
    if (v) for (const m of e.marcas || []) if (t >= m.em && m.em >= pg.em) marca(c, v, m, t);
    const flash = (e.acoes || []).find((ac) => ac.tipo === "print" && t >= ac.em && t < ac.em + 0.25);
    if (flash) { c.fillStyle = `rgba(255,255,255,${0.85 * (1 - (t - flash.em) / 0.25)})`; c.fillRect(caixa.x, caixa.y, caixa.w, caixa.h); }
    c.restore();
    if (v) cursor(c, e, v, caixa, t);
  },

  print(c, e, u, p, t) { // print colado com fita; "alt" corta uma janela do print e "focos" passeia/aproxima nela
    const im = IMG[e.arquivo]; if (!im) return;
    const w = (p.larg || 0.8) * W, h = e.alt ? e.alt * H : w * im.height / im.width, b = 9 * S, caixa = { x: -w / 2, y: -h / 2, w, h };
    sombra(c, 18, 8); c.fillStyle = "#fbfaf6"; c.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b); c.shadowColor = "transparent";
    c.save(); c.beginPath(); c.rect(caixa.x, caixa.y, w, h); c.clip();
    const v = pagina(c, im, caixa, focoAgora(e, e, t));
    for (const m of e.marcas || []) if (t >= m.em) marca(c, v, m, t);
    c.restore();
    fita(c, -w / 2 + 20 * S, -h / 2 - b, 110 * S, -0.5); fita(c, w / 2 - 20 * S, -h / 2 - b, 110 * S, 0.5);
  },

  vapor(c, e, u, p, t) { // fumaça de panela em stop motion
    const w = (p.larg || 0.08) * W, pose = Math.floor(t * 8);
    c.lineCap = "round"; c.lineWidth = 7 * S;
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = `rgba(255,255,255,${0.5 - i * 0.08})`; c.beginPath();
      for (let j = 0; j <= 12; j++) {
        const y = -j * w * 0.11, x = (i - 1) * w * 0.32 + Math.sin(j * 0.9 + pose * 1.7 + i * 2) * w * 0.09;
        j ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    }
  },
};

// ---------- páginas (prints) dentro de navegador e print ----------
function focoAgora(e, pg, t) { // foco = centro (x, y em fração do print) e zoom (1 = largura inteira); anda em 0,6 s
  let f = { x: 0.5, y: 0, zoom: 1, ...(pg.foco || {}) };
  for (const n of e.focos || []) {
    if (t < n.em || n.em < (pg.em ?? -1)) continue;
    const k = sai(clamp((t - n.em) / (n.dura || 0.6)));
    f = { x: lerp(f.x, n.x ?? f.x, k), y: lerp(f.y, n.y ?? f.y, k), zoom: lerp(f.zoom, n.zoom ?? f.zoom, k) };
  }
  return f;
}
function pagina(c, im, cx, f) { // desenha o print na caixa e devolve a conversão print -> tela
  const s = (cx.w / im.width) * f.zoom, iw = im.width * s, ih = im.height * s;
  let ox = cx.x + cx.w / 2 - f.x * iw, oy = cx.y + cx.h / 2 - f.y * ih;
  ox = Math.min(cx.x, Math.max(cx.x + cx.w - iw, ox));
  oy = ih <= cx.h ? cx.y : Math.min(cx.y, Math.max(cx.y + cx.h - ih, oy));
  c.drawImage(im, ox, oy, iw, ih);
  return { px: (x) => ox + x * iw, py: (y) => oy + y * ih, s, iw, ih };
}
function campoDigitado(c, v, ac, t) { // campo do formulário em foco, com o texto entrando letra a letra
  const x = v.px(ac.x - ac.w / 2), y = v.py(ac.y - ac.h / 2), w = ac.w * v.iw, h = ac.h * v.ih;
  c.fillStyle = ac.fundo || "#1f1f1f"; c.fillRect(x, y, w, h);
  c.strokeStyle = K.laranja; c.lineWidth = 3 * S; c.strokeRect(x, y, w, h);
  const n = Math.floor((t - ac.em - 0.45) * 16), s = ac.texto.slice(0, n), tam = h * 0.5;
  c.font = `600 ${tam}px ${ROUND}`; c.fillStyle = "#fff"; c.textAlign = "left"; c.textBaseline = "middle";
  c.fillText(s, x + h * 0.3, y + h / 2, w - h * 0.6);
  if (Math.floor(t * 2.5) % 2 || n < ac.texto.length) c.fillRect(x + h * 0.3 + Math.min(w - h * 0.6, c.measureText(s).width) + 2, y + h * 0.25, 2 * S, h * 0.5);
}
function marca(c, v, m, t) { // marca-texto passando da esquerda para a direita
  const k = sai(clamp((t - m.em) / 0.35)), x = v.px(m.x), y = v.py(m.y), w = m.w * v.iw * k, h = m.h * v.ih;
  c.save(); c.globalCompositeOperation = "multiply"; c.fillStyle = "rgba(255,226,60,.75)"; c.fillRect(x, y, w, h); c.restore();
  c.save(); c.globalAlpha = 0.35; c.fillStyle = "#ffe23c"; c.fillRect(x, y, w, h); c.restore();
}
function cursor(c, e, v, cx, t) { // seta laranja com a etiqueta "Claude": vai até cada ação em 0,45 s e clica
  const acs = (e.acoes || []).filter((ac) => ac.x != null);
  if (!acs.length || t < acs[0].em) return;
  let i = acs.findLastIndex((ac) => t >= ac.em), ac = acs[i];
  const alvo = (a) => ({ x: v.px(a.x), y: v.py(a.y) });
  const de = i ? alvo(acs[i - 1]) : { x: cx.x + cx.w * 0.85, y: cx.y + cx.h * 0.95 }, para = alvo(ac), k = sai(clamp((t - ac.em) / 0.45));
  const x = lerp(de.x, para.x, k), y = lerp(de.y, para.y, k);
  if (["clica", "digita"].includes(ac.tipo) && t >= ac.em + 0.45 && t < ac.em + 0.8) { // onda do clique
    const q = (t - ac.em - 0.45) / 0.35; c.strokeStyle = `rgba(242,106,31,${1 - q})`; c.lineWidth = 4 * S; c.beginPath(); c.arc(x, y, (10 + 34 * q) * S, 0, 7); c.stroke();
  }
  const a = 34 * S, aperta = t >= ac.em + 0.42 && t < ac.em + 0.55 ? 0.85 : 1;
  c.save(); c.translate(x, y); c.scale(aperta, aperta);
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, a); c.lineTo(a * 0.28, a * 0.74); c.lineTo(a * 0.5, a * 1.08); c.lineTo(a * 0.64, a * 1.0); c.lineTo(a * 0.44, a * 0.68); c.lineTo(a * 0.78, a * 0.68); c.closePath();
  sombra(c, 8, 3); c.fillStyle = K.laranja; c.fill(); c.shadowColor = "transparent"; c.strokeStyle = "#fff"; c.lineWidth = 3 * S; c.stroke();
  c.font = `800 ${20 * S}px ${ROUND}`; const tw2 = c.measureText(e.agente || "Claude").width + 22 * S;
  rr(c, a * 0.7, a * 0.95, tw2, 32 * S, 16 * S); c.fillStyle = K.laranja; c.fill();
  texto(c, e.agente || "Claude", a * 0.7 + tw2 / 2, a * 0.95 + 17 * S, { tam: 20 * S, peso: 800, fonte: ROUND, cor: "#fff" });
  c.restore();
}

// ---------- peças em cache ----------
function adesivo(nome, contorno) { // recorte com borda branca de adesivo, feito uma vez por peça
  const ch = "adesivo:" + nome + contorno;
  if (CACHE[ch]) return CACHE[ch];
  const im = IMG[nome], o = contorno ? Math.max(6, Math.round(im.width * 0.012)) : 0, cv = tela(im.width + o * 2, im.height + o * 2), g = cv.getContext("2d");
  if (o) {
    const sil = tela(im.width, im.height), sg = sil.getContext("2d");
    sg.drawImage(im, 0, 0); sg.globalCompositeOperation = "source-in"; sg.fillStyle = "#fff"; sg.fillRect(0, 0, im.width, im.height);
    for (let a = 0; a < 24; a++) g.drawImage(sil, o + Math.cos((a / 24) * 6.283) * o, o + Math.sin((a / 24) * 6.283) * o);
  }
  g.drawImage(im, o, o);
  return (CACHE[ch] = cv);
}

function carimboArte(s, r) { // disco creme, dois anéis laranja e tinta falhada
  const n = Math.ceil(r * 2.2), cv = tela(n, n), g = cv.getContext("2d"), rd = rng(hashS(s));
  g.translate(n / 2, n / 2);
  caminho(g, tremido(Array.from({ length: 40 }, (_, i) => [Math.cos(i / 40 * 6.283) * r, Math.sin(i / 40 * 6.283) * r]), 1.5 * S, rd, 2));
  g.fillStyle = K.creme; g.fill();
  g.strokeStyle = K.laranja; g.lineWidth = r * 0.09; g.beginPath(); g.arc(0, 0, r * 0.88, 0, 7); g.stroke();
  g.lineWidth = r * 0.025; g.beginPath(); g.arc(0, 0, r * 0.74, 0, 7); g.stroke();
  let tam = r * 0.34, ps;
  do { tam *= 0.92; g.font = `900 ${tam}px ${ROUND}`; ps = quebra(g, s, r * 1.3); } while (ps.length > 2 && tam > r * 0.2);
  ps.forEach((p, i) => texto(g, p, 0, (i - (ps.length - 1) / 2) * tam * 1.08, { tam, peso: 900, fonte: ROUND, cor: K.laranja, larg: r * 1.35 }));
  g.globalCompositeOperation = "destination-out"; // falhas da tinta
  for (let i = 0; i < 260; i++) { const a = rd() * 6.283, d = rd() * r; g.globalAlpha = 0.35 + rd() * 0.5; g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, (0.6 + rd() * 2.2) * S, 0, 7); g.fill(); }
  return cv;
}

let _kraft;
function papelKraft() { // fundo kraft: a pintura da Higgsfield se houver, senão papel feito aqui
  if (_kraft) return _kraft;
  const cv = tela(W, H), g = cv.getContext("2d"), im = IMG[T.fundo_kraft];
  if (im) { const k = Math.max(W / im.width, H / im.height); g.drawImage(im, (W - im.width * k) / 2, (H - im.height * k) / 2, im.width * k, im.height * k); return (_kraft = cv); }
  fundo(g, W, H, K.kraft, { grao: 0.3, vinheta: 0.16 });
  const r = rng(5);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "90,60,25" : "255,240,210"},.022)`; g.beginPath(); g.ellipse(r() * W, r() * H, 80 + r() * 260, 50 + r() * 180, r() * 3, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(95,70,40,.12)"; g.lineWidth = 1.4;
  for (let i = 0; i < 420; i++) { const x = r() * W, y = r() * H, a = r() * 3, l = 8 + r() * 26; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  // cantos de cima: jornal, papel quadriculado, um rasgo laranja e fita
  recorte(g, -50 * S, -40 * S, W * 0.3, H * 0.085, "#e8e0cf", { seed: 3, amp: 9, rot: -0.12, sombra: 10 });
  g.fillStyle = "rgba(60,55,50,.45)"; for (let i = 0; i < 7; i++) g.fillRect(20 * S, 14 * S + i * 15 * S, (150 + ((i * 47) % 90)) * S, 6 * S);
  recorte(g, W * 0.17, -30 * S, W * 0.16, H * 0.075, "#f4f2ec", { seed: 4, amp: 7, rot: 0.14, sombra: 10 });
  g.save(); g.translate(W * 0.25, H * 0.01); g.rotate(0.14); g.strokeStyle = "rgba(70,90,110,.35)"; g.lineWidth = 1;
  for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(i * 13 * S, -30 * S); g.lineTo(i * 13 * S, 110 * S); g.stroke(); g.beginPath(); g.moveTo(-80 * S, i * 13 * S + 40 * S); g.lineTo(80 * S, i * 13 * S + 40 * S); g.stroke(); }
  g.restore();
  recorte(g, W * 0.56, -45 * S, W * 0.3, H * 0.045, K.laranja, { seed: 6, amp: 12, rot: 0.04, sombra: 8 });
  recorte(g, W * 0.82, -30 * S, W * 0.24, H * 0.11, "#e5ddcb", { seed: 5, amp: 10, rot: 0.2, sombra: 10 });
  g.fillStyle = "rgba(60,55,50,.4)"; for (let i = 0; i < 6; i++) g.fillRect(W * 0.86, 40 * S + i * 15 * S, (110 + ((i * 31) % 60)) * S, 6 * S);
  fita(g, W * 0.33, 95 * S, 130 * S, -0.55); fita(g, W * 0.8, 120 * S, 120 * S, 0.6);
  return (_kraft = cv);
}

// ---------- texto ----------
function textoGrosso(c, s, x, y, tam, cor) {
  c.font = `900 ${tam}px ${ROUND}`; c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round";
  const m = c.measureText(s).width, k = m > W * 0.92 ? (W * 0.92) / m : 1;
  c.save(); c.translate(x, y); c.scale(k, k);
  c.strokeStyle = K.contorno; c.lineWidth = tam * 0.2; c.strokeText(s, 0, tam * 0.06); c.strokeText(s, 0, 0);
  c.fillStyle = cor; c.fillText(s, 0, 0); c.restore();
}

function quebra(c, s, larg) {
  const out = []; let l = "";
  for (const p of s.split(" ")) { const tt = l ? l + " " + p : p; if (c.measureText(tt).width > larg && l) { out.push(l); l = p; } else l = tt; }
  return l ? [...out, l] : out;
}

function legenda(c, t, a) { // frase dita agora: amarelo com contorno escuro, troca seca de uma frase para a outra
  const f = (T.frases || []).find((x) => t >= x.t0 && t < x.t1);
  if (!f) return;
  const tam = 50 * S;
  c.font = `800 ${tam}px ${ROUND}`; c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round";
  const m = c.measureText(f.texto).width, k = Math.min(1, (W - 110 * S) / m);
  c.save(); c.translate(W / 2, H * (a.legenda_y || T.legenda_y || 0.715)); c.scale(k, k);
  c.strokeStyle = K.contorno; c.lineWidth = 11 * S; c.strokeText(f.texto, 0, 0);
  c.fillStyle = K.amarelo; c.fillText(f.texto, 0, 0); c.restore();
}
