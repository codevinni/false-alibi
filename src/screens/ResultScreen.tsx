import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { mockCrimeCase, mockGameDefeat, mockGameVictory } from '../mocks';
import { ScreenProps, useNavigation, useRoute } from '../navigation';
import {
  useBackgroundMusic,
  useSoundEffectOnMount,
  useSoundHandler,
} from '../services/audio';
import {
  useCrimeSceneImage,
  useStaticImage,
  useSuspectAvatar,
} from '../services/media';
import ScreenBackground from '../components/ScreenBackground';
import SuspectAvatar from '../components/SuspectAvatar';

export default function ResultScreen({
  navigation: navProp,
  route: routeProp,
}: ScreenProps<'ResultScreen'>) {
  const contextNav = useNavigation();
  const contextRoute = useRoute<'ResultScreen'>();
  const navigation = navProp ?? contextNav;
  const route = routeProp ?? contextRoute;

  const resultParam = route?.params?.result;
  const statusParam = route?.params?.status;
  const isVictory = resultParam === 'victory' || statusParam === 'vitoria';
  const withSound = useSoundHandler();

  // Para a música para destacar o efeito de vitória/derrota
  useBackgroundMusic(null);
  // Atraso para não encavalar com o som de acusação da tela anterior
  useSoundEffectOnMount(isVictory ? 'victory' : 'defeat', 700);

  const fallbackGame = isVictory ? mockGameVictory : mockGameDefeat;
  const crimeCase =
    route?.params?.crimeCase ?? fallbackGame.crimeCase ?? mockCrimeCase;
  const accusedSuspect = route?.params?.accusedSuspect;

  const banner = useStaticImage(isVictory ? 'victory_banner' : 'defeat_banner');
  const sceneImage = useCrimeSceneImage(crimeCase);
  const accusedAvatar = useSuspectAvatar(
    accusedSuspect ?? crimeCase.culprit,
    crimeCase,
  );

  const resultBadgeText = isVictory ? 'VITÓRIA' : 'DERROTA';
  const feedbackMessage = isVictory
    ? 'Parabéns, detetive! O caso foi solucionado com sucesso.'
    : 'Investigação encerrada em derrota. O verdadeiro culpado escapou.';

  const handleReturnToHome = () => {
    navigation.reset('HomeScreen');
  };

  return (
    <ScreenBackground
      source={sceneImage}
      overlayOpacity={0.6}
      style={styles.container}
    >
      <View style={styles.cardContainer}>
        <Image
          source={banner}
          style={styles.banner}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel={resultBadgeText}
        />

        <Text style={styles.feedbackText}>{feedbackMessage}</Text>

        {accusedSuspect && (
          <View style={styles.accusedRow}>
            <SuspectAvatar
              source={accusedAvatar}
              name={accusedSuspect.name}
              size={44}
            />
            <Text style={styles.accusedText}>
              Suspeito acusado: {accusedSuspect.name}
            </Text>
          </View>
        )}

        <View style={styles.solutionContainer}>
          <Text style={styles.solutionTitle}>Resumo da Solução:</Text>
          <ScrollView style={styles.solutionScroll}>
            <Text style={styles.solutionText}>{crimeCase.summarySolution}</Text>
          </ScrollView>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={withSound(handleReturnToHome)}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Voltar ao início</Text>
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
  cardContainer: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '100%',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    backgroundColor: 'rgba(26, 26, 26, 0.92)',
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F5F5F5',
    textAlign: 'center',
  },
  // Largura e altura fixas (proporção 3:1 do arquivo 1200×400)
  banner: {
    width: 330,
    height: 110,
  },
  accusedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accusedText: {
    fontSize: 14,
    color: '#BBBBBB',
    textAlign: 'center',
  },
  solutionContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 4,
    backgroundColor: '#222222',
    padding: 12,
    gap: 6,
  },
  solutionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E0E0E0',
    textAlign: 'center',
  },
  solutionScroll: {
    maxHeight: 110,
  },
  solutionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#DDDDDD',
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 240,
    marginTop: 4,
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
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
