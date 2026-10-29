#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
EP="${1:?Uso: bash fazer-motion-pro.sh episodios/002-motion-pro-picape [--montar]}"
BLENDER="${MOTION_BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
if [ "${2:-}" != "--montar" ]; then
  "$BLENDER" -b -t 8 --python motor-motion-pro/cena.py -- --ep "$EP" --scale 100 --samples 32 --render all --save yes > "$EP/render.log" 2>&1
fi
python3 - "$EP" <<'PY'
import sys, struct
from pathlib import Path
root=Path(sys.argv[1])/'quadros'
for frame in range(1,289):
    path=root/f'{frame:04d}.png'
    if not path.exists():raise SystemExit(f'Quadro ainda não renderizado: {path.name}')
    data=path.read_bytes()
    if len(data)<24 or struct.unpack('>II',data[16:24])!=(1920,1080) or data[-8:-4]!=b'IEND':
        raise SystemExit(f'Quadro incompleto ou fora de Full HD: {path.name}')
print('288 quadros Full HD verificados.')
PY
python3 motor-motion-pro/som.py "$EP"
python3 motor-motion-pro/graficos.py "$EP"
ffmpeg -hide_banner -loglevel warning -y -i "$EP/ativos/trilha-higgsfield.m4a" -i "$EP/efeitos.wav" \
  -filter_complex '[0:a]aresample=48000,atrim=duration=8,asetpts=PTS-STARTPTS,asplit=2[m0][m1];[m0][m1]acrossfade=d=0.02:c1=tri:c2=tri,atrim=duration=12,volume=0.48,afade=t=in:d=0.08,afade=t=out:st=11.65:d=0.35[m];[m][1:a]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9[a]' \
  -map '[a]' -t 12 -ar 48000 -c:a pcm_s24le "$EP/mix.wav"
FILTER="gblur=sigma=6:sigmaV=0.2:enable='between(t,2.72,2.98)+between(t,5.9,6.06)+between(t,8.78,9.03)+between(t,10.86,10.94)',vignette=angle=PI/8,noise=alls=1.2:allf=t+u,drawbox=x=0:y=0:w=iw:h=ih:color=0x15241D:t=18"
ffmpeg -hide_banner -loglevel warning -y -framerate 24 -start_number 1 -i "$EP/quadros/%04d.png" -i "$EP/mix.wav" \
  -loop 1 -i "$EP/grafico-montagem.png" -loop 1 -i "$EP/grafico-final.png" \
  -filter_complex "[0:v]$FILTER[base];[base][2:v]overlay=0:0:enable='between(t,6.10,8.4)'[legenda];[legenda][3:v]overlay=0:0:enable='gte(t,10.95)'[v]" \
  -map '[v]' -map 1:a -frames:v 288 -t 12 -r 24 -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 320k -movflags +faststart "$EP/motion-pro-picape-16x9-prova.mp4"
printf '%s\n' "Prova: $EP/motion-pro-picape-16x9-prova.mp4"
