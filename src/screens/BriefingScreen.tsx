import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { mockCrimeCase, mockGame } from '../mocks';
import { ScreenProps, useNavigation, useRoute } from '../navigation';
import {
  useBackgroundMusic,
  useSoundEffectOnMount,
  useSoundHandler,
} from '../services/audio';
import { useCrimeSceneImage } from '../services/media';
import ScreenBackground from '../components/ScreenBackground';

export default function BriefingScreen({
  navigation: navProp,
  route: routeProp,
}: ScreenProps<'BriefingScreen'>) {
  const contextNav = useNavigation();
  const contextRoute = useRoute<'BriefingScreen'>();
  const navigation = navProp ?? contextNav;
  const route = routeProp ?? contextRoute;
  const withSound = useSoundHandler();

  const game = route?.params?.game ?? mockGame;
  const crimeCase = route?.params?.crimeCase ?? game.crimeCase ?? mockCrimeCase;

  useBackgroundMusic('investigation');
  useSoundEffectOnMount('new_case');
  const sceneImage = useCrimeSceneImage(crimeCase);

  const handleAdvance = () => {
    navigation.navigate('SuspectsScreen', {
      crimeCase,
      game,
    });
  };

  return (
    <ScreenBackground
      source={sceneImage}
      overlayOpacity={0.25}
      style={styles.container}
    >
      <View style={styles.cardContainer}>
        <Text style={styles.title}>{crimeCase.title}</Text>

        <ScrollView
          style={styles.descriptionScroll}
          contentContainerStyle={styles.descriptionContent}
        >
          <Text style={styles.description}>{crimeCase.description}</Text>
        </ScrollView>

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.button}
            {...withSound(handleAdvance)}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Avançar</Text>
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
    // card à direita para a cena do crime continuar visível
    alignItems: 'flex-end',
    backgroundColor: '#121212',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '100%',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    padding: 20,
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5F5F5',
    textAlign: 'center',
  },
  descriptionScroll: {
    width: '100%',
    maxHeight: 160,
  },
  descriptionContent: {
    paddingVertical: 4,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#DDDDDD',
    textAlign: 'center',
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  button: {
    minWidth: 180,
    paddingVertical: 10,
    paddingHorizontal: 24,
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
