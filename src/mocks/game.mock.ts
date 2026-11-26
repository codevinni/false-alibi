import { DEFAULT_AUDIO_SETTINGS } from '../services/audio/audio.config';
import { AppSettings, Game } from '../types';
import { mockCrimeCase } from './case.mock';

const mockSettings: AppSettings = {
  soundSettings: DEFAULT_AUDIO_SETTINGS,
  apiKeys: [],
};

const mockGameActions: Pick<
  Game,
  'startNewCase' | 'askSuspect' | 'accuseSuspect' | 'clearCase' | 'updateSettings'
> = {
  startNewCase: async () => {},
  askSuspect: async () => '',
  accuseSuspect: async () => false,
  clearCase: async () => {},
  updateSettings: async () => {},
};

export const mockGameInProgress: Game = {
  crimeCase: mockCrimeCase,
  elapsedTime: 185,
  status: 'em_andamento',
  settings: mockSettings,
  availableTokens: 3,
  spentTokens: 2,
  ...mockGameActions,
};

export const mockGameVictory: Game = {
  crimeCase: mockCrimeCase,
  elapsedTime: 340,
  status: 'vitoria',
  settings: mockSettings,
  availableTokens: 1,
  spentTokens: 4,
  ...mockGameActions,
};

export const mockGameDefeat: Game = {
  crimeCase: mockCrimeCase,
  elapsedTime: 420,
  status: 'derrota',
  settings: mockSettings,
  availableTokens: 0,
  spentTokens: 5,
  ...mockGameActions,
};

export const mockGameMenu: Game = {
  status: 'menu',
  settings: mockSettings,
  availableTokens: 5,
  spentTokens: 0,
  ...mockGameActions,
};

export const mockGame: Game = mockGameInProgress;
