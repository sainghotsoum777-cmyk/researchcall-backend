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