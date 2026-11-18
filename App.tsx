/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { audioService } from './src/services/audio';

function App() {
  useEffect(() => {
    Orientation.lockToLandscape();

    // Áudio: pré-carrega efeitos e pausa a música quando o app vai para 2º plano.
    // A música em si é iniciada pelas telas (useBackgroundMusic).
    audioService.init();
    const detachAudioAppState = audioService.attachAppStateHandling();

    return () => {
      Orientation.unlockAllOrientations();
      detachAudioAppState();
      audioService.release();
    };
  }, []);

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar hidden={true} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
