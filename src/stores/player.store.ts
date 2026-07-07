// Global player state (zustand). Cho phép nhạc phát XUYÊN route — iframe
// YouTube sống ở GlobalPlayer (root layout), store giữ trạng thái + api điều khiển.
import { create } from 'zustand';
import type { YouTubePlayer } from 'react-youtube';
import type { QueueEntry } from '@/lib/library';

export interface PlayerSong {
  youtubeId: string;
  title: string;
  artist?: string;
  thumbnailUrl?: string;
  duration?: number;
}

interface PlayerState {
  song: PlayerSong | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  queue: QueueEntry[];
  api: YouTubePlayer | null;

  setApi: (a: YouTubePlayer | null) => void;
  /** Phát 1 bài (đổi videoId → GlobalPlayer tự load). Bỏ qua nếu trùng bài đang phát. */
  load: (song: PlayerSong, queue?: QueueEntry[]) => void;
  setQueue: (q: QueueEntry[]) => void;
  setPlaying: (p: boolean) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  patchSong: (patch: Partial<PlayerSong>) => void;

  toggle: () => void;
  seek: (t: number) => void;
  playNext: () => void;
  playPrev: () => void;
  close: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  song: null,
  playing: false,
  currentTime: 0,
  duration: 0,
  queue: [],
  api: null,

  setApi: (api) => set({ api }),

  load: (song, queue) => {
    const cur = get().song;
    if (cur?.youtubeId === song.youtubeId) {
      // Cùng bài đang phát → chỉ cập nhật queue (nếu có), giữ nguyên playback.
      if (queue) set({ queue });
      return;
    }
    set({
      song,
      currentTime: 0,
      duration: song.duration ?? 0,
      ...(queue ? { queue } : {}),
    });
  },

  setQueue: (queue) => set({ queue }),
  setPlaying: (playing) => set({ playing }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  patchSong: (patch) => {
    const song = get().song;
    if (song) set({ song: { ...song, ...patch } });
  },

  toggle: () => {
    const { api, playing } = get();
    if (!api) return;
    if (playing) api.pauseVideo();
    else api.playVideo();
  },

  seek: (t) => {
    get().api?.seekTo(t, true);
    set({ currentTime: t });
  },

  playNext: () => {
    const { song, queue } = get();
    const idx = queue.findIndex((q) => q.song?.youtubeId === song?.youtubeId);
    const next = idx >= 0 ? queue[idx + 1]?.song : undefined;
    if (next) get().load({ ...next });
  },

  playPrev: () => {
    const { song, queue } = get();
    const idx = queue.findIndex((q) => q.song?.youtubeId === song?.youtubeId);
    const prev = idx > 0 ? queue[idx - 1]?.song : undefined;
    if (prev) get().load({ ...prev });
  },

  close: () => set({ song: null, playing: false, currentTime: 0, duration: 0 }),
}));
