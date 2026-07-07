// Admin API (chỉ ADMIN / SUPER_ADMIN). Backend RolesGuard chặn 403 nếu không đủ quyền.
import { apiGet, apiPatch, apiPost } from './api';
import type { Song } from '@/types';

export interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  totalSongs: number;
  totalPlaylists: number;
  pendingReports: number;
  totalPlays: number;
  revenueVnd: number;
}

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  shopId: string | null;
  isPremium: boolean;
  premiumUntil: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminReport {
  id: string;
  reason: string;
  detail: string | null;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  song: Song;
  user: { id: string; email: string | null; displayName: string };
}

export interface AdminPayment {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
  user: { id: string; email: string | null; displayName: string } | null;
  subscription: { userPlan: string | null } | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const getAdminStats = () => apiGet<AdminStats>('/admin/stats');

export function getAdminUsers(params: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<AdminUser>> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.role) q.set('role', params.role);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  return apiGet<Paginated<AdminUser>>(`/admin/users?${q.toString()}`);
}

export const updateAdminUser = (
  id: string,
  body: { role?: string; status?: string },
) => apiPatch<AdminUser>(`/admin/users/${id}`, body);

export function getAdminReports(params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<AdminReport>> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  return apiGet<Paginated<AdminReport>>(`/admin/reports?${q.toString()}`);
}

export const updateAdminReport = (id: string, status: string) =>
  apiPatch<AdminReport>(`/admin/reports/${id}`, { status });

export function getAdminPayments(params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Paginated<AdminPayment>> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  return apiGet<Paginated<AdminPayment>>(`/admin/payments?${q.toString()}`);
}

export const setUserPremium = (id: string, days: number) =>
  apiPost<AdminUser>(`/admin/users/${id}/premium`, { days });
