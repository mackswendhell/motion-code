# Lucas 1–2 — produção isolada do episódio

## Restrição expressa do Macks (23/10/2026)

“não mude os motores da raiz dos estilos só crie a partir dos motores esse novo vídeo também. cuidado para não alterar o projeto”

- Toda criação e adaptação deste vídeo fica nesta pasta de episódio: cenas, página de render, scripts locais, configuração de vozes, trilha, arquivos de áudio e vídeo.
- Usar os motores existentes como base e reutilizar o núcleo por referência/importação, somente em leitura. Não duplicar o núcleo comum.
- Não editar `estilos/*/motor/`, `nucleo/`, os `fazer.sh` dos estilos, `nucleo/vozes.json`, outros episódios ou a documentação comum do projeto.
- Extensões para personagens, diálogos e música devem ser específicas deste episódio e executadas por entrada local, sem alterar o comportamento dos vídeos anteriores.
- Não regenerar o storyboard usando o script temporário da etapa inicial: ele antecede esta restrição e não contém os ajustes de isolamento.
- `base-compartilhada.sha256.json` registra o estado dos arquivos compartilhados após a restauração dos dois registros de documentação adicionados durante o storyboard. Comparar os hashes antes e depois da produção; essa linha de base não comprova estados anteriores à sua criação.

## Estado — filme completo finalizado

O Macks autorizou a continuação com “Pode fazer” após a entrega da amostra. Filme completo produzido e validado em 23/10/2026.

- **Vídeo:** `filme/lucas-1-2-16x9.mp4` — 19min42s, 1920×1080, 24 fps, H.264/AAC estéreo, 40 capítulos.
- **Conteúdo:** conto completo de Lucas 1–2, 40 pranchas, 132 versículos contemplados; falas bíblicas preservadas, narração adaptada, três cânticos completos e o coro de Lc 2,14. 63 tomadas principais e duas adicionais para o coro.
- **Faixas separadas:** `filme/audio/vozes.wav`, `musica.wav`, `ambiente.wav` e `mixagem.wav`, alinhadas no tempo.
- **Pranchas:** `filme/pranchas-do-filme.jpg`; quatro folhas com 120 quadros em `filme/revisao/`.
- **Validação final:** `filme/verificacao-final.json` — decodificação integral sem erros, 40 capítulos, −15,79 LUFS e pico real de −1,52 dBTP. Nenhuma janela de 50 ms com silêncio digital na mixagem WAV.
- **Preservação:** os 14 arquivos da linha de base compartilhada permanecem íntegros. Todas as novas cenas, configurações, vozes e entregas estão somente neste episódio.

A amostra anterior está preservada em `amostra/`. O filme completo já está entregue; não pedir autorização novamente para esta produção concluída. Se o Macks solicitar ajustes, trabalhar apenas aqui, preservando os motores e o núcleo.

## Reprodução local

`produzir.py vozes --completo` → `coro.py` → `produzir.py som --completo` → `node renderizar.mjs --completo` → `finalizar.py verificar`.

O render tem dez partes recuperáveis em `filme/partes/`, com hash de compatibilidade. Não editar cenas, página ou linha do tempo durante uma captura. Mudanças de voz podem gerar cobranças novas; cache intacto reutiliza tomadas existentes. Nunca executar o fazer.sh compartilhado para este episódio.
