import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { callsApi } from '../../src/services/api';
import {
  useTrackerStore, AppStatus, TrackedApplication, usePrefsStore,
} from '../../src/store';
import { COLORS } from '../../src/constants';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; icon: string }> = {
  interested: { label: 'IntÃ©ressÃ©', color: '#94A3B8', icon: 'bookmark-outline' },
  inProgress: { label: 'En cours', color: COLORS.warning, icon: 'create-outline' },
  submitted: { label: 'Soumis', color: COLORS.primary, icon: 'send' },
  accepted: { label: 'AcceptÃ©', color: COLORS.success, icon: 'checkmark-circle' },
  rejected: { label: 'RefusÃ©', color: COLORS.danger, icon: 'close-circle' },
};

export default function TrackerScreen() {
  const colorScheme = useColorScheme();
  const { theme } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  const params = useLocalSearchParams<{ callId?: string }>();

  const { applications, loadApplications, addOrUpdate, remove } = useTrackerStore();
  const [editTarget, setEditTarget] = useState<TrackedApplication | null>(null);
  const [showModal, setShowModal] = useState(false);

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const surface = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  useEffect(() => {
    loadApplications();
    if (params.callId) {
      callsApi.getById(params.callId).then((call) => {
        setEditTarget({
          callId: call.id,
          callTitle: call.title,
          callType: call.type,
          deadline: call.submissionDeadline,
          status: 'interested',
          notes: '',
          updatedAt: new Date().toISOString(),
        });
        setShowModal(true);
      }).catch(() => {});
    }
  }, [params.callId]);

  const grouped = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s as AppStatus] = applications.filter((a) => a.status === s);
    return acc;
  }, {} as Record<AppStatus, TrackedApplication[]>);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textPrimary }]}>Suivi candidatures</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {applications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={56} color={textSecondary} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>Aucune candidature suivie</Text>
            <Text style={[styles.emptyDesc, { color: textSecondary }]}>
              Ouvrez un appel et tapez "Suivre ma candidature" pour commencer
            </Text>
          </View>
        ) : (
          (Object.keys(STATUS_CONFIG) as AppStatus[]).map((status) => {
            const group = grouped[status];
            if (group.length === 0) return null;
            const conf = STATUS_CONFIG[status];
            return (
              <View key={status} style={styles.group}>
                <View style={styles.groupHeader}>
                  <Ionicons name={conf.icon as any} size={16} color={conf.color} />
                  <Text style={[styles.groupTitle, { color: textPrimary }]}>{conf.label}</Text>
                  <View style={[styles.groupCount, { backgroundColor: conf.color + '20' }]}>
                    <Text style={[styles.groupCountText, { color: conf.color }]}>{group.length}</Text>
                  </View>
                </View>
                {group.map((app) => (
                  <TouchableOpacity
                    key={app.callId}
                    style={[styles.appCard, { backgroundColor: surface, borderColor: border }]}
                    onPress={() => { setEditTarget(app); setShowModal(true); }}
                  >
                    <View style={[styles.statusBar, { backgroundColor: conf.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.appTitle, { color: textPrimary }]} numberOfLines={2}>
                        {app.callTitle}
                      </Text>
                      {app.deadline && (
                        <Text style={[styles.appDeadline, { color: textSecondary }]}>
                          Deadline : {format(parseISO(app.deadline), 'dd MMM yyyy', { locale: fr })}
                        </Text>
                      )}
                      {app.notes ? (
                        <Text style={[styles.appNotes, { color: textSecondary }]} numberOfLines={1}>
                          ðŸ“ {app.notes}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      {editTarget && (
        <EditModal
          app={editTarget}
          visible={showModal}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSave={async (updated) => {
            await addOrUpdate(updated);
            setShowModal(false);
            setEditTarget(null);
          }}
          onDelete={async () => {
            await remove(editTarget.callId);
            setShowModal(false);
            setEditTarget(null);
          }}
          isDark={isDark}
        />
      )}
    </View>
  );
}

function EditModal({ app, visible, onClose, onSave, onDelete, isDark }: {
  app: TrackedApplication;
  visible: boolean;
  onClose: () => void;
  onSave: (a: TrackedApplication) => void;
  onDelete: () => void;
  isDark: boolean;
}) {
  const [status, setStatus] = useState<AppStatus>(app.status);
  const [notes, setNotes] = useState(app.notes);

  useEffect(() => { setStatus(app.status); setNotes(app.notes); }, [app]);

  const surface = isDark ? '#1E293B' : '#fff';
  const bg = isDark ? '#0F172A' : '#F8FAFC';
  const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const border = isDark ? '#334155' : '#E2E8F0';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[{ flex: 1, backgroundColor: bg }]}>
        <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: border, backgroundColor: surface }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: COLORS.primary }}>Fermer</Text>
          </TouchableOpacity>
          <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 16 }}>Suivi candidature</Text>
          <TouchableOpacity onPress={() => onSave({ ...app, status, notes, updatedAt: new Date().toISOString() })}>
            <Text style={{ color: COLORS.success, fontWeight: '700' }}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ color: textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 16 }} numberOfLines={3}>
            {app.callTitle}
          </Text>

          <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 }}>
            STATUT
          </Text>
          {(Object.keys(STATUS_CONFIG) as AppStatus[]).map((s) => {
            const conf = STATUS_CONFIG[s];
            return (
              <TouchableOpacity
                key={s}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  padding: 14, borderRadius: 12, marginBottom: 8,
                  backgroundColor: status === s ? conf.color + '15' : surface,
                  borderWidth: 1, borderColor: status === s ? conf.color : border,
                }}
                onPress={() => setStatus(s)}
              >
                <Ionicons name={conf.icon as any} size={20} color={conf.color} />
                <Text style={{ color: textPrimary, fontSize: 15, flex: 1 }}>{conf.label}</Text>
                {status === s && <Ionicons name="checkmark-circle" size={20} color={conf.color} />}
              </TouchableOpacity>
            );
          })}

          <Text style={{ color: textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginTop: 16, marginBottom: 10 }}>
            NOTES PERSONNELLES
          </Text>
          <TextInput
            style={{
              backgroundColor: surface, borderRadius: 12, padding: 14,
              color: textPrimary, fontSize: 14, borderWidth: 1, borderColor: border,
              minHeight: 100, textAlignVertical: 'top',
            }}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ajoutez des notes sur votre candidature..."
            placeholderTextColor={textSecondary}
            multiline
          />

          <TouchableOpacity
            style={{ marginTop: 24, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.danger + '40' }}
            onPress={() => Alert.alert('Supprimer', 'Retirer ce suivi ?', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: onDelete },
            ])}
          >
            <Text style={{ color: COLORS.danger, fontWeight: '600' }}>Retirer le suivi</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  group: { marginBottom: 20 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  groupTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  groupCount: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  groupCountText: { fontSize: 12, fontWeight: '700' },
  appCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, borderWidth: 1, marginBottom: 8,
    overflow: 'hidden', padding: 14,
  },
  statusBar: { width: 4, height: '100%', borderRadius: 2, position: 'absolute', left: 0, top: 0 },
  appTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, paddingLeft: 6 },
  appDeadline: { fontSize: 12, paddingLeft: 6 },
  appNotes: { fontSize: 12, paddingLeft: 6, marginTop: 2 },
});