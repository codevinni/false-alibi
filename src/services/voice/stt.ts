/* Serviço de reconhecimento de fala (voz para texto) */

import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent,
} from '@react-native-voice/voice';

const LANGUAGE = 'pt-BR';

// Tempo máximo de escuta antes de encerrar sozinho
const LISTEN_TIMEOUT_MS = 20000;

// Tempo de espera pelo resultado final depois de stopListening()
const STOP_FALLBACK_MS = 1500;

// Códigos do SpeechRecognizer do Android que significam "ninguém falou"
// 6 = tempo esgotado sem fala, 7 = nada reconhecido
const NO_SPEECH_ERROR_CODES = ['6', '7'];

interface PendingListen {
  resolve: (text: string) => void;
  reject: (error: Error) => void;
}

let pending: PendingListen | null = null;
let lastPartial = '';
let stopTimer: ReturnType<typeof setTimeout> | null = null;
let handlersBound = false;

function clearStopTimer() {
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
}

function finish(text: string) {
  clearStopTimer();
  if (!pending) {
    return;
  }
  const current = pending;
  pending = null;
  current.resolve(text.trim());
}

function fail(error: Error) {
  clearStopTimer();
  if (!pending) {
    return;
  }
  const current = pending;
  pending = null;
  current.reject(error);
}

function getErrorCode(event: SpeechErrorEvent): string {
  const code = event.error?.code ?? event.error?.message?.split('/')[0];
  return String(code ?? '');
}

function bindHandlers() {
  if (handlersBound) {
    return;
  }
  handlersBound = true;

  Voice.onSpeechPartialResults = (event: SpeechResultsEvent) => {
    lastPartial = event.value?.[0] ?? lastPartial;
  };

  Voice.onSpeechResults = (event: SpeechResultsEvent) => {
    finish(event.value?.[0] ?? lastPartial);
  };

  Voice.onSpeechError = (event: SpeechErrorEvent) => {
    if (NO_SPEECH_ERROR_CODES.includes(getErrorCode(event))) {
      finish(lastPartial);
      return;
    }
    fail(new Error(event.error?.message ?? 'Erro no reconhecimento de voz'));
  };
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
  if (await PermissionsAndroid.check(permission)) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission, {
    title: 'Permissão de microfone',
    message:
      'O False Alibi precisa do microfone para ouvir suas perguntas aos suspeitos.',
    buttonPositive: 'Permitir',
    buttonNegative: 'Negar',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Escuta o jogador e devolve a transcrição. Para sozinho quando a pessoa
 * para de falar. Retorna string vazia se nada foi reconhecido.
 */
export async function listen(): Promise<string> {
    // Falha com mensagem clara se o módulo nativo não está no app instalado
    if (!NativeModules.Voice && !NativeModules.RCTVoice) {
    throw new Error(
      'Módulo nativo de voz não encontrado. Reinstale o app (npm run android).',
    );
  }

  if (!(await requestPermissions())) {
    throw new Error('Permissão de microfone negada');
  }
  if (!(await Voice.isAvailable())) {
    throw new Error('Reconhecimento de voz indisponível neste dispositivo');
  }

  bindHandlers();

  // Encerra qualquer escuta anterior para não dar "recognizer busy"
  finish('');
  try {
    await Voice.cancel();
  } catch {
    // Sem sessão ativa: nada a cancelar
  }

  lastPartial = '';

    return new Promise<string>((resolve, reject) => {
    const current: PendingListen = { resolve, reject };
    pending = current;

    // Se nenhum resultado chegar, encerra a escuta
    setTimeout(() => {
      if (pending === current) {
        stopListening();
      }
    }, LISTEN_TIMEOUT_MS);

    Voice.start(LANGUAGE).catch(error => {
      fail(error instanceof Error ? error : new Error(String(error)));
    });
  });
}

/**
 * Interrompe a escuta. O listen() pendente resolve com o que já foi ouvido.
 */
export async function stopListening(): Promise<void> {
  try {
    await Voice.stop();
  } catch {
    // Sem sessão ativa: nada a parar
  }

  if (pending && !stopTimer) {
    // Se o resultado final não chegar, devolve o parcial para não travar
    stopTimer = setTimeout(() => finish(lastPartial), STOP_FALLBACK_MS);
  }
}