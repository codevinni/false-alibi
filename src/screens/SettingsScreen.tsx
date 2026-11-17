import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AudioSettingsPanel from '../components/AudioSettingsPanel';
import { ScreenProps, useNavigation } from '../navigation';
import { audioService } from '../services/audio';

// Limitação atual: Como o projeto não possui biblioteca de armazenamento persistente instalada
// (ex.: AsyncStorage ou MMKV), a chave de API é mantida apenas em estado local / memória durante a execução.
let sessionApiKey = '';

export default function SettingsScreen({
  navigation: navProp,
}: ScreenProps<'SettingsScreen'>) {
  const contextNav = useNavigation();
  const navigation = navProp ?? contextNav;

  const [apiKey, setApiKey] = useState<string>(sessionApiKey);
  const [savedMessage, setSavedMessage] = useState<string>('');

  const handleSaveApiKey = () => {
    audioService.playSoundEffect('button_click');
    const trimmedKey = apiKey.trim();
    sessionApiKey = trimmedKey;
    setApiKey(trimmedKey);
    setSavedMessage(
      trimmedKey
        ? 'Chave de API salva em estado local (memória da sessão).'
        : 'Chave de API removida do estado local.',
    );
  };

  const handleGoBack = () => {
    audioService.playSoundEffect('button_click');
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeScreen');
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Chave de API</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={text => {
            setApiKey(text);
            if (savedMessage) {
              setSavedMessage('');
            }
          }}
          placeholder="Insira sua chave de API"
          placeholderTextColor="#888888"
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {savedMessage ? (
          <Text style={styles.feedbackText}>{savedMessage}</Text>
        ) : (
          <Text style={styles.infoText}>
            Nota: Sem armazenamento persistente instalado; o valor é mantido em
            estado local.
          </Text>
        )}

        <View style={styles.divider} />
        <AudioSettingsPanel />

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGoBack}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSaveApiKey}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 24,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F5F5F5',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    backgroundColor: '#1E1E1E',
    fontSize: 15,
  },
  infoText: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  feedbackText: {
    fontSize: 13,
    color: '#A5D6A7',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 4,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
