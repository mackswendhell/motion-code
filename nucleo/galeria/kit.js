// Kit da galeria de estilos: utilidades para as sementes (loops de 5 s) desenharem em qualquer canvas.
// Carregar depois de nucleo/2d/base.js (rng, ease, tremido, tracar, hachura, aquarela). Nada aqui usa estado global de tela.

const DUR = 5;
const SEMENTES = [];
const TAMS = { "16:9": [1920, 1080], "9:16": [1080, 1920], "1:1": [1080, 1080] };
const semente = (s) => SEMENTES.push(s);
// cada grupo é um arquivo em sementes/<id>.js
const GRUPOS = [
  { id: "vertical", nome: "Vertical e Reels", desc: "feitos para o celular: gancho no primeiro segundo, legenda grande, ritmo de corte" },
  { id: "prancha", nome: "Prancha e explicador", desc: "explicar um processo, um ciclo ou um mapa em desenho" },
  { id: "dados", nome: "Dados e gráficos", desc: "números que contam a história sozinhos" },
  { id: "produto", nome: "Produto e interface", desc: "lançamento, app, site, ficha técnica" },
  { id: "tipografia", nome: "Tipografia e aberturas", desc: "títulos, vinhetas, cartelas e chamadas" },
  { id: "artesanal", nome: "Texturas artesanais", desc: "giz, aquarela, risografia, papel e tinta" },
  { id: "cenas", nome: "Cenas e 3D", desc: "lugares em loop, isométrico, profundidade" },
];
const carregarGrupos = (base) => Promise.all(GRUPOS.map((g) => new Promise((ok) => {
  const s = document.createElement("script"); s.src = `${base}sementes/${g.id}.js`; s.onload = s.onerror = ok; document.head.append(s);
})));

const CLAUDE = { creme: "#f0eee6", papel: "#faf9f5", tinta: "#3d3929", terracota: "#d97757", argila: "#c6613f", areia: "#e3dacc", oliva: "#788c5d", ceu: "#6a9bcc", cinza: "#b0aea5" };

// tempo
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const fase = (t, a, b) => ease((t - a) / (b - a));                     // 0→1 suave entre a e b
const sai = (x) => 1 - Math.pow(1 - clamp(x), 3);                       // ease-out cúbico
const volta = (x) => { x = clamp(x); const s = 1.7; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); }; // passa e volta
const entra = (t, a, d = 0.45) => volta((t - a) / d);                   // pop de entrada com sobra
const ciclo = (t, n = 1) => Math.sin((2 * Math.PI * n * t) / DUR);      // periódico exato no loop
const ciclo01 = (t, n = 1) => 0.5 - 0.5 * Math.cos((2 * Math.PI * n * t) / DUR);
// janela de vida: entra em a, some em b; o loop emenda porque tudo nasce e morre dentro dos 5 s
const vida = (t, a, b, d = 0.35) => Math.min(fase(t, a, a + d), 1 - fase(t, b - d, b));

// forma
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function borda(pts, amp, seed, passos = 6) { return tremido(pts, amp, rng(seed), passos); } // borda de papel rasgado
function retRasgado(x, y, w, h, amp, seed) { return borda([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], amp, seed, Math.max(4, Math.round((w + h) / 40))); }

// recorte de papel com sombra: a peça básica do visual de colagem
function recorte(c, x, y, w, h, cor, { seed = 1, amp = 3, sombra = 14, rot = 0, grao = true } = {}) {
  c.save();
  c.translate(x + w / 2, y + h / 2); c.rotate(rot); c.translate(-w / 2, -h / 2);
  const pts = retRasgado(0, 0, w, h, amp, seed);
  c.shadowColor = "rgba(40,25,10,.28)"; c.shadowBlur = sombra; c.shadowOffsetY = sombra * 0.35;
  caminho(c, pts); c.fillStyle = cor; c.fill();
  c.shadowColor = "transparent";
  if (grao) { c.save(); c.clip(); c.globalAlpha = 0.18; c.globalCompositeOperation = "multiply"; c.fillStyle = padraoGrao(c); c.fillRect(0, 0, w, h); c.restore(); }
  c.restore();
}
function fita(c, x, y, w, rot = -0.1, cor = "rgba(236,226,196,.82)") {
  c.save(); c.translate(x, y); c.rotate(rot);
  const h = w * 0.32, pts = borda([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], 1.6, Math.round(x + y), 3);
  caminho(c, pts); c.fillStyle = cor; c.fill();
  c.restore();
}

// textura: um ladrilho de grão reaproveitado por todas as telas
let _grao;
function padraoGrao(c) {
  if (!_grao) {
    const g = tela(256, 256), gc = g.getContext("2d"), img = gc.createImageData(256, 256), r = rng(11);
    for (let i = 0; i < img.data.length; i += 4) { const v = 150 + (r() - 0.5) * 120; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    gc.putImageData(img, 0, 0);
    _grao = g;
  }
  return c.createPattern(_grao, "repeat");
}
function fundo(c, W, H, cor, { grao = 0.16, vinheta = 0.25 } = {}) {
  c.fillStyle = cor; c.fillRect(0, 0, W, H);
  if (grao) { c.save(); c.globalAlpha = grao; c.globalCompositeOperation = "multiply"; c.fillStyle = padraoGrao(c); c.fillRect(0, 0, W, H); c.restore(); }
  if (vinheta) {
    const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(40,25,10,${vinheta})`);
    c.fillStyle = v; c.fillRect(0, 0, W, H);
  }
}

// texto
function texto(c, s, x, y, { tam = 64, peso = 700, cor = CLAUDE.tinta, fonte = "Helvetica Neue, Arial, sans-serif", alinha = "center", base = "middle", alpha = 1, larg = 0, espaco = 0 } = {}) {
  c.save();
  c.globalAlpha *= alpha;
  c.font = `${peso} ${tam}px ${fonte}`;
  c.textAlign = alinha; c.textBaseline = base; c.fillStyle = cor;
  if (espaco) c.letterSpacing = espaco + "px";
  if (larg) { const m = c.measureText(s).width; if (m > larg) { c.translate(x, y); c.scale(larg / m, larg / m); c.fillText(s, 0, 0); c.restore(); return; } }
  c.fillText(s, x, y);
  c.restore();
}
// digita um texto até a fração k
const digita = (s, k) => s.slice(0, Math.round(clamp(k) * s.length));
const SERIF = "Iowan Old Style, Georgia, serif", SANS = "Helvetica Neue, Arial, sans-serif", MONO = "Menlo, Courier New, monospace",
  MAO = "Marker Felt, Chalkboard SE, Comic Sans MS, cursive", GROSSA = "Impact, Helvetica Neue, sans-serif", FUTURA = "Futura, Avenir Next, sans-serif";

// cor
function mistura(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (p, s) => (p >> s) & 255;
  const m = (s) => Math.round(lerp(ch(pa, s), ch(pb, s), k));
  return `rgb(${m(16)},${m(8)},${m(0)})`;
}
