import { Image } from 'react-native';
import Sound from 'react-native-sound';
import { AudioDriver, AudioHandle } from './AudioDriver';

/**
 * Driver baseado em react-native-sound (>= 0.13, compatível com a New
 * Architecture). É o ÚNICO arquivo do projeto que importa a biblioteca.
 */
class ReactNativeSoundHandle implements AudioHandle {
  // Estado local para evitar idas e vindas ao lado nativo (cada chamada
  // custa alguns milissegundos e soma no atraso do clique).
  private playing = false;
  private volume = -1;

  constructor(private readonly sound: Sound) {}

  play(onEnd?: (success: boolean) => void) {
    this.playing = true;
    this.sound.play(success => {
      this.playing = false;
      onEnd?.(success);
    });
  }

  pause() {
    this.playing = false;
    this.sound.pause();
  }

  stop(onStopped?: () => void) {
    this.playing = false;
    this.sound.stop(() => onStopped?.());
  }

  setVolume(volume: number) {
    if (volume === this.volume) {
      return; // já está nesse volume: não chama o nativo
    }
    this.volume = volume;
    this.sound.setVolume(volume);
  }

  isPlaying() {
    return this.playing;
  }

  setLoop(loop: boolean) {
    // -1 = repetir infinitamente; 0 = tocar uma vez
    this.sound.setNumberOfLoops(loop ? -1 : 0);
  }

  release() {
    this.sound.release();
  }
}

/**
 * A react-native-sound 0.13 só aceita o caminho do arquivo como TEXTO
 * (o construtor chama filename.startsWith). O require() do Metro devolve um
 * número, então convertemos com Image.resolveAssetSource:
 *   - em desenvolvimento: URL http do Metro (o Android toca por streaming)
 *   - no APK de release (Android): nome do recurso em res/raw,
 *     ex.: "src_assets_sounds_button_click"
 *   - no iOS em release: file:// dentro do bundle do app
 */
function toSoundPath(source: number): string | null {
  const resolved = Image.resolveAssetSource(source);
  return resolved?.uri ?? null;
}

export class ReactNativeSoundDriver implements AudioDriver {
  readonly name = 'react-native-sound';

  setup() {
    // iOS: toca mesmo com a chave de silêncio ligada e mistura com outros apps
    Sound.setCategory('Playback', true);
  }

  load(source: number): Promise<AudioHandle> {
    return new Promise((resolve, reject) => {
      const path = toSoundPath(source);
      if (!path) {
        reject(new Error(`asset de áudio inválido: ${String(source)}`));
        return;
      }
      // basePath '' (e não o callback) de propósito: se o 2º argumento for
      // uma função, a lib 0.13 monta o caminho errado para arquivos locais.
      const sound: Sound = new Sound(path, '', (error: unknown) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(new ReactNativeSoundHandle(sound));
      });
    });
  }
}
