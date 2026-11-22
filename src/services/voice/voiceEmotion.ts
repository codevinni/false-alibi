/*
 * Modulação emocional da voz do suspeito
 * Considera o gênero, idade, personalidade, estado emocional e pausas
 */

import {
  EmotionalState,
  SUSPECT_EMOTIONS,
  SuspectEmotion,
} from '../../types/emotion.types';
import { Message } from '../../types/interrogation.types';
import { SuspectPersonality } from '../../types/suspect.types';
import { signedNoise } from './hash';
import type { VoiceIdentity } from './voiceIdentity';
import { clamp, clampPitch, clampRate, clampVolume } from './voiceProfile';

// Como o tom/velocidade evolui da primeira para a última frase
type Contour = 'flat' | 'falling' | 'rising' | 'accelerating' | 'burst';

interface EmotionModulation {
  pitch: number;        // Soma ao tom com intensidade máxima
  rate: number;         // Soma à velocidade com intensidade máxima
  volume: number;       // Fração somada ao volume (0.1 = +10%)
  pause: number;        // Fração somada à pausa entre frases (-0.5 = metade)
  jitter: number;       // Variação máxima de tom/velocidade entre frases
  contour: Contour;
  commaPauseMs: number; // Hesitação nas vírgulas (0 = fala a frase inteira)
}

const EMOTION_MODULATION: Record<SuspectEmotion, EmotionModulation> = {
  calmo:     { pitch: -0.04, rate: -0.08, volume: -0.05, pause:  0.3, jitter: 0,    contour: 'falling',      commaPauseMs: 0 },
  confiante: { pitch: -0.06, rate: -0.04, volume:  0.05, pause:  0.2, jitter: 0,    contour: 'falling',      commaPauseMs: 0 },
  defensivo: { pitch:  0.05, rate:  0.07, volume:  0.05, pause: -0.3, jitter: 0.01, contour: 'flat',         commaPauseMs: 0 },
  nervoso:   { pitch:  0.10, rate:  0.12, volume: -0.10, pause: -0.5, jitter: 0.04, contour: 'accelerating', commaPauseMs: 140 },
  assustado: { pitch:  0.14, rate: -0.02, volume: -0.25, pause:  0.2, jitter: 0.05, contour: 'rising',       commaPauseMs: 220 },
  irritado:  { pitch:  0.06, rate:  0.14, volume:  0.12, pause: -0.4, jitter: 0.02, contour: 'burst',        commaPauseMs: 0 },
};

// Quanto cada temperamento deixa a emoção transparecer na voz
const PERSONALITY_REACTIVITY: Record<SuspectPersonality, number> = {
  calmo: 0.6,
  nervoso: 1.3,
  arrogante: 0.8,
  sarcastico: 0.9,
  defensivo: 1.1,
};

// Emoção de quando nada na fala indica outra
const BASELINE_EMOTION: Record<SuspectPersonality, EmotionalState> = {
  calmo: { emotion: 'calmo', intensity: 0.4 },
  nervoso: { emotion: 'nervoso', intensity: 0.4 },
  arrogante: { emotion: 'confiante', intensity: 0.5 },
  sarcastico: { emotion: 'confiante', intensity: 0.3 },
  defensivo: { emotion: 'defensivo', intensity: 0.4 },
};

// Hesitação mais curta que isso não é percebida e só deixa a fala truncada
const MIN_COMMA_PAUSE_MS = 60;
const DEFAULT_INTENSITY = 0.5;
// Quantas perguntas até a pressão do interrogatório chegar ao máximo
const MAX_PRESSURE = 6;

export interface SentenceProsody {
  pitch: number;
  rate: number;
  volume: number;
  pauseAfterMs: number;
  commaPauseMs: number;
}

// Remove acentos e passa para minúsculas, para comparar palavras
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// Radicais aceitos, inclusive no feminino ("nervosa", "irritada")
const EMOTION_STEMS: Record<SuspectEmotion, string> = {
  calmo: 'calm',
  confiante: 'confiant',
  defensivo: 'defensiv',
  nervoso: 'nervos',
  assustado: 'assustad',
  irritado: 'irritad',
};

function parseEmotion(value: unknown): SuspectEmotion | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const word = normalize(value.trim());
  return SUSPECT_EMOTIONS.find(emotion =>
    word.startsWith(EMOTION_STEMS[emotion]),
  );
}

/**
 * Valida a emoção vinda da IA. Aceita variações ("Nervosa", intensidade como texto) 
 * Devolve undefined se não for uma emoção conhecida
 */
export function normalizeEmotionalState(raw: {
  emotion?: unknown;
  intensity?: unknown;
}): EmotionalState | undefined {
  const emotion = parseEmotion(raw.emotion);
  if (!emotion) {
    return undefined;
  }
  const intensity = Number(raw.intensity);
  return {
    emotion,
    intensity: Number.isFinite(intensity)
      ? clamp(intensity, 0, 1)
      : DEFAULT_INTENSITY,
  };
}

