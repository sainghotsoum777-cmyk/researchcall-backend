$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-File($relPath, $content) {
    $fullPath = Join-Path $baseDir $relPath
    $dir = Split-Path -Parent $fullPath
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "OK: $relPath"
}

# File 1 — mobile/package.json
Write-File "mobile/package.json" @'
{
  "name": "researchcall-mobile",
  "version": "2.0.0",
  "main": "expo-router/entry",
  "description": "ResearchCall — L'agrégateur d'appels scientifiques de l'Afrique francophone",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios",
    "submit:android": "eas submit --platform android",
    "submit:ios": "eas submit --platform ios",
    "test": "jest --watchAll",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.0",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-native-community/netinfo": "11.3.1",
    "@react-navigation/bottom-tabs": "^6.5.20",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/native-stack": "^6.9.26",
    "@reduxjs/toolkit": "^2.2.7",
    "@shopify/flash-list": "1.6.4",
    "date-fns": "^3.6.0",
    "expo": "~51.0.28",
    "expo-blur": "~13.0.2",
    "expo-calendar": "~12.0.1",
    "expo-constants": "~16.0.2",
    "expo-document-picker": "~12.0.2",
    "expo-file-system": "~17.0.1",
    "expo-haptics": "~13.0.1",
    "expo-image": "~1.12.15",
    "expo-image-picker": "~15.0.7",
    "expo-linear-gradient": "~13.0.2",
    "expo-linking": "~6.3.1",
    "expo-localization": "~15.0.3",
    "expo-notifications": "~0.28.19",
    "expo-router": "~3.5.23",
    "expo-secure-store": "~13.0.2",
    "expo-sharing": "~12.0.1",
    "expo-splash-screen": "~0.27.5",
    "expo-status-bar": "~1.12.1",
    "expo-tracking-transparency": "~4.0.2",
    "i18n-js": "^4.4.3",
    "nativewind": "^4.0.1",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-native-gesture-handler": "~2.16.1",
    "react-native-pdf": "^6.7.4",
    "react-native-reanimated": "~3.10.1",
    "react-native-safe-area-context": "4.10.5",
    "react-native-screens": "3.31.1",
    "react-native-skeleton-content": "^1.0.5",
    "react-native-svg": "15.2.0",
    "react-redux": "^9.1.2",
    "tailwindcss": "^3.4.10",
    "zod": "^3.23.8",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/i18n-js": "^4.0.0",
    "@types/react": "~18.2.79",
    "@types/react-native": "~0.73.0",
    "eslint": "^8.57.0",
    "eslint-config-expo": "^7.0.0",
    "jest": "^29.7.0",
    "jest-expo": "~51.0.3",
    "typescript": "^5.3.3"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
'@

# File 2 — mobile/app.json
Write-File "mobile/app.json" @'
{
  "expo": {
    "name": "ResearchCall",
    "slug": "researchcall",
    "version": "2.0.0",
    "orientation": "portrait",
    "icon": "./src/assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./src/assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "ci.upgc.researchcall",
      "buildNumber": "1",
      "infoPlist": {
        "NSCalendarsUsageDescription": "ResearchCall utilise votre calendrier pour ajouter les deadlines des appels scientifiques.",
        "NSPhotoLibraryUsageDescription": "ResearchCall accède à votre galerie pour mettre à jour votre photo de profil.",
        "NSCameraUsageDescription": "ResearchCall accède à votre caméra pour prendre votre photo de profil."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      },
      "package": "ci.upgc.researchcall",
      "versionCode": 1,
      "permissions": [
        "android.permission.READ_CALENDAR",
        "android.permission.WRITE_CALENDAR",
        "android.permission.VIBRATE",
        "android.permission.RECEIVE_BOOT_COMPLETED"
      ]
    },
    "web": {
      "favicon": "./src/assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./src/assets/notification-icon.png",
          "color": "#3B82F6",
          "defaultChannel": "default"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "ResearchCall accède à vos photos pour votre profil."
        }
      ],
      "expo-localization",
      "expo-calendar"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "scheme": "researchcall",
    "extra": {
      "eas": {
        "projectId": "researchcall-upgc-2026"
      }
    }
  }
}
'@

# File 3 — mobile/babel.config.js
Write-File "mobile/babel.config.js" @'
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
'@

# File 4 — mobile/tsconfig.json
Write-File "mobile/tsconfig.json" @'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"]
}
'@

# File 5 — mobile/eas.json
Write-File "mobile/eas.json" @'
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      },
      "ios": {
        "appleId": "support@researchcall.ci",
        "ascAppId": "",
        "appleTeamId": ""
      }
    }
  }
}
'@

# File 6 — mobile/app/_layout.tsx
Write-File "mobile/app/_layout.tsx" @'
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
'@

# File 7 — mobile/app/index.tsx
Write-File "mobile/app/index.tsx" @'
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
'@

# File 8 — mobile/app/onboarding.tsx
Write-File "mobile/app/onboarding.tsx" @'
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  interpolateColor, useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { usePrefsStore } from '../src/store';
import { COLORS } from '../src/constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'library',
    color: '#3B82F6',
    gradient: ['#1E3A8A', '#3B82F6'] as [string, string],
    title: 'Tous les appels en un endroit',
    subtitle: 'Communications, publications, bourses, colloques…\nCentralisés pour vous en temps réel.',
  },
  {
    id: '2',
    icon: 'notifications',
    color: '#8B5CF6',
    gradient: ['#4C1D95', '#8B5CF6'] as [string, string],
    title: 'Alertes personnalisées',
    subtitle: 'Recevez des notifications intelligentes basées sur vos domaines de recherche.',
  },
  {
    id: '3',
    icon: 'calendar',
    color: '#10B981',
    gradient: ['#064E3B', '#10B981'] as [string, string],
    title: 'Ne manquez plus aucune deadline',
    subtitle: 'Ajoutez les échéances à votre calendrier en un seul tap.',
  },
  {
    id: '4',
    icon: 'megaphone',
    color: '#F59E0B',
    gradient: ['#78350F', '#F59E0B'] as [string, string],
    title: 'Partagez et publiez',
    subtitle: 'Diffusez vos appels auprès de 60 000+ chercheurs africains de l\'espace CAMES.',
  },
];

export default function OnboardingScreen() {
  const { setOnboardingDone } = usePrefsStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const finish = () => {
    setOnboardingDone();
    router.replace('/(auth)/login');
  };

  const next = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      finish();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatRef as any}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={(e) =>
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <LinearGradient colors={item.gradient} style={styles.slide}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon as any} size={80} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </LinearGradient>
        )}
        keyExtractor={(i) => i.id}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, activeIndex === i && styles.dotActive]}
          />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={finish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={next} style={styles.nextBtn}>
          <Text style={styles.nextText}>
            {activeIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconWrap: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 40,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 24, backgroundColor: COLORS.primary },
  actions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingBottom: 48,
  },
  skipBtn: { padding: 12 },
  skipText: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 30,
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
'@

# File 9 — mobile/app/(auth)/login.tsx
Write-File "mobile/app/(auth)/login.tsx" @'
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { authApi, tokenStorage } from '../../src/services/api';
import { useAuthStore } from '../../src/store';
import { COLORS } from '../../src/constants';

export default function LoginScreen() {
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      const { accessToken, refreshToken, user } = await authApi.login(email.trim().toLowerCase(), password);
      await tokenStorage.setTokens(accessToken, refreshToken);
      setUser(user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erreur de connexion', e.message === 'Invalid credentials'
        ? 'Email ou mot de passe incorrect.'
        : 'Impossible de se connecter. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logo}>
            <View style={styles.logoIcon}>
              <Ionicons name="flask" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>ResearchCall</Text>
            <Text style={styles.tagline}>L'agrégateur d'appels scientifiques{'\n'}de l'Afrique francophone</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.heading}>Connexion</Text>

            <View style={styles.fieldWrap}>
              <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor="#475569"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.fieldIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mot de passe"
                placeholderTextColor="#475569"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity onPress={() => setShowPwd((p) => !p)} hitSlop={8}>
                <Ionicons name={showPwd ? 'eye-off' : 'eye'} size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </Link>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerHint}>Pas encore de compte ? </Text>
              <Link href="/(auth)/register">
                <Text style={styles.registerLink}>S'inscrire</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logo: { alignItems: 'center', marginBottom: 48 },
  logoIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  appName: { fontSize: 32, fontWeight: '800', color: '#F1F5F9', marginBottom: 6 },
  tagline: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  form: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
  },
  heading: { fontSize: 22, fontWeight: '700', color: '#F1F5F9', marginBottom: 20 },
  fieldWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1, borderColor: '#334155',
  },
  fieldIcon: { marginRight: 10 },
  input: { flex: 1, color: '#F1F5F9', fontSize: 15 },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: COLORS.primary, fontSize: 13 },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 20,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerHint: { color: '#64748B', fontSize: 14 },
  registerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
'@

# File 10 — mobile/app/(auth)/register.tsx
Write-File "mobile/app/(auth)/register.tsx" @'
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { authApi, tokenStorage, UserRole } from '../../src/services/api';
import { useAuthStore } from '../../src/store';
import { COLORS, RESEARCH_DOMAINS } from '../../src/constants';

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: 'seeker', label: 'Chercheur', desc: 'Je recherche des appels' },
  { id: 'publisher', label: 'Éditeur', desc: 'Je publie des appels' },
  { id: 'both', label: 'Les deux', desc: 'Je recherche et publie' },
];

export default function RegisterScreen() {
  const { setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    laboratory: '',
    role: 'seeker' as UserRole,
    domains: [] as string[],
  });

  const update = (k: keyof typeof form, v: string | string[] | UserRole) =>
    setForm((p) => ({ ...p, [k]: v }));

  const toggleDomain = (d: string) => {
    setForm((p) => ({
      ...p,
      domains: p.domains.includes(d)
        ? p.domains.filter((x) => x !== d)
        : [...p.domains, d],
    }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        Alert.alert('Erreur', 'Tous les champs sont obligatoires');
        return;
      }
      if (form.password !== form.confirmPassword) {
        Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const { accessToken, refreshToken, user } = await authApi.register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: form.role,
        institution: form.institution.trim() || undefined,
        laboratory: form.laboratory.trim() || undefined,
        domains: form.domains,
      });
      await tokenStorage.setTokens(accessToken, refreshToken);
      setUser(user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Progress */}
          <View style={styles.progress}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.progressDot, step >= i && styles.progressDotActive]}
              />
            ))}
          </View>

          {step === 1 && (
            <View style={styles.form}>
              <Text style={styles.heading}>Créer un compte</Text>
              <Text style={styles.subheading}>Étape 1 — Informations personnelles</Text>

              {[
                { key: 'firstName', label: 'Prénom', icon: 'person-outline' },
                { key: 'lastName', label: 'Nom', icon: 'person-outline' },
                { key: 'email', label: 'Email', icon: 'mail-outline', keyboard: 'email-address' },
                { key: 'password', label: 'Mot de passe', icon: 'lock-closed-outline', secure: true },
                { key: 'confirmPassword', label: 'Confirmer le mot de passe', icon: 'lock-closed-outline', secure: true },
              ].map((f) => (
                <View key={f.key} style={styles.fieldWrap}>
                  <Ionicons name={f.icon as any} size={18} color="#64748B" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.label}
                    placeholderTextColor="#475569"
                    value={(form as any)[f.key]}
                    onChangeText={(v) => update(f.key as any, v)}
                    keyboardType={f.keyboard as any}
                    secureTextEntry={f.secure}
                    autoCapitalize={f.key === 'email' ? 'none' : 'words'}
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.btn} onPress={nextStep}>
                <Text style={styles.btnText}>Suivant</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.form}>
              <Text style={styles.heading}>Votre profil académique</Text>
              <Text style={styles.subheading}>Étape 2 — Institution & Rôle</Text>

              {[
                { key: 'institution', label: 'Institution / Université', icon: 'school-outline' },
                { key: 'laboratory', label: 'Laboratoire (optionnel)', icon: 'flask-outline' },
              ].map((f) => (
                <View key={f.key} style={styles.fieldWrap}>
                  <Ionicons name={f.icon as any} size={18} color="#64748B" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.label}
                    placeholderTextColor="#475569"
                    value={(form as any)[f.key]}
                    onChangeText={(v) => update(f.key as any, v)}
                  />
                </View>
              ))}

              <Text style={styles.sectionLabel}>Rôle principal</Text>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleCard, form.role === r.id && styles.roleCardActive]}
                  onPress={() => update('role', r.id)}
                >
                  <View>
                    <Text style={[styles.roleLabel, form.role === r.id && styles.roleLabelActive]}>
                      {r.label}
                    </Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </View>
                  {form.role === r.id && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}

              <View style={styles.rowBtns}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                  <Text style={styles.backBtnText}>Retour</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={nextStep}>
                  <Text style={styles.btnText}>Suivant</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.form}>
              <Text style={styles.heading}>Vos domaines</Text>
              <Text style={styles.subheading}>
                Étape 3 — Sélectionnez vos domaines de recherche pour personnaliser votre fil
              </Text>

              <View style={styles.domainsGrid}>
                {RESEARCH_DOMAINS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.domainChip, form.domains.includes(d) && styles.domainChipActive]}
                    onPress={() => toggleDomain(d)}
                  >
                    <Text style={[
                      styles.domainText,
                      form.domains.includes(d) && styles.domainTextActive,
                    ]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.rowBtns}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                  <Text style={styles.backBtnText}>Retour</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { flex: 1 }, loading && { opacity: 0.7 }]}
                  onPress={submit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.btnText}>Créer mon compte</Text>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.loginRow}>
                <Text style={styles.loginHint}>Déjà un compte ? </Text>
                <Link href="/(auth)/login">
                  <Text style={styles.loginLink}>Se connecter</Text>
                </Link>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  progress: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 24 },
  progressDot: { width: 32, height: 4, borderRadius: 2, backgroundColor: '#334155' },
  progressDotActive: { backgroundColor: COLORS.primary },
  form: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24 },
  heading: { fontSize: 22, fontWeight: '800', color: '#F1F5F9', marginBottom: 4 },
  subheading: { fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 18 },
  fieldWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 10, borderWidth: 1, borderColor: '#334155',
  },
  input: { flex: 1, color: '#F1F5F9', fontSize: 15 },
  sectionLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 10, marginTop: 4 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0F172A', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#334155',
  },
  roleCardActive: { borderColor: COLORS.primary, backgroundColor: '#1D3461' },
  roleLabel: { color: '#F1F5F9', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  roleLabelActive: { color: COLORS.primary },
  roleDesc: { color: '#64748B', fontSize: 12 },
  domainsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  domainChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155',
  },
  domainChipActive: { backgroundColor: COLORS.primary + '25', borderColor: COLORS.primary },
  domainText: { color: '#94A3B8', fontSize: 12 },
  domainTextActive: { color: COLORS.primary, fontWeight: '600' },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 14, marginTop: 12,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rowBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  backBtn: {
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 14, backgroundColor: '#0F172A',
    borderWidth: 1, borderColor: '#334155',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  loginHint: { color: '#64748B', fontSize: 14 },
  loginLink: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
'@

# File 11 — mobile/app/(auth)/forgot-password.tsx
Write-File "mobile/app/(auth)/forgot-password.tsx" @'
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { authApi } from '../../src/services/api';
import { COLORS } from '../../src/constants';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    await authApi.forgotPassword(email.trim().toLowerCase()).catch(() => {});
    setLoading(false);
    setSent(true);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.icon}>
            <Ionicons name="mail" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Mot de passe oublié</Text>

          {sent ? (
            <>
              <Text style={styles.desc}>
                Si cet email est associé à un compte, vous recevrez un lien de réinitialisation dans les prochaines minutes.
              </Text>
              <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
                <Text style={styles.btnText}>Retour à la connexion</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.desc}>
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </Text>
              <View style={styles.field}>
                <Ionicons name="mail-outline" size={18} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="Adresse email"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Envoyer le lien</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  back: { padding: 20, paddingTop: 56 },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  icon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(59,130,246,0.15)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#F1F5F9', marginBottom: 12 },
  desc: { fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1E293B', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: '#334155',
    width: '100%', marginBottom: 16,
  },
  input: { flex: 1, color: '#F1F5F9', fontSize: 15 },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 15, paddingHorizontal: 40, alignItems: 'center', width: '100%',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
'@

# File 12 — mobile/app/(tabs)/_layout.tsx
Write-File "mobile/app/(tabs)/_layout.tsx" @'
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, View, Text } from 'react-native';
import { useBadgeStore, usePrefsStore } from '../../src/store';
import { COLORS } from '../../src/constants';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const { theme } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  const { unreadCount } = useBadgeStore();

  const tint = COLORS.primary;
  const bg = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const inactive = isDark ? '#475569' : '#94A3B8';
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alertes',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color} />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute', top: -4, right: -6,
                  backgroundColor: COLORS.danger, borderRadius: 10,
                  minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
