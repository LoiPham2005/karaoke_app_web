import Link from 'next/link';
import { Play, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SongCard } from '@/components/songs/SongCard';
import { SongRow } from '@/components/songs/SongRow';
import { categories } from '@/mocks/categories';
import { mockSongs } from '@/mocks/songs';
import { cn } from '@/lib/utils';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categories.find((c) => c.slug === params.slug) ?? categories[0];
  const songs = mockSongs.filter((s) => s.category === category.slug);
  const allSongs = songs.length > 0 ? songs : mockSongs;

  return (
    <div className="space-y-8">
      {/* Hero gradient */}
      <div
        className={cn(
          'relative h-[300px] -mt-16 bg-gradient-to-br p-8 md:p-12 flex flex-col justify-end',
          category.gradient,
        )}
      >
        <span className="text-8xl mb-4">{category.icon}</span>
        <h1 className="text-5xl md:text-7xl font-bold text-white">{category.name}</h1>
        <p className="text-white/80 mt-2">{category.songCount} bài hát · Top picks cho bạn</p>
      </div>

      <div className="container space-y-8">
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" variant="gradient">
            <Play className="mr-2 h-5 w-5" />
            Phát tất cả
          </Button>
          <Button size="lg" variant="outline">
            <Shuffle className="mr-2 h-4 w-4" />
            Shuffle
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline">2026</Badge>
            <Badge variant="outline">2025</Badge>
            <Badge variant="outline">2020-2024</Badge>
            <Badge variant="outline">Trước 2020</Badge>
          </div>
        </div>

        {/* Top 10 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">🏆 Top 10 trong {category.name}</h2>
          <div className="grid md:grid-cols-2 gap-2 bg-card rounded-2xl p-3">
            {allSongs.slice(0, 10).map((song, idx) => (
              <SongRow key={song.youtubeId} song={song} index={idx + 1} />
            ))}
          </div>
        </section>

        {/* All songs */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Tất cả bài hát</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allSongs.map((song) => (
              <SongCard key={song.youtubeId} song={song} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
