import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { mockCrimeCase, mockGameDefeat, mockGameVictory } from '../mocks';
import { ScreenProps, useNavigation, useRoute } from '../navigation';

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

  const fallbackGame = isVictory ? mockGameVictory : mockGameDefeat;
  const crimeCase =
    route?.params?.crimeCase ?? fallbackGame.crimeCase ?? mockCrimeCase;
  const accusedSuspect = route?.params?.accusedSuspect;

  const resultBadgeText = isVictory ? 'VITÓRIA' : 'DERROTA';
  const feedbackMessage = isVictory
    ? 'Parabéns, detetive! O caso foi solucionado com sucesso.'
    : 'Investigação encerrada em derrota. O verdadeiro culpado escapou.';

  const handleReturnToHome = () => {
    navigation.reset('HomeScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Text
          style={[
            styles.resultBadge,
            isVictory ? styles.victoryText : styles.defeatText,
          ]}
        >
          {resultBadgeText}
        </Text>

        <Text style={styles.feedbackText}>{feedbackMessage}</Text>

        {accusedSuspect && (
          <Text style={styles.accusedText}>
            Suspeito acusado: {accusedSuspect.name}
          </Text>
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
            onPress={handleReturnToHome}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Voltar ao início</Text>
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
    padding: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '100%',
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  resultBadge: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  victoryText: {
    color: '#A5D6A7',
  },
  defeatText: {
    color: '#EF9A9A',
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F5F5F5',
    textAlign: 'center',
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
