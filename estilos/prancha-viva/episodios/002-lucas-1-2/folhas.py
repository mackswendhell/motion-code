"""Folhas de revisão a partir de quadros renderizados; arquivos locais ao episódio."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

EP=Path(__file__).resolve().parent
font='/System/Library/Fonts/Supplemental/Georgia.ttf'
small=ImageFont.truetype(font,18);title=ImageFont.truetype(font,36)
book=json.loads((EP/'storyboard.json').read_text())

def make_sheet(items,path,heading,cols,width):
    cell_w=width//cols;pad=18;im_w=cell_w-pad*2;im_h=round(im_w*9/16);cell_h=im_h+72
    rows=(len(items)+cols-1)//cols
    out=Image.new('RGB',(width,120+rows*cell_h),(239,230,209));d=ImageDraw.Draw(out)
    d.text((pad,25),heading,font=title,fill=(64,60,48))
    for i,(image,label,caption) in enumerate(items):
        x=(i%cols)*cell_w+pad;y=100+(i//cols)*cell_h
        im=Image.open(image).convert('RGB').resize((im_w,im_h),Image.Resampling.LANCZOS)
        out.paste(im,(x,y));d.text((x,y+im_h+9),label,font=small,fill=(64,60,48));d.text((x,y+im_h+34),caption[:47],font=small,fill=(107,97,75))
    out.save(path,quality=94)

items=[]
for a in book['pranchas']:
    path=EP/'quadros'/f'{a["id"]}.png'
    if path.exists():items.append((path,f'{a["id"]} · {a["referencia"]}',a['titulo']))
if items:make_sheet(items,EP/'quadros/40-pranchas-visao-geral.jpg','Lucas 1–2 · estudo das 40 composições · 16:9',5,2500)

video=EP/'amostra/amostra-anunciacao-nascimento-16x9.mp4'
if video.exists():
    timeline=json.loads((EP/'amostra/tempo.json').read_text());first=timeline['atos'][0];last=timeline['atos'][-1]
    times=[first['t0']+first['t1']*.3,first['t1']*.65,timeline['atos'][1]['t0']+10,timeline['atos'][2]['t0']+8,last['t0']+6,last['t1']-3]
    sampled=[]
    for i,t in enumerate(times):
        p=EP/'amostra'/f'quadro-{i+1:02}.jpg'
        subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1','-q:v','2',str(p)],check=True)
        a=next(a for a in timeline['atos'] if a['t0']<=t<a['t1'])
        sampled.append((p,f'{a["id"]} · {int(t)//60:02}:{int(t)%60:02}',a['titulo']))
    make_sheet(sampled,EP/'amostra/quadros-da-amostra.jpg','Anunciação e nascimento · amostra de direção',3,2100)
print('Folhas de revisão salvas no episódio.')