'@

Write-Host "Batch 1 complete (files 1-12)"

# File 13 — mobile/app/(tabs)/index.tsx
Write-File "mobile/app/(tabs)/index.tsx" @'
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { callsApi, Call } from '../../src/services/api';
import { useAuthStore, usePrefsStore } from '../../src/store';
import CallCard from '../../src/components/CallCard';
import { CALL_TYPES, COLORS } from '../../src/constants';

interface Stats {
  total: number;
  newToday: number;
  upcoming: number;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { theme } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  const { user } = useAuthStore();

  const [feed, setFeed] = useState<Call[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [urgent, setUrgent] = useState<Call[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [feedRes, statsRes, urgentRes] = await Promise.all([
        callsApi.feed(1, 10),
        callsApi.stats(),
        callsApi.search({ sortBy: 'deadline_asc', limit: 5 }),
      ]);
      setFeed(feedRes.data);
      setStats({ total: statsRes.total, newToday: statsRes.newToday, upcoming: statsRes.upcoming });
      setUrgent(urgentRes.data.filter((c) => {
        const days = (new Date(c.submissionDeadline).getTime() - Date.now()) / 86400000;
        return days >= 0 && days <= 7;
      }));
    } catch (e) {
      // serve from cache silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                Bonjour, {user?.firstName ?? 'Chercheur'} 👋
              </Text>
              <Text style={styles.subGreeting}>Découvrez les derniers appels scientifiques</Text>
            </View>
            <Image
              source={{
                uri: user?.avatarUrl ??
                  `https://api.dicebear.com/8.x/initials/svg?seed=${user?.firstName ?? 'R'}+${user?.lastName ?? 'C'}`,
              }}
              style={styles.userAvatar}
            />
          </View>

          {/* Stats */}
          {stats && (
            <View style={styles.statsRow}>
              {[
                { icon: 'library', value: stats.total, label: 'appels actifs' },
                { icon: 'flash', value: stats.newToday, label: "nouveaux aujourd'hui" },
                { icon: 'time', value: stats.upcoming, label: 'expirent bientôt' },
              ].map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <Ionicons name={s.icon as any} size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>

        {/* Category chips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Explorer par catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {CALL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.chip, { backgroundColor: type.color + '20', borderColor: type.color + '40' }]}
                onPress={() => router.push({ pathname: '/(tabs)/explore', params: { type: type.id } })}
              >
                <Ionicons name={type.icon as any} size={16} color={type.color} />
                <Text style={[styles.chipText, { color: type.color }]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Urgent deadlines */}
        {urgent.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flame" size={18} color={COLORS.danger} />
                <Text style={[styles.sectionTitle, { color: textPrimary, marginBottom: 0 }]}>
                  Échéances urgentes
                </Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
              {urgent.map((call) => (
                <View key={call.id} style={styles.horizontalCard}>
                  <CallCard
                    call={call}
                    compact
                    onPress={() => router.push(`/calls/${call.id}`)}
                    colorScheme={isDark ? 'dark' : 'light'}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Personalized feed */}
        <View style={[styles.section, { paddingBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Mon fil personnalisé</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '600' }}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <View key={i} style={[styles.skeleton, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />
            ))
          ) : feed.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={40} color={textSecondary} />
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                Aucun appel disponible pour l'instant.{'\n'}Mettez à jour vos domaines dans votre profil.
              </Text>
            </View>
          ) : (
            feed.map((call) => (
              <CallCard
                key={call.id}
                call={call}
                onPress={() => router.push(`/calls/${call.id}`)}
                colorScheme={isDark ? 'dark' : 'light'}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  userAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14,
    padding: 12, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  chipsScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1, marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  horizontalList: { marginHorizontal: -16, paddingHorizontal: 16 },
  horizontalCard: { width: 280, marginRight: 12 },
  skeleton: { height: 130, borderRadius: 16, marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 20 },
});
'@

Write-Host "Batch 2 complete (file 13)"

# File 14 — mobile/app/(tabs)/explore.tsx
Write-File "mobile/app/(tabs)/explore.tsx" @'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, ActivityIndicator, useColorScheme,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { callsApi, Call, SearchParams, CallType, Modality } from '../../src/services/api';
import CallCard from '../../src/components/CallCard';
import { SearchBar } from '../../src/components/SearchBar';
import { CALL_TYPES, CAMES_COUNTRIES, COLORS, RESEARCH_DOMAINS } from '../../src/constants';
import { usePrefsStore } from '../../src/store';

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Pertinence' },
  { id: 'deadline_asc', label: 'Deadline ↑' },
  { id: 'deadline_desc', label: 'Deadline ↓' },
  { id: 'created_desc', label: 'Plus récents' },
];

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const colorScheme = useColorScheme();
  const { theme } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');

  const [query, setQuery] = useState('');
  const [calls, setCalls] = useState<Call[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filters, setFilters] = useState<SearchParams>({
    sortBy: 'relevance',
    type: params.type as CallType | undefined,
    limit: 20,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (p = 1, reset = false) => {
    if (loading && !reset) return;
    setLoading(true);
    try {
      const res = await callsApi.search({ ...filters, q: query || undefined, page: p });
      setCalls((prev) => (reset || p === 1) ? res.data : [...prev, ...res.data]);
      setHasMore(res.hasMore);
      setTotal(res.total);
      setPage(p);
    } catch { }
    finally { setLoading(false); }
  }, [filters, query]);

  useEffect(() => {
    debounceRef.current && clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(1, true), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, filters]);

  useEffect(() => {
    if (params.type) setFilters((f) => ({ ...f, type: params.type as CallType }));
  }, [params.type]);

  const handleQueryChange = async (q: string) => {
    setQuery(q);
    if (q.length >= 2) {
      const s = await callsApi.suggestions(q).catch(() => []);
      setSuggestions(s);
      setShowSuggestions(s.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const activeFilterCount = [
    filters.type, filters.domain, filters.country, filters.modality,
  ].filter(Boolean).length;

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const surface = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Explorer</Text>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={query}
              onChangeText={handleQueryChange}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              colorScheme={isDark ? 'dark' : 'light'}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={20} color={activeFilterCount > 0 ? '#fff' : textSecondary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <View style={[styles.suggestions, { backgroundColor: surface, borderColor: border }]}>
            {suggestions.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionItem}
                onPress={() => { setQuery(s); setShowSuggestions(false); }}
              >
                <Ionicons name="search" size={14} color={textSecondary} />
                <Text style={[styles.suggestionText, { color: textPrimary }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Results count */}
      {total > 0 && (
        <View style={styles.resultsBar}>
          <Text style={[styles.resultsText, { color: textSecondary }]}>
            {total} résultat{total > 1 ? 's' : ''}
            {query ? ` pour « ${query} »` : ''}
          </Text>
        </View>
      )}

      {/* Sort chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.sortChip,
              { borderColor: border },
              filters.sortBy === opt.id && styles.sortChipActive,
            ]}
            onPress={() => setFilters((f) => ({ ...f, sortBy: opt.id as any }))}
          >
            <Text style={[
              styles.sortChipText,
              { color: textSecondary },
              filters.sortBy === opt.id && styles.sortChipTextActive,
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlashList
        data={calls}
        estimatedItemSize={160}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <CallCard
            call={item}
            onPress={() => router.push(`/calls/${item.id}`)}
            colorScheme={isDark ? 'dark' : 'light'}
          />
        )}
        keyExtractor={(item) => item.id}
        onEndReached={() => hasMore && !loading && search(page + 1)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={textSecondary} />
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>Aucun résultat</Text>
              <Text style={[styles.emptyDesc, { color: textSecondary }]}>
                Essayez d'autres mots-clés ou modifiez vos filtres
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? <ActivityIndicator color={COLORS.primary} style={{ padding: 20 }} /> : null
        }
      />

      {/* Filter modal */}
      <FilterModal
        visible={showFilters}
        filters={filters}
        onApply={(f) => { setFilters(f); setShowFilters(false); }}
        onClose={() => setShowFilters(false)}
        isDark={isDark}
      />
    </View>
  );
}

function FilterModal({ visible, filters, onApply, onClose, isDark }: {
  visible: boolean;
  filters: SearchParams;
  onApply: (f: SearchParams) => void;
  onClose: () => void;
  isDark: boolean;
}) {
  const [local, setLocal] = useState(filters);
  const surface = isDark ? '#1E293B' : '#fff';
  const bg = isDark ? '#0F172A' : '#F8FAFC';
  const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const border = isDark ? '#334155' : '#E2E8F0';

  useEffect(() => { setLocal(filters); }, [filters]);

  const clear = () => setLocal({ sortBy: 'relevance', limit: 20 });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: bg }]}>
        <View style={[styles.modalHeader, { backgroundColor: surface, borderBottomColor: border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: COLORS.primary, fontSize: 16 }}>Annuler</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: textPrimary }]}>Filtres</Text>
          <TouchableOpacity onPress={clear}>
            <Text style={{ color: COLORS.danger, fontSize: 16 }}>Effacer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          {/* Type */}
          <Text style={[styles.filterLabel, { color: textSecondary }]}>TYPE D'APPEL</Text>
          <View style={styles.filterChips}>
            {CALL_TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.filterChip,
                  { borderColor: border },
                  local.type === t.id && { backgroundColor: t.color + '20', borderColor: t.color },
                ]}
                onPress={() => setLocal((f) => ({ ...f, type: f.type === t.id ? undefined : t.id as CallType }))}
              >
                <Text style={[styles.filterChipText, { color: local.type === t.id ? t.color : textSecondary }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Modality */}
          <Text style={[styles.filterLabel, { color: textSecondary }]}>MODALITÉ</Text>
          <View style={styles.filterChips}>
            {[
              { id: 'presentiel', label: 'Présentiel' },
              { id: 'en_ligne', label: 'En ligne' },
              { id: 'hybride', label: 'Hybride' },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.filterChip,
                  { borderColor: border },
                  local.modality === m.id && { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
                ]}
                onPress={() => setLocal((f) => ({ ...f, modality: f.modality === m.id ? undefined : m.id as Modality }))}
              >
                <Text style={[styles.filterChipText, { color: local.modality === m.id ? COLORS.primary : textSecondary }]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Domain */}
          <Text style={[styles.filterLabel, { color: textSecondary }]}>DOMAINE</Text>
          <View style={styles.filterChips}>
            {RESEARCH_DOMAINS.slice(0, 12).map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.filterChip,
                  { borderColor: border },
                  local.domain === d && { backgroundColor: COLORS.secondary + '20', borderColor: COLORS.secondary },
                ]}
                onPress={() => setLocal((f) => ({ ...f, domain: f.domain === d ? undefined : d }))}
              >
                <Text style={[styles.filterChipText, { color: local.domain === d ? COLORS.secondary : textSecondary }]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Country */}
          <Text style={[styles.filterLabel, { color: textSecondary }]}>PAYS</Text>
          <View style={styles.filterChips}>
            {CAMES_COUNTRIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.filterChip,
                  { borderColor: border },
                  local.country === c && { backgroundColor: COLORS.success + '20', borderColor: COLORS.success },
                ]}
                onPress={() => setLocal((f) => ({ ...f, country: f.country === c ? undefined : c }))}
              >
                <Text style={[styles.filterChipText, { color: local.country === c ? COLORS.success : textSecondary }]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.modalFooter, { backgroundColor: surface, borderTopColor: border }]}>
          <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(local)}>
            <Text style={styles.applyBtnText}>Appliquer les filtres</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 8, borderBottomWidth: 1 },
  headerTitle: { fontSize: 28, fontWeight: '800', paddingHorizontal: 16, marginBottom: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 16 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: { backgroundColor: COLORS.primary },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.danger, alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  suggestions: {
    position: 'absolute', top: '100%', left: 16, right: 60,
    borderRadius: 12, borderWidth: 1, zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  suggestionText: { fontSize: 14 },
  resultsBar: { paddingHorizontal: 16, paddingVertical: 8 },
  resultsText: { fontSize: 13 },
  sortRow: { paddingVertical: 8 },
  sortChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, backgroundColor: 'transparent',
  },
  sortChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sortChipText: { fontSize: 13 },
  sortChipTextActive: { color: '#fff', fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  filterLabel: { fontSize: 11, fontWeight: '700', marginBottom: 10, marginTop: 20, letterSpacing: 1 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  filterChipText: { fontSize: 13 },
  modalFooter: { padding: 16, paddingBottom: 36, borderTopWidth: 1 },
  applyBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
'@

Write-Host "Batch 3 complete (file 14)"

# File 15 — mobile/app/(tabs)/favorites.tsx
Write-File "mobile/app/(tabs)/favorites.tsx" @'
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, useColorScheme,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { favoritesApi, Call } from '../../src/services/api';
import { useFavStore, usePrefsStore } from '../../src/store';
import CallCard from '../../src/components/CallCard';
import { COLORS } from '../../src/constants';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const { theme } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  const { setFavorites } = useFavStore();

  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesApi.list()
      .then((res) => {
        setCalls(res.data);
        setFavorites(res.data.map((c) => c.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const surface = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Text style={[styles.title, { color: textPrimary }]}>Favoris</Text>
        {calls.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: COLORS.primary + '20' }]}>
            <Text style={[styles.countText, { color: COLORS.primary }]}>{calls.length}</Text>
          </View>
        )}
      </View>

      <FlashList
        data={calls}
        estimatedItemSize={160}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <CallCard
            call={item}
            onPress={() => router.push(`/calls/${item.id}`)}
            colorScheme={isDark ? 'dark' : 'light'}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={56} color={textSecondary} />
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>Aucun favori</Text>
              <Text style={[styles.emptyDesc, { color: textSecondary }]}>
                Sauvegardez des appels pour les retrouver ici facilement
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontWeight: '800' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countText: { fontSize: 14, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
'@

# File 16 — mobile/app/(tabs)/notifications.tsx
Write-File "mobile/app/(tabs)/notifications.tsx" @'
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, useColorScheme,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { notificationsApi, AppNotification } from '../../src/services/api';
import { useBadgeStore, usePrefsStore } from '../../src/store';
import { COLORS } from '../../src/constants';

const TYPE_CONFIG = {
  new_call: { icon: 'add-circle', color: COLORS.primary },
  deadline_reminder: { icon: 'time', color: COLORS.warning },
  moderation_result: { icon: 'checkmark-shield', color: COLORS.success },
};

function formatDate(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return format(d, "HH'h'mm");
  if (isYesterday(d)) return 'Hier';
  return format(d, 'dd MMM', { locale: fr });
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const { theme } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  const { reset } = useBadgeStore();

  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.list()
      .then((res) => setNotifs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {});
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    reset();
  };

  const markOne = async (id: string) => {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const surface = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Text style={[styles.title, { color: textPrimary }]}>Notifications</Text>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '600' }}>
              Tout lire ({unread})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlashList
        data={notifs}
        estimatedItemSize={80}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const conf = TYPE_CONFIG[item.type];
          return (
            <TouchableOpacity
              style={[
                styles.notifRow,
                { borderBottomColor: border },
                !item.isRead && { backgroundColor: isDark ? '#1D3461' : '#EFF6FF' },
              ]}
              onPress={() => {
                markOne(item.id);
                if (item.callId) router.push(`/calls/${item.callId}`);
              }}
            >
              <View style={[styles.notifIcon, { backgroundColor: conf.color + '20' }]}>
                <Ionicons name={conf.icon as any} size={20} color={conf.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.notifTitle, { color: textPrimary }]}>{item.title}</Text>
                <Text style={[styles.notifBody, { color: textSecondary }]} numberOfLines={2}>
                  {item.body}
                </Text>
              </View>
              <View style={styles.notifRight}>
                <Text style={[styles.notifDate, { color: textSecondary }]}>
                  {formatDate(item.createdAt)}
                </Text>
                {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: COLORS.primary }]} />}
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={48} color={textSecondary} />
              <Text style={[styles.emptyText, { color: textSecondary }]}>Aucune notification</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontWeight: '800' },
  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  notifIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  notifTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  notifBody: { fontSize: 13, lineHeight: 18 },
  notifRight: { alignItems: 'flex-end', gap: 6 },
  notifDate: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  empty: { alignItems: 'center', paddingTop: 100, gap: 12 },
  emptyText: { fontSize: 16 },
});
'@

Write-Host "Batch 4 complete (files 15-16)"

# File 17 — mobile/app/(tabs)/profile.tsx
Write-File "mobile/app/(tabs)/profile.tsx" @'
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Alert, useColorScheme, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore, usePrefsStore } from '../../src/store';
import { usersApi } from '../../src/services/api';
import { COLORS } from '../../src/constants';

