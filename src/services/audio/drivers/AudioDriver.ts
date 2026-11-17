/**
 * Contrato entre o AudioService e a biblioteca nativa de áudio.
 *
 * O AudioService só conversa com esta interface. Para trocar de biblioteca
 * (react-native-sound, react-native-track-player, expo-audio...) basta
 * escrever outro driver que implemente AudioDriver — nada mais muda.
 */

export interface AudioHandle {
  // onEnd é chamado quando o som termina (não dispara em loop infinito)
  play: (onEnd?: (success: boolean) => void) => void;
  pause: () => void;
  // Para e volta ao início. onStopped é chamado quando a parada concluir.
  stop: (onStopped?: () => void) => void;
  setVolume: (volume: number) => void;
  setLoop: (loop: boolean) => void;
  release: () => void;
  // true entre play() e o fim/parada do som (controle local, síncrono)
  isPlaying: () => boolean;
}

export interface AudioDriver {
  // Nome para logs
  readonly name: string;
  // Preparações globais (categoria de áudio no iOS etc.)
  setup: () => void;
  // Carrega um arquivo empacotado via require()
  load: (source: number) => Promise<AudioHandle>;
}
