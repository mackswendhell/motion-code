"""Folhas de revisão e verificação final, sem alterações fora do episódio."""
import sys
sys.dont_write_bytecode=True
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from produzir import EP,protected

FILM=EP/'filme'
TIMELINE=json.loads((FILM/'tempo.json').read_text())
BOOK=json.loads((EP/'storyboard.json').read_text())
FONT='/System/Library/Fonts/Supplemental/Georgia.ttf'

def write(path,value):path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

def sheet(items,path,title,cols=5,width=2500):
    cw=width//cols;pad=16;imw=cw-pad*2;imh=round(imw*9/16);ch=imh+68
    rows=(len(items)+cols-1)//cols
    im=Image.new('RGB',(width,105+rows*ch),'#eee5ce');d=ImageDraw.Draw(im)
    big=ImageFont.truetype(FONT,32);small=ImageFont.truetype(FONT,17)
    d.text((18,24),title,font=big,fill='#493d35')
    for i,(src,label,desc) in enumerate(items):
        x=(i%cols)*cw+pad;y=90+(i//cols)*ch
        with Image.open(src) as pic:im.paste(pic.convert('RGB').resize((imw,imh),Image.Resampling.LANCZOS),(x,y))
        d.text((x,y+imh+8),label,font=small,fill='#493d35')
        d.text((x,y+imh+32),desc[:48],font=small,fill='#73694f')
    im.save(path,quality=93)

def review():
    protected();items=[];stats=[];titles={a['id']:a['titulo'] for a in TIMELINE['atos']}
    manifest=json.loads((FILM/'quadros/quadros.json').read_text())
    assert len(manifest)==120
    folder=FILM/'revisao';folder.mkdir(exist_ok=True)
    for frame in manifest:
        src=FILM/'quadros'/frame['arquivo'];t=frame['t']
        with Image.open(src) as im:
            gray=np.asarray(im.convert('L').resize((320,180)),dtype=np.float32)
            assert im.size==(1920,1080)
            assert float(gray.std())>8,frame['arquivo']
            stats.append({'arquivo':frame['arquivo'],'media':round(float(gray.mean()),2),'desvio':round(float(gray.std()),2)})
        label=f'{frame["id"]} · {int(t)//60:02}:{int(t)%60:02}'
        items.append((src,label,titles[frame['id']]))
    for i in range(4):sheet(items[i*30:(i+1)*30],folder/f'revisao-{i+1}.jpg',f'Lucas 1–2 · revisão visual {i+1}/4 · três momentos por prancha')
    mid=[item for i,item in enumerate(items) if i%3==1]
    sheet(mid,FILM/'pranchas-do-filme.jpg','Lucas 1–2 · as 40 pranchas do filme')
    write(folder/'quadros-verificados.json',{'quadros':len(stats),'resolucao':[1920,1080],'estatisticas':stats})
    print('120 quadros conferidos; quatro folhas de revisão e visão das 40 pranchas salvas.',flush=True)

def validate():
    protected();video=FILM/'lucas-1-2-16x9.mp4'
    probe=json.loads(subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-show_chapters','-of','json',str(video)],capture_output=True,check=True,text=True).stdout)
    visual=next(s for s in probe['streams'] if s['codec_type']=='video')
    audio=next(s for s in probe['streams'] if s['codec_type']=='audio')
    assert (visual['width'],visual['height'],visual['r_frame_rate'])==(1920,1080,'24/1')
    assert audio['channels']==2
    assert abs(float(probe['format']['duration'])-TIMELINE['total'])<.08
    assert len(probe['chapters'])==40
    for got,want in zip(probe['chapters'],TIMELINE['atos']):
        assert got['tags']['title']==want['titulo']
        assert abs(float(got['start_time'])-want['t0'])<.002
    coverage=set()
    for a,b in zip(TIMELINE['atos'],BOOK['pranchas']):
        assert a['id']==b['id']
        assert ' '.join(f['texto'] for f in a['falas'])==' '.join(f['texto'] for f in b['falas'])
        coverage.update((b['capitulo'],v) for v in range(b['versiculos'][0],b['versiculos'][1]+1))
    assert coverage=={(1,v) for v in range(1,81)}|{(2,v) for v in range(1,53)}
    print('Decodificando o filme completo para conferir integridade...',flush=True)
    subprocess.run(['ffmpeg','-v','error','-i',str(video),'-map','0:v:0','-map','0:a:0','-f','null','-'],check=True)
    print('Medindo áudio do MP4 final...',flush=True)
    loud=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(video),'-vn','-af','loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json','-f','null','-'],capture_output=True,check=True,text=True)
    found=re.findall(r'\{\s*"input_i".*?\}',loud.stderr,re.S)
    assert found,'Estatísticas de loudness ausentes'
    sound=json.loads(found[-1]);assert float(sound['input_tp'])<-.3,sound
    write(FILM/'audio/loudness-mp4.json',sound)
    # Quadros extraídos do próprio arquivo, incluindo começo/fim e emendas de partes.
    evidence=FILM/'evidencias';evidence.mkdir(exist_ok=True)
    times=sorted(set([0,5,TIMELINE['total']-1]+[min(TIMELINE['total']-1,a['t0']+3) for a in TIMELINE['atos']]+[s+.05 for s in range(120,int(TIMELINE['total']),120)]))
    for i,t in enumerate(times):
        path=evidence/f'{i:02}-{t:.2f}.jpg'
        subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1','-q:v','3',str(path)],check=True)
        with Image.open(path) as im:assert np.asarray(im.convert('L')).std()>8
    report={
        'arquivo':video.name,'duracao_s':float(probe['format']['duration']),
        'resolucao':[1920,1080],'fps':24,'codec_video':visual['codec_name'],
        'codec_audio':audio['codec_name'],'canais':audio['channels'],
        'capitulos':40,'versiculos_cobertos':132,'blocos_de_fala':sum(len(a['falas']) for a in TIMELINE['atos']),
        'texto_linha_do_tempo':'idêntico ao storyboard aprovado',
        'decodificacao_integral':'sem erros',
        'loudness_integrado_lufs':float(sound['input_i']),'pico_real_dbtp':float(sound['input_tp']),
        'quadros_do_mp4_inspecionaveis':len(times),'arquivos_protegidos_integros':protected(),
        'tamanho_bytes':video.stat().st_size,'sha256':hashlib.file_digest(video.open('rb'),'sha256').hexdigest()
    }
    write(FILM/'verificacao-final.json',report)
    write(FILM/'informacoes-do-arquivo.json',probe)
    print(json.dumps(report,ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('etapa',choices=['quadros','verificar']);args=parser.parse_args()
    if args.etapa=='quadros':review()
    else:validate()
