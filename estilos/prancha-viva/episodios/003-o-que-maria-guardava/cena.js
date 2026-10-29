// Motor do 003 (O que Maria guardava): câmera em camadas, pintura em aquarela, luz, passagens e o contrato iniciar/quadro.
// Fica no episódio para não mexer no motor do estilo; usa o nucleo/2d/base.js (rng, ease, tremido, aquarela, papel).
// Personagens em personagens.js, cenários e encenação em cenas.js.

const INK = "#3b2619";
let TEXP, BUF = [];

// ---------- cor ----------
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgba = (h, a = 1) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
function mist(h1, h2, k) {
  const a = hex(h1), b = hex(h2);
  return "#" + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, "0")).join("");
}
const esc = (h, k) => mist(h, "#2a1a12", k);
const cla = (h, k) => mist(h, "#fff6e4", k);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const onda = (t, p = 1, f = 0) => Math.sin(t * Math.PI * 2 / p + f);

// ---------- caminhos ----------
function suave(c, pts, fechado = true) { // curva que passa pelos pontos médios
  const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  c.beginPath();
  if (!fechado) {
    c.moveTo(...pts[0]);
    for (let i = 1; i < n - 1; i++) c.quadraticCurveTo(...pts[i], ...m(pts[i], pts[i + 1]));
    c.lineTo(...pts[n - 1]);
    return;
  }
  c.moveTo(...m(pts[n - 1], pts[0]));
  for (let i = 0; i < n; i++) c.quadraticCurveTo(...pts[i], ...m(pts[i], pts[(i + 1) % n]));
  c.closePath();
}
function caixa(pts) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  return [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0];
}

// pintura em aquarela de uma forma: cor, volume (luz em cima, sombra embaixo), textura do papel, hachura na sombra,
// borda que acumula pigmento e contorno de tinta. o: { luz, sombra, hach, tinta, larg, seed, liso, borda }
function pinta(c, pts, cor, o = {}) {
  const [x, y, w, h] = caixa(pts), r = rng(o.seed || 1), a0 = c.globalAlpha;
  const forma = () => (o.liso === false ? caminho(c, pts) : suave(c, pts));
  c.save();
  forma(); c.fillStyle = cor; c.fill();
  c.clip();
  const g = c.createLinearGradient(x, y, x + w * 0.35, y + h);
  g.addColorStop(0, `rgba(255,244,220,${o.luz ?? 0.22})`);
  g.addColorStop(0.55, "rgba(255,244,220,0)");
  g.addColorStop(1, `rgba(50,28,18,${o.sombra ?? 0.28})`);
  c.fillStyle = g; c.fillRect(x - 2, y - 2, w + 4, h + 4);
  c.globalCompositeOperation = "multiply"; c.globalAlpha = a0 * 0.45;
  c.fillStyle = TEXP; c.fillRect(x - 2, y - 2, w + 4, h + 4);
  c.globalCompositeOperation = "source-over"; c.globalAlpha = a0;
  if (o.hach) hachura(c, x + w * 0.55, y + h * 0.35, w * 0.5, h * 0.7, o.hach, -0.9, "rgba(59,38,25,0.16)", 1, r);
  c.restore();
  if (o.borda !== false) { c.save(); forma(); c.strokeStyle = rgba(esc(cor, 0.35), 0.45); c.lineWidth = 5; c.stroke(); c.restore(); }
  if (o.tinta !== false) {
    const tr = tremido(pts, o.trem ?? 1.1, r, 2);
    c.save(); (o.liso === false ? caminho(c, tr) : suave(c, tr));
    c.strokeStyle = o.cortinta || INK; c.globalAlpha = a0 * (o.alpha ?? 0.85); c.lineWidth = o.larg || 2.6; c.lineJoin = "round"; c.stroke(); c.restore();
  }
}
function linha(c, pts, cor = INK, larg = 2, alpha = 0.8, curva = true) {
  c.save(); c.globalAlpha *= alpha; c.strokeStyle = cor; c.lineWidth = larg; c.lineCap = c.lineJoin = "round";
  curva ? suave(c, pts, false) : caminho(c, pts, false); c.stroke(); c.restore();
}
function elip(c, x, y, rx, ry, cor, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); c.fillStyle = cor; c.fill(); }
function circulo(x, y, r, n = 12, amp = 0, rr = null) {
  return [...Array(n)].map((_, i) => { const a = (i / n) * Math.PI * 2, k = 1 + (rr ? (rr() - 0.5) * amp : 0); return [x + Math.cos(a) * r * k, y + Math.sin(a) * r * k]; });
}
function retang(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }

