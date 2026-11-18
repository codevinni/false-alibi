import { getVoiceParams } from '../src/services/voice/voiceProfile';
import { mockSuspects } from '../src/mocks';
import { VoiceProfile } from '../src/types/voice.services.types';

const adultMale: VoiceProfile = {
  gender: 'masculino',
  personality: 'calmo',
  age: 40,
};

describe('getVoiceParams', () => {
  it('gera voz mais aguda para feminino do que para masculino', () => {
    const female = getVoiceParams({ ...adultMale, gender: 'feminino' });
    const male = getVoiceParams(adultMale);
    expect(female.pitch).toBeGreaterThan(male.pitch);
  });

  it('gera fala mais rápida para nervoso do que para calmo', () => {
    const nervous = getVoiceParams({ ...adultMale, personality: 'nervoso' });
    const calm = getVoiceParams(adultMale);
    expect(nervous.rate).toBeGreaterThan(calm.rate);
  });

  it('gera voz mais aguda para jovens e mais lenta para idosos', () => {
    const young = getVoiceParams({ ...adultMale, age: 15 });
    const adult = getVoiceParams(adultMale);
    const elder = getVoiceParams({ ...adultMale, age: 75 });
    expect(young.pitch).toBeGreaterThan(adult.pitch);
    expect(elder.rate).toBeLessThan(adult.rate);
  });

  it('trata idade inválida como adulto', () => {
    expect(getVoiceParams({ ...adultMale, age: NaN })).toEqual(
      getVoiceParams(adultMale),
    );
  });

  it('mantém todas as combinações dentro dos limites', () => {
    const genders = ['masculino', 'feminino'] as const;
    const personalities = [
      'calmo',
      'nervoso',
      'arrogante',
      'sarcastico',
      'defensivo',
    ] as const;
    const ages = [5, 17, 18, 30, 59, 60, 95];

    genders.forEach(gender =>
      personalities.forEach(personality =>
        ages.forEach(age => {
          const { pitch, rate } = getVoiceParams({ gender, personality, age });
          expect(pitch).toBeGreaterThanOrEqual(0.5);
          expect(pitch).toBeLessThanOrEqual(2.0);
          expect(rate).toBeGreaterThanOrEqual(0.6);
          expect(rate).toBeLessThanOrEqual(1.5);
        }),
      ),
    );
  });

  it('dá a cada suspeito do mock uma voz distinguível das demais', () => {
    const voices = mockSuspects.map(suspect =>
      getVoiceParams({
        gender: suspect.gender,
        personality: suspect.personality,
        age: suspect.age,
      }),
    );

    voices.forEach((a, i) =>
      voices.slice(i + 1).forEach(b => {
        const pitchDiff = Math.abs(a.pitch - b.pitch);
        const rateDiff = Math.abs(a.rate - b.rate);
        expect(Math.max(pitchDiff, rateDiff)).toBeGreaterThanOrEqual(0.09);
      }),
    );
  });
});