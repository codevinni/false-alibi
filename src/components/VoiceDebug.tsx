import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { mockSuspects } from '../mocks';
import { voiceService } from '../services/voice';
import { Suspect } from '../types';

// Usa a última resposta do histórico; se não houver, um texto padrão
function getSampleText(suspect: Suspect): string {
  const answers = suspect.interrogationHistory.messages.filter(
    message => message.type === 'resposta',
  );
  return (
    answers[answers.length - 1]?.content ??
    'Eu estava em casa naquela noite. Pergunte a qualquer vizinho.'
  );
}

export default function VoiceDebug() {
  const [status, setStatus] = useState<string>('Pronto');
  const [transcript, setTranscript] = useState<string>('');

  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
      voiceService.stopListening();
    };
  }, []);

  const run = async (label: string, action: () => Promise<void>) => {
    setStatus(label);
    try {
      await action();
      setStatus('Pronto');
    } catch (error) {
      setStatus(
        `Erro: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const handleSpeak = (suspect: Suspect) =>
    run(`Falando: ${suspect.name}`, () =>
      voiceService.speak(getSampleText(suspect), {
        gender: suspect.gender,
        personality: suspect.personality,
        age: suspect.age,
      }),
    );

  const handleListen = () =>
    run('Ouvindo... fale agora', async () => {
      const text = await voiceService.listen();
      setTranscript(text || '(nada reconhecido)');
    });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Teste de Voz</Text>
      <Text style={styles.status}>{status}</Text>

      {mockSuspects.map(suspect => (
        <TouchableOpacity
          key={suspect.id}
          style={styles.button}
          onPress={() => handleSpeak(suspect)}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {suspect.name} ({suspect.personality}, {suspect.age})
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={handleListen}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Ouvir</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => run('Parando...', () => voiceService.stopListening())}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Parar de ouvir</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => run('Parando...', () => voiceService.stopSpeaking())}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Parar de falar</Text>
      </TouchableOpacity>

      <View>
        <Text style={styles.transcript}>{transcript}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5F5F5',
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#A5D6A7',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  transcript: {
    fontSize: 15,
    color: '#DDDDDD',
    textAlign: 'center',
    marginTop: 8,
  },
});