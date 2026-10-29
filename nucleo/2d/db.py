# Volume de uma faixa com o ajuste do painel Motion: base + o deslocamento em dB salvo em tweaks.json (0 sem ajuste).
# Uso: python3 ../../nucleo/2d/db.py episodios/<slug> trilha -5   -> imprime o volume em dB para o ffmpeg
import json, os, sys
ep, chave, base = sys.argv[1], sys.argv[2], float(sys.argv[3])
p = os.path.join(ep, "tweaks.json")
print(round(base + (json.load(open(p)).get(chave, 0) if os.path.exists(p) else 0), 2))