// Pistas no texto da resposta que indicam cada emoção
const TEXT_CUES: { emotion: SuspectEmotion; pattern: RegExp; weight: number }[] = [
  { emotion: 'irritado', pattern: /\b(absurdo|absurda|ridiculo|ridicula|como ousa|chega|ja disse|ja falei|basta)\b/g, weight: 1 },
  { emotion: 'assustado', pattern: /\b(medo|por favor|socorro|me ajude|pelo amor de deus)\b/g, weight: 1 },
  { emotion: 'nervoso', pattern: /\b(eu juro|nao sei|nao lembro|acho que|talvez)\b/g, weight: 0.8 },
  { emotion: 'defensivo', pattern: /\b(nao fui eu|nao tenho nada a ver|por que eu|me acusando|ja expliquei)\b/g, weight: 1 },
  { emotion: 'confiante', pattern: /\b(obviamente|claro que|evidente|certamente|minha palavra)\b/g, weight: 0.8 },
];

/**
 * Infere o estado emocional a partir da própria resposta, para quando a IA não informa a emoção
 * A pressão é o número de perguntas já feitas
 */
export function inferEmotionalState(
  text: string,
  personality: SuspectPersonality,
  pressure = 0,
): EmotionalState {
  const baseline = BASELINE_EMOTION[personality];
  const plain = normalize(text);
  const scores = new Map<SuspectEmotion, number>();
  const add = (emotion: SuspectEmotion, value: number) =>
    scores.set(emotion, (scores.get(emotion) ?? 0) + value);

  TEXT_CUES.forEach(({ emotion, pattern, weight }) => {
    const matches = plain.match(pattern)?.length ?? 0;
    add(emotion, matches * weight);
  });

  // Exclamação: irritação, ou desespero para quem já é nervoso
  const exclamations = (text.match(/!/g) ?? []).length;
  add(personality === 'nervoso' ? 'nervoso' : 'irritado', exclamations * 0.7);

  // Reticências e palavras repetidas ("eu... eu") indicam hesitação
  const hesitations =
    (text.match(/\.\.\.|…/g) ?? []).length +
    (plain.match(/\b(\w+)\W+\1\b/g) ?? []).length;
  add('nervoso', hesitations * 0.8);

  // Devolver pergunta ao detetive é postura defensiva
  const questions = (text.match(/\?/g) ?? []).length;
  add('defensivo', questions * 0.5);

  let best: SuspectEmotion = baseline.emotion;
  let bestScore = 0;
  scores.forEach((score, emotion) => {
    if (score > bestScore) {
      best = emotion;
      bestScore = score;
    }
  });

  const pressureBoost = (clamp(pressure, 0, MAX_PRESSURE) / MAX_PRESSURE) * 0.25;
  const cueBoost = Math.min(bestScore, 3) * 0.15;
  return {
    emotion: best,
    intensity: clamp(baseline.intensity + cueBoost + pressureBoost, 0.2, 1),
  };
}

/**
 * Estado emocional de uma resposta do histórico
 * Usa o que a IA informou e, se não houver, infere pelo texto
 */
export function getMessageEmotionalState(
  message: Message,
  personality: SuspectPersonality,
  pressure = 0,
): EmotionalState {
  return (
    normalizeEmotionalState(message) ??
    inferEmotionalState(message.content, personality, pressure)
  );
}

// Deslocamento de tom/velocidade na posição t (0 = primeira frase, 1 = última)
function contourAt(contour: Contour, t: number): { pitch: number; rate: number } {
  switch (contour) {
    case 'falling':
      return { pitch: -0.03 * t, rate: -0.03 * t };
    case 'rising':
      return { pitch: 0.05 * t, rate: 0 };
    case 'accelerating':
      return { pitch: 0.02 * t, rate: 0.07 * t };
    case 'burst':
      return { pitch: 0.05 * (1 - t), rate: 0.05 * (1 - t) };
    case 'flat':
      return { pitch: 0, rate: 0 };
  }
}

/**
 * Calcula tom, velocidade, volume e pausas de cada frase, combinando a identidade do suspeito com o estado emocional
 * A semente deixa o resultado estável: a mesma fala repetida soa igual
 */
export function planProsody(
  identity: VoiceIdentity,
  personality: SuspectPersonality,
  state: EmotionalState,
  sentenceCount: number,
  seed: string,
): SentenceProsody[] {
  const mod = EMOTION_MODULATION[state.emotion];
  const k = clamp(state.intensity * PERSONALITY_REACTIVITY[personality], 0, 1);

  const pitch = identity.pitch + mod.pitch * k;
  const rate = identity.rate + mod.rate * k;
  const volume = clampVolume(identity.volume * (1 + mod.volume * k));
  const pauseAfterMs = Math.round(
    Math.max(0, identity.pauseMs * (1 + mod.pause * k)),
  );
  const commaPause = Math.round(mod.commaPauseMs * k);
  const commaPauseMs = commaPause >= MIN_COMMA_PAUSE_MS ? commaPause : 0;

  return Array.from({ length: sentenceCount }, (_, i) => {
    const t = sentenceCount > 1 ? i / (sentenceCount - 1) : 0;
    const shape = contourAt(mod.contour, t);
    const jitter = mod.jitter * k;
    return {
      pitch: clampPitch(pitch + shape.pitch * k + signedNoise(`${seed}|p${i}`) * jitter),
      rate: clampRate(rate + shape.rate * k + signedNoise(`${seed}|r${i}`) * jitter),
      volume,
      pauseAfterMs,
      commaPauseMs,
    };
  });
}
