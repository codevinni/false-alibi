import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { DEFAULT_BACKGROUND_OVERLAY } from '../services/media';

interface ScreenBackgroundProps {
  source: ImageSourcePropType;
  // Escurecimento sobre a imagem (0 a 1) para o texto ficar legível
  overlayOpacity?: number;
  // Estilo do CONTEÚDO (padding, alinhamento...). A imagem sempre cobre a
  // tela inteira, independentemente do padding passado aqui.
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Fundo de tela com imagem em "cover" e uma camada escura por cima.
 *
 * A imagem recebe largura e altura em PIXELS, medidas da própria área
 * (onLayout). Porcentagens não servem aqui: em elementos posicionados de
 * forma absoluta, o React Native calcula "100%" descontando o padding do pai,
 * e a imagem ficava menor que a tela (e ampliada) nas telas com margens.
 */
export default function ScreenBackground({
  source,
  overlayOpacity = DEFAULT_BACKGROUND_OVERLAY,
  style,
  children,
}: ScreenBackgroundProps) {
  const window = useWindowDimensions();
  const [size, setSize] = useState({
    width: window.width,
    height: window.height,
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== size.width || height !== size.height) {
      setSize({ width, height });
    }
  };

  return (
    <View style={styles.root} onLayout={handleLayout}>
      <Image
        source={source}
        resizeMode="cover"
        style={[styles.image, size]}
        accessibilityIgnoresInvertColors={true}
      />
      {overlayOpacity > 0 && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` },
          ]}
        />
      )}
      {/* O fundo da tela é a imagem: ignora backgroundColor do estilo */}
      <View style={[styles.content, style, styles.transparent]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#121212',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    flex: 1,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
});
