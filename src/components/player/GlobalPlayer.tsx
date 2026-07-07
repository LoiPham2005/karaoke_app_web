'use client';

// Iframe YouTube DUY NHẤT của app — sống ở root layout nên KHÔNG bị unmount khi
// đổi route → nhạc phát xuyên suốt. Khi ở /play: phủ full màn (video). Khi rời
// /play: thu nhỏ + opacity-0 (vẫn render & có kích thước → audio tiếp tục chạy),
// còn UI điều khiển do MiniPlayer hiển thị.
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import YouTube, { type YouTubeEvent, type YouTubePlayer } from 'react-youtube';
import { usePlayerStore } from '@/stores/player.store';
import { addHistory } from '@/lib/library';
import { cn } from '@/lib/utils';

export function GlobalPlayer() {
  const song = usePlayerStore((s) => s.song);
  const playing = usePlayerStore((s) => s.playing);
  const setApi = usePlayerStore((s) => s.setApi);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const playNext = usePlayerStore((s) => s.playNext);

  const pathname = usePathname();
  const expanded = pathname?.startsWith('/play') ?? false;

  const apiRef = useRef<YouTubePlayer | null>(null);
  const recordedRef = useRef<string | null>(null);

  // Poll thời gian phát thật → đồng bộ progress cho /play + MiniPlayer.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const t = apiRef.current?.getCurrentTime?.();
      if (typeof t === 'number') setCurrentTime(t);
    }, 500);
    return () => clearInterval(id);
  }, [playing, setCurrentTime]);

  if (!song) return null;

  const onReady = (e: YouTubeEvent) => {
    apiRef.current = e.target;
    setApi(e.target);
    try {
      const d = e.target.getDuration();
      if (d) setDuration(d);
    } catch {
      /* chưa sẵn sàng */
    }
  };

  const onStateChange = (e: YouTubeEvent) => {
    // 1 = playing, 2 = paused, 0 = ended
    if (e.data === 1) {
      setPlaying(true);
      try {
        const d = e.target.getDuration();
        if (d) setDuration(d);
      } catch {
        /* ignore */
      }
      if (recordedRef.current !== song.youtubeId) {
        recordedRef.current = song.youtubeId;
        addHistory({
          youtubeId: song.youtubeId,
          title: song.title,
          artist: song.artist,
          thumbnailUrl: song.thumbnailUrl,
          duration: song.duration,
        }).catch(() => {
          /* chưa đăng nhập / lỗi → bỏ qua */
        });
      }
    } else if (e.data === 2) {
      setPlaying(false);
    } else if (e.data === 0) {
      setPlaying(false);
      playNext(); // hết bài → tự phát bài kế trong hàng chờ
    }
  };

  return (
    <div
      className={cn(
        'fixed bg-black',
        expanded
          ? 'inset-0 z-30'
          : 'bottom-0 left-0 h-[120px] w-[200px] -z-10 opacity-0 pointer-events-none overflow-hidden',
      )}
    >
      <YouTube
        videoId={song.youtubeId}
        onReady={onReady}
        onStateChange={onStateChange}
        className="absolute inset-0 h-full w-full"
        iframeClassName="h-full w-full"
        opts={{
          width: '100%',
          height: '100%',
          playerVars: { autoplay: 1, modestbranding: 1, rel: 0, playsinline: 1 },
        }}
      />
    </div>
  );
}