const APP_VERSION = '2.0.0';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { theme, setTheme, language, setLanguage } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  const { user, setUser, logout } = useAuthStore();

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const surface = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);
      try {
        const { avatarUrl } = await usersApi.uploadAvatar(formData);
        setUser({ ...user!, avatarUrl });
      } catch {
        Alert.alert('Erreur', 'Impossible de mettre à jour la photo');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            await usersApi.deleteAccount().catch(() => {});
            await logout();
          },
        },
      ],
    );
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textSecondary }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: surface, borderColor: border }]}>
        {children}
      </View>
    </View>
  );

  const Row = ({
    icon, label, value, onPress, danger = false, rightEl,
  }: {
    icon: string; label: string; value?: string; onPress?: () => void;
    danger?: boolean; rightEl?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: border }]}
      onPress={onPress}
      disabled={!onPress && !rightEl}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? COLORS.danger + '15' : COLORS.primary + '15' }]}>
        <Ionicons name={icon as any} size={18} color={danger ? COLORS.danger : COLORS.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? COLORS.danger : textPrimary }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={[styles.rowValue, { color: textSecondary }]}>{value}</Text>}
        {rightEl}
        {onPress && <Ionicons name="chevron-forward" size={16} color={textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.profileHeader, { backgroundColor: surface, borderBottomColor: border }]}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrap}>
            <Image
              source={{
                uri: user?.avatarUrl ??
                  `https://api.dicebear.com/8.x/initials/svg?seed=${user?.firstName ?? 'R'}+${user?.lastName ?? 'C'}`,
              }}
              style={styles.avatar}
            />
            <View style={[styles.avatarEdit, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: textPrimary }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.profileEmail, { color: textSecondary }]}>{user?.email}</Text>
          {user?.institution && (
            <Text style={[styles.profileInstitution, { color: textSecondary }]}>
              🏛️ {user.institution}
            </Text>
          )}
          <View style={styles.domainChips}>
            {(user?.domains ?? []).slice(0, 3).map((d) => (
              <View key={d} style={[styles.domainChip, { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary + '30' }]}>
                <Text style={[styles.domainText, { color: COLORS.primary }]}>{d}</Text>
              </View>
            ))}
            {(user?.domains?.length ?? 0) > 3 && (
              <View style={[styles.domainChip, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '20' }]}>
                <Text style={[styles.domainText, { color: COLORS.primary }]}>
                  +{(user?.domains?.length ?? 0) - 3}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.quickActions}>
          {[
            { icon: 'person-outline', label: 'Mon profil', route: '/profile/edit' },
            { icon: 'megaphone-outline', label: 'Mes appels', route: '/publish/my-calls' },
            { icon: 'checkmark-done-outline', label: 'Candidatures', route: '/tracker/index' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.quickAction, { backgroundColor: surface, borderColor: border }]}
              onPress={() => router.push(item.route as any)}
            >
              <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
              <Text style={[styles.quickActionLabel, { color: textPrimary }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Préférences */}
        <Section title="PRÉFÉRENCES">
          <Row
            icon="moon-outline"
            label="Mode sombre"
            rightEl={
              <Switch
                value={isDark}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                trackColor={{ true: COLORS.primary }}
                thumbColor="#fff"
              />
            }
          />
          <Row
            icon="language-outline"
            label="Langue"
            value={language === 'fr' ? 'Français' : 'English'}
            onPress={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          />
          <Row
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.push('/profile/notifications' as any)}
          />
        </Section>

        {/* À propos */}
        <Section title="À PROPOS">
          <Row
            icon="information-circle-outline"
            label="À propos de ResearchCall"
            onPress={() => router.push('/profile/about' as any)}
          />
          <Row icon="code-slash-outline" label="Version" value={APP_VERSION} />
          <Row
            icon="shield-checkmark-outline"
            label="Politique de confidentialité"
            onPress={() => Linking.openURL('https://researchcall.ci/privacy')}
          />
          <Row
            icon="document-text-outline"
            label="Conditions d'utilisation"
            onPress={() => Linking.openURL('https://researchcall.ci/terms')}
          />
          <Row
            icon="help-circle-outline"
            label="Aide & Support"
            onPress={() => Linking.openURL('mailto:support@researchcall.ci')}
          />
        </Section>

        {/* Compte */}
        <Section title="COMPTE">
          <Row icon="log-out-outline" label="Se déconnecter" onPress={handleLogout} danger />
          <Row icon="trash-outline" label="Supprimer mon compte" onPress={handleDeleteAccount} danger />
        </Section>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    alignItems: 'center', paddingTop: 56, paddingBottom: 24,
    paddingHorizontal: 20, borderBottomWidth: 1,
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarEdit: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  profileName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  profileEmail: { fontSize: 14, marginBottom: 4 },
  profileInstitution: { fontSize: 13, marginBottom: 10 },
  domainChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  domainChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  domainText: { fontSize: 11, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: 10, padding: 16 },
  quickAction: {
    flex: 1, alignItems: 'center', gap: 6,
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  quickActionLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1,
  },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14 },
});
'@

Write-Host "Batch 5 complete (file 17)"

