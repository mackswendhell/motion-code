"""Conferência auxiliar da fala; modelos/cache ficam somente neste episódio."""
import os
import sys
sys.dont_write_bytecode=True
from pathlib import Path
EP=Path(__file__).resolve().parent
os.environ['HF_HOME']=str(EP/'.cache/huggingface')
os.environ['XDG_CACHE_HOME']=str(EP/'.cache')
os.environ['HF_HUB_DISABLE_TELEMETRY']='1'
import argparse
import difflib
import json
import re
import subprocess
import unicodedata
import numpy as np
from faster_whisper import WhisperModel

def normalized(s):
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
    return re.findall(r'\w+',s)

parser=argparse.ArgumentParser();parser.add_argument('--modelo',default='base');parser.add_argument('--tomadas',action='store_true');parser.add_argument('--completo',action='store_true');parser.add_argument('--pranchas');args=parser.parse_args()
target=EP/('filme' if args.completo else 'amostra')
timeline=json.loads((target/'tempo.json').read_text())
model=WhisperModel(args.modelo,device='cpu',compute_type='int8',download_root=str(EP/'.modelos'))
results=[]
for a in timeline['atos']:
    if args.pranchas and a['id'] not in args.pranchas.split(','):continue
    if args.tomadas:
        for f in a['falas']:
            raw=subprocess.run(['ffmpeg','-v','error','-i',str(EP/f['arquivo']),'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
            text=' '.join(s.text.strip() for s in model.transcribe(np.frombuffer(raw,np.float32),language='pt',beam_size=5,condition_on_previous_text=False)[0])
            score=difflib.SequenceMatcher(None,normalized(f['texto']),normalized(text)).ratio()
            results.append(dict(prancha=a['id'],quem=f['quem'],arquivo=f['arquivo'],similaridade_palavras=round(score,3),texto_esperado=f['texto'],transcricao=text))
            print(f'{a["id"]} {f["quem"]}: {score:.1%} · {text}',flush=True)
        continue
    path=target/'audio'/f'{a["id"]}-vozes.wav'
    raw=subprocess.run(['ffmpeg','-v','error','-i',str(path),'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
    text=' '.join(s.text.strip() for s in model.transcribe(np.frombuffer(raw,np.float32),language='pt',beam_size=5,condition_on_previous_text=False)[0])
    expected=' '.join(f['texto'] for f in a['falas'])
    score=difflib.SequenceMatcher(None,normalized(expected),normalized(text)).ratio()
    results.append(dict(prancha=a['id'],similaridade_palavras=round(score,3),texto_esperado=expected,transcricao=text))
    print(f'{a["id"]}: {score:.1%} · {text}',flush=True)
suffix='-tomadas' if args.tomadas else ''
if args.pranchas:suffix+='-'+args.pranchas.replace(',','-')
(target/f'conferencia-fala-{args.modelo}{suffix}.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
