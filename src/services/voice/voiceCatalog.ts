/* Catálogo das vozes boas para os suspeitos e quais delas estão no aparelho */

import Speech from '@mhpdev/react-native-speech';
import { SuspectGender } from '../../types/suspect.types';
import { VoiceBase } from './voiceProfile';

const LANGUAGE = 'pt-BR';

type DeviceVoice = Awaited<
  ReturnType<typeof Speech.getAvailableVoices>
>[number];

// Voz do catálogo instalada no aparelho, com a correção do seu timbre natural
export interface InstalledVoice extends VoiceBase {
  identifier: string;
  gender: SuspectGender;
}

interface CatalogEntry extends VoiceBase {
  key: string;             // Trecho do identificador da voz no aparelho
  gender: SuspectGender;
}

/**
 * Vozes aprovadas no teste de audição (VoiceLab)
 * Cada voz nova aqui aumenta muito a diferença entre os suspeitos: com uma
 * só voz por gênero, a distinção vem apenas do tom, velocidade e ritmo
 */
const VOICE_CATALOG: CatalogEntry[] = [
  // Voz masculina com timbre adulto, neutro, boa dicção
  { key: 'ptd-local', gender: 'masculino', pitchOffset: -0.05, rateOffset: 0.05 },
  // Voz feminina com timbre adulto, neutro, boa dicção
  { key: 'pte-local', gender: 'feminino', pitchOffset: -0.08, rateOffset: 0.05 },
];

let cachedVoices: InstalledVoice[] | null = null;

/**
 * Vozes do catálogo instaladas no aparelho, na ordem do catálogo
 * Lista vazia significa usar a voz padrão do sistema
 */
export async function getInstalledVoices(): Promise<InstalledVoice[]> {
  if (cachedVoices) {
    return cachedVoices;
  }

  let deviceVoices: DeviceVoice[];
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
    return installed
      ? [
          {
            identifier: installed.identifier,
            gender: entry.gender,
            pitchOffset: entry.pitchOffset,
            rateOffset: entry.rateOffset,
          },
        ]
      : [];
  });
  return cachedVoices;
}
