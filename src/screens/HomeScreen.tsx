import React from 'react';
import {
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenProps, useNavigation } from '../navigation';
import { useBackgroundMusic, useSoundHandler } from '../services/audio';
import { useStaticImage } from '../services/media';
import ScreenBackground from '../components/ScreenBackground';

export default function HomeScreen({ navigation: navProp }: ScreenProps<'HomeScreen'>) {
  const contextNav = useNavigation();
  const navigation = navProp ?? contextNav;
  const withSound = useSoundHandler();

  useBackgroundMusic('main_theme');
  // O fundo já traz o detetive (à esquerda) e o quadro de investigação
  // (à direita); o menu fica num painel à direita.
  const background = useStaticImage('home_background');
  const logo = useStaticImage('logo');

  const handlePlay = () => {
    navigation.navigate('BriefingScreen');
  };

  const handleSettings = () => {
    navigation.navigate('SettingsScreen');
  };

  const handleExit = () => {
    BackHandler.exitApp();
  };

  return (
    <ScreenBackground
      source={background}
      overlayOpacity={0.1}
      style={styles.container}
    >
      <View style={styles.menuPanel}>
        <View style={styles.headerContainer}>
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="False Alibi"
          />
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.button}
            {...withSound(handlePlay)}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Jogar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            {...withSound(handleSettings)}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            {...withSound(handleExit)}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // menu à direita, centralizado na vertical; detetive fica visível à esquerda
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#121212',
    paddingRight: '5%',
  },
  menuPanel: {
    width: '34%',
    minWidth: 260,
    maxWidth: 340,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.25)',
    // painel escuro para o menu ficar legível sobre o quadro
    backgroundColor: 'rgba(10, 8, 7, 0.78)',
  },
  headerContainer: {
    marginBottom: 18,
    alignItems: 'center',
  },
  // logo 900x537 (proporção ~1.68:1); largura e altura explícitas
  logo: {
    width: 230,
    height: 138,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    gap: 14,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
