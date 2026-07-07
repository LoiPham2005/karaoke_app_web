import type { Song } from '@/types';
import { apiDelete, apiGet, apiPatch, apiPost } from './api';

// Khi thêm 1 bài (favorite/history/playlist/queue), gửi metadata để backend
// cache-on-write (upsert Song). Lấy từ Song hiện có trên UI.
export interface SongRef {
  youtubeId: string;
  title: string;
  artist?: string;
  thumbnailUrl?: string;
  duration?: number;
}

export const toSongRef = (s: Song): SongRef => ({
  youtubeId: s.youtubeId,
  title: s.title,
  artist: s.artist,
  thumbnailUrl: s.thumbnailUrl,
  duration: s.duration,
});

// ─────────────────── Favorites ───────────────────
export interface FavoriteItem {
  id: string;
  song: Song;
  createdAt: string;
}
export const getFavorites = () => apiGet<FavoriteItem[]>('/favorites');
export const addFavorite = (s: SongRef) => apiPost('/favorites', s);
export const removeFavorite = (youtubeId: string) => apiDelete(`/favorites/${youtubeId}`);

// ─────────────────── History ───────────────────
export interface HistoryItem {
  id: string;
  song: Song;
  playedAt: string;
  secondsPlayed: number | null;
}
export const getHistory = () => apiGet<HistoryItem[]>('/history');
export const addHistory = (s: SongRef, secondsPlayed?: number) =>
  apiPost('/history', { ...s, secondsPlayed });
export const clearHistory = () => apiDelete('/history');

// ─────────────────── Playlists ───────────────────
export interface PlaylistItem {
  id: string;
  song: Song;
  position: number;
}
export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  coverUrl: string | null;
  items?: PlaylistItem[];
}
export const getPlaylists = () => apiGet<Playlist[]>('/playlists');
export const createPlaylist = (name: string, description?: string, isPublic?: boolean) =>
  apiPost<Playlist>('/playlists', { name, description, isPublic });
export const getPlaylist = (id: string) => apiGet<Playlist>(`/playlists/${id}`);
export const updatePlaylist = (
  id: string,
  body: { name?: string; description?: string; isPublic?: boolean; coverUrl?: string },
) => apiPatch<Playlist>(`/playlists/${id}`, body);
export const addToPlaylist = (id: string, s: SongRef) => apiPost(`/playlists/${id}/songs`, s);
export const removeFromPlaylist = (id: string, youtubeId: string) =>
  apiDelete(`/playlists/${id}/songs/${youtubeId}`);
export const deletePlaylist = (id: string) => apiDelete(`/playlists/${id}`);
/// Sắp xếp lại thứ tự bài trong playlist. orderedYoutubeIds = đủ & đúng các bài hiện có.
export const reorderPlaylist = (id: string, orderedYoutubeIds: string[]) =>
  apiPatch(`/playlists/${id}/reorder`, { orderedYoutubeIds });

// ─────────────────── Queue ───────────────────
// Backend ghép Song qua query riêng (theo songId) nên về lý thuyết có thể null
// nếu bản ghi Song bị thiếu — UI phải xử lý phòng hờ.
export interface QueueEntry {
  id: string;
  song: Song | null;
  position: number;
}
export const getQueue = () => apiGet<QueueEntry[]>('/queue');
export const addToQueue = (s: SongRef) => apiPost('/queue', s);
export const removeFromQueue = (id: string) => apiDelete(`/queue/${id}`);
export const clearQueue = () => apiDelete('/queue');

// ─────────────────── Report (báo lỗi bài hát) ───────────────────
export const reportSong = (s: SongRef, reason: string, detail?: string) =>
  apiPost('/reports', { ...s, reason, detail });
