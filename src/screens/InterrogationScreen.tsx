import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mockSuspects } from '../mocks';
import { useSoundHandler } from '../services/audio';
import { useStaticImage, useSuspectAvatar } from '../services/media';
import ScreenBackground from '../components/ScreenBackground';
import SuspectAvatar from '../components/SuspectAvatar';
import { ScreenProps, useNavigation, useRoute } from '../navigation';

export default function InterrogationScreen({
  navigation: navProp,
  route: routeProp,
}: ScreenProps<'InterrogationScreen'>) {
  const contextNav = useNavigation();
  const contextRoute = useRoute<'InterrogationScreen'>();
  const navigation = navProp ?? contextNav;
  const withSound = useSoundHandler();
  const route = routeProp ?? contextRoute;

  const suspect = route?.params?.suspect ?? mockSuspects[0];
  const avatar = useSuspectAvatar(suspect, route?.params?.crimeCase);
  const background = useStaticImage('interrogation_room');

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('SuspectsScreen');
    }
  };

  return (
    <ScreenBackground
      source={background}
      overlayOpacity={0.1}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Sala de Interrogatório</Text>

        <View style={styles.suspectBox}>
          <SuspectAvatar source={avatar} name={suspect.name} size={130} />
          <Text style={styles.suspectLabel}>Suspeito em interrogatório:</Text>
          <Text style={styles.suspectName}>{suspect.name}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={withSound(handleGoBack)}
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
    // painel à esquerda (sobre o espelho da sala); mesa e luz ficam à vista
    alignItems: 'flex-start',
    backgroundColor: '#121212',
    padding: 20,
    paddingLeft: 40,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    backgroundColor: 'rgba(26, 26, 26, 0.88)',
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5F5F5',
    textAlign: 'center',
  },
  suspectBox: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  suspectLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  suspectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 220,
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
