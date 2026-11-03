// Stills de conferência em lote, com um bundle só (remotion still faz um bundle por quadro).
// Uso, em estilos/studio: node tools/stills.mjs <Composicao> <pasta-saida> <segundos...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [id, out, ...tempos] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('projetos')});
const comp = await selectComposition({serveUrl, id});
for (const t of tempos) {
  const frame = Math.round(Number(t) * comp.fps);
  await renderStill({serveUrl, composition: comp, frame, output: path.join(out, `s${String(t).padStart(6, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 70});
  process.stdout.write(t + ' ');
}
// o bundle carrega uma cópia de projetos/ inteira: no 009, as sobras de 10 execuções encheram o disco
fs.rmSync(serveUrl, {recursive: true, force: true});
