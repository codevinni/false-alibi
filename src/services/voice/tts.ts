/* Serviço de síntese de fala usando a biblioteca react-native-speech */

import Speech from '@mhpdev/react-native-speech';
import { VoiceProfile } from '../../types/voice.services.types';
import { getPauseMs, getVoiceParams } from './voiceProfile';
import { pickVoice } from './voiceCatalog';

const LANGUAGE = 'pt-BR';

// Tempo máximo de espera pelo fim de cada frase, segurança contra travamento
const BASE_TIMEOUT_MS = 10000;
const TIMEOUT_PER_CHAR_MS = 120;

// Formato do evento emitido pela biblioteca de TTS
interface SpeechEvent {
  id: string;
}

interface SentenceOptions {
  pitch: number;
  rate: number;
  voice?: string;
}

// Identifica a fala em andamento
let currentRun = 0;

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// Remove marcações que a voz leria em voz alta 
function cleanText(text: string): string {
  return text
    .replace(/\*[^*]*\*/g, ' ')
    .replace(/[*_#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Divide o texto em frases para poder fazer pausas entre elas
function splitSentences(text: string): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]*/g) ?? [text];
  return sentences.map(sentence => sentence.trim()).filter(Boolean);
}

/**
 * Fala uma frase e só resolve quando ela termina ou é interrompida
 */
function speakSentence(
  content: string,
  options: SentenceOptions,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let currentId: string | null = null;
    // id da fala -> true se terminou com erro
    const ended = new Map<string, boolean>();

    const subscriptions = [
      Speech.onFinish(({ id }: SpeechEvent) => handleEnd(id, false)),
      Speech.onStopped(({ id }: SpeechEvent) => handleEnd(id, false)),
      Speech.onError(({ id }: SpeechEvent) => handleEnd(id, true)),
    ];

    const timer = setTimeout(
      () => done(),
      BASE_TIMEOUT_MS + content.length * TIMEOUT_PER_CHAR_MS,
    );

    function done(error?: Error) {
      clearTimeout(timer);
      subscriptions.forEach(subscription => subscription.remove());
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }

    // Apenas encerra quando o evento é da fala atual
    function check() {
      if (currentId === null || !ended.has(currentId)) {
        return;
      }
      done(
        ended.get(currentId)
          ? new Error('Falha ao sintetizar a voz')
          : undefined,
      );
    }

    // Guarda o evento mesmo que chegue antes de identificar o id da fala
    function handleEnd(id: string, failed: boolean) {
      ended.set(id, failed);
      check();
    }

    Speech.speak(content, { language: LANGUAGE, ...options })
      .then(id => {
        currentId = id;
        check();
      })
      .catch(error => {
        done(error instanceof Error ? error : new Error(String(error)));
      });
  });
}

/**
 * Fala o texto com a voz, o tom, a velocidade e o ritmo do suspeito
 * Apenas resolve quando a fala termina ou é interrompida
 */
export async function speak(
  text: string,
  profile: VoiceProfile,
): Promise<void> {
  const sentences = splitSentences(cleanText(text));
  if (sentences.length === 0) {
    return;
  }

  // Marca esta fala como a atual, qualquer fala anterior para sozinha
  const run = ++currentRun;
  await Speech.stop();

  const voice = await pickVoice(profile);
  const { pitch, rate } = getVoiceParams(profile, voice);
  const pause = getPauseMs(profile.personality);

  for (let i = 0; i < sentences.length; i++) {
    if (run !== currentRun) {
      return;
    }
    await speakSentence(sentences[i], {
      pitch,
      rate,
      voice: voice?.identifier,
    });
    // Pausa entre frases, mas não depois da última
    if (i < sentences.length - 1) {
      await sleep(pause);
    }
  }
}

export async function stopSpeaking(): Promise<void> {
  currentRun++;
  await Speech.stop();
}