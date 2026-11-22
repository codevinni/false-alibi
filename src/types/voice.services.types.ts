import { EmotionalState } from './emotion.types';
import { SuspectGender, SuspectPersonality } from './suspect.types';

export interface VoiceProfile {
  gender: SuspectGender;
  personality: SuspectPersonality;
  age: number;
  // Id do suspeito para garantir que ele mantenha a mesma voz única no caso
  id?: string;
  // Estado emocional da fala atual. Sem ele, a emoção é inferida do texto
  emotionalState?: EmotionalState;
}

// Dados mínimos de um suspeito para reservar a voz dele no caso
export type VoiceSubject = Pick<
  VoiceProfile,
  'gender' | 'personality' | 'age'
> & { id: string };

export interface IVoiceService {

  // Reserva uma voz distinta para cada suspeito do caso 
  prepareVoices: (suspects: VoiceSubject[]) => Promise<void>;

  // Resposta da IA
  speak: (text: string, profile: VoiceProfile) => Promise<void>;
  stopSpeaking: () => Promise<void>;

  // Reconhecimento de voz
  listen: () => Promise<string>;
  // listen já deve parar de escutar sozinho, mas este método será útil para interromper quando necessário
  stopListening: () => Promise<void>;

  // Solicitar as permissões necessárias do android através dos pop ups nativos
  requestPermissions: () => Promise<boolean>;
}
