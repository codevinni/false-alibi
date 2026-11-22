/* Calibração da voz: converte o perfil do suspeito em tom e velocidade */

import { SuspectGender, SuspectPersonality } from '../../types/suspect.types';
import { VoiceProfile } from '../../types/voice.services.types';

export interface VoiceParams {
  pitch: number;
  rate: number;
}

interface VoiceAdjustment {
  pitch: number;
  rate: number;
}

// Base da voz escolhida, advinda do catálogo de vozes
export interface VoiceBase {
  pitchOffset: number;
  rateOffset: number;
}

// Valores neutros e limites aceitos pela biblioteca de TTS (Android)
const BASE_PITCH = 1.0;
const BASE_RATE = 1.12;
export const PITCH_LIMITS = { min: 0.8, max: 1.6 };
export const RATE_LIMITS = { min: 0.6, max: 1.5 };
export const VOLUME_LIMITS = { min: 0.4, max: 1.0 };

// Ajuste de tom por gênero, feminino mais agudo, masculino mais grave
const GENDER_ADJUSTMENT: Record<SuspectGender, number> = {
  feminino: 0.2,
  masculino: -0.15,
};

// Ajuste por personalidade, somado ao tom/velocidade base
const PERSONALITY_ADJUSTMENT: Record<SuspectPersonality, VoiceAdjustment> = {
  calmo:      { pitch: -0.08, rate: -0.12 },
  nervoso:    { pitch:  0.18, rate:  0.18 },
  arrogante:  { pitch: -0.18, rate: -0.04 },
  sarcastico: { pitch:  0.05, rate: -0.08 },
  defensivo:  { pitch:  0.10, rate:  0.08 },
};

// Volume base: abaixo de 1 para sobrar espaço para emoções mais intensas
const PERSONALITY_VOLUME: Record<SuspectPersonality, number> = {
  calmo: 0.85,
  nervoso: 0.8,
  arrogante: 0.95,
  sarcastico: 0.9,
  defensivo: 0.9,
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const round = (value: number): number => Math.round(value * 100) / 100;

export const clampPitch = (pitch: number): number =>
  round(clamp(pitch, PITCH_LIMITS.min, PITCH_LIMITS.max));

export const clampRate = (rate: number): number =>
  round(clamp(rate, RATE_LIMITS.min, RATE_LIMITS.max));

export const clampVolume = (volume: number): number =>
  round(clamp(volume, VOLUME_LIMITS.min, VOLUME_LIMITS.max));

function getAgeAdjustment(age: number): VoiceAdjustment {
  // Idade inválida é tratada como adulto
  if (!Number.isFinite(age)) {
    return { pitch: 0, rate: 0 };
  }
  if (age < 18) {
    return { pitch: 0.25, rate: 0.1 };
  }
  if (age >= 60) {
    return { pitch: -0.1, rate: -0.15 };
  }
  return { pitch: 0, rate: 0 };
}

/**
 * Converte o perfil do suspeito em tom (pitch) e velocidade (rate) da voz
 * A voz escolhida do catálogo já possui o gênero e timbre, sem voz escolhida, o gênero é simulado ajustando o tom
 * O mesmo perfil sempre gera a mesma voz
 */
export function getVoiceParams(profile: VoiceProfile, voice?: VoiceBase): VoiceParams {
  const age = getAgeAdjustment(profile.age);
  const personality = PERSONALITY_ADJUSTMENT[profile.personality];

  const base = voice
    ? { pitch: voice.pitchOffset, rate: voice.rateOffset }
    : { pitch: GENDER_ADJUSTMENT[profile.gender], rate: 0 };

  return {
    pitch: clampPitch(BASE_PITCH + base.pitch + age.pitch + personality.pitch),
    rate: clampRate(BASE_RATE + base.rate + age.rate + personality.rate),
  };
}

export function getBaseVolume(personality: SuspectPersonality): number {
  return PERSONALITY_VOLUME[personality];
}

// Pausa entre frases, personalizando o ritmo de fala de cada personalidade
const PAUSE_MS: Record<SuspectPersonality, number> = {
  calmo: 200,
  nervoso: 80,
  arrogante: 380,
  sarcastico: 320,
  defensivo: 140,
};

export function getPauseMs(personality: SuspectPersonality): number {
  return PAUSE_MS[personality];
}
