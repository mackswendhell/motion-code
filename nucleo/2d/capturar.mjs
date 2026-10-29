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

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--allow-file-access-from-files"],
});
const page = await browser.newPage();
await page.goto("file://" + pagina);
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
  const mp4 = path.join(pasta, `${slug}.mp4`);
  const voz = path.join(pasta, "audio", "narracao.wav"); // estilos sem narração (Excel Desenhado) saem só com o vídeo
  const audio = fs.existsSync(voz) ? ["-i", voz, "-map", "0:v", "-map", "1:a", "-c:a", "aac", "-b:a", "192k"] : [];
  const ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", ...audio,
    "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", "-t", tempo.total.toFixed(3), mp4], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = 0; f < n; f++) {
    const png = await foto(f / fps);
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 48 === 0) process.stdout.write(`\r  quadro ${f}/${n}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log(`\npronto: ${mp4}`);
}
await browser.close();
