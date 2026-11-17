import { AudioDriver, AudioHandle } from './AudioDriver';

/**
 * Driver que não emite som. Usado em testes (Jest) e como fallback quando o
 * módulo nativo não está disponível — o jogo continua funcionando, só mudo.
 */
class SilentHandle implements AudioHandle {
  play(onEnd?: (success: boolean) => void) {
    onEnd?.(true);
  }
  pause() {}
  stop(onStopped?: () => void) {
    onStopped?.();
  }
  setVolume() {}
  setLoop() {}
  release() {}
  isPlaying() {
    return false;
  }
}

export class SilentAudioDriver implements AudioDriver {
  readonly name = 'silent';

  setup() {}

  load(): Promise<AudioHandle> {
    return Promise.resolve(new SilentHandle());
  }
}
