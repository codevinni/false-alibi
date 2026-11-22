/*
 * Identidade vocal de cada suspeito: a voz que ele mantém durante todo o caso
 * Considera o id como impressão digital do suspeito, para que ele mantenha a mesma voz mesmo com perfil 
 * Usa o catálogo de vozes do aparelho para controlar o tom e a velocidade 
 */

import { VoiceSubject } from '../../types/voice.services.types';
import { hashString, signedNoise } from './hash';
import type { InstalledVoice } from './voiceCatalog';
import {
  clampPitch,
  clampRate,
  getBaseVolume,
  getPauseMs,
  getVoiceParams,
} from './voiceProfile';

export interface VoiceIdentity {
  voice?: string;   // Identificador da voz no aparelho, ou voz padrão
  pitch: number;
  rate: number;
  volume: number;
  pauseMs: number;
}

// Variação máxima da impressão digital em torno do perfil
const FINGERPRINT = { pitch: 0.04, rate: 0.04, pauseMs: 40 };

// Menor diferença de tom OU velocidade percebida como outra pessoa
export const MIN_VOICE_DISTANCE = 0.09;

// Passo e alcance máximo do afastamento entre vozes parecidas
const NUDGE_STEP = 0.03;
const MAX_NUDGE_STEPS = 6;

// Idosos falam com pausas um pouco mais longas
const ELDER_AGE = 60;
const ELDER_PAUSE_FACTOR = 1.2;

// Chave da voz padrão do sistema, compartilhada por todos sem voz do catálogo
const DEFAULT_VOICE_KEY = '<default>';

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
  const pauseFactor = subject.age >= ELDER_AGE ? ELDER_PAUSE_FACTOR : 1;

  return {
    voice: voice?.identifier,
    pitch: clampPitch(pitch + signedNoise(`${subject.id}|pitch`) * FINGERPRINT.pitch),
    rate: clampRate(rate + signedNoise(`${subject.id}|rate`) * FINGERPRINT.rate),
    volume: getBaseVolume(subject.personality),
    pauseMs: Math.round(
      getPauseMs(subject.personality) * pauseFactor +
        signedNoise(`${subject.id}|pause`) * FINGERPRINT.pauseMs,
    ),
  };
}

// Afasta a identidade das já atribuídas na mesma voz base, mudando o mínimo
function separate(identity: VoiceIdentity, others: VoiceIdentity[]): VoiceIdentity {
  if (isDistinct(identity, others)) {
    return identity;
  }
  for (let step = 1; step <= MAX_NUDGE_STEPS; step++) {
    const delta = step * NUDGE_STEP;
    const candidates: VoiceIdentity[] = [
      { ...identity, pitch: clampPitch(identity.pitch + delta) },
      { ...identity, pitch: clampPitch(identity.pitch - delta) },
      { ...identity, rate: clampRate(identity.rate + delta) },
      { ...identity, rate: clampRate(identity.rate - delta) },
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
