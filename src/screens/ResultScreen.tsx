import React, { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockCrimeCase, mockGameDefeat, mockGameVictory } from '../mocks';
import { ScreenProps, useNavigation, useRoute } from '../navigation';
import {
  useBackgroundMusic,
  useSoundEffectOnMount,
  useSoundHandler,
} from '../services/audio';
import { useStaticImage, useSuspectAvatar } from '../services/media';
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
  const accusedAvatar = useSuspectAvatar(
    accusedSuspect ?? crimeCase.culprit,
    crimeCase,
  );

  // Textos do painel da direita (os banners novos não trazem texto)
  const titleText = isVictory ? 'CASO SOLUCIONADO!' : 'DERROTA!';
  const stampText = isVictory ? 'INVESTIGAÇÃO CONCLUÍDA' : 'CASO ARQUIVADO';
  const feedbackMessage = isVictory
    ? 'A verdade sempre deixa rastros. Você soube encontrá-los e ' +
      'desmascarou o verdadeiro culpado. Um trabalho digno de um grande ' +
      'detetive!'
    : 'As evidências não bateram. O caso continua em aberto e o culpado ' +
      'ainda está livre.';

  // O banner cobre a tela inteira, como imagem de fundo em "cover".
  // A arte fica na metade esquerda; a direita é fundo escuro, onde ficam o
  // texto, o resumo e o botão. Os arquivos já vêm no formato de tela de
  // celular (2,2:1), com o fundo estendido em cima e embaixo.
  // Largura E altura explícitas (senão o Image usa o tamanho do arquivo).
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bannerSize = useMemo(() => {
    const asset = Image.resolveAssetSource(banner);
    const aspect =
      asset?.width && asset?.height ? asset.width / asset.height : 2.2;
    const width = Math.max(screenWidth, screenHeight * aspect);
    return { width: Math.round(width), height: Math.round(width / aspect) };
  }, [banner, screenWidth, screenHeight]);

  const handleReturnToHome = () => {
    navigation.reset('HomeScreen');
  };

  return (
    <View style={styles.container}>
      <Image
        source={banner}
        resizeMode="cover"
        style={[
          styles.banner,
          bannerSize,
          {
            left: (screenWidth - bannerSize.width) / 2,
            top: (screenHeight - bannerSize.height) / 2,
          },
        ]}
        accessibilityIgnoresInvertColors={true}
      />

      {/* Metade direita: resultado, resumo e botão */}
      <View
        style={[
          styles.panel,
          {
            paddingTop: 12 + insets.top,
            paddingBottom: 12 + insets.bottom,
            marginRight: insets.right,
          },
        ]}
      >
        <View
          style={styles.iconRow}
          accessible={true}
          accessibilityLabel={`${titleText} ${stampText}. ${feedbackMessage}`}
        >
          <View style={styles.iconLine} />
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{isVictory ? '✓' : '✕'}</Text>
          </View>
          <View style={styles.iconLine} />
        </View>

        <Text style={styles.title}>{titleText}</Text>
        <View style={styles.stamp}>
          <Text style={styles.stampText}>{stampText}</Text>
        </View>
        <Text style={styles.message}>{feedbackMessage}</Text>

        <View style={styles.solutionContainer}>
          {accusedSuspect && (
            <View style={styles.accusedRow}>
              <SuspectAvatar
                source={accusedAvatar}
                name={accusedSuspect.name}
                size={28}
              />
              <Text style={styles.accusedText} numberOfLines={1}>
                Suspeito acusado: {accusedSuspect.name}
              </Text>
            </View>
          )}
          <Text style={styles.solutionTitle}>Resumo da Solução:</Text>
          <ScrollView style={styles.solutionScroll}>
            <Text style={styles.solutionText}>{crimeCase.summarySolution}</Text>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.button}
          {...withSound(handleReturnToHome)}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const RED = '#B3202E';
const PAPER = '#EDE7DC';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    // mesmo tom do fundo escuro dos banners
    backgroundColor: '#040A0E',
  },
  banner: {
    position: 'absolute',
  },
  // Coluna na metade direita, onde o banner é só fundo escuro
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '57%',
    right: '3%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconLine: {
    width: 48,
    height: 2,
    backgroundColor: RED,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: PAPER,
    textAlign: 'center',
  },
  // Carimbo vermelho levemente torto, como nos banners antigos
  stamp: {
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '-2deg' }],
  },
  stampText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: RED,
  },
  message: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 17,
    color: '#CFC8BD',
    textAlign: 'center',
  },
  // Encolhe em telas baixas; o texto longo rola
  solutionContainer: {
    alignSelf: 'stretch',
    flexShrink: 1,
    minHeight: 64,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 6,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 3,
  },
  accusedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accusedText: {
    flexShrink: 1,
    fontSize: 12,
    color: '#BBBBBB',
  },
  solutionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  solutionScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  solutionText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#DDDDDD',
  },
  // Mesmo tamanho do botão "Revisar caso" da tela de suspeitos
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
