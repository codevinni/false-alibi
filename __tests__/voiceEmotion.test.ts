import {
  inferEmotionalState,
  planProsody,
} from '../src/services/voice/voiceEmotion';
import { VoiceIdentity } from '../src/services/voice/voiceIdentity';
import { SuspectEmotion } from '../src/types/emotion.types';

const EMOTIONS: SuspectEmotion[] = [
  'calmo',
  'confiante',
  'defensivo',
  'nervoso',
  'assustado',
  'irritado',
];

const identity: VoiceIdentity = {
  voice: 'pt-br-x-ptd-network',
  pitch: 1.0,
  rate: 1.1,
  volume: 0.9,
  pauseMs: 200,
};

const plan = (emotion: SuspectEmotion, intensity = 1, n = 3) =>
  planProsody(identity, 'defensivo', { emotion, intensity }, n, 'seed');

describe('inferEmotionalState', () => {
  it('usa a emoção de base da personalidade sem pistas no texto', () => {
    expect(inferEmotionalState('Eu estava na adega.', 'arrogante').emotion).toBe('confiante');
  });

  it('detecta hesitação como nervosismo', () => {
    expect(
      inferEmotionalState('Eu... eu apenas não estou acostumada com tempestades.', 'calmo').emotion,
    ).toBe('nervoso');
  });

  it('detecta irritação', () => {
    expect(inferEmotionalState('Isso é um absurdo! Já disse onde estava!', 'arrogante').emotion).toBe(
      'irritado',
    );
  });

  it('não confunde palavras parecidas com pistas', () => {
    expect(inferEmotionalState('Parece que choveu.', 'calmo').emotion).toBe('calmo');
  });

  it('aumenta a intensidade com a pressão do interrogatório', () => {
    const relaxed = inferEmotionalState('Eu estava na adega.', 'calmo', 0);
    const pressed = inferEmotionalState('Eu estava na adega.', 'calmo', 6);
    expect(pressed.intensity).toBeGreaterThan(relaxed.intensity);
  });
});

describe('planProsody', () => {
  it('gera uma prosódia por frase, dentro dos limites', () => {
    EMOTIONS.forEach(emotion => {
      const result = plan(emotion);
      expect(result).toHaveLength(3);
      result.forEach(p => {
        expect(p.pitch).toBeGreaterThanOrEqual(0.8);
        expect(p.pitch).toBeLessThanOrEqual(1.6);
        expect(p.rate).toBeGreaterThanOrEqual(0.6);
        expect(p.rate).toBeLessThanOrEqual(1.5);
        expect(p.volume).toBeGreaterThanOrEqual(0.4);
        expect(p.volume).toBeLessThanOrEqual(1);
      });
    });
  });

  it('nervoso fala mais rápido e com pausas menores que calmo', () => {
    const nervous = plan('nervoso')[0];
    const calm = plan('calmo')[0];
    expect(nervous.rate).toBeGreaterThan(calm.rate);
    expect(nervous.pauseAfterMs).toBeLessThan(calm.pauseAfterMs);
  });

  it('irritado fala mais alto que assustado', () => {
    expect(plan('irritado')[0].volume).toBeGreaterThan(plan('assustado')[0].volume);
  });

  it('só hesita nas vírgulas em emoções abaladas', () => {
    expect(plan('assustado')[0].commaPauseMs).toBeGreaterThan(0);
    expect(plan('confiante')[0].commaPauseMs).toBe(0);
  });

  it('intensidade zero mantém a identidade do suspeito', () => {
    const [p] = plan('irritado', 0, 1);
    expect(p).toMatchObject({ pitch: identity.pitch, rate: identity.rate, volume: identity.volume });
  });

  it('nervoso acelera ao longo da fala', () => {
    const result = planProsody(identity, 'nervoso', { emotion: 'nervoso', intensity: 1 }, 4, 'x');
    expect(result[3].rate).toBeGreaterThan(result[0].rate - 0.05);
  });

  it('é determinístico para a mesma semente', () => {
    expect(plan('nervoso')).toEqual(plan('nervoso'));
  });
});
