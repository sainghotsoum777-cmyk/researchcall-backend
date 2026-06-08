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
                 call.locationModality === 'hybride' ? 'Hybride' : 'PrÃ©sentiel'}
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