# Roteiro: Ponytail 5, testei no meu projeto

## Abertura

Tem uma skill no Claude Code, com quase cento e setenta mil estrelas no GitHub, que promete fazer o Claude escrever metade do código, e gastar vinte e seis por cento menos. Eu refiz os testes dela, e os números se sustentam. Só que, quando fui olhar para onde o meu token estava indo de verdade, o código que o Claude escreve era a menor parte da conta.

Eu desenvolvo meus próprios sistemas com o Claude Code todos os dias. Um deles é o editor que monta as edições dos meus vídeos: eu gravo, converso com o Claude, e ele programa as animações por cima da gravação. Uso o Ponytail nesse projeto desde a versão quatro. Então, quando saiu a versão cinco, peguei os testes que o próprio autor publicou e rodei no meu editor, com três configurações lado a lado.

Nesse vídeo vou te mostrar o que o Ponytail 5 economiza de fato, em que tipo de pedido ele atrapalha e como o modo plano resolve essa diferença. E no fim vem a parte que mais mexeu com o meu jeito de trabalhar: o gasto que quase ninguém olha, e como conferir no seu próprio Claude Code se o seu dinheiro está indo embora no lugar errado.

## O que é o Ponytail

Quem usa o Claude para programar já viveu isso. Você pede uma coisa pequena e ele entrega um sistema. Pede um campo de data num formulário e ele constrói um calendário inteiro do zero, com trezentas e trinta e cinco linhas, quando o navegador já tem um seletor de data pronto. O nome disso é over-engineering: construir muito mais do que o problema pede.

O Ponytail ataca isso com uma escada de perguntas que o Claude passa antes de escrever qualquer linha. Isso precisa existir? Já existe nesse código? A biblioteca padrão da linguagem resolve? O navegador ou a plataforma já tem? Alguma dependência instalada resolve? Dá para ser uma linha só? Só depois de tudo isso ele escreve o mínimo que funciona. No caso do campo de data, a escada para no quarto degrau, e as trezentas e trinta e cinco linhas viram dez.

Na versão cinco, as regras caíram pela metade, para umas seiscentas palavras, e no fim de cada tarefa ele é obrigado a dizer o que pulou e o que acha arriscado. Inclusive, apareceu uma faixa no Claude Code, logo acima da caixa de mensagem, com o custo da tarefa, os tokens e quanto do código foi reaproveitado. É por ela que você acompanha a economia ao vivo.

Os números oficiais saíram do Opus 5.5, em trinta e nove tarefas: cinquenta e três por cento menos código, quarenta e um por cento mais rápido e vinte e seis por cento mais barato. Vale um ponto de atenção. A primeira versão desse teste dizia noventa e quatro por cento, o autor descobriu que a comparação estava inflada e corrigiu para baixo. Ainda tem vídeo circulando com o número antigo no título.

## Teste 1: o pedido específico

Então funciona assim o teste. A mesma tarefa, três configurações, três rodadas cada uma. A primeira é o Claude puro, sem nada instalado. A segunda é o Ponytail 5 ligado. A terceira é uma única linha no arquivo de instruções do projeto, o CLAUDE.md, dizendo: siga os princípios YAGNI e prefira soluções de uma linha. YAGNI é uma sigla em inglês para "você não vai precisar disso". Essa frase de sete palavras é a crítica mais comum ao Ponytail, a ideia de que ele inteiro cabe numa linha. O próprio repositório já usa essa frase como comparação nos testes oficiais.

A primeira tarefa é o equivalente do campo de data no meu editor. No meu projeto já existe uma função que calcula como encaixar a câmera dentro de um card sem cortar o rosto. Eu escrevi essa função depois de uma edição em que o card cortou a minha cabeça no meio. Então o pedido foi: crie um card de câmera no canto inferior direito para o estilo minimal, sem cortar o rosto. O pedido não fala da função. O teste é se o Claude descobre sozinho que ela já existe.