# File 18 — mobile/app/calls/[id].tsx
Write-File "mobile/app/calls/[id].tsx" @'
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Alert, useColorScheme, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { callsApi, Call, favoritesApi, attachmentsApi } from '../../src/services/api';
import { useFavStore, useTrackerStore, usePrefsStore } from '../../src/store';
import { DeadlineBar } from '../../src/components/DeadlineBar';
import { addCallToCalendar, addEventToCalendar } from '../../src/utils/calendar';
import { shareCall } from '../../src/utils/share';
import { CALL_TYPES, COLORS } from '../../src/constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function CallDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const { theme } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');

  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const { isFavorite, addFavorite, removeFavorite } = useFavStore();
  const { getByCallId } = useTrackerStore();
  const tracked = call ? getByCallId(call.id) : undefined;
  const fav = call ? isFavorite(call.id) : false;

  const typeInfo = call ? CALL_TYPES.find((t) => t.id === call.type) : null;

  useEffect(() => {
    if (!id) return;
    callsApi.getById(id)
      .then(setCall)
      .catch(() => Alert.alert('Erreur', 'Impossible de charger cet appel'))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFav = async () => {
    if (!call) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (fav) {
      removeFavorite(call.id);
      favoritesApi.remove(call.id).catch(() => addFavorite(call.id));
    } else {
      addFavorite(call.id);
      favoritesApi.add(call.id).catch(() => removeFavorite(call.id));
    }
  };

  const handleCalendar = async () => {
    if (!call) return;
    setCalendarLoading(true);
    const ok = await addCallToCalendar(call);
    setCalendarLoading(false);
    if (ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Ajouté !', 'La deadline a été ajoutée à votre calendrier avec 3 rappels.');
    } else {
      Alert.alert('Permission refusée', "Autorisez l'accès au calendrier dans les paramètres.");
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const localUri = FileSystem.documentDirectory + fileName;
      await FileSystem.downloadAsync(fileUrl, localUri);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri);
      }
    } catch {
      Alert.alert('Erreur', 'Téléchargement impossible');
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? COLORS.background.dark : COLORS.background.light }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!call) return null;

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const surface = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  const isExpired = new Date(call.submissionDeadline) < new Date();

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[typeInfo?.color + 'CC' ?? '#3B82F6CC', isDark ? '#0F172A' : '#F8FAFC']}
          style={styles.hero}
        >
          {/* Nav bar */}
          <View style={styles.navBar}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={textPrimary} />
            </TouchableOpacity>
            <View style={styles.navActions}>
              <TouchableOpacity style={styles.navBtn} onPress={() => shareCall(call)}>
                <Ionicons name="share-outline" size={22} color={textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={toggleFav}>
                <Ionicons
                  name={fav ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={fav ? COLORS.primary : textPrimary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Badge */}
          <View style={[styles.typeBadge, { backgroundColor: typeInfo?.color + '25', borderColor: typeInfo?.color + '50' }]}>
            <Ionicons name={typeInfo?.icon as any} size={14} color={typeInfo?.color} />
            <Text style={[styles.typeBadgeText, { color: typeInfo?.color }]}>{typeInfo?.label}</Text>
            {isExpired && (
              <View style={styles.expiredTag}>
                <Text style={styles.expiredTagText}>Expiré</Text>
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: textPrimary }]}>{call.title}</Text>

          {/* Publisher */}
          <View style={styles.publisherRow}>
            <Image
              source={{ uri: call.publisher.avatarUrl ?? `https://api.dicebear.com/8.x/initials/svg?seed=${call.publisher.firstName}` }}
              style={styles.publisherAvatar}
            />
            <View>
              <Text style={[styles.publisherName, { color: textPrimary }]}>
                {call.publisher.firstName} {call.publisher.lastName}
              </Text>
              {call.publisher.institution && (
                <Text style={[styles.publisherInstitution, { color: textSecondary }]}>
                  {call.publisher.institution}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Deadline bar */}
        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>DEADLINE DE SOUMISSION</Text>
          <Text style={[styles.deadlineDate, { color: textPrimary }]}>
            {format(parseISO(call.submissionDeadline), 'EEEE dd MMMM yyyy', { locale: fr })}
          </Text>
          <DeadlineBar deadline={call.submissionDeadline} createdAt={call.createdAt} />
        </View>

        {/* Quick info */}
        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          {[
            call.locationCountry && {
              icon: 'location',
              label: 'Lieu',
              value: [call.locationCity, call.locationCountry].filter(Boolean).join(', '),
            },
            call.locationModality && {
              icon: 'globe',
              label: 'Modalité',
              value: call.locationModality === 'en_ligne' ? 'En ligne' :
                call.locationModality === 'hybride' ? 'Hybride' : 'Présentiel',
            },
            call.language && { icon: 'language', label: 'Langue', value: call.language.toUpperCase() },
            call.eventStartDate && {
              icon: 'calendar',
              label: 'Événement',
              value: format(parseISO(call.eventStartDate), 'dd MMM yyyy', { locale: fr }) +
                (call.eventEndDate ? ` → ${format(parseISO(call.eventEndDate), 'dd MMM yyyy', { locale: fr })}` : ''),
            },
          ].filter(Boolean).map((item: any) => (
            <View key={item.label} style={styles.infoRow}>
              <Ionicons name={item.icon} size={16} color={typeInfo?.color ?? COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: textSecondary }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: textPrimary }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Domains */}
        {call.domains.length > 0 && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>DOMAINES</Text>
            <View style={styles.chips}>
              {call.domains.map((d) => (
                <View key={d} style={[styles.domainChip, { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary + '30' }]}>
                  <Text style={[styles.domainChipText, { color: COLORS.primary }]}>{d}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Thematic axes */}
        {call.thematicAxes.length > 0 && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>AXES THÉMATIQUES</Text>
            {call.thematicAxes.map((ax, i) => (
              <View key={i} style={styles.axisRow}>
                <View style={[styles.axisDot, { backgroundColor: typeInfo?.color ?? COLORS.primary }]} />
                <Text style={[styles.axisText, { color: textPrimary }]}>{ax}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Description */}
        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.sectionLabel, { color: textSecondary }]}>DESCRIPTION</Text>
          <Text style={[styles.description, { color: textPrimary }]}>{call.description}</Text>
        </View>

        {/* Submission conditions */}
        {call.submissionConditions && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>CONDITIONS DE SOUMISSION</Text>
            <Text style={[styles.description, { color: textPrimary }]}>{call.submissionConditions}</Text>
          </View>
        )}

        {/* Attachments */}
        {call.attachments && call.attachments.length > 0 && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>PIÈCES JOINTES</Text>
            {call.attachments.map((att) => (
              <TouchableOpacity
                key={att.id}
                style={[styles.attachmentRow, { borderColor: border }]}
                onPress={() => handleDownload(att.fileUrl, att.fileName)}
              >
                <Ionicons
                  name={att.mimeType.includes('pdf') ? 'document' : 'image'}
                  size={20}
                  color={COLORS.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.attName, { color: textPrimary }]} numberOfLines={1}>
                    {att.fileName}
                  </Text>
                  <Text style={[styles.attSize, { color: textSecondary }]}>
                    {(att.fileSize / 1024).toFixed(0)} KB
                  </Text>
                </View>
                <Ionicons name="download-outline" size={20} color={textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Track application */}
        <TouchableOpacity
          style={[styles.trackBtn, { borderColor: border, backgroundColor: surface }]}
          onPress={() => router.push({ pathname: '/tracker/index', params: { callId: call.id } })}
        >
          <Ionicons
            name={tracked ? 'checkmark-circle' : 'add-circle-outline'}
            size={20}
            color={tracked ? COLORS.success : textSecondary}
          />
          <Text style={[styles.trackBtnText, { color: tracked ? COLORS.success : textSecondary }]}>
            {tracked ? `Candidature suivie — ${tracked.status}` : 'Suivre ma candidature'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky footer actions */}
      <View style={[styles.footer, { backgroundColor: surface, borderTopColor: border }]}>
        <TouchableOpacity
          style={[styles.footerBtn, { borderColor: border }]}
          onPress={handleCalendar}
          disabled={calendarLoading || isExpired}
        >
          {calendarLoading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Ionicons name="calendar-outline" size={22} color={isExpired ? textSecondary : COLORS.primary} />
          )}
          <Text style={[styles.footerBtnText, { color: isExpired ? textSecondary : COLORS.primary }]}>
            Calendrier
          </Text>
        </TouchableOpacity>

        {call.contactEmail && (
          <TouchableOpacity
            style={[styles.footerBtn, { borderColor: border }]}
            onPress={() => Linking.openURL(`mailto:${call.contactEmail}`)}
          >
            <Ionicons name="mail-outline" size={22} color={COLORS.secondary} />
            <Text style={[styles.footerBtnText, { color: COLORS.secondary }]}>Contact</Text>
          </TouchableOpacity>
        )}

        {call.externalUrl && (
          <TouchableOpacity
            style={[styles.footerBtnPrimary]}
            onPress={() => Linking.openURL(call.externalUrl!)}
          >
            <Ionicons name="open-outline" size={20} color="#fff" />
            <Text style={styles.footerBtnPrimaryText}>Voir le site</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  navBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  navActions: { flexDirection: 'row', gap: 8 },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, marginBottom: 12,
  },
  typeBadgeText: { fontSize: 13, fontWeight: '600' },
  expiredTag: { backgroundColor: COLORS.danger, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  expiredTagText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 30, marginBottom: 16 },
  publisherRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  publisherAvatar: { width: 36, height: 36, borderRadius: 18 },
  publisherName: { fontSize: 14, fontWeight: '600' },
  publisherInstitution: { fontSize: 12 },
  section: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 16,
    padding: 16, borderWidth: 1,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },
  deadlineDate: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  infoLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  domainChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  domainChipText: { fontSize: 12, fontWeight: '600' },
  axisRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  axisDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  axisText: { flex: 1, fontSize: 14, lineHeight: 20 },
  description: { fontSize: 14, lineHeight: 22 },
  attachmentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  attName: { fontSize: 14, fontWeight: '500' },
  attSize: { fontSize: 12 },
  trackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
  trackBtnText: { fontSize: 14, fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 16, paddingBottom: 36, borderTopWidth: 1,
  },
  footerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1,
  },
  footerBtnText: { fontSize: 14, fontWeight: '600' },
  footerBtnPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 13,
  },
  footerBtnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
'@

Write-Host "Batch 6 complete (file 18)"

# File 19 — mobile/app/publish/index.tsx
Write-File "mobile/app/publish/index.tsx" @'
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { callsApi, CallType, Modality } from '../../src/services/api';
import { usePrefsStore } from '../../src/store';
import { CALL_TYPES, CAMES_COUNTRIES, COLORS, RESEARCH_DOMAINS } from '../../src/constants';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  'Informations générales',
  'Dates & lieu',
  'Détails & contact',
  'Domaines & axes',
  'Révision',
];

export default function PublishScreen() {
  const colorScheme = useColorScheme();
  const { theme } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'colloque' as CallType,
    description: '',
    submissionDeadline: new Date(),
    eventStartDate: undefined as Date | undefined,
    eventEndDate: undefined as Date | undefined,
    locationCity: '',
    locationCountry: '',
    locationModality: 'presentiel' as Modality,
    contactEmail: '',
    externalUrl: '',
    submissionConditions: '',
    domains: [] as string[],
    thematicAxes: [''],
    language: 'fr',
  });

  const u = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const surface = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: textSecondary }]}>{label}</Text>
      {children}
    </View>
  );

  const Input = ({ value, onChangeText, placeholder, multiline = false }: any) => (
    <TextInput
      style={[
        styles.input,
        { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: border, color: textPrimary },
        multiline && { height: 100, textAlignVertical: 'top' },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={textSecondary}
      multiline={multiline}
    />
  );

  const publish = async (asDraft = false) => {
    if (!form.title.trim()) { Alert.alert('Erreur', 'Le titre est obligatoire'); return; }
    if (!form.description.trim()) { Alert.alert('Erreur', 'La description est obligatoire'); return; }

    setLoading(true);
    try {
      await callsApi.create({
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim(),
        submissionDeadline: form.submissionDeadline.toISOString(),
        eventStartDate: form.eventStartDate?.toISOString(),
        eventEndDate: form.eventEndDate?.toISOString(),
        locationCity: form.locationCity.trim() || undefined,
        locationCountry: form.locationCountry || undefined,
        locationModality: form.locationModality,
        contactEmail: form.contactEmail.trim() || undefined,
        externalUrl: form.externalUrl.trim() || undefined,
        submissionConditions: form.submissionConditions.trim() || undefined,
        domains: form.domains,
        thematicAxes: form.thematicAxes.filter(Boolean),
        language: form.language,
        status: asDraft ? 'draft' : 'pending',
      });
      Alert.alert(
        asDraft ? 'Brouillon sauvegardé' : 'Appel soumis !',
        asDraft
          ? 'Votre brouillon a été sauvegardé.'
          : "Votre appel est en attente de validation par l'équipe ResearchCall.",
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de publier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => step > 1 ? setStep((s) => (s - 1) as Step) : router.back()}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Publier un appel</Text>
          <Text style={[styles.headerStep, { color: textSecondary }]}>
            Étape {step}/{STEPS.length} — {STEPS[step - 1]}
          </Text>
        </View>
        <TouchableOpacity onPress={() => publish(true)} disabled={loading}>
          <Text style={{ color: textSecondary, fontSize: 13 }}>Brouillon</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: border }]}>
        <View style={[styles.progressFill, { width: `${(step / STEPS.length) * 100}%`, backgroundColor: COLORS.primary }]} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <>
            <Field label="TITRE DE L'APPEL *">
              <Input value={form.title} onChangeText={(v: string) => u('title', v)} placeholder="Ex: Appel à communications — Colloque CAMES 2026" />
            </Field>

            <Field label="TYPE D'APPEL *">
              <View style={styles.typeGrid}>
                {CALL_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.typeCard,
                      { borderColor: border, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
                      form.type === t.id && { borderColor: t.color, backgroundColor: t.color + '15' },
                    ]}
                    onPress={() => u('type', t.id)}
                  >
                    <Ionicons name={t.icon as any} size={20} color={form.type === t.id ? t.color : textSecondary} />
                    <Text style={[styles.typeCardText, { color: form.type === t.id ? t.color : textSecondary }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <Field label="DESCRIPTION *">
              <Input value={form.description} onChangeText={(v: string) => u('description', v)} placeholder="Décrivez l'appel en détail…" multiline />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="DATE LIMITE DE SOUMISSION *">
              <Text style={[styles.dateDisplay, { color: textPrimary, borderColor: border }]}>
                {format(form.submissionDeadline, 'EEEE dd MMMM yyyy', { locale: fr })}
              </Text>
              <DateTimePicker
                value={form.submissionDeadline}
                mode="date"
                onChange={(_, d) => d && u('submissionDeadline', d)}
                minimumDate={new Date()}
                style={{ alignSelf: 'flex-start' }}
              />
            </Field>

            <Field label="PAYS">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CAMES_COUNTRIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.countryChip,
                      { borderColor: border },
                      form.locationCountry === c && { backgroundColor: COLORS.success + '15', borderColor: COLORS.success },
                    ]}
                    onPress={() => u('locationCountry', form.locationCountry === c ? '' : c)}
                  >
                    <Text style={[styles.countryText, { color: form.locationCountry === c ? COLORS.success : textSecondary }]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Field>

            <Field label="VILLE">
              <Input value={form.locationCity} onChangeText={(v: string) => u('locationCity', v)} placeholder="Ex: Abidjan" />
            </Field>

            <Field label="MODALITÉ">
              <View style={styles.row3}>
                {[
                  { id: 'presentiel', label: 'Présentiel', icon: 'location' },
                  { id: 'en_ligne', label: 'En ligne', icon: 'globe' },
                  { id: 'hybride', label: 'Hybride', icon: 'git-branch' },
                ].map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.modalityCard,
                      { borderColor: border },
                      form.locationModality === m.id && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
                    ]}
                    onPress={() => u('locationModality', m.id)}
                  >
                    <Ionicons name={m.icon as any} size={18} color={form.locationModality === m.id ? COLORS.primary : textSecondary} />
                    <Text style={[{ fontSize: 12, color: form.locationModality === m.id ? COLORS.primary : textSecondary, fontWeight: '600' }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="EMAIL DE CONTACT">
              <Input value={form.contactEmail} onChangeText={(v: string) => u('contactEmail', v)} placeholder="contact@institution.ci" />
            </Field>
            <Field label="SITE WEB / URL EXTERNE">
              <Input value={form.externalUrl} onChangeText={(v: string) => u('externalUrl', v)} placeholder="https://..." />
            </Field>
            <Field label="CONDITIONS DE SOUMISSION">
              <Input value={form.submissionConditions} onChangeText={(v: string) => u('submissionConditions', v)} placeholder="Conditions, format requis…" multiline />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <Field label="DOMAINES DE RECHERCHE">
              <View style={styles.domainGrid}>
                {RESEARCH_DOMAINS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.domainChip,
                      { borderColor: border },
                      form.domains.includes(d) && { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
                    ]}
                    onPress={() => {
                      const next = form.domains.includes(d)
                        ? form.domains.filter((x) => x !== d)
                        : [...form.domains, d];
                      u('domains', next);
                    }}
                  >
                    <Text style={[{ fontSize: 12, color: form.domains.includes(d) ? COLORS.primary : textSecondary, fontWeight: form.domains.includes(d) ? '700' : '400' }]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <Field label="AXES THÉMATIQUES">
              {form.thematicAxes.map((ax, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <Input
                    value={ax}
                    onChangeText={(v: string) => {
                      const next = [...form.thematicAxes];
                      next[i] = v;
                      u('thematicAxes', next);
                    }}
                    placeholder={`Axe ${i + 1}`}
                  />
                  {form.thematicAxes.length > 1 && (
                    <TouchableOpacity
                      onPress={() => u('thematicAxes', form.thematicAxes.filter((_, j) => j !== i))}
                      style={{ justifyContent: 'center' }}
                    >
                      <Ionicons name="close-circle" size={22} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity onPress={() => u('thematicAxes', [...form.thematicAxes, ''])} style={styles.addAxisBtn}>
                <Ionicons name="add" size={18} color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>Ajouter un axe</Text>
              </TouchableOpacity>
            </Field>
          </>
        )}

        {step === 5 && (
          <View style={[styles.reviewCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.reviewTitle, { color: textPrimary }]}>Récapitulatif</Text>
            {[
              { label: 'Titre', value: form.title },
              { label: 'Type', value: CALL_TYPES.find((t) => t.id === form.type)?.label },
              { label: 'Deadline', value: format(form.submissionDeadline, 'dd MMMM yyyy', { locale: fr }) },
              { label: 'Lieu', value: [form.locationCity, form.locationCountry].filter(Boolean).join(', ') || '—' },
              { label: 'Modalité', value: form.locationModality },
              { label: 'Domaines', value: form.domains.join(', ') || '—' },
              { label: 'Contact', value: form.contactEmail || '—' },
            ].map((item) => (
              <View key={item.label} style={[styles.reviewRow, { borderBottomColor: border }]}>
                <Text style={[styles.reviewLabel, { color: textSecondary }]}>{item.label}</Text>
                <Text style={[styles.reviewValue, { color: textPrimary }]} numberOfLines={2}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: surface, borderTopColor: border }]}>
        {step < 5 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep((s) => (s + 1) as Step)}>
            <Text style={styles.nextBtnText}>Suivant</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, loading && { opacity: 0.7 }]}
            onPress={() => publish(false)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="megaphone" size={18} color="#fff" />
                <Text style={styles.nextBtnText}>Soumettre l'appel</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerStep: { fontSize: 12 },
  progressTrack: { height: 3 },
  progressFill: { height: 3, borderRadius: 2 },
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    borderRadius: 12, padding: 13, fontSize: 15,
    borderWidth: 1,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: {
    width: '30%', alignItems: 'center', gap: 6, padding: 12,
    borderRadius: 12, borderWidth: 1,
  },
  typeCardText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  dateDisplay: { fontSize: 15, fontWeight: '600', marginBottom: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  countryChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginRight: 8,
  },
  countryText: { fontSize: 13 },
  row3: { flexDirection: 'row', gap: 8 },
  modalityCard: {
    flex: 1, alignItems: 'center', gap: 6, padding: 12, borderRadius: 12, borderWidth: 1,
  },
  domainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  domainChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  addAxisBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, marginTop: 4,
  },
  reviewCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', padding: 16 },
  reviewTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  reviewRow: {
    flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, gap: 16,
  },
  reviewLabel: { fontSize: 13, width: 80, fontWeight: '600' },
  reviewValue: { flex: 1, fontSize: 14 },
  footer: { padding: 16, paddingBottom: 36, borderTopWidth: 1 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
'@

Write-Host "Batch 7 complete (file 19)"

# File 20 — mobile/app/tracker/index.tsx
Write-File "mobile/app/tracker/index.tsx" @'
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { callsApi } from '../../src/services/api';
import {
  useTrackerStore, AppStatus, TrackedApplication, usePrefsStore,
} from '../../src/store';
import { COLORS } from '../../src/constants';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; icon: string }> = {
  interested: { label: 'Intéressé', color: '#94A3B8', icon: 'bookmark-outline' },
  inProgress: { label: 'En cours', color: COLORS.warning, icon: 'create-outline' },
  submitted: { label: 'Soumis', color: COLORS.primary, icon: 'send' },
  accepted: { label: 'Accepté', color: COLORS.success, icon: 'checkmark-circle' },
  rejected: { label: 'Refusé', color: COLORS.danger, icon: 'close-circle' },
};

export default function TrackerScreen() {
  const colorScheme = useColorScheme();
  const { theme } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  const params = useLocalSearchParams<{ callId?: string }>();

  const { applications, loadApplications, addOrUpdate, remove } = useTrackerStore();
  const [editTarget, setEditTarget] = useState<TrackedApplication | null>(null);
  const [showModal, setShowModal] = useState(false);

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const surface = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  useEffect(() => {
    loadApplications();
    if (params.callId) {
      callsApi.getById(params.callId).then((call) => {
        setEditTarget({
          callId: call.id,
          callTitle: call.title,
          callType: call.type,
          deadline: call.submissionDeadline,
          status: 'interested',
          notes: '',
          updatedAt: new Date().toISOString(),
        });
        setShowModal(true);
      }).catch(() => {});
    }
  }, [params.callId]);

  const grouped = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s as AppStatus] = applications.filter((a) => a.status === s);
    return acc;
  }, {} as Record<AppStatus, TrackedApplication[]>);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textPrimary }]}>Suivi candidatures</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {applications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={56} color={textSecondary} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>Aucune candidature suivie</Text>
            <Text style={[styles.emptyDesc, { color: textSecondary }]}>
              Ouvrez un appel et tapez "Suivre ma candidature" pour commencer
            </Text>
          </View>
        ) : (
          (Object.keys(STATUS_CONFIG) as AppStatus[]).map((status) => {
            const group = grouped[status];
            if (group.length === 0) return null;
            const conf = STATUS_CONFIG[status];
            return (
              <View key={status} style={styles.group}>
                <View style={styles.groupHeader}>
                  <Ionicons name={conf.icon as any} size={16} color={conf.color} />
                  <Text style={[styles.groupTitle, { color: textPrimary }]}>{conf.label}</Text>
                  <View style={[styles.groupCount, { backgroundColor: conf.color + '20' }]}>
                    <Text style={[styles.groupCountText, { color: conf.color }]}>{group.length}</Text>
                  </View>
                </View>
                {group.map((app) => (
                  <TouchableOpacity
                    key={app.callId}
                    style={[styles.appCard, { backgroundColor: surface, borderColor: border }]}
                    onPress={() => { setEditTarget(app); setShowModal(true); }}
                  >
                    <View style={[styles.statusBar, { backgroundColor: conf.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.appTitle, { color: textPrimary }]} numberOfLines={2}>
                        {app.callTitle}
                      </Text>
                      {app.deadline && (
                        <Text style={[styles.appDeadline, { color: textSecondary }]}>
                          Deadline : {format(parseISO(app.deadline), 'dd MMM yyyy', { locale: fr })}
                        </Text>
                      )}
                      {app.notes ? (
                        <Text style={[styles.appNotes, { color: textSecondary }]} numberOfLines={1}>
                          📝 {app.notes}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {editTarget && (
        <EditModal
          app={editTarget}
          visible={showModal}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSave={async (updated) => {
            await addOrUpdate(updated);
            setShowModal(false);
            setEditTarget(null);
          }}
          onDelete={async () => {
            await remove(editTarget.callId);
            setShowModal(false);
            setEditTarget(null);
          }}
          isDark={isDark}
        />
      )}
    </View>
  );
}

function EditModal({ app, visible, onClose, onSave, onDelete, isDark }: {
  app: TrackedApplication;
  visible: boolean;
  onClose: () => void;
  onSave: (a: TrackedApplication) => void;
  onDelete: () => void;
  isDark: boolean;
}) {
  const [status, setStatus] = useState<AppStatus>(app.status);
  const [notes, setNotes] = useState(app.notes);

  useEffect(() => { setStatus(app.status); setNotes(app.notes); }, [app]);

  const surface = isDark ? '#1E293B' : '#fff';
  const bg = isDark ? '#0F172A' : '#F8FAFC';
  const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const border = isDark ? '#334155' : '#E2E8F0';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[{ flex: 1, backgroundColor: bg }]}>
        <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: border, backgroundColor: surface }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: COLORS.primary }}>Fermer</Text>
          </TouchableOpacity>
          <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 16 }}>Suivi candidature</Text>
          <TouchableOpacity onPress={() => onSave({ ...app, status, notes, updatedAt: new Date().toISOString() })}>
            <Text style={{ color: COLORS.success, fontWeight: '700' }}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ color: textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 16 }} numberOfLines={3}>
            {app.callTitle}
          </Text>

          <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>
            STATUT
          </Text>
          {(Object.keys(STATUS_CONFIG) as AppStatus[]).map((s) => {
            const conf = STATUS_CONFIG[s];
            return (
              <TouchableOpacity
                key={s}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  padding: 14, borderRadius: 12, marginBottom: 8,
                  backgroundColor: status === s ? conf.color + '15' : surface,
                  borderWidth: 1, borderColor: status === s ? conf.color : border,
                }}
                onPress={() => setStatus(s)}
              >
                <Ionicons name={conf.icon as any} size={20} color={conf.color} />
                <Text style={{ color: textPrimary, fontSize: 15, flex: 1 }}>{conf.label}</Text>
                {status === s && <Ionicons name="checkmark-circle" size={20} color={conf.color} />}
              </TouchableOpacity>
            );
          })}

          <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginTop: 16, marginBottom: 10 }}>
            NOTES PERSONNELLES
          </Text>
          <TextInput
            style={{
              backgroundColor: surface, borderRadius: 12, padding: 14,
              color: textPrimary, fontSize: 14, borderWidth: 1, borderColor: border,
              minHeight: 100, textAlignVertical: 'top',
            }}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ajoutez des notes sur votre candidature..."
            placeholderTextColor={textSecondary}
            multiline
          />

          <TouchableOpacity
            style={{ marginTop: 24, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.danger + '40' }}
            onPress={() => Alert.alert('Supprimer', 'Retirer ce suivi ?', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: onDelete },
            ])}
          >
            <Text style={{ color: COLORS.danger, fontWeight: '600' }}>Retirer le suivi</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  group: { marginBottom: 20 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  groupTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  groupCount: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  groupCountText: { fontSize: 12, fontWeight: '700' },
  appCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, borderWidth: 1, marginBottom: 8,
    overflow: 'hidden', padding: 14,
  },
  statusBar: { width: 4, height: '100%', borderRadius: 2, position: 'absolute', left: 0, top: 0 },
  appTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, paddingLeft: 6 },
  appDeadline: { fontSize: 12, paddingLeft: 6 },
  appNotes: { fontSize: 12, paddingLeft: 6, marginTop: 2 },
});
'@

