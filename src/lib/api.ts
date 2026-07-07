// Client gọi backend NestJS. Backend bọc response { statusCode, message, data }
// (TransformInterceptor) → tự unwrap `.data`. Tự gắn Bearer token + refresh khi 401.
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth-storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

function rawFetch(
  method: Method,
  path: string,
  body?: unknown,
  token?: string | null,
  signal?: AbortSignal,
): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
}

// Dedupe nhiều request 401 cùng lúc → chỉ refresh 1 lần.
let refreshing: Promise<boolean> | null = null;
function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return Promise.resolve(false);
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await rawFetch('POST', '/auth/refresh', { refreshToken: rt });
        if (!res.ok) {
          clearTokens();
          return false;
        }
        const json = await res.json();
        const data = json?.data ?? json;
        if (data?.accessToken && data?.refreshToken) {
          setTokens(data.accessToken, data.refreshToken);
          return true;
        }
        clearTokens();
        return false;
      } catch {
        clearTokens();
        return false;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  let res = await rawFetch(method, path, body, getAccessToken(), signal);

  if (res.status === 401 && getRefreshToken()) {
    const ok = await tryRefresh();
    if (ok) res = await rawFetch(method, path, body, getAccessToken(), signal);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.message ?? `Lỗi API (${res.status})`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : String(msg));
  }
  return (json?.data ?? json) as T;
}

export const apiGet = <T>(path: string, signal?: AbortSignal) =>
  request<T>('GET', path, undefined, signal);
export const apiPost = <T>(path: string, body?: unknown) => request<T>('POST', path, body);
export const apiPatch = <T>(path: string, body?: unknown) => request<T>('PATCH', path, body);
export const apiDelete = <T>(path: string) => request<T>('DELETE', path);
