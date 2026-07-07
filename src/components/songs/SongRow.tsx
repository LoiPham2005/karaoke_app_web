'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Heart, MoreVertical, Plus, ListPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Song } from '@/types';
import { cn, formatDuration, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { addFavorite, addToQueue, removeFavorite, toSongRef } from '@/lib/library';
import { useAuthStore } from '@/stores/auth.store';

interface SongRowProps {
  song: Song;
  index?: number;
  /// Nếu có → menu "..." hiện "Xóa khỏi playlist" (chỉ dùng ở trang playlist).
  onRemoveFromPlaylist?: () => void;
}

export function SongRow({ song, index, onRemoveFromPlaylist }: SongRowProps) {
  const user = useAuthStore((s) => s.user);
  const [isFav, setIsFav] = useState(Boolean(song.isFavorite));
  const [menuOpen, setMenuOpen] = useState(false);

  const requireLogin = () => {
    toast('Đăng nhập để dùng tính năng này');
    return false;
  };

  const handleAddQueue = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
    if (!user) return void requireLogin();
    addToQueue(toSongRef(song))
      .then(() => toast('Đã thêm vào hàng chờ'))
      .catch(() => toast.error('Không thể thêm vào hàng chờ'));
  };

  const handleRemove = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setMenuOpen(false);
    onRemoveFromPlaylist?.();
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast('Đăng nhập để lưu yêu thích');
      return;
    }
    if (isFav) {
      setIsFav(false);
      removeFavorite(song.youtubeId)
        .then(() => toast('Đã xóa khỏi yêu thích'))
        .catch(() => {
          setIsFav(true);
          toast.error('Không thể cập nhật yêu thích');
        });
    } else {
      setIsFav(true);
      addFavorite(toSongRef(song))
        .then(() => toast('Đã thêm vào yêu thích'))
        .catch(() => {
          setIsFav(false);
          toast.error('Không thể cập nhật yêu thích');
        });
    }
  };

  return (
    <div className="group flex items-center gap-4 px-4 py-2 rounded-xl hover:bg-accent transition-all">
      {index !== undefined && (
        <span className="w-6 text-center text-sm text-muted-foreground tabular-nums">
          {index}
        </span>
      )}
      <Link href={`/play/${song.youtubeId}`} className="relative w-12 h-12 shrink-0">
        <Image
          src={song.thumbnailUrl}
          alt={song.title}
          fill
          className="object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Play className="h-4 w-4 text-white" />
        </div>
      </Link>
      <Link href={`/play/${song.youtubeId}`} className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{song.title}</h4>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </Link>
      <span className="hidden md:block text-xs text-muted-foreground">
        {formatNumber(song.viewCount)}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">
        {formatDuration(song.duration)}
      </span>
      <div
        className={cn(
          'flex items-center gap-1 transition-opacity',
          menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <Button size="icon-sm" variant="ghost" onClick={handleAddQueue} title="Thêm vào hàng chờ">
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={toggleFavorite} title="Yêu thích">
          <Heart className={cn('h-4 w-4', isFav && 'fill-current text-primary')} />
        </Button>
        <div className="relative">
          <Button
            size="icon-sm"
            variant="ghost"
            title="Thêm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {menuOpen && (
            <>
              {/* backdrop click-outside để đóng menu */}
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card shadow-xl py-1">
                <button
                  onClick={handleAddQueue}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                >
                  <ListPlus className="h-4 w-4" />
                  Thêm vào hàng chờ
                </button>
                {onRemoveFromPlaylist && (
                  <button
                    onClick={handleRemove}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa khỏi playlist
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
