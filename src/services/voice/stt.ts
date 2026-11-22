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

/** 
 * Códigos do SpeechRecognizer do Android 
 * 6 = tempo esgotado sem fala, 7 = nada reconhecido
 */
const NO_SPEECH_ERROR_CODES = ['6', '7'];

/** 
 * Códigos de erro que podem ser resolvidos reiniciando o serviço de reconhecimento 
 * 11 = o serviço de reconhecimento do Android falhou porque o reconhecedor anterior não foi liberado a tempo
 */
const RETRYABLE_ERROR_CODES = ['11'];
const MAX_RETRIES = 2;

// Pausa entre liberar o reconhecedor antigo e iniciar um novo
const RESTART_DELAY_MS = 300;

interface PendingListen {
  resolve: (text: string) => void;
  reject: (error: Error) => void;
}

let pending: PendingListen | null = null;
let lastPartial = '';
let stopTimer: ReturnType<typeof setTimeout> | null = null;
let handlersBound = false;
let retriesLeft = 0;

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

// Destrói o SpeechRecognizer, encerra a conexão com o serviço do Android, a próxima escuta começa do zero
async function releaseRecognizer() {
  try {
    await Voice.destroy();
  } catch {
  }
}

// Libera o reconhecedor antigo, espera o serviço desconectar e começa a ouvir
async function startRecognizer(current: PendingListen) {
  await releaseRecognizer();
  await delay(RESTART_DELAY_MS);

  // A escuta pode ter sido encerrada (Parar/sair da tela) 
  if (pending !== current) {
    return;
  }

  try {
    await Voice.start(LANGUAGE);
  } catch (error) {
    fail(error instanceof Error ? error : new Error(String(error)));
  }
}

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
  releaseRecognizer();
}

function fail(error: Error) {
  clearStopTimer();
  if (!pending) {
    return;
  }
  const current = pending;
  pending = null;
  current.reject(error);
  releaseRecognizer();
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
    const code = getErrorCode(event);

    // Serviço desconectou antes de ouvir algo: reinicia sem o jogador notar
    if (
      RETRYABLE_ERROR_CODES.includes(code) &&
      pending &&
      !lastPartial &&
      retriesLeft > 0
    ) {
      retriesLeft--;
      startRecognizer(pending);
      return;
    }

    if (NO_SPEECH_ERROR_CODES.includes(code)) {
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
 * Escuta o jogador e devolve a transcrição. 
 * Para sozinho quando a pessoa para de falar
 * Retorna string vazia se nada foi reconhecido
 */
export async function listen(): Promise<string> {
  // Falha se o módulo nativo não está no app instalado
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

  // Encerra qualquer escuta anterior que ainda esteja pendente
  finish('');

  lastPartial = '';
  retriesLeft = MAX_RETRIES;

  return new Promise<string>((resolve, reject) => {
    const current: PendingListen = { resolve, reject };
    pending = current;

    // Se nenhum resultado chegar, encerra a escuta
    setTimeout(() => {
      if (pending === current) {
        stopListening();
      }
    }, LISTEN_TIMEOUT_MS);

    startRecognizer(current);
  });
}

// Interrompe a escuta
export async function stopListening(): Promise<void> {
  try {
    await Voice.stop();
  } catch {
  }

  if (pending && !stopTimer) {
    // Se o resultado final não chegar, devolve o parcial para não travar
    stopTimer = setTimeout(() => finish(lastPartial), STOP_FALLBACK_MS);
  }
}