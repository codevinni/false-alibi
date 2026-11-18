import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Speech from '@mhpdev/react-native-speech';

const SAMPLE = 'Eu estava em casa naquela noite. Pergunte a qualquer vizinho.';

type VoiceList = Awaited<ReturnType<typeof Speech.getAvailableVoices>>;

interface SayOptions {
  pitch?: number;
  rate?: number;
  voice?: string;
}

export default function VoiceLab() {
  const [output, setOutput] = useState<string>('');
  const [voices, setVoices] = useState<VoiceList>([]);

  const say = async (options: SayOptions) => {
    try {
      await Speech.stop();
      await Speech.speak(SAMPLE, { language: 'pt-BR', ...options });
    } catch (error) {
      setOutput(`Erro: ${String(error)}`);
    }
  };

  const listEngines = async () => {
    const engines = await Speech.getEngines();
    setOutput(
      engines
        .map(e => `${e.label} (${e.name})${e.isDefault ? ' [padrão]' : ''}`)
        .join('\n'),
    );
  };

  const listVoices = async () => {
    const list = await Speech.getAvailableVoices('pt-BR');
    setVoices(list);
    setOutput(`${list.length} voz(es) pt-BR encontrada(s)`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Laboratório de Voz</Text>

      <TouchableOpacity style={styles.button} onPress={() => say({})}>
        <Text style={styles.buttonText}>Normal</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => say({ pitch: 0.5, rate: 0.6 })}
      >
        <Text style={styles.buttonText}>Extremo grave e lento</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => say({ pitch: 1.8, rate: 1.4 })}
      >
        <Text style={styles.buttonText}>Extremo agudo e rápido</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={listEngines}>
        <Text style={styles.buttonText}>Listar motores de voz</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={listVoices}>
        <Text style={styles.buttonText}>Listar vozes pt-BR</Text>
      </TouchableOpacity>

      {voices.map(voice => (
        <TouchableOpacity
          key={voice.identifier}
          style={styles.button}
          onPress={() => say({ voice: voice.identifier })}
        >
          <Text style={styles.buttonText}>
            {voice.name} | {voice.identifier} | {voice.quality}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.output}>{output}</Text>
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
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  output: {
    fontSize: 14,
    color: '#A5D6A7',
    textAlign: 'center',
  },
});