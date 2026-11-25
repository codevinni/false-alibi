export type MessageType = 'pergunta' | 'resposta';

export interface Message {
  type: MessageType;
  content: string;
}

export interface InterrogationHistory {
  messages: Message[];
}