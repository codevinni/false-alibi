/*
 * Modulação emocional da voz do suspeito
 * Infere a emoção pelo texto e calcula a prosódia de cada frase
 * As tabelas de configuração ficam em voiceConfig.ts
 */

import { EmotionalState, SuspectEmotion } from '../../types/emotion.types';
import { SuspectPersonality } from '../../types/suspect.types';
import { signedNoise } from './hash';
import {
  Contour,
  EMOTION_MODULATION,
  MAX_PRESSURE,
  MIN_COMMA_PAUSE_MS,
  PERSONALITY_VOICE,
  TEXT_CUES,
} from './voiceConfig';
import { clamp, limit, VoiceIdentity } from './voiceIdentity';

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

/**
 * Infere o estado emocional a partir do texto da própria resposta
 * A pressão é o número de perguntas já feitas
 */
export function inferEmotionalState(
  text: string,
  personality: SuspectPersonality,
  pressure = 0,
): EmotionalState {
  const baseline = PERSONALITY_VOICE[personality].baseline;
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
  const k = clamp(state.intensity * PERSONALITY_VOICE[personality].reactivity, 0, 1);

  const pitch = identity.pitch + mod.pitch * k;
  const rate = identity.rate + mod.rate * k;
  const volume = limit(identity.volume * (1 + mod.volume * k), 'volume');
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
      pitch: limit(pitch + shape.pitch * k + signedNoise(`${seed}|p${i}`) * jitter, 'pitch'),
      rate: limit(rate + shape.rate * k + signedNoise(`${seed}|r${i}`) * jitter, 'rate'),
      volume,
      pauseAfterMs,
      commaPauseMs,
    };
  });
}
