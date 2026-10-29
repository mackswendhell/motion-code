// Rabisco: caneta preta grossa e giz de cera sobre papel liso; cada coisa se desenha e se apaga na tela.
// Animado "em dois" como a referência: um desenho novo a cada 1/12 s, e o traço ferve a cada desenho.
// Palco de 1000 x 1000 unidades (o desenho principal); planos com profundidade z para paralaxe e foco.
// Carregado depois de nucleo/2d/base.js; as cenas ficam em cenas.js. iniciar(tempo) uma vez, quadro(t) por quadro.

const COR = {
  papel: "#f2f1e7", tinta: "#1b1a18", giz: "#efede4", guia: "#a9c8e2", faisca: "#45dda4", tela: "#f7f5ee",
  amarelo: "#e6b53e", vermelho: "#cd4a31", rosa: "#da8a93", azul: "#3c55a0", verde: "#58a963", bege: "#c29e7a",
  celeste: "#a8cce2", noite: "#0d1650",
};
const DOZE = 12, SAI = 0.5, PINCEL = 1.0, LARG = 8;
let P, U, CX, CY, LEG, LARGO, VIS, NOITE, CEU, PLANO, CENA = [];
const TEX = {};

const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
function chave(lista, u) { // quadros-chave [t, valores...], interpolados com ease
  if (u <= lista[0][0]) return lista[0].slice(1);
  for (let i = 1; i < lista.length; i++) if (u < lista[i][0]) {
    const a = lista[i - 1], b = lista[i], k = ease((u - a[0]) / (b[0] - a[0]));
    return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
  }
  return lista[lista.length - 1].slice(1);
}
function caixa(pts) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}
function amostrar(pts, fechado, passo = 12) { // pontos a cada ~12 unidades, para o tremido entortar os lados longos
  const p = fechado ? [...pts, pts[0]] : pts, out = [];
  for (let i = 0; i < p.length - 1; i++) {
    const n = Math.max(1, Math.round(Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]) / passo));
    for (let s = 0; s < n; s++) out.push([lerp(p[i][0], p[i + 1][0], s / n), lerp(p[i][1], p[i + 1][1], s / n)]);
  }
  if (!fechado) out.push(p[p.length - 1]);
  return out;
}
function inflar(pts, d) {
  const b = caixa(pts), cx = b.x + b.w / 2, cy = b.y + b.h / 2, f = 1 + d / Math.max(10, Math.max(b.w, b.h) / 2);
  return pts.map(([x, y]) => [cx + (x - cx) * f, cy + (y - cy) * f]);
}

