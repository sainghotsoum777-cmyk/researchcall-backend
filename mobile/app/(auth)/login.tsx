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
        : 'Impossible de se connecter. VÃ©rifiez votre connexion.');
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
            <Text style={styles.tagline}>L'agrÃ©gateur d'appels scientifiques{'\n'}de l'Afrique francophone</Text>
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
              <Text style={styles.forgotText}>Mot de passe oubliÃ© ?</Text>
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