// ---------- luz ----------
function brilho(c, x, y, r, cor = "#ffe9b8", a = 0.6, modo = "screen") {
  if (a <= 0.001 || r <= 1) return;
  c.save(); c.globalCompositeOperation = modo;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(cor, a)); g.addColorStop(0.35, rgba(cor, a * 0.45)); g.addColorStop(1, rgba(cor, 0));
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}
function raios(c, x, y, ang, abre, comp, a, t, n = 7, cor = "#fff1c8") { // feixes de luz em leque, tremulando devagar
  if (a <= 0.001) return;
  c.save(); c.globalCompositeOperation = "screen";
  for (let i = 0; i < n; i++) {
    const k = n === 1 ? 0 : i / (n - 1) - 0.5, an = ang + k * abre, w = abre / n * (0.4 + 0.3 * (1 + onda(t, 5 + i, i)));
    const g = c.createRadialGradient(x, y, 0, x, y, comp);
    const al = a * (0.5 + 0.5 * onda(t, 4.3 + i * 0.7, i * 2));
    g.addColorStop(0, rgba(cor, al * 0.55)); g.addColorStop(0.6, rgba(cor, al * 0.2)); g.addColorStop(1, rgba(cor, 0));
    c.fillStyle = g; c.beginPath(); c.moveTo(x, y);
    c.lineTo(x + Math.cos(an - w) * comp, y + Math.sin(an - w) * comp); c.lineTo(x + Math.cos(an + w) * comp, y + Math.sin(an + w) * comp);
    c.closePath(); c.fill();
  }
  c.restore();
}
function poeira(c, seed, n, t, [x, y, w, h], cor = "#fff3d0", a = 0.6, sobe = 8) {
  const r = rng(seed);
  c.save(); c.globalCompositeOperation = "screen";
  for (let i = 0; i < n; i++) {
    const px = x + ((r() * w + onda(t, 9 + r() * 6, r() * 6) * 30) % w + w) % w, py = y + (((r() * h - t * sobe * (0.5 + r())) % h) + h) % h;
    const tw = 0.4 + 0.6 * Math.abs(onda(t, 2 + r() * 3, r() * 6));
    elip(c, px, py, 1 + r() * 2.2, 1 + r() * 2.2, rgba(cor, a * tw));
  }
  c.restore();
}
function estrelas(c, seed, n, [x, y, w, h], t, a = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const px = x + r() * w, py = y + r() * h * r(), s = 0.6 + r() * 1.8, tw = 0.55 + 0.45 * onda(t, 1.5 + r() * 3, r() * 6);
    elip(c, px, py, s, s, rgba("#f6ecc8", a * tw));
    if (s > 2.1) { c.save(); c.globalAlpha = a * tw * 0.6; linha(c, [[px - s * 3, py], [px + s * 3, py]], "#f6ecc8", 0.8, 1, false); linha(c, [[px, py - s * 3], [px, py + s * 3]], "#f6ecc8", 0.8, 1, false); c.restore(); }
  }
}
function chama(c, x, y, s, t, seed = 0) { // chama de lamparina: gota que dança
  const b = onda(t, 0.37, seed) * 0.12 + onda(t, 0.23, seed * 2) * 0.07;
  brilho(c, x, y - 10 * s, 130 * s, "#ffcf7a", 0.42 + b * 0.5);
  c.save(); c.translate(x, y); c.scale(s, s);
  const ponta = [b * 18, -46 - b * 14];
  for (const [k, cor] of [[1, "#f2a24a"], [0.62, "#ffe39a"], [0.3, "#fffbe8"]]) {
    c.beginPath(); c.moveTo(0, 2);
    c.bezierCurveTo(-13 * k, -4, -10 * k + b * 6, -28 * k, ponta[0] * k, ponta[1] * k);
    c.bezierCurveTo(10 * k + b * 6, -28 * k, 13 * k, -4, 0, 2);
    c.fillStyle = cor; c.fill();
  }
  c.restore();
}
function lamparina(c, x, y, s, t, acesa = 1) {
  const pts = [[-46, -6], [-30, -24], [20, -24], [52, -14], [58, -8], [40, 4], [-36, 6]].map(([a, b]) => [x + a * s, y + b * s]);
  pinta(c, pts, "#a8673f", { seed: 5, hach: 6 });
  elip(c, x - 6 * s, y - 22 * s, 16 * s, 4 * s, "#5e3a24");
  if (acesa > 0) { c.save(); c.globalAlpha *= acesa; chama(c, x + 50 * s, y - 14 * s, s * 0.8, t, 1); c.restore(); }
}
function orbe(c, x, y, r, t, a = 1) { // uma lembrança guardada: luz quente com cintilância
  if (a <= 0.001) return;
  const p = 1 + onda(t, 1.7, x) * 0.12;
  brilho(c, x, y, r * 5 * p, "#ffd98a", 0.35 * a);
  brilho(c, x, y, r * 2 * p, "#fff1c4", 0.8 * a);
  elip(c, x, y, r * 0.55, r * 0.55, rgba("#fffbea", a));
  c.save(); c.globalCompositeOperation = "screen"; c.globalAlpha = a * (0.6 + 0.4 * onda(t, 0.9, y));
  c.strokeStyle = "#fff3c8"; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(x - r * 2.4, y); c.lineTo(x + r * 2.4, y); c.moveTo(x, y - r * 2.4); c.lineTo(x, y + r * 2.4); c.stroke();
  c.restore();
}
// lembrança que sai de um ponto e voa até o peito de Maria: a de 0 a 1 ao longo de [t0, t1]
function voaOrbe(c, de, para, u, t0, t1, t) {
  if (u < t0) return;
  const k = seg(u, t0, t1), x = lerp(de[0], para[0], k) + Math.sin(k * Math.PI) * 60, y = lerp(de[1], para[1], k) - Math.sin(k * Math.PI) * 120;
  const a = u < t1 ? seg(u, t0, t0 + 0.6) : 1 - seg(u, t1, t1 + 0.9);
  orbe(c, x, y, 7, t, a);
  if (u > t1 - 0.2) brilho(c, para[0], para[1], 90, "#ffe2a0", 0.5 * Math.sin(Math.PI * seg(u, t1 - 0.2, t1 + 0.9)));
}
function fumaca(c, x, y, t, forca = 1, seed = 3, alt = 520) { // incenso: fios que sobem ondulando
  const r = rng(seed);
  c.save();
  for (let i = 0; i < 46; i++) {
    const fase = r(), k = ((t * 0.09 + fase) % 1), py = y - k * alt, px = x + Math.sin(k * 7 + t * 0.7 + fase * 9) * (12 + k * 70) + (r() - 0.5) * 16;
    const rad = 10 + k * 55;
    c.globalAlpha = forca * 0.16 * Math.sin(Math.PI * k);
    elip(c, px, py, rad, rad * 0.8, "#f3ead6");
  }
  c.restore();
}

