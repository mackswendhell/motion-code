"""Foley curto e sincronizado para a prova Motion Pro. Sem bibliotecas de sons."""
import numpy as np
import wave
import sys
from pathlib import Path
SR=48000
ep=Path(sys.argv[1]);rng=np.random.default_rng(24)
mix=np.zeros((SR*12,2),dtype=np.float64)

def add(x,t,gain=.2,pan=0):
    start=round(t*SR);end=min(len(mix),start+len(x));x=x[:end-start]*gain
    if len(x):
        mix[start:end,0]+=x*np.sqrt((1-pan)/2)
        mix[start:end,1]+=x*np.sqrt((1+pan)/2)

def click(t,freq=800,gain=.16,pan=0):
    x=np.arange(int(.095*SR))/SR
    s=np.sin(2*np.pi*(freq*x-170*x*x))*np.exp(-x*64)
    s+=rng.normal(0,1,len(x))*.12*np.exp(-x*170)
    add(s,t,gain,pan)

def whoosh(t,d=.32,gain=.16,pan=0):
    n=int(d*SR);x=np.arange(n)/SR;noise=rng.normal(0,1,n)
    smooth=np.convolve(noise,np.ones(19)/19,'same')
    s=smooth*np.sin(np.pi*x/d)**2
    s+=.12*np.sin(2*np.pi*(170*x+700*x*x))*np.sin(np.pi*x/d)**2
    add(s,t,gain,pan)

def impact(t,gain=.23):
    x=np.arange(int(.23*SR))/SR
    s=np.sin(2*np.pi*(95*x-110*x*x))*np.exp(-x*20)
    s+=.12*rng.normal(0,1,len(x))*np.exp(-x*75)
    add(s,t,gain)

for i,t in enumerate([.38,.87,1.65]):click(t,1050+i*170,.15,(-.25+i*.25))
for t in [2.65,4.25,5.85,8.55,8.88,10.82]:whoosh(t,.30,.27)
for i in range(4):
    click(4.28+i*.13,700+i*100,.10, -.55+i*.36)
    click(5.03+i*.18,1180+i*160,.19,-.55+i*.36)
for t in [6.80,6.90,7.00,7.10,7.66,8.32]:impact(t,.20)
for i in range(3):whoosh(9.14+i*.16,.22,.12,-.5+i*.5)
click(10.06,1450,.2,.5);impact(10.90,.30)
for i,freq in enumerate([659.25,830.61,987.77]):
    x=np.arange(int(.7*SR))/SR;s=np.sin(2*np.pi*freq*x)*np.exp(-x*6)*(1-np.exp(-x*100))
    add(s,10.96+i*.075,.07)
mix=np.tanh(mix)*.9
with wave.open(str(ep/'efeitos.wav'),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype('<i2').tobytes())
print(ep/'efeitos.wav')
