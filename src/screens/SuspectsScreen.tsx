import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { mockCrimeCase, mockGame } from '../mocks';
import { ScreenProps, useNavigation, useRoute } from '../navigation';
import { Suspect } from '../types';

export default function SuspectsScreen({
  navigation: navProp,
  route: routeProp,
}: ScreenProps<'SuspectsScreen'>) {
  const contextNav = useNavigation();
  const contextRoute = useRoute<'SuspectsScreen'>();
  const navigation = navProp ?? contextNav;
  const route = routeProp ?? contextRoute;

  const [isReviewModalVisible, setIsReviewModalVisible] =
    useState<boolean>(false);

  const game = route?.params?.game ?? mockGame;
  const crimeCase = route?.params?.crimeCase ?? game.crimeCase ?? mockCrimeCase;

  const handleInterrogate = (suspect: Suspect) => {
    navigation.navigate('InterrogationScreen', {
      suspect,
      crimeCase,
      game,
    });
  };

  const handleHistory = (suspect: Suspect) => {
    navigation.navigate('HistoryScreen', {
      suspect,
      crimeCase,
      game,
    });
  };

  const handleAccuse = (suspect: Suspect) => {
    const isCulprit =
      suspect.id === crimeCase.culprit.id || suspect.isGuilty === true;

    navigation.navigate('ResultScreen', {
      result: isCulprit ? 'victory' : 'defeat',
      status: isCulprit ? 'vitoria' : 'derrota',
      accusedSuspect: suspect,
      crimeCase,
      game,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Quadro de Suspeitos</Text>

        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => setIsReviewModalVisible(true)}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Revisar caso</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.suspectsScroll}
        contentContainerStyle={styles.suspectsGrid}
      >
        {crimeCase.suspects.map(suspect => (
          <View key={suspect.id} style={styles.suspectCard}>
            <Text style={styles.suspectName}>{suspect.name}</Text>

            <View style={styles.cardButtonsContainer}>
              <TouchableOpacity
                style={styles.cardButton}
                onPress={() => handleInterrogate(suspect)}
                accessibilityRole="button"
              >
                <Text style={styles.cardButtonText}>Interrogar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardButton}
                onPress={() => handleHistory(suspect)}
                accessibilityRole="button"
              >
                <Text style={styles.cardButtonText}>Histórico</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardButton}
                onPress={() => handleAccuse(suspect)}
                accessibilityRole="button"
              >
                <Text style={styles.cardButtonText}>Acusar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={isReviewModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{crimeCase.title}</Text>

            <ScrollView style={styles.modalDescriptionScroll}>
              <Text style={styles.modalDescription}>
                {crimeCase.description}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsReviewModalVisible(false)}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5F5F5',
  },
  reviewButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suspectsScroll: {
    flex: 1,
    width: '100%',
  },
  suspectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  suspectCard: {
    width: 150,
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
    padding: 12,
    alignItems: 'center',
    gap: 10,
  },
  suspectName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardButtonsContainer: {
    width: '100%',
    gap: 8,
  },
  cardButton: {
    width: '100%',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
  },
  cardButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
    padding: 20,
    alignItems: 'center',
    gap: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5F5F5',
    textAlign: 'center',
  },
  modalDescriptionScroll: {
    width: '100%',
    maxHeight: 160,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#DDDDDD',
    textAlign: 'center',
  },
  modalCloseButton: {
    minWidth: 140,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
  },
});
