import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { usersApi } from '../services/api';
import { useAuthStore } from '../store';
import { Router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(router: Router) {
  const { isAuthenticated } = useAuthStore();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotificationsAsync().then((token) => {
      if (token) usersApi.updatePushToken(token).catch(() => {});
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Badge update handled by store subscription
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.callId) {
          router.push(`/calls/${data.callId}`);
        } else {
          router.push('/notifications');
        }
      },
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, router]);
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'ResearchCall',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'researchcall-upgc-2026',
  });
  return token.data;
}