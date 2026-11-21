/* Escolhe uma das vozes boas instaladas no aparelho para cada perfil */

import Speech from '@mhpdev/react-native-speech';
import { SuspectGender } from '../../types/suspect.types';
import { VoiceProfile } from '../../types/voice.services.types';

const LANGUAGE = 'pt-BR';

type DeviceVoice = Awaited<
  ReturnType<typeof Speech.getAvailableVoices>
>[number];

// Voz escolhida, considera o ID no aparelho e a suacorreção do timbre natural
export interface VoiceChoice {
  identifier: string;
  pitchOffset: number;
  rateOffset: number;
}

interface CatalogEntry {
  key: string;             // Trecho do identificador da voz no aparelho
  gender: SuspectGender;
  pitchOffset: number;    // Ajusta o tom base da voz
  rateOffset: number;     // Ajusta a velocidade base da voz
}

// Vozes aprovadas no teste de audição
const VOICE_CATALOG: CatalogEntry[] = [
  // Homem por volta dos 30, neutro e levemente grave
  { key: 'ptd-network', gender: 'masculino', pitchOffset: 0, rateOffset: 0 },
  // Soa adolescente: o tom é abaixado para parecer adulta
  { key: 'pte-network', gender: 'feminino', pitchOffset: -0.15, rateOffset: 0 },
];

let cachedVoices: DeviceVoice[] | null = null;

async function loadVoices(): Promise<DeviceVoice[]> {
  if (!cachedVoices) {
    cachedVoices = await Speech.getAvailableVoices(LANGUAGE);
  }
  return cachedVoices;
}

/**
 * Escolhe uma voz do catálogo para o perfil, ou undefined para usar a voz padrão
 * A mesma combinação de perfil sempre dá a mesma voz
 */
export async function pickVoice(
  profile: VoiceProfile,
): Promise<VoiceChoice | undefined> {
  const deviceVoices = await loadVoices();

  // Apenas as vozes do gênero que estão instaladas no aparelho
  const available = VOICE_CATALOG.filter(
    entry => entry.gender === profile.gender,
  ).flatMap(entry => {
    const installed = deviceVoices.find(voice =>
      voice.identifier.includes(entry.key),
    );
    return installed
      ? [
          {
            identifier: installed.identifier,
            pitchOffset: entry.pitchOffset,
            rateOffset: entry.rateOffset,
          },
        ]
      : [];
  });

  if (available.length === 0) {
    return undefined;
  }

    // A idade decide a voz, a mesma combinação de idade e gênero sempre resulta na mesma voz
    return available[profile.age % available.length];
}