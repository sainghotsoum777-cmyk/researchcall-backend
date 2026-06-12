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
  { id: 'publisher', label: 'Ã‰diteur', desc: 'Je publie des appels' },
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
              <Text style={styles.heading}>CrÃ©er un compte</Text>
              <Text style={styles.subheading}>Ã‰tape 1 â€” Informations personnelles</Text>

              {[
                { key: 'firstName', label: 'PrÃ©nom', icon: 'person-outline' },
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
              <Text style={styles.heading}>Votre profil acadÃ©mique</Text>
              <Text style={styles.subheading}>Ã‰tape 2 â€” Institution & RÃ´le</Text>

              {[
                { key: 'institution', label: 'Institution / UniversitÃ©', icon: 'school-outline' },
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

              <Text style={styles.sectionLabel}>RÃ´le principal</Text>
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
                Ã‰tape 3 â€” SÃ©lectionnez vos domaines de recherche pour personnaliser votre fil
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
                      <Text style={styles.btnText}>CrÃ©er mon compte</Text>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.loginRow}>
                <Text style={styles.loginHint}>DÃ©jÃ  un compte ? </Text>
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