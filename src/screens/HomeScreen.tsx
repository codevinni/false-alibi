import React from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenProps, useNavigation } from '../navigation';

export default function HomeScreen({ navigation: navProp }: ScreenProps<'HomeScreen'>) {
  const contextNav = useNavigation();
  const navigation = navProp ?? contextNav;

  const handlePlay = () => {
    navigation.navigate('BriefingScreen');
  };

  const handleSettings = () => {
    navigation.navigate('SettingsScreen');
  };

  const handleExit = () => {
    BackHandler.exitApp();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.logoTitle}>FALSE Alibi</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePlay}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Jogar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSettings}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Configurações</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleExit}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
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
    padding: 24,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F5F5F5',
    letterSpacing: 2,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    gap: 14,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
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
