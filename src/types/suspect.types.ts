import { InterrogationHistory } from './interrogation.types';

export type SuspectGender = 'masculino' | 'feminino';

export type SuspectPersonality =
  | 'calmo'
  | 'nervoso'
  | 'arrogante'
  | 'sarcastico'
  | 'defensivo';

export interface SuspectContext {
  alibi: string;
  secret: string;
}

export interface Suspect {
  id: string;
  name: string;
  gender: SuspectGender;
  personality: SuspectPersonality;
  age: number;
  context: SuspectContext;
  isGuilty: boolean;
  interrogationHistory: InterrogationHistory;
  avatarId?: string;
}