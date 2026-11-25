import { mockSuspects } from '../src/mocks';
import {
  InstalledVoice,
  MIN_VOICE_DISTANCE,
} from '../src/services/voice/voiceConfig';
import {
  buildCaseVoiceIdentities,
  VoiceIdentity,
} from '../src/services/voice/voiceIdentity';
import { VoiceSubject } from '../src/types/voice.services.types';

const VOICES: InstalledVoice[] = [
  { key: 'ptd-network', identifier: 'pt-br-x-ptd-network', gender: 'masculino', pitchOffset: -0.05, rateOffset: 0.05 },
  { key: 'pte-network', identifier: 'pt-br-x-pte-network', gender: 'feminino', pitchOffset: -0.08, rateOffset: 0.05 },
];

const distance = (a: VoiceIdentity, b: VoiceIdentity) =>
  Math.max(Math.abs(a.pitch - b.pitch), Math.abs(a.rate - b.rate));

// Todos os pares que dividem a mesma voz base precisam ser distinguíveis
function expectDistinct(identities: Map<string, VoiceIdentity>) {
  const list = [...identities.values()];
  list.forEach((a, i) =>
    list.slice(i + 1).forEach(b => {
      if (a.voice === b.voice) {
        expect(distance(a, b)).toBeGreaterThanOrEqual(MIN_VOICE_DISTANCE - 1e-9);
      }
    }),
  );
}

// Suspeitos com o mesmo perfil, o pior caso para a unicidade
const clones: VoiceSubject[] = Array.from({ length: 5 }, (_, i) => ({
  id: `clone-${i}`,
  gender: 'masculino',
  personality: 'calmo',
  age: 40,
}));

describe('buildCaseVoiceIdentities', () => {
  it('usa a voz do catálogo do gênero de cada suspeito', () => {
    const identities = buildCaseVoiceIdentities(mockSuspects, VOICES);
    mockSuspects.forEach(suspect => {
      const expected = VOICES.find(v => v.gender === suspect.gender);
      expect(identities.get(suspect.id)?.voice).toBe(expected?.identifier);
    });
  });

  it('dá vozes distinguíveis aos suspeitos do mock', () => {
    expectDistinct(buildCaseVoiceIdentities(mockSuspects, VOICES));
  });

  it('separa suspeitos com perfil idêntico', () => {
    expectDistinct(buildCaseVoiceIdentities(clones, VOICES));
  });

  it('separa todos quando não há voz do catálogo instalada', () => {
    const identities = buildCaseVoiceIdentities(mockSuspects, []);
    expect([...identities.values()].every(i => i.voice === undefined)).toBe(true);
    expectDistinct(identities);
  });

  it('é determinístico', () => {
    expect(buildCaseVoiceIdentities(mockSuspects, VOICES)).toEqual(
      buildCaseVoiceIdentities(mockSuspects, VOICES),
    );
  });

  it('distribui vozes do mesmo gênero antes de repetir', () => {
    const voices: InstalledVoice[] = [
      ...VOICES,
      { key: 'extra-network', identifier: 'pt-br-x-extra-network', gender: 'masculino', pitchOffset: 0, rateOffset: 0 },
    ];
    const identities = buildCaseVoiceIdentities(clones.slice(0, 2), voices);
    const used = new Set([...identities.values()].map(i => i.voice));
    expect(used.size).toBe(2);
  });
});
