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
const BASE_RATE = 1.0;
const PITCH_LIMITS = { min: 0.5, max: 2.0 };
const RATE_LIMITS = { min: 0.6, max: 1.5 };

// Ajuste de tom por gênero, feminino mais agudo, masculino mais grave
const GENDER_ADJUSTMENT: Record<SuspectGender, number> = {
  feminino: 0.2,
  masculino: -0.15,
};

// Ajuste por personalidade, somado ao tom/velocidade base
const PERSONALITY_ADJUSTMENT: Record<SuspectPersonality, VoiceAdjustment> = {
  calmo: { pitch: 0, rate: -0.25 },
  nervoso: { pitch: 0.15, rate: 0.3 },
  arrogante: { pitch: -0.15, rate: 0 },
  sarcastico: { pitch: 0, rate: -0.1 },
  defensivo: { pitch: 0.1, rate: 0.15 },
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const round = (value: number): number => Math.round(value * 100) / 100;

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
export function getVoiceParams(
  profile: VoiceProfile,
  voice?: VoiceBase,
): VoiceParams {
  const age = getAgeAdjustment(profile.age);
  const personality = PERSONALITY_ADJUSTMENT[profile.personality];

  const base = voice
    ? { pitch: voice.pitchOffset, rate: voice.rateOffset }
    : { pitch: GENDER_ADJUSTMENT[profile.gender], rate: 0 };

  const pitch = BASE_PITCH + base.pitch + age.pitch + personality.pitch;
  const rate = BASE_RATE + base.rate + age.rate + personality.rate;

  return {
    pitch: round(clamp(pitch, PITCH_LIMITS.min, PITCH_LIMITS.max)),
    rate: round(clamp(rate, RATE_LIMITS.min, RATE_LIMITS.max)),
  };
}

// Pausa entre frases, personalizando o ritmo de fala de cada personalidade
const PAUSE_MS: Record<SuspectPersonality, number> = {
  calmo: 500,
  nervoso: 150,
  arrogante: 700,
  sarcastico: 600,
  defensivo: 250,
};

export function getPauseMs(personality: SuspectPersonality): number {
  return PAUSE_MS[personality];
}