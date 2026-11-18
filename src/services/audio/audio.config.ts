import {
  AudioSettings,
  MusicTrackType,
} from '../../types/audio.services.types';

// Valores iniciais ao abrir o app
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 1,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
};

// Faixa tocada por playBackgroundMusic() sem argumento
export const DEFAULT_MUSIC_TRACK: MusicTrackType = 'main_theme';

// Passo dos botões de volume (+ / -) na tela de configurações
export const VOLUME_STEP = 0.1;

// Intervalo mínimo entre duas execuções do MESMO efeito (evita "metralhadora"
// de cliques quando o usuário toca várias vezes seguidas)
export const SFX_COOLDOWN_MS = 60;
