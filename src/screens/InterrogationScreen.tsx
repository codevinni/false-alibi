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
import { getMessageEmotionalState, voiceService } from '../services/voice';
import { Message } from '../types/interrogation.types';
import ScreenBackground from '../components/ScreenBackground';
import SuspectAvatar from '../components/SuspectAvatar';

/**
 * Status da voz
 * idle = parado, ninguém está falando
 * recording = jogador falando 
 * playing = suspeito falando
 */
type VoiceStatus = 'idle' | 'recording' | 'playing';

// Aviso de erro
type Notice = { text: string; isError: boolean } | null;

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
  
  // Exibe a conversa na tela, novas conversas são inseridas no fim da lista
  const [messages, setMessages] = useState<Message[]>(
    () => suspect.interrogationHistory?.messages ?? [],
  );

  // "Ouvir" reproduz a última resposta do suspeito
  const answerIndex = messages.map(m => m.type).lastIndexOf('resposta');
  const answer = answerIndex >= 0 ? messages[answerIndex] : undefined;

  // Reserva uma voz distinta para cada suspeito do caso
  const caseSuspects = route?.params?.crimeCase?.suspects ?? mockSuspects;
  useEffect(() => {
    voiceService.prepareVoices(caseSuspects).catch(() => {});
  }, [caseSuspects]);

  // Rola até a mensagem mais recente
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [notice, setNotice] = useState<Notice>(null);

  // Pausa a música de fundo para ouvir ou falar e volta ao terminar 
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

  // Pausa o áudio ou a gravação e retoma a música
  useEffect(() => {
    return () => {
      stopVoice();
      resumeMusicAfterVoice();
    };
  }, []);

  // Transcrição da pergunta para texto
  const handleSpeak = async () => {
    if (status === 'recording') {
      await voiceService.stopListening();
      return;
    }

    setNotice(null);
    setStatus('recording');
    pauseMusicForVoice();

    try {
      const text = await voiceService.listen();
      if (text) {
        setMessages(prev => [...prev, { type: 'pergunta', content: text }]);
      } else {
        setNotice({
          text: 'Não consegui ouvir, tente de novo',
          isError: false,
        });
      }
    } catch (error) {
      setNotice({ text: `Erro: ${String(error)}`, isError: true });
    } finally {
      resumeMusicAfterVoice();
      setStatus('idle');
    }
  };

  // Reproduz a resposta do suspeito
  const handleListen = async () => {
    if (status === 'playing') {
      await voiceService.stopSpeaking();
      return;
    }

    setNotice(null);
    setStatus('playing');
    pauseMusicForVoice();

    try {
      if (!answer) {
        return;
      }
      // Quanto mais perguntas antes da resposta, mais pressionado o suspeito
      const pressure = messages
        .slice(0, answerIndex)
        .filter(m => m.type === 'pergunta').length;

      await voiceService.speak(answer.content, {
        id: suspect.id,
        gender: suspect.gender,
        personality: suspect.personality,
        age: suspect.age,
        emotionalState: getMessageEmotionalState(
          answer,
          suspect.personality,
          pressure,
        ),
      });
    } catch (error) {
      setNotice({ text: `Erro: ${String(error)}`, isError: true });
    } finally {
      resumeMusicAfterVoice();
      setStatus('idle');
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('SuspectsScreen');
    }
  };

  const isRecording = status === 'recording';
  const isPlaying = status === 'playing';

  // Mensagem de status do áudio ou gravação no fim da tela
  let statusText =
    'Toque em "Falar" para perguntar ou em "Ouvir" para escutar o suspeito';
  if (isRecording) {
    statusText = 'Ouvindo você... fale agora';
  } else if (isPlaying) {
    statusText = `${suspect.name} está falando...`;
  } else if (notice) {
    statusText = notice.text;
  }

  return (
    <ScreenBackground
      source={background}
      overlayOpacity={0.1}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <ScrollView
          ref={scrollRef}
          style={styles.infoScroll}
          contentContainerStyle={styles.infoContent}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          <Text style={styles.title}>Sala de Interrogatório</Text>

          <View style={styles.suspectRow}>
            <SuspectAvatar source={avatar} name={suspect.name} size={72} />
            <View style={styles.suspectBox}>
              <Text style={styles.suspectLabel}>
                Suspeito em interrogatório:
              </Text>
              <Text style={styles.suspectName}>{suspect.name}</Text>
            </View>
          </View>

          {messages.length === 0 ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>Nenhuma pergunta ainda.</Text>
            </View>
          ) : (
            messages.map((message, index) => (
              <View key={`${index}-${message.type}`} style={styles.messageBox}>
                <Text style={styles.messageLabel}>
                  {message.type === 'pergunta' ? 'PERGUNTA:' : 'RESPOSTA:'}
                </Text>
                <Text style={styles.messageText}>{message.content}</Text>
              </View>
            ))
          )}

          <Text
            style={[
              styles.statusText,
              !isRecording &&
                !isPlaying &&
                notice?.isError &&
                styles.statusTextError,
            ]}
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
    color: '#AAAAAA',
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