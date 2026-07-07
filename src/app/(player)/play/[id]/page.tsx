'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  ListMusic,
  X,
  Mic2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { SongActions } from '@/components/player/SongActions';
import {
  useSong,
  useQueue,
  useClearQueue,
  useAddFavorite,
  useRemoveFavorite,
} from '@/lib/queries';
import { usePlayerStore } from '@/stores/player.store';
import { useAuthStore } from '@/stores/auth.store';
import { cn, formatDuration } from '@/lib/utils';

// Trang "Đang phát" — KHÔNG tự render iframe. Video do GlobalPlayer (root layout)
// phủ full màn phía sau; trang này chỉ là lớp điều khiển (header + controls +
// hàng chờ) bind vào player.store → rời trang nhạc vẫn phát (MiniPlayer hiện).
export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = String(params.id ?? '');
  const user = useAuthStore((s) => s.user);

  const { data: fetchedSong } = useSong(videoId);
  const { data: queueData } = useQueue();

  const song = usePlayerStore((s) => s.song);
  const playing = usePlayerStore((s) => s.playing);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const queue = usePlayerStore((s) => s.queue);
  const load = usePlayerStore((s) => s.load);
  const setQueue = usePlayerStore((s) => s.setQueue);
  const toggle = usePlayerStore((s) => s.toggle);
  const seek = usePlayerStore((s) => s.seek);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrev = usePlayerStore((s) => s.playPrev);

  const [showQueue, setShowQueue] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const clearQueueMut = useClearQueue();

  // Nạp bài vào store khi mở trang (load() tự bỏ qua nếu trùng bài đang phát →
  // quay lại /play của bài đang nghe sẽ KHÔNG load lại, nhạc tiếp tục).
  useEffect(() => {
    if (!fetchedSong) return;
    load(
      {
        youtubeId: fetchedSong.youtubeId,
        title: fetchedSong.title,
        artist: fetchedSong.artist,
        thumbnailUrl: fetchedSong.thumbnailUrl,
        duration: fetchedSong.duration,
      },
      queueData ?? undefined,
    );
    setIsFav(Boolean(fetchedSong.isFavorite));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedSong?.youtubeId]);

  // Cập nhật hàng chờ khi nó đổi (sau "Phát tất cả" / thêm bài).
  useEffect(() => {
    if (queueData) setQueue(queueData);
  }, [queueData, setQueue]);

  // Hiển thị theo store nếu đã có (đang phát), fallback dữ liệu fetch.
  const display = song ?? fetchedSong ?? null;
  const title = display?.title ?? 'Đang tải...';
  const artist = display?.artist ?? '';

  const curIdx = queue.findIndex((q) => q.song?.youtubeId === display?.youtubeId);
  const hasNext = curIdx >= 0 && curIdx + 1 < queue.length;
  const hasPrev = curIdx > 0;

  const toggleFavorite = () => {
    if (!user) {
      toast('Đăng nhập để lưu yêu thích');
      return;
    }
    if (!display) return;
    const ref = {
      youtubeId: display.youtubeId,
      title: display.title,
      artist: display.artist,
      thumbnailUrl: display.thumbnailUrl,
      duration: display.duration,
    };
    if (isFav) {
      setIsFav(false);
      removeFav.mutate(ref.youtubeId, {
        onSuccess: () => toast('Đã xóa khỏi yêu thích'),
        onError: () => {
          setIsFav(true);
          toast.error('Không thể cập nhật yêu thích');
        },
      });
    } else {
      setIsFav(true);
      addFav.mutate(ref, {
        onSuccess: () => toast('Đã thêm vào yêu thích'),
        onError: () => {
          setIsFav(false);
          toast.error('Không thể cập nhật yêu thích');
        },
      });
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden text-white">
      {/* Header overlay (video do GlobalPlayer hiển thị phía sau, z-30) */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-6 h-14 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <Button size="icon-sm" variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate">{title}</h2>
            <p className="text-xs text-white/70 truncate">{artist}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="hidden md:inline-flex">
            <Mic2 className="h-3 w-3 mr-1" />
            Karaoke mode
          </Badge>
          <Button size="icon-sm" variant="ghost" onClick={() => setShowQueue((v) => !v)}>
            <ListMusic className="h-4 w-4" />
          </Button>
          {display && (
            <SongActions
              song={{
                youtubeId: display.youtubeId,
                title: display.title,
                artist: display.artist,
                thumbnailUrl: display.thumbnailUrl,
                duration: display.duration,
              }}
              isFav={isFav}
              onToggleFav={toggleFavorite}
            />
          )}
        </div>
      </header>

      {/* Queue panel (overlay phải) */}
      {showQueue && (
        <aside className="fixed top-14 bottom-24 right-0 z-40 w-80 max-w-[80vw] hidden lg:flex flex-col glass border-l border-white/10">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <ListMusic className="h-4 w-4" />
              Hàng chờ
            </h3>
            <Badge>{queue.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {queue.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-white/60">
                {user ? 'Hàng chờ trống' : 'Đăng nhập để dùng hàng chờ'}
              </p>
            ) : (
              queue.map((q, idx) => {
                const s = q.song;
                if (!s) return null;
                const active = s.youtubeId === display?.youtubeId;
                return (
                  <button
                    key={q.id}
                    onClick={() => load({ ...s })}
                    className={cn(
                      'flex w-full items-center gap-3 p-2 rounded-xl text-left hover:bg-white/10 transition-all',
                      active && 'bg-white/10',
                    )}
                  >
                    <span className="text-xs text-white/60 w-5 text-center">{idx + 1}</span>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <Image src={s.thumbnailUrl} alt={s.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <p className="text-xs text-white/60 truncate">{s.artist}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <div className="p-4 border-t border-white/10">
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              disabled={queue.length === 0}
              onClick={() =>
                clearQueueMut.mutate(undefined, {
                  onSuccess: () => toast('Đã xóa hàng chờ'),
                })
              }
            >
              Xóa hàng chờ
            </Button>
          </div>
        </aside>
      )}

      {/* Controls overlay (bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent">
        <div className="px-4 md:px-6 py-3 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/70 tabular-nums w-12 text-right">
              {formatDuration(Math.floor(currentTime))}
            </span>
            <Slider
              value={[currentTime]}
              onValueChange={(v) => seek(v[0])}
              max={duration || 1}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-white/70 tabular-nums w-12">
              {formatDuration(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <Button size="icon-sm" variant="ghost" onClick={toggleFavorite}>
              <Heart className={cn('h-4 w-4', isFav && 'fill-current text-primary')} />
            </Button>

            <div className="flex items-center gap-3">
              <Button size="icon-sm" variant="ghost" onClick={playPrev} disabled={!hasPrev}>
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="gradient"
                className="h-12 w-12 rounded-full"
                onClick={toggle}
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <Button size="icon-sm" variant="ghost" onClick={playNext} disabled={!hasNext}>
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <Button size="icon-sm" variant="ghost" onClick={() => router.back()}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
