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
                Bonjour, {user?.firstName ?? 'Chercheur'} ðŸ‘‹
              </Text>
              <Text style={styles.subGreeting}>DÃ©couvrez les derniers appels scientifiques</Text>
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
                { icon: 'time', value: stats.upcoming, label: 'expirent bientÃ´t' },
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
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>Explorer par catÃ©gorie</Text>
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
                  Ã‰chÃ©ances urgentes
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
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Mon fil personnalisÃ©</Text>
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
                Aucun appel disponible pour l'instant.{'\n'}Mettez Ã  jour vos domaines dans votre profil.
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