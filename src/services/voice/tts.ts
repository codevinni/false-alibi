/* Serviço de síntese de fala usando a biblioteca react-native-speech */

import Speech from '@mhpdev/react-native-speech';
import { VoiceProfile, VoiceSubject } from '../../types/voice.services.types';
import { InstalledVoice, VOICE_CATALOG } from './voiceConfig';
import { inferEmotionalState, planProsody, SentenceProsody } from './voiceEmotion';
import {
  buildCaseVoiceIdentities,
  buildVoiceIdentity,
  VoiceIdentity,
} from './voiceIdentity';

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
  volume: number;
  voice?: string;
}

// Identifica a fala em andamento
let currentRun = 0;

// Vozes reservadas para os suspeitos do caso atual (id do suspeito → identidade)
let caseIdentities = new Map<string, VoiceIdentity>();
let preparing: Promise<void> | null = null;

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

let cachedVoices: InstalledVoice[] | null = null;

/**
 * Vozes do catálogo instaladas no aparelho, na ordem do catálogo
 * Lista vazia significa usar a voz padrão do sistema
 */
async function getInstalledVoices(): Promise<InstalledVoice[]> {
  if (cachedVoices) {
    return cachedVoices;
  }

  let deviceVoices: { identifier: string }[];
  try {
    deviceVoices = await Speech.getAvailableVoices(LANGUAGE);
  } catch {
    // Sem cache: tenta de novo na próxima fala
    return [];
  }

  cachedVoices = VOICE_CATALOG.flatMap(entry => {
    const installed = deviceVoices.find(voice =>
      voice.identifier.includes(entry.key),
    );
    return installed ? [{ ...entry, identifier: installed.identifier }] : [];
  });
  return cachedVoices;
}

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

// Divide a frase nas vírgulas, para as hesitações de quem está abalado
function splitClauses(sentence: string): string[] {
  const clauses = sentence.match(/[^,]+,?/g) ?? [sentence];
  return clauses.map(clause => clause.trim()).filter(Boolean);
}

/**
 * Reserva uma voz distinta para cada suspeito do caso. Pode ser chamada de
 * novo a cada caso; falas pedidas enquanto ela roda esperam o resultado
 */
export function prepareVoices(suspects: VoiceSubject[]): Promise<void> {
  const task = getInstalledVoices().then(voices => {
    caseIdentities = buildCaseVoiceIdentities(suspects, voices);
  });
  preparing = task;
  return task.finally(() => {
    if (preparing === task) {
      preparing = null;
    }
  });
}

// Voz do suspeito: a reservada no caso ou, se não houver, uma calculada pelo perfil
async function resolveIdentity(profile: VoiceProfile): Promise<VoiceIdentity> {
  if (preparing) {
    await preparing.catch(() => undefined);
  }
  const reserved = profile.id ? caseIdentities.get(profile.id) : undefined;
  if (reserved) {
    return reserved;
  }
  const id =
    profile.id ?? `${profile.gender}|${profile.personality}|${profile.age}`;
  return buildVoiceIdentity({ ...profile, id }, await getInstalledVoices());
}

/**
 * Fala uma frase e só resolve quando ela termina ou é interrompida
 */
function speakSentence(content: string, options: SentenceOptions): Promise<void> {
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
 * Fala uma frase com a prosódia planejada. Se a emoção pede hesitação,
 * divide nas vírgulas com uma pequena pausa entre os trechos
 * Retorna false se a fala foi interrompida no meio
 */
async function speakWithProsody(
  sentence: string,
  prosody: SentenceProsody,
  voice: string | undefined,
  run: number,
): Promise<boolean> {
  const options: SentenceOptions = {
    pitch: prosody.pitch,
    rate: prosody.rate,
    volume: prosody.volume,
    voice,
  };
  const parts =
    prosody.commaPauseMs > 0 ? splitClauses(sentence) : [sentence];

  for (let i = 0; i < parts.length; i++) {
    if (run !== currentRun) {
      return false;
    }
    await speakSentence(parts[i], options);
    if (i < parts.length - 1) {
      await sleep(prosody.commaPauseMs);
    }
  }
  return run === currentRun;
}

/**
 * Fala o texto com a voz única do suspeito, modulada pelo estado emocional
 * Apenas resolve quando a fala termina ou é interrompida
 */
export async function speak(text: string, profile: VoiceProfile): Promise<void> {
  const cleaned = cleanText(text);
  const sentences = splitSentences(cleaned);
  if (sentences.length === 0) {
    return;
  }

  // Marca esta fala como a atual, qualquer fala anterior para sozinha
  const run = ++currentRun;
  await Speech.stop();

  const identity = await resolveIdentity(profile);
  // Emoção inferida do texto e da pressão do interrogatório
  const state = inferEmotionalState(
    cleaned,
    profile.personality,
    profile.pressure,
  );
  const plan = planProsody(
    identity,
    profile.personality,
    state,
    sentences.length,
    `${profile.id ?? ''}|${cleaned}`,
  );

  for (let i = 0; i < sentences.length; i++) {
    const finished = await speakWithProsody(
      sentences[i],
      plan[i],
      identity.voice,
      run,
    );
    if (!finished) {
      return;
    }
    // Pausa entre frases, mas não depois da última
    if (i < sentences.length - 1) {
      await sleep(plan[i].pauseAfterMs);
    }
  }
}

export async function stopSpeaking(): Promise<void> {
  currentRun++;
  await Speech.stop();
}
