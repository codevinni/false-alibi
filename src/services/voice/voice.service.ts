/* Junta TTS e STT na interface IVoiceService definida em types */

import { IVoiceService } from '../../types/voice.services.types';
import { prepareVoices, speak, stopSpeaking } from './tts';
import { listen, requestPermissions, stopListening } from './stt';

export const voiceService: IVoiceService = {
  prepareVoices,
  speak,
  stopSpeaking,
  listen,
  stopListening,
  requestPermissions,
};