Write-Host "Batch 8 complete (file 20)"

# File 21 — mobile/src/services/api.ts
Write-File "mobile/src/services/api.ts" @'
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { API_BASE_URL } from '../constants';

// ─── Token management ────────────────────────────────────────────────────────

const TOKEN_KEY = 'rc_access_token';
const REFRESH_KEY = 'rc_refresh_token';

export const tokenStorage = {
  getAccess: () => SecureStore.getItemAsync(TOKEN_KEY),
  getRefresh: () => SecureStore.getItemAsync(REFRESH_KEY),
  setTokens: async (access: string, refresh: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  },
  clear: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

// ─── Offline cache ────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`cache:${key}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data as T;
  } catch {
    return null;
  }
}

async function setCache(key: string, data: unknown) {
  await AsyncStorage.setItem(`cache:${key}`, JSON.stringify({ data, ts: Date.now() }));
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  auth?: boolean;
  cacheKey?: string;
  multipart?: boolean;
};

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await tokenStorage.getRefresh();
  if (!refresh) return null;
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) {
    await tokenStorage.clear();
    return null;
  }
  const { accessToken, refreshToken } = await res.json();
  await tokenStorage.setTokens(accessToken, refreshToken);
  return accessToken;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = true, cacheKey, multipart = false } = options;

  // Serve from cache when offline
  const net = await NetInfo.fetch();
  if (!net.isConnected && cacheKey) {
    const cached = await getCached<T>(cacheKey);
    if (cached) return cached;
    throw new Error('OFFLINE');
  }

  const buildHeaders = async (): Promise<HeadersInit> => {
    const headers: Record<string, string> = {};
    if (!multipart) headers['Content-Type'] = 'application/json';
    if (auth) {
      const token = await tokenStorage.getAccess();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const doFetch = async (token?: string): Promise<Response> => {
    const headers = await buildHeaders();
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: multipart ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  // Auto-refresh on 401
  if (res.status === 401 && auth) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      refreshQueue.forEach((cb) => newToken && cb(newToken));
      refreshQueue = [];
      if (newToken) {
        res = await doFetch(newToken);
      } else {
        throw new Error('UNAUTHORIZED');
      }
    } else {
      const newToken = await new Promise<string>((resolve) =>
        refreshQueue.push(resolve),
      );
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'API_ERROR');
  }

  const data: T = await res.json();

  if (method === 'GET' && cacheKey) {
    setCache(cacheKey, data).catch(() => {});
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'seeker' | 'publisher' | 'both' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institution?: string;
  laboratory?: string;
  domains: string[];
  interests: string[];
  avatarUrl?: string;
  pushToken?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthTokens>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    institution?: string;
    laboratory?: string;
    domains?: string[];
  }) =>
    apiRequest<AuthTokens>('/auth/register', {
      method: 'POST',
      body: data,
      auth: false,
    }),

  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      auth: false,
    }),
};

// ─── Calls ────────────────────────────────────────────────────────────────────

export type CallType = 'communication' | 'publication' | 'colloque' | 'projet' | 'bourse' | 'autre';
export type CallStatus = 'draft' | 'pending' | 'published' | 'expired' | 'rejected';
export type Modality = 'presentiel' | 'en_ligne' | 'hybride';

export interface Call {
  id: string;
  title: string;
  description: string;
  type: CallType;
  status: CallStatus;
  domains: string[];
  thematicAxes: string[];
  language: string;
  submissionDeadline: string;
  notificationDate?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  locationCity?: string;
  locationCountry?: string;
  locationModality?: Modality;
  submissionConditions?: string;
  contactEmail?: string;
  externalUrl?: string;
  createdAt: string;
  updatedAt: string;
  publisher: {
    id: string;
    firstName: string;
    lastName: string;
    institution?: string;
    avatarUrl?: string;
  };
  attachments?: Attachment[];
  isFavorite?: boolean;
  _relevanceScore?: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchParams {
  q?: string;
  type?: CallType;
  domain?: string;
  country?: string;
  language?: string;
  modality?: Modality;
  deadlineFrom?: string;
  deadlineTo?: string;
  sortBy?: 'relevance' | 'deadline_asc' | 'deadline_desc' | 'created_asc' | 'created_desc';
  page?: number;
  limit?: number;
}

const searchParamsToQuery = (params: SearchParams): string => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  return q.toString();
};

