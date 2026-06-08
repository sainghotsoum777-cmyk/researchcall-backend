import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { API_BASE_URL } from '../constants';

// â”€â”€â”€ Token management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TOKEN_KEY = 'rc_access_token';
const REFRESH_KEY = 'rc_refresh_token';

export const tokenStorage = {
  getAccess: () => SecureStore.getItemAsync(TOKEN_KEY),
  getRefresh: () => SecureStore.getItemAsync(REFRESH_KEY),
  setTokens: async (access: string, refresh: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  },
  clear: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

// â”€â”€â”€ Offline cache â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`cache:${key}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return data as T;
  } catch {
    return null;
  }
}

async function setCache(key: string, data: unknown) {
  await AsyncStorage.setItem(`cache:${key}`, JSON.stringify({ data, ts: Date.now() }));
}

// â”€â”€â”€ Core fetch wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  auth?: boolean;
  cacheKey?: string;
  multipart?: boolean;
};

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await tokenStorage.getRefresh();
  if (!refresh) return null;
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) {
    await tokenStorage.clear();
    return null;
  }
  const { accessToken, refreshToken } = await res.json();
  await tokenStorage.setTokens(accessToken, refreshToken);
  return accessToken;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = true, cacheKey, multipart = false } = options;

  // Serve from cache when offline
  const net = await NetInfo.fetch();
  if (!net.isConnected && cacheKey) {
    const cached = await getCached<T>(cacheKey);
    if (cached) return cached;
    throw new Error('OFFLINE');
  }

  const buildHeaders = async (): Promise<HeadersInit> => {
    const headers: Record<string, string> = {};
    if (!multipart) headers['Content-Type'] = 'application/json';
    if (auth) {
      const token = await tokenStorage.getAccess();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const doFetch = async (token?: string): Promise<Response> => {
    const headers = await buildHeaders();
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: multipart ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  // Auto-refresh on 401
  if (res.status === 401 && auth) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      refreshQueue.forEach((cb) => newToken && cb(newToken));
      refreshQueue = [];
      if (newToken) {
        res = await doFetch(newToken);
      } else {
        throw new Error('UNAUTHORIZED');
      }
    } else {
      const newToken = await new Promise<string>((resolve) =>
        refreshQueue.push(resolve),
      );
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'API_ERROR');
  }

  const data: T = await res.json();

  if (method === 'GET' && cacheKey) {
    setCache(cacheKey, data).catch(() => {});
  }

  return data;
}

// â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type UserRole = 'seeker' | 'publisher' | 'both' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institution?: string;
  laboratory?: string;
  domains: string[];
  interests: string[];
  avatarUrl?: string;
  pushToken?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthTokens>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    institution?: string;
    laboratory?: string;
    domains?: string[];
  }) =>
    apiRequest<AuthTokens>('/auth/register', {
      method: 'POST',
      body: data,
      auth: false,
    }),

  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      auth: false,
    }),
};

// â”€â”€â”€ Calls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CallType = 'communication' | 'publication' | 'colloque' | 'projet' | 'bourse' | 'autre';
export type CallStatus = 'draft' | 'pending' | 'published' | 'expired' | 'rejected';
export type Modality = 'presentiel' | 'en_ligne' | 'hybride';

export interface Call {
  id: string;
  title: string;
  description: string;
  type: CallType;
  status: CallStatus;
  domains: string[];
  thematicAxes: string[];
  language: string;
  submissionDeadline: string;
  notificationDate?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  locationCity?: string;
  locationCountry?: string;
  locationModality?: Modality;
  submissionConditions?: string;
  contactEmail?: string;
  externalUrl?: string;
  createdAt: string;
  updatedAt: string;
  publisher: {
    id: string;
    firstName: string;
    lastName: string;
    institution?: string;
    avatarUrl?: string;
  };
  attachments?: Attachment[];
  isFavorite?: boolean;
  _relevanceScore?: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchParams {
  q?: string;
  type?: CallType;
  domain?: string;
  country?: string;
  language?: string;
  modality?: Modality;
  deadlineFrom?: string;
  deadlineTo?: string;
  sortBy?: 'relevance' | 'deadline_asc' | 'deadline_desc' | 'created_asc' | 'created_desc';
  page?: number;
  limit?: number;
}

const searchParamsToQuery = (params: SearchParams): string => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  return q.toString();
};

