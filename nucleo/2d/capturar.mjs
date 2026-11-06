// Captura um estilo 2D quadro a quadro no Chrome headless e monta o MP4 com a narração.
// Uso (de dentro da pasta do estilo): node ../../nucleo/2d/capturar.mjs motor/pagina.html episodios/<slug> [--still t1,t2,... pasta_saida]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const pagina = path.resolve(process.argv[2]);
const pasta = path.resolve(process.argv[3]);
const slug = path.basename(pasta);
const tempo = JSON.parse(fs.readFileSync(path.join(pasta, "tempo.json"), "utf8"));
const iStill = process.argv.indexOf("--still");
const pTw = path.join(pasta, "tweaks.json"); // ajustes salvos pelo painel Motion
const tweaks = fs.existsSync(pTw) ? JSON.parse(fs.readFileSync(pTw, "utf8")) : {};

// CHROME_CDP=http://127.0.0.1:9222 usa um Chrome já aberto (o chrome-agent) em vez de abrir um headless: serve quando o
// sandbox não deixa abrir o Chrome. Esse Chrome não lê arquivo local, então a página é montada aqui: scripts injetados,
// fonte (url("file://...")) e imagens do episódio (ativos/, prints/) como data URL, em window.DADOS[caminho].
const cdp = process.env.CHROME_CDP;
const browser = cdp ? await puppeteer.connect({ browserURL: cdp }) : await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--allow-file-access-from-files"],
});
const page = await browser.newPage();
if (cdp) {
  const dir = path.dirname(pagina), html = fs.readFileSync(pagina, "utf8");
  const b64 = (f) => fs.readFileSync(f).toString("base64");
  await page.setContent(html.replace(/<script src="[^"]+"><\/script>/g, "")
    .replace(/url\("file:\/\/([^"]+)"\)/g, (_, f) => `url(data:font/ttf;base64,${b64(f)})`));
  for (const [, src] of html.matchAll(/<script src="([^"]+)"/g)) await page.addScriptTag({ content: fs.readFileSync(path.resolve(dir, src), "utf8") });
  const dados = {};
  for (const sub of ["ativos", "prints"]) {
    const d = path.join(pasta, sub);
    if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) {
      const ext = path.extname(f).slice(1).toLowerCase();
      if (["png", "jpg", "jpeg", "webp"].includes(ext)) dados[`${sub}/${f}`] = `data:image/${ext === "jpg" ? "jpeg" : ext};base64,${b64(path.join(d, f))}`;
    }
  }
  await page.evaluate((d) => { window.DADOS = d; }, dados);
} else {
  await page.goto("file://" + pagina);
}
await page.evaluate((t, w) => { window.TWEAKS = w; return iniciar(t); }, tempo, tweaks); // return: espera iniciar assíncrono (fontes, imagens)
const ev = await page.evaluate(() => (typeof eventos === "function" ? eventos() : null)); // estilos com som sincronizado ao desenho
if (ev) fs.writeFileSync(path.join(pasta, "eventos.json"), JSON.stringify(ev, null, 1));
const foto = async (t) =>
  Buffer.from(await page.evaluate((t) => { quadro(t); return document.getElementById("c").toDataURL("image/png").slice(22); }, t), "base64");

if (iStill > 0) {
  const saida = process.argv[iStill + 2] || "/tmp";
  for (const t of process.argv[iStill + 1].split(",").map(Number)) {
    fs.writeFileSync(path.join(saida, `q${t.toFixed(2)}.png`), await foto(t));
  }
} else {
  const fps = tempo.fps, n = Math.round(tempo.total * fps);
  // tempo.alfa: camada transparente para ir por cima de uma gravação (Kraft); sai em .mov ProRes 4444 (guarda o alfa e
  // fica ~10x menor que PNG no .mov, que passou de 3 GB em 52 s), sem áudio
  const mp4 = path.join(pasta, `${slug}.${tempo.alfa ? "mov" : "mp4"}`);
  const voz = path.join(pasta, "audio", "narracao.wav"); // estilos sem narração (Excel Desenhado) saem só com o vídeo
  const audio = fs.existsSync(voz) && !tempo.alfa ? ["-i", voz, "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k"] : [];
  const codec = tempo.alfa ? ["-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-qscale:v", "11"] : ["-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];
  const ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", ...audio,
    ...codec, "-t", tempo.total.toFixed(3), mp4], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = 0; f < n; f++) {
    const png = await foto(f / fps);
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 48 === 0) process.stdout.write(`\r  quadro ${f}/${n}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log(`\npronto: ${mp4}`);
}
if (cdp) { await Promise.race([page.close(), new Promise((r) => setTimeout(r, 3000))]); browser.disconnect(); } // o Chrome do Macks continua aberto
else await browser.close();
