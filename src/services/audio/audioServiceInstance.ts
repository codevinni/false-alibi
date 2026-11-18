import { AudioService } from './AudioService';
import { AudioDriver } from './drivers/AudioDriver';
import { SilentAudioDriver } from './drivers/SilentAudioDriver';

/**
 * Escolhe o driver de áudio. Se o módulo nativo não estiver disponível
 * (lib não instalada/linkada, ou ambiente de teste), cai para o driver
 * silencioso e o jogo segue funcionando sem som.
 */
function createDefaultDriver(): AudioDriver {
  try {
    const {
      ReactNativeSoundDriver,
    } = require('./drivers/ReactNativeSoundDriver');
    return new ReactNativeSoundDriver();
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[AudioService] react-native-sound indisponível; usando driver mudo.',
        error,
      );
    }
    return new SilentAudioDriver();
  }
}

// Instância única usada em todo o app
export const audioService = new AudioService(createDefaultDriver());
