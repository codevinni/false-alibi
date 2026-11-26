import { AudioSettings } from './audio.services.types';
import { CaseType, CrimeCase } from './case.types';

export type GameStatus = 'menu' | 'em_andamento' | 'vitoria' | 'derrota';

export interface AppSettings {
  soundSettings: AudioSettings;
  apiKeys: string[];
}

export interface Game {
  crimeCase?: CrimeCase;
  status?: GameStatus;
  settings: AppSettings;
  availableTokens?: number;
  spentTokens?: number;
  elapsedTime?: number;

  startNewCase: (preferredType?: CaseType) => Promise<void>;
  askSuspect: (suspectId: string, question: string) => Promise<string>;
  accuseSuspect: (suspectId: string) => Promise<boolean>;
  clearCase: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
}
