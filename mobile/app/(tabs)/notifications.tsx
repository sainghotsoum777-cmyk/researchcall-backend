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