// ---------- texturas ----------
function giz(cor) { // ladrilho de giz de cera: traços curtos na diagonal e o papel aparecendo nas falhas
  if (TEX[cor]) return TEX[cor];
  const n = 256, t = tela(n, n), c = t.getContext("2d"), r = rng(parseInt(cor.slice(1), 16));
  c.fillStyle = cor; c.globalAlpha = 0.72; c.fillRect(0, 0, n, n);
  c.strokeStyle = cor; c.lineCap = "round";
  for (let i = 0; i < 700; i++) {
    const x = r() * n, y = r() * n, a = -0.35 + (r() - 0.5) * 0.5, l = 12 + r() * 40;
    c.globalAlpha = 0.3 + r() * 0.5; c.lineWidth = 2 + r() * 5;
    for (const dx of [-n, 0, n]) for (const dy of [-n, 0, n]) {
      c.beginPath(); c.moveTo(x + dx, y + dy); c.lineTo(x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l); c.stroke();
    }
  }
  c.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 1800; i++) { c.globalAlpha = 0.4 + r() * 0.6; c.fillRect(r() * n, r() * n, 1 + r() * 3, 0.8 + r() * 1.4); }
  return (TEX[cor] = t);
}
function fazerNoite() { // azul-marinho em faixas horizontais de giz, como a noite da referência
  const m = 12, t = tela(W + m, H + m), c = t.getContext("2d"), r = rng(5), k = W / 1080;
  c.fillStyle = COR.noite; c.fillRect(0, 0, W + m, H + m);
  c.lineCap = "round";
  const tons = ["#1b2a7a", "#060d3a", "#24358c", "#040a2c", "#142270"];
  for (let i = 0; i < 2600; i++) {
    const x = r() * W, y = r() * H, l = (60 + r() * 480) * k;
    c.strokeStyle = tons[Math.floor(r() * tons.length)]; c.globalAlpha = 0.2 + r() * 0.35; c.lineWidth = (3 + r() * 13) * k;
    c.beginPath(); c.moveTo(x - l / 2, y); c.lineTo(x + l / 2, y + (r() - 0.5) * 3); c.stroke();
  }
  return t;
}
function fazerCeu() { // amanhecer: faixas de giz do azul (alto) ao amarelo (horizonte, a meia altura); embaixo, chão claro
  const m = 12, t = tela(W + m, H + m), c = t.getContext("2d"), r = rng(9), k = W / 1080;
  const faixas = [[0, "#3d63b6"], [0.22, "#6f9ad0"], [0.36, "#a8cce2"], [0.44, "#f1e3b4"], [0.5, "#e8b84a"], [0.52, "#efe8d2"], [1, "#e6dcc0"]];
  const corEm = (y) => { let i = 0; while (i < faixas.length - 2 && y > faixas[i + 1][0]) i++; return faixas[r() < (y - faixas[i][0]) / (faixas[i + 1][0] - faixas[i][0]) ? i + 1 : i][1]; };
  c.fillStyle = COR.papel; c.fillRect(0, 0, W + m, H + m);
  c.lineCap = "round";
  for (let i = 0; i < 3200; i++) {
    const x = r() * W, y = r() * H, l = (80 + r() * 520) * k;
    c.strokeStyle = corEm(y / H); c.globalAlpha = 0.35 + r() * 0.45; c.lineWidth = (6 + r() * 16) * k;
    c.beginPath(); c.moveTo(x - l / 2, y); c.lineTo(x + l / 2, y + (r() - 0.5) * 3); c.stroke();
  }
  return t;
}
function fundo(nome, f) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (nome === "noite" || nome === "ceu") { ctx.drawImage(nome === "noite" ? NOITE : CEU, -(f % 3) * 2 - 4, -((f >> 1) % 2) * 2 - 4); return; }
  ctx.fillStyle = COR.papel; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = "soft-light"; ctx.globalAlpha = 0.12;
  ctx.drawImage(GRAO, (f % 2) * 2 - 1, 0); ctx.restore();
}
function pinceladas(k, i) { // troca de fundo: faixas largas de giz entrando linha a linha, de cima para baixo
  const n = 9, h = H / n;
  ctx.beginPath();
  for (let l = -1; l <= n; l++) {
    const r = rng(i * 7 + l * 101 + 3), a = r(), b = r(), c = r(), ph = r() * 6;
    const kr = ease(k * 1.7 - (l + 1) * 0.07 - a * 0.05);
    if (kr <= 0) continue;
    const y = l * h + (b - 0.5) * h * 0.3, hh = h * (1.25 + c * 0.3), w = (W + hh * 2) * kr;
    if (w < hh) continue;
    amostrar(rr(l % 2 ? -hh : W + hh - w, y, w, hh, hh / 2), true, 18).forEach(([x, y], j) => { // borda ondulada de giz, nunca lisa
      y += Math.sin(x / 41 + ph) * hh * 0.05 + Math.sin(x / 13 + ph * 2) * hh * 0.015;
      j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath();
  }
  ctx.clip();
}

// ---------- um objeto: contorno de caneta que se traça, giz que entra varrendo ----------
function desenhar(c, o, u, fim, f, tinta, base) {
  const em = o.em ?? 0.2, dura = o.dura ?? 1.2, ate = o.ate ?? fim - SAI;
  const k = ease(clamp((u - em) / dura)) - ease(clamp((u - ate) / (SAI * 0.9)));
  if (k <= 0) return;
  c.save();
  if (o.move) { const [dx, dy] = chave(o.move, u); c.translate(dx, dy); }
  if (o.vibra) c.translate(((f % 2) * 2 - 1) * o.vibra, 0);
  if (o.guia) { // linhas-guia azul-claras do esboço, somem quando o desenho fecha
    const b = caixa(o.formas.flatMap((fm) => fm.pts)), x = b.x + b.w / 2, y = b.y + b.h / 2;
    c.strokeStyle = COR.guia; c.lineWidth = 1.6; c.globalAlpha = 0.7 * (1 - clamp((k - 0.5) / 0.5));
    c.beginPath(); c.moveTo(b.x - b.w * 0.3, y); c.lineTo(b.x + b.w * 1.3, y); c.moveTo(x, b.y - b.h * 0.3); c.lineTo(x, b.y + b.h * 1.3);
    c.rect(b.x, b.y, b.w, b.h); c.stroke(); c.globalAlpha = 1;
  }
  const n = o.formas.length, kt = clamp(k / 0.6), kf = clamp((k - 0.4) / 0.6);
  o.formas.forEach((fm, j) => {
    const r = rng(o.id * 997 + j * 31 + f * 7919);
    if (fm.cor && kf > 0) {
      const b = caixa(fm.pts), pat = c.createPattern(giz(fm.cor), "repeat");
      pat.setTransform(new DOMMatrix().translate(r() * 40, r() * 40));
      c.save(); c.beginPath(); c.rect(b.x - 20, b.y - 20, (b.w + 40) * kf, b.h + 40); c.clip();
      const borda = tremido(inflar(fm.pts, 2), 2.2, r, 1);
      c.fillStyle = base; caminho(c, fm.pts); c.fill(); // o giz cobre o que está atrás: as falhas mostram papel
      c.fillStyle = pat; caminho(c, borda); c.fill(); c.restore();
    }
    const kj = clamp(kt * n - j);
    if (fm.traco === false || kj <= 0) return;
    c.strokeStyle = fm.tinta || tinta; c.lineCap = c.lineJoin = "round";
    c.lineWidth = fm.larg || LARG; tracar(c, tremido(fm.pts, 0.9, r, 1), kj, fm.fechado);
    c.globalAlpha = 0.45; c.lineWidth *= 0.7; tracar(c, tremido(fm.pts, 1.7, r, 1), kj, fm.fechado); c.globalAlpha = 1;
  });
  c.restore();
}
function faisca(c, lista, u, f) { // o Claude: bolinha verde-menta de borda de giz; acende com raios. Chaves [t, x, y, luz, tamanho?]
  const [x, y, luz, tam = 1] = chave(lista, u), r = rng(f * 13 + 5), R = 13 * tam;
  if (tam < 0.03) return;
  c.fillStyle = COR.faisca;
  caminho(c, tremido(circulo(x, y, R, 14), 2.2, r, 1)); c.fill();
  if (luz < 0.05) return;
  c.strokeStyle = COR.faisca; c.lineWidth = 3.5; c.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + r() * 0.25, l1 = R * (1.7 + luz * (1.1 + r() * 0.6));
    c.beginPath(); c.moveTo(x + Math.cos(a) * R * 1.6, y + Math.sin(a) * R * 1.6); c.lineTo(x + Math.cos(a) * l1, y + Math.sin(a) * l1); c.stroke();
  }
}
function circulo(cx, cy, r, n = 36) { return [...Array(n)].map((_, i) => [cx + Math.cos((i / n) * 2 * Math.PI) * r, cy + Math.sin((i / n) * 2 * Math.PI) * r]); }

// ---------- legenda escrita à mão, letra por letra, apagada da esquerda para a direita ----------
function quebrar(txt, max) {
  const linhas = [""];
  for (const p of txt.split(" ")) {
    const t = linhas[linhas.length - 1] ? linhas[linhas.length - 1] + " " + p : p;
    if (ctx.measureText(t).width > max && linhas[linhas.length - 1]) linhas.push(p); else linhas[linhas.length - 1] = t;
  }
  return linhas;
}
function legenda(a, tq, cor) {
  const fl = a.fala;
  if (!fl) return;
  const txt = fl.texto.toLocaleLowerCase("pt-BR"), fs = P * 0.06;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = `${fs}px "Patrick Hand"`; ctx.fillStyle = cor; ctx.textBaseline = "alphabetic";
  const mostra = Math.floor(clamp((tq - fl.t0 + 0.08) / ((fl.t1 - fl.t0) * 0.9)) * txt.length);
  const apaga = Math.floor(clamp((tq - (a.t1 - SAI)) / (SAI * 0.8)) * txt.length);
  let n = 0;
  const larg = ctx.measureText(txt).width; // linhas de tamanho parecido, nunca uma palavra sozinha embaixo
  quebrar(txt, Math.min(P * 0.62, (larg / Math.ceil(larg / (P * 0.62))) * 1.25)).forEach((l, li) => {
    let x = CX - ctx.measureText(l).width / 2;
    for (const ch of l) {
      if (n >= apaga && n < mostra) ctx.fillText(ch, x, LEG + li * fs * 1.1);
      x += ctx.measureText(ch).width; n++;
    }
    n++; // o espaço onde a linha quebrou
  });
}

// ---------- quadro ----------
function iniciar(tempo) {
  TEMPO = tempo;
  [W, H] = TAM[tempo.formato];
  const el = document.getElementById("c");
  el.width = W; el.height = H;
  ctx = el.getContext("2d");
  LARGO = W > H * 1.2; // no quadro largo o desenho cresce e a legenda desce para a faixa de baixo
  P = LARGO ? 0.86 * H : Math.min(W, 0.72 * H); U = P / 1000; CX = W / 2; CY = (LARGO ? 0.44 : 0.42) * H;
  LEG = LARGO ? 0.87 * H : CY + P * 0.6;
  VIS = { x0: 500 - CX / U, x1: 500 + (W - CX) / U, y0: 500 - CY / U, y1: 500 + (H - CY) / U }; // a área visível, em unidades do palco
  GRAO = fazerGrao(); NOITE = fazerNoite(); CEU = fazerCeu(); PLANO = tela(W, H);
  CENA = tempo.atos.map((a, i) => {
    const c = CENAS[a.cena](rng(i * 31 + 7), a);
    c.objetos.forEach((o, n) => { o.id = i * 100 + n; o.formas.forEach((fm) => (fm.pts = amostrar(fm.pts, fm.fechado))); });
    return c;
  });
  return document.fonts.load(`40px "Patrick Hand"`);
}
function idx(t) { const i = TEMPO.atos.findIndex((a) => t >= a.t0 && t < a.t1); return i < 0 ? TEMPO.atos.length - 1 : i; }
function quadro(t) {
  const tq = Math.floor(t * DOZE + 1e-6) / DOZE, f = Math.round(tq * DOZE);
  const i = idx(tq), a = TEMPO.atos[i], c = CENA[i], u = tq - a.t0, fim = a.t1 - a.t0;
  const ant = i > 0 ? CENA[i - 1].fundo : c.fundo;
  if (ant !== c.fundo && u < PINCEL) {
    fundo(ant, f); ctx.save(); pinceladas(u / PINCEL, i); fundo(c.fundo, f); ctx.restore();
  } else fundo(c.fundo, f);
  const tinta = c.tinta || (c.fundo === "noite" ? COR.giz : COR.tinta);
  // câmera: respira devagar (aproxima 3,5%) se a cena não disser outra coisa; foco em z (1 = plano do assunto)
  const [cx, cy, zoom] = chave(c.cam || [[0, 0, 0, 1], [fim, 0, 0, 1.035]], u);
  const foco = c.foco ? chave(c.foco, u)[0] : 1, zf = c.faiscaZ ?? 1;
  const planos = new Map();
  for (const o of c.objetos) { const z = o.z ?? 1; planos.has(z) || planos.set(z, []); planos.get(z).push(o); }
  if (c.faisca && !planos.has(zf)) planos.set(zf, []);
  const lc = PLANO.getContext("2d");
  for (const z of [...planos.keys()].sort((p, q) => q - p)) { // do fundo para a frente
    lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, W, H);
    const s = U * (1 + (zoom - 1) / z);
    lc.setTransform(s, 0, 0, s, CX - (500 + cx / z) * s, CY - (500 + cy / z) * s);
    for (const o of planos.get(z)) desenhar(lc, o, u, fim, f, tinta, c.fundo === "noite" ? COR.noite : COR.papel);
    if (c.faisca && z === zf) faisca(lc, c.faisca, u, f);
    const b = (c.dof ?? 9) * Math.abs(1 / z - 1 / foco) * U; // desfoque: distância ao plano de foco
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = b > 0.3 ? `blur(${b.toFixed(1)}px)` : "none";
    ctx.drawImage(PLANO, 0, 0); ctx.filter = "none";
  }
  legenda(a, tq, tinta);
}

