import type { Song } from '@/types';
import { apiGet } from './api';

/// Tìm bài hát từ YouTube qua backend. GET /songs/search?q=&maxResults=
export function searchSongs(q: string, maxResults = 20, signal?: AbortSignal): Promise<Song[]> {
  const params = new URLSearchParams({ q, maxResults: String(maxResults) });
  return apiGet<Song[]>(`/songs/search?${params.toString()}`, signal);
}

/// Top bài đang hot (theo playCountApp). GET /songs/trending — public.
export const getTrending = (signal?: AbortSignal): Promise<Song[]> =>
  apiGet<Song[]>('/songs/trending', signal);

/// Bài mới thêm vào hệ thống (theo createdAt). GET /songs/recent — public.
export const getRecent = (signal?: AbortSignal): Promise<Song[]> =>
  apiGet<Song[]>('/songs/recent', signal);

/// Chi tiết 1 bài. GET /songs/:youtubeId — public.
export const getSong = (youtubeId: string, signal?: AbortSignal): Promise<Song> =>
  apiGet<Song>(`/songs/${youtubeId}`, signal);

/// Bài hát tương tự (search theo nghệ sĩ). GET /songs/:youtubeId/similar — public.
export const getSimilar = (youtubeId: string, signal?: AbortSignal): Promise<Song[]> =>
  apiGet<Song[]>(`/songs/${youtubeId}/similar`, signal);

export interface LyricsResult {
  lrcContent: string | null;
  source: string | null;
  language: string | null;
}

/// Lyrics từ LRCLIB (qua backend, có cache). GET /lyrics?youtubeId=&title=&artist=&duration=
export function getLyrics(
  p: { youtubeId?: string; title: string; artist?: string; duration?: number },
  signal?: AbortSignal,
): Promise<LyricsResult> {
  const q = new URLSearchParams();
  if (p.youtubeId) q.set('youtubeId', p.youtubeId);
  q.set('title', p.title);
  if (p.artist) q.set('artist', p.artist);
  if (p.duration != null) q.set('duration', String(p.duration));
  return apiGet<LyricsResult>(`/lyrics?${q.toString()}`, signal);
}
