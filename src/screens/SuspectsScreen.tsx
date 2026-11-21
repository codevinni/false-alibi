import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { mockCrimeCase, mockGame } from '../mocks';
import { ScreenProps, useNavigation, useRoute } from '../navigation';
import { useSoundHandler } from '../services/audio';
import { useCaseAvatars, useStaticImage } from '../services/media';
import ScreenBackground from '../components/ScreenBackground';
import SuspectAvatar from '../components/SuspectAvatar';
import { Suspect } from '../types';

// Margem lateral da tela (deve bater com paddingHorizontal do container)
const SCREEN_PADDING_RATIO = 0.07;
const CARD_GAP = 10;
const MIN_CARD_WIDTH = 110;
const MAX_CARD_WIDTH = 150;

export default function SuspectsScreen({
  navigation: navProp,
  route: routeProp,
}: ScreenProps<'SuspectsScreen'>) {
  const contextNav = useNavigation();
  const contextRoute = useRoute<'SuspectsScreen'>();
  const navigation = navProp ?? contextNav;
  const route = routeProp ?? contextRoute;

  const withSound = useSoundHandler();

  const [isReviewModalVisible, setIsReviewModalVisible] =
    useState<boolean>(false);

  const game = route?.params?.game ?? mockGame;
  const crimeCase = route?.params?.crimeCase ?? game.crimeCase ?? mockCrimeCase;
  const getAvatar = useCaseAvatars(crimeCase);
  const background = useStaticImage('suspects_background');

  // Todos os suspeitos numa fileira só: a largura de cada card é dividida
  // pelo espaço disponível (entre as margens de 7% da tela), de 110 a 150.
  // Se não couberem nem com 110, a fileira rola na horizontal.
  const { width: screenWidth } = useWindowDimensions();
  const suspectCount = Math.max(crimeCase.suspects.length, 1);
  const rowWidth = screenWidth * (1 - 2 * SCREEN_PADDING_RATIO);
  const cardWidth = Math.max(
    MIN_CARD_WIDTH,
    Math.min(
      MAX_CARD_WIDTH,
      (rowWidth - CARD_GAP * (suspectCount - 1)) / suspectCount,
    ),
  );
  const avatarSize = Math.round(Math.min(84, cardWidth - 24));

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
    <ScreenBackground
      source={background}
      overlayOpacity={0.1}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Quadro de Suspeitos</Text>

        <TouchableOpacity
          style={styles.reviewButton}
          {...withSound(() => setIsReviewModalVisible(true))}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Revisar caso</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal={true}
        style={styles.suspectsScroll}
        contentContainerStyle={styles.suspectsRow}
        showsHorizontalScrollIndicator={false}
      >
        {crimeCase.suspects.map(suspect => (
          <View
            key={suspect.id}
            style={[styles.suspectCard, { width: cardWidth }]}
          >
            <SuspectAvatar
              source={getAvatar(suspect)}
              name={suspect.name}
              size={avatarSize}
            />
            <Text
              style={styles.suspectName}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {suspect.name}
            </Text>

            <View style={styles.cardButtonsContainer}>
              <TouchableOpacity
                style={styles.cardButton}
                {...withSound(() => handleInterrogate(suspect))}
                accessibilityRole="button"
              >
                <Text style={styles.cardButtonText}>Interrogar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardButton}
                {...withSound(() => handleHistory(suspect))}
                accessibilityRole="button"
              >
                <Text style={styles.cardButtonText}>Histórico</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardButton}
                {...withSound(() => handleAccuse(suspect), 'accusation')}
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
              {...withSound(() => setIsReviewModalVisible(false))}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  // Margens para o conteúdo ficar dentro da moldura do quadro de cortiça
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: '7%',
    paddingTop: '3%',
    paddingBottom: '3%',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    // afasta o título da luminária no canto superior esquerdo
    paddingLeft: '10%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5F5F5',
    textShadowColor: '#000000',
    textShadowRadius: 6,
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
  // Fileira única, centralizada quando sobra espaço
  suspectsRow: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: CARD_GAP,
    paddingVertical: 4,
  },
  suspectCard: {
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    backgroundColor: 'rgba(26, 26, 26, 0.92)',
    padding: 10,
    alignItems: 'center',
    gap: 6,
  },
  suspectName: {
    alignSelf: 'stretch',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardButtonsContainer: {
    width: '100%',
    gap: 6,
  },
  cardButton: {
    width: '100%',
    paddingVertical: 6,
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
