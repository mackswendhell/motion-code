# Motion Pro — montagem da picape

Status: primeira prova renderizada e verificada em 22/10/2026, aguardando avaliação. O texto abaixo registra a direção que orientou a produção. Foram reutilizados os ativos existentes da Higgsfield, sem novas gerações pagas.
Estilo: Higgsfield. Variação proposta: `motion-pro`. Formato: 16:9, 1920 × 1080, 24 fps, 12 segundos, como a referência. Primeiro teste sem locução, com efeitos sincronizados e trilha discreta originais.

## Conceito

A nossa picape Toyota nasce de uma bancada de peças. A câmera inspeciona os detalhes, passa pelo planejamento na tela, acompanha a montagem e termina em uma apresentação de três quartos. Materiais creme, metal cromado e borracha preta; ambiente bege quente, cartões marfim, acentos coral e verde-lima. A carroceria mantém as faixas e as proporções da referência do nosso carro.

## Caminhos avaliados

1. **Recomendado: GLB existente + peças complementares da Higgsfield + animação em código.** Preserva a identidade e permite controlar montagem, câmera, textos e encaixes. Exige preparar a malha única para a montagem.
2. **Sequência inteiramente generativa na Higgsfield.** Favorece transições fluidas e criação rápida, mas traz menor controle sobre geometria, texto, continuidade e correspondência exata dos componentes.
3. **Composição 2,5D com vistas recortadas.** Reaproveita o motor atual e favorece gráficos/interface, mas limita a passagem entre as rodas e os movimentos de câmera em torno da picape.

## Storyboard proposto

| Tempo | Ação | Câmera / grafismo |
|---|---|---|
| 0,0–2,6 s | Peças da picape organizadas na bancada: rodas, carroceria, chassi, santantônio e faróis. Inspeção em três alvos. | Vista superior, aproximações rápidas com parada curta; varredura verde e etiquetas “Rodas”, “Estrutura”, “Carroceria”. |
| 2,6–4,3 s | Movimento até notebook com imagem da nossa Toyota e mensagem curta “Preparando a montagem”. | Panorâmica com desfoque; foco se assenta na tela. |
| 4,3–6,0 s | Quatro cartões saem da tela: “Chassi”, “Suspensão”, “Carroceria”, “Acabamento”. | Recuo revela os cartões em profundidade; confirmação em cascata com selos e partículas. |
| 6,0–8,5 s | Montagem na bancada: estrutura, rodas, carroceria e acessórios. | Plano de três quartos; partes entram por trajetórias curtas e encaixam; sombras e pequena acomodação dão peso. |
| 8,5–9,1 s | Passagem baixa junto à roda dianteira. | O pneu encobre a lente e cria a transição; a altura da Toyota define se cabe passagem entre as rodas. |
| 9,1–10,8 s | Cartões mostram vistas lateral, frontal e três quartos da mesma picape. | Seleção da vista principal com círculo desenhado e realce verde-lima. |
| 10,8–12,0 s | Picape completa, em três quartos, sobre base de apresentação. | Varredura de luz revela o carro; giro curto e desaceleração, selo “Pronto”. |

## Ativos recuperados

- `ativos/picape-original.glb`: modelo gerado na Higgsfield em 16/10/2026; 62.757.072 bytes; uma malha/material; sem animações.
- `ativos/picape-referencia.png`: vista de três quartos já criada, usada para conferir pintura e detalhes.
- Histórico possui também vistas frontal, traseira e ambos os perfis; IDs/URLs em `fontes.json`.
- Análise e todos os frames da referência em `../../referencia/motion-pro/`.

## Preparação prevista

Inspecionar visualmente o GLB em Blender, verificar orientação, escala, textura e geometria. Preparar agrupamentos de carroceria, rodas e acessórios sem alterar o original; validar o contorno e os cromados contra as imagens já aprovadas. Produzir os componentes internos que não existem no modelo apenas para os planos de montagem. Gerar na Higgsfield ativos complementares que precisem de pintura/material, mantendo câmera e luz coerentes. Animar interface e textos em código, com grafia e duração exatas.

Manter a variação `prancha` e seu motor disponíveis. Registrar `motion-pro` como nova variação do estilo Higgsfield após aprovação desta direção. Oficina nesta pasta; entrega final em `prontos/higgsfield/002-motion-pro-picape/`.

## Verificação da primeira prova

Conferir identidade da Toyota em abertura, montagem e fechamento; nenhuma troca de cor ou escala dos pneus. Checar colisões, encaixes e peças duplicadas. Conferir cada transição quadro a quadro, legibilidade dos quatro cartões e foco nos alvos. Conferir duração, proporção e reprodução do MP4. Avaliar o som da prova separadamente: a análise da referência realizada nesta etapa foi visual.
