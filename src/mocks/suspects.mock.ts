import { Suspect } from '../types';

export const mockSuspects: Suspect[] = [
  {
    id: 'suspect-1',
    name: 'Arthur Vance',
    gender: 'masculino',
    personality: 'arrogante',
    age: 48,
    context: {
      alibi: 'Estava em meu escritório particular revisando contratos financeiros.',
      secret: 'Está à beira da falência e precisava desesperadamente do valor do seguro.',
    },
    isGuilty: false,
    avatarId: 'avatar_arthur',
    interrogationHistory: {
      messages: [
        {
          type: 'pergunta',
          content: 'Onde o senhor estava no momento em que o alarme disparou?',
        },
        {
          type: 'resposta',
          content:
            'No meu escritório, cuidando de negócios muito mais importantes do que essas fofocas.',
        },
        {
          type: 'pergunta',
          content: 'Alguém pode confirmar que o senhor não saiu de lá?',
        },
        {
          type: 'resposta',
          content:
            'Minha palavra deveria ser suficiente para qualquer um nesta casa.',
        },
      ],
    },
  },
  {
    id: 'suspect-2',
    name: 'Helena Rostova',
    gender: 'feminino',
    personality: 'nervoso',
    age: 34,
    context: {
      alibi: 'Afirma que estava na cozinha preparando uma xícara de chá.',
      secret: 'Foi vista discutindo asperamente com o proprietário antes do roubo.',
    },
    isGuilty: false,
    avatarId: 'avatar_helena',
    interrogationHistory: {
      messages: [
        {
          type: 'pergunta',
          content: 'Por que a senhora parecia tão agitada durante o jantar?',
        },
        {
          type: 'resposta',
          content:
            'Eu... eu apenas não estou acostumada com tempestades fortes, só isso!',
        },
      ],
    },
  },
  {
    id: 'suspect-3',
    name: 'Carlos Mendoza',
    gender: 'masculino',
    personality: 'defensivo',
    age: 41,
    context: {
      alibi: 'Diz que fazia a ronda externa do perímetro dos fundos.',
      secret: 'Desligou uma das câmeras do corredor meia hora antes do ocorrido.',
    },
    isGuilty: false,
    avatarId: 'avatar_carlos',
    interrogationHistory: {
      messages: [
        {
          type: 'pergunta',
          content: 'Por que o circuito fechado da ala leste falhou?',
        },
        {
          type: 'resposta',
          content:
            'O sistema é antigo, detetive! Eu já relatei essas falhas dez vezes à gerência.',
        },
      ],
    },
  },
  {
    id: 'suspect-4',
    name: 'Sofia Bianchi',
    gender: 'feminino',
    personality: 'sarcastico',
    age: 29,
    context: {
      alibi: 'Disse que estava na biblioteca lendo um livro raro.',
      secret: 'Possui histórico criminal por receptação de obras de arte no exterior.',
    },
    isGuilty: true,
    avatarId: 'avatar_sofia',
    interrogationHistory: {
      messages: [
        {
          type: 'pergunta',
          content:
            'Encontramos marcas de luva de veludo no cofre. A senhora usa luvas assim?',
        },
        {
          type: 'resposta',
          content:
            'Detetive, se elegância agora for crime, pode me algemar imediatamente.',
        },
        {
          type: 'pergunta',
          content: 'O que fazia na ala oeste se seu quarto fica na ala sul?',
        },
        {
          type: 'resposta',
          content:
            'Talvez eu estivesse apenas apreciando a decoração medíocre deste lugar.',
        },
      ],
    },
  },
  {
    id: 'suspect-5',
    name: 'Vicente Silva',
    gender: 'masculino',
    personality: 'calmo',
    age: 56,
    context: {
      alibi: 'Estava na adega organizando o estoque de vinhos para o evento.',
      secret: 'Presenciou alguém entrando na sala do cofre, mas ficou com medo de denunciar.',
    },
    isGuilty: false,
    avatarId: 'avatar_vicente',
    interrogationHistory: {
      messages: [
        {
          type: 'pergunta',
          content:
            'O senhor notou alguma movimentação estranha perto da sala principal?',
        },
        {
          type: 'resposta',
          content:
            'Apenas ouvi passos apressados no corredor logo após o trovão mais forte.',
        },
      ],
    },
  },
];

export const mockCulprit: Suspect = mockSuspects[3];

