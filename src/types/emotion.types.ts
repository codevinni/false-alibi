/* Estado emocional do suspeito durante o interrogatório */

// Emoções que a IA pode devolver juntamente com cada resposta
export const SUSPECT_EMOTIONS = [
  'calmo',
  'confiante',
  'defensivo',
  'nervoso',
  'assustado',
  'irritado',
] as const;

export type SuspectEmotion = (typeof SUSPECT_EMOTIONS)[number];

export interface EmotionalState {
  emotion: SuspectEmotion;
  // 0 = quase imperceptível, 1 = emoção no máximo
  intensity: number;
}