function eventos() { // para o som.py: cada traço, cada borracha, cada troca de fundo, cada faísca que acende
  const ev = [];
  TEMPO.atos.forEach((a, i) => {
    const c = CENA[i], fim = a.t1 - a.t0;
    if (i > 0 && CENA[i - 1].fundo !== c.fundo) ev.push({ t: a.t0, tipo: "pincelada", dura: PINCEL });
    for (const o of c.objetos) {
      const em = o.em ?? 0.2, dura = o.dura ?? 1.2, ate = o.ate ?? fim - SAI;
      if (em >= 0) ev.push({ t: a.t0 + em, tipo: "risco", dura, giz: o.formas.some((fm) => fm.cor), z: o.z ?? 1 });
      if (ate < fim) ev.push({ t: a.t0 + Math.max(0, ate), tipo: "apaga", dura: SAI * 0.9 });
      if (o.som) ev.push({ t: a.t0 + Math.max(0, em), tipo: o.som, dura: o.somDura ?? dura });
    }
    const fz = c.faisca || [];
    for (let k = 1; k < fz.length; k++) if (fz[k][3] > 0.5 && fz[k - 1][3] < 0.5) ev.push({ t: a.t0 + (fz[k - 1][0] + fz[k][0]) / 2, tipo: "plim" });
  });
  return ev.sort((p, q) => p.t - q.t);
}
