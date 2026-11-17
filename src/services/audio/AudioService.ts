import { AppState, AppStateStatus } from 'react-native';
import {
  AudioSettings,
  AudioSettingsListener,
  IAudioService,
  MusicTrackType,
  SoundEffectType,
} from '../../types/audio.services.types';
import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_MUSIC_TRACK,
  SFX_COOLDOWN_MS,
} from './audio.config';
import { AudioDriver, AudioHandle } from './drivers/AudioDriver';
import { MUSIC_TRACKS, SOUND_EFFECTS, SoundAsset } from './soundAssets';

type MusicState = 'stopped' | 'playing' | 'paused';

const clamp01 = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
};

const warn = (...args: unknown[]) => {
  if (__DEV__) {
    console.warn('[AudioService]', ...args);
  }
};

/**
 * Gerencia música de fundo, efeitos sonoros e configurações de volume/mute.
 *
 * Volume efetivo de cada som = master × canal (música ou efeitos) × volume
 * do próprio arquivo (definido em soundAssets.ts). Com mute ligado, tudo vai
 * a 0 — a música continua "rodando" em silêncio, então ao desligar o mute ela
 * volta exatamente de onde estava.
 */
export class AudioService implements IAudioService {
  private settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };
  private readonly listeners = new Set<AudioSettingsListener>();

  // Cache de sons carregados (chave: 'sfx:nome' ou 'music:nome')
  private readonly handles = new Map<string, Promise<AudioHandle | null>>();
  private readonly lastPlayedAt = new Map<SoundEffectType, number>();
  private initPromise: Promise<void> | null = null;

  private currentTrack: MusicTrackType | null = null;
  private musicState: MusicState = 'stopped';
  private pausedBySystem = false;

  constructor(
    private readonly driver: AudioDriver,
    private readonly sfxAssets: Record<
      SoundEffectType,
      SoundAsset
    > = SOUND_EFFECTS,
    private readonly musicAssets: Record<
      MusicTrackType,
      SoundAsset
    > = MUSIC_TRACKS,
  ) {}

  // ------------------------------------------------------------ ciclo de vida

  init = (): Promise<void> => {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          this.driver.setup();
        } catch (error) {
          warn(`falha no setup do driver "${this.driver.name}"`, error);
        }
        // Pré-carrega os efeitos (são curtos) para não haver atraso no 1º toque.
        // As músicas são carregadas sob demanda.
        const effects = Object.keys(this.sfxAssets) as SoundEffectType[];
        await Promise.all(effects.map(effect => this.getSfxHandle(effect)));
      })();
    }
    return this.initPromise;
  };

  release = (): void => {
    this.handles.forEach(promise => {
      promise.then(handle => handle?.release());
    });
    this.handles.clear();
    this.lastPlayedAt.clear();
    this.initPromise = null;
    this.currentTrack = null;
    this.musicState = 'stopped';
    this.pausedBySystem = false;
  };

  /**
   * Pausa a música quando o app vai para segundo plano e retoma ao voltar.
   * Retorna a função que remove o listener.
   */
  attachAppStateHandling = (): (() => void) => {
    const subscription = AppState.addEventListener(
      'change',
      (status: AppStateStatus) => {
        if (status === 'active') {
          if (this.pausedBySystem) {
            this.pausedBySystem = false;
            this.resumeBackgroundMusic();
          }
        } else if (this.musicState === 'playing') {
          this.pausedBySystem = true;
          this.pauseBackgroundMusic();
        }
      },
    );
    return () => subscription.remove();
  };

  // ---------------------------------------------------------- efeitos sonoros

  playSoundEffect = (effect: SoundEffectType): void => {
    const asset = this.sfxAssets[effect];
    if (!asset) {
      warn(`efeito "${effect}" não registrado em soundAssets.ts`);
      return;
    }

    const volume = this.effectiveVolume('sfx', asset);
    if (volume === 0) {
      return; // mudo: nem toca
    }

    const now = Date.now();
    const last = this.lastPlayedAt.get(effect) ?? 0;
    if (now - last < SFX_COOLDOWN_MS) {
      return;
    }
    this.lastPlayedAt.set(effect, now);

    this.getSfxHandle(effect).then(handle => {
      if (!handle) {
        return;
      }
      // stop() antes de play() faz o efeito reiniciar se ainda estiver tocando
      handle.stop(() => {
        handle.setVolume(volume);
        handle.play();
      });
    });
  };

  // --------------------------------------------------------- música de fundo

  playBackgroundMusic = (
    track: MusicTrackType = DEFAULT_MUSIC_TRACK,
  ): void => {
    if (this.currentTrack === track && this.musicState === 'playing') {
      return; // já está tocando essa faixa
    }

    if (this.currentTrack && this.currentTrack !== track) {
      this.stopTrack(this.currentTrack);
    }

    this.currentTrack = track;
    this.musicState = 'playing';
    this.pausedBySystem = false;

    this.getMusicHandle(track).then(handle => {
      // A faixa pode ter sido trocada/parada enquanto carregava
      if (
        !handle ||
        this.currentTrack !== track ||
        this.musicState !== 'playing'
      ) {
        return;
      }
      handle.setLoop(true);
      handle.setVolume(this.effectiveVolume('music', this.musicAssets[track]));
      handle.play();
    });
  };

  stopBackgroundMusic = (): void => {
    if (this.currentTrack) {
      this.stopTrack(this.currentTrack);
    }
    this.currentTrack = null;
    this.musicState = 'stopped';
    this.pausedBySystem = false;
  };

  pauseBackgroundMusic = (): void => {
    if (!this.currentTrack || this.musicState !== 'playing') {
      return;
    }
    this.musicState = 'paused';
    this.peekHandle(`music:${this.currentTrack}`)?.then(handle =>
      handle?.pause(),
    );
  };

  resumeBackgroundMusic = (): void => {
    if (this.currentTrack && this.musicState === 'paused') {
      this.playBackgroundMusic(this.currentTrack);
    }
  };

  // ----------------------------------------------------------- configurações

  setMasterVolume = (volume: number): void => {
    this.updateSettings({ masterVolume: clamp01(volume) });
  };

  setBackgroundMusicVolume = (volume: number): void => {
    this.updateSettings({ musicVolume: clamp01(volume) });
  };

  setSoundEffectVolume = (volume: number): void => {
    this.updateSettings({ sfxVolume: clamp01(volume) });
  };

  setMuted = (muted: boolean): void => {
    this.updateSettings({ muted });
  };

  toggleMute = (): void => {
    this.setMuted(!this.settings.muted);
  };

  getSettings = (): AudioSettings => this.settings;

  getCurrentTrack = (): MusicTrackType | null => this.currentTrack;

  subscribe = (listener: AudioSettingsListener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // ---------------------------------------------------------------- internos

  private updateSettings(partial: Partial<AudioSettings>) {
    // Objeto novo a cada mudança (necessário para useSyncExternalStore)
    this.settings = { ...this.settings, ...partial };
    this.applyMusicVolume();
    this.listeners.forEach(listener => listener(this.settings));
  }

  private applyMusicVolume() {
    const track = this.currentTrack;
    if (!track) {
      return;
    }
    const volume = this.effectiveVolume('music', this.musicAssets[track]);
    this.peekHandle(`music:${track}`)?.then(handle =>
      handle?.setVolume(volume),
    );
  }

  private effectiveVolume(
    channel: 'music' | 'sfx',
    asset?: SoundAsset,
  ): number {
    const { muted, masterVolume, musicVolume, sfxVolume } = this.settings;
    if (muted) {
      return 0;
    }
    const channelVolume = channel === 'music' ? musicVolume : sfxVolume;
    return clamp01(masterVolume * channelVolume * (asset?.volume ?? 1));
  }

  private stopTrack(track: MusicTrackType) {
    this.peekHandle(`music:${track}`)?.then(handle => handle?.stop());
  }

  private getSfxHandle(effect: SoundEffectType) {
    return this.loadHandle(`sfx:${effect}`, this.sfxAssets[effect]);
  }

  private getMusicHandle(track: MusicTrackType) {
    const asset = this.musicAssets[track];
    if (!asset) {
      warn(`faixa "${track}" não registrada em soundAssets.ts`);
      return Promise.resolve(null);
    }
    return this.loadHandle(`music:${track}`, asset);
  }

  // Retorna o som do cache sem disparar carregamento
  private peekHandle(key: string) {
    return this.handles.get(key);
  }

  private loadHandle(
    key: string,
    asset: SoundAsset,
  ): Promise<AudioHandle | null> {
    const cached = this.handles.get(key);
    if (cached) {
      return cached;
    }
    const promise = this.driver.load(asset.source).catch(error => {
      warn(`não foi possível carregar "${key}"`, error);
      this.handles.delete(key); // permite tentar de novo depois
      return null;
    });
    this.handles.set(key, promise);
    return promise;
  }
}
