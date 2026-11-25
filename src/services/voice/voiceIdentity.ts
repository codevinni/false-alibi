/*
 * Identidade vocal de cada suspeito: a voz que ele mantém durante todo o caso
 * Converte o perfil (gênero, idade, personalidade) em tom e velocidade
 * Usa o id como impressão digital, para que cada suspeito tenha a mesma voz única no caso
 */

import {
  VoiceProfile,
  VoiceSubject,
} from '../../types/voice.services.types';
import { hashString, signedNoise } from './hash';
import {
  BASE_PITCH,
  BASE_RATE,
  CatalogVoice,
  ELDER,
  FINGERPRINT,
  GENDER_PITCH,
  InstalledVoice,
  LIMITS,
  MIN_VOICE_DISTANCE,
  PERSONALITY_VOICE,
  SEPARATION_STEPS,
  YOUNG,
} from './voiceConfig';

export interface VoiceIdentity {
  voice?: string;   // Identificador da voz no aparelho, ou voz padrão
  pitch: number;
  rate: number;
  volume: number;
  pauseMs: number;
}

// Chave da voz padrão do sistema, compartilhada por todos sem voz do catálogo
const DEFAULT_VOICE_KEY = '<default>';

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

// Mantém o valor dentro do limite aceito pela biblioteca, com 2 casas decimais
export function limit(value: number, kind: keyof typeof LIMITS): number {
  const { min, max } = LIMITS[kind];
  return Math.round(clamp(value, min, max) * 100) / 100;
}

function getAgeAdjustment(age: number): { pitch: number; rate: number } {
  // Idade inválida é tratada como adulto
  if (!Number.isFinite(age)) {
    return { pitch: 0, rate: 0 };
  }
  if (age < YOUNG.maxAge) {
    return YOUNG;
  }
  if (age >= ELDER.minAge) {
    return ELDER;
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
  voice?: CatalogVoice,
): { pitch: number; rate: number } {
  const age = getAgeAdjustment(profile.age);
  const personality = PERSONALITY_VOICE[profile.personality];

  const base = voice
    ? { pitch: voice.pitchOffset, rate: voice.rateOffset }
    : { pitch: GENDER_PITCH[profile.gender], rate: 0 };

  return {
    pitch: limit(BASE_PITCH + base.pitch + age.pitch + personality.pitch, 'pitch'),
    rate: limit(BASE_RATE + base.rate + age.rate + personality.rate, 'rate'),
  };
}

function voiceDistance(a: VoiceIdentity, b: VoiceIdentity): number {
  return Math.max(Math.abs(a.pitch - b.pitch), Math.abs(a.rate - b.rate));
}

function isDistinct(candidate: VoiceIdentity, others: VoiceIdentity[]): boolean {
  return others.every(
    other => voiceDistance(candidate, other) >= MIN_VOICE_DISTANCE - 1e-9,
  );
}

// Escolhe a voz base pelo id, preferindo uma ainda não usada no caso
function pickBaseVoice(
  subject: VoiceSubject,
  voices: InstalledVoice[],
  usage: Map<string, number>,
): InstalledVoice | undefined {
  const pool = voices.filter(voice => voice.gender === subject.gender);
  if (pool.length === 0) {
    return undefined;
  }
  const leastUsed = Math.min(
    ...pool.map(voice => usage.get(voice.identifier) ?? 0),
  );
  const candidates = pool.filter(
    voice => (usage.get(voice.identifier) ?? 0) === leastUsed,
  );
  return candidates[hashString(subject.id) % candidates.length];
}

// Identidade do suspeito antes da separação
function baseIdentity(
  subject: VoiceSubject,
  voice: InstalledVoice | undefined,
): VoiceIdentity {
  const { pitch, rate } = getVoiceParams(subject, voice);
  const personality = PERSONALITY_VOICE[subject.personality];
  const pauseFactor = subject.age >= ELDER.minAge ? ELDER.pauseFactor : 1;

  return {
    voice: voice?.identifier,
    pitch: limit(pitch + signedNoise(`${subject.id}|pitch`) * FINGERPRINT.pitch, 'pitch'),
    rate: limit(rate + signedNoise(`${subject.id}|rate`) * FINGERPRINT.rate, 'rate'),
    volume: personality.volume,
    pauseMs: Math.round(
      personality.pauseMs * pauseFactor +
        signedNoise(`${subject.id}|pause`) * FINGERPRINT.pauseMs,
    ),
  };
}

// Afasta a identidade das já atribuídas na mesma voz base, se estiver parecida demais
function separate(identity: VoiceIdentity, others: VoiceIdentity[]): VoiceIdentity {
  if (isDistinct(identity, others)) {
    return identity;
  }
  for (const delta of SEPARATION_STEPS) {
    const candidates: VoiceIdentity[] = [
      { ...identity, pitch: limit(identity.pitch + delta, 'pitch') },
      { ...identity, pitch: limit(identity.pitch - delta, 'pitch') },
      { ...identity, rate: limit(identity.rate + delta, 'rate') },
      { ...identity, rate: limit(identity.rate - delta, 'rate') },
    ];
    const free = candidates.find(candidate => isDistinct(candidate, others));
    if (free) {
      return free;
    }
  }
  // Sem espaço livre
  return identity;
}

/**
 * Identidades vocais de todos os suspeitos de um caso, distintas entre si
 * Retorna um Map de id do suspeito → identidade
 */
export function buildCaseVoiceIdentities(
  subjects: VoiceSubject[],
  voices: InstalledVoice[],
): Map<string, VoiceIdentity> {
  const result = new Map<string, VoiceIdentity>();
  const usage = new Map<string, number>();
  const byVoice = new Map<string, VoiceIdentity[]>();

  subjects.forEach(subject => {
    if (result.has(subject.id)) {
      return;
    }
    const voice = pickBaseVoice(subject, voices, usage);
    const key = voice?.identifier ?? DEFAULT_VOICE_KEY;
    const sameVoice = byVoice.get(key) ?? [];

    const identity = separate(baseIdentity(subject, voice), sameVoice);

    result.set(subject.id, identity);
    usage.set(key, (usage.get(key) ?? 0) + 1);
    byVoice.set(key, [...sameVoice, identity]);
  });

  return result;
}

/** Identidade de um suspeito isolado (pode coincidir com a de outro). */
export function buildVoiceIdentity(
  subject: VoiceSubject,
  voices: InstalledVoice[],
): VoiceIdentity {
  return baseIdentity(subject, pickBaseVoice(subject, voices, new Map()));
}
