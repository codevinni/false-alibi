import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { DEFAULT_BACKGROUND_OVERLAY } from '../services/media';

interface ScreenBackgroundProps {
  source: ImageSourcePropType;
  // Escurecimento sobre a imagem (0 a 1) para o texto ficar legível
  overlayOpacity?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Fundo de tela com imagem em "cover" e uma camada escura por cima.
 * Usa View + Image absoluta (o ImageBackground está obsoleto no RN 0.88).
 */
export default function ScreenBackground({
  source,
  overlayOpacity = DEFAULT_BACKGROUND_OVERLAY,
  style,
  children,
}: ScreenBackgroundProps) {
  return (
    <View style={[styles.fill, style]}>
      <Image
        source={source}
        resizeMode="cover"
        // Largura e altura explícitas: sem elas o Image usa o tamanho
        // original do arquivo e a imagem aparece ampliada/cortada.
        style={styles.image}
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
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});
