// Hooks TanStack Query cho toàn bộ data layer (songs + library).
// Quy ước: query READ-only ở đây; mutation kèm invalidate cache liên quan.
'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getRecent, getSimilar, getSong, getTrending, searchSongs } from './songs';
import {
  addFavorite,
  addToPlaylist,
  addToQueue,
  clearHistory,
  clearQueue,
  createPlaylist,
  deletePlaylist,
  getFavorites,
  getHistory,
  getPlaylist,
  getPlaylists,
  getQueue,
  removeFavorite,
  removeFromPlaylist,
  removeFromQueue,
  reportSong,
  type SongRef,
} from './library';
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory,
  removeSearchHistory,
} from './search-history';
import {
  getAdminPayments,
  getAdminReports,
  getAdminStats,
  getAdminUsers,
  setUserPremium,
  updateAdminReport,
  updateAdminUser,
} from './admin';
import { useAuthStore } from '@/stores/auth.store';

// ─────────────────── Query keys ───────────────────
export const qk = {
  trending: ['trending'] as const,
  recent: ['recent'] as const,
  search: (q: string) => ['search', q] as const,
  song: (id: string) => ['song', id] as const,
  similar: (id: string) => ['similar', id] as const,
  favorites: ['favorites'] as const,
  history: ['history'] as const,
  playlists: ['playlists'] as const,
  playlist: (id: string) => ['playlist', id] as const,
  queue: ['queue'] as const,
  searchHistory: ['searchHistory'] as const,
  adminStats: ['admin', 'stats'] as const,
  adminUsers: (search: string, role: string) => ['admin', 'users', search, role] as const,
  adminReports: (status: string) => ['admin', 'reports', status] as const,
  adminPayments: (status: string) => ['admin', 'payments', status] as const,
};

// ─────────────────── Queries: songs (public) ───────────────────
export const useTrending = () =>
  useQuery({
    queryKey: qk.trending,
    queryFn: ({ signal }) => getTrending(signal),
  });

export const useRecent = () =>
  useQuery({
    queryKey: qk.recent,
    queryFn: ({ signal }) => getRecent(signal),
  });

export const useSearch = (q: string) =>
  useQuery({
    queryKey: qk.search(q.trim()),
    queryFn: ({ signal }) => searchSongs(q.trim(), 20, signal),
    enabled: q.trim().length > 0,
    placeholderData: keepPreviousData, // giữ kết quả cũ khi gõ tiếp → đỡ nháy
  });

export const useSong = (id: string) =>
  useQuery({
    queryKey: qk.song(id),
    queryFn: ({ signal }) => getSong(id, signal),
    enabled: !!id,
  });

export const useSimilar = (id: string) =>
  useQuery({
    queryKey: qk.similar(id),
    queryFn: ({ signal }) => getSimilar(id, signal),
    enabled: !!id,
  });

// ─────────────────── Queries: library (cần đăng nhập) ───────────────────
export const useFavorites = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: qk.favorites,
    queryFn: () => getFavorites(),
    enabled: !!user,
  });
};

export const useHistory = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: qk.history,
    queryFn: () => getHistory(),
    enabled: !!user,
  });
};

export const usePlaylists = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: qk.playlists,
    queryFn: () => getPlaylists(),
    enabled: !!user,
  });
};

export const usePlaylist = (id: string) => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: qk.playlist(id),
    queryFn: () => getPlaylist(id),
    enabled: !!user && !!id,
  });
};

export const useQueue = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: qk.queue,
    queryFn: () => getQueue(),
    enabled: !!user,
  });
};

// ─────────────────── Mutations ───────────────────
export const useAddFavorite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: SongRef) => addFavorite(s),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.favorites }),
  });
};

export const useRemoveFavorite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (youtubeId: string) => removeFavorite(youtubeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.favorites }),
  });
};

export const useAddToQueue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: SongRef) => addToQueue(s),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.queue }),
  });
};

export const useRemoveFromQueue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeFromQueue(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.queue }),
  });
};

export const useClearQueue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearQueue(),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.queue }),
  });
};

export const useCreatePlaylist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { name: string; description?: string; isPublic?: boolean }) =>
      createPlaylist(p.name, p.description, p.isPublic),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.playlists }),
  });
};

export const useDeletePlaylist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlaylist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.playlists }),
  });
};

export const useAddToPlaylist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; song: SongRef }) => addToPlaylist(p.id, p.song),
    onSuccess: (_data, p) => {
      void qc.invalidateQueries({ queryKey: qk.playlists });
      void qc.invalidateQueries({ queryKey: qk.playlist(p.id) });
    },
  });
};

export const useRemoveFromPlaylist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; youtubeId: string }) =>
      removeFromPlaylist(p.id, p.youtubeId),
    onSuccess: (_data, p) => {
      void qc.invalidateQueries({ queryKey: qk.playlists });
      void qc.invalidateQueries({ queryKey: qk.playlist(p.id) });
    },
  });
};

export const useClearHistory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearHistory(),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.history }),
  });
};

export const useReportSong = () =>
  useMutation({
    mutationFn: (p: { song: SongRef; reason: string; detail?: string }) =>
      reportSong(p.song, p.reason, p.detail),
  });

// ─────────────────── Search history (cần đăng nhập) ───────────────────
export const useSearchHistory = () => {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: qk.searchHistory,
    queryFn: () => getSearchHistory(),
    enabled: !!user,
  });
};

export const useAddSearchHistory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (query: string) => addSearchHistory(query),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.searchHistory }),
  });
};

export const useRemoveSearchHistory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeSearchHistory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.searchHistory }),
  });
};

export const useClearSearchHistory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearSearchHistory(),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.searchHistory }),
  });
};

// ─────────────────── Admin ───────────────────
export const useAdminStats = () =>
  useQuery({ queryKey: qk.adminStats, queryFn: () => getAdminStats() });

export const useAdminUsers = (search: string, role: string) =>
  useQuery({
    queryKey: qk.adminUsers(search, role),
    queryFn: () =>
      getAdminUsers({ search: search || undefined, role: role || undefined, limit: 50 }),
    placeholderData: keepPreviousData,
  });

export const useUpdateAdminUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; role?: string; status?: string }) =>
      updateAdminUser(p.id, { role: p.role, status: p.status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useAdminReports = (status: string) =>
  useQuery({
    queryKey: qk.adminReports(status),
    queryFn: () => getAdminReports({ status: status || undefined, limit: 50 }),
    placeholderData: keepPreviousData,
  });

export const useUpdateAdminReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; status: string }) =>
      updateAdminReport(p.id, p.status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
      void qc.invalidateQueries({ queryKey: qk.adminStats });
    },
  });
};

export const useAdminPayments = (status: string) =>
  useQuery({
    queryKey: qk.adminPayments(status),
    queryFn: () => getAdminPayments({ status: status || undefined, limit: 50 }),
    placeholderData: keepPreviousData,
  });

export const useSetUserPremium = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; days: number }) => setUserPremium(p.id, p.days),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      void qc.invalidateQueries({ queryKey: qk.adminStats });
    },
  });
};
