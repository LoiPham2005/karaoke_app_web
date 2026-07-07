'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Heart, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Song } from '@/types';
import { cn, formatDuration, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addFavorite, removeFavorite, toSongRef } from '@/lib/library';
import { useAuthStore } from '@/stores/auth.store';

interface SongCardProps {
  song: Song;
  variant?: 'default' | 'compact';
  showRank?: number;
}

export function SongCard({ song, variant = 'default', showRank }: SongCardProps) {
  const user = useAuthStore((s) => s.user);
  const [isFav, setIsFav] = useState(Boolean(song.isFavorite));

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

  if (variant === 'compact') {
    return (
      <Link
        href={`/play/${song.youtubeId}`}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-all group"
      >
        {showRank !== undefined && (
          <span className="w-6 text-center text-2xl font-bold text-muted-foreground tabular-nums">
            {showRank}
          </span>
        )}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
          <Image src={song.thumbnailUrl} alt={song.title} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{song.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDuration(song.duration)}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/song/${song.youtubeId}`}
      className="group block rounded-2xl bg-card p-3 hover:bg-accent transition-all"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
        <Image
          src={song.thumbnailUrl}
          alt={song.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon-sm" variant="gradient" className="h-12 w-12 rounded-full">
            <Play className="h-5 w-5 ml-0.5" />
          </Button>
        </div>
        {song.hasLyrics && (
          <Badge variant="success" className="absolute top-2 left-2">
            Có lời
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-sm line-clamp-1">{song.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{song.artist}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {formatNumber(song.viewCount)} lượt xem
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon-sm" variant="ghost" onClick={toggleFavorite}>
              <Heart className={cn('h-3.5 w-3.5', isFav && 'fill-current text-primary')} />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