// ---------- câmera ----------
// cam = { x, y, z }: o ponto do mundo no centro da tela e o zoom. Camada de profundidade p: 1 = plano dos personagens,
// menor = mais longe (anda menos), maior = primeiro plano.
function vista(c, cam, p = 1) {
  const z = 1 + (cam.z - 1) * p, cx = W / 2 + (cam.x - W / 2) * p, cy = H / 2 + (cam.y - H / 2) * p;
  c.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
}
function noMundo(cam, x, y) { return [W / 2 + (x - cam.x) * cam.z, H / 2 + (y - cam.y) * cam.z]; }

// estado em chaves: [t, {campos}, d]: segura o valor e, nos d segundos antes de t, passa suavemente para o novo
function anima(chaves, u, base = {}) {
  let s = { ...base };
  for (const [t, k, d = 0.8] of chaves) {
    const p = d <= 0 ? (u >= t ? 1 : 0) : seg(u, t - d, t);
    if (p <= 0) break;
    s = mistura(s, { ...s, ...k }, p);
    if (p < 1) break;
  }
  return s;
}
function mistura(a, b, k) {
  const o = {};
  for (const n in b) {
    const va = a[n], vb = b[n];
    if (typeof vb === "number" && typeof va === "number") o[n] = lerp(va, vb, k);
    else if (Array.isArray(vb) && Array.isArray(va)) o[n] = vb.map((v, i) => lerp(va[i] ?? v, v, k));
    else o[n] = k < 0.5 && va !== undefined ? va : vb;
  }
  return o;
}

