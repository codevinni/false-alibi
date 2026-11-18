/**
 * Escolha de avatar para cada suspeito.
 *
 * Regras, em ordem:
 *   1. Se o suspeito tem um avatarId válido (registrado em imageAssets.ts),
 *      usa ele. Isso permite à IA/gerador de casos escolher o avatar.
 *   2. Senão, escolhe entre os avatares do mesmo gênero e faixa etária.
 *   3. Se não houver nenhum, amplia para o mesmo gênero e depois para todos.
 *
 * A escolha é determinística (baseada no id do suspeito): o mesmo suspeito
 * sempre recebe o mesmo avatar, em qualquer tela. Ao resolver um caso
 * inteiro, o resolvedor evita repetir avatares enquanto houver opções.
 */
import { Suspect } from '../../types';
import {
  AvatarAgeGroup,
  SuspectAvatarId,
} from '../../types/media.services.types';
import { FALLBACK_AVATAR_ID, SUSPECT_AVATARS } from './imageAssets';
import { ADULT_MAX_AGE, YOUNG_MAX_AGE } from './media.config';

type AvatarSubject = Pick<Suspect, 'id' | 'gender' | 'age' | 'avatarId'>;

const ALL_AVATAR_IDS = Object.keys(SUSPECT_AVATARS) as SuspectAvatarId[];

export function isSuspectAvatarId(id: unknown): id is SuspectAvatarId {
  return (
    typeof id === 'string' &&
    Object.prototype.hasOwnProperty.call(SUSPECT_AVATARS, id)
  );
}

export function getAgeGroup(age: number): AvatarAgeGroup {
  if (age <= YOUNG_MAX_AGE) {
    return 'jovem';
  }
  if (age <= ADULT_MAX_AGE) {
    return 'adulto';
  }
  return 'idoso';
}

// Hash simples e estável de uma string (djb2)
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Listas de candidatos, da mais específica para a mais genérica
function candidatePools(subject: AvatarSubject): SuspectAvatarId[][] {
  const ageGroup = getAgeGroup(subject.age);
  const sameGenderAndAge = ALL_AVATAR_IDS.filter(
    id =>
      SUSPECT_AVATARS[id].gender === subject.gender &&
      SUSPECT_AVATARS[id].ageGroup === ageGroup,
  );
  const sameGender = ALL_AVATAR_IDS.filter(
    id => SUSPECT_AVATARS[id].gender === subject.gender,
  );
  return [sameGenderAndAge, sameGender, ALL_AVATAR_IDS].filter(
    pool => pool.length > 0,
  );
}

function pick(pool: SuspectAvatarId[], seed: string): SuspectAvatarId {
  return pool[hashString(seed) % pool.length];
}

/** Avatar de um suspeito isolado (pode repetir entre suspeitos). */
export function resolveSuspectAvatarId(subject: AvatarSubject): SuspectAvatarId {
  if (isSuspectAvatarId(subject.avatarId)) {
    return subject.avatarId;
  }
  const [firstPool] = candidatePools(subject);
  return firstPool ? pick(firstPool, subject.id) : FALLBACK_AVATAR_ID;
}

/**
 * Avatares de todos os suspeitos de um caso, evitando repetição.
 * Retorna um Map de id do suspeito → id do avatar.
 */
export function resolveCaseAvatarIds(
  suspects: AvatarSubject[],
): Map<string, SuspectAvatarId> {
  const result = new Map<string, SuspectAvatarId>();
  const used = new Set<SuspectAvatarId>();

  // Primeiro os avatares escolhidos explicitamente (têm prioridade)
  suspects.forEach(suspect => {
    if (isSuspectAvatarId(suspect.avatarId)) {
      result.set(suspect.id, suspect.avatarId);
      used.add(suspect.avatarId);
    }
  });

  // Depois os demais, pela ordem do caso
  suspects.forEach(suspect => {
    if (result.has(suspect.id)) {
      return;
    }
    const pools = candidatePools(suspect);
    let chosen: SuspectAvatarId | undefined;
    for (const pool of pools) {
      const free = pool.filter(id => !used.has(id));
      if (free.length > 0) {
        chosen = pick(free, suspect.id);
        break;
      }
    }
    // Todos usados: repete o mais adequado
    chosen = chosen ?? resolveSuspectAvatarId(suspect);
    result.set(suspect.id, chosen);
    used.add(chosen);
  });

  return result;
}
