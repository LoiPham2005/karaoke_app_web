// Lưu access/refresh token ở localStorage (web). Mobile dùng SecureStorage riêng.
const ACCESS_KEY = 'kara_access';
const REFRESH_KEY = 'kara_refresh';

const isBrowser = typeof window !== 'undefined';

export const getAccessToken = (): string | null =>
  isBrowser ? localStorage.getItem(ACCESS_KEY) : null;

export const getRefreshToken = (): string | null =>
  isBrowser ? localStorage.getItem(REFRESH_KEY) : null;

export function setTokens(access: string, refresh: string): void {
  if (!isBrowser) return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  if (!isBrowser) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
