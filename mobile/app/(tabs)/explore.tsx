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
  { id: 'deadline_asc', label: 'Deadline â†‘' },
  { id: 'deadline_desc', label: 'Deadline â†“' },
  { id: 'created_desc', label: 'Plus rÃ©cents' },
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
            {total} rÃ©sultat{total > 1 ? 's' : ''}
            {query ? ` pour Â« ${query} Â»` : ''}
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
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>Aucun rÃ©sultat</Text>
              <Text style={[styles.emptyDesc, { color: textSecondary }]}>
                Essayez d'autres mots-clÃ©s ou modifiez vos filtres
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
          <Text style={[styles.filterLabel, { color: textSecondary }]}>MODALITÃ‰</Text>
          <View style={styles.filterChips}>
            {[
              { id: 'presentiel', label: 'PrÃ©sentiel' },
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