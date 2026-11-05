// Motor de atos dos estilos feitos a partir da galeria (Kraft, Atlas, Laboratório, Vitrine Web, Ficha Técnica e os do /estilo).
// A página do estilo carrega base.js, kit.js, este arquivo e o cenas.js do estilo, que define CENAS[nome](c, u, d, W, H, ato).
//   u = segundos desde o começo do ato, d = duração do ato, ato = o ato do tempo.json (cena, fala, tela: dados livres do roteiro).
// Opcional no cenas.js: legenda(c, ato, u, W, H) por cima de tudo, e FUNDE (segundos de fusão entre atos; padrão 0.3).
// tela.imagem / tela.imagens: caminhos relativos à pasta do estilo (peças pintadas na Higgsfield); ficam em IMG[caminho].

let ATOS, W0, H0, CX;
const IMG = {};

async function iniciar(tempo) {
  ATOS = tempo;
  [W0, H0] = TAMS[tempo.formato || "16:9"];
  const cv = document.getElementById("c");
  cv.width = W0; cv.height = H0; CX = cv.getContext("2d");
  const caminhos = new Set(tempo.atos.flatMap((a) => [a.tela?.imagem, ...(a.tela?.imagens || [])]).filter(Boolean));
  await Promise.all([...caminhos].map((p) => new Promise((ok) => { const im = new Image(); im.onload = () => { IMG[p] = im; ok(); }; im.onerror = ok; im.src = "../" + p; })));
  await document.fonts.ready;
}

function desenhaAto(a, t) {
  const cena = CENAS[a.cena] || CENAS.padrao;
  CX.save(); cena(CX, t - a.t0, a.t1 - a.t0, W0, H0, a); CX.restore();
}

function quadro(t) {
  const atos = ATOS.atos, j = atos.findIndex((a) => t < a.t1), i = j === -1 ? atos.length - 1 : j, a = atos[i];
  const funde = typeof FUNDE === "number" ? FUNDE : 0.3;
  desenhaAto(a, t);
  const ant = atos[i - 1];
  if (ant && a.entrada !== "corte" && t - a.t0 < funde) { // o ato anterior some por cima do novo
    CX.save(); CX.globalAlpha = 1 - (t - a.t0) / funde; desenhaAto(ant, ant.t1 - 0.001); CX.restore();
  }
  if (typeof legenda === "function" && a.fala && t >= a.fala.t0 && t <= a.fala.t1 + 0.2) { CX.save(); legenda(CX, a, t - a.t0, W0, H0, t); CX.restore(); }
}

// pedaço da fala que está sendo dito agora (sem o transcritor, divide o texto pelo tempo da fala)
function trechoDaFala(a, t, palavrasPorBloco = 4) {
  const ps = a.fala.texto.split(/\s+/), k = clamp((t - a.fala.t0) / Math.max(0.1, a.fala.t1 - a.fala.t0));
  const n = Math.ceil(ps.length / palavrasPorBloco), b = Math.min(n - 1, Math.floor(k * n));
  return ps.slice(b * palavrasPorBloco, (b + 1) * palavrasPorBloco).join(" ");
}
