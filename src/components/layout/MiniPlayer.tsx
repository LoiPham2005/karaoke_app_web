'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Play, Pause, SkipForward, SkipBack, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayerStore } from '@/stores/player.store';
import { formatDuration } from '@/lib/utils';

export function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const song = usePlayerStore((s) => s.song);
  const playing = usePlayerStore((s) => s.playing);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const queue = usePlayerStore((s) => s.queue);
  const toggle = usePlayerStore((s) => s.toggle);
  const seek = usePlayerStore((s) => s.seek);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrev = usePlayerStore((s) => s.playPrev);
  const close = usePlayerStore((s) => s.close);

  // Ẩn khi không có bài, hoặc đang ở màn /play (đã có full player).
  if (!song || pathname?.startsWith('/play')) return null;

  const idx = queue.findIndex((q) => q.song?.youtubeId === song.youtubeId);
  const hasNext = idx >= 0 && idx + 1 < queue.length;
  const hasPrev = idx > 0;

  const open = () => router.push(`/play/${song.youtubeId}`);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:left-64 glass border-t border-border">
      <div className="flex items-center gap-4 px-4 lg:px-6 h-20">
        <button onClick={open} className="flex items-center gap-3 min-w-0 lg:w-72 text-left">
          {song.thumbnailUrl ? (
            <Image
              src={song.thumbnailUrl}
              alt={song.title}
              width={56}
              height={56}
              className="rounded-lg w-14 h-14 object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-accent" />
          )}
          <div className="min-w-0 hidden sm:block">
            <h4 className="text-sm font-semibold truncate">{song.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
          </div>
        </button>

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              className="hidden md:flex"
              onClick={playPrev}
              disabled={!hasPrev}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="gradient"
              className="h-10 w-10 rounded-full"
              onClick={toggle}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="hidden md:flex"
              onClick={playNext}
              disabled={!hasNext}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden md:flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDuration(Math.floor(currentTime))}
            </span>
            <Slider
              value={[currentTime]}
              onValueChange={(v) => seek(v[0])}
              max={duration || 1}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="ghost" onClick={open}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={close}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
