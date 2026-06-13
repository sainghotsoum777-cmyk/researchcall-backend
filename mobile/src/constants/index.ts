export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.researchcall.ci/api';

export const CALL_TYPES = [
  { id: 'communication', label: 'Communications', icon: 'mic', color: '#3B82F6' },
  { id: 'publication', label: 'Publications', icon: 'document-text', color: '#8B5CF6' },
  { id: 'colloque', label: 'Colloques', icon: 'people', color: '#EC4899' },
  { id: 'projet', label: 'Projets', icon: 'flask', color: '#F59E0B' },
  { id: 'bourse', label: 'Bourses', icon: 'school', color: '#10B981' },
  { id: 'autre', label: 'Autres', icon: 'ellipsis-horizontal', color: '#6B7280' },
] as const;

export const MODALITIES = [
  { id: 'presentiel', label: 'Présentiel', icon: 'location' },
  { id: 'en_ligne', label: 'En ligne', icon: 'globe' },
  { id: 'hybride', label: 'Hybride', icon: 'git-branch' },
] as const;

export const CAMES_COUNTRIES = [
  'Bénin', 'Burkina Faso', "Côte d'Ivoire", 'Gabon', 'Guinée', 'Madagascar',
  'Mali', 'Mauritanie', 'Niger', 'République du Congo', 'RD Congo', 'Rwanda',
  'Sénégal', 'Tchad', 'Togo', 'Cameroun', 'Comores', 'Djibouti', 'HaÃ¯ti',
];

export const RESEARCH_DOMAINS = [
  'Sciences exactes et naturelles', "Sciences de l'ingénieur", 'Sciences médicales',
  'Sciences agronomiques', 'Sciences sociales', 'Sciences humaines', 'Lettres et arts',
  'Droit et sciences politiques', 'Sciences économiques et gestion',
  "Sciences de l'information et de la communication", 'Mathématiques',
  'Physique', 'Chimie', 'Biologie', 'Informatique', 'Environnement',
  'Géographie', 'Histoire', 'Philosophie', 'Linguistique',
  'Éducation et formation', 'Santé publique', 'Nutrition', 'Biotechnologie',
];

export const DEADLINE_URGENCY_DAYS = {
  CRITICAL: 3,
  WARNING: 7,
  SOON: 14,
} as const;

export const PAGINATION_LIMIT = 20;

export const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: {
    light: '#F8FAFC',
    dark: '#0F172A',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#1E293B',
  },
  text: {
    primary: { light: '#0F172A', dark: '#F1F5F9' },
    secondary: { light: '#64748B', dark: '#94A3B8' },
    muted: { light: '#94A3B8', dark: '#475569' },
  },
  border: {
    light: '#E2E8F0',
    dark: '#334155',
  },
} as const;