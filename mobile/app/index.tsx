import { Redirect } from 'expo-router';
import { useAuthStore, usePrefsStore } from '../src/store';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../src/constants';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { onboardingDone } = usePrefsStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background.dark }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!onboardingDone) return <Redirect href="/onboarding" />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}