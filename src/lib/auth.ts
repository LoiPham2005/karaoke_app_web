import { apiGet, apiPatch, apiPost } from './api';
import { clearTokens, getRefreshToken, setTokens } from './auth-storage';

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  shopId: string | null;
  isPremium: boolean;
  premiumUntil: string | null;
  createdAt: string;
}

interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const r = await apiPost<AuthResult>('/auth/login', { email, password });
  setTokens(r.accessToken, r.refreshToken);
  return r.user;
}

export async function register(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthUser> {
  const r = await apiPost<AuthResult>('/auth/register', { email, password, displayName });
  setTokens(r.accessToken, r.refreshToken);
  return r.user;
}

export const fetchMe = (): Promise<AuthUser> => apiGet<AuthUser>('/users/me');

export const updateProfile = (
  data: Partial<Pick<AuthUser, 'displayName' | 'avatarUrl' | 'bio'>>,
): Promise<AuthUser> => apiPatch<AuthUser>('/users/me', data);

export async function logout(): Promise<void> {
  const rt = getRefreshToken();
  try {
    if (rt) await apiPost('/auth/logout', { refreshToken: rt });
  } catch {
    // ignore — vẫn xoá token local
  }
  clearTokens();
}
