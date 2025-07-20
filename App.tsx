import React, {useEffect} from 'react';
import {View, Text, Alert, StyleSheet} from 'react-native';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  // Function to request permission for notifications (for Android 13+)
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
    // Request permission on app start
    requestUserPermission();

    // Get the FCM token for the device
    messaging()
      .getToken()
      .then(token => {
        console.log('FCM Token:', token);
        // IMPORTANT: In a real app, you would send this token to your backend server.
        // The backend uses this token to send notifications to this specific device.
        Alert.alert('FCM Token', token);
      });

    // --- Handling Notification Interactions ---

    // 1. When the app is killed and opened by a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          // (BONUS) Handle deep linking
          if (remoteMessage.data && remoteMessage.data.screen) {
            Alert.alert(
              'Deep Link from Killed State',
              `Navigate to: ${remoteMessage.data.screen}`,
            );
          }
        }
      });

    // 2. When the app is in the background and opened by a notification
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      // (BONUS) Handle deep linking
      if (remoteMessage.data && remoteMessage.data.screen) {
        Alert.alert(
          'Deep Link from Background',
          `Navigate to: ${remoteMessage.data.screen}`,
        );
      }
    });

    // 3. When the app is in the foreground
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