O resultado está aqui na tela. O Ponytail escreveu bem menos código que o Claude puro, reaproveitou a função que já estava lá e saiu mais barato. E a linha de sete palavras cortou ainda mais linhas que o Ponytail. Se a conversa parasse aqui, as sete palavras ganhariam.

E tem um detalhe que o número de linhas não mostra. Num teste maior, com vinte e quatro aplicações construídas do zero, a linha de sete palavras escreveu menos código que o Ponytail. Só que ela introduziu dois bugs que faziam o usuário perder dados, deixou teste em catorze das vinte e quatro, e avisou o que tinha pulado em metade das vezes. O Ponytail ficou com zero bugs de perda de dados, deixou teste nas vinte e quatro e avisou o que pulou em setenta e oito por cento. Ou seja, as seiscentas palavras a mais funcionam como guarda-corpo. Elas seguram o Claude quando ele corta demais.

E a qualidade se manteve. Numa prova com cento e quarenta e cinco entradas feitas para quebrar o código, o Claude puro acertou cem por cento e o Ponytail, noventa e nove e meio.

Pra quem chega no Claude com o pedido fechado, uma correção, um ticket, uma função que precisa existir, o Ponytail entrega o mesmo resultado com menos código e menos custo.

## Teste 2: o pedido aberto

Agora o pedido muda de natureza. Pedi para o Claude criar um estilo novo de abertura para os meus vídeos. Não falei de cor, de fonte nem de animação. É o tipo de pedido em que eu espero que o Claude preencha as lacunas, e o Opus 5.5 é muito bom nisso. Você dá um pedido mediano e ele pesquisa, decide boas práticas e entrega um monte de coisa que você nem pensou em pedir.

O Claude puro entregou uma abertura completa, com animação de entrada e variação de cor, coisas que eu nem tinha pedido. O Ponytail entregou um título que aparece na tela. Funciona, faz o que eu pedi, e mais nada.

O mesmo padrão aparece nos testes maiores. Numa página de preços com três planos, o Claude puro colocou menu, perguntas frequentes e tabela de comparação. O Ponytail entregou os três cards de preço e parou. Em sessenta páginas avaliadas, o Claude puro entregou oitenta e dois por cento dos extras, e o Ponytail, quarenta e um. E quando mandaram o Ponytail caprichar no fim, ele chegou a sessenta e três por cento e ficou mais caro que o Claude puro.

O que o Ponytail corta são os extras. A feature que você pediu ele entrega quase sempre. Mas, num pedido aberto, os extras são justamente o valor. E tem outro caso em que ele pesa contra: a correção pequena, cirúrgica, de uma linha. Ali ele carrega as regras inteiras para uma tarefa que o Claude já faria enxuta, e pode sair mais caro.

## Modo plano

Repara de onde veio a diferença entre os dois testes: do pedido. O Ponytail vai bem quando o pedido é específico e mal quando é aberto. E existe um recurso no próprio Claude Code que transforma um pedido aberto num pedido específico: o modo plano.

Funciona da seguinte forma. Você aperta Shift e Tab até aparecer "plan mode on" embaixo da caixa de mensagem. A partir daí o Claude lê os arquivos, investiga e te devolve um plano, sem mexer em nada até você aprovar.

No meu fluxo, ficou assim. Desliguei o Ponytail e fiz o mesmo pedido do estilo de abertura no modo plano. O Claude voltou com uma lista de tudo que ele colocaria na abertura. Eu cortei o que não queria, ajustei o resto e aprovei. Aí liguei o Ponytail de novo para a execução. Ele construiu exatamente o que estava no plano, sem inventar nada por fora.

A lógica é simples. Na hora de planejar, você quer o Claude livre, sugerindo. Na hora de executar, você quer o Claude contido, fazendo só o que foi combinado. O erro comum que isso evita é o Claude passar vinte minutos indo na direção errada, e você pagar o retrabalho. Se mesmo assim ele começar a desviar, aperta Esc na hora, e o comando /rewind volta a conversa para um ponto anterior.

