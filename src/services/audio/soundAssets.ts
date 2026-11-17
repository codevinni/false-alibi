/**
 * REGISTRO DE SONS — único lugar para trocar os arquivos de áudio.
 *
 * Para substituir um placeholder:
 *   1. Coloque o novo arquivo em src/assets/sounds/
 *      (nome só com letras minúsculas, números e "_"; ex.: porta_rangendo.mp3)
 *   2. Troque o require() correspondente abaixo.
 *   3. (Opcional) ajuste `volume` para equilibrar o som com os demais.
 *
 * Para criar um efeito novo:
 *   1. Adicione o nome em SoundEffectType (src/types/media.services.types.ts)
 *   2. Adicione a entrada em SOUND_EFFECTS — o TypeScript avisa se faltar.
 *
 * Formatos aceitos: .wav, .mp3, .ogg (Android) / .wav, .mp3, .m4a (iOS).
 * Prefira .mp3 ou .ogg para músicas (arquivos menores).
 */
import {
  MusicTrackType,
  SoundEffectType,
} from '../../types/audio.services.types';

export interface SoundAsset {
  // Resultado de require('...') — o Metro empacota o arquivo junto com o app
  source: number;
  // Volume relativo deste arquivo (0 a 1). Padrão: 1
  volume?: number;
}

export const SOUND_EFFECTS: Record<SoundEffectType, SoundAsset> = {
  button_click: {
    source: require('../../assets/sounds/button_click.wav'),
    volume: 0.6,
  },
  new_case: { source: require('../../assets/sounds/new_case.wav') },
  accusation: { source: require('../../assets/sounds/accusation.wav') },
  victory: { source: require('../../assets/sounds/victory.wav') },
  defeat: { source: require('../../assets/sounds/defeat.wav') },
};

export const MUSIC_TRACKS: Record<MusicTrackType, SoundAsset> = {
  main_theme: {
    source: require('../../assets/sounds/music_main_theme.wav'),
    volume: 0.8,
  },
  investigation: {
    source: require('../../assets/sounds/music_investigation.wav'),
    volume: 0.8,
  },
};
