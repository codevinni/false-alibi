import { SuspectEmotion } from './emotion.types';

export type MessageType = 'pergunta' | 'resposta';

export interface Message {
  type: MessageType;
  content: string;
  emotion?: SuspectEmotion;
  intensity?: number;
}

export interface InterrogationHistory {
  messages: Message[];
}
