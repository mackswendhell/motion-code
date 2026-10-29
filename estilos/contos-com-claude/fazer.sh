#!/bin/zsh
# Episódio completo: voz -> sons -> render 3D -> pós -> entrega. Uso: ./fazer.sh episodios/<slug> [--teste]
set -e
cd "${0:A:h}"
EP="${1:?passe a pasta do episódio}"
python3 voz.py "$EP" "${@:2}"
python3 sons.py "$EP"

# mixagem aprovada no 004: falas + sons comprimidos em -14 LUFS (pico perto do 0),
# trilha contos ~20 dB abaixo, abaixando mais sob a voz, sumindo nos 2 s finais
A="$EP/audio"
T=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A/mix.wav")
ffmpeg -v error -y -i "$A/mix.wav" -i "$A/sons.wav" -i ../../nucleo/trilhas/contos.wav -filter_complex "\
[0:a]aresample=48000,aformat=channel_layouts=stereo[v];[1:a]aresample=48000,aformat=channel_layouts=stereo[s];\
[v][s]amix=inputs=2:normalize=0,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=7,aresample=48000,asplit[d1][d2];\
[2:a]atrim=0:$T,asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,volume=-10.5dB,afade=t=in:d=0.8,afade=t=out:st=$((T-2)):d=2[m];\
[m][d2]sidechaincompress=threshold=0.05:ratio=3:attack=20:release=400[md];\
[d1][md]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false[o]" -map "[o]" -t $T "$A/final.wav"
rm -rf "$EP/frames"
blender -b -P cena.py -- --ep "$EP" > "$EP/render.log" 2>&1
python3 pos.py "$EP"

# entrega: só o que importa, numa pasta numerada em prontos/<estilo>/
SLUG="${EP:t}"
ESTILO=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1])).get('estilo', 'contos-com-claude'))" "$EP/roteiro.json")
P="../../prontos/$ESTILO/$SLUG"
mkdir -p "$P"
cp "$EP/$SLUG.mp4" "$P/"
cp "$EP/audio/mix.wav" "$P/voz.wav"
cp "$EP/audio/sons.wav" "$P/sons.wav"
cp "$EP/audio/final.wav" "$P/audio-final.wav"
python3 storyboard.py "$EP" "$P/storyboard.md"
echo "pronto: $(pwd)/$P"
