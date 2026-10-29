"""Coro de Lc 2,14: tomadas independentes, sem alterar altura ou velocidade."""
import sys
sys.dont_write_bytecode=True
import concurrent.futures
import hashlib
import json
import shutil
import wave
from pathlib import Path
import numpy as np
from produzir import EP,SR,request,protected,write_wav

protected()
target=EP/'filme';tempo=json.loads((target/'tempo.json').read_text())
a=next(a for a in tempo['atos'] if a['id']=='P24')
f=next(f for f in a['falas'] if f['quem']=='Multidão celestial')
def take(who,i):
    return request({'id':'P24-coro'},i,{'quem':who,'direcao':'louvor sereno, em conjunto, cadência ampla, sem gritar nem acrescentar palavras'},f['texto'])
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    futures=[pool.submit(take,who,i) for i,who in enumerate(['Gabriel','Simeão'])]
    extras=[f.result() for f in futures]

def load(path):
    with wave.open(str(path),'rb') as w:
        assert w.getframerate()==SR and w.getnchannels()==1
        return np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(np.float32)/32768

full=target/'audio/vozes.wav';backup=target/'audio/vozes-sem-coro.wav'
stamp=target/'audio/vozes-sem-coro.json'
timeline_hash=hashlib.sha256((target/'tempo.json').read_bytes()).hexdigest()
if not backup.exists() or not stamp.exists() or json.loads(stamp.read_text()).get('timeline')!=timeline_hash:
    shutil.copyfile(full,backup);stamp.write_text(json.dumps({'timeline':timeline_hash})+'\n')
mix=load(backup);begin=round((a['t0']+f['t0'])*SR);end=round((a['t0']+f['t1'])*SR)
mix[begin:end]*=.84
records=[]
for i,(clip,path,env) in enumerate(extras):
    start=begin+round((.07+i*.06)*SR)
    if start+len(clip)>round((a['t1']-.5)*SR):raise RuntimeError('Coro não cabe no respiro da cena')
    mix[start:start+len(clip)]+=clip*.20
    records.append({'ator':['Gabriel','Simeão'][i],'arquivo':str(path.relative_to(EP)),'inicio_s':start/SR,'duracao_s':len(clip)/SR,'ganho':.20,'texto':f['texto']})
write_wav(full,mix)
write_wav(target/'audio/P24-vozes.wav',mix[round(a['t0']*SR):round(a['t1']*SR)])
(target/'coro.json').write_text(json.dumps({'referencia':'Lucas 2,14','lead':f['arquivo'],'tomadas_adicionais':records,'processamento':'ganho, atraso de entrada; sem mudança de altura ou velocidade'},ensure_ascii=False,indent=2)+'\n')
protected();print('Coro montado em P24, com três tomadas independentes.')