export const callsApi = {
  search: (params: SearchParams) => {
    const qs = searchParamsToQuery(params);
    return apiRequest<PaginatedResponse<Call>>(`/calls?${qs}`, {
      cacheKey: `calls:search:${qs}`,
    });
  },

  feed: (page = 1, limit = 20) =>
    apiRequest<PaginatedResponse<Call>>(`/calls/feed?page=${page}&limit=${limit}`, {
      cacheKey: `calls:feed:${page}`,
    }),

  suggestions: (q: string) =>
    apiRequest<string[]>(`/calls/suggestions?q=${encodeURIComponent(q)}`),

  stats: () =>
    apiRequest<{
      total: number;
      byType: Record<CallType, number>;
      byCountry: Record<string, number>;
      upcoming: number;
      newToday: number;
    }>('/calls/stats', { cacheKey: 'calls:stats' }),

  getById: (id: string) =>
    apiRequest<Call>(`/calls/${id}`, { cacheKey: `call:${id}` }),

  create: (data: Partial<Call>) =>
    apiRequest<Call>('/calls', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Call>) =>
    apiRequest<Call>(`/calls/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiRequest<void>(`/calls/${id}`, { method: 'DELETE' }),
};

// â”€â”€â”€ Favorites â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const favoritesApi = {
  list: () =>
    apiRequest<{ data: Call[] }>('/favorites', { cacheKey: 'favorites' }),

  add: (callId: string) =>
    apiRequest<void>(`/favorites/${callId}`, { method: 'POST' }),

  remove: (callId: string) =>
    apiRequest<void>(`/favorites/${callId}`, { method: 'DELETE' }),
};

// â”€â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'new_call' | 'deadline_reminder' | 'moderation_result';
  isRead: boolean;
  createdAt: string;
  callId?: string;
}

export const notificationsApi = {
  list: () =>
    apiRequest<{ data: AppNotification[] }>('/notifications', {
      cacheKey: 'notifications',
    }),

  markRead: (id: string) =>
    apiRequest<void>(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllRead: () =>
    apiRequest<void>('/notifications/read-all', { method: 'PUT' }),
};

// â”€â”€â”€ Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const usersApi = {
  me: () => apiRequest<AuthUser>('/users/me', { cacheKey: 'user:me' }),

  updateProfile: (data: Partial<AuthUser>) =>
    apiRequest<AuthUser>('/users/me', { method: 'PUT', body: data }),

  updateDomains: (domains: string[], interests: string[]) =>
    apiRequest<AuthUser>('/users/me/domains', {
      method: 'PUT',
      body: { domains, interests },
    }),

  updatePushToken: (pushToken: string) =>
    apiRequest<void>('/users/me/push-token', {
      method: 'POST',
      body: { pushToken },
    }),

  uploadAvatar: (formData: FormData) =>
    apiRequest<{ avatarUrl: string }>('/users/me/avatar', {
      method: 'POST',
      body: formData,
      multipart: true,
    }),

  deleteAccount: () =>
    apiRequest<void>('/users/me', { method: 'DELETE' }),
};

// â”€â”€â”€ Attachments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const attachmentsApi = {
  list: (callId: string) =>
    apiRequest<{ data: Attachment[] }>(`/calls/${callId}/attachments`),

  upload: (callId: string, formData: FormData) =>
    apiRequest<{ data: Attachment[] }>(`/calls/${callId}/attachments`, {
      method: 'POST',
      body: formData,
      multipart: true,
    }),

  delete: (attachmentId: string) =>
    apiRequest<void>(`/attachments/${attachmentId}`, { method: 'DELETE' }),
};