import React, {useEffect} from 'react';
import {View, Text, Alert, StyleSheet} from 'react-native';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  };

  useEffect(() => {
    requestUserPermission();
    messaging()
      .getToken()
      .then(token => {
        console.log('FCM Token:', token);
        Alert.alert('FCM Token', token);
      });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          if (remoteMessage.data && remoteMessage.data.screen) {
            Alert.alert(
              'Deep Link from Killed State',
              `Navigate to: ${remoteMessage.data.screen}`,
            );
          }
        }
      });
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      if (remoteMessage.data && remoteMessage.data.screen) {
        Alert.alert(
          'Deep Link from Background',
          `Navigate to: ${remoteMessage.data.screen}`,
        );
      }
    });

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived in foreground!', remoteMessage);
      Alert.alert(
        remoteMessage.notification.title,
        remoteMessage.notification.body,
      );
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native Push Notifications</Text>
      <Text style={styles.text}>
        Check the console for your FCM Token. Use it to send a test notification.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});

export default App;