// ---------- falas do ato ----------
const F = (A, k) => (A.falas[k] ? A.falas[k].t0 - A.t0 : 999);
const FE = (A, k) => (A.falas[k] ? A.falas[k].t1 - A.t0 : 999);
const DUR = (A) => A.t1 - A.t0;
function voz(A, quem, u) { // abertura da boca de quem está falando agora (0 a 1)
  for (const f of A.falas) {
    if (f.quem !== quem) continue;
    const l = u - (f.t0 - A.t0);
    if (l >= 0 && l < f.t1 - f.t0) {
      const i = Math.floor(l * TEMPO.fps), a = f.boca[i] || 0, b = f.boca[i + 1] || 0;
      return lerp(a, b, l * TEMPO.fps - i);
    }
  }
  return 0;
}
const falando = (A, k, u) => u >= F(A, k) && u < FE(A, k);

// ---------- cache das camadas de cada cenário ----------
const CACHE = new Map();
function camadas(nome) {
  if (!CACHE.has(nome)) {
    if (CACHE.size > 3) CACHE.delete(CACHE.keys().next().value);
    CACHE.set(nome, CENARIOS[nome]());
  }
  return CACHE.get(nome);
}
function pinturaFixa(w, h, desenha) { const cv = tela(w, h), c = cv.getContext("2d"); desenha(c, w, h); return cv; }

