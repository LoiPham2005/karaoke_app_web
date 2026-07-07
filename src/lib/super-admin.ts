// Super Admin API (chỉ SUPER_ADMIN). Backend RolesGuard chặn 403 nếu không đủ quyền.
// Prefix /admin (path con riêng, không đụng các route admin cũ). Bearer + unwrap .data.
'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiDelete, apiGet, apiPatch, apiPost } from './api';
import { getAccessToken } from './auth-storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// api.ts chưa expose PUT → tự viết hàm nhỏ theo mẫu request() (Bearer + unwrap .data).
async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.message ?? `Lỗi API (${res.status})`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : String(msg));
  }
  return (json?.data ?? json) as T;
}

// ─────────────────── Types ───────────────────
export type ShopStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminShop {
  id: string;
  name: string;
  slug: string;
  status: ShopStatus;
  address: string | null;
  phone: string | null;
  createdAt: string;
  owner: { id: string; email: string | null; displayName: string } | null;
  _count: { rooms: number; users: number };
}

export interface SystemSetting {
  key: string;
  value: unknown; // JSON
  updatedAt: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string | null;
  updatedAt: string;
}

// ─────────────────── Fetchers ───────────────────
export function getAdminShops(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<AdminShop>> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.status) q.set('status', params.status);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  return apiGet<Paginated<AdminShop>>(`/admin/shops?${q.toString()}`);
}

export const getAdminShop = (id: string) => apiGet<AdminShop>(`/admin/shops/${id}`);

export const createShop = (body: { name: string; slug: string; ownerEmail?: string }) =>
  apiPost<AdminShop>('/admin/shops', body);

export const updateShop = (
  id: string,
  body: { name?: string; status?: ShopStatus; address?: string; phone?: string },
) => apiPatch<AdminShop>(`/admin/shops/${id}`, body);

export const deleteShop = (id: string) => apiDelete<void>(`/admin/shops/${id}`);

export const setUserRole = (id: string, role: string) =>
  apiPatch<unknown>(`/admin/users/${id}/role`, { role });

export const getSystemSettings = () => apiGet<SystemSetting[]>('/admin/settings');

export const upsertSetting = (key: string, value: unknown) =>
  apiPut<SystemSetting>(`/admin/settings/${key}`, { value });

export const getFeatureFlags = () => apiGet<FeatureFlag[]>('/admin/feature-flags');

export const updateFeatureFlag = (
  key: string,
  body: { enabled: boolean; description?: string },
) => apiPatch<FeatureFlag>(`/admin/feature-flags/${key}`, body);

// ─────────────────── Query keys (local) ───────────────────
export const saqk = {
  shops: (search: string, status: string) =>
    ['super-admin', 'shops', search, status] as const,
  shop: (id: string) => ['super-admin', 'shop', id] as const,
  settings: ['super-admin', 'settings'] as const,
  featureFlags: ['super-admin', 'feature-flags'] as const,
};

// ─────────────────── Hooks: Shops ───────────────────
export const useAdminShops = (params: { search: string; status: string }) =>
  useQuery({
    queryKey: saqk.shops(params.search, params.status),
    queryFn: () =>
      getAdminShops({
        search: params.search || undefined,
        status: params.status || undefined,
        limit: 50,
      }),
    placeholderData: keepPreviousData,
  });

export const useCreateShop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; slug: string; ownerEmail?: string }) =>
      createShop(body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['super-admin', 'shops'] }),
  });
};

export const useUpdateShop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      id: string;
      name?: string;
      status?: ShopStatus;
      address?: string;
      phone?: string;
    }) => updateShop(p.id, p),
    onSuccess: (_d, p) => {
      void qc.invalidateQueries({ queryKey: ['super-admin', 'shops'] });
      void qc.invalidateQueries({ queryKey: saqk.shop(p.id) });
    },
  });
};

export const useDeleteShop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShop(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['super-admin', 'shops'] }),
  });
};

export const useSetUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; role: string }) => setUserRole(p.id, p.role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      void qc.invalidateQueries({ queryKey: ['super-admin', 'shops'] });
    },
  });
};

// ─────────────────── Hooks: System settings ───────────────────
export const useSystemSettings = () =>
  useQuery({ queryKey: saqk.settings, queryFn: () => getSystemSettings() });

export const useUpsertSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { key: string; value: unknown }) => upsertSetting(p.key, p.value),
    onSuccess: () => qc.invalidateQueries({ queryKey: saqk.settings }),
  });
};

// ─────────────────── Hooks: Feature flags ───────────────────
export const useFeatureFlags = () =>
  useQuery({ queryKey: saqk.featureFlags, queryFn: () => getFeatureFlags() });

export const useUpdateFeatureFlag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { key: string; enabled: boolean; description?: string }) =>
      updateFeatureFlag(p.key, { enabled: p.enabled, description: p.description }),
    onSuccess: () => qc.invalidateQueries({ queryKey: saqk.featureFlags }),
  });
};
