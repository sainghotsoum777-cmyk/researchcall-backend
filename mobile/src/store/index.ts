import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, tokenStorage } from '../services/api';

// â”€â”€â”€ Auth store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    await tokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  },
}));

// â”€â”€â”€ App preferences store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ThemeMode = 'system' | 'light' | 'dark';
type AppLanguage = 'fr' | 'en';

interface PrefsState {
  theme: ThemeMode;
  language: AppLanguage;
  onboardingDone: boolean;
  pushEnabled: boolean;
  emailDigest: boolean;
  digestFrequency: 'daily' | 'weekly';
  setTheme: (t: ThemeMode) => void;
  setLanguage: (l: AppLanguage) => void;
  setOnboardingDone: () => void;
  setPushEnabled: (v: boolean) => void;
  setEmailDigest: (v: boolean) => void;
  setDigestFrequency: (f: 'daily' | 'weekly') => void;
  loadPrefs: () => Promise<void>;
}

const PREFS_KEY = 'rc_prefs';

export const usePrefsStore = create<PrefsState>((set) => ({
  theme: 'system',
  language: 'fr',
  onboardingDone: false,
  pushEnabled: true,
  emailDigest: false,
  digestFrequency: 'weekly',

  setTheme: (theme) => {
    set({ theme });
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ theme })).catch(() => {});
  },
  setLanguage: (language) => {
    set({ language });
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ language })).catch(() => {});
  },
  setOnboardingDone: () => {
    set({ onboardingDone: true });
    AsyncStorage.setItem('rc_onboarding', '1').catch(() => {});
  },
  setPushEnabled: (pushEnabled) => set({ pushEnabled }),
  setEmailDigest: (emailDigest) => set({ emailDigest }),
  setDigestFrequency: (digestFrequency) => set({ digestFrequency }),

  loadPrefs: async () => {
    const onboarding = await AsyncStorage.getItem('rc_onboarding');
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    const prefs = raw ? JSON.parse(raw) : {};
    set({ onboardingDone: onboarding === '1', ...prefs });
  },
}));

// â”€â”€â”€ Favorites cache store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface FavStore {
  favoriteIds: Set<string>;
  setFavorites: (ids: string[]) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavStore = create<FavStore>((set, get) => ({
  favoriteIds: new Set(),
  setFavorites: (ids) => set({ favoriteIds: new Set(ids) }),
  addFavorite: (id) =>
    set((s) => ({ favoriteIds: new Set([...s.favoriteIds, id]) })),
  removeFavorite: (id) =>
    set((s) => {
      const next = new Set(s.favoriteIds);
      next.delete(id);
      return { favoriteIds: next };
    }),
  isFavorite: (id) => get().favoriteIds.has(id),
}));

// â”€â”€â”€ Application tracker store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type AppStatus = 'interested' | 'inProgress' | 'submitted' | 'accepted' | 'rejected';

export interface TrackedApplication {
  callId: string;
  callTitle: string;
  callType: string;
  deadline?: string;
  status: AppStatus;
  notes: string;
  updatedAt: string;
}

interface TrackerStore {
  applications: TrackedApplication[];
  loadApplications: () => Promise<void>;
  addOrUpdate: (app: TrackedApplication) => Promise<void>;
  remove: (callId: string) => Promise<void>;
  getByCallId: (callId: string) => TrackedApplication | undefined;
}

const TRACKER_KEY = 'rc_tracker';

export const useTrackerStore = create<TrackerStore>((set, get) => ({
  applications: [],

  loadApplications: async () => {
    const raw = await AsyncStorage.getItem(TRACKER_KEY);
    set({ applications: raw ? JSON.parse(raw) : [] });
  },

  addOrUpdate: async (app) => {
    const current = get().applications.filter((a) => a.callId !== app.callId);
    const next = [app, ...current];
    set({ applications: next });
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(next));
  },

  remove: async (callId) => {
    const next = get().applications.filter((a) => a.callId !== callId);
    set({ applications: next });
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(next));
  },

  getByCallId: (callId) => get().applications.find((a) => a.callId === callId),
}));

// â”€â”€â”€ Notification badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface BadgeStore {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  decrement: () => void;
  reset: () => void;
}

export const useBadgeStore = create<BadgeStore>((set, get) => ({
  unreadCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  decrement: () => set({ unreadCount: Math.max(0, get().unreadCount - 1) }),
  reset: () => set({ unreadCount: 0 }),
}));