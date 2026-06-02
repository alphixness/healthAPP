import { ENV } from '../config/env';
import { useAuthStore } from '../store/authStore';

const BASE_URL = ENV.API_URL + '/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { total: number; page: number; limit: number };
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
    if (data.success && data.data) {
      const store = useAuthStore.getState();
      store.setAuth(store.user!, { accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });
      return data.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = useAuthStore.getState().tokens?.accessToken;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
      });
      return retryRes.json();
    }
    useAuthStore.getState().clearAuth();
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; nickname?: string }) =>
      request<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    sendSms: (data: { phone: string }) =>
      request<{ expiresIn: number }>('/auth/sms/send', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    loginWithPhone: (data: { phone: string; code: string }) =>
      request<{ user: any; accessToken: string; refreshToken: string }>('/auth/sms/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMe: () => request<{ user: any }>('/auth/me'),
    logout: (refreshToken: string) =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
  },

  profile: {
    get: () => request<{ profile: any; goals: any }>('/profile'),
    update: (data: any) =>
      request<{ profile: any; goals: any }>('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  meals: {
    getByDate: (date: string) =>
      request<{ records: any[]; summary: any }>(`/meals?date=${date}`),
    create: (data: any) =>
      request<{ record: any }>('/meals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/meals/${id}`, { method: 'DELETE' }),
  },

  exercise: {
    getByDate: (date: string) =>
      request<any>(`/exercise?date=${date}`),
    create: (data: any) =>
      request<{ log: any }>('/exercise', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/exercise/${id}`, { method: 'DELETE' }),
  },

  recipes: {
    getAll: (params?: { category?: string; page?: number; limit?: number }) => {
      const search = new URLSearchParams();
      if (params?.category) search.set('category', params.category);
      if (params?.page) search.set('page', String(params.page));
      if (params?.limit) search.set('limit', String(params.limit));
      return request<{ recipes: any[] }>(`/recipes?${search}`);
    },
    getById: (id: string) => request<{ recipe: any }>(`/recipes/${id}`),
  },

  sync: {
    upload: (data: { meals: any[]; exercises: any[]; profile?: any }) =>
      request<{ message: string }>('/sync/upload', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    download: () => request<{ profile: any; meals: any[]; exercises: any[] }>('/sync/download'),
  },

  admin: {
    getStats: () => request<any>('/admin/stats'),
    getUsers: (page = 1, limit = 20, search = '') =>
      request<any[]>(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
    updateUserRole: (userId: string, role: string) =>
      request<any>(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
    deleteUser: (userId: string) =>
      request<any>(`/admin/users/${userId}`, { method: 'DELETE' }),
    getRecipes: (limit = 50) =>
      request<any[]>(`/admin/recipes?limit=${limit}`),
  },

  bloggers: {
    apply: (data: { blogger_type: 'fitness' | 'food'; display_name: string; bio?: string; avatar_url?: string; cover_url?: string }) =>
      request<{ id: string }>('/bloggers/apply', { method: 'POST', body: JSON.stringify(data) }),
    list: (type?: string) =>
      request<{ bloggers: any[] }>(`/bloggers${type ? `?type=${type}` : ''}`),
    getProfile: (userId: string) =>
      request<{ profile: any }>(`/bloggers/${userId}`),
    getApplications: () =>
      request<{ applications: any[] }>('/bloggers/admin/applications'),
    approve: (id: string) =>
      request<any>(`/bloggers/admin/approve/${id}`, { method: 'POST' }),
    reject: (id: string) =>
      request<any>(`/bloggers/admin/reject/${id}`, { method: 'POST' }),
  },

  membership: {
    getPrice: () =>
      request<{ amount: number; currency: string; durationDays: number }>('/membership/price'),
    purchase: () =>
      request<{ membership: any }>('/membership/purchase', { method: 'POST' }),
    getStatus: () =>
      request<{ isMember: boolean; membership: any }>('/membership/status'),
    cancel: () =>
      request<{ membership: any }>('/membership/cancel', { method: 'POST' }),
  },

  courses: {
    list: (params?: { category?: string; difficulty?: string; is_free?: number; page?: number; limit?: number }) => {
      const search = new URLSearchParams();
      if (params?.category) search.set('category', params.category);
      if (params?.difficulty) search.set('difficulty', params.difficulty);
      if (params?.is_free !== undefined) search.set('is_free', String(params.is_free));
      if (params?.page) search.set('page', String(params.page));
      if (params?.limit) search.set('limit', String(params.limit));
      return request<any[]>(`/courses?${search}`);
    },
    getById: (id: string) =>
      request<{ course: any; contents: any[] }>(`/courses/${id}`),
    create: (data: any) =>
      request<{ course: any }>('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<{ course: any }>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ message: string }>(`/courses/${id}`, { method: 'DELETE' }),
    getMyCourses: () =>
      request<{ courses: any[] }>('/courses/my'),
    addContent: (courseId: string, data: any) =>
      request<{ content: any }>(`/courses/${courseId}/contents`, { method: 'POST', body: JSON.stringify(data) }),
    getContents: (courseId: string) =>
      request<{ contents: any[] }>(`/courses/${courseId}/contents`),
    subscribe: (courseId: string, amount?: number) =>
      request<{ message: string }>(`/courses/${courseId}/subscribe`, { method: 'POST', body: JSON.stringify({ amount }) }),
    checkSubscription: (courseId: string) =>
      request<{ subscribed: boolean }>(`/courses/${courseId}/subscription`),
  },

  recommendations: {
    getDaily: (date?: string) =>
      request<{ meals: any[] | null; exercises: any[] | null }>(`/recommendations/daily${date ? `?date=${date}` : ''}`),
    generate: () =>
      request<{ meals: any[]; exercises: any[] }>('/recommendations/generate', { method: 'POST' }),
  },

  updates: {
    check: () => request<{ hasUpdate: boolean; versionCode?: number; versionName?: string; apkUrl?: string; fileSize?: number; releaseNotes?: string; forceUpdate?: boolean }>('/updates/check'),
  },

  llm: {
    getProviders: (region?: string) =>
      request<any[]>(`/llm/providers${region ? `?region=${region}` : ''}`),
    chat: (data: { providerKey: string; messages: { role: string; content: string }[] }) =>
      request<any>('/llm/chat/completions', { method: 'POST', body: JSON.stringify(data) }),
    vision: (data: { providerKey: string; imageBase64: string }) =>
      request<any>('/llm/vision/recognize', { method: 'POST', body: JSON.stringify(data) }),
  },

  usage: {
    getLimits: (region?: string) =>
      request<{ tier: string; limits: any[] }>(`/usage/limits${region ? `?region=${region}` : ''}`),
    getToday: () => request<Record<string, number>>('/usage/today'),
    increment: (featureKey: string, region?: string) =>
      request<{ count: number }>('/usage/increment', {
        method: 'POST',
        body: JSON.stringify({ featureKey, region }),
      }),
  },

  payments: {
    getPrice: (region?: string) =>
      request<{ amount: number; currency: string; durationDays: number }>(`/payments/price${region ? `?region=${region}` : ''}`),
    create: (provider: string, region?: string) =>
      request<{ orderId: string; orderNo: string; amount: number; currency: string; provider: string; status: string }>('/payments/create', { method: 'POST', body: JSON.stringify({ provider, region }) }),
    getOrders: (page = 1) =>
      request<any[]>(`/payments/orders?page=${page}`),
    cancelOrder: (orderId: string) =>
      request<{ message: string }>(`/payments/orders/${orderId}/cancel`, { method: 'POST' }),
  },

  /** 通用请求（用于管理后台等场景） */
  request: <T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    return request<T>(path, options);
  },
};
