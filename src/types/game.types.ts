import { CrimeCase } from './case.types';

export type GameStatus = 'menu' | 'em_andamento' | 'vitoria' | 'derrota';

export interface Game {
  crimeCase?: CrimeCase;
  elapsedTime?: number;
  status?: GameStatus;
  availableTokens?: number;
  spentTokens?: number;
}