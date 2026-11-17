import { Game } from '../types';
import { mockCrimeCase } from './case.mock';

export const mockGameInProgress: Game = {
  crimeCase: mockCrimeCase,
  elapsedTime: 185,
  status: 'em_andamento',
  availableTokens: 3,
  spentTokens: 2,
};

export const mockGameVictory: Game = {
  crimeCase: mockCrimeCase,
  elapsedTime: 340,
  status: 'vitoria',
  availableTokens: 1,
  spentTokens: 4,
};

export const mockGameDefeat: Game = {
  crimeCase: mockCrimeCase,
  elapsedTime: 420,
  status: 'derrota',
  availableTokens: 0,
  spentTokens: 5,
};

export const mockGameMenu: Game = {
  status: 'menu',
  availableTokens: 5,
  spentTokens: 0,
};

export const mockGame: Game = mockGameInProgress;

