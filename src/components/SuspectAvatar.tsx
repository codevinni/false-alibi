import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  ImageStyle,
} from 'react-native';

interface SuspectAvatarProps {
  source: ImageSourcePropType;
  size?: number;
  name?: string;
  style?: StyleProp<ImageStyle>;
}

/** Foto de ficha policial do suspeito (imagens quadradas 512×512). */
export default function SuspectAvatar({
  source,
  size = 96,
  name,
  style,
}: SuspectAvatarProps) {
  return (
    <Image
      source={source}
      resizeMode="cover"
      style={[styles.avatar, { width: size, height: size }, style]}
      accessible={true}
      accessibilityLabel={name ? `Foto de ${name}` : 'Foto do suspeito'}
    />
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444444',
    backgroundColor: '#111111',
  },
});
