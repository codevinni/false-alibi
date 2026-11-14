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

export default function BriefingScreen({
  navigation: navProp,
  route: routeProp,
}: ScreenProps<'BriefingScreen'>) {
  const contextNav = useNavigation();
  const contextRoute = useRoute<'BriefingScreen'>();
  const navigation = navProp ?? contextNav;
  const route = routeProp ?? contextRoute;

  const game = route?.params?.game ?? mockGame;
  const crimeCase = route?.params?.crimeCase ?? game.crimeCase ?? mockCrimeCase;

  const handleAdvance = () => {
    navigation.navigate('SuspectsScreen', {
      crimeCase,
      game,
    });
  };

  return (
    <View style={styles.container}>
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
            onPress={handleAdvance}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Avançar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '100%',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
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
