import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from 'react-native';

interface SuspectAvatarProps {
  source: ImageSourcePropType;
  size?: number;
  name?: string;
  style?: StyleProp<ImageStyle>;
}

/**
 * Retrato do suspeito (PNG quadrado 512×512 com fundo transparente).
 * Sem caixa nem borda: o retrato aparece direto sobre o card.
 */
export default function SuspectAvatar({
  source,
  size = 96,
  name,
  style,
}: SuspectAvatarProps) {
  return (
    <Image
      source={source}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
      accessible={true}
      accessibilityLabel={name ? `Foto de ${name}` : 'Foto do suspeito'}
    />
  );
}