Uma coisa que poucas pessoas sabem: entrar e sair do modo plano não apaga o cache da conversa. E para entender por que isso importa, a gente precisa falar do gasto que quase ninguém olha.

## O gasto que quase ninguém olha

O modelo não lembra nada de uma mensagem para a outra. Toda vez que você manda uma mensagem, o Claude Code reenvia a conversa inteira: as instruções, os arquivos que ele leu, cada resposta anterior. O que impede essa conta de explodir é o cache. Ele guarda a parte da conversa que não mudou, e o Claude relê essa parte com desconto. No Opus 5.5 e no Sonnet 5.5, reler do cache custa cinco por cento do preço normal.

Dá para ver isso no seu próprio Claude Code. Digita /usage, e na sessão atual aparece uma linha chamada Prompt cache. Na minha sessão do editor, quase tudo que entrou veio do cache. Ou seja, a maior parte do que eu gasto é o Claude relendo o contexto. Escrever código é a fatia pequena.

Agora coloca os dois lado a lado, com número. Uma conversa de duzentos mil tokens no Opus 5.5. Com o cache quente, a próxima mensagem relê esse histórico por uns quatro centavos de dólar. Se o cache esfriou, ele reescreve tudo, e a mesma mensagem custa um dólar e sessenta. Do outro lado, o Ponytail cortando quarenta e cinco por cento da resposta economiza uns dois centavos por mensagem. Um único almoço com o cache frio apaga a economia de umas noventa mensagens do Ponytail.

E o cache esfria por tempo. Na assinatura, ele dura uma hora. Só que, quando você estoura o limite do plano e passa a consumir créditos extras, o Claude Code derruba esse tempo para cinco minutos. Na chave de API, o padrão já é cinco minutos. Para manter uma hora nesses casos, existe a configuração promptCacheTtl, com o valor "1h" no arquivo de settings.

O cache também esfria por ação. Trocar de modelo no meio da conversa faz o Claude reler tudo do zero, porque cada modelo tem o próprio cache. E a mesma linha do /usage mostra a causa provável da última falha do cache. Você descobre o que derrubou o cache sem precisar adivinhar.

No dia a dia, ficaram dois hábitos: escolher o modelo no começo da sessão e não trocar no meio da tarefa, e olhar a linha do cache no /usage quando a cota parece estar indo rápido demais. Quando a tarefa acabou, o /clear zera o contexto e não custa nada.

## Quando usar o Ponytail

Na minha leitura, o Ponytail 5 é uma boa ferramenta, e os números dele são honestos. Ele vai bem na execução de um pedido que você já sabe descrever, e vai mal quando você espera que o Claude complete o que você não disse. Por isso eu não instalaria em todos os projetos de uma vez. Instala num projeto onde você trabalha com pedidos fechados, mede pela faixa e decide pelo seu número.

E se você só puder mudar uma coisa depois desse vídeo, abre o /usage na sua sessão agora e olha quanto da sua entrada veio do cache. Esse número diz mais sobre a sua conta do que qualquer skill que você instalar.

## Encerramento

Se esse vídeo te ajudou a entender para onde o seu token está indo, se alguma coisa aqui agregou pra você, deixa um like. Isso ajuda o YouTube a entender que o conteúdo é relevante e a entregar para mais pessoas. E se inscreve no canal. Aqui eu trago ferramentas e funcionalidades que você pode testar e aplicar direto no seu trabalho, para ser mais produtivo e mais intencional no uso de inteligência artificial.

Se você quer o mapa completo de tudo que derruba o cache, tem um vídeo aqui do lado em que eu passo por cada caso, com a conta de cada um. E aquela faixa do Ponytail acima da caixa de mensagem é uma mod do Claude Code. No outro vídeo eu mostro como criar as suas.

E nós iremos nos ver então no próximo vídeo.
