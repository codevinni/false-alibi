import React from 'react';
import {
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
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
  const background = useStaticImage('home_background');
  const detective = useStaticImage('detective');

  // Tamanho do detetive calculado pela altura da tela (imagem é 2:3).
  // Largura E altura precisam ser explícitas; senão o Image usa o tamanho
  // original do arquivo (800×1200) e toma metade da tela.
  const { height: screenHeight } = useWindowDimensions();
  const detectiveHeight = Math.round(screenHeight * 0.92);
  const detectiveSize = {
    height: detectiveHeight,
    width: Math.round((detectiveHeight * 2) / 3),
  };

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
      overlayOpacity={0.15}
      style={styles.container}
    >
      <View style={styles.menuArea}>
        <View style={styles.headerContainer}>
          <Text style={styles.logoTitle}>FALSE Alibi</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={withSound(handlePlay)}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Jogar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={withSound(handleSettings)}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={withSound(handleExit)}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Image
        source={detective}
        style={detectiveSize}
        resizeMode="contain"
        accessibilityIgnoresInvertColors={true}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#121212',
    // deixa visível o quadro de investigação do lado esquerdo do fundo
    paddingLeft: '34%',
  },
  menuArea: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F5F5F5',
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowRadius: 8,
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
