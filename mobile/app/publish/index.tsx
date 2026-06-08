import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { callsApi, CallType, Modality } from '../../src/services/api';
import { usePrefsStore } from '../../src/store';
import { CALL_TYPES, CAMES_COUNTRIES, COLORS, RESEARCH_DOMAINS } from '../../src/constants';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  'Informations gÃ©nÃ©rales',
  'Dates & lieu',
  'DÃ©tails & contact',
  'Domaines & axes',
  'RÃ©vision',
];

export default function PublishScreen() {
  const colorScheme = useColorScheme();
  const { theme } = usePrefsStore();
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'colloque' as CallType,
    description: '',
    submissionDeadline: new Date(),
    eventStartDate: undefined as Date | undefined,
    eventEndDate: undefined as Date | undefined,
    locationCity: '',
    locationCountry: '',
    locationModality: 'presentiel' as Modality,
    contactEmail: '',
    externalUrl: '',
    submissionConditions: '',
    domains: [] as string[],
    thematicAxes: [''],
    language: 'fr',
  });

  const u = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const surface = isDark ? COLORS.surface.dark : COLORS.surface.light;
  const textPrimary = isDark ? COLORS.text.primary.dark : COLORS.text.primary.light;
  const textSecondary = isDark ? COLORS.text.secondary.dark : COLORS.text.secondary.light;
  const border = isDark ? COLORS.border.dark : COLORS.border.light;

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: textSecondary }]}>{label}</Text>
      {children}
    </View>
  );

  const Input = ({ value, onChangeText, placeholder, multiline = false }: any) => (
    <TextInput
      style={[
        styles.input,
        { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: border, color: textPrimary },
        multiline && { height: 100, textAlignVertical: 'top' },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={textSecondary}
      multiline={multiline}
    />
  );

  const publish = async (asDraft = false) => {
    if (!form.title.trim()) { Alert.alert('Erreur', 'Le titre est obligatoire'); return; }
    if (!form.description.trim()) { Alert.alert('Erreur', 'La description est obligatoire'); return; }

    setLoading(true);
    try {
      await callsApi.create({
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim(),
        submissionDeadline: form.submissionDeadline.toISOString(),
        eventStartDate: form.eventStartDate?.toISOString(),
        eventEndDate: form.eventEndDate?.toISOString(),
        locationCity: form.locationCity.trim() || undefined,
        locationCountry: form.locationCountry || undefined,
        locationModality: form.locationModality,
        contactEmail: form.contactEmail.trim() || undefined,
        externalUrl: form.externalUrl.trim() || undefined,
        submissionConditions: form.submissionConditions.trim() || undefined,
        domains: form.domains,
        thematicAxes: form.thematicAxes.filter(Boolean),
        language: form.language,
        status: asDraft ? 'draft' : 'pending',
      });
      Alert.alert(
        asDraft ? 'Brouillon sauvegardÃ©' : 'Appel soumis !',
        asDraft
          ? 'Votre brouillon a Ã©tÃ© sauvegardÃ©.'
          : "Votre appel est en attente de validation par l'Ã©quipe ResearchCall.",
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de publier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <TouchableOpacity onPress={() => step > 1 ? setStep((s) => (s - 1) as Step) : router.back()}>
          <Ionicons name="chevron-back" size={24} color={textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Publier un appel</Text>
          <Text style={[styles.headerStep, { color: textSecondary }]}>
            Ã‰tape {step}/{STEPS.length} â€” {STEPS[step - 1]}
          </Text>
        </View>
        <TouchableOpacity onPress={() => publish(true)} disabled={loading}>
          <Text style={{ color: textSecondary, fontSize: 13 }}>Brouillon</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: border }]}>
        <View style={[styles.progressFill, { width: `${(step / STEPS.length) * 100}%`, backgroundColor: COLORS.primary }]} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <>
            <Field label="TITRE DE L'APPEL *">
              <Input value={form.title} onChangeText={(v: string) => u('title', v)} placeholder="Ex: Appel Ã  communications â€” Colloque CAMES 2026" />
            </Field>

            <Field label="TYPE D'APPEL *">
              <View style={styles.typeGrid}>
                {CALL_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.typeCard,
                      { borderColor: border, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
                      form.type === t.id && { borderColor: t.color, backgroundColor: t.color + '15' },
                    ]}
                    onPress={() => u('type', t.id)}
                  >
                    <Ionicons name={t.icon as any} size={20} color={form.type === t.id ? t.color : textSecondary} />
                    <Text style={[styles.typeCardText, { color: form.type === t.id ? t.color : textSecondary }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <Field label="DESCRIPTION *">
              <Input value={form.description} onChangeText={(v: string) => u('description', v)} placeholder="DÃ©crivez l'appel en dÃ©tailâ€¦" multiline />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="DATE LIMITE DE SOUMISSION *">
              <Text style={[styles.dateDisplay, { color: textPrimary, borderColor: border }]}>
                {format(form.submissionDeadline, 'EEEE dd MMMM yyyy', { locale: fr })}
              </Text>
              <DateTimePicker
                value={form.submissionDeadline}
                mode="date"
                onChange={(_, d) => d && u('submissionDeadline', d)}
                minimumDate={new Date()}
                style={{ alignSelf: 'flex-start' }}
              />
            </Field>

            <Field label="PAYS">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CAMES_COUNTRIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.countryChip,
                      { borderColor: border },
                      form.locationCountry === c && { backgroundColor: COLORS.success + '15', borderColor: COLORS.success },
                    ]}
                    onPress={() => u('locationCountry', form.locationCountry === c ? '' : c)}
                  >
                    <Text style={[styles.countryText, { color: form.locationCountry === c ? COLORS.success : textSecondary }]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Field>

            <Field label="VILLE">
              <Input value={form.locationCity} onChangeText={(v: string) => u('locationCity', v)} placeholder="Ex: Abidjan" />
            </Field>

            <Field label="MODALITÃ‰">
              <View style={styles.row3}>
                {[
                  { id: 'presentiel', label: 'PrÃ©sentiel', icon: 'location' },
                  { id: 'en_ligne', label: 'En ligne', icon: 'globe' },
                  { id: 'hybride', label: 'Hybride', icon: 'git-branch' },
                ].map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.modalityCard,
                      { borderColor: border },
                      form.locationModality === m.id && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
                    ]}
                    onPress={() => u('locationModality', m.id)}
                  >
                    <Ionicons name={m.icon as any} size={18} color={form.locationModality === m.id ? COLORS.primary : textSecondary} />
                    <Text style={[{ fontSize: 12, color: form.locationModality === m.id ? COLORS.primary : textSecondary, fontWeight: '600' }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="EMAIL DE CONTACT">
              <Input value={form.contactEmail} onChangeText={(v: string) => u('contactEmail', v)} placeholder="contact@institution.ci" />
            </Field>
            <Field label="SITE WEB / URL EXTERNE">
              <Input value={form.externalUrl} onChangeText={(v: string) => u('externalUrl', v)} placeholder="https://..." />
            </Field>
            <Field label="CONDITIONS DE SOUMISSION">
              <Input value={form.submissionConditions} onChangeText={(v: string) => u('submissionConditions', v)} placeholder="Conditions, format requisâ€¦" multiline />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <Field label="DOMAINES DE RECHERCHE">
              <View style={styles.domainGrid}>
                {RESEARCH_DOMAINS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.domainChip,
                      { borderColor: border },
                      form.domains.includes(d) && { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
                    ]}
                    onPress={() => {
                      const next = form.domains.includes(d)
                        ? form.domains.filter((x) => x !== d)
                        : [...form.domains, d];
                      u('domains', next);
                    }}
                  >
                    <Text style={[{ fontSize: 12, color: form.domains.includes(d) ? COLORS.primary : textSecondary, fontWeight: form.domains.includes(d) ? '700' : '400' }]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <Field label="AXES THÃ‰MATIQUES">
              {form.thematicAxes.map((ax, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <Input
                    value={ax}
                    onChangeText={(v: string) => {
                      const next = [...form.thematicAxes];
                      next[i] = v;
                      u('thematicAxes', next);
                    }}
                    placeholder={`Axe ${i + 1}`}
                  />
                  {form.thematicAxes.length > 1 && (
                    <TouchableOpacity
                      onPress={() => u('thematicAxes', form.thematicAxes.filter((_, j) => j !== i))}
                      style={{ justifyContent: 'center' }}
                    >
                      <Ionicons name="close-circle" size={22} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity onPress={() => u('thematicAxes', [...form.thematicAxes, ''])} style={styles.addAxisBtn}>
                <Ionicons name="add" size={18} color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>Ajouter un axe</Text>
              </TouchableOpacity>
            </Field>
          </>
        )}

        {step === 5 && (
          <View style={[styles.reviewCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.reviewTitle, { color: textPrimary }]}>RÃ©capitulatif</Text>
            {[
              { label: 'Titre', value: form.title },
              { label: 'Type', value: CALL_TYPES.find((t) => t.id === form.type)?.label },
              { label: 'Deadline', value: format(form.submissionDeadline, 'dd MMMM yyyy', { locale: fr }) },
              { label: 'Lieu', value: [form.locationCity, form.locationCountry].filter(Boolean).join(', ') || 'â€”' },
              { label: 'ModalitÃ©', value: form.locationModality },
              { label: 'Domaines', value: form.domains.join(', ') || 'â€”' },
              { label: 'Contact', value: form.contactEmail || 'â€”' },
            ].map((item) => (
              <View key={item.label} style={[styles.reviewRow, { borderBottomColor: border }]}>
                <Text style={[styles.reviewLabel, { color: textSecondary }]}>{item.label}</Text>
                <Text style={[styles.reviewValue, { color: textPrimary }]} numberOfLines={2}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: surface, borderTopColor: border }]}>
        {step < 5 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep((s) => (s + 1) as Step)}>
            <Text style={styles.nextBtnText}>Suivant</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, loading && { opacity: 0.7 }]}
            onPress={() => publish(false)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="megaphone" size={18} color="#fff" />
                <Text style={styles.nextBtnText}>Soumettre l'appel</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerStep: { fontSize: 12 },
  progressTrack: { height: 3 },
  progressFill: { height: 3, borderRadius: 2 },
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    borderRadius: 12, padding: 13, fontSize: 15,
    borderWidth: 1,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: {
    width: '30%', alignItems: 'center', gap: 6, padding: 12,
    borderRadius: 12, borderWidth: 1,
  },
  typeCardText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  dateDisplay: { fontSize: 15, fontWeight: '600', marginBottom: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  countryChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginRight: 8,
  },
  countryText: { fontSize: 13 },
  row3: { flexDirection: 'row', gap: 8 },
  modalityCard: {
    flex: 1, alignItems: 'center', gap: 6, padding: 12, borderRadius: 12, borderWidth: 1,
  },
  domainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  domainChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  addAxisBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, marginTop: 4,
  },
  reviewCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', padding: 16 },
  reviewTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  reviewRow: {
    flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, gap: 16,
  },
  reviewLabel: { fontSize: 13, width: 80, fontWeight: '600' },
  reviewValue: { flex: 1, fontSize: 14 },
  footer: { padding: 16, paddingBottom: 36, borderTopWidth: 1 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});