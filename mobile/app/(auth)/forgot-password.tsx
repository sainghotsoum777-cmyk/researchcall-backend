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
          <Text style={styles.title}>Mot de passe oubliÃ©</Text>

          {sent ? (
            <>
              <Text style={styles.desc}>
                Si cet email est associÃ© Ã  un compte, vous recevrez un lien de rÃ©initialisation dans les prochaines minutes.
              </Text>
              <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
                <Text style={styles.btnText}>Retour Ã  la connexion</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.desc}>
                Entrez votre adresse email et nous vous enverrons un lien pour rÃ©initialiser votre mot de passe.
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