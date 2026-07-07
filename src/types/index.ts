export interface Song {
  youtubeId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: number;
  viewCount: number;
  hasLyrics: boolean;
  category: string;
  isFavorite?: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isPremium: boolean;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  songCount: number;
  totalDuration: number;
  ownerId: string;
  ownerName: string;
  songs?: Song[];
  createdAt: string;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  gradient: string;
  songCount: number;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface QueueItem {
  id: string;
  song: Song;
  addedBy: string;
  addedAt: string;
}

export interface HistoryItem {
  id: string;
  song: Song;
  playedAt: string;
  duration: number;
}

export interface SongReport {
  id: string;
  song: Song;
  user: { name: string; email: string };
  reason: string;
  detail?: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

export interface LyricsContribution {
  id: string;
  song: Song;
  user: { name: string };
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}
