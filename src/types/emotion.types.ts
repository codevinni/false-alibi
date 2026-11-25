/* Estado emocional do suspeito durante o interrogatório */

// Emoções que a voz do suspeito pode expressar
export type SuspectEmotion =
  | 'calmo'
  | 'confiante'
  | 'defensivo'
  | 'nervoso'
  | 'assustado'
  | 'irritado';

export interface EmotionalState {
  emotion: SuspectEmotion;
  intensity: number; // 0 = quase imperceptível, 1 = emoção no máximo
}
