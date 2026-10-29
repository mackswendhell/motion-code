// Painel Motion: player com linha do tempo e tweaks para os episódios do estúdio, aberto no browser pane do Claude Desktop.
// Uso (da raiz): node nucleo/2d/estudio/servidor.mjs [porta]   -> http://localhost:4317
// Só escuta em 127.0.0.1. Serve a raiz do estúdio (o player carrega o motor de cada estilo) e uma API pequena.
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../..");
const ESTILOS = path.join(RAIZ, "estilos");
const PORTA = Number(process.argv[2] || 4317);
const NOME = /^[a-z0-9][a-z0-9-]*$/;
const FORMATOS = ["16:9", "9:16", "1:1"];
const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ttf": "font/ttf", ".woff2": "font/woff2",
  ".wav": "audio/wav", ".mp3": "audio/mpeg", ".mp4": "video/mp4" };

const lerJson = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null);
const dentro = (p) => p === RAIZ || p.startsWith(RAIZ + path.sep);

function pastaEp(estilo, slug) {
  if (!NOME.test(estilo || "") || !NOME.test(slug || "")) return null;
  const p = path.join(ESTILOS, estilo, "episodios", slug);
  return fs.existsSync(p) ? p : null;
}
function videoDe(estilo, slug) { // o mp4 mais acabado do episódio
  const ep = pastaEp(estilo, slug);
  for (const n of [`${slug}-final.mp4`, `${slug}.mp4`, "loop.mp4"]) if (fs.existsSync(path.join(ep, n))) return `estilos/${estilo}/episodios/${slug}/${n}`;
  return null;
}
function episodios() {
  const lista = [];
  for (const estilo of fs.readdirSync(ESTILOS).filter((n) => NOME.test(n)).sort()) {
    const dir = path.join(ESTILOS, estilo, "episodios");
    if (!fs.existsSync(dir)) continue;
    const motor2d = fs.existsSync(path.join(ESTILOS, estilo, "motor", "pagina.html"));
    for (const slug of fs.readdirSync(dir).filter((n) => NOME.test(n)).sort()) {
      const ep = path.join(dir, slug);
      const tempo = fs.existsSync(path.join(ep, "tempo.json"));
      const tipo = motor2d && tempo ? "2d" : videoDe(estilo, slug) ? "video" : null;
      if (!tipo) continue;
      const mt = Math.max(...fs.readdirSync(ep).map((n) => fs.statSync(path.join(ep, n)).mtimeMs));
      lista.push({ estilo, slug, tipo, mt });
    }
  }
  return lista;
}
function detalhe(estilo, slug) {
  const ep = pastaEp(estilo, slug);
  if (!ep) return null;
  const rel = `estilos/${estilo}/episodios/${slug}`;
  const audio = {};
  for (const k of ["narracao", "trilha", "efeitos"]) if (fs.existsSync(path.join(ep, "audio", `${k}.wav`))) audio[k] = `${rel}/audio/${k}.wav`;
  const fazer = path.join(ESTILOS, estilo, "fazer.sh");
  const roteiro = lerJson(path.join(ep, "roteiro.json"));
  return {
    estilo, slug, rel,
    titulo: roteiro?.titulo || slug,
    tempo: lerJson(path.join(ep, "tempo.json")),
    tweaks: lerJson(path.join(ep, "tweaks.json")) || {},
    pagina: fs.existsSync(path.join(ESTILOS, estilo, "motor", "pagina.html")) ? `estilos/${estilo}/motor/pagina.html` : null,
    video: videoDe(estilo, slug),
    audio,
    renderiza: fs.existsSync(fazer) && fs.existsSync(path.join(ESTILOS, estilo, "motor", "pagina.html")),
    aceitaFormato: fs.existsSync(fazer) && fs.readFileSync(fazer, "utf8").includes("--formato"),
  };
}

// ---------- render (um por vez) ----------
let render = null; // { estilo, slug, formato, log, rodando, codigo }
function renderizar(estilo, slug, formato, ate) {
  if (render?.rodando) return { erro: "já tem um render rodando" };
  const d = detalhe(estilo, slug);
  if (!d?.renderiza) return { erro: "esse estilo não renderiza pelo painel" };
  const args = [`episodios/${slug}`];
  if (formato && d.aceitaFormato) { if (!FORMATOS.includes(formato)) return { erro: "formato inválido" }; args.push("--formato", formato); }
  if (ate) { if (!/^\d{1,3}$/.test(String(ate))) return { erro: "ato inválido" }; args.push("--ate", String(ate)); }
  render = { estilo, slug, formato, log: "", rodando: true, codigo: null, inicio: Date.now() };
  const r = render;
  const p = spawn("./fazer.sh", args, { cwd: path.join(ESTILOS, estilo) });
  const junta = (b) => { r.log = (r.log + b.toString().replace(/\r/g, "\n")).slice(-20000); };
  p.stdout.on("data", junta); p.stderr.on("data", junta);
  p.on("close", (c) => { r.rodando = false; r.codigo = c; });
  return { ok: true };
}

