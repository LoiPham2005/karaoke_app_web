'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, TrendingUp } from 'lucide-react';
import { SongCard } from '@/components/songs/SongCard';
import { SongRow } from '@/components/songs/SongRow';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { categories } from '@/mocks/categories';
import { useTrending, useRecent, useHistory } from '@/lib/queries';
import { cn, formatNumber } from '@/lib/utils';

export default function HomePage() {
  const { data: trending = [], isLoading: trendingLoading, isError } = useTrending();
  const { data: recent = [] } = useRecent();
  const { data: history = [] } = useHistory();
  const trendingError = isError ? 'Không tải được bài thịnh hành' : null;

  // Hero = bài hot nhất (thật). Đề xuất = lịch sử hát (đã đăng nhập, dedup) →
  // fallback trending. Mới ra = recent (thật). Không còn mock.
  const heroSong = trending[0];
  const recommended =
    history.length > 0
      ? Array.from(
          new Map(history.map((h) => [h.song.youtubeId, h.song])).values(),
        ).slice(0, 12)
      : trending.slice(0, 12);

  // Cuộn tới section theo hash (#trending / #new) — shortcut từ Sidebar KHÁM PHÁ.
  // Next App Router không tự cuộn tới hash khi điều hướng → xử lý thủ công.
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const t = setTimeout(scrollToHash, 200);
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      clearTimeout(t);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, []);

  return (
    <div className="container py-6 space-y-10">
      {/* HERO BANNER — bài hot nhất (thật) */}
      {heroSong && (
      <section className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0">
          <Image src={heroSong.thumbnailUrl} alt={heroSong.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="relative p-8 md:p-12 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
            <TrendingUp className="h-3 w-3" />
            Đang hot nhất
          </div>
          <h1 className="text-3xl md:text-5xl font-bold">{heroSong.title}</h1>
          <p className="text-lg text-muted-foreground">{heroSong.artist}</p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(heroSong.viewCount)} lượt xem · Có lời đồng bộ
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link href={`/play/${heroSong.youtubeId}`}>
              <Button size="lg" variant="gradient">
                <Play className="mr-2 h-5 w-5" />
                Hát ngay
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Thêm vào playlist
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* TRENDING */}
      <section id="trending">
        <SectionHeader title="🔥 Đang trending" desc="Top bài hot nhất trong app" href="/category/trending" />
        {trendingLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : trendingError ? (
          <div className="py-12 text-center">
            <p className="text-sm text-destructive">{trendingError}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Kiểm tra backend đã chạy (cổng 3001).
            </p>
          </div>
        ) : trending.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Chưa có bài thịnh hành nào. Hãy hát vài bài để bắt đầu!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {trending.slice(0, 10).map((song) => (
              <SongCard key={song.youtubeId} song={song} />
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section>
        <SectionHeader title="🎵 Thể loại" desc="Hát theo phong cách bạn thích" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={cn(
                'group relative overflow-hidden rounded-2xl p-4 aspect-square flex flex-col justify-between bg-gradient-to-br',
                cat.gradient,
                'hover:scale-105 transition-transform',
              )}
            >
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                <p className="text-xs text-white/70">{cat.songCount} bài</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* RECOMMENDED */}
      <section>
        <SectionHeader title="✨ Đề xuất cho bạn" desc="Dựa trên lịch sử hát của bạn" />
        {recommended.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8">
            Hát vài bài để nhận đề xuất phù hợp với bạn.
          </p>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {recommended.map((song) => (
                <div key={song.youtubeId} className="w-48 shrink-0">
                  <SongCard song={song} />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </section>

      {/* TOP CHARTS */}
      {trending.length > 0 && (
        <section>
          <SectionHeader title="🏆 Bảng xếp hạng" desc="Bài được hát nhiều nhất" />
          <div className="grid md:grid-cols-2 gap-2 bg-card rounded-2xl p-3">
            {trending.slice(0, 10).map((song, idx) => (
              <SongRow key={song.youtubeId} song={song} index={idx + 1} />
            ))}
          </div>
        </section>
      )}

      {/* NEW RELEASES */}
      <section id="new">
        <SectionHeader title="🆕 Mới ra" desc="Karaoke mới upload" />
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8">
            Chưa có bài mới. Tìm và hát bài để cập nhật kho nhạc.
          </p>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {recent.map((song) => (
                <div key={song.youtubeId} className="w-48 shrink-0">
                  <SongCard song={song} />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ title, desc, href }: { title: string; desc?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
      </div>
      {href && (
        <Link href={href}>
          <Button variant="ghost" size="sm">
            Xem tất cả →
          </Button>
        </Link>
      )}
    </div>
  );
}
