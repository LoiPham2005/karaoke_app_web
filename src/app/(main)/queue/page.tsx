'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Play, Trash2, ListMusic } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { useQueue, useRemoveFromQueue, useClearQueue } from '@/lib/queries';
import { formatDuration } from '@/lib/utils';

export default function QueuePage() {
  const user = useAuthStore((s) => s.user);

  const { data: queue = [], isLoading: loading } = useQueue();
  const removeMut = useRemoveFromQueue();
  const clearMut = useClearQueue();

  const handleRemove = (id: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    removeMut.mutate(id, {
      onSuccess: () => toast.success('Đã xoá khỏi hàng chờ'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Xoá thất bại'),
    });
  };

  const handleClear = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    if (!window.confirm('Xoá toàn bộ hàng chờ?')) return;
    clearMut.mutate(undefined, {
      onSuccess: () => toast.success('Đã xoá hàng chờ'),
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : 'Xoá hàng chờ thất bại'),
    });
  };

  // Chưa đăng nhập → mời đăng nhập, không gọi API.
  if (!user) {
    return (
      <div className="container py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Hàng chờ phát</h1>
          <p className="text-muted-foreground mt-1">Quản lý bài hát đang chờ phát tiếp theo</p>
        </div>
        <div className="bg-card rounded-2xl p-10 text-center">
          <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Đăng nhập để dùng hàng chờ</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Thêm bài và quản lý hàng chờ phát của riêng bạn.
          </p>
          <Link href="/login">
            <Button variant="gradient">Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hàng chờ phát</h1>
          <p className="text-muted-foreground mt-1">Quản lý bài hát đang chờ phát tiếp theo</p>
        </div>
        <Button variant="outline" onClick={handleClear} disabled={queue.length === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa toàn bộ
        </Button>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tiếp theo ({queue.length})
          </h2>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[72px] rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <div className="bg-card rounded-2xl p-10 text-center">
            <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Hàng chờ trống. Thêm bài từ trang phát hoặc tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {queue.map((entry, idx) => {
              const song = entry.song;
              return (
                <div
                  key={entry.id}
                  className="group flex items-center gap-3 bg-card rounded-xl p-3 hover:bg-accent transition-all"
                >
                  <span className="text-sm text-muted-foreground w-6 text-center tabular-nums">
                    {idx + 1}
                  </span>
                  {song ? (
                    <Link
                      href={`/play/${song.youtubeId}`}
                      className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0"
                    >
                      <Image
                        src={song.thumbnailUrl}
                        alt={song.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </Link>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-accent shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {song?.title ?? 'Bài hát không khả dụng'}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">{song?.artist}</p>
                  </div>
                  {song && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatDuration(song.duration)}
                    </span>
                  )}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleRemove(entry.id)}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
