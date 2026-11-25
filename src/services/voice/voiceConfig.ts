/*
 * Configurações da voz dos suspeitos
 */

import { EmotionalState, SuspectEmotion } from '../../types/emotion.types';
import { SuspectGender, SuspectPersonality } from '../../types/suspect.types';

// Valores neutros de tom e velocidade
export const BASE_PITCH = 1.0;
export const BASE_RATE = 1.12;

// Limites aceitos pela biblioteca de TTS (Android)
export const LIMITS = {
  pitch: { min: 0.8, max: 1.6 },
  rate: { min: 0.6, max: 1.5 },
  volume: { min: 0.4, max: 1.0 },
};

// Ajuste de tom por gênero, usado só sem voz do catálogo (a voz do catálogo já tem o gênero)
export const GENDER_PITCH: Record<SuspectGender, number> = {
  feminino: 0.1,
  masculino: -0.10,
};

// Jovens: voz mais aguda e rápida
export const YOUNG = { maxAge: 18, pitch: 0.2, rate: 0.1 };

// Idosos: voz mais grave, lenta e com pausas mais longas
export const ELDER = { minAge: 60, pitch: -0.1, rate: -0.15, pauseFactor: 1.2 };

interface PersonalityVoice {
  pitch: number;            // Soma ao tom base
  rate: number;             // Soma à velocidade base
  volume: number;           // Abaixo de 1 para sobrar espaço para emoções mais intensas
  pauseMs: number;          // Pausa entre frases (ritmo de fala)
  reactivity: number;       // Quanto a emoção transparece na voz
  baseline: EmotionalState; // Emoção de quando nada na fala indica outra
}

export const PERSONALITY_VOICE: Record<SuspectPersonality, PersonalityVoice> = {
  calmo:      { pitch: -0.08, rate: -0.12, volume: 0.85, pauseMs: 200, reactivity: 0.6, baseline: { emotion: 'calmo', intensity: 0.4 } },
  nervoso:    { pitch:  0.18, rate:  0.15, volume: 0.8,  pauseMs: 100, reactivity: 1.3, baseline: { emotion: 'nervoso', intensity: 0.4 } },
  arrogante:  { pitch: -0.18, rate: -0.04, volume: 0.95, pauseMs: 380, reactivity: 0.8, baseline: { emotion: 'confiante', intensity: 0.5 } },
  sarcastico: { pitch:  0.05, rate: -0.08, volume: 0.9,  pauseMs: 320, reactivity: 0.9, baseline: { emotion: 'confiante', intensity: 0.3 } },
  defensivo:  { pitch:  0.10, rate:  0.08, volume: 0.9,  pauseMs: 140, reactivity: 1.1, baseline: { emotion: 'defensivo', intensity: 0.4 } },
};


// Como o tom/velocidade evolui da primeira para a última frase
export type Contour = 'flat' | 'falling' | 'rising' | 'accelerating' | 'burst';

interface EmotionModulation {
  pitch: number;        // Soma ao tom com intensidade máxima
  rate: number;         // Soma à velocidade com intensidade máxima
  volume: number;       // Fração somada ao volume (0.1 = +10%)
  pause: number;        // Fração somada à pausa entre frases (-0.5 = metade)
  jitter: number;       // Variação máxima de tom/velocidade entre frases
  contour: Contour;
  commaPauseMs: number; // Hesitação nas vírgulas (0 = fala a frase inteira)
}

export const EMOTION_MODULATION: Record<SuspectEmotion, EmotionModulation> = {
  calmo:     { pitch: -0.04, rate: -0.08, volume: -0.05, pause:  0.3, jitter: 0,    contour: 'falling',      commaPauseMs: 0 },
  confiante: { pitch: -0.06, rate: -0.04, volume:  0.05, pause:  0.2, jitter: 0,    contour: 'falling',      commaPauseMs: 0 },
  defensivo: { pitch:  0.05, rate:  0.07, volume:  0.05, pause: -0.3, jitter: 0.01, contour: 'flat',         commaPauseMs: 0 },
  nervoso:   { pitch:  0.10, rate:  0.12, volume: -0.10, pause: -0.5, jitter: 0.04, contour: 'accelerating', commaPauseMs: 140 },
  assustado: { pitch:  0.14, rate: -0.02, volume: -0.25, pause:  0.2, jitter: 0.05, contour: 'rising',       commaPauseMs: 220 },
  irritado:  { pitch:  0.06, rate:  0.14, volume:  0.12, pause: -0.4, jitter: 0.02, contour: 'burst',        commaPauseMs: 0 },
};

// Pistas no texto da resposta que indicam cada emoção (texto sem acentos e minúsculo)
export const TEXT_CUES: { emotion: SuspectEmotion; pattern: RegExp; weight: number }[] = [
  { emotion: 'irritado', pattern: /\b(absurdo|absurda|ridiculo|ridicula|como ousa|chega|ja disse|ja falei|basta)\b/g, weight: 1 },
  { emotion: 'assustado', pattern: /\b(medo|por favor|socorro|me ajude|pelo amor de deus)\b/g, weight: 1 },
  { emotion: 'nervoso', pattern: /\b(eu juro|nao sei|nao lembro|acho que|talvez)\b/g, weight: 0.8 },
  { emotion: 'defensivo', pattern: /\b(nao fui eu|nao tenho nada a ver|por que eu|me acusando|ja expliquei)\b/g, weight: 1 },
  { emotion: 'confiante', pattern: /\b(obviamente|claro que|evidente|certamente|minha palavra)\b/g, weight: 0.8 },
];

// Hesitação mais curta que isso não é percebida e só deixa a fala truncada
export const MIN_COMMA_PAUSE_MS = 60;

// Quantas perguntas até a pressão do interrogatório chegar ao máximo
export const MAX_PRESSURE = 6;

// Voz aprovada para os suspeitos, com a correção do seu timbre natural
export interface CatalogVoice {
  key: string;          // Trecho do identificador da voz no aparelho
  gender: SuspectGender;
  pitchOffset: number;
  rateOffset: number;
}

// Voz do catálogo encontrada no aparelho
export type InstalledVoice = CatalogVoice & { identifier: string };

/**
 * Vozes aprovadas no teste de audição
 * Cada voz aumenta a diferença entre os suspeitos
 * Com uma só voz por gênero, a distinção vem apenas do tom, velocidade e ritmo
 */
export const VOICE_CATALOG: CatalogVoice[] = [
  // Voz masculina com timbre adulto, neutro, boa dicção
  { key: 'ptd-local', gender: 'masculino', pitchOffset: -0.05, rateOffset: 0.05 },
  // Voz feminina com timbre adulto, neutro, boa dicção
  { key: 'pte-local', gender: 'feminino', pitchOffset: -0.08, rateOffset: 0.05 },
];

// Variação máxima da impressão digital (derivada do id) em torno do perfil
export const FINGERPRINT = { pitch: 0.04, rate: 0.04, pauseMs: 40 };

// Menor diferença de tom OU velocidade percebida como outra pessoa
export const MIN_VOICE_DISTANCE = 0.09;

// Deslocamentos testados, em ordem, para afastar vozes parecidas demais
export const SEPARATION_STEPS = [0.09, 0.18];
