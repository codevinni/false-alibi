import { SuspectGender, SuspectPersonality } from './suspect.types';

export interface VoiceProfile {
  gender: SuspectGender;
  personality: SuspectPersonality;
  age: number;
}

export interface IVoiceService {

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