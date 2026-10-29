// Capturador local baseado no contrato do capturar.mjs compartilhado.
// Filme: partes de 120s, duas páginas independentes, checkpoint por hash.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
const EP=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(path.resolve(EP,'../../../../nucleo/2d/capturar.mjs'));
const puppeteer=require('puppeteer-core');
const args=process.argv.slice(2),quadros=args.includes('--quadros'),full=args.includes('--completo');
const target=path.join(EP,quadros?(full?'filme/quadros':'quadros'):full?'filme':'amostra');fs.mkdirSync(target,{recursive:true});
const timelinePath=path.join(EP,full?'filme/tempo.json':quadros?'tempo-planejado.json':'amostra/tempo.json');
const tempo=JSON.parse(fs.readFileSync(timelinePath,'utf8'));
const hash=crypto.createHash('sha256');
for(const f of [timelinePath,path.join(EP,'cenas.js'),path.join(EP,'pagina.html'),path.resolve(EP,'../../../../nucleo/2d/base.js')])hash.update(fs.readFileSync(f));
const signature=hash.update('1920x1080;24fps;jpeg96;crf18;fast;v2').digest('hex');
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--allow-file-access-from-files','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const procs=new Set(),errors=[];
async function newPage(){
  const page=await browser.newPage();await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});
  page.on('pageerror',e=>{errors.push(e.message);console.error('Erro Canvas:',e.message);});
  await page.goto('file://'+path.join(EP,'pagina.html'));await page.evaluate(t=>iniciar(t),tempo);
  if(errors.length)throw new Error(errors.join('\n'));return page;
}
function encode(cmd){
  const proc=spawn('ffmpeg',cmd,{stdio:['pipe','inherit','inherit']});procs.add(proc);
  proc.stdin.on('error',e=>console.error('Pipe:',e.message));
  const done=once(proc,'close').then(([code])=>{procs.delete(proc);if(code!==0)throw new Error('FFmpeg falhou: '+code);});
  return {proc,done};
}
async function frames(page,start,end,out,audio=false){
  const enc=encode(['-v','error','-y','-f','image2pipe','-framerate',String(tempo.fps),'-i','-',...(audio?['-i',path.join(target,'audio/mixagem.wav'),'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k']:['-an']),'-c:v','libx264','-crf','18','-preset','fast','-pix_fmt','yuv420p','-threads','3',...(audio?['-t',String(tempo.total)]:[]),'-movflags','+faststart',out]);
  let failure;enc.done.catch(e=>{failure=e;});
  for(let f=start;f<end;f++){
    if(failure)throw failure;
    if(enc.proc.exitCode!==null)throw new Error('Encoder encerrou antes do fim');
    const jpg=await page.evaluate(t=>{quadro(t);return document.getElementById('c').toDataURL('image/jpeg',.96).split(',')[1];},f/tempo.fps);
    if(!enc.proc.stdin.write(Buffer.from(jpg,'base64')))await once(enc.proc.stdin,'drain');
    if(f%480===0)console.log(`Render ${(f/tempo.fps).toFixed(0)}s / ${tempo.total.toFixed(0)}s`);
    if(errors.length)throw new Error(errors.join('\n'));
  }
  enc.proc.stdin.end();await enc.done;
}
try{
  if(quadros){
    const page=await newPage(),manifest=[];
    for(const a of tempo.atos){
      const fractions=full?[.18,.55,.84]:[.44];
      for(let j=0;j<fractions.length;j++){
        const t=a.t0+(a.t1-a.t0)*fractions[j];
        const png=await page.evaluate(t=>{quadro(t);return document.getElementById('c').toDataURL('image/png').slice(22);},t);
        const name=full?`${a.id}-${j+1}.png`:`${a.id}.png`;
        fs.writeFileSync(path.join(target,name),Buffer.from(png,'base64'));manifest.push({id:a.id,t,arquivo:name});
      }
      console.log(`Prancha ${a.id}`);
    }
    fs.writeFileSync(path.join(target,'quadros.json'),JSON.stringify(manifest,null,2));
  }else if(full){
    const dir=path.join(target,'partes');fs.mkdirSync(dir,{recursive:true});
    const totalFrames=Math.ceil(tempo.total*tempo.fps),block=120*tempo.fps;
    const jobs=[];
    for(let start=0,index=1;start<totalFrames;start+=block,index++){
      const end=Math.min(start+block,totalFrames),out=path.join(dir,`${String(index).padStart(3,'0')}.mp4`);
      const meta={signature,start,end,fps:tempo.fps};
      const exists=fs.existsSync(out)&&fs.existsSync(out+'.json')&&fs.readFileSync(out+'.json','utf8')===JSON.stringify(meta);
      if(exists){console.log(`Checkpoint reaproveitado: parte ${index}`);continue;}
      jobs.push({start,end,out,meta,index});
    }
    let cursor=0;
    async function worker(){
      const page=await newPage();
      while(cursor<jobs.length){const job=jobs[cursor++],temp=job.out.replace('.mp4','.recebendo.mp4');
        console.log(`Iniciando parte ${job.index}`);await frames(page,job.start,job.end,temp);
        const probe=spawnSync('ffprobe',['-v','error','-show_entries','stream=width,height,nb_frames','-of','json',temp],{encoding:'utf8'});
        if(probe.status!==0)throw new Error('Parte inválida: '+job.index);
        const info=JSON.parse(probe.stdout).streams[0];
        if(info.width!==1920||info.height!==1080||Number(info.nb_frames)!==job.end-job.start)throw new Error('Contagem inválida na parte '+job.index);
        fs.renameSync(temp,job.out);fs.writeFileSync(job.out+'.json',JSON.stringify(job.meta));console.log(`Parte ${job.index} concluída`);
      }await page.close();
    }
    await Promise.all([worker(),worker()]);
    const list=Array.from({length:Math.ceil(totalFrames/block)},(_,i)=>`file '${String(i+1).padStart(3,'0')}.mp4'`).join('\n')+'\n';
    fs.writeFileSync(path.join(dir,'lista.txt'),list);
    const escapeMeta=s=>s.replaceAll('\\','\\\\').replaceAll('=','\\=').replaceAll(';','\\;').replaceAll('#','\\#').replaceAll('\n',' ');
    const chapters=';FFMETADATA1\ntitle=O que Maria guardava no coração — Lucas 1–2\n'+tempo.atos.map(a=>`[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(a.t0*1000)}\nEND=${Math.round(a.t1*1000)}\ntitle=${escapeMeta(a.titulo)}\n`).join('');
    fs.writeFileSync(path.join(target,'capitulos.ffmeta'),chapters);
    const out=path.join(target,'lucas-1-2-16x9.mp4'),temp=path.join(target,'lucas-1-2-16x9.recebendo.mp4');
    const mux=spawn('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',path.join(dir,'lista.txt'),'-i',path.join(target,'audio/mixagem.wav'),'-f','ffmetadata','-i',path.join(target,'capitulos.ffmeta'),'-map','0:v','-map','1:a','-map_metadata','2','-map_chapters','2','-c:v','copy','-c:a','aac','-b:a','192k','-t',String(tempo.total),'-movflags','+faststart',temp],{stdio:['ignore','inherit','inherit']});procs.add(mux);
    const [code]=await once(mux,'close');procs.delete(mux);if(code!==0)throw new Error('Falha na montagem final: '+code);
    fs.renameSync(temp,out);fs.writeFileSync(path.join(target,'render.json'),JSON.stringify({signature,quadros:totalFrames,fps:tempo.fps,duracao:tempo.total,partes:Math.ceil(totalFrames/block)},null,2));console.log('Vídeo completo: '+out);
  }else{
    const page=await newPage();await frames(page,0,Math.ceil(tempo.total*tempo.fps),path.join(target,'amostra-anunciacao-nascimento-16x9.mp4'),true);
  }
  if(errors.length)throw new Error(errors.join('\n'));
}finally{for(const proc of procs)if(proc.exitCode===null)proc.kill('SIGTERM');await browser.close();}