export const callsApi = {
  search: (params: SearchParams) => {
    const qs = searchParamsToQuery(params);
    return apiRequest<PaginatedResponse<Call>>(`/calls?${qs}`, {
      cacheKey: `calls:search:${qs}`,
    });
  },

  feed: (page = 1, limit = 20) =>
    apiRequest<PaginatedResponse<Call>>(`/calls/feed?page=${page}&limit=${limit}`, {
      cacheKey: `calls:feed:${page}`,
    }),

  suggestions: (q: string) =>
    apiRequest<string[]>(`/calls/suggestions?q=${encodeURIComponent(q)}`),

  stats: () =>
    apiRequest<{
      total: number;
      byType: Record<CallType, number>;
      byCountry: Record<string, number>;
      upcoming: number;
      newToday: number;
    }>('/calls/stats', { cacheKey: 'calls:stats' }),

  getById: (id: string) =>
    apiRequest<Call>(`/calls/${id}`, { cacheKey: `call:${id}` }),

  create: (data: Partial<Call>) =>
    apiRequest<Call>('/calls', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Call>) =>
    apiRequest<Call>(`/calls/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiRequest<void>(`/calls/${id}`, { method: 'DELETE' }),
};

// ─── Favorites ────────────────────────────────────────────────────────────────

export const favoritesApi = {
  list: () =>
    apiRequest<{ data: Call[] }>('/favorites', { cacheKey: 'favorites' }),

  add: (callId: string) =>
    apiRequest<void>(`/favorites/${callId}`, { method: 'POST' }),

  remove: (callId: string) =>
    apiRequest<void>(`/favorites/${callId}`, { method: 'DELETE' }),
};

// ─── Notifications ───────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'new_call' | 'deadline_reminder' | 'moderation_result';
  isRead: boolean;
  createdAt: string;
  callId?: string;
}

export const notificationsApi = {
  list: () =>
    apiRequest<{ data: AppNotification[] }>('/notifications', {
      cacheKey: 'notifications',
    }),

  markRead: (id: string) =>
    apiRequest<void>(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllRead: () =>
    apiRequest<void>('/notifications/read-all', { method: 'PUT' }),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  me: () => apiRequest<AuthUser>('/users/me', { cacheKey: 'user:me' }),

  updateProfile: (data: Partial<AuthUser>) =>
    apiRequest<AuthUser>('/users/me', { method: 'PUT', body: data }),

  updateDomains: (domains: string[], interests: string[]) =>
    apiRequest<AuthUser>('/users/me/domains', {
      method: 'PUT',
      body: { domains, interests },
    }),

  updatePushToken: (pushToken: string) =>
    apiRequest<void>('/users/me/push-token', {
      method: 'POST',
      body: { pushToken },
    }),

  uploadAvatar: (formData: FormData) =>
    apiRequest<{ avatarUrl: string }>('/users/me/avatar', {
      method: 'POST',
      body: formData,
      multipart: true,
    }),

  deleteAccount: () =>
    apiRequest<void>('/users/me', { method: 'DELETE' }),
};

// ─── Attachments ─────────────────────────────────────────────────────────────

export const attachmentsApi = {
  list: (callId: string) =>
    apiRequest<{ data: Attachment[] }>(`/calls/${callId}/attachments`),

  upload: (callId: string, formData: FormData) =>
    apiRequest<{ data: Attachment[] }>(`/calls/${callId}/attachments`, {
      method: 'POST',
      body: formData,
      multipart: true,
    }),

  delete: (attachmentId: string) =>
    apiRequest<void>(`/attachments/${attachmentId}`, { method: 'DELETE' }),
};
'@

Write-Host "Batch 9 complete (file 21)"

# File 22 — mobile/src/store/index.ts
Write-File "mobile/src/store/index.ts" @'
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, tokenStorage } from '../services/api';

// ─── Auth store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    await tokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  },
}));

// ─── App preferences store ───────────────────────────────────────────────────

type ThemeMode = 'system' | 'light' | 'dark';
type AppLanguage = 'fr' | 'en';

interface PrefsState {
  theme: ThemeMode;
  language: AppLanguage;
  onboardingDone: boolean;
  pushEnabled: boolean;
  emailDigest: boolean;
  digestFrequency: 'daily' | 'weekly';
  setTheme: (t: ThemeMode) => void;
  setLanguage: (l: AppLanguage) => void;
  setOnboardingDone: () => void;
  setPushEnabled: (v: boolean) => void;
  setEmailDigest: (v: boolean) => void;
  setDigestFrequency: (f: 'daily' | 'weekly') => void;
  loadPrefs: () => Promise<void>;
}

const PREFS_KEY = 'rc_prefs';

export const usePrefsStore = create<PrefsState>((set) => ({
  theme: 'system',
  language: 'fr',
  onboardingDone: false,
  pushEnabled: true,
  emailDigest: false,
  digestFrequency: 'weekly',

  setTheme: (theme) => {
    set({ theme });
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ theme })).catch(() => {});
  },
  setLanguage: (language) => {
    set({ language });
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ language })).catch(() => {});
  },
  setOnboardingDone: () => {
    set({ onboardingDone: true });
    AsyncStorage.setItem('rc_onboarding', '1').catch(() => {});
  },
  setPushEnabled: (pushEnabled) => set({ pushEnabled }),
  setEmailDigest: (emailDigest) => set({ emailDigest }),
  setDigestFrequency: (digestFrequency) => set({ digestFrequency }),

  loadPrefs: async () => {
    const onboarding = await AsyncStorage.getItem('rc_onboarding');
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    const prefs = raw ? JSON.parse(raw) : {};
    set({ onboardingDone: onboarding === '1', ...prefs });
  },
}));

// ─── Favorites cache store ────────────────────────────────────────────────────

interface FavStore {
  favoriteIds: Set<string>;
  setFavorites: (ids: string[]) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavStore = create<FavStore>((set, get) => ({
  favoriteIds: new Set(),
  setFavorites: (ids) => set({ favoriteIds: new Set(ids) }),
  addFavorite: (id) =>
    set((s) => ({ favoriteIds: new Set([...s.favoriteIds, id]) })),
  removeFavorite: (id) =>
    set((s) => {
      const next = new Set(s.favoriteIds);
      next.delete(id);
      return { favoriteIds: next };
    }),
  isFavorite: (id) => get().favoriteIds.has(id),
}));

// ─── Application tracker store ────────────────────────────────────────────────

export type AppStatus = 'interested' | 'inProgress' | 'submitted' | 'accepted' | 'rejected';

export interface TrackedApplication {
  callId: string;
  callTitle: string;
  callType: string;
  deadline?: string;
  status: AppStatus;
  notes: string;
  updatedAt: string;
}

interface TrackerStore {
  applications: TrackedApplication[];
  loadApplications: () => Promise<void>;
  addOrUpdate: (app: TrackedApplication) => Promise<void>;
  remove: (callId: string) => Promise<void>;
  getByCallId: (callId: string) => TrackedApplication | undefined;
}

const TRACKER_KEY = 'rc_tracker';

export const useTrackerStore = create<TrackerStore>((set, get) => ({
  applications: [],

  loadApplications: async () => {
    const raw = await AsyncStorage.getItem(TRACKER_KEY);
    set({ applications: raw ? JSON.parse(raw) : [] });
  },

  addOrUpdate: async (app) => {
    const current = get().applications.filter((a) => a.callId !== app.callId);
    const next = [app, ...current];
    set({ applications: next });
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(next));
  },

  remove: async (callId) => {
    const next = get().applications.filter((a) => a.callId !== callId);
    set({ applications: next });
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(next));
  },

  getByCallId: (callId) => get().applications.find((a) => a.callId === callId),
}));

// ─── Notification badge ───────────────────────────────────────────────────────

interface BadgeStore {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  decrement: () => void;
  reset: () => void;
}

export const useBadgeStore = create<BadgeStore>((set, get) => ({
  unreadCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  decrement: () => set({ unreadCount: Math.max(0, get().unreadCount - 1) }),
  reset: () => set({ unreadCount: 0 }),
}));
'@

# File 23 — mobile/src/constants/index.ts
Write-File "mobile/src/constants/index.ts" @'
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.researchcall.ci/api';

export const CALL_TYPES = [
  { id: 'communication', label: 'Communications', icon: 'mic', color: '#3B82F6' },
  { id: 'publication', label: 'Publications', icon: 'document-text', color: '#8B5CF6' },
  { id: 'colloque', label: 'Colloques', icon: 'people', color: '#EC4899' },
  { id: 'projet', label: 'Projets', icon: 'flask', color: '#F59E0B' },
  { id: 'bourse', label: 'Bourses', icon: 'school', color: '#10B981' },
  { id: 'autre', label: 'Autres', icon: 'ellipsis-horizontal', color: '#6B7280' },
] as const;

export const MODALITIES = [
  { id: 'presentiel', label: 'Présentiel', icon: 'location' },
  { id: 'en_ligne', label: 'En ligne', icon: 'globe' },
  { id: 'hybride', label: 'Hybride', icon: 'git-branch' },
] as const;

export const CAMES_COUNTRIES = [
  'Bénin', 'Burkina Faso', "Côte d'Ivoire", 'Gabon', 'Guinée', 'Madagascar',
  'Mali', 'Mauritanie', 'Niger', 'République du Congo', 'RD Congo', 'Rwanda',
  'Sénégal', 'Tchad', 'Togo', 'Cameroun', 'Comores', 'Djibouti', 'Haïti',
];

export const RESEARCH_DOMAINS = [
  'Sciences exactes et naturelles', "Sciences de l'ingénieur", 'Sciences médicales',
  'Sciences agronomiques', 'Sciences sociales', 'Sciences humaines', 'Lettres et arts',
  'Droit et sciences politiques', 'Sciences économiques et gestion',
  "Sciences de l'information et de la communication", 'Mathématiques',
  'Physique', 'Chimie', 'Biologie', 'Informatique', 'Environnement',
  'Géographie', 'Histoire', 'Philosophie', 'Linguistique',
  'Éducation et formation', 'Santé publique', 'Nutrition', 'Biotechnologie',
];

export const DEADLINE_URGENCY_DAYS = {
  CRITICAL: 3,
  WARNING: 7,
  SOON: 14,
} as const;

export const PAGINATION_LIMIT = 20;

export const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: {
    light: '#F8FAFC',
    dark: '#0F172A',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#1E293B',
  },
  text: {
    primary: { light: '#0F172A', dark: '#F1F5F9' },
    secondary: { light: '#64748B', dark: '#94A3B8' },
    muted: { light: '#94A3B8', dark: '#475569' },
  },
  border: {
    light: '#E2E8F0',
    dark: '#334155',
  },
} as const;
'@

Write-Host "Batch 10 complete (files 22-23)"

# File 24 — mobile/src/i18n/index.ts
Write-File "mobile/src/i18n/index.ts" @'
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

const translations = {
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
      retry: 'Réessayer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      share: 'Partager',
      download: 'Télécharger',
      search: 'Rechercher',
      filter: 'Filtrer',
      all: 'Tous',
      seeAll: 'Voir tout',
      noResults: 'Aucun résultat',
      offline: 'Vous êtes hors ligne',
    },
    auth: {
      welcome: 'Bienvenue sur ResearchCall',
      tagline: "L'agrégateur d'appels scientifiques de l'Afrique francophone",
      login: 'Se connecter',
      register: "S'inscrire",
      logout: 'Se déconnecter',
      email: 'Adresse email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      institution: 'Institution',
      laboratory: 'Laboratoire',
      role: 'Rôle',
      seeker: 'Chercheur',
      publisher: 'Éditeur',
      both: 'Les deux',
      forgotPassword: 'Mot de passe oublié ?',
      resetPassword: 'Réinitialiser le mot de passe',
      alreadyAccount: 'Déjà un compte ?',
      noAccount: 'Pas encore de compte ?',
    },
    home: {
      title: 'Accueil',
      feed: 'Mon fil',
      latestCalls: 'Derniers appels',
      urgentDeadlines: 'Échéances urgentes',
      recommended: 'Recommandés pour vous',
      exploreCategories: 'Explorer par catégorie',
      stats: {
        total: 'appels actifs',
        new: "nouveaux aujourd'hui",
        expiringSoon: 'expirent bientôt',
      },
    },
    calls: {
      title: 'Appels',
      detail: 'Détail',
      deadline: 'Deadline',
      submissionDeadline: 'Date limite de soumission',
      eventDate: "Date de l'événement",
      location: 'Lieu',
      modality: 'Modalité',
      domains: 'Domaines',
      addToCalendar: 'Ajouter au calendrier',
      calendarAdded: 'Ajouté au calendrier !',
      saveCall: 'Sauvegarder',
      unsaveCall: 'Retirer des favoris',
      submit: 'Soumettre',
      trackApplication: 'Suivre ma candidature',
      downloadAttachments: 'Télécharger les pièces jointes',
      contactOrganizers: 'Contacter les organisateurs',
      viewWebsite: 'Voir le site web',
      shareCall: 'Partager cet appel',
      expiredBadge: 'Expiré',
      daysLeft: 'jours restants',
      dayLeft: 'jour restant',
      hoursLeft: 'heures restantes',
      publishedBy: 'Publié par',
    },
    search: {
      placeholder: 'Rechercher un appel, une institution...',
      filters: 'Filtres',
      sortBy: 'Trier par',
      byRelevance: 'Pertinence',
      byDeadline: 'Deadline',
      byDate: 'Date de publication',
      country: 'Pays',
      type: 'Type',
      domain: 'Domaine',
      modality: 'Modalité',
      language: 'Langue',
      clearFilters: 'Effacer les filtres',
      applyFilters: 'Appliquer',
      resultsFor: 'Résultats pour',
    },
    favorites: {
      title: 'Favoris',
      empty: 'Aucun favori sauvegardé',
      emptyDesc: 'Sauvegardez des appels pour les retrouver ici',
    },
    notifications: {
      title: 'Notifications',
      empty: 'Aucune notification',
      markAllRead: 'Tout marquer comme lu',
      newCall: 'Nouvel appel',
      deadlineReminder: 'Rappel deadline',
      moderationResult: 'Résultat modération',
    },
    profile: {
      title: 'Profil',
      myProfile: 'Mon profil',
      editProfile: 'Modifier le profil',
      myPublications: 'Mes publications',
      myApplications: 'Mes candidatures',
      settings: 'Paramètres',
      notifications: 'Notifications',
      language: 'Langue',
      theme: 'Thème',
      darkMode: 'Mode sombre',
      about: 'À propos',
      version: 'Version',
      helpSupport: 'Aide & Support',
      privacyPolicy: 'Politique de confidentialité',
      termsOfService: "Conditions d'utilisation",
      deleteAccount: 'Supprimer mon compte',
    },
    publish: {
      title: 'Publier',
      newCall: 'Nouvel appel',
      step1: 'Informations générales',
      step2: 'Dates et lieu',
      step3: 'Détails et contact',
      step4: 'Pièces jointes',
      step5: 'Révision et publication',
      callTitle: "Titre de l'appel",
      callType: "Type d'appel",
      description: 'Description',
      thematicAxes: 'Axes thématiques',
      submissionDeadline: 'Date limite de soumission',
      notificationDate: 'Date de notification',
      eventStartDate: "Début de l'événement",
      eventEndDate: "Fin de l'événement",
      city: 'Ville',
      country: 'Pays',
      modality: 'Modalité',
      contactEmail: 'Email de contact',
      externalUrl: 'Site web / URL externe',
      submissionConditions: 'Conditions de soumission',
      addAttachment: 'Ajouter un fichier',
      publishNow: 'Publier maintenant',
      saveDraft: 'Sauvegarder le brouillon',
      preview: 'Prévisualiser',
      pending: 'En attente de validation',
      published: 'Publié',
      draft: 'Brouillon',
    },
    tracker: {
      title: 'Suivi candidatures',
      addApplication: 'Suivre un appel',
      status: {
        interested: 'Intéressé',
        inProgress: 'En cours',
        submitted: 'Soumis',
        accepted: 'Accepté',
        rejected: 'Refusé',
      },
      notes: 'Notes personnelles',
      deadline: 'Deadline',
      reminderSet: 'Rappel configuré',
    },
    onboarding: {
      slide1Title: 'Tous les appels en un endroit',
      slide1Desc: 'Communications, publications, bourses, colloques... Centralisés pour vous.',
      slide2Title: 'Alertes personnalisées',
      slide2Desc: 'Recevez des notifications basées sur vos domaines de recherche.',
      slide3Title: 'Ne manquez plus aucune deadline',
      slide3Desc: 'Ajoutez les échéances à votre calendrier en un tap.',
      slide4Title: 'Partagez et publiez',
      slide4Desc: 'Diffusez vos appels auprès de 60 000+ chercheurs africains.',
      getStarted: 'Commencer',
      skip: 'Passer',
      next: 'Suivant',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      share: 'Share',
      download: 'Download',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      seeAll: 'See all',
      noResults: 'No results found',
      offline: 'You are offline',
    },
    auth: {
      welcome: 'Welcome to ResearchCall',
      tagline: 'The scientific call aggregator for francophone Africa',
      login: 'Log in',
      register: 'Sign up',
      logout: 'Log out',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      firstName: 'First name',
      lastName: 'Last name',
      institution: 'Institution',
      laboratory: 'Laboratory',
      role: 'Role',
      seeker: 'Researcher',
      publisher: 'Publisher',
      both: 'Both',
      forgotPassword: 'Forgot password?',
      resetPassword: 'Reset password',
      alreadyAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
    },
    home: {
      title: 'Home',
      feed: 'My feed',
      latestCalls: 'Latest calls',
      urgentDeadlines: 'Urgent deadlines',
      recommended: 'Recommended for you',
      exploreCategories: 'Explore by category',
      stats: {
        total: 'active calls',
        new: 'new today',
        expiringSoon: 'expiring soon',
      },
    },
    calls: {
      title: 'Calls',
      detail: 'Detail',
      deadline: 'Deadline',
      submissionDeadline: 'Submission deadline',
      eventDate: 'Event date',
      location: 'Location',
      modality: 'Modality',
      domains: 'Domains',
      addToCalendar: 'Add to calendar',
      calendarAdded: 'Added to calendar!',
      saveCall: 'Save',
      unsaveCall: 'Remove from favorites',
      submit: 'Submit',
      trackApplication: 'Track application',
      downloadAttachments: 'Download attachments',
      contactOrganizers: 'Contact organizers',
      viewWebsite: 'View website',
      shareCall: 'Share this call',
      expiredBadge: 'Expired',
      daysLeft: 'days left',
      dayLeft: 'day left',
      hoursLeft: 'hours left',
      publishedBy: 'Published by',
    },
    search: {
      placeholder: 'Search calls, institutions...',
      filters: 'Filters',
      sortBy: 'Sort by',
      byRelevance: 'Relevance',
      byDeadline: 'Deadline',
      byDate: 'Publication date',
      country: 'Country',
      type: 'Type',
      domain: 'Domain',
      modality: 'Modality',
      language: 'Language',
      clearFilters: 'Clear filters',
      applyFilters: 'Apply',
      resultsFor: 'Results for',
    },
    favorites: {
      title: 'Favorites',
      empty: 'No saved favorites',
      emptyDesc: 'Save calls to find them here',
    },
    notifications: {
      title: 'Notifications',
      empty: 'No notifications',
      markAllRead: 'Mark all as read',
      newCall: 'New call',
      deadlineReminder: 'Deadline reminder',
      moderationResult: 'Moderation result',
    },
    profile: {
      title: 'Profile',
      myProfile: 'My profile',
      editProfile: 'Edit profile',
      myPublications: 'My publications',
      myApplications: 'My applications',
      settings: 'Settings',
      notifications: 'Notifications',
      language: 'Language',
      theme: 'Theme',
      darkMode: 'Dark mode',
      about: 'About',
      version: 'Version',
      helpSupport: 'Help & Support',
      privacyPolicy: 'Privacy policy',
      termsOfService: 'Terms of service',
      deleteAccount: 'Delete account',
    },
    publish: {
      title: 'Publish',
      newCall: 'New call',
      step1: 'General information',
      step2: 'Dates & location',
      step3: 'Details & contact',
      step4: 'Attachments',
      step5: 'Review & publish',
      callTitle: 'Call title',
      callType: 'Call type',
      description: 'Description',
      thematicAxes: 'Thematic axes',
      submissionDeadline: 'Submission deadline',
      notificationDate: 'Notification date',
      eventStartDate: 'Event start date',
      eventEndDate: 'Event end date',
      city: 'City',
      country: 'Country',
      modality: 'Modality',
      contactEmail: 'Contact email',
      externalUrl: 'Website / External URL',
      submissionConditions: 'Submission conditions',
      addAttachment: 'Add file',
      publishNow: 'Publish now',
      saveDraft: 'Save draft',
      preview: 'Preview',
      pending: 'Pending validation',
      published: 'Published',
      draft: 'Draft',
    },
    tracker: {
      title: 'Application tracker',
      addApplication: 'Track a call',
      status: {
        interested: 'Interested',
        inProgress: 'In progress',
        submitted: 'Submitted',
        accepted: 'Accepted',
        rejected: 'Rejected',
      },
      notes: 'Personal notes',
      deadline: 'Deadline',
      reminderSet: 'Reminder set',
    },
    onboarding: {
      slide1Title: 'All calls in one place',
      slide1Desc: 'Communications, publications, grants, conferences... Centralized for you.',
      slide2Title: 'Personalized alerts',
      slide2Desc: 'Get notifications based on your research domains.',
      slide3Title: 'Never miss a deadline',
      slide3Desc: 'Add deadlines to your calendar with one tap.',
      slide4Title: 'Share and publish',
      slide4Desc: 'Broadcast your calls to 60,000+ African researchers.',
      getStarted: 'Get started',
      skip: 'Skip',
      next: 'Next',
    },
  },
};

const i18n = new I18n(translations);
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'fr';
i18n.enableFallback = true;
i18n.defaultLocale = 'fr';

export default i18n;
export type SupportedLocale = 'fr' | 'en';
'@

Write-Host "Batch 11 complete (file 24)"

# File 25 — mobile/src/components/CallCard.tsx
Write-File "mobile/src/components/CallCard.tsx" @'
import React, { memo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { Call, favoritesApi } from '../services/api';
import { useFavStore } from '../store';
import { useDeadlineColor } from '../hooks/useDeadlineColor';
import { CALL_TYPES, COLORS } from '../constants';

interface Props {
  call: Call;
  onPress: () => void;
  compact?: boolean;
  colorScheme?: 'light' | 'dark';
}

const CallCard = memo(({ call, onPress, compact = false, colorScheme = 'light' }: Props) => {
  const isDark = colorScheme === 'dark';
  const { isFavorite, addFavorite, removeFavorite } = useFavStore();
  const fav = isFavorite(call.id);
  const { color: deadlineColor, label: deadlineLabel, urgent } = useDeadlineColor(call.submissionDeadline);
  const typeInfo = CALL_TYPES.find((t) => t.id === call.type);

  const handleFav = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (fav) {
      removeFavorite(call.id);
      favoritesApi.remove(call.id).catch(() => addFavorite(call.id));
    } else {
      addFavorite(call.id);
      favoritesApi.add(call.id).catch(() => removeFavorite(call.id));
    }
  }, [fav, call.id, addFavorite, removeFavorite]);

  const bg = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: bg, borderColor: border },
        pressed && { opacity: 0.92 },
      ]}
    >
      {/* Type badge + urgency indicator */}
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: typeInfo?.color + '20' }]}>
          <Ionicons name={typeInfo?.icon as any} size={12} color={typeInfo?.color} />
          <Text style={[styles.typeText, { color: typeInfo?.color }]}>
            {typeInfo?.label ?? call.type}
          </Text>
        </View>

        {urgent && (
          <View style={styles.urgentBadge}>
            <Ionicons name="time" size={10} color="#fff" />
            <Text style={styles.urgentText}>{deadlineLabel}</Text>
          </View>
        )}

        <TouchableOpacity onPress={handleFav} style={styles.favBtn} hitSlop={12}>
          <Ionicons
            name={fav ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={fav ? COLORS.primary : textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text
        style={[styles.title, { color: textPrimary }]}
        numberOfLines={compact ? 2 : 3}
      >
        {call.title}
      </Text>

      {/* Metadata row */}
      {!compact && (
        <View style={styles.meta}>
          {call.locationCountry ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={textSecondary} />
              <Text style={[styles.metaText, { color: textSecondary }]}>
                {[call.locationCity, call.locationCountry].filter(Boolean).join(', ')}
              </Text>
            </View>
          ) : null}

          {call.locationModality ? (
            <View style={styles.metaItem}>
              <Ionicons name="globe-outline" size={13} color={textSecondary} />
              <Text style={[styles.metaText, { color: textSecondary }]}>
                {call.locationModality === 'en_ligne' ? 'En ligne' :
                 call.locationModality === 'hybride' ? 'Hybride' : 'Présentiel'}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.publisherRow}>
          <Image
            source={{
              uri: call.publisher.avatarUrl ??
                `https://api.dicebear.com/8.x/initials/svg?seed=${call.publisher.firstName}+${call.publisher.lastName}`,
            }}
            style={styles.avatar}
          />
          <Text style={[styles.publisher, { color: textSecondary }]} numberOfLines={1}>
            {call.publisher.institution ?? `${call.publisher.firstName} ${call.publisher.lastName}`}
          </Text>
        </View>

        <Text style={[styles.deadline, { color: deadlineColor }]}>
          {!urgent && deadlineLabel
            ? deadlineLabel
            : format(parseISO(call.submissionDeadline), 'dd MMM', { locale: fr })}
        </Text>
      </View>
    </Pressable>
  );
});

