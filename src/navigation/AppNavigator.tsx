import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationProvider, useNavigation } from './NavigationContext';
import { RootStackParamList, RouteEntry } from './types';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BriefingScreen from '../screens/BriefingScreen';
import SuspectsScreen from '../screens/SuspectsScreen';
import InterrogationScreen from '../screens/InterrogationScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ResultScreen from '../screens/ResultScreen';

interface AppNavigatorProps {
  initialRouteName?: keyof RootStackParamList;
}

function NavigatorContent() {
  const navigation = useNavigation();
  const { currentRoute } = navigation;

  const renderScreen = () => {
    switch (currentRoute.name) {
      case 'Home':
      case 'HomeScreen':
        return (
          <HomeScreen
            navigation={navigation}
            route={currentRoute as RouteEntry<'HomeScreen'>}
          />
        );
      case 'Settings':
      case 'SettingsScreen':
        return (
          <SettingsScreen
            navigation={navigation}
            route={currentRoute as RouteEntry<'SettingsScreen'>}
          />
        );
      case 'Briefing':
      case 'BriefingScreen':
        return (
          <BriefingScreen
            navigation={navigation}
            route={currentRoute as RouteEntry<'BriefingScreen'>}
          />
        );
      case 'Suspects':
      case 'SuspectsScreen':
        return (
          <SuspectsScreen
            navigation={navigation}
            route={currentRoute as RouteEntry<'SuspectsScreen'>}
          />
        );
      case 'Interrogation':
      case 'InterrogationScreen':
        return (
          <InterrogationScreen
            navigation={navigation}
            route={currentRoute as RouteEntry<'InterrogationScreen'>}
          />
        );
      case 'History':
      case 'HistoryScreen':
        return (
          <HistoryScreen
            navigation={navigation}
            route={currentRoute as RouteEntry<'HistoryScreen'>}
          />
        );
      case 'Result':
      case 'ResultScreen':
        return (
          <ResultScreen
            navigation={navigation}
            route={currentRoute as RouteEntry<'ResultScreen'>}
          />
        );
      default:
        return (
          <HomeScreen
            navigation={navigation}
            route={currentRoute as RouteEntry<'HomeScreen'>}
          />
        );
    }
  };

  return <View style={styles.screenContainer}>{renderScreen()}</View>;
}

export default function AppNavigator({
  initialRouteName = 'HomeScreen',
}: AppNavigatorProps) {
  return (
    <NavigationProvider initialRouteName={initialRouteName}>
      <NavigatorContent />
    </NavigationProvider>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    width: '100%',
  },
});
