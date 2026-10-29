// Núcleo 2D do estúdio (nucleo/2d): utilidades de desenho e papel, usadas por todos os estilos em Canvas.
// Cada estilo carrega este arquivo antes do seu cena.js e define iniciar(tempo) e quadro(t).

const TAM = { "16:9": [1920, 1080], "9:16": [1080, 1920], "1:1": [1080, 1080] };
let W, H, ctx, TEMPO, GRAO, MANCHA;
// ajustes do painel Motion (tweaks.json do episódio, posto em window.TWEAKS antes do iniciar); 1 = como foi aprovado
const tw = (k) => (self.TWEAKS && self.TWEAKS[k]) ?? 1;

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const seg = (t, a, b) => ease((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const tela = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

function hexPts(cx, cy, r, rot = 0) {
  return [...Array(6)].map((_, i) => [cx + r * Math.cos(rot + (i * Math.PI) / 3), cy + r * Math.sin(rot + (i * Math.PI) / 3)]);
}
function caminho(c, pts, fechado = true) {
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  if (fechado) c.closePath();
}
// contorno com tremido de mão: subdivide e empurra cada ponto um pouco
function tremido(pts, amp, rnd, passos = 5) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
    const nx = -(by - ay), ny = bx - ax, l = Math.hypot(nx, ny) || 1;
    for (let s = 0; s < passos; s++) {
      const k = s / passos, d = (rnd() - 0.5) * 2 * amp * tw("tremido");
      out.push([lerp(ax, bx, k) + (nx / l) * d, lerp(ay, by, k) + (ny / l) * d]);
    }
  }
  return out;
}
// traça só a fração k do contorno: o desenho se construindo na tela
function tracar(c, pts, k, fechado = true) {
  const p = fechado ? [...pts, pts[0]] : pts;
  const lens = p.slice(1).map((q, i) => Math.hypot(q[0] - p[i][0], q[1] - p[i][1]));
  let resto = k * lens.reduce((a, b) => a + b, 0);
  c.beginPath();
  c.moveTo(...p[0]);
  for (let i = 0; i < lens.length && resto > 0; i++) {
    const f = Math.min(1, resto / lens[i]);
    c.lineTo(lerp(p[i][0], p[i + 1][0], f), lerp(p[i][1], p[i + 1][1], f));
    resto -= lens[i];
  }
  c.stroke();
}
// linha de tinta: um traço firme e um eco deslocado, como caneta sobre papel
function tinta(c, desenha, cor, larg, alpha = 1) {
  c.save();
  c.strokeStyle = cor;
  c.lineCap = c.lineJoin = "round";
  c.globalAlpha = alpha;
  c.lineWidth = larg * tw("traco");
  desenha();
  c.globalAlpha = alpha * 0.3;
  c.translate(0.9, 0.7);
  c.lineWidth = larg * tw("traco") * 0.6;
  desenha();
  c.restore();
}
function hachura(c, x0, y0, w, h, passo, ang, cor, larg, rnd) {
  c.save();
  c.strokeStyle = cor; c.lineWidth = larg;
  const dx = Math.cos(ang), dy = Math.sin(ang), L = Math.hypot(w, h);
  for (let s = -L; s < L; s += passo) {
    const px = x0 + w / 2 - dy * s, py = y0 + h / 2 + dx * s, j = (rnd() - 0.5) * passo * 0.4;
    c.beginPath(); c.moveTo(px - dx * L + j, py - dy * L); c.lineTo(px + dx * L + j, py + dy * L); c.stroke();
  }
  c.restore();
}
// mancha de aquarela: muitas manchas redondas e moles, sobrepostas
function aquarela(c, w, h, cores, n, alpha, rnd) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, y = rnd() * h, r = 60 + rnd() * Math.max(w, h) * 0.22;
    const cor = cores[Math.floor(rnd() * cores.length)];
    const g = c.createRadialGradient(x, y, r * 0.1, x, y, r);
    g.addColorStop(0, cor + "aa"); g.addColorStop(0.9, cor); g.addColorStop(0.97, cor); g.addColorStop(1, cor + "00");
    c.globalAlpha = alpha * (0.4 + rnd() * 0.6);
    c.fillStyle = g;
    caminho(c, tremido([...Array(12)].map((_, k) => [x + Math.cos(k * 0.5236) * r, y + Math.sin(k * 0.5236) * r]), r * 0.08, rnd, 4)); c.fill();
  }
  c.globalAlpha = 1;
}

// ---------- papel ----------
function fazerGrao() {
  const g = tela(W, H), c = g.getContext("2d");
  const img = c.createImageData(W, H), r = rng(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (r() - 0.5) * 80;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  c.globalAlpha = 0.22; // fibras do papel
  for (let i = 0; i < 4000; i++) {
    const x = r() * W, y = r() * H, a = r() * Math.PI, l = 6 + r() * 30;
    c.strokeStyle = r() < 0.5 ? "#fff" : "#000";
    c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  return g;
}
function fazerMancha() { // manchas grandes do papel, para nada ficar liso
  const m = tela(W, H), c = m.getContext("2d");
  c.fillStyle = "#fff"; c.fillRect(0, 0, W, H);
  aquarela(c, W, H, ["#d9c3a0", "#c7b08a", "#e9dcc0", "#b9a27a"], 60, 0.5, rng(21));
  return m;
}
function papel(t) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 0.22 * tw("mancha");
  ctx.drawImage(MANCHA, 0, 0);
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = Math.min(1, 0.6 * tw("grao"));
  const j = Math.floor(t * 12) % 4; // o grão "ferve" de leve, a 12 por segundo
  ctx.drawImage(GRAO, (j % 2) * 3 - 1.5, (j >> 1) * 3 - 1.5);
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 1;
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.hypot(W, H) * 0.62);
  v.addColorStop(0, "rgba(255,255,255,0)");
  v.addColorStop(1, `rgba(120,80,50,${Math.min(1, 0.45 * tw("vinheta"))})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

