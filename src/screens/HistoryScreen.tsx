import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { mockSuspects } from '../mocks';
import { ScreenProps, useNavigation, useRoute } from '../navigation';

export default function HistoryScreen({
  navigation: navProp,
  route: routeProp,
}: ScreenProps<'HistoryScreen'>) {
  const contextNav = useNavigation();
  const contextRoute = useRoute<'HistoryScreen'>();
  const navigation = navProp ?? contextNav;
  const route = routeProp ?? contextRoute;

  const suspect = route?.params?.suspect ?? mockSuspects[0];
  const messages = suspect?.interrogationHistory?.messages ?? [];

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
        <Text style={styles.title}>Histórico: {suspect.name}</Text>

        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Não existem registros de interrogatório disponíveis para este
              suspeito.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((message, index) => {
              const isQuestion = message.type === 'pergunta';
              return (
                <View key={`${index}-${message.type}`} style={styles.messageBox}>
                  <Text style={styles.messageLabel}>
                    {isQuestion ? 'PERGUNTA:' : 'RESPOSTA:'}
                  </Text>
                  <Text style={styles.messageContent}>{message.content}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.footerContainer}>
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
    padding: 16,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 640,
    flex: 1,
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F5F5F5',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  messagesScroll: {
    flex: 1,
    width: '100%',
  },
  messagesContent: {
    gap: 10,
    paddingVertical: 4,
  },
  messageBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 4,
    backgroundColor: '#222222',
    padding: 10,
    gap: 4,
  },
  messageLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  messageContent: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  button: {
    minWidth: 160,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
