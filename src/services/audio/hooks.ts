import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  AudioSettings,
  MusicTrackType,
  SoundEffectType,
} from '../../types/audio.services.types';
import { audioService } from './audioServiceInstance';

/** Configurações de áudio atuais; o componente re-renderiza quando mudam. */
export function useAudioSettings(): AudioSettings {
  return useSyncExternalStore(audioService.subscribe, audioService.getSettings);
}

/**
 * Garante que uma faixa esteja tocando enquanto a tela estiver montada.
 * Passe `null` para parar a música nesta tela.
 */
export function useBackgroundMusic(track: MusicTrackType | null) {
  useEffect(() => {
    if (track) {
      audioService.playBackgroundMusic(track);
    } else {
      audioService.stopBackgroundMusic();
    }
  }, [track]);
}

/**
 * Toca um efeito uma vez quando a tela é montada.
 * `delayMs` ajuda a não sobrepor com o som da tela anterior.
 */
export function useSoundEffectOnMount(
  effect: SoundEffectType | null,
  delayMs = 0,
) {
  useEffect(() => {
    if (!effect) {
      return;
    }
    if (delayMs <= 0) {
      audioService.playSoundEffect(effect);
      return;
    }
    const timer = setTimeout(
      () => audioService.playSoundEffect(effect),
      delayMs,
    );
    return () => clearTimeout(timer);
  }, [effect, delayMs]);
}

export interface SoundPressProps {
  onPressIn: () => void;
  onPress: () => void;
}

/**
 * Props de toque com som. O efeito toca no onPressIn (quando o dedo ENCOSTA),
 * não no onPress (quando solta) — isso reduz bastante o atraso percebido.
 * Ex.: <TouchableOpacity {...withSound(handlePlay)} />
 *      <TouchableOpacity {...withSound(() => acusar(s), 'accusation')} />
 */
export function useSoundHandler() {
  return useCallback(
    (
      handler: () => void,
      effect: SoundEffectType = 'button_click',
    ): SoundPressProps => ({
      onPressIn: () => audioService.playSoundEffect(effect),
      onPress: handler,
    }),
    [],
  );
}
