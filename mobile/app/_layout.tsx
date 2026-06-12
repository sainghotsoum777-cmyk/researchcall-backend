import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { tokenStorage } from '../src/services/api';
import { usersApi } from '../src/services/api';
import { useAuthStore, usePrefsStore } from '../src/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { setUser, setLoading } = useAuthStore();
  const { loadPrefs, theme } = usePrefsStore();

  useEffect(() => {
    (async () => {
      await loadPrefs();
      const token = await tokenStorage.getAccess();
      if (token) {
        try {
          const user = await usersApi.me();
          setUser(user);
        } catch {
          setUser(null);
        }
      } else {
        setLoading(false);
      }
      await SplashScreen.hideAsync();
    })();
  }, []);

  const isDark =
    theme === 'dark' || (theme === 'system' && colorScheme === 'dark');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="calls/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="publish/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="tracker/index" options={{ presentation: 'card' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}