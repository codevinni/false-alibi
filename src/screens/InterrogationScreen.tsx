import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { mockSuspects } from '../mocks';
import { ScreenProps, useNavigation, useRoute } from '../navigation';
import { audioService, useSoundHandler } from '../services/audio';
import { useStaticImage, useSuspectAvatar } from '../services/media';
import { voiceService } from '../services/voice';
import ScreenBackground from '../components/ScreenBackground';
import SuspectAvatar from '../components/SuspectAvatar';
import { Suspect } from '../types';

// recording = o jogador está falando no microfone
// playing = o suspeito está falando
type VoiceStatus = 'idle' | 'recording' | 'playing';

const INITIAL_MESSAGE =
  'Toque em "Falar" para perguntar ou em "Ouvir" para escutar o suspeito.';
const FALLBACK_ANSWER =
  'Eu estava em casa naquela noite. Pergunte a qualquer vizinho.';

// Última mensagem do histórico do suspeito de um tipo (pergunta ou resposta)
function getLastMessage(
  suspect: Suspect,
  type: 'pergunta' | 'resposta',
): string | undefined {
  const messages =
    suspect.interrogationHistory?.messages?.filter(
      message => message.type === type,
    ) ?? [];
  return messages[messages.length - 1]?.content;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function InterrogationScreen({
  navigation: navProp,
  route: routeProp,
}: ScreenProps<'InterrogationScreen'>) {
  const contextNav = useNavigation();
  const contextRoute = useRoute<'InterrogationScreen'>();
  const navigation = navProp ?? contextNav;
  const route = routeProp ?? contextRoute;
  const withSound = useSoundHandler();

  const suspect = route?.params?.suspect ?? mockSuspects[0];
  const avatar = useSuspectAvatar(suspect, route?.params?.crimeCase);
  const background = useStaticImage('interrogation_room');

  // Resposta provisória: quando a IA existir, ela substitui este valor
  const answer = getLastMessage(suspect, 'resposta') ?? FALLBACK_ANSWER;

  const [question, setQuestion] = useState<string>(
    getLastMessage(suspect, 'pergunta') ?? '',
  );
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [statusText, setStatusText] = useState<string>(INITIAL_MESSAGE);
  const [hasError, setHasError] = useState<boolean>(false);

  // Evita atualizar o estado depois que a tela saiu (ex.: voltar ouvindo)
  const isMounted = useRef<boolean>(true);

  // A música de fundo atrapalha o microfone e a voz do suspeito: ela é
  // pausada enquanto alguém fala e volta ao terminar (ou ao sair da tela).
  const musicPausedForVoice = useRef<boolean>(false);

  const pauseMusicForVoice = () => {
    if (audioService.getSettings().muted) {
      return;
    }
    audioService.pauseBackgroundMusic();
    musicPausedForVoice.current = true;
  };

  const resumeMusicAfterVoice = () => {
    if (musicPausedForVoice.current) {
      musicPausedForVoice.current = false;
      audioService.resumeBackgroundMusic();
    }
  };

  const stopVoice = () => {
    voiceService.stopSpeaking().catch(() => {});
    voiceService.stopListening().catch(() => {});
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopVoice();
      resumeMusicAfterVoice();
    };
  }, []);

  const showInfo = (text: string) => {
    setHasError(false);
    setStatusText(text);
  };

  const showError = (error: unknown) => {
    setHasError(true);
    setStatusText(`Erro: ${getErrorMessage(error)}`);
  };

  // FALAR: o jogador fala no microfone e a transcrição vira a pergunta
  const handleSpeak = async () => {
    if (status === 'recording') {
      await voiceService.stopListening();
      return;
    }
    if (status !== 'idle') {
      return;
    }

    setStatus('recording');
    showInfo('Ouvindo você... fale agora.');
    pauseMusicForVoice();

    try {
      const text = await voiceService.listen();
      if (!isMounted.current) {
        return;
      }
      if (text) {
        setQuestion(text);
        showInfo('Pergunta registrada. Toque em "Ouvir" para escutar.');
      } else {
        showInfo('Não consegui ouvir nada. Tente de novo.');
      }
    } catch (error) {
      if (isMounted.current) {
        showError(error);
      }
    } finally {
      resumeMusicAfterVoice();
      if (isMounted.current) {
        setStatus('idle');
      }
    }
  };

  // OUVIR: o jogador escuta o suspeito, com a voz calibrada pelo perfil dele
  const handleListen = async () => {
    if (status === 'playing') {
      await voiceService.stopSpeaking();
      return;
    }
    if (status !== 'idle') {
      return;
    }

    setStatus('playing');
    showInfo(`${suspect.name} está falando...`);
    pauseMusicForVoice();

    try {
      await voiceService.speak(answer, {
        gender: suspect.gender,
        personality: suspect.personality,
        age: suspect.age,
      });
      if (isMounted.current) {
        showInfo('Resposta concluída.');
      }
    } catch (error) {
      if (isMounted.current) {
        showError(error);
      }
    } finally {
      resumeMusicAfterVoice();
      if (isMounted.current) {
        setStatus('idle');
      }
    }
  };

  const handleGoBack = () => {
    stopVoice();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('SuspectsScreen');
    }
  };

  const isRecording = status === 'recording';
  const isPlaying = status === 'playing';

  return (
    <ScreenBackground
      source={background}
      overlayOpacity={0.1}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.infoScroll}
          contentContainerStyle={styles.infoContent}
        >
          <Text style={styles.title}>Sala de Interrogatório</Text>

          <View style={styles.suspectRow}>
            <SuspectAvatar source={avatar} name={suspect.name} size={72} />
            <View style={styles.suspectBox}>
              <Text style={styles.suspectLabel}>Suspeito em interrogatório:</Text>
              <Text style={styles.suspectName}>{suspect.name}</Text>
            </View>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageLabel}>PERGUNTA:</Text>
            <Text style={styles.messageText}>
              {question || 'Nenhuma pergunta ainda.'}
            </Text>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageLabel}>RESPOSTA:</Text>
            <Text style={styles.messageText}>{answer}</Text>
          </View>

          <Text
            style={[styles.statusText, hasError && styles.statusTextError]}
            accessibilityLiveRegion="polite"
          >
            {statusText}
          </Text>
        </ScrollView>

        <View style={styles.actionsColumn}>
          <TouchableOpacity
            style={[styles.button, isRecording && styles.buttonDisabled]}
            {...withSound(handleListen)}
            disabled={isRecording}
            accessibilityRole="button"
            accessibilityState={{ disabled: isRecording }}
          >
            <Text style={styles.buttonText}>
              {isPlaying ? 'Parar de ouvir' : 'Ouvir'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isPlaying && styles.buttonDisabled]}
            {...withSound(handleSpeak)}
            disabled={isPlaying}
            accessibilityRole="button"
            accessibilityState={{ disabled: isPlaying }}
          >
            <Text style={styles.buttonText}>
              {isRecording ? 'Parar de falar' : 'Falar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            {...withSound(handleGoBack)}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 16,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '100%',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    // translúcido para a sala de interrogatório aparecer atrás
    backgroundColor: 'rgba(20, 20, 20, 0.86)',
    padding: 16,
    gap: 20,
  },
  infoScroll: {
    flex: 1,
  },
  infoContent: {
    alignItems: 'center',
    gap: 10,
  },
  actionsColumn: {
    width: 200,
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5F5F5',
    textAlign: 'center',
  },
  suspectRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  suspectBox: {
    flexShrink: 1,
    alignItems: 'flex-start',
    gap: 2,
  },
  suspectLabel: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  suspectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messageBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 4,
    backgroundColor: 'rgba(34, 34, 34, 0.9)',
    padding: 10,
    gap: 4,
  },
  messageLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#CCCCCC',
  },
  statusText: {
    fontSize: 13,
    color: '#A5D6A7',
    textAlign: 'center',
  },
  statusTextError: {
    color: '#EF9A9A',
  },
  button: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});