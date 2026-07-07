'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus, Heart, Share2, Flag, Eye, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SongCard } from '@/components/songs/SongCard';
import { mockSongs } from '@/mocks/songs';
import { toSongRef } from '@/lib/library';
import {
  useSong,
  useSimilar,
  useAddFavorite,
  useRemoveFavorite,
  useAddToQueue,
} from '@/lib/queries';
import { useAuthStore } from '@/stores/auth.store';
import { cn, formatDuration, formatNumber } from '@/lib/utils';

export default function SongDetailPage() {
  const params = useParams();
  const id = String(params.id ?? '');
  const user = useAuthStore((s) => s.user);

  // Song qua TanStack Query; fallback mock để UI không nhảy lúc đang tải.
  const mockFallback = mockSongs.find((s) => s.youtubeId === id) ?? mockSongs[0];
  const { data: fetchedSong } = useSong(id);
  const song = fetchedSong ?? mockFallback;

  // Bài tương tự thật (search theo nghệ sĩ).
  const { data: similar = [], isLoading: similarLoading } = useSimilar(id);
  const similarLoaded = !similarLoading;

  const [isFav, setIsFav] = useState(false);

  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const addQueue = useAddToQueue();

  const handleAddQueue = () => {
    if (!user) {
      toast('Đăng nhập để dùng hàng chờ');
      return;
    }
    addQueue.mutate(toSongRef(song), {
      onSuccess: () => toast('Đã thêm vào hàng chờ'),
      onError: () => toast.error('Không thể thêm vào hàng chờ'),
    });
  };

  // Đồng bộ cờ yêu thích khi backend trả về (nếu có isFavorite).
  useEffect(() => {
    if (fetchedSong) setIsFav(Boolean(fetchedSong.isFavorite));
  }, [fetchedSong]);

  const toggleFavorite = () => {
    if (!user) {
      toast('Đăng nhập để lưu yêu thích');
      return;
    }
    if (isFav) {
      setIsFav(false);
      removeFav.mutate(song.youtubeId, {
        onSuccess: () => toast('Đã xóa khỏi yêu thích'),
        onError: () => {
          setIsFav(true);
          toast.error('Không thể cập nhật yêu thích');
        },
      });
    } else {
      setIsFav(true);
      addFav.mutate(toSongRef(song), {
        onSuccess: () => toast('Đã thêm vào yêu thích'),
        onError: () => {
          setIsFav(false);
          toast.error('Không thể cập nhật yêu thích');
        },
      });
    }
  };

  return (
    <div className="relative">
      {/* Hero with backdrop */}
      <div className="relative h-[400px] -mt-16">
        <div className="absolute inset-0">
          <Image src={song.thumbnailUrl} alt={song.title} fill className="object-cover blur-2xl opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      </div>

      <div className="container -mt-64 relative space-y-8">
        {/* Song info */}
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl shadow-primary/30 shrink-0">
            <Image src={song.thumbnailUrl} alt={song.title} fill className="object-cover" />
          </div>
          <div className="flex-1 space-y-3 pb-4">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Bài hát</p>
            <h1 className="text-4xl md:text-6xl font-bold">{song.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
              <Link href={`/artist/${song.artist}`} className="font-semibold text-foreground hover:underline">
                {song.artist}
              </Link>
              <span>·</span>
              <Badge variant="outline">{song.category}</Badge>
              <span>·</span>
              <span className="flex items-center gap-1 text-sm">
                <Eye className="h-3.5 w-3.5" />
                {formatNumber(song.viewCount)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-sm">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(song.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/play/${song.youtubeId}`}>
            <Button size="lg" variant="gradient">
              <Play className="mr-2 h-5 w-5" />
              Hát ngay
            </Button>
          </Link>
          <Button size="lg" variant="outline" onClick={handleAddQueue} disabled={addQueue.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm vào queue
          </Button>
          <Button size="icon" variant="ghost" onClick={toggleFavorite}>
            <Heart className={cn('h-5 w-5', isFav && 'fill-current text-primary')} />
          </Button>
          <Button size="icon" variant="ghost">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Flag className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs — tab "Lời bài hát" tạm ẩn (lyrics chưa chuẩn) */}
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="similar">Bài tương tự</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="bg-card rounded-2xl p-8 space-y-3">
              <InfoRow label="Tiêu đề" value={song.title} />
              <InfoRow label="Ca sĩ" value={song.artist} />
              <InfoRow label="Thể loại" value={song.category} />
              <InfoRow label="Thời lượng" value={formatDuration(song.duration)} />
              <InfoRow label="Lượt xem" value={`${formatNumber(song.viewCount)} lượt`} />
              <InfoRow label="Có lyrics" value={song.hasLyrics ? '✅ Đã có' : '❌ Chưa có'} />
              <InfoRow label="YouTube ID" value={song.youtubeId} />
            </div>
          </TabsContent>

          <TabsContent value="similar">
            {similar.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {similar.map((s) => (
                  <SongCard key={s.youtubeId} song={s} />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {similarLoaded ? 'Chưa có bài tương tự' : 'Đang tải bài tương tự...'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
