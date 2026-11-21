import { IMediaService, SoundEffectType } from './media.services.types';

export type { SoundEffectType };

// Faixas de música de fundo disponíveis
export type MusicTrackType = 'main_theme' | 'investigation';

// Configurações de áudio (todos os volumes vão de 0 a 1)
export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export type AudioSettingsListener = (settings: AudioSettings) => void;

/**
 * Serviço de áudio do jogo.
 * Cobre a parte sonora do IMediaService (mesmas assinaturas) e acrescenta
 * controles de mute, volume geral/efeitos, pausa e troca de faixa.
 */
export interface IAudioService
  extends Pick<
    IMediaService,
    | 'playBackgroundMusic'
    | 'stopBackgroundMusic'
    | 'setBackgroundMusicVolume'
    | 'playSoundEffect'
  > {
  // Pré-carrega os efeitos sonoros. Pode ser chamado mais de uma vez.
  init: () => Promise<void>;

  // Sem argumento toca a faixa padrão ('main_theme').
  // Se a faixa pedida já estiver tocando, não reinicia.
  playBackgroundMusic: (track?: MusicTrackType) => void;
  pauseBackgroundMusic: () => void;
  resumeBackgroundMusic: () => void;

  setMasterVolume: (volume: number) => void;
  setSoundEffectVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;

  getSettings: () => AudioSettings;
  // Retorna a função para cancelar a inscrição
  subscribe: (listener: AudioSettingsListener) => () => void;

  // Libera todos os sons carregados da memória nativa
  release: () => void;
}
