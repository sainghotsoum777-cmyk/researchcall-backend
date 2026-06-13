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
        Alert.alert('Erreur', 'Impossible de mettre Ã  jour la photo');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'ÃŠtes-vous sûr de vouloir vous déconnecter ?', [
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
              ðŸ›ï¸ {user.institution}
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