import { CrimeCase } from '../types';
import { mockCulprit, mockSuspects } from './suspects.mock';

export const mockCrimeCase: CrimeCase = {
  title: 'O Roubo do Colar da Condessa',
  description:
    'Durante uma tempestuosa noite na mansão Vance, as luzes se apagaram repentinamente. Quando o gerador de emergência foi religado minutos depois, o cofre da galeria estava aberto e o inestimável Colar da Condessa havia desaparecido. Cinco pessoas estavam no local e todas têm algo a esconder.',
  type: 'furto_arte',
  suspects: mockSuspects,
  culprit: mockCulprit,
  summarySolution:
    'Sofia Bianchi aproveitou-se da queda de energia para acessar o cofre utilizando uma gazua fina. Suas luvas de veludo deixaram fibras microscópicas na fechadura e seu suposto álibi na biblioteca ruiu após o depoimento de Vicente Silva.',
  sceneImageId: 'scene_mansion_gallery',
};

