import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mockSuspects } from '../mocks';
import { ScreenProps, useNavigation, useRoute } from '../navigation';

export default function InterrogationScreen({
  navigation: navProp,
  route: routeProp,
}: ScreenProps<'InterrogationScreen'>) {
  const contextNav = useNavigation();
  const contextRoute = useRoute<'InterrogationScreen'>();
  const navigation = navProp ?? contextNav;
  const route = routeProp ?? contextRoute;

  const suspect = route?.params?.suspect ?? mockSuspects[0];

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('SuspectsScreen');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Sala de Interrogatório</Text>

        <View style={styles.suspectBox}>
          <Text style={styles.suspectLabel}>Suspeito em interrogatório:</Text>
          <Text style={styles.suspectName}>{suspect.name}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGoBack}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5F5F5',
    textAlign: 'center',
  },
  suspectBox: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  suspectLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  suspectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 220,
    marginTop: 4,
  },
  button: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
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
