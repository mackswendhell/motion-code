"""Pinta as peças do episódio na Higgsfield, a partir da lista "ativos" do roteiro.json.

Uso (de dentro de estilos/higgsfield): python3 ativos.py episodios/<slug> [nome ...]
Cada peça: {"prompt", "refs": [outras peças ou arquivos em ativos/], "proporcao", "res", "transparente"}.
O "estilo_prompt" do roteiro vai no fim de todo prompt. Peça que já existe em ativos/<nome>.png não é gerada
de novo (cache: para refazer, apagar o png). Peças sem dependência pendente saem em paralelo.
Grava ativos/<nome>.png e ativos/<nome>.resposta.json (prompt, parâmetros e URL da Higgsfield).
"""

import json
import subprocess
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

pasta = Path(sys.argv[1])
r = json.loads((pasta / "roteiro.json").read_text())
A = pasta / "ativos"
pedidos = {k: v for k, v in r["ativos"].items() if len(sys.argv) < 3 or k in sys.argv[2:]}


def arquivo(ref):
    return A / (ref if "." in ref else f"{ref}.png")


def pintar(nome):
    p = pedidos[nome]
    cmd = ["higgsfield", "generate", "create", "gpt_image_2_5", "--prompt", f"{p['prompt']} {r['estilo_prompt']}",
           "--aspect_ratio", p.get("proporcao", "16:9"), "--resolution", p.get("res", "2k"), "--quality", "high", "--wait", "--json"]
    for ref in p.get("refs", []):
        cmd += ["--image", str(arquivo(ref))]
    if p.get("transparente"):
        cmd += ["--background", "transparent"]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=1800)
    if res.returncode:
        return f"{nome}: ERRO {res.stderr.strip()[-300:]}"
    (A / f"{nome}.resposta.json").write_text(res.stdout)
    urllib.request.urlretrieve(json.loads(res.stdout)[0]["result_url"], A / f"{nome}.png")
    return f"{nome}: ok"


falta = [n for n in pedidos if not arquivo(n).exists()]
while falta:
    prontos = [n for n in falta if all(arquivo(ref).exists() for ref in pedidos[n].get("refs", []))]
    if not prontos:
        sys.exit(f"dependência que não existe nem está na lista: {falta}")
    with ThreadPoolExecutor(6) as ex:
        for linha in ex.map(pintar, prontos):
            print(linha, flush=True)
    if any(not arquivo(n).exists() for n in prontos):
        sys.exit("parou: alguma peça falhou")
    falta = [n for n in falta if n not in prontos]
print("ok: todas as peças em", A)
