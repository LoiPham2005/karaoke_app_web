import { create } from 'zustand';
import {
  AuthUser,
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '@/lib/auth';
import { getAccessToken } from '@/lib/auth-storage';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean; // true cho tới khi bootstrap xong
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, displayName: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (u: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  // Gọi 1 lần khi app mở: nếu có token → lấy /users/me.
  bootstrap: async () => {
    if (!getAccessToken()) {
      set({ user: null, isLoading: false });
      return;
    }
    try {
      const u = await fetchMe();
      set({ user: u, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    const u = await apiLogin(email, password);
    set({ user: u });
    return u;
  },

  register: async (email, password, displayName) => {
    const u = await apiRegister(email, password, displayName);
    set({ user: u });
    return u;
  },

  logout: async () => {
    await apiLogout();
    set({ user: null });
  },

  setUser: (u) => set({ user: u }),
}));
