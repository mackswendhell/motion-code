// Quadros e loops das sementes da galeria, no Chrome headless (puppeteer do nucleo/2d).
// node nucleo/galeria/quadros.mjs folha <saida.jpg> <id|grupo> ...   4 quadros por semente, uma linha cada (para conferir)
// node nucleo/galeria/quadros.mjs mp4 <id> <saida.mp4> [fps]          o loop de 5 s em vídeo
import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const puppeteer = createRequire(path.join(AQUI, "../2d/package.json"))("puppeteer-core");
const [modo, ...args] = process.argv.slice(2);
const roda = (cmd, a) => new Promise((ok, falha) => spawn(cmd, a, { stdio: "inherit" }).on("close", (c) => (c ? falha(new Error(cmd + " " + c)) : ok())));

const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--allow-file-access-from-files"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("erro na página:", e.message));
async function abrir(id) {
  await page.goto(`file://${AQUI}/ver.html?id=${id}`);
  await page.evaluate(() => pronto);
}
const foto = async (t) => Buffer.from(await page.evaluate((t) => { quadro(t); return document.getElementById("c").toDataURL("image/png").slice(22); }, t), "base64");

if (modo === "folha") {
  const [saida, ...alvos] = args;
  await page.goto(`file://${AQUI}/ver.html`);
  const todas = await page.evaluate(() => pronto.then(() => SEMENTES.map((s) => [s.id, s.grupo])));
  const ids = todas.filter(([id, g]) => alvos.includes(id) || alvos.includes(g)).map(([id]) => id);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "folha-"));
  const linhas = [];
  for (const id of ids) {
    await abrir(id);
    const qs = [];
    for (const [i, t] of [0.4, 1.6, 3.0, 4.4].entries()) { const p = path.join(tmp, `${id}-${i}.png`); fs.writeFileSync(p, await foto(t)); qs.push(p); }
    const l = path.join(tmp, `${id}.png`);
    await roda("ffmpeg", ["-v", "error", "-y", ...qs.flatMap((q) => ["-i", q]), "-filter_complex",
      qs.map((_, i) => `[${i}]scale=-2:300[s${i}]`).join(";") + ";" + qs.map((_, i) => `[s${i}]`).join("") + `hstack=${qs.length}`, l]);
    linhas.push(l);
    console.log("ok", id);
  }
  // linhas de larguras diferentes (9:16 x 16:9): empilha com preenchimento
  await roda("ffmpeg", ["-v", "error", "-y", ...linhas.flatMap((q) => ["-i", q]), "-filter_complex",
    linhas.map((_, i) => `[${i}]pad=2140:300:0:0:0x222222[p${i}]`).join(";") + ";" + linhas.map((_, i) => `[p${i}]`).join("") + (linhas.length > 1 ? `vstack=${linhas.length}` : "null"), saida]);
  console.log("folha:", saida);
} else if (modo === "mp4") {
  const [id, saida, fps = 30] = args;
  await abrir(id);
  const ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", saida], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = 0; f < 5 * fps; f++) { const png = await foto(f / fps); if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r)); }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log("pronto:", saida);
}
await browser.close();