export default CallCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  urgentText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  favBtn: {
    marginLeft: 'auto',
    padding: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  publisherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  publisher: {
    fontSize: 12,
    flex: 1,
  },
  deadline: {
    fontSize: 12,
    fontWeight: '700',
  },
});
'@

# File 26 — mobile/src/components/DeadlineBar.tsx
Write-File "mobile/src/components/DeadlineBar.tsx" @'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { differenceInDays, parseISO } from 'date-fns';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { COLORS } from '../constants';

interface Props {
  deadline: string;
  createdAt: string;
}

export function DeadlineBar({ deadline, createdAt }: Props) {
  const total = differenceInDays(parseISO(deadline), parseISO(createdAt));
  const remaining = differenceInDays(parseISO(deadline), new Date());
  const pct = Math.max(0, Math.min(1, remaining / Math.max(1, total)));

  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withTiming(pct, { duration: 800 }); }, [pct]);

  const animated = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` as any }));

  const color = pct > 0.5 ? COLORS.success : pct > 0.25 ? COLORS.warning : COLORS.danger;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, animated]} />
      </View>
      <Text style={[styles.label, { color }]}>
        {remaining <= 0 ? 'Expiré' : `${remaining}j restants`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  label: { fontSize: 12, fontWeight: '600', minWidth: 80, textAlign: 'right' },
});
'@

Write-Host "Batch 12 complete (files 25-26)"

# File 27 — mobile/src/components/SearchBar.tsx
Write-File "mobile/src/components/SearchBar.tsx" @'
import React, { useRef, useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  colorScheme?: 'light' | 'dark';
}

export function SearchBar({
  value, onChangeText, onSubmit, onFocus, onBlur,
  placeholder = 'Rechercher...', autoFocus, colorScheme = 'light',
}: Props) {
  const isDark = colorScheme === 'dark';
  const scale = useRef(new Animated.Value(1)).current;

  const onFocusAnim = () => {
    Animated.spring(scale, { toValue: 1.02, useNativeDriver: true }).start();
    onFocus?.();
  };
  const onBlurAnim = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    onBlur?.();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <View style={[
        styles.container,
        {
          backgroundColor: isDark ? COLORS.surface.dark : '#F1F5F9',
          borderColor: isDark ? COLORS.border.dark : 'transparent',
        },
      ]}>
        <Ionicons name="search" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
        <TextInput
          style={[styles.input, { color: isDark ? '#F1F5F9' : '#0F172A' }]}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={onFocusAnim}
          onBlur={onBlurAnim}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={isDark ? '#475569' : '#94A3B8'} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingVertical: 8 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15 },
});
'@

# File 28 — mobile/src/hooks/useDeadlineColor.ts
Write-File "mobile/src/hooks/useDeadlineColor.ts" @'
import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { DEADLINE_URGENCY_DAYS, COLORS } from '../constants';

export function useDeadlineColor(deadline: string | undefined) {
  return useMemo(() => {
    if (!deadline) return { color: COLORS.text.secondary.light, label: '' };
    const days = differenceInDays(parseISO(deadline), new Date());
    if (days < 0) return { color: COLORS.text.muted.light, label: 'Expiré', days };
    if (days <= DEADLINE_URGENCY_DAYS.CRITICAL)
      return { color: COLORS.danger, label: `${days}j restants`, days, urgent: true };
    if (days <= DEADLINE_URGENCY_DAYS.WARNING)
      return { color: COLORS.warning, label: `${days}j restants`, days };
    if (days <= DEADLINE_URGENCY_DAYS.SOON)
      return { color: COLORS.primary, label: `${days}j restants`, days };
    return { color: COLORS.success, label: `${days}j restants`, days };
  }, [deadline]);
}
'@

# File 29 — mobile/src/hooks/usePushNotifications.ts
Write-File "mobile/src/hooks/usePushNotifications.ts" @'
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
'@

Write-Host "Batch 13 complete (files 27-29)"

# File 30 — mobile/src/utils/calendar.ts
Write-File "mobile/src/utils/calendar.ts" @'
import * as Calendar from 'expo-calendar';
import { parseISO, addHours } from 'date-fns';
import { Call } from '../services/api';

export async function addCallToCalendar(call: Call): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return false;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar =
    calendars.find((c) => c.allowsModifications && c.isPrimary) ?? calendars[0];

  if (!defaultCalendar) return false;

  const deadline = parseISO(call.submissionDeadline);

  await Calendar.createEventAsync(defaultCalendar.id, {
    title: `📋 Deadline: ${call.title}`,
    startDate: deadline,
    endDate: addHours(deadline, 1),
    notes: [
      `Type: ${call.type}`,
      call.locationCountry ? `Pays: ${call.locationCountry}` : '',
      call.contactEmail ? `Contact: ${call.contactEmail}` : '',
      call.externalUrl ? `Lien: ${call.externalUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    alarms: [
      { relativeOffset: -60 * 24 * 7 }, // 1 week before
      { relativeOffset: -60 * 24 * 3 }, // 3 days before
      { relativeOffset: -60 * 24 },      // 1 day before
    ],
    url: call.externalUrl ?? undefined,
  });

  return true;
}

