import React from 'react';
import {
  ImageBackground,
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

/** Fundo de tela com imagem em "cover" e uma camada escura por cima. */
export default function ScreenBackground({
  source,
  overlayOpacity = DEFAULT_BACKGROUND_OVERLAY,
  style,
  children,
}: ScreenBackgroundProps) {
  return (
    <ImageBackground
      source={source}
      resizeMode="cover"
      style={[styles.fill, style]}
    >
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: '100%',
  },
});
