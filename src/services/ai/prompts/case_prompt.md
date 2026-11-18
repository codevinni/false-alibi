# Gerar Caso Criminal

## Objetivo
Você deve gerar um caso de investigação criminal completo, denso e rico em detalhes para um jogo de detetive, retornando-o no formato JSON. O caso deve conter exatamente 5 suspeitos. Destes 5 suspeitos, exatamente 1 deve ser o culpado (definido por isGuilty: true) e os outros 4 devem ser inocentes (isGuilty: false). A história deve ser fechada em um mesmo local e janela de tempo, onde todos os suspeitos possuem álibis detalhados e segredos pessoais, de modo que suas histórias se cruzem e permitam ao jogador deduzir logicamente quem é o verdadeiro culpado através das contradições nos depoimentos.

> OBS: Os textos dentro do JSON de exemplo abaixo estão resumidos APENAS para demonstrar a estrutura das chaves. Na sua resposta real, NÃO imite a brevidade do exemplo.

## Formato de saida
A resposta deve ser estritamente um JSON válido, começando com { e terminando com }, sem blocos de código markdown (não use ```json), sem texto antes ou depois e sem explicações.

Exemplo de formato esperado:
{
  "title": "O Roubo do Colar da Condessa",
  "description": "Durante uma tempestuosa noite na mansão Vance, as luzes se apagaram às 22h00. Quando o gerador de emergência foi religado às 22h15, o cofre da galeria estava aberto e o inestimável Colar da Condessa havia desaparecido. Cinco pessoas estavam na mansão: Arthur Vance, Helena Rostova, Carlos Mendoza, Sofia Bianchi e Vicente Silva.",
  "type": "furto_arte",
  "suspects": [
    {
      "id": "suspect-1",
      "name": "Arthur Vance",
      "gender": "masculino",
      "personality": "arrogante",
      "age": 48,
      "context": {
        "alibi": "Estava em meu escritório particular das 21h50 às 22h20 revisando contratos financeiros no escuro com a lanterna do celular.",
        "secret": "Está à beira da falência e planejava fraudar o seguro no mês que vem, mas não roubou o colar. Ouviu passos apressados de salto alto saindo da galeria às 22h10."
      },
      "isGuilty": false
    },
    {
      "id": "suspect-2",
      "name": "Helena Rostova",
      "gender": "feminino",
      "personality": "nervoso",
      "age": 34,
      "context": {
        "alibi": "Estava na biblioteca do 2º andar entre 21h45 e 22h15 procurando documentos antigos e confirma que estava completamente sozinha lá.",
        "secret": "Discutiu asperamente com Arthur Vance antes do jantar por causa de uma dívida, mas sabe que Sofia Bianchi mente se disser que estava na biblioteca às 22h00, pois Helena esteve lá o tempo todo e Sofia não apareceu."
      },
      "isGuilty": false
    },
    {
      "id": "suspect-3",
      "name": "Carlos Mendoza",
      "gender": "masculino",
      "personality": "defensivo",
      "age": 41,
      "context": {
        "alibi": "Fazia a ronda interna no corredor da cozinha e da adega entre 21h55 e 22h15, tendo visto Vicente Silva trabalhando na adega.",
        "secret": "Desligou a câmera do corredor lateral às 21h30 para fumar escondido durante o expediente, o que o deixa com medo de ser demitido e acusado injustamente."
      },
      "isGuilty": false
    },
    {
      "id": "suspect-4",
      "name": "Sofia Bianchi",
      "gender": "feminino",
      "personality": "sarcastico",
      "age": 29,
      "context": {
        "alibi": "Mente dizendo que estava sozinha na biblioteca lendo um livro raro durante todo o apagão, das 21h50 às 22h15.",
        "secret": "É a verdadeira culpada. Possui histórico de receptação de arte, aproveitou o apagão às 22h00 para abrir o cofre da galeria com uma gazua e escondeu o colar no bolso do casaco. Não sabe que Helena Rostova estava na biblioteca nem que Vicente Silva a viu perto da galeria."
      },
      "isGuilty": true
    },
    {
      "id": "suspect-5",
      "name": "Vicente Silva",
      "gender": "masculino",
      "personality": "calmo",
      "age": 56,
      "context": {
        "alibi": "Estava na adega organizando o estoque de vinhos das 21h50 às 22h15 e foi visto por Carlos Mendoza.",
        "secret": "Subiu rapidamente até a porta da adega às 22h05 para buscar uma lanterna e viu Sofia Bianchi saindo furtivamente do corredor da galeria do cofre, mas tem medo de falar abertamente porque já roubou uma garrafa de vinho caro no passado."
      },
      "isGuilty": false
    }
  ],
  "summarySolution": "Sofia Bianchi aproveitou o apagão das 22h00 para abrir o cofre da galeria. Seu falso álibi de que estava na biblioteca é desmentido por Helena Rostova (que esteve na biblioteca o tempo todo e não a viu) e por Vicente Silva (que viu Sofia saindo do corredor da galeria às 22h05)."
}

## Regras
1. O tema do crime e o valor exato do campo "type" no JSON devem seguir estritamente o tipo de caso definido ao final deste prompt (na seção "Parametros").
2. Personalidades permitidas para os suspeitos: 'calmo', 'nervoso', 'arrogante', 'sarcastico' ou 'defensivo'.
3. Gênero permitido: 'masculino' ou 'feminino'.
4. Exatamente 5 suspeitos na lista "suspects", onde exatamente 1 tem "isGuilty": true e os outros 4 têm "isGuilty": false.
5. O campo "description" do caso deve mencionar o horário do crime e citar os nomes dos 5 suspeitos presentes no local.
6. Em cada suspeito, "alibi" deve conter a versão que ele conta ao detetive (com local e horário específicos; para o culpado, deve ser um álibi falso). O campo "secret" deve conter tanto o segredo pessoal que o torna suspeito quanto o que ele viu ou sabe sobre outros suspeitos citando os NOMES exatos deles.
7. A história deve ser fechada e solucionável: os álibis dos inocentes devem se confirmar mutuamente, enquanto o álibi do culpado deve entrar em contradição direta com o que pelo menos 1 ou 2 inocentes presenciaram.
8. "summarySolution" deve explicar de forma objetiva como o crime aconteceu e qual contradição entre os depoimentos revela o culpado.

## Parametros
Atenção: as informações abaixo são parâmetros dinâmicos que serão preenchidos pela aplicação em tempo de execução. Utilize estes dados para gerar o caso:

- Tipo do caso solicitado: 