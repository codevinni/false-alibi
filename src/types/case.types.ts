import { Suspect } from './suspect.types';

export type CaseType =
  | 'assassinato'
  | 'roubo_banco'
  | 'sequestro'
  | 'furto_arte';

export interface CrimeCase {
  title: string;
  description: string;
  type: CaseType;
  suspects: Suspect[];
  culprit: Suspect;
  summarySolution: string;
  sceneImageId?: string;
}