export async function addEventToCalendar(call: Call): Promise<boolean> {
  if (!call.eventStartDate) return false;

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return false;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar =
    calendars.find((c) => c.allowsModifications && c.isPrimary) ?? calendars[0];

  if (!defaultCalendar) return false;

  const start = parseISO(call.eventStartDate);
  const end = call.eventEndDate ? parseISO(call.eventEndDate) : addHours(start, 2);

  await Calendar.createEventAsync(defaultCalendar.id, {
    title: `🏛️ ${call.title}`,
    startDate: start,
    endDate: end,
    location: [call.locationCity, call.locationCountry].filter(Boolean).join(', '),
    notes: call.description.slice(0, 500),
    url: call.externalUrl ?? undefined,
  });

  return true;
}
'@

# File 31 — mobile/src/utils/share.ts
Write-File "mobile/src/utils/share.ts" @'
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import { Call } from '../services/api';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function shareCall(call: Call) {
  const deadline = format(parseISO(call.submissionDeadline), 'dd MMMM yyyy', { locale: fr });

  const message = [
    `📢 *${call.title}*`,
    ``,
    `📌 Type: ${call.type}`,
    `🗓 Deadline: ${deadline}`,
    call.locationCountry ? `📍 ${call.locationCity ?? ''} ${call.locationCountry}`.trim() : '',
    ``,
    call.externalUrl ? `🔗 ${call.externalUrl}` : '',
    ``,
    `_Partagé via ResearchCall — L'agrégateur d'appels scientifiques de l'Afrique francophone_`,
    `researchcall://calls/${call.id}`,
  ]
    .filter(Boolean)
    .join('\n');

  await Share.share({ message, title: call.title });
}
'@

# File 32 — src/prisma/client.ts
Write-File "src/prisma/client.ts" @'
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
'@

Write-Host "Batch 14 complete (files 30-32)"

# File 33 — src/routes/admin.ts
Write-File "src/routes/admin.ts" @'
import { Router } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, requireRole } from '../middleware/auth';
import { sendModerationEmail } from '../services/emailService';
import { notificationService } from '../services/notificationService';

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, requireRole('admin'));

// ─── Dashboard stats ──────────────────────────────────────────────────────────

router.get('/stats', async (_req, res) => {
  const [totalUsers, totalCalls, pendingCalls, totalNotifications] = await Promise.all([
    prisma.user.count(),
    prisma.call.count(),
    prisma.call.count({ where: { status: 'pending' } }),
    prisma.notification.count(),
  ]);

  const usersByRole = await prisma.user.groupBy({ by: ['role'], _count: true });
  const callsByType = await prisma.call.groupBy({ by: ['type'], _count: true, where: { status: 'published' } });
  const callsByStatus = await prisma.call.groupBy({ by: ['status'], _count: true });
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, firstName: true, lastName: true, email: true, role: true, institution: true, createdAt: true },
  });

  res.json({
    totals: { users: totalUsers, calls: totalCalls, pending: pendingCalls, notifications: totalNotifications },
    usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count])),
    callsByType: Object.fromEntries(callsByType.map((r) => [r.type, r._count])),
    callsByStatus: Object.fromEntries(callsByStatus.map((r) => [r.status, r._count])),
    recentUsers,
  });
});

// ─── Pending calls (moderation queue) ────────────────────────────────────────

router.get('/calls/pending', async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  const [data, total] = await Promise.all([
    prisma.call.findMany({
      where: { status: 'pending' },
      include: { publisher: { select: { firstName: true, lastName: true, email: true, institution: true } } },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.call.count({ where: { status: 'pending' } }),
  ]);

  res.json({ data, total, page, limit, hasMore: page * limit < total });
});

// ─── Approve / reject a call ─────────────────────────────────────────────────

router.put('/calls/:id/approve', async (req, res) => {
  const call = await prisma.call.findUnique({
    where: { id: req.params.id },
    include: { publisher: { select: { email: true, firstName: true } } },
  });
  if (!call) return res.status(404).json({ error: true, message: 'Appel introuvable' });

  const updated = await prisma.call.update({
    where: { id: req.params.id },
    data: { status: 'published' },
  });

  // Notify publisher
  await notificationService.notifyModerationResult(call.id, true);
  await sendModerationEmail(call.publisher.email, call.publisher.firstName, call.title, true);

  // Trigger push to matching researchers
  notificationService.notifyNewCall(call.id).catch(console.error);

  res.json(updated);
});

router.put('/calls/:id/reject', async (req, res) => {
  const { reason } = req.body as { reason?: string };

  const call = await prisma.call.findUnique({
    where: { id: req.params.id },
    include: { publisher: { select: { email: true, firstName: true } } },
  });
  if (!call) return res.status(404).json({ error: true, message: 'Appel introuvable' });

  const updated = await prisma.call.update({
    where: { id: req.params.id },
    data: { status: 'rejected' },
  });

  await notificationService.notifyModerationResult(call.id, false);
  await sendModerationEmail(call.publisher.email, call.publisher.firstName, call.title, false, reason);

  res.json(updated);
});

// ─── User management ─────────────────────────────────────────────────────────

router.get('/users', async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 50);
  const q = req.query.q as string | undefined;

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: 'insensitive' as const } },
          { firstName: { contains: q, mode: 'insensitive' as const } },
          { lastName: { contains: q, mode: 'insensitive' as const } },
          { institution: { contains: q, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, institution: true, domains: true, createdAt: true,
        _count: { select: { publishedCalls: true, favorites: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ data, total, page, limit });
});

router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body as { role: string };
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: role as any },
    select: { id: true, email: true, role: true },
  });
  res.json(updated);
});

export default router;
'@

Write-Host "Batch 15 complete (file 33)"

# File 34 — src/services/emailService.ts
Write-File "src/services/emailService.ts" @'
// Email service using nodemailer or a transactional email provider (e.g. Resend, SendGrid)
// Falls back gracefully if SMTP is not configured

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(opts: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'ResearchCall <noreply@researchcall.ci>';

  if (!apiKey) {
    console.warn('⚠️  RESEND_API_KEY not set — email not sent:', opts.subject, '->', opts.to);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    return res.ok;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const baseUrl = process.env.APP_BASE_URL ?? 'https://app.researchcall.ci';
  const link = `${baseUrl}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: 'Réinitialisation de votre mot de passe — ResearchCall',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, sans-serif; background: #F8FAFC; margin: 0; padding: 40px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #E2E8F0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 40px; margin-bottom: 8px;">🔬</div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0;">ResearchCall</h1>
          </div>
          <h2 style="font-size: 20px; color: #0F172A; margin-bottom: 16px;">Réinitialisation du mot de passe</h2>
          <p style="color: #64748B; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background: #3B82F6; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #94A3B8; font-size: 13px; line-height: 1.6;">
            Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #CBD5E1; font-size: 12px; text-align: center;">
            ResearchCall — L'agrégateur d'appels scientifiques de l'Afrique francophone
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

// ─── Welcome Email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Bienvenue sur ResearchCall, ${firstName} !`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, sans-serif; background: #F8FAFC; margin: 0; padding: 40px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #E2E8F0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 40px; margin-bottom: 8px;">🔬</div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0;">ResearchCall</h1>
          </div>
          <h2 style="font-size: 20px; color: #0F172A;">Bienvenue, ${firstName} !</h2>
          <p style="color: #64748B; line-height: 1.6;">
            Votre compte ResearchCall est maintenant actif. Vous allez recevoir des alertes personnalisées basées sur vos domaines de recherche.
          </p>
          <div style="background: #EFF6FF; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="color: #1D4ED8; font-weight: 700; margin: 0 0 8px;">🎯 Prochaines étapes</p>
            <ul style="color: #3B82F6; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 6px;">Configurez vos domaines de recherche</li>
              <li style="margin-bottom: 6px;">Explorez les appels disponibles</li>
              <li style="margin-bottom: 6px;">Activez les notifications push</li>
            </ul>
          </div>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #CBD5E1; font-size: 12px; text-align: center;">
            ResearchCall — L'agrégateur d'appels scientifiques de l'Afrique francophone
          </p>
        </div>
      </body>
      </html>
    `,
  });
}

// ─── Call Moderation Result ───────────────────────────────────────────────────

export async function sendModerationEmail(
  email: string, firstName: string, callTitle: string, approved: boolean, reason?: string,
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Votre appel a été ${approved ? 'approuvé' : 'refusé'} — ResearchCall`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, sans-serif; background: #F8FAFC; margin: 0; padding: 40px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #E2E8F0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 40px;">${approved ? '✅' : '❌'}</div>
          </div>
          <h2 style="color: #0F172A;">Bonjour ${firstName},</h2>
          <p style="color: #64748B; line-height: 1.6;">
            Votre appel <strong>"${callTitle}"</strong> a été <strong>${approved ? 'approuvé et publié' : 'refusé'}</strong>.
          </p>
          ${reason ? `<div style="background: #FEF2F2; border-radius: 12px; padding: 16px;"><p style="color: #DC2626; margin: 0;">Motif : ${reason}</p></div>` : ''}
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #CBD5E1; font-size: 12px; text-align: center;">ResearchCall</p>
        </div>
      </body>
      </html>
    `,
  });
}
'@

Write-Host "Batch 16 complete (file 34)"

# File 35 — src/routes/auth.ts
Write-File "src/routes/auth.ts" @'
// ─────────────────────────────────────────────────────────
// backend/src/routes/auth.ts — Routes d'authentification
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ─── Schémas de validation ───────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Min. 8 caractères'),
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  role: z.enum(['seeker', 'publisher', 'both']).default('both'),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Min. 8 caractères'),
});

// ═══════════════════════════════════════════════════════════
// POST /api/auth/register — Inscription
// ═══════════════════════════════════════════════════════════

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({
        error: true,
        message: 'Un compte avec cet email existe déjà',
      });
      return;
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        institution: true,
        domains: true,
        interests: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Générer les tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Stocker le refresh token en BDD
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      },
    });

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/auth/login — Connexion
// ═══════════════════════════════════════════════════════════

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({
        error: true,
        message: 'Email ou mot de passe incorrect',
      });
      return;
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({
        error: true,
        message: 'Email ou mot de passe incorrect',
      });
      return;
    }

    // Générer les tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Stocker le refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Réponse sans passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/auth/refresh — Rafraîchir le token
// ═══════════════════════════════════════════════════════════

router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // Vérifier le token
    let decoded: JwtPayload;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      res.status(401).json({ error: true, message: 'Refresh token invalide' });
      return;
    }

    // Vérifier en BDD
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.status(401).json({ error: true, message: 'Refresh token expiré' });
      return;
    }

    // Supprimer l'ancien refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Générer de nouveaux tokens
    const payload: JwtPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Stocker le nouveau refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/auth/forgot-password — Mot de passe oublié
// ═══════════════════════════════════════════════════════════

router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Toujours répondre 200 pour ne pas révéler l'existence d'un compte
    if (!user) {
      res.json({ message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' });
      return;
    }

    // Generate a secure reset token and store it
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.refreshToken.create({
      data: { token: `pwd_reset:${resetToken}`, userId: user.id, expiresAt },
    });

    const { sendPasswordResetEmail } = await import('../services/emailService');
    await sendPasswordResetEmail(email, resetToken);

    res.json({
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/auth/reset-password — Réinitialiser le mot de passe
// ═══════════════════════════════════════════════════════════

router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const stored = await prisma.refreshToken.findUnique({
      where: { token: `pwd_reset:${token}` },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      res.status(400).json({ error: true, message: 'Lien invalide ou expiré' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } });
    await prisma.refreshToken.delete({ where: { token: `pwd_reset:${token}` } });

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

export default router;
'@

Write-Host "Batch 17 complete (file 35)"

# File 36 — src/index.ts
Write-File "src/index.ts" @'
// ─────────────────────────────────────────────────────────
// backend/src/index.ts — Point d'entrée du serveur
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import path from 'path';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import callsRoutes from './routes/calls';
import attachmentsRoutes from './routes/attachments';
import favoritesRoutes from './routes/favorites';
import notificationsRoutes from './routes/notifications';
import adminRoutes from './routes/admin';

// ─── Configuration ───────────────────────────────────────
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares globaux ─────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Servir les fichiers uploadés ────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health check ────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api', attachmentsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// ─── Domaines & catégories (données statiques) ──────────
app.get('/api/domains', (_req, res) => {
  res.json([
    'Intelligence Artificielle', 'Droit International', 'Biologie Moléculaire',
    "Sciences de l'Information et de la Communication", 'Marketing Digital',
    'Économie du Développement', 'Linguistique', 'Sociologie', 'Physique',
    'Gestion des Ressources Humaines', 'Communication', 'Sciences Politiques',
    'Informatique', 'Mathématiques', "Sciences de l'Éducation", 'Géographie',
    'Histoire', 'Philosophie', 'Psychologie', 'Agronomie', 'Médecine',
    'Sciences de la Terre', 'Chimie', 'Arts et Culture',
  ]);
});

app.get('/api/call-types', (_req, res) => {
  res.json([
    { value: 'communication', label: 'Communication' },
    { value: 'publication', label: 'Publication' },
    { value: 'colloque', label: 'Colloque' },
    { value: 'projet', label: 'Projet' },
    { value: 'bourse', label: 'Bourse' },
    { value: 'autre', label: 'Autre' },
  ]);
});

// ─── Gestion des erreurs globale ─────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur interne';

  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Route 404
app.use((_req, res) => {
  res.status(404).json({ error: true, message: 'Route introuvable' });
});

// ─── Démarrage du serveur ────────────────────────────────
import { startScheduler } from './services/scheduler';

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`
  🔬 ResearchCall API
  ───────────────────────
  ✅ Serveur démarré sur http://localhost:${PORT}
  📚 API: http://localhost:${PORT}/api
  🏥 Health: http://localhost:${PORT}/api/health
  ───────────────────────
  `);

  // Démarrer les tâches planifiées
  startScheduler();
});

export default app;
'@

Write-Host "Tous les fichiers crees avec succes!"
