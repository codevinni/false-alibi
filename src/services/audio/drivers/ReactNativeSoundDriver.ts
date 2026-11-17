import Sound from 'react-native-sound';
import { AudioDriver, AudioHandle } from './AudioDriver';

/**
 * Driver baseado em react-native-sound (>= 0.13, compatível com a New
 * Architecture). É o ÚNICO arquivo do projeto que importa a biblioteca.
 */
class ReactNativeSoundHandle implements AudioHandle {
  constructor(private readonly sound: Sound) {}

  play(onEnd?: (success: boolean) => void) {
    this.sound.play(success => onEnd?.(success));
  }

  pause() {
    this.sound.pause();
  }

  stop(onStopped?: () => void) {
    this.sound.stop(() => onStopped?.());
  }

  setVolume(volume: number) {
    this.sound.setVolume(volume);
  }

  setLoop(loop: boolean) {
    // -1 = repetir infinitamente; 0 = tocar uma vez
    this.sound.setNumberOfLoops(loop ? -1 : 0);
  }

  release() {
    this.sound.release();
  }
}

export class ReactNativeSoundDriver implements AudioDriver {
  readonly name = 'react-native-sound';

  setup() {
    // iOS: toca mesmo com a chave de silêncio ligada e mistura com outros apps
    Sound.setCategory('Playback', true);
  }

  load(source: number): Promise<AudioHandle> {
    return new Promise((resolve, reject) => {
      const sound: Sound = new Sound(source, (error: unknown) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(new ReactNativeSoundHandle(sound));
      });
    });
  }
}
