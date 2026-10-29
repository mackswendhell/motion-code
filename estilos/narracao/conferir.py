"""Confere com o transcritor (faster-whisper) se cada termo difícil saiu certo e refaz a tomada de quem errar (até 3x).

Uso (de dentro de estilos/narracao): python3 conferir.py episodios/<slug>
Para um termo novo, acrescentar em TERMOS: (como está no roteiro, como o transcritor escreve quando sai certo).
"""

import glob
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

TERMOS = [(r"\b[Cc]ache\b", r"(?i)\bcach?e?s?h?\b|\bcash\b"), (r"\btokens?\b", r"(?i)\btokens?\b")]
EP = Path(sys.argv[1])
m = WhisperModel("medium", device="cpu", compute_type="int8")
pars = [" ".join(b.split()) for b in re.split(r"\n\s*\n", (EP / "roteiro.md").read_text())
        if b.strip() and not b.strip().startswith("#")]
for rodada in range(1, 4):
    subprocess.run(["python3", "narrar.py", str(EP)], check=True, capture_output=True)
    ruins = []
    for i, t in enumerate(pars, 1):
        pedidos = [(len(re.findall(r, t)), o) for r, o in TERMOS if re.search(r, t)]
        if not pedidos:
            continue
        f = sorted(glob.glob(str(EP / "faixas" / f"{i:02d}-*.wav")))[0]
        a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                                         capture_output=True).stdout, np.float32)
        ouvido = " ".join(s.text for s in m.transcribe(a, language="pt", beam_size=5)[0])
        if any(len(re.findall(o, ouvido)) < n for n, o in pedidos):
            ruins.append(i)
            print(f"rodada {rodada} | {i:02d}: refazer ({ouvido[:80]}...)", flush=True)
    if not ruins:
        print(f"tudo certo na rodada {rodada}")
        break
    for i in ruins:
        for w in glob.glob(str(EP / "audio" / f"{i:02d}_*.wav")):
            Path(w).unlink()
