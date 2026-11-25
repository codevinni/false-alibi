import { SuspectGender, SuspectPersonality } from './suspect.types';

export interface VoiceProfile {
  gender: SuspectGender;
  personality: SuspectPersonality;
  age: number;
  id?: string;                      // Id do suspeito para garantir que ele mantenha a mesma voz única no caso
  pressure?: number;                // Perguntas já feitas, quanto maior, mais abalado o suspeito soa
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

  // Útil para interromper o áudio quando necessário
  stopListening: () => Promise<void>;

  // Solicita as permissões necessárias do android através dos pop ups nativos
  requestPermissions: () => Promise<boolean>;
}
