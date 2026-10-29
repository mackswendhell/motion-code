"""Tabela do storyboard de um episódio, com os tempos reais (ou estimados, antes da voz).

Uso: python3 storyboard.py episodios/<slug> [saida.md]
"""

import sys

from roteiro import carregar


def tabela(ep):
    d = ep.dados
    linhas = [f"# {d.get('titulo', ep.slug)}", "",
              f"Estilo: {d.get('estilo', '')} · formato {d.get('formato', '9:16')} · modo do Claude: {d.get('modo_claude', '')} · {ep.total:.1f} s",
              f"Dor: {d.get('dor', '')}", "",
              "| Tempo | Quem | Fala | Plano | Ação | Voz | Balão / sons |", "|---|---|---|---|---|---|---|"]
    for f in ep.falas:
        c = ep.falas_cfg[f["i"]]
        planos = [p for p in ep.planos if p["a"] < f["t1"] and p["b"] > f["t0"] - 0.3]
        plano = " → ".join(p["plano"] + (f" ({p['movimento']})" if p["movimento"] != "suave" else "")
                           + (f" [luz {p['luz']}]" if p["luz"] else "") for p in planos)
        acoes = ", ".join(sorted({f"{k}: {v}" for p in planos for k, v in p["acoes"].items()}))
        extra = []
        if c.get("balao"):
            extra.append(f"balão: “{c['balao']['texto']}”")
        extra += [s["som"] for s in c.get("sons", [])]
        linhas.append(f"| {f['t0']:.1f} s | {f['quem']} | {f['texto']} | {plano} | {acoes} | {c.get('direcao', '')} | {' · '.join(extra)} |")
    return "\n".join(linhas) + "\n"


if __name__ == "__main__":
    texto = tabela(carregar(sys.argv[1]))
    if len(sys.argv) > 2:
        open(sys.argv[2], "w", encoding="utf-8").write(texto)
    else:
        print(texto)