// ---------- http ----------
function corpo(req, max = 30e6) {
  return new Promise((ok, falha) => {
    let n = 0; const partes = [];
    req.on("data", (b) => { n += b.length; if (n > max) { falha(new Error("grande demais")); req.destroy(); } else partes.push(b); });
    req.on("end", () => ok(Buffer.concat(partes)));
  });
}
const json = (res, v, st = 200) => { res.writeHead(st, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(v)); };

function arquivo(req, res, rel) {
  const p = path.resolve(RAIZ, "." + decodeURIComponent(rel));
  if (!dentro(p) || path.basename(p).startsWith(".env") || !fs.existsSync(p) || !fs.statSync(p).isFile()) { res.writeHead(404); return res.end(); }
  const tam = fs.statSync(p).size, tipo = TIPOS[path.extname(p).toLowerCase()] || "application/octet-stream";
  const faixa = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
  if (faixa) { // áudio e vídeo precisam de Range para a agulha pular
    const a = faixa[1] ? Number(faixa[1]) : 0, b = faixa[2] ? Math.min(Number(faixa[2]), tam - 1) : tam - 1;
    res.writeHead(206, { "content-type": tipo, "content-range": `bytes ${a}-${b}/${tam}`, "accept-ranges": "bytes", "content-length": b - a + 1, "cache-control": "no-store" });
    return fs.createReadStream(p, { start: a, end: b }).pipe(res);
  }
  res.writeHead(200, { "content-type": tipo, "content-length": tam, "accept-ranges": "bytes", "cache-control": "no-store" });
  fs.createReadStream(p).pipe(res);
}

http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://localhost");
    const q = Object.fromEntries(u.searchParams);
    if (u.pathname === "/") { res.writeHead(302, { location: "/nucleo/2d/estudio/index.html" + u.search }); return res.end(); }
    if (!u.pathname.startsWith("/api/")) return arquivo(req, res, u.pathname);
    if (req.method !== "GET" && req.headers["x-motion"] !== "1") return json(res, { erro: "origem" }, 403); // só o próprio painel escreve
    if (u.pathname === "/api/episodios") return json(res, episodios());
    if (u.pathname === "/api/ep") { const d = detalhe(q.estilo, q.slug); return d ? json(res, d) : json(res, { erro: "episódio não encontrado" }, 404); }
    if (u.pathname === "/api/tweaks" && req.method === "POST") {
      const ep = pastaEp(q.estilo, q.slug); if (!ep) return json(res, { erro: "episódio não encontrado" }, 404);
      const v = JSON.parse((await corpo(req, 1e5)).toString());
      const limpo = Object.fromEntries(Object.entries(v).filter(([k, x]) => NOME.test(k) && Number.isFinite(x)));
      const p = path.join(ep, "tweaks.json");
      if (Object.keys(limpo).length) fs.writeFileSync(p, JSON.stringify(limpo, null, 1) + "\n"); else fs.rmSync(p, { force: true });
      return json(res, { ok: true, tweaks: limpo });
    }
    if (u.pathname === "/api/quadro" && req.method === "POST") {
      const ep = pastaEp(q.estilo, q.slug); if (!ep || !/^\d+(\.\d+)?$/.test(q.t || "")) return json(res, { erro: "pedido inválido" }, 400);
      const png = await corpo(req);
      if (png.subarray(1, 4).toString() !== "PNG") return json(res, { erro: "não é PNG" }, 400);
      fs.mkdirSync(path.join(ep, "quadros"), { recursive: true });
      const nome = `q${Number(q.t).toFixed(2)}${q.formato ? "-" + q.formato.replace(":", "x") : ""}.png`;
      fs.writeFileSync(path.join(ep, "quadros", nome), png);
      return json(res, { ok: true, arquivo: `estilos/${q.estilo}/episodios/${q.slug}/quadros/${nome}` });
    }
    if (u.pathname === "/api/render" && req.method === "POST") return json(res, renderizar(q.estilo, q.slug, q.formato, q.ate));
    if (u.pathname === "/api/render") return json(res, render ? { ...render, log: render.log.slice(-3000) } : null);
    json(res, { erro: "rota desconhecida" }, 404);
  } catch (err) {
    json(res, { erro: String(err.message || err) }, 500);
  }
}).listen(PORTA, "127.0.0.1", () => console.log(`painel Motion: http://localhost:${PORTA}`));
