# Motion Pro — picape Toyota

Primeira prova de 12 segundos, 16:9, 1920 × 1080, 24 fps. Sem locução.

## Arquivos

- `motion-pro-picape-16x9-prova.mp4`: vídeo de revisão renderizado e verificado em 22/10/2026.
- `motion-pro.blend`: cena de trabalho salva no plano final; a reprodução determinística da animação vem de `../../motor-motion-pro/cena.py`.
- `roteiro.json`: especificação de cenas e tempos.
- `mix.wav`: trilha e efeitos em estéreo; `efeitos.wav`: efeitos separados.
- `ativos/`: modelo GLB e imagens da picape já criados na Higgsfield, mais a trilha recuperada.
- `fontes.json`: rastreabilidade dos ativos visuais remotos.
- `quadros/`: frames renderizados. Arquivos grandes de trabalho; não são a entrega.
- `proposta.md`: storyboard que orientou a prova.
- `storyboard-prova.jpg`: amostragem visual do MP4 final, dois quadros por segundo.
- `verificacao.md`: resultados da validação técnica.

## Reproduzir

Na pasta `estilos/higgsfield/`:

```sh
bash fazer-motion-pro.sh episodios/002-motion-pro-picape
```

Só montar o MP4 a partir dos 288 PNGs:

```sh
bash fazer-motion-pro.sh episodios/002-motion-pro-picape --montar
```

O GLB de origem é uma malha única reconstruída de imagem, com textura. A separação por regiões cria componentes visuais para o motion. O chassi exposto é geometria auxiliar de demonstração. As texturas e as irregularidades do modelo original permanecem no produto completo.

A cena `.blend` abre no quadro final; não contém keyframes de edição manual. Para repetir ou alterar movimento, editar o motor e renderizar. Blender 5.2, Python com NumPy e FFmpeg são os requisitos usados nesta prova.

Trilha original existente: Higgsfield / Sonilo, geração `8fcbe266-71a4-41be-bd56-c280c302f4d7`, recuperada em 22/10/2026. Não houve novas gerações pagas nesta prova.