// ---------- passagens ----------
const PASSA = { funde: 1.2, luz: 1.8, tinta: 1.7, chama: 2.2, afasta: 1.6 };
let MASCARA;
function passagem(tipo, k, de, para, foco) {
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (tipo === "luz") {
    c.drawImage(de, 0, 0); c.globalAlpha = ease(k); c.drawImage(para, 0, 0); c.globalAlpha = 1;
    brilho(c, W / 2, H * 0.45, W * 0.9, "#fff0cc", 0.95 * Math.sin(Math.PI * k));
  } else if (tipo === "chama" || tipo === "afasta") {
    const [fx, fy] = foco || [W / 2, H / 2], z = tipo === "chama" ? 1 + ease(k) * 2.2 : 1 + ease(k) * 0.35;
    c.save(); c.translate(fx, fy); c.scale(z, z); c.translate(-fx, -fy); c.drawImage(de, 0, 0); c.restore();
    const z2 = lerp(1.25, 1, ease(k));
    c.save(); c.globalAlpha = ease(seg(k, 0.25, 1)); c.translate(W / 2, H / 2); c.scale(z2, z2); c.translate(-W / 2, -H / 2); c.drawImage(para, 0, 0); c.restore();
    if (tipo === "chama") brilho(c, W / 2, H / 2, W, "#ffd690", 0.85 * Math.sin(Math.PI * k));
  } else if (tipo === "tinta") { // a cena nova se espalha como aguada sobre o papel
    const m = MASCARA.getContext("2d"), r = rng(77);
    m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = "source-over"; m.clearRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) {
      const x = r() * W, y = r() * H, d = r() * 0.45, rad = ease(seg(k, d, d + 0.55)) * (260 + r() * 380);
      if (rad < 2) continue;
      const g = m.createRadialGradient(x, y, rad * 0.6, x, y, rad);
      g.addColorStop(0, "#000"); g.addColorStop(1, "rgba(0,0,0,0)");
      m.fillStyle = g; caminho(m, tremido(circulo(x, y, rad, 14), rad * 0.07, r, 3)); m.fill();
    }
    m.globalCompositeOperation = "source-in"; m.drawImage(para, 0, 0);
    c.drawImage(de, 0, 0); c.drawImage(MASCARA, 0, 0);
    if (k > 0.85) { c.globalAlpha = seg(k, 0.85, 1); c.drawImage(para, 0, 0); c.globalAlpha = 1; }
  } else {
    c.drawImage(de, 0, 0); c.globalAlpha = ease(k); c.drawImage(para, 0, 0); c.globalAlpha = 1;
  }
}

// ---------- contrato ----------
function iniciar(tempo) {
  TEMPO = tempo;
  [W, H] = TAM[tempo.formato];
  const cv = document.getElementById("c");
  cv.width = W; cv.height = H;
  ctx = cv.getContext("2d");
  GRAO = fazerGrao(); MANCHA = fazerMancha();
  const tx = pinturaFixa(512, 512, (c) => {
    c.fillStyle = "#fff"; c.fillRect(0, 0, 512, 512);
    aquarela(c, 512, 512, ["#e6d8c0", "#d2bf9e", "#f2e8d6", "#c8b190"], 46, 0.55, rng(3));
    const r = rng(9);
    for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(90,60,40,${r() * 0.14})`; c.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2); }
  });
  TEXP = ctx.createPattern(tx, "repeat");
  BUF = [tela(W, H), tela(W, H)];
  MASCARA = tela(W, H);
}
function atoEm(t) {
  const a = TEMPO.atos;
  for (let i = 0; i < a.length; i++) if (t < a[i].t1) return i;
  return a.length - 1;
}
function desenhaAto(c, i, u) {
  const A = TEMPO.atos[i];
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
  CENAS[A.cena](c, u, A);
  c.setTransform(1, 0, 0, 1, 0, 0);
}
function quadro(t) {
  const i = atoEm(t), A = TEMPO.atos[i], u = t - A.t0;
  const tr = A.entrada && PASSA[A.entrada] && i > 0 ? PASSA[A.entrada] : 0;
  if (tr && u < tr) {
    const P = TEMPO.atos[i - 1], [b0, b1] = BUF;
    desenhaAto(b0.getContext("2d"), i - 1, t - P.t0);
    desenhaAto(b1.getContext("2d"), i, u);
    passagem(A.entrada, u / tr, b0, b1, FOCO[P.cena]);
  } else desenhaAto(ctx, i, u);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const fim = TEMPO.total - t; // o filme termina no papel quente
  if (fim < 3) { ctx.fillStyle = `rgba(236,221,192,${ease(1 - fim / 3)})`; ctx.fillRect(0, 0, W, H); }
  if (t < 1.2) { ctx.fillStyle = `rgba(236,221,192,${1 - ease(t / 1.2)})`; ctx.fillRect(0, 0, W, H); }
  papel(t);
}
