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
      Alert.alert('AjoutÃ© !', 'La deadline a Ã©tÃ© ajoutÃ©e Ã  votre calendrier avec 3 rappels.');
    } else {
      Alert.alert('Permission refusÃ©e', "Autorisez l'accÃ¨s au calendrier dans les paramÃ¨tres.");
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
      Alert.alert('Erreur', 'TÃ©lÃ©chargement impossible');
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
                <Text style={styles.expiredTagText}>ExpirÃ©</Text>
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
              label: 'ModalitÃ©',
              value: call.locationModality === 'en_ligne' ? 'En ligne' :
                call.locationModality === 'hybride' ? 'Hybride' : 'PrÃ©sentiel',
            },
            call.language && { icon: 'language', label: 'Langue', value: call.language.toUpperCase() },
            call.eventStartDate && {
              icon: 'calendar',
              label: 'Ã‰vÃ©nement',
              value: format(parseISO(call.eventStartDate), 'dd MMM yyyy', { locale: fr }) +
                (call.eventEndDate ? ` â†’ ${format(parseISO(call.eventEndDate), 'dd MMM yyyy', { locale: fr })}` : ''),
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
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>AXES THÃ‰MATIQUES</Text>
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
            <Text style={[styles.sectionLabel, { color: textSecondary }]}>PIÃˆCES JOINTES</Text>
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
            {tracked ? `Candidature suivie â€” ${tracked.status}` : 'Suivre ma candidature'}
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